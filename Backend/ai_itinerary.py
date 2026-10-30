import os
import json
from dotenv import load_dotenv

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_MODEL = os.getenv("GROQ_MODEL", "openai/gpt-oss-120b")


def _generate_with_groq(destination, start_date, end_date, budget, interests, travel_style):
    from groq import Groq

    client = Groq(api_key=GROQ_API_KEY)

    prompt = f"""
Create a realistic, structured travel itinerary for:
Destination: {destination}
Start date: {start_date}
End date: {end_date}
Budget: {budget}
Interests: {", ".join(interests)}
Travel style: {travel_style}

Plan 2 to 3 well-curated activities per day.

Return ONLY a valid JSON object matching this exact schema:
{{
  "destination": "{destination}",
  "days": [
    {{
      "day": 1,
      "title": "Day Title Here",
      "activities": [
        {{
          "name": "Activity Name",
          "description": "Short description of the activity",
          "estimated_cost": 50,
          "duration_hours": 2.5
        }}
      ]
    }}
  ],
  "estimated_total_cost": {budget}
}}
"""

    completion = client.chat.completions.create(
        model=GROQ_MODEL,
        messages=[{"role": "user", "content": prompt}],
        temperature=0.2,
        max_tokens=4096,
        response_format={"type": "json_object"}
    )

    content = completion.choices[0].message.content
    return json.loads(content)


def _generate_with_ollama(destination, start_date, end_date, budget, interests, travel_style):
    import ollama

    prompt = f"""
Create a travel itinerary for:
Destination: {destination}
Start date: {start_date}
End date: {end_date}
Budget: {budget}
Interests: {", ".join(interests)}
Travel style: {travel_style}

Return ONLY valid JSON:
{{
  "destination": "{destination}",
  "days": [
    {{
      "day": 1,
      "title": "Arrival and exploration",
      "activities": [
        {{
          "name": "Activity Name",
          "description": "Description",
          "estimated_cost": 50,
          "duration_hours": 2
        }}
      ]
    }}
  ],
  "estimated_total_cost": {budget}
}}
"""
    response = ollama.chat(
        model="llama3.2",
        messages=[{"role": "user", "content": prompt}],
        format="json"
    )
    return json.loads(response["message"]["content"])


def generate_itinerary(destination, start_date, end_date, budget, interests, travel_style):
    print("Generating AI itinerary...")

    # Primary: Use Groq Cloud API if key is configured
    if GROQ_API_KEY:
        try:
            print(f"Calling Groq Cloud API with model: {GROQ_MODEL}...")
            result = _generate_with_groq(
                destination, start_date, end_date, budget, interests, travel_style
            )
            print("Successfully generated itinerary via Groq Cloud API!")
            return _normalize_itinerary(result, destination)
        except Exception as e:
            print("Groq API error:", e)
            print("Attempting fallback to local Ollama...")

    # Fallback: Local Ollama
    try:
        result = _generate_with_ollama(
            destination, start_date, end_date, budget, interests, travel_style
        )
        return _normalize_itinerary(result, destination)
    except Exception as e:
        print("Ollama fallback failed:", e)
        raise RuntimeError(f"Itinerary generation failed: {e}")


def _normalize_itinerary(data, destination):
    """Guarantees required keys and numeric types for database insertion."""
    if not isinstance(data, dict):
        raise ValueError("AI response is not a valid JSON dictionary")

    days = data.get("days", [])
    normalized_days = []

    for idx, day in enumerate(days, start=1):
        day_num = day.get("day", idx)
        title = day.get("title", f"Day {day_num}")
        raw_activities = day.get("activities", [])

        normalized_acts = []
        for act in raw_activities:
            cost = act.get("estimated_cost") or act.get("price") or act.get("cost") or 0
            duration = act.get("duration_hours") or act.get("duration") or 2
            try:
                cost = float(cost)
            except (ValueError, TypeError):
                cost = 0.0
            try:
                duration = float(duration)
            except (ValueError, TypeError):
                duration = 2.0

            normalized_acts.append({
                "name": str(act.get("name", "Local Exploration")),
                "description": str(act.get("description", "")),
                "estimated_cost": cost,
                "duration_hours": duration
            })

        normalized_days.append({
            "day": int(day_num),
            "title": str(title),
            "activities": normalized_acts
        })

    return {
        "destination": data.get("destination", destination),
        "days": normalized_days,
        "estimated_total_cost": data.get("estimated_total_cost", 0)
    }
