#!/usr/bin/env python3
"""Convert a 3D BVH motion-capture take into a compact 2D "clip" JSON for the stick-figure engine.

    python tools/mocap/bvh2clip.py in.bvh out.json [--view side|front|travel] [--vframe N]
                                   [--start N] [--max N] [--fps 30] [--keep-drift] [--flip]

Views:
  side    profile view computed from the actor's own hip line at frame --vframe (best for in-place actions)
  travel  profile view along the root's travel direction (best for walks / runs)
  front   facing the camera
  (none)  raw X (or --horiz z) axis as the screen horizontal

Output (pixels, y down): {name, fps, height, groundY, frameCount, frames:[{rootY, hips:[x,y], chest, neck, head,
  shR, elR, haR, shL, elL, haL, hipR, knR, ftR, hipL, knL, ftL}]}
  Joint x is relative to the current hips x (in place) unless --keep-drift, then relative to the first frame's hips x
  (so the clip carries real travel and feet do not slide). Joint y is relative to the hips; rootY is the vertical
  root motion. Every clip of the same skeleton is scaled identically (figure height = 520 px at rest).
Works with CMU, Mixamo and most BVH skeletons (extend ALIAS for others). Pure Python + numpy. MIT.
"""
import argparse, json, math, os, sys
import numpy as np

ALIAS = {
    "hips": ["Hips", "mixamorig:Hips", "Hip", "pelvis", "Pelvis"],
    "chest": ["Spine3", "Spine2", "Spine1", "Chest", "Spine", "mixamorig:Spine2", "mixamorig:Spine1"],
    "neck": ["Neck", "Neck1", "mixamorig:Neck"], "head": ["Head", "mixamorig:Head"],
    "shR": ["RightArm", "RightShoulder", "mixamorig:RightArm"], "elR": ["RightForeArm", "mixamorig:RightForeArm"],
    "haR": ["RightHand", "mixamorig:RightHand"],
    "shL": ["LeftArm", "LeftShoulder", "mixamorig:LeftArm"], "elL": ["LeftForeArm", "mixamorig:LeftForeArm"],
    "haL": ["LeftHand", "mixamorig:LeftHand"],
    "hipR": ["RightUpLeg", "RightHip", "mixamorig:RightUpLeg"], "knR": ["RightLeg", "mixamorig:RightLeg"],
    "ftR": ["RightFoot", "mixamorig:RightFoot"],
    "hipL": ["LeftUpLeg", "LeftHip", "mixamorig:LeftUpLeg"], "knL": ["LeftLeg", "mixamorig:LeftLeg"],
    "ftL": ["LeftFoot", "mixamorig:LeftFoot"],
}
FIG_HEIGHT = 520.0


class Joint:
    def __init__(self, name, parent, is_end=False):
        self.name, self.parent, self.is_end = name, parent, is_end
        self.offset = np.zeros(3)
        self.channels, self.children = [], []


def parse_bvh(path):
    lines = [l.strip() for l in open(path, encoding="utf-8", errors="replace").read().replace("\r", "").split("\n")]
    i = 0
    joints = []

    def parse_joint(parent):
        nonlocal i
        line = lines[i]; i += 1
        is_end = line.startswith("End")
        name = (parent.name + "_end") if is_end else line.split()[1]
        j = Joint(name, parent, is_end); joints.append(j)
        i += 1  # "{"
        while i < len(lines):
            t = lines[i]
            if t.startswith("OFFSET"):
                j.offset = np.array([float(v) for v in t.split()[1:4]]); i += 1
            elif t.startswith("CHANNELS"):
                j.channels = t.split()[2:]; i += 1
            elif t.startswith("JOINT") or t.startswith("End"):
                j.children.append(parse_joint(j))
            elif t.startswith("}"):
                i += 1; break
            else:
                i += 1
        return j

    while i < len(lines) and not lines[i].startswith("ROOT"):
        i += 1
    root = parse_joint(None)
    while i < len(lines) and not lines[i].startswith("Frames:"):
        i += 1
    n_frames = int(lines[i].split(":")[1]); i += 1
    frame_time = float(lines[i].split(":")[1]); i += 1
    motion = []
    for _ in range(n_frames):
        if i >= len(lines): break
        vals = lines[i].split(); i += 1
        if len(vals) > 1: motion.append([float(v) for v in vals])
    return root, joints, np.array(motion), frame_time


def rot(axis, deg):
    a = math.radians(deg); c, s = math.cos(a), math.sin(a)
    if axis == "X": return np.array([[1, 0, 0], [0, c, -s], [0, s, c]])
    if axis == "Y": return np.array([[c, 0, s], [0, 1, 0], [-s, 0, c]])
    return np.array([[c, -s, 0], [s, c, 0], [0, 0, 1]])


def make_fk(root, joints):
    chan_joints = [j for j in joints if not j.is_end]
    slices, k = {}, 0
    for j in chan_joints:
        slices[j.name] = (k, k + len(j.channels)); k += len(j.channels)

    def fk(frame):
        pos = {}

        def recur(j, pR, pT):
            world = pR @ j.offset + pT
            localR = np.eye(3); rootT = None
            if not j.is_end:
                a, b = slices[j.name]; vals = frame[a:b]
                for ch, v in zip(j.channels, vals):
                    if ch.endswith("position"):
                        if rootT is None: rootT = np.zeros(3)
                        rootT["XYZ".index(ch[0])] = v
                    else:
                        localR = localR @ rot(ch[0], v)
            my = rootT + j.offset if rootT is not None else world
            pos[j.name] = my
            gR = pR @ localR
            for c in j.children: recur(c, gR, my)

        recur(root, np.eye(3), np.zeros(3))
        return pos
    return fk


def rest_positions(root):
    pos = {}

    def recur(j, pT):
        w = pT + j.offset; pos[j.name] = w
        for c in j.children: recur(c, w)
    recur(root, np.zeros(3))
    return pos


def convert(path, view=None, vframe=None, start=0, fps=30, keep_drift=False, flip=False, horiz="x", axis="auto",
            max_frames=None, name=None):
    root, joints, motion, frame_time = parse_bvh(path)
    fk = make_fk(root, joints)
    present = {j.name for j in joints}
    JN = {k: next((n for n in al if n in present), al[0]) for k, al in ALIAS.items()}
    missing = [k for k in ALIAS if JN[k] not in present]
    if missing:
        print(f"WARN {path}: unmapped joints {missing} (extend ALIAS)", file=sys.stderr)
    p0 = fk(motion[start])
    spread = [abs(p0[JN["head"]][a] - p0[JN["ftR"]][a]) for a in range(3)]
    up = 1 if spread[1] >= spread[2] else 2
    if axis == "xy": up = 1
    if axis == "zy": up = 2
    up_sign = 1 if (p0[JN["head"]][up] - p0[JN["ftR"]][up]) > 0 else -1
    sgn = -1.0 if flip else 1.0
    H = None
    if view:
        pv = fk(motion[vframe if vframe is not None else start])
        g = [a for a in range(3) if a != up]
        hl = np.array([pv[JN["hipL"]][g[0]] - pv[JN["hipR"]][g[0]], pv[JN["hipL"]][g[1]] - pv[JN["hipR"]][g[1]]])
        lat = hl / (np.linalg.norm(hl) or 1.0)
        if view == "side":
            d = np.array([-lat[1], lat[0]])
        elif view == "front":
            d = -lat
        elif view == "travel":
            pa, pb = fk(motion[start])[JN["hips"]], fk(motion[-1])[JN["hips"]]
            dd = np.array([pb[g[0]] - pa[g[0]], pb[g[1]] - pa[g[1]]]); d = dd / (np.linalg.norm(dd) or 1.0)
        else:
            raise SystemExit(f"unknown view {view}")
        H = (g, d)
    hz = 2 if horiz == "z" else 0

    def proj(P):
        if H:
            g, d = H
            return np.array([sgn * (P[g[0]] * d[0] + P[g[1]] * d[1]), -up_sign * P[up]])
        return np.array([sgn * P[hz], -up_sign * P[up]])

    rest = rest_positions(root)
    ups = [-up_sign * P[up] for P in rest.values()]
    scale = FIG_HEIGHT / (max(ups) - min(ups))
    step = max(1, round((1.0 / frame_time) / fps))
    hips0 = proj(p0[JN["hips"]])
    r1 = lambda v: math.floor(float(v) * 10 + 0.5) / 10  # JS Math.round parity
    frames = []
    for f in range(start, len(motion), step):
        P = fk(motion[f]); h = proj(P[JN["hips"]])
        root_x = hips0[0] if keep_drift else h[0]
        out = {"rootY": r1((h[1] - hips0[1]) * scale)}
        for key, jn in JN.items():
            if jn not in P: continue
            q = proj(P[jn])
            out[key] = [r1((q[0] - root_x) * scale), r1((q[1] - h[1]) * scale)]
        frames.append(out)
    if max_frames and len(frames) > max_frames:
        frames = frames[:max_frames]
    f0 = frames[0]
    ground = max(f0.get("ftR", [0, 0])[1], f0.get("ftL", [0, 0])[1])
    nm = name or os.path.splitext(os.path.basename(path))[0]
    return {"name": nm, "fps": fps, "height": int(FIG_HEIGHT), "groundY": math.floor(ground + 0.5), "frameCount": len(frames),
            "frames": frames}, {"up": up, "upSign": up_sign, "scale": scale}


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("bvh"); ap.add_argument("out")
    ap.add_argument("--view", choices=["side", "front", "travel"])
    ap.add_argument("--vframe", type=int, help="frame used to measure the actor's facing for --view side/front")
    ap.add_argument("--start", type=int, default=0, help="first BVH frame (CMU frame 0 is a T-pose)")
    ap.add_argument("--fps", type=int, default=30)
    ap.add_argument("--keep-drift", action="store_true", help="keep root travel (no foot sliding)")
    ap.add_argument("--flip", action="store_true", help="mirror horizontally")
    ap.add_argument("--horiz", choices=["x", "z"], default="x")
    ap.add_argument("--axis", choices=["auto", "xy", "zy"], default="auto")
    ap.add_argument("--max", type=int, dest="max_frames")
    ap.add_argument("--name")
    a = ap.parse_args()
    clip, info = convert(a.bvh, a.view, a.vframe, a.start, a.fps, a.keep_drift, a.flip, a.horiz, a.axis, a.max_frames, a.name)
    os.makedirs(os.path.dirname(os.path.abspath(a.out)), exist_ok=True)
    json.dump(clip, open(a.out, "w"), separators=(",", ":"))
    print(f"{clip['name']}: {clip['frameCount']} frames @{a.fps}fps up={info['up']}({info['upSign']}) "
          f"scale={info['scale']:.2f} groundY={clip['groundY']}")


if __name__ == "__main__":
    main()
