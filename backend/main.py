from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Load environment before importing modules that inspect configuration.
load_dotenv()

from database import initialize_database
from routes.auth import router as auth_router
from services.auth import (
    frontend_origins,
    session_cookie_samesite,
    session_cookie_secure,
)
from routes.tutor import router as tutor_router
from routes.documents import router as documents_router


@asynccontextmanager
async def lifespan(_app: FastAPI):
    initialize_database()
    session_cookie_secure()
    session_cookie_samesite()
    yield


app = FastAPI(
    title="StudyGen API",
    description="Backend API for StudyGen AI",
    version="1.0.0",
    lifespan=lifespan,
)


# ---------------------------------------------------------
# CORS
# ---------------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=frontend_origins(),
    allow_credentials=True,
    allow_methods=["GET", "POST", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Accept", "X-CSRF-Token"],
)


# ---------------------------------------------------------
# Routes
# ---------------------------------------------------------

app.include_router(tutor_router)

app.include_router(documents_router)

app.include_router(auth_router)


# ---------------------------------------------------------
# Root
# ---------------------------------------------------------

@app.get("/")
def root():

    return {
        "message": "StudyGen API is running"
    }


# ---------------------------------------------------------
# Health Check
# ---------------------------------------------------------

@app.get("/health")
def health():

    return {
        "status": "ok"
    }