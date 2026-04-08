"""
Style and Import API endpoints.
Handles style analysis, fingerprinting, and content import.
"""
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, HTTPException, UploadFile, File, BackgroundTasks
from pydantic import BaseModel, Field
import asyncio
import os
from pathlib import Path

from app.services.file_manager import FileManager
from app.config import settings

router = APIRouter()


# ============================================================================
# Request/Response Models
# ============================================================================

class StyleAnalyzeRequest(BaseModel):
    """笔风分析请求"""
    content: str = Field(..., min_length=100, description="待分析的文本内容")


class StyleCompareRequest(BaseModel):
    """笔风比较请求"""
    content1: str
    content2: str


class StyleFingerprintResponse(BaseModel):
    """笔风指纹响应"""
    project_id: str
    analyzed_at: str
    confidence: float
    sentence_patterns: Dict[str, Any]
    vocabulary_profile: Dict[str, Any]
    description_style: Dict[str, Any]
    narrative_rhythm: Dict[str, Any]


class ImportStatus(BaseModel):
    """导入状态"""
    task_id: str
    project_id: str
    status: str  # pending/processing/completed/error
    progress: float
    message: str
    chapters_imported: int = 0
    total_words: int = 0


class ImportResult(BaseModel):
    """导入结果"""
    task_id: str
    project_id: str
    file_name: str
    total_chapters: int
    total_words: int
    characters_detected: List[str]
    status: str


# ============================================================================
# Style Analysis Endpoints
# ============================================================================

@router.post("/projects/{project_id}/style/analyze", response_model=StyleFingerprintResponse)
async def analyze_style(
    project_id: str,
    request: StyleAnalyzeRequest,
):
    """
    分析文本笔风

    提取句式特征、词汇特征、描写风格等笔风指纹。
    """
    fm = FileManager()
    if not fm.project_exists(project_id):
        raise HTTPException(status_code=404, detail="Project not found")

    # Analyze content
    fingerprint = await analyze_content_style(request.content, project_id)

    # Save fingerprint
    from app.schemas.file_models import StyleFingerprint, SentencePatterns, VocabularyProfile, DescriptionStyle, NarrativeRhythm
    from datetime import datetime

    style_fp = StyleFingerprint(
        project_id=project_id,
        analyzed_at=datetime.now(),
        confidence=fingerprint["confidence"],
        sentence_patterns=SentencePatterns(**fingerprint["sentence_patterns"]),
        vocabulary_profile=VocabularyProfile(**fingerprint["vocabulary_profile"]),
        description_style=DescriptionStyle(**fingerprint["description_style"]),
        narrative_rhythm=NarrativeRhythm(**fingerprint["narrative_rhythm"]),
    )

    fm.write_style_fingerprint(project_id, style_fp)

    return StyleFingerprintResponse(
        project_id=project_id,
        analyzed_at=style_fp.analyzed_at.isoformat(),
        confidence=style_fp.confidence,
        sentence_patterns=fingerprint["sentence_patterns"],
        vocabulary_profile=fingerprint["vocabulary_profile"],
        description_style=fingerprint["description_style"],
        narrative_rhythm=fingerprint["narrative_rhythm"],
    )


@router.get("/projects/{project_id}/style/fingerprint", response_model=StyleFingerprintResponse)
async def get_style_fingerprint(project_id: str):
    """获取笔风指纹"""
    fm = FileManager()
    if not fm.project_exists(project_id):
        raise HTTPException(status_code=404, detail="Project not found")

    fingerprint = fm.read_style_fingerprint(project_id)
    if not fingerprint:
        raise HTTPException(status_code=404, detail="Style fingerprint not found. Analyze content first.")

    return StyleFingerprintResponse(
        project_id=project_id,
        analyzed_at=fingerprint.analyzed_at.isoformat() if fingerprint.analyzed_at else "",
        confidence=fingerprint.confidence,
        sentence_patterns=fingerprint.sentence_patterns.model_dump(),
        vocabulary_profile=fingerprint.vocabulary_profile.model_dump(),
        description_style=fingerprint.description_style.model_dump(),
        narrative_rhythm=fingerprint.narrative_rhythm.model_dump(),
    )


@router.post("/style/compare")
async def compare_styles(request: StyleCompareRequest):
    """
    比较两段文本的笔风相似度

    返回相似度分数和差异分析。
    """
    fp1 = await analyze_content_style(request.content1, "temp1")
    fp2 = await analyze_content_style(request.content2, "temp2")

    # Calculate similarity
    similarity = calculate_style_similarity(fp1, fp2)

    return {
        "similarity_score": similarity,
        "analysis": {
            "sentence_similarity": calculate_dict_similarity(fp1["sentence_patterns"], fp2["sentence_patterns"]),
            "vocabulary_similarity": calculate_dict_similarity(fp1["vocabulary_profile"], fp2["vocabulary_profile"]),
            "description_similarity": calculate_dict_similarity(fp1["description_style"], fp2["description_style"]),
        },
    }


# ============================================================================
# Content Import Endpoints
# ============================================================================

# In-memory task storage (use Redis in production)
_import_tasks: Dict[str, ImportStatus] = {}


@router.post("/projects/{project_id}/import/upload", response_model=ImportStatus)
async def upload_content(
    project_id: str,
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
):
    """
    上传文件导入内容

    支持 .txt 和 .md 文件。
    """
    fm = FileManager()
    if not fm.project_exists(project_id):
        raise HTTPException(status_code=404, detail="Project not found")

    # Validate file type
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")

    ext = Path(file.filename).suffix.lower()
    if ext not in [".txt", ".md"]:
        raise HTTPException(status_code=400, detail="Only .txt and .md files are supported")

    # Create task
    import uuid
    task_id = f"import_{uuid.uuid4().hex[:8]}"

    task = ImportStatus(
        task_id=task_id,
        project_id=project_id,
        status="pending",
        progress=0,
        message="File uploaded, processing...",
    )
    _import_tasks[task_id] = task

    # Save file temporarily
    content = await file.read()
    content_str = content.decode("utf-8")

    # Process in background
    background_tasks.add_task(
        process_import,
        task_id,
        project_id,
        file.filename,
        content_str,
    )

    return task


@router.get("/import/status/{task_id}", response_model=ImportStatus)
async def get_import_status(task_id: str):
    """获取导入任务状态"""
    if task_id not in _import_tasks:
        raise HTTPException(status_code=404, detail="Task not found")

    return _import_tasks[task_id]


@router.get("/projects/{project_id}/import/history", response_model=List[ImportResult])
async def get_import_history(project_id: str):
    """获取项目的导入历史"""
    # Return completed imports for this project
    results = []
    for task in _import_tasks.values():
        if task.project_id == project_id and task.status == "completed":
            results.append(ImportResult(
                task_id=task.task_id,
                project_id=project_id,
                file_name="",
                total_chapters=task.chapters_imported,
                total_words=task.total_words,
                characters_detected=[],
                status=task.status,
            ))
    return results


# ============================================================================
# Helper Functions
# ============================================================================

async def analyze_content_style(content: str, project_id: str) -> Dict[str, Any]:
    """分析内容笔风"""
    import re
    from collections import Counter

    # Sentence analysis
    sentences = re.split(r'[。！？\n]', content)
    sentences = [s.strip() for s in sentences if s.strip()]

    sentence_lengths = [len(s) for s in sentences]
    avg_length = sum(sentence_lengths) / len(sentence_lengths) if sentence_lengths else 0

    short_sentences = sum(1 for l in sentence_lengths if l < 20)
    long_sentences = sum(1 for l in sentence_lengths if l > 60)

    # Punctuation analysis
    punctuation_count = Counter(re.findall(r'[，。！？、；：""''（）]', content))

    # Word frequency (simplified for Chinese)
    words = re.findall(r'[\u4e00-\u9fff]+', content)
    word_freq = Counter(words)

    # Description patterns
    description_keywords = ['仿佛', '好像', '如同', '犹如', '宛如']
    description_count = sum(content.count(kw) for kw in description_keywords)
    description_density = description_count / len(content) * 1000 if content else 0

    # Dialogue patterns
    dialogue_count = len(re.findall(r'["「『]', content))

    return {
        "confidence": 0.7,  # Placeholder confidence
        "sentence_patterns": {
            "average_length": round(avg_length, 1),
            "short_ratio": round(short_sentences / len(sentences) if sentences else 0, 2),
            "long_ratio": round(long_sentences / len(sentences) if sentences else 0, 2),
            "punctuation": {k: v for k, v in punctuation_count.most_common(5)},
        },
        "vocabulary_profile": {
            "frequent_words": [w for w, _ in word_freq.most_common(20)],
            "avoided_words": [],
            "colloquial_level": 0.5,
            "dialect_words": [],
        },
        "description_style": {
            "scene_density": round(description_density, 2),
            "psychology_method": "indirect",
            "dialogue_style": "short-minimal" if dialogue_count > len(sentences) * 0.3 else "narrative",
        },
        "narrative_rhythm": {
            "chapter_average_length": len(content),
            "pacing_speed": "medium",
            "climax_cycle": 3,
        },
    }


def calculate_dict_similarity(d1: Dict, d2: Dict) -> float:
    """计算两个字典的相似度"""
    if not d1 or not d2:
        return 0.0

    keys1 = set(d1.keys())
    keys2 = set(d2.keys())

    common_keys = keys1 & keys2
    if not common_keys:
        return 0.0

    similarity = 0
    for key in common_keys:
        v1 = d1[key]
        v2 = d2[key]
        if isinstance(v1, (int, float)) and isinstance(v2, (int, float)):
            max_val = max(abs(v1), abs(v2), 1)
            similarity += 1 - abs(v1 - v2) / max_val
        elif v1 == v2:
            similarity += 1

    return round(similarity / len(common_keys), 2)


def calculate_style_similarity(fp1: Dict, fp2: Dict) -> float:
    """计算笔风相似度"""
    weights = {
        "sentence": 0.3,
        "vocabulary": 0.3,
        "description": 0.2,
        "narrative": 0.2,
    }

    sentence_sim = calculate_dict_similarity(fp1["sentence_patterns"], fp2["sentence_patterns"])
    vocab_sim = calculate_dict_similarity(fp1["vocabulary_profile"], fp2["vocabulary_profile"])
    desc_sim = calculate_dict_similarity(fp1["description_style"], fp2["description_style"])
    narr_sim = calculate_dict_similarity(fp1["narrative_rhythm"], fp2["narrative_rhythm"])

    total = (
        sentence_sim * weights["sentence"] +
        vocab_sim * weights["vocabulary"] +
        desc_sim * weights["description"] +
        narr_sim * weights["narrative"]
    )

    return round(total, 2)


async def process_import(task_id: str, project_id: str, filename: str, content: str):
    """处理导入任务"""
    import re
    from datetime import datetime
    from app.schemas.file_models import ChapterMD

    task = _import_tasks.get(task_id)
    if not task:
        return

    try:
        task.status = "processing"
        task.message = "Parsing content..."

        fm = FileManager()

        # Split by chapter markers
        # Pattern: 第X章, Chapter X, 【第X章】, etc.
        chapter_pattern = r'(?:第\s*(\d+)\s*章|Chapter\s*(\d+)|【第\s*(\d+)\s*章】)'
        parts = re.split(chapter_pattern, content)

        chapters = []
        chapter_num = 1

        # If no chapter markers found, treat entire content as one chapter
        if len(parts) <= 1:
            chapters.append((1, "第一章", content.strip()))
        else:
            # Parse chapters
            current_title = ""
            current_content = ""
            num = 1

            for i, part in enumerate(parts):
                if part is None:
                    continue
                part = part.strip()
                if not part:
                    continue

                # Check if this is a chapter number
                if part.isdigit():
                    if current_content:
                        chapters.append((num, current_title or f"第{num}章", current_content))
                    num = int(part)
                    current_content = ""
                    current_title = f"第{num}章"
                else:
                    current_content = part

            if current_content:
                chapters.append((num, current_title or f"第{num}章", current_content))

        task.message = f"Found {len(chapters)} chapters, importing..."

        # Import chapters
        for i, (num, title, content) in enumerate(chapters):
            chapter = ChapterMD(
                chapter=num,
                title=title,
                content=content,
                word_count=len(content.replace("\n", "").replace(" ", "")),
                created_at=datetime.now(),
                updated_at=datetime.now(),
            )
            fm.write_chapter(project_id, chapter)

            task.progress = (i + 1) / len(chapters)
            task.chapters_imported = i + 1
            task.total_words += chapter.word_count

            # Small delay for progress updates
            await asyncio.sleep(0.1)

        task.status = "completed"
        task.progress = 1.0
        task.message = f"Successfully imported {len(chapters)} chapters"

    except Exception as e:
        task.status = "error"
        task.message = f"Import failed: {str(e)}"