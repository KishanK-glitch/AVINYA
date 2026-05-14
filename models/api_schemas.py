"""
models/api_schemas.py
---------------------
Pydantic models that validate *incoming payloads from the UI* and
*outgoing HTTP responses*.

These models are used exclusively at the API boundary (routes.py).
They are intentionally separate from db_schemas.py so that the public
API shape can evolve independently of the database document shape.
"""

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field, field_validator


# ---------------------------------------------------------------------------
# POST /api/session/start  →  Request
# ---------------------------------------------------------------------------

class StartSessionRequest(BaseModel):
    """Payload sent by the frontend to create a new learning session."""

    user_id: str = Field(
        ...,
        min_length=1,
        max_length=128,
        description="Unique identifier for the learner (e.g. Clerk user ID).",
        examples=["user_2abc123"],
    )
    topic: str = Field(
        ...,
        min_length=1,
        max_length=256,
        description="The subject or concept the learner wants to study.",
        examples=["Asymptotic Complexity (Big-O)"],
    )
    difficulty: Literal["beginner", "intermediate", "advanced"] = Field(
        default="beginner",
        description="Requested difficulty level for the session.",
    )

    @field_validator("topic")
    @classmethod
    def strip_topic(cls, v: str) -> str:
        return v.strip()


# ---------------------------------------------------------------------------
# POST /api/session/start  →  Response
# ---------------------------------------------------------------------------

class StartSessionResponse(BaseModel):
    """Returned after a session is successfully created."""

    session_id: str = Field(
        ...,
        description="UUID to use when opening the WebSocket connection.",
        examples=["550e8400-e29b-41d4-a716-446655440000"],
    )
    created_at: datetime = Field(
        ...,
        description="UTC timestamp of session creation.",
    )


# ---------------------------------------------------------------------------
# WebSocket message models (for documentation / validation on the server side)
# ---------------------------------------------------------------------------

class WsIncomingMessage(BaseModel):
    """Schema for messages sent by the client over the WebSocket."""

    type: Literal["user_message"] = Field(
        ...,
        description="Message discriminator. Only 'user_message' is accepted.",
    )
    content: str = Field(
        ...,
        min_length=1,
        max_length=4_096,
        description="The learner's free-text input.",
    )


class WsOutgoingMessage(BaseModel):
    """Schema for messages sent by the server over the WebSocket."""

    type: Literal["agent_reply", "system", "error", "session_end"]
    agent: str | None = Field(
        default=None,
        description="Which agent produced this reply (examiner / evaluator / curator).",
    )
    content: str = Field(..., description="Human-readable message content.")
