# Story 2.3: 动机系统记录

Status: done

## Story

As a **作者**,
I want 记录角色的目标、执念、恐惧和渴望,
So that 系统可以理解角色行为背后的深层动机。

## Acceptance Criteria

1. **AC1: 动机系统表单**
   - Given 用户编辑角色档案
   - When 填写动机系统部分
   - Then 可以输入：
     - 目标（角色想要达成的）
     - 执念（角色无法放下的）
     - 恐惧（角色最害怕的）
     - 渴望（角色内心真正需要的）

2. **AC2: 动机系统展示**
   - Given 动机系统已填写
   - When 查看角色详情
   - Then 动机系统以结构化方式显示
   - And 可用于后续行为推演

3. **AC3: 数据持久化**
   - Given 用户填写动机系统并保存
   - When 保存成功
   - Then 数据存储在后端
   - And 后端 API 更新成功

## Tasks / Subtasks

- [x] Task 1: 扩展 Character 类型添加动机字段 (AC: 3)
  - [x] 1.1 在 `types/index.ts` 中添加 `MotivationSystem` 接口
  - [x] 1.2 在 `Character` 接口中添加 `motivation: MotivationSystem` 字段

- [x] Task 2: 扩展 CharacterForm 动机系统部分 (AC: 1, 2)
  - [x] 2.1 在 CharacterForm 中添加"动机系统"折叠面板
  - [x] 2.2 实现目标输入（文本框）
  - [x] 2.3 实现执念输入（文本框）
  - [x] 2.4 实现恐惧输入（文本框）
  - [x] 2.5 实现渴望输入（文本框）

- [x] Task 3: CharacterCard 展示动机系统 (AC: 2)
  - [x] 3.1 在角色卡片中展示核心动机信息
  - [x] 3.2 添加展开/折叠显示更多动机详情

- [x] Task 4: 后端 API 集成 (AC: 3)
  - [x] 4.1 更新 `charactersApi.update` 调用
  - [x] 4.2 实现保存成功后的数据刷新

## Dev Notes

### 现有代码分析

**来源**: Story 2.1, 2.2 完成后的代码库

**当前 Character 接口** (`frontend/src/types/index.ts`):
```typescript
export interface Character {
  id: string;
  name: string;
  aliases: string[];
  gender: string | null;
  age: number | null;
  status: string;
  arc_type: string | null;
  appearance: string;
  background: string;
  personality_palette: PersonalityPalette;
  behavior_boundary: BehaviorBoundary;
  relationships: CharacterRelation[];
  created_at: string | null;
  updated_at: string | null;
}
```

**缺失**: 动机系统字段（目标、执念、恐惧、渴望）

### 类型设计

需要添加 `MotivationSystem` 接口：

```typescript
export interface MotivationSystem {
  goals: string[];        // 目标
  obsessions: string[];   // 执念
  fears: string[];         // 恐惧
  desires: string[];       // 渴望
}
```

### 字段映射设计

根据 Story 2.3 AC：

| 动机类型 | 存储位置 | 输入方式 |
|---------|---------|---------|
| 目标 | `motivation.goals[]` | 多行文本，每行一个 |
| 执念 | `motivation.obsessions[]` | 多行文本，每行一个 |
| 恐惧 | `motivation.fears[]` | 多行文本，每行一个 |
| 渴望 | `motivation.desires[]` | 多行文本，每行一个 |

### UI 设计规范

**来源**: `docs/ui_design.md`

动机系统在角色档案中的展示：
```
┌─────────────────────────────────────────┐
│  ┌─ 动机系统 ─────────────────────────┐ │
│  │ 目标: 复仇, 守护家人               │ │
│  │ 执念: 对权力的渴望                 │ │
│  │ 恐惧: 失去亲人                     │ │
│  │ 渴望: 被理解                       │ │
│  └──────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

### 技术要求

**来源**: `docs/architecture.md`

- 前端框架: Next.js 16 + Ant Design 6
- 表单组件: Ant Design Form + Input + Collapse
- 行为推演权重: 动机因素占 25%

### 文件结构

```
frontend/src/
├── types/index.ts               # 扩展：添加 MotivationSystem
├── components/
│   └── characters/
│       ├── CharacterForm.tsx    # 扩展：添加动机系统面板
│       └── CharacterCard.tsx    # 扩展：展示动机系统
```

### 关键实现点

1. **表单布局**:
   - 使用 Ant Design `Collapse` 组件
   - 放在性格特质面板下方
   - 四个文本框分别输入目标、执念、恐惧、渴望

2. **数据转换**:
   - 每行文本转为数组元素
   - 空行过滤

3. **默认值处理**:
   - 新建角色时 `motivation` 设为空对象 `{ goals: [], obsessions: [], fears: [], desires: [] }`
   - 编辑时从 `character.motivation` 加载

4. **向后兼容**:
   - 如果角色没有 `motivation` 字段，显示为空

### 暂不实现

以下功能在后续 story 中实现:
- Story 2.4: 角色关系网络管理
- Story 2.5: 角色弧线记录
- 动机因素权重配置 UI

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

- 修复了 `JSX.Element` 类型错误（改为 `React.ReactNode`）
- 修复了 mock-data.ts 缺少 `motivation` 字段的类型错误

### Completion Notes List

**实现摘要：**

1. ✅ Task 1: 添加 MotivationSystem 类型
   - 添加 `MotivationSystem` 接口（goals, obsessions, fears, desires）
   - 在 `Character` 接口中添加 `motivation: MotivationSystem` 字段

2. ✅ Task 2: CharacterForm 动机系统表单
   - 添加动机系统折叠面板（目标、执念、恐惧、渴望）
   - 实现 `parseMotivationToForm` 和 `formToMotivation` 数据转换函数
   - 每个字段使用 TextArea，每行一个

3. ✅ Task 3: CharacterCard 动机系统展示
   - 在角色卡片中展示动机详情
   - 使用 Collapse 折叠面板显示完整动机信息
   - 向后兼容（无动机数据时正常显示）

4. ✅ Task 4: 后端 API 集成
   - `charactersApi.update` 已支持 `Partial<Character>`
   - 更新 mock 数据添加 `motivation` 字段

**字段映射：**
- `motivation.goals[]` ↔ 目标（每行一个）
- `motivation.obsessions[]` ↔ 执念（每行一个）
- `motivation.fears[]` ↔ 恐惧（每行一个）
- `motivation.desires[]` ↔ 渴望（每行一个）

### File List

**修改文件：**
- frontend/src/types/index.ts
- frontend/src/components/characters/CharacterForm.tsx
- frontend/src/components/characters/CharacterCard.tsx
- frontend/src/lib/mock-data.ts

## Change Log

| Date | Change |
|------|--------|
| 2026-04-08 | Story file created from epics.md |
| 2026-04-08 | Implementation completed - MotivationSystem added to Character type and UI |

### Review Findings

- [x] [Review][Patch] Empty catch block swallows errors [CharacterForm.tsx:handleSubmit] — fixed
- [x] [Review][Patch] Motivation type is required but UI shows optional [types/index.ts:Character] — fixed
- [x] [Review][Patch] Form not disabled during submission [CharacterForm.tsx] — fixed
- [x] [Review][Defer] No per-entry validation in motivation arrays [CharacterForm.tsx:formToMotivation] — deferred, nice-to-have enhancement
- [x] [Review][Defer] Hardcoded Chinese status '活跃' [CharacterForm.tsx] — deferred, pre-existing i18n concern
- [x] [Review][Defer] No discard confirmation before closing modal [CharacterForm.tsx] — deferred, not in AC
