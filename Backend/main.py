from fastapi import FastAPI

app = FastAPI(title="AI Travel Operations Platform")


@app.get("/")
def home():
    return {
        "message": "AI Travel Operations Platform API is running"
    }