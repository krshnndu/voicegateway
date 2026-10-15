# 0016: A project is one LiveKit project, read from its three keys

- Status: accepted
- Date: 2026-10-14

## Context

VoiceGateway profiles LiveKit voice stacks. Each one is a LiveKit server or LiveKit Cloud project, reached with three values: the URL, an API key and its secret. Users want to add a project by pasting those three values and then see their stack as one tree: media server, phone bridge, agents, models, egress and ingress.

A read-only check on 2026-10-14 against a LiveKit Cloud project (only the three values) and the livekit-agents 1.8.6 source showed what those values reach:

- Server APIs: rooms, participants (kind, region, attributes, track audio features), agent dispatches with job and worker ids, SIP inbound and outbound trunks (including whether Krisp noise cancellation is on) and dispatch rules, egress and ingress.
- Agent configuration: every primary `AgentSession` hosts LiveKit's RemoteSession endpoint on the room byte-stream topic `lk.agent.session` (`voice/agent_session.py`, the `hosting` branch). A hidden participant whose token is signed with the project's secret can ask it for the SDK and version, session state, turn and interruption settings, instructions and tools, and model usage with provider and model per STT, LLM and TTS. This is how LiveKit's Agent Console works.
- Not reachable: idle self-hosted workers (no listing API; Cloud-deployed agents only through LiveKit Cloud's agent API), the VAD model, the turn-detector model, server-side noise cancellation, and the detailed SIP call record (LiveKit Cloud analytics only).

## Options

1. Ask only for an ingest key and rely on what agents send (attach or the observability upload): no access to the server, but the media server, SIP and egress stay invisible and an agent that sends nothing is invisible.
2. A project holds the three LiveKit values. web reads the tree through the server APIs on a schedule and on webhooks, and, when the project opts in, observes live rooms as a hidden participant to read agent configuration and models.
3. As option 2, but always observe every room.

## Decision

Option 2. Creating a project asks for the LiveKit URL, API key and secret. Observing live rooms is a per-project setting, off by default.

## Consequences

- The secret is stored encrypted at rest in Postgres and never sent to the dashboard. The dashboard never holds it after the create form is submitted.
- The project page draws the tree from the server APIs; an agent's models and settings appear only when observation is on and a room with that agent is live, and the page says so.
- Observation joins live rooms as a hidden participant. On LiveKit Cloud that may count as participant minutes, and the observer sees the agent's instructions and the conversation, so the setting explains both before it is turned on.
- What the keys cannot reach (VAD, turn detector, server-side noise cancellation, per-turn timings) still comes from the observability upload (0014) or `attach()` (0002).
- Self-hosted workers that are idle stay invisible until they take a job or send their own metrics; the page does not imply they are absent.
