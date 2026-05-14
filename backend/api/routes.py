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
# ADD THESE TO THE TOP
from fastapi import UploadFile, File
from fastapi.responses import JSONResponse
import asyncio

# ... keep existing code ...

# ---------------------------------------------------------------------------
# POST /api/upload_syllabus (HACKATHON MOCK)
# ---------------------------------------------------------------------------
@router.post("/upload_syllabus", tags=["REST"])
async def upload_syllabus(file: UploadFile = File(...)):
    """
    HACKATHON MOCK: Simulates PDF processing and returns a GNN node graph.
    """
    await asyncio.sleep(1.5) # The "Processing" delay for realism
    
    mock_graph_data = {
        "nodes": [
            {"id": "1", "position": {"x": 250, "y": 50}, "data": {"label": "Neural Networks", "status": "mastered"}},
            {"id": "2", "position": {"x": 100, "y": 150}, "data": {"label": "CNN Architecture", "status": "mastered"}},
            {"id": "3", "position": {"x": 400, "y": 150}, "data": {"label": "Transformers", "status": "pending"}},
            {"id": "4", "position": {"x": 250, "y": 250}, "data": {"label": "Attention Mechanism", "status": "unlearned"}}
        ],
        "edges": [
            {"id": "e1-2", "source": "1", "target": "2", "animated": True},
            {"id": "e1-3", "source": "1", "target": "3", "animated": True},
            {"id": "e2-4", "source": "2", "target": "4"}
        ]
    }
    return JSONResponse(content=mock_graph_data)
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
