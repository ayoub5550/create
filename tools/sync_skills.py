#!/usr/bin/env python3
"""Make the agent-skill folders real copies of skills/ (for checkouts where symlinks do not work, e.g. Windows).

    python tools/sync_skills.py          # .claude/skills and .agents/skills <- copies of skills/
    python tools/sync_skills.py --link   # back to symlinks (macOS / Linux)
skills/ is the source of truth: edit there, then re-run this script if you use copies.
"""
import argparse, os, shutil

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TARGETS = [".claude/skills", ".agents/skills"]


def main():
    ap = argparse.ArgumentParser(); ap.add_argument("--link", action="store_true"); a = ap.parse_args()
    src = os.path.join(ROOT, "skills")
    for rel in TARGETS:
        dst = os.path.join(ROOT, rel); os.makedirs(os.path.dirname(dst), exist_ok=True)
        if os.path.islink(dst) or os.path.isfile(dst): os.remove(dst)
        elif os.path.isdir(dst): shutil.rmtree(dst)
        if a.link: os.symlink(os.path.join("..", "skills"), dst, target_is_directory=True)
        else: shutil.copytree(src, dst)
        print(("linked " if a.link else "copied ") + rel)


if __name__ == "__main__":
    main()
