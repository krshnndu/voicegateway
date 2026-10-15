# Web app targets. Backend targets arrive with Phase 2.
DASHBOARD := dashboard

.DEFAULT_GOAL := help
.PHONY: help dev test lint typecheck

help: ## List the targets
	@grep -E '^[a-z]+:.*## ' $(MAKEFILE_LIST) | awk -F':.*## ' '{printf "  make %-6s %s\n", $$1, $$2}'

dev: ## Start the dashboard dev server
	npm --prefix $(DASHBOARD) run dev

test: ## Run the dashboard tests (none are defined yet)
	npm --prefix $(DASHBOARD) test --if-present

lint: ## Run oxlint
	npm --prefix $(DASHBOARD) run lint

typecheck: ## Run the TypeScript type check
	cd $(DASHBOARD) && npx tsc -b --noEmit
