.PHONY: dev build deploy lint format help

help:
	@echo "Available commands:"
	@echo "  make dev     - Start development server"
	@echo "  make build   - Build the project"
	@echo "  make deploy  - Deploy the project using deploy.sh"
	@echo "  make lint    - Run linter and fix issues"
	@echo "  make format  - Format source code with Prettier"

dev:
	pnpm dev

build:
	pnpm build

deploy:
	./deploy.sh

lint:
	pnpm lint

format:
	pnpm format
