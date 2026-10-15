---
description: Advance the VoiceGateway client-delivery build by exactly one graph node. Reads .agents/client-delivery.json, picks the next ready node, implements it, runs its gate, updates state. Loopable via /loop /vg-deliver-next.
allowed-tools: Read, Edit, Write, Grep, Glob, Bash, Task, TodoWrite
---

You are advancing the VoiceGateway build toward one outcome: making VoiceGateway able to produce the evidence package a paying client is owed for a LiveKit SIP + SFU capacity engagement. Advance by exactly ONE node per invocation, verify it, report, then stop. Do not try to finish the build in one turn.

## The outcome

A client has a LiveKit SIP + SFU fleet on AWS and is owed proof that it carries 500 concurrent phone calls, with evidence. VoiceGateway is the evidence and reporting layer for that proof. It is NOT the load generator and must never become one. An external SIP tool (gossipper) places the calls; VoiceGateway ingests what that tool reports, correlates it with scraped node metrics, judges it against the client's acceptance thresholds, and emits a report that can be handed over.

Everything you build serves one of three client deliverables, from `/Users/mahimai/code/year-2026/JUL/upwork-livekit-sfu-anurag/docs/M2-M3-checklist.md`:

- **Item 62** (line 99): the load-test report. Per test: concurrency, duration, establishment rate, peak CPU/mem, failures.
- **Item 63** (line 100): the per-node capacity table with AWS sizing at 100 / 150 / 300 / 500.
- **Item 65** (line 102): reproducible test assets. Gossipper scenarios and commands, the mock participant, dashboards.

Items 64, 66 and 67 sit in the same block (final config files, operational runbook, unresolved risks). They are prose deliverables, not code, and are explicitly OUT of scope for this loop. If a change does not serve item 62, 63 or 65, do not make it.

## Read before your first node

1. `.agents/client-delivery.json`. Your state. If absent, create it from the backlog below and stop. That is a complete first invocation.
2. `.agents/hardening-graph.json`. Its `gates` block is the source of truth for gate commands.
3. `.agents/e2e-graph.json`. Historical context for what M0 to M6 built. Its `gates.backend` is STALE (unpinned mypy). Never copy gate strings from it.
4. `/Users/mahimai/code/year-2026/JUL/upwork-livekit-sfu-anurag/docs/M2-M3-checklist.md` and `docs/M2-M3-execution-runbook.md`. READ ONLY, different git repository.

## Preconditions

1. **Expect a clean tree.** `git status --short` should print nothing. The six-line dirty state this prompt used to expect (five deleted PNGs plus an untracked `06-demo-end.png`) was resolved by the root tidy-up on `chore/tidy-root`; those files are gone and the root is now ignored for stray captures. HALT only if you see a modified or added file under `src/` that you did not create: that means another session is writing this repo, and two loops in one tree produce interleaved commits and unreproducible gates.
2. **Never `git add -A` or `git commit -a`.** Stage explicitly by path, always. Sweeping the whole tree is exactly how the root accumulated the strays that had to be cleaned up.
3. **The path contains a directory with spaces** (`ship voice project`). Every `cd` must be quoted. Unquoted, the `cd` fails outright, the `&&` chain short-circuits, and the gate prints a cd error and nothing else. If a gate produces no test output, read the first line of stderr before suspecting the venv.

## Seeding the manifest

Write `.agents/client-delivery.json` containing: `$comment`, `version: 1`, a `gates` object copied verbatim from `.agents/hardening-graph.json`, `milestone_order` of `["D-INT", "D-GATE", "D-MOCK", "D-DATA", "D-REPORT", "D-UI"]`, a `milestones` object mapping each id to a title, `selection_rule`, `halt_rules`, and a `nodes` array from the backlog below. Each node gets `id`, `milestone`, `name`, `needs`, `autonomy`, `status: "pending"`, `touches`, `note`. Preserve every trap sentence into the node's `note`; those sentences are the point.

**Never `git add` the manifest.** `.agents` is `.gitignore` line 5. Staying untracked is what lets it survive the branch operations this loop performs. The manifest is never part of any commit.

**There is one branch.** All work happens on `integration/capacity-evidence`, created by INT0. There are no per-milestone branches: every node depends transitively on INT5, so a stack of branches buys nothing and multiplies the ways a node commits onto the wrong base. Before every node, verify `git rev-parse --abbrev-ref HEAD` is `integration/capacity-evidence`.

## The backlog

### D-INT: integrate five orphan branches. Nothing works until this is done.

Five branches carry completed, gate-green work and NONE is merged into main. Twenty-four commits (1 + 5 + 9 + 4 + 5) sit in parallel with zero shared history. Ten files are touched by more than one branch, worst first: `docs/api/http-api.md` and `docs/api/dashboard-api.md` (three branches each), then `services/storage_service.py`, `livekit_diag/service.py`, `schemas/config_schema.py`, `tests/livekit_diag/test_service.py`, `pages/Diagnostics.tsx`, `lib/demoFixtures.ts`, `docs/configuration/voicegw-yaml.md`, `CHANGELOG.md`. Conflicts are expected and are the entire difficulty of this milestone.

- **INT0** (auto). The repo is currently on `feat/new-surfaces`, not main. Run `git checkout -b integration/capacity-evidence main`, then verify `git rev-list --count main..HEAD` prints `0`. Anything else means you branched from the wrong place: delete and redo. Then merge `fix/pin-mypy` (1 commit, `3c843da`). That commit touches only `.github/workflows/ci.yml` and `docs/contributing/code-style.md`, so it cannot change local gate colour; the gates below already pin `mypy<2` in the command itself. Merge it first so CI matches local. If a later gate reds on `admin.py` or `client.py`, confirm your command literally contains `--with 'mypy<2'`, then assume the cause is your merge, not mypy. Gate: `backend`.
- **INT1** (auto, needs INT0). Merge `fix/security-hardening` (5 commits, head `dbfdd6b`, nodes S1 to S5). Gate: `backend`, `frontend`.
- **INT2** (auto, needs INT1). Merge `fix/probe-correctness` (9 commits, head `e11a09a`, nodes F1 to F8). Trap: this branch changes what `gates.py` returns for unmeasured input. F6, F6b and F7 make unmeasured ramps and baselines return UNKNOWN rather than PASS. D-GATE builds on that, so a botched conflict resolution here silently reintroduces fabricated passes. Gate: `backend`.
- **INT3** (auto, needs INT2). Merge `fix/wiring-gaps` (4 commits, head `8e17211`, nodes G1 to G4). The one that matters most: G1 (`2b3e8ea`) starts `NodeSamplesWorker` from the lifespan, gated at build time on `targets_from_env()` being non-empty. Without it `node_samples` never receives a row and the CPU and memory gates have no data. After merging, verify `src/voicegateway/core/events.py` contains `NodeSamplesWorker` in both the import block and `_build_workers`. Gate: `backend`, `frontend`.
- **INT4** (auto, needs INT3). Merge `feat/new-surfaces` **by branch name, never by sha**: `git merge feat/new-surfaces`. It is 5 commits ahead (`94cf1de` N1, `a7f9c3c` N3, `2ccd6aa` N2, `420d470` N4, `b38608b` docs). `2ccd6aa` is mid-branch; merging that sha drops N4 and the docs commit while every gate stays green. After merging, verify `src/voicegateway/livekit_diag/run_report.py` and `src/dashboard/frontend/src/pages/diagnostics/NodesPanel.tsx` are present. Gate: `backend`, `frontend`, `docs`.
- **INT5** (auto, needs INT4). Prove no branch's tests were dropped. Do NOT use a remembered baseline; the `2284 passed` figure was measured on `feat/new-surfaces`, which is not the integration tree. Two mechanical checks. (a) File presence: for each of the five branches run `git diff --name-status main...<branch> -- src/voicegateway/tests` and assert every added file exists on the integration branch. (b) Monotonicity: record `.venv/bin/python -m pytest -q -m "not integration" --collect-only | tail -1` on main at INT0 and after each of INT0 to INT4; the count must never decrease between consecutive INT nodes. A missing file or a decrease means a merge ate work. Report which, and HALT. Then run the full gate set: `backend`, `frontend`, `schema_guards`, `docs`.

### D-GATE: the client's actual thresholds. Highest-value milestone.

`livekit_diag/gates.py` implements four gates: `agents_listing`, `agent_reply_latency`, `sfu_connection_quality`, `sfu_capacity`. None is a threshold this client contracted for. A PASS today means nothing against the engagement. Fix this before any test runs, not after.

The thresholds are at `/Users/mahimai/code/year-2026/JUL/upwork-livekit-sfu-anurag/docs/M1-architecture-review-and-test-plan.md` line 270, quoted here in full so you never need to guess:

> "≥99.5% establishment; no crash/OOM/port-exhaustion/FD-exhaustion/unplanned restart; no sustained Redis or health-check failure; no increasing stale calls/rooms/sessions/memory; CPU <70%, memory <75% per node; ≥20% headroom on network / RTP ports / system limits; resources return near baseline after teardown."

- **GATE1** (auto, needs INT5). `establishment_gate`: FAIL below 0.995, UNKNOWN when the run reported no attempts. Trap: an unmeasured run must never PASS. Follow the `_unmeasured_reason` precedent that `fix/probe-correctness` adds at INT2; it is absent from main. Trap: `gates.py` functions are SYNCHRONOUS, do not `await` them.
- **GATE2** (auto, needs GATE1). `node_cpu_gate` (<70%) and `node_memory_gate` (<75%), per node, from `node_samples` over the test window, via `node_correlation_repository.correlate_window`. Trap: its contract is time-window OVERLAP, never attribution; never write code or copy implying a sample belongs to a call. Trap: return UNKNOWN, never PASS, when `WindowCorrelation.status` is `scrape_failed` or `no_samples`. Trap: every VALUE column of `node_samples` is nullable and NULL means "not measured", never zero; branch on `outcome`, not on a value being None.
- **GATE3** (auto, needs GATE2). `headroom_gate` at ≥20% remaining file descriptors, from the `filefd_allocated` / `filefd_maximum` pair already scraped. Trap: the 20% headroom acceptance gate and the 0.85 factor in the node-count formula are different numbers measuring different things. The 0.85 is a 15% CPU margin for post-node-loss capacity (runbook line 201). Never conflate them, never "correct" 0.85 to 0.80. Trap: RTP-port and network headroom are scraped by nothing today. Emit them as `not_measured`, never as a passing zero.
- **GATE4** (auto, needs GATE3). `return_to_baseline_gate`, comparing an idle baseline against a post-settle sample. Settle window is "5-10 min, past LiveKit's reap timeouts" (runbook line 233). This is TWO pieces of work, and skipping the first makes the gate permanently UNKNOWN: `heap_inuse` and `go_goroutines` do not exist today, neither as columns on `node_samples` nor in the scraper's series map. First add both (column, membership in `GAUGE_COLUMNS`, migration, scraper series entry), then write the gate. Trap: measure those two, explicitly NOT RSS, which Go returns to the OS lazily.
- **GATE5** (auto, needs GATE4). A waiver mechanism. Checklist line 68 requires: "If they fund fewer, record the CPU/headroom gates as waived in writing, never a silent pass." Implement an explicit `WAIVED` status carrying a required human-supplied reason string. Trap: a waiver must render as WAIVED with its reason in every surface (verdict, report, Prometheus exposition), must never collapse to PASS, and `exit_code()` must not treat it as clean.

### D-MOCK: the mock participant. The client checklist calls it "the only real build item".

Without this, no call under test connects. `livekit-sip` does not send `200 OK` until it has subscribed to an audio track, so the mock's join-and-publish latency IS the call's answer latency, and a stalled mock terminates calls with `cannot-subscribe`. It sits ON the answer path, not beside it: any per-call work inside it (encoding, allocation, DNS, token minting, a second publish round-trip) shows up directly as SIP answer latency at 500 concurrent and degrades the ≥99.5% gate.

- **MOCK0** (auto, no deps). Toolchain probe, not a halt. Run `command -v go`. If present, mark `done`. If absent, leave `pending` and print, in a **HUMAN ASKS** block at the top of EVERY report from invocation 1 onward: "Run `brew install go`. Until then D-MOCK cannot compile, and D-MOCK is client deliverable item 65." Re-probe every invocation and self-complete the moment Go appears. Never write Go you cannot compile.
- **MOCK1** (auto, needs MOCK0, INT5). Worker handshake in Go under `tools/mock-participant/`: register over WebSocket at `/agent` with a token carrying `VideoGrant.Agent == true`, answer `AvailabilityRequest` with `available:true`, accept `JobAssignment`, read room name and join token from it. Trap: do NOT filter on a room-name prefix. The docs mention `twilio-sura-test-*` but observed configs use `agent-a-` and `loadtest`. The room name arrives in the assignment; prefix filtering silently drops jobs.
- **MOCK2** (auto, needs MOCK1). Encode ONE Opus tone at startup, parse it into a shared `[][]byte` of 20ms frames reused across every track, so per-call encode CPU is zero. Publish real Opus, never null or zero-byte samples. Publish IN the join request (`WithTrack`), not as a second round-trip.
- **MOCK3** (auto, needs MOCK2). Drain received RTP: loop `track.ReadRTP()` in `OnTrackSubscribed` and count packets. You must drain or pion's receive buffers back up. The count is also the bidirectional-media evidence. Report worker status on a timer (`UpdateWorkerStatus`) or the server stops assigning jobs once computed capacity hits zero.
- **MOCK4** (auto, needs MOCK3). POST per-call observations to `/v1/calls/observations` with `origin: "loadgen"`, carrying join time and RTP counts.
- **MOCK5** (hitl, needs MOCK4). Prove one real call end to end against a live LiveKit. Requires infrastructure and credentials no agent has. Halt.

### D-DATA: the load run record and gossipper ingest.

`diagnostics_runs` models a VoiceGateway probe run. It cannot express what the client is owed, which is per-test rows.

- **FIXTURE0** (hitl, no deps). No client doc describes the `calls.jsonl` or `summary.json` record shape, and gossipper is not installed, so it cannot be derived here. A human must paste one real `calls.jsonl` line and one real `summary.json` into `.agents/fixtures/`. Until then DATA2's parser and every number derived from it are provisional, and every emitted report carries `data_provenance: synthetic`. Surface this in the HUMAN ASKS block from invocation 1 alongside MOCK0.
- **DATA1** (auto, needs INT5). New tables `load_runs` and `load_run_tests`. Follow the per-table pattern in this exact order: `models/<x>_model.py`, then the re-export in `models/__init__.py`, then the alembic revision, then `repository/<x>_repository.py`, then the passthrough on `services/storage_service.py`, then the prune branch in `services/retention_service.py`. **Copy `node_samples`, which is the only complete precedent**: `models/node_sample_model.py`, re-export at `models/__init__.py:24`, revision `alembic/versions/a9e2c7b4f1d6_node_samples.py`, `repository/node_samples_repository.py`, passthrough at `services/storage_service.py:591`, prune at `services/retention_service.py:332`. Do NOT copy `agent_probe_results`: it stops at the repository with no passthrough and no prune branch, which is silent failure 4.

  Four silent failures live in this node.
  1. A `table=True` model not re-exported from `models/__init__.py` never reaches `SQLModel.metadata`, invisible to BOTH `create_all` and autogenerate, with no error. Guard: `test_schema_guards.py::test_all_models_registered`.
  2. A revision with the wrong `down_revision` forks the chain and alembic says nothing until `upgrade head`. Current single head: `a9e2c7b4f1d6`. Chain linearly; never create a merge revision. Guard: `test_schema_guards.py::test_single_alembic_head`.
  3. `Database.create_all` exists at `core/database.py:164` but no production path calls it: the lifespan calls `run_migrations` (line 187), which runs `command.upgrade(cfg, "head")` at line 216. Nearly every repository test DOES call `create_all`. So a model added without a migration passes the whole unit suite and then has no table in a real deployment. Copy the counter-pattern from `src/voicegateway/tests/storage/test_migration_calls.py::test_migration_matches_the_model`.
  4. A table with no `_prune_<table>` branch in `retention_service.py` grows forever. You need BOTH the private method AND the `deleted += await self._prune_<table>(...)` line inside `_prune_project`.

  Also: the version table is `alembic_version_voicegateway`, not `alembic_version`. And `alembic/env.py` resolves its URL from `voicegw.yaml` when not told otherwise, so a bare `alembic upgrade head` migrates whatever that file names. Only ever run alembic against a throwaway SQLite file you created. Gate: `backend`, `schema_guards`.

- **DATA2** (auto, needs DATA1, FIXTURE0). A pure parser for gossipper artifacts. Runbook lines 214 to 218 name `calls.jsonl` and `summary.json` as flags and describe NO field shape; no client doc does. Do not invent one, and do not read gossipper source to recover it (AGPL). Write the parser shape-agnostic: recognise fields by name, raise a named error on an unrecognised shape, and record in the module docstring that the shape is unverified against a real artifact. Hand-written fixtures prove the parser is defensive, never that it matches gossipper.
- **DATA3** (auto, needs DATA2). CLI `voicegw loadtest import <dir>`: parse artifacts, write one `load_runs` row and one `load_run_tests` row per test, POST per-call observations. Trap: `POST /v1/calls/observations` accepts `origin` in `{agent, loadgen}` and refuses `webhook`; use `loadgen`. Trap: `CallObservation` and `LegObservation` set `extra="forbid"`, so an unknown field is a 422, not a silent drop. Trap: the `/v1/calls` router carries `dependencies=[Depends(require_scope("write"))]` on the router itself. Any READ endpoint goes on `dashboard_router` under `/api` with `require_principal`, never on that router.
- **DATA4** (auto, needs DATA3). Per-test aggregation covering all five columns item 62 names: concurrency, wall duration, establishment rate from the call rows, peak CPU and memory from `node_samples` over the window, and failure count broken down by cause. Trap: `node_samples_repository.insert_samples` RAISES `ValueError` on an unknown key, and `read_counter_rate` RAISES if the column is not in `COUNTER_COLUMNS` (gauges are refused, not diffed). Trap: percentiles below 10 samples render as "max of N", never p95. Import `MIN_PERCENTILE_SAMPLES` from `gates.py`; do not restate it.

### D-REPORT: the artifacts actually handed over.

No node in this loop can produce a measured run: gossipper and SIPp are not installed, Go is absent, MOCK5 needs unavailable infrastructure, and live LiveKit is forbidden. So every number these nodes compute comes from fixtures unless a human supplies a real artifact. Both emitters MUST carry a top-level `data_provenance` field valued `measured` or `synthetic`, set from whether the source `load_runs` row carries a real artifact checksum. `render_html` MUST stamp `SYNTHETIC DATA: NOT A CLIENT DELIVERABLE` as the first visible element whenever provenance is not `measured`. Add a test asserting a fixture-built payload cannot render an unstamped file.

- **REPORT1** (auto, needs DATA4). Capacity-table derivation. Find C, the calls per node at 70% CPU, then compute `N = ceil(500 / (0.85 × C)) + 1` (runbook line 201). Emit at 100, 150, 300, 500 as `N_T = ceil(T / (0.85 × C)) + 1`; the `+1` spare applies at every tier. Instance type is NOT derived: quote it from `docs/M2-M3-execution-runbook.md:115` (`c7i.2xlarge` SIP, `c6i.xlarge` SFU) and cite that file:line in a table footnote. `M1-architecture-review-and-test-plan.md:196` says `c5.2xlarge` and is superseded. **Trap, and this one is serious:** the baseline ramp at runbook line 190 is arithmetically broken. It pairs `25→50→100→150→200` with `-r 2 -pause_ms 60000`. At 2 calls per second with a 62 second hold, steady-state concurrency plateaus near 124, so the 150 and 200 steps are physically unreachable and the run reports a false ceiling of C ≈ 124. The rate must scale with N (r = N/62; 150 needs r ≥ 2.42, 200 needs r ≥ 3.23). Emit an explicit warning when the input ramp shows a plateau, and never silently accept a plateaued ceiling as C.
- **REPORT2** (auto, needs REPORT1, GATE5, INT4). Extend `livekit_diag/run_report.py`, which arrives with the `feat/new-surfaces` merge at INT4 and exists on no other branch. If it is absent when this node starts, HALT and name INT4 as the blocker; never create a second report generator. Emit the client load-test report: per test the five columns, plus the capacity table, plus every gate with its verdict and any waiver reason. JSON with `schema_version` and one self-contained HTML file. Trap: `build_payload` and `render_html` are SYNCHRONOUS, do not `await` them. Trap: self-containment is enforced by substring scans, not a browser. `_EXTERNAL_MARKERS` at `src/voicegateway/tests/server/test_diagnostics_report.py:366` and `src/voicegateway/tests/cli/test_livekit_report_cli.py:243` reject `<script`, `<link`, `<img`, `<iframe`, `<object`, `<embed`, `<svg`, `@import`, `url(`, `src=`, `srcset`, `integrity=`, `crossorigin`, `//cdn`, `fonts.googleapis`, and in the CLI list `http://` and `https://` anywhere in the file. Inline SVG is banned, so draw with divs and inline `<style>`, and redact any node URL to a host label. Extend both lists; do not start a third. Trap: extend the existing `_REPORT_LIMITS` rather than starting a new one, and add entries for everything still unmeasured (RTP-port headroom, network headroom, per-call packet loss). A limits list that goes quiet reads as a clean bill of health. Write artifacts only to `$REPO/.artifacts/capacity-evidence/` and add `.artifacts/` to `.gitignore` in the same commit; a committed report is one someone will later mistake for a measured one.
- **REPORT3** (auto, needs REPORT2). Reproducible-test-assets appendix for item 65: the gossipper command lines and flag semantics, quoted with file:line citations from `docs/M2-M3-execution-runbook.md` lines 49 to 79. Command lines and flag names are interface facts, not AGPL-covered expression. Do not copy gossipper scenario files or source. `lkmediahold.xml` in the client repo is the client's work product: reference it by name, never copy its body into this MIT repo.
- **DASH1** (auto, needs REPORT3). Grafana dashboard JSON for the panels of checklist item 39 (line 61): establishment rate, CPU/mem per node and per core, FD vs limit, RTP ports, ENA PPS/conntrack, heap_inuse and goroutines, stale rooms/sessions, Redis health. Drive every panel off a series `node_samples` actually carries. Any panel whose series is absent renders as `not_measured`, never as an empty graph. D-UI's page is a different artifact and does not satisfy item 65's "dashboards".

### D-UI: surfacing. Lowest priority; the deliverable is a file, not a page.

- **UI1** (auto, needs DATA3, INT5). A load-run list and per-test detail. Trap: the three no-billed-run panels (`CorrelationPanel`, `CallsPanel`, `NodesPanel`) render at `Diagnostics.tsx:162/164/172`, above the whole results block that begins at `:279`, precisely because they need no diagnostics run. Load-run data also needs no run, so it belongs there, not in a tab. Anything in a tab is invisible until someone runs and pays for a probe. Trap: any new GET needs a fixture in `lib/demoFixtures.ts` in the SAME commit, as a typed module-level const plus a `case` arm, or the demo build throws `demo: no fixture for ${pathname}` at runtime. Trap: `demoFetch` strips the query string and matches on pathname only, so a fixture cannot vary by query param. Trap: the behavioural gate counts `.vg-card`, not `.neo-card`. Content built with `.neo-card` will not be counted and can pass a green gate while rendering nothing.

## Selecting the next node

READY means `status == "pending"` and every id in `needs` is `done`. Among ready nodes: prefer `autonomy == "auto"` over `"hitl"`, then earliest milestone in `milestone_order`, then file order. Only halt on HITL when NO auto node is ready.

## Gates

**A node that changes no repo files runs no gate.** Verification-only and branch-only nodes (INT0, INT5's file-presence pass, MOCK0) change nothing, so ruff, mypy and 2400+ tests cannot tell you anything about them and cost about 146 seconds each. Run the gate when `git diff --stat HEAD` is non-empty, or when the node wrote an untracked source file. Otherwise record `gate: n/a (no files changed)` and move on. This is not a licence to skip a gate on a node that did change files.

Set `REPO` at the start of every gate command, in the same shell invocation as the gate. Environment does not persist between tool calls, and an unset `$REPO` makes `cd "$REPO"` a no-op that silently gates the wrong tree. Run the FULL gate, never a subset. Allow over 300 seconds; the backend gate is about 137s wall.

- `backend`: `cd "$REPO" && uvx ruff check src && uv run --with 'mypy<2' --with types-PyYAML mypy && .venv/bin/python -m pytest -q -m "not integration"`
- `frontend`: `cd "$REPO/src/dashboard/frontend" && npx tsc -b && npm run build && npm run build:demo`
- `schema_guards`: `cd "$REPO" && .venv/bin/python -m pytest -q src/voicegateway/tests/test_schema_guards.py`
- `docs`: `cd "$REPO" && .venv/bin/python docs/_check_docs.py`
- `behavioural`: `cd "$REPO" && MIN_CARDS=5 scripts/e2e-frontend-gate.sh diagnostics`

Notes worth a retry each. The mypy pin is mandatory; unpinned resolves to 2.3.0 and reds `admin.py` and `client.py` on a clean tree. The frontend gate is NOT `npx vite build`: vite strips types without checking them, so the bare form is a false-green generator, and `npm run build` is `tsc -b && vite build`, the real check. `testpaths = ["src/voicegateway/tests"]`, so Python tests placed anywhere else never run under any gate. ruff and mypy are not in `.venv`; that is why the gates go through `uvx` and `uv run`. System `python3` is 3.14.6 while the venv is 3.12.11, so always use the absolute `.venv/bin/python`. Run `docs` whenever a `docs/` page changes. Run `behavioural` whenever you touch a dashboard page; it needs the gstack browse binary, exits 2 if missing, and its greenness is unverified, so run it manually once before trusting it in a blocking path.

Gate handling: green means commit the code and test files you changed, staged explicitly by path, then set `status: "done"` in the manifest with a one-line summary and the commit sha, then report. The manifest is never part of any commit. Red means ONE repair attempt, then re-run. Still red means `status: "failed"`, write the failing output into the node, HALT. Never mark a node done on a red gate.

Every node's git actions must be idempotent: `git rev-parse --verify` before creating a branch, and treat `Already up to date` on a merge as success only after verifying the expected files are present.

## Halt rules

Any halt means report and end the loop. Do not pick a different node to stay busy.

- **No ready nodes:** report COMPLETE only when every node is `done`. If any node is `failed`, do no work at all: report BLOCKED, name that node and its recorded failure, stop. Only a human may reset it to `pending`. Otherwise report BLOCKED and name the hitl node gating the rest.
- **No ready auto node, only hitl:** print the note of EVERY ready hitl node verbatim as a numbered HUMAN ASKS list, state exactly what each human action is, stop.
- A gate still red after one repair.
- A merge conflict in D-INT you cannot resolve with high confidence.
- **Any uncertainty about any number, instance type, threshold or node count that will reach a client deliverable.** Never guess. A hallucinated number in a deliverable is the worst failure available to you here.
- Another session is writing this repo.

## Never do these

- Never build SIP protocol code into VoiceGateway. No INVITE construction, no SIP parsing, no vendored gossipper or SIPp source, scenarios or config. Gossipper is AGPL-3.0 and this repo is MIT. If a node appears to require it, halt.
- Never `git push`, open a PR, or tag. Committing on `integration/capacity-evidence` is fine; publishing is not.
- Never `git add -A` or `git commit -a`. Stage explicitly by path. Never `git add` the manifest.
- Never make an AWS API call. Credentials on this machine are live and appear unscoped (`arn:aws:iam::055255093287:user/mahimai`). Nothing technically blocks you; this rule is the only guardrail. Never execute a script from the client repo.
- Never point a probe, test or script at the client's infrastructure or any live LiveKit server.
- Never run alembic against anything but a throwaway SQLite file you created.
- Never write anything to the client repo at `/Users/mahimai/code/year-2026/JUL/upwork-livekit-sfu-anurag`, read anything there outside `docs/*.md` (`livekit-fleet/` holds live Terraform state with plaintext secrets), or copy any hostname, IP, ARN, account id, instance id or phone number from it into this repo. VoiceGateway is public. Fixtures use obviously fake values (`node-a.example.invalid`, `sip:+15550000000`).
- Never weaken, skip, `-k`-filter or ignore a test to get green, and never edit an existing test to accommodate a change. If an existing test now fails, either the change is wrong or the test encodes a decision nobody made. Report it.
- Never render an unmeasured value as zero. Suppress the series and label it `not_measured`.
- Never use em dashes in code, comments, docs or commit messages. Use colons, periods or parentheses.
- Never add `Co-Authored-By` trailers, "Generated with Claude Code" footers, or any AI attribution to a commit. Write commit messages as the repo owner would.

## Report, then yield

Print, in this order: a **HUMAN ASKS** block if any is outstanding, then **Node** (id and name), **Gate** (command run, green or red), **Changed** (files touched), **Next** (next ready node, or halt reason), **Progress** (`<done>/<total>`, milestone in flight). Then stop. Do not begin the next node.

When you hit any halt condition, end the loop by calling `ScheduleWakeup` with `stop: true`, and say plainly why it stopped and what the human needs to do. A loop that keeps waking against a HITL boundary burns tokens and changes nothing.
