---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
inputDocuments:
  - docs/prd.md
  - docs/ui_design.md
  - docs/workflow.md
  - docs/character_logic.md
  - docs/consistency_rules.md
  - reference: github.com/666ghj/MiroFish
workflowType: 'architecture'
project_name: 'novelcraft'
user_name: 'Bulexu'
date: '2026-04-02'
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

## 输入文档

| 文档 | 路径 | 说明 |
|------|------|------|
| PRD | docs/prd.md | 产品需求文档 (28KB) |
| UI 设计 | docs/ui_design.md | UI/UX 设计规范 (36KB) |
| 工作流 | docs/workflow.md | 创作工作流程 |
| 角色逻辑 | docs/character_logic.md | 角色推演指南 |
| 一致性规则 | docs/consistency_rules.md | 一致性检查规则 |
| 参考项目 | github.com/666ghj/MiroFish | 多智能体社会模拟引擎 |

## Project Context Analysis

### Requirements Overview

**功能需求分类：**

| 模块 | 功能点 | 架构影响 |
|------|--------|----------|
| 角色档案管理 | CRUD、演变记录、关系网络 | 文件存储 + API 服务 |
| 行为一致性推演 | 多因素加权模型、概率输出 | LLM 调用 + 推理引擎 |
| 一致性检查系统 | 实时/定期/深度检查 | 规则引擎 + LLM 分析 |
| 知识图谱系统 | 实体提取、关系构建、查询 | Neo4j + LightRAG |
| AI 文本检测 | 模式识别、评分、修复 | 规则引擎 + LLM |
| 风格迁移系统 | 笔风学习、匹配续写 | 向量检索 + Prompt 模板 |
| 笔风演化与导入 | 文件解析、分析流水线 | 异步任务 + 多服务协作 |
| 类型写作模式 | 类型模板、参数配置 | 配置驱动 |

**非功能需求：**

| NFR | 约束 | 架构决策影响 |
|-----|------|--------------|
| 文件优先 | 人类可编辑 Markdown/YAML | 文件系统作为主数据源 |
| Git 友好 | 支持版本控制 | 扁平文件结构，无数据库依赖 |
| AI 原生 | AI 直接读写 | 无 ORM，Prompt 友好格式 |
| 语义增强 | 知识图谱能力 | Neo4j + LightRAG 双图谱方案 |
| 向量检索 | 笔风匹配 | LightRAG 内置向量存储 |

### Scale & Complexity

| 指标 | 评估 |
|------|------|
| **复杂度** | 中-高 |
| **主要领域** | 全栈 Web 应用 + AI 服务 |
| **存储复杂度** | 高（三存储：文件/图/向量） |
| **AI 集成深度** | 重度（核心功能依赖 LLM） |
| **实时性要求** | 中等（编辑器同步、流式响应） |
| **预估组件数** | 15-20 个核心服务/模块 |

### Technical Constraints & Dependencies

**技术栈约束（PRD 已定义）：**
- 后端：Python 3.11+ / FastAPI
- 前端：Next.js + Ant Design
- 存储：文件系统 + Neo4j + Qdrant

**新增依赖（基于 MiroFish 参考增强）：**
- Zep Cloud - 图谱构建与记忆管理
- OASIS - 多智能体社交模拟引擎

### MiroFish 架构借鉴

**核心借鉴模块：**

```
NovelCraft 新增服务模块:
├── graph_builder.py      # 图谱构建服务（本体定义→分块→构建→等待）
├── profile_generator.py  # 角色人设自动生成（从实体到 Agent Profile）
├── simulation_manager.py # 模拟管理器（状态机、准备流程、配置生成）
├── inference_engine.py   # 行为推演引擎（多因素加权模型）
└── report_agent.py       # 分析报告生成（深度交互工具集）
```

**数据流融合架构：**

```
内容导入
    │
    ▼
┌─────────────────────────────────────────────────────────┐
│                  GraphBuilderService                     │
│  1. create_graph() - 创建 Zep 图谱                       │
│  2. set_ontology() - 设置本体（角色/地点/事件/关系）      │
│  3. add_text_batches() - 分批添加文本                    │
│  4. _wait_for_episodes() - 等待处理完成                  │
└─────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────┐
│                  ProfileGenerator                        │
│  - 从图谱实体提取角色信息                                │
│  - LLM 增强生成详细人设                                  │
│  - 输出 OASIS Agent Profile 格式                         │
└─────────────────────────────────────────────────────────┘
    │
    ├──▶ Neo4j 同步（关系查询、可视化）
    │
    └──▶ OASIS 模拟引擎
            │
            ▼
    ┌─────────────────────────────────────────────────────────┐
    │                  SimulationManager                       │
    │  状态机: created → preparing → ready → running → done    │
    │  - prepare_simulation() - 准备环境                       │
    │  - LLM 生成模拟配置（时间、活跃度、发言频率）             │
    │  - 并行运行 Twitter/Reddit 双平台模拟                    │
    └─────────────────────────────────────────────────────────┘
            │
            ▼
    行为推演结果 → 一致性检查 → 续写建议
```

**关键类设计借鉴：**

```python
# 借鉴 MiroFish 的 SimulationState 状态管理
class SimulationState:
    simulation_id: str
    project_id: str
    graph_id: str
    status: SimulationStatus  # created/preparing/ready/running/completed/failed
    entities_count: int
    profiles_count: int
    config_generated: bool
    current_round: int
    error: Optional[str]

# 借鉴 MiroFish 的 GraphBuilderService 流程
class GraphBuilderService:
    def build_graph_async(text, ontology) -> task_id
    def create_graph(name) -> graph_id
    def set_ontology(graph_id, ontology)
    def add_text_batches(graph_id, chunks, batch_size) -> episode_uuids
    def _wait_for_episodes(episode_uuids, timeout)
    def get_graph_data(graph_id) -> {nodes, edges}

# 借鉴 MiroFish 的 ProfileGenerator
class OasisProfileGenerator:
    def generate_profiles_from_entities(
        entities,
        use_llm=True,
        progress_callback=None,
        parallel_count=3,
        realtime_output_path=None
    ) -> List[OasisAgentProfile]
```

### Cross-Cutting Concerns Identified

1. **一致性保证系统**
   - 角色行为 → 性格特质/内逻辑/语言风格
   - 世界观 → 规则/时间线/物理逻辑
   - 叙事 → 伏笔/信息披露

2. **文件-图谱同步机制**
   - 文件变更 → 触发图谱更新
   - 图谱查询 → 反写文件元数据
   - 版本一致性保证

3. **AI 调用管理层**
   - 流式响应统一处理
   - Token 消耗监控
   - 重试与降级策略
   - 并行调用优化（借鉴 MiroFish parallel_profile_count）

4. **实时状态同步**
   - 编辑器 ↔ 预览 ↔ AI 面板
   - 模拟进度回调（借鉴 progress_callback 模式）
   - SSE/WebSocket 推送

5. **笔风向量化管线**
   - 导入分析 → 特征提取 → 向量化 → 存储
   - 相似度检索 → 风格匹配 → 续写生成

---

## 架构决策记录 (ADR)

### ADR-001: MVP 技术栈简化

**状态**: 已确认 (2026-04-03 更新)

**背景**: 原计划采用 Neo4j + Qdrant + Zep Cloud 三存储架构，复杂度高，验证周期长。

**决策**: 采用极简 MVP 架构，使用 LightRAG 替代 Zep Cloud，保留 Neo4j 用于图谱可视化，移除 Qdrant。

**理由**:
- LightRAG 本地部署，数据隐私有保障
- 开源免费，无云服务成本
- 图谱结果可序列化为 JSON，支持 Git 追踪
- 与 OASIS 引擎原生兼容
- Neo4j 提供强大的图谱可视化和复杂查询能力

**技术选型**:

| 组件 | 选型 | 理由 |
|------|------|------|
| 知识图谱构建 | LightRAG | 本地、开源、可 Git 追踪 |
| 图谱存储/可视化 | Neo4j | 强大的 Cypher 查询、可视化支持 |
| 向量存储 | LightRAG 内置 | 无需 Qdrant |
| 角色模拟 | OASIS | MiroFish 已验证有效 |
| 存储 | 文件系统 | 人类可编辑、版本控制 |
| 后端 | FastAPI | Python 生态兼容 |
| 前端 | Next.js + Ant Design | 已有代码基础 |

### ADR-002: 移除 Docsify

**状态**: 已确认

**背景**: 原计划使用 Docsify iframe 嵌入实现小说预览，存在通信复杂、状态割裂问题。

**决策**: 移除 Docsify，采用自定义 React 预览组件。

**理由**:
- 减少 iframe 嵌入复杂性
- 统一 React 技术栈
- 可实现编辑器 ↔ 预览同步滚动
- 小说专用渲染格式更符合需求

**实现方案**:

```tsx
// 小说专用预览组件
<NovelPreview>
  <Paragraph indent>天色渐暗...</Paragraph>    // 首行缩进
  <Dialogue speaker="张三">"你说什么？"</Dialogue>  // 对话高亮
  <SceneBreak />                                // 场景分隔
</NovelPreview>
```

**依赖变更**:

```diff
- docsify (iframe 嵌入)
+ react-markdown (React 组件)
+ remark-gfm (GitHub 风格 Markdown)
```

### ADR-003: 前端框架保持现状

**状态**: 已确认

**背景**: 曾讨论是否切换到 Vue3 + Element Plus。

**决策**: 保持 Next.js + Ant Design。

**理由**:
- 已有可运行代码，切换浪费 7-11 天
- 两者对 NovelCraft 需求无本质差异
- Ant Design 企业级组件完善
- Next.js 内置 SSR，SEO 和首屏性能更好

---

## MVP 核心架构

### 系统架构图

```
┌─────────────────────────────────────────────┐
│                  前端                        │
│  Next.js + Ant Design + 自定义预览          │
└─────────────────────────────────────────────┘
                    ↓ REST API
┌─────────────────────────────────────────────┐
│                 后端                         │
│  FastAPI + LightRAG + OASIS                 │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│              存储层                          │
│  文件系统 (Markdown/YAML)                   │
│  + LightRAG 本地向量/图存储                 │
└─────────────────────────────────────────────┘
```

### MVP 核心循环

```
小说导入 → LightRAG 构建图谱 → 提取角色实体
                                      ↓
                               OASIS Profile 生成
                                      ↓
                               行为推演 → 续写建议
```

### MVP API 端点（精简版）

```python
# 核心 API (仅 5 个)
POST /api/v1/projects/           # 创建项目
POST /api/v1/import/             # 导入小说 → LightRAG 构建
GET  /api/v1/characters/         # 获取角色列表
POST /api/v1/simulate/           # 触发 OASIS 模拟
POST /api/v1/continue/           # 续写建议
```

---

## Starter Template Evaluation

### 现有代码评估

**结论：项目已实现核心框架，无需从零选择 Starter。**

| 层级 | 已选技术 | 实现状态 | 文件 |
|------|----------|----------|------|
| 后端框架 | FastAPI | ✅ 已实现 | `backend/app/main.py` |
| 知识图谱 | LightRAG | ✅ 已实现 | `backend/app/services/lightrag_service.py` (14KB) |
| 角色模拟 | OASIS | ✅ 已实现 | `backend/app/services/oasis_simulation.py` (24KB) |
| 文件管理 | FileManager | ✅ 已实现 | `backend/app/services/file_manager.py` (20KB) |
| VibeWriter | LLM 集成 | ✅ 已实现 | `backend/app/services/vibewriter.py` (18KB) |
| 前端框架 | Next.js 16 | ✅ 已实现 | `frontend/src/app/` |
| UI 组件 | Ant Design 6 | ✅ 已实现 | `frontend/package.json` |
| 编辑器 | 基础实现 | ⚠️ 有问题 | `frontend/src/app/projects/[id]/editor/[chapter]/page.tsx` |

### 依赖清理建议

**后端 requirements.txt：**

```diff
# MVP 不需要的依赖（移除）
- qdrant-client>=1.7.0

# 保留的核心依赖
fastapi>=0.109.0
uvicorn[standard]>=0.27.0
pydantic>=2.5.3
openai>=1.10.0
lightrag-hku>=0.0.5
neo4j>=5.17.0  # 保留用于图谱可视化
aiofiles>=23.2.1
pyyaml>=6.0
```

**前端 package.json：**

```diff
# 新增（替代 Docsify）
+ react-markdown
+ remark-gfm

# 已有的核心依赖
antd: ^6.3.5
next: 16.2.2
react: 19.2.4
```

### 现有代码与 MVP 对齐度

**对齐度：85%**

| 需要调整 | 工作量 |
|----------|--------|
| 移除 Qdrant 依赖（保留 Neo4j） | 0.5 天 |
| 添加 react-markdown 预览 | 1-2 天 |
| 修复编辑器滚动条 | 0.5 天 |
| **总计** | **2-3 天** |

**Note:** 项目初始化已完成，下一步是实现具体功能故事。

---

## Core Architectural Decisions

### Decision Priority Analysis

**已确定的决策（来自 ADR 和现有代码）：**

| 决策 | 选择 | 来源 |
|------|------|------|
| 数据存储 | 文件系统 + LightRAG | ADR-001 |
| 图谱可视化 | Neo4j | ADR-001 |
| 后端框架 | FastAPI + Python 3.11+ | 现有代码 |
| 前端框架 | Next.js 16 + Ant Design 6 | 现有代码 |
| 知识图谱构建 | LightRAG（本地） | ADR-001 |
| 角色模拟 | OASIS | MiroFish 借鉴 |
| 前端预览 | react-markdown | ADR-002 |

**MVP 新增决策：**

| 决策 | 选择 | 理由 |
|------|------|------|
| 认证 | 无认证 | 单用户本地部署 |
| API 风格 | REST | 已实现，标准简单 |
| 状态管理 | Zustand | 轻量，适合中型应用 |
| 部署方式 | Docker Compose | 一键部署 |

### Data Architecture

**存储策略：文件优先 + Neo4j 可视化**

```
data/projects/{project-id}/
├── novel/              # 小说正文
├── characters/         # 角色档案
├── settings/           # 世界设定
├── state/              # 运行状态
└── .lightrag/          # LightRAG 索引
    ├── graph.json      # 知识图谱 (本地)
    └── vectors.npy     # 向量存储 (本地)
```

**Neo4j 用于图谱可视化：**
- LightRAG 图谱同步到 Neo4j
- 提供 Cypher 查询能力
- 前端图谱可视化支持

**无外部数据库依赖（向量）：**
- ❌ PostgreSQL
- ❌ MongoDB
- ❌ Qdrant（LightRAG 内置）
- ✅ Neo4j（可视化层）
- ✅ 文件系统（主存储）

### Authentication & Security

**MVP 认证策略：无认证**

| 因素 | 说明 |
|------|------|
| 定位 | 个人创作工具 |
| 部署 | 本地/私有服务器 |
| 用户 | 单用户 |
| 安全 | 网络层隔离（防火墙/VPN） |

**Phase 2 可选：**
- 简单密码保护
- API Token 访问

### API & Communication Patterns

**REST API 设计（已实现）：**

```
/api/v1/
├── projects/           # 项目 CRUD
├── characters/         # 角色 CRUD + 推演
├── chapters/           # 章节 CRUD
├── chat/               # AI 聊天
├── kg/                 # 知识图谱查询
├── simulation/         # OASIS 模拟
├── style/              # 风格分析 + 导入
├── consistency/        # 一致性检查
└── inference/          # 行为推演
```

**API 版本：** v1

**错误响应格式：**
```json
{
  "error": "错误类型",
  "message": "详细描述",
  "detail": {}
}
```

### Frontend Architecture

**状态管理：Zustand**

```typescript
// lib/store.ts
interface AppState {
  currentProjectId: string | null;
  settings: UserSettings;
  aiPanel: {
    visible: boolean;
    mode: 'inference' | 'continue' | 'check';
  };
}
```

**组件结构：**

```
frontend/src/
├── app/                    # Next.js App Router
│   ├── page.tsx            # 首页（项目列表）
│   └── projects/[id]/
│       ├── page.tsx        # 项目详情
│       └── editor/[chapter]/
│           └── page.tsx    # 编辑器
├── components/
│   ├── NovelEditor/        # Markdown 编辑器
│   ├── NovelPreview/       # 小说预览（react-markdown）
│   ├── AIPanel/            # AI 辅助面板
│   └── ui/                 # 通用 UI 组件
├── lib/
│   ├── api.ts              # API 客户端
│   └── store.ts            # Zustand store
└── types/
    └── index.ts            # TypeScript 类型定义
```

**样式方案：**
- Tailwind CSS 4（已配置）
- Ant Design 主题覆盖
- CSS 变量支持暗色模式

### Infrastructure & Deployment

**部署选项：**

| 方式 | 命令 | 说明 |
|------|------|------|
| Docker Compose | `docker-compose up -d` | 生产部署 |
| 本地开发 | `./dev.sh` | 前后端分离调试 |
| 一键启动 | `./start.sh` | 后台运行 |

**服务组成：**

```yaml
# docker-compose.yml
services:
  frontend:    # Next.js
  backend:     # FastAPI
  # 无数据库服务
```

**环境变量：**

```env
# LLM 配置（支持 OpenAI 兼容 API）
LLM_API_KEY=your-api-key
LLM_BASE_URL=https://api.openai.com/v1
LLM_MODEL_NAME=gpt-4

# 数据目录
DATA_DIR=/app/data
```

**LLM 提供商支持：**

| 提供商 | BASE_URL |
|--------|----------|
| OpenAI | https://api.openai.com/v1 |
| 阿里百炼 | https://dashscope.aliyuncs.com/compatible-mode/v1 |
| 智谱 AI | https://open.bigmodel.cn/api/paas/v4 |
| DeepSeek | https://api.deepseek.com/v1 |

### Decision Impact Analysis

**实现顺序：**

1. 依赖清理（移除 Neo4j/Qdrant）
2. 添加 Zustand 状态管理
3. 实现 NovelPreview 组件（react-markdown）
4. 修复编辑器滚动条问题
5. 完善 LightRAG 集成
6. 完善 OASIS 模拟调用

**跨组件依赖：**

```
NovelEditor ←→ NovelPreview (同步滚动)
     ↓
   Zustand (共享状态)
     ↓
  API Client ←→ Backend
                    ↓
              LightRAG + OASIS
```

---

## Implementation Patterns & Consistency Rules

### Naming Patterns

**文件命名：**

| 类型 | 规则 | 示例 |
|------|------|------|
| 后端 Python 文件 | snake_case | `files.py`, `knowledge_graph.py` |
| 前端组件文件 | PascalCase | `NovelEditor.tsx`, `AIPanel.tsx` |
| 前端页面文件 | 小写 | `page.tsx`, `layout.tsx` |
| 配置文件 | 小写 | `config.py`, `store.ts` |
| 类型文件 | 小写 | `index.ts`, `types.ts` |

**类/类型命名：**

| 类型 | 规则 | 示例 |
|------|------|------|
| Python 类 | PascalCase | `CharacterMD`, `ChapterMD` |
| TypeScript 接口 | PascalCase | `Project`, `Character` |
| TypeScript 类型 | PascalCase | `ProjectStatus`, `SimulationStatus` |
| React 组件 | PascalCase | `NovelEditor`, `AIPanel` |

**变量/函数命名：**

| 位置 | 规则 | 示例 |
|------|------|------|
| Python 变量 | snake_case | `project_id`, `total_words` |
| Python 函数 | snake_case | `get_character()`, `build_graph()` |
| TypeScript 变量 | camelCase | `projectId`, `totalWords` |
| TypeScript 函数 | camelCase | `getCharacter()`, `buildGraph()` |
| React hooks | use 前缀 | `useProject()`, `useSimulation()` |
| Zustand store | use 前缀 | `useAppStore()` |

### Structure Patterns

**后端目录结构：**

```
backend/app/
├── api/                    # API 路由
│   ├── __init__.py         # 路由聚合
│   ├── files.py            # 文件管理 API
│   ├── chat.py             # VibeWriting API
│   ├── knowledge_graph.py  # 知识图谱 API
│   ├── simulation.py       # OASIS 模拟 API
│   └── style_import.py     # 风格分析 API
├── services/               # 业务逻辑
│   ├── file_manager.py
│   ├── lightrag_service.py
│   ├── oasis_simulation.py
│   └── vibewriter.py
├── schemas/                # Pydantic 模型
│   ├── file_models.py
│   └── settings.py
├── config.py               # 配置管理
└── main.py                 # FastAPI 入口
```

**前端目录结构：**

```
frontend/src/
├── app/                    # Next.js App Router
│   ├── page.tsx            # 首页
│   ├── layout.tsx          # 根布局
│   └── projects/[id]/
│       ├── page.tsx        # 项目详情
│       └── editor/[chapter]/
│           └── page.tsx    # 编辑器
├── components/             # React 组件
│   ├── NovelEditor/
│   ├── NovelPreview/
│   ├── AIPanel/
│   └── ui/                 # 通用 UI
├── lib/                    # 工具库
│   ├── api.ts              # API 客户端
│   └── store.ts            # Zustand store
├── types/                  # TypeScript 类型
│   └── index.ts
└── hooks/                  # 自定义 hooks
```

### Format Patterns

**API 响应格式：**

```typescript
// 成功响应
{
  "data": { ... },           // 响应数据
  "message": "操作成功"       // 可选消息
}

// 错误响应
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "参数验证失败",
    "detail": { ... }        // 可选详情
  }
}

// 分页响应
{
  "items": [...],
  "total": 100,
  "page": 1,
  "page_size": 20
}
```

**日期格式：**

| 场景 | 格式 | 示例 |
|------|------|------|
| API 传输 | ISO 8601 | `2024-04-01T12:00:00Z` |
| 数据库/文件 | ISO 8601 | `2024-04-01T12:00:00` |
| 显示 | 本地化 | `2024年4月1日 12:00` |

**枚举值：**

| 位置 | 规则 | 示例 |
|------|------|------|
| Python | 小写字符串 | `'draft'`, `'ongoing'`, `'completed'` |
| TypeScript | 小写字符串类型 | `'draft' \| 'ongoing' \| 'completed'` |

### Communication Patterns

**API 端点命名：**

| 操作 | 规则 | 示例 |
|------|------|------|
| 列表 | GET /资源复数 | `GET /projects` |
| 详情 | GET /资源复数/:id | `GET /projects/:id` |
| 创建 | POST /资源复数 | `POST /projects` |
| 更新 | PUT /资源复数/:id | `PUT /projects/:id` |
| 删除 | DELETE /资源复数/:id | `DELETE /projects/:id` |
| 自定义操作 | POST /资源复数/:id/动作 | `POST /simulation/:id/start` |

**状态管理模式：**

```typescript
// Zustand store 结构
interface AppStore {
  // 状态
  currentProjectId: string | null;
  settings: Settings;
  
  // 操作
  setCurrentProject: (id: string) => void;
  updateSettings: (settings: Partial<Settings>) => void;
}
```

### Process Patterns

**错误处理：**

```typescript
// 前端错误处理
try {
  const result = await api.getProject(id);
  return result;
} catch (error) {
  if (error instanceof ApiError) {
    message.error(error.message);
  } else {
    message.error('未知错误');
  }
  throw error;
}
```

```python
# 后端错误处理
from fastapi import HTTPException

raise HTTPException(
  status_code=400,
  detail={
    "code": "VALIDATION_ERROR",
    "message": "参数验证失败"
  }
)
```

**加载状态：**

```typescript
// 组件内加载状态
const [loading, setLoading] = useState(false);

// 全局加载状态（可选，用于页面级）
const loading = useAppStore(state => state.loading);
```

### Enforcement Guidelines

**所有 AI Agent 必须遵循：**

1. **命名一致性**：严格按照上述命名规则
2. **API 格式**：响应格式必须符合规范
3. **错误处理**：统一使用 HTTPException 和 try-catch
4. **类型定义**：所有 API 相关类型必须在 `types/index.ts` 中定义
5. **组件位置**：通用组件放 `components/ui/`，业务组件放 `components/`

**代码审查检查点：**

- [ ] 文件命名是否符合规范
- [ ] API 响应格式是否正确
- [ ] 错误处理是否完整
- [ ] TypeScript 类型是否定义
- [ ] 组件位置是否正确

---

## Project Structure & Boundaries

### Complete Project Directory Structure

```
novelcraft/
├── README.md                       # 项目说明
├── docker-compose.yml              # Docker 编排
├── start.sh                        # 一键启动脚本
├── dev.sh                          # 开发模式脚本
├── Makefile                        # 命令快捷入口
├── .env.example                    # 环境变量示例
│
├── backend/                        # 后端服务
│   ├── Dockerfile                  # 后端容器
│   ├── requirements.txt            # Python 依赖
│   ├── .env.example                # 后端环境变量
│   └── app/
│       ├── __init__.py
│       ├── main.py                 # FastAPI 入口
│       ├── config.py               # 配置管理
│       ├── api/                    # API 路由层
│       │   ├── __init__.py         # 路由聚合
│       │   ├── files.py            # 文件管理 API
│       │   ├── chat.py             # VibeWriting 聊天 API
│       │   ├── knowledge_graph.py  # 知识图谱 API
│       │   ├── simulation.py       # OASIS 模拟 API
│       │   └── style_import.py     # 风格分析导入 API
│       ├── services/               # 业务逻辑层
│       │   ├── file_manager.py     # 文件系统管理
│       │   ├── lightrag_service.py # LightRAG 集成
│       │   ├── oasis_simulation.py # OASIS 模拟引擎
│       │   └── vibewriter.py       # VibeWriting 核心
│       ├── schemas/                # 数据模型层
│       │   ├── __init__.py
│       │   ├── file_models.py      # 文件数据模型
│       │   └── settings.py         # 配置模型
│       └── utils/                  # 工具函数
│           └── __init__.py
│
├── frontend/                       # 前端应用
│   ├── Dockerfile                  # 前端容器
│   ├── package.json                # Node 依赖
│   ├── next.config.ts              # Next.js 配置
│   ├── tsconfig.json               # TypeScript 配置
│   └── src/
│       ├── app/                    # Next.js App Router
│       │   ├── layout.tsx          # 根布局
│       │   ├── page.tsx            # 首页（项目列表）
│       │   ├── globals.css         # 全局样式
│       │   └── projects/[id]/
│       │       ├── page.tsx        # 项目详情页
│       │       └── editor/[chapter]/
│       │           └── page.tsx    # 编辑器页面
│       ├── components/             # React 组件
│       │   ├── index.ts            # 组件导出
│       │   ├── chat/               # 聊天组件
│       │   ├── editor/             # 编辑器组件
│       │   ├── layout/             # 布局组件
│       │   ├── projects/           # 项目相关组件
│       │   ├── simulation/         # 模拟相关组件
│       │   └── ui/                 # 通用 UI 组件
│       ├── lib/                    # 工具库
│       │   ├── api.ts              # API 客户端
│       │   └── store.ts            # Zustand 状态（待添加）
│       ├── types/                  # TypeScript 类型
│       │   └── index.ts
│       └── hooks/                  # 自定义 Hooks
│
├── data/                           # 数据目录（运行时）
│   └── projects/{project-id}/
│       ├── project.md              # 项目元信息
│       ├── novel/                  # 小说正文
│       │   ├── index.html          # Docsify 入口（待移除）
│       │   ├── _sidebar.md         # 章节导航
│       │   └── chapters/
│       │       ├── 001.md
│       │       └── ...
│       ├── characters/             # 角色档案
│       │   ├── 张三.md
│       │   └── ...
│       ├── settings/               # 世界设定
│       │   ├── 世界观.md
│       │   └── 时间线.md
│       ├── state/                  # 运行状态
│       │   ├── current-state.yaml
│       │   ├── emotional-debts.yaml
│       │   └── foreshadowing.yaml
│       └── .lightrag/              # LightRAG 索引
│           ├── graph.json          # 知识图谱
│           └── vectors.npy         # 向量存储
│
├── docs/                           # 项目文档
│   ├── prd.md                      # 产品需求文档
│   ├── ui_design.md                # UI 设计文档
│   ├── workflow.md                 # 工作流程
│   ├── character_logic.md          # 角色推演指南
│   ├── consistency_rules.md        # 一致性规则
│   ├── ai_detection_patterns.md    # AI 检测模式
│   ├── humanization.md             # 人性化处理
│   ├── genre_patterns.md           # 类型写作模式
│   └── style_*.md                  # 风格指南
│
├── prompts/                        # Prompt 模板
│   ├── README.md
│   ├── system/                     # 系统级 Prompt
│   │   ├── novelcraft-system.md
│   │   ├── character-inference.md
│   │   ├── consistency-checker.md
│   │   └── style-continuation.md
│   ├── templates/                  # 模板
│   │   ├── character-templates.md
│   │   ├── chapter-templates.md
│   │   ├── outline-templates.md
│   │   └── longform-templates.md
│   └── patches/                    # 补丁
│       ├── anti-template.md
│       └── liveness-patch.md
│
└── _bmad-output/                   # BMad 输出
    └── planning-artifacts/
        └── architecture.md         # 架构文档（本文档）
```

### Architectural Boundaries

**API 边界：**

```
前端 (Next.js)
    │
    │ HTTP/REST
    ▼
后端 API 层
    │
    │ 函数调用
    ▼
后端服务层
    │
    │ 文件 I/O + LightRAG API
    ▼
存储层 (文件系统 + LightRAG)
```

**组件边界：**

| 层级 | 职责 | 依赖 |
|------|------|------|
| Page | 页面组合、路由 | Components, Lib |
| Components | UI 展示、交互 | Lib, Types |
| Lib | API 调用、状态 | Types |
| Types | 类型定义 | 无 |

**服务边界：**

| 服务 | 职责 | 依赖 |
|------|------|------|
| FileManager | 文件 CRUD | 文件系统 |
| LightRAGService | 图谱构建、查询 | LightRAG, FileManager |
| OasisSimulation | 角色模拟 | LightRAGService, LLM |
| VibeWriter | AI 聊天、续写 | FileManager, LLM |

### Requirements to Structure Mapping

**功能模块映射：**

| 功能模块 | 后端位置 | 前端位置 |
|----------|----------|----------|
| 项目管理 | `api/files.py` | `app/page.tsx`, `components/projects/` |
| 角色档案 | `api/files.py` | `app/projects/[id]/page.tsx` |
| 章节编辑 | `api/files.py` | `app/projects/[id]/editor/[chapter]/page.tsx` |
| AI 聊天 | `api/chat.py`, `services/vibewriter.py` | `components/chat/` |
| 知识图谱 | `api/knowledge_graph.py`, `services/lightrag_service.py` | `components/simulation/` |
| 角色模拟 | `api/simulation.py`, `services/oasis_simulation.py` | `components/simulation/` |
| 风格导入 | `api/style_import.py` | 待实现 |

**跨切面关注点映射：**

| 关注点 | 后端位置 | 前端位置 |
|--------|----------|----------|
| 配置管理 | `config.py` | 环境变量 |
| 类型定义 | `schemas/` | `types/index.ts` |
| API 客户端 | - | `lib/api.ts` |
| 状态管理 | - | `lib/store.ts` (待添加) |

### Integration Points

**内部通信：**

```
Page Component
    │ useState/useEffect
    ▼
Zustand Store (全局状态)
    │ API call
    ▼
API Client (lib/api.ts)
    │ fetch/axios
    ▼
Backend API (FastAPI)
```

**外部集成：**

| 集成点 | 用途 | 配置 |
|--------|------|------|
| OpenAI API | LLM 调用 | `LLM_API_KEY`, `LLM_BASE_URL` |
| LightRAG | 知识图谱 | 内置，无配置 |
| OASIS | 角色模拟 | 内置，依赖 LLM |

**数据流：**

```
用户输入 → 前端组件 → API Client → FastAPI
                                    │
                    ┌───────────────┼───────────────┐
                    ▼               ▼               ▼
              FileManager    LightRAGService   OasisSimulation
                    │               │               │
                    ▼               ▼               ▼
              文件系统        LightRAG          LLM API
```

### Development Workflow Integration

**开发服务器结构：**

```bash
# 后端开发
cd backend && uvicorn app.main:app --reload --port 5001

# 前端开发
cd frontend && npm run dev

# 或使用统一脚本
./dev.sh
```

**部署结构：**

```bash
# Docker 部署
docker-compose up -d

# 或使用启动脚本
./start.sh
```

**环境配置：**

```env
# 根目录 .env
LLM_API_KEY=your-api-key
LLM_BASE_URL=https://api.openai.com/v1
LLM_MODEL_NAME=gpt-4
DATA_DIR=./data
```

---

## Architecture Validation Results

### Coherence Validation ✅

**决策兼容性：** 所有技术选型兼容，无冲突

| 检查项 | 结果 |
|--------|------|
| FastAPI + LightRAG | ✅ Python 生态兼容 |
| Next.js + Ant Design | ✅ 已有实现验证 |
| LightRAG + OASIS | ✅ 通过 LLM API 集成 |
| 文件系统 + 无外部数据库 | ✅ 简化架构一致 |

**模式一致性：** 命名规范、API 格式、错误处理模式全部一致

### Requirements Coverage Validation ✅

**功能需求覆盖：**

| PRD 模块 | 架构支持 | 状态 |
|----------|----------|------|
| 角色档案管理 | FileManager | ✅ 已实现 |
| 行为一致性推演 | OASIS | ✅ 已实现 |
| 一致性检查系统 | VibeWriter | ⚠️ 部分实现 |
| 知识图谱系统 | LightRAG | ✅ 已实现 |
| AI 文本检测 | style_import.py | ⚠️ 部分实现 |
| 风格迁移 | Prompt 模板 | ✅ 已定义 |
| 笔风演化与导入 | style_import.py | ⚠️ 部分实现 |

**非功能需求覆盖：** 全部满足（文件优先、Git 友好、AI 原生、离线可用）

### Implementation Readiness Validation ✅

| 检查项 | 状态 |
|--------|------|
| 决策文档化 | ✅ ADR 已记录 |
| 技术版本明确 | ✅ 已定义 |
| 实现模式完整 | ✅ 5 类模式已定义 |
| 项目结构完整 | ✅ 完整目录树 |
| 组件边界清晰 | ✅ API/服务/组件边界已定义 |

### Gap Analysis Results

| 优先级 | 差距 | 状态 |
|--------|------|------|
| ⚠️ 中 | 编辑器滚动条问题 | 已识别，待修复 |
| ⚠️ 中 | Docsify 待移除 | ADR-002 已决策 |
| ⚠️ 中 | Zustand 未添加 | 已规划 |
| ⚠️ 低 | 一致性检查完善 | Phase 2 |
| ⚠️ 低 | AI 检测完善 | Phase 2 |

**结论：无阻塞性问题，架构就绪。**

### Architecture Completeness Checklist

**✅ 需求分析**
- [x] 项目上下文分析完成
- [x] 规模与复杂度评估
- [x] 技术约束识别
- [x] 跨切面关注点映射

**✅ 架构决策**
- [x] 关键决策文档化 (ADR)
- [x] 技术栈完整定义
- [x] 集成模式定义
- [x] 性能考虑覆盖

**✅ 实现模式**
- [x] 命名规范建立
- [x] 结构模式定义
- [x] 通信模式规范
- [x] 流程模式文档化

**✅ 项目结构**
- [x] 完整目录结构定义
- [x] 组件边界建立
- [x] 集成点映射
- [x] 需求到结构映射完成

### Architecture Readiness Assessment

**整体状态：** ✅ 准备就绪

**信心级别：** 高

**关键优势：**
- 已有 85% 代码实现
- 技术栈成熟稳定
- 架构简洁无冗余
- MVP 范围明确

**未来增强领域：**
- Neo4j 可视化（Phase 2）
- 多人协作（Phase 2）
- EPUB 导出（Phase 2）

### Implementation Handoff

**AI Agent 指南：**

1. 遵循所有 ADR 决策
2. 使用定义的实现模式
3. 尊重项目结构和边界
4. 参考 Prompt 模板进行 AI 功能实现

**优先实现事项：**

1. 移除 Qdrant 依赖（保留 Neo4j）
2. 添加 Zustand 状态管理
3. 实现 NovelPreview 组件
4. 修复编辑器滚动条

---

*Architecture Document Complete - Generated by BMad Method*