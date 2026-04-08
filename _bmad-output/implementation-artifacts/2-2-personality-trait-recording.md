# Story 2.2: 性格特质记录

Status: done

## Story

As a **作者**,
I want 记录角色的性格特质、内逻辑和语言习惯,
So that 系统可以基于性格推演角色行为。

## Acceptance Criteria

1. **AC1: 性格特质表单**
   - Given 用户编辑角色档案
   - When 填写性格特质部分
   - Then 可以输入：
     - 核心性格标签（如：沉稳、隐忍、责任感强）
     - 内逻辑/价值观（如：守护他人 > 个人得失）
     - 习惯用语和口头禅
     - 典型小动作

2. **AC2: 性格特质展示**
   - Given 角色档案已保存性格特质
   - When 查看角色详情
   - Then 性格特质以结构化方式显示
   - And 可用于后续行为推演

3. **AC3: 数据持久化**
   - Given 用户填写性格特质并保存
   - When 保存成功
   - Then 数据存储在角色的 `personality_palette` 字段
   - And 后端 API 更新成功

## Tasks / Subtasks

- [x] Task 1: 扩展 CharacterForm 性格特质部分 (AC: 1, 2)
  - [x] 1.1 在 CharacterForm 中添加"性格特质"折叠面板
  - [x] 1.2 实现核心性格标签输入（支持多个标签）
  - [x] 1.3 实现内逻辑/价值观文本输入
  - [x] 1.4 实现习惯用语输入（支持多个）
  - [x] 1.5 实现典型小动作输入（支持多个）

- [x] Task 2: CharacterCard 展示性格特质 (AC: 2)
  - [x] 2.1 在角色卡片中展示核心性格标签
  - [x] 2.2 添加展开/折叠显示更多性格信息

- [x] Task 3: 后端 API 集成 (AC: 3)
  - [x] 3.1 确认 `charactersApi.update` 支持 `personality_palette` 字段
  - [x] 3.2 实现保存成功后的数据刷新

## Dev Notes

### 现有代码分析

**来源**: Story 2.1 完成后的代码库

**已有类型定义** (`frontend/src/types/index.ts`):
```typescript
export interface PersonalityPalette {
  main_tone: string;        // 主基调（核心性格标签）
  base_color: string;       // 基础色彩
  accent: string;           // 强调色
  derivatives: { description: string }[];  // 衍生特质
  language_fingerprint: string[];  // 语言指纹（习惯用语）
}

export interface Character {
  // ... 其他字段
  personality_palette: PersonalityPalette;
  // ...
}
```

**已有 API** (`frontend/src/lib/api.ts`):
```typescript
export const charactersApi = {
  update: (projectId: string, name: string, data: Partial<Character>) =>
    fetchAPI<Character>(`/projects/${projectId}/characters/${encodeURIComponent(name)}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  // ...
};
```

**已有组件**:
- `CharacterForm.tsx` - 角色创建/编辑表单（需扩展）
- `CharacterCard.tsx` - 角色卡片展示（需扩展）
- `CharacterList.tsx` - 角色列表网格

### 字段映射设计

根据 `PersonalityPalette` 接口，设计表单字段映射：

| 接口字段 | 表单字段 | 说明 |
|---------|---------|------|
| `main_tone` | 核心性格标签 | 如"沉稳、隐忍、责任感强" |
| `base_color` | (可选) 基础色彩 | 暂时隐藏，后续可视化用 |
| `accent` | (可选) 强调色 | 暂时隐藏，后续可视化用 |
| `derivatives` | 内逻辑/价值观 | `{ description: "守护他人 > 个人得失" }[]` |
| `language_fingerprint` | 习惯用语 | `["口头禅1", "口头禅2"]` |

**新增字段（不在接口中）**:
- 典型小动作 → 存储在 `behavior_boundary.exceptions` 或新增字段

**决策**: 典型小动作暂存 `derivatives` 中，用 `{ description: "小动作: xxx" }` 格式区分，或后续扩展现接口。

### UI 设计规范

**来源**: `docs/ui_design.md` UX-DR4

性格特质在角色卡片弹窗中的展示：
```
┌─────────────────────────────────────────┐
│  ┌─ 性格特质 ─────────────────────────┐ │
│  │ 核心标签: 沉稳 · 隐忍 · 责任感强    │ │
│  │ 内逻辑: 守护他人 > 个人得失         │ │
│  │ 口头禅: "罢了"、"且慢"              │ │
│  │ 小动作: 习惯性摩挲手指              │ │
│  └──────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

### 技术要求

**来源**: `docs/architecture.md`

- 前端框架: Next.js 16 + Ant Design 6
- 表单组件: Ant Design Form + Input + Tag
- 状态管理: Zustand（待添加，本 story 可先用 useState）

**命名规范**:
- 组件文件: PascalCase
- 变量/函数: camelCase
- 接口/类型: PascalCase

### 前置依赖

- Story 2.1 已实现角色创建基础功能
- `Character` 类型已包含 `personality_palette` 字段
- 后端 API 支持更新 `personality_palette`

### 文件结构

```
frontend/src/
├── components/
│   └── characters/
│       ├── CharacterForm.tsx    # 扩展：添加性格特质面板
│       ├── CharacterCard.tsx    # 扩展：展示性格特质
│       └── index.ts             # 组件导出
└── types/index.ts               # 已有 PersonalityPalette 类型
```

### 关键实现点

1. **表单布局**:
   - 使用 Ant Design `Collapse` 组件创建折叠面板
   - 默认展开"基础信息"，折叠"性格特质"
   - 性格特质面板内使用垂直布局

2. **标签输入**:
   - 核心性格标签使用 `Input` + `Tag` 组件
   - 支持回车添加、点击删除
   - 限制最多 5 个标签

3. **列表输入**:
   - 习惯用语和小动作使用动态列表
   - 每项一个输入框，可添加/删除
   - 限制最多 10 条

4. **数据转换**:
   - `main_tone`: 字符串 → 多标签用顿号连接存储
   - `derivatives`: 数组 → `{ description: string }[]` 格式
   - `language_fingerprint`: 字符串数组

5. **默认值处理**:
   - 新建角色时 `personality_palette` 设为空对象
   - 编辑时从 `character.personality_palette` 加载

### 暂不实现

以下功能在后续 story 中实现:
- Story 2.3: 动机系统记录（目标、执念、恐惧、渴望）
- Story 2.6: 角色卡片弹窗（Cmd+K 触发）
- 性格特质可视化（彩色标签等）

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

- 修复了 `PlusOutlined` 和 `CloseOutlined` 图标导入错误（需从 `@ant-design/icons` 导入而非 `antd`）

### Code Review Findings

| # | 问题 | 严重性 | 分类 | 状态 |
|---|------|--------|------|------|
| 1 | `Divider` 导入未使用 | LOW | patch | ✅ 已修复 |

### Review Completion Notes

- 审查日期: 2026-04-08
- 审查模式: full (含 spec)
- 审查结果: ✅ 通过
- 发现问题: 1 个 (已修复)

### Completion Notes List

**实现摘要：**

1. ✅ Task 1: 扩展 CharacterForm 性格特质部分
   - 添加 `Collapse` 折叠面板包含性格特质表单
   - 核心性格标签使用 Tag 组件显示，支持添加/删除（最多5个）
   - 内逻辑/价值观使用 TextArea 输入（每行一条）
   - 习惯用语使用 Input 输入（逗号分隔）
   - 典型小动作使用 Input 输入（逗号分隔）
   - 实现 `parsePersonalityToForm` 和 `formToPersonality` 数据转换函数

2. ✅ Task 2: CharacterCard 展示性格特质
   - 解析 `personality_palette` 展示核心性格标签（Tag 显示前3个）
   - 添加 Collapse 折叠面板显示详细性格信息
   - 显示内逻辑、口头禅、小动作

3. ✅ Task 3: 后端 API 集成
   - 确认 `charactersApi.update` 支持 `personality_palette` 字段
   - 表单提交时正确构建 `personality_palette` 对象

**字段映射：**
- `main_tone` ↔ 核心性格标签（顿号分隔）
- `derivatives` ↔ 内逻辑/价值观 + 小动作（小动作以"小动作:"前缀区分）
- `language_fingerprint` ↔ 习惯用语（数组）

### File List

**修改文件：**
- frontend/src/components/characters/CharacterForm.tsx
- frontend/src/components/characters/CharacterCard.tsx

## Change Log

| Date | Change |
|------|--------|
| 2026-04-08 | Story file created from epics.md |
| 2026-04-08 | Implementation completed - CharacterForm and CharacterCard extended with personality traits |
