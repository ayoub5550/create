#!/usr/bin/env bash
# Rebuild «البذرة» from its sources (no API keys needed; narration mp3s are included).
#   bash build.sh            -> proj/ (preview with tools/render/snap.py, render with tools/render/render.sh)
#   bash build.sh --clips    -> also re-download + re-convert the CMU mocap (rewrites film_clips.js)
set -euo pipefail
cd "$(dirname "$0")"; R=../..
[ "${1:-}" = "--clips" ] && python3 $R/tools/mocap/prep_clips.py clips.json film_clips.js
python3 score.py
python3 $R/tools/build/build.py .
