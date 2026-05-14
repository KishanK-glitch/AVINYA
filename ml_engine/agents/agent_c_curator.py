import os
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.output_parsers import StrOutputParser

# 1. STRICT IMPORT: Pull state from the isolated file
from agents.state import SessionState

from prompts import CURATOR_PROMPT
from rag.retriever import fetch_context_for_node

llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash-lite", 
    temperature=0.3, 
    google_api_key=os.environ.get("GEMINI_API_KEY_RAG")
)

# Bind the imported prompt and force string output
curator_chain = CURATOR_PROMPT | llm | StrOutputParser()

def node_curator(state: SessionState) -> dict:
    topic = state["node_topic"]
    
    # Fetch from your mock retriever
    raw_chunks = fetch_context_for_node(topic)
    
    final_payload = curator_chain.invoke({
        "topic": topic,
        "rag_chunks": raw_chunks
    })
    
    return {"rag_payload": final_payload}