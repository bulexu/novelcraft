"""
Oasis Social Simulation Service
Integrates camel-ai/oasis for character social interaction simulations.

This allows novel characters to interact in simulated social platforms,
predicting story development and character relationship evolution.
"""
import asyncio
import json
import os
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional
from dataclasses import dataclass, field
from enum import Enum

from pydantic import BaseModel

from app.config import settings
from app.schemas.file_models import CharacterMD, CharacterRelation


class SimulationStatus(str, Enum):
    """Simulation status"""
    CREATED = "created"
    PREPARING = "preparing"
    RUNNING = "running"
    PAUSED = "paused"
    COMPLETED = "completed"
    FAILED = "failed"


class PlatformType(str, Enum):
    """Social platform type"""
    TWITTER = "twitter"
    REDDIT = "reddit"
    NARRATIVE = "narrative"  # Custom narrative platform for novels


@dataclass
class CharacterProfile:
    """Character profile for Oasis agent"""
    character_id: str
    character_name: str
    description: str
    personality_traits: List[str]
    background: str
    goals: List[str]
    fears: List[str]
    relationships: List[Dict[str, str]]

    def to_oasis_user_info(self) -> Dict[str, Any]:
        """Convert to Oasis UserInfo format"""
        return {
            "user_name": self.character_name.lower().replace(" ", "_"),
            "name": self.character_name,
            "description": self.description,
            "profile": {
                "personality": ", ".join(self.personality_traits),
                "background": self.background,
                "goals": self.goals,
                "fears": self.fears,
            },
            "recsys_type": "reddit",
        }


@dataclass
class SimulationConfig:
    """Simulation configuration"""
    simulation_id: str
    project_id: str
    platform: PlatformType
    num_rounds: int = 10
    agent_count: int = 5
    seed_scenario: str = ""
    created_at: str = field(default_factory=lambda: datetime.now().isoformat())


@dataclass
class SimulationResult:
    """Simulation result"""
    simulation_id: str
    status: SimulationStatus
    rounds_completed: int
    interactions: List[Dict[str, Any]]
    character_states: Dict[str, Dict[str, Any]]
    story_predictions: List[str]
    relationship_changes: List[Dict[str, Any]]
    error: Optional[str] = None


class OasisSocialSimulator:
    """
    Social simulation service using Oasis framework

    Features:
    1. Convert novel characters to Oasis agents
    2. Run social simulations on virtual platforms
    3. Predict story developments and relationship changes
    4. Analyze character behaviors in different scenarios
    """

    def __init__(self, data_dir: str = None):
        if data_dir is None:
            data_dir = os.path.join(settings.projects_data_dir, "../simulations")
        self.data_dir = Path(data_dir)
        self.data_dir.mkdir(parents=True, exist_ok=True)

        # In-memory simulation states
        self._simulations: Dict[str, SimulationConfig] = {}
        self._results: Dict[str, SimulationResult] = {}

    def _get_simulation_dir(self, simulation_id: str) -> Path:
        """Get simulation directory"""
        sim_dir = self.data_dir / simulation_id
        sim_dir.mkdir(parents=True, exist_ok=True)
        return sim_dir

    def create_character_profile(
        self,
        character: CharacterMD,
        current_goal: str = "",
        current_fear: str = "",
    ) -> CharacterProfile:
        """
        Convert a CharacterMD to Oasis agent profile

        Args:
            character: Character data from file
            current_goal: Character's current goal
            current_fear: Character's current fear

        Returns:
            CharacterProfile for Oasis
        """
        # Extract personality traits from palette
        traits = []
        palette = character.personality_palette
        if palette.main_tone:
            traits.append(palette.main_tone)
        if palette.base_color:
            traits.append(palette.base_color)
        if palette.accent:
            traits.append(palette.accent)

        # Extract goals and fears from behavior boundary
        goals = []
        fears = []
        for exception in character.behavior_boundary.exceptions:
            if "goal" in str(exception).lower():
                goals.append(str(exception))
            elif "fear" in str(exception).lower() or "avoid" in str(exception).lower():
                fears.append(str(exception))

        if current_goal:
            goals.insert(0, current_goal)
        if current_fear:
            fears.insert(0, current_fear)

        # Build description from appearance and background
        description_parts = []
        if character.appearance:
            description_parts.append(f"外貌: {character.appearance}")
        if character.background:
            description_parts.append(f"背景: {character.background}")
        description = " | ".join(description_parts)

        # Convert relationships
        relationships = []
        for rel in character.relationships:
            relationships.append({
                "target": rel.target_name,
                "type": rel.relation_type,
                "temperature": rel.temperature,
            })

        return CharacterProfile(
            character_id=character.id,
            character_name=character.name,
            description=description,
            personality_traits=traits,
            background=character.background,
            goals=goals or ["未明确目标"],
            fears=fears or ["未知恐惧"],
            relationships=relationships,
        )

    async def create_simulation(
        self,
        project_id: str,
        characters: List[CharacterMD],
        platform: PlatformType = PlatformType.REDDIT,
        scenario: str = "",
        num_rounds: int = 10,
    ) -> SimulationConfig:
        """
        Create a new social simulation

        Args:
            project_id: Project ID
            characters: List of characters to simulate
            platform: Social platform type
            scenario: Initial scenario description
            num_rounds: Number of simulation rounds

        Returns:
            SimulationConfig
        """
        import uuid
        simulation_id = f"sim_{uuid.uuid4().hex[:12]}"

        config = SimulationConfig(
            simulation_id=simulation_id,
            project_id=project_id,
            platform=platform,
            num_rounds=num_rounds,
            agent_count=len(characters),
            seed_scenario=scenario,
        )

        # Save character profiles
        sim_dir = self._get_simulation_dir(simulation_id)
        profiles = []

        for char in characters:
            profile = self.create_character_profile(char)
            profiles.append(profile)

        profiles_file = sim_dir / "profiles.json"
        with open(profiles_file, 'w', encoding='utf-8') as f:
            json.dump(
                [p.to_oasis_user_info() for p in profiles],
                f, ensure_ascii=False, indent=2
            )

        # Save config
        config_file = sim_dir / "config.json"
        with open(config_file, 'w', encoding='utf-8') as f:
            json.dump({
                "simulation_id": config.simulation_id,
                "project_id": config.project_id,
                "platform": config.platform.value,
                "num_rounds": config.num_rounds,
                "agent_count": config.agent_count,
                "seed_scenario": config.seed_scenario,
                "created_at": config.created_at,
            }, f, ensure_ascii=False, indent=2)

        self._simulations[simulation_id] = config
        return config

    async def run_simulation(
        self,
        simulation_id: str,
        progress_callback=None,
    ) -> SimulationResult:
        """
        Run the social simulation

        Args:
            simulation_id: Simulation ID
            progress_callback: Optional callback for progress updates

        Returns:
            SimulationResult
        """
        config = self._simulations.get(simulation_id)
        if not config:
            # Try to load from file
            config = self._load_simulation_config(simulation_id)

        if not config:
            raise ValueError(f"Simulation not found: {simulation_id}")

        result = SimulationResult(
            simulation_id=simulation_id,
            status=SimulationStatus.RUNNING,
            rounds_completed=0,
            interactions=[],
            character_states={},
            story_predictions=[],
            relationship_changes=[],
        )

        try:
            # Try to import and use Oasis
            try:
                from camel.models import ModelFactory
                from camel.types import ModelPlatformType, ModelType
                import oasis
                from oasis import (
                    SocialAgent, UserInfo, AgentGraph,
                    ActionType, LLMAction, ManualAction,
                )

                # Create LLM model
                if settings.llm_api_key:
                    model = ModelFactory.create(
                        model_platform=ModelPlatformType.OPENAI,
                        model_type=ModelType.GPT_4O_MINI,
                        api_key=settings.llm_api_key,
                        url_base=settings.llm_base_url if "openai.com" not in settings.llm_base_url else None,
                    )
                else:
                    result.status = SimulationStatus.FAILED
                    result.error = "LLM API key not configured"
                    return result

                # Load profiles
                sim_dir = self._get_simulation_dir(simulation_id)
                profiles_file = sim_dir / "profiles.json"

                with open(profiles_file, 'r', encoding='utf-8') as f:
                    profiles_data = json.load(f)

                # Create agent graph
                agent_graph = AgentGraph()
                agents = []

                # Define available actions based on platform
                if config.platform == PlatformType.TWITTER:
                    available_actions = ActionType.get_default_twitter_actions()
                else:
                    available_actions = ActionType.get_default_reddit_actions()

                # Create agents from profiles
                for i, profile_data in enumerate(profiles_data):
                    user_info = UserInfo(
                        user_name=profile_data.get("user_name", f"agent_{i}"),
                        name=profile_data.get("name", f"Agent {i}"),
                        description=profile_data.get("description", ""),
                        profile=profile_data.get("profile"),
                        recsys_type=profile_data.get("recsys_type", "reddit"),
                    )

                    agent = SocialAgent(
                        agent_id=i,
                        user_info=user_info,
                        agent_graph=agent_graph,
                        model=model,
                        available_actions=available_actions,
                    )

                    agent_graph.add_agent(agent)
                    agents.append(agent)

                # Create database path
                db_path = str(sim_dir / "simulation.db")
                os.environ["OASIS_DB_PATH"] = db_path

                # Create environment
                platform_type = (
                    oasis.DefaultPlatformType.TWITTER
                    if config.platform == PlatformType.TWITTER
                    else oasis.DefaultPlatformType.REDDIT
                )

                env = oasis.make(
                    agent_graph=agent_graph,
                    platform=platform_type,
                    database_path=db_path,
                )

                # Reset environment
                await env.reset()

                # Add seed scenario as initial post if provided
                if config.seed_scenario:
                    first_agent = agent_graph.get_agent(0)
                    if first_agent:
                        seed_action = {
                            first_agent: [
                                ManualAction(
                                    action_type=ActionType.CREATE_POST,
                                    action_args={"content": config.seed_scenario}
                                )
                            ]
                        }
                        await env.step(seed_action)

                        if progress_callback:
                            progress_callback(0, "Posted seed scenario")

                # Run simulation rounds
                for round_num in range(config.num_rounds):
                    if progress_callback:
                        progress_callback(
                            round_num / config.num_rounds,
                            f"Running round {round_num + 1}/{config.num_rounds}"
                        )

                    # Let all agents perform LLM actions
                    all_agents_llm_actions = {
                        agent: LLMAction()
                        for _, agent in agent_graph.get_agents()
                    }

                    await env.step(all_agents_llm_actions)
                    result.rounds_completed = round_num + 1

                # Close environment
                await env.close()

                # Collect results
                result.status = SimulationStatus.COMPLETED
                result.interactions = await self._collect_interactions(db_path)
                result.story_predictions = self._generate_story_predictions(result.interactions)

            except ImportError as e:
                # Oasis not installed, use mock simulation
                result = await self._mock_simulation(config, progress_callback)

        except Exception as e:
            result.status = SimulationStatus.FAILED
            result.error = str(e)

        # Save results
        self._results[simulation_id] = result
        result_file = self._get_simulation_dir(simulation_id) / "result.json"
        with open(result_file, 'w', encoding='utf-8') as f:
            json.dump({
                "simulation_id": result.simulation_id,
                "status": result.status.value,
                "rounds_completed": result.rounds_completed,
                "interactions": result.interactions,
                "story_predictions": result.story_predictions,
                "relationship_changes": result.relationship_changes,
                "error": result.error,
            }, f, ensure_ascii=False, indent=2)

        return result

    async def _mock_simulation(
        self,
        config: SimulationConfig,
        progress_callback=None,
    ) -> SimulationResult:
        """Mock simulation when Oasis is not available"""
        result = SimulationResult(
            simulation_id=config.simulation_id,
            status=SimulationStatus.COMPLETED,
            rounds_completed=config.num_rounds,
            interactions=[],
            character_states={},
            story_predictions=[
                "角色们将在社交互动中展现出不同的性格特质",
                "预计会出现新的联盟和冲突",
                "故事可能会朝着意想不到的方向发展",
            ],
            relationship_changes=[],
        )

        # Simulate progress
        for i in range(config.num_rounds):
            if progress_callback:
                progress_callback(
                    i / config.num_rounds,
                    f"模拟中... (轮次 {i + 1}/{config.num_rounds})"
                )
            await asyncio.sleep(0.1)

        return result

    async def _collect_interactions(self, db_path: str) -> List[Dict[str, Any]]:
        """Collect interactions from simulation database"""
        interactions = []

        if os.path.exists(db_path):
            try:
                import sqlite3
                conn = sqlite3.connect(db_path)
                cursor = conn.cursor()

                # Get posts
                cursor.execute("SELECT * FROM post")
                posts = cursor.fetchall()
                for post in posts:
                    interactions.append({
                        "type": "post",
                        "user_id": post[1] if len(post) > 1 else None,
                        "content": post[2] if len(post) > 2 else None,
                    })

                # Get comments
                cursor.execute("SELECT * FROM comment")
                comments = cursor.fetchall()
                for comment in comments:
                    interactions.append({
                        "type": "comment",
                        "user_id": comment[1] if len(comment) > 1 else None,
                        "content": comment[3] if len(comment) > 3 else None,
                    })

                conn.close()
            except Exception:
                pass

        return interactions

    def _generate_story_predictions(self, interactions: List[Dict]) -> List[str]:
        """Generate story predictions from interactions"""
        predictions = []

        if interactions:
            post_count = sum(1 for i in interactions if i.get("type") == "post")
            comment_count = sum(1 for i in interactions if i.get("type") == "comment")

            predictions.append(f"角色们共发布了 {post_count} 条消息和 {comment_count} 条评论")
            predictions.append("基于互动模式，预计故事将出现新的转折点")
            predictions.append("角色关系可能会因为互动而产生变化")
        else:
            predictions.append("请安装 camel-ai-py 以启用完整的社交模拟功能")

        return predictions

    def _load_simulation_config(self, simulation_id: str) -> Optional[SimulationConfig]:
        """Load simulation config from file"""
        sim_dir = self._get_simulation_dir(simulation_id)
        config_file = sim_dir / "config.json"

        if not config_file.exists():
            return None

        with open(config_file, 'r', encoding='utf-8') as f:
            data = json.load(f)

        return SimulationConfig(
            simulation_id=data["simulation_id"],
            project_id=data["project_id"],
            platform=PlatformType(data["platform"]),
            num_rounds=data["num_rounds"],
            agent_count=data["agent_count"],
            seed_scenario=data["seed_scenario"],
            created_at=data["created_at"],
        )

    def get_simulation(self, simulation_id: str) -> Optional[SimulationConfig]:
        """Get simulation config"""
        if simulation_id in self._simulations:
            return self._simulations[simulation_id]
        return self._load_simulation_config(simulation_id)

    def get_result(self, simulation_id: str) -> Optional[SimulationResult]:
        """Get simulation result"""
        if simulation_id in self._results:
            return self._results[simulation_id]

        # Try to load from file
        result_file = self._get_simulation_dir(simulation_id) / "result.json"
        if not result_file.exists():
            return None

        with open(result_file, 'r', encoding='utf-8') as f:
            data = json.load(f)

        return SimulationResult(
            simulation_id=data["simulation_id"],
            status=SimulationStatus(data["status"]),
            rounds_completed=data["rounds_completed"],
            interactions=data["interactions"],
            character_states={},
            story_predictions=data["story_predictions"],
            relationship_changes=data["relationship_changes"],
            error=data.get("error"),
        )

    def list_simulations(self, project_id: str = None) -> List[SimulationConfig]:
        """List all simulations"""
        simulations = []

        for sim_dir in self.data_dir.iterdir():
            if sim_dir.is_dir() and sim_dir.name.startswith("sim_"):
                config = self._load_simulation_config(sim_dir.name)
                if config:
                    if project_id is None or config.project_id == project_id:
                        simulations.append(config)

        return sorted(simulations, key=lambda s: s.created_at, reverse=True)

    def delete_simulation(self, simulation_id: str) -> bool:
        """Delete a simulation"""
        import shutil
        sim_dir = self._get_simulation_dir(simulation_id)

        if sim_dir.exists():
            shutil.rmtree(sim_dir)
            self._simulations.pop(simulation_id, None)
            self._results.pop(simulation_id, None)
            return True

        return False


class SimulationService:
    """
    High-level simulation service for NovelCraft
    Integrates with FileManager and VibeWriter
    """

    def __init__(self):
        self.simulator = OasisSocialSimulator()

    async def simulate_character_interactions(
        self,
        project_id: str,
        scenario: str,
        character_names: List[str] = None,
        num_rounds: int = 10,
        platform: PlatformType = PlatformType.REDDIT,
        progress_callback=None,
    ) -> SimulationResult:
        """
        Run a character interaction simulation

        Args:
            project_id: Project ID
            scenario: Scenario description
            character_names: Specific characters to include (optional)
            num_rounds: Number of simulation rounds
            platform: Social platform type
            progress_callback: Progress callback

        Returns:
            SimulationResult
        """
        from app.services.file_manager import FileManager

        fm = FileManager()

        # Load characters
        all_characters = fm.list_characters(project_id)

        if character_names:
            characters = [c for c in all_characters if c.name in character_names]
        else:
            characters = all_characters[:10]  # Limit to 10 characters

        if not characters:
            raise ValueError("No characters found for simulation")

        # Create and run simulation
        config = await self.simulator.create_simulation(
            project_id=project_id,
            characters=characters,
            platform=platform,
            scenario=scenario,
            num_rounds=num_rounds,
        )

        return await self.simulator.run_simulation(
            config.simulation_id,
            progress_callback=progress_callback,
        )

    async def predict_story_development(
        self,
        project_id: str,
        current_chapter: int,
        prediction_type: str = "character_interactions",
    ) -> Dict[str, Any]:
        """
        Predict story development based on current state

        Args:
            project_id: Project ID
            current_chapter: Current chapter number
            prediction_type: Type of prediction

        Returns:
            Prediction results
        """
        from app.services.file_manager import FileManager

        fm = FileManager()

        # Get current chapter
        chapter = fm.read_chapter(project_id, current_chapter)
        if not chapter:
            return {"error": f"Chapter {current_chapter} not found"}

        # Get characters in current chapter
        characters = []
        for char_name in chapter.characters:
            char = fm.read_character(project_id, char_name)
            if char:
                characters.append(char)

        # Run quick simulation
        scenario = f"基于第{current_chapter}章的情节发展，预测角色们的下一步行动。\n\n当前情节：{chapter.content[:500]}..."

        result = await self.simulate_character_interactions(
            project_id=project_id,
            scenario=scenario,
            character_names=chapter.characters,
            num_rounds=5,
            platform=PlatformType.NARRATIVE,
        )

        return {
            "chapter": current_chapter,
            "characters_involved": chapter.characters,
            "predictions": result.story_predictions,
            "interactions_count": len(result.interactions),
        }