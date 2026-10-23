#!/usr/bin/env python3
"""Measure whiteboard art: ink bounding box per element (so the reveal serpentine only sweeps inked area) and the
marker nib of the hand image.   python tools/art/art_meta.py proj/assets art_meta.json
Element images: drawing on pure white. Hand: transparent PNG, nib = top-left-most opaque pixel (x + y minimal)."""
import json, os, sys
import numpy as np
from PIL import Image

def main():
    d, out = sys.argv[1], sys.argv[2]; M = {}
    for f in sorted(os.listdir(d)):
        if not f.endswith(".png"): continue
        k = f[:-4]; im = Image.open(os.path.join(d, f))
        if k == "hand":
            a = np.array(im.convert("RGBA"))[:, :, 3]; ys, xs = np.nonzero(a > 200); i = np.argmin(xs + ys)
            M[k] = {"w": im.width, "h": im.height, "nib": [int(xs[i]), int(ys[i])]}
        else:
            g = np.array(im.convert("L")); ys, xs = np.nonzero(g < 235)
            M[k] = {"w": im.width, "h": im.height, "bbox": [int(xs.min()), int(ys.min()), int(xs.max()), int(ys.max())]}
        print(k, M[k])
    json.dump(M, open(out, "w"))

if __name__ == "__main__":
    main()
