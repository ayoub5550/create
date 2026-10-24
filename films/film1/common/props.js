/* props.js — the recurring props of "Sam & Layla" Ep. 1 (shared by every part, so continuity holds; MIT).
 * Load after ink.js + stickfilm.js (+ set.js). Pure functions of their inputs; call .set(...) every frame.
 *
 *   var mound = Props.mound(props, x, G0)                     // the garden mound + marker twig with the orange flag
 *   var rock  = Props.rock(back, x, G0, {w: 190, h: 120})      // the boulder Sam sits on (top surface y: rock.top)
 *   var tree  = Props.tree(props, x, G0)                      // THE tree, one continuous growth value g 0..1:
 *       tree.set(g, t, {wiggle: 0..1, bend: deg, season: "summer"|"autumn"|"winter"|"spring", apples: 0..1, shake: px})
 *       g: 0 nothing · 0.04 sprout pops · 0.12 two-leaf sprout (the «حوار» sprout) · 0.2 three leaves · 0.3 knee-high
 *          sapling · 0.45 waist-high, first branches · 0.6 young tree taller than Sam · 0.8 full canopy · 1 apple tree
 *       Stage values used across parts (continuity): P05 0 -> 0.2 · P06 0.2 -> 0.26 · P07 0.26 -> 0.34 · P08 0.34 -> 0.62
 *       · P09 0.62 -> 1 (the BOOM) · P10 1 (seasons).  tree.tip(g) = world [x, y] of the top (strings, eyes, the apple).
 *   var pip   = Props.pip(parent)                             // Pip the bird: pip.set({x, y, f, t, pose, look, chirp, flap, s})
 *       pose: "perch" | "hop" (0..1 phase) | "fly" | "sleep" | "bob" (head-bobbing to music) ; f = +1 faces right
 *   var knit  = Props.knitting(fig)                           // needles in Layla's hands + the scarf (B-story):
 *       knit.set(J, {len: px of scarf, click: 0..1, wet: 0..1, packed: false})  — J = Layla's joints (after Talk layers)
 *       Scarf length by part (continuity): P02 0 -> 40 · P03 70 · P04 110 · P05 150 · P06 200 · P07 260 -> 340 · P09 520
 *   var stool = Props.stool(back, x, G0)                      // Layla's little folding stool (seat height: stool.seatY)
 *   Props.apple(parent) -> {g, set(x, y, rot, s)} · Props.mug(parent) -> {g, set(x, y, s, steam t)}
 * Colours: the set tints the whole world layer for the light (FilmSet puts a worldTint filter on #cam): no per-prop work.
 */
(function (root) {
  "use strict";
  var SF = root.StickFilm, U = SF.u, el = U.el, Ink = root.Ink, INK = "#2b2a28";
  var SOIL = "#b08a5e", GREEN = "#5f9a3a", LEAF = "#8cc265", LEAF2 = "#74b04f", BARK = "#8b6a43", APPLE = "#d8453a";
  function ip(pts, o) { return Ink.path(pts, Object.assign({ wobble: 1.0, step: 16 }, o || {})); }
  function easeOutBack(v) { return U.easeOutBack(v); }
  function seg(x, a, b) { return U.clamp((x - a) / (b - a), 0, 1); }

  // ------------------------------------------------------------------ mound + marker flag
  function mound(parent, x, G0) {
    var g = el("g", {}, parent);
    el("path", { d: ip([[x - 76, G0], [x - 42, G0 - 24], [x + 4, G0 - 31], [x + 46, G0 - 21], [x + 78, G0]], { wobble: 0.6, step: 8, seed: 9 }) + " Z", fill: SOIL, stroke: INK, "stroke-width": 4.5, "stroke-linejoin": "round" }, g);
    [[x - 30, G0 - 12], [x + 18, G0 - 18], [x + 44, G0 - 8]].forEach(function (p, k) { el("circle", { cx: p[0], cy: p[1], r: 3 + k % 2, fill: "#8f6a44" }, g); });
    var flag = el("g", {}, g);
    el("path", { d: "M " + (x + 58) + " " + (G0 - 15) + " L " + (x + 65) + " " + (G0 - 95), stroke: "#8b6a43", "stroke-width": 6, "stroke-linecap": "round", fill: "none" }, flag);
    var cloth = el("path", { fill: "#e8772e", stroke: INK, "stroke-width": 3, "stroke-linejoin": "round" }, flag);
    function set(t, o) {
      o = o || {}; var w = Math.sin(t * 5.2) * 3 * (o.wind == null ? 1 : o.wind);
      cloth.setAttribute("d", "M " + (x + 64) + " " + (G0 - 91) + " Q " + (x + 80) + " " + (G0 - 88 + w) + " " + (x + 94) + " " + (G0 - 82 + w) + " Q " + (x + 80) + " " + (G0 - 77 + w * 0.5) + " " + (x + 64) + " " + (G0 - 73) + " Z");
      flag.setAttribute("visibility", o.flag === false ? "hidden" : "visible");
      g.setAttribute("visibility", o.hidden ? "hidden" : "visible");
    }
    set(0);
    return { g: g, set: set, x: x, top: G0 - 31, seed: [x - 16, G0 - 29] };
  }

  // ------------------------------------------------------------------ rock
  function rock(parent, x, G0, o) {
    o = o || {}; var w = o.w || 190, h = o.h || 118, g = el("g", {}, parent), hw = w / 2;
    el("path", { d: ip([[x + hw, G0], [x + hw * 0.96, G0 - h * 0.55], [x + hw * 0.67, G0 - h * 0.9], [x + hw * 0.2, G0 - h], [x - hw * 0.36, G0 - h * 0.97],
      [x - hw * 0.8, G0 - h * 0.72], [x - hw * 1.0, G0 - h * 0.3], [x - hw * 1.04, G0]], { wobble: 1.2, step: 12, seed: 51 }) + " Z",
      fill: "#d9d3c7", stroke: INK, "stroke-width": 5, "stroke-linejoin": "round" }, g);
    el("path", { d: ip([[x - hw * 0.3, G0 - h * 0.8], [x - hw * 0.46, G0 - h * 0.58], [x - hw * 0.4, G0 - h * 0.42]], { wobble: 0.6, step: 8, seed: 52 }), fill: "none", stroke: "#8f887b", "stroke-width": 3, "stroke-linecap": "round" }, g);
    el("path", { d: ip([[x + hw * 0.62, G0 - h * 0.3], [x + hw * 0.42, G0 - h * 0.22]], { wobble: 0.4, step: 8, seed: 53 }), fill: "none", stroke: "#8f887b", "stroke-width": 3, "stroke-linecap": "round" }, g);
    el("path", { d: ip([[x - hw * 0.2, G0 - h * 0.93], [x + hw * 0.5, G0 - h * 0.86]], { wobble: 0.4, step: 10, seed: 54 }), fill: "none", stroke: "#ffffff", "stroke-width": 4, "stroke-linecap": "round", "stroke-opacity": 0.5 }, g);
    return { g: g, x: x, top: G0 - h, w: w, h: h };
  }

  // ------------------------------------------------------------------ the tree (continuous growth)
  function tree(parent, x, G0, o) {
    o = o || {};
    var g = el("g", {}, parent), inner = el("g", {}, g);
    var trunk = el("path", { fill: BARK, stroke: INK, "stroke-width": 4.5, "stroke-linejoin": "round" }, inner);
    var stem = el("path", { fill: "none", stroke: GREEN, "stroke-width": 5, "stroke-linecap": "round" }, inner);
    var branchG = el("g", {}, inner), canopyG = el("g", {}, inner), leafG = el("g", {}, inner), appleG = el("g", {}, inner), blossomG = el("g", {}, inner);
    var BR = [[-0.62, 0.55, 0.42], [0.55, 0.62, 0.38], [-0.35, 0.78, 0.3], [0.3, 0.84, 0.28], [0.0, 0.9, 0.22]];   // [dir, height share, length share]
    var branches = BR.map(function () { return el("path", { fill: "none", stroke: BARK, "stroke-linecap": "round" }, branchG); });
    var branchInk = BR.map(function () { return el("path", { fill: "none", stroke: INK, "stroke-linecap": "round", "stroke-opacity": 0.85 }, branchG); });
    branchG.insertBefore(branchInk[0], branchG.firstChild); branchInk.slice(1).forEach(function (b) { branchG.insertBefore(b, branches[0]); });
    var CB = [[0, -0.18, 0.62], [-0.55, 0.12, 0.5], [0.55, 0.1, 0.52], [-0.28, -0.42, 0.48], [0.32, -0.4, 0.5], [0, 0.22, 0.46], [-0.75, -0.18, 0.36], [0.78, -0.2, 0.36]];
    var blobs = CB.map(function (c, k) { return el("circle", { stroke: INK, "stroke-width": 4.5, fill: k % 2 ? LEAF2 : LEAF }, canopyG); });
    var lights = CB.map(function (c, k) { return el("circle", { fill: "#b5dc8e", opacity: 0.5 }, canopyG); });
    var LV = [];                                                               // small leaves along the stem (young stages)
    for (var i = 0; i < 8; i++) LV.push(el("path", { d: i % 2 ? "M 0 0 C 14 -16, 34 -12, 38 -2 C 25 5, 11 5, 0 0 Z" : "M 0 0 C -14 -16, -34 -12, -38 -2 C -25 5, -11 5, 0 0 Z", fill: LEAF, stroke: INK, "stroke-width": 3 }, leafG));
    var AP = [[-0.42, -0.05], [0.38, -0.2], [0.05, 0.18], [-0.12, -0.45], [0.6, 0.12], [-0.62, 0.22], [0.25, -0.55]];
    var apples = AP.map(function () {
      var a = el("g", {}, appleG);
      el("circle", { r: 15, fill: APPLE, stroke: INK, "stroke-width": 3 }, a);
      el("path", { d: "M 0 -14 L 2 -22", stroke: "#6b4a2b", "stroke-width": 3, "stroke-linecap": "round" }, a);
      el("path", { d: "M 2 -20 C 8 -27, 15 -24, 16 -20 C 10 -17, 6 -18, 2 -20 Z", fill: LEAF, stroke: INK, "stroke-width": 1.8 }, a);
      el("circle", { cx: -5, cy: -5, r: 4, fill: "#ffffff", opacity: 0.55 }, a);
      return a;
    });
    var BL = []; for (var b = 0; b < 16; b++) BL.push(el("circle", { r: 8, fill: "#f7c4d2", stroke: INK, "stroke-width": 1.6 }, blossomG));

    function H(gv) {   // height of the top above the ground (world px)
      if (gv < 0.04) return 0;
      if (gv < 0.12) return 46 * easeOutBack(seg(gv, 0.04, 0.12));
      if (gv < 0.3) return 46 + 64 * seg(gv, 0.12, 0.3);
      if (gv < 0.6) return 110 + 270 * U.smooth(seg(gv, 0.3, 0.6));
      return 380 + 190 * U.smooth(seg(gv, 0.6, 1));
    }
    function R(gv) { return gv < 0.38 ? 0 : gv < 0.6 ? 120 * U.smooth(seg(gv, 0.38, 0.6)) : 120 + 130 * U.smooth(seg(gv, 0.6, 0.9)); }
    function tip(gv) { var h = H(gv); return [x, G0 - h]; }

    function set(gv, t, so) {
      so = so || {}; t = t || 0;
      var h = H(gv), r = R(gv), wig = (so.wiggle || 0) * Math.sin(t * 2 * Math.PI / 0.4) * 2.2;   // ±2° "innocent" wiggle
      var bend = so.bend || 0, sh = so.shake || 0, season = so.season || "summer";
      inner.setAttribute("transform", "translate(" + (x + sh * Math.sin(t * 53)) + " " + G0 + ") rotate(" + (wig + bend * 0.3).toFixed(2) + ") translate(" + (-x) + " " + (-G0) + ")");
      g.setAttribute("visibility", gv < 0.04 ? "hidden" : "visible");
      var woody = seg(gv, 0.26, 0.45);                                    // green stem -> brown trunk
      var tw = 3 + 26 * U.smooth(seg(gv, 0.3, 1)), bx = bend * h / 90;    // trunk half-width at the base; bend leans the top
      var curve = function (s) { return x + Math.sin(s * 2.4 + 0.6) * 6 * (1 - woody * 0.5) + bx * s * s; };
      if (woody < 1) stem.setAttribute("d", "M " + x + " " + G0 + " C " + curve(0.33) + " " + (G0 - h * 0.33) + ", " + curve(0.66) + " " + (G0 - h * 0.66) + ", " + curve(1) + " " + (G0 - h));
      stem.setAttribute("stroke-opacity", (1 - woody).toFixed(2)); stem.setAttribute("stroke-width", (5 + 4 * seg(gv, 0.12, 0.3)).toFixed(1));
      if (woody > 0) {
        var L = [], Rr = [];
        for (var k = 0; k <= 6; k++) { var s = k / 6, yy = G0 - h * s * (r > 0 ? 0.78 : 1), ww = tw * (1 - 0.72 * s) + (k === 0 ? tw * 0.5 : 0); L.push([curve(s) - ww, yy]); Rr.unshift([curve(s) + ww, yy]); }
        trunk.setAttribute("d", ip(L.concat(Rr), { wobble: 0.8, step: 22, seed: 91 }) + " Z");
      }
      trunk.setAttribute("opacity", woody.toFixed(2));
      // branches (from waist-high on)
      var bw = seg(gv, 0.42, 0.7), bare = season === "winter" ? 1 : season === "autumn" ? 0.2 : 0;
      BR.forEach(function (br, k) {
        var by = G0 - h * br[1] * 0.8, len = h * br[2] * bw * 0.9, ex = curve(br[1]) + br[0] * len * 1.3, ey = by - len * 0.75;
        var d = bw > 0.01 ? "M " + curve(br[1]).toFixed(1) + " " + by.toFixed(1) + " Q " + (curve(br[1]) + br[0] * len * 0.6).toFixed(1) + " " + (by - len * 0.15).toFixed(1) + " " + ex.toFixed(1) + " " + ey.toFixed(1) : "";
        branches[k].setAttribute("d", d); branchInk[k].setAttribute("d", d);
        var wv = Math.max(2, tw * 0.45 * (1 - k * 0.12)); branches[k].setAttribute("stroke-width", wv.toFixed(1)); branchInk[k].setAttribute("stroke-width", (wv + 7).toFixed(1));
      });
      // canopy
      var cy = G0 - h * 0.8, canopyK = r > 1 ? (season === "winter" ? 0 : 1 - bare * 0.5) : 0;
      var leafCol = season === "autumn" ? ["#e0913f", "#cf7631"] : season === "winter" ? ["#eef3f6", "#e2e9ef"] : ["" + LEAF, LEAF2];
      CB.forEach(function (c, k) {
        var pop = easeOutBack(seg(r / 250, k * 0.06, k * 0.06 + 0.35)), rr = Math.max(0, r * c[2] * pop);
        blobs[k].setAttribute("cx", (curve(0.8) + c[0] * r).toFixed(1)); blobs[k].setAttribute("cy", (cy + c[1] * r).toFixed(1)); blobs[k].setAttribute("r", rr.toFixed(1));
        blobs[k].setAttribute("fill", leafCol[k % 2]); blobs[k].setAttribute("opacity", canopyK.toFixed(2));
        lights[k].setAttribute("cx", (curve(0.8) + c[0] * r + rr * 0.18).toFixed(1)); lights[k].setAttribute("cy", (cy + c[1] * r - rr * 0.22).toFixed(1));
        lights[k].setAttribute("r", (rr * 0.55).toFixed(1)); lights[k].setAttribute("opacity", (0.45 * canopyK * (season === "winter" ? 0 : 1)).toFixed(2));
      });
      // leaves along the stem (sprout and sapling stages), hidden as the canopy takes over
      var nLeaves = gv < 0.04 ? 0 : 2 + Math.floor(6 * seg(gv, 0.12, 0.3)), leafFade = 1 - seg(gv, 0.4, 0.52);
      LV.forEach(function (lf, k) {
        var on = k < nLeaves, s = k < 2 ? 1 : 1 - (k - 2) / 8, at = k < 2 ? 0.96 : 0.35 + 0.1 * (k - 2), grow = k < 2 ? easeOutBack(seg(gv, 0.04, 0.12)) : easeOutBack(seg(gv, 0.12 + (k - 2) * 0.03, 0.15 + (k - 2) * 0.03));
        var sc = (on ? 1 : 0) * grow * (0.9 + 0.3 * seg(gv, 0.12, 0.3)) * s;
        lf.setAttribute("transform", "translate(" + curve(at).toFixed(1) + " " + (G0 - h * at).toFixed(1) + ") rotate(" + ((k % 2 ? -12 : 12) + Math.sin(t * 2 + k) * 3).toFixed(1) + ") scale(" + sc.toFixed(3) + ")");
        lf.setAttribute("opacity", leafFade.toFixed(2));
        lf.setAttribute("fill", season === "autumn" ? "#e0913f" : LEAF);
      });
      // apples (0..1 = how many are out; each pops), blossoms in spring
      var ak = so.apples != null ? so.apples : seg(gv, 0.86, 1);
      apples.forEach(function (a, k) {
        var p = easeOutBack(seg(ak * AP.length - k, 0, 1)), hide = so.hideApple && so.hideApple.indexOf(k) >= 0;
        a.setAttribute("transform", "translate(" + (curve(0.8) + AP[k][0] * r).toFixed(1) + " " + (cy + AP[k][1] * r).toFixed(1) + ") scale(" + (p * (r / 250)).toFixed(3) + ")");
        a.setAttribute("visibility", hide || p <= 0.001 || season === "winter" ? "hidden" : "visible");
      });
      BL.forEach(function (bl, k) {
        var on = season === "spring" && r > 1;
        bl.setAttribute("cx", (curve(0.8) + (U.hash(k * 3.3) - 0.5) * 1.6 * r).toFixed(1)); bl.setAttribute("cy", (cy + (U.hash(k * 7.1) - 0.55) * 1.3 * r).toFixed(1));
        bl.setAttribute("visibility", on ? "visible" : "hidden");
      });
    }
    function applePos(k, gv) { var r = R(gv), h = H(gv); return [x + AP[k][0] * r, G0 - h * 0.8 + AP[k][1] * r]; }
    set(0, 0);
    return { g: g, set: set, H: H, R: R, tip: tip, applePos: applePos, x: x, NAPPLES: AP.length };
  }

  // ------------------------------------------------------------------ an apple (falling, in a hand)
  function apple(parent) {
    var a = el("g", {}, parent);
    el("circle", { r: 15, fill: APPLE, stroke: INK, "stroke-width": 3 }, a);
    el("path", { d: "M 0 -14 L 2 -22", stroke: "#6b4a2b", "stroke-width": 3, "stroke-linecap": "round" }, a);
    el("path", { d: "M 2 -20 C 8 -27, 15 -24, 16 -20 C 10 -17, 6 -18, 2 -20 Z", fill: LEAF, stroke: INK, "stroke-width": 1.8 }, a);
    el("circle", { cx: -5, cy: -5, r: 4, fill: "#ffffff", opacity: 0.55 }, a);
    var bite = el("path", { d: "M 9 -8 A 7 7 0 0 0 9 6 A 9 9 0 0 1 9 -8 Z", fill: "#f6efd8", stroke: INK, "stroke-width": 2, visibility: "hidden" }, a);
    return { g: a, set: function (x, y, rot, s, bitten) {
      a.setAttribute("transform", "translate(" + x.toFixed(1) + " " + y.toFixed(1) + ") rotate(" + (rot || 0).toFixed(1) + ") scale(" + (s == null ? 1 : s) + ")");
      a.setAttribute("visibility", s === 0 ? "hidden" : "visible"); bite.setAttribute("visibility", bitten ? "visible" : "hidden");
    } };
  }

  // ------------------------------------------------------------------ Pip the bird
  function pip(parent) {
    var g = el("g", {}, parent), body = el("g", {}, g);
    var tail = el("path", { d: "M -20 -2 L -36 -12 L -34 4 Z", fill: "#4f86b8", stroke: INK, "stroke-width": 2.5, "stroke-linejoin": "round" }, body);
    var legs = el("path", { d: "M -4 14 L -6 24 M 6 14 L 6 24 M -10 24 L -2 24 M 2 24 L 10 24", stroke: "#e08a2e", "stroke-width": 2.6, "stroke-linecap": "round", fill: "none" }, body);
    el("ellipse", { cx: 0, cy: 0, rx: 22, ry: 17, fill: "#6aa9d8", stroke: INK, "stroke-width": 3 }, body);
    el("ellipse", { cx: 6, cy: 6, rx: 12, ry: 9, fill: "#f4f1e6" }, body);
    var wing = el("path", { d: "M -12 -4 C -4 -14, 10 -10, 12 0 C 2 4, -8 4, -12 -4 Z", fill: "#4f86b8", stroke: INK, "stroke-width": 2.5 }, body);
    var head = el("g", { transform: "translate(14 -14)" }, body);
    el("circle", { r: 11.5, fill: "#6aa9d8", stroke: INK, "stroke-width": 3 }, head);
    var tuftP = el("path", { d: "M -2 -11 C -2 -18, 4 -20, 6 -16 M 1 -11 C 3 -16, 9 -16, 9 -12", stroke: INK, "stroke-width": 2.2, fill: "none", "stroke-linecap": "round" }, head);
    var beakT = el("path", { d: "M 9 -2 L 21 1 L 9 3 Z", fill: "#f0a23a", stroke: INK, "stroke-width": 2, "stroke-linejoin": "round" }, head);
    var beakB = el("path", { d: "M 9 3 L 18 4 L 9 6 Z", fill: "#e08a2e", stroke: INK, "stroke-width": 1.8, "stroke-linejoin": "round" }, head);
    var eye = el("circle", { cx: 3, cy: -3, r: 3, fill: INK }, head);
    var lid = el("path", { d: "M -1 -3 L 7 -3", stroke: INK, "stroke-width": 2.4, "stroke-linecap": "round", visibility: "hidden" }, head);
    var zz = el("text", { x: 18, y: -26, "font-family": "Caveat, cursive", "font-size": 26, fill: INK, visibility: "hidden" }, g); zz.textContent = "z";
    function set(o) {
      var t = o.t || 0, f = o.f || 1, s = o.s || 1, pose = o.pose || "perch", dy = 0, rot = 0, flap = 0;
      if (pose === "hop") dy = -Math.sin(Math.PI * U.clamp(o.hop || 0, 0, 1)) * 26;
      if (pose === "fly") { flap = Math.sin(t * 2 * Math.PI * 7); rot = -8; }
      if (pose === "bob") { dy = -Math.abs(Math.sin(t * Math.PI * (o.bpm || 104) / 60)) * 6; }
      var look = o.look || 0, tilt = (o.tilt || 0) + (pose === "bob" ? Math.sin(t * Math.PI * (o.bpm || 104) / 60) * 10 : 0);
      g.setAttribute("transform", "translate(" + o.x.toFixed(1) + " " + (o.y + dy).toFixed(1) + ") scale(" + (f * s) + " " + s + ") rotate(" + rot + ")");
      head.setAttribute("transform", "translate(" + (14 + look * 3) + " -14) rotate(" + tilt.toFixed(1) + ")");
      wing.setAttribute("transform", pose === "fly" ? "rotate(" + (-40 * flap).toFixed(1) + " -2 -4) scale(1 " + (1 + 0.4 * Math.abs(flap)).toFixed(2) + ")" : "");
      legs.setAttribute("visibility", pose === "fly" ? "hidden" : "visible");
      var blink = pose === "sleep" || ((t + (o.seed || 0)) % 3.1 < 0.12);
      eye.setAttribute("visibility", blink ? "hidden" : "visible"); lid.setAttribute("visibility", blink ? "visible" : "hidden");
      var ch = o.chirp ? Math.max(0, Math.sin(o.chirp * Math.PI)) : 0;
      beakB.setAttribute("transform", "rotate(" + (ch * 22).toFixed(1) + " 9 3)");
      zz.setAttribute("visibility", pose === "sleep" ? "visible" : "hidden");
      if (pose === "sleep") { zz.setAttribute("y", (-26 - (t * 14 % 20)).toFixed(1)); zz.setAttribute("opacity", (1 - (t * 14 % 20) / 20).toFixed(2)); }
      g.setAttribute("visibility", o.hidden ? "hidden" : "visible");
    }
    return { g: g, set: set };
  }

  // ------------------------------------------------------------------ Layla's knitting + the scarf (B-story)
  function knitting(parent) {
    var g = el("g", {}, parent);
    var scarfInk = el("path", { fill: "none", stroke: INK, "stroke-width": 30, "stroke-linecap": "round", "stroke-linejoin": "round" }, g);
    var scarfA = el("path", { fill: "none", stroke: "#2f7f8f", "stroke-width": 24, "stroke-linecap": "butt", "stroke-linejoin": "round" }, g);
    var scarfB = el("path", { fill: "none", stroke: "#c4453b", "stroke-width": 24, "stroke-linecap": "butt", "stroke-linejoin": "round", "stroke-dasharray": "16 16" }, g);
    var n1 = el("path", { stroke: "#c9a46a", "stroke-width": 4.5, "stroke-linecap": "round", fill: "none" }, g);
    var n2 = el("path", { stroke: "#c9a46a", "stroke-width": 4.5, "stroke-linecap": "round", fill: "none" }, g);
    var yarn = el("path", { stroke: "#c4453b", "stroke-width": 2.5, fill: "none", "stroke-linecap": "round" }, g);
    var ball = el("g", {}, g);
    el("circle", { r: 15, fill: "#c4453b", stroke: INK, "stroke-width": 3 }, ball);
    el("path", { d: "M -10 -6 C -2 -12, 8 -10, 12 -2 M -12 4 C -2 -2, 8 0, 12 8", stroke: "#8e2f27", "stroke-width": 2, fill: "none" }, ball);
    function set(J, o) {
      o = o || {}; var hr = J.haR, hl = J.haL, f = J._f || 1, len = Math.max(0, o.len || 0), click = o.click || 0, G0 = o.G0 || 820;
      var cx = (hr[0] + hl[0]) / 2, cy = (hr[1] + hl[1]) / 2 + 4, k = Math.sin(click * Math.PI * 2) * 5;
      n1.setAttribute("d", "M " + (hr[0] - f * 16) + " " + (hr[1] - 26 + k) + " L " + (hr[0] + f * 14) + " " + (hr[1] + 18 + k));
      n2.setAttribute("d", "M " + (hl[0] + f * 18) + " " + (hl[1] - 24 - k) + " L " + (hl[0] - f * 12) + " " + (hl[1] + 20 - k));
      // the scarf hangs from the needles down over the knees and piles on the ground in folds as it grows
      var pts = [[cx, cy]], drop = Math.min(len, G0 - cy - 6), rest = len - drop;
      if (len > 2) {
        pts.push([cx + f * 4, cy + drop * 0.5], [cx + f * 2, cy + drop]);
        var px = cx + f * 2, dir = f, y = G0 - 10, row = 0;
        while (rest > 0 && row < 30) { var run = Math.min(rest, 120); px += dir * run; pts.push([px, y - row * 6]); rest -= run; dir = -dir; row++; }
      }
      var d = len > 2 ? ip(pts, { wobble: 0.6, step: 10, seed: 5 }) : "";
      [scarfInk, scarfA, scarfB].forEach(function (p) { p.setAttribute("d", d); });
      var wet = o.wet || 0;
      scarfA.setAttribute("stroke", wet > 0 ? root.FilmSet.mixHex("#2f7f8f", "#1f5763", wet) : "#2f7f8f");
      yarn.setAttribute("d", "M " + cx + " " + cy + " Q " + (cx - f * 40) + " " + (G0 - 20) + " " + (cx - f * 90) + " " + (G0 - 15));
      ball.setAttribute("transform", "translate(" + (cx - f * 92) + " " + (G0 - 15) + ")");
      g.setAttribute("visibility", o.hidden ? "hidden" : "visible");
      [n1, n2, yarn, ball].forEach(function (e) { e.setAttribute("visibility", o.packed ? "hidden" : "visible"); });
    }
    return { g: g, set: set };
  }

  // ------------------------------------------------------------------ Layla's folding stool
  function stool(parent, x, G0, o) {
    o = o || {}; var h = o.h || 92, g = el("g", {}, parent);
    el("path", { d: "M " + (x - 34) + " " + G0 + " L " + (x + 30) + " " + (G0 - h + 8) + " M " + (x + 34) + " " + G0 + " L " + (x - 30) + " " + (G0 - h + 8), stroke: "#8b6a43", "stroke-width": 7, "stroke-linecap": "round", fill: "none" }, g);
    el("path", { d: "M " + (x - 34) + " " + G0 + " L " + (x + 30) + " " + (G0 - h + 8) + " M " + (x + 34) + " " + G0 + " L " + (x - 30) + " " + (G0 - h + 8), stroke: INK, "stroke-width": 2, "stroke-linecap": "round", fill: "none", "stroke-opacity": 0.6 }, g);
    el("path", { d: ip([[x - 44, G0 - h], [x + 44, G0 - h], [x + 40, G0 - h + 12], [x - 40, G0 - h + 12]], { wobble: 0.4, step: 10, seed: 71, closed: true }), fill: "#2f7f8f", stroke: INK, "stroke-width": 3.5 }, g);
    return { g: g, x: x, seatY: G0 - h };
  }

  // ------------------------------------------------------------------ a mug with steam
  function mug(parent) {
    var g = el("g", {}, parent);
    el("path", { d: "M -14 -18 L 14 -18 L 12 14 L -12 14 Z", fill: "#f4efe2", stroke: INK, "stroke-width": 3, "stroke-linejoin": "round" }, g);
    el("path", { d: "M 14 -10 C 26 -10, 26 6, 13 6", stroke: INK, "stroke-width": 3, fill: "none" }, g);
    el("path", { d: "M -12 -12 L 12 -12", stroke: "#7a4a2a", "stroke-width": 4 }, g);
    var steam = [0, 1, 2].map(function (k) { return el("path", { stroke: "#ffffff", "stroke-width": 3, fill: "none", "stroke-linecap": "round", opacity: 0.8 }, g); });
    return { g: g, set: function (x, y, s, t) {
      g.setAttribute("transform", "translate(" + x.toFixed(1) + " " + y.toFixed(1) + ") scale(" + (s || 1) + ")");
      steam.forEach(function (p, k) {
        var ph = ((t || 0) * 0.8 + k / 3) % 1, yy = -22 - ph * 34;
        p.setAttribute("d", "M " + (-6 + k * 6) + " " + (yy + 10).toFixed(1) + " C " + (-12 + k * 6) + " " + (yy + 4).toFixed(1) + ", " + (k * 6) + " " + (yy - 2).toFixed(1) + ", " + (-6 + k * 6) + " " + (yy - 8).toFixed(1));
        p.setAttribute("opacity", (0.8 * Math.sin(ph * Math.PI)).toFixed(2));
      });
    } };
  }

  root.Props = { mound: mound, rock: rock, tree: tree, apple: apple, pip: pip, knitting: knitting, stool: stool, mug: mug,
    COLORS: { INK: INK, SOIL: SOIL, GREEN: GREEN, LEAF: LEAF, BARK: BARK, APPLE: APPLE } };
})(typeof window !== "undefined" ? window : globalThis);
