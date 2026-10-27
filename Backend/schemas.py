from pydantic import BaseModel, EmailStr
from datetime import date


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

class HotelCreate(BaseModel):
    name: str
    location: str
    description: str
    price_per_night: float
    rating: float = 0.0
    image_url: str | None = None


class HotelResponse(HotelCreate):
    id: int

    class Config:
        from_attributes = True

class ActivityCreate(BaseModel):
    name: str
    location: str
    description: str
    price: float
    duration_hours: float
    image_url: str | None = None


class ActivityResponse(ActivityCreate):
    id: int

    class Config:
        from_attributes = True

class TripCreate(BaseModel):
    title: str
    destination: str
    start_date: date
    end_date: date
    budget: float = 0


class TripResponse(TripCreate):
    id: int
    user_id: int
    status: str

    class Config:
        from_attributes = True

class ItineraryDayCreate(BaseModel):
    day_number: int
    date: date
    title: str
    notes: str | None = None


class ItineraryDayResponse(ItineraryDayCreate):
    id: int
    trip_id: int

    class Config:
        from_attributes = True

class ItineraryActivityCreate(BaseModel):
    activity_id: int
    start_time: str | None = None
    end_time: str | None = None
    notes: str | None = None

class BookingCreate(BaseModel):
    booking_type: str
    reference_id: int
    booking_date: date
    amount: float


class BookingResponse(BookingCreate):
    id: int
    trip_id: int
    user_id: int
    status: str

    class Config:
        from_attributes = True