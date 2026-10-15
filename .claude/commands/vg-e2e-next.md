---
description: Advance the end-to-end profiling build (M0-M6) by exactly one graph node. Reads .agents/e2e-graph.json, picks the next ready node, implements it, runs its gate, updates state. Halts at HITL boundaries, failed gates, and milestone edges. Loopable via `/loop /vg-e2e-next`.
allowed-tools: Read, Edit, Write, Grep, Glob, Bash, Task, TodoWrite
---

Advance the end-to-end profiling build by **exactly one node**, then stop.

You are the driver for a dependency graph. Do not try to finish the build in one turn. One node per invocation, verified, then report and yield.

## 1. Load state

Read, in this order:

1. `.agents/e2e-graph.json`: the node graph and current status. This is the single source of truth for what is done.
2. `docs/design/e2e-build-graph.md`: autonomy zones, gates, halt rules.
3. `docs/design/end-to-end-profiling-scope.md`: the per-feature scope. **Section 9 ("Not being built") is a hard boundary.** Do not add anything from that table, however reasonable it seems.

Confirm the current git branch matches `milestones.<milestone>.branch` for the node you are about to work. If it does not, create or switch to it (`git checkout -b <branch>`). Never work a node on `main`.

## 2. Select the next node

A node is **ready** when `status == "pending"` and every id in `needs` has `status == "done"`.

Among the ready nodes, pick one using `selection_rule` in the manifest:

1. **Prefer `autonomy == "auto"` over `"hitl"`.** This ordering matters: `L0` has no dependencies, so a naive "first ready node" pick lands on a HITL node in the *last* milestone and stalls the loop while all of M0–M4 sits available.
2. Then the earliest milestone in `milestone_order`.
3. Then file order.

Then apply the halt rules. **Any halt means: report and end the loop. Do not pick a different node to stay busy.**

- **No ready nodes at all** → report whether the build is complete or blocked (name the blocking node), then halt.
- **No ready `auto` node, only `hitl`** → halt. Print the HITL node's `note` verbatim, state exactly what decision or action is needed from the human, and stop. Do not attempt it and do not work around it.
- **The selected node is in a different milestone than the last completed node** → this is a review gate. Halt and ask for a diff review before starting the new milestone.

## 3. Implement the node

Set `status: "in_progress"` in the manifest before you start, so a crashed run is visible.

Delegate the implementation to the `vg-e2e-node-builder` subagent via Task. Pass it:

- the node object verbatim from the manifest (its `name`, `touches`, and especially its `note`, because the notes carry the traps that will otherwise cost a day)
- the relevant per-feature scope section from `docs/design/end-to-end-profiling-scope.md`
- the **entire** "Not being built" table from section 9 of that document
- the gate command it must satisfy, resolved from `gates` in the manifest

For a backend node, follow the established per-table pattern. The smallest complete precedent to copy is `agent_probe_results`: `models/agent_probe_result_model.py` + `repository/agent_probe_result_repository.py` + `alembic/versions/d2f6b8a1c3e5_agent_probe_results.py`.

## 4. Run the gate

Resolve the node's `gate` key against `gates` in the manifest and run it with `REPO` set to the repo root. Run the **full** gate, not a subset.

For any node that adds a model or a migration, additionally run the schema guards (`gates.schema_guards`). They catch the two silent failures: a forked alembic chain, and a model missing its `models/__init__.py` re-export.

Gate handling:

- **Green** → set `status: "done"`, record a one-line summary in the node, and report.
- **Red** → hand the failure output back to the subagent for **one** repair attempt, then re-run the gate. If it is still red, set `status: "failed"`, write the failing output into the node, and **halt**. Never mark a node done on a red gate. Never weaken, skip, or `-k`-filter a test to make it pass.

## 5. Never do these

- `git push`, open a PR, or tag. Committing on the feature branch is fine; publishing is not.
- Run `alembic upgrade head` against anything but a throwaway SQLite file.
- Make an AWS API call for any node in M0–M4.
- Touch a node whose `autonomy` is `hitl`.
- Add anything from the "Not being built" table.
- Edit an existing test to make a new change pass.

## 6. Report, then yield

Print exactly:

- **Node**: id and name
- **Gate**: the command run, and green/red
- **Changed**: the files touched
- **Next**: the next ready node, or the halt reason
- **Progress**: `<done>/<total>` nodes, and which milestone is in flight

Then stop. Do not begin the next node.

## 7. Ending the loop

When you hit any halt condition (HITL node, failed gate, milestone review gate, or no ready nodes), **end the loop** by calling `ScheduleWakeup` with `stop: true`, and say plainly why it stopped and what the human needs to do. A loop that keeps waking up against a HITL boundary burns tokens and changes nothing.
