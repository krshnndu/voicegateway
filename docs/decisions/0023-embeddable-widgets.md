# 0023: Embeddable widgets

- Status: accepted
- Date: 2026-10-15

## Context

Teams that build voice AI platforms on LiveKit want to show their own customers how their agents perform, inside their own product. Today they would rebuild VoiceGateway's views or screenshot them. An earlier project (a per-realtor usage widget) showed the shape: a server-minted token, a frame on the customer's site, data scoped to one end customer.

Decision 0017 says V1 ships no Enterprise code, and 0005 keeps V1 self-hosted only. Secure embedding also needs the server: a short-lived token minted server-side, never an API key in the embedding page, and a list of origins allowed to frame the widget.

## Options

1. All of it is Enterprise or Cloud: nothing usable in V1, against the request to have widgets in V1.
2. Widgets are open source; scoping to one end customer and removing the branding are Enterprise.
3. All of it is open source, including per-customer scoping: gives away what platform builders would pay for.

## Decision

Option 2.

| | OSS (MIT) | Enterprise | Cloud |
|---|---|---|---|
| Widgets at `/org/<id>/project/<id>/embed/<widget>`: answer time, calls, one call, turn anatomy, issues | yes | yes | yes |
| Embed tokens (short-lived, read-only, one project) and allowed origins | yes | yes | yes |
| "Powered by VoiceGateway" on every widget | always | removable (white-label, 0017) | always |
| Tokens scoped to one end customer (their calls only) | no | yes | yes |

- A widget is an existing view without the app shell, with `?theme=light|dark`. Links inside a widget open other widgets, never the console.
- A token is read-only, names one project and one widget set, and expires. The page that embeds it asks its own backend, which asks VoiceGateway; the VoiceGateway API key never reaches the browser.
- The server answers widget requests only from allowed origins (`Content-Security-Policy: frame-ancestors`).

## Consequences

- V1 ships the widgets and Settings, Embeds (preview and snippet) from captured data. Tokens and allowed origins arrive with the Phase 2 server; until then the widgets say they are a preview.
- Per-customer scoping needs a customer id on each call (call metadata), which comes with the server and `ee/`.
- PRODUCT.md lists embedding as a capability; 0017's table gains the two Enterprise rows above.
