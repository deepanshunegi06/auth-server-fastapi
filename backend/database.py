"""
Database configuration and session management for AuthCore API.

This module configures SQLAlchemy with SQLite for local development.
The get_db dependency provides request-scoped database sessions.
"""
import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Allow database URL override via environment variable
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./auth.db")

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


# Dependency for route handlers
def get_db():
    """
    Dependency that provides a database session for each request.

    Yields:
        Session: SQLAlchemy database session.

    Note:
        The session is automatically closed after the request completes,
        ensuring proper resource cleanup even if an exception occurs.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
