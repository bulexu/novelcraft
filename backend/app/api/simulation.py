"""
Simulation API endpoints for Oasis Social Simulation.
Integrates camel-ai/oasis for character interaction simulations.
"""
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel, Field

from app.services.oasis_simulation import (
    SimulationService,
    SimulationStatus,
    PlatformType,
    SimulationConfig,
    SimulationResult,
)

router = APIRouter()


# ============================================================================
# Request/Response Models
# ============================================================================

class SimulationCreateRequest(BaseModel):
    """创建模拟请求"""
    scenario: str = Field(..., description="初始场景描述")
    character_names: Optional[List[str]] = Field(None, description="指定参与的角色")
    num_rounds: int = Field(10, ge=1, le=50, description="模拟轮次")
    platform: str = Field("reddit", description="社交平台类型")


class SimulationResponse(BaseModel):
    """模拟响应"""
    simulation_id: str
    status: str
    project_id: str
    platform: str
    num_rounds: int
    agent_count: int
    seed_scenario: str
    created_at: str


class SimulationResultResponse(BaseModel):
    """模拟结果响应"""
    simulation_id: str
    status: str
    rounds_completed: int
    interactions: List[Dict[str, Any]]
    story_predictions: List[str]
    relationship_changes: List[Dict[str, Any]]
    error: Optional[str] = None


class StoryPredictionRequest(BaseModel):
    """故事预测请求"""
    chapter: int = Field(..., ge=1, description="当前章节")
    prediction_type: str = Field("character_interactions", description="预测类型")


class StoryPredictionResponse(BaseModel):
    """故事预测响应"""
    chapter: int
    characters_involved: List[str]
    predictions: List[str]
    interactions_count: int


class SimulationListResponse(BaseModel):
    """模拟列表响应"""
    items: List[SimulationResponse]
    total: int


# ============================================================================
# Service Instance
# ============================================================================

simulation_service = SimulationService()


# ============================================================================
# Endpoints
# ============================================================================

@router.post(
    "/projects/{project_id}/simulation",
    response_model=SimulationResultResponse,
    summary="创建并运行模拟",
    description="创建一个新的社交模拟并立即运行，返回模拟结果。",
)
async def create_and_run_simulation(
    project_id: str,
    request: SimulationCreateRequest,
):
    """创建并运行角色社交模拟"""
    try:
        # Parse platform type
        platform_map = {
            "twitter": PlatformType.TWITTER,
            "reddit": PlatformType.REDDIT,
            "narrative": PlatformType.NARRATIVE,
        }
        platform = platform_map.get(request.platform.lower(), PlatformType.REDDIT)

        result = await simulation_service.simulate_character_interactions(
            project_id=project_id,
            scenario=request.scenario,
            character_names=request.character_names,
            num_rounds=request.num_rounds,
            platform=platform,
        )

        return SimulationResultResponse(
            simulation_id=result.simulation_id,
            status=result.status.value,
            rounds_completed=result.rounds_completed,
            interactions=result.interactions,
            story_predictions=result.story_predictions,
            relationship_changes=result.relationship_changes,
            error=result.error,
        )

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"模拟失败: {str(e)}")


@router.post(
    "/projects/{project_id}/simulation/create",
    response_model=SimulationResponse,
    summary="创建模拟配置",
    description="仅创建模拟配置，不立即运行。使用 /simulation/{sim_id}/run 来启动。",
)
async def create_simulation_config(
    project_id: str,
    request: SimulationCreateRequest,
):
    """仅创建模拟配置"""
    try:
        from app.services.file_manager import FileManager

        fm = FileManager()

        # Load characters
        all_characters = fm.list_characters(project_id)

        if request.character_names:
            characters = [c for c in all_characters if c.name in request.character_names]
        else:
            characters = all_characters[:10]

        if not characters:
            raise HTTPException(status_code=400, detail="没有找到可用于模拟的角色")

        # Parse platform type
        platform_map = {
            "twitter": PlatformType.TWITTER,
            "reddit": PlatformType.REDDIT,
            "narrative": PlatformType.NARRATIVE,
        }
        platform = platform_map.get(request.platform.lower(), PlatformType.REDDIT)

        # Create simulation config
        config = await simulation_service.simulator.create_simulation(
            project_id=project_id,
            characters=characters,
            platform=platform,
            scenario=request.scenario,
            num_rounds=request.num_rounds,
        )

        return SimulationResponse(
            simulation_id=config.simulation_id,
            status=SimulationStatus.CREATED.value,
            project_id=config.project_id,
            platform=config.platform.value,
            num_rounds=config.num_rounds,
            agent_count=config.agent_count,
            seed_scenario=config.seed_scenario,
            created_at=config.created_at,
        )

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"创建失败: {str(e)}")


@router.post(
    "/projects/{project_id}/simulation/{simulation_id}/run",
    response_model=SimulationResultResponse,
    summary="运行模拟",
    description="运行已创建的模拟，返回结果。",
)
async def run_simulation(
    project_id: str,
    simulation_id: str,
    background_tasks: BackgroundTasks,
):
    """运行指定的模拟"""
    config = simulation_service.simulator.get_simulation(simulation_id)

    if not config:
        raise HTTPException(status_code=404, detail="模拟不存在")

    if config.project_id != project_id:
        raise HTTPException(status_code=400, detail="模拟不属于此项目")

    try:
        result = await simulation_service.simulator.run_simulation(simulation_id)

        return SimulationResultResponse(
            simulation_id=result.simulation_id,
            status=result.status.value,
            rounds_completed=result.rounds_completed,
            interactions=result.interactions,
            story_predictions=result.story_predictions,
            relationship_changes=result.relationship_changes,
            error=result.error,
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"运行失败: {str(e)}")


@router.get(
    "/projects/{project_id}/simulation/{simulation_id}",
    response_model=SimulationResultResponse,
    summary="获取模拟结果",
    description="获取已完成的模拟结果。",
)
async def get_simulation_result(
    project_id: str,
    simulation_id: str,
):
    """获取模拟结果"""
    result = simulation_service.simulator.get_result(simulation_id)

    if not result:
        raise HTTPException(status_code=404, detail="模拟结果不存在")

    # Verify project ownership
    config = simulation_service.simulator.get_simulation(simulation_id)
    if config and config.project_id != project_id:
        raise HTTPException(status_code=400, detail="模拟不属于此项目")

    return SimulationResultResponse(
        simulation_id=result.simulation_id,
        status=result.status.value,
        rounds_completed=result.rounds_completed,
        interactions=result.interactions,
        story_predictions=result.story_predictions,
        relationship_changes=result.relationship_changes,
        error=result.error,
    )


@router.get(
    "/projects/{project_id}/simulations",
    response_model=SimulationListResponse,
    summary="获取项目模拟列表",
    description="获取指定项目的所有模拟记录。",
)
async def list_project_simulations(
    project_id: str,
):
    """获取项目的所有模拟"""
    simulations = simulation_service.simulator.list_simulations(project_id)

    items = [
        SimulationResponse(
            simulation_id=s.simulation_id,
            status=SimulationStatus.CREATED.value,
            project_id=s.project_id,
            platform=s.platform.value,
            num_rounds=s.num_rounds,
            agent_count=s.agent_count,
            seed_scenario=s.seed_scenario,
            created_at=s.created_at,
        )
        for s in simulations
    ]

    return SimulationListResponse(
        items=items,
        total=len(items),
    )


@router.delete(
    "/projects/{project_id}/simulation/{simulation_id}",
    summary="删除模拟",
    description="删除指定的模拟及其数据。",
)
async def delete_simulation(
    project_id: str,
    simulation_id: str,
):
    """删除模拟"""
    config = simulation_service.simulator.get_simulation(simulation_id)

    if not config:
        raise HTTPException(status_code=404, detail="模拟不存在")

    if config.project_id != project_id:
        raise HTTPException(status_code=400, detail="模拟不属于此项目")

    success = simulation_service.simulator.delete_simulation(simulation_id)

    if success:
        return {"message": "模拟已删除", "simulation_id": simulation_id}
    else:
        raise HTTPException(status_code=500, detail="删除失败")


@router.post(
    "/projects/{project_id}/predict",
    response_model=StoryPredictionResponse,
    summary="预测故事发展",
    description="基于当前章节内容和角色状态预测故事发展。",
)
async def predict_story(
    project_id: str,
    request: StoryPredictionRequest,
):
    """预测故事发展"""
    try:
        result = await simulation_service.predict_story_development(
            project_id=project_id,
            current_chapter=request.chapter,
            prediction_type=request.prediction_type,
        )

        if "error" in result:
            raise HTTPException(status_code=400, detail=result["error"])

        return StoryPredictionResponse(
            chapter=result["chapter"],
            characters_involved=result["characters_involved"],
            predictions=result["predictions"],
            interactions_count=result["interactions_count"],
        )

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"预测失败: {str(e)}")


@router.get(
    "/platforms",
    response_model=List[str],
    summary="获取可用平台",
    description="获取支持的社交模拟平台列表。",
)
async def get_available_platforms():
    """获取可用平台类型"""
    return ["twitter", "reddit", "narrative"]