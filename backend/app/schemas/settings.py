"""
Settings schemas for system configuration
"""
from typing import Optional
from pydantic import BaseModel, Field


class InferenceSettings(BaseModel):
    """Inference weight settings for character behavior prediction"""
    personality_weight: float = Field(default=0.4, ge=0, le=1, description="Personality trait weight")
    current_state_weight: float = Field(default=0.2, ge=0, le=1, description="Current state weight")
    motivation_weight: float = Field(default=0.25, ge=0, le=1, description="Inner motivation weight")
    external_pressure_weight: float = Field(default=0.15, ge=0, le=1, description="External pressure weight")


class AIDetectionSettings(BaseModel):
    """AI detection settings for content analysis"""
    sensitivity: str = Field(default="medium", description="Detection sensitivity: low/medium/high")
    max_de_per_clause: int = Field(default=2, ge=1, le=5, description="Max '的' per clause")
    max_modifier_length: int = Field(default=6, ge=3, le=10, description="Max modifier length before noun")
    enable_synesthesia_check: bool = Field(default=True, description="Enable synesthesia misuse check")
    enable_perspective_check: bool = Field(default=True, description="Enable perspective consistency check")


class StyleSettings(BaseModel):
    """Style settings for writing"""
    default_style: str = Field(default="default", description="Default writing style")
    available_styles: list[str] = Field(
        default=["default", "jin_yong", "zhang_ailing", "priest", "mao_ni"],
        description="Available writing styles"
    )


class LLMSettings(BaseModel):
    """LLM configuration settings"""
    model_name: str = Field(default="gpt-4", description="Model name")
    temperature: float = Field(default=0.7, ge=0, le=2, description="Temperature")
    max_tokens: int = Field(default=4000, ge=100, le=32000, description="Max tokens")
    base_url: Optional[str] = Field(default=None, description="API base URL")


# Default settings values
DEFAULT_SETTINGS = {
    "inference": InferenceSettings().model_dump(),
    "ai_detection": AIDetectionSettings().model_dump(),
    "style": StyleSettings().model_dump(),
    "llm": LLMSettings().model_dump(),
}