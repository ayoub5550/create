#!/usr/bin/env bash
# Render a HyperFrames project to MP4.   tools/render/render.sh <proj_dir> <out.mp4> [workers]
# CPU-heavy: ~20-25 s for a 60 s 1080p film on 8 cores; use a big machine. Lint first; stop on any error.
set -euo pipefail
PROJ="$1"; OUT="$(realpath -m "$2")"; WORKERS="${3:-6}"
HF="npx -y hyperframes@${HYPERFRAMES_VERSION:-0.8.190}"
mkdir -p "$(dirname "$OUT")"
cd "$PROJ"
$HF lint
$HF render --quality high --workers "$WORKERS" --output "$OUT"
echo "rendered $OUT"
