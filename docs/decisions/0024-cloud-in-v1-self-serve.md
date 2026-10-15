# 0024: VoiceGateway Cloud in V1, sold self-serve through Stripe

- Status: accepted
- Date: 2026-10-15

## Context

Decision 0005 made V1 a self-hosted platform and PRODUCT.md listed a hosted service as out of scope, because one builder could not test two delivery shapes in three weeks. On 15 October the plan changed: a team builds V1, and VoiceGateway Cloud ships with it so revenue starts at launch. Revenue has to be automated: a team signs up, pays and gets a workspace with no one from VoiceGateway in the loop.

The private `voicegateway-cloud` repository already has Clerk sign-in, Stripe plans and quotas and an admin plane, but they call the legacy Python engine, which the Go platform replaces (0009).

## Options

1. Self-hosted only, as in 0005: no revenue at launch.
2. Cloud in V1 with assisted onboarding and manual invoicing: least code, but every customer waits for a person and revenue does not scale.
3. Cloud in V1, self-serve: sign-up, Stripe Checkout, usage-based billing, self-service plan changes and cancellation.

## Decision

Option 3. Cloud is the same product, hosted, and a customer goes from sign-up to a paid workspace without anyone from VoiceGateway acting.

## Consequences

- 0005's install shape stands (the platform, no embedded mode); its "self-hosted only" scope is replaced by this decision. PRODUCT.md moves Cloud from out of scope to a V1 capability.
- 0017's line holds: Cloud runs the public image pinned by tag and digest, and the private repository holds only the control plane (sign-up, organisation and project provisioning, billing, license issuing). Any hook it needs, such as a quota check on ingest, is added upstream first.
- Billing: Stripe Checkout for the first payment, the Stripe Customer Portal for card changes, plan changes and cancellation, usage reported to Stripe from VoiceGateway's own counts, and Stripe webhooks as the only thing that changes a workspace's plan. A failed payment gives a grace period, then ingest stops; stored data stays until its retention ends.
- Quotas are enforced in the product: over the plan's allowance, ingest answers with a clear refusal, never a silent drop (principle 3).
- The billing unit and prices are open and are set in Stripe before launch. They are never per audio minute: VoiceGateway stores telemetry, it does not carry audio.
- Release gates added: cross-tenant isolation proved on calls, the live view, recordings, MCP and embeds; key revocation and suspension; payment retries and cancellation; backup and restore. Launch is one region.
- The existing Clerk, Stripe and admin code in `voicegateway-cloud` is reused for its flows and configuration, but its API is rebuilt against the Go API.
- Enterprise licensing (0017) stays off the launch path.
