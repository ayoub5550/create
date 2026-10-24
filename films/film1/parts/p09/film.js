/* Sam & Layla Ep. 1 — P09 "The payoff" (~55 s). Built on the reference part p01 (same rigs, camera/resolve, emanata, score).
 * Beat sheet: OPEN dawn -> day: EWS push-in on the yard, the young tree, Sam asleep on the grass under Layla's blanket, Pip
 * on the rock; CU: a leaf on his face flutters with every snore -> WS: Layla walks in with two steaming mugs, her scarf
 * ENORMOUS (three wraps round her neck, trailing on the grass) "Good morning, Sam." -> he springs up stiff as a board, the
 * leaf flutters down, "I wasn't sleeping!" -> MCU "resting my eyes" -> MCU Layla "For eight hours." -> two-shot: the mug
 * hand-off (clink) -> low two-shot: he looks up... and up: the tree is taller than him, "Whoa." -> POV tilt up the tree ->
 * CU "...without me." -> "Mostly because you were asleep" (he sips, indignant) -> "I want apples. NOW!" (stomp, coffee
 * slops) -> MCU Layla, sly: "Look! A bird!" points AWAY from the tree (Pip on the rock) -> cutaway Pip -> WS: "Where?!"
 * he spins round to the bird; behind his back the tree rumbles and BOOMS into a full apple tree (leaves burst, Pip flees,
 * apples pop out), an apple drops and BONKS him (mug drops) -> MS dazed, stars, more apples rain, one more bonk -> CU
 * "It... grew." -> WS "It grew!" hops for joy (theme) -> MCU Layla's one big smile "Told you. It just needed time." -> MS
 * crunch, "Next up: a whole forest!" arms wide -> CU "...How long?" -> CU Layla "Years." (music stops) -> CU frozen ->
 * WS he faints backwards stiff as a board (THUD, dust), crickets, Pip lands on his foot and chirps.
 * Beat times derive from the dialogue timeline; score.py uses the same formulas. Everything is a pure function of t. */
(function () {
  "use strict";
  var SF = window.StickFilm, U = SF.u, el = U.el, ramp = U.ramp, clamp = U.clamp, lerp = U.lerp;
  var DATA = window.FILM_DATA, CAST = window.FILM_CAST.characters, SHOTS = window.FILM_SHOTS.shots;
  var CL = Object.assign({ stand: SF.standClip() }, window.FILM_CLIPS || {});
  var K = Kit.lines(DATA), L = K.L, w = K.w, F = Kit.FACE, bump = Kit.bump;
  var DUR = DATA.total, G0 = 820, INK = "#2b2a28";
  function env(t, t0, t1, e, eo) { e = e || 0.25; eo = eo == null ? e : eo; return ramp(t, t0, t0 + e) * (1 - ramp(t, t1 - eo, t1)); }

  // ---------- beats (same formulas in score.py) ----------
  var tWalk0 = 1.7, tArrive = L.l1.end - 0.1;                      // Layla walks in (hidden in the EWS), stops at her mark
  var tJolt = L.l2.start - 0.3;                                   // he springs up stiff as a board
  var tOffer = w("l3", 2).t0 - 0.15, tGive = L.l3.end + 0.2;      // the mug hand-off (clink at tGive)
  var tNotice = L.l4.start - 0.3;                                 // he looks up... and up
  var tSip = L.l5.start + 0.15;                                   // sips while she teases
  var tNow = w("l6", -1).t0;                                      // "NOW!" stomp
  var tPoint = w("l7", 2).t0 - 0.15;                              // "Look!" she points away from the tree
  var tTurn = L.l8.start - 0.15;                                  // "Where?!" he spins round to the bird
  var tRum0 = L.l8.end - 0.3, tGrow0 = tRum0 + 0.6, tGrow1 = tGrow0 + 1.2;   // rumble -> BOOM (g 0.62 -> 1) -> apples
  var tDrop = tGrow1 + 0.7, tBonk = tDrop + 0.3, tCatch = tBonk + 0.45;      // the apple drops and BONKS him
  var tR1 = tBonk + 0.6, tR2 = tBonk + 1.0, tBonk2 = tBonk + 1.45, tR4 = tBonk + 1.9;   // more apples rain down
  var tShake = L.l9.end + 0.2, tRealize = L.l10.start - 0.55;     // shakes off the daze -> realizes
  var tJump = L.l10.start - 0.1;                                  // three hops for joy (theme)
  var tBite = L.l12.start - 0.75, tCrunch = tBite + 0.3;          // bites the apple
  var tWide = w("l12", -1).t0 - 0.2;                              // "...a whole forest!" arms wide
  var tShock = L.l14.end + 0.15;                                  // frozen take
  var tWS = L.l14.end + 1.65, tFaint = tWS + 0.25, tLand = tFaint + 0.5;    // faints stiff as a board, THUD
  var tPipIn = tLand + 0.6, tPipLand = tPipIn + 0.9;              // Pip lands on his foot, chirps
  if (tPipLand + 1.2 > DUR) console.warn("p09: scene.json tail too short for the ending");

  // ---------- staging: Sam left of the tree (faces right), Layla right of it (faces left), Pip on the rock ----------
  var MX = 1000, TX = MX - 16, XS = 840, XL = 1080;
  var segS = [
    { t0: 0, t1: tTurn, clip: "stand", hold: 0 },
    { t0: tTurn, t1: tJump + 0.19, clip: "stand", hold: 0, f: -1, blend: 0.12 },
    { t0: tJump + 0.19, t1: DUR + 1, clip: "stand", hold: 0, f: 1, blend: 0.12 }
  ];
  var segL = [
    { t0: 0, t1: tArrive, clip: "walk", loop: true, f: -1 },
    { t0: tArrive, t1: DUR + 1, clip: "stand", hold: 0, f: -1, blend: 0.35 }
  ];
  var LS = CAST.sam.look, LL = CAST.layla.look;
  var MS = SF.motion({ clips: CL, scale: LS.scale, ground: G0, segments: segS, anchor: { seg: 0, x: XS, edge: "start" } });
  var ML = SF.motion({ clips: CL, scale: LL.scale, ground: G0, segments: segL, anchor: { seg: 1, x: XL, edge: "start" } });

  // ---------- acting ----------
  var CS = DATA.chars.sam, CY = DATA.chars.layla;
  var P = {   // custom arm poses (CMU units, joint -> [anchor, dx, dy]; dx follows the facing)
    rest: { elR: ["neck", -2, 80], haR: ["neck", 2, 136], elL: ["neck", 4, 80], haL: ["neck", 6, 136] },
    holdR: { elR: ["neck", 12, 76], haR: ["neck", 58, 50] }, holdL: { elL: ["neck", -4, 82], haL: ["neck", 18, 112] },
    offer: { elR: ["neck", 62, 40], haR: ["neck", 122, 34] },
    sip: { elR: ["neck", 46, 40], haR: ["neck", 66, -28] },
    pointUp: { elR: ["neck", 74, 6], haR: ["neck", 132, 14] },
    pointL: { elL: ["neck", 78, -3], haL: ["neck", 135, -11] },
    fists: { elR: ["neck", 18, 76], haR: ["neck", 34, 128], elL: ["neck", -14, 76], haL: ["neck", -26, 128] },
    catch: { elR: ["neck", 30, 74], haR: ["neck", 80, 50] },
    wide: { elR: ["neck", 70, 28], haR: ["neck", 128, 4], elL: ["neck", -70, 28], haL: ["neck", -128, 4] },
    hug: { elR: ["neck", 40, 62], haR: ["neck", 30, 40] }
  };
  function pose(M, J, name, wt) { if (wt > 0.001) M.pose(J, P[name], Math.min(1, wt)); }

  var SAM_ACT = [
    { g: "stop", t0: L.l2.start + 0.05, t1: w("l2", 3).t0 + 0.1, ease: 0.15 },                 // "I wasn't sleeping!"
    { g: "handChest", t0: w("l2", 3).t0 - 0.05, t1: L.l2.end + 0.3, ease: 0.25 },             // "...resting my eyes."
    { g: "shrug", t0: L.l6.start - 0.1, t1: w("l6", 4).t0, ease: 0.2 },                       // "where are the apples?"
    { g: "raise1", t0: L.l12.start + 0.4, t1: w("l12", 3).t0 + 0.1, ease: 0.2 }               // "Next up:"
  ];
  var SAM_BEATS = CS.beats.filter(function (b) { return (b > tGive + 0.3) && (b < w("l6", 4).t0 - 0.3 || b > L.l6.end) && (b < L.l12.start - 0.2 || b > L.l12.end); });
  var LAYLA_ACT = [
    { g: "explain", t0: w("l5", 1).t0 - 0.2, t1: L.l5.end + 0.2, amp: 0.7 },                  // "Mostly because..."
    { g: "point", t0: tPoint, t1: L.l7.end + 0.35, ease: 0.15, easeOut: 0.3, amp: 0 }                 // "Look! A bird!"
  ];
  var DAZED = [0.25, 0.65, 0.55], SHEEP = [0.55, 0.5, 0.6], LSMILE = [0.9, 0.3, 0.92];
  var EX_S = Kit.expr([[0, [0.3, 0.1, 0.6]], [tJolt - 0.32, F.shock, 0.06], [L.l2.start + 0.25, F.indig, 0.2], [w("l2", 3).t0 - 0.1, SHEEP, 0.3],
    [L.l3.start, F.huh, 0.3], [tGive, F.happy, 0.25], [tNotice + 0.1, F.wow, 0.3], [w("l4", 3).t0 - 0.12, F.sad, 0.25],
    [L.l5.start + 0.1, F.listen, 0.3], [w("l5", 4).t0, F.indig, 0.15], [L.l6.start - 0.05, F.ask, 0.2], [w("l6", 4).t0 - 0.05, F.angry, 0.15],
    [L.l7.start, F.huh, 0.3], [tPoint + 0.2, F.excited, 0.15], [tGrow0 + 0.3, F.sad, 0.3], [tBonk, F.shock, 0.05], [tBonk + 0.3, DAZED, 0.3],
    [tRealize, F.wow, 0.2], [L.l10.start, F.excited, 0.15], [tBite - 0.1, F.happy, 0.2], [L.l12.start, F.excited, 0.2],
    [L.l13.start - 0.25, F.hope2, 0.25], [w("l14", 0).t0 + 0.1, [-0.4, 1.2, 1.3], 0.1], [tFaint, [-0.5, 1.1, 1.25], 0.15]]);
  var EX_L = Kit.expr([[0, F.calm], [L.l2.start + 0.2, [0.1, 0.35, 0.85], 0.3], [L.l3.start - 0.15, F.dead, 0.25], [tGive + 0.2, F.calm, 0.4],
    [L.l5.start - 0.1, [0.3, -0.2, 0.85], 0.25], [L.l6.start + 0.2, F.calm, 0.4], [tNow, F.dead, 0.15], [L.l7.start - 0.15, [0.32, -0.4, 0.8], 0.25],
    [tGrow0, F.calm, 0.4], [tBonk, [0.15, 0.55, 1.05], 0.1], [tBonk + 0.8, F.dead, 0.4], [L.l10.start, F.calm, 0.4],
    [L.l11.start - 0.2, LSMILE, 0.35], [L.l11.end + 0.7, F.calm, 0.5], [tWide + 0.2, [0.1, 0.45, 1.0], 0.3], [L.l14.start - 0.5, F.dead, 0.3],
    [tLand + 0.2, [0.05, 0.45, 0.95], 0.2], [tLand + 1.4, F.dead, 0.5]]);
  var lipS = Talk.mouth(CS.mouth), lipL = Talk.mouth(CY.mouth);
  function mouthS(t) {
    if (t < tJolt) return "X";
    if (t > tCrunch && t < L.l12.start - 0.05) return Math.floor((t - tCrunch) / 0.12) % 2 ? "B" : "A";   // chewing
    if (t > tShock - 0.1 && t < tFaint) return "E";                                                     // frozen "o"
    if (t > tFaint) return "E";
    return lipS(t);
  }
  var BLINK_S = [[0, tJolt - 0.32], [tBonk + 0.02, 0.18], [tBonk2, 0.2], [tLand, DUR]].concat(CS.blinks.filter(function (b) {
    var b0 = b[0] != null ? b[0] : b; return b0 > tJolt + 0.6 && Math.abs(b0 - tBonk) > 0.5 && (b0 < tBonk + 0.4 || b0 > tRealize) && b0 < tShock; }));
  var tSlow = w("l14", 0).t0 - 0.5;
  var BLINK_L = CY.blinks.filter(function (b) { var b0 = b[0] != null ? b[0] : b; return Math.abs(b0 - tSlow) > 0.7 && Math.abs(b0 - (tLand + 0.9)) > 0.7; })
    .concat([[tSlow, 0.4], [tLand + 0.9, 0.45]]);

  // Sam's whole-body rotation about his feet (stiff as a board): asleep (-83 deg) -> springs up -> ... -> faints (-83 deg)
  var LIE = -57;   // propped stiff against the rock like a plank (his head rests on it: no overlap with the rock)
  function samRot(t) {
    if (t < tJolt) return LIE - 3 * ramp(t, tJolt - 0.3, tJolt - 0.05) + Math.sin(t * 70) * 1.6 * env(t, tJolt - 0.32, tJolt, 0.05);   // eyes pop, a tremble, a dip
    if (t < tFaint) { var p = clamp((t - tJolt) / 0.36, 0, 1); return LIE * (1 - U.easeOutBack(p)); }
    if (t < tLand) { var q = (t - tFaint) / (tLand - tFaint); return LIE * q * q; }                    // gravity
    return LIE + 9 * bump(t, tLand, 0.22) + 3 * bump(t, tLand + 0.22, 0.14);                        // bounce
  }
  function lying(t) { return t < tJolt || t > tFaint; }

  function jointsSam(t, raw) {
    var J = MS.joints(t), f = J._f || 1, asleep = t < tJolt, fainted = t > tFaint;
    Talk.idle(J, t, "sam", { amp: asleep || fainted ? 0.2 : 1.1 });
    if (raw) return J;
    Talk.act(MS, J, t, SAM_ACT);
    Talk.beats(MS, J, t, SAM_BEATS, { amp: CS.gesture });
    Talk.accents(J, t, CS.accents, 2.6);
    Talk.nods(J, t, CS.nods, 4.5);
    // asleep / jolt / faint: stiff, arms at the sides
    var stiff = asleep ? 1 : (1 - ramp(t, tJolt + 0.25, tJolt + 0.6)) + ramp(t, tShock + 0.6, tFaint);
    pose(MS, J, "rest", stiff);
    if (asleep) { var sn = snoreK(t); J.chest[1] -= sn * 3; J.head[1] -= sn * 2; }
    // the mug: received at tGive, held at the chest, dropped at the BONK
    var hasMug = t > tGive - 0.25 && t < tBonk;
    pose(MS, J, "offer", env(t, tOffer + 0.2, tGive + 0.25, 0.3)); Kit.lean(MS, J, 16, 0, env(t, tOffer + 0.2, tGive + 0.3, 0.3));
    pose(MS, J, "holdR", hasMug ? ramp(t, tGive, tGive + 0.35) : 0);
    pose(MS, J, "sip", env(t, tSip, tSip + 0.9, 0.25));
    pose(MS, J, "fists", env(t, w("l6", 4).t0 - 0.1, L.l6.end + 0.4, 0.15));
    pose(MS, J, "pointL", env(t, tTurn + 0.05, tGrow0 + 0.5, 0.15, 0.4));
    // looks up... and up (two steps), leans back
    var up = 0.5 * env(t, tNotice, L.l4.end - 0.2, 0.3) + 0.5 * env(t, w("l4", 1).t0 - 0.2, w("l4", 3).t0 - 0.1, 0.3);
    J.head[0] -= f * up * 9; J.head[1] -= up * 4; Kit.lean(MS, J, -10, 0, up);
    // stomp on "NOW!": up on the toes, then SLAM
    var st = bump(t, tNow - 0.28, 0.28); Kit.hop(J, st * 26);
    var slam = bump(t, tNow, 0.3); Kit.crouch(MS, J, slam * 0.35, { hands: 0 });
    // spins round to the bird: a little eager hop, leans in
    Kit.hop(J, bump(t, tTurn, 0.3) * 18); Kit.lean(MS, J, 10, 2, env(t, tTurn + 0.1, tGrow0 + 0.4, 0.2));
    // BONK: head knocked down, knees buckle a little, a dazed sway
    var bk = bump(t, tBonk, 0.3) + 0.7 * bump(t, tBonk2, 0.28);
    J.head[1] += bk * 10; Kit.crouch(MS, J, bk * 0.25, { hands: 0 });
    var daze = env(t, tBonk + 0.1, tShake + 0.2, 0.3);
    var sway = Math.sin((t - tBonk) * 3.2) * daze; ["head", "neck", "chest"].forEach(function (j, k) { J[j][0] += sway * (9 - k * 3); });
    pose(MS, J, "catch", env(t, tBonk + 0.05, L.l10.start - 0.2, 0.2, 0.3) * 0.9);
    J.head[0] += Math.sin((t - tShake) * 38) * 7 * env(t, tShake, tShake + 0.5, 0.08);           // brrr: shakes off the daze
    // three hops for joy, arms up
    var hop = 0; for (var k = 0; k < 3; k++) hop = Math.max(hop, bump(t, tJump + k * 0.38, 0.36) * (44 - k * 8));
    Kit.hop(J, hop); Talk.act(MS, J, t, [{ g: "celebrate", t0: tJump - 0.05, t1: L.l10.end + 0.45, ease: 0.15 }]);
    // bites the apple, chews; arms wide on "forest"; leans in hopeful on "How long?"
    pose(MS, J, "sip", env(t, tBite, tCrunch + 0.25, 0.22));
    pose(MS, J, "hug", env(t, tCrunch + 0.2, tWide + 0.05, 0.25) * 0.8);
    pose(MS, J, "wide", env(t, tWide, L.l12.end + 0.5, 0.15, 0.3));
    pose(MS, J, "hug", env(t, L.l13.start - 0.3, tShock + 0.7, 0.3));
    Kit.lean(MS, J, 12, 3, env(t, L.l13.start - 0.25, tShock + 0.1, 0.3, 0.1));
    var sh = ramp(t, w("l14", 0).t0 + 0.1, w("l14", 0).t0 + 0.2); J.head[1] += sh * 3;
    return J;
  }
  function jointsLayla(t) {
    var J = ML.joints(t), f = J._f || 1, walking = t < tArrive;
    Talk.idle(J, t, "layla", { amp: walking ? 0.3 : 0.9 });
    pose(ML, J, "holdR", 1 - ramp(t, tOffer - 0.1, tOffer + 0.2) * (1 - ramp(t, tGive + 0.3, tGive + 0.7)) - ramp(t, tGive + 0.3, tGive + 0.7));
    pose(ML, J, "holdL", 1);
    pose(ML, J, "offer", env(t, tOffer, tGive + 0.35, 0.3)); Kit.lean(ML, J, 18, 0, env(t, tOffer, tGive + 0.35, 0.3));
    Talk.act(ML, J, t, LAYLA_ACT);
    pose(ML, J, "pointUp", env(t, tPoint, L.l7.end + 0.35, 0.15, 0.3));                          // above the scarf wraps
    Talk.beats(ML, J, t, CY.beats.filter(function (b) { return b < tPoint - 0.3 || b > L.l7.end; }), { amp: CY.gesture * 0.8 });
    Talk.accents(J, t, CY.accents, 2.0);
    Talk.nods(J, t, CY.nods, 4.5);
    var tilt = env(t, L.l11.start - 0.2, L.l11.end + 0.5, 0.4);                                 // the smile: a warm head tilt
    J.head[0] -= f * tilt * 3; J.head[1] += tilt * 2;
    var dead = ramp(t, w("l14", 0).t0 - 0.4, w("l14", 0).t0 - 0.1) * (1 - ramp(t, tLand, tLand + 0.4)); J.head[1] += dead * 2;
    var look = env(t, tLand + 0.1, DUR + 2, 0.4); J.head[1] += look * 4; J.head[0] += f * look * 3;   // looks down at him
    return J;
  }
  // a snore cycle (2.4 s): 0..1 on the inhale (chest rises, the leaf lifts)
  var SNORE = 2.4, SN0 = 0.2;
  function snoreK(t) { var p = ((t - SN0) % SNORE + SNORE) % SNORE / SNORE; return p < 0.45 ? Math.sin(Math.PI * p / 0.45) : 0; }

  // ---------- world ----------
  var back = document.getElementById("back"), props = document.getElementById("props"), figG = document.getElementById("fig");
  var front = document.getElementById("front"), camG = document.getElementById("cam");
  var Y = FilmSet.yard({ G0: G0, ref: [1040, 560, 1.25], season: "summer", garden: { x: MX },
    look: function (t) { return t < 3 ? ["dawn", "day", ramp(t, 0, 3)] : "day"; } });
  var rock = Props.rock(back, 610, G0);
  var bh = Kit.birdhouse(back, 1640, G0);
  var mound = Props.mound(props, MX, G0);
  var tree = Props.tree(props, TX, G0 - 26);
  var groundApples = el("g", {}, props);
  var pip = Props.pip(props);

  // Layla's scarf tail (behind her), her rig, the wraps (in front), her mug
  var gL = el("g", {}, figG);
  var scarfTail = mkScarf(gL, 22);
  var mugL = Props.mug(gL);   // her own mug, in the far hand (behind her body)
  var RL = SF.rig(gL, { scale: LL.scale, head: LL.head, ink: LL.ink, color: LL.color, accessories: LL.accessories, backInk: "#5a5751",
    expr: EX_L, blinks: BLINK_L, mouth: lipL, mouthFill: "#8e352d", lineComp: 0.6, seed: 2 });
  var wraps = [0, 1, 2].map(function () { return mkScarf(gL, 20); });
  var armOver = el("path", { fill: "none", stroke: INK, "stroke-linecap": "round", "stroke-linejoin": "round" }, gL);   // pointing arm over the wraps
  var fringe = el("path", { stroke: "#c4453b", "stroke-width": 3.5, fill: "none", "stroke-linecap": "round" }, gL);
  var spill = el("ellipse", { cy: G0 - 2, ry: 6, fill: "#7a4a2a", stroke: INK, "stroke-width": 2, visibility: "hidden" }, front), mugWrap = el("g", {}, front), mugGive = Props.mug(mugWrap);

  // Sam: blanket (stays on the ground), his rig (rotates about his feet), his mug, the leaf, the apple
  var blanket = el("g", {}, figG);
  var gS = el("g", {}, figG);
  var RS = SF.rig(gS, { scale: LS.scale, head: LS.head, ink: LS.ink, color: LS.color, accessories: LS.accessories, backInk: "#5a5751",
    expr: EX_S, blinks: BLINK_S, mouth: mouthS, mouthFill: "#8e352d", lineComp: 0.6, seed: 1 });
  var blanketTop = el("g", {}, figG);
  var leaf = el("path", { d: "M 0 0 C 8 -10, 24 -10, 30 0 C 24 8, 8 8, 0 0 Z M 0 0 L 30 0", fill: "#8cc265", stroke: INK, "stroke-width": 2.5, "stroke-linejoin": "round" }, figG);
  var apple = Props.apple(figG), rain = [0, 1, 2, 3].map(function () { return Props.apple(props); });
  var crumbs = [0, 1, 2, 3].map(function () { return el("circle", { r: 3.5, fill: "#f6efd8", stroke: INK, "stroke-width": 1.2 }, figG); });
  var drops = [0, 1, 2].map(function () { return el("circle", { r: 5, fill: "#7a4a2a", stroke: INK, "stroke-width": 1.5 }, figG); });
  var leavesG = el("g", {}, front), LEAVES = [];
  for (var li = 0; li < 18; li++) LEAVES.push(el("path", { d: li % 2 ? "M 0 0 C 8 -10, 24 -10, 30 0 C 24 8, 8 8, 0 0 Z" : "M 0 0 C 7 -8, 20 -9, 26 0 C 20 7, 7 7, 0 0 Z", fill: li % 3 ? "#8cc265" : "#74b04f", stroke: INK, "stroke-width": 2.2 }, leavesG));
  var fx = Kit.emanata(front), fx2 = Kit.emanata(front);
  var smear = [0, 1, 2].map(function () { return el("path", { fill: "none", stroke: INK, "stroke-width": 4, "stroke-linecap": "round" }, front); });

  // the blanket: a patchwork quilt drawn in Sam's STANDING frame (body vertical), rotated to lie on the grass
  (function drawBlanket() {
    var x0 = XS - 34, x1 = XS + 26, yT = G0 - 215, yB = G0 - 22;   // standing frame: +x (front) ends up on top, -x on the grass
    var outline = Ink.path([[x0, yT + 10], [XS - 6, yT - 4], [x1 + 2, yT + 4], [x1 + 10, yT + 40], [x1 + 4, yT + 95], [x1 + 12, yT + 130],
      [x1 + 18, yB - 30], [x1 + 26, yB - 6], [x1 + 14, yB + 4], [x0 - 4, yB + 8], [x0 - 12, yB - 60], [x0 - 8, yT + 70]], { wobble: 0.9, step: 12, seed: 61 }) + " Z";
    el("path", { d: outline, fill: "#e9c46a", stroke: INK, "stroke-width": 4.5, "stroke-linejoin": "round" }, blanket);
    [0.3, 0.62].forEach(function (q, k) {
      var y = lerp(yT, yB, q); el("path", { d: Ink.path([[x0 - 2, y], [x1 + 2, y + 3]], { wobble: 0.6, step: 10, seed: 62 + k }), stroke: "#c4453b", "stroke-width": 6, fill: "none", "stroke-linecap": "round" }, blanket);
    });
    el("path", { d: Ink.path([[XS + 6, yT + 4], [XS + 8, yB - 4]], { wobble: 0.6, step: 12, seed: 66 }), stroke: "#2f7f8f", "stroke-width": 5, fill: "none", "stroke-dasharray": "10 9" }, blanket);
    el("path", { d: Ink.path([[x0 + 4, yT + 2], [x1 - 4, yT + 6]], { wobble: 0.5, step: 10, seed: 67 }), stroke: "#fff4d6", "stroke-width": 9, fill: "none", "stroke-linecap": "round" }, blanket);
  })();
  blanketTop.appendChild(blanket);   // over Sam while he sleeps (the rig draws under it)

  // a striped scarf strand (teal with red stripes, inked), like Props.knitting
  function mkScarf(parent, wd) {
    var g = el("g", {}, parent);
    var a = el("path", { fill: "none", stroke: INK, "stroke-width": wd + 6, "stroke-linecap": "round", "stroke-linejoin": "round" }, g);
    var b = el("path", { fill: "none", stroke: "#2f7f8f", "stroke-width": wd, "stroke-linecap": "butt", "stroke-linejoin": "round" }, g);
    var c = el("path", { fill: "none", stroke: "#c4453b", "stroke-width": wd, "stroke-linecap": "butt", "stroke-linejoin": "round", "stroke-dasharray": "14 14" }, g);
    return { g: g, set: function (d) { a.setAttribute("d", d); b.setAttribute("d", d); c.setAttribute("d", d); } };
  }
  // Layla's ENORMOUS scarf (len 520): three fat wraps round the neck + a tail down her back, trailing on the grass
  function setScarf(J, t) {
    var f = J._f || 1, HR = RL.HR || 32, hx = J.head[0], hy = J.head[1] - HR * 0.32, nx = J.neck[0], ny = hy + HR * 1.02;
    for (var k = 0; k < 3; k++) {
      var yy = ny + k * 13, rw = HR * (0.95 + 0.06 * k), x0 = lerp(hx, nx, 0.5);
      wraps[k].set(Ink.path([[x0 - rw, yy - 3], [x0 - rw * 0.4, yy + 5], [x0 + rw * 0.4, yy + 5], [x0 + rw, yy - 3]], { wobble: 0.5, step: 8, seed: 80 + k }));
    }
    var walking = t < tArrive, sw = Math.sin(t * 6) * (walking ? 6 : 1.5);
    var bx = nx - f * HR * 0.55, by = ny + 16, gx = J.hips[0] - f * 36, pts = [[bx, by], [bx - f * 14, by + 70], [gx - f * 6, G0 - 40 + sw * 0.3], [gx - f * 40, G0 - 12]];
    var trail = 230;   // on the grass behind her, in loose folds
    for (var q = 1; q <= 5; q++) pts.push([gx - f * (40 + trail * q / 5), G0 - 12 - (q % 2 ? 6 : 0) + Math.sin(t * 5 + q) * (walking ? 3 : 0.8)]);
    scarfTail.set(Ink.path(pts, { wobble: 0.6, step: 12, seed: 84 }));
    var ex = pts[pts.length - 1][0], fx_ = -f;
    var d = ""; for (var r = 0; r < 5; r++) d += "M " + (ex + fx_ * 8).toFixed(1) + " " + (G0 - 22 + r * 5).toFixed(1) + " L " + (ex + fx_ * 22).toFixed(1) + " " + (G0 - 24 + r * 6).toFixed(1) + " ";
    fringe.setAttribute("d", d);
  }

  // rotation helpers for Sam's board-stiff body
  function rotP(p, a) { var r = a * Math.PI / 180, c = Math.cos(r), s = Math.sin(r), dx = p[0] - XS, dy = p[1] - G0; return [XS + dx * c - dy * s, G0 + dx * s + dy * c]; }
  function samHead(J, t) { var HR = RS.HR, h = [J.head[0], J.head[1] - HR * 0.32]; return rotP(h, samRot(t)); }

  // Pip: on the rock (OPEN .. BOOM), flees at the BOOM, flies back in and lands on Sam's foot (end)
  var PIP_ROCK = [548, rock.top - 6], PIP_FOOT = [XS - 18, G0 - 34];
  function pipState(t) {
    var tFlee = tGrow0 + 0.15;
    if (t < tFlee) {
      var ch = 0;[1.0, 2.4, tPoint + 0.5, L.l8.start + 0.2].forEach(function (c) { if (t > c && t < c + 0.18) ch = (t - c) / 0.18; });
      var look = t < tJolt ? -1 : 1;
      return { x: PIP_ROCK[0], y: PIP_ROCK[1], f: look, t: t, pose: "perch", chirp: ch, tilt: env(t, 2.0, 3.0, 0.2) * 20 + env(t, L.l8.start, tGrow0, 0.2) * -16, seed: 3 };
    }
    if (t < tPipIn) {
      var p = clamp((t - tFlee) / 1.1, 0, 1);
      return { x: lerp(PIP_ROCK[0], 180, p), y: PIP_ROCK[1] - 420 * Math.sin(p * 1.4), f: -1, t: t, pose: "fly", hidden: p >= 1 };
    }
    if (t < tPipLand) {
      var q = U.smooth((t - tPipIn) / (tPipLand - tPipIn));
      return { x: lerp(330, PIP_FOOT[0], q), y: lerp(380, PIP_FOOT[1] - 6, q) - Math.sin(Math.PI * q) * 60, s: 1.3, f: 1, t: t, pose: "fly" };
    }
    var c2 = 0;[tPipLand + 0.35, tPipLand + 0.75].forEach(function (c) { if (t > c && t < c + 0.18) c2 = (t - c) / 0.18; });
    return { x: PIP_FOOT[0], y: PIP_FOOT[1] - 6, s: 1.3, f: 1, t: t, pose: t < tPipLand + 0.25 ? "hop" : "perch", hop: (t - tPipLand) / 0.25, chirp: c2, tilt: env(t, tPipLand + 1.0, DUR + 1, 0.2) * -20, seed: 5 };
  }

  // the tree: g 0.62 -> 1 (BOOM), apples pop out, apples fall (hidden on the tree once they drop)
  function treeG(t) { return 0.62 + 0.38 * U.smooth((t - tGrow0) / (tGrow1 - tGrow0)); }
  var BONK_A = 5, BONK_B = 0, RAIN = [[2, tR1, 0], [4, tR2, 1], [1, tR4, 2]];   // [tree apple index, drop time, rain sprite]
  function hiddenApples(t) { var h = []; if (t > tDrop) h.push(BONK_A); if (t > tBonk2 - 0.35) h.push(BONK_B); RAIN.forEach(function (r) { if (t > r[1] - 0.35) h.push(r[0]); }); return h; }
  function fallY(t, t0, y0, y1) { var d = t - t0, gpx = 2 * (y1 - y0) / (0.35 * 0.35); return Math.min(y1, y0 + 0.5 * gpx * d * d); }

  // ---------- camera ----------
  var H0 = { sam: G0 - Kit.headInfo(jointsSam(tGive, true), RS, G0).top, layla: G0 - Kit.headInfo(jointsLayla(tArrive + 1), RL, G0).top };
  function resolve(id, t) {
    if (id === "pip") return { head: [PIP_ROCK[0], PIP_ROCK[1]], top: PIP_ROCK[1] - 40, feet: PIP_ROCK[1] + 24, f: 1, h: 120 };
    var c = id === "sam" ? Kit.headInfo(jointsSam(t), RS, G0) : Kit.headInfo(jointsLayla(t), RL, G0); c.h = H0[id]; return c;
  }
  var cam = Shots.camera(SHOTS, { width: 1920, height: 1080, duration: DUR, resolve: resolve });
  var tfx = Shots.fx(document.getElementById("fxg"), [{ t: 0, type: "fadeIn", dur: 0.6 }]);

  function render(t) {
    var c = cam.apply(camG, t); Y.update(t, c);
    var JL = jointsLayla(t), JS = jointsSam(t), fS = JS._f || 1, fL = JL._f || 1;
    // Layla
    gL.setAttribute("visibility", t < tWalk0 ? "hidden" : "visible");
    RL.set(JL, t, { zoom: c[2] }); setScarf(JL, t);
    var pw = env(t, tPoint, L.l7.end + 0.35, 0.15, 0.3);
    if (pw > 0.5) {
      var sx = JL.neck[0] + fL * RL.HR * 0.7, sy = JL.neck[1] + RL.HR * 0.55, hx_ = JL.haR[0], hy_ = JL.haR[1];
      var dxp = hx_ - JL.elR[0], dyp = hy_ - JL.elR[1], ln = Math.hypot(dxp, dyp) || 1;
      armOver.setAttribute("d", "M " + sx.toFixed(1) + " " + sy.toFixed(1) + " L " + JL.elR[0].toFixed(1) + " " + JL.elR[1].toFixed(1) + " L " + hx_.toFixed(1) + " " + hy_.toFixed(1) +
        " l " + (dxp / ln * 12).toFixed(1) + " " + (dyp / ln * 12).toFixed(1));
      armOver.setAttribute("stroke-width", (13 * LL.scale * Math.pow(c[2], -0.6)).toFixed(2)); armOver.setAttribute("visibility", "visible");
    } else armOver.setAttribute("visibility", "hidden");
    var hb = JL.haL, hr = JL.haR;
    mugL.set(hb[0] + fL * 4, hb[1] - 6, 0.9, t);
    // Sam (rotating about his feet)
    var a = samRot(t);
    gS.setAttribute("transform", Math.abs(a) > 0.01 ? "rotate(" + a.toFixed(2) + " " + XS + " " + G0 + ")" : "");
    RS.set(JS, t, { zoom: c[2] });
    // the blanket: over him while asleep, left on the grass (sliding off his legs) after the jolt
    var bOff = ramp(t, tJolt, tJolt + 0.5);
    blanket.setAttribute("transform", "translate(0 " + G0 + ") scale(1 " + (1 - 0.62 * bOff).toFixed(3) + ") translate(" + (bOff * 18).toFixed(1) + " " + (-G0 + bOff * 2).toFixed(1) + ") rotate(" + lerp(LIE, -86, bOff).toFixed(1) + " " + XS + " " + G0 + ") translate(0 " + (t < tJolt ? -snoreK(t) * 2 : 0).toFixed(1) + ")");
    blanket.setAttribute("opacity", "1");
    if (t >= tJolt && blanket.parentNode !== figG) figG.insertBefore(blanket, gS);
    if (t < tJolt && blanket.parentNode !== blanketTop) blanketTop.appendChild(blanket);
    // the mug: in Layla's near hand -> Sam's hand at tGive -> dropped at the BONK (lands on the grass, steaming)
    var mp;
    var pL = [hr[0] + fL * 4, hr[1] - 6], pS = [JS.haR[0] + fS * 4, JS.haR[1] - 6], hk = U.smooth((t - (tGive - 0.15)) / 0.3);
    if (t < tBonk) mp = [lerp(pL[0], pS[0], hk), lerp(pL[1], pS[1], hk)];   // passes from her hand to his
    else {
      var md = clamp((t - tBonk) / 0.3, 0, 1), from = mugDropFrom;
      mp = [lerp(from[0], from[0] - 10, md), lerp(from[1], G0 - 14, md * md)];
    }
    mugGive.set(mp[0], mp[1], 0.9, t);
    var tip = t > tBonk + 0.3 ? -80 * U.easeOutBack(clamp((t - tBonk - 0.3) / 0.25, 0, 1)) : 0;          // tips over on impact
    mugWrap.setAttribute("transform", tip ? "rotate(" + tip.toFixed(1) + " " + mp[0].toFixed(1) + " " + (G0 - 2) + ")" : "");
    var sp_ = clamp((t - tBonk - 0.35) / 0.4, 0, 1); spill.setAttribute("visibility", sp_ > 0 ? "visible" : "hidden");
    spill.setAttribute("rx", (8 + 30 * sp_).toFixed(1)); spill.setAttribute("cx", (mp[0] - 34).toFixed(1)); mugGive.g.setAttribute("visibility", t < tWalk0 ? "hidden" : "visible");
    // leaf on his face: flutters with each snore, flies off at the jolt and see-saws down to the grass
    var hd = samHead(JS, t), HRs = RS.HR;
    if (t < tJolt) {
      var sn = snoreK(t);
      leaf.setAttribute("transform", "translate(" + (hd[0] - 14).toFixed(1) + " " + (hd[1] - HRs * 0.95 - sn * 12).toFixed(1) + ") rotate(" + (-10 + sn * 18 + Math.sin(t * 30) * sn * 8).toFixed(1) + ")");
    } else {
      var lt = t - tJolt, ly = Math.min(G0 - 8, hd0[1] - HRs * 0.95 - 120 * (1 - Math.exp(-lt * 6)) + 75 * lt), lx = hd0[0] + Math.sin(lt * 4) * 30 + lt * 12;
      leaf.setAttribute("transform", "translate(" + lx.toFixed(1) + " " + ly.toFixed(1) + ") rotate(" + (ly >= G0 - 8 ? 4 : Math.sin(lt * 4 + 1) * 35).toFixed(1) + ")");
    }
    // the tree
    var g = treeG(t), shake = t > tRum0 && t < tGrow1 + 0.3 ? (t < tGrow0 ? 2 + 3 * ramp(t, tRum0, tGrow0) : 7 * (1 - ramp(t, tGrow1 - 0.2, tGrow1 + 0.3))) : 0;
    shake += 4 * bump(t, tDrop - 0.05, 0.2);
    mound.set(t, {}); tree.set(g, t, { season: "summer", apples: ramp(t, tGrow1 - 0.05, tGrow1 + 0.55), shake: shake, hideApple: hiddenApples(t) });
    // the BONK apple: drops onto his head, bounces up, lands in his hand, bitten later
    var hsS = Kit.headInfo(JS, RS, G0), topY = hsS.top + 4;
    var a0 = tree.applePos(BONK_A, 1);
    if (t < tDrop) apple.set(0, 0, 0, 0);
    else if (t < tBonk) apple.set(lerp(a0[0], hsS.head[0], (t - tDrop) / 0.3), fallY(t, tDrop, a0[1], topY - 14), (t - tDrop) * 200, 1);
    else if (t < tCatch) {
      var pq = (t - tBonk) / (tCatch - tBonk), hx2 = JS.haR[0] + fS * 6, hy2 = JS.haR[1] - 12;
      apple.set(lerp(hsS.head[0], hx2, pq), lerp(topY - 14, hy2, pq) - Math.sin(Math.PI * pq) * 90, 160 + pq * 300, 1);
    } else {
      apple.set(JS.haR[0] + fS * 6, JS.haR[1] - 12, 0, 1, t > tCrunch);
    }
    if (lying(t) && t > tCatch) { var ap = rotP([JS.haR[0] + fS * 6, JS.haR[1] - 12], a); apple.set(ap[0], ap[1], a, 1, true); }
    // the rain of apples: two land on the grass, BONK #2, one more on the grass
    var b0 = tree.applePos(BONK_B, 1);
    var rs = [[BONK_B, tBonk2 - 0.35, 3]].concat(RAIN);
    rs.forEach(function (r) {
      var sp = rain[r[2]], tp = tree.applePos(r[0], 1), t0 = r[1];
      if (t < t0) { sp.set(0, 0, 0, 0); return; }
      if (r[2] === 3) {   // onto his head, then bounces off behind him onto the grass
        if (t < tBonk2) { sp.set(lerp(b0[0], hsS.head[0] + 6, (t - t0) / 0.35), fallY(t, t0, b0[1], topY - 14), (t - t0) * 300, 1); return; }
        var pb = clamp((t - tBonk2) / 0.5, 0, 1), xb = lerp(hsS.head[0] + 6, hsS.head[0] + 120, pb);
        sp.set(xb, lerp(topY - 14, G0 - 15, pb) - Math.sin(Math.PI * pb) * 70, 200 + pb * 200, 1); return;
      }
      var y = fallY(t, t0, tp[1], G0 - 15), land = t0 + 0.35, bo = t > land ? Math.max(0, Math.sin(Math.PI * (t - land) / 0.25)) * 18 * (t < land + 0.25 ? 1 : 0) : 0;
      sp.set(tp[0] + (t > land ? Math.min(t - land, 0.4) * 30 : 0), y - bo, (t - t0) * 240, 1);
    });
    // the bite: crumbs fly from the apple
    crumbs.forEach(function (cb, k) {
      var dc = t - tCrunch, on = dc > 0 && dc < 0.45; cb.setAttribute("visibility", on ? "visible" : "hidden"); if (!on) return;
      var ax = JS.haR[0] + fS * 6, ay = JS.haR[1] - 12, an = -1.2 + k * 0.55;
      cb.setAttribute("cx", (ax + fS * Math.cos(an) * 90 * dc).toFixed(1)); cb.setAttribute("cy", (ay + Math.sin(an) * 70 * dc + 260 * dc * dc).toFixed(1));
    });
    // coffee slops on "NOW!"
    drops.forEach(function (dp, k) {
      var ds = t - tNow, on = ds > 0 && ds < 0.5;
      dp.setAttribute("visibility", on ? "visible" : "hidden");
      if (on) { dp.setAttribute("cx", (mp[0] + fS * (k - 1) * 14 + fS * ds * 40).toFixed(1)); dp.setAttribute("cy", (mp[1] - 24 - 120 * ds + 500 * ds * ds).toFixed(1)); }
    });
    // leaves burst from the canopy at the BOOM
    var cy0 = G0 - 26 - tree.H(1) * 0.8;
    LEAVES.forEach(function (lf, k) {
      var tk = t - tGrow0 - (k % 3) * 0.12, on = tk > 0 && tk < 1.6;
      lf.setAttribute("visibility", on ? "visible" : "hidden"); if (!on) return;
      var ang = U.hash(k * 3.7) * Math.PI * 2, sp = 260 + 260 * U.hash(k * 9.1);
      var x = TX + Math.cos(ang) * sp * tk, y = cy0 + Math.sin(ang) * sp * 0.7 * tk + 260 * tk * tk;
      lf.setAttribute("transform", "translate(" + x.toFixed(1) + " " + y.toFixed(1) + ") rotate(" + (k * 40 + tk * 300).toFixed(0) + ")");
      lf.setAttribute("opacity", (1 - ramp(tk, 1.1, 1.6)).toFixed(2));
    });
    pip.set(pipState(t));
    // emanata
    var f = fS, hsx = hsS.head[0], hsy = hsS.head[1];
    fx.set({
      zzz: t < tJolt - 0.1 && t > 0.3 ? { x: hd[0] + 10, y: hd[1] - HRs * 1.4 } : null,
      lines: t > tJolt && t < tJolt + 0.45 ? { x: hsx, y: hsy, r: HRs * 1.5, n: 7, amp: 22 } :
        t > tBonk && t < tBonk + 0.35 ? { x: hsx, y: hsy - HRs * 0.6, r: HRs * 1.4, n: 7, amp: 26 } :
        t > tShock && t < tShock + 0.5 ? { x: hsx, y: hsy, r: HRs * 1.5, n: 7, amp: 22 } : null,
      stars: t > tBonk + 0.1 && t < tShake + 0.3 ? { x: hsx, y: hsy - HRs * 1.25, r: HRs * 1.5, n: t > tBonk2 ? 4 : 3 } : null,
      anger: t > w("l6", 4).t0 && t < L.l6.end + 0.4 ? { x: hsx + f * HRs * 0.7, y: hsy - HRs * 0.9, k: ramp(t, w("l6", 4).t0, w("l6", 4).t0 + 0.2) } : null,
      sparkle: t > tRealize && t < tRealize + 0.5 ? { x: hsx + f * HRs * 1.2, y: hsy - HRs * 1.1, k: (t - tRealize) / 0.5, s: 1.0 } : null,
      twitch: t > tShock + 0.45 && t < tShock + 0.95 ? { x: hsx + f * RS.HR * 0.2, y: hsy + 4, k: 1 } : null,
      sweat: t > tShock + 0.2 && t < tFaint ? { x: hsx - f * HRs * 0.75, y: hsy - HRs * 0.3, k: ramp(t, tShock + 0.2, tFaint) } : null
    }, t);
    fx2.set({
      puff: t > tNow && t < tNow + 0.6 ? { x: JS.ftR[0], y: G0 - 4, k: (t - tNow) / 0.6, s: 0.8 } :
        t > tLand && t < tLand + 0.8 ? { x: XS - 190, y: G0 - 4, k: (t - tLand) / 0.8, s: 1.5 } :
        t > tJolt + 0.1 && t < tJolt + 0.7 ? { x: XS - 120, y: G0 - 4, k: (t - tJolt - 0.1) / 0.6, s: 0.9 } : null
    }, t);
    hideKids(fx); hideKids(fx2);
    // speed arcs behind his head as he springs up (and as he falls in the faint)
    var sm = t > tJolt && t < tJolt + 0.5 ? [tJolt, 0.5] : t > tFaint && t < tLand + 0.25 ? [tFaint, tLand + 0.25 - tFaint] : null;
    smear.forEach(function (p, k) {
      if (!sm) { p.setAttribute("visibility", "hidden"); return; }
      var a1 = samRot(t), a0 = sm[0] === tJolt ? LIE : 0, rr = 250 - k * 26, n = 10, d = "";
      var lag = sm[0] === tJolt ? Math.max(a0, a1 - 60) : Math.min(a0, a1 + 60);
      for (var q = 0; q <= n; q++) { var aa = (lag + (a1 - lag) * q / n - 90) * Math.PI / 180; d += (q ? " L " : "M ") + (XS + Math.cos(aa) * rr).toFixed(1) + " " + (G0 + Math.sin(aa) * rr).toFixed(1); }
      p.setAttribute("d", d); p.setAttribute("visibility", "visible"); p.setAttribute("opacity", (0.7 * (1 - (t - sm[0]) / sm[1])).toFixed(2));
    });
    tfx.update(t);
  }
  // common/kit.js emanata: child elements set visibility="visible" (stars) override the hidden parent group, so the
  // stars stayed on screen after a bonk. Workaround: hide the children of every hidden emanata group.
  function hideKids(e) { var gr = e.g.children[2]; if (gr && gr.getAttribute("visibility") === "hidden") Array.prototype.forEach.call(gr.children, function (c) { c.setAttribute("visibility", "hidden"); }); }   // [2] = the stars group
  // constants for the props that leave a body part (seek-safe: computed once, not carried between frames)
  var hd0 = samHead(jointsSam(tJolt - 1e-3), tJolt - 1e-3);
  var mugDropFrom = (function () { var J = jointsSam(tBonk - 1e-3); return [J.haR[0] + (J._f || 1) * 4, J.haR[1] - 6]; })();
  window.__film = { MS: MS, ML: ML, RS: RS, RL: RL, cam: cam, resolve: resolve, jointsSam: jointsSam, jointsLayla: jointsLayla, bh: bh, tree: tree,
    beats: { tArrive: tArrive, tJolt: tJolt, tGive: tGive, tNow: tNow, tPoint: tPoint, tTurn: tTurn, tRum0: tRum0, tGrow0: tGrow0, tGrow1: tGrow1,
      tDrop: tDrop, tBonk: tBonk, tBonk2: tBonk2, tJump: tJump, tBite: tBite, tWide: tWide, tShock: tShock, tWS: tWS, tFaint: tFaint, tLand: tLand,
      tPipIn: tPipIn, tPipLand: tPipLand, DUR: DUR } };
  window.__timelines = window.__timelines || {};
  window.__timelines["main"] = SF.timeline(DUR, render);
})();
