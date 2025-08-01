all: up

up:
	docker-compose -f ./src/docker-compose.yml up --build -d

down:
	docker-compose -f ./src/docker-compose.yml down -v

clean: down

re: clean up