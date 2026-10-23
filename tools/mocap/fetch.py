#!/usr/bin/env python3
"""Download CMU BVH takes (cached).   python tools/mocap/fetch.py 82_10 79_04 ... [--dir mocap_cache]
Source: github.com/una-dinosauria/cmu-mocap (BVH conversion of the CMU database, 120 fps, frame 0 = T-pose)."""
import argparse, os, urllib.request
URL = "https://raw.githubusercontent.com/una-dinosauria/cmu-mocap/master/data/{subj:03d}/{take}.bvh"
DEFAULT_DIR = os.environ.get("CREATE_MOCAP_CACHE", os.path.expanduser("~/.cache/create/cmu"))

def fetch(take, d=DEFAULT_DIR):
    os.makedirs(d, exist_ok=True)
    dst = os.path.join(d, f"{take}.bvh")
    if not os.path.exists(dst) or os.path.getsize(dst) < 1000:
        url = URL.format(subj=int(take.split("_")[0]), take=take)
        urllib.request.urlretrieve(url, dst + ".part"); os.replace(dst + ".part", dst)
    return dst

if __name__ == "__main__":
    ap = argparse.ArgumentParser(); ap.add_argument("takes", nargs="+"); ap.add_argument("--dir", default=DEFAULT_DIR)
    a = ap.parse_args()
    for t in a.takes: print(fetch(t, a.dir))
