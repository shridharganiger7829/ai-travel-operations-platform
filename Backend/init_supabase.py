"""
Supabase Setup & Initialization Script
Usage:
    python init_supabase.py
    python init_supabase.py --copy-from-local "postgresql+psycopg://travel_user:travel_password@localhost:5432/travel_db"
"""

import sys
import argparse
from sqlalchemy import create_engine, select
from sqlalchemy.orm import sessionmaker

from database import engine, SessionLocal, Base, DATABASE_URL
from models import (
    User, Destination, Hotel, Activity, Trip,
    ItineraryDay, ItineraryActivity, Booking, TravelDocument, Notification
)
from auth import hash_password


def init_tables():
    print(f"\n[1/3] Connecting to target database...")
    print(f"Target URL: {DATABASE_URL.split('@')[-1] if '@' in DATABASE_URL else DATABASE_URL}")
    
    try:
        with engine.connect() as conn:
            print("Successfully connected to PostgreSQL engine!")
    except Exception as e:
        print(f"Connection failed: {e}")
        print("\nPlease check your DATABASE_URL in Backend/.env.")
        sys.exit(1)

    print("\n[2/3] Creating all tables schema on Supabase...")
    Base.metadata.create_all(bind=engine)
    print("Tables created successfully:")
    for table_name in Base.metadata.tables.keys():
        print(f"  - {table_name}")


def seed_admin_and_defaults():
    print("\n[3/3] Checking admin user and initial data...")
    db = SessionLocal()
    try:
        # Check if admin exists
        admin = db.query(User).filter(User.role == "admin").first()
        if not admin:
            admin = User(
                name="Admin User",
                email="shridhar@example.com",
                password_hash=hash_password("admin123"),
                role="admin"
            )
            db.add(admin)
            db.commit()
            print("  Created default admin user: shridhar@example.com / admin123")
        else:
            print(f"  Existing admin found: {admin.email}")

        # Check destinations
        if db.query(Destination).count() == 0:
            sample_dest = Destination(
                name="Goa",
                country="India",
                description="Sunny coastal paradise with golden beaches and vibrant nightlife.",
                image_url="https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800"
            )
            db.add(sample_dest)
            db.commit()
            print("  Added sample destination: Goa")

        # Check hotels
        if db.query(Hotel).count() == 0:
            sample_hotel = Hotel(
                name="Taj Exotica Resort & Spa",
                location="Goa",
                description="Luxury Mediterranean-inspired resort overlooking the Arabian Sea.",
                price_per_night=12000.0,
                rating=4.8,
                image_url="https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800"
            )
            db.add(sample_hotel)
            db.commit()
            print("  Added sample hotel: Taj Exotica Resort & Spa")

        # Check activities
        if db.query(Activity).count() == 0:
            sample_act = Activity(
                name="Scuba Diving & Coral Exploration",
                location="Goa",
                description="Guided underwater diving session with equipment and photography.",
                price=2500.0,
                duration_hours=3.0,
                image_url="https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800"
            )
            db.add(sample_act)
            db.commit()
            print("  Added sample activity: Scuba Diving")

        print("\nInitialization complete! Your Supabase database is ready to use.")

    finally:
        db.close()


def copy_from_source(source_url: str):
    print(f"\n[*] Copying records from local source database to Supabase...")
    src_engine = create_engine(source_url)
    SrcSession = sessionmaker(bind=src_engine)
    src_db = SrcSession()
    dst_db = SessionLocal()

    try:
        tables = [
            (User, "users"),
            (Destination, "destinations"),
            (Hotel, "hotels"),
            (Activity, "activities"),
            (Trip, "trips"),
            (ItineraryDay, "itinerary_days"),
            (ItineraryActivity, "itinerary_activities"),
            (Booking, "bookings"),
            (TravelDocument, "travel_documents"),
            (Notification, "notifications"),
        ]

        for model, name in tables:
            rows = src_db.query(model).all()
            count = 0
            for r in rows:
                # check if exists by id
                existing = dst_db.query(model).filter(model.id == r.id).first()
                if not existing:
                    dst_db.merge(r)
                    count += 1
            dst_db.commit()
            print(f"  Copied {count} records into {name}")

        print("\nAll data copied successfully into Supabase!")
    finally:
        src_db.close()
        dst_db.close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Setup Supabase for AI Travel Platform")
    parser.add_argument("--copy-from-local", type=str, help="Source database URL to copy data from")
    args = parser.parse_args()

    init_tables()
    if args.copy_from_local:
        copy_from_source(args.copy_from_local)
    else:
        seed_admin_and_defaults()
