# 0021: An Issues page, and the nav grouped by task

- Status: accepted
- Date: 2026-10-14

## Context

Each call drawer, the Agent workers page and the Phone bridge page run their own checks. A pattern across calls (replies cut off on three calls) shows up only one call at a time. The left nav mixed a project page, the call pages and the alerts in one ungrouped list, under an "Infrastructure" label that hid that these are LiveKit services.

## Options

1. Leave the checks per page.
2. An Issues page that groups the existing findings across calls and components; no new measurement.
3. Issues plus user-built Dashboards in V1.

## Decision

Option 2. Issues reuses `findingsFor` and the page checks, so a count on Issues always matches the page it links to. Dashboards (saved charts over calls and turns) wait until after launch: they need a query layer V1 does not have.

The nav becomes:

- Overview
- Observe: Live, Calls, Issues, Alerts
- Agents: Agent workers
- LiveKit: Media server, Phone (SIP), Egress, Ingress
- Settings and Documentation at the bottom

The project page moves to the project switcher, which already names the project.

## Consequences

- PRODUCT.md lists Issues as V1 capability 7.
- A new check appears on Issues with no extra work; a check that should not group by title must give itself a stable id.
- Alerts and Issues share their checks; Alerts adds where to send them (0020).
