/* Sam & Layla Ep. 1 — P07 "The camera / the mirror / the string / sunset goodbye" (~88 s). Built on the P01 reference.
 * Data: FILM_DATA (dialogue.py) · FILM_CAST · FILM_SHOTS (shots.json, word-anchored). Shared: common/set.js, props.js, kit.js.
 * Beat sheet:
 *   LUNCH (late afternoon): Sam on his upturned bucket on a checked picnic blanket reads the cup-noodle label "3 MIN" ->
 *   outraged, rips the lid, pulls out the DRY brick; Layla unwraps a sandwich, slowly ("You could just... wait.") -> CRUNCH ->
 *   "Never." (mouth full) -> CRUNCH -> Pip swoops, snatches a chunk, lands on Sam's head and eats it.
 *   CAMERA: "Trees can't hide from technology." he stands (Pip flaps off), holds up his phone, plants it on a tiny tripod
 *   facing the sapling, REC beep, tiptoes backwards and hides behind the rock (peeks) -> card "One hour later..." ->
 *   huddle at Layla's stool -> PHONE INSET: the footage; Sam's giant face pops in front of the sprout on every whisper.
 *   "Great footage. Very... you." -> "Huh. I'm in every shot."
 *   MIRROR: he sits with his back to it, hand mirror over his shoulder; rule of three in silence: mirror down -> it grows,
 *   mirror up -> frozen (third time it is caught mid-stretch) -> "It can see the mirror, Sam." -> "This tree is a genius."
 *   STRING: he ties a string to its tip, backs off and pulls (it bends); Layla STOPS KNITTING: "...you'll pull it out."
 *   (the dirt cracks) -> he lets go; it springs back -> "...Fine. No pulling." he unties it gently, pats the soil.
 *   SUNSET: the sky goes gold, long shadows. "Go home, Sam." she packs the scarf, folds her stool, "Goodnight, Sam." walks
 *   off right. "Goodnight, Layla. Goodnight, tree." -> "I'm watching you." (two fingers) -> HOLD: he stares; the moment he
 *   blinks the sapling ticks up a leaf; his eyes snap narrow -> fade to dark.
 * Everything is a pure function of t; beat times derive from the dialogue timeline and score.py uses the same formulas. */
(function () {
  "use strict";
  var SF = window.StickFilm, U = SF.u, el = U.el, ramp = U.ramp, clamp = U.clamp, lerp = U.lerp;
  var DATA = window.FILM_DATA, CAST = window.FILM_CAST.characters, SHOTS = window.FILM_SHOTS.shots;
  var CL = Object.assign({ stand: SF.standClip() }, window.FILM_CLIPS || {});
  var K = Kit.lines(DATA), L = K.L, w = K.w, F = Kit.FACE, bump = Kit.bump;
  var DUR = DATA.total, G0 = 820, INK = "#2b2a28";
  function win(t, a, b, ei, eo) { return ramp(t, a, a + (ei || 0.25)) * (1 - ramp(t, b - (eo == null ? (ei || 0.25) : eo), b)); }
  function ip(pts, o) { return Ink.path(pts, Object.assign({ wobble: 0.6, step: 10 }, o || {})); }

  // ---------- beats (same formulas in score.py) ----------
  var tRip = w("l1", 2).t0 - 0.12;                                   // "Who has that kind of time?": rips the lid, pulls the brick
  var tCr1 = L.l2.end + 0.32, tCr2 = L.l3.end + 0.12;                // CRUNCH (dry brick) ×2
  var tPipIn = tCr2 + 0.35, tPipGrab = tPipIn + 0.45, tPipHead = tPipGrab + 0.5;
  var tUpA = L.l4.start - 0.05, tPipOff = tUpA + 0.25, tPipHome = tPipOff + 1.3;
  var tPhone = w("l4", 4).t0 - 0.35;                                  // "technology": phone up
  var tPlant = L.l4.end + 0.02, tRec = tPlant + 0.75, tTip0 = tRec + 0.45, tTip1 = tTip0 + 1.8, tPeek = tTip1 + 0.35;
  var tCard0 = tTip1 + 0.6, tCard1 = L.l5.start - 0.5;               // "One hour later..."
  var tIn = L.l5.end + 0.15, tOut = L.l6.end + 0.45;                 // the phone inset
  var W6 = L.l6.words;
  var POPS = [[W6[0].t0 - 0.28, W6[3].t0 - 0.5, 1.0], [W6[3].t0 - 0.22, W6[4].t0 - 0.4, 1.55], [W6[4].t0 - 0.22, tOut + 1, 3.6]];
  var tM = L.l8.end + 0.35;                                          // smash cut: the mirror plan
  var W9 = L.l9.words, tMirUp0 = W9[5].t0 - 0.25;                    // "without looking": mirror up
  var T0 = L.l9.end;                                                 // the silent rule of three
  var CYC = [[T0 + 0.45, T0 + 1.5], [T0 + 2.3, T0 + 3.2], [T0 + 3.85, T0 + 4.45]];   // [mirror down, mirror up]
  var GROW = CYC.map(function (c) { return [c[0] + 0.15, c[1] - 0.06]; });             // it grows while he is not looking
  var tMirDown = L.l11.end + 0.05;
  var W12 = L.l12.words;
  var tUpC = L.l11.end + 0.35, tTurn = tUpC + 0.85, tTie0 = Math.max(W12[2].t0 - 0.1, tTurn + 0.8), tTie1 = W12[6].t1 + 0.05;
  var tBack0 = tTie1 + 0.12, tBack1 = tBack0 + 0.75, tPull = Math.max(W12[8].t0 - 0.05, tBack1 - 0.1), tYank = Math.max(W12[10].t0 - 0.05, tPull + 0.35);
  var tStopKnit = L.l13.start - 0.45, tCrack = w("l13", -1).t0 + 0.05;  // "...pull it OUT": the dirt cracks
  var tLetGo = L.l13.end + 0.9, tSpring = tLetGo + 0.05;
  var tFwd0 = L.l14.start - 0.85, tFwd1 = tFwd0 + 0.8;
  var tUntie0 = w("l14", 1).t0 - 0.2, tUntie1 = L.l14.end + 0.35, tPat = tUntie1 + 0.25, tUpD = tPat + 0.8;
  var tResume = L.l14.end + 0.5;
  var tStandL = w("l15", 2).t1 + 0.05, tPack0 = tStandL + 0.95, tPack1 = tPack0 + 1.4;
  var tFold0 = L.l16.end + 0.1, tFold1 = tFold0 + 0.9;
  var tTurnL = L.l17.end + 0.12, tWalkL = tTurnL + 0.35, tWaveL = tWalkL + 1.1;
  var W19 = L.l19.words, tEyes = W19[0].t0 - 0.3, tPointT = W19[2].t0 - 0.12, tFingerEnd = L.l19.end + 1.0;
  var tBlink = L.l19.end + 1.5, tTick = tBlink + 0.12, tSnap = tTick + 0.5;
  var tFade = DUR - 0.8;
  if (tSnap + 1.0 > tFade) console.warn("p07: tail too short for the button");

  // ---------- light: late afternoon -> gold (l14) -> sunset (l15) -> toward dusk in the HOLD ----------
  var tGold1 = L.l14.end + 1.0, tSun1 = L.l15.start + 1.0;
  function look(t) {
    if (t < tGold1) return ["day", "golden", 0.2 + 0.8 * ramp(t, L.l14.start, tGold1)];
    if (t < tSun1) return ["golden", "sunset", ramp(t, tGold1, tSun1)];
    return ["sunset", "dusk", 0.6 * ramp(t, L.l19.end - 0.5, DUR)];
  }
  var sunK = function (t) { return 0.25 + 0.75 * ramp(t, L.l14.start, tSun1); };   // shadow length / strength

  // ---------- the tree: g 0.26 -> 0.32 (mirror spurts) -> 0.335 -> 0.34 (the last tick) ----------
  function gOf(t) {
    var g = 0.26; GROW.forEach(function (gr) { g += 0.02 * ramp(t, gr[0], gr[1]); });
    g += 0.015 * ramp(t, L.l14.end, L.l19.end) + 0.005 * U.easeOutBack(clamp((t - tTick) / 0.3, 0, 1));
    return g;
  }

  // ---------- staging ----------
  var MX = 1000, TX = MX - 16, XB = 870, XT = 946, XH = 1296, XL = 1426, STOOL = 1420;
  var LS = CAST.sam.look, LL = CAST.layla.look, S_S = LS.scale, S_L = LL.scale;
  function mot(scale, segs, x) { return SF.motion({ clips: CL, scale: scale, ground: G0, segments: segs, anchor: { seg: 0, x: x, edge: "start" } }); }
  var MSA = mot(S_S, [
    { t0: 0, t1: tUpA, clip: "sit", hold: 115 },
    { t0: tUpA, t1: tUpA + 0.8, clip: "sit", from: 115, to: 0 },
    { t0: tUpA + 0.8, t1: tUpA + 1.0, clip: "stand", hold: 0, blend: 0.2 },
    { t0: tUpA + 1.0, t1: tUpA + 1.4, clip: "walk", from: 69, to: 76, blend: 0.15 },     // a step off the bucket
    { t0: tUpA + 1.4, t1: tTip0, clip: "stand", hold: 0, blend: 0.2 },
    { t0: tTip0, t1: tTip1, clip: "walk", from: 104, to: 69, blend: 0.2 },          // tiptoes BACKWARDS, eyes on the tree
    { t0: tTip1, t1: DUR + 1, clip: "stand", hold: 0, blend: 0.3 }], XB);
  var MSB = mot(S_S, [{ t0: 0, t1: DUR + 1, clip: "stand", hold: 0 }], XH);
  var MSC = mot(S_S, [
    { t0: 0, t1: tUpC, clip: "sit", hold: 115, f: -1 },
    { t0: tUpC, t1: tUpC + 0.8, clip: "sit", from: 115, to: 0, f: -1 },
    { t0: tUpC + 0.8, t1: tTurn, clip: "stand", hold: 0, f: -1, blend: 0.25 },
    { t0: tTurn, t1: tTurn + 0.3, clip: "stand", hold: 0, f: 1, blend: 0.25 },        // turns to the tree
    { t0: tTurn + 0.3, t1: tTie0, clip: "walk", from: 69, to: 80, f: 1, blend: 0.15 },  // steps up to it
    { t0: tTie0, t1: tBack0, clip: "stand", hold: 0, f: 1, blend: 0.2 },
    { t0: tBack0, t1: tBack1, clip: "walk", from: 104, to: 80, f: 1, blend: 0.12 },    // backs off with the string
    { t0: tBack1, t1: tFwd0, clip: "stand", hold: 0, f: 1, blend: 0.25 },
    { t0: tFwd0, t1: tFwd1, clip: "walk", from: 69, to: 92, f: 1, blend: 0.15 },       // back to the tree
    { t0: tFwd1, t1: tUpD + 0.15, clip: "stand", hold: 0, f: 1, blend: 0.25 },
    { t0: tUpD + 0.15, t1: tUpD + 0.75, clip: "walk", from: 104, to: 92, f: 1, blend: 0.12 },   // a step back to keep watch
    { t0: tUpD + 0.75, t1: DUR + 1, clip: "stand", hold: 0, f: 1, blend: 0.25 }], XB);
  var ML = mot(S_L, [
    { t0: 0, t1: tStandL, clip: "sit", hold: 115, f: -1 },
    { t0: tStandL, t1: tStandL + 0.9, clip: "sit", from: 115, to: 0, f: -1 },
    { t0: tStandL + 0.9, t1: tTurnL, clip: "stand", hold: 0, f: -1, blend: 0.3 },
    { t0: tTurnL, t1: tWalkL, clip: "stand", hold: 0, f: 1, blend: 0.3 },
    { t0: tWalkL, t1: DUR + 1, clip: "walk", loop: true, f: 1, blend: 0.3 }], XL);

  // ---------- body helpers ----------
  function sub(a, b) { return [a[0] - b[0], a[1] - b[1]]; }
  function ik(a, c, l1, l2, pref) {               // middle joint of a two-bone chain, bending toward `pref`
    var dx = c[0] - a[0], dy = c[1] - a[1], d = Math.max(1e-3, Math.min(Math.hypot(dx, dy), l1 + l2 - 1e-3));
    var x = (l1 * l1 - l2 * l2 + d * d) / (2 * d), h = Math.sqrt(Math.max(0, l1 * l1 - x * x)), ux = dx / d, uy = dy / d;
    var px = -uy, py = ux; if (px * pref[0] + py * pref[1] < 0) { px = -px; py = -py; }
    return [a[0] + ux * x + px * h, a[1] + uy * x + py * h];
  }
  /* put a hand at a world point (clamped to reach) with a natural elbow; side "R" near / "L" far; w blends */
  function reach(M, J, side, tgt, wt, pref) {
    if (wt <= 0) return; var f = J._f || 1, S = M.S;
    var A0 = [J.neck[0] + (J.hips[0] - J.neck[0]) * 0.1, J.neck[1] + (J.hips[1] - J.neck[1]) * 0.1];
    var sh = J["sh" + side], l1 = 80 * S, l2 = 60 * S, d = sub(tgt, A0), dl = Math.hypot(d[0], d[1]);
    var c = dl > l1 + l2 - 2 ? [A0[0] + d[0] / dl * (l1 + l2 - 2), A0[1] + d[1] / dl * (l1 + l2 - 2)] : tgt;
    var E = ik(A0, c, l1, l2, pref || [-f * 0.4, 1]);
    var el2 = [E[0] - 0.5 * (A0[0] - sh[0]), E[1] - 0.5 * (A0[1] - sh[1])];   // the rig draws the elbow half-way to the root
    J["ha" + side] = [lerp(J["ha" + side][0], c[0], wt), lerp(J["ha" + side][1], c[1], wt)];
    J["el" + side] = [lerp(J["el" + side][0], el2[0], wt), lerp(J["el" + side][1], el2[1], wt)];
  }
  /* sit lower (a seat lower than the mocap seat): hips + upper body drop dy, knees re-solved with the feet planted */
  function seatDrop(J, dy) {
    if (!dy) return; var f = J._f || 1;
    var LEGS = [["hipR", "knR", "ftR"], ["hipL", "knL", "ftL"]];
    var len = LEGS.map(function (k) { return [Math.hypot(J[k[0]][0] - J[k[1]][0], J[k[0]][1] - J[k[1]][1]), Math.hypot(J[k[1]][0] - J[k[2]][0], J[k[1]][1] - J[k[2]][1])]; });
    ["hips", "hipR", "hipL", "chest"].concat(SF.UPPER).forEach(function (j) { J[j][1] += dy; });
    LEGS.forEach(function (k, i) { J[k[1]] = ik(J[k[0]], J[k[2]], len[i][0], len[i][1], [f, -0.6]); });
  }
  function head(J, R) { return [J.head[0], J.head[1] - R.HR * 0.32]; }

  // ---------- acting: Sam ----------
  var CS = DATA.chars.sam, CY = DATA.chars.layla;
  var lipS = Talk.mouth(CS.mouth), lipL = Talk.mouth(CY.mouth);
  var SAM_ACT = [
    { g: "point", t0: w("l4", 0).t0 - 0.2, t1: w("l4", 2).t1 + 0.2, amp: 0.8 },                 // "Trees can't hide..." at the tree
    { g: "explain", t0: L.l5.start - 0.1, t1: L.l5.end, amp: 0.6 },
    { g: "chin", t0: w("l8", 1).t0 - 0.15, t1: L.l8.end + 0.5, ease: 0.3 },                      // "I'm in every shot."
    { g: "raise1", t0: W9[0].t0 - 0.15, t1: W9[3].t0, ease: 0.2 },                               // "Big brain move."
    { g: "crossArms", t0: tUpD + 0.1, t1: L.l17.end - 0.1, ease: 0.4 },                          // settles in to watch; stubborn
    { g: "wave", t0: L.l18.start - 0.15, t1: w("l18", 1).t1 + 0.35, ease: 0.25 },                 // "Goodnight, Layla."
    { g: "crossArms", t0: tFingerEnd, t1: DUR + 1, ease: 0.4 }                                    // keeps watch
  ];
  function inWin(b, list) { return list.some(function (r) { return b > r[0] && b < r[1]; }); }
  var NOBEAT = [[0, tCr2 + 2.0], [L.l6.start - 0.2, L.l6.end + 0.5], [L.l9.start + 1.2, L.l12.end + 0.5], [L.l16.start, DUR]];
  var SAM_BEATS = CS.beats.filter(function (b) { return !inWin(b, NOBEAT); });
  var EX_S = Kit.expr([[0, [-0.2, 0.7, 1.25]], [w("l1", 0).t0 - 0.15, F.indig, 0.12], [w("l1", 1).t0, [-0.45, 1.1, 1.6], 0.12],   // "3 MIN?!"
    [tRip, F.angry, 0.15], [L.l2.start + 0.2, F.stubborn, 0.4], [tCr1 - 0.25, [0.2, -0.4, 1.0], 0.12], [tCr1 + 0.1, [-0.2, -0.8, 0.6], 0.08],
    [L.l3.start, F.stubborn, 0.2], [tCr2 + 0.1, [-0.2, -0.8, 0.6], 0.08], [tPipGrab, F.shock, 0.08], [tPipHead + 0.2, F.indig, 0.25],
    [tUpA, F.listen, 0.2], [tPhone, F.scheming, 0.2], [w("l4", 4).t0, F.proud, 0.15], [tPlant, F.sly, 0.3], [tTip0, F.whisper, 0.25],
    [tPeek, F.scheming, 0.2],
    [tCard1, F.excited, 0.2], [L.l6.start - 0.3, F.hope, 0.3], [L.l6.end + 0.3, F.listen, 0.3], [w("l7", 2).t0, F.proud, 0.4],
    [L.l8.start - 0.1, F.huh, 0.3], [w("l8", 1).t0, [-0.1, 0.6, 1.1], 0.4], [w("l8", 3).t0, [-0.3, 0.9, 1.35], 0.2],
    [tM - 0.05, F.scheming, 0.05], [tMirUp0, F.sly, 0.2],
    [CYC[0][0] + 0.1, [0.6, 0.2, 0.15], 0.3], [CYC[0][1], F.sly, 0.08], [CYC[1][0] + 0.1, [0.6, 0.2, 0.15], 0.25], [CYC[1][1], F.sly, 0.08],
    [CYC[2][0] + 0.05, [0.4, -0.2, 0.15], 0.15], [CYC[2][1], F.shock, 0.06], [CYC[2][1] + 0.6, [-0.1, -0.9, 0.55], 0.4],
    [L.l11.start - 0.1, F.wow, 0.3], [L.l12.start - 0.1, F.determined, 0.25], [tTie0, [0.2, -0.5, 0.95], 0.3], [tPull, [-0.4, -1.0, 0.9], 0.2],
    [w("l13", 0).t0 + 0.1, F.shock, 0.12], [tCrack, F.panic, 0.1], [tLetGo - 0.2, F.sad, 0.6], [L.l14.start, [-0.2, 0.6, 0.95], 0.3],
    [tUntie0, [0.35, 0.5, 0.85], 0.4], [tPat, [0.6, 0.35, 0.8], 0.4], [L.l15.start, F.listen, 0.3], [L.l16.start - 0.1, F.stubborn, 0.25],
    [L.l17.start + 0.3, F.listen, 0.3], [L.l18.start - 0.1, F.warm, 0.3], [w("l18", 2).t0, F.smile, 0.3], [tEyes, [0.1, -0.9, 0.62], 0.2],
    [L.l19.end + 0.3, [0.05, -0.8, 0.6], 0.4], [tTick + 0.05, [-0.3, 0.9, 1.5], 0.08], [tSnap, [-0.05, -1.0, 0.5], 0.15]]);
  function mouthS(t) {
    if (t > L.l6.start - 0.05 && t < L.l6.end + 0.05) return "X";          // the voice is the recording: his real mouth is shut
    if (t > tCr1 - 0.25 && t < tCr1) return "D";                          // opens wide for the bite
    var ch = (t > tCr1 && t < L.l3.start + 0.1) || (t > tCr2 && t < tCr2 + 0.9) || (t > tPipHead && t < tPipHead + 0.6);
    if (ch && !(t > L.l3.start && t < L.l3.end)) return Math.floor(t * 9) % 2 ? "B" : "A";   // chewing
    if (t > tCrack + 0.05 && t < tLetGo - 0.2) return "E";                   // "out?!" frozen o
    if (t > tTick + 0.05 && t < tSnap) return "E";
    return lipS(t);
  }
  var BLINK_S = CS.blinks.filter(function (b) { var b0 = b[0] != null ? b[0] : b; return Math.abs(b0 - tBlink) > 1.2 && !(b0 > CYC[0][0] && b0 < CYC[2][1] + 0.8); })
    .concat([[tBlink, 0.32]]);

  function jointsSam(t) {
    var M = t < tCard1 ? MSA : t < tM ? MSB : MSC, J = M.joints(t), f = J._f || 1, S = M.S;
    var sc = t < tCard1 ? "A" : t < tM ? "B" : "C";
    Talk.idle(J, t, "sam", { amp: 1.1 });
    Talk.act(M, J, t, SAM_ACT);
    Talk.beats(M, J, t, SAM_BEATS, { amp: CS.gesture });
    Talk.accents(J, t, CS.accents, 2.6);
    Talk.nods(J, t, CS.nods, 4.5);
    var hd;
    if (sc === "A") {
      seatDrop(J, 30 * (1 - ramp(t, tUpA, tUpA + 0.55)));
      // reading the cup up close -> rips the lid -> brick in the near hand; the cup sinks to the lap in the far hand
      hd = head(J, RS);
      var rd = 1 - ramp(t, tRip + 0.1, tRip + 0.45);
      reach(MSA, J, "R", [hd[0] + f * 64, hd[1] + 30], rd * (1 - ramp(t, tUpA - 0.2, tUpA)));
      reach(MSA, J, "L", [hd[0] + f * 58, hd[1] + 44], rd);
      var hold = ramp(t, tRip + 0.1, tRip + 0.45) * (1 - ramp(t, tUpA - 0.1, tUpA + 0.3));
      reach(MSA, J, "R", [hd[0] + f * 58, hd[1] + 66 + Math.sin(t * 22) * 4 * win(t, tRip + 0.4, L.l1.end, 0.1)], hold);
      reach(MSA, J, "L", [J.hips[0] + f * 40, J.hips[1] - 8], hold * (1 - ramp(t, L.l2.start - 0.4, L.l2.start - 0.1)));
      var bite = function (tc) { return ramp(t, tc - 0.3, tc - 0.05) * (1 - ramp(t, tc + 0.25, tc + 0.55)); };
      var bw = Math.max(bite(tCr1), bite(tCr2));
      reach(MSA, J, "R", [hd[0] + f * (RS.HR + 10), hd[1] + RS.HR * 0.45], bw);
      reach(MSA, J, "R", [hd[0] + f * 70, hd[1] + 40], win(t, tPipIn, tUpA - 0.1, 0.3));         // holds the brick out: Pip's chance
      if (bw > 0) J.head[0] += f * 3 * bw;
      J.head[1] += Math.abs(Math.sin(t * 28)) * 3 * (win(t, tCr1, tCr1 + 0.5, 0.05) + win(t, tCr2, tCr2 + 0.5, 0.05));   // CRUNCH jolt
      // phone up on "technology", plant the tripod, press REC
      var ph = win(t, tPhone, tPlant + 0.1, 0.2);
      reach(MSA, J, "R", [hd[0] + f * 78, hd[1] - 46], ph * win(t, w("l4", 4).t0 - 0.1, tPlant + 0.1, 0.15));
      reach(MSA, J, "R", [hd[0] + f * 72, hd[1] + 50], ph * (1 - win(t, w("l4", 4).t0 - 0.1, tPlant + 0.1, 0.15)));
      var cr = win(t, tPlant - 0.05, tRec + 0.45, 0.35, 0.35);
      Kit.crouch(MSA, J, cr * 0.85, { hands: 0 }); Kit.lean(MSA, J, 16, 0, cr);
      reach(MSA, J, "R", [XT - 6 + 16 * bump(t, tRec - 0.15, 0.3), G0 - 66], cr);
      // tiptoe backwards: hunched, paws up; then the hide behind the rock + a peek
      var tip = win(t, tTip0 - 0.1, tTip1 + 0.2, 0.25);
      Kit.lean(MSA, J, 12, 6, tip); Kit.hop(J, tip * Math.abs(Math.sin((t - tTip0) * Math.PI * 2 * 0.98)) * 7);
      MSA.pose(J, { elR: ["neck", 30, 40], haR: ["neck", 62, 22], elL: ["neck", 20, 44], haL: ["neck", 52, 30] }, tip);
      var hide = ramp(t, tTip1 - 0.1, tTip1 + 0.3);
      Kit.crouch(MSA, J, hide, { hands: 0, depth: 1.25 - 0.32 * bump(t, tPeek, 0.9) });
      MSA.pose(J, { elR: ["neck", 40, 30], haR: ["neck", 78, -6], elL: ["neck", 30, 36], haL: ["neck", 70, 0] }, hide);   // fingers on the rock
      // Pip on his head: eyes roll up, he stays very still
      J.head[1] += win(t, tPipHead, tPipOff, 0.1) * 3;
      var up = bump(t, tUpA + 0.1, 0.45); Kit.hop(J, up * 10);
    } else if (sc === "B") {
      Kit.crouch(MSB, J, 0.55, { hands: 0 }); Kit.lean(MSB, J, 8, 0, 1);
      var pp = phonePos(t);
      var chin = win(t, w("l8", 1).t0 - 0.15, L.l8.end + 0.5, 0.3);
      reach(MSB, J, "R", [pp[0] - 10, pp[1] + 12 - 14 * bump(t, w("l5", -1).t0 - 0.05, 0.35)], 1 - chin);
      reach(MSB, J, "L", [pp[0] - 16, pp[1] + 20], 1);
      J.head[1] += 4 * win(t, tIn, tOut, 0.3);
    } else {
      seatDrop(J, 30 * (1 - ramp(t, tUpC, tUpC + 0.55)));
      hd = head(J, RS);
      // the mirror: far hand, up over the shoulder (behind his head) or down in his lap
      var mu = mirrorUp(t), seated = 1 - ramp(t, tUpC - 0.1, tUpC + 0.3);
      reach(MSC, J, "L", [hd[0] - f * RS.HR * 1.1, hd[1] - RS.HR * 1.35], mu * seated, [-f, 0.3]);
      reach(MSC, J, "L", [J.hips[0] + f * 34, J.hips[1] - 10], (1 - mu) * seated * (t < tMirDown + 0.6 ? 1 : 0));
      var arcK = Math.sin(Math.PI * clamp(mu, 0, 1)) * seated;
      J.haL[0] -= f * 46 * arcK; J.elL[0] -= f * 30 * arcK; J.haL[1] += 10 * arcK;
      J.head[1] -= mu * 3; J.head[0] -= f * mu * 2;
      // the string: tie (crouch + hands at the tip), back off, pull, freeze, let go, untie
      var tipP = tree.tip(gOf(t)), bend = bendOf(t), tipB = [tipP[0] + bend * tree.H(gOf(t)) / 90 * 0.8, tipP[1]];
      var tie = win(t, tTie0, tTie1 + 0.1, 0.35, 0.3), unt = win(t, tUntie0, tUntie1 + 0.1, 0.35, 0.3), kneel = Math.max(tie, unt);
      Kit.crouch(MSC, J, kneel * 0.8, { hands: 0 }); Kit.lean(MSC, J, 14, 0, kneel);
      var wig = Math.sin(t * 30) * 5 * Math.max(win(t, tTie0 + 0.35, tTie1 - 0.1, 0.1), win(t, tUntie0 + 0.4, tUntie1 - 0.2, 0.1) * 0.5);
      reach(MSC, J, "R", [tipB[0] - 8 + wig, tipB[1] - 4], kneel);
      reach(MSC, J, "L", [tipB[0] - 14 - wig, tipB[1] + 6], kneel);
      var hs = holdString(t), pull = pullOf(t), oops = win(t, tLetGo, tLetGo + 0.9, 0.08, 0.5);
      Kit.lean(MSC, J, -12, 0, oops); Talk.pose(MSC, J, "raise2", oops * 0.7, null, t);
      Kit.lean(MSC, J, -30, 4, pull); J.ftR[0] += (J._f || 1) * 10 * pull;
      var hp = [J.neck[0] + f * 52 * S, J.neck[1] + 70 * S];
      reach(MSC, J, "R", [hp[0] + f * 6, hp[1]], hs); reach(MSC, J, "L", [hp[0] - f * 4, hp[1] + 6], hs);
      // pats the soil after untying
      var pat = win(t, tPat - 0.2, tUpD, 0.2);
      Kit.crouch(MSC, J, pat * 0.75, { hands: 0 }); Kit.lean(MSC, J, 12, 0, pat);
      reach(MSC, J, "R", [TX - 14, G0 - 34 - 10 * Math.abs(Math.sin((t - tPat) * Math.PI * 3))], pat);
      // "Goodnight, tree.": a soft look down at it
      var down = win(t, w("l18", 2).t0 - 0.2, L.l18.end + 0.4, 0.3);
      J.head[1] += 5 * down; J.head[0] += f * 3 * down;
      // "I'm watching you.": two fingers at his eyes -> at the tree
      var eyes = win(t, tEyes, tPointT + 0.1, 0.2, 0.15), pt2 = win(t, tPointT, tFingerEnd, 0.15, 0.4);
      reach(MSC, J, "R", [hd[0] + f * RS.HR * 1.95, hd[1] + RS.HR * 0.6], eyes, [f * 0.3, 1]);
      Kit.lean(MSC, J, 16, 4, pt2 * 0.9);
      var tt = tree.tip(gOf(t)), dv = sub(tt, J.neck), dvl = Math.hypot(dv[0], dv[1]) || 1;
      reach(MSC, J, "R", [J.neck[0] + dv[0] / dvl * 125 * S, J.neck[1] + dv[1] / dvl * 125 * S + 8], pt2, [-f * 0.2, 1]);
      var snap = win(t, tSnap - 0.05, tSnap + 1.4, 0.12, 0.5);                                  // the button: again!
      reach(MSC, J, "R", [hd[0] + f * RS.HR * 1.95, hd[1] + RS.HR * 0.6], snap, [f * 0.3, 1]);
      J._v = Math.max(eyes, pt2, snap); J._vAt = eyes + snap > pt2 ? "eyes" : "tree";
    }
    return J;
  }

  // ---------- acting: Layla ----------
  var LAYLA_ACT = [
    { g: "palmsUp", t0: w("l15", 3).t0 - 0.2, t1: w("l15", 5).t1 + 0.2, amp: 0.7, side: "R" }
  ];
  var LAYLA_NOD = CY.nods.concat([w("l7", 1).t0, w("l10", -1).t0 + 0.05, w("l17", 1).t0]);
  var EX_L = Kit.expr([[0, F.calm], [L.l2.start - 0.1, [0.25, 0.1, 0.85], 0.3], [L.l2.end + 0.2, F.calm, 0.4], [tCr1 + 0.05, [0.0, 0.25, 0.8], 0.15],
    [tCard1, F.calm, 0.3], [tIn, [0.15, 0.2, 0.9], 0.3], [L.l7.start - 0.1, F.dead, 0.25], [L.l8.start + 0.4, F.calm, 0.4],
    [L.l10.start - 0.2, F.dead, 0.25], [L.l11.start + 0.3, F.calm, 0.4], [tPull, [0.0, 0.35, 1.05], 0.3],
    [tStopKnit, [0.0, -0.15, 1.0], 0.3], [L.l13.end + 0.4, [0.15, 0.2, 0.95], 0.6], [tUntie0, [0.3, 0.3, 0.92], 0.6],
    [L.l15.start - 0.1, [0.3, 0.3, 0.92], 0.3], [L.l16.start + 0.3, [0.1, 0.0, 0.8], 0.4], [L.l17.start - 0.1, [0.33, 0.35, 0.9], 0.3]]);
  var BLINK_L = CY.blinks.filter(function (b) { var b0 = b[0] != null ? b[0] : b; return Math.abs(b0 - (L.l7.end - 0.5)) > 0.6; })
    .concat([[L.l7.end - 0.5, 0.42], [w("l10", 0).t0 - 0.45, 0.35]]);
  function knitW(t) {                     // 1 = knitting, 0 = hands still
    return ramp(t, tCard1 - 0.6, tCard1 - 0.3) * (1 - ramp(t, tStopKnit, tStopKnit + 0.3)) + ramp(t, tResume, tResume + 0.4) * (1 - ramp(t, L.l15.start + 0.3, L.l15.start + 0.6));
  }
  function scarfLen(t) {
    var a = tCard1, b = L.l15.start + 0.3, k = 0;
    if (t > a) k = (Math.min(t, b) - a - Math.max(0, Math.min(t, tResume) - tStopKnit)) / (b - a - (tResume - tStopKnit));
    return lerp(260, 340, clamp(k, 0, 1)) * (1 - ramp(t, tPack0 + 0.2, tPack1 - 0.1));
  }
  function jointsLayla(t) {
    var J = ML.joints(t), f = J._f || 1, walking = t > tWalkL;
    Talk.idle(J, t, "layla", { amp: walking ? 0.3 : 0.9 });
    Talk.act(ML, J, t, LAYLA_ACT);
    Talk.beats(ML, J, t, CY.beats.filter(function (b) { return b > L.l15.start && b < tPack0; }), { amp: CY.gesture });
    Talk.accents(J, t, CY.accents, 2.0);
    Talk.nods(J, t, LAYLA_NOD, 4.5);
    seatDrop(J, 40 * (1 - ramp(t, tStandL, tStandL + 0.6)));
    var seated = 1 - ramp(t, tStandL - 0.1, tStandL + 0.4), lap = [J.hips[0] + f * 46, J.hips[1] - 24];
    // lunch: the sandwich at her chest, unwrapped slowly
    var sw = seated * (1 - ramp(t, tCard0, tCard0 + 0.2));
    reach(ML, J, "R", [lap[0] + f * 22, lap[1] - 6 - 6 * bump(t, L.l2.end + 0.2, 1.0)], sw);
    reach(ML, J, "L", [lap[0] + f * 14 + f * 8 * ramp(t, L.l2.start, L.l2.end), lap[1] - 2], sw);
    // knitting (needles at the lap) / hands still in her lap (l13)
    var kw = seated * ramp(t, tCard0, tCard0 + 0.2), click = Math.sin(t * Math.PI * 2 * 1.6) * knitW(t);
    reach(ML, J, "R", [lap[0] + f * 8 + click * 3, lap[1] - 20 + 6 * (1 - knitW(t))], kw);
    reach(ML, J, "L", [lap[0] - f * 4 - click * 2, lap[1] - 14 + 6 * (1 - knitW(t))], kw);
    J.head[1] += 2.5 * (1 - ramp(t, tStopKnit, tStopKnit + 0.3)) * seated * kw;              // eyes on the work
    J.head[1] -= 3 * win(t, tStopKnit, L.l13.end + 0.5, 0.3);                                  // looks up at him
    Kit.lean(ML, J, 9, 0, win(t, tCard1 - 0.4, tOut + 0.3, 0.4));                               // leans in to the phone
    // packing: the tote in her far hand, the near hand stuffs the scarf in
    var pk = win(t, tPack0 - 0.35, tPack1 + 0.15, 0.3);
    var bagAt = [J.hips[0] + f * 30, J.hips[1] + 10];
    reach(ML, J, "L", bagAt, pk);
    reach(ML, J, "R", [bagAt[0] + f * (12 + 16 * Math.abs(Math.sin((t - tPack0) * Math.PI * 2.2))), bagAt[1] - 30 + 24 * Math.abs(Math.sin((t - tPack0) * Math.PI * 2.2))], pk);
    Kit.lean(ML, J, 6, 0, pk);
    // folds the stool: bends to it, then it's under her near arm
    var fd = win(t, tFold0 - 0.3, tFold1 + 0.1, 0.3);
    Kit.crouch(ML, J, fd * 0.45, { hands: 0 });
    reach(ML, J, "R", [STOOL + 10 * (J._f || 1) * -1, G0 - 96 + 30 * ramp(t, tFold0, tFold1)], fd);
    var carry = ramp(t, tFold1 - 0.05, tFold1 + 0.2);
    reach(ML, J, "R", [J.hips[0] + f * 16, J.hips[1] - 20], carry * (walking ? 0.6 : 1));
    reach(ML, J, "L", [J.hips[0] - f * 6, J.hips[1] + 12], ramp(t, tPack1, tPack1 + 0.3) * (walking ? 0.5 : 1));
    // a tiny wave over her shoulder as she goes (no look back)
    reach(ML, J, "L", [J.neck[0] - f * 10, J.neck[1] - 30], win(t, tWaveL, tWaveL + 1.2, 0.25));
    return J;
  }

  // ---------- world ----------
  var back = document.getElementById("back"), props = document.getElementById("props"), figG = document.getElementById("fig");
  var front = document.getElementById("front"), camG = document.getElementById("cam"), ui = document.getElementById("ui");
  var defs = document.querySelector("#stage defs");
  var Y = FilmSet.yard({ G0: G0, ref: [1040, 560, 1.25], look: look, season: "summer", garden: { x: MX } });
  var shadG = el("g", {}, back);                                                           // long shadows (sunset)
  var bh = Kit.birdhouse(back, 1640, G0);
  var stool = Props.stool(back, STOOL, G0);
  // gingham pattern for the picnic blanket
  var pat = el("pattern", { id: "gingham", patternUnits: "userSpaceOnUse", width: 28, height: 28 }, defs);
  el("rect", { width: 28, height: 28, fill: "#fbf3e6" }, pat);
  el("rect", { width: 14, height: 28, fill: "#d9534a", opacity: 0.55 }, pat);
  el("rect", { width: 28, height: 14, fill: "#d9534a", opacity: 0.55 }, pat);
  var blanket = el("g", {}, back);
  var BLX0 = XB - 210, BLX1 = XB + 30;
  el("path", { d: ip([[BLX0 + 30, G0 - 6], [BLX1 + 30, G0 - 6], [BLX1, G0 + 40], [BLX0, G0 + 40]], { seed: 301, closed: true }), fill: "url(#gingham)", stroke: INK, "stroke-width": 3.5, "stroke-linejoin": "round" }, blanket);
  // a wicker basket + a thermos on the blanket
  var bas = el("g", { transform: "translate(" + (XB - 150) + " " + (G0 + 8) + ")" }, blanket);
  el("path", { d: "M -26 -30 C -24 -62, 24 -62, 26 -30", fill: "none", stroke: "#8b6a43", "stroke-width": 5 }, bas);
  el("path", { d: ip([[-34, -32], [34, -32], [28, 4], [-28, 4]], { seed: 302, closed: true }), fill: "#d9a65e", stroke: INK, "stroke-width": 3.5, "stroke-linejoin": "round" }, bas);
  el("path", { d: "M -30 -20 L 30 -20 M -28 -8 L 28 -8 M -14 -32 L -12 4 M 2 -32 L 2 4 M 16 -32 L 14 4", stroke: "#a87a3e", "stroke-width": 2.5, fill: "none" }, bas);
  var thermo = el("g", { transform: "translate(" + (XB - 92) + " " + (G0 + 10) + ")" }, blanket);
  el("path", { d: ip([[-11, -52], [11, -52], [11, 0], [-11, 0]], { seed: 303, closed: true }), fill: "#2f7f8f", stroke: INK, "stroke-width": 3 }, thermo);
  el("path", { d: ip([[-8, -64], [8, -64], [8, -52], [-8, -52]], { seed: 304, closed: true }), fill: "#e8e2d4", stroke: INK, "stroke-width": 3 }, thermo);
  // Sam's upturned bucket (the seat for lunch and for the mirror)
  var BH = 112, bucket = el("g", {}, back);
  el("path", { d: ip([[XB - 48, G0 + 6], [XB + 48, G0 + 6], [XB + 36, G0 - BH], [XB - 36, G0 - BH]], { seed: 311, closed: true }), fill: "#8fa6b4", stroke: INK, "stroke-width": 4, "stroke-linejoin": "round" }, bucket);
  el("path", { d: ip([[XB - 50, G0 - 4], [XB + 50, G0 - 4]], { seed: 312 }), stroke: INK, "stroke-width": 7, "stroke-linecap": "round" }, bucket);
  el("path", { d: ip([[XB - 41, G0 - 70], [XB + 41, G0 - 70]], { seed: 313 }), stroke: "#6f8593", "stroke-width": 4, "stroke-linecap": "round" }, bucket);
  el("path", { d: "M " + (XB - 22) + " " + (G0 - BH + 14) + " L " + (XB - 16) + " " + (G0 - 20), stroke: "#ffffff", "stroke-width": 5, "stroke-opacity": 0.35, "stroke-linecap": "round" }, bucket);
  el("path", { d: "M " + (XB + 42) + " " + (G0 - 30) + " C " + (XB + 70) + " " + (G0 - 20) + ", " + (XB + 66) + " " + (G0 + 4) + ", " + (XB + 44) + " " + (G0 + 2), fill: "none", stroke: INK, "stroke-width": 3 }, bucket);
  var mound = Props.mound(props, MX, G0);
  var tree = Props.tree(props, TX, G0 - 26);
  var crackG = el("path", { fill: "none", stroke: INK, "stroke-width": 3, "stroke-linecap": "round" }, props);
  // the tiny tripod + phone (planted facing the sapling)
  var tripod = el("g", {}, props);
  el("path", { d: "M " + XT + " " + (G0 - 58) + " L " + (XT - 18) + " " + (G0 + 4) + " M " + XT + " " + (G0 - 58) + " L " + (XT + 16) + " " + (G0 + 4) + " M " + XT + " " + (G0 - 58) + " L " + (XT - 2) + " " + (G0 + 8), stroke: INK, "stroke-width": 4, "stroke-linecap": "round" }, tripod);
  var tripPhone = el("g", { transform: "translate(" + XT + " " + (G0 - 70) + ")" }, tripod);
  el("rect", { x: -9, y: -16, width: 18, height: 30, rx: 4, fill: "#3a3f4a", stroke: INK, "stroke-width": 3 }, tripPhone);
  el("circle", { cx: 9, cy: -8, r: 3.2, fill: "#9fd3e6", stroke: INK, "stroke-width": 1.5 }, tripPhone);
  var recDot = el("circle", { cx: -2, cy: 6, r: 3.6, fill: "#e8463a" }, tripPhone);
  var pip = Props.pip(props);
  var pipNoodle = el("path", { fill: "none", stroke: "#e9c45a", "stroke-width": 4, "stroke-linecap": "round" }, props);
  // the mirror lives BEHIND the figures (over his shoulder, held by the far hand)
  var mirG = el("g", {}, figG);
  el("path", { d: "M 0 0 L 0 34", stroke: "#8b6a43", "stroke-width": 8, "stroke-linecap": "round" }, mirG);
  el("ellipse", { cx: 0, cy: -26, rx: 25, ry: 31, fill: "#c9a46a", stroke: INK, "stroke-width": 3.5 }, mirG);
  el("ellipse", { cx: 0, cy: -26, rx: 18, ry: 24, fill: "#cfe8f2", stroke: INK, "stroke-width": 2 }, mirG);
  var mirRef = el("g", {}, mirG);                                                          // the reflected sapling
  el("path", { d: "M 0 0 L 0 -12", stroke: "#5f9a3a", "stroke-width": 3, "stroke-linecap": "round" }, mirRef);
  el("path", { d: "M 0 -11 C -5 -16, -10 -14, -11 -11 C -7 -9, -3 -9, 0 -11 Z M 0 -12 C 5 -17, 10 -15, 11 -12 C 7 -10, 3 -10, 0 -12 Z", fill: "#8cc265", stroke: INK, "stroke-width": 1.2 }, mirRef);
  var mirLv = [0, 1, 2].map(function (k) { return el("path", { d: "M 0 " + (-4 - k * 2.5) + " C -5 " + (-9 - k * 2.5) + ", -9 " + (-7 - k * 2.5) + ", -9 " + (-5 - k * 2.5) + " M 0 " + (-5 - k * 2.5) + " C 5 " + (-10 - k * 2.5) + ", 9 " + (-8 - k * 2.5) + ", 9 " + (-6 - k * 2.5), stroke: "#5f9a3a", "stroke-width": 2.4, fill: "#8cc265", "stroke-linecap": "round" }, mirRef); });
  el("path", { d: "M -9 -40 L -3 -46 M -12 -32 L 0 -44", stroke: "#ffffff", "stroke-width": 3, "stroke-linecap": "round", opacity: 0.8 }, mirG);
  var bagG = el("g", {}, figG), bag = Kit.bag(bagG);
  var knit = Props.knitting(figG);
  var RL = SF.rig(figG, { scale: S_L, head: LL.head, ink: LL.ink, color: LL.color, accessories: LL.accessories, backInk: "#5a5751",
    expr: EX_L, blinks: BLINK_L, mouth: lipL, mouthFill: "#8e352d", lineComp: 0.6, seed: 2 });
  var RS = SF.rig(figG, { scale: S_S, head: LS.head, ink: LS.ink, color: LS.color, accessories: LS.accessories, backInk: "#5a5751",
    expr: EX_S, blinks: BLINK_S, mouth: mouthS, mouthFill: "#8e352d", lineComp: 0.6, seed: 1 });
  var handG = el("g", {}, figG);                                                           // things in hands (above the figures)
  // the cup noodle: white cup, red band, "3 MIN"
  var cup = el("g", {}, handG);
  el("path", { d: ip([[-22, -30], [22, -30], [16, 30], [-16, 30]], { seed: 321, closed: true }), fill: "#fbfaf6", stroke: INK, "stroke-width": 3.5, "stroke-linejoin": "round" }, cup);
  el("path", { d: "M -20 -16 L 20 -16 L 18 6 L -18 6 Z", fill: "#d9453b" }, cup);
  var cupTxt = el("text", { x: 0, y: 2, "text-anchor": "middle", "font-family": "Caveat, cursive", "font-weight": 700, "font-size": 19, fill: "#fbfaf6" }, cup); cupTxt.textContent = "3 MIN";
  var lid = el("g", {}, handG);
  el("ellipse", { cx: 0, cy: 0, rx: 25, ry: 6, fill: "#d8d4cc", stroke: INK, "stroke-width": 3 }, lid);
  // the dry noodle brick (bitten, a chunk stolen)
  var brick = el("g", {}, handG);
  var bmask = el("mask", { id: "biteMask", maskUnits: "userSpaceOnUse", x: -40, y: -40, width: 80, height: 80 }, defs);
  el("rect", { x: -40, y: -40, width: 80, height: 80, fill: "#fff" }, bmask);
  var bite1 = el("circle", { cx: 21, cy: -12, r: 9, fill: "#000" }, bmask);
  var bite2 = el("circle", { cx: 21, cy: 8, r: 8, fill: "#000" }, bmask);
  brick = el("g", { mask: "url(#biteMask)" }, brick);
  el("path", { d: ip([[-20, -14], [20, -14], [20, 14], [-20, 14]], { seed: 331, closed: true }), fill: "#ecc35c", stroke: INK, "stroke-width": 3 }, brick);
  el("path", { d: "M -16 -8 Q -12 -12 -8 -8 T 0 -8 T 8 -8 T 16 -8 M -16 0 Q -12 -4 -8 0 T 0 0 T 8 0 T 16 0 M -16 8 Q -12 4 -8 8 T 0 8 T 8 8 T 16 8", fill: "none", stroke: "#c99a35", "stroke-width": 2 }, brick);
  var crumbs = []; for (var ci = 0; ci < 9; ci++) crumbs.push(el("rect", { width: 6, height: 5, fill: "#ecc35c", stroke: INK, "stroke-width": 1.2 }, handG));
  // the phone in his hand
  var phone = el("g", {}, handG);
  el("rect", { x: -13, y: -22, width: 26, height: 44, rx: 5, fill: "#3a3f4a", stroke: INK, "stroke-width": 3 }, phone);
  var phScr = el("rect", { x: -9, y: -17, width: 18, height: 32, rx: 2, fill: "#9fd3e6" }, phone);
  // the sandwich (wrapped in paper, opened slowly)
  var sand = el("g", {}, handG);
  el("path", { d: ip([[-22, 14], [22, 14], [0, -22]], { seed: 341, closed: true }), fill: "#e9c88f", stroke: INK, "stroke-width": 3, "stroke-linejoin": "round" }, sand);
  el("path", { d: "M -14 8 L 14 8", stroke: "#7fb562", "stroke-width": 4, "stroke-linecap": "round" }, sand);
  var wrapL = el("path", { fill: "#f3ead2", stroke: INK, "stroke-width": 2.5, "stroke-linejoin": "round" }, sand);
  var wrapR = el("path", { fill: "#eadfc2", stroke: INK, "stroke-width": 2.5, "stroke-linejoin": "round" }, sand);
  // the string, and Layla's folded stool
  var strG = el("path", { fill: "none", stroke: "#f2efe6", "stroke-width": 3.2, "stroke-linecap": "round" }, handG);
  var strInk = el("path", { fill: "none", stroke: INK, "stroke-width": 1.2, "stroke-linecap": "round", opacity: 0.7 }, handG);
  var knot = el("circle", { r: 4, fill: "#f2efe6", stroke: INK, "stroke-width": 1.5 }, handG);
  var fstool = el("g", {}, handG);
  el("path", { d: "M -46 -4 L 46 -8 M -46 6 L 46 2", stroke: "#8b6a43", "stroke-width": 7, "stroke-linecap": "round" }, fstool);
  el("path", { d: ip([[-44, -14], [-24, -14], [-24, 12], [-44, 12]], { seed: 351, closed: true }), fill: "#2f7f8f", stroke: INK, "stroke-width": 3 }, fstool);
  // two fingers ("I'm watching you")
  var vfing = el("path", { fill: "none", stroke: INK, "stroke-width": 5, "stroke-linecap": "round" }, handG);
  var rockFront = Props.rock(front, 610, G0);                                              // the rock: Sam hides BEHIND it
  var fx = Kit.emanata(front);

  // ---------- small prop state functions ----------
  function phonePos(t) { return [XH + 58, G0 - 130]; }
  function mirrorUp(t) {
    var u = ramp(t, tMirUp0, tMirUp0 + 0.3);
    CYC.forEach(function (c, k) { var sp = k === 2 ? 0.07 : 0.14; u *= 1 - ramp(t, c[0], c[0] + 0.25) * (1 - ramp(t, c[1], c[1] + sp)); });
    return u * (1 - ramp(t, tMirDown, tMirDown + 0.35));
  }
  function frozen(t) { var k = 0; CYC.forEach(function (c) { k = Math.max(k, win(t, c[1], c[1] + 0.5, 0.02, 0.3)); }); return k; }
  function pullOf(t) { return (ramp(t, tPull, tPull + 0.35) * 0.6 + ramp(t, tYank, tYank + 0.2) * 0.4) * (1 - ramp(t, tLetGo, tLetGo + 0.1)); }
  function holdString(t) { return ramp(t, tTie1 - 0.05, tTie1 + 0.2) * (1 - ramp(t, tLetGo, tLetGo + 0.12)); }
  function bendOf(t) {
    var p = Math.max(0, pullOf(t)), b = -26 * p - 10 * win(t, tYank, tYank + 0.4, 0.05) ;
    var spr = t > tSpring ? Math.exp(-(t - tSpring) * 3.2) * Math.sin((t - tSpring) * 16) * 16 * (1 - ramp(t, tFwd0, tFwd0 + 0.2) * 0) : 0;
    return b + spr * (t > tSpring ? 1 : 0) * (t < tSpring + 2.2 ? 1 : 0);
  }
  function stringAnchor(t) { var g = gOf(t), tp = tree.tip(g); return [tp[0] + bendOf(t) * tree.H(g) / 90 * 0.82, tp[1] + 4]; }
  function pipState(t, JS) {
    var perch = bh.perch, hs = head(JS, RS), top = [hs[0] - 4, hs[1] - RS.HR * 1.05 - 18];
    var bk = [JS.haR[0] + 18, JS.haR[1] - 16];
    function arc(a, b, p, h) { var e = U.smooth(p); return [lerp(a[0], b[0], e), lerp(a[1], b[1], e) - Math.sin(Math.PI * e) * h]; }
    if (t < tPipIn) { var ch = (t % 4.3) < 0.18 ? (t % 4.3) / 0.18 : 0; return { x: perch[0], y: perch[1], f: -1, t: t, pose: "perch", chirp: ch, seed: 1 }; }
    if (t < tPipGrab) { var p1 = arc(perch, bk, (t - tPipIn) / (tPipGrab - tPipIn), 140); return { x: p1[0], y: p1[1], f: -1, t: t, pose: "fly", noodle: false }; }
    if (t < tPipHead) { var p2 = arc(bk, top, (t - tPipGrab) / (tPipHead - tPipGrab), 60); return { x: p2[0], y: p2[1], f: 1, t: t, pose: "fly", noodle: true }; }
    if (t < tPipOff) { var pk = Math.abs(Math.sin((t - tPipHead) * 9)) > 0.8 ? 1 : 0; return { x: top[0], y: top[1], f: 1, t: t, pose: (t - tPipHead) < 0.25 ? "hop" : "perch", hop: (t - tPipHead) / 0.25, tilt: 18 * pk, noodle: t < tPipHead + 0.9, seed: 1 }; }
    if (t < tPipHome) { var p3 = arc(top, perch, (t - tPipOff) / (tPipHome - tPipOff), 120); return { x: p3[0], y: p3[1], f: 1, t: t, pose: "fly" }; }
    var sleep = t > L.l19.end + 0.3;
    var c2 = 0;[tPipHome + 0.4, L.l11.start + 0.6, tCrack + 0.2].forEach(function (c) { if (t > c && t < c + 0.18) c2 = (t - c) / 0.18; });
    return { x: perch[0], y: perch[1], f: -1, t: t, pose: sleep ? "sleep" : (t < tPipHome + 0.25 ? "hop" : "perch"), hop: (t - tPipHome) / 0.25, chirp: c2, seed: 1 };
  }

  // ---------- the PHONE INSET (screen space, #ui): the recorded footage ----------
  var inset = el("g", { display: "none" }, ui);
  var dim = el("rect", { x: -10, y: -10, width: 1940, height: 1100, fill: "#1a1814", opacity: 0 }, ui);
  ui.insertBefore(dim, inset);
  var PX = 960, PY = 520, PW = 1180, PH = 690, SW_ = 1100, SH_ = 620;
  var phBody = el("g", {}, inset);
  el("rect", { x: PX - PW / 2, y: PY - PH / 2, width: PW, height: PH, rx: 60, fill: "#2f333b", stroke: INK, "stroke-width": 8 }, phBody);
  el("circle", { cx: PX + PW / 2 - 30, cy: PY, r: 9, fill: "#4a505b" }, phBody);
  var clip = el("clipPath", { id: "phoneClip" }, defs);
  el("rect", { x: PX - SW_ / 2, y: PY - SH_ / 2, width: SW_, height: SH_, rx: 16 }, clip);
  var scr = el("g", { "clip-path": "url(#phoneClip)" }, inset);
  var skyGrad = el("linearGradient", { id: "fsky", x1: 0, y1: 0, x2: 0, y2: 1 }, defs);
  el("stop", { offset: "0", "stop-color": "#93c3e0" }, skyGrad); el("stop", { offset: "1", "stop-color": "#f4eedb" }, skyGrad);
  el("rect", { x: PX - SW_ / 2, y: PY - SH_ / 2, width: SW_, height: SH_, fill: "url(#fsky)" }, scr);
  var FZ = 3.1, FC = [984, 742];                                    // footage camera: centred on the sprout
  var fw = el("g", { transform: "translate(" + PX + " " + PY + ") scale(" + FZ + ") translate(" + (-FC[0]) + " " + (-FC[1]) + ")" }, scr);
  el("path", { d: ip([[780, 700], [880, 676], [1000, 690], [1120, 668], [1220, 692], [1220, 900], [780, 900]], { seed: 361, closed: true }), fill: "#b6cfa6", stroke: INK, "stroke-width": 1.5, "stroke-opacity": 0.4 }, fw);
  [[820, 1], [1160, 0]].forEach(function (p) { el("path", { d: "M " + p[0] + " 760 L " + p[0] + " 700 M " + (p[0] + 40) + " 760 L " + (p[0] + 40) + " 700 M " + (p[0] - 10) + " 716 L " + (p[0] + 60) + " 716", stroke: "#f2ead8", "stroke-width": 6 }, fw); });
  el("rect", { x: 760, y: G0, width: 500, height: 120, fill: "#a9d27f" }, fw);
  el("path", { d: "M 760 " + G0 + " L 1260 " + G0, stroke: INK, "stroke-width": 2 }, fw);
  var fMound = Props.mound(fw, MX, G0), fTree = Props.tree(fw, TX, G0 - 26);
  var faceG = el("g", {}, scr);
  var RF = SF.rig(faceG, { scale: S_S, head: LS.head, ink: LS.ink, color: LS.color, accessories: LS.accessories, backInk: "#5a5751",
    expr: Kit.expr([[0, F.whisper], [W6[3].t0 - 0.2, F.hope, 0.2], [W6[4].t0 - 0.2, [0.3, 0.7, 1.45], 0.2]]), blinks: [[W6[3].t0 + 0.4, 0.13]],
    mouth: function (t) { return lipS(t); }, mouthFill: "#8e352d", lineComp: 0.6, seed: 1 });
  var hud = el("g", {}, inset);
  var hudDot = el("circle", { cx: PX - SW_ / 2 + 44, cy: PY - SH_ / 2 + 42, r: 12, fill: "#e8463a" }, hud);
  var hudRec = el("text", { x: PX - SW_ / 2 + 66, y: PY - SH_ / 2 + 54, "font-family": "Caveat, cursive", "font-weight": 700, "font-size": 40, fill: "#fbfaf6", stroke: INK, "stroke-width": 1 }, hud); hudRec.textContent = "REC";
  var hudTime = el("text", { x: PX + SW_ / 2 - 30, y: PY - SH_ / 2 + 54, "text-anchor": "end", "font-family": "Caveat, cursive", "font-weight": 700, "font-size": 40, fill: "#fbfaf6", stroke: INK, "stroke-width": 1 }, hud);
  el("path", { d: "M " + (PX - SW_ / 2 + 30) + " " + (PY + SH_ / 2 - 30) + " l 0 -40 m 0 40 l 40 0 M " + (PX + SW_ / 2 - 30) + " " + (PY + SH_ / 2 - 30) + " l 0 -40 m 0 40 l -40 0 M " + (PX - SW_ / 2 + 30) + " " + (PY - SH_ / 2 + 80) + " l 0 40", stroke: "#fbfaf6", "stroke-width": 4, fill: "none", opacity: 0.8 }, hud);
  var FACE0 = (function () { var J = MSB.joints(0); return J; })();
  function footage(t) {
    var a = ramp(t, tIn, tIn + 0.3), b = 1 - ramp(t, tOut - 0.22, tOut);
    var on = t > tIn && t < tOut;
    inset.setAttribute("display", on ? "inline" : "none");
    dim.setAttribute("opacity", (0.5 * a * b).toFixed(3));
    if (!on) return;
    var s = U.easeOutBack(clamp((t - tIn) / 0.3, 0, 1)) * (0.4 + 0.6 * b + 0.0) * 1, s2 = Math.max(0.05, Math.min(s, b > 0.999 ? s : b));
    inset.setAttribute("transform", "translate(" + PX + " " + PY + ") scale(" + s2.toFixed(3) + ") translate(" + (-PX) + " " + (-PY) + ")");
    fMound.set(t, {}); fTree.set(0.26, t, {});
    var sec = 59 * 60 + 12 + Math.floor(t - tIn);
    hudTime.textContent = "00:" + ("0" + Math.floor(sec / 60)).slice(-2) + ":" + ("0" + (sec % 60)).slice(-2);
    hudDot.setAttribute("opacity", (t * 2) % 1 < 0.6 ? 1 : 0.15);
    // Sam's giant face pops in front of the lens on every whisper
    var vis = 0, sc = 1, xo = 0;
    POPS.forEach(function (p) {
      var k = ramp(t, p[0], p[0] + 0.16) * (1 - ramp(t, p[1], p[1] + 0.16));
      if (k > 0.001) { vis = k; sc = p[2]; xo = (1 - k) * -700; }
    });
    faceG.setAttribute("display", vis > 0.001 ? "inline" : "none");
    if (vis <= 0.001) return;
    var J = SF.motion ? MSB.joints(t) : FACE0; J._f = 1;
    var hx = J.head[0], hy = J.head[1];
    var tx = PX - 110 + xo + (sc > 2 ? -240 : 0), ty = PY + 30 + (sc > 2 ? 90 : 0), Z = FZ * 0.62 * sc;
    faceG.setAttribute("transform", "translate(" + tx.toFixed(1) + " " + ty.toFixed(1) + ") scale(" + Z.toFixed(3) + ") rotate(" + (Math.sin(t * 3) * 2).toFixed(2) + ") translate(" + (-hx) + " " + (-hy) + ")");
    Talk.idle(J, t, "sam", { amp: 1.2 });
    RF.set(J, t, { zoom: Z });
  }

  // ---------- camera ----------
  var H0 = { sam: G0 - Kit.headInfo(MSB.joints(0), RS, G0).top, layla: G0 - Kit.headInfo(ML.joints(tTurnL + 0.5), RL, G0).top };
  function resolve(id, t) {
    if (id === "tree") { var tp = tree.tip(gOf(t)); return { head: [TX, tp[1] - 10], top: tp[1] - 60, feet: G0, f: 1, h: H0.sam }; }
    if (id === "pip") return { head: [bh.perch[0], bh.perch[1]], top: bh.perch[1] - 40, feet: bh.perch[1] + 24, f: -1, h: 120 };
    var c = id === "sam" ? Kit.headInfo(jointsSam(t), RS, G0) : Kit.headInfo(jointsLayla(t), RL, G0); c.h = H0[id]; return c;
  }
  var cam = Shots.camera(SHOTS, { width: 1920, height: 1080, duration: DUR, resolve: resolve });
  var tfx = Shots.fx(document.getElementById("fxg"), [{ t: tFade, type: "fadeOut", dur: 0.8 }]);
  var cardEl = document.getElementById("card");
  var cards = Kit.cards(cardEl, [{ t0: tCard0, t1: tCard1, c1: "One hour later...", fade: 0.2 }]);
  var cg = Kit.cardSvg(cardEl), clockG = el("g", { transform: "translate(960 790) scale(1.5)" }, cg);
  el("circle", { r: 54, fill: "#fbfaf6", stroke: INK, "stroke-width": 5 }, clockG);
  var hMin = el("path", { stroke: INK, "stroke-width": 5, "stroke-linecap": "round" }, clockG), hHr = el("path", { stroke: "#c4453b", "stroke-width": 6, "stroke-linecap": "round" }, clockG);

  // ---------- shadows (long at sunset) ----------
  var SH = ["sam", "layla", "tree", "bucket"].map(function () { return el("ellipse", { fill: "#3a2c3a" }, shadG); });
  function shadow(e, x, len, op) { e.setAttribute("cx", (x - len * 0.45).toFixed(1)); e.setAttribute("cy", (G0 + 3).toFixed(1)); e.setAttribute("rx", (len * 0.55 + 18).toFixed(1)); e.setAttribute("ry", "7"); e.setAttribute("opacity", op.toFixed(3)); }

  function at(g, x, y, r, s) { g.setAttribute("transform", "translate(" + x.toFixed(1) + " " + y.toFixed(1) + ") rotate(" + (r || 0).toFixed(1) + ") scale(" + (s == null ? 1 : s) + ")"); }
  function vis(g, on) { g.setAttribute("display", on ? "inline" : "none"); }

  function render(t) {
    var c = cam.apply(camG, t); Y.update(t, c);
    var JL = jointsLayla(t), JS = jointsSam(t), f = JS._f || 1, g = gOf(t);
    RL.set(JL, t, { zoom: c[2] }); RS.set(JS, t, { zoom: c[2] });
    var hs = head(JS, RS), sceneA = t < tCard1, sceneC = t >= tM;
    // the tree: frozen stiff when caught, wiggles while it grows, bends on the string
    var growing = 0; GROW.forEach(function (gr) { growing = Math.max(growing, win(t, gr[0], gr[1], 0.08)); });
    tree.set(g, t, { season: "summer", wiggle: growing, bend: bendOf(t) - 6 * frozen(t) * (t > CYC[2][1] ? 1 : 0) + 5 * growing * Math.sin(t * 13), shake: 0 });
    var stretch = 1 + 0.16 * growing * (0.6 + 0.4 * Math.sin(t * 25)) - 0.05 * win(t, CYC[2][1], CYC[2][1] + 0.3, 0.02, 0.2);
    tree.g.setAttribute("transform", "translate(" + TX + " " + (G0 - 26) + ") scale(" + (1 / Math.sqrt(stretch)).toFixed(3) + " " + stretch.toFixed(3) + ") translate(" + (-TX) + " " + (-(G0 - 26)) + ")");
    mound.set(t, {});
    var cr = ramp(t, tCrack, tCrack + 0.15) * (1 - ramp(t, tUntie1, tUntie1 + 0.5));
    crackG.setAttribute("d", cr > 0 ? "M " + (TX - 10) + " " + (G0 - 27) + " l -14 6 l -6 12 M " + (TX + 8) + " " + (G0 - 28) + " l 12 5 l 4 10 M " + (TX - 2) + " " + (G0 - 28) + " l 2 -6" : "");
    crackG.setAttribute("opacity", cr.toFixed(2));
    // shadows
    var sk = sunK(t), op = 0.10 + 0.12 * sk;
    shadow(SH[0], (JS.ftR[0] + JS.ftL[0]) / 2 + 10, 40 + 300 * sk, op);
    shadow(SH[1], t > tWalkL + 4 ? -999 : (JL.ftR[0] + JL.ftL[0]) / 2 + 10, 40 + 280 * sk, op);
    shadow(SH[2], TX + 8, 20 + 150 * sk * g * 2.5, op * 0.9);
    shadow(SH[3], XB + 40, 60 + 200 * sk, op);
    // Layla's things
    var st = 1 - ramp(t, tFold0 + 0.1, tFold1 - 0.1);
    stool.g.setAttribute("transform", "translate(" + STOOL + " " + G0 + ") scale(" + st.toFixed(3) + " 1) translate(" + (-STOOL) + " " + (-G0) + ")");
    vis(stool.g, st > 0.05);
    var carry = t > tFold1 - 0.05;
    vis(fstool, carry); if (carry) at(fstool, JL.haR[0] + 4 * (JL._f || 1), JL.haR[1] + 2, (JL._f || 1) * -8);
    var bagInHand = t > tPack0 - 0.35;
    if (bagInHand) bag.set(JL.haL[0] - 2, JL.haL[1] + 4, { rot: Math.sin(t * 5) * (t > tWalkL ? 6 : 1.5) });
    else bag.set(STOOL + 70, G0 - 42, {});
    var len = scarfLen(t), knitOn = t > tCard0 && len > 2;
    knit.set(JL, { len: len, click: (t * 1.6) % 1 * knitW(t), packed: t > tPack0 - 0.3, hidden: !knitOn, G0: G0 });
    var sw = t < tCard0;
    vis(sand, sw); if (sw) {
      var ctr = [(JL.haR[0] + JL.haL[0]) / 2, (JL.haR[1] + JL.haL[1]) / 2 - 10], ok = ramp(t, L.l2.start + 0.2, L.l2.end + 0.2);
      at(sand, ctr[0], ctr[1] + 6, -6, 0.95);
      wrapL.setAttribute("d", "M 0 -26 L -26 18 L " + (lerp(0, -30, ok)).toFixed(1) + " " + (lerp(18, 26, ok)).toFixed(1) + " Z");
      wrapR.setAttribute("d", "M 0 -26 L 26 18 L " + (lerp(0, 40, ok)).toFixed(1) + " " + (lerp(18, -4, ok)).toFixed(1) + " Z");
    }
    // Sam's lunch
    var lidOff = t > tRip;
    vis(cup, sceneA && t < tUpA + 0.2);
    if (t < tRip + 0.2) at(cup, JS.haR[0] + f * 4, JS.haR[1] - 6, f * -6, 1.15);
    else if (t < L.l2.start - 0.1) at(cup, JS.haL[0] + f * 4, JS.haL[1] - 10, 0, 1.0);
    else at(cup, XB - 40, G0 + 2, 4, 0.9);                                                 // on the blanket
    vis(lid, sceneA && t < tRip + 0.8);
    if (!lidOff) at(lid, JS.haR[0] + f * 4, JS.haR[1] - 6 - 32 * 1.15, f * -6, 1.15);
    else { var lp = clamp((t - tRip) / 0.8, 0, 1); at(lid, JS.haR[0] + f * (20 + 260 * lp), JS.haR[1] - 50 - 260 * lp + 520 * lp * lp, lp * 720, 1.1); }
    var br = sceneA && t > tRip && t < tUpA + 0.25;
    vis(brick.parentNode, br); if (br) at(brick.parentNode, JS.haR[0] + f * 6, JS.haR[1] - 4, f * 8, 1.1);
    vis(bite1, t > tCr1); vis(bite2, t > tCr2);
    crumbs.forEach(function (cb, i) {
      var tc = t < tCr2 ? tCr1 : tCr2, k = (t - tc) / 0.7;
      if (k < 0 || k > 1 || !sceneA) { vis(cb, false); return; }
      vis(cb, true); var a = -Math.PI * (0.15 + 0.7 * U.hash(i * 3.1 + (tc > tCr1 ? 5 : 0))), v = 160 + 120 * U.hash(i * 7.3);
      at(cb, hs[0] + f * RS.HR * 0.7 + f * Math.cos(a) * v * k * 0.6, hs[1] + RS.HR * 0.5 + Math.sin(a) * v * k + 340 * k * k, k * 400 * (i % 2 ? 1 : -1));
    });
    // phone: in his hand (l4) / on the tripod / in his hands (huddle)
    var inHandA = sceneA && t > tPhone && t < tPlant + 0.4, inHandB = !sceneA && !sceneC;
    vis(phone, inHandA || inHandB);
    if (inHandA) at(phone, JS.haR[0] + f * 4, JS.haR[1] - 10, f * 10, 1.0);
    if (inHandB) { var pp = phonePos(t); at(phone, pp[0], pp[1], -14, 1.15); phScr.setAttribute("fill", t > L.l5.end - 0.2 ? "#cfe8b8" : "#9fd3e6"); }
    vis(tripod, sceneA && t > tPlant + 0.4);
    recDot.setAttribute("visibility", t > tRec && (t * 2) % 1 < 0.6 ? "visible" : "hidden");
    // Pip
    var ps = pipState(t, JS); pip.set(ps);
    pipNoodle.setAttribute("d", ps.noodle ? "M " + (ps.x + (ps.f || 1) * 30) + " " + (ps.y - 12) + " q " + ((ps.f || 1) * 8) + " 6 " + ((ps.f || 1) * 2) + " 12 q " + ((ps.f || 1) * -6) + " 6 " + ((ps.f || 1) * 4) + " 12" : "");
    // the mirror (far hand), with the sapling reflected while it is up
    var mu = mirrorUp(t), mOn = sceneC && t < tUpC + 0.1;
    vis(mirG, sceneC);
    if (sceneC && !mOn) { at(mirG, XB - 6, G0 - BH - 22, 90, 0.9); vis(mirRef, false); }
    if (mOn) { at(mirG, JS.haL[0], JS.haL[1] + 6, lerp(80 * f, 25 * f, mu), 1.0); vis(mirRef, mu > 0.5); at(mirRef, 0, -12, 0, 0.75 + (g - 0.26) * 6); mirLv.forEach(function (lv, k) { vis(lv, g > 0.272 + k * 0.02); }); }
    // the string
    var hsS = sceneC ? Math.max(holdString(t), win(t, tTie0 + 0.4, tTie1 + 0.1, 0.05) * 0) : 0, tied = sceneC && t > tTie0 + 0.5 && t < tUntie1;
    var anc = stringAnchor(t);
    vis(knot, tied); knot.setAttribute("cx", anc[0].toFixed(1)); knot.setAttribute("cy", anc[1].toFixed(1));
    if (tied && hsS > 0.3) {
      var hnd = [(JS.haR[0] + JS.haL[0]) / 2, (JS.haR[1] + JS.haL[1]) / 2], taut = Math.max(0, pullOf(t)), sag = (1 - taut) * 26;
      var mx = (hnd[0] + anc[0]) / 2, my = (hnd[1] + anc[1]) / 2 + sag;
      var d = "M " + U.pt(hnd) + " Q " + mx.toFixed(1) + " " + my.toFixed(1) + " " + U.pt(anc);
      strG.setAttribute("d", d); strInk.setAttribute("d", d);
    } else if (tied) {
      var unt = win(t, tUntie0, tUntie1 + 0.1, 0.3, 0.2), d2;
      if (t > tLetGo && unt < 0.5) {                                                         // let go: the string lies in the grass
        var fall = U.smooth(clamp((t - tLetGo) / 0.35, 0, 1)), ex = lerp(anc[0] - 140, anc[0] - 160, fall), ey = lerp(anc[1] + 20, G0 + 4, fall);
        d2 = "M " + U.pt(anc) + " Q " + (anc[0] - 14).toFixed(1) + " " + lerp(anc[1] + 30, G0 + 2, fall).toFixed(1) + " " + ex.toFixed(1) + " " + ey.toFixed(1);
      } else if (unt >= 0.5) d2 = "M " + U.pt(anc) + " Q " + ((anc[0] + JS.haR[0]) / 2).toFixed(1) + " " + (Math.max(anc[1], JS.haR[1]) + 8).toFixed(1) + " " + U.pt(JS.haR);
      else d2 = "M " + U.pt(anc) + " q 6 10 2 22";
      strG.setAttribute("d", d2); strInk.setAttribute("d", d2);
    } else { strG.setAttribute("d", ""); strInk.setAttribute("d", ""); }
    // two fingers: a V pointing back at his eyes, then at the tree
    var vv = sceneC ? (JS._v || 0) : 0;
    if (vv > 0.5) {
      var h = JS.haR, dir = JS._vAt === "eyes" ? (function () { var dx = hs[0] + f * RS.HR * 0.42 - h[0], dy = hs[1] - RS.HR * 0.1 - h[1], dl = Math.hypot(dx, dy) || 1; return [dx / dl, dy / dl]; })() : (function () { var tt = tree.tip(g), dx = tt[0] - h[0], dy = tt[1] - h[1], dl = Math.hypot(dx, dy) || 1; return [dx / dl, dy / dl]; })();
      var px = -dir[1], py = dir[0], L1 = JS._vAt === "eyes" ? 30 : 34, sp = 0.36;
      vfing.setAttribute("d", "M " + U.pt(h) + " L " + (h[0] + (dir[0] + px * sp) * L1).toFixed(1) + " " + (h[1] + (dir[1] + py * sp) * L1).toFixed(1) +
        " M " + U.pt(h) + " L " + (h[0] + (dir[0] - px * sp) * L1).toFixed(1) + " " + (h[1] + (dir[1] - py * sp) * L1).toFixed(1));
      vfing.setAttribute("stroke-width", (7.4 * Math.pow(c[2], -0.6)).toFixed(2));
    } else vfing.setAttribute("d", "");
    // cartoon marks
    var ln = null;
    if (t > tPipGrab && t < tPipGrab + 0.45) ln = { x: hs[0], y: hs[1], r: RS.HR * 1.5, n: 6, amp: 18 };
    if (t > w("l8", 3).t0 && t < w("l8", 3).t0 + 0.5) ln = { x: hs[0], y: hs[1], r: RS.HR * 1.5, n: 6, amp: 18 };
    if (t > CYC[2][1] && t < CYC[2][1] + 0.45) ln = { x: hs[0], y: hs[1], r: RS.HR * 1.5, n: 7, amp: 22 };
    if (t > tCrack && t < tCrack + 0.5) ln = { x: hs[0], y: hs[1], r: RS.HR * 1.5, n: 7, amp: 22 };
    if (t > tTick + 0.05 && t < tTick + 0.5) ln = { x: hs[0], y: hs[1], r: RS.HR * 1.5, n: 7, amp: 22 };
    var tp = tree.tip(g), spk = null;
    GROW.forEach(function (gr) { if (t > gr[0] && t < gr[0] + 0.6) spk = { x: tp[0] + 20, y: tp[1] - 10, k: (t - gr[0]) / 0.6, s: 0.9 }; });
    if (t > tTick && t < tTick + 0.6) spk = { x: tp[0] + 18, y: tp[1] - 8, k: (t - tTick) / 0.6, s: 0.9 };
    if (t > w("l4", 4).t0 && t < w("l4", 4).t0 + 0.6 && sceneA) spk = { x: JS.haR[0] + 22, y: JS.haR[1] - 30, k: (t - w("l4", 4).t0) / 0.6, s: 1.0 };
    fx.set({
      lines: ln,
      anger: t > tPipHead + 0.3 && t < tPipOff ? { x: hs[0] - f * RS.HR * 0.6, y: hs[1] - RS.HR * 0.7, k: 1 } : null,
      sweat: t > tCrack + 0.2 && t < tLetGo + 0.6 ? { x: hs[0] - f * RS.HR * 0.75, y: hs[1] - RS.HR * 0.3, k: ramp(t, tCrack + 0.2, tLetGo + 0.6) } : null,
      puff: t > tCrack && t < tCrack + 0.7 ? { x: TX, y: G0 - 24, k: (t - tCrack) / 0.7, s: 0.45 } : (sceneA && t > tPlant + 0.35 && t < tPlant + 0.9 ? { x: XT, y: G0 - 2, k: (t - tPlant - 0.35) / 0.55, s: 0.35 } : null),
      sparkle: spk,
      twitch: t > CYC[2][1] + 0.7 && t < CYC[2][1] + 1.3 ? { x: hs[0] + f * RS.HR * 0.2, y: hs[1] + 4, k: 1 } : null
    }, t);
    footage(t);
    tfx.update(t);
    cards.update(t);
    var cp = clamp((t - tCard0) / (tCard1 - tCard0), 0, 1);
    hMin.setAttribute("d", "M 0 0 L " + (Math.sin(cp * 6.283 * 1) * 40).toFixed(1) + " " + (-Math.cos(cp * 6.283 * 1) * 40).toFixed(1));
    hHr.setAttribute("d", "M 0 0 L " + (Math.sin(cp * 6.283 / 12 + 1.0) * 26).toFixed(1) + " " + (-Math.cos(cp * 6.283 / 12 + 1.0) * 26).toFixed(1));
  }
  window.__film = { MSA: MSA, MSB: MSB, MSC: MSC, ML: ML, RS: RS, RL: RL, cam: cam, resolve: resolve, jointsSam: jointsSam, jointsLayla: jointsLayla, tree: tree, gOf: gOf,
    beats: { tRip: tRip, tCr1: tCr1, tCr2: tCr2, tPipIn: tPipIn, tUpA: tUpA, tPlant: tPlant, tRec: tRec, tTip0: tTip0, tTip1: tTip1, tCard0: tCard0, tCard1: tCard1,
      tIn: tIn, tOut: tOut, tM: tM, T0: T0, CYC: CYC, tTie0: tTie0, tBack0: tBack0, tPull: tPull, tYank: tYank, tCrack: tCrack, tLetGo: tLetGo, tFwd0: tFwd0,
      tUntie0: tUntie0, tStandL: tStandL, tPack0: tPack0, tFold0: tFold0, tTurnL: tTurnL, tWalkL: tWalkL, tEyes: tEyes, tPointT: tPointT, tBlink: tBlink, tTick: tTick, tSnap: tSnap, DUR: DUR } };
  window.__timelines = window.__timelines || {};
  window.__timelines["main"] = SF.timeline(DUR, render);
})();
