# NovelCraft

AI 驱动的中文小说创作助手，践行 "Vibe Writing" 理念。

## 特性

- **Vibe Writing**: 以氛围和感觉为核心的创作方式
- **文件存储**: 使用 Markdown/YAML 存储项目数据，便于版本控制
- **知识图谱**: 基于 LightRAG 构建故事知识网络
- **角色模拟**: Oasis 社交模拟，预测角色互动和故事发展
- **AI 助手**: 智能续写、一致性检查、角色推演

## 快速开始

### 1. 环境检查

```bash
make check
# 或
./start.sh --check
```

### 2. 安装依赖

```bash
make install
# 或
./start.sh --install
```

### 3. 配置 API Key

编辑 `.env` 文件，设置你的 LLM API Key：

```env
LLM_API_KEY=your-api-key-here
LLM_BASE_URL=https://api.openai.com/v1
```

### 4. 启动开发环境

```bash
make dev
# 或
./dev.sh
```

访问 http://localhost:3000 开始使用。

## 项目结构

```
novelcraft/
├── frontend/          # Next.js 前端
│   ├── src/app/       # 页面路由
│   ├── src/lib/       # API 客户端
│   └── src/types/     # TypeScript 类型
├── backend/           # FastAPI 后端
│   ├── app/api/       # API 端点
│   ├── app/services/  # 业务逻辑
│   └── app/schemas/   # 数据模型
├── data/              # 数据存储
│   ├── projects/      # 项目文件
│   └── simulations/   # 模拟结果
├── start.sh           # 启动脚本
├── dev.sh             # 开发脚本
└── Makefile           # 便捷命令
```

## API 端点

### 项目管理
- `GET /projects` - 获取项目列表
- `POST /projects` - 创建项目
- `GET /projects/{id}` - 获取项目详情
- `PUT /projects/{id}` - 更新项目
- `DELETE /projects/{id}` - 删除项目

### 章节管理
- `GET /projects/{id}/chapters` - 获取章节列表
- `POST /projects/{id}/chapters` - 创建章节
- `GET /projects/{id}/chapters/{n}` - 获取章节内容
- `PUT /projects/{id}/chapters/{n}` - 更新章节

### 角色管理
- `GET /projects/{id}/characters` - 获取角色列表
- `POST /projects/{id}/characters` - 创建角色
- `GET /projects/{id}/characters/{name}` - 获取角色详情

### AI 功能
- `POST /projects/{id}/chat` - AI 对话
- `POST /projects/{id}/style/continue` - AI 续写
- `POST /projects/{id}/consistency/check` - 一致性检查
- `POST /projects/{id}/inference/character` - 角色推演

### 社交模拟 (Oasis)
- `POST /projects/{id}/simulation` - 运行模拟
- `POST /projects/{id}/predict` - 故事预测

## 常用命令

```bash
# 开发
make dev          # 启动开发环境

# 服务管理
make stop         # 停止服务
make status       # 查看状态

# Docker 服务 (可选)
make docker       # 启动 Neo4j 和 Qdrant

# 其他
make check        # 检查环境
make clean        # 清理临时文件
```

## 技术栈

- **前端**: Next.js 16, TypeScript, Tailwind CSS
- **后端**: FastAPI, Pydantic
- **存储**: 文件系统 (Markdown/YAML)
- **知识图谱**: LightRAG, Neo4j (可选)
- **向量存储**: Qdrant (可选)
- **AI**: OpenAI API 兼容接口
- **社交模拟**: CAMEL-AI Oasis (可选)

## License

MIT