import os


load_dotenv()

client = OpenAI(
    api_key=os.getenv("OPENAI_API_KEY")
)


def extract_booking_information(text: str):

    prompt = f"""
Extract travel booking information from the following document.

Return ONLY valid JSON with these fields:

{{
    "booking_type": "",
    "hotel_name": "",
    "guest_name": "",
    "check_in": "",
    "check_out": "",
    "booking_reference": "",
    "amount": "",
    "currency": ""
}}

If a field is not available, return null.

DOCUMENT:
{text}
"""

    response = client.responses.create(
        model="gpt-5-mini",
        input=prompt
    )

    return response.output_text