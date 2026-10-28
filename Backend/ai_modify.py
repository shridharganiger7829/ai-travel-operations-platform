import ollama
import json


def understand_modification(instruction: str, itinerary: dict):

    prompt = f"""
You are a travel itinerary modification assistant.

CURRENT ITINERARY:
{json.dumps(itinerary, indent=2)}

USER REQUEST:
{instruction}

Understand the user's request.

Return ONLY valid JSON.

The JSON MUST have exactly this structure:

{{
    "action": "add_activity",
    "day_number": 1,
    "activity_name": "",
    "description": "",
    "estimated_cost": 0,
    "duration_hours": 0
}}

Possible actions:

- add_activity
- remove_activity

For add_activity:
- activity_name = name of the new activity
- description = short description
- estimated_cost = estimated price
- duration_hours = expected duration

For remove_activity:
- activity_name = name of the activity to remove
- estimated_cost = 0
- duration_hours = 0

IMPORTANT:
Return complete valid JSON.
Do not use markdown.
Do not use ```json.
Do not add any text before or after the JSON.

USER REQUEST:
{instruction}
"""

    response = ollama.chat(
        model="llama3.2",
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ],
        options={
            "temperature": 0
        }
    )

    content = response["message"]["content"].strip()

    print("========== OLLAMA RESPONSE ==========")
    print(content)
    print("======================================")

    # Remove markdown code fences if Ollama adds them
    if content.startswith("```json"):
        content = content[7:]

    elif content.startswith("```"):
        content = content[3:]

    if content.endswith("```"):
        content = content[:-3]

    content = content.strip()

    # Find the JSON object
    start = content.find("{")
    end = content.rfind("}")

    if start == -1 or end == -1:
        raise ValueError(
            f"Ollama did not return valid JSON. Response was:\n{content}"
        )

    content = content[start:end + 1]

    try:
        result = json.loads(content)

    except json.JSONDecodeError as e:
        raise ValueError(
            f"Ollama returned invalid JSON: {e}\n"
            f"Response was:\n{content}"
        )

    return result