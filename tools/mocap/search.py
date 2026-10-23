#!/usr/bin/env python3
"""Search the CMU motion-capture index (2,600+ free takes) by keywords.

    python tools/mocap/search.py dig shovel          # any keyword (OR)
    python tools/mocap/search.py --all sad walk      # every keyword (AND)
    python tools/mocap/search.py --subject 79        # list one subject (79/80 = pantomime: daily actions & emotions)

Good subjects to start with: 79 + 80 (pantomime: digging, planting, picking up, cold, happy, sad, ...), 82 (walks incl. sad /
happy / tired), 13-14 (everyday actions, sitting), 26 (bend & pick up), 02 (walk), 09 (run), 05 (dance), 141 (gestures).
CMU: "start with the higher numbered subjects first" (better quality). Data: http://mocap.cs.cmu.edu (free for any use).
"""
import argparse, os, re
HERE = os.path.dirname(os.path.abspath(__file__))

def load():
    rows, subject = [], ""
    for line in open(os.path.join(HERE, "cmu_index.txt"), encoding="utf-8"):
        m = re.match(r"Subject #(\d+) \((.*)\)", line.strip())
        if m: subject = m.group(2); continue
        m = re.match(r"^(\d+_\d+)\t(.*)$", line.rstrip("\n"))
        if m: rows.append((m.group(1), m.group(2), subject))
    return rows

def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("words", nargs="*"); ap.add_argument("--all", action="store_true"); ap.add_argument("--subject")
    a = ap.parse_args(); rows = load(); n = 0
    for take, desc, subj in rows:
        if a.subject and take.split("_")[0] != a.subject.lstrip("0"): continue
        hay = (desc + " | " + subj).lower(); ws = [w.lower() for w in a.words]
        if ws and not ((all if a.all else any)(w in hay for w in ws)): continue
        print(f"{take}\t{desc}\t[{subj}]"); n += 1
    print(f"-- {n} takes")

if __name__ == "__main__":
    main()
