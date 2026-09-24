import json
import time
from collections import defaultdict

from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

from services.ai_service import stream_gemini


router = APIRouter(
    prefix="/api/tutor",
    tags=["AI Tutor"]
)


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
    http_request: Request
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


    # -----------------------------------------------------
    # Streaming Generator
    # -----------------------------------------------------

    def generate():

        try:

            # Tell frontend streaming has started
            yield create_sse_event(
                "start",
                {
                    "success": True
                }
            )


            # Stream Gemini response
            for chunk in stream_gemini(
                question=question,
                history=history
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


        except Exception as e:

            # Full error only in backend terminal
            print(
                "Gemini Streaming Error:",
                repr(e)
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