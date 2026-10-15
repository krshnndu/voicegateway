# 0007: Redis streams for ingest

- Status: accepted
- Date: 2026-10-11

## Context

LiveKit webhooks, SFU and SIP metrics and agent events arrive as many small writes, often in bursts. ClickHouse handles small inserts badly and works best with large batches. Webhook senders expect a fast answer. Langfuse solves this by writing every event to S3 and queueing a pointer in Redis.

## Options

1. Write each event to the database inside the request: simple, but slow under bursts and wasteful for ClickHouse.
2. Redis streams: web appends the event and answers; the worker reads in consumer groups and inserts in batches.
3. Kafka or another broker: higher throughput, at the cost of another heavy service to run.

## Decision

Option 2. Redis also carries the live view of calls in progress (pub/sub) and the job locks from 0006.

## Consequences

- An event is acknowledged once it is on the stream; the worker owns getting it into ClickHouse.
- The stream is the seam between web and worker, so either side can be replaced without touching the other.
- Events are not written to S3 first; object storage holds recordings only (0008).
- Redis is a required service.
