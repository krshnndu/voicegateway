# VoiceGateway landing page

Next.js static export in `mahimailabs/voicegateway/site/landing`, hosted on Cloudflare Pages. Run with Node 24 and pnpm 9.

```sh
pnpm install --frozen-lockfile
pnpm dev
pnpm test
pnpm typecheck
pnpm build
pnpm preview
```

`pnpm dev` serves the frontend. API integration requires the Pages runtime and a connected `VOICEGATEWAY_API` service; local development does not provision or copy production data. The exported console demo supports deep links through a Pages Function.

## Deployment

The Cloudflare Pages project `voicegateway-landing` is connected to `mahimailabs/voicegateway`. Main deploys to production; other branches receive previews. Build root: `site/landing`; build command: `pnpm run build`; output: `out`; Node: 24. For an explicit deployment:

```sh
CLOUDFLARE_ACCOUNT_ID=c64bf5531f1988a38ec04598b5d7c57d pnpm exec wrangler pages deploy out --project-name voicegateway-landing --branch main
```

The separate `voicegateway-web` repository is superseded by this directory. Historical Vercel and Neon resources are not used by this deployment.

## Waitlist and admin

The existing Cloudflare Worker `voicegateway-web` remains the API owner. Its D1 database `voicegateway-waitlist` (ID `087d0e19-3e37-49a2-8750-ce52072a4f3c`) stores `signups`. Pages forwards only POST `/api/waitlist` and GET `/api/stats` through the private `VOICEGATEWAY_API` service binding. The Worker retains its stats secret and notification configuration. No database migration or secret duplication is required.

The API source lives beside this app under `site/web`. Keep this Worker deployed even though its previous landing page is superseded. `mahimai-admin` already holds `STATS_KEY_VOICEGATEWAY` and reads the same authenticated stats endpoint. Never put that secret into public environment variables.

## Analytics

Production hosts use the shared mahimai.ca PostHog project through `https://m.mahimai.ca`, tagged `site=voicegateway`. Localhost and Pages previews do not send analytics. Tracking uses memory persistence, explicit page/link events and successful waitlist confirmations; no emails, replay or automatic form capture. Confirmation events include existing subscribers; D1 remains the source of truth for stored signups.

The admin VoiceGateway page reports this site's traffic, referral sources, documentation/GitHub/console clicks and waitlist confirmations alongside the D1 totals. Personal PostHog credentials stay in the admin Worker.

## Rollback

Redeploy an earlier Pages deployment to roll back the frontend. The underlying API and D1 database remain unchanged. Before the Pages cutover, `voicegateway.dev` was a custom domain on Worker `voicegateway-web`; its Cloudflare zone is `c41ebebe654e4ed1ca08615acca22972`. A hosting rollback can restore that Worker custom-domain mapping after removing the Pages domain. Do not delete the Worker or D1 database.

Installer scripts come from the repository root, and the existing captured demo is copied from `site/web/public/demo` before build/dev. The original landing source was imported from `voicegateway-web` commit `2d6fd9e`; its bundled component and asset licenses remain in this directory.
