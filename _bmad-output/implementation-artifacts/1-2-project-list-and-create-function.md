# Story 1.2: 项目列表与创建功能

Status: done

## Story

As a **作者**,
I want 创建新项目并在列表中查看所有项目,
So that 我可以管理多个小说创作项目。

## Acceptance Criteria

1. **AC1: 项目列表显示**
   - Given 用户访问首页
   - When 页面加载完成
   - Then 显示所有现有项目列表（卡片形式，显示项目名、创建时间、字数统计）

2. **AC2: 创建项目**
   - Given 用户点击"新建项目"按钮
   - When 填写项目名称并确认
   - Then 创建新项目目录结构（novel/、characters/、settings/、state/）
   - And 跳转到项目详情页

3. **AC3: 项目删除**
   - Given 用户点击删除按钮
   - When 确认删除
   - Then 项目从列表中移除
   - And 后端数据删除

4. **AC4: 项目统计**
   - Given 项目列表加载
   - When 显示项目卡片
   - Then 每个卡片显示字数统计和进度

## Tasks / Subtasks

- [x] Task 1: 实现项目列表页面 (AC: 1, 4)
  - [x] 1.1 创建首页布局结构（三栏：侧边栏 + 主内容 + AI 面板）
  - [x] 1.2 实现项目卡片组件
  - [x] 1.3 集成 projectsApi.list() 获取项目列表
  - [x] 1.4 显示项目统计信息（字数、进度、更新时间）
  - [x] 1.5 实现搜索栏 UI

- [x] Task 2: 实现项目创建功能 (AC: 2)
  - [x] 2.1 创建新建项目按钮和卡片入口
  - [x] 2.2 实现项目创建 Modal（名称、类型、目标字数、描述）
  - [x] 2.3 集成 projectsApi.create() API
  - [x] 2.4 创建成功后跳转到项目详情页
  - [x] 2.5 错误处理和提示

- [x] Task 3: 实现项目删除功能 (AC: 3)
  - [x] 3.1 添加删除按钮到项目卡片
  - [x] 3.2 实现删除确认对话框
  - [x] 3.3 集成 projectsApi.delete() API
  - [x] 3.4 删除后刷新列表

- [x] Task 4: 实现项目详情页入口 (AC: 2)
  - [x] 4.1 项目卡片点击跳转到 /projects/[id]
  - [x] 4.2 实现项目详情页基础布局

- [x] Task 5: 集成 Design System (AC: 1)
  - [x] 5.1 应用 Zen Editorial 设计系统颜色变量
  - [x] 5.2 使用 glass-panel 样式
  - [x] 5.3 实现响应式布局

- [x] Task 6: 端到端测试
  - [x] 6.1 配置 Playwright 测试框架
  - [x] 6.2 编写项目列表加载测试用例
  - [x] 6.3 编写项目创建/删除测试用例
  - [x] 6.4 编写响应式设计测试用例

## Dev Notes

### Architecture Requirements

**来源**: `_bmad-output/planning-artifacts/architecture.md`

- **前端框架**: Next.js 16 + Ant Design 6
- **状态管理**: Zustand（待添加，Story 5.10）
- **样式**: Tailwind CSS 4 + CSS Variables
- **API 客户端**: `frontend/src/lib/api.ts`
- **测试框架**: Playwright (E2E)

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

### API Endpoints

**来源**: `frontend/src/lib/api.ts`

```typescript
// Projects API
projectsApi.list() → { items: Project[], total: number }
projectsApi.get(id: string) → Project
projectsApi.create(data) → Project
projectsApi.delete(id: string) → { message: string }
projectsApi.stats(id: string) → ProjectStats
```

### Testing Approach

**为什么选择 Playwright 而非 Jest：**
- Tailwind CSS 4 + Ant Design 6 在 jsdom 环境中存在 CSS 解析兼容性问题
- E2E 测试更接近真实用户体验
- Playwright 原生支持多浏览器和多设备测试

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (claude-opus-4-6)

### Debug Log References

- 构建验证通过：`npm run build` 成功
- TypeScript 类型检查通过
- Tailwind CSS 4 与 jsdom 存在兼容性问题，选择 Playwright 作为替代方案

### Completion Notes List

**实现摘要：**
1. ✅ 项目列表页面完整实现（三栏布局）
2. ✅ 项目创建 Modal 和 API 集成
3. ✅ 项目删除功能和确认对话框
4. ✅ 项目详情页入口
5. ✅ Zen Editorial Design System 应用
6. ✅ Playwright E2E 测试框架配置

**技术决策：**
- 使用 Playwright 进行 E2E 测试，而非 Jest 单元测试
- 原因：Tailwind CSS 4 与 jsdom 的 CSS 选择器解析兼容性问题

**验证结果：**
- ✅ `npm run build` 成功
- ✅ TypeScript 编译通过
- ✅ 5 个路由正确生成

### File List

**已修改文件：**
- frontend/src/app/page.tsx
- frontend/src/app/layout.tsx
- frontend/src/app/globals.css
- frontend/src/app/projects/[id]/page.tsx
- frontend/src/lib/api.ts
- frontend/src/lib/api-hooks.ts
- frontend/src/lib/mock-data.ts
- frontend/src/types/index.ts
- frontend/package.json

**新建文件：**
- frontend/src/components/ui/GlassCard.tsx
- frontend/src/components/ui/GradientButton.tsx
- frontend/src/components/ui/IconButton.tsx
- frontend/src/components/ui/FocusBead.tsx
- frontend/src/components/ui/TabNav.tsx
- frontend/src/components/ui/AIPanel.tsx
- frontend/src/components/ui/SideNavBar.tsx
- frontend/src/components/ui/StatusBar.tsx
- frontend/src/components/ui/FloatingQuill.tsx
- frontend/src/components/ui/index.ts
- frontend/playwright.config.ts
- frontend/e2e/project-list.spec.ts
- frontend/jest.config.ts
- frontend/jest.setup.ts
- frontend/src/__tests__/page.test.tsx

## Change Log

| Date | Change |
|------|--------|
| 2026-04-02 | Story file created from epics.md |
| 2026-04-02 | Marked tasks 1-5 complete (implementation done) |
| 2026-04-02 | Added Playwright E2E test configuration |
| 2026-04-02 | Status updated to review |
| 2026-04-02 | Code review fixes applied: N+1 query (Promise.all), race conditions (AbortController), unused imports removed, defensive null checks, date error handling |
| 2026-04-02 | Status updated to done |