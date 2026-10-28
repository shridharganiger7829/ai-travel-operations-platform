import ollama
import json


def generate_itinerary(
    destination,
    start_date,
    end_date,
    budget,
    interests,
    travel_style
):

    prompt = f"""
Create a travel itinerary for:

Destination: {destination}
Start date: {start_date}
End date: {end_date}
Budget: {budget}
Interests: {", ".join(interests)}
Travel style: {travel_style}

Return ONLY JSON.
No markdown.
No explanation.

JSON structure:

{{
  "destination": "{destination}",
  "days": [
    {{
      "day": 1,
      "title": "Arrival and exploration",
      "activities": [
        {{
          "name": "Activity",
          "description": "Description",
          "estimated_cost": 1000,
          "duration_hours": 2
        }}
      ]
    }}
  ],
  "estimated_total_cost": 0
}}
"""

    print("Sending request to Ollama...")

    response = ollama.chat(
        model="llama3.2",
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ],
        format="json"
    )

    content = response["message"]["content"]

    print("\n========== OLLAMA RESPONSE ==========")
    print(content)
    print("=====================================\n")

    try:
        result = json.loads(content)
        print("JSON parsed successfully!")
        return result

    except json.JSONDecodeError as e:
        print("JSON ERROR:", e)
        raise ValueError(
            "Ollama did not return valid JSON."
        )