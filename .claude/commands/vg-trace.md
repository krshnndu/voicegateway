---
description: Show the code that satisfies a Refinery acceptance criterion. Pass the AC or REQ id as the argument. Optional: prefix with version like 'v0.1.0 REQ-VG-ONBOARD-001'.
allowed-tools: Read, Grep, Glob, Task
---

The user passed an id like `REQ-VG-INFER-001` or `AC-VG-ONBOARD-002.3`, optionally prefixed with a version like `v0.1.0`.

1. Determine the active Refinery doc:
   - If the user prefixed with a version, glob `docs/refinery/vg-<version>-*.md`.
   - Otherwise, infer the version from the REQ subtag (INFER -> v0.0.5 LiveKit Cloud Parity, METRICS -> v0.2.0, ONBOARD -> v0.1.0) and find the matching file.
   - If subtag-to-version mapping is unclear, read `.agents/design.md` for the active version, then glob.
2. Read the Refinery doc. Extract the verbatim wording of the requested REQ or AC.
3. Use the `trace-acceptance` skill to find the code path that satisfies it.
4. Output the citation block defined in that skill.

If the id is malformed or the version cannot be inferred, ask the user for the correct id.
