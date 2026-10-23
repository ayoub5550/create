#!/usr/bin/env python3
"""Build a whiteboard (VideoScribe-style) explainer from a declarative board.json.

    python tools/build/whiteboard.py <film_dir>
Reads <film_dir>/board.json, tts.json, art_meta.json and templates/whiteboard/template.html,
writes <film_dir>/proj/index.html (+ fonts). Images: <film_dir>/art/<key>.png and art/hand.png (copied to proj/assets/),
narration: <film_dir>/assets/voice/<id>.mp3 (copied too). proj/ is a build output.

board.json
{
  "vo":     {"s1": 0.9, "s2": 7.2, ...},                 # narration start time of each script line (seconds)
  "grid":   {"cell": [1920, 1080], "gap": 240},          # the mural: scenes are screens laid out on a big canvas
  "scenes": {"s1": [0, 3], "s2": [0, 2], ...},           # scene -> [row, col]  (Arabic: start at the RIGHT column)
  "elements": {"el1": {"scene": "s1", "x": 330, "y": 230, "w": 1260}, ...},     # image placement inside its scene
  "labels": {"l1": {"scene": "s1", "cx": 960, "top": 30, "size": 128, "html": "لماذا <span class=\\"blue\\">زرقاء؟</span>"},
             "l7b": {"at": [x, y], "size": 96, "html": "Rayleigh", "font": "en"}},  # "at" = world coords, font ar|en
  "points": {"s7c": [2040, 1860]},                       # optional named world points for camera targets / labels
  "actions": [
    ["draw",  "el1", 0.35, "s1@4-0.1"],                  # reveal image between two times (hand rides the stroke)
    ["label", "l1", "s1@4", 1.7],                        # write a label: start, duration
    ["cam",   "s2", 1.0, 5.2],                           # camera to scene|point|[x,y]|"mid:s4,s5"|"mural", dur, at
    ["cam",   "mid:s4,s5", 0.8, 30.6, 0.42, "power2.in"] # ... optional zoom scale and GSAP ease
  ],
  "tail": 1.6                                            # seconds after the last line ends
}
Times: a number, or "s2@7" = start of word 7 (0-based) of line s2 (from tts.json), "s2@7e" = its end, "+/-x" offsets.
Rules: each element finishes on its keyword; labels start on their spoken word; camera locked between moves;
the hand is visible only while drawing; end with a pull-back to the whole mural ("mural").
"""
import json, math, os, re, shutil, sys
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

def main():
    d = os.path.abspath(sys.argv[1]); B = json.load(open(os.path.join(d, "board.json")))
    tts = json.load(open(os.path.join(d, "tts.json"))); meta = json.load(open(os.path.join(d, "art_meta.json")))
    CW, CH = B["grid"]["cell"]; GAP = B["grid"]["gap"]; A = B["vo"]
    SC = {k: (c * (CW + GAP), r * (CH + GAP)) for k, (r, c) in B["scenes"].items()}
    rows = 1 + max(r for r, c in B["scenes"].values()); cols = 1 + max(c for r, c in B["scenes"].values())
    WW, WH = cols * CW + (cols - 1) * GAP, rows * CH + (rows - 1) * GAP
    P = {k: tuple(v) for k, v in B.get("points", {}).items()}

    def T(x):
        if isinstance(x, (int, float)): return float(x)
        m = re.fullmatch(r"\s*(\w+)@(\d+)(e?)\s*([+-]\s*[\d.]+)?\s*", x)
        if not m: raise SystemExit(f"bad time {x!r}")
        w = tts[m.group(1)]["words"][int(m.group(2))]["timestamp"][1 if m.group(3) else 0]
        return A[m.group(1)] + w + (float(m.group(4).replace(" ", "")) if m.group(4) else 0.0)

    def centre(s): x0, y0 = SC[s]; return (x0 + CW / 2, y0 + CH / 2)

    def target(t):
        if isinstance(t, list): return tuple(t)
        if t in SC: return centre(t)
        if t in P: return P[t]
        if t.startswith("mid:"):
            a, b = [target(v) for v in t[4:].split(",")]; return ((a[0] + b[0]) / 2, (a[1] + b[1]) / 2)
        if t == "mural": return (WW / 2, WH / 2)
        raise SystemExit(f"unknown camera target {t!r}")

    acts = []
    fit = round(min(1920 / (WW + 300), 1080 / (WH + 250)), 4)
    for a in B["actions"]:
        if a[0] == "draw":
            s, e = T(a[2]), T(a[3])
            acts.append(f'tl.set("#{a[1]}", {{autoAlpha:1}}, {s - 0.02:.2f}); draw("c-{a[1]}", "{a[1]}", {e - s:.2f}, {s:.2f});')
        elif a[0] == "label":
            acts.append(f'drawLbl("#{a[1]}", {T(a[2]):.2f}, {float(a[3]):.2f});')
        elif a[0] == "cam":
            x, y = target(a[1]); sc = a[4] if len(a) > 4 else (fit if a[1] == "mural" else 1); ease = a[5] if len(a) > 5 else "power2.inOut"
            acts.append(f'camTo({x}, {y}, {sc}, {float(a[2])}, {T(a[3]):.2f}, "{ease}");')
    last = max(A, key=lambda k: A[k]); TOTAL = round(A[last] + tts[last]["dur"] + B.get("tail", 1.6), 2)

    HAND_W = B.get("hand_width", 720); hm = meta.get("hand", {"w": 1024, "h": 1536, "nib": [28, 33]})
    HK = HAND_W / hm["w"]; NIB = (hm["nib"][0] * HK, hm["nib"][1] * HK); SW = 150
    art_html, chunk_js, arts_js = [], [], []
    for k, e in B["elements"].items():
        m = meta[k]; iw, ih = m["w"], m["h"]; kk = e["w"] / iw; dh = round(ih * kk)
        x0, y0 = SC[e["scene"]]; wx, wy = x0 + e["x"], y0 + e["y"]
        art_html.append(f'''<div class="artblock" id="{k}" style="left:{wx}px;top:{wy}px;width:{e["w"]}px;height:{dh}px;">
  <svg width="{e["w"]}" height="{dh}" viewBox="0 0 {iw} {ih}"><defs><mask id="mk-{k}" maskUnits="userSpaceOnUse" x="-200" y="-200" width="{iw + 400}" height="{ih + 400}"><rect x="-200" y="-200" width="{iw + 400}" height="{ih + 400}" fill="#000"></rect></mask></defs>
  <image href="assets/{k}.png" x="0" y="0" width="{iw}" height="{ih}" mask="url(#mk-{k})"></image></svg></div>''')
        bx0, by0, bx1, by1 = m["bbox"]; pad = 50; r = [bx0 - pad, by0 - pad, bx1 + pad, by1 + pad]
        nrows = max(2, math.ceil((r[3] - r[1] - SW) / SW) + 1)
        chunk_js.append(f'chunk("mk-{k}", "c-{k}", {r}, {nrows}, {SW});')
        arts_js.append(f'{k}: {{x:{wx}, y:{wy}, k:{kk:.5f}}},')
    lbl_html = []
    for k, l in B["labels"].items():
        if "at" in l: cx, top = l["at"]
        elif "point" in l: cx, top = P[l["point"]][0] + l.get("dx", 0), P[l["point"]][1] + l.get("dy", 0)
        else: cx, top = SC[l["scene"]][0] + l["cx"], SC[l["scene"]][1] + l["top"]
        lbl_html.append(f'<div class="lbl {l.get("font", "ar")}" id="{k}" style="left:{cx}px;top:{top}px;font-size:{l["size"]}px;">{l["html"]}</div>')
    audio = "\n".join(f'<audio id="vo-{s}" src="assets/voice/{s}.mp3" data-start="{A[s]}" data-duration="{tts[s]["dur"]:.3f}" data-track-index="2" data-volume="1"></audio>' for s in A)
    if B.get("music"): audio += f'\n<audio id="bed" src="{B["music"]}" data-start="0" data-duration="{TOTAL}" data-track-index="3" data-volume="1"></audio>'
    first = B["actions"][0][1] if B["actions"][0][0] != "cam" else list(SC)[0]
    s0 = B["elements"][first]["scene"] if first in B["elements"] else list(SC)[0]
    x1, y1 = centre(s0)
    html = open(os.path.join(ROOT, "templates", "whiteboard", "template.html"), encoding="utf-8").read()
    rep = {"%TOTAL%": str(TOTAL), "%ART%": "\n".join(art_html), "%LABELS%": "\n".join(lbl_html), "%AUDIO%": audio,
           "%ARTS%": "\n".join(arts_js), "%CHUNKS%": "\n".join(chunk_js), "%ACTS%": "\n".join(acts),
           "%NIBX%": f"{NIB[0]:.1f}", "%NIBY%": f"{NIB[1]:.1f}", "%HANDW%": str(HAND_W), "%HANDH%": str(round(hm["h"] * HK)),
           "%CAM0%": f"{x1}, {y1}, 1", "%ALLART%": json.dumps(["#" + k for k in B["elements"]]),
           "%ALLLBL%": json.dumps(["#" + k for k in B["labels"]]), "%CAMW%": str(WW), "%CAMH%": str(WH)}
    for k, v in rep.items(): html = html.replace(k, v)
    os.makedirs(os.path.join(d, "proj"), exist_ok=True)
    open(os.path.join(d, "proj", "index.html"), "w", encoding="utf-8").write(html)
    shutil.copytree(os.path.join(ROOT, "assets", "fonts"), os.path.join(d, "proj", "fonts"), dirs_exist_ok=True)
    if os.path.isdir(os.path.join(d, "art")): shutil.copytree(os.path.join(d, "art"), os.path.join(d, "proj", "assets"), dirs_exist_ok=True)
    if os.path.isdir(os.path.join(d, "assets")): shutil.copytree(os.path.join(d, "assets"), os.path.join(d, "proj", "assets"), dirs_exist_ok=True)
    print("built", os.path.join(d, "proj", "index.html"), "duration", TOTAL, "s")

if __name__ == "__main__":
    main()
