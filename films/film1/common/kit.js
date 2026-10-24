/* kit.js — shared helpers for the parts of "Sam & Layla" Ep. 1 (MIT). Load after stickfilm.js, talk.js, set.js, props.js.
 * Everything is a pure function of t (seek-safe). See films/film1/PRODUCTION.md for the conventions and parts/p01/film.js
 * for a complete worked example.
 *
 *   var K = Kit.lines(FILM_DATA);  K.L.l3.start;  K.w("l3", 2).t0;  K.w("l3", -1).t1     // lines + words (neg = from end)
 *   var EX = Kit.expr([[0, Kit.FACE.calm], [t1, Kit.FACE.shock, 0.12], ...]);           // expression track for rig({expr})
 *   Kit.bump(t, t0, dur)              0 -> 1 -> 0 sine bump          Kit.crouch(M, J, w, {hands, depth})  squat (IK knees)
 *   Kit.ik(a, c, l1, l2, side)        two-bone IK middle joint (knees, elbows)
 *   Kit.lean(M, J, dx, dy, w)         shift the upper body (dx follows the facing)       Kit.hop(J, h)  lift every joint
 *   Kit.headInfo(J, R, G0)            {head, top, feet, f} for Shots resolve()
 *   var cards = Kit.cards(document.getElementById("card"), [{t0, t1, c1, c2, c3, wipe: true, pop: true}]); cards.update(t)
 *   var cs = Kit.cardSvg(document.getElementById("card"))  -> <g> drawn ABOVE the card (Pip flying over a title card)
 *   var fx = Kit.emanata(parent)      cartoon marks: fx.set({lines, stars, sweat, smell, sparkle, puff, zzz, twitch}, t)
 *   var bag = Kit.bag(parent)         Layla's knitting tote: bag.set(x, y, {hidden})
 *   var bub = Kit.bubble(parent)      speech / thought bubble: bub.set({x, y, w, h, tail: [x, y], thought, s, hidden})
 *   var bh = Kit.birdhouse(parent, x, G0)   Pip's pole + birdhouse in the WORLD layer (bh.perch, bh.roof = [x, y])
 */
(function (root) {
  "use strict";
  var SF = root.StickFilm, U = SF.u, el = U.el, Ink = root.Ink, INK = "#2b2a28";
  function ip(pts, o) { return Ink.path(pts, Object.assign({ wobble: 0.8, step: 12 }, o || {})); }
  var Kit = {};

  // ------------------------------------------------------------------ dialogue data
  Kit.lines = function (DATA) {
    var L = {}; DATA.lines.forEach(function (l) { L[l.id] = l; });
    function w(id, i) { var ws = L[id].words; return ws[Math.max(0, Math.min(ws.length - 1, i < 0 ? ws.length + i : i))]; }
    return { L: L, w: w, chars: DATA.chars, total: DATA.total };
  };

  // ------------------------------------------------------------------ expressions [mouth, brow, eye]
  // mouth: -1 frown .. 1 big smile · brow: - = frown / determined, + = raised / worried / hopeful · eye: size (1 = normal,
  // 0.7 = deadpan half-lidded, 1.7 = shocked wide)
  Kit.FACE = {
    calm: [0.35, 0, 1.0], happy: [0.8, 0.2, 1.1], proud: [0.8, 0.15, 1.1], excited: [0.95, 0.45, 1.3], hope: [0.6, 0.45, 1.15],
    hope2: [0.85, 0.65, 1.25], listen: [0.45, 0.2, 1.05], huh: [0.0, 0.8, 1.25], ask: [0.2, 0.75, 1.15], indig: [-0.25, 0.6, 1.2],
    shock: [-0.4, 1.2, 1.7], stubborn: [-0.15, -0.7, 1.0], determined: [-0.05, -0.8, 0.95], scheming: [0.55, -0.6, 0.85],
    sly: [0.5, -0.3, 0.8], dead: [0.0, -0.15, 0.72], sigh: [-0.3, 0.55, 0.9], wow: [0.95, 0.9, 1.45], sad: [-0.6, 0.9, 1.0],
    angry: [-0.6, -1.0, 1.05], sleepy: [0.1, 0.3, 0.45], smile: [0.9, 0.25, 0.9], warm: [0.7, 0.3, 0.95], panic: [-0.5, 1.1, 1.6],
    disgust: [-0.7, -0.4, 0.8], whisper: [0.1, 0.4, 1.1]
  };
  /* keys [[t, face, d]]: hold the previous face until t, reach the new one at t + d (default 0.25) */
  Kit.expr = function (keys) {
    var out = [[0].concat(keys[0][1])];
    for (var i = 1; i < keys.length; i++) {
      var prev = out[out.length - 1].slice(1), d = keys[i][2] || 0.25;
      out.push([keys[i][0]].concat(prev), [keys[i][0] + d].concat(keys[i][1]));
    }
    return out;
  };

  // ------------------------------------------------------------------ body layers (call after M.joints + Talk layers)
  Kit.bump = function (t, t0, d) { var x = (t - t0) / d; return x > 0 && x < 1 ? Math.sin(Math.PI * x) : 0; };
  function dist(a, b) { return Math.hypot(a[0] - b[0], a[1] - b[1]); }
  /* two-bone IK: the middle joint for a chain a -> ? -> c with bone lengths l1, l2, bending to the side whose x sign is `side` */
  Kit.ik = function (a, c, l1, l2, side) {
    var dx = c[0] - a[0], dy = c[1] - a[1], d = Math.max(1e-3, Math.min(Math.hypot(dx, dy), l1 + l2 - 1e-3));
    var x = (l1 * l1 - l2 * l2 + d * d) / (2 * d), h = Math.sqrt(Math.max(0, l1 * l1 - x * x)), ux = dx / d, uy = dy / d;
    var px = -uy, py = ux; if (px * side < 0) { px = -px; py = -py; }
    return [a[0] + ux * x + px * h, a[1] + uy * x + py * h];
  };
  /* a real squat (w 0..1): hips drop and go back, the torso folds forward over the knees (head low, near the ground in
     front), knees solved by IK (feet stay planted, bone lengths kept); o.hands (0..1, default 1) rests the hands on the
     knees — pass 0 (or a fading weight) while a Talk gesture should own the arms; o.depth scales the squat */
  Kit.crouch = function (M, J, w, o) {
    if (w <= 0) return; o = o || {};
    var f = J._f || 1, S = M.S, dep = o.depth == null ? 1 : o.depth;
    var LEGS = [["hipR", "knR", "ftR"], ["hipL", "knL", "ftL"]], ARMS = [["shR", "elR", "haR", "knR"], ["shL", "elL", "haL", "knL"]];
    var lenL = LEGS.map(function (k) { return [dist(J[k[0]], J[k[1]]), dist(J[k[1]], J[k[2]])]; });
    var lenA = ARMS.map(function (k) { return [dist(J[k[0]], J[k[1]]), dist(J[k[1]], J[k[2]])]; });
    var dy = 112 * S * w * dep, back = 26 * S * w * dep;
    ["hips", "hipR", "hipL"].forEach(function (j) { J[j][1] += dy; J[j][0] -= f * back; });
    ["chest", "neck", "head", "shR", "elR", "haR", "shL", "elL", "haL"].forEach(function (j) {
      var k = j === "chest" ? 0.45 : j === "head" ? 1.18 : 1;
      J[j][1] += dy + 40 * S * w * dep * k; J[j][0] += -f * back + f * 74 * S * w * dep * k;
    });
    LEGS.forEach(function (k, i) { J[k[1]] = Kit.ik(J[k[0]], J[k[2]], lenL[i][0], lenL[i][1], f); });
    var hw = (o.hands == null ? 1 : o.hands) * w;
    if (hw > 0) ARMS.forEach(function (k, i) {
      var tgt = [J[k[3]][0] + f * (12 - 8 * i) * S, J[k[3]][1] - 10 * S];
      J[k[2]] = [U.lerp(J[k[2]][0], tgt[0], hw), U.lerp(J[k[2]][1], tgt[1], hw)];
      var el2 = Kit.ik(J[k[0]], J[k[2]], lenA[i][0], lenA[i][1], -f);
      J[k[1]] = [U.lerp(J[k[1]][0], el2[0], hw), U.lerp(J[k[1]][1], el2[1], hw)];
    });
  };
  Kit.lean = function (M, J, dx, dy, w) {
    if (!w) return; var f = J._f || 1;
    SF.UPPER.concat(["chest"]).forEach(function (j) { var k = j === "chest" ? 0.5 : 1; J[j][0] += f * dx * w * k; J[j][1] += dy * w * k; });
  };
  Kit.hop = function (J, h) { if (h) SF.JOINTS.forEach(function (j) { J[j][1] -= h; }); };
  Kit.headInfo = function (J, R, G0) {
    var hy = J.head[1] - R.HR * 0.32; return { head: [J.head[0], hy], top: hy - R.HR * 1.38, feet: G0, f: J._f || 1 };
  };

  // ------------------------------------------------------------------ title / time cards (#card in template.html)
  /* list: [{t0, t1, c1, c2, c3, fade: 0.25, wipe: true (c1 draws on left->right over 0.9 s), pop: t (c2 pops in at t),
            pop3: t, bg: true (paper background; false = text over the picture)}] */
  Kit.cards = function (cardEl, list) {
    var c1 = cardEl.querySelector(".c1"), c2 = cardEl.querySelector(".c2"), c3 = cardEl.querySelector(".c3"), cur = null;
    function update(t) {
      var on = null; (list || []).forEach(function (c) { if (t >= c.t0 && t < c.t1) on = c; });
      if (!on) { cardEl.style.opacity = "0"; return; }
      if (cur !== on) { c1.textContent = on.c1 || ""; c2.textContent = on.c2 || ""; c3.textContent = on.c3 || ""; cur = on; }
      var fd = on.fade == null ? 0.25 : on.fade, a = Math.min(fd ? U.ramp(t, on.t0, on.t0 + fd) : 1, fd ? 1 - U.ramp(t, on.t1 - fd, on.t1) : 1);
      if (on.cut) a = Math.min(1, fd ? 1 - U.ramp(t, on.t1 - fd, on.t1) : 1);
      cardEl.style.opacity = a.toFixed(3);
      cardEl.style.background = on.bg === false ? "transparent" : "";
      var wp = on.wipe ? U.clamp((t - on.t0 - 0.1) / 0.9, 0, 1) : 1;
      c1.style.clipPath = on.wipe ? "inset(-20% " + ((1 - wp) * 100).toFixed(1) + "% -20% 0)" : "none";
      [[c2, on.pop], [c3, on.pop3]].forEach(function (p) {
        if (p[1] == null) { p[0].style.transform = "none"; p[0].style.opacity = "1"; return; }
        var x = U.clamp((t - p[1]) / 0.35, 0, 1); p[0].style.opacity = x > 0 ? "1" : "0"; p[0].style.transform = "scale(" + U.easeOutBack(x).toFixed(3) + ")";
      });
    }
    return { update: update };
  };
  Kit.cardSvg = function (cardEl) {
    var s = el("svg", { viewBox: "0 0 1920 1080", width: 1920, height: 1080, style: "position:absolute;left:0;top:0;overflow:visible;pointer-events:none" });
    cardEl.appendChild(s); return el("g", {}, s);
  };

  // ------------------------------------------------------------------ emanata: cartoon marks around a character
  /* fx.set(o, t): every key optional, each a value object, hidden when absent:
       lines:  {x, y, r, n: 6, amp}        shock / surprise burst lines around a head (screen-shake-free "!" moment)
       twitch: {x, y, k: 0..1}             two little strain marks beside an eye (eye twitch)
       stars:  {x, y, r: 46, n: 3}         dizzy stars orbiting a head (after a bonk)
       sweat:  {x, y, k: 0..1}             a sweat drop sliding down
       smell:  {x, y, k: 0..1}             three wavy smell lines rising
       sparkle:{x, y, k: 0..1, s}          a 4-point sparkle (twinkle) that pops and fades
       puff:   {x, y, k: 0..1, s}          a dust cloud that bursts and fades (landing, fainting, a dirt pile)
       zzz:    {x, y}                      rising z's (sleep)
       anger:  {x, y, k}                   a cross-popping vein mark */
  Kit.emanata = function (parent) {
    var g = el("g", {}, parent), P = {};
    function grp(k) { P[k] = el("g", { visibility: "hidden" }, g); return P[k]; }
    var lines = grp("lines"), LN = []; for (var i = 0; i < 8; i++) LN.push(el("path", { stroke: INK, "stroke-width": 5, "stroke-linecap": "round", fill: "none" }, lines));
    var tw = grp("twitch"), TW = [el("path", { stroke: INK, "stroke-width": 4, "stroke-linecap": "round", fill: "none" }, tw), el("path", { stroke: INK, "stroke-width": 4, "stroke-linecap": "round", fill: "none" }, tw)];
    var st = grp("stars"), ST = []; for (i = 0; i < 4; i++) ST.push(el("path", { d: star(0, 0, 13, 6), fill: "#f2c94c", stroke: INK, "stroke-width": 2.5, "stroke-linejoin": "round" }, st));
    var sw = grp("sweat"), SWD = el("path", { d: "M 0 -14 C 7 -2, 9 4, 0 9 C -9 4, -7 -2, 0 -14 Z", fill: "#bfe3f2", stroke: INK, "stroke-width": 2.5 }, sw);
    var sm = grp("smell"), SM = []; for (i = 0; i < 3; i++) SM.push(el("path", { stroke: "#7c8a3a", "stroke-width": 4, "stroke-linecap": "round", fill: "none" }, sm));
    var sp = grp("sparkle"), SP = el("path", { d: star(0, 0, 22, 4, 0.25), fill: "#fff7cf", stroke: INK, "stroke-width": 2.5, "stroke-linejoin": "round" }, sp);
    var pf = grp("puff"), PF = []; for (i = 0; i < 6; i++) PF.push(el("circle", { fill: "#e8dcc4", stroke: INK, "stroke-width": 3 }, pf));
    var zz = grp("zzz"), ZZ = []; for (i = 0; i < 3; i++) { var z = el("text", { "font-family": "Caveat, cursive", "font-weight": 700, fill: INK }, zz); z.textContent = "z"; ZZ.push(z); }
    var an = grp("anger"), AN = el("path", { d: "M -12 -4 L -4 -4 L -4 -12 M 4 -12 L 4 -4 L 12 -4 M 12 4 L 4 4 L 4 12 M -4 12 L -4 4 L -12 4", stroke: "#c4453b", "stroke-width": 4, "stroke-linecap": "round", fill: "none" }, an);
    function star(cx, cy, R, n, ri) {
      var p = [], r2 = R * (ri || 0.45); for (var k = 0; k < n * 2; k++) { var a = -Math.PI / 2 + k * Math.PI / n, rr = k % 2 ? r2 : R; p.push((cx + Math.cos(a) * rr).toFixed(1) + " " + (cy + Math.sin(a) * rr).toFixed(1)); }
      return "M " + p.join(" L ") + " Z";
    }
    function vis(k, on) { P[k].setAttribute("visibility", on ? "visible" : "hidden"); }
    function set(o, t) {
      o = o || {};
      vis("lines", !!o.lines); if (o.lines) {
        var L = o.lines, n = L.n || 6, r = L.r || 70, a0 = -Math.PI * 0.95, k = 1 + 0.12 * Math.sin(t * 40);
        LN.forEach(function (p, j) {
          if (j >= n) { p.setAttribute("d", ""); return; }
          var a = a0 + j * (Math.PI * 0.9) / (n - 1); p.setAttribute("d", "M " + (L.x + Math.cos(a) * r * k).toFixed(1) + " " + (L.y + Math.sin(a) * r * k).toFixed(1) + " L " + (L.x + Math.cos(a) * (r + (L.amp || 26)) * k).toFixed(1) + " " + (L.y + Math.sin(a) * (r + (L.amp || 26)) * k).toFixed(1));
        });
      }
      vis("twitch", !!o.twitch && o.twitch.k > 0); if (o.twitch) {
        var T = o.twitch, j = Math.sin(t * 70) * 3 * T.k;
        TW[0].setAttribute("d", "M " + (T.x + 6) + " " + (T.y - 20 + j) + " L " + (T.x + 16) + " " + (T.y - 28 + j));
        TW[1].setAttribute("d", "M " + (T.x + 12) + " " + (T.y - 10 - j) + " L " + (T.x + 24) + " " + (T.y - 12 - j));
      }
      vis("stars", !!o.stars); if (o.stars) {
        var S = o.stars, rs = S.r || 46, ns = S.n || 3;
        ST.forEach(function (p, j) {
          var a = t * 5 + j * Math.PI * 2 / ns; p.setAttribute("visibility", j < ns ? "visible" : "hidden");
          p.setAttribute("transform", "translate(" + (S.x + Math.cos(a) * rs).toFixed(1) + " " + (S.y + Math.sin(a) * rs * 0.3).toFixed(1) + ") rotate(" + (t * 200 % 360).toFixed(0) + ")");
        });
      }
      vis("sweat", !!o.sweat && o.sweat.k > 0); if (o.sweat) sw.setAttribute("transform", "translate(" + o.sweat.x + " " + (o.sweat.y + o.sweat.k * 26).toFixed(1) + ")");
      vis("smell", !!o.smell && o.smell.k > 0); if (o.smell) {
        var M = o.smell; SM.forEach(function (p, j) {
          var ph = (t * 0.7 + j / 3) % 1, x = M.x + (j - 1) * 34, y = M.y - ph * 90, pts = [];
          for (var q = 0; q <= 6; q++) pts.push([x + Math.sin(q * 1.4 + t * 4 + j) * 9, y - q * 12]);
          p.setAttribute("d", ip(pts, { wobble: 0.3, step: 6 })); p.setAttribute("opacity", (M.k * Math.sin(ph * Math.PI)).toFixed(2));
        });
      }
      vis("sparkle", !!o.sparkle && o.sparkle.k > 0 && o.sparkle.k < 1); if (o.sparkle) {
        var K = o.sparkle, s = Math.sin(Math.PI * U.clamp(K.k, 0, 1)) * (K.s || 1); sp.setAttribute("transform", "translate(" + K.x + " " + K.y + ") scale(" + s.toFixed(3) + ") rotate(" + (K.k * 90).toFixed(0) + ")");
      }
      vis("puff", !!o.puff && o.puff.k > 0 && o.puff.k < 1); if (o.puff) {
        var F = o.puff, kk = U.clamp(F.k, 0, 1), sc = F.s || 1;
        PF.forEach(function (c, j) {
          var a = Math.PI + j * Math.PI / 5, d = (20 + 60 * Math.sqrt(kk)) * sc;
          c.setAttribute("cx", (F.x + Math.cos(a) * d).toFixed(1)); c.setAttribute("cy", (F.y + Math.sin(a) * d * 0.45 - 10 * sc).toFixed(1));
          c.setAttribute("r", ((16 + 10 * Math.sin(j * 2.1)) * sc * (1 - kk * 0.6)).toFixed(1)); c.setAttribute("opacity", (1 - kk).toFixed(2));
        });
      }
      vis("zzz", !!o.zzz); if (o.zzz) ZZ.forEach(function (z, j) {
        var ph = (t * 0.45 + j / 3) % 1; z.setAttribute("x", (o.zzz.x + ph * 40 + Math.sin(ph * 6) * 6).toFixed(1)); z.setAttribute("y", (o.zzz.y - ph * 90).toFixed(1));
        z.setAttribute("font-size", (22 + ph * 26).toFixed(0)); z.setAttribute("opacity", Math.sin(ph * Math.PI).toFixed(2));
      });
      vis("anger", !!o.anger && o.anger.k > 0); if (o.anger) an.setAttribute("transform", "translate(" + o.anger.x + " " + o.anger.y + ") scale(" + (0.8 + 0.3 * Math.abs(Math.sin(t * 9))) * o.anger.k + ")");
    }
    return { g: g, set: set };
  };

  // ------------------------------------------------------------------ Layla's knitting tote
  Kit.bag = function (parent) {
    var g = el("g", {}, parent);
    el("path", { d: "M -8 0 C -6 -26, 6 -26, 8 0", stroke: "#8b6a43", "stroke-width": 4, fill: "none" }, g);
    el("path", { d: ip([[-24, 0], [24, 0], [28, 42], [-28, 42]], { wobble: 0.4, step: 8, seed: 81, closed: true }), fill: "#e9d7b4", stroke: INK, "stroke-width": 3.5, "stroke-linejoin": "round" }, g);
    el("path", { d: "M -24 14 L 26 14", stroke: "#2f7f8f", "stroke-width": 5 }, g);
    el("path", { d: "M 6 4 L 18 -30 M 12 4 L 26 -26", stroke: "#c9a46a", "stroke-width": 4, "stroke-linecap": "round" }, g);   // needles
    el("circle", { cx: -8, cy: -4, r: 10, fill: "#c4453b", stroke: INK, "stroke-width": 2.5 }, g);                            // yarn ball
    return { g: g, set: function (x, y, o) { o = o || {}; g.setAttribute("transform", "translate(" + x.toFixed(1) + " " + y.toFixed(1) + ") rotate(" + (o.rot || 0) + ")"); g.setAttribute("visibility", o.hidden ? "hidden" : "visible"); } };
  };

  // ------------------------------------------------------------------ speech / thought bubble (contents: draw into .inner)
  Kit.bubble = function (parent) {
    var g = el("g", {}, parent), tail = el("path", { fill: "#fffdf6", stroke: INK, "stroke-width": 4, "stroke-linejoin": "round" }, g);
    var body = el("path", { fill: "#fffdf6", stroke: INK, "stroke-width": 4.5, "stroke-linejoin": "round" }, g);
    var dots = [0, 1, 2].map(function () { return el("circle", { fill: "#fffdf6", stroke: INK, "stroke-width": 4 }, g); });
    var inner = el("g", {}, g);
    function set(o) {
      if (!o || o.hidden || (o.s != null && o.s <= 0.01)) { g.setAttribute("visibility", "hidden"); return; }
      g.setAttribute("visibility", "visible");
      var x = o.x, y = o.y, w = o.w || 300, h = o.h || 180, s = o.s == null ? 1 : o.s, tl = o.tail || [x - w * 0.3, y + h * 0.9];
      g.setAttribute("transform", "translate(" + x + " " + y + ") scale(" + s.toFixed(3) + ") translate(" + (-x) + " " + (-y) + ")");
      if (o.thought) {
        var pts = []; for (var k = 0; k < 14; k++) { var a = k / 14 * Math.PI * 2; pts.push([x + Math.cos(a) * w / 2 * (1 + 0.06 * Math.sin(k * 3)), y + Math.sin(a) * h / 2 * (1 + 0.06 * Math.cos(k * 2))]); }
        var d = "M " + U.pt(pts[0]); for (k = 1; k <= 14; k++) { var p0 = pts[k - 1], p1 = pts[k % 14], mx = (p0[0] + p1[0]) / 2, my = (p0[1] + p1[1]) / 2, ox = (mx - x) * 0.22, oy = (my - y) * 0.22; d += " Q " + (mx + ox).toFixed(1) + " " + (my + oy).toFixed(1) + " " + U.pt(p1); }
        body.setAttribute("d", d + " Z"); tail.setAttribute("d", "");
        dots.forEach(function (c, j) { var q = (j + 1) / 4; c.setAttribute("cx", U.lerp(x - w * 0.25, tl[0], q).toFixed(1)); c.setAttribute("cy", U.lerp(y + h * 0.45, tl[1], q).toFixed(1)); c.setAttribute("r", (14 - j * 4).toFixed(1)); c.setAttribute("visibility", "visible"); });
      } else {
        body.setAttribute("d", ip([[x - w / 2, y - h / 2], [x + w / 2, y - h / 2], [x + w / 2, y + h / 2], [x - w / 2, y + h / 2]], { wobble: 0.6, step: 20, seed: 83, closed: true }));
        tail.setAttribute("d", "M " + (x - w * 0.12) + " " + (y + h / 2 - 4) + " L " + tl[0] + " " + tl[1] + " L " + (x + w * 0.06) + " " + (y + h / 2 - 4) + " Z");
        dots.forEach(function (c) { c.setAttribute("visibility", "hidden"); });
      }
    }
    return { g: g, inner: inner, set: set };
  };

  // ------------------------------------------------------------------ Pip's birdhouse (world layer: no parallax slip)
  Kit.birdhouse = function (parent, x, G0, o) {
    o = o || {}; var h = o.h || 250, g = el("g", {}, parent), top = G0 - h;
    el("path", { d: ip([[x, G0 + 2], [x + 1, top + 30]], { wobble: 0.5, step: 20, seed: 91 }), stroke: "#8b6a43", "stroke-width": 11, "stroke-linecap": "round", fill: "none" }, g);
    el("path", { d: ip([[x, G0 + 2], [x + 1, top + 30]], { wobble: 0.5, step: 20, seed: 91 }), stroke: INK, "stroke-width": 2, "stroke-opacity": 0.5, fill: "none" }, g);
    el("path", { d: ip([[x - 34, top + 34], [x + 34, top + 34], [x + 34, top - 18], [x - 34, top - 18]], { wobble: 0.5, step: 10, seed: 92, closed: true }), fill: "#e7c98f", stroke: INK, "stroke-width": 4, "stroke-linejoin": "round" }, g);
    el("path", { d: ip([[x - 48, top - 12], [x, top - 56], [x + 48, top - 12]], { wobble: 0.5, step: 10, seed: 93 }), fill: "#c4453b", stroke: INK, "stroke-width": 4.5, "stroke-linejoin": "round", "stroke-linecap": "round" }, g);
    el("circle", { cx: x, cy: top + 4, r: 11, fill: "#3a3226", stroke: INK, "stroke-width": 3 }, g);
    el("path", { d: "M " + (x - 3) + " " + (top + 22) + " L " + (x + 22) + " " + (top + 22), stroke: "#8b6a43", "stroke-width": 5, "stroke-linecap": "round" }, g);
    return { g: g, x: x, perch: [x + 16, top + 22 - 24], roof: [x, top - 56 - 22], top: top };
  };

  root.Kit = Kit;
})(typeof window !== "undefined" ? window : globalThis);
