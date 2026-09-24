import os
from typing import List, Dict, Generator

from google import genai
from google.genai import types
from dotenv import load_dotenv


# ---------------------------------------------------------
# Load environment variables
# ---------------------------------------------------------

load_dotenv()


# ---------------------------------------------------------
# Gemini API Key
# ---------------------------------------------------------

api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    raise ValueError("GEMINI_API_KEY is not set in .env")


# ---------------------------------------------------------
# Create Gemini client
# ---------------------------------------------------------

client = genai.Client(api_key=api_key)


# ---------------------------------------------------------
# Gemini model
# ---------------------------------------------------------

MODEL_NAME = "gemini-3.5-flash-lite"


# ---------------------------------------------------------
# StudyGen AI Tutor system instruction
# ---------------------------------------------------------

SYSTEM_INSTRUCTION = """
You are StudyGen AI Tutor, an intelligent and friendly academic assistant.

Your job is to help students understand difficult topics clearly and simply.

Rules:

1. Explain concepts in simple language.
2. Give examples whenever useful.
3. For programming questions, explain the code clearly.
4. For mathematical problems, show the important steps.
5. For exam preparation, provide concise and easy-to-remember answers.
6. If the student asks a follow-up question, use the previous conversation context.
7. Do not unnecessarily repeat previous explanations.
8. If the student asks for a simpler explanation, simplify it.
9. Use headings, bullet points, numbered lists, and code blocks when useful.
10. Be accurate and educational.
11. If you are unsure about something, clearly say so.
12. Keep answers focused on the student's question.
"""


# ---------------------------------------------------------
# Prepare Gemini conversation contents
# ---------------------------------------------------------

def build_contents(
    question: str,
    history: List[Dict[str, str]] | None = None
):
    if history is None:
        history = []

    # Keep only the latest 20 messages
    history = history[-20:]

    contents = []

    for message in history:

        role = message.get("role")
        text = message.get("text", "").strip()

        if not text:
            continue

        if role == "user":

            contents.append(
                types.Content(
                    role="user",
                    parts=[
                        types.Part.from_text(text=text)
                    ]
                )
            )

        elif role == "assistant":

            contents.append(
                types.Content(
                    role="model",
                    parts=[
                        types.Part.from_text(text=text)
                    ]
                )
            )

    # Add current question
    contents.append(
        types.Content(
            role="user",
            parts=[
                types.Part.from_text(text=question)
            ]
        )
    )

    return contents


# ---------------------------------------------------------
# Streaming Gemini response
# ---------------------------------------------------------

def stream_gemini(
    question: str,
    history: List[Dict[str, str]] | None = None
) -> Generator[str, None, None]:

    contents = build_contents(
        question=question,
        history=history
    )

    try:

        response_stream = client.models.generate_content_stream(
            model=MODEL_NAME,
            contents=contents,
            config=types.GenerateContentConfig(
                system_instruction=SYSTEM_INSTRUCTION,
                max_output_tokens=1500,
            ),
        )

        received_text = False

        for chunk in response_stream:

            text = getattr(chunk, "text", None)

            if text:
                received_text = True
                yield text

        if not received_text:
            raise RuntimeError(
                "Gemini returned an empty response."
            )

    except Exception as e:

        print("Gemini Streaming Error:", repr(e))

        raise


# ---------------------------------------------------------
# Normal Gemini response
# ---------------------------------------------------------
# Kept for compatibility with any other part of the project
# that may still use ask_gemini().
# ---------------------------------------------------------

def ask_gemini(
    question: str,
    history: List[Dict[str, str]] | None = None
) -> str:

    answer_parts = []

    for chunk in stream_gemini(
        question=question,
        history=history
    ):
        answer_parts.append(chunk)

    answer = "".join(answer_parts)

    if not answer:
        raise RuntimeError(
            "Gemini returned an empty response."
        )

    return answer