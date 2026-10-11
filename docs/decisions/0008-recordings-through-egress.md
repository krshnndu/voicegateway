# 0008: Recordings through LiveKit Egress, opt-in

- Status: proposed
- Date: 2026-10-11

## Context

A complete call trace includes what the call sounded like. Until now VoiceGateway stored no audio. Audio is large and personal, and recording a call needs consent.

## Options

1. Stream audio through VoiceGateway and store it ourselves: full control, at the cost of bandwidth and a large privacy surface.
2. LiveKit Egress writes the recording straight to the bucket (MinIO or S3); VoiceGateway stores only the link and joins it to the call by room.

## Decision

Option 2, off by default and enabled per project. Planned for after the V1 launch.

## Consequences

- Audio never passes through VoiceGateway's services.
- The rule "No audio is stored" in ARCHITECTURE.md changes to "Audio is stored only when a project turns recordings on, and only in the user's own bucket".
- Retention applies to recording links and, where configured, to the objects in the bucket.
