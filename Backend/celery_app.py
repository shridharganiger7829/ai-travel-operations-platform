import os
from celery import Celery
from dotenv import load_dotenv

load_dotenv()

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")

celery_app = Celery(
    "travel_platform",
    broker=f"{REDIS_URL}/0" if not REDIS_URL.endswith(("/0", "/1")) else REDIS_URL,
    backend=f"{REDIS_URL}/1" if not REDIS_URL.endswith(("/0", "/1")) else REDIS_URL,
)
