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

from models import User, Destination
from schemas import UserCreate, UserLogin, DestinationCreate, DestinationResponse

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