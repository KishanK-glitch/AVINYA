def rerank_chunks(query: str, retrieved_docs: list, top_k: int = 3) -> list:
    """
    Filters and ranks the raw documents retrieved from the vector database.
    
    ARCHITECTURAL NOTE: 
    Currently a passthrough mock. When ready for production, implement 
    your sentence-transformers cross-encoder logic here to re-weight 
    the documents before passing them to Agent C.
    """
    print(f"\n[RERANKER] Filtering top {top_k} chunks for query: '{query}'")
    
    # Mock behavior: just return the first 'top_k' docs
    return retrieved_docs[:top_k]