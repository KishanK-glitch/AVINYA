from typing import TypedDict, List, Annotated
import operator

class SessionState(TypedDict, total=False):
    session_id: str
    current_node_id: str
    node_topic: str
    chat_history: Annotated[List[dict], operator.add]
    
    examiner_prompt: str
    expected_concept: str
    user_response: str
    
    eval_score: float
    is_mastered: bool
    
    rag_payload: str
    error_logs: str