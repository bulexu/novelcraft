"""
Inference Engine for Character Behavior Prediction.

Implements a multi-factor weighted model to predict character behaviors
based on personality traits, current state, motivation, and external pressure.

Weight Distribution:
- Personality Traits: 40%
- Current State: 20%
- Internal Motivation: 25%
- External Pressure: 15%
"""
from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional
from datetime import datetime

from app.schemas.file_models import (
    CharacterMD,
    PersonalityPalette,
    MotivationSystem,
    CharacterState,
)
from app.services.oasis_simulation import (
    OasisSocialSimulator,
    CharacterProfile,
    PlatformType,
)


# ============================================================================
# Weight Constants
# ============================================================================

WEIGHT_PERSONALITY = 0.40
WEIGHT_CURRENT_STATE = 0.20
WEIGHT_MOTIVATION = 0.25
WEIGHT_EXTERNAL_PRESSURE = 0.15


# ============================================================================
# Data Models
# ============================================================================

@dataclass
class WeightedFactors:
    """Weighted factors for behavior inference"""
    personality_score: float = 0.0
    personality_factors: List[str] = field(default_factory=list)

    current_state_score: float = 0.0
    current_state_factors: List[str] = field(default_factory=list)

    motivation_score: float = 0.0
    motivation_factors: List[str] = field(default_factory=list)

    external_pressure_score: float = 0.0
    external_pressure_factors: List[str] = field(default_factory=list)

    total_weighted_score: float = 0.0


@dataclass
class BehaviorChoice:
    """A predicted behavior choice"""
    description: str
    probability: float
    confidence: str  # high, medium, low
    related_factors: List[str] = field(default_factory=list)


@dataclass
class InferenceResult:
    """Result of behavior inference"""
    character_name: str
    behaviors: List[BehaviorChoice]
    motivation_analysis: str
    factors_applied: Dict[str, float]
    scenario: str
    timestamp: str = field(default_factory=lambda: datetime.now().isoformat())


# ============================================================================
# Inference Engine
# ============================================================================

class InferenceEngine:
    """
    Multi-factor weighted behavior inference engine.

    Predicts character behaviors based on:
    1. Personality traits (40% weight)
    2. Current state (20% weight)
    3. Internal motivation (25% weight)
    4. External pressure (15% weight)
    """

    def __init__(self):
        self.simulator = OasisSocialSimulator()

    def calculate_weighted_factors(
        self,
        character: CharacterMD,
        current_state: Optional[CharacterState] = None,
        external_pressure: Optional[str] = None,
    ) -> WeightedFactors:
        """
        Calculate weighted factors for behavior inference.

        Args:
            character: Character data from file
            current_state: Optional current state of the character
            external_pressure: Optional external pressure description

        Returns:
            WeightedFactors with calculated scores
        """
        result = WeightedFactors()

        # 1. Personality Traits (40%)
        personality = character.personality_palette
        personality_factors = self._extract_personality_factors(personality)
        result.personality_factors = personality_factors
        result.personality_score = len(personality_factors) * WEIGHT_PERSONALITY / 3.0

        # 2. Current State (20%)
        if current_state:
            state_factors = self._extract_state_factors(current_state)
            result.current_state_factors = state_factors
            result.current_state_score = len(state_factors) * WEIGHT_CURRENT_STATE / 3.0

        # 3. Internal Motivation (25%)
        motivation = character.motivation
        motivation_factors = self._extract_motivation_factors(motivation)
        result.motivation_factors = motivation_factors
        result.motivation_score = len(motivation_factors) * WEIGHT_MOTIVATION / 4.0

        # 4. External Pressure (15%)
        if external_pressure:
            pressure_factors = [external_pressure]
            result.external_pressure_factors = pressure_factors
            result.external_pressure_score = WEIGHT_EXTERNAL_PRESSURE

        # Calculate total weighted score
        result.total_weighted_score = (
            result.personality_score +
            result.current_state_score +
            result.motivation_score +
            result.external_pressure_score
        )

        return result

    def _extract_personality_factors(
        self,
        personality: PersonalityPalette,
    ) -> List[str]:
        """Extract personality factors from PersonalityPalette"""
        factors = []

        if personality.main_tone:
            factors.append(f"主色调: {personality.main_tone}")
        if personality.base_color:
            factors.append(f"底色: {personality.base_color}")
        if personality.accent:
            factors.append(f"对冲: {personality.accent}")

        # Add derivatives
        for derivative in personality.derivatives[:2]:
            if isinstance(derivative, dict):
                for key, value in derivative.items():
                    factors.append(f"{key}: {value}")

        return factors

    def _extract_state_factors(
        self,
        state: CharacterState,
    ) -> List[str]:
        """Extract state factors from CharacterState"""
        factors = []

        if state.mental_state:
            factors.append(f"心理状态: {state.mental_state}")
        if state.body_state:
            factors.append(f"身体状态: {state.body_state}")
        if state.current_goal:
            factors.append(f"当前目标: {state.current_goal}")
        if state.current_fear:
            factors.append(f"当前恐惧: {state.current_fear}")

        return factors[:3]  # Limit to top 3

    def _extract_motivation_factors(
        self,
        motivation: MotivationSystem,
    ) -> List[str]:
        """Extract motivation factors from MotivationSystem"""
        factors = []

        if motivation.goals:
            factors.append(f"目标: {motivation.goals[0]}")
        if motivation.obsessions:
            factors.append(f"执念: {motivation.obsessions[0]}")
        if motivation.fears:
            factors.append(f"恐惧: {motivation.fears[0]}")
        if motivation.desires:
            factors.append(f"渴望: {motivation.desires[0]}")

        return factors

    async def infer_behaviors(
        self,
        project_id: str,
        character: CharacterMD,
        scenario: str,
        current_state: Optional[CharacterState] = None,
        external_pressure: Optional[str] = None,
    ) -> InferenceResult:
        """
        Infer character behaviors based on weighted factors.

        Args:
            project_id: Project ID
            character: Character data
            scenario: Scenario description
            current_state: Optional current state
            external_pressure: Optional external pressure

        Returns:
            InferenceResult with predicted behaviors
        """
        # Calculate weighted factors
        weighted_factors = self.calculate_weighted_factors(
            character=character,
            current_state=current_state,
            external_pressure=external_pressure,
        )

        # Build enhanced scenario with weighted factors
        enhanced_scenario = self._build_enhanced_scenario(
            scenario=scenario,
            character=character,
            weighted_factors=weighted_factors,
        )

        # Run simulation to get behavior predictions
        try:
            sim_result = await self.simulator.simulate_character_interactions(
                project_id=project_id,
                scenario=enhanced_scenario,
                character_names=[character.name],
                num_rounds=3,  # Quick inference
                platform=PlatformType.NARRATIVE,
            )

            # Extract behaviors from simulation result
            behaviors = self._extract_behaviors_from_simulation(
                sim_result,
                weighted_factors,
            )

        except Exception as e:
            # Fallback to default behaviors if simulation fails
            behaviors = self._generate_default_behaviors(
                character,
                weighted_factors,
            )

        # Generate motivation analysis
        motivation_analysis = self._generate_motivation_analysis(
            character=character,
            weighted_factors=weighted_factors,
            behaviors=behaviors,
        )

        return InferenceResult(
            character_name=character.name,
            behaviors=behaviors,
            motivation_analysis=motivation_analysis,
            factors_applied={
                "personality_weight": WEIGHT_PERSONALITY,
                "current_state_weight": WEIGHT_CURRENT_STATE,
                "motivation_weight": WEIGHT_MOTIVATION,
                "external_pressure_weight": WEIGHT_EXTERNAL_PRESSURE,
            },
            scenario=scenario,
        )

    def _build_enhanced_scenario(
        self,
        scenario: str,
        character: CharacterMD,
        weighted_factors: WeightedFactors,
    ) -> str:
        """Build enhanced scenario with character factors"""
        parts = [f"场景: {scenario}"]

        if weighted_factors.personality_factors:
            parts.append(f"\n角色性格特质: {', '.join(weighted_factors.personality_factors)}")

        if weighted_factors.current_state_factors:
            parts.append(f"\n当前状态: {', '.join(weighted_factors.current_state_factors)}")

        if weighted_factors.motivation_factors:
            parts.append(f"\n内在动机: {', '.join(weighted_factors.motivation_factors)}")

        if weighted_factors.external_pressure_factors:
            parts.append(f"\n外部压力: {', '.join(weighted_factors.external_pressure_factors)}")

        parts.append(f"\n\n请预测角色 '{character.name}' 在此场景下可能的3种行为选择。")

        return "\n".join(parts)

    def _extract_behaviors_from_simulation(
        self,
        sim_result: Any,
        weighted_factors: WeightedFactors,
    ) -> List[BehaviorChoice]:
        """Extract behavior choices from simulation result"""
        behaviors = []

        # Extract from story predictions
        predictions = sim_result.story_predictions or []

        for i, prediction in enumerate(predictions[:3]):
            # Calculate probability based on position and factors
            base_prob = 0.45 - (i * 0.10)
            adjusted_prob = base_prob * (1 + weighted_factors.total_weighted_score / 4)
            adjusted_prob = min(0.60, max(0.10, adjusted_prob))

            # Determine confidence
            if adjusted_prob >= 0.40:
                confidence = "high"
            elif adjusted_prob >= 0.25:
                confidence = "medium"
            else:
                confidence = "low"

            behaviors.append(BehaviorChoice(
                description=prediction,
                probability=round(adjusted_prob, 2),
                confidence=confidence,
                related_factors=weighted_factors.personality_factors[:2],
            ))

        # Pad with default if needed
        while len(behaviors) < 3:
            behaviors.append(BehaviorChoice(
                description="需要更多上下文信息才能预测",
                probability=0.15,
                confidence="low",
                related_factors=[],
            ))

        return behaviors

    def _generate_default_behaviors(
        self,
        character: CharacterMD,
        weighted_factors: WeightedFactors,
    ) -> List[BehaviorChoice]:
        """Generate default behaviors when simulation fails"""
        personality = character.personality_palette
        main_trait = personality.main_tone or "稳重"

        behaviors = [
            BehaviorChoice(
                description=f"基于{main_trait}的性格，选择观察等待",
                probability=0.40,
                confidence="medium",
                related_factors=weighted_factors.personality_factors[:2],
            ),
            BehaviorChoice(
                description="寻求更多信息后再做决定",
                probability=0.30,
                confidence="medium",
                related_factors=weighted_factors.motivation_factors[:1],
            ),
            BehaviorChoice(
                description="按照直觉行事",
                probability=0.25,
                confidence="low",
                related_factors=[],
            ),
        ]

        return behaviors

    def _generate_motivation_analysis(
        self,
        character: CharacterMD,
        weighted_factors: WeightedFactors,
        behaviors: List[BehaviorChoice],
    ) -> str:
        """Generate motivation analysis text"""
        parts = []

        # Personality analysis
        if weighted_factors.personality_factors:
            traits = "、".join([f.split(": ")[1] if ": " in f else f for f in weighted_factors.personality_factors[:3]])
            parts.append(f"基于{character.name}'{traits}'的性格特质")

        # Motivation analysis
        if weighted_factors.motivation_factors:
            motivation = weighted_factors.motivation_factors[0]
            parts.append(f"和{motivation}的内在驱动")

        # Behavior prediction explanation
        if behaviors:
            top_behavior = behaviors[0]
            parts.append(f"，最可能选择'{top_behavior.description}'（概率{int(top_behavior.probability * 100)}%）")

        return "".join(parts) if parts else f"基于{character.name}的设定进行行为推演"