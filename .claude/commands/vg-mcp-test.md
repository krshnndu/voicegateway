---
description: Run an end-to-end test of a vg_* MCP tool against the in-memory server. Pass tool name as argument.
allowed-tools: Bash, Read, Task
---

The user passed an MCP tool name like `vg_add_provider`.

1. If the user passed no name, run all five tools.
2. Launch the `vg-mcp-tool-runner` subagent with the requested scope.
3. Pass through the structured output (table plus journal-ready summary).
4. Suggest the maintainer paste the journal-ready summary into `.agents/journal.md` under the current version section.

Do not write to the journal automatically. The journal is hand-managed.
