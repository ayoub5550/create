#!/usr/bin/env bash
# Rebuild «حوار» (two talking characters). Voices, lip sync and the shot list are generated, then cached:
#   bash build.sh            -> proj/ (voices only when the text / voice changed; shots.json is kept if it exists)
#   bash build.sh --shots    -> also regenerate shots.json from the dialogue timeline (overwrites hand edits)
#   bash build.sh --clips    -> also re-download + re-convert the CMU mocap (rewrites film_clips.js)
set -euo pipefail
cd "$(dirname "$0")"; R=../..
if [ "${1:-}" = "--clips" ] || [ ! -f film_clips.js ]; then python3 $R/tools/mocap/prep_clips.py clips.json film_clips.js; fi
python3 $R/tools/voice/dialogue.py .
if [ "${1:-}" = "--shots" ] || [ ! -f shots.json ]; then python3 $R/tools/direct/shotlist.py auto . || true
else python3 $R/tools/direct/shotlist.py check shots.json || true; fi
python3 score.py
python3 $R/tools/build/build.py .
