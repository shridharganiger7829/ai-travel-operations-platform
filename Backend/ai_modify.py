import os
import json
from dotenv import load_dotenv

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_MODEL = os.getenv("GROQ_MODEL", "openai/gpt-oss-120b")


def _modify_with_groq(instruction: str, itinerary: dict):
    from groq import Groq

    client = Groq(api_key=GROQ_API_KEY)

    prompt = f"""
You are an expert travel itinerary assistant.
Given the current itinerary and the traveler's request, determine the required action.

CURRENT ITINERARY:
{json.dumps(itinerary, indent=2)}

USER REQUEST:
{instruction}

Return ONLY a valid JSON object matching this exact schema:
{{
    "action": "add_activity",
    "day_number": 1,
    "activity_name": "Activity Name",
    "description": "Short description of the activity",
    "estimated_cost": 30.0,
    "duration_hours": 2.0
}}

RULES:
- "action" must be either "add_activity" or "remove_activity".
- "day_number" must be an integer indicating which day is being changed (default to 1 if unspecified).
- For "add_activity": populate activity_name, description, estimated_cost (number), and duration_hours (number).
- For "remove_activity": specify the activity_name to remove and day_number (estimated_cost and duration_hours can be 0).
"""

    completion = client.chat.completions.create(
        model=GROQ_MODEL,
        messages=[{"role": "user", "content": prompt}],
        temperature=0.1,
        max_tokens=1024,
        response_format={"type": "json_object"}
    )

    content = completion.choices[0].message.content
    return json.loads(content)


def _modify_with_ollama(instruction: str, itinerary: dict):
    import ollama

    prompt = f"""
You are a travel itinerary modification assistant.

CURRENT ITINERARY:
{json.dumps(itinerary, indent=2)}

USER REQUEST:
{instruction}

Return ONLY valid JSON:
{{
    "action": "add_activity",
    "day_number": 1,
    "activity_name": "",
    "description": "",
    "estimated_cost": 0,
    "duration_hours": 0
}}
"""
    response = ollama.chat(
        model="llama3.2",
        messages=[{"role": "user", "content": prompt}],
        options={"temperature": 0}
    )
    content = response["message"]["content"].strip()
    if content.startswith("```json"):
        content = content[7:]
    elif content.startswith("```"):
        content = content[3:]
    if content.endswith("```"):
        content = content[:-3]
    return json.loads(content.strip())


def understand_modification(instruction: str, itinerary: dict):
    print(f"Understanding modification instruction: '{instruction}'...")

    raw_result = None

    if GROQ_API_KEY:
        try:
            print(f"Calling Groq Cloud API for modification...")
            raw_result = _modify_with_groq(instruction, itinerary)
            print("Successfully processed modification via Groq Cloud API!")
        except Exception as e:
            print("Groq API error on modification:", e)
            print("Falling back to local Ollama...")

    if not raw_result:
        try:
            raw_result = _modify_with_ollama(instruction, itinerary)
        except Exception as e:
            raise RuntimeError(f"Failed to process modification: {e}")

    # Normalize fields
    action = str(raw_result.get("action", "add_activity")).lower().strip()
    if "remove" in action or "delete" in action:
        action = "remove_activity"
    else:
        action = "add_activity"

    try:
        day_number = int(raw_result.get("day_number", 1))
    except (ValueError, TypeError):
        day_number = 1

    try:
        estimated_cost = float(raw_result.get("estimated_cost", 0))
    except (ValueError, TypeError):
        estimated_cost = 0.0

    try:
        duration_hours = float(raw_result.get("duration_hours", 2))
    except (ValueError, TypeError):
        duration_hours = 2.0

    return {
        "action": action,
        "day_number": max(1, day_number),
        "activity_name": str(raw_result.get("activity_name", "New Activity")).strip(),
        "description": str(raw_result.get("description", "")).strip(),
        "estimated_cost": estimated_cost,
        "duration_hours": duration_hours
    }
