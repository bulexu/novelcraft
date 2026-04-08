# Story 1.8: 底部状态栏

Status: done

## Story

As a **作者**,
I want 查看当前写作状态（字数、章节、保存状态）,
So that 我了解当前进度。

## Acceptance Criteria

1. **AC1: 基础状态显示**
   - Given 用户在编辑器页面
   - When 页面加载或内容变化
   - Then 底部状态栏显示：字数统计、当前章节、保存状态

2. **AC2: 笔风匹配度显示（可选）**
   - Given 启用了笔风匹配功能
   - When 状态栏渲染
   - Then 显示笔风匹配度百分比

## Tasks / Subtasks

- [x] Task 1: 状态栏组件设计 (AC: 1)
  - [x] 1.1 分析现有 footer 实现
  - [x] 1.2 确认是否需要提取为独立组件（决定不提取）

- [x] Task 2: 基础状态显示优化 (AC: 1)
  - [x] 2.1 确认字数统计实时更新
  - [x] 2.2 确认章节信息正确显示
  - [x] 2.3 优化保存状态显示样式（添加图标）

- [x] Task 3: 笔风匹配度预留 (AC: 2)
  - [x] 3.1 添加笔风匹配度显示位置（条件渲染）
  - [x] 3.2 预留样式和占位符

## Dev Notes

### 当前实现分析

**来源**: Story 1.7 完成后的 page.tsx

当前状态栏已在 footer 中实现（line 451-467）：

```tsx
<footer className="flex items-center justify-between px-4 py-1.5 border-t border-outline-variant/20 bg-surface-container-low text-xs text-on-surface-variant">
  <div className="flex items-center gap-4">
    <span>字数：{content.length.toLocaleString()}</span>
    <span>章节：{chapterNum} / {chapters.length}</span>
  </div>
  <div className="flex items-center gap-4">
    {saving ? (
      <span className="text-primary">保存中...</span>
    ) : isDirty ? (
      <span>未保存</span>
    ) : (
      <span className="text-green-600">已保存</span>
    )}
  </div>
</footer>
```

沉浸模式状态栏（line 471-478）：

```tsx
{immersiveMode && (
  <div className="fixed bottom-6 left-1/2 -translate-x-1/2 px-6 py-2 bg-black/60 backdrop-blur-md rounded-full text-white/80 text-sm flex items-center gap-4">
    <span>字数：{content.length.toLocaleString()}</span>
    <span className="text-white/40">|</span>
    <span className="text-white/60">Esc 或 ⌘⇧I 退出</span>
  </div>
)}
```

### 分析结论

**当前实现已满足 AC1 的核心需求：**
- ✅ 字数统计：`content.length.toLocaleString()`
- ✅ 章节信息：`{chapterNum} / {chapters.length}`
- ✅ 保存状态：三态显示（保存中/未保存/已保存）

**需要优化的部分：**
1. 沉浸模式状态栏缺少章节信息
2. 笔风匹配度（AC2）需要预留位置

### 技术要求

**来源**: `docs/ui_design.md` UX-DR16

- 底部状态栏显示：字数、章节、保存状态、笔风匹配度
- 响应式适配

### 实现方案

**优化现有 footer（非提取组件）：**

由于状态栏逻辑简单且仅在此页面使用，保持内联实现。需做以下优化：

1. **沉浸模式状态栏补充章节信息**
   ```tsx
   <span>章节 {chapterNum}/{chapters.length}</span>
   ```

2. **笔风匹配度预留**
   ```tsx
   {/* 笔风匹配度 - 笔风分析功能启用后显示 */}
   {styleMatchScore !== undefined && (
     <span>笔风匹配：{styleMatchScore}%</span>
   )}
   ```

3. **优化状态图标**
   - 考虑使用 Ant Design 图标替代纯文字
   - 已保存：`<CheckCircleOutlined style={{ color: '#22c55e' }} />`
   - 未保存：`<ExclamationCircleOutlined />`
   - 保存中：`<LoadingOutlined />`

### 前置依赖

- Story 1.3 已实现三栏布局和章节导航
- Story 1.7 已实现自动保存和保存状态

### 相关文件

- 编辑器页面: `frontend/src/app/projects/[id]/editor/[chapter]/page.tsx`
- UI 设计规范: `docs/ui_design.md`

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### File List

**待修改文件：**
- frontend/src/app/projects/[id]/editor/[chapter]/page.tsx

## Change Log

| Date | Change |
|------|--------|
| 2026-04-07 | Story file created from epics.md |
| 2026-04-07 | Implementation completed - all tasks done |
| 2026-04-07 | Status updated to review |

## Completion Notes

**实现摘要：**

1. ✅ Task 1: 状态栏组件设计
   - 分析了现有 footer 实现（line 454-484）
   - 决定不提取为独立组件，保持内联实现

2. ✅ Task 2: 基础状态显示优化
   - 字数统计已实时更新（`content.length.toLocaleString()`）
   - 章节信息正确显示（`{chapterNum} / {chapters.length}`）
   - 保存状态添加图标：
     - 保存中：`<LoadingOutlined spin />` + 蓝色文字
     - 未保存：`<ExclamationCircleOutlined />` + 琥珀色
     - 已保存：`<CheckCircleOutlined />` + 绿色

3. ✅ Task 3: 笔风匹配度预留
   - 已添加条件渲染占位符（注释状态）
   - 待笔风分析功能启用后取消注释即可

4. ✅ 沉浸模式状态栏增强
   - 添加章节信息显示
   - 添加保存状态显示（带图标）
   - 保持半透明浮窗风格

## Review Findings

### Patch (已修复)

- [x] [Review][Patch] 保存按钮缺少防重复点击保护 [page.tsx:176-203, 425] — `handleSave` 设置 `saving` 状态前未检查是否已有保存进行中。用户手动点击保存按钮时无保护，可能导致双重 API 调用和竞态条件。

- [x] [Review][Patch] handleSave 错误不传播导致章节切换可能丢失数据 [page.tsx:196-199, 231-238] — `handleSave` 内部捕获错误不重新抛出，`handleChapterSwitch` 无法知道保存是否成功，导航继续进行可能丢失未保存内容。

- [x] [Review][Patch] chapters 数组空值保护缺失 [page.tsx:459, 492] — `{chapters.length}` 未做空数组保护，API 失败时可能显示 "章节 X/0"。

### Defer (延后处理)

- [x] [Review][Defer] 重复的条件渲染逻辑 (DRY 违反) [page.tsx:466-481, 489-507] — 保存状态的三元表达式在 footer 和沉浸模式状态栏中重复，仅颜色不同。建议提取为 `SaveStatusIndicator` 组件。

- [x] [Review][Defer] 状态指示器缺少无障碍标签 [page.tsx:466-481, 489-507] — 图标无 `aria-label` 或 `role="status"`，沉浸模式状态栏缺少 `aria-live`。建议添加无障碍属性。

- [x] [Review][Defer] 自动保存计时器在快速输入时不断重置 [page.tsx:152-162] — 每次 `content` 变化都重置 30s 计时器，持续输入时自动保存永不触发。可能是预期行为，需确认。
