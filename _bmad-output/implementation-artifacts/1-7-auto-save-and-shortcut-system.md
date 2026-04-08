# Story 1.7: 自动保存与快捷键系统

Status: done

## Story

As a **作者**,
I want 编辑内容自动保存并支持常用快捷键,
So that 我不用担心内容丢失，操作更高效。

## Acceptance Criteria

1. **AC1: 自动保存**
   - Given 用户正在编辑章节
   - When 内容发生变化后 30 秒
   - Then 自动保存当前内容
   - And 状态栏显示"已保存"

2. **AC2: Cmd+S 保存**
   - Given 用户按下 Cmd+S
   - When 触发保存
   - Then 立即保存当前内容

3. **AC3: Cmd+N 新建章节**
   - Given 用户按下 Cmd+N
   - When 触发新建章节
   - Then 打开新建章节对话框

4. **AC4: Cmd+↑/↓ 切换章节**
   - Given 用户按下 Cmd+↑ 或 Cmd+↓
   - When 触发章节切换
   - Then 切换到上一章/下一章

## Tasks / Subtasks

- [x] Task 1: 自动保存功能 (AC: 1)
  - [x] 1.1 实现 30 秒防抖自动保存
  - [x] 1.2 显示保存状态

- [x] Task 2: Cmd+S 快捷键 (AC: 2)
  - [x] 2.1 NovelEditor 中监听 Cmd+S
  - [x] 2.2 触发保存并显示提示

- [x] Task 3: Cmd+N 新建章节 (AC: 3)
  - [x] 3.1 全局监听 Cmd+N 快捷键
  - [x] 3.2 打开新建章节对话框

- [x] Task 4: Cmd+↑/↓ 切换章节 (AC: 4)
  - [x] 4.1 全局监听 Cmd+↑ 和 Cmd+↓ 快捷键
  - [x] 4.2 实现章节切换逻辑（边界检查）

## Dev Notes

### 已实现功能

**自动保存 (page.tsx):**
```typescript
useEffect(() => {
  if (!isDirty || !currentChapter) return;
  const timer = setTimeout(() => {
    if (handleSaveRef.current) {
      handleSaveRef.current(true);
    }
  }, 30000);
  return () => clearTimeout(timer);
}, [content, isDirty, currentChapter]);
```

**Cmd+S (NovelEditor.tsx):**
```typescript
const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
  if ((e.metaKey || e.ctrlKey) && e.key === 's') {
    e.preventDefault();
    onSave();
  }
}, [onSave]);
```

### 待实现功能

**全局快捷键监听 (page.tsx):**
```typescript
useEffect(() => {
  const handleGlobalShortcuts = (e: KeyboardEvent) => {
    // Cmd/Ctrl + N: New chapter
    if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
      e.preventDefault();
      setNewChapterModalOpen(true);
    }
    // Cmd/Ctrl + ArrowUp: Previous chapter
    if ((e.metaKey || e.ctrlKey) && e.key === 'ArrowUp') {
      e.preventDefault();
      const currentIndex = chapters.findIndex(c => c.chapter === chapterNum);
      if (currentIndex > 0) {
        handleChapterSwitch(chapters[currentIndex - 1].chapter);
      }
    }
    // Cmd/Ctrl + ArrowDown: Next chapter
    if ((e.metaKey || e.ctrlKey) && e.key === 'ArrowDown') {
      e.preventDefault();
      const currentIndex = chapters.findIndex(c => c.chapter === chapterNum);
      if (currentIndex < chapters.length - 1) {
        handleChapterSwitch(chapters[currentIndex + 1].chapter);
      }
    }
  };
  window.addEventListener('keydown', handleGlobalShortcuts);
  return () => window.removeEventListener('keydown', handleGlobalShortcuts);
}, [chapters, chapterNum, handleChapterSwitch]);
```

### 快捷键汇总

| 快捷键 | 功能 | 实现位置 |
|--------|------|----------|
| Cmd+S | 保存 | NovelEditor |
| Cmd+N | 新建章节 | page.tsx |
| Cmd+↑ | 上一章 | page.tsx |
| Cmd+↓ | 下一章 | page.tsx |
| Cmd+Shift+I | 沉浸模式 | page.tsx |
| Esc | 退出沉浸模式 | page.tsx |

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

- 构建验证通过：`npm run build` 成功
- TypeScript 类型检查通过

### Completion Notes List

**实现摘要：**
1. ✅ Task 1: 自动保存功能（30秒防抖）- 已在 Story 1.3 实现
2. ✅ Task 2: Cmd+S 快捷键 - 已在 Story 1.3 实现
3. ✅ Task 3: Cmd+N 新建章节 - 全局键盘监听，打开 Modal
4. ✅ Task 4: Cmd+↑/↓ 章节切换 - 边界检查，自动保存后切换

**技术决策：**
- 全局快捷键 useEffect 放在 handleChapterSwitch 之后，避免 "used before declaration" 错误
- 使用 useCallback 保持 handleChapterSwitch 引用稳定
- 章节切换时先自动保存（如果有未保存更改）

### File List

**修改文件：**
- frontend/src/app/projects/[id]/editor/[chapter]/page.tsx

## Change Log

| Date | Change |
|------|--------|
| 2026-04-03 | Story file created |
| 2026-04-03 | Status set to in-progress |
| 2026-04-03 | Task 1, 2 marked done (already implemented) |
| 2026-04-03 | Task 3, 4 implemented - global shortcuts added |
| 2026-04-03 | Status updated to review |

## Review Findings

### Patch (已修复)

- [x] [Review][Patch] findIndex -1 bug [page.tsx:250/259] — 当 chapterNum 不在 chapters 数组中时，findIndex 返回 -1，ArrowDown 检查 `-1 < chapters.length - 1` 为 true，导致错误导航到 chapters[0]。已添加 `if (currentIndex === -1) return` 检查
- [x] [Review][Patch] 缺少输入焦点检查 [page.tsx:240-265] — 快捷键在输入框内仍会触发，用户在文本框输入时按 Cmd+N 会意外打开新建章节对话框。已添加 `target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable` 检查
- [x] [Review][Patch] 快速导航竞态条件 [page.tsx:252/261] — 未检查 `saving` 状态，快速连续按 Cmd+↑/↓ 可能触发多个并发保存和导航操作。已添加 `if (saving) return` 检查并将 `saving` 加入依赖数组

### Defer (延后处理)

- [x] [Review][Defer] 冗余 findIndex 调用 [page.tsx] — 可在 handler 开始时计算一次 currentIndex，延后处理为优化建议

### Dismissed (已排除)

- `handleChapterSwitch` 依赖项警告 — 已用 useCallback 包装 (line 228)
- `setNewChapterModalOpen` 缺少依赖项 — React setState 函数稳定，无需添加
- 空数组边界检查 — 代码已正确处理（ArrowUp: currentIndex > 0, ArrowDown: currentIndex < length - 1）