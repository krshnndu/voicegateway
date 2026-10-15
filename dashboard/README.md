# VoiceGateway dashboard

The Phase 1 console: React 19, TypeScript, Vite, Tailwind v4 and shadcn/ui. It reads captured LiveKit data from `src/mocks/` until the web API exists; see `docs/specs/phase01-console.md`.

```sh
npm install
npm run dev     # Vite dev server
npm run build   # type check, then production build
npm run lint    # oxlint
```

- `src/features/<page>/`: one folder per page.
- `src/components/`: shared pieces. `ui/` is shadcn, `reui/` is vendored ReUI (keep edits minimal), `data-table.tsx` is the list every page uses.
- `public/captures/` and `public/preview/` hold local recordings and are not committed.
