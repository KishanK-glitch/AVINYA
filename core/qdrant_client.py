"""
core/qdrant_client.py
---------------------
Qdrant vector-database connection setup.

Currently provisions an **empty** collection (bucket) so that the RAG
pipeline has a target to write into. Actual upsert / search logic lives in
ml_engine/rag/retriever.py and ml_engine/rag/reranker.py.

Usage
-----
    from core.qdrant_client import get_qdrant_client, ensure_collection

    client = get_qdrant_client()
    await ensure_collection(client)
"""

import logging

from qdrant_client import QdrantClient
from qdrant_client.http.exceptions import UnexpectedResponse
from qdrant_client.models import Distance, VectorParams

from core.config import settings

logger = logging.getLogger(__name__)

# Default embedding dimension – override via .env if using a different model.
VECTOR_SIZE: int = 1536   # OpenAI text-embedding-3-small / ada-002

# ---------------------------------------------------------------------------
# Client factory
# ---------------------------------------------------------------------------

def get_qdrant_client() -> QdrantClient:
    """
    Return a synchronous QdrantClient.

    For async workloads use  AsyncQdrantClient  (qdrant-client >= 1.7).
    The sync client is sufficient for startup provisioning; swap to async
    for high-throughput RAG calls in ml_engine/rag/.
    """
    kwargs: dict = {
        "host": settings.QDRANT_HOST,
        "port": settings.QDRANT_PORT,
    }
    if settings.QDRANT_API_KEY:
        kwargs["api_key"] = settings.QDRANT_API_KEY

    client = QdrantClient(**kwargs)
    logger.info(
        "Qdrant client initialised → %s:%s", settings.QDRANT_HOST, settings.QDRANT_PORT
    )
    return client


# ---------------------------------------------------------------------------
# Collection provisioning
# ---------------------------------------------------------------------------

def ensure_collection(
    client: QdrantClient,
    collection_name: str | None = None,
    vector_size: int = VECTOR_SIZE,
    distance: Distance = Distance.COSINE,
) -> None:
    """
    Create the Qdrant collection if it does not already exist.

    Parameters
    ----------
    client          : QdrantClient instance.
    collection_name : Defaults to settings.QDRANT_COLLECTION_NAME.
    vector_size     : Dimensionality of the embedding vectors.
    distance        : Distance metric (COSINE | EUCLID | DOT).
    """
    name = collection_name or settings.QDRANT_COLLECTION_NAME

    try:
        existing = [c.name for c in client.get_collections().collections]
        if name in existing:
            logger.info("Qdrant collection '%s' already exists – skipping creation.", name)
            return

        client.create_collection(
            collection_name=name,
            vectors_config=VectorParams(size=vector_size, distance=distance),
        )
        logger.info(
            "✅ Qdrant collection '%s' created (dim=%d, metric=%s).",
            name, vector_size, distance,
        )

    except UnexpectedResponse as exc:
        logger.error("❌ Failed to ensure Qdrant collection '%s': %s", name, exc)
    except Exception as exc:
        logger.error("❌ Qdrant connection error: %s", exc)


# ---------------------------------------------------------------------------
# Optional: call this from main.py lifespan if you want auto-provisioning
# ---------------------------------------------------------------------------

def init_qdrant() -> QdrantClient:
    """Convenience wrapper: create client + ensure default collection."""
    client = get_qdrant_client()
    ensure_collection(client)
    return client
