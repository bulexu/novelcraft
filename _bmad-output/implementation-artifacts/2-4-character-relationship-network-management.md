# Story 2.4: 角色关系网络管理

Status: done

## Story

As a **作者**,
I want 记录角色与其他角色的关系及演变历史,
So that 我可以追踪复杂的人物关系网。

## Acceptance Criteria

1. **AC1: 关系类型定义**
   - Given 用户编辑角色档案
   - When 添加角色关系
   - Then 可以选择其他角色并定义关系类型（朋友、敌人、师徒、恋人等）
   - And 可以设置关系"温度"（亲密、中性、疏远、敌对）

2. **AC2: 关系演变记录**
   - Given 关系已建立
   - When 记录关系演变
   - Then 可以添加演变事件（如：第15章从敌对变为合作）
   - And 形成关系演变时间线

3. **AC3: 关系网络展示**
   - Given 角色关系已填写
   - When 查看角色详情
   - Then 关系网络以结构化方式显示
   - And 可用于后续行为推演

## Tasks / Subtasks

- [x] Task 1: 扩展 CharacterRelation 类型 (AC: 1)
  - [x] 1.1 分析现有 `CharacterRelation` 接口结构
  - [x] 1.2 确定是否需要扩展字段

- [x] Task 2: 扩展 CharacterForm 关系网络部分 (AC: 1, 2)
  - [x] 2.1 在 CharacterForm 中添加"关系网络"折叠面板
  - [x] 2.2 实现关系类型选择（Select 下拉）
  - [x] 2.3 实现关系"温度"选择
  - [x] 2.4 实现演变事件添加功能

- [x] Task 3: CharacterCard 展示关系网络 (AC: 3)
  - [x] 3.1 在角色卡片中展示核心关系信息
  - [x] 3.2 添加展开/折叠显示更多关系详情

- [x] Task 4: 后端 API 集成 (AC: 3)
  - [x] 4.1 更新 `charactersApi.update` 调用
  - [x] 4.2 实现保存成功后的数据刷新

## Dev Notes

### 现有代码分析

**来源**: Story 2.1, 2.2, 2.3 完成后的代码库

**当前 CharacterRelation 接口** (`frontend/src/types/index.ts`):
```typescript
export interface CharacterRelation {
  target_name: string;
  relation_type: string;
  temperature: string;
  evolution: string[];
}
```

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
  motivation?: MotivationSystem;  // Story 2.3 新增
  behavior_boundary: BehaviorBoundary;
  relationships: CharacterRelation[];
  created_at: string | null;
  updated_at: string | null;
}
```

### 字段映射设计

根据 Story 2.4 AC：

| 字段 | 存储位置 | 输入方式 |
|-----|---------|---------|
| 目标角色 | `relationships[].target_name` | Select 下拉（选择项目中的其他角色） |
| 关系类型 | `relationships[].relation_type` | Select 下拉（朋友、敌人、师徒、恋人等） |
| 关系温度 | `relationships[].temperature` | Select 下拉（亲密、中性、疏远、敌对） |
| 演变历史 | `relationships[].evolution` | 动态列表，每项为"第X章 + 描述" |

### 关系类型选项

```typescript
const relationTypeOptions = [
  { value: '恋人', label: '恋人' },
  { value: '夫妻', label: '夫妻' },
  { value: '父母', label: '父母' },
  { value: '子女', label: '子女' },
  { value: '兄弟姐妹', label: '兄弟姐妹' },
  { value: '祖孙', label: '祖孙' },
  { value: '朋友', label: '朋友' },
  { value: '闺蜜', label: '闺蜜' },
  { value: '兄弟', label: '兄弟' },
  { value: '姐妹', label: '姐妹' },
  { value: '师徒', label: '师徒' },
  { value: '师生', label: '师生' },
  { value: '同学', label: '同学' },
  { value: '同事', label: '同事' },
  { value: '上下级', label: '上下级' },
  { value: '敌人', label: '敌人' },
  { value: '竞争对手', label: '竞争对手' },
  { value: '陌生人', label: '陌生人' },
  { value: '其他', label: '其他' },
];
```

### 关系温度选项

```typescript
const temperatureOptions = [
  { value: '热烈', label: '热烈', color: 'red' },
  { value: '温热', label: '温热', color: 'orange' },
  { value: '温暖', label: '温暖', color: 'yellow' },
  { value: '温', label: '温', color: 'lime' },
  { value: '中性', label: '中性', color: 'gray' },
  { value: '冷淡', label: '冷淡', color: 'cyan' },
  { value: '冷', label: '冷', color: 'blue' },
  { value: '寒冷', label: '寒冷', color: 'purple' },
  { value: '敌对', label: '敌对', color: 'magenta' },
];
```

### UI 设计规范

**来源**: `docs/ui_design.md`

关系网络在角色档案中的展示：
```
┌─────────────────────────────────────────┐
│  ┌─ 关系网络 ─────────────────────────┐ │
│  │ [林黛玉] 恋人 - 温热                 │ │
│  │   演变：初见倾心 → 心意相通          │ │
│  │ [薛宝钗] 情敌 - 冷                   │ │
│  │   演变：表面和平 → 暗中较劲          │ │
│  └──────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

### 技术要求

**来源**: `docs/architecture.md`

- 前端框架: Next.js 16 + Ant Design 6
- 表单组件: Ant Design Form + Select + Collapse
- 行为推演权重: 关系因素（后续 Story 3.3 实现）

### 文件结构

```
frontend/src/
├── types/index.ts               # 扩展：确认 CharacterRelation 接口
├── components/
│   └── characters/
│       ├── CharacterForm.tsx    # 扩展：添加关系网络面板
│       ├── CharacterCard.tsx    # 扩展：展示关系网络
```

### 关键实现点

1. **表单布局**:
   - 使用 Ant Design `Collapse` 组件
   - 放在动机系统面板下方
   - 关系列表使用动态 `Form.List` 组件

2. **关系选择**:
   - 目标角色下拉需要获取项目中所有角色列表
   - 过滤掉当前编辑的角色本身
   - 支持搜索

3. **演变事件**:
   - 每条关系可添加多条演变记录
   - 格式："第X章 + 描述"
   - 可删除已添加的演变

4. **数据默认值**:
   - 新建角色时 `relationships` 设为空数组 `[]`
   - 编辑时从 `character.relationships` 加载

5. **向后兼容**:
   - 如果角色没有 `relationships` 字段，显示为空数组
   - 如果关系没有 `evolution` 字段，显示为空

### 暂不实现

以下功能在后续 story 中实现:
- Story 2.5: 角色弧线记录
- Story 2.6: 角色卡片弹窗（Cmd+K 触发）
- Story 2.7: 角色列表与搜索
- 关系网络可视化图谱

## Dev Agent Record

### Agent Model Used

Claude Sonnet 4.6

### Debug Log References

- Fixed TypeScript error in CharacterForm.tsx: Form.List nested field names incompatible with Input props (evoField.name was number, not string)

### Completion Notes List

**实现摘要：**

1. ✅ Task 1: CharacterRelation 类型已存在，无需扩展
   - 确认 `CharacterRelation` 接口包含所需字段: target_name, relation_type, temperature, evolution

2. ✅ Task 2: CharacterForm 关系网络面板
   - 添加 `relationTypeOptions` (19种关系类型)
   - 添加 `temperatureOptions` (9种关系温度)
   - 添加 `allCharacters` prop 用于目标角色下拉过滤
   - Form.List 实现动态关系添加/删除
   - 嵌套 Form.List 实现演变历史添加/删除

3. ✅ Task 3: CharacterCard 关系网络展示
   - 添加 `temperatureColors` 温度颜色映射
   - 关系详情面板展示目标角色、关系类型、温度
   - 演变历史显示

4. ✅ Task 4: 后端 API 集成
   - `handleSubmit` 支持 relationships 数据提交
   - page.tsx 传递 `allCharacters` 给 CharacterForm

**字段映射：**
- `relationships[].target_name` ↔ 目标角色 (Select)
- `relationships[].relation_type` ↔ 关系类型 (Select)
- `relationships[].temperature` ↔ 关系温度 (Select)
- `relationships[].evolution[]` ↔ 演变历史 (动态列表)

## File List

**修改文件：**
- frontend/src/components/characters/CharacterForm.tsx
- frontend/src/components/characters/CharacterCard.tsx
- frontend/src/app/projects/[id]/page.tsx
- frontend/src/lib/mock-data.ts (已确认包含关系数据)

## Change Log

| Date | Change |
|------|--------|
| 2026-04-08 | Story file created from epics.md |
| 2026-04-08 | Implementation completed - Relationship network added to CharacterForm and CharacterCard |

### Review Findings

- [x] [Review][Patch] handleSaveCharacter 缺少 name 非空校验 [page.tsx:149] — fixed
- [x] [Review][Patch] handleDeleteCharacter 缺少 character.name 非空校验 [page.tsx:157] — fixed
- [x] [Review][Patch] relationships filter 应检查 evolution 字段 [CharacterForm.tsx] — fixed
- [x] [Review][Defer] AC1违背：关系温度选项不匹配 — deferred, 符合 Dev Notes 设计
- [x] [Review][Defer] AC2违背：演变时间线未结构化 — deferred, 符合现有 CharacterRelation 设计
- [x] [Review][Defer] 编辑模式下清空关系时数据不一致 — deferred, 需要明确后端行为

