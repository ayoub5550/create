#!/usr/bin/env bash
# Build one part of film1 ("Sam & Layla" Ep. 1). Each part's build.sh calls this:  bash ../../common/build_part.sh <part_dir> [--shots] [--clips]
#   voices (recorded takes in voice_src/, provider "file") -> timeline + lip sync (dialogue.py) -> shots check -> score.py -> proj/
#   --shots  regenerate shots.json from the dialogue (overwrites hand edits)    --clips  re-download + convert the CMU mocap
set -euo pipefail
P="$(cd "$1" && pwd)"; shift; C="$(cd "$(dirname "$0")" && pwd)"; R="$(cd "$C/../../.." && pwd)"
cd "$P"
[ -e cast.json ] || ln -s ../../cast.json cast.json
[ -e template.html ] || ln -s ../../common/template.html template.html
[ -f clips.json ] || cp "$R/examples/hiwar/clips.json" clips.json
if [ "${1:-}" = "--clips" ] || [ ! -f film_clips.js ] || [ clips.json -nt film_clips.js ]; then python3 "$R/tools/mocap/prep_clips.py" clips.json film_clips.js; fi
python3 "$R/tools/voice/dialogue.py" .
if [ "${1:-}" = "--shots" ] || [ ! -f shots.json ]; then python3 "$R/tools/direct/shotlist.py" auto . || true
else python3 "$R/tools/direct/shotlist.py" check shots.json || true; fi
if [ -f score.py ]; then python3 score.py; else echo "no score.py yet (silent mix)"; mkdir -p proj/assets; python3 - <<'PY'
import json, wave
d = json.load(open("timeline.json"))["total"]; n = int(d * 48000)
w = wave.open("proj/assets/mix.wav", "wb"); w.setnchannels(2); w.setsampwidth(2); w.setframerate(48000); w.writeframes(b"\0\0\0\0" * n); w.close()
PY
fi
python3 "$R/tools/build/build.py" .
mkdir -p proj/common && cp "$C"/set.js "$C"/props.js "$C"/kit.js "$C"/paper.png proj/common/
echo "part built: $P/proj  ($(python3 -c 'import json;print(json.load(open("timeline.json"))["total"])') s)"
