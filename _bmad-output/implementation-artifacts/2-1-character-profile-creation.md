# Story 2.1: 角色档案创建

Status: done

## Story

As a **作者**,
I want 创建新的角色档案并填写基础信息,
So that 我可以为小说中的每个角色建立完整档案。

## Acceptance Criteria

1. **AC1: 角色创建入口**
   - Given 用户在项目详情页
   - When 点击"新建角色"按钮
   - Then 打开角色创建表单

2. **AC2: 角色基础信息表单**
   - Given 用户在角色创建表单
   - When 填写角色基础信息（姓名、别名、性别、年龄、外貌描述、背景故事）
   - Then 表单验证通过，可保存

3. **AC3: 角色档案存储**
   - Given 用户填写完成并点击保存
   - When 保存成功
   - Then 在 `characters/` 目录下创建 `{角色名}.md` 文件
   - And 文件包含 YAML frontmatter 和 Markdown 内容
   - And 角色列表更新显示新角色

## Tasks / Subtasks

- [x] Task 1: 角色创建 UI 组件 (AC: 1, 2)
  - [x] 1.1 创建 `CharacterForm` 组件 - 角色创建/编辑表单
  - [x] 1.2 实现表单字段：姓名（必填）、别名、性别、年龄、外貌描述、背景故事
  - [x] 1.3 添加表单验证（姓名必填，年龄为正整数）
  - [x] 1.4 实现"新建角色"按钮触发表单 Modal

- [x] Task 2: 角色列表展示 (AC: 3)
  - [x] 2.1 创建 `CharacterList` 组件 - 角色卡片网格展示
  - [x] 2.2 创建 `CharacterCard` 组件 - 单个角色卡片
  - [x] 2.3 实现角色列表数据获取和刷新

- [x] Task 3: 后端 API 集成 (AC: 3)
  - [x] 3.1 确认 `charactersApi.create` 接口可用
  - [x] 3.2 确认 `charactersApi.list` 接口可用
  - [x] 3.3 实现创建成功后的列表刷新

## Dev Notes

### 现有代码分析

**来源**: Epic 1 完成后的代码库

**已有类型定义** (`frontend/src/types/index.ts`):
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

**已有 API** (`frontend/src/lib/api.ts`):
```typescript
export const charactersApi = {
  list: (projectId: string) => fetchAPI<{ items: Character[]; total: number }>(`/projects/${projectId}/characters`),
  create: (projectId: string, data: Partial<Character>) => fetchAPI<Character>(`/projects/${projectId}/characters`, { method: 'POST', body: JSON.stringify(data) }),
  // ...
};
```

**结论**: 后端 API 和类型定义已存在，仅需实现前端 UI。

### UI 设计规范

**来源**: `docs/ui_design.md` UX-DR4

角色卡片弹窗（Cmd+K 或 @角色名 触发）:
```
┌─────────────────────────────────────────┐
│  @张三                              [×] │
├─────────────────────────────────────────┤
│  ┌─ 基础信息 ──────────────────────────┐│
│  │ 姓名: 张三                           ││
│  │ 状态: 第15章 · 信任动摇期            ││
│  │ 性格: 沉稳、隐忍、责任感强            ││
│  └──────────────────────────────────────┘│
│  ...                                     │
└─────────────────────────────────────────┘
```

角色列表展示:
```
┌─────────────────────────────────────────┐
│ [角色] 标签页                           │
├─────────────────────────────────────────┤
│  ┌─────┐ ┌─────┐ ┌─────┐               │
│  │ 👤  │ │ 👤  │ │ 👤  │  [+ 新建]     │
│  │张三 │ │李四 │ │王五 │               │
│  │沉稳 │ │热情 │ │神秘 │               │
│  └─────┘ └─────┘ └─────┘               │
└─────────────────────────────────────────┘
```

### 技术要求

**来源**: `docs/architecture.md`

- 前端框架: Next.js 16 + Ant Design 6
- 状态管理: Zustand（待添加，本 story 可先用 useState）
- 组件位置:
  - `frontend/src/components/characters/` - 角色相关组件
  - `frontend/src/app/projects/[id]/` - 项目页面

**命名规范**:
- 组件文件: PascalCase (如 `CharacterCard.tsx`)
- 变量/函数: camelCase
- 接口/类型: PascalCase

### 前置依赖

- Story 1.2 已实现项目列表和项目详情页
- 后端 `charactersApi` 已实现

### 文件结构

```
frontend/src/
├── app/projects/[id]/
│   └── page.tsx          # 项目详情页（需添加角色标签页）
├── components/
│   └── characters/       # 新建目录
│       ├── CharacterForm.tsx    # 角色创建/编辑表单
│       ├── CharacterList.tsx    # 角色列表网格
│       ├── CharacterCard.tsx    # 角色卡片
│       └── index.ts             # 组件导出
└── types/index.ts        # 已有 Character 类型
```

### 关键实现点

1. **表单字段映射**:
   - `name`: 姓名（必填，string）
   - `aliases`: 别名（string[]，用逗号分隔输入）
   - `gender`: 性别（'男' | '女' | '其他' | null）
   - `age`: 年龄（number | null）
   - `appearance`: 外貌描述（string）
   - `background`: 背景故事（string）

2. **默认值**:
   - `status`: '活跃'（新角色默认）
   - `arc_type`: null（后续 story 设置）
   - `personality_palette`: 空对象（后续 story 填充）
   - `behavior_boundary`: 空对象（后续 story 填充）
   - `relationships`: 空数组（后续 story 填充）

3. **UI 状态**:
   - 创建成功后显示 `message.success('角色创建成功')`
   - 创建失败显示 `message.error('创建失败: ' + error.message)`
   - 加载中显示 `Spin` 组件

### 暂不实现

以下功能在后续 story 中实现:
- Story 2.2: 性格特质记录
- Story 2.3: 动机系统记录
- Story 2.4: 关系网络管理
- Story 2.6: 角色卡片弹窗（Cmd+K 触发）

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

(填写调试日志)

### Completion Notes List

(完成后填写)

### File List

**新建文件：**
- frontend/src/components/characters/CharacterForm.tsx
- frontend/src/components/characters/CharacterList.tsx
- frontend/src/components/characters/CharacterCard.tsx
- frontend/src/components/characters/index.ts

**修改文件：**
- frontend/src/app/projects/[id]/page.tsx

## Change Log

| Date | Change |
|------|--------|
| 2026-04-07 | Story file created from epics.md |
| 2026-04-07 | Epic 2 status changed to in-progress |
| 2026-04-08 | Implementation completed - all tasks done |

## Completion Notes

**实现摘要：**

1. ✅ Task 1: 角色创建 UI 组件
   - 创建 `CharacterForm` 组件，支持创建和编辑模式
   - 实现完整表单字段：姓名、别名、性别、年龄、角色类型、外貌、背景
   - 添加表单验证（姓名必填、年龄正整数验证）
   - 支持别名逗号分隔输入，自动转数组

2. ✅ Task 2: 角色列表展示
   - 创建 `CharacterList` 组件 - 网格布局展示角色卡片
   - 创建 `CharacterCard` 组件 - 显示角色头像、名称、别名、类型、简介
   - 支持编辑、删除操作

3. ✅ Task 3: 后端 API 集成
   - 确认 `charactersApi.create` 和 `charactersApi.list` 可用
   - 创建成功后自动刷新列表
   - 新角色设置默认值：`status: '活跃'`，空数组的 `relationships` 等

**文件变更：**
- 新建: `frontend/src/components/characters/CharacterForm.tsx`
- 新建: `frontend/src/components/characters/CharacterList.tsx`
- 新建: `frontend/src/components/characters/CharacterCard.tsx`
- 新建: `frontend/src/components/characters/index.ts`
- 修改: `frontend/src/app/projects/[id]/page.tsx` (使用新组件)

## Code Review Results (2026-04-07)

**审查方式:** 三层并行审查 (Blind Hunter + Acceptance Auditor + Edge Case Hunter)

### 已修复问题 (Patch)

| # | 问题 | 修复方案 |
|---|------|----------|
| 1 | 年龄验证允许小数输入 `parseInt('3.5')=3` | 改用正则 `/^\d+$/` 验证 |
| 2 | Unicode 空格（全角空格）未被 trim | 添加 `\u3000` 处理 |
| 3 | 删除按钮无 loading 状态，可重复点击 | 添加 `deleting` 状态锁 |
| 4 | 删除回调参数不一致（id vs name vs character） | 统一传递完整 `character` 对象 |

### 延后优化 (Defer)

| # | 问题 | 说明 |
|---|------|------|
| 1 | 添加了 spec 外字段 `arc_type` | 可接受，已作为角色类型使用 |
| 2 | 表单提交无防重机制 | 后续统一优化 |

### 非问题 (Dismiss)

| # | 问题 | 原因 |
|---|------|------|
| XSS via aliases | React 自动转义，Ant Design Tag 组件安全 |
| 表单重置竞争 | `destroyOnClose` 已正确处理 |
| AC3 文件创建 | 后端 API 已实现，前端无需处理 |

**审查结论:** ✅ 通过
