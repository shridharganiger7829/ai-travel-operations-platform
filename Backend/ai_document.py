import os
import json
from dotenv import load_dotenv

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_MODEL = os.getenv("GROQ_MODEL", "openai/gpt-oss-120b")


def _extract_with_groq(text: str):
    from groq import Groq

    client = Groq(api_key=GROQ_API_KEY)

    prompt = f"""
You are a travel document extraction assistant.
Extract all key details from this travel document text into structured JSON.

Return ONLY a valid JSON object with these fields:
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

If a field is not found in the text, set its value to null.

DOCUMENT TEXT:
{text}
"""

    completion = client.chat.completions.create(
        model=GROQ_MODEL,
        messages=[{"role": "user", "content": prompt}],
        temperature=0.1,
        response_format={"type": "json_object"}
    )

    content = completion.choices[0].message.content
    return json.loads(content)


def _extract_with_ollama(text: str):
    import ollama

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
        messages=[{"role": "user", "content": prompt}]
    )
    return json.loads(response["message"]["content"])


def extract_document_information(text: str):
    print("Extracting document information with AI...")

    if GROQ_API_KEY:
        try:
            print("Using Groq Cloud API for document extraction...")
            result = _extract_with_groq(text)
            print("Successfully extracted document info via Groq Cloud API!")
            return result
        except Exception as e:
            print("Groq document extraction error:", e)
            print("Falling back to local Ollama...")

    try:
        return _extract_with_ollama(text)
    except Exception as e:
        print("Ollama extraction fallback error:", e)
        return {"error": str(e), "raw_text_snippet": text[:200]}
