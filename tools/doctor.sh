#!/usr/bin/env bash
# Check the toolchain.   bash tools/doctor.sh
ok=1
chk() { if command -v "$1" >/dev/null 2>&1; then echo "ok   $1 ($($1 $2 2>&1 | head -1))"; else echo "MISS $1 — $3"; ok=0; fi; }
chk node --version "Node.js >= 20 (HyperFrames)"
chk npx --version "comes with Node.js"
chk ffmpeg -version "apt install ffmpeg / brew install ffmpeg"
chk ffprobe -version "comes with ffmpeg"
chk python3 --version "Python >= 3.10"
python3 - <<'PY'
import importlib
for m, hint in [("numpy", "pip install numpy"), ("scipy", "pip install scipy"), ("PIL", "pip install pillow"),
                ("matplotlib", "pip install matplotlib (mocap contact sheets)"), ("playwright", "pip install playwright && playwright install chromium (previews)"),
                ("edge_tts", "pip install edge-tts (free narration)"), ("faster_whisper", "optional: pip install faster-whisper (local STT check)")]:
    try: importlib.import_module(m); print(f"ok   python:{m}")
    except Exception: print(f"MISS python:{m} — {hint}")
PY
for k in ELEVENLABS_API_KEY OPENAI_API_KEY HF_TOKEN; do
  if [ -n "${!k:-}" ]; then echo "ok   \$$k set"; else echo "info \$$k not set (optional)"; fi
done
[ $ok = 1 ] && echo "doctor: core tools present" || { echo "doctor: install the MISSing core tools"; exit 1; }
