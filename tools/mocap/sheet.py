#!/usr/bin/env python3
"""Stick contact sheet of mocap clips — look at it before using a clip (wrong view / T-pose / drift show up at once).

    python tools/mocap/sheet.py out.png proj/film_clips.js            # every clip in a film_clips.js
    python tools/mocap/sheet.py out.png a.json b.json                 # raw bvh2clip outputs
Red = right limbs, blue = left limbs, green line = ground. Frame numbers above each pose."""
import json, sys, matplotlib
matplotlib.use("Agg"); import matplotlib.pyplot as plt
B = [("hips", "chest"), ("chest", "neck"), ("neck", "head"), ("shR", "elR"), ("elR", "haR"), ("shL", "elL"), ("elL", "haL"),
     ("hips", "knR"), ("knR", "ftR"), ("hips", "knL"), ("knL", "ftL")]

def load(paths):
    out = []
    for p in paths:
        if p.endswith(".js"):
            s = open(p).read(); d = json.loads(s[s.index("=") + 1:].rstrip().rstrip(";"))
            out += [(k, v) for k, v in d.items()]
        else:
            out.append((p, json.load(open(p))))
    return out

def main():
    out, items, N = sys.argv[1], load(sys.argv[2:]), 12
    fig, axs = plt.subplots(len(items), 1, figsize=(24, 2.6 * len(items)))
    axs = [axs] if len(items) == 1 else axs
    for ax, (name, c) in zip(axs, items):
        F = c["frames"]; n = len(F); step = max(1, n // N)
        for k, fi in enumerate(range(0, n, step)):
            f = F[fi]; ox = k * 450 - f["hips"][0]; g = f.get("g", 0)
            for a, b in B:
                col = "r" if a.endswith("R") or b.endswith("R") else ("b" if a.endswith("L") or b.endswith("L") else "k")
                ax.plot([ox + f[a][0], ox + f[b][0]], [-(f[a][1] + f["rootY"] + g), -(f[b][1] + f["rootY"] + g)], col, lw=1.5)
            ax.plot(ox + f["head"][0], -(f["head"][1] + f["rootY"] + g), "ko", ms=8)
            ax.text(k * 450, -c["groundY"] - 60, str(fi), fontsize=8)
        ax.axhline(-c["groundY"], color="g", lw=.5)
        extra = f" cycle={c['cycle']}" if "cycle" in c else ""
        ax.set_title(f"{name} n={n}{extra}", fontsize=9, loc="left"); ax.set_aspect("equal"); ax.axis("off")
    plt.tight_layout(); plt.savefig(out, dpi=55); print(out)

if __name__ == "__main__":
    main()
