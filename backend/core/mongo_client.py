"""
core/mongo_client.py
--------------------
Async MongoDB connection pool using Motor.

- A single MongoClient is shared across the entire application lifetime.
- connect_mongo() / disconnect_mongo() are called from main.py lifespan.
- get_sessions_collection() is the helper used by routes and websockets.
"""

import logging

from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorCollection
from pymongo.errors import ConnectionFailure

from backend.core.config import settings

logger = logging.getLogger(__name__)

# Module-level client – initialised once on startup
_client: AsyncIOMotorClient | None = None


# ---------------------------------------------------------------------------
# Lifecycle helpers (called from main.py lifespan)
# ---------------------------------------------------------------------------

async def connect_mongo() -> None:
    """Open the Motor connection pool and verify connectivity."""
    global _client
    _client = AsyncIOMotorClient(
        settings.MONGO_URI,
        serverSelectionTimeoutMS=5_000,
    )
    try:
        # Ping to confirm connection
        await _client.admin.command("ping")
        logger.info("✅ MongoDB connected at %s", settings.MONGO_URI)
    except ConnectionFailure as exc:
        logger.error("❌ MongoDB connection failed: %s", exc)
        # Do not raise – let the app start in degraded mode so health check works.


async def disconnect_mongo() -> None:
    """Close the Motor connection pool gracefully."""
    global _client
    if _client is not None:
        _client.close()
        _client = None
        logger.info("MongoDB connection closed.")


# ---------------------------------------------------------------------------
# Dependency / helper
# ---------------------------------------------------------------------------

def _get_client() -> AsyncIOMotorClient:
    if _client is None:
        raise RuntimeError(
            "MongoDB client is not initialised. "
            "Ensure connect_mongo() was awaited during app startup."
        )
    return _client


async def get_sessions_collection() -> AsyncIOMotorCollection:
    """Return the Motor collection used for session documents."""
    client = _get_client()
    db = client[settings.MONGO_DB_NAME]
    return db[settings.MONGO_SESSIONS_COLLECTION]


async def get_collection(collection_name: str) -> AsyncIOMotorCollection:
    """Generic helper to fetch any collection by name."""
    client = _get_client()
    db = client[settings.MONGO_DB_NAME]
    return db[collection_name]


async def get_truth_vector(node_id: str) -> list[float] | None:
    """
    Fetches Ananya's pre-computed truth vector for a specific node from MongoDB.
    Expects a collection named 'truth_vectors'.
    """
    collection = await get_collection("truth_vectors")
    document = await collection.find_one({"node_id": node_id})
    
    if document:
        return document.get("vector")
    return None