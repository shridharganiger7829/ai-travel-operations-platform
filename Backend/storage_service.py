"""
Supabase Storage Service
Handles uploading documents/vouchers to Supabase Cloud Storage with local disk fallback.
"""

import os
import re
import urllib.parse
from dotenv import load_dotenv

load_dotenv()

# Detect Supabase credentials
SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_KEY") or os.getenv("SUPABASE_ANON_KEY", "")
SUPABASE_BUCKET = os.getenv("SUPABASE_STORAGE_BUCKET", "travel-documents")

# Auto-derive SUPABASE_URL from DATABASE_URL if not explicitly set
if not SUPABASE_URL:
    db_url = os.getenv("DATABASE_URL", "")
    match = re.search(r"db\.([a-zA-Z0-9_-]+)\.supabase\.co", db_url)
    if match:
        project_ref = match.group(1)
        SUPABASE_URL = f"https://{project_ref}.supabase.co"


def is_supabase_storage_configured() -> bool:
    """Returns True if Supabase URL and API Key are provided."""
    return bool(SUPABASE_URL and SUPABASE_KEY)


def upload_to_supabase(
    file_bytes: bytes,
    filename: str,
    content_type: str = "application/octet-stream",
    path_prefix: str = ""
) -> tuple[bool, str]:
    """
    Uploads raw file bytes to Supabase Storage bucket.
    Returns (True, public_url) on success, or (False, error_message) on failure.
    """
    if not is_supabase_storage_configured():
        return False, "Supabase Storage credentials not configured"

    try:
        import httpx

        # Clean filename and build storage path
        safe_filename = re.sub(r"[^\w\.\-]", "_", filename)
        storage_path = f"{path_prefix}/{safe_filename}" if path_prefix else safe_filename
        storage_path = storage_path.lstrip("/")

        # Supabase Storage Object Upload REST API
        endpoint = f"{SUPABASE_URL.rstrip('/')}/storage/v1/object/{SUPABASE_BUCKET}/{storage_path}"
        headers = {
            "Authorization": f"Bearer {SUPABASE_KEY}",
            "apiKey": SUPABASE_KEY,
            "Content-Type": content_type or "application/octet-stream",
            "x-upsert": "true"
        }

        with httpx.Client(timeout=30.0) as client:
            resp = client.post(endpoint, headers=headers, content=file_bytes)

            if resp.status_code in (200, 201):
                # Public URL for the uploaded asset
                public_url = (
                    f"{SUPABASE_URL.rstrip('/')}/storage/v1/object/public/"
                    f"{SUPABASE_BUCKET}/{urllib.parse.quote(storage_path)}"
                )
                return True, public_url
            else:
                return False, f"Supabase storage error ({resp.status_code}): {resp.text}"

    except Exception as e:
        return False, f"Upload exception: {str(e)}"


def migrate_local_files_to_supabase() -> dict:
    """
    Scans the local 'uploads' directory and migrates any stored files to Supabase Storage.
    """
    if not is_supabase_storage_configured():
        return {
            "status": "skipped",
            "message": "Supabase Storage is not configured. Set SUPABASE_KEY in .env.",
            "migrated": 0
        }

    upload_dir = "uploads"
    if not os.path.exists(upload_dir):
        return {"status": "success", "message": "No local uploads folder found", "migrated": 0}

    files = [f for f in os.listdir(upload_dir) if os.path.isfile(os.path.join(upload_dir, f))]
    migrated_count = 0
    errors = []

    for fname in files:
        fpath = os.path.join(upload_dir, fname)
        try:
            with open(fpath, "rb") as f:
                content = f.read()
            ok, res = upload_to_supabase(
                file_bytes=content,
                filename=fname,
                path_prefix="migrated"
            )
            if ok:
                migrated_count += 1
            else:
                errors.append(f"{fname}: {res}")
        except Exception as err:
            errors.append(f"{fname}: {str(err)}")

    return {
        "status": "success" if not errors else "partial_success",
        "total_files": len(files),
        "migrated": migrated_count,
        "errors": errors
    }
