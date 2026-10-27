from pydantic import BaseModel, EmailStr


class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class DestinationCreate(BaseModel):
    name: str
    country: str
    description: str
    image_url: str | None = None

class DestinationResponse(DestinationCreate):
    id: int

    class Config:
        from_attributes = True