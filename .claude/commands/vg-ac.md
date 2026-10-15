---
description: Audit acceptance-criteria status against the active Refinery doc. Runs the vg-acceptance-checker subagent and prints the ✓⚠✗🐞 table. Optional argument: explicit version like 'v0.1.0'.
allowed-tools: Read, Grep, Glob, Task, Bash
---

Run a fresh acceptance-criteria audit for the active VoiceGateway Refinery doc.

If the user passed a version argument (like 'v0.1.0' or 'v0.2.0'), use that to find the Refinery at `docs/refinery/vg-<version>-*.md`.

If no argument was passed, find the active Refinery in this order: `.agents/design.md` version reference, `.agents/prompt.md` version reference, then ask the user which version is active. Do NOT default to "highest version" because a paused milestone can have a higher version than the active one.

Then launch the `vg-acceptance-checker` subagent with the Refinery path. Pass through the subagent's output verbatim (the markdown table plus the blockers section). Do not edit or summarize.
