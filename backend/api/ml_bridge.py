import json

from ml_engine.agents.state import SessionState
from ml_engine.agents.agent_b_evaluator import node_evaluator
from ml_engine.agents.agent_c_curator import node_curator

async def process_user_answer(session_id: str, active_node_id: str, topic: str, user_text: str, question: str, expected_concept: str):
    """
    The bridge between Lishan's WebSocket and Kishan's ML Engine.
    Yields JSON strings to be sent directly to the frontend.
    """
    
    # 1. Construct the incoming state
    current_state: SessionState = {
        "session_id": session_id,
        "current_node_id": active_node_id,
        "node_topic": topic,
        "examiner_prompt": question,
        "expected_concept": expected_concept,
        "user_response": user_text,
        "chat_history": []
    }
    
    # 2. Evaluate the answer
    eval_result = node_evaluator(current_state)
    current_state.update(eval_result)
    
    # 3. Check for API crashes (Kishan's fail-safe)
    if current_state.get("agent_error"):
        yield json.dumps({
            "type": "NODE_STATE_UPDATE",
            "node_id": active_node_id,
            "state": "error",
            "content": current_state.get("error_message", "System failure during evaluation.")
        })
        # Note: We proceed to the Curator below to try and fetch RAG material anyway.
    
    # 4. Handle Normal Pass
    elif eval_result.get("is_mastered"):
        yield json.dumps({
            "type": "NODE_STATE_UPDATE",
            "node_id": active_node_id,
            "state": "mastered",
            "content": f"Correct. Mastery score: {eval_result.get('eval_score', 1.0)}"
        })
        return # End process, do not trigger RAG
        
    # 5. Handle Normal Fail
    else:
        yield json.dumps({
            "type": "NODE_STATE_UPDATE",
            "node_id": active_node_id,
            "state": "failing",
            "content": "Incorrect. Fetching targeted study material..."
        })
        
    # 6. Trigger Agent C (Curator) if they failed or the API errored
    curator_result = node_curator(current_state)
    
    # Send the final RAG payload
    yield json.dumps({
        "type": "RAG_CONTENT_INJECTION",
        "node_id": active_node_id,
        "content": curator_result.get("rag_payload", "Could not fetch study material.")
    })