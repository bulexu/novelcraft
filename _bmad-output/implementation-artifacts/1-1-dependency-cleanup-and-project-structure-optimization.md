# Story 1.1: 依赖清理与项目结构优化

Status: done

## Story

As a **开发者**,
I want 清理不需要的依赖（Qdrant）并验证 Neo4j + LightRAG 集成,
So that 项目可以独立运行，使用 LightRAG 内置向量存储，Neo4j 用于图谱可视化。

## Acceptance Criteria

1. **AC1: 后端依赖清理**
   - Given 项目当前依赖包含 qdrant-client
   - When 执行依赖清理
   - Then requirements.txt 中移除 qdrant-client 依赖
   - And 保留 neo4j 依赖用于图谱可视化
   - And 后端代码中移除 Qdrant 相关 import 语句

2. **AC2: 项目正常启动**
   - Given 依赖清理完成
   - When 启动后端服务
   - Then 后端可以正常启动
   - And 无 Qdrant 连接错误
   - And Neo4j 可选连接（用于可视化）

3. **AC3: 前端依赖验证**
   - Given 前端 package.json
   - When 检查依赖
   - Then react-markdown 和 remark-gfm 已安装
   - And 无 Docsify 依赖

## Tasks / Subtasks

- [ ] Task 1: 后端依赖清理 (AC: 1, 2)
  - [ ] 1.1 检查 requirements.txt 中的 Qdrant 依赖
  - [ ] 1.2 移除 qdrant-client 依赖（保留 neo4j）
  - [ ] 1.3 检查后端代码中的 Qdrant 相关 import 语句
  - [ ] 1.4 移除或注释掉 Qdrant 相关代码（如已集成）

- [ ] Task 2: 前端依赖验证 (AC: 3)
  - [ ] 2.1 验证 react-markdown 已安装
  - [ ] 2.2 验证 remark-gfm 已安装
  - [ ] 2.3 确认无 Docsify 依赖

- [ ] Task 3: 验证项目启动 (AC: 2)
  - [ ] 3.1 验证前端可以正常启动
  - [ ] 3.2 验证前端构建成功

## Dev Notes

### ADR-001: MVP 技术栈简化 (2026-04-03 更新)

**来源**: `_bmad-output/planning-artifacts/architecture.md`

**背景**: 原计划采用 Neo4j + Qdrant + Zep Cloud 三存储架构。

**决策**: 采用极简 MVP 架构，使用 LightRAG 替代 Zep Cloud，保留 Neo4j 用于图谱可视化，移除 Qdrant。

**理由**:
- LightRAG 本地部署，数据隐私有保障
- 开源免费，无云服务成本
- 图谱结果可序列化为 JSON，支持 Git 追踪
- 与 OASIS 引擎原生兼容
- Neo4j 提供强大的图谱可视化和复杂查询能力

### 后端依赖变更

**来源**: `backend/requirements.txt`

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

### 前端依赖验证

**来源**: `frontend/package.json`

```json
{
  "dependencies": {
    "react-markdown": "^9.x",
    "remark-gfm": "^4.x"
  }
}
```

**ADR-002**: 已移除 Docsify，采用 react-markdown 预览组件

### 测试要点

1. 后端启动验证（无 Qdrant 错误）
2. 前端构建验证
3. 确认 Neo4j 配置可选（可视化功能）

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List

## Change Log

| Date | Change |
|------|--------|
| 2026-04-03 | Story file created from epics.md |
| 2026-04-03 | Updated scope: keep Neo4j, remove Qdrant only |