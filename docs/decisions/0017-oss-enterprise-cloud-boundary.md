# 0017: The line between OSS, Enterprise and Cloud

- Status: accepted
- Date: 2026-10-14

## Context

Decision 0001 split the license: MIT outside `ee/`, a commercial Enterprise license inside it. It left open which features go where, how the private cloud repository relates to the public one, and how a self-hosting company pays for Enterprise features. Settings is the first screen that has to know the answer.

Langfuse, PostHog and SigNoz draw the same line: the whole product is free, and the paid tiers add what an organisation's security or IT team needs, limits, support and hosting. Langfuse keeps its `ee/` code in the public repository and unlocks it with a license key; multiple organisations and projects are free there.

## Options

1. Free product, paid governance: everything one developer needs is MIT; SSO enforcement, roles, audit log, multiple organisations and similar features are Enterprise; Cloud is the same product hosted.
2. Also gate multiple projects behind Enterprise: more to sell, but a team with staging and production would need two installs or a key, against principle 1 (one command to run it).

## Decision

Option 1.

| Feature | OSS (MIT) | Enterprise (license key) | Cloud |
|---|---|---|---|
| Call trace, recordings, media server, SIP, egress, ingress, agents, live view, checks, tags, MCP, one-variable connect | yes | yes | yes |
| Multiple LiveKit projects, login and API keys for one team, retention per project, thresholds | yes | yes | yes |
| Usage and scale limits | none | none | priced by usage |
| Multiple organisations (one instance, isolated customers) | no | yes | yes |
| Members and roles per project | everyone is admin | yes | yes |
| SSO and SAML with enforcement, SCIM | no | yes | yes |
| Audit log, advanced retention and PII masking policies | no | yes | yes |
| Ingestion limits per API key and per project | no | yes | yes |
| Organisation and instance management API, white-label | no | yes | yes |
| Embeddable widgets with embed tokens and allowed origins (0023) | yes | yes | yes |
| Embed tokens scoped to one end customer, widgets without VoiceGateway branding (0023) | no | yes | yes |
| Support with an SLA | community | yes | yes |
| Hosting, backups, upgrades | no | no | yes |

Repositories:

- `mahimailabs/voicegateway` (public) holds every product feature, free and Enterprise. Enterprise code lives in `ee/` directories under the Enterprise license: readable, but production use needs a key. One binary and one image serve everyone.
- `voicegateway-cloud` (private) holds no product features: infrastructure, operations, the control plane (sign-up, organisation provisioning, billing) and license issuing. It runs the public image pinned by tag and digest, bumped by a pull request on each release, and talks to VoiceGateway only through its API, MCP and configuration. Go's `internal/` rule keeps it from importing product code.

License keys:

- A key is a signed document (Ed25519) naming the customer, the Enterprise features, the limits (organisations, seats) and the expiry. The binary carries only the public key and verifies offline. It is set in Settings or as an environment variable.
- After expiry a grace period shows a banner, then Enterprise features turn off. The core keeps running and no data is lost.
- The signing key is a secret: never in any repository.
- Keys are sold from the account area on dash.voicegateway.dev. Sales-led first (invoice, then a key issued by a command-line tool in the private repository); self-serve checkout once customers ask for it. Cloud plans turn Enterprise features on without a key.

## Consequences

- V1 ships no Enterprise code and no keys. `ee/` stays empty until the first Enterprise customer. Cloud ships in V1, sold self-serve (0024).
- Settings shows OSS sections only. Enterprise sections (members and roles, SSO, audit log, organisations, license) come with `ee/`, marked as Enterprise.
- Every product change goes to the public repository first. The cloud repository never patches the product; if it needs a hook, the hook is added upstream.
- Moving a feature across this line needs a new decision.
