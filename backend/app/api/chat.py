"""
VibeWriting Chat API endpoints
AI-powered novel writing assistance through natural conversation.
"""
from typing import List, Optional
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
import uuid

from app.services.vibewriter import VibeWriterService, VibeWriter
from app.services.file_manager import FileManager


router = APIRouter()


# ============================================================================
# Request/Response Models
# ============================================================================

class ChatMessage(BaseModel):
    """聊天消息"""
    role: str = Field(..., pattern="^(user|assistant|system)$")
    content: str


class ChatRequest(BaseModel):
    """聊天请求"""
    message: str = Field(..., min_length=1)
    session_id: Optional[str] = None
    context_focus: Optional[str] = None  # e.g., "character:李明", "chapter:2"


class ChatResponse(BaseModel):
    """聊天响应"""
    response: str
    session_id: str
    context_used: dict
    timestamp: str


class CharacterInferenceRequest(BaseModel):
    """角色行为推演请求"""
    character_name: str
    scenario: str
    factors: Optional[dict] = None


class CharacterInferenceResponse(BaseModel):
    """角色行为推演响应"""
    character_name: str
    scenario: str
    inference_result: str
    factors_used: dict
    timestamp: str


class StyleContinuationRequest(BaseModel):
    """笔风续写请求"""
    context_content: str
    target_length: int = Field(default=500, ge=100, le=5000)
    direction: Optional[str] = None


class StyleContinuationResponse(BaseModel):
    """笔风续写响应"""
    continued_content: str
    target_length: int
    style_matched: bool
    timestamp: str


class ConsistencyCheckRequest(BaseModel):
    """一致性检查请求"""
    content: str
    check_type: str = Field(default="all", pattern="^(character|world|narrative|all)$")


class ConsistencyCheckResponse(BaseModel):
    """一致性检查响应"""
    content_checked: str
    check_type: str
    result: str
    timestamp: str


class SessionInfo(BaseModel):
    """会话信息"""
    session_id: str
    saved_at: Optional[str]
    message_count: int


class SessionDetail(BaseModel):
    """会话详情"""
    session_id: str
    project_id: str
    messages: List[ChatMessage]
    saved_at: str


class KnowledgeGraphQueryRequest(BaseModel):
    """知识图谱查询请求"""
    question: str


class KnowledgeGraphQueryResponse(BaseModel):
    """知识图谱查询响应"""
    status: str
    question: str
    answer: Optional[str]
    mode: str


class ProjectContextResponse(BaseModel):
    """项目上下文响应"""
    project: Optional[dict]
    characters: List[dict]
    chapters: List[dict]
    state: dict
    style: Optional[dict]
    total_words: int


# ============================================================================
# Dependency Injection
# ============================================================================

def get_file_manager() -> FileManager:
    """Get FileManager instance"""
    return FileManager()


def get_vibewriter(project_id: str, fm: FileManager = Depends(get_file_manager)) -> VibeWriter:
    """Get VibeWriter instance for project"""
    if not fm.project_exists(project_id):
        raise HTTPException(status_code=404, detail="Project not found")
    return VibeWriterService.get_writer(project_id)


# ============================================================================
# Chat Endpoints
# ============================================================================

@router.post("/projects/{project_id}/chat", response_model=ChatResponse)
async def chat(
    project_id: str,
    request: ChatRequest,
    writer: VibeWriter = Depends(get_vibewriter),
):
    """
    与 AI 进行对话

    通过自然语言与 AI 助手交流，进行小说创作辅助。
    """
    # 生成或使用现有 session_id
    session_id = request.session_id or str(uuid.uuid4())[:8]

    # 加载现有会话消息（如果有）
    existing_messages = []
    if request.session_id:
        session_data = writer.load_session(request.session_id)
        if session_data:
            existing_messages = session_data.get("messages", [])

    # 执行对话
    result = await writer.chat(
        message=request.message,
        session_id=session_id,
        context_focus=request.context_focus,
    )

    # 保存会话
    messages = existing_messages + [
        {"role": "user", "content": request.message},
        {"role": "assistant", "content": result["response"]},
    ]
    writer.save_session(session_id, messages)

    return ChatResponse(
        response=result["response"],
        session_id=session_id,
        context_used=result["context_used"],
        timestamp=result["timestamp"],
    )


@router.get("/projects/{project_id}/sessions", response_model=List[SessionInfo])
async def list_sessions(
    project_id: str,
    writer: VibeWriter = Depends(get_vibewriter),
):
    """
    列出所有会话
    """
    sessions = writer.list_sessions()
    return [SessionInfo(**s) for s in sessions]


@router.get("/projects/{project_id}/sessions/{session_id}", response_model=SessionDetail)
async def get_session(
    project_id: str,
    session_id: str,
    writer: VibeWriter = Depends(get_vibewriter),
):
    """
    获取会话详情
    """
    session_data = writer.load_session(session_id)
    if not session_data:
        raise HTTPException(status_code=404, detail="Session not found")

    return SessionDetail(
        session_id=session_data.get("session_id"),
        project_id=session_data.get("project_id"),
        messages=[ChatMessage(**m) for m in session_data.get("messages", [])],
        saved_at=session_data.get("saved_at"),
    )


@router.delete("/projects/{project_id}/sessions/{session_id}", status_code=204)
async def delete_session(
    project_id: str,
    session_id: str,
    writer: VibeWriter = Depends(get_vibewriter),
):
    """
    删除会话
    """
    session_file = (
        writer.file_manager.get_project_path(project_id)
        / "state"
        / "sessions"
        / f"{session_id}.yaml"
    )
    if session_file.exists():
        session_file.unlink()


# ============================================================================
# Context Endpoints
# ============================================================================

@router.get("/projects/{project_id}/context", response_model=ProjectContextResponse)
async def get_context(
    project_id: str,
    writer: VibeWriter = Depends(get_vibewriter),
):
    """
    获取项目完整上下文
    """
    context = writer.build_context()
    return ProjectContextResponse(**context)


@router.get("/projects/{project_id}/characters/{name}/context")
async def get_character_context(
    project_id: str,
    name: str,
    writer: VibeWriter = Depends(get_vibewriter),
):
    """
    获取角色上下文
    """
    context = writer.get_character_context(name)
    if not context:
        raise HTTPException(status_code=404, detail=f"Character '{name}' not found")
    return context


# ============================================================================
# Inference Endpoints
# ============================================================================

@router.post(
    "/projects/{project_id}/inference/character",
    response_model=CharacterInferenceResponse
)
async def infer_character(
    project_id: str,
    request: CharacterInferenceRequest,
    writer: VibeWriter = Depends(get_vibewriter),
):
    """
    推演角色行为

    根据性格、当前状态、动机和外部压力推演角色在特定场景下的行为。
    """
    result = await writer.infer_character_behavior(
        character_name=request.character_name,
        scenario=request.scenario,
        factors=request.factors,
    )

    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])

    return CharacterInferenceResponse(**result)


# ============================================================================
# Style Endpoints
# ============================================================================

@router.post(
    "/projects/{project_id}/style/continue",
    response_model=StyleContinuationResponse
)
async def continue_with_style(
    project_id: str,
    request: StyleContinuationRequest,
    writer: VibeWriter = Depends(get_vibewriter),
):
    """
    笔风匹配续写

    根据已分析的笔风指纹，生成风格一致的续写内容。
    """
    result = await writer.continue_with_style(
        context_content=request.context_content,
        target_length=request.target_length,
        direction=request.direction,
    )

    return StyleContinuationResponse(**result)


# ============================================================================
# Consistency Endpoints
# ============================================================================

@router.post(
    "/projects/{project_id}/consistency/check",
    response_model=ConsistencyCheckResponse
)
async def check_consistency(
    project_id: str,
    request: ConsistencyCheckRequest,
    writer: VibeWriter = Depends(get_vibewriter),
):
    """
    一致性检查

    检查内容与角色性格、世界观、叙事逻辑的一致性。
    """
    result = await writer.check_consistency(
        content=request.content,
        check_type=request.check_type,
    )

    return ConsistencyCheckResponse(**result)


# ============================================================================
# Knowledge Graph Endpoints
# ============================================================================

@router.post(
    "/projects/{project_id}/kg/query",
    response_model=KnowledgeGraphQueryResponse
)
async def query_knowledge_graph(
    project_id: str,
    request: KnowledgeGraphQueryRequest,
    writer: VibeWriter = Depends(get_vibewriter),
):
    """
    查询知识图谱

    通过 LightRAG 查询小说内容构建的知识图谱。
    """
    result = await writer.query_knowledge_graph(request.question)

    return KnowledgeGraphQueryResponse(**result)


@router.post("/projects/{project_id}/kg/update")
async def update_knowledge_graph(
    project_id: str,
    content: str,
    writer: VibeWriter = Depends(get_vibewriter),
):
    """
    更新知识图谱

    将内容添加到知识图谱中。
    """
    result = await writer.update_knowledge_graph(content)
    return result


@router.get("/projects/{project_id}/kg/visualization")
async def get_kg_visualization(
    project_id: str,
    writer: VibeWriter = Depends(get_vibewriter),
):
    """
    获取知识图谱可视化数据
    """
    return await writer.kg_service.get_visualization_data()