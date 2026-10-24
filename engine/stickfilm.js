/* stickfilm.js — engine for code-made stick-figure films driven by motion capture (MIT).
 *
 * Everything is a pure function of time t, so any frame can be rendered in any order
 * (required by HyperFrames / Remotion / headless frame capture).
 *
 *   var U = StickFilm.u;                                   // helpers: el, clamp, smooth, lerp, ramp, easeOutBack, hash, pt
 *   var M = StickFilm.motion({ clips, scale, ground, segments, anchor });   // mocap playback + planner
 *   var J = M.joints(t);                                   // 16 world-space joints at time t (blended, facing in J._f)
 *   M.pose(J, { haR: ["neck", 62, -4] }, w);               // procedural pose layer (acting on top of mocap)
 *   var R = StickFilm.rig(svgGroup, { scale, expr, blinks });  R.set(J, t);   // draws figure + face
 *   var C = StickFilm.camera(keys);  C.apply(camGroup, t); // world camera with eased keyframes
 *   var D = StickFilm.draws(parent);  D.path(d, t0, dur, {pencil:true});  var pen = D.update(t);
 *   window.__timelines = window.__timelines || {};       // register INLINE in index.html (HyperFrames lint rule)
 *   window.__timelines.main = StickFilm.timeline(60, render, { boil: turbulenceEl });  // paused GSAP timeline
 *
 * Segments (one per beat, in order, contiguous):
 *   { t0, t1, clip, hold: frame }                  freeze one frame
 *   { t0, t1, clip, loop: true }                   loop the clip's auto-found cycle (walks), travel accumulates
 *   { t0, t1, clip, from, to }                     play frames from..to, time-fitted into [t0, t1] (to < from = reverse)
 *   optional: f: -1 (mirror / face left), blend: seconds (cross-fade from previous pose),
 *             id: "name" (remember x), snap: "name" (start at that segment's x — return to a spot)
 * The planner chains x positions so travel is continuous; `anchor: {seg, x, edge:"end"|"start"}` pins one segment.
 */
(function (root) {
  "use strict";
  var NS = "http://www.w3.org/2000/svg";
  var JN = ["hips", "chest", "neck", "head", "shR", "elR", "haR", "shL", "elL", "haL", "hipR", "knR", "ftR", "hipL", "knL", "ftL"];
  var UPPER = ["neck", "head", "shR", "elR", "haR", "shL", "elL", "haL"];

  var u = {
    NS: NS,
    el: function (tag, a, parent) { var n = document.createElementNS(NS, tag); if (a) for (var k in a) n.setAttribute(k, a[k]); if (parent) parent.appendChild(n); return n; },
    clamp: function (x, a, b) { return Math.max(a, Math.min(b, x)); },
    smooth: function (v) { v = Math.max(0, Math.min(1, v)); return v * v * (3 - 2 * v); },
    lerp: function (a, b, v) { return a + (b - a) * v; },
    ramp: function (t, a, b) { return u.smooth((t - a) / (b - a)); },
    easeOutBack: function (v) { v = Math.max(0, Math.min(1, v)); var c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(v - 1, 3) + c1 * Math.pow(v - 1, 2); },
    hash: function (i) { var x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); },
    pt: function (p) { return p[0].toFixed(1) + " " + p[1].toFixed(1); },
    /* piecewise keyframes [[t, v0, v1, ...], ...] -> smoothed values at t (each transition lasts <= maxDur s) */
    keys: function (K, t, maxDur) {
      maxDur = maxDur || 0.5;
      for (var i = 0; i < K.length - 1; i++) if (t < K[i + 1][0]) {
        var a = K[i], b = K[i + 1], w = u.smooth((t - a[0]) / Math.min(maxDur, b[0] - a[0]));
        return a.slice(1).map(function (v, k) { return u.lerp(v, b[k + 1], w); });
      }
      return K[K.length - 1].slice(1);
    },
    /* step track [[t, value], ...] (sorted) -> function(t): value of the last cue at or before t (binary search).
       Used for mouth shapes (lip sync), expressions, any discrete per-frame state. */
    track: function (cues, before) {
      return function (t) {
        if (!cues || !cues.length || t < cues[0][0]) return before;
        var lo = 0, hi = cues.length - 1;
        while (lo < hi) { var mid = (lo + hi + 1) >> 1; if (cues[mid][0] <= t) lo = mid; else hi = mid - 1; }
        return cues[lo][1];
      };
    },
    /* deterministic blink times in [t0, t1): one every min..max s, phase from the seed (a character id works) */
    blinks: function (seed, t0, t1, opt) {
      opt = opt || {}; var mn = opt.min || 2.2, mx = opt.max || 5.2, k = 0, out = [];
      var sd = typeof seed === "string" ? seed.split("").reduce(function (a, c) { return a * 31 + c.charCodeAt(0) & 0xffff; }, 7) : (seed || 1);
      var t = t0 + 0.4 + u.hash(sd) * mn;
      while (t < t1) { out.push(+t.toFixed(3)); k++; t += mn + (mx - mn) * u.hash(sd * 13.1 + k * 7.7); }
      return out;
    }
  };

  /* neutral standing pose in CMU clip units (hips at 0, ground at 262): same bone lengths as the CMU takes, so it
     blends with mocap clips. StickFilm.standClip() wraps it as a one-frame clip for motion() segments ({hold: 0}). */
  var STAND = { hips: [0, 0], chest: [2, -67], neck: [2, -67], head: [13, -113], shR: [2, -80], elR: [-3, 7], haR: [5, 64],
    shL: [2, -80], elL: [5, 6], haL: [12, 62], hipR: [7, 28], knR: [13, 145], ftR: [8, 263], hipL: [4, 28], knL: [3, 146],
    ftL: [-9, 262], rootY: 0, g: 0 };
  function standClip() { return { fps: 30, groundY: 262, side: true, frames: [JSON.parse(JSON.stringify(STAND))] }; }

  // ---------------------------------------------------------------- motion
  function motion(cfg) {
    var CL = cfg.clips, S = cfg.scale || 0.72, G0 = cfg.ground || 820, SEG = cfg.segments;
    function frameInfo(s, t) {
      var c = CL[s.clip]; if (!c) throw new Error("StickFilm: unknown clip " + s.clip);
      var F = c.frames, fi;
      if (s.hold != null) fi = s.hold;
      else if (s.loop) {
        var a = c.cycle[0], b = c.cycle[1], n = b - a, rl = Math.max(0, Math.floor((t - s.t0) * c.fps + 1e-6)), k = Math.floor(rl / n);
        fi = a + rl % n;
        return { c: c, fr: F[fi], fi: fi, drift: F[fi].hips[0] - F[a].hips[0] + k * (F[b].hips[0] - F[a].hips[0]) };
      } else {
        var rel = Math.floor((t - s.t0) * c.fps + 1e-6), span = s.to - s.from, real = (s.t1 - s.t0) * c.fps;
        var off = u.clamp(rel * Math.abs(span) / Math.max(1, real), 0, Math.abs(span));
        fi = Math.round(s.from + (span < 0 ? -off : off));
      }
      var base = s.hold != null ? s.hold : s.from;
      return { c: c, fr: F[fi], fi: fi, drift: F[fi].hips[0] - F[base].hips[0] };
    }
    // planner: chain x through the segments, then shift everything to satisfy the anchor
    var BYID = {}, x = 0;
    SEG.forEach(function (s) {
      if (s.snap) x = BYID[s.snap].x0;
      s.x0 = x; if (s.id) BYID[s.id] = s;
      s.f = s.f || 1;
      x = s.x0 + s.f * S * frameInfo(s, s.t1 - 1e-3).drift; s.x1 = x;
    });
    if (cfg.anchor) {
      var as = SEG[cfg.anchor.seg], shift = cfg.anchor.x - (cfg.anchor.edge === "start" ? as.x0 : as.x1);
      SEG.forEach(function (s) { s.x0 += shift; s.x1 += shift; });
    }
    function raw(s, t) {
      if (typeof s === "number") s = SEG[s];
      var info = frameInfo(s, t), fr = info.fr, c = info.c;
      var hipsX = s.x0 + s.f * S * info.drift;
      var Y = G0 + S * ((fr.rootY || 0) + (fr.g || 0) - c.groundY), J = {};
      JN.forEach(function (j) { J[j] = [hipsX + s.f * S * (fr[j][0] - fr.hips[0]), Y + S * fr[j][1]]; });
      J._f = s.f;
      return J;
    }
    function segAt(t) { var k = 0; for (var i = 0; i < SEG.length; i++) if (t >= SEG[i].t0) k = i; return k; }
    function joints(t) {
      var i = segAt(t), s = SEG[i], J = raw(s, t);
      J._f = (s.blend && i > 0 && t < s.t0 + s.blend * 0.5) ? SEG[i - 1].f : s.f;
      if (s.blend && i > 0 && t < s.t0 + s.blend) {         // cross-fade from the frozen previous pose
        var A = raw(SEG[i - 1], SEG[i - 1].t1 - 1e-3), w = u.smooth((t - s.t0) / s.blend);
        JN.forEach(function (j) { J[j] = [u.lerp(A[j][0], J[j][0], w), u.lerp(A[j][1], J[j][1], w)]; });
      }
      return J;
    }
    /* procedural pose layer: joint -> [anchorJoint, dx, dy] in clip units (dx is facing-aware) */
    function pose(J, spec, w) {
      if (w <= 0) return;
      var f = J._f || 1;
      for (var j in spec) { var a = J[spec[j][0]], tx = a[0] + f * S * spec[j][1], ty = a[1] + S * spec[j][2]; J[j] = [u.lerp(J[j][0], tx, w), u.lerp(J[j][1], ty, w)]; }
    }
    /* clip layer: copy some joints of another clip's frame (relative to an anchor joint) */
    function layer(J, clipName, fi, joints_, anchor, w) {
      if (w <= 0) return;
      var fr = CL[clipName].frames[fi], f = J._f || 1;
      joints_.forEach(function (j) {
        var tx = J[anchor][0] + f * S * (fr[j][0] - fr[anchor][0]), ty = J[anchor][1] + S * (fr[j][1] - fr[anchor][1]);
        J[j] = [u.lerp(J[j][0], tx, w), u.lerp(J[j][1], ty, w)];
      });
    }
    function shift(J, dx, dy, which) { (which || JN).forEach(function (j) { J[j][0] += dx; J[j][1] += dy; }); }
    /* time at which segment i shows clip frame `frame` (for syncing props / sounds to a mocap moment) */
    function timeOf(i, frame) { var s = SEG[i]; return s.t0 + (frame - s.from) * (s.t1 - s.t0) / (s.to - s.from); }
    return { SEG: SEG, S: S, G0: G0, frameInfo: frameInfo, raw: raw, segAt: segAt, joints: joints, pose: pose, layer: layer, shift: shift, timeOf: timeOf };
  }

  // ---------------------------------------------------------------- rig (figure + face)
  /* expr keys: [t, mouth (-1 sad .. 1 joy, > .92 opens), brow (+ worried, - determined), eye scale]
   * cfg: scale, ink, paper, stroke, head, filter, expr, blinks, face, mouthFill,
   *      connect (default true): one connected body — arms grow from the top of the spine, legs from the hips,
   *               the neck meets the head circle. CMU shoulder / hip joints sit 25–60 units away from the spine in a
   *               side projection, so drawing limbs from them makes arms float beside (or above) the body.
   *               Hands and feet stay exactly where the mocap / pose layers put them (props bound to joints still fit);
   *               only elbows/knees move half-way with the root, which is linear in the joints -> no pops.
   *      round (default 0.3): rounded elbows / knees / neck (fraction of the shorter bone, capped at 14*scale px)
   *      shoulder (default 0.1): where the arms attach, as a fraction of the way from neck down to hips
   *      backInk: colour of the far-side limbs (L) for depth, e.g. "#6b6863" (default: same ink)
   * talking characters (all optional; without them the figure is drawn exactly as before):
   *      mouth: function t -> "A".."H" | "X" | null — lip-sync shape (Rhubarb letters, see MOUTHS); "X"/null = the
   *             expression mouth from expr. Build it with StickFilm.u.track(cues, "X") from tools/voice/dialogue.py.
   *      accessories: ["cap", "fez", "hijab", "bun", "bow", "tuft", "glasses", "beard", "mustache", "scarf"] or
   *             [{type: "cap", color: "#..."}] — silhouettes that tell characters apart (see ACCESSORIES).
   *      color: the character's signature colour (accessories default to it); headFill: head colour (default paper)
   *      lineComp (default 0): keep lines elegant in close-ups — stroke widths scale by zoom^-lineComp when set() gets
   *             {zoom} (0.6 is a good value for dialogue films with MCU/CU shots).
   *      J._palm (0..1, set by talk.js gestures with `palm: 1`): an open stick hand (finger fan) at the near hand;
   *             J._palmSpread (gesture `spread`, default 1) closes the fan: 0.4 = fingers together (facepalm). */
  var MOUTHS = { A: "closed, lips pressed (م ب)", B: "slightly open, teeth (most consonants, ي kasra)", C: "open (fatha, ء ع ح)",
    D: "wide open (alif / long fatha)", E: "rounded (o)", F: "puckered (و damma)", G: "lip on teeth (ف)",
    H: "tongue up (ل ن ر)", X: "rest / expression mouth" };
  var ACCESSORIES = ["cap", "fez", "hijab", "bun", "bow", "tuft", "glasses", "beard", "mustache", "scarf"];
  function shade(hex, k) {   // darken a #rrggbb colour by k (0..1)
    var n = parseInt(String(hex).replace("#", ""), 16); if (isNaN(n)) return hex;
    var r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255, f = function (v) { return Math.round(v * (1 - k)); };
    return "#" + ((1 << 24) + (f(r) << 16) + (f(g) << 8) + f(b)).toString(16).slice(1);
  }
  function rig(parent, cfg) {
    cfg = cfg || {};
    var S = cfg.scale || 0.72, INK = cfg.ink || "#2b2a28", PAPER = cfg.paper || "#fbfaf6", COLOR = cfg.color || "#c4453b";
    var CONNECT = cfg.connect !== false, ROUND = cfg.round == null ? 0.3 : cfg.round, SHO = cfg.shoulder == null ? 0.1 : cfg.shoulder;
    var g = u.el("g", cfg.filter ? { filter: cfg.filter } : {}, parent), SW = (cfg.stroke || 10) * S, HR = (cfg.head || 46) * S;
    g.setAttribute("shape-rendering", "geometricPrecision");
    var ACC = (cfg.accessories || []).map(function (a) { return typeof a === "string" ? { type: a } : a; });
    var hasAcc = function (k) { return ACC.some(function (a) { return a.type === k; }); };
    var accCol = function (k, dflt) { for (var i = 0; i < ACC.length; i++) if (ACC[i].type === k && ACC[i].color) return ACC[i].color; return dflt || COLOR; };
    var layer = function () { return ACC.length ? u.el("g", {}, g) : null; };
    var accBack = layer();                                            // behind the body: bun, scarf tail
    function limb(col) { return u.el("path", { fill: "none", stroke: col || INK, "stroke-width": SW, "stroke-linecap": "round", "stroke-linejoin": "round" }, g); }
    var BACK = cfg.backInk || INK;
    var P = { legL: limb(BACK), armL: limb(BACK), spine: limb(), legR: limb(), armR: limb() };
    var accNeck = layer();                                            // scarf band over the neck
    P.head = u.el("circle", { fill: cfg.headFill || PAPER, stroke: INK, "stroke-width": SW, r: HR }, g);
    var accMid = layer();                                             // on the head, under the face: hijab, hats, hair, beard
    var face = cfg.face !== false, fw = 4.4 * S / 0.72;
    var eye = face && u.el("ellipse", { fill: INK }, g);
    var brow = face && u.el("path", { fill: "none", stroke: INK, "stroke-width": fw, "stroke-linecap": "round" }, g);
    var mouth = face && u.el("path", { fill: "none", stroke: INK, "stroke-width": fw, "stroke-linecap": "round", "stroke-linejoin": "round" }, g);
    var inner = face && cfg.mouth && u.el("ellipse", { fill: "none", stroke: "none" }, g);   // tongue (H) / teeth (G)
    var accFront = layer();                                           // over the face: glasses, mustache
    var armTop = face && cfg.mouth ? u.el("path", { fill: "none", stroke: INK, "stroke-width": SW, "stroke-linecap": "round", "stroke-linejoin": "round" }, g) : null;
    // ^ talking figures: the near arm is redrawn over the head when the hand comes up to the face (facepalm, chin, wave)
    var hand = armTop ? u.el("path", { fill: "none", stroke: INK, "stroke-width": SW * 0.55, "stroke-linecap": "round", visibility: "hidden" }, g) : null;
    var knot = armTop ? u.el("circle", { fill: INK, visibility: "hidden" }, g) : null;
    // ^ an open stick hand (four fingers + thumb fanning from the wrist) while a gesture with `palm: 1` holds (J._palm)
    var EXPR = cfg.expr || [[0, 0.3, 0, 1]], BLINKS = cfg.blinks || [], pt = u.pt, MOUTH = cfg.mouth, MF = cfg.mouthFill || "#b5463a";
    var LC = cfg.lineComp || 0;
    // accessory elements (created once, updated every frame)
    var A = {};
    function mk(grp, tag, attrs) { return u.el(tag, attrs, grp); }
    ACC.forEach(function (a) {
      var c = accCol(a.type), k = a.type, ow = SW * 0.55;
      if (k === "bun") A.bun = mk(accBack, "circle", { fill: a.color || INK, stroke: INK, "stroke-width": ow });
      if (k === "scarf") { A.scarfTail = mk(accBack, "path", { fill: "none", stroke: c, "stroke-width": SW * 1.5, "stroke-linecap": "round" });
        A.scarfBand = mk(accNeck, "path", { fill: "none", stroke: c, "stroke-width": SW * 2.3, "stroke-linecap": "round" }); }
      if (k === "hijab") A.hijab = mk(accMid, "path", { fill: accCol("hijab", COLOR), stroke: INK, "stroke-width": ow, "fill-rule": "evenodd", "stroke-linejoin": "round" });
      if (k === "beard") A.beard = mk(accMid, "path", { fill: a.color || "#3a302a", stroke: "none" });
      if (k === "cap") { A.cap = mk(accMid, "path", { fill: c, stroke: INK, "stroke-width": ow, "stroke-linejoin": "round" });
        A.brim = mk(accMid, "path", { fill: "none", stroke: shade(c, 0.3), "stroke-width": SW * 0.9, "stroke-linecap": "round" }); }
      if (k === "fez") { A.fez = mk(accMid, "path", { fill: a.color || "#a8322d", stroke: INK, "stroke-width": ow, "stroke-linejoin": "round" });
        A.tassel = mk(accMid, "path", { fill: "none", stroke: INK, "stroke-width": SW * 0.45, "stroke-linecap": "round" }); }
      if (k === "bow") A.bow = mk(accMid, "path", { fill: c, stroke: INK, "stroke-width": ow * 0.8, "stroke-linejoin": "round" });
      if (k === "tuft") A.tuft = mk(accMid, "path", { fill: "none", stroke: a.color || INK, "stroke-width": SW * 0.6, "stroke-linecap": "round" });
      if (k === "glasses") A.glasses = mk(accFront, "path", { fill: "rgba(255,255,255,0.18)", stroke: INK, "stroke-width": fw * 1.1, "stroke-linecap": "round" });
      if (k === "mustache") A.mustache = mk(accFront, "path", { fill: a.color || INK, stroke: a.color || INK, "stroke-width": fw * 0.6, "stroke-linejoin": "round" });
    });
    function add(a, d, k) { return [a[0] + d[0] * k, a[1] + d[1] * k]; }
    function sub(a, b) { return [a[0] - b[0], a[1] - b[1]]; }
    /* polyline with rounded inner corners: straight bones, a short quadratic arc through each joint */
    function smoothLine(pts) {
      var d = "M " + pt(pts[0]);
      for (var i = 1; i < pts.length - 1; i++) {
        var a = pts[i - 1], b = pts[i], c = pts[i + 1], ab = sub(b, a), bc = sub(c, b);
        var la = Math.hypot(ab[0], ab[1]) || 1e-6, lc = Math.hypot(bc[0], bc[1]) || 1e-6;
        var r = Math.min(ROUND * Math.min(la, lc), 14 * S);
        d += " L " + pt(add(b, ab, -r / la)) + " Q " + pt(b) + " " + pt(add(b, bc, r / lc));
      }
      return d + " L " + pt(pts[pts.length - 1]);
    }
    /* the figure actually drawn: J -> connected skeleton (pure function of J) */
    function skeleton(J, hx, hy) {
      var H = J.hips, N = J.neck, C = [hx, hy], nc = sub(N, C), lnc = Math.hypot(nc[0], nc[1]) || 1e-6;
      var T = lnc > HR ? add(C, nc, HR / lnc) : [hx, hy + HR];       // neck meets the head circle, facing the neck
      var spine = [H]; if (Math.hypot(J.chest[0] - N[0], J.chest[1] - N[1]) > 2) spine.push(J.chest);
      spine.push(N, T);
      if (!CONNECT) return { spine: [H, J.chest, N, [hx, hy + HR * 0.82]], armR: [J.shR, J.elR, J.haR], armL: [J.shL, J.elL, J.haL],
        legR: [H, J.knR, J.ftR], legL: [H, J.knL, J.ftL] };
      var A0 = add(N, sub(H, N), SHO);
      function arm(sh, el, ha) { return [A0, add(el, sub(A0, sh), 0.5), ha]; }
      function leg(hp, kn, ft) { return [H, add(kn, sub(H, hp), 0.5), ft]; }
      return { spine: spine, armR: arm(J.shR, J.elR, J.haR), armL: arm(J.shL, J.elL, J.haL), legR: leg(J.hipR, J.knR, J.ftR), legL: leg(J.hipL, J.knL, J.ftL) };
    }
    /* lens-shaped open mouth: wl/wr = half widths (x mouth width) behind/in front, ht/hb = top/bottom opening (x HR) */
    function lens(mx, my, F, mw, wl, wr, ht, hb, dx) {
      var L = [mx - F * mw * wl, my], R = [mx + F * mw * wr, my], cx = mx + F * (dx || 0) * HR;
      return "M " + pt(L) + " Q " + cx.toFixed(1) + " " + (my - ht * HR * 2).toFixed(1) + " " + pt(R) +
        " Q " + cx.toFixed(1) + " " + (my + hb * HR * 2).toFixed(1) + " " + pt(L) + " Z";
    }
    function viseme(shape, mx, my, F, mw) {         // -> [d, fill, inner: null | [cx, cy, rx, ry, fill]]
      switch (shape) {
        case "A": return ["M " + (mx - F * mw * 0.42).toFixed(1) + " " + my.toFixed(1) + " L " + (mx + F * mw * 0.38).toFixed(1) + " " + my.toFixed(1), "none", null];
        case "B": return [lens(mx, my, F, mw, 0.5, 0.42, 0.03, 0.08), MF, null];
        case "C": return [lens(mx, my, F, mw, 0.5, 0.44, 0.06, 0.17), MF, null];
        case "D": return [lens(mx, my, F, mw, 0.56, 0.47, 0.07, 0.3), MF, null];
        case "E": return [lens(mx, my, F, mw, 0.32, 0.32, 0.1, 0.2, 0.02), MF, null];
        case "F": return [lens(mx, my, F, mw, 0.19, 0.19, 0.09, 0.1, 0.06), MF, null];
        case "G": return ["M " + (mx - F * mw * 0.45).toFixed(1) + " " + my.toFixed(1) + " L " + (mx + F * mw * 0.4).toFixed(1) + " " + my.toFixed(1) +
          " Q " + mx.toFixed(1) + " " + (my + HR * 0.16).toFixed(1) + " " + (mx - F * mw * 0.45).toFixed(1) + " " + my.toFixed(1) + " Z", MF,
          [mx, my + HR * 0.025, mw * 0.3, HR * 0.03, "#fbfaf6"]];
        case "H": return [lens(mx, my, F, mw, 0.46, 0.42, 0.06, 0.18), MF, [mx + F * mw * 0.05, my + HR * 0.12, mw * 0.22, HR * 0.06, "#d9776b"]];
      }
      return null;
    }
    function pol(hx, hy, F, deg, r) { var a = deg * Math.PI / 180; return [hx + F * r * Math.cos(a), hy - r * Math.sin(a)]; }
    function arcPts(hx, hy, F, d0, d1, r, n) { var o = []; for (var i = 0; i <= n; i++) o.push(pol(hx, hy, F, d0 + (d1 - d0) * i / n, r)); return o; }
    function poly(pts, close) { return "M " + pts.map(pt).join(" L ") + (close ? " Z" : ""); }
    function drawAcc(J, t, hx, hy, F, ex, ey, mx, my, mw, k) {
      var N = J.neck, ph = (cfg.seed || 0) * 1.7;
      if (LC) for (var nm in A) { var e0 = A[nm], b0 = e0.__sw || (e0.__sw = parseFloat(e0.getAttribute("stroke-width")) || 0); if (b0) e0.setAttribute("stroke-width", (b0 * k).toFixed(2)); }
      if (A.bun) { var b = pol(hx, hy, F, 145, HR * 0.98); A.bun.setAttribute("cx", b[0].toFixed(1)); A.bun.setAttribute("cy", b[1].toFixed(1)); A.bun.setAttribute("r", (HR * 0.36).toFixed(1)); }
      if (A.scarfBand) {
        A.scarfBand.setAttribute("d", "M " + pt([N[0] - F * HR * 0.3, N[1] + HR * 0.04]) + " L " + pt([N[0] + F * HR * 0.3, N[1] - HR * 0.03]));
        var w1 = Math.sin(t * 4.2 + ph) * HR * 0.06, w2 = Math.sin(t * 4.2 + ph - 0.9) * HR * 0.1;   // short end, light flutter
        A.scarfTail.setAttribute("d", "M " + pt([N[0] - F * HR * 0.2, N[1] + HR * 0.06]) + " Q " + pt([N[0] - F * HR * 0.5, N[1] + HR * 0.2 + w1]) + " " +
          pt([N[0] - F * HR * 0.62, N[1] + HR * 0.72 + w2]));
        A.scarfBand.setAttribute("stroke-width", (SW * 2.3 * k).toFixed(2)); A.scarfTail.setAttribute("stroke-width", (SW * 1.7 * k).toFixed(2));
      }
      if (A.hijab) {                                               // a soft scarf around the head, open at the face
        var Q = function (x, y) { return pt([hx + F * x * HR, hy + y * HR]); };
        var hole = []; for (var i = 0; i < 28; i++) { var a2 = i / 28 * Math.PI * 2; hole.push([hx + F * HR * (0.32 + Math.cos(a2) * 0.58), hy + HR * (0.02 + Math.sin(a2) * 0.76)]); }
        // outer edge >= 1.085 HR from the head centre everywhere: the head's own outline never peeks out behind the scarf
        A.hijab.setAttribute("d", "M " + Q(0.66, -1.04) + " Q " + Q(-0.5, -1.64) + " " + Q(-1.15, -0.36) + " Q " + Q(-1.37, 0.62) + " " + Q(-0.84, 1.44) +
          " Q " + Q(-0.15, 1.74) + " " + Q(0.56, 1.38) + " Q " + Q(0.9, 1.06) + " " + Q(1.02, 0.38) + " Q " + Q(1.3, -0.52) + " " + Q(0.66, -1.04) + " Z " + poly(hole, true));
      }
      if (A.beard) A.beard.setAttribute("d", poly(arcPts(hx, hy, F, -6, -150, HR * 1.08, 12).concat(arcPts(hx, hy, F, -150, -6, HR * 0.8, 12)), true));
      if (A.cap) {
        A.cap.setAttribute("d", poly(arcPts(hx, hy, F, 8, 172, HR * 1.05, 14), true));
        var b0 = pol(hx, hy, F, 14, HR * 1.0);
        A.brim.setAttribute("d", "M " + pt(b0) + " L " + pt([b0[0] + F * HR * 0.72, b0[1] + HR * 0.1]));
        A.brim.setAttribute("stroke-width", (SW * 0.9 * k).toFixed(2));
      }
      if (A.fez) {
        var l0 = pol(hx, hy, F, 128, HR * 0.97), r0 = pol(hx, hy, F, 52, HR * 0.97);
        var l1 = [hx - F * HR * 0.4, hy - HR * 1.62], r1 = [hx + F * HR * 0.34, hy - HR * 1.62];
        A.fez.setAttribute("d", poly([l0, r0, r1, l1], true));
        var top = [hx - F * HR * 0.03, hy - HR * 1.62], sw = Math.sin(t * 3.1 + ph) * HR * 0.06;
        A.tassel.setAttribute("d", "M " + pt(top) + " Q " + pt([hx - F * HR * 0.55, hy - HR * 1.62]) + " " + pt([hx - F * HR * 0.62 + sw, hy - HR * 1.05]));
      }
      if (A.bow) {
        var c = pol(hx, hy, F, 112, HR * 1.0), s = HR * 0.3;
        A.bow.setAttribute("d", poly([c, [c[0] - s, c[1] - s * 0.6], [c[0] - s, c[1] + s * 0.6]], true) + " " + poly([c, [c[0] + s, c[1] - s * 0.6], [c[0] + s, c[1] + s * 0.6]], true));
      }
      if (A.tuft) A.tuft.setAttribute("d", [78, 94, 110].map(function (d) { return "M " + pt(pol(hx, hy, F, d, HR * 0.96)) + " L " + pt(pol(hx, hy, F, d + 9, HR * 1.32)); }).join(" "));
      if (A.glasses) {
        var r = HR * 0.27, gx = ex + F * HR * 0.02;
        A.glasses.setAttribute("d", "M " + (gx - r).toFixed(1) + " " + ey.toFixed(1) + " A " + r.toFixed(1) + " " + r.toFixed(1) + " 0 1 0 " + (gx + r).toFixed(1) + " " + ey.toFixed(1) +
          " A " + r.toFixed(1) + " " + r.toFixed(1) + " 0 1 0 " + (gx - r).toFixed(1) + " " + ey.toFixed(1) + " M " + (gx - F * r).toFixed(1) + " " + ey.toFixed(1) + " L " + (hx - F * HR * 0.55).toFixed(1) + " " + (ey - HR * 0.04).toFixed(1));
        A.glasses.setAttribute("stroke-width", (fw * 1.1 * k).toFixed(2));
      }
      if (A.mustache) A.mustache.setAttribute("d", "M " + pt([mx - F * mw * 0.5, my - HR * 0.05]) + " Q " + pt([mx - F * mw * 0.12, my - HR * 0.24]) + " " + pt([mx + F * mw * 0.04, my - HR * 0.1]) +
        " Q " + pt([mx + F * mw * 0.3, my - HR * 0.24]) + " " + pt([mx + F * mw * 0.56, my - HR * 0.03]) + " Q " + pt([mx + F * mw * 0.05, my - HR * 0.1]) + " " + pt([mx - F * mw * 0.5, my - HR * 0.05]) + " Z");
    }
    function set(J, t, opt) {
      var hx = J.head[0], hy = J.head[1] - HR * 0.32, K = skeleton(J, hx, hy), line = CONNECT ? smoothLine : function (p) {
        return "M " + p.map(pt).join(" L ");
      };
      P.head.setAttribute("cx", hx.toFixed(1)); P.head.setAttribute("cy", hy.toFixed(1));
      ["spine", "armR", "armL", "legR", "legL"].forEach(function (k) { P[k].setAttribute("d", line(K[k])); });
      var k = (LC && opt && opt.zoom) ? Math.pow(opt.zoom, -LC) : 1;
      if (LC) { ["spine", "armR", "armL", "legR", "legL", "head"].forEach(function (q) { P[q].setAttribute("stroke-width", (SW * k).toFixed(2)); }); }
      if (armTop) {            // hand above the neck: the near FOREARM is redrawn in front of the head (the upper arm stays
        var up = J.haR[1] < J.neck[1] - HR * 0.2;   // behind it, so it never cuts across a face, a hijab or a scarf)
        armTop.setAttribute("d", up ? "M " + pt(K.armR[1]) + " L " + pt(K.armR[2]) : "M 0 0"); armTop.setAttribute("visibility", up ? "visible" : "hidden");
        armTop.setAttribute("stroke-width", (SW * k).toFixed(2));
      }
      if (hand) {                       // stick hand: a fan of fingers along the forearm, the thumb on the lower side
        var pw = u.smooth(((J._palm || 0) - 0.35) / 0.4);
        if (pw > 0.01) {
          var e0 = K.armR[1], h0 = K.armR[2], dx = h0[0] - e0[0], dy = h0[1] - e0[1], dl = Math.hypot(dx, dy) || 1;
          var a0 = Math.atan2(dy, dx), side = Math.sin(a0 + Math.PI / 2) >= 0 ? 1 : -1, ps = HR * pw, d = "";
          var ox = h0[0] + Math.cos(a0) * ps * 0.08, oy = h0[1] + Math.sin(a0) * ps * 0.08;
          [[-36, 0.5], [-12, 0.56], [12, 0.54], [34, 0.46], [76, 0.36]].forEach(function (fg) {    // fingers, then the thumb
            var a1 = a0 + side * fg[0] * (fg[0] > 60 ? 0.8 : J._palmSpread || 1) * Math.PI / 180;
            d += "M " + ox.toFixed(1) + " " + oy.toFixed(1) + " L " + (ox + Math.cos(a1) * ps * fg[1]).toFixed(1) + " " + (oy + Math.sin(a1) * ps * fg[1]).toFixed(1) + " ";
          });
          hand.setAttribute("d", d); hand.setAttribute("stroke-width", (SW * 0.75 * k).toFixed(2)); hand.setAttribute("visibility", "visible");
          knot.setAttribute("cx", ox.toFixed(1)); knot.setAttribute("cy", oy.toFixed(1)); knot.setAttribute("r", (ps * 0.19).toFixed(1));
          knot.setAttribute("visibility", "visible");
        } else { hand.setAttribute("visibility", "hidden"); knot.setAttribute("visibility", "hidden"); }
      }
      var F = J._f || 1;
      if (!face) { if (ACC.length) drawAcc(J, t, hx, hy, F, hx + F * HR * 0.42, hy - HR * 0.1, hx + F * HR * 0.5, hy + HR * 0.42, HR * 0.46, k); return; }
      var E = u.keys(EXPR, t), ex = hx + F * HR * 0.42, ey = hy - HR * 0.1, blink = 1;
      BLINKS.forEach(function (b) { var b0 = b[0] != null ? b[0] : b, bd = b[1] || 0.13; if (t > b0 && t < b0 + bd) blink = 0.12; });   // [t, dur] = slow blink
      eye.setAttribute("cx", ex.toFixed(1)); eye.setAttribute("cy", ey.toFixed(1));
      eye.setAttribute("rx", (4.8 * E[2] * S / 0.72).toFixed(2)); eye.setAttribute("ry", (5.9 * E[2] * blink * S / 0.72).toFixed(2));
      var by = ey - HR * 0.36 - (E[2] - 1) * 8, bt = E[1] * 5;
      brow.setAttribute("d", "M " + (ex - F * HR * 0.26).toFixed(1) + " " + (by + bt * 0.2).toFixed(1) + " L " + (ex + F * HR * 0.2).toFixed(1) + " " + (by - bt).toFixed(1));
      var mx = hx + F * HR * 0.5, my = hy + HR * 0.42, mw = HR * 0.46, m = E[0];
      if (LC) { brow.setAttribute("stroke-width", (fw * k).toFixed(2)); mouth.setAttribute("stroke-width", (fw * k).toFixed(2)); }
      var vis = MOUTH ? viseme(MOUTH(t), mx, my, F, mw) : null;
      if (vis) {
        mouth.setAttribute("d", vis[0]); mouth.setAttribute("fill", vis[1]);
        if (vis[2]) { inner.setAttribute("cx", vis[2][0].toFixed(1)); inner.setAttribute("cy", vis[2][1].toFixed(1)); inner.setAttribute("rx", vis[2][2].toFixed(1));
          inner.setAttribute("ry", vis[2][3].toFixed(1)); inner.setAttribute("fill", vis[2][4]); }
        else if (inner) inner.setAttribute("fill", "none");
      } else {
        if (inner) inner.setAttribute("fill", "none");
        if (m > 0.92) {
          mouth.setAttribute("d", "M " + (mx - F * mw * 0.55).toFixed(1) + " " + (my - 2).toFixed(1) + " Q " + mx.toFixed(1) + " " + (my + HR * 0.36).toFixed(1) + " " + (mx + F * mw * 0.45).toFixed(1) + " " + (my - 4).toFixed(1) + " Z");
          mouth.setAttribute("fill", MF);
        } else {
          mouth.setAttribute("d", "M " + (mx - F * mw * 0.55).toFixed(1) + " " + (my - m * 3).toFixed(1) + " Q " + mx.toFixed(1) + " " + (my + m * HR * 0.3).toFixed(1) + " " + (mx + F * mw * 0.45).toFixed(1) + " " + (my - m * 4).toFixed(1));
          mouth.setAttribute("fill", "none");
        }
      }
      if (ACC.length) drawAcc(J, t, hx, hy, F, ex, ey, mx, my, mw, k);
    }
    return { g: g, set: set, parts: P, skeleton: skeleton, HR: HR, S: S };
  }

  // ---------------------------------------------------------------- camera
  /* keys: [[t, fn(t) -> [cx, cy, zoom]] or [t, [cx, cy, zoom]], ...]; smooth position, log-lerp zoom */
  function camera(keys, opt) {
    opt = opt || {}; var W = opt.width || 1920, H = opt.height || 1080;
    function val(k, t) { return typeof k[1] === "function" ? k[1](t) : k[1]; }
    function at(t) {
      for (var i = 0; i < keys.length - 1; i++) if (t < keys[i + 1][0]) {
        var a = val(keys[i], t), b = val(keys[i + 1], t), w = u.smooth((t - keys[i][0]) / (keys[i + 1][0] - keys[i][0]));
        return [u.lerp(a[0], b[0], w), u.lerp(a[1], b[1], w), Math.exp(u.lerp(Math.log(a[2]), Math.log(b[2]), w))];
      }
      return val(keys[keys.length - 1], t);
    }
    function apply(elm, t) {
      var c = at(t);
      elm.setAttribute("transform", "translate(" + W / 2 + " " + H / 2 + ") scale(" + c[2].toFixed(4) + ") translate(" + (-c[0]).toFixed(2) + " " + (-c[1]).toFixed(2) + ")");
      return c;
    }
    function toScreen(p, c) { return [W / 2 + c[2] * (p[0] - c[0]), H / 2 + c[2] * (p[1] - c[1])]; }
    return { at: at, apply: apply, toScreen: toScreen };
  }

  // ---------------------------------------------------------------- draw-on paths (+ pencil tip)
  function draws(defaultParent, defaults) {
    defaults = defaults || {}; var L = [];
    function path(d, t0, dur, opt) {
      opt = opt || {};
      var p = u.el("path", { d: d, fill: opt.fill || "none", stroke: opt.color || defaults.color || "#2b2a28", "stroke-width": opt.w || 5, "stroke-linecap": "round", "stroke-linejoin": "round" }, opt.parent || defaultParent);
      var len = p.getTotalLength(); p.style.strokeDasharray = len + " " + (len + 10); p.style.strokeDashoffset = len; p.style.visibility = "hidden";
      L.push({ el: p, L: len, t0: t0, dur: dur, pencil: !!opt.pencil, fillAfter: !!opt.fill });
      return p;
    }
    /* updates every draw-on; returns the pencil tip [x, y] if a pencil path is being drawn at t */
    function update(t) {
      var pen = null;
      L.forEach(function (d) {
        var w = u.smooth((t - d.t0) / d.dur);
        d.el.style.strokeDashoffset = (d.L * (1 - w)).toFixed(2);
        d.el.style.visibility = w <= 0 ? "hidden" : "visible";   // undrawn round caps would show as dots
        if (d.fillAfter) d.el.setAttribute("fill-opacity", w.toFixed(3));
        if (d.pencil && t >= d.t0 && t <= d.t0 + d.dur) { var p = d.el.getPointAtLength(d.L * w); pen = [p.x, p.y]; }
      });
      return pen;
    }
    return { path: path, update: update, list: L };
  }

  // ---------------------------------------------------------------- timeline
  function timeline(dur, render, opt) {
    opt = opt || {};
    var tl = gsap.timeline({ paused: true }), proxy = { t: 0 };
    tl.to(proxy, { t: dur, duration: dur, ease: "none", onUpdate: function () {
      if (opt.boil && root.Ink) root.Ink.boil(opt.boil, proxy.t, opt.boilFps || 8);
      render(proxy.t);
    } }, 0);
    render(0);
    return tl;
  }

  root.StickFilm = { u: u, JOINTS: JN, UPPER: UPPER, STAND: STAND, standClip: standClip, MOUTHS: MOUTHS, ACCESSORIES: ACCESSORIES,
    motion: motion, rig: rig, camera: camera, draws: draws, timeline: timeline };
})(typeof window !== "undefined" ? window : globalThis);
