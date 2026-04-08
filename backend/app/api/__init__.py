"""API module"""
from app.api.files import router as files_router
from app.api.chat import router as chat_router
from app.api.knowledge_graph import router as kg_router
from app.api.simulation import router as simulation_router
from app.api.style_import import router as style_import_router

from fastapi import APIRouter

api_router = APIRouter()

# File-based API (Vibe Writing)
api_router.include_router(files_router, tags=["Files"])
api_router.include_router(chat_router, tags=["VibeWriting"])

# Knowledge Graph
api_router.include_router(kg_router, prefix="/kg", tags=["Knowledge Graph"])

# Social Simulation (Oasis)
api_router.include_router(simulation_router, tags=["Simulation"])

# Style Analysis & Import
api_router.include_router(style_import_router, tags=["Style & Import"])