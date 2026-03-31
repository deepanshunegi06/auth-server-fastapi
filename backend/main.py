"""
FastAPI application entry point for AuthCore API.

This module configures the FastAPI application, CORS middleware,
database initialization, and route registration.
"""
from datetime import datetime, timezone
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import os
from database import Base, engine
from routes.auth_routes import router as auth_router
from routes.protected_routes import router as protected_router

# Application metadata
APP_TITLE = "AuthCore API"
APP_VERSION = "1.0.0"
APP_DESCRIPTION = "University Deeptech — JWT Authentication Server"

app = FastAPI(
    title=APP_TITLE,
    description=APP_DESCRIPTION,
    version=APP_VERSION,
)

# CORS configuration - allowed origins for cross-origin requests
CORS_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://auth-server-fastapi.vercel.app",
]

# Add custom frontend URL from environment if configured
frontend_url = os.getenv("FRONTEND_URL")
if frontend_url:
    CORS_ORIGINS.append(frontend_url)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup() -> None:
    """
    Initialize database tables on application startup.
    
    Creates all tables defined in models if they don't exist.
    This runs once when the FastAPI app starts.
    """
    Base.metadata.create_all(bind=engine)


app.include_router(auth_router)
app.include_router(protected_router)


@app.get("/health")
def health_check() -> dict:
    """
    Health check endpoint for monitoring and load balancers.
    
    Returns basic application health status and metadata.
    """
    return {
        "status": "healthy",
        "service": APP_TITLE,
        "version": APP_VERSION,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }


@app.get("/")
def root() -> dict:
    """
    Health check endpoint returning API status information.

    Returns:
        dict: API name, version, status, and docs URL.
    """
    return {
        "name": APP_TITLE,
        "version": APP_VERSION,
        "status": "running",
        "docs": "/docs",
    }


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
