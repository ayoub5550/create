/* ink.js — hand-drawn line helpers for SVG films (MIT).
 *   Ink.path(points, {wobble, step, seed, closed}) -> SVG path "d" of a wobbly, smoothed marker line
 *   Ink.boil(turbulenceEl, t, fps)                 -> seek-safe "line boil": steps the noise seed with time
 * Pure functions of their inputs: safe for frame-by-frame rendering (HyperFrames / Remotion seek). */
(function (root) {
  "use strict";
  function rnd(seed, i) { var x = Math.sin(seed * 91.7 + i * 12.9898 + 4.1) * 43758.5453; return x - Math.floor(x); }
  function resample(pts, step, closed) {
    var P = pts.slice(); if (closed) P.push(P[0]);
    var out = [P[0]];
    for (var i = 1; i < P.length; i++) {
      var a = P[i - 1], b = P[i], L = Math.hypot(b[0] - a[0], b[1] - a[1]), n = Math.max(1, Math.round(L / step));
      for (var k = 1; k <= n; k++) out.push([a[0] + (b[0] - a[0]) * k / n, a[1] + (b[1] - a[1]) * k / n]);
    }
    return out;
  }
  function path(pts, opt) {
    opt = opt || {};
    var wob = opt.wobble == null ? 1.5 : opt.wobble, step = opt.step || 24, seed = opt.seed || 1, closed = !!opt.closed;
    if (pts.length < 2) return "";
    var R = resample(pts, step, closed), n = R.length;
    // perpendicular jitter (endpoints of open paths stay put)
    var Q = R.map(function (p, i) {
      if (!closed && (i === 0 || i === n - 1)) return p;
      var a = R[Math.max(0, i - 1)], b = R[Math.min(n - 1, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1;
      var o = (rnd(seed, i) - 0.5) * 2 * wob;
      return [p[0] - dy / L * o, p[1] + dx / L * o];
    });
    if (closed) Q[n - 1] = Q[0];
    // Catmull-Rom -> cubic Bezier
    var f = function (v) { return v.toFixed(1); }, d = "M " + f(Q[0][0]) + " " + f(Q[0][1]);
    for (var i = 0; i < n - 1; i++) {
      var p0 = Q[i === 0 ? (closed ? n - 2 : 0) : i - 1], p1 = Q[i], p2 = Q[i + 1], p3 = Q[i + 2 < n ? i + 2 : (closed ? 1 : n - 1)];
      d += " C " + f(p1[0] + (p2[0] - p0[0]) / 6) + " " + f(p1[1] + (p2[1] - p0[1]) / 6) + ", " +
        f(p2[0] - (p3[0] - p1[0]) / 6) + " " + f(p2[1] - (p3[1] - p1[1]) / 6) + ", " + f(p2[0]) + " " + f(p2[1]);
    }
    return d;
  }
  function boil(turb, t, fps) {
    if (!turb) return;
    var k = Math.floor(t * (fps || 8)) % 4;
    turb.setAttribute("seed", String(1 + k * 7));
  }
  root.Ink = { path: path, boil: boil, rnd: rnd };
})(typeof window !== "undefined" ? window : globalThis);
