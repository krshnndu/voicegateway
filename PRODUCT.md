# Product

<!--
What VoiceGateway is and why it exists. No technical choices here; those go in ARCHITECTURE.md.
Brand and accessibility live in DESIGN.md. Evidence and open questions live in docs/progress.md.
-->

## What it is

A self-hosted platform that profiles LiveKit voice agents end to end, from the phone line to the model, in one view per call.

## Users and the job

Developers and small teams who run LiveKit voice agents on their own infrastructure. When a call goes wrong (slow replies, a dropped caller, a confused agent), they need to see what happened in that call and why, in minutes. They use it in development for test calls and in production for incidents and sizing servers. They work in a browser dashboard next to their agent code, the LiveKit server and their usual metrics tools. Coding agents can ask the same questions through MCP.

## The problem

A voice call crosses SIP, the media server, the agent and three models (STT, LLM, TTS). Each layer logs in its own place with its own ids, so nobody sees one call as one story. Teams stitch logs by hand, guess where latency came from, and cannot tell a network problem from a slow model.

## Positioning

The only open-source, self-hosted tool that puts SIP, media server and agent turns of a LiveKit call on one timeline. LLM tracing tools see the model calls only; hosted dashboards see the call only if your data leaves your servers.

## V1 capabilities

1. Call trace: every call with its transcript, per-turn latency for STT, LLM and TTS, and usage (tokens, audio seconds, characters).
2. Media server and SIP: room, participant and SIP events, plus compute and memory of the servers, tied to the calls they served.
3. Live view: calls in progress, updating as they happen.
4. One install: `docker compose up` brings up the whole platform; one line in the agent connects it.
5. MCP access: coding agents can query calls and traces.

## Out of scope for V1

- Prices and cost: usage numbers are exact, prices drift (decision 0010).
- Frameworks other than LiveKit: depth on one stack beats shallow coverage of many.
- A hosted service: V1 runs on your servers only.
- An embedded single-process mode: one install shape to build and test (decision 0005).
- Recordings at launch: opt-in through LiveKit Egress, shipped after the first release (decision 0008).
- Alerting and call scoring: users keep their existing alerting; scoring needs traces first.

## Success at launch

Proposed targets, for review:

- A new user goes from `docker compose up` to their first traced call in under 10 minutes.
- No event is lost at 1,000 concurrent calls.
- Every call shows its full timeline, with no turn missing a modality that was reported.
- Ten teams outside the project run it on real traffic within a month of launch.

## Failure modes

- Two calls in a reused room are merged into one, or one call is split in two.
- A missing value (usage, latency) is shown as zero instead of unknown.
- A call never closes because the end event never arrived, and it looks live forever.
- Events are dropped under a burst and nothing says so.
- A secret from a webhook body ends up in logs.

## Principles

1. One command to run it. Every extra step loses a user.
2. Unknown stays unknown. Never fill a gap with zero or a guess; mark anything inferred.
3. Never lose data quietly. An event is either stored or visibly rejected.
4. Never in the call path. If VoiceGateway is slow or down, the agent's call carries on unaffected.
5. Measured, not claimed. Every number on screen comes from the call, never from an estimate.
6. Your data stays on your servers.
7. Built for people first; agents read the same data through MCP.
