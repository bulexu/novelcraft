"""
File-based data models for Vibe Writing.
These models represent data stored in Markdown/YAML files.
"""
from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from pathlib import Path
import yaml
import re


# ============================================================================
# Character Models
# ============================================================================

class MotivationSystem(BaseModel):
    """动机系统"""
    goals: List[str] = Field(default_factory=list, description="目标")
    obsessions: List[str] = Field(default_factory=list, description="执念")
    fears: List[str] = Field(default_factory=list, description="恐惧")
    desires: List[str] = Field(default_factory=list, description="渴望")


class CharacterArc(BaseModel):
    """角色弧线"""
    arc_type: Optional[str] = None  # 成长型/堕落型/救赎型/平面型
    current_stage: Optional[str] = None
    current_challenge: str = ""
    predicted_ending: str = ""


class PersonalityPalette(BaseModel):
    """性格调色盘 - novel-craft 风格"""
    main_tone: str = Field(default="", description="主色调")
    base_color: str = Field(default="", description="底色")
    accent: str = Field(default="", description="对冲/点缀")
    derivatives: List[Dict[str, str]] = Field(default_factory=list, description="性格衍生")
    language_fingerprint: List[str] = Field(default_factory=list, description="语言指纹")


class BehaviorBoundary(BaseModel):
    """行为禁区"""
    forbidden_actions: List[str] = Field(default_factory=list, description="常态下不会做的事")
    exceptions: List[Dict[str, str]] = Field(default_factory=list, description="例外条件")
    reason: str = Field(default="", description="禁区存在原因")


class CharacterRelation(BaseModel):
    """角色关系"""
    target_name: str
    relation_type: str
    temperature: str = "中性"  # 温度：温暖/中性/冷淡/敌对
    evolution: List[str] = Field(default_factory=list)


class CharacterMD(BaseModel):
    """角色档案 (Markdown 格式)"""
    # YAML frontmatter
    id: str
    name: str
    aliases: List[str] = Field(default_factory=list)
    gender: Optional[str] = None
    age: Optional[int] = None
    status: str = "alive"
    arc_type: Optional[str] = None  # growth/fall/redemption (保留在 frontmatter 便于筛选)

    # Markdown content
    appearance: str = ""
    background: str = ""
    personality_palette: PersonalityPalette = Field(default_factory=PersonalityPalette)
    behavior_boundary: BehaviorBoundary = Field(default_factory=BehaviorBoundary)
    relationships: List[CharacterRelation] = Field(default_factory=list)
    motivation: MotivationSystem = Field(default_factory=MotivationSystem)
    character_arc: CharacterArc = Field(default_factory=CharacterArc)

    # Metadata
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


# ============================================================================
# Chapter Models
# ============================================================================

class ForeshadowingItem(BaseModel):
    """伏笔项"""
    id: str
    content: str
    status: str = "pending"  # pending/reminded/resolved


class ChapterMD(BaseModel):
    """章节 (Markdown 格式)"""
    # YAML frontmatter
    chapter: int
    title: str = ""
    word_count: int = 0
    characters: List[str] = Field(default_factory=list)
    location: Optional[str] = None
    foreshadowing: List[ForeshadowingItem] = Field(default_factory=list)

    # Markdown content
    content: str = ""

    # Metadata
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


# ============================================================================
# Project Models
# ============================================================================

class ProjectMD(BaseModel):
    """项目元信息 (Markdown 格式)"""
    id: str
    name: str
    description: str = ""
    genre: str = ""
    target_style: str = ""
    target_words: int = 0
    status: str = "draft"  # draft/ongoing/completed

    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


# ============================================================================
# State Models
# ============================================================================

class CharacterState(BaseModel):
    """角色当前状态"""
    name: str
    current_goal: str = ""
    current_fear: str = ""
    hiding: str = ""
    relationship_temperature: Dict[str, str] = Field(default_factory=dict)
    body_state: str = ""
    mental_state: str = ""


class EmotionalDebt(BaseModel):
    """情感债"""
    debtor: str  # 欠债人
    creditor: str  # 债主
    debt_type: str  # 未说出口的话/未完成的回应/该来的道歉
    how_incurred: str  # 怎么欠下的
    why_unpaid: str  # 为什么还没还
    suitable_scenes: List[str] = Field(default_factory=list)
    urgency: str = "低"  # 低/中/高


class ForeshadowingTrack(BaseModel):
    """伏笔追踪"""
    id: str
    content: str
    first_appear: str  # 章节位置
    promise: str  # 向读者承诺了什么
    reminder_nodes: List[str] = Field(default_factory=list)
    expected_resolution: str = ""
    status: str = "pending"  # pending/reminded/resolved


class ProjectState(BaseModel):
    """项目运行状态"""
    current_chapter: int = 0
    current_arc: str = ""
    timeline_position: str = ""

    character_states: List[CharacterState] = Field(default_factory=list)
    emotional_debts: List[EmotionalDebt] = Field(default_factory=list)
    foreshadowing_tracks: List[ForeshadowingTrack] = Field(default_factory=list)

    last_sync: Optional[datetime] = None


# ============================================================================
# Style Fingerprint Models
# ============================================================================

class SentencePatterns(BaseModel):
    """句式特征"""
    average_length: float = 0.0
    short_ratio: float = 0.0
    long_ratio: float = 0.0
    punctuation: Dict[str, float] = Field(default_factory=dict)


class VocabularyProfile(BaseModel):
    """词汇特征"""
    frequent_words: List[str] = Field(default_factory=list)
    avoided_words: List[str] = Field(default_factory=list)
    colloquial_level: float = 0.0
    dialect_words: List[str] = Field(default_factory=list)


class DescriptionStyle(BaseModel):
    """描写风格"""
    scene_density: float = 0.0
    psychology_method: str = "indirect"
    dialogue_style: str = "short-minimal"


class NarrativeRhythm(BaseModel):
    """叙事节奏"""
    chapter_average_length: int = 0
    pacing_speed: str = "medium"
    climax_cycle: int = 0


class StyleFingerprint(BaseModel):
    """笔风指纹"""
    project_id: str
    analyzed_at: Optional[datetime] = None
    confidence: float = 0.0

    sentence_patterns: SentencePatterns = Field(default_factory=SentencePatterns)
    vocabulary_profile: VocabularyProfile = Field(default_factory=VocabularyProfile)
    description_style: DescriptionStyle = Field(default_factory=DescriptionStyle)
    narrative_rhythm: NarrativeRhythm = Field(default_factory=NarrativeRhythm)


# ============================================================================
# Parsing Utilities
# ============================================================================

def parse_md_file(content: str) -> tuple[dict, str]:
    """解析 Markdown 文件，提取 YAML frontmatter 和正文"""
    pattern = r'^---\s*\n(.*?)\n---\s*\n(.*)$'
    match = re.match(pattern, content, re.DOTALL)

    if match:
        frontmatter = yaml.safe_load(match.group(1))
        body = match.group(2).strip()
        return frontmatter, body

    return {}, content


def format_md_file(frontmatter: dict, body: str) -> str:
    """格式化 Markdown 文件"""
    frontmatter_str = yaml.dump(frontmatter, allow_unicode=True, sort_keys=False)
    return f"---\n{frontmatter_str}---\n\n{body}"