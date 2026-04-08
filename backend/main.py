from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import os
from database import Base, engine
from routes.auth_routes import router as auth_router
from routes.protected_routes import router as protected_router

app = FastAPI(
    title="AuthCore API",
    description="University Deeptech — JWT Authentication Server",
    version="1.0.0",
)

# CORS origins - allow localhost and production
origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://auth-server-fastapi.vercel.app",
]

# Add custom frontend URL if set
frontend_url = os.getenv("FRONTEND_URL")
if frontend_url:
    origins.append(frontend_url)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup():
    Base.metadata.create_all(bind=engine)


app.include_router(auth_router)
app.include_router(protected_router)


@app.get("/")
def root():
    return {
        "name": "AuthCore API",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs",
    }


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
