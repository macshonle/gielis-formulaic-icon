# Makefile for Gielis Formulaic Icon
# Compatible with macOS GNU bash 3.2.57

# Default target
.DEFAULT_GOAL := help

# Phony targets (not actual files)
.PHONY: help install build clean dev preview all

# Colors for output (compatible with older bash)
BLUE := \033[0;34m
GREEN := \033[0;32m
YELLOW := \033[0;33m
NC := \033[0m # No Color

## help: Display this help message
help:
	@echo "$(BLUE)Gielis Formulaic Icon - Available Make Targets$(NC)"
	@echo ""
	@echo "$(GREEN)make install$(NC)  - Install dependencies with pnpm"
	@echo "$(GREEN)make build$(NC)    - Build single-file HTML bundle"
	@echo "$(GREEN)make dev$(NC)      - Start Vite development server"
	@echo "$(GREEN)make preview$(NC)  - Preview production build"
	@echo "$(GREEN)make clean$(NC)    - Remove build artifacts"
	@echo "$(GREEN)make all$(NC)      - Install dependencies and build"
	@echo ""

## install: Install project dependencies
install:
	@echo "$(YELLOW)Installing dependencies...$(NC)"
	pnpm install
	@echo "$(GREEN)Dependencies installed!$(NC)"

## build: Build the single-file HTML bundle
build:
	@echo "$(YELLOW)Building single-file HTML bundle...$(NC)"
	pnpm run build
	@echo "$(GREEN)Build complete! Output is in dist/gielis-icon-maker.html$(NC)"

## dev: Start Vite development server
dev:
	@echo "$(YELLOW)Starting development server...$(NC)"
	pnpm run dev

## preview: Preview production build
preview:
	@echo "$(YELLOW)Starting preview server...$(NC)"
	pnpm run preview

## clean: Remove build artifacts and dependencies
clean:
	@echo "$(YELLOW)Cleaning build artifacts...$(NC)"
	rm -rf dist
	rm -rf node_modules
	rm -f pnpm-lock.yaml
	@echo "$(GREEN)Clean complete!$(NC)"

## all: Install and build
all: install build
	@echo "$(GREEN)All done!$(NC)"
