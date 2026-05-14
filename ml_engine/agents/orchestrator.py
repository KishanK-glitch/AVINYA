"""
ml_engine/agents/orchestrator.py
---------------------------------
Builds and exports the compiled LangGraph app_engine.

Import path (from repo root):
    from ml_engine.agents.orchestrator import app_engine, SessionState
"""

from langgraph.graph import StateGraph, START, END

# Pull state definition from its canonical home
from ml_engine.agents.state import SessionState

# Agent node functions
from ml_engine.agents.agent_a_examiner import node_examiner
from ml_engine.agents.agent_b_evaluator import node_evaluator
from ml_engine.agents.agent_c_curator import node_curator


# ---------------------------------------------------------------------------
# Routing logic
# ---------------------------------------------------------------------------

def grade_router(state: SessionState) -> str:
    """Routes the graph based on the Evaluator's Pass/Fail decision."""
    if state.get("is_mastered") is True:
        return "passed"
    return "failed"


# ---------------------------------------------------------------------------
# Graph construction
# ---------------------------------------------------------------------------

def build_engine():
    workflow = StateGraph(SessionState)

    # Add the nodes
    workflow.add_node("Examiner", node_examiner)
    workflow.add_node("Evaluator", node_evaluator)
    workflow.add_node("Curator", node_curator)

    # Entry point
    workflow.add_edge(START, "Examiner")

    # Examiner -> Evaluator (always)
    workflow.add_edge("Examiner", "Evaluator")

    # Conditional edge out of Evaluator
    workflow.add_conditional_edges(
        "Evaluator",
        grade_router,
        {
            "passed": END,       # Node turns green
            "failed": "Curator"  # Fetch RAG material
        }
    )

    # Curator ends the cycle
    workflow.add_edge("Curator", END)

    return workflow.compile()


# Singleton – import this everywhere
app_engine = build_engine()
