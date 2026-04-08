"""
File-based API endpoints for Vibe Writing.
Uses FileManager for Markdown/YAML file operations.
"""
from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query, Depends
from pydantic import BaseModel, Field

from app.services.file_manager import FileManager
from app.schemas.file_models import (
    CharacterMD,
    ChapterMD,
    ProjectMD,
    ProjectState,
    StyleFingerprint,
    ForeshadowingItem,
)

router = APIRouter()


# ============================================================================
# Dependency Injection
# ============================================================================

def get_file_manager() -> FileManager:
    """Get FileManager instance"""
    return FileManager()


# ============================================================================
# Request/Response Models
# ============================================================================

class ProjectCreateRequest(BaseModel):
    """创建项目请求"""
    name: str = Field(..., min_length=1, max_length=100)
    description: str = ""
    genre: str = ""
    target_style: str = ""
    target_words: int = 0


class ProjectUpdateRequest(BaseModel):
    """更新项目请求"""
    name: Optional[str] = None
    description: Optional[str] = None
    genre: Optional[str] = None
    target_style: Optional[str] = None
    target_words: Optional[int] = None
    status: Optional[str] = None


class CharacterCreateRequest(BaseModel):
    """创建角色请求"""
    name: str = Field(..., min_length=1, max_length=50)
    aliases: List[str] = []
    gender: Optional[str] = None
    age: Optional[int] = None
    status: str = "alive"
    arc_type: Optional[str] = None
    appearance: str = ""
    background: str = ""


class CharacterUpdateRequest(BaseModel):
    """更新角色请求"""
    aliases: Optional[List[str]] = None
    gender: Optional[str] = None
    age: Optional[int] = None
    status: Optional[str] = None
    arc_type: Optional[str] = None
    appearance: Optional[str] = None
    background: Optional[str] = None


class ChapterCreateRequest(BaseModel):
    """创建章节请求"""
    chapter: int = Field(..., ge=1)
    title: str = ""
    content: str = ""
    characters: List[str] = []
    location: Optional[str] = None
    foreshadowing: List[ForeshadowingItem] = []


class ChapterUpdateRequest(BaseModel):
    """更新章节请求"""
    title: Optional[str] = None
    content: Optional[str] = None
    characters: Optional[List[str]] = None
    location: Optional[str] = None
    foreshadowing: Optional[List[ForeshadowingItem]] = None


class ProjectListResponse(BaseModel):
    """项目列表响应"""
    items: List[ProjectMD]
    total: int


class CharacterListResponse(BaseModel):
    """角色列表响应"""
    items: List[CharacterMD]
    total: int


class ChapterListResponse(BaseModel):
    """章节列表响应"""
    items: List[ChapterMD]
    total: int
    total_words: int


class ProjectStatsResponse(BaseModel):
    """项目统计响应"""
    project_id: str
    project_name: str
    total_chapters: int
    total_words: int
    total_characters: int
    status: str
    genre: str


# ============================================================================
# Project Endpoints
# ============================================================================

@router.post("/projects", response_model=ProjectMD, status_code=201)
async def create_project(
    request: ProjectCreateRequest,
    fm: FileManager = Depends(get_file_manager),
):
    """创建新项目"""
    project = fm.create_project(
        name=request.name,
        description=request.description,
        genre=request.genre,
        target_style=request.target_style,
        target_words=request.target_words,
    )
    return project


@router.get("/projects", response_model=ProjectListResponse)
async def list_projects(
    fm: FileManager = Depends(get_file_manager),
):
    """列出所有项目"""
    projects = fm.list_projects()
    return ProjectListResponse(items=projects, total=len(projects))


@router.get("/projects/{project_id}", response_model=ProjectMD)
async def get_project(
    project_id: str,
    fm: FileManager = Depends(get_file_manager),
):
    """获取项目详情"""
    project = fm.read_project(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project


@router.put("/projects/{project_id}", response_model=ProjectMD)
async def update_project(
    project_id: str,
    request: ProjectUpdateRequest,
    fm: FileManager = Depends(get_file_manager),
):
    """更新项目"""
    project = fm.read_project(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    update_data = request.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(project, key, value)

    fm.write_project(project)
    return project


@router.delete("/projects/{project_id}", status_code=204)
async def delete_project(
    project_id: str,
    fm: FileManager = Depends(get_file_manager),
):
    """删除项目"""
    if not fm.project_exists(project_id):
        raise HTTPException(status_code=404, detail="Project not found")
    fm.delete_project(project_id)


@router.get("/projects/{project_id}/stats", response_model=ProjectStatsResponse)
async def get_project_stats(
    project_id: str,
    fm: FileManager = Depends(get_file_manager),
):
    """获取项目统计"""
    project = fm.read_project(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    chapters = fm.list_chapters(project_id)
    characters = fm.list_characters(project_id)
    total_words = sum(c.word_count for c in chapters)

    return ProjectStatsResponse(
        project_id=project_id,
        project_name=project.name,
        total_chapters=len(chapters),
        total_words=total_words,
        total_characters=len(characters),
        status=project.status,
        genre=project.genre,
    )


# ============================================================================
# Character Endpoints
# ============================================================================

@router.post("/projects/{project_id}/characters", response_model=CharacterMD, status_code=201)
async def create_character(
    project_id: str,
    request: CharacterCreateRequest,
    fm: FileManager = Depends(get_file_manager),
):
    """创建角色"""
    if not fm.project_exists(project_id):
        raise HTTPException(status_code=404, detail="Project not found")

    # 检查是否已存在
    existing = fm.read_character(project_id, request.name)
    if existing:
        raise HTTPException(status_code=400, detail=f"Character '{request.name}' already exists")

    character = CharacterMD(
        id=fm._generate_id(),
        name=request.name,
        aliases=request.aliases,
        gender=request.gender,
        age=request.age,
        status=request.status,
        arc_type=request.arc_type,
        appearance=request.appearance,
        background=request.background,
    )

    fm.write_character(project_id, character)
    return character


@router.get("/projects/{project_id}/characters", response_model=CharacterListResponse)
async def list_characters(
    project_id: str,
    fm: FileManager = Depends(get_file_manager),
):
    """列出项目所有角色"""
    if not fm.project_exists(project_id):
        raise HTTPException(status_code=404, detail="Project not found")

    characters = fm.list_characters(project_id)
    return CharacterListResponse(items=characters, total=len(characters))


@router.get("/projects/{project_id}/characters/{name}", response_model=CharacterMD)
async def get_character(
    project_id: str,
    name: str,
    fm: FileManager = Depends(get_file_manager),
):
    """获取角色详情"""
    if not fm.project_exists(project_id):
        raise HTTPException(status_code=404, detail="Project not found")

    character = fm.read_character(project_id, name)
    if not character:
        raise HTTPException(status_code=404, detail=f"Character '{name}' not found")
    return character


@router.put("/projects/{project_id}/characters/{name}", response_model=CharacterMD)
async def update_character(
    project_id: str,
    name: str,
    request: CharacterUpdateRequest,
    fm: FileManager = Depends(get_file_manager),
):
    """更新角色"""
    if not fm.project_exists(project_id):
        raise HTTPException(status_code=404, detail="Project not found")

    character = fm.read_character(project_id, name)
    if not character:
        raise HTTPException(status_code=404, detail=f"Character '{name}' not found")

    update_data = request.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(character, key, value)

    fm.write_character(project_id, character)
    return character


@router.delete("/projects/{project_id}/characters/{name}", status_code=204)
async def delete_character(
    project_id: str,
    name: str,
    fm: FileManager = Depends(get_file_manager),
):
    """删除角色"""
    if not fm.project_exists(project_id):
        raise HTTPException(status_code=404, detail="Project not found")

    if not fm.delete_character(project_id, name):
        raise HTTPException(status_code=404, detail=f"Character '{name}' not found")


# ============================================================================
# Chapter Endpoints
# ============================================================================

@router.post("/projects/{project_id}/chapters", response_model=ChapterMD, status_code=201)
async def create_chapter(
    project_id: str,
    request: ChapterCreateRequest,
    fm: FileManager = Depends(get_file_manager),
):
    """创建章节"""
    if not fm.project_exists(project_id):
        raise HTTPException(status_code=404, detail="Project not found")

    # 检查章节号是否已存在
    existing = fm.read_chapter(project_id, request.chapter)
    if existing:
        raise HTTPException(status_code=400, detail=f"Chapter {request.chapter} already exists")

    chapter = ChapterMD(
        chapter=request.chapter,
        title=request.title,
        content=request.content,
        characters=request.characters,
        location=request.location,
        foreshadowing=request.foreshadowing,
    )

    fm.write_chapter(project_id, chapter)
    return chapter


@router.get("/projects/{project_id}/chapters", response_model=ChapterListResponse)
async def list_chapters(
    project_id: str,
    fm: FileManager = Depends(get_file_manager),
):
    """列出项目所有章节"""
    if not fm.project_exists(project_id):
        raise HTTPException(status_code=404, detail="Project not found")

    chapters = fm.list_chapters(project_id)
    total_words = sum(c.word_count for c in chapters)
    return ChapterListResponse(items=chapters, total=len(chapters), total_words=total_words)


@router.get("/projects/{project_id}/chapters/{chapter_num}", response_model=ChapterMD)
async def get_chapter(
    project_id: str,
    chapter_num: int,
    fm: FileManager = Depends(get_file_manager),
):
    """获取章节详情"""
    if not fm.project_exists(project_id):
        raise HTTPException(status_code=404, detail="Project not found")

    chapter = fm.read_chapter(project_id, chapter_num)
    if not chapter:
        raise HTTPException(status_code=404, detail=f"Chapter {chapter_num} not found")
    return chapter


@router.put("/projects/{project_id}/chapters/{chapter_num}", response_model=ChapterMD)
async def update_chapter(
    project_id: str,
    chapter_num: int,
    request: ChapterUpdateRequest,
    fm: FileManager = Depends(get_file_manager),
):
    """更新章节"""
    if not fm.project_exists(project_id):
        raise HTTPException(status_code=404, detail="Project not found")

    chapter = fm.read_chapter(project_id, chapter_num)
    if not chapter:
        raise HTTPException(status_code=404, detail=f"Chapter {chapter_num} not found")

    update_data = request.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(chapter, key, value)

    fm.write_chapter(project_id, chapter)
    return chapter


@router.delete("/projects/{project_id}/chapters/{chapter_num}", status_code=204)
async def delete_chapter(
    project_id: str,
    chapter_num: int,
    fm: FileManager = Depends(get_file_manager),
):
    """删除章节"""
    if not fm.project_exists(project_id):
        raise HTTPException(status_code=404, detail="Project not found")

    if not fm.delete_chapter(project_id, chapter_num):
        raise HTTPException(status_code=404, detail=f"Chapter {chapter_num} not found")


# ============================================================================
# State Endpoints
# ============================================================================

@router.get("/projects/{project_id}/state", response_model=ProjectState)
async def get_project_state(
    project_id: str,
    fm: FileManager = Depends(get_file_manager),
):
    """获取项目状态"""
    if not fm.project_exists(project_id):
        raise HTTPException(status_code=404, detail="Project not found")

    state = fm.read_state(project_id)
    return state


@router.put("/projects/{project_id}/state", response_model=ProjectState)
async def update_project_state(
    project_id: str,
    state: ProjectState,
    fm: FileManager = Depends(get_file_manager),
):
    """更新项目状态"""
    if not fm.project_exists(project_id):
        raise HTTPException(status_code=404, detail="Project not found")

    fm.write_state(project_id, state)
    return state


# ============================================================================
# Style Fingerprint Endpoints
# ============================================================================

@router.get("/projects/{project_id}/style", response_model=Optional[StyleFingerprint])
async def get_style_fingerprint(
    project_id: str,
    fm: FileManager = Depends(get_file_manager),
):
    """获取笔风指纹"""
    if not fm.project_exists(project_id):
        raise HTTPException(status_code=404, detail="Project not found")

    fingerprint = fm.read_style_fingerprint(project_id)
    return fingerprint


@router.put("/projects/{project_id}/style", response_model=StyleFingerprint)
async def update_style_fingerprint(
    project_id: str,
    fingerprint: StyleFingerprint,
    fm: FileManager = Depends(get_file_manager),
):
    """更新笔风指纹"""
    if not fm.project_exists(project_id):
        raise HTTPException(status_code=404, detail="Project not found")

    fm.write_style_fingerprint(project_id, fingerprint)
    return fingerprint