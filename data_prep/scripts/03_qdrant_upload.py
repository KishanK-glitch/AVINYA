import json
import os
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct
from sentence_transformers import SentenceTransformer

def upload_to_qdrant():
    print("Initializing local Qdrant database...")
    
    # We store the DB at the root of your workspace so your FastAPI backend can easily target it later.
    db_path = os.path.join(os.path.dirname(__file__), '..', '..', 'qdrant_local')
    client = QdrantClient(path=db_path)
    
    collection_name = "transformer_demo"
    
    # all-MiniLM-L6-v2 outputs 384-dimensional vectors. 
    if client.collection_exists(collection_name):
        client.delete_collection(collection_name)
        
    client.create_collection(
        collection_name=collection_name,
        vectors_config=VectorParams(size=384, distance=Distance.COSINE),
    )

    # Load the chunks
    chunks_path = os.path.join(os.path.dirname(__file__), '..', 'processed_json', 'rag_chunks.json')
    try:
        with open(chunks_path, 'r') as f:
            chunks = json.load(f)
    except FileNotFoundError:
        print("[!] Error: rag_chunks.json not found. Did you save it?")
        return

    print("Embedding chunks and pushing to Qdrant...")
    model = SentenceTransformer('all-MiniLM-L6-v2')
    
    points = []
    for idx, chunk in enumerate(chunks):
        # Embed the actual study material
        vector = model.encode(chunk['content']).tolist()
        
        # The payload contains the node_id, which is critical for Agent C's precision filtering
        points.append(PointStruct(
            id=idx,
            vector=vector,
            payload=chunk
        ))
        print(f"[*] Prepared vector and payload for {chunk['node_id']}")

    # Push to DB
    client.upsert(
        collection_name=collection_name,
        points=points
    )
    
    print(f"\nSuccess. Qdrant local database built and populated at {os.path.abspath(db_path)}")

if __name__ == "__main__":
    upload_to_qdrant()