from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, declarative_base, Session
from sqlalchemy.pool import NullPool
import os
from pathlib import Path
from dotenv import load_dotenv

env_path = Path(__file__).resolve().parent.parent / "shh.env"
load_dotenv(env_path)

DATABASE_URL = os.getenv("DATABASE_URL")
SUPABASE_DB_URL = os.getenv("SUPABASE_DB_URL")  # Use this for Supabase (pooler port 6543)

# Use SQLite if no DB URL set, or as fallback when PostgreSQL is unavailable
SQLITE_URL = "sqlite:///./climbing.db"


def _get_engine():
    # Prefer Supabase URL for Vercel/serverless deployment
    url = SUPABASE_DB_URL or DATABASE_URL or SQLITE_URL
    is_supabase = bool(SUPABASE_DB_URL) or "supabase.com" in (url or "")
    if is_supabase and url and ("postgresql" in url or "postgres" in url):
        # Supabase: use NullPool for serverless, ensure postgresql:// scheme
        if url.startswith("postgres://"):
            url = "postgresql" + url[8:]
        return create_engine(
            url,
            poolclass=NullPool,
            connect_args={"connect_timeout": 10},
            pool_pre_ping=True,
        )
    if "postgresql" in url or "postgres" in url:
        try:
            eng = create_engine(
                url,
                pool_pre_ping=True,
                connect_args={"connect_timeout": 10},
            )
            with eng.connect() as conn:
                conn.execute(text("SELECT 1"))
            return eng
        except Exception:
            print("PostgreSQL unavailable, using SQLite (./climbing.db)")
            return create_engine(SQLITE_URL, connect_args={"check_same_thread": False})
    return create_engine(url, connect_args={"check_same_thread": False} if "sqlite" in url else {})


engine = _get_engine()
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()