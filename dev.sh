#!/bin/bash

# NovelCraft 开发模式脚本 (前台运行)
# 同时启动前端和后端，日志直接输出到终端

set -e

# 颜色定义
GREEN='\033[0;32m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
NC='\033[0m'

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$PROJECT_ROOT/backend"
FRONTEND_DIR="$PROJECT_ROOT/frontend"
DATA_DIR="$PROJECT_ROOT/data"

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }

# 创建必要的目录
mkdir -p "$DATA_DIR/projects"
mkdir -p "$DATA_DIR/lightrag"
mkdir -p "$DATA_DIR/simulations"

# 创建 .env 文件
if [ ! -f "$PROJECT_ROOT/.env" ] && [ -f "$PROJECT_ROOT/.env.example" ]; then
    cp "$PROJECT_ROOT/.env.example" "$PROJECT_ROOT/.env"
    log_info "已创建 .env 文件"
fi

# 检查虚拟环境
if [ ! -d "$BACKEND_DIR/venv" ]; then
    log_info "创建 Python 虚拟环境..."
    python3 -m venv "$BACKEND_DIR/venv"
    source "$BACKEND_DIR/venv/bin/activate"
    pip install --upgrade pip
    pip install -r "$BACKEND_DIR/requirements.txt"
else
    source "$BACKEND_DIR/venv/bin/activate"
fi

# 检查前端依赖
if [ ! -d "$FRONTEND_DIR/node_modules" ]; then
    log_info "安装前端依赖..."
    cd "$FRONTEND_DIR"
    npm install
    cd "$PROJECT_ROOT"
fi

echo ""
log_success "==========================================="
log_success "  NovelCraft 开发环境启动"
log_success "==========================================="
echo ""
echo -e "${CYAN}前端: http://localhost:3000${NC}"
echo -e "${CYAN}后端: http://localhost:8000${NC}"
echo -e "${CYAN}API:  http://localhost:8000/docs${NC}"
echo ""
echo -e "${YELLOW}按 Ctrl+C 停止所有服务${NC}"
echo ""

# 清理函数
cleanup() {
    echo ""
    log_info "停止服务..."
    kill $(jobs -p) 2>/dev/null || true
    log_info "服务已停止"
    exit 0
}

trap cleanup SIGINT SIGTERM

# 启动后端
cd "$BACKEND_DIR"
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload &
BACKEND_JOB=$!

# 启动前端
cd "$FRONTEND_DIR"
npm run dev &
FRONTEND_JOB=$!

# 等待所有后台任务
wait