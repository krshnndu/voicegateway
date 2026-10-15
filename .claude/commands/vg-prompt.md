---
description: Print the active Ralph Loop prompt for the current version build.
allowed-tools: Read
---

1. Read `.agents/prompt.md`. This is the active Ralph Loop prompt.
2. Print the full content with a header naming the file path.
3. Do not summarize. Do not interpret. The user wants the verbatim prompt.

If `.agents/prompt.md` does not exist, tell the user the prompt has not been authored yet, and offer to launch the `ralph-loop-prompt` skill if it is available.
