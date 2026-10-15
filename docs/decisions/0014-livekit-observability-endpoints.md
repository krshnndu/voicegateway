# 0014: Take LiveKit agent data through the agents' own observability upload

- Status: accepted
- Date: 2026-10-13

## Context

LiveKit Agents for Python (read at 1.8.6) ships an uploader. When `LIVEKIT_OBSERVABILITY_URL` is set it overrides the LiveKit Cloud check (`job.py`, `_observability_url`), so a self-hosted agent posts to that URL:

- OTLP over HTTP to `/observability/traces/otlp/v0`, `/observability/logs/otlp/v0` and `/observability/metrics/otlp/v0`: the span tree (`agent_session`, `user_turn`, `eou_detection`, `agent_turn`, `llm_node`, `tts_node`, `function_tool`, `agent_speaking`, `realtime_inference`) with the latency breakdown on each turn, plus chat items as logs.
- At session end, a multipart POST to `/observability/recordings/v0`: a protobuf header (room, job, start time), `chat_history.json` with per-message metrics, and `recording.ogg`, stereo, caller on channel 0 and agent on channel 1, with a wall-clock start.

Each request carries a bearer JWT signed with the project's LiveKit API key, which VoiceGateway already holds. Uploads happen only when the session records, through `session.start(record=True)` or the server's `enable_recording`.

Until now the plan was `attach()` in the agent (0002) plus OTLP spans.

## Options

1. Keep `attach()` as the only agent-side source: works for every framework, but every LiveKit user installs and calls our SDK, and we rebuild metrics LiveKit already computes.
2. Serve LiveKit's four observability endpoints in `web`: a LiveKit Python agent connects with one environment variable and records the session; `attach()` stays for other frameworks and for data the upload lacks.
3. Join each room as a hidden observer and read the `lk.agent.session` byte stream: no agent change at all, but it adds a participant to every room, misses the recording and the span tree, and the stream goes only to rooms we join.

## Decision

Option 2. `web` serves the four endpoints at LiveKit's paths, verifies the JWT against the project's LiveKit key, and appends what it receives to the Redis stream like any other event.

## Consequences

- Onboarding for LiveKit Python agents is `LIVEKIT_OBSERVABILITY_URL` plus recording turned on. No SDK import.
- The span names, attribute keys and the recording header become a contract we track per LiveKit Agents release; the paths carry `v0` and can change. Pin the Agents versions we test against and record them in the docs.
- `attach()` (0002) remains for other frameworks and for what the upload lacks: STT per-utterance latency, word timings and live in-call events.
- Fields the installed protobuf drops (`playback_latency`, `provider_request_ids`, model metadata) arrive only in `chat_history.json`; the worker prefers that file when both exist.
- Uploads send nothing unless recording is on, so the setup docs must say so plainly.
- The recording itself is handled by 0015.
