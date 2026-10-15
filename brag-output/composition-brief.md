# Hyperframes composition brief: VoiceGateway

Create the 18-second landscape console teaser described in `brag-plan.md`. Deliver `brag.mp4`, `brag.jpg`, and a 960-pixel-wide looping GIF at `../docs/assets/voicegateway-teaser.gif`.

## Sources

- Product truth: `../PRODUCT.md`, `../ARCHITECTURE.md`, `../docs/progress.md`.
- Visual truth: `../DESIGN.md`, `../dashboard/src/components/brand-wordmark.css`.
- UI: the user-provided screenshot of the already built local console (15 October 2026, 07:48), copied into `composition/assets/`.
- Logo: `../dashboard/src/assets/brand/wordmark.svg`.

## Copy

1. Why was that call slow?
2. Follow the call.
3. Every turn. One view.
4. Phone line. Media server. Agent. Models.
5. Follow the call. Find the cause.
6. Console preview · OSS + Cloud V1 in progress

Use actual captured interface images. Retain “Console preview” on every scene. Data in screenshots is captured fixture content; do not turn those figures into marketing claims. Cloud V1 is in progress, and the video must say so.

## Direction

Polished developer film. The white/soft-grey console is the hero, with blue used only as one signal. Use the actual Mergepoint wordmark. Type and UI occupy the image with clear hierarchy. All motion is seekable: short entrances, deliberate framing, readable holds. Keep the same screenshot element alive during a reframe. Add two restrained editorial callouts at the settled Live wire frame, pointing to the measured hop and the “not reported” state without changing captured values. No imitation browser chrome, generic abstract filler, gradients, or fake cursor interaction.

## Audio

Intentionally silent because the primary output is a README GIF. No voice request was made. Music cues, audio-reactive treatment, and SFX are inapplicable.

## Build and validation

Use Hyperframes 0.8.162, a single paused GSAP timeline, and local runtime/media assets. Follow core, animation, creative, keyframes, and CLI contracts. Search the motion catalog before authoring. Run `hyperframes check`, inspect proof snapshots, run keyframe diagnostics, and render directly because the user asked for the finished GIF. Extract a settled product poster and bake it as MP4 frame zero. Preserve source HTML, asset provenance, exact pinned dependencies, and rebuild commands.
