IMAGE_NAME := backend_monolith



all: build run

build:
	@echo "🚀 Building Docker image..."
	@docker build -t $(IMAGE_NAME) . > /dev/null

run:
	@echo "▶️ Running Docker container..."
	@docker run -p 3000:3000 --rm --name $(IMAGE_NAME) -it $(IMAGE_NAME)

clean:
	@echo "🧹 Removing Docker container..."
	@docker rm -f $(IMAGE_NAME) 2>/dev/null || true

fclean: clean
	@echo "🧨 Removing Docker image..."
	@docker rmi -f $(IMAGE_NAME) 2>/dev/null || true

full_clean:
	@echo "⚠️ Removing all containers, images, and pruning system..."
	@docker rm -f $$(docker ps -aq) 2>/dev/null || true
	@docker rmi -f $$(docker images -q) 2>/dev/null || true
	@docker system prune -f

re: fclean all
