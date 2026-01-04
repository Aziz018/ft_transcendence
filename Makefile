.PHONY: all build up down clean fclean re logs status help

# Detect docker compose command (new 'docker compose' or legacy 'docker-compose')
DOCKER_COMPOSE := $(shell command -v docker-compose 2>/dev/null || echo "docker compose")

# Enable BuildKit to avoid warnings (required for Docker Compose v2)
export DOCKER_BUILDKIT=1
export COMPOSE_DOCKER_CLI_BUILD=1

# Default target
all: build up

# Build all services
build:
	@echo "🔨 Building all microservices..."
	@$(DOCKER_COMPOSE) build

# Start all services
up:
	@echo "🚀 Starting all microservices..."
	@$(DOCKER_COMPOSE) up -d
	@echo ""
	@echo "✅ All services are running!"
	@echo ""
	@echo "=========================================="
	@echo ""
	@echo "frontend:"
	@echo "  - http://localhost:8080"
	@echo ""
	@echo "backend:"
	@echo "  - http://localhost:3000"
	@echo ""
	@echo "=========================================="
	@echo ""
	@echo "API Documentation: http://localhost:3000/docs"
	@echo ""

# Stop all services
down:
	@echo "🛑 Stopping all services..."
	@$(DOCKER_COMPOSE) down
	@echo "✅ All services stopped!"

# View logs from all services
logs:
	@$(DOCKER_COMPOSE) logs -f

# View logs from specific service
logs-gateway:
	@$(DOCKER_COMPOSE) logs -f api-gateway

logs-auth:
	@$(DOCKER_COMPOSE) logs -f auth-service

logs-user:
	@$(DOCKER_COMPOSE) logs -f user-service

logs-friend:
	@$(DOCKER_COMPOSE) logs -f friend-service

logs-chat:
	@$(DOCKER_COMPOSE) logs -f chat-service

logs-frontend:
	@$(DOCKER_COMPOSE) logs -f frontend

# Clean containers and volumes
clean: down
	@echo "🧹 Cleaning containers and volumes..."
	@$(DOCKER_COMPOSE) down -v
	@echo "✅ Cleanup complete!"

# Full cleanup including images
fclean: clean
	@echo "🗑️  Removing all images..."
	@$(DOCKER_COMPOSE) down -v --rmi all
	@docker volume rm ft_transcendence_shared-data ft_transcendence_avatar-uploads 2>/dev/null || true
	@echo "✅ Full cleanup complete!"

# Rebuild everything from scratch
re: fclean all

# Show service status
status:
	@echo "📊 Service Status:"
	@$(DOCKER_COMPOSE) ps

# Restart all services
restart: down up

# Restart specific service
restart-%:
	@$(DOCKER_COMPOSE) restart $*

# Help
help:
	@echo "Available commands:"
	@echo "  make          - Build and start all services"
	@echo "  make build    - Build all Docker images"
	@echo "  make up       - Start all services"
	@echo "  make down     - Stop all services"
	@echo "  make logs     - View logs from all services"
	@echo "  make logs-X   - View logs from service X (gateway, auth, user, friend, chat, frontend)"
	@echo "  make clean    - Stop services and remove volumes"
	@echo "  make fclean   - Full cleanup (containers, volumes, images)"
	@echo "  make re       - Rebuild everything from scratch"
	@echo "  make status   - Show service status"
	@echo "  make restart  - Restart all services"
	@echo "  make restart-X - Restart service X"
