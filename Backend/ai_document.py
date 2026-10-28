import ollama
import json


def extract_document_information(text: str):

    prompt = f"""
You are a travel document extraction assistant.

Extract useful information from this travel document.

Return ONLY valid JSON:

{{
    "document_type": null,
    "name": null,
    "booking_reference": null,
    "hotel_name": null,
    "flight_number": null,
    "check_in": null,
    "check_out": null,
    "travel_date": null,
    "amount": null,
    "currency": null
}}

If information is not available, return null.

DOCUMENT:

{text}
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

    content = response["message"]["content"]

    return json.loads(content)