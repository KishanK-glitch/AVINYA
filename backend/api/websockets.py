"""
api/websockets.py
-----------------
WebSocket endpoint that drives the real-time adaptive-learning loop.
"""

import json
import logging

from fastapi import APIRouter, WebSocket, WebSocketDisconnect, status

from core.mongo_client import get_sessions_collection

logger = logging.getLogger(__name__)

# 1. CORRECT IMPORT: Pull the compiled graph from Kishan's ML engine
try:
    from ml_engine.agents.orchestrator import app_engine
    _ENGINE_AVAILABLE = True
except ImportError:
    _ENGINE_AVAILABLE = False
    logger.warning("ml_engine.agents.orchestrator not found – running in STUB mode.")

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
    await websocket.accept()

    # ---- Validate session ----
    session = await _load_session(session_id)
    if session is None:
        await _send_json(websocket, {"type": "error", "content": "Session not found."})
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

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

            # ---- Delegate to Kishan's ML Engine ----
            if _ENGINE_AVAILABLE:
                # Build the state payload required by the LangGraph engine
                # WARNING TO LISHAN: You MUST ensure 'syllabus_context' is pulled from Ananya's DB 
                # and exists in this session object, otherwise the Examiner will hallucinate.
                engine_state = {
                    "session_id": session_id,
                    "current_node_id": session.get("current_node_id", "node_04"),
                    "node_topic": session.get("topic", "Unknown Topic"),
                    "node_syllabus_context": session.get("syllabus_context", "Missing ground truth"), 
                    "user_response": user_content,
                    "chat_history": []
                }

                # Run the LangGraph engine asynchronously so it doesn't block FastAPI
                final_state = await app_engine.ainvoke(engine_state)

                # Route the response back to the frontend based on the Evaluator's decision
                if final_state.get("is_mastered"):
                    await _send_json(websocket, {
                        "type": "agent_reply",
                        "agent": "evaluator",
                        "content": "Correct. Node mastered.",
                        "status": "passed" # Frontend should turn node GREEN
                    })
                else:
                    await _send_json(websocket, {
                        "type": "agent_reply",
                        "agent": "curator",
                        "content": final_state.get("rag_payload", "Failed. Please review the material."),
                        "status": "failed" # Frontend should turn node RED
                    })

            else:
                # Stub: echo back if engine isn't mounted
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