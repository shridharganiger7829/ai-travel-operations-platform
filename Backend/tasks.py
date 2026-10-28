from celery_app import celery_app
from pypdf import PdfReader
from sqlalchemy.orm import Session
import json

from database import SessionLocal
from models import TravelDocument
from ai_document import extract_document_information


@celery_app.task
def process_document(document_id: int, file_path: str):

    db: Session = SessionLocal()

    try:
        print(f"Processing document: {document_id}")

        # 1. Read PDF
        reader = PdfReader(file_path)

        text = ""

        for page in reader.pages:
            text += page.extract_text() or ""

        # 2. Send extracted text to Ollama
        extracted_data = extract_document_information(text)

        print("AI extracted data:")
        print(extracted_data)

        # 3. Find document in PostgreSQL
        document = db.query(TravelDocument).filter(
            TravelDocument.id == document_id
        ).first()

        if not document:
            print("Document not found")
            return

        # 4. Save AI result
        document.extracted_data = json.dumps(
            extracted_data
        )

        # 5. Update status
        document.status = "processed"

        db.commit()

        print("Document processed successfully")

        return extracted_data

    except Exception as e:

        print(f"Document processing failed: {e}")

        document = db.query(TravelDocument).filter(
            TravelDocument.id == document_id
        ).first()

        if document:
            document.status = "failed"
            db.commit()

        raise

    finally:
        db.close()