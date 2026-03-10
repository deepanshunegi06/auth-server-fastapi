"""
Database configuration and session management for AuthCore API.

This module configures SQLAlchemy with SQLite for local development.
The get_db dependency provides request-scoped database sessions.
"""
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

SQLALCHEMY_DATABASE_URL = "sqlite:///./auth.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


# Dependency for route handlers
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
