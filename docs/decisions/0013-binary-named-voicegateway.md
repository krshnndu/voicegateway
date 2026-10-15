# 0013: Name the binary voicegateway

- Status: accepted
- Date: 2026-10-12

## Context

0009 named the Go binary `voicegw`, carried over from the Python CLI. The Docker images are `voicegateway-web` and `voicegateway-worker`, the Go module and the SDK package are `voicegateway`, and the old `voicegw` commands (reconcile, prices, status) do not exist in the Go core. Comparable projects name the binary after the product: `signoz`, `uptrace`, `livekit-server`.

## Options

1. Keep `voicegw`: shorter to type, but a second name for the same product.
2. Rename to `voicegateway`: one name across binary, images, module and SDK, at the cost of a longer command that Docker runs most of the time anyway.

## Decision

Option 2. The binary is `voicegateway`, with the subcommands `web`, `worker`, `migrate` and `preflight`. This supersedes the binary name in 0009 and the `voicegw` command names in 0006 and 0011; nothing else in them changes.

## Consequences

- `cmd/voicegateway/` holds the entry point.
- Docs and compose files use `voicegateway web` and `voicegateway worker`.
- No `voicegw` alias ships. Users who want a short name can add a shell alias.
