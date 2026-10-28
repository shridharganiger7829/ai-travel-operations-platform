from celery_app import celery_app
from pypdf import PdfReader

from ai_service import extract_booking_information


@celery_app.task
def process_document(document_id: int, file_path: str):

    reader = PdfReader(file_path)

    text = ""

    for page in reader.pages:
        text += page.extract_text() or ""

    extracted_data = extract_booking_information(text)

    print("AI EXTRACTED DATA:")
    print(extracted_data)

    return extracted_data