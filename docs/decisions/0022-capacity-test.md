# 0022: Capacity test with synthetic calls

- Status: accepted
- Date: 2026-10-14

## Context

Peak calls at once shows what traffic happened to reach, not what an agent can carry. Teams size workers by guessing from LiveKit's rule of thumb (10 to 25 jobs on 4 cores and 8 GB). A spike on 2026-10-14 showed VoiceGateway can measure it with only the project's three keys: it created rooms, dispatched vg-capture by name, joined a synthetic caller that spoke one line, and ramped 1, 2, 4, 8, 16. At 16, six jobs stayed pending while the worker logged "at full capacity" (load 0.74 to 0.83, threshold 0.7). That machine was also running the callers and other work, so the number was the tester's limit, not the agent's.

## Decision

A capacity test, started only from a click on an agent, never on a schedule.

- Before it starts, the server checks the agent is idle; it stops if a room it did not create gets the agent.
- It ramps 1, 2, 4 and so on up to the chosen maximum, about 60 s per step, each caller speaking a fixed script so speech to text, the model and the voice provider all run.
- A step fails when a job stays pending 10 s, the join passes the join threshold, answer time rises more than 50% above the one-call step, a job fails, or the tester's own CPU or network is saturated. The answer budget is not a stop rule: in the spike the agent answered in about 3.5 s with one call and with ten, so an absolute budget would have stopped at step 1 and measured quality, not capacity. The result is the last step every call passed, labelled with what limited it.
- Join slower than the threshold within a passing step is reported separately: it means the worker had to start new processes.
- On LiveKit Cloud the result is per replica, and a Build plan's 5-session cap is reported as the plan's limit.
- Test rooms are named `vg-capacity-*`, have a 60 s empty timeout and never count in Calls, Issues or Alerts. The dialog shows the calls and audio minutes it will use; no price (0010).

## Consequences

- The run needs the Phase 2 server. Until then the console shows the button, the idle check from captured data, the plan and the one real run, with Start disabled.
- This is the one place VoiceGateway adds load to an agent on purpose. It does not touch real calls, which keeps principle 4 ("never in the call path") intact, but a production agent shares its capacity with the test while it runs; the dialog says so.
- PRODUCT.md lists it as a capability.
