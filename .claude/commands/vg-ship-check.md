---
description: Full ship-readiness gate for the active version. Run before opening a release PR or tagging a version.
allowed-tools: Bash, Read, Grep, Task
---

Run the complete ship-readiness check for VoiceGateway, scoped to the active version.

Active-version discovery: same rules as /vg-ac. Read `.agents/design.md` or `.agents/prompt.md` for the version, or accept it as an argument.

Coverage gate is version-specific: 75 percent for v0.0.5, 80 percent for v0.1.0 and onward. Use the active version to pick the right gate.

1. Branch hygiene: not on main, no uncommitted changes, no untracked .py files.
2. Tests: full suite passes (`.venv/bin/pytest tests/ -q`).
3. Coverage: above the active-version gate.
4. Lint: `.venv/bin/ruff check voicegateway tests`.
5. Type check: `.venv/bin/mypy voicegateway`.
6. Pricing freshness: launch `vg-pricing-freshness-auditor`. Zero stale required.
7. LiveKit signature parity: launch `vg-livekit-signature-diff`. Verdict must be "drop-in claim safe".
8. Acceptance criteria: launch `vg-acceptance-checker` against the active Refinery. All ACs ✓ required.
9. CHANGELOG: a new entry exists for the active version. Grep for the version string.
10. Design.md acceptance items: every numbered item in `.agents/design.md` §5 (or equivalent) must be checked off in `.agents/journal.md`.

Output format:

```
## Ship-check for <active version>

| Gate | Status | Notes |
|---|---|---|
| Branch hygiene | ✓ |  |
| Tests | ✓ | <count> pass |
| Coverage | ✓ | <pct> > <gate> gate |
| Lint | ✓ |  |
| Mypy | ✓ |  |
| Pricing freshness | ✓ | 0 stale |
| LiveKit parity | ✓ |  |
| Acceptance criteria | ⚠ | N partials, see below |
| CHANGELOG | ✓ |  |
| Design.md items | ✓ |  |

**Verdict:** PASS / BLOCKED on <list>
```

If any gate fails, the verdict is BLOCKED and you stop with named blockers.
