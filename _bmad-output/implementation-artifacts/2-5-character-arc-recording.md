# Story 2.5: 角色弧线记录

Status: ready-for-dev

## Story

As a **作者**,
I want 设定角色的成长弧线类型和轨迹,
So that 我可以规划角色的成长路径。

## Acceptance Criteria

1. **AC1: 弧线类型选择**
   - Given 用户编辑角色档案
   - When 设置角色弧线
   - Then 可以选择弧线类型：
     - 成长型（从弱到强）
     - 堕落型（从好到坏）
     - 救赎型（从迷失到觉醒）
     - 平面型（性格基本不变）

2. **AC2: 弧线进度记录**
   - Given 弧线类型已设置
   - When 记录弧线进度
   - Then 可以标记当前所处阶段（如：成长型弧线中段，面临信念挑战）
   - And 可以预测可能的结局走向

3. **AC3: 弧线数据展示**
   - Given 弧线数据已填写
   - When 查看角色详情
   - Then 弧线信息以结构化方式显示
   - And 可用于后续行为推演

## Tasks / Subtasks

- [ ] Task 1: 扩展 Character 类型添加弧线字段 (AC: 1, 2)
  - [ ] 1.1 分析现有 `arc_type` 字段使用情况
  - [ ] 1.2 设计 `CharacterArc` 接口（弧线类型、进度、阶段、预测）

- [ ] Task 2: 扩展 CharacterForm 弧线部分 (AC: 1, 2)
  - [ ] 2.1 在 CharacterForm 中添加"角色弧线"折叠面板
  - [ ] 2.2 实现弧线类型选择（Select 下拉）
  - [ ] 2.3 实现弧线阶段记录（当前阶段、挑战、预测）
  - [ ] 2.4 实现弧线进度可视化

- [ ] Task 3: CharacterCard 展示弧线信息 (AC: 3)
  - [ ] 3.1 在角色卡片中展示弧线类型
  - [ ] 3.2 添加展开/折叠显示更多弧线详情

- [ ] Task 4: 后端 API 集成 (AC: 3)
  - [ ] 4.1 更新 `charactersApi.update` 调用
  - [ ] 4.2 实现保存成功后的数据刷新

## Dev Notes

### 现有代码分析

**来源**: Story 2.1, 2.2, 2.3, 2.4 完成后的代码库

**当前 Character 接口** (`frontend/src/types/index.ts`):
```typescript
export interface Character {
  id: string;
  name: string;
  aliases: string[];
  gender: string | null;
  age: number | null;
  status: string;
  arc_type: string | null;  // 当前仅有类型标识，缺少详细弧线
  appearance: string;
  background: string;
  personality_palette: PersonalityPalette;
  motivation?: MotivationSystem;
  behavior_boundary: BehaviorBoundary;
  relationships: CharacterRelation[];
  created_at: string | null;
  updated_at: string | null;
}
```

### 字段映射设计

根据 Story 2.5 AC：

| 字段 | 存储位置 | 输入方式 |
|-----|---------|---------|
| 弧线类型 | `character_arc.arc_type` | Select 下拉（成长/堕落/救赎/平面） |
| 当前阶段 | `character_arc.current_stage` | Select 下拉或输入 |
| 面临挑战 | `character_arc.current_challenge` | TextArea 输入 |
| 预测结局 | `character_arc.predicted_ending` | TextArea 输入 |

### 弧线类型选项

```typescript
const arcTypeOptions = [
  { value: '成长型', label: '成长型', description: '从弱到强' },
  { value: '堕落型', label: '堕落型', description: '从好到坏' },
  { value: '救赎型', label: '救赎型', description: '从迷失到觉醒' },
  { value: '平面型', label: '平面型', description: '性格基本不变' },
];
```

### 弧线阶段选项（按类型不同）

```typescript
// 成长型
const growthStages = ['起点', '觉醒', '考验', '低谷', '突破', '巅峰', '结局'];
// 堕落型
const fallStages = ['高点', '诱惑', '妥协', '沉沦', '触底', '结局'];
// 救赎型
const redemptionStages = ['迷失', '挣扎', '救赎机会', '考验', '觉醒', '结局'];
// 平面型
const flatStages = ['稳定'];
```

### UI 设计规范

**来源**: `docs/ui_design.md`

角色弧线在角色档案中的展示：
```
┌─────────────────────────────────────────┐
│  ┌─ 角色弧线 ─────────────────────────┐ │
│  │ 类型: 成长型                       │ │
│  │ 阶段: 中段（考验期）               │ │
│  │ 面临挑战: 信念被动摇               │ │
│  │ 预测结局: 经历磨砺后坚定自我       │ │
│  └──────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

角色卡片中显示弧线进度条：
```
[成长型 ████████░░░░░░░░ 60%]
```

### 技术要求

**来源**: `docs/architecture.md`

- 前端框架: Next.js 16 + Ant Design 6
- 表单组件: Ant Design Form + Select + Progress + Collapse
- 行为推演权重: 弧线因素（后续 Story 3.3 实现）

### 文件结构

```
frontend/src/
├── types/index.ts               # 扩展：添加 CharacterArc 接口
├── components/
│   └── characters/
│       ├── CharacterForm.tsx    # 扩展：添加角色弧线面板
│       ├── CharacterCard.tsx    # 扩展：展示角色弧线
```

### 关键实现点

1. **表单布局**:
   - 使用 Ant Design `Collapse` 组件
   - 放在关系网络面板下方
   - 弧线阶段使用 `Progress` 组件可视化进度

2. **弧线进度可视化**:
   - 根据弧线类型确定总阶段数
   - 根据当前阶段计算进度百分比
   - 使用 Progress 组件展示

3. **数据默认值**:
   - 新建角色时 `character_arc` 设为空对象 `{ arc_type: '', current_stage: '', current_challenge: '', predicted_ending: '' }`
   - 编辑时从 `character.character_arc` 加载

4. **向后兼容**:
   - 如果角色没有 `character_arc` 字段，显示为空
   - 如果角色只有 `arc_type` 旧字段，显示但不可编辑

### 暂不实现

以下功能在后续 story 中实现:
- Story 2.6: 角色卡片弹窗（Cmd+K 触发）
- Story 2.7: 角色列表与搜索
- 弧线与行为推演集成
- 弧线进度自动追踪（基于章节内容分析）

## Dev Agent Record

### Agent Model Used

(To be filled by developer)

### Debug Log References

(To be filled during development)

### Completion Notes List

(To be filled after implementation)

## File List

**修改文件：**
- frontend/src/types/index.ts
- frontend/src/components/characters/CharacterForm.tsx
- frontend/src/components/characters/CharacterCard.tsx

## Change Log

| Date | Change |
|------|--------|
| 2026-04-08 | Story file created from epics.md |
