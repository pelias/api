.EXPORT_ALL_VARIABLES:
.DEFAULT_GOAL := help
.PHONY: $(filter-out vendor,$(MAKECMDGOALS))

PROJECT ?= "pelias-api"
COLOR_RESET = \033[0m
COLOR_ERROR = \033[31m
COLOR_INFO = \033[32m
COLOR_COMMENT = \033[33m
COLOR_TITLE_BLOCK = \033[0;44m\033[37m
UID = $(shell id -u)
GID = $(shell id -g)
DOCKER_COMPOSE ?= docker compose
DOCKER_COMPOSE_WORKSPACE ?= .

## Initialize the project
init: set-env npm-install docker-network docker-pull docker-up

npm-install:
	@${DOCKER_COMPOSE} run --rm --entrypoint '' app npm i

## Copy pelias.json.dist to pelias.json
set-env:
	@test -f pelias.json || cp pelias.json.dist pelias.json

## Copy pelias.json.dist to pelias.json (force)
reset-env:
	@cp -f pelias.json.dist pelias.json

## Pull the containers
docker-pull:
	@${DOCKER_COMPOSE} pull

## Start docker environment
docker-up:
	@${DOCKER_COMPOSE} up -d

## Stop docker environment
docker-stop:
	@${DOCKER_COMPOSE} stop

## Restart docker environment
docker-restart:
	@${DOCKER_COMPOSE} restart

## Down docker containers
docker-down:
	@${DOCKER_COMPOSE} down -v

## Logs docker containers
docker-logs:
	@${DOCKER_COMPOSE} logs -f

## List all available commands
help:
	@printf "${COLOR_TITLE_BLOCK}${PROJECT} Makefile${COLOR_RESET}\n"
	@printf "\n"
	@printf "${COLOR_COMMENT}Usage:${COLOR_RESET}\n"
	@printf " make [target]\n\n"
	@printf "${COLOR_COMMENT}Available targets:${COLOR_RESET}\n"
	@awk '/^[a-zA-Z\-\_0-9\@]+:/ { \
		helpLine = match(lastLine, /^## (.*)/); \
		helpCommand = substr($$1, 0, index($$1, ":")); \
		helpMessage = substr(lastLine, RSTART + 3, RLENGTH); \
		printf " ${COLOR_INFO}%-20s${COLOR_RESET} %s\n", helpCommand, helpMessage; \
	} \
	{ lastLine = $$0 }' $(MAKEFILE_LIST)
