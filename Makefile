# 🎨 Colors
GREEN  := \033[0;32m
CYAN   := \033[0;36m
YELLOW := \033[0;33m
RED    := \033[0;31m
RESET  := \033[0m

# 🔧 Variables
NAME   := ft_transcendence
COMPOSE := docker-compose

.PHONY: all up down stop start build logs clean fclean re prune backend-shell frontend-shell db-migrate db-reset status

# 🚀 Main Commands
all: up

up: ## Start the application in detached mode
	@printf "$(GREEN)🚀 Starting $(NAME)...$(RESET)\n"
	@$(COMPOSE) up -d --build
	@printf "$(CYAN)✅ Application is up! Access it at: https://pongrush.game:3000$(RESET)\n"

down: ## Stop and remove containers
	@printf "$(YELLOW)🛑 Stopping $(NAME)...$(RESET)\n"
	@$(COMPOSE) down

stop: ## Stop containers without removing them
	@printf "$(YELLOW)⏸️  Stopping containers...$(RESET)\n"
	@$(COMPOSE) stop

start: ## Start existing containers
	@printf "$(GREEN)▶️  Starting containers...$(RESET)\n"
	@$(COMPOSE) start

build: ## Rebuild services
	@printf "$(CYAN)🔨 Building services...$(RESET)\n"
	@$(COMPOSE) build

logs: ## View logs of all services
	@$(COMPOSE) logs -f

# 🛠️ Maintenance & Utils
clean: down ## Stop containers and remove volumes
	@printf "$(RED)🧹 Cleaning up volumes...$(RESET)\n"
	@$(COMPOSE) down -v

fclean: clean ## Remove all used images, networks, and volumes
	@printf "$(RED)🔥 Removing images and system pruning...$(RESET)\n"
	@docker system prune -af
	@printf "$(GREEN)✨ Deep clean complete!$(RESET)\n"

re: fclean up ## Deep clean and restart

prune: ## Remove unused Docker objects
	@docker system prune -f

status: ## Show status of containers
	@$(COMPOSE) ps

# 🐚 Shell Access
backend-shell: ## Access the backend container shell
	@printf "$(CYAN)🐚 Entering backend shell...$(RESET)\n"
	@$(COMPOSE) exec backend sh

frontend-shell: ## Access the frontend container shell
	@printf "$(CYAN)🐚 Entering frontend shell...$(RESET)\n"
	@$(COMPOSE) exec frontend sh

# 💾 Database Operations
db-migrate: ## Run database migrations manually
	@printf "$(CYAN)📦 Running migrations...$(RESET)\n"
	@$(COMPOSE) exec backend npm run db:migrate

db-reset: ## Reset the database (DATA LOSS WARNING)
	@printf "$(RED)⚠️  Resetting database... All data will be lost!$(RESET)\n"
	@$(COMPOSE) exec backend npm run db:reset

# ℹ️ Help
help: ## Show this help message
	@printf "$(CYAN)Usage: make [target]$(RESET)\n"
	@echo
	@printf "$(YELLOW)Targets:$(RESET)\n"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(GREEN)%-15s$(RESET) %s\n", $$1, $$2}'
