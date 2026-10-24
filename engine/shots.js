/* shots.js — directing & editing for stick-figure films (MIT). Load after stickfilm.js.
 *
 * A film is a list of SHOTS on one world: the camera holds a framing for each shot and HARD-CUTS to the next one
 * (no drifting between keys like StickFilm.camera). Framing is computed from the characters, by shot size:
 *
 *   var cam = Shots.camera([
 *     {t: 0,   size: "WS",  on: ["sami", "layla"]},             // establishing two-shot
 *     {t: 3.4, size: "MCU", on: ["sami"]},                       // single, lead room in front of him
 *     {t: 6.1, size: "MCU", on: ["layla"], over: "sami"},        // reverse, his edge in frame (2D over-the-shoulder)
 *     {t: 9.0, size: "CU",  on: ["sami"], move: {zoom: 1.06}},   // slow push-in on the key line
 *     {t: 11.2, size: "WS", on: ["sami", "layla"], shake: {t: 11.3, amp: 10, dur: 0.4}}
 *   ], {width: 1920, height: 1080, resolve: function (id, t) { return {head: [x, y], top: y, feet: y, f: 1, h: 320}; }});
 *   cam.apply(camGroup, t);                       // -> [cx, cy, zoom]; pass zoom to rig.set(J, t, {zoom}) for lineComp
 *   var fx = Shots.fx(overlayGroup, [{t: 0, type: "fadeIn", dur: 0.6}, {t: 17, type: "irisOut", dur: 1.2}]);  fx.update(t);
 *
 * Shot sizes are defined for stick figures (big heads, gestures matter): `vis` = part of the standing figure (from the
 * head top down) that fills `fill` of the frame height — MS shows head to knees, MCU head to hips, CU head and shoulders.
 * `over` = a 2D over-the-shoulder: the speaker on a third, the other character cut by the frame edge (falls back to a
 * clean single when they stand too far apart for that size). Shot times can be anchored to words: see time(). resolve(id, t) gives the character's head centre, head top, feet (ground) y,
 * facing (+1 right, -1 left) and standing height h in world px. Framing is evaluated once at the shot start (a locked
 * camera) or at `frameAt` (a time / word anchor); `follow: true` re-frames every frame instead (tracking shot).
 * Per-shot tweaks: zoom (x size, keeps the anchor: feet line for wide shots, head top for closer ones), top (headroom as a
 * share of frame height for MS/MCU/CU, e.g. 0.1 when a jolt or hair needs room), dx / dy (world px), move, shake (its t
 * may be a word anchor too). Everything is a pure function of t.
 */
(function (root) {
  "use strict";
  var U = root.StickFilm.u;
  var SIZES = {                     // vis: part of the standing figure from the head top down; fill: share of frame height
    EWS: { vis: 1.0, fill: 0.22, lead: 0.1 },
    WS:  { vis: 1.0, fill: 0.48, lead: 0.1 },
    MS:  { vis: 0.82, fill: 0.9, top: 0.07, lead: 0.12 },    // head to knees: gestures read (default for dialogue)
    MCU: { vis: 0.6, fill: 0.92, top: 0.06, lead: 0.1 },     // head to hips: emotion + hands
    CU:  { vis: 0.34, fill: 0.95, top: 0.05, lead: 0.07 }    // head and shoulders: reactions, the key line
  };
  var ORDER = ["EWS", "WS", "MS", "MCU", "CU"];

  function framing(shot, t, opt) {
    if (shot.frame) return typeof shot.frame === "function" ? shot.frame(t) : shot.frame.slice();
    var W = opt.width, H = opt.height, Z = SIZES[shot.size || "WS"] || SIZES.WS;
    var ids = shot.on || [], info = ids.map(function (id) { return opt.resolve(id, t); });
    if (!info.length) return [W / 2, H / 2, 1];
    var h = Math.max.apply(null, info.map(function (c) { return c.h; }));
    var zoom = Z.fill * H / (Z.vis * h), cx, cy, k = shot.zoom || 1;
    var o = shot.over && info.length === 1 ? opt.resolve(shot.over, t) : null;
    if (o && Math.abs(info[0].head[0] - o.head[0]) * zoom > 0.75 * W) o = null;   // too far apart for this size: clean single
    if (o) {                                                         // 2D over-the-shoulder: favour the speaker, the
      var m = info[0], s = m.head[0] >= o.head[0] ? 1 : -1;          // other one cut by the frame edge
      zoom = Math.min(zoom, 0.6 * W / Math.max(1, Math.abs(m.head[0] - o.head[0]))) * k;
      cx = m.head[0] - 0.17 * s * W / zoom;
      info = info.concat([o]);                                       // keep both heads under the frame top
    } else if (info.length === 1) {
      zoom *= k;
      cx = info[0].head[0] + info[0].f * Z.lead * W / zoom;          // lead room in front of the face
    } else {
      var xs = info.map(function (c) { return c.head[0]; }), x0 = Math.min.apply(null, xs), x1 = Math.max.apply(null, xs);
      zoom = Math.min(zoom, W * 0.6 / Math.max(1, x1 - x0 + h * 0.45)) * k;   // both heads with room around them
      cx = (x0 + x1) / 2;
    }
    // shot.zoom (k) tightens/loosens the size but keeps its anchor: wide shots keep the feet at the same height in frame,
    // closer shots keep the head top at `top` (default per size) under the frame top -> zooming never crops a head
    if (Z.top == null) {                                             // wide: the whole figure, feet low in frame
      var feet = Math.max.apply(null, info.map(function (c) { return c.feet; }));
      cy = feet - (Z.fill * 0.5 + 0.12) * H / zoom;
    } else {                                                         // closer: the head top just under the frame top
      var top = Math.min.apply(null, info.map(function (c) { return c.top; }));
      cy = top + (0.5 - (shot.top != null ? shot.top : Z.top)) * H / zoom;
    }
    if (shot.dx) cx += shot.dx; if (shot.dy) cy += shot.dy;
    return [cx, cy, zoom];
  }

  /* shot times may be anchored to the dialogue (re-voicing never breaks the edit): "l4" = line start, "l4.end",
     "l4@2" = start of word 2 (0-based), "l4@2e" = its end, any of them + "+0.3" / "-0.1"; data = FILM_DATA */
  function time(x, data) {
    if (typeof x === "number") return x;
    var m = /^\s*([\w-]+)(?:(\.end)|@(\d+)(e?))?\s*([+-]\s*[\d.]+)?\s*$/.exec(String(x)); if (!m) throw new Error("Shots: bad time " + x);
    var L = (data && data.lines || []).filter(function (l) { return l.id === m[1]; })[0];
    if (!L) throw new Error("Shots: unknown line " + m[1] + " in " + x);
    var v = m[2] ? L.end : (m[3] != null ? L.words[+m[3]][m[4] ? "t1" : "t0"] : L.start);
    return v + (m[5] ? parseFloat(m[5].replace(/\s/g, "")) : 0);
  }
  function camera(shots, opt) {
    opt = opt || {}; opt.width = opt.width || 1920; opt.height = opt.height || 1080;
    var D = opt.data || root.FILM_DATA;
    var L = shots.map(function (s) {
      var c = Object.assign({}, s); c.t = time(s.t, D);
      if (s.frameAt != null) c.frameAt = time(s.frameAt, D);
      if (s.shake) c.shake = [].concat(s.shake).map(function (k) { return Object.assign({}, k, { t: time(k.t, D) }); });
      return c;
    }).sort(function (a, b) { return a.t - b.t; });
    // framing is computed once per shot, at its start — or at `frameAt` (e.g. where a character will END UP sitting,
    // so a shot and its later return use the very same frame)
    var base = L.map(function (s) { return s.follow ? null : framing(s, s.frameAt != null ? s.frameAt : s.t + 1e-3, opt); });
    function shotAt(t) { var k = 0; for (var i = 0; i < L.length; i++) if (t >= L[i].t) k = i; return k; }
    function at(t) {
      var i = shotAt(t), s = L[i], c = base[i] || framing(s, t, opt);
      var t1 = i + 1 < L.length ? L[i + 1].t : (opt.duration || s.t + 4);
      if (s.move) {                                                      // in-shot move: eased push / pan
        var p = U.smooth((t - s.t) / Math.max(0.01, t1 - s.t)), m = s.move;
        c = [c[0] + (m.dx || 0) * p, c[1] + (m.dy || 0) * p, c[2] * Math.exp(Math.log(m.zoom || 1) * p)];
      }
      var sh = s.shake ? [].concat(s.shake) : [];
      sh.forEach(function (k) {
        var x = (t - k.t) / (k.dur || 0.4); if (x < 0 || x > 1) return;
        var d = (1 - x) * (1 - x) * (k.amp || 8) / c[2];
        c = [c[0] + d * Math.sin(t * 61.7 + 1.3), c[1] + d * Math.cos(t * 47.3 + 0.7), c[2]];
      });
      return c;
    }
    function apply(el, t) {
      var c = at(t), W = opt.width, H = opt.height;
      el.setAttribute("transform", "translate(" + W / 2 + " " + H / 2 + ") scale(" + c[2].toFixed(4) + ") translate(" + (-c[0]).toFixed(2) + " " + (-c[1]).toFixed(2) + ")");
      return c;
    }
    function toScreen(p, c) { return [opt.width / 2 + c[2] * (p[0] - c[0]), opt.height / 2 + c[2] * (p[1] - c[1])]; }
    return { at: at, apply: apply, shotAt: shotAt, toScreen: toScreen, shots: L, framing: function (s, t) { return framing(s, t, opt); } };
  }

  /* transitions drawn in SCREEN space on an overlay <g> above the camera group:
     fadeIn / fadeOut (black), dip (to black and back around t), flash (white),
     irisOut / irisIn: a black mask with a round hole at: [x, y] (screen px, e.g. cam.toScreen(worldPoint, cam.at(t))).
       irisOut closes the hole from `from` (default: whole frame) to `to` (default 0) and stays there (`hold` s to release);
       irisIn opens it from `from` (default 0) to `to` (default whole frame) during [t, t + dur].
       Classic cartoon ending: {type: "irisOut", dur: 0.7, to: 150, at} then {type: "irisOut", t: +1.05, dur: 0.3, from: 150, at} */
  function fx(parent, events, opt) {
    opt = opt || {}; var W = opt.width || 1920, H = opt.height || 1080, NS = U.NS, DI = Math.hypot(W, H);
    var black = U.el("rect", { x: -10, y: -10, width: W + 20, height: H + 20, fill: opt.color || "#111", opacity: 0 }, parent);
    var white = U.el("rect", { x: -10, y: -10, width: W + 20, height: H + 20, fill: "#fff", opacity: 0 }, parent);
    // the mask is a circle stroke 2*DI wide whose INNER edge is the hole: radius attribute = hole + DI (a stroke wider than
    // the circle's diameter would fold inwards and black out the hole itself)
    var iris = U.el("circle", { cx: W / 2, cy: H / 2, r: DI * 2, fill: "none", stroke: opt.color || "#111", "stroke-width": DI * 2, opacity: 0 }, parent);
    function update(t) {
      var b = 0, w = 0, r = DI, at = [W / 2, H / 2], irisOn = false;
      (events || []).forEach(function (e) {
        var d = e.dur || 0.6, x = (t - e.t) / d, s;
        if (e.type === "fadeOut") b = Math.max(b, U.smooth(x));
        else if (e.type === "fadeIn") b = Math.max(b, 1 - U.smooth(x));
        else if (e.type === "dip") b = Math.max(b, 1 - U.smooth(Math.abs(t - e.t) / (d / 2)));
        else if (e.type === "flash") { if (x >= 0 && x <= 1) w = Math.max(w, 1 - x); }
        else if (e.type === "irisOut" && x > -0.001 && (e.hold == null || t <= e.t + d + e.hold)) {
          s = U.smooth(x); irisOn = true; r = Math.min(r, (e.from != null ? e.from : DI) * (1 - s) + (e.to || 0) * s); at = e.at || at;
        }
        else if (e.type === "irisIn" && x > -0.001 && x <= 1) {
          s = U.smooth(x); irisOn = true; r = Math.min(r, (e.from || 0) * (1 - s) + (e.to != null ? e.to : DI) * s); at = e.at || at;
        }
      });
      black.setAttribute("opacity", b.toFixed(3)); white.setAttribute("opacity", w.toFixed(3));
      iris.setAttribute("opacity", irisOn && r < DI - 1 ? 1 : 0); iris.setAttribute("r", (Math.max(0, r) + DI).toFixed(1));
      iris.setAttribute("cx", at[0].toFixed(1)); iris.setAttribute("cy", at[1].toFixed(1));
    }
    return { update: update };
  }

  root.Shots = { SIZES: SIZES, ORDER: ORDER, camera: camera, fx: fx, time: time, framing: function (s, t, o) { return framing(s, t, o); } };
})(typeof window !== "undefined" ? window : globalThis);
