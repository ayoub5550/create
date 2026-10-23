#!/usr/bin/env bash
# Rebuild «سرعة الضوء» (kinetic typography, 9:16). Re-voice with: python3 ../../tools/voice/tts.py script.json --rate=-8%
set -euo pipefail
cd "$(dirname "$0")"; R=../..
python3 score.py
python3 $R/tools/build/kinetic.py .
