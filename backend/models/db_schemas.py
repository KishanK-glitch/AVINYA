"""
models/db_schemas.py
--------------------
Pydantic models that validate the structure of *MongoDB documents*.

These are used when:
  - Inserting a new document  (serialize with .model_dump())
  - Reading a document back   (validate with model_validate(doc))

They are intentionally separate from api_schemas.py so that internal
database shapes can be richer / different from the public API.
"""

from datetime import datetime
from typing import Any, Literal

from pydantic import BaseModel, Field


# ---------------------------------------------------------------------------
# Sub-document: a single turn in the conversation history
# ---------------------------------------------------------------------------

class HistoryTurn(BaseModel):
    """Represents one round-trip in the adaptive learning dialogue."""

    role: Literal["user", "examiner", "evaluator", "curator", "system"] = Field(
        ...,
        description="Who produced this message.",
    )
    content: str = Field(..., description="The message text.")
    timestamp: datetime = Field(
        ...,
        description="UTC timestamp when the message was produced.",
    )
    metadata: dict[str, Any] = Field(
        default_factory=dict,
        description="Optional per-turn metadata (scores, retrieved docs, etc.).",
    )


# ---------------------------------------------------------------------------
# Top-level: a learning session document
# ---------------------------------------------------------------------------

class SessionDocument(BaseModel):
    """
    Full MongoDB document stored in the `sessions` collection.

    _id is managed by MongoDB and excluded here; session_id is our
    application-level UUID used as the primary business key.
    """

    session_id: str = Field(..., description="UUID that also serves as the WS route key.")
    user_id: str = Field(..., description="Learner identifier.")
    topic: str = Field(..., description="Subject being studied.")
    difficulty: Literal["beginner", "intermediate", "advanced"] = Field(
        default="beginner"
    )
    state: Literal["idle", "examining", "evaluating", "curating", "complete"] = Field(
        default="idle",
        description="Current state of the multi-agent state machine.",
    )
    history: list[HistoryTurn] = Field(
        default_factory=list,
        description="Ordered list of all dialogue turns in this session.",
    )
    created_at: datetime = Field(..., description="UTC creation timestamp.")
    updated_at: datetime = Field(..., description="UTC last-update timestamp.")
    extra: dict[str, Any] = Field(
        default_factory=dict,
        description="Escape hatch for ad-hoc fields without schema changes.",
    )


# ---------------------------------------------------------------------------
# Top-level: a knowledge-chunk document (for RAG source tracking)
# ---------------------------------------------------------------------------

class KnowledgeChunkDocument(BaseModel):
    """
    Represents a single chunk of source material stored in MongoDB alongside
    its Qdrant vector ID for cross-reference during RAG retrieval.
    """

    chunk_id: str = Field(..., description="Matches the Qdrant point ID.")
    source: str = Field(..., description="Origin of the content (URL, filename, etc.).")
    topic: str = Field(..., description="Topic tag used for filtered retrieval.")
    content: str = Field(..., description="Raw text of the chunk.")
    token_count: int = Field(default=0, description="Approximate token length.")
    created_at: datetime = Field(..., description="UTC ingestion timestamp.")
