"""
VibeWriter Core Service
Central AI-powered writing assistant for novel creation.
"""
from typing import Optional, List, Dict, Any
from pathlib import Path
from datetime import datetime
import json
import yaml

from app.config import settings
from app.services.file_manager import FileManager
from app.services.lightrag_service import KnowledgeGraphService
from app.schemas.file_models import ChapterMD


class PromptService:
    """
    提示词加载服务
    从 prompts 目录加载各类提示词
    """

    def __init__(self, prompts_dir: str = None):
        if prompts_dir is None:
            prompts_dir = str(Path(__file__).parent.parent.parent.parent / "prompts")
        self.prompts_dir = Path(prompts_dir)

    def get_system_prompt(self, name: str) -> str:
        """获取系统提示词"""
        return self._load_prompt("system", name)

    def get_patch_prompt(self, name: str) -> str:
        """获取补丁提示词"""
        return self._load_prompt("patches", name)

    def get_template(self, category: str, name: str) -> str:
        """获取模板"""
        return self._load_prompt("templates", f"{category}-templates")

    def _load_prompt(self, category: str, name: str) -> str:
        """加载提示词文件"""
        file_path = self.prompts_dir / category / f"{name}.md"
        if not file_path.exists():
            return ""
        return file_path.read_text(encoding="utf-8")


class VibeWriter:
    """
    VibeWriting 核心服务
    负责 AI 辅助写作的核心逻辑
    """

    def __init__(
        self,
        project_id: str,
        file_manager: FileManager = None,
        llm_client: Any = None,
    ):
        self.project_id = project_id
        self.file_manager = file_manager or FileManager()
        self.prompt_service = PromptService()
        self.llm_client = llm_client
        self._kg_service = None

    @property
    def kg_service(self) -> KnowledgeGraphService:
        """知识图谱服务（懒加载）"""
        if self._kg_service is None:
            self._kg_service = KnowledgeGraphService(self.project_id)
        return self._kg_service

    # ========================================================================
    # Context Building
    # ========================================================================

    def build_context(self) -> Dict[str, Any]:
        """
        构建当前项目的完整上下文
        用于 AI 理解项目状态
        """
        project = self.file_manager.read_project(self.project_id)
        characters = self.file_manager.list_characters(self.project_id)
        chapters = self.file_manager.list_chapters(self.project_id)
        state = self.file_manager.read_state(self.project_id)
        style = self.file_manager.read_style_fingerprint(self.project_id)

        return {
            "project": project.model_dump() if project else None,
            "characters": [c.model_dump() for c in characters],
            "chapters": [
                {
                    "chapter": c.chapter,
                    "title": c.title,
                    "word_count": c.word_count,
                    "characters": c.characters,
                    "location": c.location,
                    "summary": self._get_chapter_summary(c),
                }
                for c in chapters
            ],
            "state": state.model_dump(),
            "style": style.model_dump() if style else None,
            "total_words": sum(c.word_count for c in chapters),
        }

    def _get_chapter_summary(self, chapter: ChapterMD, max_length: int = 200) -> str:
        """获取章节摘要"""
        content = chapter.content
        if len(content) <= max_length:
            return content
        return content[:max_length] + "..."

    def get_character_context(self, name: str) -> Dict[str, Any]:
        """
        获取角色的完整上下文
        包括性格、关系、历史状态等
        """
        character = self.file_manager.read_character(self.project_id, name)
        if not character:
            return None

        state = self.file_manager.read_state(self.project_id)

        # 查找角色的当前状态
        char_state = None
        for cs in state.character_states:
            if cs.name == name:
                char_state = cs.model_dump()
                break

        return {
            "character": character.model_dump(),
            "current_state": char_state,
            "relationships": [r.model_dump() for r in character.relationships],
        }

    # ========================================================================
    # AI Interaction
    # ========================================================================

    async def chat(
        self,
        message: str,
        session_id: str = None,
        context_focus: str = None,
    ) -> Dict[str, Any]:
        """
        与 AI 进行对话

        Args:
            message: 用户消息
            session_id: 会话 ID（可选）
            context_focus: 上下文焦点（可选，如 "character:李明"）

        Returns:
            AI 响应
        """
        # 构建系统提示词
        system_prompt = self.prompt_service.get_system_prompt("novelcraft-system")

        # 构建项目上下文
        context = self.build_context()

        # 根据焦点添加额外上下文
        focused_context = {}
        if context_focus:
            if context_focus.startswith("character:"):
                char_name = context_focus.split(":")[1]
                focused_context = self.get_character_context(char_name) or {}
            elif context_focus.startswith("chapter:"):
                chapter_num = int(context_focus.split(":")[1])
                chapter = self.file_manager.read_chapter(self.project_id, chapter_num)
                if chapter:
                    focused_context = {"current_chapter": chapter.model_dump()}

        # 构建完整提示
        full_context = {
            "project_context": context,
            "focused_context": focused_context,
        }

        # 调用 LLM
        response = await self._call_llm(
            system_prompt=system_prompt,
            user_message=message,
            context=full_context,
        )

        return {
            "response": response,
            "session_id": session_id,
            "context_used": {
                "project_id": self.project_id,
                "focus": context_focus,
            },
            "timestamp": datetime.now().isoformat(),
        }

    async def _call_llm(
        self,
        system_prompt: str,
        user_message: str,
        context: Dict[str, Any],
    ) -> str:
        """
        调用 LLM API

        Args:
            system_prompt: 系统提示词
            user_message: 用户消息
            context: 上下文信息

        Returns:
            LLM 响应文本
        """
        # 如果有配置的 LLM 客户端，使用它
        if self.llm_client is not None:
            try:
                # 构建消息
                messages = [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": f"上下文:\n{json.dumps(context, ensure_ascii=False, indent=2)}\n\n{user_message}"},
                ]

                response = await self.llm_client.chat(
                    model=settings.llm_model_name,
                    messages=messages,
                    temperature=settings.llm_temperature,
                    max_tokens=settings.llm_max_tokens,
                )
                return response.choices[0].message.content
            except Exception as e:
                return f"LLM 调用失败: {str(e)}"

        # 如果没有 LLM 客户端，返回模拟响应
        return self._mock_response(user_message, context)

    def _mock_response(self, message: str, context: Dict[str, Any]) -> str:
        """
        模拟响应（用于测试或无 LLM 时）
        """
        project = context.get("project_context", {}).get("project", {})
        project_name = project.get("name", "未知项目")

        return f"[模拟响应] 收到关于项目 \"{project_name}\" 的消息: \"{message[:50]}...\"\n\n请配置 LLM API 以获得真实响应。"

    # ========================================================================
    # Character Inference
    # ========================================================================

    async def infer_character_behavior(
        self,
        character_name: str,
        scenario: str,
        factors: Dict[str, Any] = None,
    ) -> Dict[str, Any]:
        """
        推演角色行为

        Args:
            character_name: 角色名
            scenario: 场景描述
            factors: 额外因素（可选）

        Returns:
            行为推演结果
        """
        # 加载角色推演提示词
        inference_prompt = self.prompt_service.get_system_prompt("character-inference")

        # 获取角色上下文
        char_context = self.get_character_context(character_name)
        if not char_context:
            return {
                "error": f"角色 '{character_name}' 不存在",
                "character_name": character_name,
            }

        # 获取项目状态
        state = self.file_manager.read_state(self.project_id)

        # 构建推演输入
        inference_input = {
            "character": char_context["character"],
            "current_state": char_context.get("current_state", {}),
            "relationships": char_context.get("relationships", []),
            "scenario": scenario,
            "project_state": {
                "current_chapter": state.current_chapter,
                "current_arc": state.current_arc,
            },
            "external_factors": factors or {},
        }

        # 调用 LLM
        response = await self._call_llm(
            system_prompt=inference_prompt,
            user_message=f"请推演角色在以下场景中的行为:\n{json.dumps(inference_input, ensure_ascii=False, indent=2)}",
            context=inference_input,
        )

        return {
            "character_name": character_name,
            "scenario": scenario,
            "inference_result": response,
            "factors_used": {
                "personality_weight": 0.4,
                "state_weight": 0.2,
                "motivation_weight": 0.25,
                "pressure_weight": 0.15,
            },
            "timestamp": datetime.now().isoformat(),
        }

    # ========================================================================
    # Style Continuation
    # ========================================================================

    async def continue_with_style(
        self,
        context_content: str,
        target_length: int = 500,
        direction: str = None,
    ) -> Dict[str, Any]:
        """
        笔风匹配续写

        Args:
            context_content: 上下文内容（已有内容）
            target_length: 目标字数
            direction: 续写方向提示（可选）

        Returns:
            续写结果
        """
        # 加载笔风续写提示词
        style_prompt = self.prompt_service.get_system_prompt("style-continuation")

        # 获取笔风指纹
        style = self.file_manager.read_style_fingerprint(self.project_id)

        # 构建续写输入
        continuation_input = {
            "context_content": context_content,
            "target_length": target_length,
            "direction": direction,
            "style_fingerprint": style.model_dump() if style else None,
        }

        # 调用 LLM
        response = await self._call_llm(
            system_prompt=style_prompt,
            user_message=f"请根据笔风指纹续写以下内容:\n{json.dumps(continuation_input, ensure_ascii=False, indent=2)}",
            context=continuation_input,
        )

        return {
            "continued_content": response,
            "target_length": target_length,
            "style_matched": style is not None,
            "timestamp": datetime.now().isoformat(),
        }

    # ========================================================================
    # Consistency Check
    # ========================================================================

    async def check_consistency(
        self,
        content: str,
        check_type: str = "all",
    ) -> Dict[str, Any]:
        """
        一致性检查

        Args:
            content: 要检查的内容
            check_type: 检查类型 (character/world/narrative/all)

        Returns:
            检查结果
        """
        # 加载一致性检查提示词
        checker_prompt = self.prompt_service.get_system_prompt("consistency-checker")

        # 加载反模板补丁
        anti_template = self.prompt_service.get_patch_prompt("anti-template")

        # 获取项目上下文
        context = self.build_context()

        # 构建检查输入
        check_input = {
            "content_to_check": content,
            "check_type": check_type,
            "project_context": {
                "characters": context["characters"],
                "state": context["state"],
            },
            "anti_template_rules": anti_template,
        }

        # 调用 LLM
        response = await self._call_llm(
            system_prompt=checker_prompt,
            user_message=f"请检查以下内容的一致性:\n{json.dumps(check_input, ensure_ascii=False, indent=2)}",
            context=check_input,
        )

        return {
            "content_checked": content[:200] + "..." if len(content) > 200 else content,
            "check_type": check_type,
            "result": response,
            "timestamp": datetime.now().isoformat(),
        }

    # ========================================================================
    # Knowledge Graph Integration
    # ========================================================================

    async def update_knowledge_graph(self, content: str) -> Dict[str, Any]:
        """
        更新知识图谱

        Args:
            content: 要添加到图谱的内容

        Returns:
            更新结果
        """
        return await self.kg_service.add_content(content, content_type="chapter")

    async def query_knowledge_graph(self, question: str) -> Dict[str, Any]:
        """
        查询知识图谱

        Args:
            question: 问题

        Returns:
            查询结果
        """
        return await self.kg_service.query(question)

    # ========================================================================
    # Session Management
    # ========================================================================

    def save_session(self, session_id: str, messages: List[Dict[str, str]]) -> None:
        """
        保存会话记录

        Args:
            session_id: 会话 ID
            messages: 消息列表
        """
        session_dir = self.file_manager.get_project_path(self.project_id) / "state" / "sessions"
        session_dir.mkdir(parents=True, exist_ok=True)

        session_file = session_dir / f"{session_id}.yaml"

        session_data = {
            "session_id": session_id,
            "project_id": self.project_id,
            "messages": messages,
            "saved_at": datetime.now().isoformat(),
        }

        content = yaml.dump(session_data, allow_unicode=True, sort_keys=False)
        session_file.write_text(content, encoding="utf-8")

    def load_session(self, session_id: str) -> Optional[Dict[str, Any]]:
        """
        加载会话记录

        Args:
            session_id: 会话 ID

        Returns:
            会话数据
        """
        session_file = (
            self.file_manager.get_project_path(self.project_id)
            / "state"
            / "sessions"
            / f"{session_id}.yaml"
        )

        if not session_file.exists():
            return None

        content = session_file.read_text(encoding="utf-8")
        return yaml.safe_load(content)

    def list_sessions(self) -> List[Dict[str, Any]]:
        """
        列出所有会话
        """
        session_dir = (
            self.file_manager.get_project_path(self.project_id)
            / "state"
            / "sessions"
        )

        if not session_dir.exists():
            return []

        sessions = []
        for session_file in session_dir.glob("*.yaml"):
            content = session_file.read_text(encoding="utf-8")
            data = yaml.safe_load(content)
            if data:
                sessions.append({
                    "session_id": data.get("session_id"),
                    "saved_at": data.get("saved_at"),
                    "message_count": len(data.get("messages", [])),
                })

        return sorted(sessions, key=lambda s: s.get("saved_at", ""), reverse=True)


class VibeWriterService:
    """
    VibeWriter 工厂服务
    管理 VibeWriter 实例
    """

    _instances: Dict[str, VibeWriter] = {}

    @classmethod
    def get_writer(cls, project_id: str, llm_client: Any = None) -> VibeWriter:
        """
        获取或创建 VibeWriter 实例

        Args:
            project_id: 项目 ID
            llm_client: LLM 客户端（可选）

        Returns:
            VibeWriter 实例
        """
        if project_id not in cls._instances:
            cls._instances[project_id] = VibeWriter(
                project_id=project_id,
                llm_client=llm_client,
            )
        return cls._instances[project_id]

    @classmethod
    def remove_writer(cls, project_id: str) -> None:
        """
        移除 VibeWriter 实例
        """
        if project_id in cls._instances:
            del cls._instances[project_id]

    @classmethod
    def list_active_projects(cls) -> List[str]:
        """
        列出所有活跃的项目
        """
        return list(cls._instances.keys())