import os
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.output_parsers import StrOutputParser

# 1. STRICT IMPORT: Pull state from the isolated file
from ml_engine.agents.state import SessionState

from ml_engine.prompts import CURATOR_PROMPT
from ml_engine.rag.retriever import fetch_context_for_node

_curator_chain = None

def _get_curator_chain():
    global _curator_chain
    if _curator_chain is None:
        llm = ChatGoogleGenerativeAI(
            model="gemini-2.5-flash-lite",
            temperature=0.3,
            google_api_key=os.environ.get("GEMINI_API_KEY_RAG")
        )
        _curator_chain = CURATOR_PROMPT | llm | StrOutputParser()
    return _curator_chain

def node_curator(state: SessionState) -> dict:
    topic = state["node_topic"]
    raw_chunks = fetch_context_for_node(topic)
    final_payload = _get_curator_chain().invoke({
        "topic": topic,
        "rag_chunks": raw_chunks
    })
    return {"rag_payload": final_payload}