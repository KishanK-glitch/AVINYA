import os
from dotenv import load_dotenv

# 1. THIS MUST BE THE ABSOLUTE FIRST THING THAT HAPPENS
# It loads the keys into memory so the agents can find them.
load_dotenv()

# 2. NOW you can import the engine and state, because the keys exist.
from agents.state import SessionState
from agents.orchestrator import app_engine

# 3. Import your agent functions for the manual mock testing
from agents.agent_a_examiner import node_examiner
from agents.agent_b_evaluator import node_evaluator
from agents.agent_c_curator import node_curator

def run_terminal_demo():
    print("\n--- CODE GIJUTSU: ML ENGINE LOCAL TEST ---")
    # ... the rest of your test code remains exactly the same
    # Mocking the initial state from the frontend
    # Mocking the initial state from the frontend + Ananya's database
    initial_state: SessionState = {
        "session_id": "test_123",
        "current_node_id": "node_04",
        "node_topic": "Scaled dot-product attention",
        # We are pasting Ananya's exact text for Node 04 here:
        "node_syllabus_context": "Scaled dot-product attention takes the dot products of the Queries and Keys and divides them by the square root of the dimension of the key vectors (sqrt(d_k)). This scaling factor is critical because it prevents the dot products from growing too large, which would push the subsequent softmax function into regions with extremely small gradients, effectively stalling the learning process.",
        "chat_history": []
    }
    print(f"\n[SYSTEM] Triggering Agent A (Examiner) for topic: {initial_state['node_topic']}...")
    
    # 1. Run Examiner
    state_after_exam = app_engine.invoke(initial_state, {"configurable": {"thread_id": "1"}}, debug=False)
    # LangGraph outputs state. We only want the subset for this node.
    # Note: Using direct function call simulation for the two-part WebSocket flow
    from agents.agent_a_examiner import node_examiner
    exam_result = node_examiner(initial_state)
    
    print("\n[EXAMINER]:", exam_result["examiner_prompt"])
    print("[HIDDEN RUBRIC]:", exam_result["expected_concept"])
    
    # 2. Get User Input
    user_answer = input("\n[STUDENT ANSWER]: ")
    
    # Update state with the question, rubric, and answer
    grading_state = initial_state.copy()
    grading_state.update(exam_result)
    grading_state["user_response"] = user_answer
    
    print("\n[SYSTEM] Triggering Agent B (Evaluator)...")
    
    # 3. Run Evaluator -> Router -> (Optional) Curator
    # We invoke the engine starting from the Evaluator node
    from agents.agent_b_evaluator import node_evaluator
    from agents.agent_c_curator import node_curator
    
    eval_result = node_evaluator(grading_state)
    grading_state.update(eval_result)
    
    print(f"\n[EVALUATOR] Mastered: {eval_result['is_mastered']} (Score: {eval_result['eval_score']})")
    
    if eval_result['is_mastered']:
        print("[SYSTEM] Graph node turns GREEN. Loop ends.")
    else:
        print("[SYSTEM] Graph node turns RED. Routing to Curator...")
        curator_result = node_curator(grading_state)
        print("\n[CURATOR RAG PAYLOAD]:\n", curator_result["rag_payload"])

if __name__ == "__main__":
    run_terminal_demo()