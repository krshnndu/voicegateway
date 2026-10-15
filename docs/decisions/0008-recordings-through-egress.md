# 0008: Recordings through LiveKit Egress, opt-in

- Status: accepted
- Date: 2026-10-12

## Context

A complete call trace includes what the call sounded like. Until now VoiceGateway stored no audio. Audio is large and personal, and recording a call needs consent.

## Options

1. Stream audio through VoiceGateway and store it ourselves: full control, at the cost of bandwidth and a large privacy surface.
2. LiveKit Egress writes the recording straight to the bucket (MinIO or S3); VoiceGateway stores only the link and joins it to the call by room.

## Decision

Option 2, off by default and enabled per project. Ships in V1.

## Consequences

- Audio never passes through VoiceGateway's services.
- The rule "No audio is stored" in ARCHITECTURE.md changes to "Audio is stored only when a project turns recordings on, and only in the user's own bucket".
- In the call view, the recording sits above the observed metrics with each agent turn as a selectable region. A project with recordings off says so instead of showing an empty player.
- Retention applies to recording links and, where configured, to the objects in the bucket.
