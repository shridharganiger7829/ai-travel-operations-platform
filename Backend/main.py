from fastapi import FastAPI
from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session

from database import engine, Base, SessionLocal
from models import User
from schemas import UserCreate
from auth import hash_password

from schemas import UserCreate, UserLogin
from auth import hash_password, verify_password
from security import create_access_token

from dependencies import get_current_user

from models import User, Destination, Hotel, Activity, Trip
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
    TripResponse
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