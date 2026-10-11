import hashlib
import hmac
import logging
import os
import secrets
import sqlite3
from datetime import datetime, timedelta, timezone
from urllib.parse import urlsplit

from argon2 import PasswordHasher
from argon2.exceptions import (
    HashingError,
    InvalidHashError,
    VerificationError,
    VerifyMismatchError,
)
from fastapi import Depends, HTTPException, Request, status

from database import open_connection, transaction


logger = logging.getLogger(__name__)

SESSION_COOKIE_NAME = "studygen_session"
SESSION_TTL = timedelta(hours=12)
PASSWORD_HASHER = PasswordHasher()
_DUMMY_PASSWORD_HASH = PASSWORD_HASHER.hash(
    "not-a-real-user-password-used-for-timing"
)


def _database_error() -> HTTPException:
    logger.exception("Authentication storage operation failed")
    return HTTPException(
        status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
        detail="Authentication is temporarily unavailable.",
    )


def _hash_token(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def frontend_origins() -> list[str]:
    configured = os.getenv("FRONTEND_URL", "http://localhost:5173").rstrip("/")
    origins = [configured]
    if configured in {
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    }:
        origins = [
            "http://localhost:5173",
            "http://127.0.0.1:5173",
        ]
    return origins


def validate_request_origin(request: Request) -> None:
    origin = request.headers.get("origin")
    if origin not in frontend_origins():
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Request origin is not allowed.",
        )


def session_cookie_secure() -> bool:
    configured = os.getenv("SESSION_COOKIE_SECURE")
    if configured is not None:
        normalized = configured.strip().lower()
        if normalized in {"true", "1", "yes"}:
            return True
        if normalized in {"false", "0", "no"}:
            return False
        raise RuntimeError("SESSION_COOKIE_SECURE must be true or false.")
    return urlsplit(
        os.getenv("FRONTEND_URL", "http://localhost:5173")
    ).scheme == "https"


def session_cookie_samesite() -> str:
    configured = os.getenv("SESSION_COOKIE_SAMESITE", "lax").strip().lower()
    if configured not in {"lax", "none"}:
        raise RuntimeError("SESSION_COOKIE_SAMESITE must be lax or none.")
    if configured == "none" and not session_cookie_secure():
        raise RuntimeError(
            "SESSION_COOKIE_SAMESITE=none requires SESSION_COOKIE_SECURE=true."
        )
    return configured


def set_session_cookie(response, token: str) -> None:
    response.set_cookie(
        key=SESSION_COOKIE_NAME,
        value=token,
        httponly=True,
        secure=session_cookie_secure(),
        samesite=session_cookie_samesite(),
        max_age=int(SESSION_TTL.total_seconds()),
        path="/",
    )


def clear_session_cookie(response) -> None:
    response.delete_cookie(
        key=SESSION_COOKIE_NAME,
        httponly=True,
        secure=session_cookie_secure(),
        samesite=session_cookie_samesite(),
        path="/",
    )


def create_session(connection, user_id: str) -> tuple[str, str]:
    token = secrets.token_urlsafe(32)
    csrf_token = secrets.token_urlsafe(32)
    now = datetime.now(timezone.utc)
    connection.execute(
        """
        INSERT INTO sessions (token_hash, user_id, csrf_token, created_at, expires_at)
        VALUES (?, ?, ?, ?, ?)
        """,
        (
            _hash_token(token),
            user_id,
            csrf_token,
            now.isoformat(),
            (now + SESSION_TTL).isoformat(),
        ),
    )
    return token, csrf_token


def public_user(row) -> dict[str, str]:
    return {"id": row["id"], "email": row["email"]}


def get_current_user(request: Request) -> dict[str, str]:
    token = request.cookies.get(SESSION_COOKIE_NAME)
    if not token or len(token) > 256:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required.",
        )

    token_hash = _hash_token(token)
    try:
        with open_connection() as connection:
            row = connection.execute(
                """
                SELECT users.id, users.email, sessions.csrf_token,
                       sessions.token_hash, sessions.expires_at
                FROM sessions
                JOIN users ON users.id = sessions.user_id
                WHERE sessions.token_hash = ?
                """,
                (token_hash,),
            ).fetchone()
    except (sqlite3.Error, OSError) as error:
        logger.exception("Authentication storage read failed")
        raise _database_error() from error

    if row is None or not hmac.compare_digest(row["token_hash"], token_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required.",
        )

    if datetime.fromisoformat(row["expires_at"]) <= datetime.now(timezone.utc):
        try:
            with transaction() as connection:
                connection.execute(
                    "DELETE FROM sessions WHERE token_hash = ?",
                    (token_hash,),
                )
        except (sqlite3.Error, OSError) as error:
            logger.exception("Expired session cleanup failed")
            raise _database_error() from error
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session expired. Please sign in again.",
        )

    request.state.session_token_hash = token_hash
    request.state.csrf_token = row["csrf_token"]
    return {"id": row["id"], "email": row["email"]}


def require_csrf(
    request: Request,
    user: dict[str, str] = Depends(get_current_user),
) -> dict[str, str]:
    supplied = request.headers.get("X-CSRF-Token", "")
    expected = getattr(request.state, "csrf_token", "")
    if not supplied or not hmac.compare_digest(supplied, expected):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="A valid CSRF token is required.",
        )
    return user


def verify_password(password: str, password_hash: str) -> bool:
    try:
        return PASSWORD_HASHER.verify(password_hash, password)
    except (VerifyMismatchError, InvalidHashError, VerificationError):
        return False
    except HashingError:
        logger.exception("Password verification failed")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Authentication is temporarily unavailable.",
        )


def dummy_password_check(password: str) -> None:
    verify_password(password, _DUMMY_PASSWORD_HASH)
