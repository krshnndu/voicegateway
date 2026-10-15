# Call-flow artwork

The layout lives in [`../voicegateway-flow.reladraw`](../voicegateway-flow.reladraw). Reladraw computes the positions and routes. `build.mjs` applies seeded Rough.js ink and outlines Kalam lettering for a standalone, GitHub-safe SVG. It embeds accessible text labels and a description.

```sh
cd docs/assets/flow-source
npm ci
npm run build
```

Kalam is by Indian Type Foundry under the included SIL Open Font License. No font or JavaScript needs to load when the SVG is displayed.

The checked-in font is a subset: printable ASCII plus the middle dot used by this diagram. It keeps the original glyph outlines and layout features, reducing the font from 426,488 bytes to fit the repository's asset limit. To recreate it from the full Kalam Regular font, run:

```sh
uvx --from fonttools==4.60.1 pyftsubset /path/to/full/Kalam-Regular.ttf \
  --output-file=Kalam-Regular.ttf --unicodes=U+0020-007E,U+00B7 \
  --layout-features='*' --glyph-names --symbol-cmap --legacy-cmap \
  --notdef-glyph --notdef-outline --recommended-glyphs \
  --name-IDs='*' --name-legacy --name-languages='*'
```

Rebuild the SVG after changing the source; add characters to the subset if new labels need them.
