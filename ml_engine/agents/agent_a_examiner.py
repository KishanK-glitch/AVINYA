import os
from langchain_google_genai import ChatGoogleGenerativeAI
from pydantic import BaseModel, Field

# 1. IMPORT STATE FROM THE ISOLATED FILE
from agents.state import SessionState

# Import the prompt from your centralized file
from prompts import EXAMINER_PROMPT

class ExaminerOutput(BaseModel):
    question: str = Field(description="A highly specific, technical diagnostic question. No pleasantries. No hints.")
    expected_concept: str = Field(description="A brief internal note on what specific technical detail the user must mention to pass.")

llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash", 
    temperature=0.1, 
    google_api_key=os.environ.get("GEMINI_API_KEY_CORE")
)
structured_llm = llm.with_structured_output(ExaminerOutput)

# Bind the imported prompt to the LLM
examiner_chain = EXAMINER_PROMPT | structured_llm

def node_examiner(state: SessionState) -> dict:
    topic = state["node_topic"]
    # 1. Pull the ground truth text from the state
    context = state.get("node_syllabus_context", "") 
    
    # 2. Pass BOTH variables to the prompt
    result = examiner_chain.invoke({
        "topic": topic, 
        "syllabus_context": context
    })
    
    return {
        "examiner_prompt": result.question,
        "expected_concept": result.expected_concept 
    }