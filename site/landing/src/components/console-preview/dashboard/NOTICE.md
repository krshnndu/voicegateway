These presentational components are adapted from the VoiceGateway OSS dashboard (MIT, Copyright 2026 Mahimai Labs):

- `visuals.tsx`: Overview AnswerGauge and TurnStrip, with keyboard-selectable turns.
- `live-wire.tsx`, `canvas.tsx`, `node.tsx`: Overview Live wire renderers and AI Elements canvas/node primitives. Live beams and tracker rows are omitted for a static capture.
- `capacity.tsx`, `capacity.json`: Agent workers capacity chart and its October 14 feasibility run. No capacity benchmark is claimed.
- `gauge/`: the dashboard's gauge-ui primitives; only dependencies used by the answer gauge are included.
- `chart.tsx`, `tooltip.tsx`, `card.tsx`: the dashboard's shadcn components. Imports are adapted for Next.js.

The website's root LICENSE retains the MIT notice. Capture values are from the same console fixtures; this directory has no dependency on the running dashboard or its API.
