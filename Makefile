.PHONY: dev build test verify infra:up infra:down infra:smoke seed access:sync

dev:
	pnpm dev

build:
	pnpm build

test:
	pnpm test

verify:
	node scripts/verify/index.js

infra:up:
	docker compose -f infra/docker-compose.yml up -d

infra:down:
	docker compose -f infra/docker-compose.yml down

infra:smoke:
	node infra/smoke-test.mjs

access:sync:
	pnpm --filter campus-fomo-backend access:sync

seed:
	pnpm --filter campus-fomo-backend seed

seed:reset:
	pnpm --filter campus-fomo-backend seed:reset
