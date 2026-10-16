# Website UI rules

- Use prebuilt components first: shadcn/ui, Magic UI, Chakra UI, or a suitable established registry. Adapt their source and compose them; do not build replacement controls from raw HTML and CSS.
- Use the installed shadcn primitives in `src/components/ui` for buttons, inputs, selectors, segmented controls, menus, and disclosures.
- Use Phosphor icons consistently, including GitHub and navigation icons. Server components import from `@phosphor-icons/react/dist/ssr`.
- Keep the actual console visuals and captured-data caveats. Do not invent telemetry or animate numeric readouts through fabricated values.
- Reuse the existing motion stack, and respect reduced-motion preferences.
- Keep visible copy about VoiceGateway. Never describe the site as inspired by another brand or name another brand's design system in UI copy.
- Turn inspection stays inline beside its visualization. Use the installed wheel picker, preserving its keyboard and reduced-motion adaptations.
