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
    }
  };

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
  /* expr keys: [t, mouth (-1 sad .. 1 joy, > .92 opens), brow (+ worried, - determined), eye scale] */
  function rig(parent, cfg) {
    cfg = cfg || {};
    var S = cfg.scale || 0.72, INK = cfg.ink || "#2b2a28", PAPER = cfg.paper || "#fbfaf6";
    var g = u.el("g", cfg.filter ? { filter: cfg.filter } : {}, parent), SW = (cfg.stroke || 10) * S, HR = (cfg.head || 46) * S;
    function limb() { return u.el("path", { fill: "none", stroke: INK, "stroke-width": SW, "stroke-linecap": "round", "stroke-linejoin": "round" }, g); }
    var P = { legL: limb(), armL: limb(), spine: limb(), legR: limb(), armR: limb() };
    P.head = u.el("circle", { fill: PAPER, stroke: INK, "stroke-width": SW, r: HR }, g);
    var face = cfg.face !== false, fw = 4.4 * S / 0.72;
    var eye = face && u.el("ellipse", { fill: INK }, g);
    var brow = face && u.el("path", { fill: "none", stroke: INK, "stroke-width": fw, "stroke-linecap": "round" }, g);
    var mouth = face && u.el("path", { fill: "none", stroke: INK, "stroke-width": fw, "stroke-linecap": "round", "stroke-linejoin": "round" }, g);
    var EXPR = cfg.expr || [[0, 0.3, 0, 1]], BLINKS = cfg.blinks || [], pt = u.pt;
    function set(J, t) {
      var hx = J.head[0], hy = J.head[1] - HR * 0.32;
      P.head.setAttribute("cx", hx.toFixed(1)); P.head.setAttribute("cy", hy.toFixed(1));
      P.spine.setAttribute("d", "M " + pt(J.hips) + " L " + pt(J.chest) + " L " + pt(J.neck) + " L " + pt([hx, hy + HR * 0.82]));
      P.armR.setAttribute("d", "M " + pt(J.shR) + " L " + pt(J.elR) + " L " + pt(J.haR));
      P.armL.setAttribute("d", "M " + pt(J.shL) + " L " + pt(J.elL) + " L " + pt(J.haL));
      // legs start at the hips joint: CMU hip joints sit ~25 units lower and leave a visible gap
      P.legR.setAttribute("d", "M " + pt(J.hips) + " L " + pt(J.knR) + " L " + pt(J.ftR));
      P.legL.setAttribute("d", "M " + pt(J.hips) + " L " + pt(J.knL) + " L " + pt(J.ftL));
      if (!face) return;
      var F = J._f || 1, E = u.keys(EXPR, t), ex = hx + F * HR * 0.42, ey = hy - HR * 0.1, blink = 1;
      BLINKS.forEach(function (b) { if (t > b && t < b + 0.13) blink = 0.12; });
      eye.setAttribute("cx", ex.toFixed(1)); eye.setAttribute("cy", ey.toFixed(1));
      eye.setAttribute("rx", (4.8 * E[2] * S / 0.72).toFixed(2)); eye.setAttribute("ry", (5.9 * E[2] * blink * S / 0.72).toFixed(2));
      var by = ey - HR * 0.36 - (E[2] - 1) * 8, bt = E[1] * 5;
      brow.setAttribute("d", "M " + (ex - F * HR * 0.26).toFixed(1) + " " + (by + bt * 0.2).toFixed(1) + " L " + (ex + F * HR * 0.2).toFixed(1) + " " + (by - bt).toFixed(1));
      var mx = hx + F * HR * 0.5, my = hy + HR * 0.42, mw = HR * 0.46, m = E[0];
      if (m > 0.92) {
        mouth.setAttribute("d", "M " + (mx - F * mw * 0.55).toFixed(1) + " " + (my - 2).toFixed(1) + " Q " + mx.toFixed(1) + " " + (my + HR * 0.36).toFixed(1) + " " + (mx + F * mw * 0.45).toFixed(1) + " " + (my - 4).toFixed(1) + " Z");
        mouth.setAttribute("fill", cfg.mouthFill || "#b5463a");
      } else {
        mouth.setAttribute("d", "M " + (mx - F * mw * 0.55).toFixed(1) + " " + (my - m * 3).toFixed(1) + " Q " + mx.toFixed(1) + " " + (my + m * HR * 0.3).toFixed(1) + " " + (mx + F * mw * 0.45).toFixed(1) + " " + (my - m * 4).toFixed(1));
        mouth.setAttribute("fill", "none");
      }
    }
    return { g: g, set: set, parts: P };
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

  root.StickFilm = { u: u, JOINTS: JN, UPPER: UPPER, motion: motion, rig: rig, camera: camera, draws: draws, timeline: timeline };
})(typeof window !== "undefined" ? window : globalThis);
