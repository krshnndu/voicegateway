# Console teaser

An 18-second, silent teaser made with the [brag skill](https://github.com/latent-spaces/brag) and Hyperframes **0.8.162**. Its primary output is the looping README GIF, 960 × 600 at 10 fps. The MP4 is 1600 × 1000 at 30 fps.

The film shows the real console from the user's supplied screenshot, then the current wordmark. It is labelled **Console preview** throughout and **OSS + Cloud V1 in progress** at the end. It does not claim a shipped backend or live traffic.

## Rebuild

Requires Node.js 22+, FFmpeg, and Python 3. From this folder:

```bash
cd composition
npm ci
npm run prepare-assets
npm run check
npm run render
npm run finish
```

`finish` extracts the settled Live wire poster at 12.5 seconds, bakes it into MP4 frame zero, and exports the GIF and poster to `docs/assets/`. It fails if the GIF exceeds 5 MiB. Render intermediates, dependencies and duplicate MP4/poster delivery files are ignored by Git.

```bash
npm run preview
# Stop the preview when finished:
npx --yes hyperframes@0.8.162 preview --stop
```

The CLI prints the Studio URL. The HTML source is `composition/index.html`; exact motion intent is checked by `index.motion.json`. The rendered MP4 is `brag.mp4`; the caption is `share-copy.txt`.

## Source pixels

`composition/assets/turns.jpg` and `live-wire.jpg` are direct crops of **Screenshot 2026-10-15 at 7.48.54 AM.png**, a 1905 × 1027 screenshot supplied by the user in this conversation. Crops use original pixel coordinates:

| Asset | x | y | width | height |
| --- | ---: | ---: | ---: | ---: |
| turns.jpg | 515 | 182 | 1136 | 250 |
| live-wire.jpg | 536 | 554 | 1096 | 380 |

The crop omits browser chrome, the former sidebar logo and a browser tooltip. Colors and figures are unchanged; JPEG quality 2 from FFmpeg. No call drawer or issue view was invented when fresh local browser capture was unavailable.

The wordmark is copied from `dashboard/src/assets/brand/wordmark.svg`. Its outlined Inter lettering retains `Inter-OFL.txt`. GSAP **3.14.2** is locked in `package-lock.json` and copied locally by `prepare-assets`; no runtime CDN is needed.

The camera framing adapts the single-world-wrapper approach of Hyperframes' `ui-focus-zoom` registry component. Its source is retained in `composition/compositions/components/` as a reference. The two blue editorial callouts adapt the `vox-annotate` connector reveal and point to actual captured labels. No placeholder UI, halo, filters or simulated cursor interaction are used.

## Validation

The final Hyperframes gate checks runtime, layout, motion and text contrast. The four scene snapshots are visually reviewed, including the final lockup. Linter advice about splitting this four-scene film into sub-compositions and reusing the same logo image is accepted: the film is a small, single deterministic timeline. Screenshot clipping is intentional and explicitly marked.

Source plans: `brag-plan.md` and `composition-brief.md`.
