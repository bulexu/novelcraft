"""Knowledge Graph API endpoints using LightRAG"""
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field

from app.services.file_manager import FileManager
from app.services.lightrag_service import KnowledgeGraphService


router = APIRouter()


# ============================================================================
# Request/Response Models
# ============================================================================

class BuildKGRequest(BaseModel):
    """Build knowledge graph request"""
    content: str = Field(..., description="Content to build knowledge graph from")
    incremental: bool = Field(default=False, description="Incremental update")


class AddContentRequest(BaseModel):
    """Add content to knowledge graph request"""
    content: str
    content_type: str = Field(default="text", description="Content type: text/chapter/character")


class QueryKGRequest(BaseModel):
    """Query knowledge graph request"""
    question: str
    mode: str = Field(default="hybrid", description="Query mode: hybrid/local/global/naive")


class GraphVisualization(BaseModel):
    """Graph visualization data"""
    nodes: List[dict]
    edges: List[dict]
    status: str
    node_count: int = 0
    edge_count: int = 0


class EntityResponse(BaseModel):
    """Entity response"""
    id: str
    label: str
    type: Optional[str] = None
    description: Optional[str] = None


class RelationResponse(BaseModel):
    """Relation response"""
    source: str
    target: str
    label: Optional[str] = None
    weight: Optional[float] = None


# ============================================================================
# Dependency Injection
# ============================================================================

def get_file_manager() -> FileManager:
    """Get FileManager instance"""
    return FileManager()


def get_kg_service(project_id: str, fm: FileManager = Depends(get_file_manager)) -> KnowledgeGraphService:
    """Get KnowledgeGraphService instance"""
    if not fm.project_exists(project_id):
        raise HTTPException(status_code=404, detail="Project not found")
    return KnowledgeGraphService(project_id)


# ============================================================================
# Endpoints
# ============================================================================

@router.post("/{project_id}/build")
async def build_knowledge_graph(
    project_id: str,
    request: BuildKGRequest,
    kg: KnowledgeGraphService = Depends(get_kg_service),
):
    """Build knowledge graph from content"""
    result = await kg.build_graph(request.content, incremental=request.incremental)
    return result


@router.post("/{project_id}/add")
async def add_content_to_graph(
    project_id: str,
    request: AddContentRequest,
    kg: KnowledgeGraphService = Depends(get_kg_service),
):
    """Add content to existing knowledge graph"""
    result = await kg.add_content(request.content, content_type=request.content_type)
    return result


@router.get("/{project_id}")
async def get_knowledge_graph(
    project_id: str,
    kg: KnowledgeGraphService = Depends(get_kg_service),
):
    """Get knowledge graph statistics"""
    return await kg.get_stats()


@router.post("/{project_id}/query")
async def query_knowledge_graph(
    project_id: str,
    request: QueryKGRequest,
    kg: KnowledgeGraphService = Depends(get_kg_service),
):
    """Query knowledge graph using LightRAG"""
    result = await kg.query(request.question, mode=request.mode)
    return result


@router.get("/{project_id}/visualize", response_model=GraphVisualization)
async def get_graph_visualization(
    project_id: str,
    kg: KnowledgeGraphService = Depends(get_kg_service),
):
    """Get graph visualization data for frontend rendering"""
    result = await kg.get_visualization_data()
    return GraphVisualization(
        nodes=result.get("nodes", []),
        edges=result.get("edges", []),
        status=result.get("status", "unknown"),
        node_count=result.get("node_count", 0),
        edge_count=result.get("edge_count", 0),
    )


@router.get("/{project_id}/entities", response_model=List[EntityResponse])
async def get_entities(
    project_id: str,
    entity_type: Optional[str] = None,
    limit: int = Query(100, ge=1, le=1000),
    kg: KnowledgeGraphService = Depends(get_kg_service),
):
    """Get entities from knowledge graph"""
    entities = await kg.get_entities(entity_type=entity_type, limit=limit)
    return [EntityResponse(**e) for e in entities]


@router.get("/{project_id}/relations", response_model=List[RelationResponse])
async def get_relations(
    project_id: str,
    relation_type: Optional[str] = None,
    limit: int = Query(100, ge=1, le=1000),
    kg: KnowledgeGraphService = Depends(get_kg_service),
):
    """Get relations from knowledge graph"""
    relations = await kg.get_relations(relation_type=relation_type, limit=limit)
    return [RelationResponse(**r) for r in relations]


@router.get("/{project_id}/search")
async def search_entities(
    project_id: str,
    query: str = Query(..., min_length=1),
    limit: int = Query(10, ge=1, le=100),
    kg: KnowledgeGraphService = Depends(get_kg_service),
):
    """Search entities by name or description"""
    results = await kg.search_entities(query, limit=limit)
    return {"query": query, "results": results}


@router.get("/{project_id}/neighbors/{entity_id}")
async def get_entity_neighbors(
    project_id: str,
    entity_id: str,
    depth: int = Query(1, ge=1, le=3),
    kg: KnowledgeGraphService = Depends(get_kg_service),
):
    """Get neighboring entities for visualization"""
    result = await kg.get_entity_neighbors(entity_id, depth=depth)
    return result


@router.delete("/{project_id}")
async def delete_knowledge_graph(
    project_id: str,
    kg: KnowledgeGraphService = Depends(get_kg_service),
):
    """Delete the knowledge graph for a project"""
    result = await kg.delete_graph()
    return result