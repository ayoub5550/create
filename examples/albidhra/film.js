/* «البذرة» (The Seed) — 60s Arabic stick-figure short, built on engine/stickfilm.js.
 * Upgrades over v1: pose cross-fade blending between clips, upper-body animation layers
 * (cold hug, look-at-hand) over a base clip, procedural breathing/shiver, facial expressions
 * (mouth + brow keyframes), props bound to joints (seed, shovel), procedural tree growth,
 * day/night/rain. Everything visible is a pure function of t (seek-safe). */
(function () {
  "use strict";
  var SF = window.StickFilm, U = SF.u, el = U.el, clamp = U.clamp, smooth = U.smooth, lerp = U.lerp, ramp = U.ramp,
    easeOutBack = U.easeOutBack, hash = U.hash, pt = U.pt, JN = SF.JOINTS, UPPER = SF.UPPER, CL = window.FILM_CLIPS;
  var ip = function (pts, o) { return Ink.path(pts, Object.assign({ wobble: 1.3, step: 28 }, o || {})); };
  var INK = "#2b2a28", PAPER = "#fbfaf6", SUN = "#ec8a2f", GREEN = "#5f9a3a", LEAF = "#8cc265", FRUIT = "#e0603a", SOIL = "#7a5230";
  var DUR = 60, S = 0.72, G0 = 820;

  // ---------- segments ----------
  var SEG = [
    { t0: 0, t1: 4.2, clip: "walk", hold: 69 },
    { t0: 4.2, t1: 10.4, clip: "walk", loop: true },
    { t0: 10.4, t1: 14.85, clip: "pick", from: 0, to: 132, blend: 0.45 },
    { t0: 14.85, t1: 15.6, clip: "pick", hold: 132 },
    { t0: 15.6, t1: 17.8, clip: "dig", from: 0, to: 66, blend: 0.4 },
    { t0: 17.8, t1: 20.93, clip: "plant", from: 0, to: 93, blend: 0.4 },
    { t0: 20.93, t1: 22.45, clip: "walk", loop: true, f: -1, blend: 0.35 },
    { t0: 22.45, t1: 25.9, clip: "sit", from: 0, to: 115, blend: 0.45, id: "sit1" },
    { t0: 25.9, t1: 40.4, clip: "sit", hold: 115 },
    { t0: 40.4, t1: 41.73, clip: "sit", from: 115, to: 155 },
    { t0: 41.73, t1: 42.5, clip: "walk", loop: true, blend: 0.35 },
    { t0: 42.5, t1: 45.6, clip: "happy", from: 0, to: 101, blend: 0.35 },
    { t0: 45.6, t1: 51.1, clip: "happy", hold: 101 },
    { t0: 51.1, t1: 51.87, clip: "walk", loop: true, f: -1, blend: 0.35 },
    { t0: 51.87, t1: 55.4, clip: "sit", from: 0, to: 115, blend: 0.45, snap: "sit1" },
    { t0: 55.4, t1: DUR + 1, clip: "sit", hold: 115 }
  ];
  var M = SF.motion({ clips: CL, scale: S, ground: G0, segments: SEG, anchor: { seg: 1, x: 360 } });
  var rawJoints = M.raw, pose = M.pose;
  function figJoints(t) {
    var J = M.joints(t);
    // look at the seed in the palm (right arm layer)
    var wl = ramp(t, 13.3, 13.9) * (1 - ramp(t, 15.2, 15.6));
    pose(J, { elR: ["shR", 26, 62], haR: ["neck", 62, -4] }, wl);
    J.head[0] += wl * 3; J.head[1] += wl * 5;
    // cold: hug yourself while seated at night + shiver
    var wc = ramp(t, 27.9, 28.8) * (1 - ramp(t, 37.6, 38.6));
    pose(J, { elR: ["neck", 46, 56], haR: ["neck", 4, 50], elL: ["neck", 44, 76], haL: ["neck", 2, 70] }, wc);
    J.head[0] += wc * 5; J.head[1] += wc * 4;
    var wj = ramp(t, 42.95, 43.3) * (1 - ramp(t, 45.0, 45.5));
    pose(J, { elR: ["neck", 62, -52], haR: ["neck", 104, -118], elL: ["neck", -58, -52], haL: ["neck", -98, -116] }, wj);   // wide V, clear of the head
    var hop = wj * 22 * (Math.max(0, Math.sin((t - 43.3) * Math.PI / 0.42)) * (t > 43.3 && t < 44.56 ? 1 : 0));
    JN.forEach(function (j) { J[j][1] -= hop; });
    // breathing while seated / standing still, + shiver
    var still = (t > 25.9 && t < 40.4) || (t > 45.1 && t < 51.3) || t > 55.1;
    var br = still ? Math.sin(t * 2.3) * 2.2 : 0, sh = wc * 2.2 * Math.sin(t * 75);
    UPPER.concat(["chest"]).forEach(function (j) { J[j][1] += br * (j === "chest" ? 0.5 : 1); J[j][0] += sh; });
    // look up at the rain / the tree (head tilt)
    var up = ramp(t, 33.2, 34.0) * (1 - ramp(t, 36.8, 37.6)) + ramp(t, 46.0, 47.0) * (1 - ramp(t, 50.6, 51.4));
    J.head[0] -= up * 7; J.head[1] -= up * 5;
    return J;
  }

  // ---------- DOM layers ----------
  var cam = document.getElementById("cam"), back = document.getElementById("back");
  var land = document.getElementById("land"), fx = document.getElementById("fx"), figG = document.getElementById("fig");
  var sky = document.getElementById("skyg");
  var D = SF.draws(land), drawPath = D.path;

  // derived world anchors
  var PK = CL.pick.low, PL = CL.plant.low;
  var tGrab = M.timeOf(2, PK.frame);
  var tDrop = M.timeOf(5, PL.frame);
  var seedGround = rawJoints(SEG[2], tGrab)[PK.hand];
  var dropHand = rawJoints(SEG[5], tDrop)[PL.hand];
  var holeX = dropHand[0] + 6;
  var sitJ = rawJoints(SEG[8], 30), rockX = sitJ.hips[0] - 4, rockTop = sitJ.hips[1] + 9 * S;
  var C0 = (rockX + holeX) / 2 + 40;
  var shovelRest = { top: [holeX + 150, G0 - 215], bot: [holeX + 182, G0 + 6] };

  // ---------- landscape (drawn by the pencil in the intro) ----------
  drawPath(ip([[C0 - 1250, G0 + 3], [C0 - 300, G0 + 5], [C0 + 400, G0 - 2], [C0 + 1300, G0 + 2]], { seed: 3 }), 1.3, 1.9, { pencil: true, w: 5 });
  var CR = [];
  for (var ci = 0; ci < 11; ci++) {
    var cx0 = C0 - 900 + ci * 175 + hash(ci) * 60, pts = [[cx0, G0 + 6]];
    for (var cj = 1; cj < 4; cj++) pts.push([cx0 + (hash(ci * 7 + cj) - 0.5) * 50, G0 + 6 + cj * (14 + hash(ci + cj) * 10)]);
    var cp = drawPath(ip(pts, { wobble: 0.5, step: 9, seed: ci }), 3.1 + ci * 0.06, 0.35, { w: 3, color: "#8a7a62" });
    CR.push(cp);
  }
  // rock (seat) and shovel stuck in the ground
  var rk = drawPath(ip([[rockX - 66, G0], [rockX - 58, rockTop + 16], [rockX - 26, rockTop], [rockX + 30, rockTop + 3], [rockX + 58, rockTop + 22], [rockX + 64, G0]], { wobble: 0.8, step: 10, seed: 51 }), 3.6, 0.5, { w: 5, fill: PAPER, pencil: true });
  // sun (drawn, then rides an arc down at dusk)
  var sunG = el("g", { "clip-path": "url(#aboveGround)" }, back);
  var sunIn = el("g", {}, sunG);
  el("circle", { r: 150, fill: "url(#sunGlow)" }, sunIn);
  var sunRays = el("g", {}, sunIn);
  for (var r = 0; r < 10; r++) {
    var a = r * Math.PI / 5;
    el("path", { d: ip([[Math.cos(a) * 76, Math.sin(a) * 76], [Math.cos(a) * 104, Math.sin(a) * 104]], { wobble: 0.3, step: 8 }), stroke: SUN, "stroke-width": 6, "stroke-linecap": "round", fill: "none" }, sunRays);
  }
  var sunDisc = el("circle", { r: 56, fill: "#f6c26b", stroke: INK, "stroke-width": 5 }, sunIn);
  var SUNP = [C0 + 600, 385];

  // shovel prop (bound to the hands while digging)
  var shovel = el("g", { "clip-path": "url(#aboveGround)" }, fx);
  var shH = el("path", { stroke: "#8b6a43", "stroke-width": 8, "stroke-linecap": "round", fill: "none" }, shovel);
  var shB = el("path", { fill: "#cfd3d6", stroke: INK, "stroke-width": 4, "stroke-linejoin": "round" }, shovel);
  // hole + mound + seed
  var hole = el("path", { d: "M " + (holeX - 34) + " " + G0 + " Q " + holeX + " " + (G0 + 30) + " " + (holeX + 34) + " " + G0, fill: "#5b4330", stroke: INK, "stroke-width": 4 }, fx);
  var dirt = el("path", { d: ip([[holeX + 40, G0], [holeX + 52, G0 - 14], [holeX + 72, G0 - 18], [holeX + 92, G0 - 8], [holeX + 100, G0]], { wobble: 0.6, step: 8 }), fill: "#b08a5e", stroke: INK, "stroke-width": 4 }, fx);
  var mound = el("path", { d: ip([[holeX - 46, G0], [holeX - 24, G0 - 15], [holeX + 6, G0 - 19], [holeX + 34, G0 - 12], [holeX + 50, G0]], { wobble: 0.6, step: 8 }), fill: "#b08a5e", stroke: INK, "stroke-width": 4 }, fx);
  var seed = el("ellipse", { rx: 9, ry: 6.5, fill: SOIL, stroke: INK, "stroke-width": 3 }, fx);
  var glint = el("g", {}, fx);
  for (var gi = 0; gi < 4; gi++) { var ga = gi * Math.PI / 2; el("line", { x1: Math.cos(ga) * 14, y1: Math.sin(ga) * 14, x2: Math.cos(ga) * 30, y2: Math.sin(ga) * 30, stroke: "#f2b233", "stroke-width": 4, "stroke-linecap": "round" }, glint); }

  // ---------- sprout + tree (procedural growth) ----------
  var sprout = el("g", {}, fx);
  var spStem = el("path", { d: "M 0 0 C 2 -18, -3 -34, 0 -52", stroke: GREEN, "stroke-width": 5, fill: "none", "stroke-linecap": "round" }, sprout);
  el("path", { d: "M 0 -48 C -18 -66, -40 -58, -44 -46 C -30 -40, -12 -40, 0 -48 Z", fill: LEAF, stroke: INK, "stroke-width": 3 }, sprout);
  el("path", { d: "M 0 -50 C 16 -70, 38 -66, 42 -54 C 28 -46, 12 -46, 0 -50 Z", fill: LEAF, stroke: INK, "stroke-width": 3 }, sprout);
  var TREE = el("g", {}, back), LEAVES = el("g", {}, fx), BR = [], LV = [], FR = [];
  var T_TREE = 45.9;
  function branch(x0, y0, ang, len, w, depth, t0, seedN) {
    var x1 = x0 + Math.cos(ang) * len, y1 = y0 + Math.sin(ang) * len;
    var mx = (x0 + x1) / 2 + Math.cos(ang + Math.PI / 2) * len * 0.08 * (hash(seedN) - 0.5) * 2, my = (y0 + y1) / 2 + Math.sin(ang + Math.PI / 2) * len * 0.08;
    var dur = 0.35 + len / 700, p = el("path", { d: "M " + x0 + " " + y0 + " Q " + mx + " " + my + " " + x1 + " " + y1, stroke: "#6b4a2e", "stroke-width": w, fill: "none", "stroke-linecap": "round" }, TREE);
    var L = p.getTotalLength(); BR.push({ el: p, L: L, t0: t0, dur: dur });
    if (depth <= 0 || len < 40) {
      for (var k = 0; k < 3; k++) LV.push({ x: x1 + (hash(seedN * 3 + k) - 0.5) * 70, y: y1 + (hash(seedN * 5 + k) - 0.5) * 50, r: 46 + hash(seedN + k) * 26, t0: 48.2 + hash(seedN * 11 + k) * 1.9 });
      if (hash(seedN * 13) > 0.35) FR.push({ x: x1 + (hash(seedN * 17) - 0.5) * 50, y: y1 + 18 + hash(seedN * 19) * 22, t0: 50.3 + hash(seedN * 23) * 1.3 });
      return;
    }
    var n = 2 + (hash(seedN * 29) > 0.6 ? 1 : 0);
    for (var b = 0; b < n; b++) {
      var spread = n === 2 ? (b ? 0.48 : -0.48) : (b - 1) * 0.55;
      branch(x1, y1, ang + spread + (hash(seedN * 31 + b) - 0.5) * 0.3, len * (0.68 + hash(seedN * 37 + b) * 0.12), w * 0.66, depth - 1, t0 + dur * 0.85, seedN * 3 + b + 1);
    }
  }
  branch(holeX, G0 + 2, -Math.PI / 2 - 0.2, 235, 27, 4, T_TREE, 1);
  LV.forEach(function (l) { l.y = Math.min(l.y, G0 - 330); }); FR.forEach(function (f) { f.y = Math.min(f.y, G0 - 300); });
  var CANX = LV.reduce(function (a, l) { return a + l.x; }, 0) / LV.length;
  LV.sort(function (a, b) { return a.t0 - b.t0; });
  var shade = el("ellipse", { cx: CANX - 50, cy: G0 + 8, rx: 330, ry: 20, fill: "#2b2a28", opacity: 0 }, back);
  back.insertBefore(shade, TREE);
  LV.forEach(function (l, k) {
    l.g = el("g", {}, LEAVES);
    el("circle", { r: l.r, fill: k % 3 ? LEAF : "#79b257", stroke: INK, "stroke-width": 4, opacity: 0.96 }, l.g);
  });
  FR.forEach(function (f) { f.g = el("g", {}, LEAVES); el("circle", { r: 13, fill: FRUIT, stroke: INK, "stroke-width": 3.5 }, f.g); el("path", { d: "M 0 -12 q 4 -8 10 -9", stroke: GREEN, "stroke-width": 3, fill: "none" }, f.g); });
  // grass tufts + flowers that spread after the rain
  var GRASS = [];
  for (var q = 0; q < 26; q++) {
    var gx = C0 - 900 + q * 72 + hash(q * 3) * 40, g = el("g", {}, fx), t0g = 46.0 + Math.abs(gx - holeX) / 900 * 4.5 + hash(q) * 0.6;
    el("path", { d: "M -8 0 L -12 -20 M 0 0 L 2 -28 M 8 0 L 16 -18", stroke: GREEN, "stroke-width": 3.5, fill: "none", "stroke-linecap": "round" }, g);
    if (q % 4 === 1) { el("line", { x1: 2, y1: 0, x2: 4, y2: -40, stroke: GREEN, "stroke-width": 3 }, g); el("circle", { cx: 4, cy: -44, r: 8, fill: q % 8 === 1 ? "#f2b233" : "#e58f8f", stroke: INK, "stroke-width": 3 }, g); }
    GRASS.push({ g: g, x: gx, t0: t0g });
  }

  // ---------- sky (screen space, above the night tint) ----------
  var moonG = el("g", { opacity: 0 }, sky);
  el("path", { d: "M 1560 150 a 70 70 0 1 0 60 120 a 56 56 0 1 1 -60 -120 Z", fill: "#f6ecc0", stroke: "#f6ecc0", "stroke-width": 2 }, moonG);
  var STARS = [];
  for (var si = 0; si < 34; si++) {
    var st = el("circle", { cx: 60 + hash(si * 5) * 1800, cy: 40 + hash(si * 9) * 420, r: 2 + hash(si * 13) * 3, fill: "#fff7d8" }, moonG);
    STARS.push(st);
  }
  var CLOUDS = [];
  function cloudPath(cx, cy, s) {
    var pts = [];
    for (var a2 = 0; a2 <= 360; a2 += 12) { var rr = (1 + 0.2 * Math.sin(a2 * Math.PI / 180 * 5)) * s; pts.push([cx + Math.cos(a2 * Math.PI / 180) * rr * 2, cy + Math.sin(a2 * Math.PI / 180) * rr * 0.72]); }
    return Ink.path(pts, { wobble: 1, step: 16, closed: true }) + "Z";
  }
  [[420, 170, 90, -1], [1000, 120, 110, 1], [1560, 190, 95, -1], [720, 260, 70, 1], [1320, 280, 75, 1]].forEach(function (c, k) {
    var g = el("g", { opacity: 0 }, sky); el("path", { d: cloudPath(0, 0, c[2]), fill: "#a3a8b8", stroke: INK, "stroke-width": 4.5 }, g);
    CLOUDS.push({ g: g, x: c[0], y: c[1], dir: c[3], k: k });
  });
  var RAIN = [], rainG = el("g", { opacity: 0 }, sky);
  for (var ri = 0; ri < 150; ri++) RAIN.push({ el: el("line", { stroke: "#c7d6f2", "stroke-width": 3, "stroke-linecap": "round" }, rainG), x: hash(ri * 3.1) * 2100, v: 1300 + hash(ri * 7.3) * 600, o: hash(ri * 1.7) * 1100 });

  // ---------- figure (world-space rig) ----------
  // expression keys: [t, mouth curve (-1 sad .. 1 joy), brow (+ sad/worried, - determined), eye scale]
  var EXPR = [[0, -0.7, 0.7, 1], [10.6, -0.6, 0.6, 1], [11.3, 0, 0, 1.25], [13.6, 0.65, 0, 1.1], [15.5, 0.15, -0.5, 1], [20.9, 0.3, 0, 1],
    [25.5, 0, 0.2, 1], [28.2, -0.6, 0.7, 1], [37.4, -0.45, 0.5, 1], [39.9, 0.1, -0.1, 1.45], [40.9, 0.8, 0, 1.15], [42.9, 1, 0, 1.15], [45.4, 0.9, 0, 1.05], [52, 0.75, 0, 1], [61, 0.75, 0, 1]];
  var BLINKS = [3.2, 8.1, 12.9, 19.6, 24.3, 30.9, 35.2, 44.0, 49.2, 53.8, 57.6];
  var FIG = SF.rig(figG, { scale: S, ink: INK, paper: PAPER, expr: EXPR, blinks: BLINKS, backInk: "#5a5751" });   // no boil filter on the hero: displacement makes thin strokes jagged

  // ---------- camera ----------
  var CAM = [
    [0, function () { return [C0, 600, 1.0]; }],
    [10.0, function () { return [C0, 600, 1.0]; }],
    [11.4, function () { return [seedGround[0] - 30, 650, 1.38]; }],
    [15.0, function () { return [seedGround[0] - 10, 650, 1.38]; }],
    [16.2, function () { return [(holeX + rockX) / 2 + 50, 650, 1.25]; }],
    [20.8, function () { return [(holeX + rockX) / 2 + 50, 650, 1.25]; }],
    [22.6, function () { return [C0, 610, 1.08]; }],
    [25.6, function () { return [C0, 600, 1.08]; }],
    [28.4, function () { return [rockX + 140, 610, 1.18]; }],
    [37.8, function () { return [rockX + 150, 615, 1.2]; }],
    [39.6, function () { return [holeX - 40, 700, 1.45]; }],
    [40.6, function () { return [holeX - 40, 700, 1.45]; }],
    [42.2, function () { return [C0, 630, 1.12]; }],
    [45.6, function () { return [C0, 630, 1.12]; }],
    [49.0, function () { return [C0 - 20, 400, 0.86]; }],
    [54.0, function () { return [C0 - 40, 385, 0.87]; }],
    [DUR + 1, function () { return [C0 - 50, 362, 0.84]; }]
  ];
  var CAMERA = SF.camera(CAM);

  var TICKS = el("g", { opacity: 0 }, fx);
  for (var tk = 0; tk < 4; tk++) el("path", { d: "M 0 " + (tk * 16) + " l " + (tk % 2 ? 8 : -8) + " 6", stroke: "#e9ecf4", "stroke-width": 4, "stroke-linecap": "round", fill: "none", "data-k": tk }, TICKS);
  var pencil = document.getElementById("pencil"), NIGHT = document.getElementById("night");
  var TITLE = document.getElementById("title"), FADE = document.getElementById("fade");
  var UNDER = document.getElementById("underline"), UNDER_L = UNDER.getTotalLength();
  UNDER.style.strokeDasharray = UNDER_L + " " + (UNDER_L + 10);
  var PEN_END = 4.1;

  function render(t) {
    CAMERA.apply(cam, t);
    var pen = D.update(t);   // draw-ons + pencil tip
    var sunDraw = smooth((t - 3.0) / 0.9);
    if (!pen && t >= 3.0 && t < 3.9) { var an = -Math.PI / 2 + sunDraw * Math.PI * 2; pen = [SUNP[0] + Math.cos(an) * 56, SUNP[1] + Math.sin(an) * 56]; }
    if (!pen && t > 3.2 && t < 3.6) pen = [lerp(SUNP[0], rockX - 66, smooth((t - 3.2) / 0.4)), lerp(SUNP[1] + 56, G0, smooth((t - 3.2) / 0.4))];
    if (!pen && t < 1.3) pen = [lerp(C0 + 900, C0 - 1250, smooth((t - 0.7) / 0.6)), lerp(250, G0 + 3, smooth((t - 0.7) / 0.6))];
    if (!pen && t > PEN_END - 0.0) { var lu = smooth((t - PEN_END) / 0.7); pen = [lerp(rockX + 64, C0 + 1300, lu), lerp(G0, 200, lu)]; }
    if (pen) pencil.setAttribute("transform", "translate(" + pen[0].toFixed(1) + " " + pen[1].toFixed(1) + ")");
    pencil.setAttribute("opacity", t > 0.7 && t < PEN_END + 0.7 ? 1 : 0);

    // sun: drawn (stroke reveal via scale), shimmer, sets at dusk, rises at dawn
    var sunScale = t < 3.0 ? 0 : easeOutBack((t - 3.0) / 0.9);
    var set = ramp(t, 25.8, 28.0), rise = ramp(t, 37.6, 39.8), arc = set * (1 - rise);
    var sx = SUNP[0] + 380 * set - 380 * (1 - rise) * set * 0 + (rise > 0 ? -380 * (1 - rise) : 0), sy = SUNP[1] + 700 * arc;
    if (rise > 0) sx = SUNP[0] - 380 * (1 - rise);
    sunIn.setAttribute("transform", "translate(" + sx.toFixed(1) + " " + sy.toFixed(1) + ") scale(" + sunScale.toFixed(3) + ")");
    sunRays.setAttribute("transform", "rotate(" + (t * 9).toFixed(1) + ") scale(" + (1 + 0.06 * Math.sin(t * 4)).toFixed(3) + ")");
    // night tint + sky
    var night = ramp(t, 26.6, 28.4) * (1 - ramp(t, 37.4, 39.4));
    var blueU = ramp(t, 26.9, 28.2), dusk = ramp(t, 25.6, 26.8);
    var dawnW = ramp(t, 37.4, 38.4) * (1 - ramp(t, 39.0, 40.2));
    var cr = Math.round(lerp(232, 77, blueU)), cg = Math.round(lerp(160, 93, blueU)), cb = Math.round(lerp(106, 150, blueU));
    if (t > 37) { cr = Math.round(lerp(77, 236, dawnW)); cg = Math.round(lerp(93, 178, dawnW)); cb = Math.round(lerp(150, 130, dawnW)); }
    NIGHT.style.background = "rgb(" + cr + "," + cg + "," + cb + ")";
    NIGHT.style.opacity = Math.max(0.28 * dusk * (1 - ramp(t, 37.6, 39.0)), 0.72 * night, 0.25 * dawnW).toFixed(3);
    moonG.setAttribute("opacity", ((1 - ramp(t, 37.2, 38.0)) * night * (1 - ramp(t, 31.6, 32.8) * (1 - ramp(t, 37.0, 38.0)) * 0.85)).toFixed(3));
    STARS.forEach(function (s, k) { s.setAttribute("opacity", (0.55 + 0.45 * Math.sin(t * (2 + k % 5) + k)).toFixed(2)); });
    var cl = ramp(t, 31.6, 32.8) * (1 - ramp(t, 37.2, 38.6));
    CLOUDS.forEach(function (cd) {
      cd.g.setAttribute("opacity", cl.toFixed(3));
      cd.g.setAttribute("transform", "translate(" + (cd.x + cd.dir * (1 - cl) * 500 + Math.sin(t * 0.4 + cd.k) * 20).toFixed(1) + " " + cd.y + ")");
    });
    var rain = ramp(t, 32.8, 33.3) * (1 - ramp(t, 37.0, 37.6));
    rainG.setAttribute("opacity", rain.toFixed(3));
    if (rain > 0) RAIN.forEach(function (d) {
      var y = (d.o + t * d.v) % 1150 - 60, xx = d.x - y * 0.18;
      d.el.setAttribute("x1", xx.toFixed(1)); d.el.setAttribute("y1", y.toFixed(1));
      d.el.setAttribute("x2", (xx - 7).toFixed(1)); d.el.setAttribute("y2", (y + 34).toFixed(1));
    });
    // cracks heal after the rain
    var heal = 1 - ramp(t, 37.4, 41.5);
    CR.forEach(function (p) { p.style.opacity = heal.toFixed(3); });

    // figure
    var J = figJoints(t);
    FIG.set(J, t);
    var wc2 = ramp(t, 28.4, 29.0) * (1 - ramp(t, 37.2, 37.8)), flick = Math.floor(t * 8) % 2;
    TICKS.setAttribute("opacity", (wc2 * (flick ? 1 : 0.35)).toFixed(2));
    TICKS.setAttribute("transform", "translate(" + (J.chest[0] + (flick ? 46 : -46)).toFixed(1) + " " + (J.chest[1] - 40).toFixed(1) + ")");
    figG.setAttribute("opacity", t < 4.2 ? 0 : 1);

    // seed: on the ground (glints) -> in the hand -> into the hole
    var seedPos, seedOp = 1;
    if (t < tGrab) seedPos = [seedGround[0] + 4, G0 - 5];
    else if (t < tDrop) { var hand = J[t < SEG[4].t0 ? PK.hand : PL.hand]; seedPos = [hand[0], hand[1] + 2]; if (t > SEG[3].t1 && t < SEG[5].t0) seedOp = 0; }
    else { var du = clamp((t - tDrop) / 0.25, 0, 1); seedPos = [lerp(dropHand[0], holeX, du), lerp(dropHand[1], G0 + 8, du)]; seedOp = t > tDrop + 0.6 ? 0 : 1; }
    if (t < 3.3) seedOp = ramp(t, 3.0, 3.3);
    var held = t > tGrab && t < tDrop; seed.setAttribute("rx", held ? 12 : 9); seed.setAttribute("ry", held ? 8.5 : 6.5);
    seed.setAttribute("cx", seedPos[0].toFixed(1)); seed.setAttribute("cy", seedPos[1].toFixed(1)); seed.setAttribute("opacity", seedOp);
    var gl = clamp((t - 10.7) / 1.1, 0, 1), glop = t > 10.7 && t < 11.8 ? Math.sin(gl * Math.PI) : 0;
    glint.setAttribute("transform", "translate(" + (seedGround[0] + 4) + " " + (G0 - 6) + ") rotate(" + (gl * 90).toFixed(1) + ") scale(" + (0.5 + glop * 0.7).toFixed(3) + ")");
    glint.setAttribute("opacity", glop.toFixed(3));

    // shovel: rest -> hands -> rest
    var dg = ramp(t, SEG[4].t0 - 0.05, SEG[4].t0 + 0.35) * (1 - ramp(t, SEG[4].t1 - 0.1, SEG[4].t1 + 0.35));
    var hu = J.haR[1] > J.haL[1] ? J.haL : J.haR, hl = J.haR[1] > J.haL[1] ? J.haR : J.haL;
    var dx = hl[0] - hu[0], dy = hl[1] - hu[1], dn = Math.hypot(dx, dy) || 1; dx /= dn; dy /= dn;
    var digBot = [holeX - 6 + 10 * Math.sin(t * 5), G0 + 8 - 14 * Math.max(0, Math.sin(t * 5))];
    var bot = [lerp(shovelRest.bot[0], digBot[0], dg), lerp(shovelRest.bot[1], digBot[1], dg)];
    var ex2 = hu[0] - digBot[0], ey2 = hu[1] - digBot[1], en = Math.hypot(ex2, ey2) || 1;
    var top = [lerp(shovelRest.top[0], hu[0] + ex2 / en * 26, dg), lerp(shovelRest.top[1], hu[1] + ey2 / en * 26, dg)];
    var bx = bot[0] - top[0], by = bot[1] - top[1], bn = Math.hypot(bx, by) || 1; bx /= bn; by /= bn;
    var nx = -by, ny = bx;
    shH.setAttribute("d", "M " + pt(top) + " L " + pt(bot) + " M " + pt([top[0] - nx * 12, top[1] - ny * 12]) + " L " + pt([top[0] + nx * 12, top[1] + ny * 12]));
    shB.setAttribute("d", "M " + pt([bot[0] - nx * 15, bot[1] - ny * 15]) + " L " + pt([bot[0] + nx * 15, bot[1] + ny * 15]) + " L " + pt([bot[0] + nx * 12 + bx * 34, bot[1] + ny * 12 + by * 34]) + " Q " + pt([bot[0] + bx * 50, bot[1] + by * 50]) + " " + pt([bot[0] - nx * 12 + bx * 34, bot[1] - ny * 12 + by * 34]) + " Z");
    var shOp = t < 3.4 ? 0 : ramp(t, 3.4, 3.8); shovel.setAttribute("opacity", shOp.toFixed(3));
    // hole / dirt / mound
    var holeOp = ramp(t, 16.3, 16.8) * (1 - ramp(t, tDrop + 0.5, tDrop + 0.9));
    hole.setAttribute("opacity", holeOp.toFixed(3)); dirt.setAttribute("opacity", holeOp.toFixed(3));
    var mo = ramp(t, tDrop + 0.5, tDrop + 0.9) * (1 - ramp(t, T_TREE, T_TREE + 0.6));
    mound.setAttribute("opacity", mo.toFixed(3));

    // sprout pops on «ظهرتْ», then becomes the trunk
    var spu = easeOutBack((t - 39.9) / 0.6), spo = t < 39.9 ? 0 : 1 - ramp(t, T_TREE + 0.3, T_TREE + 0.9);
    sprout.setAttribute("transform", "translate(" + holeX + " " + (G0 - 8) + ") scale(" + Math.max(0.001, spu * 1.1).toFixed(3) + ") rotate(" + (3 * Math.sin(t * 2.2)).toFixed(2) + ")");
    sprout.setAttribute("opacity", spo.toFixed(3));
    // tree growth
    BR.forEach(function (b) {
      var u = smooth((t - b.t0) / b.dur);
      b.el.style.strokeDasharray = b.L + " " + (b.L + 10); b.el.style.strokeDashoffset = (b.L * (1 - u)).toFixed(2);
      b.el.style.visibility = u <= 0 ? "hidden" : "visible";
    });
    var sway = Math.sin(t * 1.3) * 3;
    LV.forEach(function (l) {
      var u = easeOutBack((t - l.t0) / 0.5);
      l.g.setAttribute("transform", "translate(" + (l.x + sway * (G0 - l.y) / 500).toFixed(1) + " " + l.y.toFixed(1) + ") scale(" + Math.max(0.001, t < l.t0 ? 0 : u).toFixed(3) + ")");
    });
    FR.forEach(function (f) {
      var u = easeOutBack((t - f.t0) / 0.4);
      f.g.setAttribute("transform", "translate(" + (f.x + sway * (G0 - f.y) / 500).toFixed(1) + " " + f.y.toFixed(1) + ") scale(" + Math.max(0.001, t < f.t0 ? 0 : u).toFixed(3) + ")");
    });
    shade.setAttribute("opacity", (0.16 * ramp(t, 49.6, 50.8)).toFixed(3));
    GRASS.forEach(function (g) {
      var u = easeOutBack((t - g.t0) / 0.5);
      g.g.setAttribute("transform", "translate(" + g.x.toFixed(1) + " " + G0 + ") scale(" + Math.max(0.001, t < g.t0 ? 0 : u).toFixed(3) + ")");
    });

    // title + fade
    var tu = smooth((t - 55.0) / 1.6);
    TITLE.style.clipPath = "inset(0 0 0 " + ((1 - tu) * 100).toFixed(2) + "%)";
    TITLE.style.opacity = t < 55.0 ? 0 : 1;
    var ul = smooth((t - 56.4) / 0.9);
    UNDER.style.strokeDashoffset = (UNDER_L * (1 - ul)).toFixed(1);
    UNDER.style.visibility = ul <= 0 ? "hidden" : "visible";
    FADE.style.opacity = smooth((t - 59.0) / 1.0).toFixed(3);
  }

  // ---------- timeline ----------
  window.__timelines = window.__timelines || {};
  window.__timelines["main"] = SF.timeline(DUR, render, { boil: document.getElementById("boilTurb"), boilFps: 8 });
  window.__FILM = { SEG: SEG, render: render, figJoints: figJoints, holeX: holeX, rockX: rockX, C0: C0, tGrab: tGrab, tDrop: tDrop, seedGround: seedGround };
})();
