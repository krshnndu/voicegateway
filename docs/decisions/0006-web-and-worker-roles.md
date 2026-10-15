# 0006: Web and worker roles from one image

- Status: accepted
- Date: 2026-10-11
- Supersedes: 0004

## Context

`voicegw serve` runs the API, the dashboard and the background jobs (rollups, retention, node scrape) in one process. Nothing coordinates the jobs, so two replicas run every job twice. With the platform (0005), web traffic and event processing need to scale separately, and a slow job must not stall ingest or dashboard reads.

## Options

1. Keep one process: simple, but it cannot scale past one replica safely.
2. Two codebases, like Langfuse's web and worker: clean separation, at the cost of two things to build, version and release.
3. One image with two commands: `voicegw web` serves the ingest API, the dashboard and MCP; `voicegw worker` reads the queue, writes ClickHouse in batches and runs the jobs.

## Decision

Option 3.

## Consequences

- Web scales to any number of replicas. Workers take a Redis lock for each scheduled job, so a job runs once.
- Web never writes events to ClickHouse directly; it enqueues and answers.
- One release, one image, one version number for both roles.
