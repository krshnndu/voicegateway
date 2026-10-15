# 0015: Recordings come from the agent's session upload first, Egress second

- Status: accepted
- Date: 2026-10-13
- Amends: 0008

## Context

0008 chose LiveKit Egress writing recordings to the user's bucket, opt-in per project. 0014 adds the agent's own session upload, which already contains `recording.ogg`: stereo, caller on channel 0, agent on channel 1, with a wall-clock start time that lines up with every span and message timestamp. Egress needs a running egress service, a separate request per room, and gives a mixed or per-track file that we must align by `EgressInfo` start time.

## Options

1. Egress only, as in 0008.
2. Agent upload when present, Egress for rooms without an agent upload (for example rooms whose agent is not on LiveKit Agents for Python).
3. Agent upload only.

## Decision

Option 2.

## Consequences

- web streams the uploaded `recording.ogg` into the project's bucket and stores only the link, as 0008 requires; audio still never stays in VoiceGateway's own services.
- The call view draws two waveforms, caller and agent, from the two channels, without diarization.
- Recordings stay opt-in per project. A project with recordings off rejects or discards the audio part of the upload and keeps the rest.
- Egress remains for rooms without an agent upload, so the 0008 setup still applies there.
