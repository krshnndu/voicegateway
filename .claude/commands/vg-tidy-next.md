---
description: Clean up the VoiceGateway repo root by exactly one node per invocation. Deletes verified-unreferenced strays, adds root-anchored gitignore rules, fixes the sources that keep recreating the mess. Loopable via /loop /vg-tidy-next.
allowed-tools: Read, Edit, Write, Grep, Glob, Bash, TodoWrite
---

You are cleaning up the VoiceGateway repository root. Advance by exactly ONE node per invocation, verify it, commit it, report, then stop. Do not try to finish in one turn.

This is hygiene work, not refactoring. Nothing under `src/` moves. No dependency changes. No history rewriting. Every action below is either a deletion of a verified-unreferenced file, a `.gitignore` addition, or a one-line fix to something that keeps recreating the mess.

## What is actually wrong

The root accumulated tracked images and agent artifacts, almost all swept in by one commit (`ddc3c4e`, "feat(dashboard): live compute/memory + run-once latency graph for the fleet", where 41 files of real `src/` work arrived alongside a pile of screenshots). Two of the strays are byte-identical duplicates of files already in `docs/assets/`. None of them is referenced by anything.

Every fact below was verified against the repo before this prompt was written. Do not re-derive them, but do re-verify before deleting: the tree has moved before.

| File | Size | Verdict | Evidence |
|---|---|---|---|
| `og-capture.png` | 413,807 B | delete | byte-identical to `docs/assets/og.png`, sha256 `2b2822f0…c698e` on both. 0 references |
| `af-render.png` | 146,489 B | delete | unique, 0 references anywhere |
| `model-chips-filled.png` | 16,467 B | delete | unique, 0 references anywhere |
| `agents-svgs-generated/` | 8 SVGs | delete | `agent-1.svg` to `agent-8.svg`, 0 references |
| `skills-lock.json` | 5,001 B | delete + ignore | every entry is `"source": "heygen-com/hyperframes"`. Agent-harness state, not project state. It regenerates, so deleting without ignoring means the next `git add -A` re-commits it |
| `logo.svg` | 1,273 B | **HUMAN** | commit `5bd9be2` says verbatim: `logo.svg (canonical) + docs/assets/logo.svg (docs + README banner source)`. Deleting it inverts a documented canonical relationship, and an external hotlink to `raw.githubusercontent.com/.../main/logo.svg` cannot be ruled out from inside the repo |
| `06-demo-end.png` | 146,816 B | **HUMAN** | untracked, so deletion is irreversible with no git blob to recover from. Ignore the path, leave the bytes |
| 5 x `probe-*.png` / `ortc-logo-current.png` | ~32 KB | commit the deletion | already deleted on disk, unstaged. 0 references. See node T3 for the ordering constraint |

## Preconditions

1. **Another session has been writing this tree.** During the audit that produced this prompt, `git status` showed roughly 50 modified files plus `UU` unmerged paths, then returned to a clean six-line state seconds later. Run `git status --short`. If you see anything modified or added under `src/` that you did not create, HALT. Two loops in one tree produce interleaved commits.
2. **Do not run this at the same time as `/vg-deliver-next`.** That loop treats an unexpected `src/` change as a halt condition, and this loop's `.gitignore` edit changes what its precondition check sees. Run them one after the other, never together.
3. **Branch from `origin/main`, not from HEAD.** HEAD is currently `feat/new-surfaces`, which carries 7 unmerged commits of unrelated in-flight work. Run `git fetch origin`, then `git checkout -b chore/tidy-root origin/main`, then verify `git rev-list --count origin/main..HEAD` prints `0`.
4. **Never `git add -A` or `git commit -a`.** That is literally how this mess was created, and the maintainer already named the pattern in commit `185c893`: "accidentally swept into #50 by `git add -A`". Stage explicit paths only.
5. The repo path contains a directory with spaces (`ship voice project`). Quote every `cd`. Unquoted, the `cd` fails outright and the `&&` chain short-circuits, so a gate prints a cd error and no test output.

## State

Keep `.agents/tidy.json`: `version: 1`, a `nodes` array from the backlog below with `id`, `name`, `needs`, `autonomy`, `status: "pending"`, `note`, and `gates` copied from `.agents/hardening-graph.json`. Create it on the first invocation and stop; that is a complete first invocation.

**Never `git add` the manifest.** `.agents` is `.gitignore` line 5. Being untracked is what lets it survive branch operations.

## The backlog

- **T0** (auto). Preflight. Fetch, create `chore/tidy-root` from `origin/main`, verify the count is 0. Re-verify the two duplicate claims yourself with `shasum -a 256` before anything is deleted: `og-capture.png` against `docs/assets/og.png`, and `logo.svg` against `docs/assets/logo.svg`. Re-verify zero references for each delete candidate with a repo-wide search excluding `.git`, `node_modules`, `.venv`, `dist`, `dist-demo`. If any candidate now has a reference, mark it HUMAN and exclude it. Record the results in the node. No commit.

- **T1** (auto, needs T0). Ignore rules first, so nothing re-accumulates behind you. Add to `.gitignore`, under the existing root-artifact section near lines 433 to 441 (which already holds `/voicegw.yaml`, `/.shots/`, `qa/`, `.gstack/`, `.e2e-gate-*.png`):

  ```
  # Stray root screenshots (Playwright and dashboard captures land in cwd)
  /*.png
  /*.jpg

  # Generated agent SVG scratch output
  /agents-svgs-generated/

  # Agent skill-installer lockfile (heygen-com/hyperframes), regenerates
  /skills-lock.json

  # HyperFrames launch-video project, not part of the Python deliverable
  /videos/
  ```

  **The leading `/` is mandatory on every one of these.** A bare `*.png` or `*.svg` shadows the 24 legitimately tracked files under `docs/assets/` and `src/dashboard/api/static/branding/`, and the breakage is silent.

  `videos/` is currently excluded only in `.git/info/exclude:18`, which does not survive a clone and is invisible to the build backend. Moving it into the committed `.gitignore` is the point of that line. Gate: `docs` if you touched a docs page, otherwise none. Commit as `chore:`.

- **T2** (auto, needs T1). Untrack and delete the five verified strays in one commit: `og-capture.png`, `af-render.png`, `model-chips-filled.png`, `agents-svgs-generated/`, `skills-lock.json`. Use `git rm` for tracked paths, staged explicitly. Follow the commit convention from `185c893` ("chore: untrack local voicegw.yaml and gitignore it"): unscoped `chore:`, one concern, and a body saying how the files got in and what they are not. Note in the body that `og-capture.png` was a byte-identical duplicate of `docs/assets/og.png`. Gate: `backend`, `frontend`.

- **T3** (auto, needs T2). Commit the five already-pending deletions (`ortc-logo-current.png`, `probe-button-enabled.png`, `probe-result-not-measured.png`, `probe-three-segment-working.png`, `probe-working-result.png`). **Ordering constraint:** that exact six-line `git status` is written into two live loop prompts as an expected-state precondition, at `.agents/client-delivery-loop-prompt.md:24` and `.claude/commands/vg-deliver-next.md:29`. Both files are untracked, so they cannot be updated inside this commit. Edit both first as a plain working-tree edit (replace the six-line expectation with "expect a clean tree"), then stage and commit the deletions. If you skip this, the delivery loop halts on a precondition that can no longer be satisfied.

- **T4** (auto, needs T3). Stop the recurrence at its source. `scripts/e2e-frontend-gate.sh:130` is `shot="${SHOT:-$REPO/.e2e-gate-$ROUTE.png}"`, which drops a PNG into the repo root on every gate run. Point the default at `.shots/` instead, which is already ignored at `.gitignore:435`, and create the directory if absent so the gate does not fail on a fresh clone. Do not change the `SHOT` override behaviour; only the default. Gate: `behavioural` if the browse binary is available, otherwise run the script once by hand and confirm the file lands in `.shots/`.

- **T5** (auto, needs T4). Stop the class of accident at the packaging layer. `pyproject.toml` has no `[tool.hatch.build.targets.sdist]` section at all, so the sdist ships whatever the VCS filter allows. This was verified by actually building: `uv build --sdist` produces 18.6 MB compressed and 27.2 MB extracted, whose root contains `06-demo-end.png`, `af-render.png`, `agents-svgs-generated/`, `logo.svg`, `model-chips-filled.png`, `og-capture.png`, `skills-lock.json`, plus 210 entries of `videos/` accounting for 18.0 MB (66% of the tarball). Hatchling reads `.gitignore` but not `.git/info/exclude`, which is exactly why `videos/` leaks. Add an explicit sdist include list. Then verify by building again into a scratch directory and asserting the tarball contains no `.png` at its root and no `videos/`. Report the before and after size. Do not touch `[tool.hatch.build.targets.wheel]`: the wheel is provably clean already (`packages = ["src/voicegateway", "src/dashboard"]` plus a force-include of only `alembic.ini` and `alembic`). Gate: `backend`.

- **T6** (auto, needs T5). Fix the one piece of documentation that will actively mislead the next person. `CONTRIBUTING.md:51-54` claims documentation "lives in a separate repository ... Documentation changes go to that repo, not this one". That is stale and false: `CLAUDE.md:57` says the Mintlify site (docs.voicegateway.dev) lives in this repo under `docs/` and deploys from the default branch, corroborated by a live `docs/docs.json`, roughly 90 tracked `.md` pages, and `.github/workflows/docs.yml`. Correct the paragraph to match. Trap: do not add a new `.md` file under `docs/`; `docs/_check_docs.py` fails any page not wired into the `docs.json` nav. Gate: `docs`.

- **T7** (auto, needs T6). Raise the guard that should have caught this. `.pre-commit-config.yaml` runs `check-added-large-files` with `exclude: ^uv\.lock$` and no `--maxkb`, so the 500 KB default let `og-capture.png` (413,807 B) straight through. Set an explicit `--maxkb` low enough to catch a screenshot but above the largest legitimately tracked asset. Check the largest first: `docs/assets/og.png` is 408 KB and `docs/assets/banner.gif` is 184 KB, so the limit has to clear 408 KB, which means this guard cannot catch a 413 KB screenshot. Say so in the node and pick the limit that catches the common case (a 1 to 5 MB capture) rather than pretending it solves the problem. Gate: run `pre-commit run --all-files` and report.

- **T8** (hitl, no deps). `logo.svg` at the root. Commit `5bd9be2` designates the root copy canonical and `docs/assets/logo.svg` the derived one, and the same commit mentions a marketing site in a separate repo, so an external hotlink to the raw GitHub URL is possible and cannot be checked from here. Print this and ask: delete the root copy and promote `docs/assets/logo.svg`, or keep the root copy and document why. Do not decide it yourself.

- **T9** (hitl, no deps). `06-demo-end.png` is untracked, so deleting it is irreversible. T1 already ignores the path. Ask whether to delete the bytes or leave them. Do not delete.

## What must not be touched

- **`docs/assets/`.** The highest-risk directory in the repo. `README.md` embeds it via absolute `https://raw.githubusercontent.com/mahimailabs/voicegateway/main/docs/assets/...` URLs pinned to `main`, and `pyproject.toml:5` sets `readme = "README.md"`, so a move breaks the GitHub README and the PyPI project page retroactively for every already-published release. `docs/docs.json:11-14` resolves `/assets/logo.svg` and `/assets/favicon.svg` against `docs/`, so a move breaks the live Mintlify site.
- **`src/dashboard/api/static/branding/`.** Looks like duplication (its `logo.svg` is byte-identical to `docs/assets/logo.svg`) but is the runtime copy, resolved in `src/voicegateway/server/api/dashboard/branding.py:66-67`, mounted at `/static/branding`, and referenced by `src/dashboard/frontend/index.html:9`.
- **Anything under `src/`.** `feat/restruc-dashboard` is an unmerged 104-file `src/` refactor; overlapping guarantees conflicts. And the delivery loop halts on unexpected `src/` changes.
- **`qa/` and `videos/` contents.** Both ignored, zero git impact, but ignored does not mean disposable: `qa/` holds a substantive QA ledger and `videos/` is 183 MB of real work. Ignore the paths, never delete the bytes.
- **`tools/benchmarks/`** (no inbound reference at all: it is the decision record behind the opt-in DuckDB read path, keep it for that reason and not for a packaging one), **`deploy/prober/`** (`docs/deployment/distributed-sfu.md` tells users to `cd` into it), **`deploy/grafana/`** (drift-tested by `test_dashboard.py`), **`examples/`** (linked from docs by blob URL), **`tools/scripts/build_wheel.sh`** (run by `.github/workflows/publish.yml`), **`tools/scripts/e2e-frontend-gate.sh`** (named in a `.gitignore` comment). All load-bearing.
- **`uv.lock`.** 919 KB and touched by unrelated in-flight work. A hygiene commit that also moves the lock is unreviewable.

## Set expectations before you start

Deleting only the tracked strays will barely change what `ls` shows. `.DS_Store`, `.coverage`, `voicegw.db`, `.e2e-gate-diagnostics.png`, `.venv/`, `.shots/`, `.playwright-mcp/`, `.gstack/`, `qa/` and `videos/` all remain, and all are already ignored. The measurable wins are: 8 tracked files and one directory gone from git, roughly 740 KB off every clone, and the sdist dropping from 27.2 MB to under 10 MB. Say that in your first report so the result does not read as "did nothing".

## Gates

Set `REPO` in the same shell invocation as the gate; environment does not persist between tool calls, and an unset `$REPO` makes `cd "$REPO"` a silent no-op against the wrong tree.

- `backend`: `cd "$REPO" && uvx ruff check src && uv run --with 'mypy<2' --with types-PyYAML mypy && .venv/bin/python -m pytest -q -m "not integration"`
- `frontend`: `cd "$REPO/src/dashboard/frontend" && npx tsc -b && npm run build && npm run build:demo`
- `docs`: `cd "$REPO" && .venv/bin/python docs/_check_docs.py`
- `behavioural`: `cd "$REPO" && MIN_CARDS=5 scripts/e2e-frontend-gate.sh diagnostics`

The mypy pin is mandatory; unpinned resolves to 2.3.0 and reds `admin.py` and `client.py` on a clean tree. The frontend gate is not `npx vite build`: vite strips types without checking them. Allow over 300 seconds; the backend gate is about 137s.

Green means commit the files you changed, staged explicitly by path, then set `status: "done"` with the commit sha in the manifest, then report. Red means one repair attempt, then re-run; still red means `status: "failed"` and HALT.

## Halt rules

- No ready nodes: report COMPLETE only when every node is `done`. If any node is `failed`, report BLOCKED and stop; only a human resets it.
- Only HITL nodes ready: print each note verbatim as a numbered HUMAN ASKS list and stop.
- A gate red after one repair.
- Any file whose reference count is no longer zero when you re-check it in T0. Mark it HUMAN, exclude it, continue with the rest.
- Another session writing the repo.

## Never do these

- Never rewrite history. No `filter-repo`, no BFG, no force-push. Every deletion here is recoverable via `git show ddc3c4e:<file>`, so rewriting buys nothing and breaks every open PR, every existing clone, and the `main`-pinned README URLs.
- Never `git push`, open a PR, or tag.
- Never `git add -A` or `git commit -a`. Never `git add` the manifest.
- Never delete an untracked file. There is no blob to recover it from.
- Never add a bare `*.png` or `*.svg` pattern to `.gitignore`. Root-anchor everything.
- Never touch `src/`, `uv.lock`, or `docs/assets/`.
- Never use em dashes in code, comments, docs or commit messages. Use colons, periods or parentheses.
- Never add `Co-Authored-By` trailers, "Generated with Claude Code" footers, or any AI attribution. Write commit messages as the repo owner would.

## Report, then yield

Print: **HUMAN ASKS** (if any), **Node** (id and name), **Gate** (command, green or red), **Changed** (files, staged explicitly), **Bytes removed** (running total off the clone), **Next** (next ready node or halt reason), **Progress** (`<done>/<total>`). Then stop.

When you hit any halt condition, end the loop by calling `ScheduleWakeup` with `stop: true` and say plainly why it stopped and what the human needs to do.
