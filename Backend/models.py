from sqlalchemy import String, DateTime
from sqlalchemy.orm import Mapped, mapped_column
from datetime import datetime

from database import Base
from datetime import datetime, date


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    name: Mapped[str] = mapped_column(String(100))

    email: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        index=True
    )

    password_hash: Mapped[str] = mapped_column(String(255))

    role: Mapped[str] = mapped_column(
        String(50),
        default="customer"
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow
    )

class Destination(Base):
    __tablename__ = "destinations"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    name: Mapped[str] = mapped_column(String(100))

    country: Mapped[str] = mapped_column(String(100))

    description: Mapped[str] = mapped_column(String(1000))

    image_url: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow
    )

class Hotel(Base):
    __tablename__ = "hotels"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    name: Mapped[str] = mapped_column(String(150))

    location: Mapped[str] = mapped_column(String(200))

    description: Mapped[str] = mapped_column(String(1000))

    price_per_night: Mapped[float]

    rating: Mapped[float] = mapped_column(default=0.0)

    image_url: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow
    )

class Activity(Base):
    __tablename__ = "activities"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    name: Mapped[str] = mapped_column(String(150))

    location: Mapped[str] = mapped_column(String(200))

    description: Mapped[str] = mapped_column(String(1000))

    price: Mapped[float]

    duration_hours: Mapped[float]

    image_url: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow
    )

class Trip(Base):
    __tablename__ = "trips"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    user_id: Mapped[int] = mapped_column()

    title: Mapped[str] = mapped_column(String(200))

    destination: Mapped[str] = mapped_column(String(200))

    start_date: Mapped[date]

    end_date: Mapped[date]

    budget: Mapped[float] = mapped_column(default=0)

    status: Mapped[str] = mapped_column(
        String(50),
        default="planning"
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow
    )

class ItineraryDay(Base):
    __tablename__ = "itinerary_days"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    trip_id: Mapped[int] = mapped_column()

    day_number: Mapped[int]

    date: Mapped[date]

    title: Mapped[str] = mapped_column(String(200))

    notes: Mapped[str | None] = mapped_column(
        String(1000),
        nullable=True
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow
    )

class ItineraryActivity(Base):
    __tablename__ = "itinerary_activities"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    itinerary_day_id: Mapped[int] = mapped_column()

    activity_id: Mapped[int] = mapped_column()

    start_time: Mapped[str | None] = mapped_column(
        String(20),
        nullable=True
    )

    end_time: Mapped[str | None] = mapped_column(
        String(20),
        nullable=True
    )

    notes: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True
    )

class Booking(Base):
    __tablename__ = "bookings"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    trip_id: Mapped[int] = mapped_column()

    user_id: Mapped[int] = mapped_column()

    booking_type: Mapped[str] = mapped_column(String(50))
    # hotel / activity

    reference_id: Mapped[int] = mapped_column()
    # hotel_id or activity_id

    booking_date: Mapped[date] = mapped_column()

    amount: Mapped[float] = mapped_column(default=0)

    status: Mapped[str] = mapped_column(
        String(50),
        default="pending"
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow
    )

class TravelDocument(Base):
    __tablename__ = "travel_documents"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    trip_id: Mapped[int] = mapped_column()

    user_id: Mapped[int] = mapped_column()

    document_type: Mapped[str] = mapped_column(String(50))
    # passport / visa / hotel_confirmation / flight_ticket

    file_name: Mapped[str] = mapped_column(String(255))

    file_url: Mapped[str] = mapped_column(String(500))

    extracted_data: Mapped[str | None] = mapped_column(
        String(5000),
        nullable=True
    )

    status: Mapped[str] = mapped_column(
        String(50),
        default="uploaded"
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow
    )