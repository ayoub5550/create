#!/usr/bin/env python3
"""Start a new film from one of the examples.

    python tools/new_film.py <slug> --from albidhra|sky|light-speed
Copies examples/<from>/ (sources only, no proj/ or out/) to films/<slug>/. Then edit script.json first, re-voice
(tools/voice/tts.py), and adapt the film/board/kinetic spec. See AGENTS.md §4."""
import argparse, os, shutil, sys
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def main():
    ap = argparse.ArgumentParser(); ap.add_argument("slug"); ap.add_argument("--from", dest="src", default="albidhra",
                                                                              choices=["albidhra", "sky", "light-speed"])
    ap.add_argument("--keep-media", action="store_true", help="keep the example's voice/art (default: drop them)")
    a = ap.parse_args()
    dst = os.path.join(ROOT, "films", a.slug)
    if os.path.exists(dst): sys.exit(f"{dst} exists")
    ign = ["proj", "out", "__pycache__"] + ([] if a.keep_media else ["*.mp3", "tts.json"])
    shutil.copytree(os.path.join(ROOT, "examples", a.src), dst, ignore=shutil.ignore_patterns(*ign))
    print(f"created films/{a.slug} from examples/{a.src}")
    print("next: edit script.json -> python tools/voice/tts.py script.json (run inside the film folder) -> adapt -> build.sh")

if __name__ == "__main__":
    main()
