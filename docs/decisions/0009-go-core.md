# 0009: Write the core in Go

- Status: accepted
- Date: 2026-10-11

## Context

The core is the web and worker roles from 0006. The platform pivot (0005) means a rewrite either way, with today's Python code kept as a reference. The SDK (`attach()`) runs inside the agent, so it follows the agent's language and is not part of this choice. A two-day spike built the same ingest pipeline (POST, Redis stream, batched ClickHouse writes) in both languages on one machine:

- Peak ingest: Go 19,037 requests/s at p99 47 ms; Python with 4 workers 6,995 requests/s at p99 86 ms.
- Web memory: Go 24 to 74 MB; Python 357 to 388 MB. Image: Go 33 MB; Python 304 MB.
- Worker drain into ClickHouse: Go 181k rows/s; Python 89k rows/s.
- At launch scale (about 1,000 live calls) both kept up with zero loss.
- In Go, real livekit-server webhooks were verified with livekit/protocol, and LiveKit Agents OTLP spans (16 of 16) were joined to their call.

## Options

1. Python core: reuses today's code and tests, at the cost of more memory and copies at scale.
2. Go core: more throughput per core, small images, and the same language as LiveKit and the OpenTelemetry Collector, at the cost of a rewrite.

## Decision

Option 2. Go for web and worker, one binary `voicegw` with a subcommand per role. The SDK stays Python for now.

## Consequences

- Wiring is plain constructor injection with a composition root per role; no dependency injection container.
- Interfaces are small and declared by the package that uses them.
- Libraries: chi, go-redis v9, clickhouse-go v2, pgx v5 with sqlc, goose, livekit/protocol, OpenTelemetry pdata, slog, errgroup, cobra, testcontainers-go.
- The Python SDK lives in this repository under `sdk/python`, so the event format and the SDK change in one pull request.
- Join calls on room plus a time window or on job id, since room names are reused. Never log raw webhook bodies; they carry a TURN password.
- Launch moves to about five weeks for the full V1 scope.
