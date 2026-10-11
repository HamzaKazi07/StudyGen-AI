import json
import logging
import time
from collections import defaultdict

from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

from routes.documents import get_processed_document
from services.auth import get_current_user, require_csrf
from services.ai_service import (
    GeminiConfigurationError,
    MAX_DOCUMENT_CONTEXT_CHARS,
    stream_gemini,
)


router = APIRouter(
    prefix="/api/tutor",
    tags=["AI Tutor"]
)

logger = logging.getLogger(__name__)


# ---------------------------------------------------------
# Request Models
# ---------------------------------------------------------

class ChatMessage(BaseModel):
    role: str
    text: str


class TutorRequest(BaseModel):
    question: str = Field(
        ...,
        min_length=1,
        max_length=4000
    )

    history: list[ChatMessage] = Field(
        default_factory=list
    )

    document_id: str | None = None


# ---------------------------------------------------------
# Simple In-Memory Rate Limiter
# ---------------------------------------------------------

request_log = defaultdict(list)

MAX_REQUESTS = 20
TIME_WINDOW = 60


def check_rate_limit(client_ip: str):

    current_time = time.time()

    # Remove requests older than 60 seconds
    request_log[client_ip] = [
        request_time
        for request_time in request_log[client_ip]
        if current_time - request_time < TIME_WINDOW
    ]

    # Check limit
    if len(request_log[client_ip]) >= MAX_REQUESTS:
        return False

    request_log[client_ip].append(current_time)

    return True


# ---------------------------------------------------------
# SSE Helper
# ---------------------------------------------------------

def create_sse_event(event_type: str, data):

    return (
        f"event: {event_type}\n"
        f"data: {json.dumps(data, ensure_ascii=False)}\n\n"
    )


# ---------------------------------------------------------
# Ask Tutor
# ---------------------------------------------------------

@router.post("/ask")
def ask_tutor(
    request: TutorRequest,
    http_request: Request,
):

    # -----------------------------------------------------
    # Get Client IP
    # -----------------------------------------------------

    client_ip = (
        http_request.client.host
        if http_request.client
        else "unknown"
    )


    # -----------------------------------------------------
    # Rate Limit
    # -----------------------------------------------------

    if not check_rate_limit(client_ip):

        raise HTTPException(
            status_code=429,
            detail="Too many requests. Please wait a moment and try again."
        )


    # -----------------------------------------------------
    # Clean Question
    # -----------------------------------------------------

    question = request.question.strip()


    # -----------------------------------------------------
    # Validate Question
    # -----------------------------------------------------

    if not question:

        raise HTTPException(
            status_code=400,
            detail="Please enter a question."
        )


    # -----------------------------------------------------
    # Convert History
    # -----------------------------------------------------

    history = [
        {
            "role": message.role,
            "text": message.text
        }
        for message in request.history
    ]


    # Keep latest 20 messages
    history = history[-20:]

    document_context = None
    document_name = None
    document_context_truncated = False
    document_context_total_chars = 0

    if request.document_id is not None:
        user = require_csrf(
            http_request,
            get_current_user(http_request),
        )

        document, document_text = get_processed_document(
            request.document_id,
            owner_id=user["id"],
            require_text=True
        )

        document_name = document["name"]
        document_context_total_chars = len(document_text)
        document_context_truncated = (
            document_context_total_chars > MAX_DOCUMENT_CONTEXT_CHARS
        )
        document_context = document_text[
            :MAX_DOCUMENT_CONTEXT_CHARS
        ]


    # -----------------------------------------------------
    # Streaming Generator
    # -----------------------------------------------------

    def generate():

        try:

            # Tell frontend streaming has started
            start_data = {
                "success": True
            }

            if request.document_id is not None:
                start_data.update(
                    {
                        "document_id": request.document_id,
                        "document_name": document_name,
                        "document_context_truncated": (
                            document_context_truncated
                        ),
                        "document_context_chars": len(document_context),
                        "document_extracted_chars": (
                            document_context_total_chars
                        ),
                    }
                )

            yield create_sse_event(
                "start",
                start_data
            )


            # Stream Gemini response
            for chunk in stream_gemini(
                question=question,
                history=history,
                document_context=document_context,
                document_context_truncated=document_context_truncated,
                document_context_total_chars=document_context_total_chars,
            ):

                yield create_sse_event(
                    "chunk",
                    {
                        "text": chunk
                    }
                )


            # Tell frontend streaming is complete
            yield create_sse_event(
                "done",
                {
                    "success": True
                }
            )


        except GeminiConfigurationError:
            yield create_sse_event(
                "error",
                {
                    "message": (
                        "The AI Tutor is not configured. "
                        "Please contact the administrator."
                    )
                },
            )

        except Exception as e:

            logger.error(
                "Tutor response generation failed (%s)",
                type(e).__name__,
            )


            # Safe error for frontend
            yield create_sse_event(
                "error",
                {
                    "message": (
                        "The AI service is temporarily "
                        "unavailable. Please try again."
                    )
                }
            )


    # -----------------------------------------------------
    # Return Streaming Response
    # -----------------------------------------------------

    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )