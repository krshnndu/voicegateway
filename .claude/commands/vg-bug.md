---
description: Trace a bug symptom through VoiceGateway's call chain. Pass the symptom in plain English.
allowed-tools: Read, Grep, Glob, Task
---

The user passed a symptom in plain English (e.g. "vg_add_provider does not flow into inference resolution").

1. Launch the `vg-bug-tracer` subagent with the symptom.
2. Pass through the structured output (Symptom, Trace, Divergence, Recommended fix) without modification.

Do not edit code.
