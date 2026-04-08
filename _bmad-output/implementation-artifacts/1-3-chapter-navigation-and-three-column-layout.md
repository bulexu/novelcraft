# Story 1.3: 章节导航与三栏布局

Status: done

## Story

As a **作者**,
I want 使用三栏布局（章节导航 + 编辑器 + 预览）进行写作,
So that 我可以方便地在章节间切换并实时预览内容。

## Acceptance Criteria

1. **AC1: 三栏布局显示**
   - Given 用户进入项目编辑器页面
   - When 页面加载完成
   - Then 显示三栏布局：左侧章节导航、中间编辑器、右侧预览区

2. **AC2: 章节导航功能**
   - Given 用户在章节导航中点击某章节
   - When 选择完成
   - Then 编辑器加载该章节内容
   - And 预览区同步显示渲染后的内容

3. **AC3: 响应式设计**
   - Given 用户在不同尺寸屏幕访问
   - When 屏幕宽度变化
   - Then 大屏(>1440px)显示三栏
   - And 中屏(1024-1440px)显示双栏(编辑+预览，导航折叠)
   - And 小屏(<1024px)显示单栏编辑，预览/导航切换显示

4. **AC4: 章节切换保存**
   - Given 用户编辑章节后切换到其他章节
   - When 执行切换
   - Then 自动保存当前章节内容
   - And 加载新章节内容

## Tasks / Subtasks

- [x] Task 1: 创建编辑器页面基础结构 (AC: 1, 3)
  - [x] 1.1 创建 `/projects/[id]/editor/[chapter]/page.tsx` 路由
  - [x] 1.2 实现三栏布局组件 (ChapterNav + Editor + Preview)
  - [x] 1.3 集成响应式断点逻辑 (Tailwind breakpoints)

- [x] Task 2: 实现章节导航组件 (AC: 1, 2)
  - [x] 2.1 创建 `ChapterNav` 组件 (章节列表、当前高亮、新建入口)
  - [x] 2.2 集成 `chaptersApi.list()` 获取章节列表
  - [x] 2.3 实现章节切换逻辑 (保存当前 → 加载目标)
  - [x] 2.4 显示章节统计信息 (字数、角色数)

- [x] Task 3: 实现 Markdown 编辑器 (AC: 2)
  - [x] 3.1 创建 `NovelEditor` 组件 (基础文本编辑功能)
  - [x] 3.2 集成 `chaptersApi.get()` 和 `chaptersApi.update()`
  - [x] 3.3 实现内容变更状态管理 (isDirty)
  - [x] 3.4 实现自动保存防抖 (30秒间隔)

- [x] Task 4: 实现 NovelPreview 组件 (AC: 2, 3)
  - [x] 4.1 创建 `NovelPreview` 组件 (react-markdown + remark-gfm)
  - [x] 4.2 应用中文阅读样式 (Noto Serif SC, 18px, 1.8行高, 首行缩进2em)
  - [x] 4.3 实现实时预览同步 (编辑器内容变化 → 预览更新)
  - [x] 4.4 支持深色/浅色主题切换

- [x] Task 5: 实现章节切换与保存逻辑 (AC: 2, 4)
  - [x] 5.1 实现章节切换流程 (保存当前 → 加载新章节)
  - [x] 5.2 添加切换确认对话框 (有未保存更改时)
  - [x] 5.3 实现新建章节功能 (Modal + API)
  - [x] 5.4 处理浏览器刷新/关闭提醒 (beforeunload)

- [x] Task 6: 集成 Design System 与测试 (AC: 1, 3)
  - [x] 6.1 应用 Zen Editorial 设计系统颜色变量
  - [x] 6.2 添加 glass-panel 样式到 AI 面板
  - [x] 6.3 编写 Playwright E2E 测试用例
  - [x] 6.4 验证响应式布局在各断点正常工作

## Dev Notes

### Architecture Requirements

**来源**: `_bmad-output/planning-artifacts/architecture.md`

- **前端框架**: Next.js 16 + Ant Design 6
- **状态管理**: Zustand（待添加，Story 5.10，本 story 不实现）
- **样式**: Tailwind CSS 4 + CSS Variables
- **API 客户端**: `frontend/src/lib/api.ts`
- **测试框架**: Playwright (E2E)

### ADR-002: 移除 Docsify

**关键决策**: 不使用 Docsify iframe 嵌入，采用 react-markdown 预览组件

**理由**:
- 减少 iframe 嵌入复杂性
- 统一 React 技术栈
- 可实现编辑器 ↔ 预览同步滚动
- 小说专用渲染格式更符合需求

**依赖**:
```bash
npm install react-markdown remark-gfm
```

### Design System: Zen Editorial

**来源**: `docs/ui_design.md`, `frontend/src/app/globals.css`

| Token | Value | Usage |
|-------|-------|-------|
| --primary | #4648d4 | Primary actions |
| --background | #fcf8ff | Page background |
| --surface | #ffffff | Cards, panels |
| --surface-container-low | #f5f2fe | Sidebar |
| --on-surface | #1d1b20 | Primary text |
| --on-surface-variant | #49454e | Secondary text |
| --outline-variant | #cac4d0 | Borders |

**"No-Line" Rule**: 使用 tonal transitions 替代 borders

### 三栏布局设计规范

**来源**: `docs/ui_design.md` 第4节

```
┌────────────────────────────────────────────────────────────────────┐
│  ┌── 章节导航 ──┐  ┌─── Markdown 编辑器 ───┐  ┌── Preview ──┐      │
│  │  (240px)     │  │   (flex-1)            │  │  (400px)    │      │
│  │              │  │                       │  │             │      │
│  │ ▼ 第一卷     │  │ # 第一章              │  │  第一章     │      │
│  │   第1章      │  │                       │  │             │      │
│  │   第2章 ●    │  │ 天色渐暗，...         │  │  天色渐暗   │      │
│  │   第3章      │  │                       │  │  ...        │      │
│  │              │  │                       │  │             │      │
│  └──────────────┘  └───────────────────────┘  └─────────────┘      │
└────────────────────────────────────────────────────────────────────┘
```

**响应式断点**:

| 设备 | 宽度 | 布局 |
|------|------|------|
| 大屏 | >1440px | 三栏 |
| 中屏 | 1024-1440px | 双栏 (导航折叠，编辑+预览) |
| 小屏 | <1024px | 单栏编辑，预览/导航切换 |

### NovelPreview 组件规范

**来源**: `docs/ui_design.md` 第3节, UX-DR13, UX-DR14

```tsx
// 中文阅读优化样式
const previewStyles = {
  fontFamily: "'Noto Serif SC', 'Source Han Serif CN', serif",
  fontSize: '18px',
  lineHeight: '1.8',
  paragraphIndent: '2em',  // 首行缩进
};

// 段落渲染
p {
  margin: 1.5em 0;
  text-indent: 2em;
}

// 对话格式
.dialogue {
  text-indent: 0;
  padding-left: 1em;
}
```

### API Endpoints

**来源**: `frontend/src/lib/api.ts`

```typescript
// Chapters API (已实现)
chaptersApi.list(projectId) → { items: Chapter[], total: number, total_words: number }
chaptersApi.get(projectId, chapterNum) → Chapter
chaptersApi.create(projectId, data) → Chapter
chaptersApi.update(projectId, chapterNum, data) → Chapter
chaptersApi.delete(projectId, chapterNum) → void
```

### 前一个 Story 的关键学习

**来源**: Story 1.2 实现经验

1. **Race Condition 防护**: 使用 AbortController
   ```typescript
   useEffect(() => {
     const controller = new AbortController();
     loadData(controller.signal);
     return () => controller.abort();
   }, [projectId]);
   ```

2. **并行 API 请求**: 使用 Promise.all 避免 N+1 问题
   ```typescript
   const [project, chapters, characters] = await Promise.all([
     projectsApi.get(projectId),
     chaptersApi.list(projectId),
     charactersApi.list(projectId),
   ]);
   ```

3. **测试框架**: 使用 Playwright 进行 E2E 测试 (非 Jest)

### 文件结构

**新建文件**:
- `frontend/src/app/projects/[id]/editor/[chapter]/page.tsx` - 编辑器页面
- `frontend/src/components/editor/NovelEditor.tsx` - Markdown 编辑器组件
- `frontend/src/components/editor/NovelPreview.tsx` - 预览组件
- `frontend/src/components/editor/ChapterNav.tsx` - 章节导航组件
- `frontend/src/components/editor/index.ts` - 组件导出
- `frontend/e2e/editor.spec.ts` - E2E 测试

**已存在可复用组件**:
- `frontend/src/components/ui/GlassCard.tsx`
- `frontend/src/components/ui/GradientButton.tsx`
- `frontend/src/components/ui/IconButton.tsx`
- `frontend/src/components/ui/AIPanel.tsx`
- `frontend/src/components/ui/SideNavBar.tsx`
- `frontend/src/components/ui/StatusBar.tsx`

### 性能考虑

1. **编辑器防抖**: 内容变更后 500ms 更新预览，避免频繁渲染
2. **自动保存防抖**: 内容变更后 30 秒自动保存
3. **章节列表缓存**: 切换章节时不重复请求列表
4. **预览渲染优化**: 考虑使用 `useMemo` 缓存渲染结果

### 测试要点

1. **E2E 测试场景**:
   - 页面加载显示三栏布局
   - 章节切换保存当前内容
   - 新建章节功能
   - 响应式布局断点

2. **边界条件**:
   - 空章节列表处理
   - 网络错误处理
   - 无效章节编号处理

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (claude-opus-4-6)

### Debug Log References

- 构建验证通过：`npm run build` 成功
- TypeScript 类型检查通过
- 安装了 react-markdown 和 remark-gfm 依赖

### Completion Notes List

**实现摘要：**
1. ✅ 编辑器页面基础结构（三栏布局 + 响应式）
2. ✅ ChapterNav 组件（章节列表、高亮、切换、删除）
3. ✅ NovelEditor 组件（textarea 编辑器、Cmd+S 保存）
4. ✅ NovelPreview 组件（react-markdown + 中文阅读样式）
5. ✅ 章节切换与自动保存逻辑（30秒防抖）
6. ✅ 新建章节 Modal
7. ✅ 浏览器关闭提醒（beforeunload）
8. ✅ Playwright E2E 测试框架配置

**技术决策：**
- 使用原生 textarea 作为基础编辑器（后续可升级为 Monaco）
- 使用 react-markdown + remark-gfm 进行预览渲染
- 响应式断点：大屏(>1440px)三栏、中屏(1024-1440px)双栏、小屏(<1024px)单栏

**验证结果：**
- ✅ `npm run build` 成功
- ✅ TypeScript 编译通过
- ✅ 6 个路由正确生成

### File List

**新建文件：**
- frontend/src/app/projects/[id]/editor/[chapter]/page.tsx
- frontend/src/components/editor/ChapterNav.tsx
- frontend/src/components/editor/NovelEditor.tsx
- frontend/src/components/editor/NovelPreview.tsx
- frontend/src/components/editor/index.ts
- frontend/e2e/editor.spec.ts

## Change Log

| Date | Change |
|------|--------|
| 2026-04-03 | Story file created from epics.md |
| 2026-04-03 | Implementation complete - all 6 tasks done |
| 2026-04-03 | Status updated to review |
| 2026-04-03 | Code review completed - 6 patch, 1 defer |

## Review Findings

### 决策需确认 → 已解决

- [x] ~~[Review][Decision] 四栏布局违反 AC1 三栏规范~~ → AI 面板改为用户主动触发
- [x] ~~[Review][Decision] 小屏缺少预览/导航切换机制~~ → 添加编辑/编辑+预览/预览三种模式

### Patch (已修复)

- [x] [Review][Patch] 自动保存 effect 缺少 handleSave 依赖项 [page.tsx:121-129] — 使用 ref 模式避免闭包陈旧
- [x] [Review][Patch] 删除章节错误处理静默失败 [ChapterNav.tsx] — 添加 message 反馈
- [x] [Review][Patch] 自动保存失败静默无提示 [page.tsx] — 添加错误提示
- [x] [Review][Patch] 保存时设置 isDirty(false) 过早 [page.tsx] — 保持原有逻辑，API 成功后设置
- [x] [Review][Patch] 无用的 useMemo [NovelPreview.tsx] — 已移除
- [x] [Review][Patch] 导航模式不一致 [ChapterNav.tsx] — 改用 router.push
- [x] [Review][Patch] resize 处理未防抖 [page.tsx] — 添加 150ms 防抖

### Defer (延后处理)

- [x] [Review][Defer] 路由参数类型安全 [page.tsx:32] — 已延后，边缘情况（URL 重复参数）
- [x] [Review][Defer] 缺少键盘快捷键 (Cmd+Shift+A/I/K) — 已延后，属于后续 Story 功能
- [x] [Review][Defer] 编辑器自动完成 (@角色名, #设定) — 已延后，属于后续 Story 功能
- [x] [Review][Defer] 沉浸式写作模式 — 已延后，Story 1.6 功能

### Dismissed (已排除)

- `newChapterTitle` 未定义 — 误报，实际定义于 line 50
- useCallback 依赖项问题 — 误报，实现正确
- XSS 风险 — 误报，React 自动转义
- effect 每次内容变化运行 — 预期的防抖行为