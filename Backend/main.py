from fastapi import FastAPI

from database import engine, Base
import models

app = FastAPI(
    title="AI Travel Operations Platform"
)


Base.metadata.create_all(bind=engine)


@app.get("/")
def home():
    return {
        "message": "AI Travel Operations Platform API is running"
    }