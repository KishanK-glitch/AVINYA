"""
api/websockets.py
-----------------
WebSocket endpoint that drives the real-time adaptive-learning loop.

Flow
----
1. Client connects to  GET /ws/{session_id}
2. Server loads the session from MongoDB.
3. Server delegates every incoming message to the Orchestrator (Kishan's module).
4. Orchestrator returns a reply which is forwarded back to the client.
5. The loop continues until the client disconnects or the session ends.

Imports
-------
The orchestrator is imported from  ml_engine/agents/orchestrator.py
(resolved via the Python path set in the project root).
"""

import json
import logging

from fastapi import APIRouter, WebSocket, WebSocketDisconnect, status

from core.mongo_client import get_sessions_collection

logger = logging.getLogger(__name__)

# Lazy import so the server still starts even if ml_engine isn't installed yet.
try:
    from ml_engine.agents.orchestrator import Orchestrator  # type: ignore
    _ORCHESTRATOR_AVAILABLE = True
except ImportError:
    _ORCHESTRATOR_AVAILABLE = False
    logger.warning(
        "ml_engine.agents.orchestrator not found – running in STUB mode."
    )

router = APIRouter()


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

async def _load_session(session_id: str) -> dict | None:
    """Fetch the session document from MongoDB."""
    collection = await get_sessions_collection()
    return await collection.find_one({"session_id": session_id}, {"_id": 0})


async def _send_json(ws: WebSocket, payload: dict) -> None:
    await ws.send_text(json.dumps(payload))


# ---------------------------------------------------------------------------
# GET /ws/{session_id}
# ---------------------------------------------------------------------------
@router.websocket("/ws/{session_id}")
async def websocket_endpoint(websocket: WebSocket, session_id: str):
    """
    Main WebSocket loop.

    Message protocol (JSON)
    -----------------------
    Client → Server : { "type": "user_message", "content": "..." }
    Server → Client : { "type": "agent_reply",  "content": "...", "agent": "examiner|evaluator|curator" }
    Server → Client : { "type": "error",         "content": "..." }
    Server → Client : { "type": "session_end",   "content": "Session complete." }
    """
    await websocket.accept()

    # ---- Validate session ----
    session = await _load_session(session_id)
    if session is None:
        await _send_json(websocket, {"type": "error", "content": "Session not found."})
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    # ---- Instantiate orchestrator ----
    if _ORCHESTRATOR_AVAILABLE:
        orchestrator = Orchestrator(session=session)
    else:
        orchestrator = None  # Stub mode

    await _send_json(
        websocket,
        {
            "type": "system",
            "content": f"Session {session_id} connected. Topic: {session.get('topic')}",
        },
    )

    # ---- Main loop ----
    try:
        while True:
            raw = await websocket.receive_text()

            try:
                message = json.loads(raw)
            except json.JSONDecodeError:
                await _send_json(websocket, {"type": "error", "content": "Invalid JSON."})
                continue

            if message.get("type") != "user_message":
                await _send_json(
                    websocket,
                    {"type": "error", "content": "Unknown message type. Expected 'user_message'."},
                )
                continue

            user_content: str = message.get("content", "")

            # ---- Delegate to Orchestrator ----
            if orchestrator is not None:
                # Orchestrator.handle() is expected to be an async generator
                # that yields partial or complete replies from each agent.
                async for chunk in orchestrator.handle(user_input=user_content):
                    await _send_json(websocket, chunk)
            else:
                # Stub: echo back with a placeholder agent reply
                await _send_json(
                    websocket,
                    {
                        "type": "agent_reply",
                        "agent": "stub",
                        "content": f"[STUB] Echo: {user_content}",
                    },
                )

    except WebSocketDisconnect:
        logger.info("Client disconnected – session %s", session_id)
    except Exception as exc:
        logger.exception("Unexpected error in WebSocket loop: %s", exc)
        await _send_json(websocket, {"type": "error", "content": str(exc)})
