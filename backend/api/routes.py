"""
api/routes.py
-------------
HTTP REST endpoints.

Endpoints
---------
POST /api/session/start
    - Accepts a StartSessionRequest payload from the UI.
    - Creates a new learning session document in MongoDB.
    - Returns the generated session_id so the frontend can
      open a WebSocket connection on /ws/{session_id}.
"""

import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException, status

from backend.core.mongo_client import get_sessions_collection
from backend.models.api_schemas import StartSessionRequest, StartSessionResponse
from backend.models.db_schemas import SessionDocument

router = APIRouter()


# ---------------------------------------------------------------------------
# POST /api/session/start
# ---------------------------------------------------------------------------
@router.post(
    "/session/start",
    response_model=StartSessionResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new adaptive learning session",
)
async def start_session(payload: StartSessionRequest) -> StartSessionResponse:
    """
    Creates a new session document in MongoDB and returns a unique session_id
    that the client uses to upgrade to a WebSocket connection.
    """
    session_id = str(uuid.uuid4())
    now = datetime.now(tz=timezone.utc)

    doc = SessionDocument(
        session_id=session_id,
        user_id=payload.user_id,
        topic=payload.topic,
        difficulty=payload.difficulty,
        created_at=now,
        updated_at=now,
        state="idle",
        history=[],
    )

    try:
        collection = await get_sessions_collection()
        await collection.insert_one(doc.model_dump())
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to persist session: {exc}",
        )

    return StartSessionResponse(session_id=session_id, created_at=now)
