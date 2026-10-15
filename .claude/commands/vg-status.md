---
description: One-glance VoiceGateway status (branch, tests, coverage, stale pricing, journal head)
allowed-tools: Bash, Read
---

Print a compact status snapshot for VoiceGateway. Use these commands and lay out the result as a single short report.

1. Current branch: `git rev-parse --abbrev-ref HEAD`
2. Working tree clean: `git status --porcelain | wc -l`
3. Test count and pass: `.venv/bin/pytest tests/ -q --co 2>/dev/null | tail -1` then `.venv/bin/pytest tests/ -q 2>&1 | tail -3`
4. Coverage: `.venv/bin/pytest tests/ --cov --cov-report=term 2>/dev/null | grep TOTAL`
5. Stale pricing entries: launch the `vg-pricing-freshness-auditor` subagent
6. Last 3 lines of `.agents/journal.md`
7. Last 3 lines of `.claude/turn-log.md`

Output format:

```
## VG status

**Branch:** <name> (<clean|N files dirty>)
**Tests:** <total> total, <pass> pass, <fail> fail
**Coverage:** <pct>
**Stale pricing:** <count> entries (run /vg-pricing-refresh to walk)

**Journal head:**
<last 3 lines>

**Turn log head:**
<last 3 lines>
```

Stay under 30 lines of output.
