from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base, Session
import os
from dotenv import load_dotenv

#load_dotenv("shh.env")
from pathlib import Path

# database.py is at backend/app/db/database.py
# shh.env is at backend/shh.env
_env_path = Path(__file__).resolve().parent.parent.parent / "shh.env"
load_dotenv(_env_path)

DATABASE_URL = os.getenv("DATABASE_URL")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()