/* set.js — Sam's backyard for "Sam & Layla" Ep. 1 (shared by every part; MIT). Load after ink.js + stickfilm.js.
 *
 * A layered, hand-inked set with real depth: screen-space sky -> far hills (parallax 0.22) -> mid yard: Sam's house,
 * picket fence, trees (0.55) -> the world layer you stage in (1.0, the camera group) -> foreground grass (1.3).
 * Time of day and season are continuous, so a part can glide from afternoon to sunset or night to dawn.
 * Everything is a pure function of t (seek-safe).
 *
 *   var Y = FilmSet.yard({
 *     G0: 820,                       // ground line (world y) — the same as the characters' ground
 *     ref: [1000, 560, 1.3],         // the camera the background was designed for (an establishing WS of the part)
 *     look: "day",                   // "day" | "noon" | "golden" | "sunset" | "dusk" | "night" | "dawn" | function (t) -> name or
 *                                    //   [nameA, nameB, mix 0..1]   e.g. function (t) { return ["day", "sunset", U.ramp(t, 40, 52)]; }
 *     season: "summer",              // "summer" | "autumn" | "winter" | "spring" | function (t) -> name or [a, b, mix]
 *     garden: { x: 980 },            // the dug garden bed around the mound (world x of its centre); null = none
 *     lights: function (t) { return 1; },   // house windows lit 0..1 (default: follows the look — on at dusk/night)
 *     wind: 1                        // grass / leaf sway amount
 *   });
 *   // in render(t), after cam.apply(camG, t):  var c = cam.at(t);  Y.update(t, c);
 *
 * Layers it creates (ids in template.html): #sky (screen space), #far, #mid, #haze, #land (world: ground + garden, draw
 * your props in #props after it), #fore (in front of the characters). Y.colors(t) gives the blended palette (e.g.
 * Y.colors(t).ink for props that must sit in the light), Y.tint(hex, t) tints a prop colour for the current light.
 * Close shots: far layers zoom less than the world (real parallax) and a soft haze pushes them back so the
 * characters always read (hiwar showed no background in close-ups; this is the upgrade).
 */
(function (root) {
  "use strict";
  var SF = root.StickFilm, U = SF.u, el = U.el, Ink = root.Ink;
  var W = 1920, H = 1080, INK = "#2b2a28";

  // ------------------------------------------------------------------ palettes (every look has every key)
  var LOOKS = {
    day:    { tint: [1, 1, 1], skyT: "#8fc6e6", skyB: "#f3f1dd", sun: "#f6c26b", sunGlow: "#f7b955", sunY: 190, sunX: 1650, moon: 0, stars: 0,
              far1: "#b9d0b0", far2: "#a3c39a", farInk: 0.30, midG: "#a7cd85", midG2: "#97c277", fence: "#f7f2e6", wall: "#f2dfbc",
              wall2: "#e5cfa6", roof: "#6d7f99", door: "#5f8f8a", win: "#d7edf3", tree: "#7fb562", tree2: "#6aa252", trunk: "#8b6a43",
              ground: "#a9d27f", ground2: "#93c46a", dirt: "#b08a5e", dirt2: "#9a7650", haze: "#eef4ec", hazeK: 0.30, cloud: "#ffffff",
              cloudA: 0.95, inkA: 1.0, shadow: 0.12, light: 0.0, fog: "#ffffff", fogA: 0.0 },
    noon:   null,
    golden: { tint: [1, 0.95, 0.86], skyT: "#9bb6d8", skyB: "#f8dfae", sun: "#f8b64f", sunGlow: "#f7a645", sunY: 300, sunX: 1600, moon: 0, stars: 0,
              far1: "#c2c79f", far2: "#adb98c", farInk: 0.30, midG: "#b9c97a", midG2: "#a8bb6a", fence: "#f8ead0", wall: "#f3d6a8",
              wall2: "#e6c391", roof: "#73788f", door: "#5f8f8a", win: "#f2e6c4", tree: "#93b354", tree2: "#7f9f48", trunk: "#87643c",
              ground: "#b8cf74", ground2: "#a3c062", dirt: "#b38a58", dirt2: "#9c754a", haze: "#f8ecd2", hazeK: 0.30, cloud: "#fff4e0",
              cloudA: 0.9, inkA: 1.0, shadow: 0.16, light: 0.0, fog: "#ffe7b8", fogA: 0.06 },
    sunset: { tint: [1, 0.85, 0.74], skyT: "#5f6fae", skyB: "#f7a76d", sun: "#f2784a", sunGlow: "#f59a55", sunY: 520, sunX: 1540, moon: 0, stars: 0.05,
              far1: "#a58ea8", far2: "#957f9d", farInk: 0.32, midG: "#b39e6a", midG2: "#a08e5f", fence: "#f0cfb3", wall: "#eebc93",
              wall2: "#dca984", roof: "#5f5878", door: "#5a6f78", win: "#ffd88a", tree: "#8e8a4f", tree2: "#7b7745", trunk: "#7a5537",
              ground: "#b7a866", ground2: "#a3955a", dirt: "#a87a52", dirt2: "#8f6646", haze: "#f6c9a0", hazeK: 0.32, cloud: "#f9c3a2",
              cloudA: 0.9, inkA: 1.0, shadow: 0.2, light: 0.35, fog: "#ff9f6a", fogA: 0.10 },
    dusk:   { tint: [0.78, 0.74, 0.88], skyT: "#2c3767", skyB: "#b57f8f", sun: "#e46a4c", sunGlow: "#c96c6c", sunY: 700, sunX: 1500, moon: 0.4, stars: 0.4,
              far1: "#5f5b7f", far2: "#57557a", farInk: 0.35, midG: "#6f7a6c", midG2: "#636e62", fence: "#b8b0bf", wall: "#a89aa6",
              wall2: "#978a98", roof: "#3f3f5c", door: "#4a5866", win: "#ffd27a", tree: "#4f6656", tree2: "#465c4e", trunk: "#5a4535",
              ground: "#7e8f6e", ground2: "#718364", dirt: "#7d6450", dirt2: "#6c5545", haze: "#6f6c8e", hazeK: 0.3, cloud: "#c99aa8",
              cloudA: 0.75, inkA: 1.0, shadow: 0.2, light: 0.8, fog: "#4b4f80", fogA: 0.10 },
    night:  { tint: [0.6, 0.67, 0.88], skyT: "#101838", skyB: "#2f4474", sun: "#e46a4c", sunGlow: "#c96c6c", sunY: 1300, sunX: 1500, moon: 1, stars: 1,
              far1: "#2b3b5e", far2: "#33476b", farInk: 0.45, midG: "#45606a", midG2: "#3e5862", fence: "#93a1bc", wall: "#64729a",
              wall2: "#58668c", roof: "#2b3452", door: "#3d4a66", win: "#ffd877", tree: "#34565a", tree2: "#2e4e52", trunk: "#4c4250",
              ground: "#5b8076", ground2: "#4f7369", dirt: "#6e5f58", dirt2: "#5f524d", haze: "#2c3a5e", hazeK: 0.28, cloud: "#8d9cc2",
              cloudA: 0.45, inkA: 1.0, shadow: 0.0, light: 1.0, fog: "#203060", fogA: 0.12 },
    dawn:   { tint: [1, 0.91, 0.9], skyT: "#7e8ec8", skyB: "#f7c6ae", sun: "#f9a96b", sunGlow: "#f8b98a", sunY: 640, sunX: 330, moon: 0.15, stars: 0.1,
              far1: "#b4a8c2", far2: "#a397b7", farInk: 0.30, midG: "#a3b88a", midG2: "#94aa7c", fence: "#f3e2dc", wall: "#efd2c0",
              wall2: "#dfbfae", roof: "#6c6f90", door: "#5a7a80", win: "#f6dcb8", tree: "#7ea06b", tree2: "#6c905e", trunk: "#7c5e46",
              ground: "#a6c58a", ground2: "#93b47a", dirt: "#a7835f", dirt2: "#8f6e50", haze: "#f6dccf", hazeK: 0.3, cloud: "#fbd9cf",
              cloudA: 0.85, inkA: 1.0, shadow: 0.1, light: 0.3, fog: "#ffd5c4", fogA: 0.12 }
  };
  LOOKS.noon = LOOKS.day;
  var SEASONS = {   // foliage / ground multipliers (mixed over the look palette)
    summer: { leaf: null, ground: null, snow: 0, blossom: 0, bare: 0, fall: null },
    autumn: { leaf: "#d9893b", leaf2: "#c96f2e", ground: "#c7b26a", snow: 0, blossom: 0, bare: 0.15, fall: "leaf" },
    winter: { leaf: "#e9eef2", leaf2: "#d9e2ea", ground: "#eef3f6", snow: 1, blossom: 0, bare: 0.75, fall: "snow" },
    spring: { leaf: "#9fd27a", leaf2: "#8cc56a", ground: "#b2db87", snow: 0, blossom: 1, bare: 0, fall: "petal" }
  };

  function hex2(h) { return [parseInt(h.substr(1, 2), 16), parseInt(h.substr(3, 2), 16), parseInt(h.substr(5, 2), 16)]; }
  function mixHex(a, b, k) {
    if (k <= 0) return a; if (k >= 1) return b;
    var A = hex2(a), B = hex2(b);
    return "#" + A.map(function (v, i) { var x = Math.round(v + (B[i] - v) * k); return (x < 16 ? "0" : "") + x.toString(16); }).join("");
  }
  function mixPal(A, B, k) {
    var o = {};
    for (var key in A) o[key] = Array.isArray(A[key]) ? A[key].map(function (v, i) { return v + (B[key][i] - v) * k; })
      : typeof A[key] === "number" ? A[key] + (B[key] - A[key]) * k : mixHex(A[key], B[key], k);
    return o;
  }
  function resolve(spec, table, t) {
    var v = typeof spec === "function" ? spec(t) : spec;
    if (typeof v === "string") return table[v];
    var a = table[v[0]], b = table[v[1]], k = U.clamp(v[2], 0, 1);
    return k <= 0 ? a : k >= 1 ? b : (a.snow != null ? mixSeason(a, b, k) : mixPal(a, b, k));
  }
  function mixSeason(a, b, k) {          // seasons: numbers lerp, colours lerp when both exist, else switch at 0.5
    var o = {};
    ["snow", "blossom", "bare"].forEach(function (n) { o[n] = a[n] + (b[n] - a[n]) * k; });
    ["leaf", "leaf2", "ground"].forEach(function (n) { o[n] = a[n] && b[n] ? mixHex(a[n], b[n], k) : (k < 0.5 ? a[n] : b[n]); o[n + "K"] = a[n] && b[n] ? 1 : (k < 0.5 ? (a[n] ? 1 - k * 2 : 0) : (b[n] ? (k - 0.5) * 2 : 0)); });
    o.fall = k < 0.5 ? a.fall : b.fall; o.fallK = k < 0.5 ? 1 - k * 2 : (k - 0.5) * 2;
    return o;
  }

  function ip(pts, o) { return Ink.path(pts, Object.assign({ wobble: 1.0, step: 24 }, o || {})); }
  function stroke(parent, d, w, a) { return el("path", { d: d, fill: "none", stroke: INK, "stroke-width": w, "stroke-linecap": "round", "stroke-linejoin": "round", "stroke-opacity": a == null ? 1 : a }, parent); }

  function yard(cfg) {
    cfg = cfg || {};
    var G0 = cfg.G0 || 820, REF = cfg.ref || [1000, 560, 1.3], WIND = cfg.wind == null ? 1 : cfg.wind;
    var look = cfg.look || "day", season = cfg.season || "summer";
    var gX = cfg.garden === null ? null : (cfg.garden && cfg.garden.x != null ? cfg.garden.x : 980);
    var sky = document.getElementById("sky"), far = document.getElementById("far"), mid = document.getElementById("mid");
    var hazeG = document.getElementById("haze"), land = document.getElementById("land"), fore = document.getElementById("fore");
    var defs = document.querySelector("#stage defs");
    var paint = [];                                         // [element, attribute, paletteKey or function(P, S)]
    function P_(e, attr, key) { paint.push([e, attr, key]); return e; }

    // ---------- sky (screen space)
    var gid = "skyGrad";
    var grad = el("linearGradient", { id: gid, x1: 0, y1: 0, x2: 0, y2: 1 }, defs);
    var s0 = el("stop", { offset: "0" }, grad), s1 = el("stop", { offset: "0.78" }, grad);
    P_(s0, "stop-color", "skyT"); P_(s1, "stop-color", "skyB");
    el("rect", { x: -20, y: -20, width: W + 40, height: H + 40, fill: "url(#" + gid + ")" }, sky);
    var starsG = el("g", {}, sky), STARS = [];
    for (var i = 0; i < 90; i++) {
      var sx = U.hash(i * 3.1) * W, sy = U.hash(i * 7.7 + 1) * H * 0.62, sr = 1.2 + U.hash(i * 1.9) * 2.2;
      STARS.push({ e: el("circle", { cx: sx.toFixed(1), cy: sy.toFixed(1), r: sr.toFixed(2), fill: "#fff8dc" }, starsG), ph: U.hash(i * 5.3) * 6.28, sp: 1.5 + U.hash(i) * 2.5 });
    }
    var sunG = el("g", {}, sky);
    var sunGlowGrad = el("radialGradient", { id: "setSunGlow" }, defs);
    var sg0 = el("stop", { offset: "0", "stop-opacity": 0.55 }, sunGlowGrad), sg1 = el("stop", { offset: "1", "stop-opacity": 0 }, sunGlowGrad);
    P_(sg0, "stop-color", "sunGlow"); P_(sg1, "stop-color", "sunGlow");
    el("circle", { r: 170, fill: "url(#setSunGlow)" }, sunG);
    for (var r = 0; r < 10; r++) {
      var a = r * Math.PI / 5;
      P_(el("path", { d: ip([[Math.cos(a) * 70, Math.sin(a) * 70], [Math.cos(a) * 96, Math.sin(a) * 96]], { wobble: 0.3, step: 8 }), stroke: "#ec8a2f", "stroke-width": 5, "stroke-linecap": "round", fill: "none" }, sunG), "stroke", "sun");
    }
    P_(el("circle", { r: 52, stroke: INK, "stroke-width": 4.5 }, sunG), "fill", "sun");
    var moonG = el("g", { transform: "translate(1560 210)" }, sky);
    el("circle", { r: 120, fill: "#fff6cf", opacity: 0.10 }, moonG);
    el("circle", { r: 62, fill: "#f6f0d2", stroke: INK, "stroke-width": 4 }, moonG);
    el("path", { d: "M 20 -50 A 60 60 0 0 1 20 50 A 44 44 0 0 0 20 -50 Z", fill: "#e3dcb8", opacity: 0.6 }, moonG);
    [[-18, -14, 9], [8, 18, 6], [-6, 30, 4]].forEach(function (c) { el("circle", { cx: c[0], cy: c[1], r: c[2], fill: "#ddd5b0" }, moonG); });
    var clouds = [];
    [[180, 170, 1.0], [760, 110, 0.8], [1260, 230, 1.15], [2050, 150, 0.9], [2650, 210, 1.05]].forEach(function (c, k) {
      var g = el("g", {}, sky), bumps = [[-70, 0, 46], [-20, -24, 58], [42, -14, 50], [88, 6, 36], [10, 12, 44]];
      bumps.forEach(function (b) { P_(el("circle", { cx: b[0], cy: b[1], r: b[2] }, g), "fill", "cloud"); });
      P_(el("path", { d: ip([[-118, 30], [-60, 34], [0, 36], [60, 33], [122, 30]], { wobble: 0.6, step: 20, seed: 70 + k }), fill: "none", stroke: INK, "stroke-width": 3, "stroke-linecap": "round", "stroke-opacity": 0.35 }, g), "stroke", "cloud");
      bumps.forEach(function (b, j) { if (j < 4) stroke(g, ip(arcPts(b[0], b[1], b[2], 200, 340), { wobble: 0.5, step: 14, seed: 80 + k * 5 + j }), 3, 0.28); });
      clouds.push({ g: g, x: c[0], y: c[1], s: c[2], sp: 4 + k * 1.3 });
    });
    function arcPts(cx, cy, r, a0, a1) { var o = []; for (var d = a0; d <= a1; d += 15) { var q = d * Math.PI / 180; o.push([cx + Math.cos(q) * r, cy + Math.sin(q) * r]); } return o; }

    // ---------- far hills (parallax 0.22): two rolling ranges + a soft tree line
    var yF = G0 - 170;
    function hill(parent, y0, amp, seed, key, inkA) {
      var pts = []; for (var x = -2600; x <= 4600; x += 160) pts.push([x, y0 - amp * (0.55 + 0.45 * Math.sin(x / 520 + seed) * Math.cos(x / 910 + seed * 2))]);
      var d = ip(pts, { wobble: 2, step: 60, seed: seed * 10 });
      P_(el("path", { d: d + " L 4600 3200 L -2600 3200 Z" }, parent), "fill", key);
      P_(stroke(parent, d, 3.5, inkA), "stroke-opacity", function (P) { return P.farInk; });
    }
    function ridge(x, y0, amp, seed) { return y0 - amp * (0.55 + 0.45 * Math.sin(x / 520 + seed) * Math.cos(x / 910 + seed * 2)); }
    hill(far, yF - 40, 150, 1.3, "far1", 0.3);
    var treeLine = el("g", {}, far);                      // small trees standing ON the near range's ridge
    for (var k2 = 0; k2 < 40; k2++) {
      var tx = -2400 + k2 * 170 + U.hash(k2 * 4.2) * 80, tr = 16 + U.hash(k2) * 14, ty = ridge(tx, yF + 40, 60, 2.1) + 6;
      if (U.hash(k2 * 9.7) < 0.35) continue;
      var tg = el("g", { transform: "translate(" + tx.toFixed(0) + " " + ty.toFixed(0) + ")" }, treeLine);
      P_(el("path", { d: "M 0 0 L 0 " + (-tr * 0.9).toFixed(0), "stroke-width": 3 }, tg), "stroke", "trunk");
      P_(el("ellipse", { cx: 0, cy: (-tr * 1.5).toFixed(1), rx: (tr * 0.75).toFixed(1), ry: tr.toFixed(1), stroke: INK, "stroke-width": 2.5, "stroke-opacity": 0.35 }, tg), "fill", "tree2");
    }
    hill(far, yF + 40, 60, 2.1, "far2", 0.3);

    // ---------- mid yard (parallax 0.55): house, fence, trees, a mid lawn
    var yM = G0 - 70;
    var lawn = el("g", {}, mid);
    P_(el("rect", { x: -3000, y: yM - 2, width: 9000, height: 3000 }, lawn), "fill", "midG");
    // Sam's house (left) — door, porch step, two windows (lit at night), chimney
    var house = el("g", { transform: "translate(150 " + yM + ")" }, mid), HX = 0;
    var wall = ip([[-10, 0], [-6, -250], [330, -248], [334, 0]], { wobble: 1.2, step: 30, seed: 31 }) + " Z";
    P_(el("path", { d: wall, stroke: INK, "stroke-width": 5, "stroke-linejoin": "round" }, house), "fill", "wall");
    for (var b = 0; b < 7; b++) P_(stroke(house, ip([[-4, -30 - b * 32], [328, -30 - b * 32]], { wobble: 0.8, step: 40, seed: 40 + b }), 2, 0.18), "stroke", "wall2");
    P_(el("path", { d: ip([[-40, -240], [162, -380], [364, -240]], { wobble: 1, step: 26, seed: 33 }) + " Z", stroke: INK, "stroke-width": 5, "stroke-linejoin": "round" }, house), "fill", "roof");
    P_(el("path", { d: ip([[240, -330], [240, -392], [280, -392], [280, -302]], { wobble: 0.8, step: 14, seed: 34 }), stroke: INK, "stroke-width": 4.5 }, house), "fill", "wall2");
    var doorD = ip([[200, 0], [200, -150], [268, -150], [268, 0]], { wobble: 0.7, step: 18, seed: 35 });
    P_(el("path", { d: doorD, stroke: INK, "stroke-width": 4.5 }, house), "fill", "door");
    el("circle", { cx: 256, cy: -74, r: 4.5, fill: INK }, house);
    var WINS = [];
    [[50, -185], [50, -95]].forEach(function (w0, k) {
      var wd = ip([[w0[0], w0[1]], [w0[0] + 100, w0[1]], [w0[0] + 100, w0[1] + 66], [w0[0], w0[1] + 66]], { wobble: 0.6, step: 18, seed: 36 + k, closed: true });
      var we = el("path", { d: wd, stroke: INK, "stroke-width": 4 }, house); P_(we, "fill", "win");
      var glow = el("path", { d: wd, fill: "#ffd877", opacity: 0 }, house);
      stroke(house, "M " + (w0[0] + 50) + " " + w0[1] + " L " + (w0[0] + 50) + " " + (w0[1] + 66) + " M " + w0[0] + " " + (w0[1] + 33) + " L " + (w0[0] + 100) + " " + (w0[1] + 33), 3, 0.9);
      WINS.push(glow);
    });
    P_(el("path", { d: ip([[180, 0], [184, -14], [290, -14], [292, 0]], { wobble: 0.5, step: 14, seed: 39 }), stroke: INK, "stroke-width": 4 }, house), "fill", "wall2");
    // trees behind the fence
    var MIDTREES = [];
    [[-420, 1.25, 41], [660, 0.95, 42], [1780, 1.35, 43], [2360, 1.0, 44], [3050, 1.2, 45], [-1300, 1.1, 46]].forEach(function (tt) {
      MIDTREES.push(drawTree(mid, tt[0], yM + 6, tt[1], tt[2]));
    });
    // picket fence (in front of the house's lower edge and the trees)
    var fence = el("g", {}, mid), FY = yM + 26;
    for (var fx = -2400; fx < 4400; fx += 46) {
      if (fx > 330 && fx < 470) continue;                                     // the garden gate gap near the house
      var fh = 104 + U.hash(fx) * 6;
      P_(el("path", { d: ip([[fx - 13, FY], [fx - 13, FY - fh + 12], [fx, FY - fh], [fx + 13, FY - fh + 12], [fx + 13, FY]], { wobble: 0.5, step: 16, seed: fx }) + " Z", stroke: INK, "stroke-width": 3.2, "stroke-linejoin": "round" }, fence), "fill", "fence");
    }
    P_(el("path", { d: ip([[-2420, FY - 30], [330, FY - 30]], { wobble: 0.8, step: 60, seed: 51 }) + " L 330 " + (FY - 18) + " L -2420 " + (FY - 18) + " Z", stroke: INK, "stroke-width": 3 }, fence), "fill", "fence");
    P_(el("path", { d: ip([[470, FY - 30], [4420, FY - 30]], { wobble: 0.8, step: 60, seed: 52 }) + " L 4420 " + (FY - 18) + " L 470 " + (FY - 18) + " Z", stroke: INK, "stroke-width": 3 }, fence), "fill", "fence");
    P_(el("path", { d: ip([[-2420, FY - 78], [330, FY - 78]], { wobble: 0.8, step: 60, seed: 53 }) + " L 330 " + (FY - 66) + " L -2420 " + (FY - 66) + " Z", stroke: INK, "stroke-width": 3 }, fence), "fill", "fence");
    P_(el("path", { d: ip([[470, FY - 78], [4420, FY - 78]], { wobble: 0.8, step: 60, seed: 54 }) + " L 4420 " + (FY - 66) + " L 470 " + (FY - 66) + " Z", stroke: INK, "stroke-width": 3 }, fence), "fill", "fence");
    // mid-lawn strip in front of the fence + its shadow
    P_(el("rect", { x: -3000, y: FY, width: 9000, height: 3000 }, mid), "fill", "midG2");

    function drawTree(parent, x, y, s, seed) {
      var g = el("g", { transform: "translate(" + x + " " + y + ") scale(" + s + ")" }, parent), sway = el("g", {}, g);
      P_(el("path", { d: ip([[-12, 0], [-9, -120], [-3, -170], [6, -170], [11, -120], [14, 0]], { wobble: 0.8, step: 20, seed: seed }) + " Z", stroke: INK, "stroke-width": 4 }, g), "fill", "trunk");
      var blobs = [[-62, -200, 64], [0, -246, 76], [64, -200, 62], [-30, -150, 52], [36, -152, 54]], leaves = [], bl = [];
      blobs.forEach(function (bb, j) {
        var c = el("circle", { cx: bb[0], cy: bb[1], r: bb[2], stroke: INK, "stroke-width": 4 }, sway); leaves.push(c);
        P_(c, "fill", j % 2 ? "tree2" : "tree");
      });
      blobs.forEach(function (bb, j) { var c = el("circle", { cx: bb[0] + 10, cy: bb[1] - 6, r: bb[2] * 0.62, stroke: "none", opacity: 0.35 }, sway); P_(c, "fill", "tree"); });
      for (var q = 0; q < 9; q++) bl.push(el("circle", { cx: (U.hash(seed * 9 + q) - 0.5) * 180, cy: -150 - U.hash(seed * 3 + q) * 140, r: 9, fill: "#f6b8c8", stroke: INK, "stroke-width": 2, opacity: 0 }, sway));
      return { g: g, sway: sway, leaves: leaves, blossoms: bl, seed: seed };
    }

    // ---------- haze between the background and the world (close shots push the background back)
    var hazeR = el("rect", { x: -20, y: -20, width: W + 40, height: H + 40, opacity: 0 }, hazeG); P_(hazeR, "fill", "haze");

    // ---------- the world ground (parallax 1): lawn, garden bed, path, flowers, pebbles
    var gGrad = el("linearGradient", { id: "groundGrad", x1: 0, y1: 0, x2: 0, y2: 1 }, defs);
    var gs0 = el("stop", { offset: "0" }, gGrad), gs1 = el("stop", { offset: "0.5" }, gGrad);
    P_(gs0, "stop-color", "ground"); P_(gs1, "stop-color", "ground2");
    el("rect", { x: -3000, y: G0, width: 9000, height: 1400, fill: "url(#groundGrad)" }, land);
    var snowG = el("g", { opacity: 0 }, land);
    el("path", { d: ip([[-3000, G0 + 2], [6000, G0 + 2]], { wobble: 2, step: 80, seed: 61 }) + " L 6000 " + (G0 + 1400) + " L -3000 " + (G0 + 1400) + " Z", fill: "#f3f7fa" }, snowG);
    stroke(land, ip([[-3000, G0 + 2], [-600, G0 + 4], [400, G0 - 1], [1600, G0 + 3], [3000, G0], [6000, G0 + 2]], { seed: 4, wobble: 1.2, step: 30 }), 5);
    for (var gl = 0; gl < 70; gl++) {                                   // grass texture strokes on the lawn
      var lx = -1800 + gl * 80 + U.hash(gl * 2.3) * 60, ly = G0 + 30 + U.hash(gl * 5.1) * 160;
      P_(stroke(land, "M " + lx.toFixed(0) + " " + ly.toFixed(0) + " l -4 -12 M " + (lx + 7).toFixed(0) + " " + ly.toFixed(0) + " l 2 -16 M " + (lx + 14).toFixed(0) + " " + ly.toFixed(0) + " l 6 -11", 2.5, 0.35), "stroke", "ground2");
    }
    if (gX != null) {                                                    // the dug garden bed
      P_(el("path", { d: ip([[gX - 230, G0 + 8], [gX - 120, G0 + 2], [gX + 120, G0 + 2], [gX + 230, G0 + 8], [gX + 150, G0 + 34], [gX - 150, G0 + 34]], { wobble: 1.2, step: 30, seed: 62, closed: true }), stroke: INK, "stroke-width": 3.5, "stroke-opacity": 0.6 }, land), "fill", "dirt");
      for (var dk = 0; dk < 8; dk++) P_(stroke(land, ip([[gX - 170 + dk * 45, G0 + 14 + (dk % 2) * 8], [gX - 150 + dk * 45, G0 + 16 + (dk % 2) * 8]], { wobble: 0.3, step: 10, seed: 63 + dk }), 2.5, 0.5), "stroke", "dirt2");
    }
    var FLOW = [];
    for (var fl = 0; fl < 22; fl++) {                                  // flowers + tufts, away from the garden bed
      var fxw = -1500 + fl * 190 + U.hash(fl * 3.3) * 110;
      if (gX != null && Math.abs(fxw - gX) < 300) continue;
      var tuft = el("g", { transform: "translate(" + fxw.toFixed(0) + " " + G0 + ")" }, land);
      el("path", { d: "M -6 0 L -10 -16 M 0 0 L 1 -22 M 6 0 L 11 -14", stroke: "#6f9e4c", "stroke-width": 3, "stroke-linecap": "round", fill: "none" }, tuft);
      if (fl % 3 === 0) {
        var fcol = ["#f2d14b", "#f39bb5", "#ffffff", "#b9a3e3"][fl % 4];
        var fg = el("g", { transform: "translate(" + (14 + U.hash(fl) * 8).toFixed(0) + " -22)" }, tuft);
        el("path", { d: "M 0 22 L 0 0", stroke: "#6f9e4c", "stroke-width": 3, fill: "none" }, fg);
        for (var pe = 0; pe < 5; pe++) { var pa = pe * 1.2566; el("circle", { cx: (Math.cos(pa) * 7).toFixed(1), cy: (Math.sin(pa) * 7).toFixed(1), r: 5, fill: fcol, stroke: INK, "stroke-width": 1.6 }, fg); }
        el("circle", { r: 4, fill: "#e8a33a", stroke: INK, "stroke-width": 1.5 }, fg);
        FLOW.push(fg);
      }
      FLOW.push(tuft);
    }
    // ---------- foreground (parallax 1.3): a few big blades + flowers at the bottom of wide shots
    var FORE = [];
    for (var fo = 0; fo < 14; fo++) {
      var fox = -900 + fo * 300 + U.hash(fo * 7.7) * 160, foy = G0 + 230 + U.hash(fo * 2.9) * 70, g2 = el("g", { transform: "translate(" + fox.toFixed(0) + " " + foy.toFixed(0) + ")" }, fore);
      var bladeD = "M -10 0 C -14 -30, -24 -50, -34 -64 M 0 0 C 0 -36, 4 -58, 8 -80 M 10 0 C 16 -24, 26 -40, 38 -52";
      el("path", { d: bladeD, stroke: "#5e8f42", "stroke-width": 7, "stroke-linecap": "round", fill: "none" }, g2);
      el("path", { d: bladeD, stroke: INK, "stroke-width": 2, "stroke-linecap": "round", fill: "none", "stroke-opacity": 0.45 }, g2);
      FORE.push(g2);
    }

    // ---------- falling things (leaves / snow / petals) in screen space, over everything but the paper
    var fallG = el("g", {}, document.getElementById("weather") || fore), FALL = [];
    for (var fi = 0; fi < 46; fi++) FALL.push(el("path", { d: "M -6 0 C -3 -6, 3 -6, 6 0 C 3 6, -3 6, -6 0 Z", stroke: INK, "stroke-width": 1.2, opacity: 0 }, fallG));

    // ---------- the light on the world layer (characters + props): a colour-matrix filter on #cam, only when not daylight
    var camG = document.getElementById("cam");
    var tf = el("filter", { id: "worldTint", x: "-10%", y: "-10%", width: "120%", height: "120%", "color-interpolation-filters": "sRGB" }, defs);
    var tm = el("feColorMatrix", { type: "matrix", values: "1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 1 0" }, tf);

    // ---------- per-frame update
    function layerT(c, p) {
      var z = REF[2] * Math.pow(c[2] / REF[2], p), x = REF[0] + (c[0] - REF[0]) * p, y = REF[1] + (c[1] - REF[1]) * p;
      return "translate(" + W / 2 + " " + H / 2 + ") scale(" + z.toFixed(4) + ") translate(" + (-x).toFixed(2) + " " + (-y).toFixed(2) + ")";
    }
    var lastPalKey = null;
    function colors(t) { return resolve(look, LOOKS, t); }
    function update(t, c) {
      var P = colors(t), S = resolve(season, SEASONS, t), key = P.skyT + P.skyB + P.ground + P.light.toFixed(3) + (S.leaf || "") + (S.snow || 0).toFixed(3) + (S.blossom || 0).toFixed(3);
      if (key !== lastPalKey) {                                          // repaint only when the light / season changed
        lastPalKey = key;
        paint.forEach(function (p) {
          var v = typeof p[2] === "function" ? p[2](P, S) : P[p[2]];
          if ((p[2] === "tree" || p[2] === "tree2") && S.leaf) v = mixHex(v, p[2] === "tree" ? S.leaf : (S.leaf2 || S.leaf), S.leafK == null ? 1 : S.leafK);
          if ((p[2] === "ground" || p[2] === "ground2" || p[2] === "midG" || p[2] === "midG2") && S.ground) v = mixHex(v, S.ground, (S.groundK == null ? 1 : S.groundK) * (S.snow ? 0.9 : 0.6));
          p[0].setAttribute(p[1], typeof v === "number" ? v.toFixed(3) : v);
        });
        snowG.setAttribute("opacity", (S.snow || 0).toFixed(3));
        MIDTREES.forEach(function (tr) { tr.blossoms.forEach(function (b) { b.setAttribute("opacity", (S.blossom || 0).toFixed(2)); }); });
      }
      var tn = cfg.tint === false ? [1, 1, 1] : P.tint;
      if (Math.abs(tn[0] - 1) + Math.abs(tn[1] - 1) + Math.abs(tn[2] - 1) > 0.01) {
        tm.setAttribute("values", tn[0].toFixed(3) + " 0 0 0 0 0 " + tn[1].toFixed(3) + " 0 0 0 0 0 " + tn[2].toFixed(3) + " 0 0 0 0 0 1 0");
        if (camG.getAttribute("filter") !== "url(#worldTint)") camG.setAttribute("filter", "url(#worldTint)");
      } else if (camG.hasAttribute("filter")) camG.removeAttribute("filter");
      sunG.setAttribute("transform", "translate(" + P.sunX.toFixed(1) + " " + P.sunY.toFixed(1) + ") scale(1.15)");
      sunG.setAttribute("opacity", U.clamp(1.6 - P.moon * 1.6, 0, 1).toFixed(3));
      moonG.setAttribute("opacity", P.moon.toFixed(3));
      starsG.setAttribute("opacity", P.stars.toFixed(3));
      if (P.stars > 0.02) STARS.forEach(function (s) { s.e.setAttribute("opacity", (0.55 + 0.45 * Math.sin(t * s.sp + s.ph)).toFixed(2)); });
      clouds.forEach(function (cl) {
        var x = ((cl.x + t * cl.sp - (c[0] - REF[0]) * 0.06 + 400) % 3400 + 3400) % 3400 - 400;
        cl.g.setAttribute("transform", "translate(" + x.toFixed(1) + " " + (cl.y - (c[1] - REF[1]) * 0.04).toFixed(1) + ") scale(" + cl.s + ")");
        cl.g.setAttribute("opacity", P.cloudA.toFixed(2));
      });
      far.setAttribute("transform", layerT(c, 0.22));
      mid.setAttribute("transform", layerT(c, 0.55));
      fore.setAttribute("transform", layerT(c, 1.3));
      var hz = U.clamp((c[2] / REF[2] - 1.15) / 2.2, 0, 1) * P.hazeK;
      hazeR.setAttribute("opacity", hz.toFixed(3));
      var lit = cfg.lights ? cfg.lights(t) : U.clamp(P.light, 0, 1);
      WINS.forEach(function (w) { w.setAttribute("opacity", (lit * 0.92).toFixed(3)); });
      var sw = Math.sin(t * 1.3) * 1.2 * WIND;
      MIDTREES.forEach(function (tr, k) { tr.sway.setAttribute("transform", "rotate(" + (sw * (0.6 + 0.2 * (k % 3))).toFixed(2) + " 0 -140)"); });
      // falling particles
      var kind = S.fall, fk = S.fallK == null ? 1 : S.fallK;
      FALL.forEach(function (f, i) {
        if (!kind) { f.setAttribute("opacity", 0); return; }
        var sp = kind === "snow" ? 70 + U.hash(i) * 50 : 90 + U.hash(i) * 60, ph = U.hash(i * 3.7) * (H + 200);
        var y = ((ph + t * sp) % (H + 200)) - 100, x = U.hash(i * 9.1) * W + Math.sin(t * (0.8 + U.hash(i)) + i) * (kind === "snow" ? 22 : 46);
        var col = kind === "snow" ? "#ffffff" : kind === "petal" ? "#f7c2d0" : (i % 2 ? "#d9893b" : "#c96f2e");
        var rot = kind === "snow" ? 0 : (t * 90 * (U.hash(i * 2) - 0.5) + i * 40);
        var sc = kind === "snow" ? 0.55 + U.hash(i * 5) * 0.5 : 1 + U.hash(i * 5) * 0.6;
        f.setAttribute("d", kind === "snow" ? "M -5 0 A 5 5 0 1 0 5 0 A 5 5 0 1 0 -5 0" : "M -8 0 C -4 -7, 4 -7, 8 0 C 4 7, -4 7, -8 0 Z");
        f.setAttribute("fill", col); f.setAttribute("stroke-opacity", kind === "snow" ? 0 : 0.6);
        f.setAttribute("transform", "translate(" + x.toFixed(1) + " " + y.toFixed(1) + ") rotate(" + rot.toFixed(1) + ") scale(" + sc.toFixed(2) + ")");
        f.setAttribute("opacity", (fk * 0.95).toFixed(2));
      });
    }
    function tint(hex, t) { var P = colors(t); return P.light > 0.5 ? mixHex(hex, P.skyT, (P.light - 0.5) * 0.5) : hex; }
    return { update: update, colors: colors, tint: tint, G0: G0, REF: REF, mixHex: mixHex, LOOKS: LOOKS };
  }

  root.FilmSet = { yard: yard, LOOKS: LOOKS, SEASONS: SEASONS, mixHex: mixHex };
})(typeof window !== "undefined" ? window : globalThis);
