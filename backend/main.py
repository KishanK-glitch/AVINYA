"""
main.py
-------
FastAPI application entry point.
- Initializes the app instance.
- Configures CORS to allow the frontend origin.
- Registers API and WebSocket routers.
- Connects / disconnects MongoDB on startup / shutdown.
"""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.api.routes import router as api_router
from backend.api.websockets import router as ws_router
from backend.core.config import settings
from backend.core.mongo_client import connect_mongo, disconnect_mongo


# ---------------------------------------------------------------------------
# Lifespan: runs startup / shutdown logic around the app's lifetime
# ---------------------------------------------------------------------------
@asynccontextmanager
async def lifespan(app: FastAPI):
    # --- Startup ---
    await connect_mongo()
    yield
    # --- Shutdown ---
    await disconnect_mongo()


# ---------------------------------------------------------------------------
# App instance
# ---------------------------------------------------------------------------
app = FastAPI(
    title="Qiti Adaptive Learning API",
    description="Multi-agent adaptive learning backend powered by FastAPI.",
    version="0.1.0",
    lifespan=lifespan,
)

# ---------------------------------------------------------------------------
# CORS
# ---------------------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,   # e.g. ["http://localhost:3000"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Routers
# ---------------------------------------------------------------------------
app.include_router(api_router, prefix="/api", tags=["REST"])
app.include_router(ws_router, tags=["WebSocket"])


# ---------------------------------------------------------------------------
# Health check
# ---------------------------------------------------------------------------
@app.get("/health", tags=["Health"])
async def health_check():
    return {"status": "ok", "version": app.version}
