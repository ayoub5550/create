/* Sam & Layla Ep. 1 — P06 "Operation Don't Look" (~66.5 s). Structure copied from the reference part p01.
 * Beat sheet: WS of the yard (Sam beside his cardboard sign on a stake, Layla knitting on her stool, Pip on the birdhouse)
 * -> MS: the sign "OPERATION DON'T LOOK" — he sweeps the title with a pointer stick and taps 1 LEAVE / 2 HIDE / 3 CATCH!
 * (each row jumps on its tap), drops the stick, turns to Layla: "we catch it growing!" -> MCU Layla "Step four: we wait?"
 * -> MS Sam waves it off -> WS "Well! Bye, tree! Going FAR away!": a fast, loud march off frame LEFT (oom-pah, big arm
 * swings) -> silence: the sprout STRETCHES up and leans after him... -> Sam's head pops in at the left frame edge "Ha!"
 * — the sprout freezes mid-stretch, innocent wiggle — "...Ha?" -> MCU Layla "two seconds" -> WS "Two very long seconds",
 * marches off again -> Layla knits -> WS: he strolls back in DISGUISED (nose-glasses, big brows, a huge mustache), hands
 * behind his back, whistling -> MS "Good afternoon. I am... not Sam." -> Layla "Hi, Sam." -> "Dang it.": he pulls the
 * glasses off, the mustache stays stuck for a beat, peels, drops (tick) -> Layla -> THE BUSH: a round bush with Sam's legs
 * and a red scarf end shuffles across the yard to sneaky music, FREEZES dead each time Layla glances (x3, the music stops
 * with it), Pip rides in on top -> "Hi, Sam." -> the leaves part: "Shh! I'm a bush." -> "Bushes don't wear scarves."
 * (insert: the scarf end is yanked in) -> "Fashionable bush." (it pokes back out with a flourish) -> Pip pecks -> "Ow!":
 * his head bursts out of the top, "Rude bird!", he argues with the hovering Pip while, behind him, the sprout pops new
 * leaves -> Layla notices, keeps knitting.
 * Beat times derive from the dialogue timeline (score.py uses the same formulas). Everything is a pure function of t. */
(function () {
  "use strict";
  var SF = window.StickFilm, U = SF.u, el = U.el, ramp = U.ramp, clamp = U.clamp, lerp = U.lerp;
  var DATA = window.FILM_DATA, CAST = window.FILM_CAST.characters, SHOTS = window.FILM_SHOTS.shots;
  var CL = Object.assign({ stand: SF.standClip() }, window.FILM_CLIPS || {});
  var K = Kit.lines(DATA), L = K.L, w = K.w, F = Kit.FACE, bump = Kit.bump;
  var DUR = DATA.total, G0 = 820, INK = "#2b2a28", JN = SF.JOINTS;
  var CS = DATA.chars.sam, CY = DATA.chars.layla;
  function onset(id) {                      // first audible mouth shape of a line (more exact than the word stamps)
    var l = L[id], m = (DATA.chars[l.who] || {}).mouth || [];
    for (var i = 0; i < m.length; i++) if (m[i][0] >= l.start - 0.01 && m[i][0] < l.end && m[i][1] !== "X") return m[i][0];
    return l.start;
  }

  // ---------- beats (same formulas in score.py) ----------
  var tSweep0 = w("l1", 0).t0 - 0.1, tSweep1 = w("l1", 2).t1;                  // the pointer underlines the title
  var TAPS = [w("l1", 4).t0 - 0.05, w("l2", 1).t0 - 0.05, w("l2", 5).t0 - 0.05]; // "one" / "two" / "three"
  var tDrop = TAPS[2] + 0.45;                                                     // lets the stick fall against the sign
  var tTurn = w("l2", 7).t0 - 0.3;                                                // turns to Layla: "catch it growing!"
  var tWave = w("l5", 1).t0 - 0.15;                                               // "Bye, tree!"
  var tMarch = w("l5", 3).t0 - 0.12, MARCH_K = 1.3, MARCH_D = (131 - 20) / 30 / MARCH_K;
  var tStretch0 = L.l5.end + 0.9, tPop = onset("l6") - 0.14;                     // the sprout stretches... Sam pops in
  var tHa2 = w("l6", 1).t0;                                                      // "...Ha?"
  var tStepIn = L.l7.start - 0.05;                                                  // (off screen) back into the yard
  var tMarch2 = w("l8", 3).t0 + 0.05;                                            // marches off again on "seconds."
  var tCutL1 = tMarch2 + 1.8, tWS3 = tCutL1 + 1.0;                              // Layla knits / he strolls back in
  var tArrD = L.l9.start - 0.05, tStroll = tArrD - 2.3;                          // disguised stroll, whistling
  var tReach = onset("l11") - 0.3, tPull = onset("l11") + 0.12;                  // "Dang it.": glasses off
  var tPeel = tPull + 0.75, tFall0 = tPull + 0.95, tLand = tFall0 + 0.38;        // the mustache: stuck, peels, drops
  var tCutL2 = tLand + 0.5, tStorm = tCutL2 + 0.15, tBushWS = tCutL2 + 1.0;
  var tB0 = tBushWS + 0.2, tF1 = tB0 + 2.0, tR1 = tF1 + 0.9, tF2 = tR1 + 1.4, tR2 = tF2 + 1.1, tF3 = L.l12.start - 0.78;
  var tPipFly = tR2 + 0.2, tPipLand = tPipFly + 0.75;                            // Pip rides in on the bush
  var tSettle = L.l12.start + 0.3;                                               // (off screen) the frozen stride settles
  var tPeek = L.l13.start - 0.28;                                                // the leaves part: his face
  var tYank = L.l14.end + 0.1, tFlourish = w("l15", 0).t0 - 0.05;               // scarf yanked in / pokes back out
  var tPeck = onset("l16") - 0.42, tOw = onset("l16") - 0.04;                    // three pecks -> "Ow!" head bursts out
  var tPoint = tOw + 0.55;                                                       // "Rude bird!" an arm pokes out
  var tLeaf0 = L.l16.end - 0.05, tLeaf1 = tLeaf0 + 1.2;                          // the sprout pops new leaves behind him
  var tLay = tLeaf1 + 0.35;                                                      // Layla notices
  var GLANCES = [[tF1 - 0.14, tF1 + 0.75], [tF2 - 0.14, tR2 - 0.1], [tF3 - 0.14, DUR + 1]];
  if (tF3 < tPipLand + 0.25) console.warn("p06: bush gap too short");

  // ---------- the world ----------
  var back = document.getElementById("back"), props = document.getElementById("props"), figG = document.getElementById("fig");
  var front = document.getElementById("front"), camG = document.getElementById("cam");
  var MX = 1000, XS = 760, XB = 700, XD = 900, XBUSH0 = 170, XBUSH1 = 755, XL = 1420;
  var Y = FilmSet.yard({ G0: G0, ref: [1040, 560, 1.25], look: function (t) { return ["day", "golden", 0.3 * clamp(t / DUR, 0, 1)]; },
    season: "summer", garden: { x: MX } });
  var rock = Props.rock(back, 610, G0);
  var bh = Kit.birdhouse(back, 1640, G0);
  var stool = Props.stool(back, XL, G0);
  var mound = Props.mound(props, MX, G0);
  var tree = Props.tree(props, MX - 16, G0 - 26);
  var TX = MX - 16, TY = G0 - 26;

  // ---------- the cardboard sign on a stake (local prop) ----------
  var BX = 500, BT = G0 - 372, BB = G0 - 92, BL = BX - 148, BR = BX + 148;
  var ROWY = [G0 - 243, G0 - 177, G0 - 111], TAPX = BX + 112;
  function ip(pts, o) { return Ink.path(pts, Object.assign({ wobble: 0.7, step: 12 }, o || {})); }
  var signG = el("g", {}, props);
  el("path", { d: ip([[BX - 4, G0 + 4], [BX - 3, BB - 4]], { seed: 61 }), stroke: "#8b6a43", "stroke-width": 13, "stroke-linecap": "round", fill: "none" }, signG);
  el("path", { d: ip([[BX - 4, G0 + 4], [BX - 3, BB - 4]], { seed: 61 }), stroke: INK, "stroke-width": 2.5, "stroke-opacity": 0.5, fill: "none" }, signG);
  el("path", { d: ip([[BL + 6, BB + 8], [BR + 6, BB + 8], [BR + 6, BT + 8], [BL + 6, BT + 8]], { seed: 62, closed: true }), fill: "#000", opacity: 0.12 }, signG);
  el("path", { d: ip([[BL, BB], [BR, BB + 3], [BR - 2, BT], [BL + 3, BT + 2]], { seed: 63, closed: true }), fill: "#d9b27c", stroke: INK, "stroke-width": 4.5, "stroke-linejoin": "round" }, signG);
  [[BL + 30, BT + 70, BL + 60, BT + 96], [BR - 60, BB - 30, BR - 26, BB - 46], [BL + 140, BB - 14, BL + 176, BB - 20]].forEach(function (c, i) {   // cardboard creases
    el("path", { d: ip([[c[0], c[1]], [c[2], c[3]]], { seed: 64 + i, wobble: 0.4 }), stroke: "#b48c58", "stroke-width": 3, "stroke-linecap": "round", fill: "none" }, signG);
  });
  el("path", { d: ip([[BL + 14, BT + 12], [BL + 28, BT + 4], [BL + 40, BT + 14]], { seed: 67 }), stroke: "#c9a46a", "stroke-width": 5, fill: "none" }, signG);   // tape
  function txt(parent, x, y, s, size, col, anchor) {
    var n = el("text", { x: x, y: y, "font-family": "Caveat, cursive", "font-weight": 700, "font-size": size, fill: col || INK, "text-anchor": anchor || "middle" }, parent);
    n.textContent = s; return n;
  }
  txt(signG, BX + 2, BT + 42, "OPERATION", 40, "#c4453b");
  txt(signG, BX + 2, BT + 80, "DON'T LOOK", 40, "#c4453b");
  var ulG = el("path", { stroke: "#c4453b", "stroke-width": 4, "stroke-linecap": "round", fill: "none", d: ip([[BX - 92, BT + 90], [BX + 96, BT + 88]], { seed: 68 }) }, signG);
  ulG.setAttribute("opacity", "0.9");
  var ROWS = ROWY.map(function (y, k) {
    var g = el("g", {}, signG), word = ["LEAVE", "HIDE", "CATCH!"][k];
    txt(g, BL + 26, y + 12, (k + 1) + ".", 36, INK);
    var d = el("g", { transform: "translate(" + (BL + 92) + " " + (y + 2) + ")" }, g);         // the stick drawings
    var ln = function (pts, sd, col, sw) { el("path", { d: ip(pts, { seed: sd, wobble: 0.35, step: 6 }), stroke: col || INK, "stroke-width": sw || 3, "stroke-linecap": "round", "stroke-linejoin": "round", fill: "none" }, d); };
    if (k === 0) {        // a stick man walking away, an arrow
      el("circle", { cx: -8, cy: -20, r: 6, fill: "none", stroke: INK, "stroke-width": 3 }, d);
      ln([[-8, -14], [-8, 4]], 70); ln([[-8, 4], [-16, 18]], 71); ln([[-8, 4], [0, 18]], 72); ln([[-8, -8], [-18, 0]], 73); ln([[-8, -8], [2, -2]], 74);
      ln([[10, 4], [34, 4]], 75, "#c4453b"); ln([[27, -3], [35, 4], [27, 11]], 76, "#c4453b");
    } else if (k === 1) { // a round bush with two eyes peeking
      [[-14, 4, 12], [0, -4, 14], [14, 4, 12]].forEach(function (c) { el("circle", { cx: c[0], cy: c[1], r: c[2], fill: "#7fb562", stroke: INK, "stroke-width": 3 }, d); });
      [[-14, 4, 12], [0, -4, 14], [14, 4, 12]].forEach(function (c) { el("circle", { cx: c[0], cy: c[1], r: c[2] - 1.6, fill: "#7fb562" }, d); });
      el("circle", { cx: -4, cy: -2, r: 2.6, fill: INK }, d); el("circle", { cx: 6, cy: -2, r: 2.6, fill: INK }, d);
      ln([[-18, 18], [-18, 24]], 77); ln([[16, 18], [16, 24]], 78);
    } else {              // the sprout with a big "!" and a net
      ln([[-6, 18], [-6, -4]], 79, "#5f9a3a", 3.5);
      el("path", { d: "M -6 -4 C -14 -14, -24 -10, -26 -4 C -18 -1, -10 -1, -6 -4 Z", fill: "#8cc265", stroke: INK, "stroke-width": 2.4 }, d);
      el("path", { d: "M -6 -6 C 2 -16, 12 -13, 14 -7 C 6 -3, -2 -3, -6 -6 Z", fill: "#8cc265", stroke: INK, "stroke-width": 2.4 }, d);
      ln([[24, 20], [34, -6]], 80, "#8b6a43", 3.5); el("ellipse", { cx: 30, cy: -14, rx: 13, ry: 10, fill: "none", stroke: INK, "stroke-width": 2.5, "stroke-dasharray": "3 3" }, d);
      txt(d, -30, 2, "!", 30, "#c4453b");
    }
    txt(g, BL + 196, y + 12, word, 36, k === 2 ? "#c4453b" : INK);
    return g;
  });
  var stickG = el("g", {}, figG);                                                   // the pointer (drawn over the board)
  var stickInk = el("path", { stroke: INK, "stroke-width": 8, "stroke-linecap": "round", fill: "none" }, stickG);
  var stickWood = el("path", { stroke: "#c08a4f", "stroke-width": 4.5, "stroke-linecap": "round", fill: "none" }, stickG);
  var stickTip = el("circle", { r: 4, fill: "#c4453b", stroke: INK, "stroke-width": 2 }, stickG);

  // ---------- Sam: one motion per act (he leaves the frame between them) ----------
  var LS = CAST.sam.look, LL = CAST.layla.look, SS = LS.scale;
  var segA = [
    { t0: 0, t1: tTurn, clip: "stand", hold: 0, f: -1 },
    { t0: tTurn, t1: tMarch, clip: "stand", hold: 0, f: 1, blend: 0.3 },
    { t0: tMarch, t1: tMarch + MARCH_D, clip: "walk", from: 20, to: 131, f: -1, blend: 0.25 },
    { t0: tMarch + MARCH_D, t1: DUR + 1, clip: "walk", hold: 131, f: -1 }
  ];
  var MA = SF.motion({ clips: CL, scale: SS, ground: G0, segments: segA, anchor: { seg: 0, x: XS, edge: "start" } });
  var segB = [
    { t0: 0, t1: tStepIn, clip: "stand", hold: 0, f: 1 },
    { t0: tStepIn, t1: tStepIn + 0.95, clip: "walk", loop: true, f: 1, blend: 0.3 },
    { t0: tStepIn + 0.95, t1: tMarch2, clip: "stand", hold: 0, f: 1, blend: 0.35 },
    { t0: tMarch2, t1: tMarch2 + MARCH_D, clip: "walk", from: 20, to: 131, f: -1, blend: 0.25 },
    { t0: tMarch2 + MARCH_D, t1: DUR + 1, clip: "walk", hold: 131, f: -1 }
  ];
  var MB = SF.motion({ clips: CL, scale: SS, ground: G0, segments: segB, anchor: { seg: 0, x: XB, edge: "start" } });
  var segC = [
    { t0: 0, t1: tArrD, clip: "walk", loop: true, f: 1 },
    { t0: tArrD, t1: tStorm, clip: "stand", hold: 0, f: 1, blend: 0.4 },
    { t0: tStorm, t1: tStorm + MARCH_D, clip: "walk", from: 20, to: 131, f: -1, blend: 0.25 },
    { t0: tStorm + MARCH_D, t1: DUR + 1, clip: "walk", hold: 131, f: -1 }
  ];
  segC[0].t0 = tStroll;
  var MC = SF.motion({ clips: CL, scale: SS, ground: G0, segments: [{ t0: 0, t1: tStroll, clip: "walk", hold: CL.walk.cycle[0], f: 1 }].concat(segC),
    anchor: { seg: 2, x: XD, edge: "start" } });
  // the bush walk: one looped walk evaluated at a warped clock that stops dead on every freeze
  var MOVES = [[tB0, tF1], [tR1, tF2], [tR2, tF3]], MOVING = MOVES.reduce(function (a, m) { return a + m[1] - m[0]; }, 0);
  var cyc = CL.walk.cycle, V1 = (CL.walk.frames[cyc[1]].hips[0] - CL.walk.frames[cyc[0]].hips[0]) / ((cyc[1] - cyc[0]) / 30) * SS;   // px/s at 1x
  var BUSH_K = (XBUSH1 - XBUSH0) / (MOVING * V1);
  function tau(t) { var s = 0; MOVES.forEach(function (m) { s += clamp(t - m[0], 0, m[1] - m[0]); }); return 10 + s * BUSH_K; }
  var MD = SF.motion({ clips: CL, scale: SS, ground: G0, segments: [{ t0: 10, t1: 500, clip: "walk", loop: true, f: 1 }], anchor: { seg: 0, x: XBUSH0, edge: "start" } });
  var bushEndX = MD.joints(tau(tF3 + 1)).hips[0];
  var MDs = SF.motion({ clips: CL, scale: SS, ground: G0, anchor: { seg: 0, x: bushEndX, edge: "start" },
    segments: [{ t0: 0, t1: tOw + 0.12, clip: "stand", hold: 0, f: 1 }, { t0: tOw + 0.12, t1: DUR + 1, clip: "stand", hold: 0, f: -1, blend: 0.22 }] });
  var tA1 = tStretch0 - 0.6, tB1 = tWS3 - 0.4, tC1 = tBushWS - 0.1;   // act boundaries (Sam is off screen at each)
  function act(t) { return t < tA1 ? "A" : t < tB1 ? "B" : t < tC1 ? "C" : "D"; }
  function motionAt(t) { var a = act(t); return a === "A" ? MA : a === "B" ? MB : a === "C" ? MC : MD; }

  // ---------- acting ----------
  var SAM_ACT = [
    { g: "celebrate", t0: w("l2", 7).t0 - 0.15, t1: L.l2.end + 0.35, ease: 0.2, easeOut: 0.45 },            // "catch it growing!"
    { g: "crossArms", t0: L.l3.start + 0.3, t1: L.l4.start + 0.1, ease: 0.35 },                              // waits for step four
    { g: "stop", t0: L.l4.start - 0.05, t1: L.l4.end + 0.25, ease: 0.18, easeOut: 0.35 },                     // "not a real step."
    { g: "hips", t0: L.l5.start - 0.1, t1: tWave + 0.05, ease: 0.2 },                                         // "Well!"
    { g: "wave", t0: tWave, t1: tMarch + 0.05, ease: 0.18 },                                                  // "Bye, tree!"
    { g: "raise1", t0: tPop + 0.1, t1: tHa2 - 0.1, ease: 0.12 },                                               // "Ha!"
    { g: "chin", t0: tHa2 - 0.05, t1: L.l7.start - 0.2, ease: 0.3 },                                            // "...Ha?"
    { g: "handChest", t0: L.l8.start - 0.1, t1: w("l8", 2).t1 + 0.1, ease: 0.2 },                             // "Two very long"
    { g: "raise1", t0: w("l8", 2).t1 - 0.05, t1: tMarch2 + 0.05, ease: 0.15 },                                //   "seconds."
    { g: "explain", t0: w("l9", 9).t0 - 0.2, t1: L.l9.end + 0.4, ease: 0.3, amp: 0.8 }                       // "Looking at trees."
  ];
  var MUTE_BEATS = [[0, tTurn], [tMarch - 0.2, tStepIn + 2], [tStroll - 1, L.l9.end + 1], [tReach - 0.3, DUR + 1]];
  var SAM_BEATS = CS.beats.filter(function (b) { return !MUTE_BEATS.some(function (m) { return b > m[0] && b < m[1]; }); });
  var EX_S = Kit.expr([[0, [0.3, -0.55, 1.0]], [w("l2", 0).t0, [0.5, -0.4, 1.1], 0.3], [tTurn, F.excited, 0.2],
    [L.l3.start + 0.2, F.listen, 0.4], [w("l3", 2).t0, F.huh, 0.2], [L.l4.start - 0.1, [-0.1, -0.6, 0.85], 0.2],
    [L.l5.start - 0.05, F.excited, 0.2], [tMarch, [0.75, 0.3, 1.0], 0.3],
    [tPop, F.excited, 0.08], [tHa2 - 0.05, [0.0, -0.55, 0.7], 0.25], [L.l7.start, [-0.15, 0.1, 0.8], 0.4],
    [L.l8.start - 0.05, F.indig, 0.2], [tMarch2, [0.6, 0.2, 1.0], 0.3],
    [tStroll - 0.5, [0.5, 0.35, 0.62], 0.1], [L.l9.start - 0.05, [0.45, 0.25, 0.9], 0.25], [w("l9", 4).t0, [0.55, 0.5, 1.0], 0.2],
    [L.l10.start + 0.2, F.panic, 0.12], [onset("l11") - 0.05, F.sad, 0.25], [tPull + 0.25, [-0.35, 0.7, 1.25], 0.2],
    [tFall0 + 0.1, F.sigh, 0.3], [tStorm, F.stubborn, 0.3],
    [tPeek - 0.1, F.whisper, 0.2], [L.l14.start + 0.3, [0.1, 0.5, 1.05], 0.3], [tYank - 0.25, F.panic, 0.1],
    [L.l15.start - 0.1, [-0.2, 0.6, 1.0], 0.2], [tPeck, F.shock, 0.06], [tOw + 0.4, F.angry, 0.15]]);
  var EX_L = Kit.expr([[0, [0.3, 0, 0.82]], [L.l3.start - 0.1, F.dead, 0.25], [L.l3.end + 0.4, [0.3, 0, 0.82], 0.4],
    [L.l5.end + 0.1, [0.15, 0.35, 0.9], 0.3], [L.l7.start - 0.1, F.dead, 0.25], [L.l8.end + 0.3, [0.3, 0, 0.82], 0.4],
    [L.l9.start + 0.6, F.dead, 0.4], [tLand, [0.3, 0.2, 0.85], 0.4], [GLANCES[0][0], [0.1, 0.3, 0.95], 0.15], [GLANCES[0][1], [0.3, 0, 0.82], 0.3],
    [GLANCES[1][0], [0.1, 0.4, 0.95], 0.15], [GLANCES[1][1], [0.3, 0, 0.82], 0.3], [GLANCES[2][0], [0.0, -0.1, 0.75], 0.3],
    [L.l14.start - 0.1, F.dead, 0.2], [tLeaf0 + 0.3, [0.32, 0.45, 1.0], 0.3], [tLay + 0.7, [0.33, 0.1, 0.85], 0.5]]);
  var lipS = Talk.mouth(CS.mouth), lipL = Talk.mouth(CY.mouth);
  function whistling(t) { return t > tStroll + 0.1 && t < tArrD - 0.1; }
  function mouthS(t) { if (whistling(t)) return "F"; if (t > tPull + 0.3 && t < tFall0 + 0.2) return "A"; return lipS(t); }
  var BLINK_S = CS.blinks.filter(function (b) { var b0 = b[0] != null ? b[0] : b; return !(b0 > tPop - 0.2 && b0 < tHa2 + 0.4) && !(b0 > tPull && b0 < tLand); })
    .concat([[tLand + 0.08, 0.09], [tLand + 0.26, 0.09]]);
  var BLINK_L = CY.blinks.filter(function (b) { var b0 = b[0] != null ? b[0] : b; return !GLANCES.some(function (g) { return b0 > g[0] - 0.2 && b0 < g[0] + 0.5; }); })
    .concat([[L.l10.start - 0.45, 0.35], [L.l12.start - 0.4, 0.35]]);

  function aimArm(J, T, Ls, wt) {                // near hand holds a pointer whose tip reaches T (elbow bends down)
    if (wt <= 0) return null;
    var A0 = [J.neck[0] + (J.hips[0] - J.neck[0]) * 0.1, J.neck[1] + (J.hips[1] - J.neck[1]) * 0.1];
    var dx = T[0] - A0[0], dy = T[1] - A0[1], d = Math.hypot(dx, dy) || 1, ux = dx / d, uy = dy / d;
    var l1 = 80 * SS, l2 = 58 * SS, hd = clamp(d - Ls, 30, (l1 + l2) * 0.96), H = [A0[0] + ux * hd, A0[1] + uy * hd];
    var x = (l1 * l1 - l2 * l2 + hd * hd) / (2 * hd), h = Math.sqrt(Math.max(0, l1 * l1 - x * x)), px = -uy, py = ux;
    if (py < 0) { px = -px; py = -py; }
    var E = [A0[0] + ux * x + px * h, A0[1] + uy * x + py * h];
    J.haR = [lerp(J.haR[0], H[0], wt), lerp(J.haR[1], H[1], wt)];
    var Ed = [E[0] - 0.5 * (A0[0] - J.shR[0]), E[1] - 0.5 * (A0[1] - J.shR[1])];
    J.elR = [lerp(J.elR[0], Ed[0], wt), lerp(J.elR[1], Ed[1], wt)];
    return { H: J.haR, u: [ux, uy] };
  }
  var AIM = [[0, BX + 60, BT + 150], [tSweep0, BX - 40, BT + 92], [tSweep0 + 0.35, BX - 40, BT + 92], [tSweep1, BX + 92, BT + 90],
    [TAPS[0] - 0.3, TAPX, ROWY[0] - 4], [TAPS[1] - 0.3, TAPX, ROWY[1] - 4], [TAPS[2] - 0.3, TAPX, ROWY[2] - 4], [tDrop, TAPX, ROWY[2] - 4]];
  function aimAt(t) {
    var p = U.keys(AIM, t, 0.28), k = 0;
    TAPS.forEach(function (tt) { k += bump(t, tt - 0.07, 0.16); });
    return [p[0] - 10 * k, p[1] + 3 * k];      // the tap: a quick jab into the board
  }
  function marchArms(M, J, t, t0, w0) {        // big drum-major arm swings + a bouncy step on the march
    if (w0 <= 0) return;
    var ph = (t - t0) * 2 * Math.PI / ((cyc[1] - cyc[0]) / 30 / MARCH_K), s = Math.sin(ph);
    M.pose(J, { elR: ["neck", 30 * s, 62 - 16 * Math.max(0, s)], haR: ["neck", 78 * s, 82 - 70 * Math.max(0, s)],
      elL: ["neck", -30 * s, 62 - 16 * Math.max(0, -s)], haL: ["neck", -78 * s, 82 - 70 * Math.max(0, -s)] }, w0);
    var bob = Math.abs(Math.cos(ph)) * 5 * w0; SF.UPPER.concat(["chest"]).forEach(function (j) { J[j][1] -= bob; });
    Kit.lean(M, J, -5, 0, w0); J.head[1] -= 3 * w0;
  }
  function baseSam(t) {
    var a = act(t);
    if (a !== "D") return motionAt(t).joints(t);
    var J = MD.joints(tau(t)), sw = ramp(t, tSettle, tSettle + 0.45);
    if (sw > 0) { var Js = MDs.joints(t); JN.forEach(function (j) { J[j] = [lerp(J[j][0], Js[j][0], sw), lerp(J[j][1], Js[j][1], sw)]; }); J._f = Js._f; }
    return J;
  }
  /* the mocap ground fix flattens the heel-toe roll, so a landing foot skates forward on the grass: a foot that still
     moves fast is kept a little OFF the ground (it reads as the end of the swing), the knee re-solved by IK */
  function footFix(J, t) {
    var A = baseSam(t - 1 / 60), B = baseSam(t + 1 / 60), f = J._f || 1;
    [["hipR", "knR", "ftR"], ["hipL", "knL", "ftL"]].forEach(function (k) {
      var v = Math.abs(B[k[2]][0] - A[k[2]][0]) * 30; if (v < 70 || J[k[2]][1] < G0 - 24) return;
      var l1 = Math.hypot(J[k[0]][0] - J[k[1]][0], J[k[0]][1] - J[k[1]][1]), l2 = Math.hypot(J[k[1]][0] - J[k[2]][0], J[k[1]][1] - J[k[2]][1]);
      J[k[2]] = [J[k[2]][0], Math.min(J[k[2]][1], G0 - Math.min(20, (v - 70) * 0.075))];
      J[k[1]] = Kit.ik(J[k[0]], J[k[2]], l1, l2, f);
    });
    return J;
  }
  function jointsSam(t) {
    var a = act(t), M = motionAt(t), J;
    J = footFix(baseSam(t), t); if (a === "D") M = MD;
    var f = J._f || 1;
    Talk.idle(J, t, "sam", { amp: 1.1 });
    Talk.act(M, J, t, SAM_ACT);
    Talk.beats(M, J, t, SAM_BEATS, { amp: CS.gesture });
    Talk.accents(J, t, CS.accents, 2.6);
    Talk.nods(J, t, CS.nods, 4.5);
    if (a === "A") {
      var holdW = 1 - ramp(t, tDrop - 0.05, tDrop + 0.15);
      J._stick = aimArm(J, aimAt(t), 112, holdW);
      Kit.lean(M, J, 14, 2, ramp(t, tSweep0 - 0.2, tSweep0 + 0.2) * (1 - ramp(t, tSweep1, tSweep1 + 0.3)));     // reaches into the sweep
      Kit.lean(M, J, 10, 6, bump(t, TAPS[2] - 0.3, 0.7));
      Kit.hop(J, bump(t, w("l2", 9).t0 - 0.05, 0.32) * 14);                                                     // "growing!" hop
      Kit.lean(M, J, -8, 0, ramp(t, L.l4.start, L.l4.start + 0.2) * (1 - ramp(t, L.l4.end, L.l4.end + 0.4)));   // leans back, dismissive
      marchArms(M, J, t, tMarch, ramp(t, tMarch + 0.1, tMarch + 0.35));
      J.head[1] -= 4 * ramp(t, tMarch, tMarch + 0.3);                                                          // chin up, proud
    } else if (a === "B") {
      var pk = U.easeOutBack(clamp((t - tPop) / 0.2, 0, 1)) * (1 - ramp(t, L.l7.start - 0.4, L.l7.start - 0.15));
      Kit.lean(M, J, 118 * pk, 62 * pk, 1);                                                                     // head pops in from the edge
      J.head[1] += bump(t, tHa2 - 0.1, 0.5) * 4;
      marchArms(M, J, t, tMarch2, ramp(t, tMarch2 + 0.1, tMarch2 + 0.35));
    } else if (a === "C") {
      var hb = 1 - ramp(t, tReach - 0.25, tReach + 0.05);                                                       // hands behind his back
      M.pose(J, { elR: ["neck", -34, 58], haR: ["neck", -30, 112], elL: ["neck", -38, 56], haL: ["neck", -34, 108] }, hb * (1 - ramp(t, w("l9", 9).t0 - 0.2, w("l9", 9).t0 + 0.1) * (1 - ramp(t, L.l9.end + 0.1, L.l9.end + 0.4))));
      J.head[1] -= 4 * ramp(t, tStroll, tStroll + 0.4) * (1 - ramp(t, L.l10.start, L.l10.start + 0.3));       // nose in the air
      var rw = ramp(t, tReach, tReach + 0.22) * (1 - ramp(t, tStorm - 0.1, tStorm + 0.2));                     // grabs the glasses...
      if (rw > 0) {
        var hx = J.head[0] + f * 30 * SS, hy = J.head[1] - 6, pull = ramp(t, tPull, tPull + 0.22);
        var tx = lerp(hx + f * 26, J.neck[0] + f * 70 * SS, pull), ty = lerp(hy, J.neck[1] + 60 * SS, pull);
        var sv = aimArm(J, [tx + f * 2, ty], 1, rw);                                                            // (Ls 1: the hand itself)
      }
      Kit.lean(M, J, -6, 2, bump(t, tPull, 0.35));                                                              // yank
      J.head[1] += ramp(t, tFall0, tLand) * 7 * (1 - ramp(t, tStorm, tStorm + 0.3));                            // looks down at it
      marchArms(M, J, t, tStorm, ramp(t, tStorm + 0.1, tStorm + 0.35) * 0.7);
    } else {
      var up = ramp(t, tOw - 0.02, tOw + 0.12);
      Kit.crouch(M, J, 0.5 * (1 - up), { hands: 1 });
      Kit.hop(J, bump(t, tOw - 0.02, 0.3) * 18);
      if (up > 0) M.pose(J, { elR: ["neck", 20, 60], haR: ["neck", 30, 110], elL: ["neck", 10, 60], haL: ["neck", 20, 110] }, up);
    }
    return J;
  }

  // ---------- Layla: seated on her stool, knitting ----------
  var ML = SF.motion({ clips: CL, scale: LL.scale, ground: G0, segments: [{ t0: 0, t1: DUR + 1, clip: "sit", hold: 115, f: -1 }], anchor: { seg: 0, x: XL + 6, edge: "start" } });
  var LAYLA_ACT = [{ g: "palmsUp", t0: w("l14", 0).t0 - 0.15, t1: w("l14", 3).t1 + 0.1, amp: 0.45, ease: 0.3 }];
  var LOOKS = [[L.l3.start - 0.25, L.l3.end + 0.3], [L.l5.start + 0.3, L.l5.end - 0.3], [L.l7.start - 0.2, L.l8.end + 0.3],
    [L.l9.start + 0.2, L.l11.end + 0.5], [tLand - 0.2, tLand + 0.6]].concat(GLANCES).concat([[tLeaf0 + 0.2, tLay + 0.9]]);
  function lookUp(t) { var v = 0; LOOKS.forEach(function (g) { v = Math.max(v, ramp(t, g[0], g[0] + 0.14) * (1 - ramp(t, g[1], g[1] + 0.3))); }); return v; }
  function knitRate(t) { return 1 - 0.75 * lookUp(t); }
  function knitPhase(t) { return t * 2.1 - 0.75 * 2.1 * 0; }
  function jointsLayla(t) {
    var J = ML.joints(t), f = J._f || 1, S = ML.S;
    var lenL = [["hipR", "knR", "ftR"], ["hipL", "knL", "ftL"]].map(function (k) { return [Math.hypot(J[k[0]][0] - J[k[1]][0], J[k[0]][1] - J[k[1]][1]), Math.hypot(J[k[1]][0] - J[k[2]][0], J[k[1]][1] - J[k[2]][1])]; });
    var dy = (stool.seatY - 7) - J.hips[1];                                                                    // sit ON the low stool
    JN.forEach(function (j) { if (!/^(ftR|ftL|knR|knL)$/.test(j)) J[j][1] += dy; });
    J.ftR[0] += f * 4; J.ftL[0] -= f * 6;
    [["hipR", "knR", "ftR"], ["hipL", "knL", "ftL"]].forEach(function (k, i) { J[k[1]] = Kit.ik(J[k[0]], J[k[2]], lenL[i][0], lenL[i][1], f); });
    Talk.idle(J, t, "layla", { amp: 0.6 });
    var lu = lookUp(t), kn = Math.sin(t * 2 * Math.PI * 1.15) * knitRate(t);
    ML.pose(J, { elR: ["neck", 26, 62], haR: ["neck", 62, 70 + kn * 3], elL: ["neck", 14, 64], haL: ["neck", 48, 74 - kn * 3] }, 1);
    Talk.act(ML, J, t, LAYLA_ACT);
    Talk.beats(ML, J, t, CY.beats, { amp: CY.gesture * 0.6 });
    Talk.accents(J, t, CY.accents, 1.8);
    Talk.nods(J, t, CY.nods, 4);
    Kit.lean(ML, J, 7, 4, 1 - lu);                                                                             // hunched over the needles...
    J.head[1] += (1 - lu) * 13; J.head[0] += f * (1 - lu) * 9;                                                // ...eyes down
    J.head[1] -= lu * 4; J.head[0] -= f * lu * 2;                                                             // a glance: chin UP
    return J;
  }

  // ---------- rigs ----------
  var RL = SF.rig(figG, { scale: LL.scale, head: LL.head, ink: LL.ink, color: LL.color, accessories: LL.accessories, backInk: "#5a5751",
    expr: EX_L, blinks: BLINK_L, mouth: lipL, mouthFill: "#8e352d", lineComp: 0.6, seed: 2 });
  var knit = Props.knitting(figG);
  var RS = SF.rig(figG, { scale: LS.scale, head: LS.head, ink: LS.ink, color: LS.color, accessories: LS.accessories, backInk: "#5a5751",
    expr: EX_S, blinks: BLINK_S, mouth: mouthS, mouthFill: "#8e352d", lineComp: 0.6, seed: 1 });
  figG.appendChild(stickG);
  var HRS = RS.HR;

  // ---------- the disguise: nose-glasses with bushy brows + a big mustache (local prop, drawn over his face) ----------
  var disG = el("g", {}, figG), gogG = el("g", {}, disG);
  var gBrow = el("path", { fill: "#3a2a20", stroke: INK, "stroke-width": 2.5, "stroke-linejoin": "round" }, gogG);
  var gArm = el("path", { stroke: INK, "stroke-width": 4, "stroke-linecap": "round", fill: "none" }, gogG);
  var gNose = el("ellipse", { fill: "#eaa48d", stroke: INK, "stroke-width": 3.5 }, gogG);
  var gNoseHi = el("ellipse", { fill: "#fff", opacity: 0.45 }, gogG);
  var gLens = el("circle", { fill: "rgba(255,255,255,0.28)", stroke: INK, "stroke-width": 5 }, gogG);
  var mustG = el("g", {}, disG);
  var gMust = el("path", { fill: "#3a2a20", stroke: INK, "stroke-width": 2.5, "stroke-linejoin": "round" }, mustG);
  function mustPath(s) {   // a big curly handlebar mustache, centred at 0,0, facing +x, width ~ 2.3 s
    return "M " + (-1.15 * s) + " " + (-0.05 * s) + " C " + (-1.3 * s) + " " + (-0.5 * s) + ", " + (-0.75 * s) + " " + (-0.55 * s) + ", " + (-0.55 * s) + " " + (-0.25 * s) +
      " C " + (-0.4 * s) + " " + (-0.5 * s) + ", " + (0.05 * s) + " " + (-0.55 * s) + ", " + (0.0 * s) + " " + (-0.2 * s) +
      " C " + (0.15 * s) + " " + (-0.55 * s) + ", " + (0.6 * s) + " " + (-0.5 * s) + ", " + (0.55 * s) + " " + (-0.2 * s) +
      " C " + (0.8 * s) + " " + (-0.5 * s) + ", " + (1.35 * s) + " " + (-0.45 * s) + ", " + (1.15 * s) + " " + (-0.02 * s) +
      " C " + (1.1 * s) + " " + (0.12 * s) + ", " + (0.95 * s) + " " + (0.2 * s) + ", " + (0.75 * s) + " " + (0.1 * s) +
      " C " + (0.5 * s) + " " + (0.32 * s) + ", " + (0.1 * s) + " " + (0.25 * s) + ", " + (0.0 * s) + " " + (0.12 * s) +
      " C " + (-0.15 * s) + " " + (0.28 * s) + ", " + (-0.6 * s) + " " + (0.3 * s) + ", " + (-0.8 * s) + " " + (0.12 * s) +
      " C " + (-1.0 * s) + " " + (0.2 * s) + ", " + (-1.12 * s) + " " + (0.12 * s) + ", " + (-1.15 * s) + " " + (-0.05 * s) + " Z";
  }
  gMust.setAttribute("d", mustPath(HRS * 0.62));
  function disguise(J, t, k) {
    var on = t > tStroll - 0.6 && act(t) === "C";
    disG.setAttribute("visibility", on ? "visible" : "hidden"); if (!on) return;
    var F = J._f || 1, hx = J.head[0], hy = J.head[1] - HRS * 0.32, ex = hx + F * HRS * 0.42, ey = hy - HRS * 0.1;
    var off = ramp(t, tPull, tPull + 0.22), gx = 0, gy = 0;
    if (off > 0) { var H = J.haR; gx = (H[0] - (ex + F * HRS * 0.3)) * off; gy = (H[1] - ey) * off; }
    gogG.setAttribute("transform", "translate(" + gx.toFixed(1) + " " + gy.toFixed(1) + ") rotate(" + (off * -F * 25).toFixed(1) + " " + ex.toFixed(1) + " " + ey.toFixed(1) + ")");
    var r = HRS * 0.3;
    gLens.setAttribute("cx", (ex + F * HRS * 0.03).toFixed(1)); gLens.setAttribute("cy", ey.toFixed(1)); gLens.setAttribute("r", r.toFixed(1));
    gArm.setAttribute("d", "M " + (ex - F * r).toFixed(1) + " " + ey.toFixed(1) + " L " + (hx - F * HRS * 0.45).toFixed(1) + " " + (ey - HRS * 0.06).toFixed(1));
    var by = ey - r - HRS * 0.08;
    gBrow.setAttribute("d", "M " + (ex - F * HRS * 0.4).toFixed(1) + " " + (by + 4).toFixed(1) + " Q " + (ex).toFixed(1) + " " + (by - HRS * 0.3).toFixed(1) + " " + (ex + F * HRS * 0.42).toFixed(1) + " " + (by + 2).toFixed(1) +
      " Q " + ex.toFixed(1) + " " + (by - HRS * 0.08).toFixed(1) + " " + (ex - F * HRS * 0.4).toFixed(1) + " " + (by + 4).toFixed(1) + " Z");
    var nx = hx + F * HRS * 1.0, ny = hy + HRS * 0.1;
    gNose.setAttribute("cx", nx.toFixed(1)); gNose.setAttribute("cy", ny.toFixed(1)); gNose.setAttribute("rx", (HRS * 0.3).toFixed(1)); gNose.setAttribute("ry", (HRS * 0.25).toFixed(1));
    gNoseHi.setAttribute("cx", (nx + F * HRS * 0.06).toFixed(1)); gNoseHi.setAttribute("cy", (ny - HRS * 0.09).toFixed(1)); gNoseHi.setAttribute("rx", (HRS * 0.08).toFixed(1)); gNoseHi.setAttribute("ry", (HRS * 0.05).toFixed(1));
    [gLens, gArm, gNose].forEach(function (e) { e.setAttribute("stroke-width", ((e === gLens ? 5 : e === gArm ? 4 : 3.5) * k).toFixed(2)); });
    // the mustache: rides the upper lip (bounces with the mouth), stays stuck when the glasses go, peels, then falls
    var mo = mouthS(t), open = /[CDH]/.test(mo) ? 1 : /[BEF]/.test(mo) ? 0.5 : 0;
    var mx = hx + F * HRS * 0.78, my = hy + HRS * 0.3 + open * 2.5, rot = 0;
    var peel = ramp(t, tPeel, tFall0) * 18;
    var fp = clamp((t - tFall0) / (tLand - tFall0), 0, 1);
    if (t > tFall0) {
      var J0 = jointsSam(tFall0), h0x = J0.head[0] + F * HRS * 0.78, h0y = J0.head[1] - HRS * 0.32 + HRS * 0.3;
      mx = h0x + F * 18 * fp; my = h0y + (G0 - 8 - h0y) * fp * fp; rot = 90 * fp;
      if (t > tLand) { mx = h0x + F * 18; my = G0 - 8; rot = 180 - 10 * Math.exp(-(t - tLand) * 9) * Math.cos((t - tLand) * 40); }
    }
    mustG.setAttribute("transform", "translate(" + mx.toFixed(1) + " " + my.toFixed(1) + ") scale(" + F + " 1) rotate(" + (peel + rot).toFixed(1) + ")");
  }
  // the dropped mustache stays on the grass (world layer) after he storms off
  var mustGround = el("g", { visibility: "hidden" }, props);
  var mgP = el("path", { d: mustPath(HRS * 0.62), fill: "#3a2a20", stroke: INK, "stroke-width": 2.5, "stroke-linejoin": "round" }, mustGround);

  // ---------- THE BUSH (local prop): a round shrub with Sam's legs under it and his scarf end sticking out ----------
  var defs = document.querySelector("#stage defs");
  var mask = el("mask", { id: "p06bushHole", maskUnits: "userSpaceOnUse", x: -4000, y: -4000, width: 9000, height: 9000 }, defs);
  el("rect", { x: -4000, y: -4000, width: 9000, height: 9000, fill: "#fff" }, mask);
  var holeC = el("circle", { cx: 0, cy: 0, r: 0, fill: "#000" }, mask);
  var bushG = el("g", {}, figG), scarfG = el("g", {}, bushG), bodyWrap = el("g", { mask: "url(#p06bushHole)" }, bushG), bodyG = el("g", {}, bodyWrap), frillG = el("g", {}, bushG);
  var BLOBS = [[-78, 34, 50], [0, 44, 58], [78, 34, 50], [-60, -22, 58], [60, -22, 58], [0, -58, 60], [-98, 0, 40], [98, 0, 40], [-28, 6, 60], [28, 6, 60], [-34, -66, 40], [36, -64, 40]];
  var bOut = BLOBS.map(function (b) { return el("circle", { r: b[2] + 4.5, fill: INK }, bodyG); });
  var bIn = BLOBS.map(function (b, i) { return el("circle", { r: b[2], fill: i % 3 === 0 ? "#6aa252" : "#7fb562" }, bodyG); });
  var bHi = BLOBS.map(function (b, i) { return el("circle", { r: b[2] * 0.45, fill: "#a5d27f", opacity: i % 2 ? 0.55 : 0.35 }, bodyG); });
  var bTicks = []; for (var q = 0; q < 14; q++) bTicks.push(el("path", { stroke: "#4c7f38", "stroke-width": 3, "stroke-linecap": "round", fill: "none" }, bodyG));
  var FRILL = []; for (q = 0; q < 10; q++) FRILL.push(el("path", { d: "M 0 0 C 6 -9, 18 -9, 22 0 C 16 5, 6 5, 0 0 Z", fill: q % 2 ? "#7fb562" : "#6aa252", stroke: INK, "stroke-width": 2.5 }, frillG));
  var scInk = el("path", { stroke: INK, "stroke-width": 21, "stroke-linecap": "round", fill: "none" }, scarfG);
  var scRed = el("path", { stroke: "#c4453b", "stroke-width": 15, "stroke-linecap": "round", fill: "none" }, scarfG);
  var scFr = el("path", { stroke: "#c4453b", "stroke-width": 3.5, "stroke-linecap": "round", fill: "none" }, scarfG);
  var armG = el("g", {}, figG);
  var armP = el("path", { stroke: INK, "stroke-width": 7, "stroke-linecap": "round", "stroke-linejoin": "round", fill: "none" }, armG);
  var armFist = el("circle", { r: 6, fill: "#fbfaf6", stroke: INK, "stroke-width": 3 }, armG);
  var armLeaves = [0, 1, 2].map(function (i) { return el("path", { d: "M 0 0 C 6 -9, 18 -9, 22 0 C 16 5, 6 5, 0 0 Z", fill: i % 2 ? "#7fb562" : "#6aa252", stroke: INK, "stroke-width": 2.5 }, armG); });
  function bushState(t, J) {
    var tt = tau(t), mv = MOVES.some(function (m) { return t > m[0] && t < m[1]; }) ? 1 : 0, f = act(t) === "D" ? (J._f || 1) : 1;
    var x = J.hips[0] + 4, step = Math.sin((tt - 10) * 2 * Math.PI / ((cyc[1] - cyc[0]) / 30) * 2);
    var y = G0 - 148 + (t < tSettle ? step * 3 : 0);
    var jolt = bump(t, tOw - 0.02, 0.3) * 0.08 + bump(t, tPeck, 0.12) * 0.03 + bump(t, tPeck + 0.13, 0.12) * 0.03 + bump(t, tPeck + 0.26, 0.12) * 0.04;
    var shake = t > tOw + 0.4 && t < tLeaf1 + 0.6 ? Math.sin(t * 31) * 1.6 * (L.l16.end > t ? 1 : 0.5) : 0;   // he is FUMING inside
    return { x: x + shake, y: y, rot: t < tSettle ? step * 2.2 : 0, s: 1 + jolt, tt: tt, f: f };
  }
  function drawBush(t, J, k) {
    var on = act(t) === "D";
    bushG.setAttribute("visibility", on ? "visible" : "hidden"); if (!on) { armG.setAttribute("visibility", "hidden"); return null; }
    var B = bushState(t, J), sq = B.s;
    bodyG.setAttribute("transform", "translate(" + B.x.toFixed(1) + " " + (B.y + 100).toFixed(1) + ") rotate(" + B.rot.toFixed(2) + ") scale(" + (2 - sq).toFixed(3) + " " + sq.toFixed(3) + ") translate(0 -100)");
    BLOBS.forEach(function (b, i) {
      var jit = Math.sin(B.tt * 9 + i * 1.7) * 1.4;                    // leaves shiver only while it moves (warped clock)
      [bOut[i], bIn[i]].forEach(function (c) { c.setAttribute("cx", (b[0] + jit).toFixed(1)); c.setAttribute("cy", (b[1] - jit * 0.5).toFixed(1)); });
      bHi[i].setAttribute("cx", (b[0] - b[2] * 0.25 + jit).toFixed(1)); bHi[i].setAttribute("cy", (b[1] - b[2] * 0.3).toFixed(1));
    });
    bTicks.forEach(function (p, i) {
      var a = U.hash(i * 3.1) * 6.28, r = U.hash(i * 5.7) * 80, cx = Math.cos(a) * r * 1.1, cy = Math.sin(a) * r * 0.8 - 6;
      p.setAttribute("d", "M " + cx.toFixed(1) + " " + cy.toFixed(1) + " q 6 -8 13 -3");
    });
    // hole: his face peeks through (l13..l15), then his whole head bursts out of the top ("Ow!")
    var hx = J.head[0], hy = J.head[1] - HRS * 0.32, F = J._f || 1;
    var peek = ramp(t, tPeek, tPeek + 0.2) * (1 - ramp(t, tOw - 0.05, tOw + 0.02)), out = ramp(t, tOw - 0.03, tOw + 0.08);
    var cx = lerp(hx + F * HRS * 0.36, hx, out), cy = lerp(hy + HRS * 0.12, hy, out), r = Math.max(peek * HRS * 0.82, out * HRS * 1.08);
    holeC.setAttribute("cx", cx.toFixed(1)); holeC.setAttribute("cy", cy.toFixed(1)); holeC.setAttribute("r", r.toFixed(1));
    var fr = Math.max(peek, out);
    FRILL.forEach(function (p, i) {
      var a = (out > 0.5 ? (0.1 + i * 0.08) : i / FRILL.length) * Math.PI * 2 * (out > 0.5 ? 0.5 : 1) + (out > 0.5 ? 0 : 0.3), rr = r + 2;
      if (out > 0.5) a = Math.PI * (0.05 + 0.9 * i / (FRILL.length - 1));     // a collar of leaves under his chin
      var px = cx + Math.cos(a) * rr, py = cy + Math.sin(a) * rr;
      p.setAttribute("transform", "translate(" + px.toFixed(1) + " " + py.toFixed(1) + ") rotate(" + (a * 180 / Math.PI - 10).toFixed(0) + ") scale(" + (fr * 1.1).toFixed(2) + ")");
      p.setAttribute("visibility", fr > 0.02 ? "visible" : "hidden");
    });
    // the scarf end (out the back of the bush; yanked in on "scarves", pokes back out on "Fashionable")
    var len = (1 - ramp(t, tYank, tYank + 0.1)) + U.easeOutBack(clamp((t - tFlourish) / 0.35, 0, 1)) * 1.0;
    len = Math.min(1.15, len) * (1 - ramp(t, tOw - 0.05, tOw + 0.05));
    var bf = B.f, sx = B.x - bf * 82, sy = B.y - 18, fl = Math.sin(t * 7) * 5 + (t > tFlourish && t < tFlourish + 0.6 ? Math.sin((t - tFlourish) * 22) * 10 * (1 - (t - tFlourish) / 0.6) : 0);
    if (len > 0.02) {
      var ex2 = sx - bf * 112 * len, ey2 = sy + 18 + fl * len;
      var d = "M " + sx.toFixed(1) + " " + sy.toFixed(1) + " Q " + (sx - bf * 60 * len).toFixed(1) + " " + (sy - 6 + fl * 0.5).toFixed(1) + " " + ex2.toFixed(1) + " " + ey2.toFixed(1);
      scInk.setAttribute("d", d); scRed.setAttribute("d", d);
      scFr.setAttribute("d", [-6, 0, 6].map(function (o) { return "M " + (ex2 - bf * 4).toFixed(1) + " " + (ey2 + o).toFixed(1) + " l " + (-bf * 12).toFixed(1) + " " + (o * 0.4 + 2).toFixed(1); }).join(" "));
      scarfG.setAttribute("visibility", "visible");
    } else scarfG.setAttribute("visibility", "hidden");
    return B;
  }

  // ---------- Pip ----------
  var pip = Props.pip(front);
  var PERCH = bh.perch;
  function bushTop(t) { var J = jointsSam(t), B = bushState(t, J); return [B.x + 8, B.y - 100 - 20 + (B.s - 1) * -100]; }
  function pipState(t) {
    var ch = 0;
    [1.4, 9.9, tStretch0 - 0.3, tWS3 + 1.2, tPipLand + 0.3, tOw + 1.0, tOw + 1.45, L.l16.end + 0.2, L.l16.end + 0.65].forEach(function (c) { if (t > c && t < c + 0.18) ch = (t - c) / 0.18; });
    if (t < tPipFly) {
      var lk = t > tMarch && t < tMarch + 2 ? -1 : 0;
      return { x: PERCH[0], y: PERCH[1], f: -1, t: t, pose: "perch", chirp: ch, look: lk, tilt: bump(t, tPop, 2.2) * 20, seed: 1 };
    }
    if (t < tPipLand) {
      var p = clamp((t - tPipFly) / (tPipLand - tPipFly), 0, 1), e = U.smooth(p), to = bushTop(tPipLand);
      return { x: lerp(PERCH[0], to[0], e), y: lerp(PERCH[1], to[1], e) - Math.sin(Math.PI * e) * 120, f: -1, t: t, pose: "fly" };
    }
    if (t < tOw) {
      var bt = bushTop(t), pk = 0;
      [0, 0.13, 0.26].forEach(function (o) { pk = Math.max(pk, bump(t, tPeck + o, 0.12)); });
      var look = ramp(t, tPeek, tPeek + 0.4);
      return { x: bt[0], y: bt[1] + pk * 6, f: -1 + 2 * ramp(t, tPeek - 0.2, tPeek), t: t, pose: t < tPipLand + 0.25 ? "hop" : "perch", hop: (t - tPipLand) / 0.25,
        chirp: ch, tilt: 30 * look + pk * 40 + bump(t, L.l14.start, 2.2) * -15, seed: 2 };
    }
    // "Ow!": startled up, then hovers in his face, scolding back (chirps)
    var J = jointsSam(t), hx = J.head[0], hy = J.head[1] - HRS * 0.32;
    var h = clamp((t - tOw) / 0.45, 0, 1), from = bushTop(tOw), hv = [hx - 118, hy - 14 + Math.sin(t * 7) * 6];
    return { x: lerp(from[0], hv[0], U.smooth(h)), y: lerp(from[1], hv[1], U.smooth(h)) - Math.sin(Math.PI * h) * 60, f: 1, t: t, pose: "fly", chirp: ch };
  }

  // ---------- camera ----------
  var H0 = { sam: G0 - Kit.headInfo(MA.joints(tTurn + 0.6), RS, G0).top, layla: 0 };
  H0.layla = 1.0 * (G0 - Kit.headInfo(jointsLayla(L.l3.start + 0.5), RL, G0).top) * 1.32;
  function resolve(id, t) {
    if (id === "mound") return { head: [MX, G0 - 60], top: G0 - 140, feet: G0, f: 1, h: H0.sam };
    if (id === "pip") return { head: [PERCH[0], PERCH[1]], top: PERCH[1] - 40, feet: PERCH[1] + 24, f: -1, h: 120 };
    if (id === "layla") { var c = Kit.headInfo(jointsLayla(t), RL, G0); c.h = H0.layla; return c; }
    var cs = Kit.headInfo(jointsSam(t), RS, G0); cs.h = H0.sam; return cs;
  }
  var BEATS = { tPeck: tPeck, tTurn: tTurn, tMarch: tMarch, tStretch0: tStretch0, tPop: tPop, tCutL1: tCutL1, tWS3: tWS3, tArrD: tArrD, tLand: tLand,
    tCutL2: tCutL2, tBushWS: tBushWS, tF1: tF1, tF2: tF2, tR2: tR2, tF3: tF3, tPeek: tPeek, tYank: tYank, tOw: tOw, tLeaf0: tLeaf0, tLay: tLay };
  var SH = SHOTS.map(function (s) { var c = Object.assign({}, s); if (s.beat) c.t = BEATS[s.beat] + (s.off || 0);
    if (s.frameOf === "bush") c.frame = [bushEndX + s.frameDx, s.frameY, s.frameZ];
    return c; });
  var cam = Shots.camera(SH, { width: 1920, height: 1080, duration: DUR, resolve: resolve, data: DATA });
  var tfx = Shots.fx(document.getElementById("fxg"), []);
  var fx = Kit.emanata(front), fx2 = Kit.emanata(front);

  // the "?" over Sam ("...Ha?") and over the sprout's innocent wiggle — small local marks
  var qG = el("text", { "font-family": "Caveat, cursive", "font-weight": 700, "font-size": 64, fill: INK, "text-anchor": "middle", visibility: "hidden" }, front);
  qG.textContent = "?";

  function treeG(t) { return 0.2 + 0.06 * ramp(t, tLeaf0, tLeaf1); }
  function stretch(t) {        // the sprout reaches up and leans after him, freezes mid-stretch when caught, settles later
    var s = ramp(t, tStretch0, tPop) * 0.62, lean = ramp(t, tStretch0 + 0.4, tPop) * -14;
    var frozenS = ramp(tPop, tStretch0, tPop) * 0.62;
    if (t >= tPop) { s = frozenS; lean = -14; var back = ramp(t, L.l7.start + 0.3, L.l7.start + 0.9); s *= 1 - back; lean *= 1 - back; }
    var trem = t > tStretch0 && t < tPop ? Math.sin(t * 38) * 0.012 : 0;
    return { s: 1 + s + trem, lean: lean };
  }

  function render(t) {
    var c = cam.apply(camG, t); Y.update(t, c);
    var k = Math.pow(c[2], -0.6);
    var JL = jointsLayla(t), JS = jointsSam(t);
    RL.set(JL, t, { zoom: c[2] }); RS.set(JS, t, { zoom: c[2] });
    var a = act(t);
    knit.set(JL, { len: 150 + 50 * clamp(t / DUR, 0, 1), click: t * 1.15 % 1, G0: G0 });
    mound.set(t, {});
    var st = stretch(t), innocent = t > tPop + 0.15 && t < L.l7.start - 0.1 ? 1 : 0;
    tree.set(treeG(t), t, { season: "summer", wiggle: innocent + (t > tLeaf0 && t < tLeaf1 + 0.4 ? 0.6 : 0), bend: st.lean });
    tree.g.setAttribute("transform", "translate(" + TX + " " + TY + ") scale(" + (1 / Math.sqrt(st.s)).toFixed(3) + " " + st.s.toFixed(3) + ") translate(" + (-TX) + " " + (-TY) + ")");
    // the sign: rows jump on their tap; the stick in his hand, then leaning on the sign
    ROWS.forEach(function (g, i) { var b = bump(t, TAPS[i] - 0.02, 0.3); g.setAttribute("transform", "translate(0 " + (-b * 6).toFixed(1) + ")"); });
    ulG.setAttribute("stroke-dasharray", "400"); ulG.setAttribute("stroke-dashoffset", (400 * (1 - ramp(t, tSweep0 + 0.3, tSweep1))).toFixed(0));
    var sk = JS._stick;
    if (a === "A" && sk && t < tDrop) {
      var h0 = [sk.H[0] - sk.u[0] * 14, sk.H[1] - sk.u[1] * 14], tp = [sk.H[0] + sk.u[0] * 112, sk.H[1] + sk.u[1] * 112];
      var dS = "M " + U.pt(h0) + " L " + U.pt(tp);
      stickInk.setAttribute("d", dS); stickWood.setAttribute("d", dS); stickTip.setAttribute("cx", tp[0].toFixed(1)); stickTip.setAttribute("cy", tp[1].toFixed(1));
      figG.appendChild(stickG);
    } else {
      var fp = clamp((t - tDrop) / 0.3, 0, 1), base = [BR + 14, G0], topP = [BR - 6, G0 - 138];
      var rot = (1 - fp * fp) * -35;
      var cr = Math.cos(rot * Math.PI / 180), sr = Math.sin(rot * Math.PI / 180), vx = topP[0] - base[0], vy = topP[1] - base[1];
      var tp2 = [base[0] + vx * cr - vy * sr, base[1] + vx * sr + vy * cr];
      var dS2 = "M " + U.pt(base) + " L " + U.pt(tp2);
      stickInk.setAttribute("d", dS2); stickWood.setAttribute("d", dS2); stickTip.setAttribute("cx", tp2[0].toFixed(1)); stickTip.setAttribute("cy", tp2[1].toFixed(1));
      props.appendChild(stickG);
    }
    disguise(JS, t, k);
    mustGround.setAttribute("visibility", t > tStorm ? "visible" : "hidden");
    if (t > tStorm) { var J0 = jointsSam(tFall0), F0 = J0._f || 1; mustGround.setAttribute("transform", "translate(" + (J0.head[0] + F0 * HRS * 0.78 + F0 * 18).toFixed(1) + " " + (G0 - 8) + ") scale(" + F0 + " 1) rotate(180)"); }
    var B = drawBush(t, JS, k);
    // the arm that pokes out of the bush and points at Pip ("Rude bird!")
    var ap = a === "D" ? ramp(t, tPoint, tPoint + 0.15) : 0, P = pipState(t);
    if (ap > 0 && B) {
      var b0 = [B.x - 70, B.y - 40], hd = [P.x + 34, P.y + 16], dx = hd[0] - b0[0], dy = hd[1] - b0[1], dl = Math.hypot(dx, dy), m = Math.min(dl, 95) * U.easeOutBack(ap) / dl;
      var hp = [b0[0] + dx * m, b0[1] + dy * m + Math.sin(t * 18) * 3], fg = [hp[0] + dx / dl * 14, hp[1] + dy / dl * 14 - 2];
      armP.setAttribute("d", "M " + U.pt(b0) + " L " + U.pt(hp) + " M " + U.pt(hp) + " L " + U.pt(fg));
      armP.setAttribute("stroke-width", (7.4 * k).toFixed(2)); armG.setAttribute("visibility", "visible"); figG.appendChild(armG);
      armFist.setAttribute("cx", hp[0].toFixed(1)); armFist.setAttribute("cy", hp[1].toFixed(1)); armFist.setAttribute("r", (7 * k + 2).toFixed(1));
      armLeaves.forEach(function (lf, i) { lf.setAttribute("transform", "translate(" + (b0[0] + 6).toFixed(1) + " " + (b0[1] + (i - 1) * 9).toFixed(1) + ") rotate(" + (150 + (i - 1) * 40) + ")"); });
    } else armG.setAttribute("visibility", "hidden");
    pip.set(P);
    var hs = Kit.headInfo(JS, RS, G0), f = JS._f || 1;
    fx.set({
      lines: (t > tPop && t < tPop + 0.35) ? { x: hs.head[0], y: hs.head[1], r: HRS * 1.5, n: 7, amp: 20 } : (t > tOw && t < tOw + 0.45) ? { x: hs.head[0], y: hs.head[1], r: HRS * 1.5, n: 7, amp: 24 } : null,
      sweat: t > L.l10.start + 0.25 && t < L.l11.start ? { x: hs.head[0] - f * HRS * 0.8, y: hs.head[1] - HRS * 0.3, k: ramp(t, L.l10.start + 0.25, L.l11.start) } : null,
      twitch: t > tPull + 0.35 && t < tPeel + 0.15 ? { x: hs.head[0] + f * HRS * 0.25, y: hs.head[1] + 2, k: 1 } : null,
      anger: t > tOw + 0.35 && t < tLeaf1 + 0.6 ? { x: hs.head[0] - f * HRS * 0.55, y: hs.head[1] - HRS * 0.85, k: 1 } : null,
      puff: t > tLand && t < tLand + 0.5 ? { x: JS.head[0] + f * 40, y: G0 - 4, k: (t - tLand) / 0.5, s: 0.35 } : (t > tMarch && t < tMarch + 0.5 ? { x: JS.ftR[0], y: G0 - 4, k: (t - tMarch) / 0.5, s: 0.6 } : null)
    }, t);
    var tip = tree.tip(treeG(t)), tsp = [TX, TY - (TY - tip[1]) * st.s];
    fx2.set({
      sparkle: t > tLeaf0 && t < tLeaf1 + 0.5 ? { x: tsp[0] + 26 * Math.sin((t - tLeaf0) * 5), y: tsp[1] + 10 + 30 * ((t - tLeaf0) % 0.4), k: ((t - tLeaf0) / 0.4) % 1, s: 1.0 } : null,
      lines: t > tPop && t < tPop + 0.3 ? { x: tsp[0], y: tsp[1] + 20, r: 40, n: 6, amp: 16 } : null
    }, t);
    var qOn = t > tHa2 + 0.05 && t < L.l7.start - 0.3;
    qG.setAttribute("visibility", qOn ? "visible" : "hidden");
    if (qOn) { var qs = U.easeOutBack(clamp((t - tHa2 - 0.05) / 0.25, 0, 1)); qG.setAttribute("transform", "translate(" + (hs.head[0] + HRS * 0.2).toFixed(1) + " " + (hs.top - 16).toFixed(1) + ") scale(" + (qs * 0.55).toFixed(2) + ")"); }
    tfx.update(t);
  }
  window.__film = { MA: MA, MB: MB, MC: MC, MD: MD, RS: RS, RL: RL, cam: cam, resolve: resolve, jointsSam: jointsSam, jointsLayla: jointsLayla, bh: bh, stool: stool,
    beats: { tSweep0: tSweep0, TAPS: TAPS, tDrop: tDrop, tTurn: tTurn, tMarch: tMarch, MARCH_D: MARCH_D, tStretch0: tStretch0, tPop: tPop, tHa2: tHa2,
      tStepIn: tStepIn, tMarch2: tMarch2, tCutL1: tCutL1, tWS3: tWS3, tStroll: tStroll, tArrD: tArrD, tReach: tReach, tPull: tPull, tPeel: tPeel,
      tFall0: tFall0, tLand: tLand, tCutL2: tCutL2, tStorm: tStorm, tBushWS: tBushWS, tB0: tB0, tF1: tF1, tR1: tR1, tF2: tF2, tR2: tR2, tF3: tF3,
      tPipFly: tPipFly, tPipLand: tPipLand, tPeek: tPeek, tYank: tYank, tFlourish: tFlourish, tPeck: tPeck, tOw: tOw, tPoint: tPoint,
      tLeaf0: tLeaf0, tLeaf1: tLeaf1, tLay: tLay, BUSH_K: BUSH_K, bushEndX: bushEndX, DUR: DUR } };
  window.__timelines = window.__timelines || {};
  window.__timelines["main"] = SF.timeline(DUR, render);
})();
