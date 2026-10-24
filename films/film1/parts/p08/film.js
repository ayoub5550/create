/* Sam & Layla Ep. 1 — P08 "The night watch" (~68 s). Structure follows parts/p01 (the reference part).
 * Data: FILM_DATA (dialogue.py) · FILM_CAST · FILM_SHOTS (shots.json, hand-directed, word-anchored).
 * Beat sheet: OPEN night EWS (moon, stars, lit windows, fireflies, owl; Pip asleep on the birdhouse roof) -> Sam sits on
 * the ground against the rock in a SLEEPING BAG, HEADLAMP on (a soft cone lights the sapling), a thermos on his knees:
 * "Just you and me, buddy." -> CU "I'm not blinking." (eyes wide; he never blinks) -> he sips the cocoa: "ahh" (bliss,
 * eyes heavy) -> "Not blinking... not sleeping..." eyelids droop -> two-shot: head drops, lamp points at the dirt, the
 * sapling GROWS (only while his eyes are closed) -> SNAP "I'm up! I'm up." -> rule of three, silent: droop #2 (faster),
 * it grows again, a bigger SNAP + head shake -> "Maybe I'll count sheep": a THOUGHT BUBBLE, little sheep jump over a tiny
 * sapling, one per count (baa) -> "Three... tree... trees...": the sheep turn into trees -> he nods off (head back, lamp to
 * the sky), the bubble pops, SNORES + zzz -> Layla tiptoes in from the right with a folded BLANKET, a big snore FREEZES her
 * mid-step -> she drapes the blanket over him, switches his headlamp off (click) -> "Goodnight, Sam." -> she turns to the
 * sapling, leans in: "And you... take your time." a leaf pops in reply, a soft smile -> TIME-LAPSE: she zips out in
 * fast-forward, stars wheel, the moon arcs down and sets, windows go dark, Sam flops between sleeping poses, the sapling
 * grows into a young tree taller than Sam (leaf pops), a leaf falls onto his face and flutters with each snore -> dawn:
 * indigo -> pink -> gold, fireflies fade, birdsong, Pip wakes up and chirps -> fade out.
 * Beat times derive from the dialogue timeline; score.py uses the same formulas. Everything is a pure function of t. */
(function () {
  "use strict";
  var SF = window.StickFilm, U = SF.u, el = U.el, ramp = U.ramp, INK = "#2b2a28";
  var DATA = window.FILM_DATA, CAST = window.FILM_CAST.characters, SHOTS = window.FILM_SHOTS.shots;
  var CL = Object.assign({ stand: SF.standClip() }, window.FILM_CLIPS || {});
  var K = Kit.lines(DATA), L = K.L, w = K.w, bump = Kit.bump;
  var DUR = DATA.total, G0 = 820;
  function ip(pts, o) { return Ink.path(pts, Object.assign({ wobble: 0.8, step: 12 }, o || {})); }
  function seg(x, a, b) { return U.clamp((x - a) / (b - a), 0, 1); }
  function lerp2(a, b, k) { return [U.lerp(a[0], b[0], k), U.lerp(a[1], b[1], k)]; }

  // ---------- beats (same formulas in score.py) ----------
  var tOwl = 1.3;
  var tSip0 = L.l1.end + 0.45;                                    // reach for the thermos -> sip -> "ahh"
  var tClose1 = L.l2.end + 0.15, tSnap1 = L.l3.start - 0.22;      // droop #1 (eyes closed) -> SNAP "I'm up!"
  var tGrow1 = [tClose1 + 0.9, tClose1 + 1.75];                   //   the sapling grows while his eyes are closed
  var tClose2 = L.l3.end + 0.45, tSnap2 = tClose2 + 1.15;         // droop #2 (silent, faster) -> bigger SNAP + head shake
  var tGrow2 = [tClose2 + 0.35, tClose2 + 0.75];
  var tShake = tSnap2 + 0.15;
  var tBub0 = w("l4", 2).t0 - 0.15;                               // thought bubble pops up on "count"
  var tJ = [w("l4", 4).t0 + 0.1, w("l4", 6).t0 + 0.1, w("l5", 0).t0 + 0.1];   // sheep jumps: One / two / Three
  var tM = [w("l5", 2).t0, w("l5", 2).t0 + 0.12, w("l5", 1).t0];  // sheep -> trees ("trees..." x2, "tree...")
  var tClose3 = L.l5.end - 0.1, tBubOut = L.l5.end + 0.3;         // asleep; the bubble pops
  var tIn0 = L.l5.end + 0.3, P_IN = 0.6, N_IN = 4;                // Layla tiptoes in (4 big sneaky strides)
  var tFreeze = tIn0 + 1.5 * P_IN, FREEZE = 1.0;                  // a big snore freezes her mid-step
  var tArr = tIn0 + N_IN * P_IN + FREEZE;                          // she reaches her mark behind his legs
  var SP = 2.6, tSnore0 = tFreeze - 0.25;                         // snore cycles (inhale rasp, whistly exhale)
  var tD0 = tArr + 0.05, tD1 = tD0 + 1.0;                         // the blanket drape
  var tReach = tD1 + 0.1, tClick = tReach + 0.4;                  // she switches his headlamp off
  var tTurn = L.l6.end + 0.2;                                     // she turns to the sapling
  var tPopL = L.l7.end + 0.35;                                    // a leaf pops in reply
  var tOut0 = L.l7.end + 1.45, P_OUT = 0.55, N_OUT = 10;          // she tiptoes out...
  var tTL = tOut0 + 0.25;                                         // TIME-LAPSE: wide shot
  var tFast = tTL + 1.4, FAST_D = 1.2, FAST_K = 7;                // ...and zips off in fast-forward
  var tWin = tTL + 3.2;                                           // the windows go dark
  var tGrowT = [0, 1, 2, 3].map(function (k) { return tTL + 2.6 + k * 1.8; });
  var tLeafShot = tTL + 9.3, tLeaf0 = tLeafShot - 0.4, tLeaf1 = tLeafShot + 1.6;   // a leaf falls onto his face
  var tWide2 = tLeafShot + 6.0;
  tGrowT.push(tWide2 + 0.8, tWide2 + 2.6);
  var tDawn0 = tTL + 13.4, tDawn1 = DUR - 0.8;                    // night -> dawn
  var tPip = DUR - 3.6;                                           // Pip wakes up
  var tPoses = [tTL + 2.0, tTL + 4.4, tTL + 6.6];                 // time-lapse sleeper flops between poses
  var G_STEPS = [[tGrow1[0], 0.355], [tGrow1[1], 0.37], [tGrow2[0], 0.39], [tGrow2[1], 0.41], [tPopL, 0.43]];
  var GT = [0.47, 0.51, 0.55, 0.58, 0.60, 0.62];
  tGrowT.forEach(function (tg, k) { G_STEPS.push([tg, GT[k]]); });
  function treeG(t) {                                              // stepped growth, each step pops (easeOutBack)
    var g = 0.34;
    G_STEPS.forEach(function (s, k) { var prev = k ? G_STEPS[k - 1][1] : 0.34; g += (s[1] - prev) * U.easeOutBack(seg(t, s[0], s[0] + 0.35)); });
    return g;
  }
  // story time: runs 1x, then up to 8x in the time-lapse (fast-forward)
  function tau(t) {
    if (t < tFast) return t;
    var u = Math.min(1, (t - tFast) / FAST_D), x = FAST_K * FAST_D * (u * u * u - u * u * u * u / 2);
    return t + x + (t > tFast + FAST_D ? FAST_K * (t - tFast - FAST_D) : 0);
  }
  function snorePh(t) { return t < tSnore0 ? -1 : ((t - tSnore0) % SP) / SP; }
  var asleep = function (t) { return t > tClose3 + 0.2; };

  // ---------- world ----------
  var stage = document.getElementById("stage"), back = document.getElementById("back"), props = document.getElementById("props");
  var figG = document.getElementById("fig"), front = document.getElementById("front"), camG = document.getElementById("cam");
  var dawnK = function (t) { return ramp(t, tDawn0, tDawn1); };
  var Y = FilmSet.yard({ G0: G0, ref: [1040, 560, 1.25], look: function (t) { return ["night", "dawn", dawnK(t)]; }, season: "summer",
    garden: { x: 1000 }, lights: function (t) { return t < tWin ? 1 : 1 - ramp(t, tWin, tWin + 0.12); } });
  var rock = Props.rock(back, 610, G0);
  var bh = Kit.birdhouse(back, 1640, G0);
  var mound = Props.mound(props, 1000, G0);
  var tree = Props.tree(props, 1000 - 16, G0 - 26), TX = 984;
  var pip = Props.pip(props);

  // sky: our own moon that arcs down and sets, and the set's stars wheel around the same pivot (set.js's moon is fixed)
  var sky = document.getElementById("sky"), skyGs = sky.querySelectorAll(":scope > g");
  var starsG = skyGs[0], setMoon = skyGs[2];
  if (setMoon) setMoon.style.display = "none";
  var moon = el("g", {}, sky);
  el("circle", { r: 130, fill: "#fff6cf", opacity: 0.10 }, moon);
  el("circle", { r: 62, fill: "#f6f0d2", stroke: INK, "stroke-width": 4 }, moon);
  el("path", { d: "M 20 -50 A 60 60 0 0 1 20 50 A 44 44 0 0 0 20 -50 Z", fill: "#e3dcb8", opacity: 0.6 }, moon);
  [[-18, -14, 9], [8, 18, 6], [-6, 30, 4]].forEach(function (c) { el("circle", { cx: c[0], cy: c[1], r: c[2], fill: "#ddd5b0" }, moon); });
  var PIV = [1000, 1100], M0 = [1560, 210], MR = Math.hypot(M0[0] - PIV[0], M0[1] - PIV[1]), MA = Math.atan2(M0[1] - PIV[1], M0[0] - PIV[0]);
  var skyP = function (t) { return ramp(t, tTL + 0.8, DUR - 2.0); };

  // set.js paints the windows yellow in the night palette even when lights() = 0: cover them (local workaround)
  var house = document.querySelector('#mid g[transform^="translate(150 "]'), WINC = [];
  if (house) [[50, -185], [50, -95]].forEach(function (w0, k) {
    var r = el("path", { d: ip([[w0[0], w0[1]], [w0[0] + 100, w0[1]], [w0[0] + 100, w0[1] + 66], [w0[0], w0[1] + 66]], { wobble: 0.6, step: 18, seed: 36 + k, closed: true }), stroke: INK, "stroke-width": 4, fill: "#3b4766", opacity: 0 }, house);
    el("path", { d: "M " + (w0[0] + 50) + " " + w0[1] + " L " + (w0[0] + 50) + " " + (w0[1] + 66) + " M " + w0[0] + " " + (w0[1] + 33) + " L " + (w0[0] + 100) + " " + (w0[1] + 33), stroke: INK, "stroke-width": 3, fill: "none", "stroke-linecap": "round" }, house);
    WINC.push(r);
  });
  // untinted "light" layer: mirrors the camera, sits above the tinted world (glows, headlamp, bubble, marks)
  var glow = el("g", {}, null); stage.insertBefore(glow, document.getElementById("fore"));
  var defs = stage.querySelector("defs");
  var gg = el("radialGradient", { id: "ffGlow" }, defs);
  el("stop", { offset: "0", "stop-color": "#fff6a8", "stop-opacity": 0.85 }, gg); el("stop", { offset: "1", "stop-color": "#fff6a8", "stop-opacity": 0 }, gg);
  var cg = el("linearGradient", { id: "coneGrad", x1: 0, y1: 0, x2: 1, y2: 0 }, defs);
  el("stop", { offset: "0", "stop-color": "#fff1b0", "stop-opacity": 0.55 }, cg); el("stop", { offset: "1", "stop-color": "#fff1b0", "stop-opacity": 0 }, cg);

  // ---------- cast ----------
  var LS = CAST.sam.look, LL = CAST.layla.look;
  var XS = 735, HY = G0 - 16, XL = 860, XIN = 1480, XOUT = 1480 + 0;
  var MS = SF.motion({ clips: CL, scale: LS.scale, ground: G0, segments: [{ t0: 0, t1: DUR + 1, clip: "stand", hold: 0 }], anchor: { seg: 0, x: XS, edge: "start" } });
  var ML = SF.motion({ clips: CL, scale: LL.scale, ground: G0, segments: [
    { t0: 0, t1: tTurn, clip: "stand", hold: 0, f: -1 },
    { t0: tTurn, t1: tOut0 - 0.05, clip: "stand", hold: 0, f: 1, blend: 0.4 },
    { t0: tOut0 - 0.05, t1: DUR + 1, clip: "stand", hold: 0, f: 1 }], anchor: { seg: 0, x: 0, edge: "start" } });
  var CS = DATA.chars.sam, CY = DATA.chars.layla, S_S = MS.S, S_L = ML.S;
  var UPPER = SF.UPPER.concat(["chest"]);
  function rotAll(J, keys, c, a) {
    var cs = Math.cos(a), sn = Math.sin(a);
    keys.forEach(function (k) { var dx = J[k][0] - c[0], dy = J[k][1] - c[1]; J[k] = [c[0] + dx * cs - dy * sn, c[1] + dx * sn + dy * cs]; });
  }
  function elbowDown(sh, ha, l1, l2) {
    var a = Kit.ik(sh, ha, l1, l2, 1), b = Kit.ik(sh, ha, l1, l2, -1); return a[1] > b[1] ? a : b;
  }

  // ----- Sam: sits on the ground, back against the rock, legs in the bag; arms crossed ("on guard")
  var droop1 = function (t) { return 0.35 * ramp(t, L.l2.start + 0.4, L.l2.end) + 0.65 * ramp(t, L.l2.end, L.l2.end + 0.5) - ramp(t, tSnap1, tSnap1 + 0.1); };
  var droop2 = function (t) { return ramp(t, L.l3.end + 0.2, L.l3.end + 0.5) - ramp(t, tSnap2, tSnap2 + 0.08); };
  var nod4 = function (t) { return 0.25 * ramp(t, L.l4.start, L.l4.end) + 0.25 * ramp(t, L.l5.start, L.l5.end - 0.4); };
  function sleepPose(t) {                                          // 0 head back (snoring up) · 1 chin down · 2 head to the side + arm flop
    var p = [0, 0, 0];
    if (t < tPoses[0] || t > tLeaf0 - 0.6) { p[0] = 1; return p; }
    var k = t < tPoses[1] ? 1 : t < tPoses[2] ? 2 : 0, ts = k === 1 ? tPoses[0] : k === 2 ? tPoses[1] : tPoses[2], prev = k === 1 ? 0 : k === 2 ? 1 : 2;
    var m = seg(t, ts, ts + 0.15); p[k] += m; p[prev] += 1 - m; return p;
  }
  var SIP = [[0, 0], [tSip0, 0], [tSip0 + 0.4, 1], [tSip0 + 0.9, 2], [tSip0 + 1.7, 2], [tSip0 + 2.15, 1], [tSip0 + 2.5, 0]];
  function sipState(t) {                                           // 0 rest (arms crossed) · 1 hand on thermos (on knees) · 2 at mouth
    for (var i = 1; i < SIP.length; i++) if (t < SIP[i][0]) { var a = SIP[i - 1], b = SIP[i]; return [a[1], b[1], U.smooth((t - a[0]) / (b[0] - a[0]))]; }
    return [0, 0, 1];
  }
  var THERM = [XS + 84, HY - 36 - 26];                              // thermos grip when standing on his knees
  function jointsSam(t, plain) {
    var J = MS.joints(t), f = 1;
    var dy = HY - J.hips[1]; SF.JOINTS.forEach(function (k) { J[k][1] += dy; });
    var hp = J.hips;
    J.hipR = [hp[0] + 4, hp[1] + 4]; J.hipL = [hp[0] - 2, hp[1] + 4];
    J.knR = [hp[0] + 86, hp[1] - 14]; J.knL = [hp[0] + 80, hp[1] - 10];
    J.ftR = [hp[0] + 168, G0 - 12]; J.ftL = [hp[0] + 160, G0 - 9];
    if (plain) return J;
    var sl = asleep(t) ? 1 : ramp(t, tClose3 - 0.2, tClose3 + 0.5), sp = sleepPose(t);
    var lean = 0.1 + 0.2 * sl * (sp[0] + 0.6 * sp[1] + 0.8 * sp[2]);
    lean += 0.06 * (droop1(t) + droop2(t));
    rotAll(J, UPPER, hp, -f * lean);
    Talk.idle(J, t, "sam", { amp: asleep(t) ? 0.35 : 0.8 });
    var ss = sipState(t), wSip = ss[0] === 0 && ss[1] === 0 ? 0 : (ss[0] === 0 ? ss[2] : ss[1] === 0 ? 1 - ss[2] : 1);
    Talk.act(MS, J, t, [{ g: "crossArms", t0: -1, t1: DUR + 2, ease: 0.01 }]);
    var flop = sl * sp[2];                                        // time-lapse: the far arm flops out over the bag
    if (flop > 0) { MS.pose(J, { elL: ["neck", 62, 70], haL: ["neck", 128, 96] }, flop); }
    if (wSip > 0) {                                               // the sip: near hand to the thermos, to the mouth, back
      var hs = Kit.headInfo(J, RS0, G0), mo = [hs.head[0] + f * RS0.HR * 0.5 + f * 30, hs.head[1] + RS0.HR * 0.42 + 12], h0 = J.haR.slice();
      var pos = function (s) { return s === 0 ? h0 : s === 1 ? THERM : mo; };
      var tgt = lerp2(pos(ss[0]), pos(ss[1]), ss[2]);
      J.haR = tgt; J.elR = elbowDown(J.neck, tgt, 80 * S_S, 58 * S_S);
    }
    // head: droops (chin to chest), snaps up, shakes; asleep it lolls (snore lifts the chest)
    var d = Math.max(droop1(t), droop2(t), 0), dn = nod4(t);
    J.head[0] += f * 9 * d + f * 4 * dn; J.head[1] += 15 * d + 6 * dn;
    J.head[0] += f * 14 * sl * sp[1] - f * 10 * sl * sp[2]; J.head[1] += 24 * sl * sp[1] + 8 * sl * sp[2];
    if (sp[2] > 0) UPPER.forEach(function (k) { J[k][1] += 12 * sl * sp[2]; J[k][0] += f * 6 * sl * sp[2]; });   // slides down into the bag
    var snap = bump(t, tSnap1, 0.4) + 1.4 * bump(t, tSnap2, 0.45);
    UPPER.forEach(function (k) { J[k][1] -= snap * 10; J[k][0] += f * snap * 5; });
    var shake = ramp(t, tShake, tShake + 0.05) * (1 - ramp(t, tShake + 0.55, tShake + 0.65));
    J.head[0] += Math.sin((t - tShake) * 2 * Math.PI * 8) * 9 * shake;
    var ph = snorePh(t);
    if (ph >= 0 && sl > 0) { var br = ph < 0.45 ? Math.sin(Math.PI * ph / 0.45) : 0; ["chest", "neck", "head", "shR", "shL", "elR", "elL", "haR", "haL"].forEach(function (k) { J[k][1] -= br * 4 * sl; }); }
    if (t > tD1) { var sn = ramp(t, tD1 + 0.2, tD1 + 0.6) * (1 - ramp(t, tD1 + 0.9, tD1 + 1.3)); J.head[1] += sn * 4; J.head[0] -= f * sn * 3; }   // snuggles in
    Talk.accents(J, t, CS.accents, asleep(t) ? 0 : 2.2);
    return J;
  }

  // ----- Layla: procedural TIPTOE (high sneaky strides) in from the right, drape, lamp, sapling, tiptoe out
  function stepper(tt, ta, n, P, xa, xb) {
    var u = U.clamp((tt - ta) / P, 0, n), i = Math.min(n - 1, Math.floor(u)), ph = u - i, SL = (xb - xa) / n;
    function foot(leg) {
      var j = (i % 2 === leg) ? i : i - 1;
      if (j === i && u < n) { var s = U.smooth(ph); return [xa + (i - 1 + 2 * s) * SL + 0.5 * SL, Math.sin(Math.PI * ph) * 1]; }
      return [xa + (j + 1) * SL + 0.5 * SL, 0];
    }
    return { x: xa + u * SL, ph: u >= n ? 0 : ph, R: foot(0), L: foot(1), moving: u > 0 && u < n };
  }
  function inTau(t) { return t < tFreeze ? t : t < tFreeze + FREEZE ? tFreeze : t - FREEZE; }   // the freeze stops her clock
  function laylaWalk(t) {
    if (t < tTurn + 1) return stepper(inTau(t), tIn0, N_IN, P_IN, XIN, XL);
    return stepper(tau(t), tOut0, N_OUT, P_OUT, XL, XL + 110 * N_OUT);
  }
  var CARRY = { elR: ["neck", 34, 62], haR: ["neck", 66, 44], elL: ["neck", 22, 66], haL: ["neck", 56, 50] };
  var PAWS = { elR: ["neck", 40, 40], haR: ["neck", 64, 12], elL: ["neck", 28, 46], haL: ["neck", 52, 18] };
  var DRAPE = [[tD0, 66, 44, 56, 50], [tD0 + 0.35, 92, -26, 80, -20], [tD0 + 0.75, 104, 56, 92, 62], [tD1 + 0.05, 40, 96, 30, 98]];
  function jointsLayla(t) {
    var J = ML.joints(t), f = J._f || 1, st = laylaWalk(t);
    SF.JOINTS.forEach(function (k) { J[k][0] += st.x; });
    var walkW = st.moving ? 1 : 0, bob = st.moving ? 4 + 6 * Math.sin(Math.PI * st.ph) : 0;
    if (t > tFreeze && t < tFreeze + FREEZE && t < tTurn) { walkW = 1; bob = 4 + 6 * Math.sin(Math.PI * st.ph); }
    UPPER.concat(["hips", "hipR", "hipL"]).forEach(function (k) { J[k][1] -= bob; });
    if (walkW > 0) {                                                // legs: IK knees, feet on tiptoe, swing foot lifted high
      var l1 = 117 * S_L, l2 = 118 * S_L;
      [["R", st.R], ["L", st.L]].forEach(function (p) {
        var ft = [p[1][0] + (p[0] === "L" ? -f * 4 : 0), G0 - 5 - p[1][1] * 46];
        J["ft" + p[0]] = ft; J["kn" + p[0]] = Kit.ik(J["hip" + p[0]], ft, l1, l2, f);
      });
      Kit.lean(ML, J, 10, 4, 1);
    }
    Talk.idle(J, t, "layla", { amp: walkW ? 0.3 : 0.8 });
    var carry = t < tD0 ? 1 : 0, paws = ramp(t, tOut0 - 0.3, tOut0);
    if (carry) ML.pose(J, CARRY, 1);
    if (t >= tD0 && t < tD1 + 0.5) {                               // the drape: lift, flick out, settle, let go
      var o = U.keys(DRAPE, t, 0.42), wr = 1 - ramp(t, tD1, tD1 + 0.45);
      ML.pose(J, { haR: ["neck", o[0], o[1]], haL: ["neck", o[2], o[3]] }, wr);
      J.elR = elbowDown(J.neck, J.haR, 80 * S_L, 58 * S_L); J.elL = elbowDown(J.neck, J.haL, 80 * S_L, 58 * S_L);
    }
    var bend = ramp(t, tD0 + 0.3, tD0 + 0.7) * (1 - ramp(t, tClick + 0.3, tClick + 0.7));
    Kit.lean(ML, J, 34, 22, bend);
    if (t > tReach - 0.1 && t < tClick + 0.7) {                    // reach out and click his lamp off
      var lw = ramp(t, tReach, tClick) * (1 - ramp(t, tClick + 0.2, tClick + 0.6)), lp = lampPos(jointsSamCached(t));
      J.haR = lerp2(J.haR, [lp[0] + 6, lp[1] + 2], lw); J.elR = elbowDown(J.neck, J.haR, 80 * S_L, 58 * S_L);
    }
    var whisper = ramp(t, tTurn + 0.25, L.l7.start) * (1 - ramp(t, tOut0 - 0.4, tOut0));   // leans in to the sapling
    Kit.lean(ML, J, 22, 12, whisper); J.head[1] += whisper * 3; J.head[0] += f * whisper * 2;
    if (paws > 0) ML.pose(J, PAWS, paws);
    var fr = t > tFreeze && t < tFreeze + FREEZE ? ramp(t, tFreeze, tFreeze + 0.08) * (1 - ramp(t, tFreeze + FREEZE - 0.15, tFreeze + FREEZE)) : 0;
    J.head[1] -= fr * 5; UPPER.forEach(function (k) { J[k][1] -= fr * 3; });   // freeze: shoulders up
    Talk.accents(J, t, CY.accents, 1.6);
    Talk.nods(J, t, CY.nods, 3.5);
    return J;
  }

  // ---------- faces ----------
  var EX_S = Kit.expr([[0, [-0.05, -0.8, 1.25]], [w("l1", 0).t0 - 0.1, [0.55, 0.15, 1.15], 0.2], [w("l1", 5).t0 - 0.1, [-0.1, -0.95, 1.65], 0.15],
    [tSip0 + 0.9, [0.25, 0.4, 0.85], 0.3], [tSip0 + 1.85, [0.9, 0.55, 0.55], 0.25], [L.l2.start, [0.1, 0.45, 0.55], 0.3],
    [w("l2", 2).t0, [0.0, 0.5, 0.42], 0.4], [tSnap1, [-0.4, 1.2, 1.8], 0.06], [L.l3.start + 0.7, [-0.1, -0.7, 1.5], 0.25],
    [L.l3.end + 0.15, [0.05, 0.45, 0.5], 0.3], [tSnap2, [-0.45, 1.3, 1.85], 0.05], [tShake + 0.7, [-0.15, -0.85, 1.5], 0.2],
    [L.l4.start + 0.3, [0.3, 0.35, 0.62], 0.4], [w("l4", 4).t0, [0.4, 0.3, 0.52], 0.4], [L.l5.start, [0.45, 0.3, 0.42], 0.4],
    [tClose3, [0.25, 0.3, 1.0], 0.2], [tD1 + 0.3, [0.85, 0.3, 1.0], 0.4]]);
  var EX_L = Kit.expr([[0, [0.2, 0.5, 1.05]], [tFreeze, [-0.2, 1.05, 1.5], 0.08], [tFreeze + FREEZE - 0.2, [0.15, 0.55, 1.0], 0.25],
    [tD0, [0.5, 0.3, 0.95], 0.4], [L.l6.start - 0.3, [0.55, 0.35, 0.9], 0.3], [tTurn + 0.3, [0.6, 0.4, 0.95], 0.3],
    [tPopL, [0.72, 0.45, 1.0], 0.3], [tOut0, [0.35, 0.45, 1.05], 0.3]]);
  // Sam does not blink ("I'm not blinking") until his eyes close for real
  var BLINK_S = [[tClose1, tSnap1 - tClose1], [tClose2, tSnap2 - tClose2], [tClose3, 999]];
  var BLINK_L = CY.blinks.filter(function (b) { var b0 = b[0] != null ? b[0] : b; return Math.abs(b0 - tFreeze - 0.4) > 0.8; }).concat([[tPopL + 0.5, 0.35]]);
  var lipS = Talk.mouth(CS.mouth), lipL = Talk.mouth(CY.mouth);
  function mouthS(t) {
    var m = lipS(t); if (m !== "X") return m;
    if (t > tSip0 + 0.95 && t < tSip0 + 1.65) return "F";                 // sipping
    if (t > tSip0 + 1.9 && t < tSip0 + 2.6) return "C";                   // "ahh"
    if (t > tSnap1 && t < tSnap1 + 0.3) return "E";
    if (t > tSnap2 && t < tSnap2 + 0.35) return "E";
    if (t > tClose1 + 0.8 && t < tClose1 + 1.6) return "B";               // a tiny snore in droop #1
    var ph = snorePh(t);
    if (asleep(t) && ph >= 0) return ph < 0.45 ? (ph > 0.08 && ph < 0.4 ? "D" : "C") : (ph > 0.55 && ph < 0.92 ? "F" : "B");
    return "X";
  }
  function mouthL(t) { var m = lipL(t); if (m !== "X") return m; return t > tFreeze && t < tFreeze + FREEZE - 0.2 ? "E" : "X"; }

  // ---------- rigs + local props (draw order: Layla behind Sam's legs, then Sam, bag, blanket, thermos) ----------
  var RL = SF.rig(figG, { scale: LL.scale, head: LL.head, ink: LL.ink, color: LL.color, accessories: LL.accessories, backInk: "#5a5751",
    expr: EX_L, blinks: BLINK_L, mouth: mouthL, mouthFill: "#8e352d", lineComp: 0.6, seed: 2 });
  var RS = SF.rig(figG, { scale: LS.scale, head: LS.head, ink: LS.ink, color: LS.color, accessories: LS.accessories, backInk: "#5a5751",
    expr: EX_S, blinks: BLINK_S, mouth: mouthS, mouthFill: "#8e352d", lineComp: 0.6, seed: 1 });
  var RS0 = RS;
  var cacheT = null, cacheJ = null;
  function jointsSamCached(t) { if (cacheT !== t) { cacheT = t; cacheJ = jointsSam(t); } return cacheJ; }
  function lampPos(J) { var hx = J.head[0], hy = J.head[1] - RS.HR * 0.32; return [hx + RS.HR * 0.86, hy - RS.HR * 0.5]; }

  // sleeping bag (orange, quilted) over his legs
  var bagG = el("g", {}, figG);
  var bagP = el("path", { fill: "#e08a3c", stroke: INK, "stroke-width": 4.5, "stroke-linejoin": "round" }, bagG);
  var bagQ = el("path", { fill: "none", stroke: "#a85f26", "stroke-width": 3, "stroke-linecap": "round" }, bagG);
  var bagZ = el("path", { fill: "none", stroke: INK, "stroke-width": 2.5, "stroke-dasharray": "5 5", "stroke-opacity": 0.6 }, bagG);
  function bagPts(J) {
    var hp = J.hips, kn = J.knR, ft = J.ftR;
    return { top: [[hp[0] - 26, hp[1] - 18], [hp[0] + 40, hp[1] - 22], [kn[0], kn[1] - 22], [ft[0] + 10, ft[1] - 22], [ft[0] + 30, ft[1] - 6]],
      bot: [[ft[0] + 28, G0 + 3], [hp[0] - 26, G0 + 3]] };
  }
  function setBag(J) {
    var b = bagPts(J), pts = b.top.concat(b.bot);
    bagP.setAttribute("d", ip(pts, { wobble: 0.6, step: 14, seed: 701, closed: true }));
    var q = ""; [0.25, 0.45, 0.65, 0.85].forEach(function (s) {
      var x = U.lerp(b.top[0][0], b.top[4][0], s), yt = s < 0.5 ? U.lerp(b.top[1][1], b.top[2][1], (s - 0.15) / 0.35) : U.lerp(b.top[2][1], b.top[4][1], (s - 0.5) / 0.5);
      q += "M " + x.toFixed(1) + " " + (yt + 8).toFixed(1) + " L " + (x + 2).toFixed(1) + " " + (G0 - 4) + " ";
    });
    bagQ.setAttribute("d", q);
    bagZ.setAttribute("d", "M " + (b.top[0][0] + 6) + " " + (b.top[0][1] + 10) + " L " + (b.top[1][0]) + " " + (b.top[1][1] + 10) + " L " + b.top[2][0] + " " + (b.top[2][1] + 10));
  }

  // the blanket (teal, red stripes like her scarf): folded in her hands -> flicked out -> draped over Sam
  var blG = el("g", {}, figG);
  var blP = el("path", { fill: "#2f8f9f", stroke: INK, "stroke-width": 4.5, "stroke-linejoin": "round" }, blG);
  var blS = el("path", { fill: "none", stroke: "#c4453b", "stroke-width": 7, "stroke-linecap": "round", "stroke-opacity": 0.9 }, blG);
  var blF = el("path", { fill: "none", stroke: INK, "stroke-width": 2.5, "stroke-linecap": "round", "stroke-opacity": 0.5 }, blG);
  function setBlanket(t, JS, JL) {
    if (t < tIn0 - 0.5) { blG.setAttribute("visibility", "hidden"); return; }
    blG.setAttribute("visibility", "visible");
    var hp = JS.hips, kn = JS.knR, ft = JS.ftR, nk = JS.neck;
    var DT = [[nk[0] - 24, nk[1] + 20], [nk[0] + 20, nk[1] + 24], [hp[0] + 60, hp[1] - 28], [kn[0] + 16, kn[1] - 30], [ft[0] + 34, ft[1] - 24]];
    var DB = [[hp[0] - 36, G0 + 4], [hp[0] - 4, G0 + 6], [hp[0] + 60, G0 + 6], [kn[0] + 22, G0 + 6], [ft[0] + 48, G0 + 4]];
    var c = lerp2(JL.haR, JL.haL, 0.5); c[1] += 22;
    var FT = [], FB = [];
    for (var i = 0; i < 5; i++) { FT.push([c[0] - 40 + 20 * i, c[1] - 22]); FB.push([c[0] - 40 + 20 * i, c[1] + 22]); }
    var k = U.smooth(seg(t, tD0 + 0.25, tD1)), bil = Math.sin(Math.PI * seg(t, tD0 + 0.2, tD1 + 0.1));
    var T = [], B = [];
    for (i = 0; i < 5; i++) {
      var lift = (1 - i / 4) * bil * 70, wave = Math.sin(t * 9 + i) * 6 * bil;
      var a = lerp2(FT[i], DT[i], k), b = lerp2(FB[i], DB[i], k);
      a[1] -= lift + wave; b[1] -= lift * 0.6 + wave;
      if (k >= 1) { var ph = snorePh(t), br = ph >= 0 && ph < 0.45 ? Math.sin(Math.PI * ph / 0.45) : 0; if (i < 3) a[1] -= br * 3; }
      T.push(a); B.push(b);
    }
    blP.setAttribute("d", ip(T.concat(B.slice().reverse()), { wobble: 0.7, step: 14, seed: 711, closed: true }));
    var s = ""; [1, 2, 3].forEach(function (j) { var a = lerp2(T[j], B[j], 0.08), b = lerp2(T[j], B[j], 0.92); s += "M " + U.pt(a) + " L " + U.pt(b) + " "; });
    var m1 = T.map(function (p, j) { return lerp2(p, B[j], 0.5); });
    s += "M " + m1.map(U.pt).join(" L ");
    blS.setAttribute("d", s);
    var fr = ""; B.forEach(function (p, j) { if (j > 0) { var q = lerp2(B[j - 1], p, 0.5); fr += "M " + U.pt(q) + " l 0 7 "; } });
    blF.setAttribute("d", k > 0.9 ? fr : "");
  }

  // thermos (blue, steel cap) standing on his knees; steam while it's hot
  var thG = el("g", {}, figG), thB = el("g", {}, thG);
  el("path", { d: ip([[-12, -24], [12, -24], [13, 26], [-13, 26]], { wobble: 0.4, step: 8, seed: 721, closed: true }), fill: "#3f7fb8", stroke: INK, "stroke-width": 3.5, "stroke-linejoin": "round" }, thB);
  el("path", { d: "M -12 4 L 12 4", stroke: "#bcd6ec", "stroke-width": 6 }, thB);
  el("path", { d: ip([[-9, -24], [-8, -32], [8, -32], [9, -24]], { wobble: 0.3, step: 6, seed: 722 }), fill: "#a9b1ba", stroke: INK, "stroke-width": 3 }, thB);
  var steam = [0, 1].map(function () { return el("path", { stroke: "#ffffff", "stroke-width": 3, fill: "none", "stroke-linecap": "round", opacity: 0.7 }, thG); });
  function setThermos(t, J) {
    var ss = sipState(t), held = (ss[0] === 2 || ss[1] === 2 || (ss[0] === 1 && ss[1] === 2) || (ss[0] === 2 && ss[1] === 1)), rot = 0, pos = THERM;
    if (ss[0] >= 1 && ss[1] >= 1) {
      pos = J.haR;
      var tilt = ss[0] === 2 && ss[1] === 2 ? 1 : ss[0] === 1 && ss[1] === 2 ? ss[2] : ss[0] === 2 && ss[1] === 1 ? 1 - ss[2] : 0;
      rot = -72 * U.smooth(tilt) - 8 * Math.sin((t - tSip0) * 9) * (ss[0] === 2 && ss[1] === 2 ? 1 : 0);
    }
    thB.setAttribute("transform", "translate(" + pos[0].toFixed(1) + " " + pos[1].toFixed(1) + ") rotate(" + rot.toFixed(1) + ")");
    var top = [pos[0] + Math.sin(rot * Math.PI / 180) * 34, pos[1] - Math.cos(rot * Math.PI / 180) * 34];
    steam.forEach(function (p, k) {
      var ph = (t * 0.7 + k * 0.5) % 1, yy = top[1] - 6 - ph * 34, x0 = top[0] - 4 + k * 8;
      p.setAttribute("d", "M " + x0.toFixed(1) + " " + (yy + 10).toFixed(1) + " C " + (x0 - 6).toFixed(1) + " " + (yy + 4).toFixed(1) + ", " + (x0 + 6).toFixed(1) + " " + (yy - 2).toFixed(1) + ", " + x0.toFixed(1) + " " + (yy - 8).toFixed(1));
      p.setAttribute("opacity", (0.7 * Math.sin(ph * Math.PI) * (1 - ramp(t, tTL + 3, tTL + 6)) * (Math.abs(rot) > 30 ? 0 : 1)).toFixed(2));
    });
    void held;
  }

  // ---------- the light layer (untinted, above the world) ----------
  var FF = [];                                                     // fireflies
  for (var i = 0; i < 16; i++) {
    var fg = el("g", {}, glow);
    el("circle", { r: 16, fill: "url(#ffGlow)" }, fg); el("circle", { r: 3.2, fill: "#fffbd8" }, fg);
    FF.push({ g: fg, x: 300 + U.hash(i * 3.3) * 1450, y: 520 + U.hash(i * 5.7) * 270, a: 30 + U.hash(i) * 50, sp: 0.25 + U.hash(i * 2.1) * 0.35, ph: U.hash(i * 9.1) * 6.28 });
  }
  var cone = el("path", { fill: "url(#coneGrad)", style: "mix-blend-mode:screen" }, glow);
  var strap = el("path", { fill: "none", stroke: "#3a3d46", "stroke-width": 6, "stroke-linecap": "round" }, glow);
  var lamp = el("g", {}, glow);
  var lampHalo = el("circle", { r: 18, fill: "url(#ffGlow)" }, lamp);
  var lampBody = el("rect", { x: -8, y: -7, width: 14, height: 14, rx: 4, fill: "#ffe680", stroke: INK, "stroke-width": 3 }, lamp);
  var bub = Kit.bubble(glow);
  var fxS = Kit.emanata(glow), fxT = Kit.emanata(glow);
  Array.prototype.forEach.call(glow.querySelectorAll("text"), function (z) { z.setAttribute("fill", "#fdf3d0"); z.setAttribute("stroke", INK); z.setAttribute("stroke-width", 1.4); z.setAttribute("paint-order", "stroke"); });
  var leaf = el("path", { d: "M -16 0 C -8 -11, 8 -11, 16 0 C 8 11, -8 11, -16 0 Z", fill: "#8cc265", stroke: INK, "stroke-width": 2.5 }, null);
  front.appendChild(leaf);
  var leafVein = el("path", { d: "M -14 0 L 14 0", stroke: "#5f9a3a", "stroke-width": 2 }, null); front.appendChild(leafVein);

  // thought-bubble contents: a ground line, a tiny sapling, three sheep (cloud bodies + stick legs) that turn into trees
  var BX = 905, BY = 528, BW = 400, BH = 230, GY = BY + 58;
  var inner = bub.inner;
  el("path", { d: ip([[BX - 165, GY], [BX - 60, GY + 2], [BX + 60, GY - 1], [BX + 165, GY]], { wobble: 0.6, step: 20, seed: 731 }), stroke: "#6f9e4c", "stroke-width": 4, fill: "none", "stroke-linecap": "round" }, inner);
  var bSap = el("g", {}, inner);
  var bSapStem = el("path", { stroke: "#5f9a3a", "stroke-width": 4, fill: "none", "stroke-linecap": "round" }, bSap);
  var bSapL1 = el("path", { d: "M 0 0 C -10 -10, -22 -8, -24 -2 C -16 3, -7 3, 0 0 Z", fill: "#8cc265", stroke: INK, "stroke-width": 2.2 }, bSap);
  var bSapL2 = el("path", { d: "M 0 0 C 10 -10, 22 -8, 24 -2 C 16 3, 7 3, 0 0 Z", fill: "#8cc265", stroke: INK, "stroke-width": 2.2 }, bSap);
  var bSapC = el("circle", { r: 0, fill: "#74b04f", stroke: INK, "stroke-width": 2.5 }, bSap);
  var SHEEP = [0, 1, 2].map(function (k) {
    var g = el("g", {}, inner), trunk = el("path", { fill: "#8b6a43", stroke: INK, "stroke-width": 2.5 }, g);
    var legs = el("path", { stroke: INK, "stroke-width": 3, "stroke-linecap": "round", fill: "none" }, g), body = el("g", {}, g);
    var blobs = [[-13, -2, 11], [-4, -9, 12], [8, -7, 11], [13, 2, 10], [-2, 4, 12]].map(function (b) { return el("circle", { cx: b[0], cy: b[1], r: b[2], fill: "#fbfaf6", stroke: INK, "stroke-width": 2.5 }, body); });
    var head = el("g", {}, g);
    el("ellipse", { cx: 0, cy: 0, rx: 7, ry: 8.5, fill: "#3a3a3a", stroke: INK, "stroke-width": 2 }, head);
    el("circle", { cx: 2.5, cy: -2, r: 1.6, fill: "#fbfaf6" }, head);
    el("path", { d: "M -5 -6 L -11 -10", stroke: "#3a3a3a", "stroke-width": 4, "stroke-linecap": "round" }, head);
    return { g: g, trunk: trunk, legs: legs, body: body, blobs: blobs, head: head };
  });
  var REST = [BX + 140, BX + 96, BX + 52];
  function sheepState(k, t) {                                       // -> {x, y (feet), vis, air, morph}
    var tj = tJ[k], lazy = k === 2, a0 = tj - (lazy ? 1.5 : 0.95), j0 = tj - (lazy ? 0.45 : 0.32), j1 = tj + (lazy ? 0.45 : 0.32);
    var x, y = GY, air = 0, xL = BX - 165, xJ0 = BX - 52, xJ1 = BX + 46;
    if (t < a0) return { vis: 0 };
    if (t < j0) { x = U.lerp(xL, xJ0, seg(t, a0, j0)); y -= Math.abs(Math.sin((t - a0) * 14)) * 3; }
    else if (t < j1) { var p = seg(t, j0, j1); x = U.lerp(xJ0, xJ1, p); air = Math.sin(Math.PI * p); y -= air * (lazy ? 46 : 72); }
    else { x = U.lerp(xJ1, REST[k], U.smooth(seg(t, j1, j1 + 0.4))); }
    return { x: x, y: y, vis: Math.min(1, seg(t, a0, a0 + 0.15)), air: air, morph: U.easeOutBack(seg(t, tM[k], tM[k] + 0.35)) };
  }
  function setBubble(t, hs) {
    var s = U.easeOutBack(seg(t, tBub0, tBub0 + 0.35)) * (1 - seg(t, tBubOut, tBubOut + 0.12));
    bub.set({ x: BX, y: BY, w: BW, h: BH, thought: true, s: s, tail: [hs.head[0] + 22, hs.top + 6], hidden: s <= 0.01 });
    inner.style.display = s <= 0.01 ? "none" : "";
    if (s <= 0.01) return;
    var sg = U.easeOutBack(seg(t, tM[0], tM[0] + 0.4)), sh = 34 + 30 * sg;
    bSapStem.setAttribute("d", "M " + BX + " " + GY + " C " + (BX + 3) + " " + (GY - sh * 0.4) + ", " + (BX - 3) + " " + (GY - sh * 0.7) + ", " + BX + " " + (GY - sh));
    bSapStem.setAttribute("stroke", sg > 0.5 ? "#8b6a43" : "#5f9a3a"); bSapStem.setAttribute("stroke-width", (4 + 3 * sg).toFixed(1));
    bSapL1.setAttribute("transform", "translate(" + BX + " " + (GY - sh) + ")"); bSapL2.setAttribute("transform", "translate(" + BX + " " + (GY - sh) + ")");
    bSapC.setAttribute("cx", BX); bSapC.setAttribute("cy", (GY - sh - 8).toFixed(1)); bSapC.setAttribute("r", (sg * 20).toFixed(1));
    SHEEP.forEach(function (sp, k) {
      var st = sheepState(k, t);
      if (!st.vis) { sp.g.setAttribute("visibility", "hidden"); return; }
      sp.g.setAttribute("visibility", "visible"); sp.g.setAttribute("opacity", st.vis.toFixed(2));
      var m = U.clamp(st.morph, 0, 1.2), mm = Math.min(1, m), bodyY = -24 - 22 * m;
      sp.g.setAttribute("transform", "translate(" + st.x.toFixed(1) + " " + st.y.toFixed(1) + ")");
      sp.body.setAttribute("transform", "translate(0 " + bodyY.toFixed(1) + ") scale(" + (1 + 0.25 * m).toFixed(3) + ")");
      sp.blobs.forEach(function (b, j) { b.setAttribute("fill", mm > 0.5 ? (j % 2 ? "#74b04f" : "#8cc265") : "#fbfaf6"); });
      var la = st.air * 0.5, legs = "";
      [[-10, 1], [-4, -1], [6, 1], [12, -1]].forEach(function (L0) { var lx = L0[0], ex = lx + Math.sin(la * L0[1]) * 10 + st.air * 6 * (lx < 0 ? -1 : 1); legs += "M " + lx + " -12 L " + ex.toFixed(1) + " " + (-1 - st.air * 5).toFixed(1) + " "; });
      sp.legs.setAttribute("d", legs); sp.legs.setAttribute("opacity", (1 - mm).toFixed(2));
      sp.trunk.setAttribute("d", mm > 0.01 ? "M -5 0 L -4 " + (bodyY + 10).toFixed(1) + " L 4 " + (bodyY + 10).toFixed(1) + " L 5 0 Z" : "");
      sp.head.setAttribute("transform", "translate(20 " + (-28 - st.air * 2).toFixed(1) + ") scale(" + Math.max(0, 1 - mm * 1.2).toFixed(3) + ")");
    });
  }

  // the falling leaf: from the canopy, zig-zags down onto his face, then flutters with each snore exhale
  function leafState(t, JS) {
    if (t < tLeaf0) return null;
    var hx = JS.head[0], hy = JS.head[1] - RS.HR * 0.32, face = [hx + RS.HR * 0.55, hy + RS.HR * 0.05];
    var start = [TX - 60, G0 - tree.H(treeG(t)) * 0.75];
    if (t < tLeaf1) {
      var p = seg(t, tLeaf0, tLeaf1), e = U.smooth(p);
      return { x: U.lerp(start[0], face[0], e) + Math.sin(p * Math.PI * 3) * 40 * (1 - p), y: U.lerp(start[1], face[1], e), rot: Math.sin(p * Math.PI * 3) * 50 };
    }
    var ph = snorePh(t), fl = ph > 0.5 && ph < 0.95 ? Math.sin(Math.PI * (ph - 0.5) / 0.45) : 0;
    return { x: face[0] + fl * 4, y: face[1] - fl * 14 + Math.sin(t * 40) * 2 * fl, rot: -20 - fl * 25 };
  }

  // ---------- camera ----------
  var H0 = { sam: G0 - Kit.headInfo(MS.joints(0), RS, G0).top, layla: G0 - Kit.headInfo(ML.joints(0), RL, G0).top };
  function resolve(id, t) {
    if (id === "mound") return { head: [TX, G0 - 120], top: G0 - 200, feet: G0, f: 1, h: H0.sam };
    if (id === "pip") return { head: bh.roof.slice(), top: bh.roof[1] - 40, feet: bh.roof[1] + 24, f: -1, h: 120 };
    var c = id === "sam" ? Kit.headInfo(jointsSamCached(t), RS, G0) : Kit.headInfo(jointsLayla(t), RL, G0); c.h = H0[id]; return c;
  }
  var cam = Shots.camera(SHOTS, { width: 1920, height: 1080, duration: DUR, resolve: resolve });
  var tfx = Shots.fx(document.getElementById("fxg"), [{ t: 0, type: "fadeIn", dur: 0.8 }, { t: DUR - 0.6, type: "fadeOut", dur: 0.6 }]);

  function pipState(t) {
    var R = bh.roof, base = { x: R[0], y: R[1], f: -1, t: t, s: 1, seed: 3 };
    if (t < tPip) return Object.assign(base, { pose: "sleep" });
    var ch = 0;[tPip + 0.75, tPip + 1.05, tPip + 1.6, tPip + 2.2].forEach(function (c) { if (t > c && t < c + 0.18) ch = (t - c) / 0.18; });
    if (t < tPip + 0.45) return Object.assign(base, { pose: "hop", hop: (t - tPip) / 0.45 });
    if (t < tPip + 0.7) return Object.assign(base, { pose: "fly", y: R[1] - 6 });            // a wing stretch
    return Object.assign(base, { pose: "perch", chirp: ch, look: 1, tilt: Math.sin((t - tPip) * 3) * 12 });
  }

  function render(t) {
    var c = cam.apply(camG, t); Y.update(t, c);
    glow.setAttribute("transform", camG.getAttribute("transform"));
    var dk = ramp(t, tWin, tWin + 0.12), dw = dawnK(t);
    WINC.forEach(function (r) { r.setAttribute("opacity", dk.toFixed(3)); r.setAttribute("fill", FilmSet.mixHex("#3b4766", "#c9b8bf", dw)); });
    var JL = jointsLayla(t), JS = jointsSamCached(t);
    RL.set(JL, t, { zoom: c[2] }); RS.set(JS, t, { zoom: c[2] });
    RL.g.setAttribute("visibility", t < tIn0 - 0.05 || JL.hips[0] > 1900 ? "hidden" : "visible");
    setBag(JS); setBlanket(t, JS, JL); setThermos(t, JS);
    var g = treeG(t); mound.set(t, {}); tree.set(g, t, { season: "summer", wiggle: 0 });
    pip.set(pipState(t));
    // sky: moon arc + wheeling stars
    var sp = skyP(t), ang = MA + sp * 0.8;
    moon.setAttribute("transform", "translate(" + (PIV[0] + Math.cos(ang) * MR).toFixed(1) + " " + (PIV[1] + Math.sin(ang) * MR).toFixed(1) + ")");
    moon.setAttribute("opacity", Y.colors(t).moon.toFixed(3));
    if (starsG) starsG.setAttribute("transform", "rotate(" + (sp * 0.8 * 180 / Math.PI).toFixed(2) + " " + PIV[0] + " " + PIV[1] + ")");
    // fireflies (drift; in fast-forward they streak around), fade at dawn
    var tt = tau(t), ffA = 1 - dawnK(t) * 1.4;
    FF.forEach(function (q, k) {
      var x = q.x + Math.sin(tt * q.sp + q.ph) * q.a + Math.sin(tt * q.sp * 2.3 + k) * 14, y = q.y + Math.cos(tt * q.sp * 1.3 + q.ph * 2) * q.a * 0.5;
      var b = U.clamp(0.5 + 0.8 * Math.sin(tt * (1.1 + U.hash(k) * 1.6) + q.ph), 0, 1);
      q.g.setAttribute("transform", "translate(" + x.toFixed(1) + " " + y.toFixed(1) + ")");
      q.g.setAttribute("opacity", Math.max(0, b * ffA).toFixed(2));
    });
    // headlamp + its light
    var lp = lampPos(JS), on = t < tClick ? 1 : 0, hx = JS.head[0], hy = JS.head[1] - RS.HR * 0.32;
    var v = [JS.head[0] - JS.neck[0], JS.head[1] - JS.neck[1]], pitch = Math.atan2(v[0], -v[1]) - Math.atan2(11, 46);
    var ca = 0.05 + pitch * 1.5, cl = 340, spr = 0.2;
    cone.setAttribute("d", on ? "M " + U.pt(lp) + " L " + U.pt([lp[0] + Math.cos(ca - spr) * cl, lp[1] + Math.sin(ca - spr) * cl]) + " L " + U.pt([lp[0] + Math.cos(ca + spr) * cl, lp[1] + Math.sin(ca + spr) * cl]) + " Z" : "");
    cone.setAttribute("transform", "");
    strap.setAttribute("d", "M " + U.pt([hx - RS.HR * 0.98, hy - RS.HR * 0.2]) + " Q " + U.pt([hx, hy - RS.HR * 0.95]) + " " + U.pt([lp[0] - 2, lp[1]]));
    lamp.setAttribute("transform", "translate(" + lp[0].toFixed(1) + " " + lp[1].toFixed(1) + ") rotate(" + (pitch * 57).toFixed(1) + ")");
    lampBody.setAttribute("fill", on ? "#ffe680" : "#8d8f96"); lampHalo.setAttribute("opacity", on ? 1 : 0);
    // thought bubble
    var hs = Kit.headInfo(JS, RS, G0);
    setBubble(t, hs);
    // leaf on his face
    var ls = leafState(t, JS);
    [leaf, leafVein].forEach(function (e) {
      e.setAttribute("visibility", ls ? "visible" : "hidden");
      if (ls) e.setAttribute("transform", "translate(" + ls.x.toFixed(1) + " " + ls.y.toFixed(1) + ") rotate(" + ls.rot.toFixed(1) + ")");
    });
    // cartoon marks
    var snapK = t > tSnap1 && t < tSnap1 + 0.45 ? 1 : t > tSnap2 && t < tSnap2 + 0.5 ? 2 : 0;
    var growPop = null;
    G_STEPS.forEach(function (s) { if (t > s[0] && t < s[0] + 0.6) { var tp = tree.tip(g); growPop = { x: tp[0] + 18, y: tp[1] - 6, k: (t - s[0]) / 0.6, s: 0.9 }; } });
    fxS.set({
      lines: snapK ? { x: hs.head[0], y: hs.head[1], r: RS.HR * 1.5, n: snapK === 2 ? 8 : 6, amp: snapK === 2 ? 26 : 20 } : null,
      zzz: (asleep(t) && t < DUR - 0.1) ? { x: hs.head[0] + 18, y: hs.top - 4 } : (t > tClose1 + 0.6 && t < tSnap1 - 0.1 ? { x: hs.head[0] + 18, y: hs.top + 6 } : null),
      puff: t > tBubOut && t < tBubOut + 0.5 ? { x: BX, y: BY + 40, k: (t - tBubOut) / 0.5, s: 1.3 } : null,
      sweat: t > tFreeze + 0.1 && t < tFreeze + FREEZE ? (function () { var hl = Kit.headInfo(JL, RL, G0); return { x: hl.head[0] + RL.HR * 0.8, y: hl.head[1] - RL.HR * 0.4, k: seg(t, tFreeze + 0.1, tFreeze + FREEZE) }; })() : null,
      twitch: t > w("l1", 7).t1 + 0.1 && t < tSip0 + 0.2 ? { x: hs.head[0] + RS.HR * 0.2, y: hs.head[1] + 4, k: 1 } : null
    }, t);
    fxT.set({ sparkle: growPop, puff: t > tShake && t < tShake + 0.6 ? null : null }, t);
    tfx.update(t);
  }
  window.__film = { MS: MS, ML: ML, RS: RS, RL: RL, cam: cam, resolve: resolve, jointsSam: jointsSam, jointsLayla: jointsLayla, bh: bh, treeG: treeG,
    beats: { tSip0: tSip0, tClose1: tClose1, tSnap1: tSnap1, tClose2: tClose2, tSnap2: tSnap2, tBub0: tBub0, tJ: tJ, tM: tM, tClose3: tClose3,
      tIn0: tIn0, tFreeze: tFreeze, tArr: tArr, tD0: tD0, tClick: tClick, tTurn: tTurn, tPopL: tPopL, tOut0: tOut0, tTL: tTL, tFast: tFast,
      tWin: tWin, tGrowT: tGrowT, tLeafShot: tLeafShot, tLeaf1: tLeaf1, tWide2: tWide2, tDawn0: tDawn0, tPip: tPip, tSnore0: tSnore0, DUR: DUR } };
  window.__timelines = window.__timelines || {};
  window.__timelines["main"] = SF.timeline(DUR, render);
})();
