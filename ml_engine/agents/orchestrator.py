# 1. IMPORT START along with StateGraph and END
from langgraph.graph import StateGraph, START, END

# 2. IMPORT STATE FROM THE ISOLATED FILE
from agents.state import SessionState

# 3. IMPORT THE AGENT NODE FUNCTIONS
from agents.agent_a_examiner import node_examiner
from agents.agent_b_evaluator import node_evaluator
from agents.agent_c_curator import node_curator

# 4. DEFINE THE ROUTING LOGIC
def grade_router(state: SessionState) -> str:
    """Routes the graph based on the Evaluator's Pass/Fail decision."""
    if state.get("is_mastered") == True:
        return "passed"
    else:
        return "failed"

# 5. BUILD THE GRAPH
def build_engine():
    workflow = StateGraph(SessionState)
    
    # Add the nodes
    workflow.add_node("Examiner", node_examiner)
    workflow.add_node("Evaluator", node_evaluator)
    workflow.add_node("Curator", node_curator)
    
    # --- THE FIX IS HERE ---
    # Define the entry point for the workflow
    workflow.add_edge(START, "Examiner")
    # -----------------------
    
    # Conditional edge out of Evaluator
    workflow.add_conditional_edges(
        "Evaluator",
        grade_router,
        {
            "passed": END,         # If they pass, graph loop ends (node turns green)
            "failed": "Curator"    # If they fail, trigger Agent C (node turns red, fetch RAG)
        }
    )
    
    # Curator ends the cycle after delivering the RAG payload
    workflow.add_edge("Curator", END)
    
    return workflow.compile()

# Export the compiled graph
app_engine = build_engine()