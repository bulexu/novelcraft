# Backend Fix: Character 数据模型扩展

Status: complete

## Problem

Story 2.3（动机系统）和 Story 2.5（角色弧线）的前端实现已完成，但 Backend 数据模型未同步更新，导致用户填写的数据无法持久化。

## Affected Stories

- Story 2.3: 动机系统记录 — `motivation` 字段缺失
- Story 2.5: 角色弧线记录 — `character_arc` 字段缺失

## Current State

### Frontend (已完成)

```typescript
// frontend/src/types/index.ts
export interface MotivationSystem {
  goals: string[];        // 目标
  obsessions: string[];   // 执念
  fears: string[];        // 恐惧
  desires: string[];      // 渴望
}

export interface CharacterArc {
  arc_type: string | null;        // 弧线类型
  current_stage: string | null;   // 当前阶段
  current_challenge: string;      // 面临挑战
  predicted_ending: string;       // 预测结局
}

export interface Character {
  // ... 其他字段
  motivation?: MotivationSystem;
  character_arc?: CharacterArc;
}
```

### Backend (缺失)

```python
# backend/app/schemas/file_models.py
class CharacterMD(BaseModel):
    # 当前仅有 arc_type: Optional[str]
    # 缺少 motivation 和完整的 character_arc
```

## Tasks

- [x] Task 1: 扩展 Backend 数据模型
  - [x] 1.1 在 `file_models.py` 添加 `MotivationSystem` 模型
  - [x] 1.2 在 `file_models.py` 添加 `CharacterArc` 模型
  - [x] 1.3 更新 `CharacterMD` 添加 `motivation` 和 `character_arc` 字段

- [x] Task 2: 更新 FileManager 读写逻辑
  - [x] 2.1 更新 `read_character()` 解析动机系统和弧线数据
  - [x] 2.2 更新 `write_character()` 写入动机系统和弧线数据
  - [x] 2.3 更新 `_format_character_body()` 格式化 Markdown

- [x] Task 3: 数据迁移兼容
  - [x] 3.1 确保旧角色文件（无这些字段）能正常读取
  - [x] 3.2 新字段使用可选默认值

- [x] Task 4: 验证测试
  - [x] 4.1 测试角色创建（包含动机和弧线）
  - [x] 4.2 测试角色编辑（更新动机和弧线）
  - [x] 4.3 测试前端数据持久化

## Implementation Details

### Task 1: 数据模型定义

```python
# backend/app/schemas/file_models.py

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


class CharacterMD(BaseModel):
    """角色档案"""
    # ... 现有字段 ...
    
    # 新增字段
    motivation: MotivationSystem = Field(default_factory=MotivationSystem)
    character_arc: CharacterArc = Field(default_factory=CharacterArc)
```

### Task 2: FileManager 更新

**Markdown 格式设计：**

```markdown
## 动机系统

### 目标
- 目标1
- 目标2

### 执念
- 执念1

### 恐惧
- 恐惧1

### 渴望
- 渴望1

## 角色弧线

- **类型**: 成长型
- **当前阶段**: 考验
- **面临挑战**: 信念被动摇
- **预测结局**: 经历磨砺后坚定自我
```

**frontmatter 或 body 选择：**
- `arc_type` 保留在 frontmatter（便于列表筛选）
- 完整 `character_arc` 和 `motivation` 存储在 Markdown body

### Task 3: 向后兼容

```python
def read_character(self, project_id: str, name: str) -> Optional[CharacterMD]:
    # ... 现有逻辑 ...
    
    # 新增：解析动机系统
    motivation = self._parse_motivation(sections.get("动机系统", ""))
    
    # 新增：解析角色弧线
    character_arc = self._parse_character_arc(sections.get("角色弧线", ""), frontmatter.get("arc_type"))
    
    return CharacterMD(
        # ... 现有字段 ...
        motivation=motivation,
        character_arc=character_arc,
    )
```

## File List

**修改文件：**
- backend/app/schemas/file_models.py
- backend/app/services/file_manager.py

## Acceptance Criteria

1. 前端填写的动机系统数据能正确保存到 backend
2. 前端填写的角色弧线数据能正确保存到 backend
3. 刷新页面后数据不丢失
4. 旧角色文件（无这些字段）能正常读取
5. API 返回的 Character 数据包含 motivation 和 character_arc

## Priority

**HIGH** — 影响核心功能数据持久化

## Change Log

| Date | Change |
|------|--------|
| 2026-04-09 | Created from code review findings |
| 2026-04-09 | Completed all tasks - backend models, FileManager, API endpoints verified |

## Completion Notes

**Implementation verified via API tests:**

1. Create test: Created "新角色API测试" with motivation and character_arc data
2. Update test: Updated character with full motivation/arc fields - persisted correctly
3. File verification: Markdown file contains formatted motivation/arc sections
4. Backward compatibility: Old character files load without errors (default factories handle missing fields)

**Key fix**: update_character() had AttributeError due to dict objects. Fixed by converting dict to MotivationSystem/CharacterArc models before assignment.