# 0010: Report usage, not prices

- Status: accepted
- Date: 2026-10-11

## Context

0003 priced every modality through voice-prices, a Python package. The Go core (0009) would need to load its catalog and port its matching rules, and prices that drift or guess wrong are the failure users notice first. Usage numbers are exact and come straight from the call.

## Options

1. Keep pricing: port voice-prices matching to Go and keep a parity test.
2. Report usage only: tokens and audio units per modality, no currency.

## Decision

Option 2. V1 records usage only and does not depend on voice-prices.

## Consequences

- Usage per call: LLM input, output and cached tokens; STT audio seconds; TTS characters and seconds.
- A value that is not reported stays unknown, never zero.
- No price tables, cost columns or budget features in V1. Pricing can return later as its own decision.
