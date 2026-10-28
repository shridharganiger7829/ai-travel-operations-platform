from fastapi import FastAPI
from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session

import json

from database import engine, Base, SessionLocal
from models import User
from schemas import UserCreate
from auth import hash_password

from schemas import UserCreate, UserLogin
from auth import hash_password, verify_password
from security import create_access_token

from dependencies import get_current_user

from fastapi import UploadFile, File
import os
import shutil

from schemas import ItineraryGenerateRequest
from ai_itinerary import generate_itinerary

from models import (
    User,
    Destination,
    Hotel,
    Activity,
    Trip,
    ItineraryDay,
    ItineraryActivity,
    Booking,
    TravelDocument
)
from schemas import (
    UserCreate,
    UserLogin,
    DestinationCreate,
    DestinationResponse,
    HotelCreate,
    HotelResponse,
    ActivityCreate,
    ActivityResponse,
    TripCreate,
    TripResponse,
    ItineraryDayCreate,
    ItineraryDayResponse,
    ItineraryActivityCreate,
    BookingCreate,
    BookingResponse,
    TravelDocumentResponse
)

app = FastAPI(
    title="AI Travel Operations Platform"
)

Base.metadata.create_all(bind=engine)


def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


@app.get("/")
def home():
    return {
        "message": "AI Travel Operations Platform API is running"
    }


@app.post("/api/auth/register")
def register_user(
    user: UserCreate,
    db: Session = Depends(get_db)
):
    existing_user = db.query(User).filter(
        User.email == user.email
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    new_user = User(
        name=user.name,
        email=user.email,
        password_hash=hash_password(user.password),
        role="customer"
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "message": "User registered successfully",
        "user_id": new_user.id,
        "name": new_user.name,
        "email": new_user.email,
        "role": new_user.role
    }

@app.post("/api/auth/login")
def login_user(
    user: UserLogin,
    db: Session = Depends(get_db)
):
    existing_user = db.query(User).filter(
        User.email == user.email
    ).first()

    if not existing_user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    if not verify_password(
        user.password,
        existing_user.password_hash
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    token = create_access_token(existing_user.id)

    return {
        "message": "Login successful",
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": existing_user.id,
            "name": existing_user.name,
            "email": existing_user.email,
            "role": existing_user.role
        }
    }

@app.get("/api/auth/me")
def get_my_profile(
    current_user: User = Depends(get_current_user)
):
    return {
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email,
        "role": current_user.role
    }

@app.post("/api/destinations", response_model=DestinationResponse)
def create_destination(
    destination: DestinationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in ["admin", "travel_agent"]:
        raise HTTPException(
            status_code=403,
            detail="Only admin or travel agent can create destinations"
        )

    new_destination = Destination(
        name=destination.name,
        country=destination.country,
        description=destination.description,
        image_url=destination.image_url
    )

    db.add(new_destination)
    db.commit()
    db.refresh(new_destination)

    return new_destination

@app.get("/api/destinations", response_model=list[DestinationResponse])
def get_destinations(
    db: Session = Depends(get_db)
):
    return db.query(Destination).all()

@app.get("/api/destinations/{destination_id}", response_model=DestinationResponse)
def get_destination(
    destination_id: int,
    db: Session = Depends(get_db)
):
    destination = db.query(Destination).filter(
        Destination.id == destination_id
    ).first()

    if not destination:
        raise HTTPException(
            status_code=404,
            detail="Destination not found"
        )

    return destination

@app.post("/api/hotels", response_model=HotelResponse)
def create_hotel(
    hotel: HotelCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in ["admin", "travel_agent"]:
        raise HTTPException(
            status_code=403,
            detail="Only admin or travel agent can create hotels"
        )

    new_hotel = Hotel(
        name=hotel.name,
        location=hotel.location,
        description=hotel.description,
        price_per_night=hotel.price_per_night,
        rating=hotel.rating,
        image_url=hotel.image_url
    )

    db.add(new_hotel)
    db.commit()
    db.refresh(new_hotel)

    return new_hotel

@app.get("/api/hotels", response_model=list[HotelResponse])
def get_hotels(
    db: Session = Depends(get_db)
):
    return db.query(Hotel).all()

@app.get("/api/hotels/{hotel_id}", response_model=HotelResponse)
def get_hotel(
    hotel_id: int,
    db: Session = Depends(get_db)
):
    hotel = db.query(Hotel).filter(
        Hotel.id == hotel_id
    ).first()

    if not hotel:
        raise HTTPException(
            status_code=404,
            detail="Hotel not found"
        )

    return hotel

@app.post("/api/activities", response_model=ActivityResponse)
def create_activity(
    activity: ActivityCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in ["admin", "travel_agent"]:
        raise HTTPException(
            status_code=403,
            detail="Only admin or travel agent can create activities"
        )

    new_activity = Activity(
        name=activity.name,
        location=activity.location,
        description=activity.description,
        price=activity.price,
        duration_hours=activity.duration_hours,
        image_url=activity.image_url
    )

    db.add(new_activity)
    db.commit()
    db.refresh(new_activity)

    return new_activity

@app.get("/api/activities", response_model=list[ActivityResponse])
def get_activities(
    db: Session = Depends(get_db)
):
    return db.query(Activity).all()

@app.get("/api/activities/{activity_id}", response_model=ActivityResponse)
def get_activity(
    activity_id: int,
    db: Session = Depends(get_db)
):
    activity = db.query(Activity).filter(
        Activity.id == activity_id
    ).first()

    if not activity:
        raise HTTPException(
            status_code=404,
            detail="Activity not found"
        )

    return activity

@app.post("/api/trips", response_model=TripResponse)
def create_trip(
    trip: TripCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if trip.end_date < trip.start_date:
        raise HTTPException(
            status_code=400,
            detail="End date cannot be before start date"
        )

    new_trip = Trip(
        user_id=current_user.id,
        title=trip.title,
        destination=trip.destination,
        start_date=trip.start_date,
        end_date=trip.end_date,
        budget=trip.budget
    )

    db.add(new_trip)
    db.commit()
    db.refresh(new_trip)

    return new_trip

@app.get("/api/trips", response_model=list[TripResponse])
def get_my_trips(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(Trip).filter(
        Trip.user_id == current_user.id
    ).all()

@app.get("/api/trips/{trip_id}", response_model=TripResponse)
def get_trip(
    trip_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    trip = db.query(Trip).filter(
        Trip.id == trip_id,
        Trip.user_id == current_user.id
    ).first()

    if not trip:
        raise HTTPException(
            status_code=404,
            detail="Trip not found"
        )

    return trip

@app.post(
    "/api/trips/{trip_id}/itinerary",
    response_model=ItineraryDayResponse
)
def create_itinerary_day(
    trip_id: int,
    itinerary: ItineraryDayCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    trip = db.query(Trip).filter(
        Trip.id == trip_id,
        Trip.user_id == current_user.id
    ).first()

    if not trip:
        raise HTTPException(
            status_code=404,
            detail="Trip not found"
        )

    new_day = ItineraryDay(
        trip_id=trip_id,
        day_number=itinerary.day_number,
        date=itinerary.date,
        title=itinerary.title,
        notes=itinerary.notes
    )

    db.add(new_day)
    db.commit()
    db.refresh(new_day)

    return new_day

@app.get(
    "/api/trips/{trip_id}/itinerary",
    response_model=list[ItineraryDayResponse]
)
def get_itinerary(
    trip_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    trip = db.query(Trip).filter(
        Trip.id == trip_id,
        Trip.user_id == current_user.id
    ).first()

    if not trip:
        raise HTTPException(
            status_code=404,
            detail="Trip not found"
        )

    return db.query(ItineraryDay).filter(
        ItineraryDay.trip_id == trip_id
    ).order_by(
        ItineraryDay.day_number
    ).all()

@app.post("/api/itinerary/{day_id}/activities")
def add_activity_to_itinerary(
    day_id: int,
    activity_data: ItineraryActivityCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    day = db.query(ItineraryDay).join(
        Trip,
        ItineraryDay.trip_id == Trip.id
    ).filter(
        ItineraryDay.id == day_id,
        Trip.user_id == current_user.id
    ).first()

    if not day:
        raise HTTPException(
            status_code=404,
            detail="Itinerary day not found"
        )

    activity = db.query(Activity).filter(
        Activity.id == activity_data.activity_id
    ).first()

    if not activity:
        raise HTTPException(
            status_code=404,
            detail="Activity not found"
        )

    new_item = ItineraryActivity(
        itinerary_day_id=day_id,
        activity_id=activity_data.activity_id,
        start_time=activity_data.start_time,
        end_time=activity_data.end_time,
        notes=activity_data.notes
    )

    db.add(new_item)
    db.commit()
    db.refresh(new_item)

    return {
        "message": "Activity added to itinerary",
        "id": new_item.id
    }

@app.post(
    "/api/trips/{trip_id}/bookings",
    response_model=BookingResponse
)
def create_booking(
    trip_id: int,
    booking: BookingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    trip = db.query(Trip).filter(
        Trip.id == trip_id,
        Trip.user_id == current_user.id
    ).first()

    if not trip:
        raise HTTPException(
            status_code=404,
            detail="Trip not found"
        )

    if booking.booking_type not in ["hotel", "activity"]:
        raise HTTPException(
            status_code=400,
            detail="Booking type must be hotel or activity"
        )

    if booking.booking_type == "hotel":
        item = db.query(Hotel).filter(
            Hotel.id == booking.reference_id
        ).first()
    else:
        item = db.query(Activity).filter(
            Activity.id == booking.reference_id
        ).first()

    if not item:
        raise HTTPException(
            status_code=404,
            detail="Booking item not found"
        )

    new_booking = Booking(
        trip_id=trip_id,
        user_id=current_user.id,
        booking_type=booking.booking_type,
        reference_id=booking.reference_id,
        booking_date=booking.booking_date,
        amount=booking.amount,
        status="pending"
    )

    db.add(new_booking)
    db.commit()
    db.refresh(new_booking)

    return new_booking

@app.get(
    "/api/trips/{trip_id}/bookings",
    response_model=list[BookingResponse]
)
def get_bookings(
    trip_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    trip = db.query(Trip).filter(
        Trip.id == trip_id,
        Trip.user_id == current_user.id
    ).first()

    if not trip:
        raise HTTPException(
            status_code=404,
            detail="Trip not found"
        )

    return db.query(Booking).filter(
        Booking.trip_id == trip_id,
        Booking.user_id == current_user.id
    ).all()

@app.patch("/api/bookings/{booking_id}/status")
def update_booking_status(
    booking_id: int,
    status: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    booking = db.query(Booking).filter(
        Booking.id == booking_id,
        Booking.user_id == current_user.id
    ).first()

    if not booking:
        raise HTTPException(
            status_code=404,
            detail="Booking not found"
        )

    allowed_statuses = [
        "pending",
        "confirmed",
        "cancelled"
    ]

    if status not in allowed_statuses:
        raise HTTPException(
            status_code=400,
            detail="Invalid booking status"
        )

    booking.status = status

    db.commit()
    db.refresh(booking)

    return {
        "message": "Booking status updated",
        "status": booking.status
    }

@app.post("/api/trips/{trip_id}/documents")
def upload_document(
    trip_id: int,
    document_type: str,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    trip = db.query(Trip).filter(
        Trip.id == trip_id,
        Trip.user_id == current_user.id
    ).first()

    if not trip:
        raise HTTPException(
            status_code=404,
            detail="Trip not found"
        )

    allowed_types = [
        "passport",
        "visa",
        "hotel_confirmation",
        "flight_ticket"
    ]

    if document_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail="Invalid document type"
        )

    upload_dir = "uploads"

    os.makedirs(upload_dir, exist_ok=True)

    file_path = os.path.join(
        upload_dir,
        file.filename
    )

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    document = TravelDocument(
        trip_id=trip_id,
        user_id=current_user.id,
        document_type=document_type,
        file_name=file.filename,
        file_url=file_path,
        status="uploaded"
    )

    db.add(document)
    db.commit()
    db.refresh(document)

    return {
        "message": "Document uploaded successfully",
        "document_id": document.id,
        "file_name": document.file_name,
        "status": document.status
    }

@app.post("/api/ai/generate-itinerary")
def generate_ai_itinerary(
    request: ItineraryGenerateRequest,
    current_user: User = Depends(get_current_user)
):
    result = generate_itinerary(
        destination=request.destination,
        start_date=request.start_date,
        end_date=request.end_date,
        budget=request.budget,
        interests=request.interests,
        travel_style=request.travel_style
    )

    try:
        itinerary = json.loads(result)
    except json.JSONDecodeError:
        raise HTTPException(
            status_code=500,
            detail="AI returned invalid JSON"
        )

    return {
        "message": "AI itinerary generated successfully",
        "itinerary": itinerary
    }