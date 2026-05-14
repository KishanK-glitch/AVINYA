import os
from langchain_google_genai import ChatGoogleGenerativeAI
from pydantic import BaseModel, Field

# 1. STRICT IMPORT: Pull state from the isolated file
from ml_engine.agents.state import SessionState

from ml_engine.prompts import EVALUATOR_PROMPT

class EvaluatorOutput(BaseModel):
    is_mastered: bool = Field(description="True if the user demonstrated understanding of the expected concept, False otherwise.")
    eval_score: float = Field(description="Confidence score from 0.0 to 1.0 based on answer accuracy.")

_evaluator_chain = None

def _get_evaluator_chain():
    global _evaluator_chain
    if _evaluator_chain is None:
        llm = ChatGoogleGenerativeAI(
            model="gemini-2.5-flash",
            temperature=0.0,
            google_api_key=os.environ.get("GEMINI_API_KEY_CORE")
        )
        _evaluator_chain = EVALUATOR_PROMPT | llm.with_structured_output(EvaluatorOutput)
    return _evaluator_chain

def node_evaluator(state: SessionState) -> dict:
    question = state.get("examiner_prompt", "")
    expected = state.get("expected_concept", "")
    answer = state.get("user_response", "")
    result = _get_evaluator_chain().invoke({
        "question": question,
        "expected": expected,
        "answer": answer
    })
    return {
        "is_mastered": result.is_mastered,
        "eval_score": result.eval_score
    }