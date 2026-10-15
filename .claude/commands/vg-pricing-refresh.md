---
description: List stale STT/TTS catalog entries and walk through refreshing them.
allowed-tools: Read, Edit, Bash, Task
---

1. Launch the `vg-pricing-freshness-auditor` subagent. Capture the stale-entries list.
2. For each stale entry, present the maintainer with:
   - The current entry (provider/model, current price, current pricing_source_date).
   - The pricing_source_url.
   - A prompt: "open this URL, verify the per-minute or per-character price, paste the current price (or 'unchanged'), then we will bump pricing_source_date to today."
3. After all entries are addressed, propose a single commit: `chore(pricing): refresh <N> entries` listing each.

Hard rules:
- One entry at a time, sequentially. Never bulk-update without per-entry confirmation.
- If the maintainer types "unchanged", only bump the date, not the price.
- Never invent a price you did not see on the source URL.
