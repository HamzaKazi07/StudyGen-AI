import logging
import hashlib
import sqlite3
import uuid
from datetime import datetime, timezone
from threading import Lock
from collections import defaultdict, deque

from argon2.exceptions import HashingError
from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from pydantic import BaseModel, EmailStr, Field

from database import open_connection, transaction
from services.auth import (
    PASSWORD_HASHER,
    SESSION_COOKIE_NAME,
    clear_session_cookie,
    create_session,
    dummy_password_check,
    get_current_user,
    public_user,
    require_csrf,
    set_session_cookie,
    validate_request_origin,
    verify_password,
)


logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/auth", tags=["Authentication"])

AUTH_ATTEMPTS_PER_WINDOW = 10
AUTH_WINDOW_SECONDS = 60
_attempts = defaultdict(deque)
_attempts_lock = Lock()


class Credentials(BaseModel):
    email: EmailStr
    password: str = Field(min_length=12, max_length=128)


class LoginCredentials(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=128)


def check_auth_rate_limit(client_ip: str) -> bool:
    now = datetime.now(timezone.utc).timestamp()
    with _attempts_lock:
        attempts = _attempts[client_ip]
        while attempts and now - attempts[0] >= AUTH_WINDOW_SECONDS:
            attempts.popleft()
        if len(attempts) >= AUTH_ATTEMPTS_PER_WINDOW:
            return False
        attempts.append(now)
        return True


def _check_auth_request(request: Request) -> None:
    validate_request_origin(request)
    client_ip = request.client.host if request.client else "unknown"
    if not check_auth_rate_limit(client_ip):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many authentication attempts. Please wait and try again.",
        )


def _storage_unavailable(error: Exception) -> HTTPException:
    logger.exception("Authentication storage operation failed")
    return HTTPException(
        status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
        detail="Authentication is temporarily unavailable.",
    )


@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(credentials: Credentials, request: Request, response: Response):
    _check_auth_request(request)
    user_id = str(uuid.uuid4())
    email = str(credentials.email).strip().lower()

    try:
        password_hash = PASSWORD_HASHER.hash(credentials.password)
        with transaction() as connection:
            connection.execute(
                """
                INSERT INTO users (id, email, password_hash, created_at)
                VALUES (?, ?, ?, ?)
                """,
                (
                    user_id,
                    email,
                    password_hash,
                    datetime.now(timezone.utc).isoformat(),
                ),
            )
            token, csrf_token = create_session(connection, user_id)
            user = connection.execute(
                "SELECT id, email FROM users WHERE id = ?",
                (user_id,),
            ).fetchone()
    except sqlite3.IntegrityError as error:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with that email already exists.",
        ) from error
    except (sqlite3.Error, OSError) as error:
        raise _storage_unavailable(error) from error
    except HashingError as error:
        logger.exception("Password hashing failed")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Account creation is temporarily unavailable.",
        ) from error

    set_session_cookie(response, token)
    return {"user": public_user(user), "csrf_token": csrf_token}


@router.post("/login")
def login(credentials: LoginCredentials, request: Request, response: Response):
    _check_auth_request(request)
    email = str(credentials.email).strip().lower()

    try:
        with open_connection() as connection:
            user_row = connection.execute(
                "SELECT id, email, password_hash FROM users WHERE email = ?",
                (email,),
            ).fetchone()
    except (sqlite3.Error, OSError) as error:
        raise _storage_unavailable(error) from error

    password_hash = user_row["password_hash"] if user_row else None
    if password_hash is None:
        dummy_password_check(credentials.password)
    elif not verify_password(credentials.password, password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )

    if user_row is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )

    try:
        with transaction() as connection:
            existing_token = request.cookies.get(SESSION_COOKIE_NAME)
            if existing_token:
                connection.execute(
                    "DELETE FROM sessions WHERE token_hash = ?",
                    (
                        hashlib.sha256(existing_token.encode("utf-8")).hexdigest(),
                    ),
                )
            token, csrf_token = create_session(connection, user_row["id"])
    except (sqlite3.Error, OSError) as error:
        raise _storage_unavailable(error) from error

    set_session_cookie(response, token)
    return {
        "user": public_user(user_row),
        "csrf_token": csrf_token,
    }


@router.get("/me")
def current_session(
    request: Request,
    user: dict[str, str] = Depends(get_current_user),
):
    return {
        "user": user,
        "csrf_token": request.state.csrf_token,
    }


@router.post("/logout")
def logout(
    request: Request,
    response: Response,
    user: dict[str, str] = Depends(require_csrf),
):
    del user
    token_hash = request.state.session_token_hash
    try:
        with transaction() as connection:
            connection.execute(
                "DELETE FROM sessions WHERE token_hash = ?",
                (token_hash,),
            )
    except (sqlite3.Error, OSError) as error:
        raise _storage_unavailable(error) from error

    clear_session_cookie(response)
    return {"success": True}
