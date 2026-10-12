# Progress

<!--
Updated at the end of every phase, by you or by /close-phase.
A fresh session reads this to know where the project stands.
-->

## Current Phase

Phase 1: the console, UI first. Spec: docs/specs/phase01-console.md.

## Done

| Phase | Spec | Result | Date |
| --- | --- | --- | --- |
| Setup | none | PRODUCT.md, ARCHITECTURE.md, DESIGN.md (The Clean Room seed), CLAUDE.md and decisions 0005 to 0013 written for the Go platform | 2026-10-12 |
| Go spike | none | Four gates passed: ingest (0 lost in 12 runs), LiveKit webhooks in Go, Agents spans joined to calls, ocb collector build. Results in decision 0009 | 2026-10-11 |

## Next

1. Phase 0, clean slate: remove the old Python core, the old dashboard and their CI, in their own PR, so agents stop reading them as current.
2. Phase 1, console: the whole console shell with every page, the calls list and call detail built fully. Pre-built components only (DESIGN.md). Data comes from a mock API that serves real captured fixtures through the dashboard API contract.
3. Phase 2 onward: the backend that fulfils the contract (ingest, worker, webhooks, spans), then SFU, SIP and the live view.

## Open Questions

- The Phase 1 API contract format (OpenAPI is the working assumption).
- How long an unmatched event waits for its call before it is stored as unmatched (decision 0012 says "briefly").
- Launch and non-functional targets in PRODUCT.md and ARCHITECTURE.md are proposals and need confirming.
- Phase 2 candidate: inferred call labels (triage, disposition) from a self-hosted decision model such as Jev or Kev, opt-in and marked as inferred. Evaluate once V1 traces exist.
- "Gauge UI": the library the user saw is not identified yet. Use it only if it is Tailwind or shadcn based.
- The docs and landing site in site/ still use the old purple theme; when do they move to The Clean Room?

## Known Issues

- The old Python code in src/ no longer matches the docs. It stays until Phase 0.
- Docker Desktop on the dev Mac stopped starting new containers during the spike; it needs a restart.
- Project MCP servers (gopls, shadcn, magicui) need a one-time approval in Claude Code.
