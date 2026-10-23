#!/usr/bin/env python3
"""Build film_clips.js for the stick-figure engine from a clips manifest.

    python tools/mocap/prep_clips.py clips.json proj/film_clips.js

Manifest (JSON):
{
  "groundY": 262,                       # every clip is normalised to this ground line (clip units)
  "clips": {
    "walk":  {"take": "82_10", "args": {"view": "travel", "start": 40, "keep_drift": true},
              "range": [0, 132], "cycle": {"search": [25, 70], "len": [24, 48]}},
    "pick":  {"take": "26_09", "args": {"view": "side", "vframe": 240, "keep_drift": true},
              "range": [20, 153], "lowHand": true},
    "sit":   {"take": "13_01", "args": {"horiz": "z", "max_frames": 400}, "range": [100, 260]},
    "jump":  {"take": "13_11", "args": {...}, "range": [...], "ground": "const"}   # keep airtime
  }
}
 - take: CMU id (auto-downloaded) or "bvh": "path/to/file.bvh"; args = tools/mocap/bvh2clip.py options.
 - range: clip frames (30 fps, after conversion) to keep.
 - ground "frame" (default): per-frame fix so the lowest foot touches the ground (stops drifting walks);
   "const": no per-frame fix (jumps keep their airtime).
 - cycle: finds a seamless loop (pose-distance search) -> clip.cycle = [a, b] for {loop: true} segments.
 - lowHand: records the frame/hand where a hand is lowest (pick-up / plant moment) -> clip.low, to sync props.
Then check every clip visually:  python tools/mocap/sheet.py sheet.png proj/film_clips.js
"""
import json, os, sys
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
from bvh2clip import convert
from fetch import fetch
J = ["hips", "chest", "neck", "head", "shR", "elR", "haR", "shL", "elL", "haL", "hipR", "knR", "ftR", "hipL", "knL", "ftL"]

def pack(c, frm, to, K0, gmode="frame", gconst=0.0):
    k = K0 / c["groundY"]; out = []
    for f in c["frames"][frm:to]:
        d = {j: [round(f[j][0] * k, 1), round(f[j][1] * k, 1)] for j in J}
        d["rootY"] = round(f["rootY"] * k, 1)
        low = d["rootY"] + max(d["ftR"][1], d["ftL"][1]) - K0
        d["g"] = round(-low if gmode == "frame" else gconst, 1)
        out.append(d)
    return {"fps": c["fps"], "groundY": K0, "side": True, "frames": out}

def lowhand(c):
    best = None
    for i, f in enumerate(c["frames"]):
        for h in ("haR", "haL"):
            y = f["rootY"] + f[h][1] + f["g"]
            if best is None or y > best[0]: best = (y, i, h)
    return {"frame": best[1], "hand": best[2], "y": best[0]}

def cycle(c, lo, hi, mn, mx):
    F = c["frames"]; best = None
    def d(a, b):
        A, B = F[a], F[b]
        return sum((A[j][0] - A["hips"][0] - B[j][0] + B["hips"][0]) ** 2 + (A[j][1] - B[j][1]) ** 2 for j in J if j != "hips")
    for i in range(lo, hi):
        for k in range(i + mn, min(len(F) - 1, i + mx)):
            v = d(i, k) + d(i + 1, k + 1)
            if best is None or v < best[0]: best = (v, i, k)
    return best

def main():
    man, out = sys.argv[1], sys.argv[2]
    M = json.load(open(man)); base = os.path.dirname(os.path.abspath(man)); K0 = float(M.get("groundY", 262))
    C = {}
    for name, spec in M["clips"].items():
        src = os.path.join(base, spec["bvh"]) if "bvh" in spec else fetch(spec["take"])
        raw, _ = convert(src, **spec.get("args", {}))
        a, b = spec.get("range", [0, len(raw["frames"])])
        c = pack(raw, a, b, K0, spec.get("ground", "frame"), spec.get("gconst", 0.0))
        if spec.get("lowHand"): c["low"] = lowhand(c)
        if spec.get("cycle"):
            cy = spec["cycle"]; v = cycle(c, cy["search"][0], cy["search"][1], cy["len"][0], cy["len"][1]); c["cycle"] = [v[1], v[2]]
        C[name] = c
        F = c["frames"]
        print(f"{name:8s} {spec.get('take', spec.get('bvh'))}: {len(F)} frames, drift {round(F[-1]['hips'][0] - F[0]['hips'][0])}"
              + (f", cycle {c['cycle']}" if "cycle" in c else "") + (f", low {c['low']}" if "low" in c else ""))
    os.makedirs(os.path.dirname(os.path.abspath(out)), exist_ok=True)
    open(out, "w").write("window.FILM_CLIPS=" + json.dumps(C, separators=(",", ":")) + ";")

if __name__ == "__main__":
    main()
