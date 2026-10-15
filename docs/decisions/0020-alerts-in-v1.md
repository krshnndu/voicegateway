# 0020: Alerts in V1, built on the existing checks

- Status: accepted
- Date: 2026-10-14

## Context

PRODUCT.md left alerting out of V1: users would keep their existing alerting. Since then the console runs checks across the whole LiveKit stack (calls, agents, SIP, media server, egress, ingress), each one grounded in data VoiceGateway already reads. The owner wants those checks to notify the team, with notification channels connected under Settings, Integrations.

## Options

1. Keep alerting out of V1: less to build, but every check stays a screen someone has to open.
2. Alerts in V1, as rules over the existing checks, sent to common channels.

## Decision

Option 2. An alert rule is one of the console's checks plus where to send it. Channels: Slack, Microsoft Teams, Discord, PagerDuty, Opsgenie, email and a generic webhook. This replaces the "Alerting" line in PRODUCT.md's out of scope; call scoring stays out.

## Consequences

- A top-level Alerts page lists the rules, what each would have fired on in the captured data, and the recent events.
- Settings, Integrations has a Notifications group for the channels.
- Sending runs in the Phase 2 worker. In Phase 1, channel setup is kept in the browser and nothing is sent; the pages say so.
- Thresholds in Settings drive the alert conditions, so a rule and a check never disagree.
- Alerts are part of the open-source edition (decision 0017).
