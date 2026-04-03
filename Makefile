# NovelCraft Makefile

.PHONY: help dev install check stop clean docker status

# 默认目标
help:
	@echo "NovelCraft 命令帮助"
	@echo ""
	@echo "使用方式: make [命令]"
	@echo ""
	@echo "命令列表:"
	@echo "  dev      - 启动开发环境 (前台运行)"
	@echo "  install  - 安装所有依赖"
	@echo "  check    - 检查环境和依赖"
	@echo "  stop     - 停止所有服务"
	@echo "  clean    - 清理临时文件和日志"
	@echo "  docker   - 启动 Docker 服务"
	@echo "  status   - 显示服务状态"
	@echo ""
	@echo "示例:"
	@echo "  make dev      # 启动开发环境"
	@echo "  make install  # 安装依赖"
	@echo ""

# 开发模式 (前台)
dev:
	@./dev.sh

# 安装依赖
install:
	@./start.sh --install

# 检查环境
check:
	@./start.sh --check

# 停止服务
stop:
	@./start.sh --stop

# 清理
clean:
	@rm -rf .backend.pid .frontend.pid logs/*.log
	@echo "已清理临时文件"

# Docker 服务
docker:
	@./start.sh --docker

# 服务状态
status:
	@./start.sh --status

# 后端开发
backend:
	cd backend && source venv/bin/activate && uvicorn app.main:app --reload

# 前端开发
frontend:
	cd frontend && npm run dev

# 测试后端
test-backend:
	cd backend && source venv/bin/activate && pytest

# 构建
build:
	cd frontend && npm run build