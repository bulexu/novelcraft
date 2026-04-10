"""
FileManager Service
Handles all Markdown/YAML file operations for Vibe Writing.
"""
import shutil
from pathlib import Path
from typing import Optional, List, Dict
from datetime import datetime
import yaml
import uuid

from app.config import settings
from app.schemas.file_models import (
    CharacterMD,
    ChapterMD,
    ProjectMD,
    ProjectState,
    StyleFingerprint,
    parse_md_file,
    format_md_file,
    ForeshadowingItem,
    CharacterRelation,
    PersonalityPalette,
    BehaviorBoundary,
    MotivationSystem,
    CharacterArc,
)


class FileManager:
    """
    文件管理服务
    负责项目目录结构和 Markdown/YAML 文件的读写
    """

    def __init__(self, data_dir: str = None):
        if data_dir is None:
            data_dir = settings.projects_data_dir
        self.data_dir = Path(data_dir)
        self.template_dir = Path(__file__).parent.parent.parent.parent / "data" / "projects" / "_template"

    # ========================================================================
    # Project Operations
    # ========================================================================

    def create_project(self, name: str, **kwargs) -> ProjectMD:
        """创建新项目"""
        project_id = self._generate_id()
        project_dir = self.data_dir / project_id

        # 复制模板目录
        if self.template_dir.exists():
            shutil.copytree(self.template_dir, project_dir)
        else:
            # 手动创建目录结构
            self._create_project_structure(project_dir)

        # 创建项目元信息
        project = ProjectMD(
            id=project_id,
            name=name,
            description=kwargs.get("description", ""),
            genre=kwargs.get("genre", ""),
            target_style=kwargs.get("target_style", ""),
            target_words=kwargs.get("target_words", 0),
            status="draft",
            created_at=datetime.now(),
            updated_at=datetime.now(),
        )

        self.write_project(project)

        # 初始化状态文件
        self.write_state(project_id, ProjectState())

        return project

    def _create_project_structure(self, project_dir: Path):
        """创建项目目录结构"""
        dirs = [
            project_dir,
            project_dir / "novel" / "chapters",
            project_dir / "novel" / "assets",
            project_dir / "novel" / "styles",
            project_dir / "characters",
            project_dir / "settings",
            project_dir / "analysis",
            project_dir / "state",
        ]
        for d in dirs:
            d.mkdir(parents=True, exist_ok=True)

    def read_project(self, project_id: str) -> Optional[ProjectMD]:
        """读取项目信息"""
        project_file = self.data_dir / project_id / "project.md"
        if not project_file.exists():
            return None

        content = project_file.read_text(encoding="utf-8")
        frontmatter, body = parse_md_file(content)

        return ProjectMD(
            id=frontmatter.get("id", project_id),
            name=frontmatter.get("name", ""),
            description=body,
            genre=frontmatter.get("genre", ""),
            target_style=frontmatter.get("target_style", ""),
            target_words=frontmatter.get("target_words", 0),
            status=frontmatter.get("status", "draft"),
            created_at=self._parse_datetime(frontmatter.get("created_at")),
            updated_at=self._parse_datetime(frontmatter.get("updated_at")),
        )

    def write_project(self, project: ProjectMD):
        """写入项目信息"""
        project_file = self.data_dir / project.id / "project.md"
        project_file.parent.mkdir(parents=True, exist_ok=True)

        frontmatter = {
            "id": project.id,
            "name": project.name,
            "genre": project.genre,
            "target_style": project.target_style,
            "target_words": project.target_words,
            "status": project.status,
            "created_at": project.created_at.isoformat() if project.created_at else None,
            "updated_at": datetime.now().isoformat(),
        }

        content = format_md_file(frontmatter, project.description)
        project_file.write_text(content, encoding="utf-8")

    def list_projects(self) -> List[ProjectMD]:
        """列出所有项目"""
        projects = []
        if not self.data_dir.exists():
            return projects

        for project_dir in self.data_dir.iterdir():
            if project_dir.is_dir() and not project_dir.name.startswith("_"):
                project = self.read_project(project_dir.name)
                if project:
                    projects.append(project)

        return sorted(projects, key=lambda p: p.updated_at or datetime.min, reverse=True)

    def delete_project(self, project_id: str) -> bool:
        """删除项目"""
        project_dir = self.data_dir / project_id
        if project_dir.exists():
            shutil.rmtree(project_dir)
            return True
        return False

    # ========================================================================
    # Character Operations
    # ========================================================================

    def read_character(self, project_id: str, name: str) -> Optional[CharacterMD]:
        """读取角色档案"""
        char_file = self.data_dir / project_id / "characters" / f"{name}.md"
        if not char_file.exists():
            return None

        content = char_file.read_text(encoding="utf-8")
        frontmatter, body = parse_md_file(content)

        # 解析 Markdown 正文
        sections = self._parse_sections(body)

        return CharacterMD(
            id=frontmatter.get("id", self._generate_id()),
            name=frontmatter.get("name", name),
            aliases=frontmatter.get("aliases", []),
            gender=frontmatter.get("gender"),
            age=frontmatter.get("age"),
            status=frontmatter.get("status", "alive"),
            arc_type=frontmatter.get("arc_type"),
            appearance=sections.get("外貌", ""),
            background=sections.get("背景", ""),
            personality_palette=self._parse_personality_palette(sections.get("性格调色盘", "")),
            behavior_boundary=self._parse_behavior_boundary(sections.get("行为禁区", "")),
            relationships=self._parse_relationships(sections.get("关系网络", "")),
            motivation=self._parse_motivation(sections.get("动机系统", "")),
            character_arc=self._parse_character_arc(sections.get("角色弧线", ""), frontmatter.get("arc_type")),
            created_at=self._parse_datetime(frontmatter.get("created_at")),
            updated_at=self._parse_datetime(frontmatter.get("updated_at")),
        )

    def write_character(self, project_id: str, character: CharacterMD):
        """写入角色档案"""
        char_dir = self.data_dir / project_id / "characters"
        char_dir.mkdir(parents=True, exist_ok=True)

        char_file = char_dir / f"{character.name}.md"

        frontmatter = {
            "id": character.id,
            "name": character.name,
            "aliases": character.aliases,
            "gender": character.gender,
            "age": character.age,
            "status": character.status,
            "arc_type": character.arc_type,
            "created_at": character.created_at.isoformat() if character.created_at else None,
            "updated_at": datetime.now().isoformat(),
        }

        body = self._format_character_body(character)
        content = format_md_file(frontmatter, body)
        char_file.write_text(content, encoding="utf-8")

    def list_characters(self, project_id: str) -> List[CharacterMD]:
        """列出项目所有角色"""
        characters = []
        char_dir = self.data_dir / project_id / "characters"

        if not char_dir.exists():
            return characters

        for char_file in char_dir.glob("*.md"):
            name = char_file.stem
            # Skip README files
            if name.upper() == "README":
                continue
            char = self.read_character(project_id, name)
            if char:
                characters.append(char)

        return characters

    def delete_character(self, project_id: str, name: str) -> bool:
        """删除角色"""
        char_file = self.data_dir / project_id / "characters" / f"{name}.md"
        if char_file.exists():
            char_file.unlink()
            return True
        return False

    # ========================================================================
    # Chapter Operations
    # ========================================================================

    def read_chapter(self, project_id: str, chapter_num: int) -> Optional[ChapterMD]:
        """读取章节"""
        chapter_file = self.data_dir / project_id / "novel" / "chapters" / f"{chapter_num:03d}.md"
        if not chapter_file.exists():
            return None

        content = chapter_file.read_text(encoding="utf-8")
        frontmatter, body = parse_md_file(content)

        foreshadowing = []
        for item in frontmatter.get("foreshadowing", []):
            if isinstance(item, dict):
                foreshadowing.append(ForeshadowingItem(**item))
            elif isinstance(item, str):
                foreshadowing.append(ForeshadowingItem(id=self._generate_id(), content=item))

        return ChapterMD(
            chapter=frontmatter.get("chapter", chapter_num),
            title=frontmatter.get("title", ""),
            word_count=frontmatter.get("word_count", len(body)),
            characters=frontmatter.get("characters", []),
            location=frontmatter.get("location"),
            foreshadowing=foreshadowing,
            content=body,
            created_at=self._parse_datetime(frontmatter.get("created_at")),
            updated_at=self._parse_datetime(frontmatter.get("updated_at")),
        )

    def write_chapter(self, project_id: str, chapter: ChapterMD):
        """写入章节"""
        chapter_dir = self.data_dir / project_id / "novel" / "chapters"
        chapter_dir.mkdir(parents=True, exist_ok=True)

        chapter_file = chapter_dir / f"{chapter.chapter:03d}.md"

        # 计算字数
        word_count = len(chapter.content.replace(" ", "").replace("\n", ""))

        frontmatter = {
            "chapter": chapter.chapter,
            "title": chapter.title,
            "word_count": word_count,
            "characters": chapter.characters,
            "location": chapter.location,
            "foreshadowing": [
                {"id": f.id, "content": f.content, "status": f.status}
                for f in chapter.foreshadowing
            ],
            "created_at": chapter.created_at.isoformat() if chapter.created_at else None,
            "updated_at": datetime.now().isoformat(),
        }

        content = format_md_file(frontmatter, chapter.content)
        chapter_file.write_text(content, encoding="utf-8")

        # 更新侧边栏
        self._update_sidebar(project_id)

    def list_chapters(self, project_id: str) -> List[ChapterMD]:
        """列出所有章节"""
        chapters = []
        chapter_dir = self.data_dir / project_id / "novel" / "chapters"

        if not chapter_dir.exists():
            return chapters

        for chapter_file in sorted(chapter_dir.glob("*.md")):
            chapter_num = int(chapter_file.stem)
            chapter = self.read_chapter(project_id, chapter_num)
            if chapter:
                chapters.append(chapter)

        return chapters

    def delete_chapter(self, project_id: str, chapter_num: int) -> bool:
        """删除章节"""
        chapter_file = self.data_dir / project_id / "novel" / "chapters" / f"{chapter_num:03d}.md"
        if chapter_file.exists():
            chapter_file.unlink()
            self._update_sidebar(project_id)
            return True
        return False

    # ========================================================================
    # State Operations
    # ========================================================================

    def read_state(self, project_id: str) -> ProjectState:
        """读取项目状态"""
        state_file = self.data_dir / project_id / "state" / "current-state.yaml"
        if not state_file.exists():
            return ProjectState()

        content = state_file.read_text(encoding="utf-8")
        data = yaml.safe_load(content) or {}

        return ProjectState(**data)

    def write_state(self, project_id: str, state: ProjectState):
        """写入项目状态"""
        state_dir = self.data_dir / project_id / "state"
        state_dir.mkdir(parents=True, exist_ok=True)

        state_file = state_dir / "current-state.yaml"
        state.last_sync = datetime.now()

        content = yaml.dump(state.model_dump(), allow_unicode=True, sort_keys=False)
        state_file.write_text(content, encoding="utf-8")

    # ========================================================================
    # Style Fingerprint Operations
    # ========================================================================

    def read_style_fingerprint(self, project_id: str) -> Optional[StyleFingerprint]:
        """读取笔风指纹"""
        fp_file = self.data_dir / project_id / "analysis" / "style-fingerprint.yaml"
        if not fp_file.exists():
            return None

        content = fp_file.read_text(encoding="utf-8")
        data = yaml.safe_load(content) or {}

        return StyleFingerprint(**data)

    def write_style_fingerprint(self, project_id: str, fingerprint: StyleFingerprint):
        """写入笔风指纹"""
        fp_dir = self.data_dir / project_id / "analysis"
        fp_dir.mkdir(parents=True, exist_ok=True)

        fp_file = fp_dir / "style-fingerprint.yaml"
        content = yaml.dump(fingerprint.model_dump(), allow_unicode=True, sort_keys=False)
        fp_file.write_text(content, encoding="utf-8")

    # ========================================================================
    # Utility Methods
    # ========================================================================

    def _generate_id(self) -> str:
        """生成唯一 ID"""
        return str(uuid.uuid4())[:8]

    def _parse_datetime(self, value: Optional[str]) -> Optional[datetime]:
        """解析日期时间"""
        if not value:
            return None
        try:
            return datetime.fromisoformat(value)
        except (ValueError, TypeError):
            return None

    def _parse_sections(self, body: str) -> Dict[str, str]:
        """解析 Markdown 正文为章节字典"""
        sections = {}
        current_section = None
        current_content = []

        for line in body.split("\n"):
            if line.startswith("## "):
                if current_section:
                    sections[current_section] = "\n".join(current_content).strip()
                current_section = line[3:].strip()
                current_content = []
            else:
                current_content.append(line)

        if current_section:
            sections[current_section] = "\n".join(current_content).strip()

        return sections

    def _parse_personality_palette(self, content: str) -> PersonalityPalette:
        """解析性格调色盘"""
        palette = PersonalityPalette()
        lines = content.strip().split("\n") if content else []

        current_section = None
        derivatives = []
        language_fingerprint = []

        for line in lines:
            if line.startswith("### 主色调"):
                current_section = "main"
            elif line.startswith("### 底色"):
                current_section = "base"
            elif line.startswith("### 对冲"):
                current_section = "accent"
            elif line.startswith("### 衍生"):
                current_section = "derivative"
            elif line.startswith("### 语言指纹"):
                current_section = "language"
            elif line.startswith("- ") or line.startswith("> "):
                text = line[2:].strip()
                if current_section == "main":
                    palette.main_tone = text
                elif current_section == "base":
                    palette.base_color = text
                elif current_section == "accent":
                    palette.accent = text
                elif current_section == "derivative":
                    derivatives.append({"description": text})
                elif current_section == "language":
                    language_fingerprint.append(text)

        palette.derivatives = derivatives
        palette.language_fingerprint = language_fingerprint
        return palette

    def _parse_behavior_boundary(self, content: str) -> BehaviorBoundary:
        """解析行为禁区"""
        boundary = BehaviorBoundary()
        lines = content.strip().split("\n") if content else []

        forbidden = []
        for line in lines:
            if line.startswith("- ") or line.startswith("* "):
                forbidden.append(line[2:].strip())

        boundary.forbidden_actions = forbidden
        return boundary

    def _parse_relationships(self, content: str) -> List[CharacterRelation]:
        """解析关系网络"""
        relations = []
        lines = content.strip().split("\n") if content else []

        # 解析表格格式
        for line in lines:
            if "|" in line and not line.startswith("|--"):
                parts = [p.strip() for p in line.split("|") if p.strip()]
                if len(parts) >= 3 and parts[0] != "角色":
                    relations.append(CharacterRelation(
                        target_name=parts[0],
                        relation_type=parts[1],
                        temperature=parts[2] if len(parts) > 2 else "中性",
                    ))

        return relations

    def _parse_motivation(self, content: str) -> MotivationSystem:
        """解析动机系统"""
        motivation = MotivationSystem()
        if not content:
            return motivation

        lines = content.strip().split("\n")
        current_section = None

        for line in lines:
            if line.startswith("### 目标"):
                current_section = "goals"
            elif line.startswith("### 执念"):
                current_section = "obsessions"
            elif line.startswith("### 恐惧"):
                current_section = "fears"
            elif line.startswith("### 渴望"):
                current_section = "desires"
            elif line.startswith("- ") and current_section:
                text = line[2:].strip()
                if text:
                    getattr(motivation, current_section).append(text)

        return motivation

    def _parse_character_arc(self, content: str, arc_type_from_frontmatter: Optional[str] = None) -> CharacterArc:
        """解析角色弧线"""
        arc = CharacterArc()

        # 优先使用 frontmatter 中的 arc_type
        if arc_type_from_frontmatter:
            arc.arc_type = arc_type_from_frontmatter

        if not content:
            return arc

        lines = content.strip().split("\n")
        for line in lines:
            line = line.strip()
            if line.startswith("- **类型**:"):
                arc.arc_type = line.replace("- **类型**:", "").strip()
            elif line.startswith("- **当前阶段**:"):
                arc.current_stage = line.replace("- **当前阶段**:", "").strip()
            elif line.startswith("- **面临挑战**:"):
                arc.current_challenge = line.replace("- **面临挑战**:", "").strip()
            elif line.startswith("- **预测结局**:"):
                arc.predicted_ending = line.replace("- **预测结局**:", "").strip()

        return arc

    def _format_character_body(self, char: CharacterMD) -> str:
        """格式化角色档案正文"""
        sections = []

        if char.appearance:
            sections.append(f"## 外貌\n\n{char.appearance}")

        if char.background:
            sections.append(f"## 背景\n\n{char.background}")

        # 性格调色盘
        palette = char.personality_palette
        palette_section = "## 性格调色盘\n\n"
        if palette.main_tone:
            palette_section += f"### 主色调\n\n{palette.main_tone}\n\n"
        if palette.base_color:
            palette_section += f"### 底色\n\n{palette.base_color}\n\n"
        if palette.accent:
            palette_section += f"### 对冲/点缀\n\n{palette.accent}\n\n"
        if palette.derivatives:
            palette_section += "### 衍生\n\n"
            for d in palette.derivatives:
                palette_section += f"- {d.get('description', '')}\n"
            palette_section += "\n"
        if palette.language_fingerprint:
            palette_section += "### 语言指纹\n\n"
            for l in palette.language_fingerprint:
                palette_section += f"> {l}\n"
            palette_section += "\n"
        sections.append(palette_section)

        # 动机系统
        motivation = char.motivation
        if motivation.goals or motivation.obsessions or motivation.fears or motivation.desires:
            motivation_section = "## 动机系统\n\n"
            if motivation.goals:
                motivation_section += "### 目标\n\n"
                for g in motivation.goals:
                    motivation_section += f"- {g}\n"
                motivation_section += "\n"
            if motivation.obsessions:
                motivation_section += "### 执念\n\n"
                for o in motivation.obsessions:
                    motivation_section += f"- {o}\n"
                motivation_section += "\n"
            if motivation.fears:
                motivation_section += "### 恐惧\n\n"
                for f in motivation.fears:
                    motivation_section += f"- {f}\n"
                motivation_section += "\n"
            if motivation.desires:
                motivation_section += "### 渴望\n\n"
                for d in motivation.desires:
                    motivation_section += f"- {d}\n"
                motivation_section += "\n"
            sections.append(motivation_section)

        # 行为禁区
        if char.behavior_boundary.forbidden_actions:
            boundary_section = "## 行为禁区\n\n"
            for a in char.behavior_boundary.forbidden_actions:
                boundary_section += f"- {a}\n"
            sections.append(boundary_section)

        # 关系网络
        if char.relationships:
            rel_section = "## 关系网络\n\n"
            rel_section += "| 角色 | 关系 | 温度 |\n"
            rel_section += "|-----|------|-----|\n"
            for r in char.relationships:
                rel_section += f"| {r.target_name} | {r.relation_type} | {r.temperature} |\n"
            sections.append(rel_section)

        # 角色弧线
        arc = char.character_arc
        if arc.arc_type or arc.current_stage or arc.current_challenge or arc.predicted_ending:
            arc_section = "## 角色弧线\n\n"
            if arc.arc_type:
                arc_section += f"- **类型**: {arc.arc_type}\n"
            if arc.current_stage:
                arc_section += f"- **当前阶段**: {arc.current_stage}\n"
            if arc.current_challenge:
                arc_section += f"- **面临挑战**: {arc.current_challenge}\n"
            if arc.predicted_ending:
                arc_section += f"- **预测结局**: {arc.predicted_ending}\n"
            sections.append(arc_section)

        return "\n".join(sections)

    def _update_sidebar(self, project_id: str):
        """更新 Docsify 侧边栏"""
        sidebar_file = self.data_dir / project_id / "novel" / "_sidebar.md"
        if not sidebar_file.parent.exists():
            return

        chapters = self.list_chapters(project_id)

        content = "<!-- _sidebar.md - 自动生成 -->\n\n"
        content += "- **作品信息**\n"
        content += "  - [简介](README.md)\n"
        content += "  - [角色档案](../characters/)\n"
        content += "  - [世界设定](../settings/)\n\n"
        content += "- **正文**\n"

        for chapter in chapters:
            title = chapter.title or f"第{chapter.chapter}章"
            content += f"  - [{title}](chapters/{chapter.chapter:03d}.md)\n"

        sidebar_file.write_text(content, encoding="utf-8")

    def project_exists(self, project_id: str) -> bool:
        """检查项目是否存在"""
        return (self.data_dir / project_id / "project.md").exists()

    def get_project_path(self, project_id: str) -> Path:
        """获取项目路径"""
        return self.data_dir / project_id