import os
from langchain_google_genai import ChatGoogleGenerativeAI
from pydantic import BaseModel, Field

# 1. IMPORT STATE FROM THE ISOLATED FILE
from ml_engine.agents.state import SessionState

# Import the prompt from your centralized file
from ml_engine.prompts import EXAMINER_PROMPT

class ExaminerOutput(BaseModel):
    question: str = Field(description="A highly specific, technical diagnostic question. No pleasantries. No hints.")
    expected_concept: str = Field(description="A brief internal note on what specific technical detail the user must mention to pass.")

_examiner_chain = None

def _get_examiner_chain():
    global _examiner_chain
    if _examiner_chain is None:
        llm = ChatGoogleGenerativeAI(
            model="gemini-2.5-flash",
            temperature=0.1,
            google_api_key=os.environ.get("GEMINI_API_KEY_CORE")
        )
        _examiner_chain = EXAMINER_PROMPT | llm.with_structured_output(ExaminerOutput)
    return _examiner_chain

def node_examiner(state: SessionState) -> dict:
    topic = state["node_topic"]
    context = state.get("node_syllabus_context", "")
    result = _get_examiner_chain().invoke({
        "topic": topic,
        "syllabus_context": context
    })
    return {
        "examiner_prompt": result.question,
        "expected_concept": result.expected_concept
    }