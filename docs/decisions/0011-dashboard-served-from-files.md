# 0011: Serve the dashboard from files in the image

- Status: accepted
- Date: 2026-10-11

## Context

The React dashboard is built by Vite into static files. Something must serve them. Langfuse serves its UI and API from one web container. Prometheus embeds its UI in the Go binary; Grafana ships the files next to the binary.

## Options

1. Embed the built files in the binary with go:embed: UI and API versions can never drift, at the cost of a Go rebuild for every UI change.
2. Copy the built files into the image and have `voicegw web` serve them from disk: still one image, and Go builds do not depend on the UI.
3. A separate UI container: adds a service, CORS and cookie handling.

## Decision

Option 2.

## Consequences

- The Dockerfile builds the dashboard in its own stage and copies the output into the `voicegw` image.
- UI and API share one origin, so no CORS setup.
- Go builds and tests run without the frontend; in development the Vite dev server talks to the API.
