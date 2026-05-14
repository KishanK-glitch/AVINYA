from rag.reranker import rerank_chunks

def fetch_context_for_node(topic: str) -> str:
    """
    Simulates fetching vectorized chunks from Qdrant.
    """
    print(f"\n[RETRIEVER] Searching Vector DB for node: {topic}")
    
    # We are replacing the generic mock data with Ananya's actual ground truth for Node 04
    raw_mock_docs = [
        "Scaled dot-product attention takes the dot products of the Queries and Keys and divides them by the square root of the dimension of the key vectors (sqrt(d_k)).",
        "This scaling factor is critical because it prevents the dot products from growing too large.",
        "Without scaling, large dot products would push the subsequent softmax function into regions with extremely small gradients, effectively stalling the learning process."
    ]

    # Pass the raw results through your reranker
    best_chunks = rerank_chunks(query=topic, retrieved_docs=raw_mock_docs, top_k=3)

    formatted_context = "\n\n---\n\n".join(best_chunks)
    return formatted_context