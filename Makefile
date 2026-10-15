.PHONY: landing-dev landing-check landing-deploy

landing-dev:
	pnpm --dir site/landing dev

landing-check:
	pnpm --dir site/landing test
	pnpm --dir site/landing build
	pnpm --dir site/landing typecheck

landing-deploy: landing-check
	pnpm --dir site/landing exec wrangler pages deploy out
