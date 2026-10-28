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
Create a realistic travel itinerary.

Destination: {destination}
Start date: {start_date}
End date: {end_date}
Budget: {budget}
Interests: {", ".join(interests)}
Travel style: {travel_style}

Return ONLY valid JSON in this exact format:

{{
    "destination": "{destination}",
    "days": [
        {{
            "day": 1,
            "title": "",
            "activities": [
                {{
                    "name": "",
                    "description": "",
                    "estimated_cost": 0,
                    "duration_hours": 0
                }}
            ]
        }}
    ],
    "estimated_total_cost": 0
}}

Keep the itinerary practical and within the budget.
"""

    response = ollama.chat(
        model="llama3.2",
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ]
    )

    return response["message"]["content"]