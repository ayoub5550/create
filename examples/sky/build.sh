#!/usr/bin/env bash
# Rebuild «لماذا السماء زرقاء؟» (whiteboard). Art, hand and narration are included.
set -euo pipefail
cd "$(dirname "$0")"; R=../..
python3 $R/tools/build/whiteboard.py .
