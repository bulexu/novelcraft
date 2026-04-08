# Story 1.6: 沉浸写作模式

Status: done

## Story

As a **作者**,
I want 按 Cmd+Shift+I 进入沉浸写作模式,
So that 我可以专注于写作，无干扰。

## Acceptance Criteria

1. **AC1: 进入沉浸模式**
   - Given 用户在编辑器页面
   - When 按下 Cmd+Shift+I
   - Then 隐藏章节导航和预览区
   - And 编辑区居中显示，宽度约 600px
   - And 背景变为深色
   - And 底部显示极简状态栏（字数、快捷键提示）

2. **AC2: 退出沉浸模式**
   - Given 用户处于沉浸模式
   - When 再次按下 Cmd+Shift+I 或按 Esc
   - Then 退出沉浸模式，恢复三栏布局

## Tasks / Subtasks

- [x] Task 1: 添加沉浸模式状态管理 (AC: 1, 2)
  - [x] 1.1 添加 `immersiveMode` 状态变量
  - [x] 1.2 实现键盘快捷键监听 (Cmd/Ctrl+Shift+I, Esc)

- [x] Task 2: 实现沉浸模式 UI 变换 (AC: 1)
  - [x] 2.1 隐藏导航栏和预览区
  - [x] 2.2 编辑区居中，宽度限制 600px
  - [x] 2.3 背景切换为深色 (bg-surface-container-lowest)
  - [x] 2.4 添加过渡动画

- [x] Task 3: 实现极简状态栏 (AC: 1)
  - [x] 3.1 显示字数统计
  - [x] 3.2 显示快捷键提示 (Esc 或 ⌘⇧I 退出)
  - [x] 3.3 半透明悬浮样式

- [x] Task 4: 添加退出逻辑 (AC: 2)
  - [x] 4.1 Cmd/Ctrl+Shift+I 切换模式
  - [x] 4.2 Esc 键退出沉浸模式
  - [x] 4.3 恢复原有布局

## Dev Notes

### 键盘快捷键实现

```typescript
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    // Cmd/Ctrl + Shift + I
    if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'I') {
      e.preventDefault();
      setImmersiveMode(prev => !prev);
    }
    // Esc to exit
    if (e.key === 'Escape' && immersiveMode) {
      setImmersiveMode(false);
    }
  };
  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [immersiveMode]);
```

### 布局变换

```typescript
// 沉浸模式下的样式
const mainClassName = immersiveMode 
  ? 'flex-1 flex flex-col items-center justify-center bg-surface-container-lowest'
  : 'flex-1 flex flex-col min-w-0 bg-surface';

const editorWrapperClassName = immersiveMode
  ? 'w-full max-w-[600px] h-full'
  : 'flex-1 min-w-0';
```

### 极简状态栏

```tsx
{immersiveMode && (
  <div className="fixed bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/50 rounded-full text-white/70 text-xs backdrop-blur-sm">
    字数：{content.length.toLocaleString()} · 按 Esc 或 Cmd+Shift+I 退出
  </div>
)}
```

### 相关文件

- 编辑器页面: `frontend/src/app/projects/[id]/editor/[chapter]/page.tsx`
- NovelEditor: `frontend/src/components/editor/NovelEditor.tsx`

### UI 设计参考

- 背景色: `bg-surface-container-lowest` (最深层级)
- 编辑区宽度: `max-w-[600px]`
- 状态栏: `fixed bottom-4 left-1/2 -translate-x-1/2`
- 动画: `transition-all duration-300`

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (claude-opus-4-6)

### Debug Log References

- 构建验证通过：`npm run build` 成功
- TypeScript 类型检查通过

### Completion Notes List

**实现摘要：**
1. ✅ 添加 `immersiveMode` 状态变量
2. ✅ 实现键盘快捷键 (Cmd/Ctrl+Shift+I 切换, Esc 退出)
3. ✅ 沉浸模式下隐藏导航、预览、AI面板、header、footer
4. ✅ 编辑器居中显示，宽度限制 600px
5. ✅ 背景切换为深色 (bg-surface-container-lowest)
6. ✅ 添加极简状态栏（字数 + 退出提示）
7. ✅ 过渡动画 (transition-all duration-300)

**技术决策：**
- 使用 useEffect 监听全局键盘事件
- 沉浸模式下使用 fixed 定位的悬浮状态栏
- 背景使用 `bg-surface-container-lowest` 作为最深层级

### File List

**修改文件：**
- frontend/src/app/projects/[id]/editor/[chapter]/page.tsx

## Change Log

| Date | Change |
|------|--------|
| 2026-04-03 | Story file created from epics.md |
| 2026-04-03 | Status set to in-progress |
| 2026-04-03 | Implementation complete - all 4 tasks done |
| 2026-04-03 | Status updated to review |