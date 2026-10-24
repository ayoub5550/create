#!/usr/bin/env python3
"""Model sheet for a cast (character bible check): line-up at true relative size, the silhouette test (full size and
64 px tall), every mouth shape (lip-sync letters A..H + X) and four expressions per character — drawn by the real engine
(engine/stickfilm.js rig with the cast.json looks), so what you check is exactly what the film will show.

    python tools/render/model_sheet.py films/<slug>/cast.json sheet.png
    python tools/render/model_sheet.py examples/hiwar/cast.json /tmp/hiwar_cast.png

Look at the PNG and ask (skills/character-design): can you name every character from the black 64 px silhouettes?
Do they differ on >= 3 axes (colour, height/head, accessory shape, line weight)? Are all mouth shapes distinct?
cast.json looks used: look.scale (height), look.head (head radius), look.color, look.ink, look.stroke, look.accessories,
look.headFill. Prints console errors (must be none).
"""
import argparse, asyncio, json, os, sys
from playwright.async_api import async_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from snap import chrome  # same browser lookup as the preview tool

PAGE = """<!doctype html><html><head><meta charset="utf-8">
<style>html,body{margin:0;background:#fbfaf6} text{font-family:'Noto Naskh Arabic','Noto Sans Arabic','DejaVu Sans',sans-serif}</style>
<script src="file://%(root)s/engine/stickfilm.js"></script><script src="file://%(root)s/engine/talk.js"></script></head>
<body><svg id="s" xmlns="http://www.w3.org/2000/svg" width="%(W)d" height="%(H)d" viewBox="0 0 %(W)d %(H)d"></svg>
<script>
var CAST = %(cast)s, W = %(W)d, IDS = Object.keys(CAST.characters), SF = StickFilm, el = SF.u.el, svg = document.getElementById("s");
function figure(parent, c, x, ground, opt) {          // a standing figure of character c, feet at (x, ground)
  opt = opt || {}; var L = c.look || {};
  var M = SF.motion({ clips: { stand: SF.standClip() }, scale: L.scale || 0.72, ground: ground,
    segments: [{ t0: 0, t1: 10, clip: "stand", hold: 0, f: opt.f || 1 }], anchor: { seg: 0, x: x, edge: "start" } });
  var J = M.joints(0); if (opt.pose) Talk.pose(M, J, opt.pose, 1, null, 0);
  var R = SF.rig(parent, { scale: L.scale || 0.72, head: L.head || 46, ink: L.ink || "#2b2a28", color: L.color, stroke: L.stroke,
    headFill: L.headFill, accessories: L.accessories || [], backInk: "#5a5751", expr: [[0].concat(opt.expr || [0.35, 0, 1])],
    mouth: opt.mouth ? function () { return opt.mouth; } : null, mouthFill: "#8e352d", seed: 1, lineComp: opt.zoom ? 0.6 : 0 });
  R.set(J, 0, { zoom: opt.zoom || 1 }); return { R: R, J: J };
}
function label(x, y, s, size, col) { var t = el("text", { x: x, y: y, "text-anchor": "middle", "font-size": size || 26, fill: col || "#2b2a28" }, svg); t.textContent = s; return t; }
var n = IDS.length, colW = Math.min(420, (W - 200) / n), x0 = W / 2 - colW * (n - 1) / 2;
label(W / 2, 46, "%(title)s", 30);
// 1. line-up (true relative size) + names + colour chips
IDS.forEach(function (id, i) {
  var c = CAST.characters[id], x = x0 + i * colW; figure(svg, c, x, 470);
  label(x, 520, (c.name || id) + "  (" + id + ")", 28);
  el("rect", { x: x - 40, y: 536, width: 80, height: 18, rx: 4, fill: (c.look || {}).color || "#999" }, svg);
  label(x, 580, ((c.voice || {}).voice || "") + " " + ((c.voice || {}).rate || "") + " " + ((c.voice || {}).pitch || ""), 18, "#6b6863");
});
// 2. silhouettes: full size and 64 px tall (the thumbnail test)
var sil = el("g", { style: "filter: brightness(0)" }, svg);
IDS.forEach(function (id, i) { figure(sil, CAST.characters[id], x0 + i * colW, 960); });
label(W / 2, 1000, "silhouette test — every character must be nameable in black (centre) and at ~64 px (left)", 20, "#6b6863");
var small = el("g", { transform: "translate(30 700) scale(0.17)", style: "filter: brightness(0)" }, svg);
IDS.forEach(function (id, i) { figure(small, CAST.characters[id], 300 + i * 420, 960); });
// 3. per character: expressions + all mouth shapes, heads only (clipped)
var EX = [["calm", [0.35, 0, 1]], ["joy", [0.95, 0.6, 1.2]], ["sad", [-0.6, 0.9, 0.95]], ["stubborn", [-0.3, -0.9, 0.95]]];
var MO = ["X", "A", "B", "C", "D", "E", "F", "G", "H"], y0 = 1080, rowH = 250;
IDS.forEach(function (id, i) {
  var c = CAST.characters[id], y = y0 + i * rowH, items = EX.map(function (e) { return { lab: e[0], expr: e[1] }; })
    .concat(MO.map(function (m) { return { lab: m, mouth: m }; }));
  label(90, y + 120, c.name || id, 26);
  items.forEach(function (it, k) {
    var z = 52 / ((c.look || {}).head || 46) / ((c.look || {}).scale || 0.72), cx = 230 + k * 130, g = el("g", {}, svg);
    var f = figure(g, c, 0, 0, { expr: it.expr, mouth: it.mouth, f: 1, zoom: z });
    var hx = +f.R.parts.head.getAttribute("cx"), hy = +f.R.parts.head.getAttribute("cy"), HR = f.R.HR;
    var id2 = "clip" + i + "_" + k; var cp = el("clipPath", { id: id2 }, svg);
    el("rect", { x: hx - HR * 1.45, y: hy - HR * 1.55, width: HR * 2.9, height: HR * 3.0 }, cp);
    g.setAttribute("clip-path", "url(#" + id2 + ")");
    var outer = el("g", { transform: "translate(" + cx + " " + (y + 100) + ") scale(" + z.toFixed(3) + ") translate(" + (-hx) + " " + (-hy) + ")" }, svg);
    outer.appendChild(g);
    label(cx, y + 210, it.lab, 18, it.mouth ? "#8e352d" : "#6b6863");
  });
});
label(W / 2, y0 + n * rowH + 10, "mouths: A closed (م ب) · B slightly open · C open · D wide · E rounded · F puckered (و) · G lip on teeth (ف) · H tongue (ل ن ر) · X rest", 18, "#6b6863");
</script></body></html>"""


async def shoot(html, out, W, H):
    tmp = os.path.splitext(out)[0] + "_sheet.html"
    open(tmp, "w", encoding="utf-8").write(html)
    async with async_playwright() as p:
        exe = chrome()
        b = await (p.chromium.launch(executable_path=exe, args=["--allow-file-access-from-files"]) if exe else p.chromium.launch(args=["--allow-file-access-from-files"]))
        pg = await b.new_page(viewport={"width": W, "height": H}); errs = []
        pg.on("console", lambda m: errs.append(m.text) if m.type == "error" else None)
        pg.on("pageerror", lambda e: errs.append(str(e)))
        await pg.goto("file://" + os.path.abspath(tmp)); await pg.wait_for_timeout(800)
        await pg.screenshot(path=out, full_page=True); await b.close()
    os.remove(tmp)
    print("console errors:", "; ".join(errs) if errs else "none"); print(out)
    return 1 if errs else 0


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("cast"); ap.add_argument("out"); ap.add_argument("--title", default=None)
    a = ap.parse_args()
    cast = json.load(open(a.cast, encoding="utf-8"))
    n = len(cast.get("characters", {}))
    if not n: sys.exit("cast.json has no characters")
    W, H = 1920, 1080 + n * 250 + 40
    title = a.title or ("model sheet — " + os.path.basename(os.path.dirname(os.path.abspath(a.cast))))
    html = PAGE % {"root": ROOT, "W": W, "H": H, "cast": json.dumps(cast, ensure_ascii=False), "title": title.replace('"', "'")}
    sys.exit(asyncio.run(shoot(html, os.path.abspath(a.out), W, H)))


if __name__ == "__main__":
    main()
