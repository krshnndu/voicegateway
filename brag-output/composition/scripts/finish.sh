#!/usr/bin/env bash
set -euo pipefail
# Run from brag-output/composition after npm run render.
mkdir -p ../../docs/assets
ffmpeg -y -hide_banner -loglevel error -ss 12.5 -i ../brag.raw.mp4 -frames:v 1 -q:v 2 ../brag.jpg
ffmpeg -y -hide_banner -loglevel error -i ../brag.raw.mp4 -i ../brag.jpg \
  -filter_complex "[0:v][1:v]overlay=0:0:enable='eq(n,0)'[v]" \
  -map '[v]' -map '0:a?' -c:v libx264 -crf 18 -preset slow -pix_fmt yuv420p \
  -c:a copy -movflags +faststart ../brag.mp4
ffmpeg -y -hide_banner -loglevel error -i ../brag.raw.mp4 \
  -vf 'fps=10,scale=960:-1:flags=lanczos,palettegen=max_colors=96:stats_mode=diff' ../palette.png
ffmpeg -y -hide_banner -loglevel error -i ../brag.raw.mp4 -i ../palette.png \
  -filter_complex '[0:v]fps=10,scale=960:-1:flags=lanczos[v];[v][1:v]paletteuse=dither=bayer:bayer_scale=4:diff_mode=rectangle' \
  -loop 0 ../../docs/assets/voicegateway-teaser.gif
ffmpeg -y -hide_banner -loglevel error -i ../brag.jpg -vf 'scale=1280:-1:flags=lanczos' -frames:v 1 -q:v 3 ../../docs/assets/voicegateway-teaser-poster.jpg
python3 - <<'PY'
from pathlib import Path
p=Path('../../docs/assets/voicegateway-teaser.gif')
assert p.stat().st_size <= 5 * 1024 * 1024, 'README GIF exceeds the 5 MiB asset budget'
print(f'GIF: {p.stat().st_size:,} bytes')
PY
