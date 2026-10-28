from fastapi import FastAPI
from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from fastapi import UploadFile, File
import os
import shutil

import json
from tasks import process_document

from database import engine, Base, SessionLocal
from models import User
from schemas import UserCreate
from auth import hash_password

from schemas import UserCreate, UserLogin
from auth import hash_password, verify_password
from security import create_access_token

from dependencies import get_current_user
from schemas import TripModificationRequest

from fastapi import UploadFile, File
import os
import shutil

from schemas import ItineraryGenerateRequest
from ai_itinerary import generate_itinerary
from ai_modify import understand_modification

from datetime import timedelta
from models import Notification

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
    TravelDocumentResponse,
    BookingCreateRequest,
    BookingResponse,
    NotificationResponse
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
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    # ==========================================
    # STEP 1: Generate itinerary using Ollama AI
    # ==========================================

    ai_result = generate_itinerary(
        destination=request.destination,
        start_date=request.start_date,
        end_date=request.end_date,
        budget=request.budget,
        interests=request.interests,
        travel_style=request.travel_style
    )

    # ==========================================
    # STEP 2: Create Trip
    # ==========================================

    trip = Trip(
        user_id=current_user.id,
        title=f"{request.destination} AI Trip",
        destination=request.destination,
        start_date=request.start_date,
        end_date=request.end_date,
        budget=request.budget,
        status="planning"
    )

    db.add(trip)
    db.commit()
    db.refresh(trip)

    # ==========================================
    # STEP 3: Create Itinerary Days
    # ==========================================

    current_date = request.start_date

    for day_data in ai_result["days"]:

        itinerary_day = ItineraryDay(
            trip_id=trip.id,
            day_number=day_data["day"],
            date=current_date,
            title=day_data["title"],
            notes=None
        )

        db.add(itinerary_day)
        db.commit()
        db.refresh(itinerary_day)

        # ==========================================
        # STEP 4: Create / Find Activities
        # ==========================================

        for activity_data in day_data["activities"]:

            # Check if activity already exists
            activity = db.query(Activity).filter(
                Activity.name == activity_data["name"]
            ).first()

            # ======================================
            # If activity doesn't exist, create it
            # ======================================

            if not activity:

                activity = Activity(
                    name=activity_data["name"],
                    location=request.destination,
                    description=activity_data["description"],
                    price=activity_data["estimated_cost"],
                    duration_hours=activity_data["duration_hours"],
                    image_url=None
                )

                db.add(activity)
                db.commit()
                db.refresh(activity)

            # ==========================================
            # STEP 5: Connect Activity to Itinerary Day
            # ==========================================

            itinerary_activity = ItineraryActivity(
                itinerary_day_id=itinerary_day.id,
                activity_id=activity.id,
                start_time=None,
                end_time=None,
                notes=activity_data["description"]
            )

            db.add(itinerary_activity)

        db.commit()

        # Move to next date
        current_date = current_date + timedelta(days=1)

    # ==========================================
    # STEP 6: Return Result
    # ==========================================

    return {
        "message": "AI itinerary created successfully",

        "trip_id": trip.id,

        "destination": trip.destination,

        "budget": trip.budget,

        "itinerary": ai_result
    }

@app.post("/api/bookings", response_model=BookingResponse)
def create_booking(
    request: BookingCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    # Check whether trip belongs to current user
    trip = db.query(Trip).filter(
        Trip.id == request.trip_id,
        Trip.user_id == current_user.id
    ).first()

    if not trip:
        raise HTTPException(
            status_code=404,
            detail="Trip not found"
        )

    # Validate booking type
    if request.booking_type not in ["hotel", "activity"]:
        raise HTTPException(
            status_code=400,
            detail="booking_type must be hotel or activity"
        )

    # Create booking
    booking = Booking(
        trip_id=request.trip_id,
        user_id=current_user.id,
        booking_type=request.booking_type,
        reference_id=request.reference_id,
        booking_date=request.booking_date,
        amount=request.amount,
        status="pending"
    )

    db.add(booking)
    db.commit()
    db.refresh(booking)

    create_notification(
    db=db,
    user_id=current_user.id,
    title="Booking Confirmed",
    message=f"Your {booking.booking_type} booking has been created successfully.",
    notification_type="booking"
)

    return booking

@app.get("/api/bookings", response_model=list[BookingResponse])
def get_my_bookings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    bookings = db.query(Booking).filter(
        Booking.user_id == current_user.id
    ).all()

    return bookings

@app.patch("/api/bookings/{booking_id}/confirm")
def confirm_booking(
    booking_id: int,
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

    if booking.status == "cancelled":
        raise HTTPException(
            status_code=400,
            detail="Cancelled booking cannot be confirmed"
        )

    booking.status = "confirmed"

    db.commit()
    db.refresh(booking)

    return {
        "message": "Booking confirmed",
        "booking_id": booking.id,
        "status": booking.status
    }


@app.patch("/api/bookings/{booking_id}/cancel")
def cancel_booking(
    booking_id: int,
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

    if booking.status == "cancelled":
        raise HTTPException(
            status_code=400,
            detail="Booking is already cancelled"
        )

    booking.status = "cancelled"

    db.commit()
    db.refresh(booking)

    return {
        "message": "Booking cancelled",
        "booking_id": booking.id,
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

    # Check trip
    trip = db.query(Trip).filter(
        Trip.id == trip_id,
        Trip.user_id == current_user.id
    ).first()

    if not trip:
        raise HTTPException(
            status_code=404,
            detail="Trip not found"
        )

    # Allowed document types
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

    # Create uploads folder
    upload_dir = "uploads"
    os.makedirs(upload_dir, exist_ok=True)

    # Create safe filename
    file_path = os.path.join(
        upload_dir,
        file.filename
    )

    # Save file
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Save document information
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

    document.status = "processing"
    db.commit()

    process_document.delay(
    document.id,
    file_path
    )

    return {
        "message": "Document uploaded successfully",
        "document_id": document.id,
        "file_name": document.file_name,
        "status": document.status
    }

@app.post("/api/ai/modify-itinerary")
def modify_itinerary(
    request: TripModificationRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    # ==========================================
    # STEP 1: Find the trip
    # ==========================================

    trip = db.query(Trip).filter(
        Trip.id == request.trip_id,
        Trip.user_id == current_user.id
    ).first()

    if not trip:
        raise HTTPException(
            status_code=404,
            detail="Trip not found"
        )

    # ==========================================
    # STEP 2: Get itinerary days
    # ==========================================

    days = db.query(ItineraryDay).filter(
        ItineraryDay.trip_id == trip.id
    ).order_by(
        ItineraryDay.day_number
    ).all()

    itinerary = {
        "destination": trip.destination,
        "days": []
    }

    for day in days:

        activities = db.query(ItineraryActivity).filter(
            ItineraryActivity.itinerary_day_id == day.id
        ).all()

        day_data = {
            "day": day.day_number,
            "title": day.title,
            "activities": []
        }

        for itinerary_activity in activities:

            activity = db.query(Activity).filter(
                Activity.id == itinerary_activity.activity_id
            ).first()

            if activity:

                day_data["activities"].append({
                    "name": activity.name,
                    "description": activity.description,
                    "estimated_cost": activity.price,
                    "duration_hours": activity.duration_hours
                })

        itinerary["days"].append(day_data)

    # ==========================================
    # STEP 3: Ask AI to understand request
    # ==========================================

    modification = understand_modification(
        request.instruction,
        itinerary
    )

    action = modification["action"]
    day_number = modification["day_number"]

    # ==========================================
    # STEP 4: Find requested day
    # ==========================================

    itinerary_day = db.query(ItineraryDay).filter(
        ItineraryDay.trip_id == trip.id,
        ItineraryDay.day_number == day_number
    ).first()

    if not itinerary_day:
        raise HTTPException(
            status_code=404,
            detail="Itinerary day not found"
        )

    # ==========================================
    # STEP 5: ADD ACTIVITY
    # ==========================================

    if action == "add_activity":

        activity = db.query(Activity).filter(
            Activity.name == modification["activity_name"]
        ).first()

        if not activity:

            activity = Activity(
                name=modification["activity_name"],
                location=trip.destination,
                description=modification["description"],
                price=modification["estimated_cost"],
                duration_hours=modification["duration_hours"],
                image_url=None
            )

            db.add(activity)
            db.commit()
            db.refresh(activity)

        itinerary_activity = ItineraryActivity(
            itinerary_day_id=itinerary_day.id,
            activity_id=activity.id,
            notes=activity.description
        )

        db.add(itinerary_activity)

        db.commit()

        return {
            "message": "Activity added successfully",
            "action": "add_activity",
            "activity": activity.name,
            "day": day_number
        }

    # ==========================================
    # STEP 6: REMOVE ACTIVITY
    # ==========================================

    elif action == "remove_activity":

        activity = db.query(Activity).filter(
            Activity.name == modification["activity_name"]
        ).first()

        if not activity:
            raise HTTPException(
                status_code=404,
                detail="Activity not found"
            )

        itinerary_activity = db.query(
            ItineraryActivity
        ).filter(
            ItineraryActivity.itinerary_day_id == itinerary_day.id,
            ItineraryActivity.activity_id == activity.id
        ).first()

        if not itinerary_activity:
            raise HTTPException(
                status_code=404,
                detail="Activity is not present on this day"
            )

        db.delete(itinerary_activity)
        db.commit()

        return {
            "message": "Activity removed successfully",
            "action": "remove_activity",
            "activity": activity.name,
            "day": day_number
        }

    else:

        raise HTTPException(
            status_code=400,
            detail="Unsupported modification action"
        )


def require_admin(
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(
            status_code=403,
            detail="Admin access required"
        )

    return current_user

@app.get("/api/admin/dashboard")
def admin_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    # Check admin
    if current_user.role != "admin":
        raise HTTPException(
            status_code=403,
            detail="Admin access required"
        )

    total_users = db.query(User).count()

    total_trips = db.query(Trip).count()

    total_bookings = db.query(Booking).count()

    total_hotels = db.query(Hotel).count()

    total_activities = db.query(Activity).count()

    total_revenue = (
        db.query(func.sum(Booking.amount)).scalar()
        or 0
    )

    return {
        "total_users": total_users,
        "total_trips": total_trips,
        "total_bookings": total_bookings,
        "total_hotels": total_hotels,
        "total_activities": total_activities,
        "total_revenue": total_revenue
    }

@app.get(
    "/api/notifications",
    response_model=list[NotificationResponse]
)
def get_notifications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    notifications = db.query(Notification).filter(
        Notification.user_id == current_user.id
    ).order_by(
        Notification.created_at.desc()
    ).all()

    return notifications

@app.put("/api/notifications/{notification_id}/read")
def mark_notification_read(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    notification = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.user_id == current_user.id
    ).first()

    if not notification:
        raise HTTPException(
            status_code=404,
            detail="Notification not found"
        )

    notification.is_read = True

    db.commit()

    return {
        "message": "Notification marked as read"
    }

def create_notification(
    db: Session,
    user_id: int,
    title: str,
    message: str,
    notification_type: str = "general"
):

    notification = Notification(
        user_id=user_id,
        title=title,
        message=message,
        notification_type=notification_type
    )

    db.add(notification)
    db.commit()
    db.refresh(notification)

    return notification



@app.get("/api/hotels/search")
def search_hotels(
    location: str,
    min_price: float | None = None,
    max_price: float | None = None,
    min_rating: float | None = None,
    db: Session = Depends(get_db)
):
    query = db.query(Hotel).filter(
        Hotel.location.ilike(f"%{location}%")
    )

    if min_price is not None:
        query = query.filter(
            Hotel.price_per_night >= min_price
        )

    if max_price is not None:
        query = query.filter(
            Hotel.price_per_night <= max_price
        )

    if min_rating is not None:
        query = query.filter(
            Hotel.rating >= min_rating
        )

    hotels = query.order_by(
        Hotel.rating.desc()
    ).all()

    return hotels

@app.get("/api/activities/search")
def search_activities(
    location: str,
    max_price: float | None = None,
    max_duration: float | None = None,
    db: Session = Depends(get_db)
):
    query = db.query(Activity).filter(
        Activity.location.ilike(f"%{location}%")
    )

    if max_price is not None:
        query = query.filter(
            Activity.price <= max_price
        )

    if max_duration is not None:
        query = query.filter(
            Activity.duration_hours <= max_duration
        )

    activities = query.order_by(
        Activity.price.asc()
    ).all()

    return activities

@app.get("/api/destinations/search")
def search_destinations(
    country: str | None = None,
    name: str | None = None,
    db: Session = Depends(get_db)
):
    query = db.query(Destination)

    if country:
        query = query.filter(
            Destination.country.ilike(f"%{country}%")
        )

    if name:
        query = query.filter(
            Destination.name.ilike(f"%{name}%")
        )

    return query.all()