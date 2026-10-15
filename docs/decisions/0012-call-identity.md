# 0012: Identify a call by room and time, or by job id

- Status: accepted
- Date: 2026-10-11

## Context

A call's data arrives from several sources: LiveKit webhooks, agent spans over OTLP, SDK events and scraped server metrics. They share no single call id. Room names are reused across calls, the open-source server sends no agent job webhooks, and in the spike only 2 of 16 agent spans carried the room name; the rest share a trace id.

## Options

1. Room name alone: simple, but merges every call that reuses a room.
2. Room name plus the time window between room start and room end, or the agent job id when present; other spans join through their trace id.
3. Require users to pass a call id into the agent: exact, but breaks the one-line setup.

## Decision

Option 2.

## Consequences

- The worker owns joining: an event that matches no open call waits briefly, then is stored as unmatched and counted, never dropped.
- A call whose end event never arrives is closed by a timeout and marked as inferred.
- SIP legs join as participants of kind SIP in the same room.
- Webhooks are deduplicated on their event id.
