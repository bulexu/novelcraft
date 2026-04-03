#!/bin/bash

# NovelCraft 一键启动脚本
# 用于启动前端、后端和可选的 Docker 服务

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# 项目根目录
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$PROJECT_ROOT/backend"
FRONTEND_DIR="$PROJECT_ROOT/frontend"
DATA_DIR="$PROJECT_ROOT/data"

# 日志函数
log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }
log_step() { echo -e "${CYAN}[STEP]${NC} $1"; }

# 显示帮助
show_help() {
    echo "NovelCraft 启动脚本"
    echo ""
    echo "用法: ./start.sh [选项]"
    echo ""
    echo "选项:"
    echo "  --dev        启动开发模式 (前端+后端，无 Docker)"
    echo "  --docker     启动 Docker 服务 (Neo4j, Qdrant)"
    echo "  --full       启动完整服务 (Docker + 前端 + 后端)"
    echo "  --install    安装依赖"
    echo "  --check      检查环境和依赖"
    echo "  --stop       停止所有服务"
    echo "  --help       显示帮助信息"
    echo ""
    echo "示例:"
    echo "  ./start.sh --dev       # 快速开发模式"
    echo "  ./start.sh --full      # 完整服务模式"
    echo "  ./start.sh --install   # 安装所有依赖"
    echo ""
}

# 检查命令是否存在
check_command() {
    if ! command -v "$1" &> /dev/null; then
        log_error "$1 未安装"
        return 1
    fi
    log_success "$1 已安装: $(command -v "$1")"
    return 0
}

# 检查环境
check_environment() {
    log_step "检查环境..."

    echo ""
    local has_error=0

    # 检查 Python
    if check_command python3; then
        log_info "Python 版本: $(python3 --version)"
    else
        has_error=1
    fi

    # 检查 Node.js
    if check_command node; then
        log_info "Node.js 版本: $(node --version)"
    else
        has_error=1
    fi

    # 检查 npm
    if check_command npm; then
        log_info "npm 版本: $(npm --version)"
    else
        has_error=1
    fi

    # 检查 Docker (可选)
    if check_command docker; then
        log_info "Docker 版本: $(docker --version)"
        if docker info &> /dev/null; then
            log_success "Docker 正在运行"
        else
            log_warning "Docker 未运行"
        fi
    else
        log_warning "Docker 未安装 (可选)"
    fi

    echo ""

    if [ $has_error -eq 1 ]; then
        log_error "环境检查失败，请安装缺失的依赖"
        return 1
    fi

    log_success "环境检查完成"
    return 0
}

# 创建 .env 文件
create_env_file() {
    log_step "检查配置文件..."

    if [ ! -f "$PROJECT_ROOT/.env" ]; then
        if [ -f "$PROJECT_ROOT/.env.example" ]; then
            log_info "创建 .env 文件..."
            cp "$PROJECT_ROOT/.env.example" "$PROJECT_ROOT/.env"
            log_success ".env 文件已创建"
            log_warning "请编辑 .env 文件配置 LLM_API_KEY"
        else
            log_warning ".env.example 不存在，跳过"
        fi
    else
        log_success ".env 文件已存在"
    fi
}

# 创建数据目录
create_data_dirs() {
    log_step "创建数据目录..."

    mkdir -p "$DATA_DIR/projects"
    mkdir -p "$DATA_DIR/lightrag"
    mkdir -p "$DATA_DIR/simulations"

    log_success "数据目录已创建"
}

# 安装后端依赖
install_backend() {
    log_step "安装后端依赖..."

    cd "$BACKEND_DIR"

    # 检查是否有虚拟环境
    if [ ! -d "venv" ]; then
        log_info "创建 Python 虚拟环境..."
        python3 -m venv venv
        log_success "虚拟环境已创建"
    fi

    # 激活虚拟环境
    source venv/bin/activate

    # 安装依赖
    log_info "安装 Python 依赖..."
    pip install --upgrade pip
    pip install -r requirements.txt

    log_success "后端依赖安装完成"

    cd "$PROJECT_ROOT"
}

# 安装前端依赖
install_frontend() {
    log_step "安装前端依赖..."

    cd "$FRONTEND_DIR"

    log_info "安装 Node.js 依赖..."
    npm install

    log_success "前端依赖安装完成"

    cd "$PROJECT_ROOT"
}

# 安装所有依赖
install_all() {
    log_step "安装所有依赖..."

    create_env_file
    create_data_dirs
    install_backend
    install_frontend

    log_success "所有依赖安装完成"
}

# 启动 Docker 服务
start_docker() {
    log_step "启动 Docker 服务..."

    if ! command -v docker &> /dev/null; then
        log_error "Docker 未安装"
        return 1
    fi

    if ! docker info &> /dev/null; then
        log_error "Docker 未运行，请先启动 Docker"
        return 1
    fi

    cd "$PROJECT_ROOT"

    log_info "启动 Neo4j 和 Qdrant..."
    docker-compose up -d neo4j qdrant

    log_info "等待服务启动..."
    sleep 10

    log_success "Docker 服务已启动"
    log_info "Neo4j: http://localhost:7474"
    log_info "Qdrant: http://localhost:6333"
}

# 启动后端服务
start_backend() {
    log_step "启动后端服务..."

    cd "$BACKEND_DIR"

    # 激活虚拟环境
    if [ -d "venv" ]; then
        source venv/bin/activate
    fi

    # 创建日志目录
    mkdir -p "$PROJECT_ROOT/logs"

    # 启动 FastAPI
    log_info "启动 FastAPI 服务 (端口 8000)..."
    nohup uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload \
        > "$PROJECT_ROOT/logs/backend.log" 2>&1 &

    BACKEND_PID=$!
    echo $BACKEND_PID > "$PROJECT_ROOT/.backend.pid"

    sleep 3

    if kill -0 $BACKEND_PID 2>/dev/null; then
        log_success "后端服务已启动 (PID: $BACKEND_PID)"
        log_info "API: http://localhost:8000"
        log_info "Docs: http://localhost:8000/docs"
    else
        log_error "后端服务启动失败"
        return 1
    fi

    cd "$PROJECT_ROOT"
}

# 启动前端服务
start_frontend() {
    log_step "启动前端服务..."

    cd "$FRONTEND_DIR"

    # 启动 Next.js
    log_info "启动 Next.js 服务 (端口 3000)..."
    nohup npm run dev > "$PROJECT_ROOT/logs/frontend.log" 2>&1 &

    FRONTEND_PID=$!
    echo $FRONTEND_PID > "$PROJECT_ROOT/.frontend.pid"

    sleep 5

    if kill -0 $FRONTEND_PID 2>/dev/null; then
        log_success "前端服务已启动 (PID: $FRONTEND_PID)"
        log_info "Web: http://localhost:3000"
    else
        log_error "前端服务启动失败"
        return 1
    fi

    cd "$PROJECT_ROOT"
}

# 启动开发模式
start_dev() {
    log_step "启动开发模式..."

    create_env_file
    create_data_dirs

    start_backend
    start_frontend

    echo ""
    log_success "==========================================="
    log_success "  NovelCraft 开发环境已启动"
    log_success "==========================================="
    echo ""
    log_info "前端: http://localhost:3000"
    log_info "后端: http://localhost:8000"
    log_info "API文档: http://localhost:8000/docs"
    echo ""
    log_warning "按 Ctrl+C 停止服务，或运行 ./start.sh --stop"
    echo ""

    # 保持脚本运行
    trap "echo ''; log_info '收到退出信号...'; stop_services; exit 0" SIGINT SIGTERM
    while true; do sleep 1; done
}

# 启动完整服务
start_full() {
    log_step "启动完整服务..."

    create_env_file
    create_data_dirs
    start_docker
    start_backend
    start_frontend

    echo ""
    log_success "==========================================="
    log_success "  NovelCraft 完整服务已启动"
    log_success "==========================================="
    echo ""
    log_info "前端:    http://localhost:3000"
    log_info "后端:    http://localhost:8000"
    log_info "API文档: http://localhost:8000/docs"
    log_info "Neo4j:   http://localhost:7474"
    log_info "Qdrant:  http://localhost:6333"
    echo ""
    log_warning "按 Ctrl+C 停止服务，或运行 ./start.sh --stop"
    echo ""

    # 保持脚本运行
    trap "echo ''; log_info '收到退出信号...'; stop_services; exit 0" SIGINT SIGTERM
    while true; do sleep 1; done
}

# 停止所有服务
stop_services() {
    log_step "停止所有服务..."

    # 停止前端
    if [ -f "$PROJECT_ROOT/.frontend.pid" ]; then
        FRONTEND_PID=$(cat "$PROJECT_ROOT/.frontend.pid")
        if kill -0 $FRONTEND_PID 2>/dev/null; then
            log_info "停止前端服务 (PID: $FRONTEND_PID)..."
            kill $FRONTEND_PID
            rm "$PROJECT_ROOT/.frontend.pid"
            log_success "前端服务已停止"
        else
            log_warning "前端服务未运行"
            rm -f "$PROJECT_ROOT/.frontend.pid"
        fi
    fi

    # 停止后端
    if [ -f "$PROJECT_ROOT/.backend.pid" ]; then
        BACKEND_PID=$(cat "$PROJECT_ROOT/.backend.pid")
        if kill -0 $BACKEND_PID 2>/dev/null; then
            log_info "停止后端服务 (PID: $BACKEND_PID)..."
            kill $BACKEND_PID
            rm "$PROJECT_ROOT/.backend.pid"
            log_success "后端服务已停止"
        else
            log_warning "后端服务未运行"
            rm -f "$PROJECT_ROOT/.backend.pid"
        fi
    fi

    # 停止 Docker
    if command -v docker &> /dev/null && docker info &> /dev/null; then
        if docker ps --format '{{.Names}}' | grep -q "novelcraft"; then
            log_info "停止 Docker 服务..."
            cd "$PROJECT_ROOT"
            docker-compose down
            log_success "Docker 服务已停止"
        fi
    fi

    log_success "所有服务已停止"
}

# 显示状态
show_status() {
    log_step "服务状态..."

    echo ""

    # 前端状态
    if [ -f "$PROJECT_ROOT/.frontend.pid" ]; then
        FRONTEND_PID=$(cat "$PROJECT_ROOT/.frontend.pid")
        if kill -0 $FRONTEND_PID 2>/dev/null; then
            log_success "前端: 运行中 (PID: $FRONTEND_PID)"
        else
            log_warning "前端: 未运行 (PID 文件存在但进程不存在)"
        fi
    else
        log_info "前端: 未运行"
    fi

    # 后端状态
    if [ -f "$PROJECT_ROOT/.backend.pid" ]; then
        BACKEND_PID=$(cat "$PROJECT_ROOT/.backend.pid")
        if kill -0 $BACKEND_PID 2>/dev/null; then
            log_success "后端: 运行中 (PID: $BACKEND_PID)"
        else
            log_warning "后端: 未运行 (PID 文件存在但进程不存在)"
        fi
    else
        log_info "后端: 未运行"
    fi

    # Docker 状态
    if command -v docker &> /dev/null && docker info &> /dev/null; then
        if docker ps --format '{{.Names}}' | grep -q "novelcraft"; then
            log_success "Docker: 运行中"
            docker ps --format 'table {{.Names}}\t{{.Status}}' | grep "novelcraft"
        else
            log_info "Docker: 未运行 NovelCraft 容器"
        fi
    else
        log_info "Docker: 未运行"
    fi

    echo ""
}

# 主函数
main() {
    case "${1:-}" in
        --dev)
            start_dev
            ;;
        --docker)
            start_docker
            ;;
        --full)
            start_full
            ;;
        --install)
            install_all
            ;;
        --check)
            check_environment
            ;;
        --stop)
            stop_services
            ;;
        --status)
            show_status
            ;;
        --help|-h)
            show_help
            ;;
        *)
            show_help
            echo ""
            log_warning "请指定启动模式，例如: ./start.sh --dev"
            exit 1
            ;;
    esac
}

main "$@"