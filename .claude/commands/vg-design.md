---
description: Print the locked decisions, hard rules, and open questions from the active design.md.
allowed-tools: Read
---

1. Read `.agents/design.md`.
2. Extract three sections and print them in this exact order:
   - Locked decisions (the §9 "Decisions log" or equivalent table).
   - Hard rules (the §8 "Hard rules" or equivalent).
   - Open questions (search for "open question", "unresolved", "todo").
3. If any of the three sections is missing in design.md, say so explicitly.

Output format:

```
## Design state for <version>

### Locked decisions
<table or list>

### Hard rules
<numbered list>

### Open questions
<list, or "none">
```
