/* Sam & Layla Ep. 1 — P10 "Years later..." (epilogue + END CARD). Structure follows the reference part p01.
 * Data: FILM_DATA (dialogue.py) · FILM_CAST (cast.json) · FILM_SHOTS (shots.json, hand-directed, word-anchored).
 * Beat sheet:
 *   CARD "Years later..." (a desk calendar sheds its pages) ->
 *   SUMMER: the big apple tree; Sam knocks on the trunk, an apple BONKS him, bounces into his hand, he bites it (Pip laughs) ->
 *   AUTUMN: leaves fall; Sam rakes a neat pile (3 strokes, proud) — a GUST blasts the pile all over him -> CU glare,
 *           one last leaf lands on his head (eye twitch) ->
 *   WINTER: snow; Sam on the rock, wrapped head to toe in Layla's giant FINISHED scarf (only his eyes show), three snowy
 *           saplings beside the rock; snow piles on his head, he shivers it off; Layla on her stool sips tea:
 *           "Done by winter." -> CU cocoon, muffled: "Show-off." (the scarf puffs with each syllable, breath vapour) ->
 *   SPRING (years on): blossoms, an orchard behind the fence; Sam (grey tuft) plants a seed in a NEW mound; cutaway: Pip's
 *           nest on the apple tree — three eggs hatch (the third one late); Sam takes a HUGE breath (Layla braces for
 *           the old yelling)... softly: "Grow." -> "No yelling?" -> he stands, "Nah. It knows what to do." -> he walks
 *           away to the left without looking back; CU: the sprout pops behind him, Pip hops over and chirps -> IRIS OUT on
 *           the sprout -> END CARD "Sam & Layla" / "New episode soon!" (upper left; right third + bottom kept clear for the
 *           YouTube end screen), Pip flies in and hops along the title.
 * Beat times derive from the dialogue timeline; score.py uses the same formulas. Everything is a pure function of t. */
(function () {
  "use strict";
  var SF = window.StickFilm, U = SF.u, el = U.el, ramp = U.ramp, hash = U.hash, clamp = U.clamp, lerp = U.lerp;
  var DATA = window.FILM_DATA, CAST = window.FILM_CAST.characters, SHOTS = window.FILM_SHOTS.shots;
  var CL = Object.assign({ stand: SF.standClip() }, window.FILM_CLIPS || {});
  var K = Kit.lines(DATA), L = K.L, w = K.w, F = Kit.FACE, bump = Kit.bump;
  var DUR = DATA.total, G0 = 820, INK = "#2b2a28", TEAL = "#2f7f8f", RED = "#c4453b", BARK = "#8b6a43";
  function ip(pts, o) { return Ink.path(pts, Object.assign({ wobble: 0.8, step: 12 }, o || {})); }
  function show(g, on) { g.style.display = on ? "" : "none"; }
  function seg01(t, a, b) { return clamp((t - a) / (b - a), 0, 1); }

  // ---------- beats (same formulas in score.py) ----------
  var T1 = L.l1.start;
  var tWin = T1 - 6.0, tAut = tWin - 5.0, tSum = tAut - 3.5;                       // season cuts (card 0 -> tSum)
  var tSpr = L.l2.end + 0.1;
  // summer
  var tLookUp = tSum + 0.3, tKnock = tSum + 1.0, tDrop = tKnock + 0.15, tBonk = tDrop + 0.42, tCatch = tBonk + 0.55, tBite = tCatch + 0.6;
  // autumn
  var RP = 0.72, NSTROKE = 3, tRake0 = tAut + 0.35, tRake1 = tRake0 + RP * NSTROKE, tProud = tRake1 + 0.05;
  var tGust = tProud + 0.55, tGlare = tGust + 0.7, tLeaf = tGlare + 0.45;
  // winter
  var tShiver = tWin + 3.3, tSip = T1 - 1.7;
  // spring
  var tPlant = tSpr + 0.8, tNest = L.l3.start - 7.6, tH = [tNest + 1.1, tNest + 1.7, tNest + 3.2];
  var tBack = L.l3.start - 3.6, tInhale = L.l3.start - 2.1, tBrace = L.l3.start - 1.25;
  var tPat = L.l3.end + 0.25, tStand = L.l5.start - 0.15, tStood = tStand + 0.6;
  var tTurn = L.l5.end + 0.25, tWS = L.l5.end + 0.75, tCU = L.l5.end + 2.75, tPop = tCU + 0.6;
  var tPipIn = tPop + 0.45, tPipLand = tPop + 1.0;
  var tCard = DUR - 10, tIris = tCard - 2.5;
  if (tIris < tPipLand + 0.4) console.warn("p10: tail too short for the ending");
  function season(t) { return t < tAut ? "summer" : t < tWin ? "autumn" : t < tSpr ? "winter" : "spring"; }

  // ---------- staging ----------
  var MX = 1000, M2 = 1250, ROCKX = 610, STOOLX = 835, BHX = 1640, SAPX = [330, 405, 480];
  var LS = CAST.sam.look, LL = CAST.layla.look;
  function mot(look, segs, x) { return SF.motion({ clips: CL, scale: look.scale, ground: G0, segments: segs, anchor: { seg: 0, x: x, edge: "start" } }); }
  var MS_SUM = mot(LS, [{ t0: 0, t1: DUR + 1, clip: "stand", hold: 0 }], 828);
  var MS_AUT = mot(LS, [{ t0: 0, t1: DUR + 1, clip: "stand", hold: 0, f: -1 }], 1330);
  var MS_WIN = mot(LS, [{ t0: 0, t1: DUR + 1, clip: "sit", hold: 115 }], ROCKX + 6);
  var ML_WIN = mot(LL, [{ t0: 0, t1: DUR + 1, clip: "sit", hold: 115, f: -1 }], STOOLX);
  var MS_SPR = mot(LS, [{ t0: 0, t1: tTurn, clip: "stand", hold: 0 }, { t0: tTurn, t1: DUR + 1, clip: "stroll", loop: true, f: -1, blend: 0.35 }], 1150);
  var ML_SPR = mot(LL, [{ t0: 0, t1: DUR + 1, clip: "stand", hold: 0, f: -1 }], 1540);

  // ---------- world ----------
  var back = document.getElementById("back"), props = document.getElementById("props"), figG = document.getElementById("fig");
  var front = document.getElementById("front"), camG = document.getElementById("cam"), mid = document.getElementById("mid");
  var Y = FilmSet.yard({ G0: G0, ref: [1040, 560, 1.25], look: "day", season: season, garden: { x: MX } });
  var rock = Props.rock(back, ROCKX, G0);
  var bh = Kit.birdhouse(back, BHX, G0);
  var stoolG = el("g", {}, back), stool = Props.stool(stoolG, STOOLX, G0);
  var mound = Props.mound(props, MX, G0);
  var tree = Props.tree(props, MX - 16, G0 - 26);
  var mound2 = Props.mound(props, M2, G0);
  var sprout = Props.tree(props, M2 - 16, G0 - 26);

  // --- the orchard behind the fence (spring): drawn INTO the set's mid layer, behind the fence (inserted before its trees)
  var orch = el("g", { visibility: "hidden" }, null);
  mid.insertBefore(orch, mid.children[2] || null);
  function youngTree(parent, x, y, s, seed, o) {
    o = o || {}; var g = el("g", { transform: "translate(" + x + " " + y + ") scale(" + s + ")" }, parent);
    el("path", { d: ip([[-6, 0], [-4, -90], [-1, -120], [3, -120], [5, -90], [7, 0]], { wobble: 0.6, step: 16, seed: seed }) + " Z", fill: BARK, stroke: INK, "stroke-width": 3.5 }, g);
    var can = el("g", {}, g);
    [[-34, -130, 36], [0, -158, 42], [34, -130, 36], [0, -112, 32]].forEach(function (b, j) {
      el("circle", { cx: b[0], cy: b[1], r: b[2], fill: j % 2 ? "#8cc56a" : "#9fd27a", stroke: INK, "stroke-width": 3.5 }, can);
    });
    [[-12, -150, 22], [20, -138, 18]].forEach(function (b) { el("circle", { cx: b[0], cy: b[1], r: b[2], fill: "#c3e6a3", opacity: 0.55 }, can); });
    for (var q = 0; q < 9; q++) el("circle", { cx: ((hash(seed * 7 + q) - 0.5) * 90).toFixed(1), cy: (-104 - hash(seed * 3 + q) * 80).toFixed(1), r: 6.5, fill: "#f7c4d2", stroke: INK, "stroke-width": 1.5 }, can);
    return g;
  }
  [[520, 0.62], [700, 0.7], [880, 0.6], [1180, 0.68], [1370, 0.6], [1530, 0.7], [1720, 0.62], [1900, 0.68]].forEach(function (p, k) {
    youngTree(orch, p[0], G0 - 64, p[1] * 1.15, 40 + k);
  });

  // --- three little saplings beside the rock (all seasons: years later they are a row of young trees)
  var SAP = SAPX.map(function (x, k) {
    var g = el("g", {}, back), s = 0.95 + 0.1 * (k % 2);
    var trunk = el("path", { d: ip([[x - 3, G0], [x - 2, G0 - 120 * s], [x + 2, G0 - 120 * s], [x + 3, G0]], { wobble: 0.4, step: 14, seed: 70 + k }) + " Z", fill: BARK, stroke: INK, "stroke-width": 3 }, g);
    var twigs = el("path", { d: "M " + x + " " + (G0 - 70 * s) + " L " + (x - 26 * s) + " " + (G0 - 104 * s) + " M " + x + " " + (G0 - 88 * s) + " L " + (x + 24 * s) + " " + (G0 - 122 * s) + " M " + x + " " + (G0 - 118 * s) + " L " + (x - 6 * s) + " " + (G0 - 142 * s), stroke: BARK, "stroke-width": 5, "stroke-linecap": "round", fill: "none" }, g);
    var twigInk = el("path", { d: twigs.getAttribute("d"), stroke: INK, "stroke-width": 8, "stroke-linecap": "round", fill: "none" }, g);
    g.insertBefore(twigInk, twigs);
    var can = el("g", {}, g), blobs = [];
    [[-22, -118, 26], [4, -140, 30], [26, -116, 24], [2, -104, 22]].forEach(function (b, j) { blobs.push(el("circle", { cx: x + b[0] * s, cy: G0 + b[1] * s, r: b[2] * s, stroke: INK, "stroke-width": 3 }, can)); });
    var bl = el("g", {}, can); for (var q = 0; q < 6; q++) el("circle", { cx: x + (hash(k * 9 + q) - 0.5) * 60 * s, cy: G0 - (100 + hash(k * 5 + q) * 52) * s, r: 5, fill: "#f7c4d2", stroke: INK, "stroke-width": 1.2 }, bl);
    var snow = el("g", {}, g);
    [[x - 26 * s, G0 - 104 * s, 12], [x + 24 * s, G0 - 122 * s, 12], [x - 6 * s, G0 - 142 * s, 10]].forEach(function (p) {
      el("ellipse", { cx: p[0], cy: p[1] - 3, rx: p[2], ry: 5, fill: "#fbfdff", stroke: INK, "stroke-width": 2 }, snow);
    });
    el("path", { d: ip([[x - 34, G0 + 2], [x - 18, G0 - 9], [x + 18, G0 - 9], [x + 34, G0 + 2]], { wobble: 0.5, step: 10, seed: 80 + k }) + " Z", fill: "#fbfdff", stroke: INK, "stroke-width": 2.5 }, snow);
    return { g: g, can: can, blobs: blobs, bl: bl, snow: snow };
  });
  function setSaplings(se) {
    var col = se === "autumn" ? ["#e0913f", "#cf7631"] : se === "spring" ? ["#9fd27a", "#8cc56a"] : ["#8cc265", "#74b04f"];
    SAP.forEach(function (s) {
      show(s.can, se !== "winter");
      s.blobs.forEach(function (b, j) { b.setAttribute("fill", col[j % 2]); });
      show(s.bl, se === "spring");
      show(s.snow, se === "winter");
    });
  }

  // --- winter snow on things (world layer): the bare tree's branches, the mound, rock, birdhouse roof, stool
  var snowW = el("g", {}, props);
  (function () {
    var x = MX - 16, B0 = G0 - 26, h = 570, tw = 29, BR = [[-0.62, 0.55, 0.42], [0.55, 0.62, 0.38], [-0.35, 0.78, 0.3], [0.3, 0.84, 0.28], [0.0, 0.9, 0.22]];
    var curve = function (s) { return x + Math.sin(s * 2.4 + 0.6) * 3; };
    BR.forEach(function (br, k) {
      var by = B0 - h * br[1] * 0.8, len = h * br[2] * 0.9, sx = curve(br[1]), ex = sx + br[0] * len * 1.3, ey = by - len * 0.75;
      var cx = sx + br[0] * len * 0.6, cy = by - len * 0.15, wv = Math.max(2, tw * 0.45 * (1 - k * 0.12)), up = wv * 0.5 + 3;
      // the upper half of the curve, lifted onto the top of the branch
      var p = function (u) { var a = (1 - u) * (1 - u), b = 2 * u * (1 - u), c = u * u; return [a * sx + b * cx + c * ex, a * by + b * cy + c * ey - up]; };
      var pts = []; for (var i = 3; i <= 10; i++) pts.push(p(i / 10));
      var d = "M " + pts.map(U.pt).join(" L ");
      el("path", { d: d, stroke: INK, "stroke-width": 11, "stroke-linecap": "round", fill: "none" }, snowW);
      el("path", { d: d, stroke: "#fbfdff", "stroke-width": 7, "stroke-linecap": "round", fill: "none" }, snowW);
    });
    var cap = function (pts, seed) { el("path", { d: ip(pts, { wobble: 0.5, step: 10, seed: seed }) + " Z", fill: "#fbfdff", stroke: INK, "stroke-width": 3, "stroke-linejoin": "round" }, snowW); };
    cap([[MX - 70, G0 - 2], [MX - 40, G0 - 30], [MX + 4, G0 - 38], [MX + 46, G0 - 27], [MX + 72, G0 - 2], [MX + 40, G0 - 14], [MX - 30, G0 - 12]], 101);
    cap([[ROCKX - 70, G0 - 104], [ROCKX - 30, G0 - 124], [ROCKX + 30, G0 - 124], [ROCKX + 70, G0 - 108], [ROCKX + 40, G0 - 112], [ROCKX - 40, G0 - 110]], 102);
    var bt = bh.top;
    cap([[BHX - 52, bt - 10], [BHX - 20, bt - 46], [BHX, bt - 64], [BHX + 20, bt - 46], [BHX + 52, bt - 10], [BHX, bt - 50]], 103);
    cap([[STOOLX - 46, G0 - 92], [STOOLX - 20, G0 - 100], [STOOLX + 46, G0 - 96], [STOOLX + 40, G0 - 90]], 104);
  })();

  // --- autumn: the rake, the leaves on the lawn, the pile (and the gust that scatters it)
  var LEAFD = "M -8 0 C -4 -7, 4 -7, 8 0 C 4 7, -4 7, -8 0 Z", LCOL = ["#d9893b", "#c96f2e", "#e5a84a", "#b85a2a"];
  var autG = el("g", {}, props);
  var pileBase = el("path", { fill: "#cf7631", stroke: INK, "stroke-width": 3.5, "stroke-linejoin": "round" }, autG);
  var PX = 1060, NG = 18, NP = 26;
  var GL = [], PL = [];
  for (var i = 0; i < NG; i++) GL.push({ e: el("path", { d: LEAFD, fill: LCOL[i % 4], stroke: INK, "stroke-width": 1.4 }, autG), x0: 1112 + hash(i * 1.7) * 100, y0: G0 + 4 + hash(i * 3.1) * 16, r: hash(i * 5.3) * 180, s: i % 3 });
  for (i = 0; i < NP; i++) {
    var a = hash(i * 2.9) * Math.PI, rr = Math.sqrt(hash(i * 4.1));
    PL.push({ e: el("path", { d: LEAFD, fill: LCOL[(i + 1) % 4], stroke: INK, "stroke-width": 1.4 }, autG), u: Math.cos(a) * rr, v: Math.sin(a) * rr, r: hash(i * 6.7) * 360,
      vx: 700 + hash(i * 8.3) * 700, vy: -380 + hash(i * 9.1) * 260, sp: (hash(i * 3.3) - 0.5) * 1400 });
  }
  var rakeG = el("g", {}, figG);   // re-parented after the rigs (in front of Sam's body, behind nothing)
  var rakeInk = el("path", { stroke: INK, "stroke-width": 9, "stroke-linecap": "round", fill: "none" }, rakeG);
  var rakeH = el("path", { stroke: "#b88a55", "stroke-width": 5, "stroke-linecap": "round", fill: "none" }, rakeG);
  var rakeHead = el("path", { stroke: INK, "stroke-width": 4, "stroke-linecap": "round", fill: "none" }, rakeG);
  var STICK = [0, 1, 2, 3, 4].map(function (k) { return el("path", { d: LEAFD, fill: LCOL[k % 4], stroke: INK, "stroke-width": 1.4 }, null); });

  // --- spring: Pip's nest with three eggs -> chicks (on a branch of the apple tree, in front of the canopy)
  var NEST = [872, 458];
  var nestG = el("g", {}, props);
  el("path", { d: ip([[978, 560], [940, 522], [900, 480], [828, 454]], { wobble: 0.5, step: 12, seed: 120 }), stroke: INK, "stroke-width": 15, "stroke-linecap": "round", fill: "none" }, nestG);
  el("path", { d: ip([[978, 560], [940, 522], [900, 480], [828, 454]], { wobble: 0.5, step: 12, seed: 120 }), stroke: BARK, "stroke-width": 9, "stroke-linecap": "round", fill: "none" }, nestG);
  var eggG = el("g", {}, nestG), EGGS = [], CHICKS = [], SHELLS = [];
  [-20, 0, 20].forEach(function (dx, k) {
    var e = el("g", {}, eggG);
    el("ellipse", { cx: 0, cy: 0, rx: 10, ry: 13, fill: "#eaf3f7", stroke: INK, "stroke-width": 2.5 }, e);
    [[-4, -4], [3, 2], [-2, 6]].forEach(function (s) { el("circle", { cx: s[0], cy: s[1], r: 1.6, fill: "#8fb4c4" }, e); });
    var crack = el("path", { d: "M -9 -2 L -4 -6 L 0 -1 L 4 -6 L 9 -2", stroke: INK, "stroke-width": 1.8, fill: "none", "stroke-linejoin": "round" }, e);
    EGGS.push({ g: e, crack: crack, dx: dx });
    var c = el("g", {}, null), cb = el("g", {}, c);
    el("circle", { cx: 0, cy: 0, r: 12, fill: "#f6d860", stroke: INK, "stroke-width": 2.5 }, cb);
    el("path", { d: "M -3 -11 C -3 -17, 2 -18, 3 -14 M 1 -11 C 3 -16, 7 -15, 7 -12", stroke: INK, "stroke-width": 1.6, fill: "none", "stroke-linecap": "round" }, cb);
    var eye = el("circle", { cx: 4, cy: -3, r: 2.2, fill: INK }, cb);
    var bt = el("path", { d: "M 9 -1 L 17 1 L 9 3 Z", fill: "#f0a23a", stroke: INK, "stroke-width": 1.4, "stroke-linejoin": "round" }, cb);
    var bb = el("path", { d: "M 9 3 L 15 4 L 9 5 Z", fill: "#e08a2e", stroke: INK, "stroke-width": 1.2, "stroke-linejoin": "round" }, cb);
    var shellB = el("path", { d: "M -10 2 L -6 -2 L -2 3 L 2 -2 L 6 3 L 10 -1 C 10 10, 4 15, 0 15 C -4 15, -10 10, -10 2 Z", fill: "#eaf3f7", stroke: INK, "stroke-width": 2.2 }, c);
    CHICKS.push({ g: c, body: cb, bb: bb, eye: eye, dx: dx });
    var top = el("path", { d: "M -10 0 L -6 -4 L -2 1 L 2 -4 L 6 1 L 10 -3 C 9 -10, 4 -14, 0 -14 C -4 -14, -9 -10, -10 0 Z", fill: "#eaf3f7", stroke: INK, "stroke-width": 2.2 }, null);
    SHELLS.push(top);
  });
  var chickLayer = el("g", {}, nestG); CHICKS.forEach(function (c) { chickLayer.appendChild(c.g); });
  var shellLayer = el("g", {}, nestG); SHELLS.forEach(function (s) { shellLayer.appendChild(s); });
  // the nest bowl over the lower halves
  el("path", { d: ip([[NEST[0] - 44, NEST[1] - 4], [NEST[0] - 36, NEST[1] + 16], [NEST[0], NEST[1] + 24], [NEST[0] + 36, NEST[1] + 16], [NEST[0] + 44, NEST[1] - 4]], { wobble: 0.6, step: 10, seed: 121 }) + " Z", fill: "#a77d4c", stroke: INK, "stroke-width": 3, "stroke-linejoin": "round" }, nestG);
  for (var q = 0; q < 5; q++) el("path", { d: "M " + (NEST[0] - 40 + q * 4) + " " + (NEST[1] + 2 + q * 3) + " Q " + NEST[0] + " " + (NEST[1] + 10 + q * 3) + " " + (NEST[0] + 40 - q * 4) + " " + (NEST[1] + 2 + q * 3), stroke: "#6e5032", "stroke-width": 2, fill: "none" }, nestG);
  var nestFx = Kit.emanata(nestG);

  // ---------- characters ----------
  var CS = DATA.chars.sam, CY = DATA.chars.layla;
  var bagG = el("g", {}, figG), bag = Kit.bag(bagG);
  var tailG = el("g", {}, figG);                         // the finished scarf's long end, trailing over the snow
  var tailInk = el("path", { fill: "none", stroke: INK, "stroke-width": 30, "stroke-linecap": "round", "stroke-linejoin": "round" }, tailG);
  var tailA = el("path", { fill: "none", stroke: TEAL, "stroke-width": 24, "stroke-linecap": "butt", "stroke-linejoin": "round" }, tailG);
  var tailB = el("path", { fill: "none", stroke: RED, "stroke-width": 24, "stroke-linecap": "butt", "stroke-linejoin": "round", "stroke-dasharray": "16 16" }, tailG);
  var tailFr = el("path", { fill: "none", stroke: INK, "stroke-width": 3, "stroke-linecap": "round" }, tailG);

  // expressions [mouth, brow, eye]
  var EX_S = Kit.expr([[0, F.happy], [tLookUp, [0.55, 0.5, 1.15], 0.2], [tKnock - 0.3, [0.4, -0.2, 1.0], 0.15], [tBonk, F.shock, 0.06],
    [tBonk + 0.35, [0.0, 0.7, 0.55], 0.15], [tCatch - 0.1, F.excited, 0.15], [tBite + 0.2, [0.9, 0.35, 0.55], 0.2],
    [tAut, [0.3, -0.5, 1.0], 0.01], [tProud, F.proud, 0.15], [tGust - 0.05, [-0.45, -0.4, 0.2], 0.08], [tGlare - 0.1, [-0.5, -1.0, 0.72], 0.01],
    [tWin, [0.25, 0.25, 1.0], 0.01], [tShiver - 0.1, [-0.3, 1.0, 1.35], 0.1], [tShiver + 0.9, [0.1, 0.5, 1.05], 0.3],
    [T1 + 0.4, [0.3, 0.55, 1.1], 0.3], [L.l2.start, [0.6, 0.85, 0.42], 0.25]]);
  var EX_S2 = Kit.expr([[0, F.warm], [tInhale, [0.1, 0.2, 0.15], 0.2], [L.l3.start - 0.05, [0.6, 0.35, 0.82], 0.25],
    [L.l4.start + 0.2, [0.55, 0.45, 1.0], 0.25], [L.l5.start, [0.65, 0.2, 0.85], 0.25], [tTurn + 0.3, F.warm, 0.4]]);
  var EX_L = Kit.expr([[0, [0.45, 0.1, 0.95]], [tSip, [0.5, 0.3, 0.2], 0.15], [tSip + 0.9, [0.45, 0.15, 0.95], 0.2],
    [L.l1.start - 0.1, [0.6, 0.3, 0.92], 0.25],
    [tSpr, F.calm, 0.01], [tInhale + 0.25, [0.0, 0.7, 1.25], 0.15], [tBrace, [-0.25, -0.3, 0.12], 0.12], [L.l3.end + 0.1, [0.05, 0.8, 1.25], 0.2],
    [L.l4.start - 0.05, [0.25, 0.9, 1.2], 0.2], [L.l5.start + 0.4, [0.4, 0.4, 1.0], 0.3], [tTurn, [0.62, 0.3, 0.92], 0.4]]);
  var lipS = Talk.mouth(CS.mouth), lipL = Talk.mouth(CY.mouth);
  function mouthS(t) {
    if (t > tBite + 0.2 && t < tAut) return Math.floor((t - tBite) / 0.13) % 2 ? "B" : "A";       // chewing
    if (t > tInhale && t < L.l3.start - 0.05) return "A";
    var on = ["l2", "l3", "l5"].some(function (k) { return t > L[k].start - 0.08 && t < L[k].end + 0.08; });
    return on ? lipS(t) : "X";
  }
  function mouthL(t) {                                                                  // her mouth moves only on her own lines
    var on = (t > L.l1.start - 0.08 && t < L.l1.end + 0.08) || (t > L.l4.start - 0.08 && t < L.l4.end + 0.08);
    return on ? lipL(t) : "X";
  }
  var BLINK_S = CS.blinks.filter(function (b) { var b0 = b[0] != null ? b[0] : b; return !(b0 > tBonk && b0 < tCatch) && !(b0 > tGust - 0.2 && b0 < tGlare); })
    .concat([[tLeaf + 0.32, 0.1]]);
  var BLINK_L = CY.blinks.filter(function (b) { var b0 = b[0] != null ? b[0] : b; return !(b0 > tSip - 0.3 && b0 < tSip + 1.1) && !(b0 > tBrace - 0.3 && b0 < L.l3.end + 0.3); });

  var RL = SF.rig(figG, { scale: LL.scale, head: LL.head, ink: LL.ink, color: LL.color, accessories: LL.accessories, backInk: "#5a5751",
    expr: EX_L, blinks: BLINK_L, mouth: mouthL, mouthFill: "#8e352d", lineComp: 0.6, seed: 2 });
  var RS = SF.rig(figG, { scale: LS.scale, head: LS.head, ink: LS.ink, color: LS.color, accessories: LS.accessories, backInk: "#5a5751",
    expr: EX_S, blinks: BLINK_S, mouth: mouthS, mouthFill: "#8e352d", lineComp: 0.6, seed: 1 });
  var RS2 = SF.rig(figG, { scale: LS.scale, head: LS.head, ink: LS.ink, color: LS.color, accessories: ["scarf", { type: "tuft", color: "#9b9b9b" }], backInk: "#5a5751",
    expr: EX_S2, blinks: BLINK_S, mouth: mouthS, mouthFill: "#8e352d", lineComp: 0.6, seed: 1 });
  figG.appendChild(rakeG);
  var stickG = el("g", {}, figG); STICK.forEach(function (s) { stickG.appendChild(s); });
  // the cocoon (winter): striped wraps over Sam's body + a hood with an eye slit (drawn over the rig)
  var coG = el("g", {}, figG);
  var bodyInk = el("path", { fill: "none", stroke: INK, "stroke-linecap": "round", "stroke-linejoin": "round" }, coG);
  var bodyA = el("path", { fill: "none", stroke: TEAL, "stroke-linecap": "round", "stroke-linejoin": "round" }, coG);
  var bodyB = el("path", { fill: "none", stroke: RED, "stroke-linecap": "butt", "stroke-linejoin": "round" }, coG);
  var hoodClip = el("clipPath", { id: "p10hood" }, document.querySelector("#stage defs")), hoodClipP = el("path", {}, hoodClip);
  var hood = el("path", { fill: TEAL, stroke: INK, "fill-rule": "evenodd", "stroke-linejoin": "round" }, coG);
  var hoodStripes = el("path", { fill: "none", stroke: RED, "clip-path": "url(#p10hood)" }, coG);
  var hoodRim = el("path", { fill: "none", stroke: INK, "stroke-linejoin": "round" }, coG);
  var bulge = el("ellipse", { fill: TEAL, stroke: INK }, coG);
  var snowCap = el("path", { fill: "#fbfdff", stroke: INK, "stroke-width": 3, "stroke-linejoin": "round" }, coG);
  var mugG = el("g", {}, figG), mug = Props.mug(mugG);
  var vapG = el("g", {}, figG), VAP = []; for (i = 0; i < 9; i++) VAP.push(el("circle", { fill: "#ffffff", stroke: INK, "stroke-width": 1.5, "stroke-opacity": 0.35 }, vapG));
  var apple = Props.apple(figG);
  var pip = Props.pip(props);
  var fx = Kit.emanata(front);

  // ---------- helpers ----------
  function dist(a, b) { return Math.hypot(a[0] - b[0], a[1] - b[1]); }
  /* move a hand toward a world target (weight wgt), elbow by IK; bone lengths kept */
  function reach(J, side, tgt, wgt) {
    if (wgt <= 0) return;
    var sh = J["sh" + side], e = J["el" + side], ha = J["ha" + side], l1 = dist(sh, e), l2 = dist(e, ha);
    var h = [lerp(ha[0], tgt[0], wgt), lerp(ha[1], tgt[1], wgt)], d = dist(h, sh), mx = (l1 + l2) * 0.985;
    if (d > mx) h = [sh[0] + (h[0] - sh[0]) / d * mx, sh[1] + (h[1] - sh[1]) / d * mx];
    J["ha" + side] = h; J["el" + side] = Kit.ik(sh, h, l1, l2, -(J._f || 1));
  }
  /* sit the (seated mocap) figure on a seat height: hips on the seat, feet on the ground, knees by IK */
  function seatOn(J, seatY, footX) {
    var f = J._f || 1, lens = [["hipR", "knR", "ftR"], ["hipL", "knL", "ftL"]].map(function (k) { return [dist(J[k[0]], J[k[1]]), dist(J[k[1]], J[k[2]])]; });
    var dy = seatY - J.hips[1]; SF.JOINTS.forEach(function (j) { J[j][1] += dy; });
    [["hipR", "knR", "ftR"], ["hipL", "knL", "ftL"]].forEach(function (k, i) {
      J[k[2]] = [J.hips[0] + f * (footX + i * 6), G0 - 2];
      J[k[1]] = Kit.ik(J.hips, J[k[2]], lens[i][0], lens[i][1], f);
    });
  }
  function kick(J, tgt, wgt) {
    var f = J._f || 1, l1 = dist(J.hipR, J.knR), l2 = dist(J.knR, J.ftR), h = J.hips;
    var p = [lerp(J.ftR[0], tgt[0], wgt), lerp(J.ftR[1], tgt[1], wgt)], d = dist(p, h), mx = (l1 + l2) * 0.99;
    if (d > mx) p = [h[0] + (p[0] - h[0]) / d * mx, h[1] + (p[1] - h[1]) / d * mx];
    J.ftR = p; J.knR = Kit.ik(h, p, l1, l2, f);
  }
  function shakeUpper(J, dx, dy) { SF.UPPER.concat(["chest"]).forEach(function (j) { J[j][0] += dx; J[j][1] += dy; }); }
  function headOf(J, R) { var hy = J.head[1] - R.HR * 0.32; return [J.head[0], hy]; }
  function mouthOf(J, R) { var h = headOf(J, R), f = J._f || 1; return [h[0] + f * R.HR * 0.5, h[1] + R.HR * 0.42]; }

  // rake geometry (autumn): head on the lawn in front of Sam, handle up toward him
  var RX_NEAR = 1196, RX_FAR = 1112;
  function rakeAt(t) {
    var k = (t - tRake0) / RP, n = Math.floor(k), p = k - n, rx = RX_NEAR, lift = 0;
    if (k >= 0 && k < NSTROKE) {
      if (p < 0.55) rx = lerp(RX_NEAR, RX_FAR, U.smooth(p / 0.55));
      else { var q = (p - 0.55) / 0.45; rx = lerp(RX_FAR, RX_NEAR, U.smooth(q)); lift = Math.sin(q * Math.PI) * 16; }
    }
    if (t > tGust - 0.1) rx = RX_NEAR + 18 * ramp(t, tGust - 0.1, tGust + 0.2);
    return { R: [rx, G0 - 5 - lift], dir: [0.62, -0.785], len: 250, n: n, p: p, k: k };
  }
  function handlePoint(rk, s) { return [rk.R[0] + rk.dir[0] * s, rk.R[1] + rk.dir[1] * s]; }
  function gripAt(rk, sh, target, s0, s1) {
    var best = s0, bd = 1e9; for (var s = s0; s <= s1; s += 3) { var d = Math.abs(dist(handlePoint(rk, s), sh) - target); if (d < bd) { bd = d; best = s; } }
    return handlePoint(rk, best);
  }
  function pileK(t) { return clamp((t - tRake0) / (RP * NSTROKE), 0, 1); }

  // ---------- joints ----------
  var CROUCH_S2 = function (t) { return 1 - ramp(t, tStand, tStood); };
  function jointsSam(t) {
    var se = season(t), J;
    if (se === "summer") {
      J = MS_SUM.joints(t); var f = J._f || 1;
      Talk.idle(J, t, "sam", { amp: 1.0 });
      var lu = ramp(t, tLookUp, tLookUp + 0.25) * (1 - ramp(t, tKnock - 0.25, tKnock - 0.05)); J.head[0] -= f * 5 * lu; J.head[1] -= 4 * lu;
      var kw = ramp(t, tKnock - 0.3, tKnock - 0.02) * (1 - ramp(t, tKnock + 0.15, tKnock + 0.45));     // a sharp KICK at the trunk
      if (kw > 0) { kick(J, [J.hips[0] + f * 165, 660], kw); Kit.lean(MS_SUM, J, -12, 0, kw); Talk.pose(MS_SUM, J, "shrug", 0.5 * kw, null, t); }
      // the bonk: squash + recoil, then wobbly
      var bk = bump(t, tBonk - 0.02, 0.3); J.head[1] += 12 * bk; Kit.lean(MS_SUM, J, -6, 6, bk);
      var wob = ramp(t, tBonk + 0.1, tBonk + 0.2) * (1 - ramp(t, tCatch - 0.25, tCatch)); Kit.lean(MS_SUM, J, Math.sin(t * 9) * 5 * wob, 0, 1);
      var cw = ramp(t, tCatch - 0.3, tCatch - 0.05) * (1 - ramp(t, tBite - 0.25, tBite));
      Talk.act(MS_SUM, J, t, [{ g: "explain", t0: tCatch - 0.3, t1: tBite + 0.05, ease: 0.2 }]);
      Kit.hop(J, bump(t, tCatch - 0.05, 0.3) * 8);
      var bw = ramp(t, tBite - 0.25, tBite) * (1 - ramp(t, tBite + 0.5, tBite + 0.75));
      if (bw > 0) { var m = mouthOf(J, RS); reach(J, "R", [m[0] + f * 22, m[1] + 22], bw); }
      var hold = ramp(t, tBite + 0.5, tBite + 0.75); if (hold > 0) Talk.pose(MS_SUM, J, "explain", hold * 0.8, null, t);
      return J;
    }
    if (se === "autumn") {
      J = MS_AUT.joints(t); f = J._f || 1;
      Talk.idle(J, t, "sam", { amp: 0.8 });
      var rk = rakeAt(t), pushW = rk.k >= 0 && rk.k < NSTROKE ? Math.sin(Math.PI * clamp(rk.p / 0.55, 0, 1)) * (rk.p < 0.55 ? 1 : 0) : 0;
      Kit.lean(MS_AUT, J, 6 + 10 * pushW, 4 + 4 * pushW, ramp(t, tAut, tRake0) * (1 - ramp(t, tProud - 0.05, tProud + 0.2)));
      var proud = ramp(t, tProud, tProud + 0.2) * (1 - ramp(t, tGust - 0.05, tGust + 0.05)); Kit.lean(MS_AUT, J, -8, -3, proud);
      var gust = ramp(t, tGust, tGust + 0.12) * (1 - ramp(t, tGlare - 0.2, tGlare)); Kit.lean(MS_AUT, J, -16 + Math.sin(t * 40) * 3, 2, gust);
      var g1 = gripAt(rk, J.shR, 88, 40, 230), g2 = gripAt(rk, J.shL, 48, 80, 248);
      reach(J, "R", g1, 1); reach(J, "L", g2, 1);
      if (proud > 0) { J.head[1] -= 3 * proud; }
      var lf = bump(t, tLeaf - 0.05, 0.25); J.head[1] += 4 * lf;
      return J;
    }
    if (se === "winter") {
      J = MS_WIN.joints(t); f = J._f || 1;
      seatOn(J, rock.top - 2, 46);
      Talk.idle(J, t, "sam", { amp: 0.6 });
      Talk.accents(J, t, CS.accents.filter(function (a) { return a > tWin && a < tSpr; }), 2.2);
      MS_WIN.pose(J, { elR: ["neck", 18, 60], haR: ["neck", 40, 98], elL: ["neck", 10, 62], haL: ["neck", 30, 100] }, 1);
      var sv = bump(t, tShiver - 0.05, 0.75) + 0.25 * bump(t, tWin + 1.6, 0.4) + 0.25 * bump(t, T1 + 1.0, 0.35);
      shakeUpper(J, Math.sin(t * 95) * 5 * sv, Math.cos(t * 77) * 2 * sv);
      J.head[1] += 3 * ramp(t, tWin, tShiver) * (1 - ramp(t, tShiver, tShiver + 0.3));   // the snow cap weighs on him
      return J;
    }
    J = MS_SPR.joints(t); f = J._f || 1;
    var walking = t > tTurn;
    Talk.idle(J, t, "sam2", { amp: walking ? 0.3 : 0.8 });
    Talk.accents(J, t, CS.accents.filter(function (a) { return a > tSpr; }), 2.4);
    Talk.act(MS_SPR, J, t, [{ g: "explain", t0: w("l5", 2).t0 - 0.2, t1: L.l5.end + 0.1, amp: 0.7 }]);
    Talk.beats(MS_SPR, J, t, CS.beats.filter(function (b) { return b > L.l5.start; }), { amp: 0.6 });
    Talk.nods(J, t, [L.l4.end + 0.1], 4);
    if (!walking) Kit.lean(MS_SPR, J, 5, 3, 1);                                       // older: a slight stoop
    var cw2 = CROUCH_S2(t);
    if (cw2 > 0) {
      var inh = ramp(t, tInhale, tInhale + 1.0) * (1 - ramp(t, L.l3.start - 0.12, L.l3.start + 0.12));   // a HUGE breath...
      Kit.crouch(MS_SPR, J, cw2 * (1 - 0.55 * inh), { hands: 0.55 * cw2 * (1 - inh) });                 // rises up on his knees
      Kit.lean(MS_SPR, J, -26 * inh, -34 * inh, 1); J.head[1] -= 8 * inh; J.head[0] -= (J._f || 1) * 6 * inh;
      if (inh > 0) Talk.pose(MS_SPR, J, "celebrate", 0.75 * inh, null, t);                            // arms out, chest up
      var mt = [M2 - 16, G0 - 32];
      var pl = ramp(t, tPlant - 0.3, tPlant) * (1 - ramp(t, tPlant + 0.7, tPlant + 1.0));
      if (pl > 0) reach(J, "R", [mt[0], mt[1] + 6 * bump(t, tPlant + 0.05, 0.3)], pl * cw2);
      var pt = ramp(t, tPlant + 1.1, tPlant + 1.3) * (1 - ramp(t, tPlant + 2.0, tPlant + 2.2)) + ramp(t, tPat - 0.25, tPat) * (1 - ramp(t, tPat + 0.75, tPat + 1.0));
      var bob = bump(t, tPlant + 1.3, 0.3) + bump(t, tPlant + 1.65, 0.3) + bump(t, tPat, 0.3) + bump(t, tPat + 0.38, 0.3);
      if (pt > 0) reach(J, "R", [mt[0] - 14, mt[1] - 26 + 22 * bob], Math.min(1, pt) * cw2);
    }
    return J;
  }
  function jointsLayla(t) {
    var se = season(t), J, f;
    if (se === "winter") {
      J = ML_WIN.joints(t); f = J._f || 1;
      seatOn(J, stool.seatY - 2, 40);
      Talk.idle(J, t, "layla", { amp: 0.7 });
      Talk.accents(J, t, CY.accents, 2.0);
      ML_WIN.pose(J, { elR: ["neck", 16, 58], haR: ["neck", 46, 40], elL: ["neck", 8, 60], haL: ["neck", 40, 46] }, 1);
      var sp = ramp(t, tSip - 0.3, tSip) * (1 - ramp(t, tSip + 0.8, tSip + 1.1));
      if (sp > 0) { var m = mouthOf(J, RL); reach(J, "R", [m[0] + f * 30, m[1] + 18], sp); reach(J, "L", [m[0] + f * 22, m[1] + 26], sp); J.head[0] -= f * 3 * sp; J.head[1] -= 2 * sp; }
      var gw = ramp(t, w("l1", 0).t0 - 0.2, w("l1", 0).t0 + 0.1) * (1 - ramp(t, L.l1.end + 0.3, L.l1.end + 0.7));   // lifts the mug toward him
      if (gw > 0) { J.haR[0] += f * 14 * gw; J.haR[1] -= 10 * gw; J.haL[0] += f * 14 * gw; J.haL[1] -= 10 * gw; }
      Talk.nods(J, t, [L.l2.end - 0.2], 4);
      return J;
    }
    J = ML_SPR.joints(t); f = J._f || 1;
    Talk.idle(J, t, "layla", { amp: 0.8 });
    Talk.accents(J, t, CY.accents, 2.0);
    Talk.act(ML_SPR, J, t, [{ g: "stop", t0: tBrace - 0.05, t1: L.l3.end + 0.35, ease: 0.15, easeOut: 0.35, amp: 0.75 },
      { g: "palmsUp", t0: w("l4", 1).t0 - 0.2, t1: L.l4.end + 0.3, amp: 0.7 }]);
    var br = ramp(t, tBrace - 0.05, tBrace + 0.12) * (1 - ramp(t, L.l3.end, L.l3.end + 0.35));
    Kit.lean(ML_SPR, J, -10 * br, 2 * br, 1); J.head[1] += 3 * br;
    Talk.nods(J, t, [L.l5.end - 0.4], 4.5);
    return J;
  }

  // ---------- Pip ----------
  var PIP_NEST = [NEST[0] + 42, NEST[1] - 26], PIP_GROUND = [M2 + 66, G0 - 34];
  function pipState(t) {
    var se = season(t), ch = 0;
    function chirps(list) { list.forEach(function (c) { if (t > c && t < c + 0.18) ch = (t - c) / 0.18; }); }
    if (se === "summer") {
      chirps([tBonk + 0.35, tBonk + 0.55, tBonk + 0.75]);
      return { x: bh.perch[0], y: bh.perch[1], f: -1, t: t, pose: t > tBonk + 0.3 && t < tBonk + 1.0 ? "bob" : "perch", bpm: 300, chirp: ch, seed: 1 };
    }
    if (se === "autumn") return { x: bh.roof[0], y: bh.roof[1], f: -1, t: t, pose: "perch", seed: 1, hidden: t > tGust + 0.15 };
    if (se === "winter") return { x: bh.perch[0], y: bh.perch[1], f: -1, t: t, s: 1.12, pose: t < T1 ? "sleep" : "perch", seed: 1 };
    if (t < tPipIn) {
      chirps([tH[0] + 0.25, tH[1] + 0.3, tH[2] + 0.35, tH[2] + 0.6]);
      var tilt = ramp(t, tH[1] + 0.6, tH[1] + 0.8) * (1 - ramp(t, tH[2] + 0.1, tH[2] + 0.3)) * 26;
      return { x: PIP_NEST[0], y: PIP_NEST[1], f: -1, t: t, pose: "perch", chirp: ch, tilt: tilt, look: 0.5, seed: 1 };
    }
    if (t < tPipLand) {
      var p = U.smooth(clamp((t - tPipIn) / (tPipLand - tPipIn), 0, 1)), from = [M2 + 380, G0 - 330];
      return { x: lerp(from[0], PIP_GROUND[0], p), y: lerp(from[1], PIP_GROUND[1], p) - Math.sin(Math.PI * p) * 50, f: -1, t: t, pose: "fly" };
    }
    chirps([tPipLand + 0.3, tPipLand + 0.62]);
    return { x: PIP_GROUND[0], y: PIP_GROUND[1], f: -1, t: t, pose: t < tPipLand + 0.25 ? "hop" : "perch", hop: (t - tPipLand) / 0.25, chirp: ch, tilt: ramp(t, tPipLand + 0.9, tPipLand + 1.1) * 20, seed: 1 };
  }

  // ---------- camera ----------
  var H0 = { sam: G0 - Kit.headInfo(MS_SUM.joints(0), RS, G0).top, layla: G0 - Kit.headInfo(ML_SPR.joints(0), RL, G0).top };
  function resolve(id, t) {
    if (id === "mound2") return { head: [M2, G0 - 70], top: G0 - 130, feet: G0, f: 1, h: H0.sam };
    if (id === "nest") return { head: NEST, top: NEST[1] - 60, feet: NEST[1] + 30, f: -1, h: 120 };
    var c = id === "sam" ? Kit.headInfo(jointsSam(t), season(t) === "spring" ? RS2 : RS, G0) : Kit.headInfo(jointsLayla(t), RL, G0);
    if (id === "sam" && season(t) === "winter") c.top -= RS.HR * 0.2;                // the hood + snow cap
    c.h = H0[id]; return c;
  }
  var cam = Shots.camera(SHOTS, { width: 1920, height: 1080, duration: DUR, resolve: resolve });
  var IRIS_AT = cam.toScreen([M2 - 16, G0 - 52], cam.at(tIris + 0.01));
  var tfx = Shots.fx(document.getElementById("fxg"), [
    { t: tIris, type: "irisOut", dur: 0.9, to: 190, at: IRIS_AT },
    { t: tIris + 2.05, type: "irisOut", dur: 0.35, from: 190, to: 0, at: IRIS_AT }]);

  // ---------- cards (screen space) ----------
  var cardEl = document.getElementById("card");
  var c1El = cardEl.querySelector(".c1"), c2El = cardEl.querySelector(".c2"), c3El = cardEl.querySelector(".c3");
  var cards = Kit.cards(cardEl, [
    { t0: -1, t1: tSum, c1: "Years later...", fade: 0.25, wipe: true },
    { t0: tCard, t1: DUR + 1, c1: "Sam & Layla", c2: "New episode soon!", fade: 0.3, wipe: true, pop: tCard + 1.15 }]);
  var cg = Kit.cardSvg(cardEl);
  // "Years later...": a desk calendar sheds its pages
  var calG = el("g", {}, cg), CAL = [960, 760];
  el("path", { d: ip([[CAL[0] - 96, CAL[1] - 70], [CAL[0] + 96, CAL[1] - 70], [CAL[0] + 96, CAL[1] + 110], [CAL[0] - 96, CAL[1] + 110]], { wobble: 0.5, step: 14, seed: 140, closed: true }), fill: "#fffdf6", stroke: INK, "stroke-width": 5, "stroke-linejoin": "round" }, calG);
  el("path", { d: ip([[CAL[0] - 96, CAL[1] - 70], [CAL[0] + 96, CAL[1] - 70], [CAL[0] + 96, CAL[1] - 22], [CAL[0] - 96, CAL[1] - 22]], { wobble: 0.5, step: 14, seed: 141, closed: true }), fill: RED, stroke: INK, "stroke-width": 5, "stroke-linejoin": "round" }, calG);
  [-50, 50].forEach(function (dx) { el("path", { d: "M " + (CAL[0] + dx) + " " + (CAL[1] - 86) + " L " + (CAL[0] + dx) + " " + (CAL[1] - 56), stroke: INK, "stroke-width": 7, "stroke-linecap": "round" }, calG); });
  var calNum = el("text", { x: CAL[0], y: CAL[1] + 80, "text-anchor": "middle", "font-family": "Caveat, cursive", "font-weight": 700, "font-size": 110, fill: INK }, calG);
  var PAGES = [0, 1, 2, 3].map(function () {
    var g = el("g", {}, calG);
    el("path", { d: ip([[-90, 0], [90, 0], [90, 128], [-90, 128]], { wobble: 0.5, step: 14, seed: 142, closed: true }), fill: "#fffdf6", stroke: INK, "stroke-width": 4 }, g);
    var tx = el("text", { x: 0, y: 100, "text-anchor": "middle", "font-family": "Caveat, cursive", "font-weight": 700, "font-size": 100, fill: INK }, g);
    return { g: g, tx: tx };
  });
  var tFlip0 = 0.75, FLIP = 0.16;
  // END card: an underline + Pip flying in and hopping along the title
  var endG = el("g", {}, cg);
  var under = el("path", { d: ip([[170, 382], [520, 392], [900, 386], [1120, 378]], { wobble: 1.0, step: 30, seed: 150 }), stroke: RED, "stroke-width": 9, "stroke-linecap": "round", fill: "none" }, endG);
  var underLen = 960; under.setAttribute("stroke-dasharray", underLen + " " + (underLen + 20));
  var cPip = Props.pip(endG), cFx = Kit.emanata(endG);
  var CP = [[-140, 330], [380, 140], [640, 128], [900, 136]];          // fly-in start, then hop spots on the title's top edge
  var tCP = [tCard + 2.0, tCard + 3.1, tCard + 4.3, tCard + 5.5];
  function cardPip(t) {
    var ch = 0;
    if (t < tCP[1]) {
      var p = U.smooth(clamp((t - tCP[0]) / (tCP[1] - tCP[0]), 0, 1));
      return { x: lerp(CP[0][0], CP[1][0], p), y: lerp(CP[0][1], CP[1][1], p) - Math.sin(Math.PI * p) * 90, f: 1, t: t, pose: "fly", s: 2.2, hidden: t < tCP[0] };
    }
    for (var k = 1; k < 3; k++) if (t >= tCP[k] && t < tCP[k] + 0.4) {
      var q = (t - tCP[k]) / 0.4;
      return { x: lerp(CP[k][0], CP[k + 1][0], q), y: lerp(CP[k][1], CP[k + 1][1], q) - Math.sin(Math.PI * q) * 60, f: 1, t: t, s: 2.2, pose: "perch" };
    }
    var at = t < tCP[2] ? CP[1] : t < tCP[3] ? CP[2] : CP[3];
    [tCP[1] + 0.35, tCP[2] + 0.55, tCP[3] + 0.3, tCP[3] + 0.6, tCP[3] + 2.2].forEach(function (c) { if (t > c && t < c + 0.18) ch = (t - c) / 0.18; });
    var land = Math.min(t - tCP[1], t >= tCP[2] + 0.4 ? t - tCP[2] - 0.4 : 9, t >= tCP[3] - 0.0 ? t - tCP[3] - 0.4 : 9);
    return { x: at[0], y: at[1], f: t > tCP[3] + 1.4 && t < tCP[3] + 2.6 ? -1 : 1, t: t, s: 2.2, pose: land >= 0 && land < 0.22 ? "hop" : "perch", hop: land / 0.22, chirp: ch, tilt: t > tCP[3] + 0.9 ? 14 : 0 };
  }

  // ---------- per-frame drawing of local props ----------
  function drawRake(t, se) {
    if (se !== "autumn") { show(rakeG, false); return; }
    show(rakeG, true);
    var rk = rakeAt(t), top = handlePoint(rk, rk.len), R = rk.R, d = "M " + U.pt(R) + " L " + U.pt(top);
    rakeInk.setAttribute("d", d); rakeH.setAttribute("d", d);
    var hd = "M " + (R[0] - 30) + " " + R[1] + " L " + (R[0] + 30) + " " + R[1];
    for (var k = 0; k < 6; k++) hd += " M " + (R[0] - 26 + k * 10.4).toFixed(1) + " " + R[1] + " l -3 10";
    rakeHead.setAttribute("d", hd);
  }
  function drawLeaves(t, se, JS) {
    show(autG, se === "autumn");
    show(stickG, se === "autumn" && t > tGust);
    if (se !== "autumn") return;
    var rk = rakeAt(t), pk = pileK(t), gk = t > tGust ? clamp((t - tGust) / 0.25, 0, 1) : 0;
    GL.forEach(function (lf, i) {
      var done = tRake0 + RP * (lf.s + 0.55), st = tRake0 + RP * lf.s, x = lf.x0;
      if (t > st && t < done) x = Math.min(lf.x0, rk.R[0] - 12 - (i % 4) * 7);
      var vis = t < done;
      lf.e.setAttribute("visibility", vis ? "visible" : "hidden");
      lf.e.setAttribute("transform", "translate(" + x.toFixed(1) + " " + lf.y0.toFixed(1) + ") rotate(" + lf.r.toFixed(0) + ") scale(1.25 0.6)");
    });
    var s = pk, RXp = 74 * Math.sqrt(s), RYp = 58 * s * (1 - gk);
    pileBase.setAttribute("d", s > 0.02 && gk < 1 ? ip([[PX - RXp, G0 + 6], [PX - RXp * 0.6, G0 + 6 - RYp * 0.8], [PX, G0 + 6 - RYp], [PX + RXp * 0.6, G0 + 6 - RYp * 0.8], [PX + RXp, G0 + 6]], { wobble: 0.6, step: 10, seed: 130 }) + " Z" : "");
    PL.forEach(function (lf, j) {
      var on = j < NP * s + 0.5 && s > 0.02, x = PX + lf.u * RXp * 0.92, y = G0 + 4 - lf.v * RYp * 0.95, r = lf.r;
      if (t > tGust) {
        var dt = Math.max(0, t - tGust - j * 0.012); x = PX + lf.u * 70 + lf.vx * dt; y = G0 - lf.v * 52 + lf.vy * dt + 260 * dt * dt + Math.sin(dt * 9 + j) * 14; r += lf.sp * dt;
      }
      lf.e.setAttribute("visibility", on || t > tGust ? "visible" : "hidden");
      lf.e.setAttribute("transform", "translate(" + x.toFixed(1) + " " + y.toFixed(1) + ") rotate(" + r.toFixed(0) + ") scale(1.35)");
    });
    // leaves that stick to Sam (and the very last one, which lands on his head during the glare)
    var hs = headOf(JS, RS), spots = [[hs[0] - 6, hs[1] - RS.HR * 1.02, -20], [JS.chest[0] + 6, JS.chest[1] + 8, 40], [JS.elR[0], JS.elR[1], 100], [JS.hips[0] - 4, JS.hips[1] + 18, 160], [hs[0] + 10, hs[1] - RS.HR * 1.1, 10]];
    STICK.forEach(function (e, k) {
      var ta = k < 4 ? tGust + 0.28 + k * 0.06 : tLeaf, from = k < 4 ? [PX + 40, G0 - 60 - k * 20] : [hs[0] - 60, hs[1] - 330], p = clamp((t - (k < 4 ? tGust : tLeaf - 1.2)) / (ta - (k < 4 ? tGust : tLeaf - 1.2)), 0, 1);
      var x = lerp(from[0], spots[k][0], p) + (k === 4 ? Math.sin(p * 9) * 36 * (1 - p) : 0), y = lerp(from[1], spots[k][1], p), r = spots[k][2] + (1 - p) * 300;
      var on = k < 4 ? t > tGust : t > tLeaf - 1.2;
      e.setAttribute("visibility", on ? "visible" : "hidden");
      e.setAttribute("transform", "translate(" + x.toFixed(1) + " " + y.toFixed(1) + ") rotate(" + r.toFixed(0) + ") scale(1.3)");
    });
  }
  function scarfPath(pts) { return ip(pts, { wobble: 0.5, step: 10, seed: 5 }); }
  function drawCocoon(t, se, JS) {
    var on = se === "winter";
    show(coG, on); show(tailG, on);
    if (!on) return;
    var f = JS._f || 1, HR = RS.HR, h = headOf(JS, RS), kn = [(JS.knR[0] + JS.knL[0]) / 2, (JS.knR[1] + JS.knL[1]) / 2], ft = [(JS.ftR[0] + JS.ftL[0]) / 2, (JS.ftR[1] + JS.ftL[1]) / 2];
    var neck = [JS.neck[0], JS.neck[1] - HR * 0.15], low = [lerp(kn[0], ft[0], 0.62), lerp(kn[1], ft[1], 0.62)];
    var d = "M " + U.pt(neck) + " L " + U.pt(JS.chest) + " L " + U.pt([JS.hips[0], JS.hips[1] - 4]) + " L " + U.pt(kn) + " L " + U.pt(low);
    var W = HR * 1.85;
    bodyInk.setAttribute("d", d); bodyInk.setAttribute("stroke-width", (W + 7).toFixed(1));
    bodyA.setAttribute("d", d); bodyA.setAttribute("stroke-width", W.toFixed(1));
    bodyB.setAttribute("d", d); bodyB.setAttribute("stroke-width", (W - 2).toFixed(1)); bodyB.setAttribute("stroke-dasharray", (HR * 0.42).toFixed(1) + " " + (HR * 0.42).toFixed(1));
    // hood: a slightly bigger circle with an eye slit (evenodd hole) on the face side
    var R = HR * 1.16, cx = h[0] - f * HR * 0.04, cy = h[1] + HR * 0.02, n = 30, circ = [];
    for (var i = 0; i < n; i++) { var a = i / n * Math.PI * 2; circ.push([cx + Math.cos(a) * R * (1 + 0.025 * Math.sin(i * 3)), cy + Math.sin(a) * R]); }
    var sx0 = h[0] + f * HR * 0.02, sx1 = cx + f * R * 0.9, sy0 = h[1] - HR * 0.62, sy1 = h[1] + HR * 0.16;
    var slit = [[sx0, sy0 + HR * 0.08], [lerp(sx0, sx1, 0.5), sy0], [sx1, sy0 - HR * 0.04], [sx1, sy1], [lerp(sx0, sx1, 0.5), sy1 + HR * 0.04], [sx0, sy1 - HR * 0.06]];
    var cd = "M " + circ.map(U.pt).join(" L ") + " Z";
    hood.setAttribute("d", cd + " M " + slit.map(U.pt).join(" L ") + " Z"); hood.setAttribute("stroke-width", (SWk * 0.9).toFixed(2));
    hoodClipP.setAttribute("d", cd + " M " + slit.map(U.pt).join(" L ") + " Z"); hoodClipP.setAttribute("clip-rule", "evenodd");
    var sd = ""; for (i = -3; i <= 3; i++) { var yy = cy + i * HR * 0.42; sd += "M " + (cx - R * 1.2).toFixed(1) + " " + (yy + HR * 0.25).toFixed(1) + " L " + (cx + R * 1.2).toFixed(1) + " " + (yy - HR * 0.25).toFixed(1) + " "; }
    hoodStripes.setAttribute("d", sd); hoodStripes.setAttribute("stroke-width", (HR * 0.2).toFixed(1));
    hoodRim.setAttribute("d", cd + " M " + slit.map(U.pt).join(" L ") + " Z"); hoodRim.setAttribute("stroke-width", (SWk * 0.9).toFixed(2));
    // the muffled mouth: the scarf puffs out with each open mouth shape
    var ms = mouthS(t), open = { A: 0.15, B: 0.45, C: 0.75, D: 1, E: 0.85, F: 0.7, G: 0.4, H: 0.6 }[ms] || 0, mo = mouthOf(JS, RS);
    bulge.setAttribute("cx", (mo[0] + f * HR * (0.3 + 0.08 * open)).toFixed(1)); bulge.setAttribute("cy", (mo[1] + HR * 0.02).toFixed(1));
    bulge.setAttribute("rx", (HR * (0.12 + 0.26 * open)).toFixed(1)); bulge.setAttribute("ry", (HR * (0.18 + 0.26 * open)).toFixed(1));
    bulge.setAttribute("stroke-width", (SWk * 0.55).toFixed(2)); bulge.setAttribute("visibility", open > 0.01 ? "visible" : "hidden");
    // the snow cap piling up on his head, shaken off by the shiver
    var grow = ramp(t, tWin - 0.5, tShiver), fall = clamp((t - tShiver - 0.12) / 0.5, 0, 1), sh = HR * 0.55 * grow;
    var bx = cx - f * HR * 0.1 - fall * f * 40, by = cy - R + 2 + 420 * fall * fall;
    snowCap.setAttribute("d", sh > 1 ? ip([[bx - R * 0.78, by + 6], [bx - R * 0.5, by - sh * 0.8], [bx, by - sh], [bx + R * 0.5, by - sh * 0.75], [bx + R * 0.8, by + 6], [bx, by + 2]], { wobble: 0.4, step: 8, seed: 160 }) + " Z" : "");
    snowCap.setAttribute("opacity", (1 - fall).toFixed(2));
    // the finished scarf's long end: down his front, over the snow, all the way to Layla's stool (and back)
    var s0 = [neck[0] + f * HR * 0.5, neck[1] + HR * 0.4], gx = ROCKX + 80, tail = [s0, [s0[0] + f * 18, s0[1] + 60], [gx, rock.top + 50], [gx + 20, G0 - 10], [gx + 120, G0 - 6], [STOOLX - 20, G0 - 9], [STOOLX - 40, G0 - 22], [STOOLX - 120, G0 - 18]];
    var td = scarfPath(tail);
    [tailInk, tailA, tailB].forEach(function (p) { p.setAttribute("d", td); });
    tailFr.setAttribute("d", "M " + (STOOLX - 120) + " " + (G0 - 30) + " l -10 -2 M " + (STOOLX - 120) + " " + (G0 - 18) + " l -12 0 M " + (STOOLX - 120) + " " + (G0 - 6) + " l -10 2");
  }
  var SWk = 10 * LS.scale;
  function drawVapour(t, se, JS, JL) {
    show(vapG, se === "winter");
    if (se !== "winter") return;
    var puffs = [];
    L.l1.words.forEach(function (wd) { puffs.push([wd.t0, "l"]); });
    L.l2.words.forEach(function (wd) { puffs.push([wd.t0 + 0.1, "s"]); });
    [tWin + 0.6, tWin + 3.0, tWin + 5.2].forEach(function (b) { puffs.push([b, "l"]); });
    [tWin + 1.8, tWin + 4.2].forEach(function (b) { puffs.push([b, "s"]); });
    var k = 0;
    VAP.forEach(function (c) { c.setAttribute("visibility", "hidden"); });
    puffs.forEach(function (p) {
      var dt = t - p[0]; if (dt < 0 || dt > 0.9 || k > VAP.length - 3) return;
      var J = p[1] === "l" ? JL : JS, R = p[1] === "l" ? RL : RS, f = J._f || 1, m = mouthOf(J, R), off = p[1] === "s" ? R.HR * 0.6 : R.HR * 0.15;
      for (var j = 0; j < 3 && k < VAP.length; j++, k++) {
        var c = VAP[k], q = clamp(dt / 0.9 - j * 0.08, 0, 1);
        c.setAttribute("visibility", q > 0 ? "visible" : "hidden");
        c.setAttribute("cx", (m[0] + f * (off + 22 + 70 * q + j * 10)).toFixed(1)); c.setAttribute("cy", (m[1] + 4 - 10 * q - j * 3).toFixed(1));
        c.setAttribute("r", ((5 + 9 * q) * (1 - j * 0.2)).toFixed(1)); c.setAttribute("opacity", (0.85 * (1 - q)).toFixed(2));
      }
    });
  }
  function drawNest(t, se) {
    show(nestG, se === "spring");
    if (se !== "spring") return;
    var sp = null;
    EGGS.forEach(function (e, k) {
      var th = tH[k], wob = (ramp(t, th - (k === 2 ? 1.2 : 0.5), th - 0.05)) * Math.sin(t * (k === 2 ? 26 : 30) + k) * (k === 2 ? 14 : 9);
      var hatched = t >= th, x = NEST[0] + e.dx, y = NEST[1] - 6;
      e.g.setAttribute("transform", "translate(" + x + " " + y + ") rotate(" + wob.toFixed(1) + ")");
      e.g.setAttribute("visibility", hatched ? "hidden" : "visible");
      e.crack.setAttribute("visibility", t > th - 0.35 && t < th ? "visible" : "hidden");
      var c = CHICKS[k], pp = U.easeOutBack(clamp((t - th) / 0.3, 0, 1));
      c.g.setAttribute("visibility", hatched ? "visible" : "hidden");
      var look = k === 2 ? 1 : (t > tH[2] - 1.2 && t < tH[2] + 0.2 ? 1 : (k === 0 ? -1 : 1));          // the two first chicks stare at the late egg
      var cy = y - 6 * pp - Math.abs(Math.sin((t - th) * 9)) * 3 * (t > th + 0.3 ? 1 : 0);
      c.g.setAttribute("transform", "translate(" + x + " " + y + ")");
      c.body.setAttribute("transform", "translate(0 " + (cy - y).toFixed(1) + ") scale(" + (look * Math.max(0.01, pp)).toFixed(3) + " " + Math.max(0.01, pp).toFixed(3) + ")");
      var chs = [th + 0.2, th + 0.55, tH[2] + 0.5 + k * 0.12, tH[2] + 0.9 + k * 0.1, tPop + 0.3 + k * 0.1], cb = 0;
      chs.forEach(function (c0) { if (t > c0 && t < c0 + 0.16) cb = Math.sin((t - c0) / 0.16 * Math.PI); });
      c.bb.setAttribute("transform", "rotate(" + (cb * 26).toFixed(1) + " 9 3)");
      var st = SHELLS[k], dt = t - th;
      st.setAttribute("visibility", dt > 0 && dt < 0.7 ? "visible" : "hidden");
      if (dt > 0) st.setAttribute("transform", "translate(" + (x + (k - 1) * 30 * dt + 10 * dt).toFixed(1) + " " + (y - 18 - 160 * dt + 420 * dt * dt).toFixed(1) + ") rotate(" + (dt * 400 * (k === 1 ? -1 : 1)).toFixed(0) + ")");
      if (dt > 0 && dt < 0.5) sp = { x: x, y: y - 24, k: dt / 0.5, s: 0.8 };
    });
    nestFx.set({ sparkle: sp }, t);
  }

  function render(t) {
    var c = cam.apply(camG, t); Y.update(t, c);
    var se = season(t);
    var JL = jointsLayla(t), JS = jointsSam(t);
    var showL = se === "winter" || se === "spring";
    show(RL.g, showL);
    show(RS.g, se !== "spring");
    show(RS2.g, se === "spring");
    RL.set(JL, t, { zoom: c[2] });
    if (se === "spring") RS2.set(JS, t, { zoom: c[2] }); else RS.set(JS, t, { zoom: c[2] });
    SWk = 10 * LS.scale * Math.pow(c[2], -0.6);
    var fl = JL._f || 1;
    bag.set(JL.haL[0] - 4, JL.haL[1] + 6, { rot: Math.sin(t * 2) * 1.5, hidden: se !== "spring" });
    show(stoolG, se === "winter");
    show(snowW, se === "winter");
    show(orch, se === "spring");
    setSaplings(se);
    // mug in Layla's hands (winter)
    show(mugG, se === "winter");
    if (se === "winter") { var mh = [(JL.haR[0] + JL.haL[0]) / 2, (JL.haR[1] + JL.haL[1]) / 2]; mugG.setAttribute("transform", ""); mug.set(mh[0] + fl * 6, mh[1] - 8, 0.95, t); mugG.firstChild.setAttribute("transform", mugG.firstChild.getAttribute("transform") + " scale(" + fl + " 1)"); }
    // the tree + mounds
    var apples = se === "summer" ? 1 : se === "autumn" ? 0.45 : 0;
    tree.set(1, t, { season: se, apples: apples, shake: t > tKnock && t < tKnock + 0.45 ? 4 * (1 - (t - tKnock) / 0.45) : 0, hideApple: t >= tDrop && se === "summer" ? [0] : null });
    mound.set(t, {});
    mound2.set(t, { hidden: se !== "spring" }); show(mound2.g, se === "spring"); show(sprout.g, se === "spring");
    var g2 = se === "spring" && t >= tPop ? lerp(0.04, 0.12, clamp((t - tPop) / 0.45, 0, 1)) : 0;
    sprout.set(g2, t, { season: "spring" });
    // summer: the apple (falls from the tree, bonks, bounces into his hand, bitten)
    var ap = null, f = JS._f || 1;
    if (se === "summer" && t >= tDrop) {
      var A0 = tree.applePos(0, 1), hsS = Kit.headInfo(JS, RS, G0), headTop = [hsS.head[0] - f * 4, hsS.top + 2];
      if (t < tBonk) { var q = (t - tDrop) / (tBonk - tDrop); ap = [lerp(A0[0], headTop[0], q), lerp(A0[1], headTop[1] - 14, q * q), 0]; }
      else if (t < tCatch) {
        var JC = jointsSam(tCatch), hc = [JC.haR[0], JC.haR[1] - 16], q2 = (t - tBonk) / (tCatch - tBonk);
        ap = [lerp(headTop[0], hc[0], q2), lerp(headTop[1] - 14, hc[1], q2) - Math.sin(Math.PI * q2) * 135, q2 * 540];
      } else ap = [JS.haR[0] + f * 2, JS.haR[1] - 16, 0];
      if (t > tBite - 0.25 && t < tBite + 0.75) { var bw = ramp(t, tBite - 0.25, tBite) * (1 - ramp(t, tBite + 0.5, tBite + 0.75)), mm = mouthOf(JS, RS); ap = [lerp(ap[0], mm[0] + f * 14, bw), lerp(ap[1], mm[1] + 2, bw), 0]; }
    }
    if (ap) apple.set(ap[0], ap[1], ap[2], 1, t > tBite + 0.15); else apple.set(0, 0, 0, 0);
    drawRake(t, se); drawLeaves(t, se, JS); drawCocoon(t, se, JS); drawVapour(t, se, JS, JL); drawNest(t, se);
    pip.set(pipState(t));
    // emanata
    var R = se === "spring" ? RS2 : RS, hs = Kit.headInfo(JS, R, G0);
    fx.set({
      stars: se === "summer" && t > tBonk && t < tCatch + 0.2 ? { x: hs.head[0], y: hs.top + 4, r: 40, n: 3 } : null,
      lines: (se === "summer" && t > tBonk && t < tBonk + 0.3) ? { x: hs.head[0], y: hs.head[1], r: R.HR * 1.5, n: 7, amp: 20 } :
        (se === "winter" && t > tShiver && t < tShiver + 0.5) ? { x: hs.head[0], y: hs.head[1], r: R.HR * 1.6, n: 6, amp: 16 } : null,
      sparkle: se === "summer" && t > tBite + 0.2 && t < tBite + 0.8 ? { x: hs.head[0] + f * 70, y: hs.head[1] - 30, k: (t - tBite - 0.2) / 0.6, s: 0.9 } :
        se === "spring" && t > tPop && t < tPop + 0.7 ? { x: M2 - 16, y: G0 - 90, k: (t - tPop) / 0.7, s: 1.1 } : null,
      anger: se === "autumn" && t > tGlare + 0.15 ? { x: hs.head[0] - f * R.HR * 0.7, y: hs.top + 10, k: ramp(t, tGlare + 0.15, tGlare + 0.3) } : null,
      twitch: se === "autumn" && t > tLeaf + 0.1 && t < tLeaf + 0.6 ? { x: hs.head[0] + f * R.HR * 0.2, y: hs.head[1] + 4, k: 1 } : null,
      puff: se === "winter" && t > tShiver + 0.5 && t < tShiver + 1.1 ? { x: hs.head[0] - f * 50, y: rock.top - 6, k: (t - tShiver - 0.5) / 0.6, s: 0.6 } :
        se === "spring" && t > tPlant && t < tPlant + 0.5 ? { x: M2 - 10, y: G0 - 24, k: (t - tPlant) / 0.5, s: 0.35 } :
null
    }, t);
    fx.g.children[2].style.display = se === "summer" && t > tBonk && t < tCatch + 0.2 ? "" : "none";   // kit.js stars group hide bug
    nestFx.g.children[2].style.display = "none";
    tfx.update(t);
    // cards: centred "Years later...", the END card set in the upper left (YouTube end-screen zones stay clear)
    var endOn = t >= tCard;
    cardEl.style.justifyContent = endOn ? "flex-start" : "center"; cardEl.style.alignItems = endOn ? "flex-start" : "center";
    cardEl.style.padding = endOn ? "150px 0 0 150px" : "0"; c2El.style.marginLeft = endOn ? "18px" : "0"; c2El.style.marginTop = endOn ? "46px" : "0"; c2El.style.transformOrigin = endOn ? "left center" : "center";
    c1El.style.fontSize = endOn ? "200px" : ""; c3El.style.display = endOn ? "none" : "";
    cards.update(t);
    show(calG, t < tSum); show(endG, endOn);
    if (t < tSum) {
      var nf = Math.floor(Math.max(0, t - tFlip0) / FLIP), base = 12 + nf;
      calNum.textContent = String(nf + 2);
      PAGES.forEach(function (pg, k) {
        var tk = tFlip0 + (nf - k) * FLIP, dt = t - tk, vis = nf - k >= 0 && dt < 0.7 && t > tFlip0;
        pg.g.setAttribute("visibility", vis ? "visible" : "hidden");
        if (vis) { pg.tx.textContent = String(nf - k + 1); pg.g.setAttribute("transform", "translate(" + (CAL[0] + 260 * dt + (k % 2 ? 40 : -20) * dt).toFixed(1) + " " + (CAL[1] - 22 - 260 * dt + 520 * dt * dt).toFixed(1) + ") rotate(" + (dt * 160 * (k % 2 ? 1 : -1)).toFixed(0) + ")"); }
      });
    }
    if (endOn) {
      var ul = clamp((t - tCard - 0.9) / 0.6, 0, 1);
      under.setAttribute("stroke-dashoffset", (underLen * (1 - ul)).toFixed(1)); under.setAttribute("visibility", ul > 0 ? "visible" : "hidden");
      cPip.set(cardPip(t));
      cFx.set({ sparkle: t > tCP[3] + 0.3 && t < tCP[3] + 0.9 ? { x: CP[3][0] + 60, y: CP[3][1] - 50, k: (t - tCP[3] - 0.3) / 0.6, s: 1.2 } : null }, t);
    }
  }
  window.__film = { MS_SPR: MS_SPR, MS_WIN: MS_WIN, ML_WIN: ML_WIN, RS: RS, RS2: RS2, RL: RL, cam: cam, resolve: resolve, jointsSam: jointsSam, jointsLayla: jointsLayla, bh: bh,
    beats: { tSum: tSum, tAut: tAut, tWin: tWin, tSpr: tSpr, tKnock: tKnock, tBonk: tBonk, tBite: tBite, tGust: tGust, tGlare: tGlare, tShiver: tShiver,
      tNest: tNest, tH: tH, tInhale: tInhale, tTurn: tTurn, tWS: tWS, tCU: tCU, tPop: tPop, tIris: tIris, tCard: tCard, DUR: DUR } };
  window.__timelines = window.__timelines || {};
  window.__timelines["main"] = SF.timeline(DUR, render);
})();
