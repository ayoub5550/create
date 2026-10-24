/* Sam & Layla Ep. 1 — P04 "Plan F: more sun / the one-star review / 'I'll watch it'" (~56 s). Structure follows p01.
 * Beat sheet: OPEN WS: Layla knits on her stool, Sam STRIDES in with a GIANT magnifying glass on his shoulder and
 * sunglasses -> "Plan F. More sun." MS: he holds it over the mound, a hot bright dot on the dirt, "WAY more sun" (lowers
 * it, the dot hardens) -> CU cutaway: a curl of grey smoke (tension) -> MCU Layla, eyes on her knitting: "Sam.
 * Something's smoking." -> MS: "That's the growing!" (proud) -> a tiny FLAME pops (music stops, uh-oh; his sunglasses
 * jump to his forehead) -> WS: "That is NOT the growing!" panic flapping + hops (fanning it bigger) while Layla, already
 * up, walks over with her water bottle -> CU: she pours: sizzle + steam, he freezes mid-flap -> two-shot "You almost
 * cooked it." -> MCU "...Crispy tree?" (hides the glass behind his back) -> CU Layla's flat stare (crickets; offscreen
 * thud: he drops the glass) -> MS: "Fine. Let's ask the internet." (phone out, screen glow on his face) -> MCU + PHONE
 * INSET: "how to grow a tree fast" typed letter by letter, a tap on every key -> result "Step 1: Be patient." -> CU
 * "...be patient?!" -> "One star!": bubble with 1 filled + 4 empty stars (sad trombone) -> Layla: "You're reviewing
 * nature?" -> "Nature needs feedback." (finger up) -> inset again: "Step 2: Be MORE patient." -> "Zero stars!": all empty,
 * one star falls off the bubble (slide whistle) -> "That's not a thing." -> "It is now." (pockets the phone) -> WS: he
 * stomps to the rock and sits, arms crossed -> HOLD: the staring contest (clock ticks): a fly buzzes in, Layla glances up
 * and knits on, the fly lands on his nose — he does not blink.
 * Beat times derive from the dialogue timeline; score.py uses the same formulas. Everything is a pure function of t. */
(function () {
  "use strict";
  var SF = window.StickFilm, U = SF.u, el = U.el, ramp = U.ramp, clamp = U.clamp, lerp = U.lerp;
  var DATA = window.FILM_DATA, CAST = window.FILM_CAST.characters, SHOTS = window.FILM_SHOTS.shots;
  var CL = Object.assign({ stand: SF.standClip() }, window.FILM_CLIPS || {});
  CL.stride = Object.assign({}, CL.walk, { fps: CL.walk.fps * 1.4 });           // the same walk, 1.4x: a brisk stride
  var K = Kit.lines(DATA), L = K.L, w = K.w, F = Kit.FACE, bump = Kit.bump;
  var DUR = DATA.total, G0 = 820, INK = "#2b2a28";
  function ip(pts, o) { return Ink.path(pts, Object.assign({ wobble: 0.8, step: 10 }, o || {})); }

  // ---------- beats (same formulas in score.py) ----------
  var tArr = L.l1.start - 0.15;                                     // Sam reaches his mark
  var tLift0 = w("l1", 1).t0 - 0.1, tLift1 = w("l1", 2).t0 + 0.1;   // "F." he swings the glass off his shoulder over the mound
  var tDot = w("l1", 3).t0, tLower = w("l1", 4).t0;                 // "sun." the hot dot · "WAY more sun" lowers it
  var tSmoke = L.l1.end - 0.3;                                      // a curl of smoke
  var tFlame = L.l3.end - 0.02;                                     // a tiny flame pops
  var tRise0 = L.l3.start + 0.1, tRise1 = tRise0 + 1.0;             // Layla is already getting up
  var tGrab0 = tRise1 + 0.05, tGrab1 = tRise1 + 0.65, tGrabAt = tGrab0 + 0.32;   // she crouches for the water bottle
  var WALKD = 1.35, tWalk1 = tGrab1 + WALKD;                         // walks over
  var tPour = tWalk1 + 0.25, tHit = tPour + 0.3, tPourEnd = tPour + 1.15;        // pours: sizzle + steam
  var tPanic0 = L.l4.start - 0.12;
  var tHide = w("l6", 1).t0 - 0.3;                                  // "...tree?" hides the glass behind his back
  var tStare = L.l6.end + 0.05, tDrop = w("l7", 0).t0 + 0.12;      // CU flat stare · "Fine." he tosses the glass over his shoulder
  var tBack0 = tStare + 0.85, tBack1 = tBack0 + WALKD;              // she walks back (offscreen) ...
  var tPlace0 = tBack1 + 0.3, tPlace1 = tPlace0 + 0.6, tPlaceAt = tPlace0 + 0.32;  // ... puts the bottle down ...
  var tSitL0 = tPlace1, tSitL1 = tSitL0 + 1.3;                      // ... and sits again
  var tPhone0 = w("l7", 1).t0 - 0.2, tPhone1 = tPhone0 + 0.45;      // phone out of the pocket
  var tInset0 = L.l8.start - 0.35;                                  // the phone inset slides in
  var tRes1 = L.l8.end + 0.3;                                       // "Step 1: Be patient."
  var tStar1 = w("l9", 4).t0 - 0.05;                                // "One star!"
  var tInset2 = L.l12.start - 0.3;                                  // inset again: "Step 2: Be MORE patient."
  var tStar0 = w("l12", 5).t0 - 0.05, tFall = w("l12", 6).t0 + 0.12;   // "Zero stars!" · one star falls off
  var tPocket = w("l14", 1).t0 - 0.1;                               // "It IS now." pockets the phone
  var tStomp = L.l15.start, STOMPD = 0.66, tTurn = tStomp + STOMPD;  // stomps to the rock
  var tSit0 = tTurn + 0.3, tSeat1 = tSit0 + 1.3, tContact = tSit0 + 1.3 * 44 / 56;
  var tCross = w("l15", 5).t0 - 0.1;                                // "and WATCH it": arms crossed
  var tFly0 = L.l15.end + 0.35, tFlyLand = DUR - 1.2;              // the fly buzzes in ... lands on his nose
  var tGlance = L.l15.end + 1.2;                                        // Layla glances up, knits on
  var KNITLEN = function (t) { return 70 + 40 * (0.3 * ramp(t, 0, tRise0) + 0.7 * ramp(t, tSitL1, DUR)); };   // scarf 70 -> 110

  // ---------- staging ----------
  var MX = 1000, XS = 850, STOOLX = 1420, XLSEAT = 1430, ROCKX = 610;
  var DOT = [MX - 6, G0 - 31], BOTTLE_AT = [1362, G0];
  var segS = [
    { t0: 0, t1: tArr, clip: "stride", loop: true },
    { t0: tArr, t1: tStomp, clip: "stand", hold: 0, blend: 0.3 },
    { t0: tStomp, t1: tTurn, clip: "stride", loop: true, f: -1, blend: 0.18 },
    { t0: tTurn, t1: tSit0, clip: "stand", hold: 0, blend: 0.25 },
    { t0: tSit0, t1: tSeat1, clip: "sit", from: 0, to: 56, blend: 0.25 },
    { t0: tSeat1, t1: DUR + 1, clip: "sit", hold: 60 }
  ];
  var segL = [
    { t0: 0, t1: tRise0, clip: "sit", hold: 64, f: -1 },
    { t0: tRise0, t1: tRise1, clip: "sit", from: 112, to: 159, f: -1 },
    { t0: tRise1, t1: tGrab1, clip: "stand", hold: 0, f: -1, blend: 0.25 },
    { t0: tGrab1, t1: tWalk1, clip: "walk", loop: true, f: -1, blend: 0.3 },
    { t0: tWalk1, t1: tBack0, clip: "stand", hold: 0, f: -1, blend: 0.3 },
    { t0: tBack0, t1: tBack1, clip: "walk", loop: true, f: 1, blend: 0.3 },
    { t0: tBack1, t1: tSitL0, clip: "stand", hold: 0, f: -1, blend: 0.3 },
    { t0: tSitL0, t1: tSitL1, clip: "sit", from: 0, to: 56, f: -1, blend: 0.3 },
    { t0: tSitL1, t1: DUR + 1, clip: "sit", hold: 64, f: -1 }
  ];
  var LS = CAST.sam.look, LL = CAST.layla.look;
  var MS = SF.motion({ clips: CL, scale: LS.scale, ground: G0, segments: segS, anchor: { seg: 1, x: XS, edge: "start" } });
  var ML = SF.motion({ clips: CL, scale: LL.scale, ground: G0, segments: segL, anchor: { seg: 0, x: XLSEAT, edge: "start" } });

  // seat heights: the mocap seat is higher than the rock / stool -> lower the pelvis, knees by IK, feet planted
  function rockTopAt(x) {                                           // Props.rock outline (w 190, h 118) top surface
    var hw = 95, h = 118, P = [[ROCKX - hw * 1.04, G0], [ROCKX - hw, G0 - h * 0.3], [ROCKX - hw * 0.8, G0 - h * 0.72], [ROCKX - hw * 0.36, G0 - h * 0.97],
      [ROCKX + hw * 0.2, G0 - h], [ROCKX + hw * 0.67, G0 - h * 0.9], [ROCKX + hw * 0.96, G0 - h * 0.55], [ROCKX + hw, G0]];
    for (var i = 0; i < P.length - 1; i++) if (x >= P[i][0] && x <= P[i + 1][0]) return lerp(P[i][1], P[i + 1][1], (x - P[i][0]) / (P[i + 1][0] - P[i][0]));
    return G0;
  }
  var sitS = MS.raw(segS[5], tSeat1 + 0.5), sitL = ML.raw(segL[0], 0.5);
  var DROP_S = Math.max(0, rockTopAt(sitS.hips[0]) - (sitS.hips[1] + 7 * LS.scale));
  var DROP_L = Math.max(0, (G0 - 92) - (sitL.hips[1] + 7 * LL.scale));
  function seatDrop(J, d) {
    if (d <= 0.01) return; var f = J._f || 1;
    var LEGS = [["hipR", "knR", "ftR"], ["hipL", "knL", "ftL"]];
    var len = LEGS.map(function (k) { return [Math.hypot(J[k[0]][0] - J[k[1]][0], J[k[0]][1] - J[k[1]][1]), Math.hypot(J[k[1]][0] - J[k[2]][0], J[k[1]][1] - J[k[2]][1])]; });
    ["hips", "hipR", "hipL", "chest", "neck", "head", "shR", "elR", "haR", "shL", "elL", "haL"].forEach(function (j) { J[j][1] += d; });
    LEGS.forEach(function (k, i) { J[k[1]] = Kit.ik(J[k[0]], J[k[2]], len[i][0], len[i][1], f); });
  }
  function seatW(M, segs, iSit, iHold, t, contactFrac) {             // 0 standing .. 1 seated (follows the sit clip)
    var s = segs[iSit]; if (t < s.t0) return 0;
    var h = segs[iHold]; if (t >= h.t0) return 1;
    return ramp(t, s.t0 + (s.t1 - s.t0) * contactFrac * 0.55, s.t0 + (s.t1 - s.t0) * contactFrac);
  }

  // ---------- acting: Sam ----------
  var CS = DATA.chars.sam, CY = DATA.chars.layla;
  var SAM_ACT = [
    { g: "raise1", t0: w("l1", 1).t0 - 0.15, t1: w("l1", 1).t1 + 0.25, side: "L", ease: 0.15 },     // "Plan F." (far hand)
    { g: "handChest", t0: L.l3.start - 0.15, t1: L.l3.end - 0.05, side: "L", ease: 0.2 },           // "That's the growing!" proud
    { g: "shrug", t0: L.l5.end + 0.25, t1: L.l6.start + 0.15, amp: 0.7, ease: 0.3 },                // caught
    { g: "raise1", t0: L.l11.start - 0.12, t1: L.l11.end + 0.2, side: "L", ease: 0.15 },            // "Nature needs feedback." finger up
    { g: "stop", t0: w("l14", 0).t0 - 0.1, t1: tPocket + 0.05, side: "L", amp: 0.8, ease: 0.15 }   // "It is now."
  ];
  var talkingHand = function (t) { return t < tPhone0 || t > tPocket + 0.5; };
  var SAM_BEATS = CS.beats.filter(function (b) { return (b > L.l7.start - 0.2 && b < L.l7.end) || (b > tPocket + 0.4 && b < tStomp); });
  var GLASSES = function (t) { return 1 - ramp(t, tFlame + 0.02, tFlame + 0.14); };   // 1 on the eyes, 0 up on the forehead
  var EX_S = Kit.expr([[0, F.scheming], [L.l1.start, F.scheming], [w("l1", 4).t0, [0.95, -0.4, 1.0], 0.2], [L.l1.end + 0.4, F.sly, 0.4],
    [L.l2.start + 0.6, F.listen, 0.4], [L.l3.start - 0.1, F.proud, 0.2], [tFlame + 0.02, F.shock, 0.08], [tPanic0, F.panic, 0.1],
    [tHit + 0.05, [-0.3, 1.0, 1.55], 0.1], [L.l5.start + 0.3, [-0.15, 0.7, 1.05], 0.4], [L.l6.start - 0.1, F.hope2, 0.2],
    [tStare, [0.4, 0.8, 1.0], 0.3], [L.l7.start - 0.05, F.determined, 0.2], [L.l8.start - 0.1, [0.1, -0.3, 0.95], 0.3],
    [w("l9", 2).t0 - 0.1, F.indig, 0.12], [tStar1, F.angry, 0.12], [L.l10.start + 0.2, F.listen, 0.4], [L.l11.start - 0.1, F.sly, 0.2],
    [L.l12.start - 0.1, [0.1, -0.3, 0.95], 0.2], [w("l12", 2).t0 - 0.05, F.indig, 0.12], [tStar0, F.angry, 0.1], [L.l13.start + 0.2, F.stubborn, 0.3],
    [L.l14.start - 0.1, F.sly, 0.2], [tStomp, F.stubborn, 0.15], [tCross, [-0.1, -0.95, 1.25], 0.25]]);
  var lipS = Talk.mouth(CS.mouth), lipL = Talk.mouth(CY.mouth);
  function mouthS(t) { return (t > tHit && t < tHit + 0.9) ? "E" : lipS(t); }     // frozen "o" after the splash
  var BLINK_S = CS.blinks.filter(function (b) { var b0 = b[0] != null ? b[0] : b; return b0 < tStomp; })
    .concat([[L.l5.end + 0.1, 0.09], [L.l5.end + 0.28, 0.09]]);                             // caught: double blink; seated: none
  var tSlow = tStare + 0.25;
  var BLINK_L = CY.blinks.filter(function (b) { var b0 = b[0] != null ? b[0] : b; return Math.abs(b0 - tSlow) > 0.7 && Math.abs(b0 - tGlance - 0.4) > 0.5; })
    .concat([[tSlow, 0.45]]);

  function jointsSam(t, plain) {
    var J = MS.joints(t), f = J._f || 1, S = MS.S;
    var walking = t < tArr + 0.1 || (t > tStomp && t < tTurn + 0.1);
    Talk.idle(J, t, "sam", { amp: walking ? 0.3 : 1.1 });
    if (plain) return J;
    Talk.act(MS, J, t, SAM_ACT);
    if (talkingHand(t)) Talk.beats(MS, J, t, SAM_BEATS, { amp: CS.gesture });
    Talk.accents(J, t, CS.accents, 2.6);
    Talk.nods(J, t, CS.nods, 4.5);
    // the glass: on the shoulder (walk in) -> held out over the mound -> lowered -> lifted in shock
    var carry = 1 - ramp(t, tLift0, tLift0 + 0.45);
    MS.pose(J, { elR: ["neck", 36, 70], haR: ["neck", 30, 22] }, carry * (t < tPanic0 ? 1 : 0));
    var over = ramp(t, tLift0, tLift1) * (1 - ramp(t, tFlame, tFlame + 0.12));
    var low = ramp(t, tLower - 0.1, tLower + 0.35);
    MS.pose(J, { elR: ["neck", 62, 30 + 8 * low], haR: ["neck", 118, 50 + 22 * low] }, over);
    Kit.lean(MS, J, 8 + 6 * low, 4 * low, over);
    var jolt = ramp(t, tFlame, tFlame + 0.1) * (1 - ramp(t, tPanic0, tPanic0 + 0.15));
    MS.pose(J, { elR: ["neck", 50, 20], haR: ["neck", 96, -20] }, jolt); Kit.lean(MS, J, -12, 0, jolt);
    // panic: both arms flap at the flame (frozen mid-flap when the water hits), hops
    var pw = ramp(t, tPanic0, tPanic0 + 0.12) * (1 - ramp(t, tHit + 0.55, tHit + 1.0));
    if (pw > 0) {
      var tt = Math.min(t, tHit), ph = Math.sin((tt - tPanic0) * 2 * Math.PI * 3.6), ph2 = Math.sin((tt - tPanic0) * 2 * Math.PI * 3.6 + 1.9);
      MS.pose(J, { elR: ["neck", 60, -10 + 30 * ph], haR: ["neck", 84, -70 + 50 * ph], elL: ["neck", 40, 6 - 34 * ph2], haL: ["neck", 86, -40 - 60 * ph2] }, pw);
      var hp = t < tHit ? Math.abs(Math.sin((t - tPanic0) * Math.PI * 3.6)) : 0;
      Kit.hop(J, hp * 13 * pw);
      J.head[0] += f * 3 * Math.sin(tt * 31) * pw;
      Kit.lean(MS, J, 6, 0, pw);
    }
    // limp after the splash -> "...Crispy tree?" the glass goes behind his back (and stays there until he drops it)
    var limp = ramp(t, tHit + 0.55, tHit + 1.0) * (1 - ramp(t, tHide - 0.05, tHide + 0.25));
    MS.pose(J, { elR: ["neck", 6, 80], haR: ["neck", 26, 140] }, limp * (t < tHide + 0.3 ? 1 : 0));
    var hide = ramp(t, tHide, tHide + 0.28) * (1 - ramp(t, tDrop - 0.1, tDrop + 0.05));
    MS.pose(J, { elR: ["neck", -40, 70], haR: ["neck", -60, 118] }, hide);
    var fling = bump(t, tDrop - 0.12, 0.5);                           // tossed over his shoulder
    MS.pose(J, { elR: ["neck", -30, 10], haR: ["neck", -50, -60] }, fling);
    Kit.lean(MS, J, -5, 0, hide);
    // phone: out of the pocket, held up; the far hand taps on every key
    var ph0 = ramp(t, tPhone0, tPhone1) * (1 - ramp(t, tPocket, tPocket + 0.55));
    if (ph0 > 0) {
      var tap = typeTap(t);
      MS.pose(J, { elR: ["neck", 30, 74], haR: ["neck", 62, 34] }, ph0);
      MS.pose(J, { elL: ["neck", 30, 80], haL: ["neck", 58 + 4 * tap, 30 - 12 * tap] }, ph0 * typing(t));
      J.head[1] += 4 * S * ph0; J.head[0] += f * 2 * ph0;
    }
    var reach = bump(t, tPhone0 - 0.05, 0.5) + bump(t, tPocket + 0.1, 0.8);         // to the hip pocket and back
    MS.pose(J, { elR: ["neck", 18, 72], haR: ["neck", 24, 120] }, reach * 0.7);
    // outrage: "be patient?!" lean in; "One star!" / "Zero stars!" a hop
    Kit.hop(J, bump(t, tStar1 - 0.05, 0.32) * 12 + bump(t, tStar0 - 0.05, 0.32) * 14);
    Kit.lean(MS, J, 10, 2, ramp(t, w("l9", 2).t0 - 0.2, w("l9", 2).t0 + 0.1) * (1 - ramp(t, tStar1 + 0.4, tStar1 + 0.9)));
    // stomp: a stiff upper body, stomping bob
    if (t > tStomp && t < tTurn + 0.2) { Kit.lean(MS, J, 7, 0, 1); J.head[1] += 2 * Math.abs(Math.sin((t - tStomp) * Math.PI * 4)); }
    // seated on the rock: pelvis onto the rock top, arms crossed, chin forward, staring
    var sw = seatW(MS, segS, 4, 5, t, 44 / 56);
    seatDrop(J, DROP_S * sw);
    var cr = ramp(t, tCross, tCross + 0.3);
    if (cr > 0) Talk.pose(MS, J, "crossArms", cr, null, t);
    J.head[0] += f * 4 * cr; J.head[1] += 2 * cr;
    return J;
  }
  function typing(t) { return ramp(t, L.l8.start - 0.25, L.l8.start) * (1 - ramp(t, L.l8.end + 0.2, L.l8.end + 0.5)); }

  // ---------- the search query, typed letter by letter on the words of l8 ----------
  var QWORDS = ["how ", "to ", "grow ", "a ", "tree ", "fast"], KEYS = [];
  L.l8.words.forEach(function (wd, i) {
    var s = QWORDS[i] || "", n = s.replace(/ $/, "").length, d = Math.max(0.22, Math.min(0.5, wd.t1 - wd.t0));
    for (var k = 0; k < s.length; k++) KEYS.push({ t: wd.t0 + (k < n ? d * k / Math.max(1, n) : d + 0.04), ch: s[k] });
  });
  var QUERY = QWORDS.join("");
  function typed(t) { var n = 0; KEYS.forEach(function (k) { if (t >= k.t) n++; }); return n; }
  function typeTap(t) { var v = 0; KEYS.forEach(function (k) { if (k.ch !== " ") v = Math.max(v, bump(t, k.t - 0.04, 0.12)); }); return v; }

  // ---------- acting: Layla ----------
  var KNIT = { elR: ["neck", 26, 66], haR: ["neck", 62, 92], elL: ["neck", 18, 70], haL: ["neck", 50, 98] };
  function knitW(t) { return 1 - ramp(t, tRise0 - 0.05, tRise0 + 0.25) + ramp(t, tSitL1 - 0.3, tSitL1 + 0.1); }
  var EX_L = Kit.expr([[0, F.calm], [L.l2.start - 0.1, [0.25, 0.1, 0.95], 0.25], [L.l2.end + 0.3, F.calm, 0.4], [tRise0, F.dead, 0.3],
    [L.l5.start - 0.1, F.dead, 0.2], [tStare - 0.05, [0.0, -0.2, 0.7], 0.2], [tBack0 + 0.4, F.calm, 0.4], [L.l10.start - 0.1, [0.05, 0.55, 1.0], 0.25],
    [L.l10.end + 0.3, F.calm, 0.4], [L.l13.start - 0.1, F.dead, 0.2], [L.l13.end + 0.4, F.calm, 0.4], [tGlance, [0.15, 0.6, 1.08], 0.15],
    [tGlance + 0.6, F.calm, 0.25]]);
  var BOT = function (t) {                                          // where the water bottle is: 0 ground, 1 in her hand
    if (t < tGrabAt) return 0; if (t < tPlaceAt) return 1; return 0;
  };
  function jointsLayla(t) {
    var J = ML.joints(t), f = J._f || 1, S = ML.S, walking = (t > tGrab1 && t < tWalk1) || (t > tBack0 && t < tBack1);
    Talk.idle(J, t, "layla", { amp: walking ? 0.3 : 0.7 });
    var kw = clamp(knitW(t), 0, 1);
    var sw = (t < tRise0 + 0.6) ? 1 - ramp(t, tRise0 + 0.1, tRise0 + 0.6) : seatW(ML, segL, 7, 8, t, 44 / 56);
    seatDrop(J, DROP_L * sw);
    if (kw > 0) {
      ML.pose(J, KNIT, kw);
      var k = Math.sin(t * 2 * Math.PI * 1.6) * 3 * S * kw;           // the needles click
      J.haR[1] += k; J.haL[1] -= k; J.haR[0] -= f * k * 0.5;
      J.head[1] += 5 * S * kw * (1 - glance(t));                      // eyes on the knitting
      J.head[0] += f * 3 * S * kw;
    }
    if (!walking) {
      Talk.beats(ML, J, t, CY.beats, { amp: CY.gesture * (1 - kw * 0.6) });
      Talk.accents(J, t, CY.accents, 2.0);
      Talk.nods(J, t, CY.nods, 4.0);
    }
    var gl = glance(t); J.head[1] -= 4 * gl; J.head[0] += f * 2 * gl;
    // crouch to pick up / put down the bottle (hand to the bottle's neck, knees by IK)
    var cg = bump(t, tGrab0, tGrab1 - tGrab0) + bump(t, tPlace0, tPlace1 - tPlace0);
    if (cg > 0) {
      Kit.crouch(ML, J, cg * 0.9, { hands: 0 });
      var tgt = [BOTTLE_AT[0] + 2, BOTTLE_AT[1] - 40];
      J.haR = [lerp(J.haR[0], tgt[0], cg), lerp(J.haR[1], tgt[1], cg)];
      J.elR = Kit.ik(J.neck, J.haR, 52 * S * 1.0, 60 * S, -f);
    }
    // the pour: arm out over the flame, bottle tipped
    var pour = ramp(t, tWalk1 + 0.05, tPour + 0.15) * (1 - ramp(t, tPourEnd, tPourEnd + 0.35));
    ML.pose(J, { elR: ["neck", 52, 30], haR: ["neck", 104, 60] }, pour);
    Kit.lean(ML, J, 6, 2, pour);
    // carrying the bottle while she walks: hand a little forward
    var carry = (t > tGrab1 - 0.1 && t < tWalk1 + 0.1) || (t > tBack0 - 0.1 && t < tPlace0 + 0.05) ? 1 : 0;
    if (carry) ML.pose(J, { elR: ["neck", 6, 78], haR: ["neck", 26, 128] }, 0.75);
    J.head[1] += ramp(t, L.l5.start - 0.2, L.l5.start + 0.1) * (1 - ramp(t, L.l5.end + 0.2, L.l5.end + 0.5)) * 2;   // chin down: deadpan
    return J;
  }
  function glance(t) { return ramp(t, tGlance, tGlance + 0.2) * (1 - ramp(t, tGlance + 0.55, tGlance + 0.8)); }

  // ---------- world ----------
  var back = document.getElementById("back"), props = document.getElementById("props"), figG = document.getElementById("fig");
  var front = document.getElementById("front"), camG = document.getElementById("cam"), ui = document.getElementById("ui");
  var defs = document.querySelector("#stage defs");
  defs.innerHTML = '<radialGradient id="p4glow"><stop offset="0" stop-color="#e9fbff" stop-opacity="0.75"/><stop offset="1" stop-color="#bfefff" stop-opacity="0"/></radialGradient>' +
    '<radialGradient id="p4dot"><stop offset="0" stop-color="#ffffff" stop-opacity="1"/><stop offset="0.35" stop-color="#fff3a0" stop-opacity="0.95"/><stop offset="1" stop-color="#ffb43a" stop-opacity="0"/></radialGradient>';
  var Y = FilmSet.yard({ G0: G0, ref: [1040, 560, 1.25], look: "day", season: "summer", garden: { x: MX } });
  var rock = Props.rock(back, ROCKX, G0);
  var bh = Kit.birdhouse(back, 1640, G0);
  var stool = Props.stool(back, STOOLX, G0);
  var mound = Props.mound(props, MX, G0);
  var tree = Props.tree(props, MX - 16, G0 - 26);

  // the smoke curl, the flame, the hot dot + sunbeam, the water stream, the steam (world, on the mound)
  var beam = el("path", { fill: "#fff6c4", opacity: 0, stroke: "none" }, props);
  var smokeG = el("g", {}, props), SMK = [0, 1, 2, 3].map(function () { return el("path", { fill: "none", stroke: "#8d8a84", "stroke-width": 6, "stroke-linecap": "round" }, smokeG); });
  var dotGlow = el("circle", { cx: DOT[0], cy: DOT[1], r: 22, fill: "url(#p4dot)", opacity: 0 }, props);
  var flameG = el("g", {}, props);
  var flO = el("path", { fill: "#f08a2e", stroke: INK, "stroke-width": 3.5, "stroke-linejoin": "round" }, flameG);
  var flI = el("path", { fill: "#ffd84d", stroke: "none" }, flameG);
  var heap = el("g", {}, back);                                    // her knitting left on the stool while she is up
  el("path", { d: ip([[STOOLX - 30, G0 - 96], [STOOLX + 20, G0 - 98], [STOOLX + 26, G0 - 108], [STOOLX - 26, G0 - 108]], { closed: true, wobble: 0.4, step: 8, seed: 141 }), fill: "#2f7f8f", stroke: INK, "stroke-width": 3 }, heap);
  el("path", { d: "M " + (STOOLX - 14) + " " + (G0 - 103) + " L " + (STOOLX + 2) + " " + (G0 - 103) + " M " + (STOOLX + 10) + " " + (G0 - 103) + " L " + (STOOLX + 22) + " " + (G0 - 104), stroke: "#c4453b", "stroke-width": 6 }, heap);
  el("path", { d: "M " + (STOOLX - 4) + " " + (G0 - 106) + " L " + (STOOLX + 30) + " " + (G0 - 132) + " M " + (STOOLX + 4) + " " + (G0 - 106) + " L " + (STOOLX + 40) + " " + (G0 - 126), stroke: "#c9a46a", "stroke-width": 4.5, "stroke-linecap": "round" }, heap);
  el("circle", { cx: STOOLX - 52, cy: G0 - 14, r: 14, fill: "#c4453b", stroke: INK, "stroke-width": 3 }, heap);
  var glassBack = el("g", {}, figG);                                // the glass behind his back (drawn before the figures)
  var bagG = el("g", {}, figG), bag = Kit.bag(bagG);                // her tote by the stool
  bag.set(STOOLX + 70, G0 - 42, {});
  var knitBack = el("g", {}, figG);
  var RL = SF.rig(figG, { scale: LL.scale, head: LL.head, ink: LL.ink, color: LL.color, accessories: LL.accessories, backInk: "#5a5751",
    expr: EX_L, blinks: BLINK_L, mouth: lipL, mouthFill: "#8e352d", lineComp: 0.6, seed: 2 });
  var knit = Props.knitting(figG);
  var RS = SF.rig(figG, { scale: LS.scale, head: LS.head, ink: LS.ink, color: LS.color, accessories: LS.accessories, backInk: "#5a5751",
    expr: EX_S, blinks: BLINK_S, mouth: mouthS, mouthFill: "#8e352d", lineComp: 0.6, seed: 1 });
  var glassFront = el("g", {}, front);
  var streamG = el("g", {}, front);
  var stream = el("path", { fill: "none", stroke: "#6fb7e0", "stroke-width": 7, "stroke-linecap": "round", opacity: 0.95 }, streamG);
  var DROPS = [0, 1, 2, 3, 4].map(function () { return el("circle", { r: 4, fill: "#8fcbea", stroke: INK, "stroke-width": 1.5 }, streamG); });
  var steamG = el("g", {}, front), STM = []; for (var si = 0; si < 9; si++) STM.push(el("circle", { fill: "#ffffff", stroke: "#9aa3a8", "stroke-width": 2.5 }, steamG));
  var bottleG = el("g", {}, front);                                 // the water bottle (in her hand or on the ground)
  el("path", { d: ip([[-11, -16], [11, -16], [12, 30], [-12, 30]], { closed: true, wobble: 0.3, step: 6, seed: 151 }), fill: "#bfe6f5", stroke: INK, "stroke-width": 3, "stroke-linejoin": "round" }, bottleG);
  el("path", { d: "M -11 -16 Q -9 -24 -5 -26 L 5 -26 Q 9 -24 11 -16", fill: "#bfe6f5", stroke: INK, "stroke-width": 3 }, bottleG);
  el("rect", { x: -6, y: -34, width: 12, height: 9, rx: 2, fill: "#2f7f8f", stroke: INK, "stroke-width": 2.5 }, bottleG);
  el("rect", { x: -12, y: 2, width: 24, height: 12, fill: "#f4f1e6", stroke: INK, "stroke-width": 2 }, bottleG);
  var bWater = el("path", { d: "M -10 -12 L 10 -12 L 11 28 L -11 28 Z", fill: "#6fb7e0", opacity: 0.8 }, bottleG);
  var phoneG = el("g", {}, front);                                  // the phone in his hand
  el("rect", { x: -9, y: -16, width: 18, height: 32, rx: 4, fill: "#33302c", stroke: INK, "stroke-width": 2.5 }, phoneG);
  el("rect", { x: -6.5, y: -12.5, width: 13, height: 24, rx: 2, fill: "#d8f4ff" }, phoneG);
  var glow = el("ellipse", { fill: "url(#p4glow)", opacity: 0 }, front);
  var shades = el("g", {}, front);                                  // his sunglasses
  var shL = el("path", { fill: "#2b2a28", stroke: INK, "stroke-width": 3, "stroke-linejoin": "round" }, shades);
  var shBar = el("path", { fill: "none", stroke: INK, "stroke-width": 3.5, "stroke-linecap": "round" }, shades);
  var shGl = el("path", { fill: "none", stroke: "#ffffff", "stroke-width": 2.5, "stroke-linecap": "round", opacity: 0.8 }, shades);
  var flyG = el("g", {}, front);                                    // the fly
  var flyWings = el("path", { fill: "#e9f3f7", stroke: INK, "stroke-width": 1.4, opacity: 0.9 }, flyG);
  el("ellipse", { cx: 0, cy: 0, rx: 5.5, ry: 4, fill: INK }, flyG);
  el("circle", { cx: 4.5, cy: -1, r: 2.6, fill: INK }, flyG);
  var fx = Kit.emanata(front);

  // the GIANT magnifying glass: wooden handle + steel ring + lens + glint
  function mkGlass(parent) {
    var g = el("g", {}, parent);
    var hdl = el("path", { fill: "none", stroke: INK, "stroke-width": 12, "stroke-linecap": "round" }, g);
    var hdl2 = el("path", { fill: "none", stroke: "#a0703e", "stroke-width": 7, "stroke-linecap": "round" }, g);
    var lens = el("circle", { fill: "#d5f1fb", "fill-opacity": 0.55, stroke: INK, "stroke-width": 10 }, g);
    var ring = el("circle", { fill: "none", stroke: "#9aa1a8", "stroke-width": 5 }, g);
    var glint = el("path", { fill: "none", stroke: "#ffffff", "stroke-width": 5, "stroke-linecap": "round", opacity: 0.9 }, g);
    return { g: g, set: function (o) {
      if (!o) { g.setAttribute("visibility", "hidden"); return; }
      g.setAttribute("visibility", "visible");
      var a = o.ang * Math.PI / 180, ux = Math.cos(a), uy = Math.sin(a), R = 40, H = 62, h = o.hand;
      var p0 = [h[0] - ux * 16, h[1] - uy * 16], p1 = [h[0] + ux * H, h[1] + uy * H], c = [h[0] + ux * (H + R), h[1] + uy * (H + R)];
      var d = "M " + U.pt(p0) + " L " + U.pt(p1); hdl.setAttribute("d", d); hdl2.setAttribute("d", d);
      lens.setAttribute("cx", c[0].toFixed(1)); lens.setAttribute("cy", c[1].toFixed(1)); lens.setAttribute("r", R);
      ring.setAttribute("cx", c[0].toFixed(1)); ring.setAttribute("cy", c[1].toFixed(1)); ring.setAttribute("r", R - 1);
      var g0 = -2.5, g1 = -1.6;
      glint.setAttribute("d", "M " + U.pt([c[0] + Math.cos(g0) * R * 0.66, c[1] + Math.sin(g0) * R * 0.66]) + " A " + (R * 0.66).toFixed(1) + " " + (R * 0.66).toFixed(1) + " 0 0 1 " + U.pt([c[0] + Math.cos(g1) * R * 0.66, c[1] + Math.sin(g1) * R * 0.66]));
      this.c = c; this.R = R;
    } };
  }
  var GF = mkGlass(glassFront), GB = mkGlass(glassBack);
  function glassState(t, J) {                                       // -> {hand, ang, behind} or a ground pose
    var f = J._f || 1;
    var GX = 440;                                                    // tossed far behind him, past the rock (out of his path)
    if (t >= tDrop + 0.3) return { hand: [GX, G0 - 12], ang: 182, ground: true };
    if (t >= tDrop) {                                                // tossed over his shoulder, lands flat
      var k = clamp((t - tDrop) / 0.3, 0, 1), h = [lerp(J.haR[0], GX, k), lerp(J.haR[1], G0 - 12, k) - Math.sin(Math.PI * k) * 140];
      return { hand: h, ang: lerp(f > 0 ? 100 : 80, f > 0 ? 182 : -2, k), behind: true };
    }
    var dir = function (deg) { return f > 0 ? deg : 180 - deg; };
    var hide = ramp(t, tHide, tHide + 0.28);
    if (hide > 0.5) return { hand: J.haR, ang: dir(100), behind: true };
    var a = -118;                                                    // on the shoulder, ring up behind his head
    a = lerp(a, 40, ramp(t, tLift0, tLift1));                        // out over the mound
    a = lerp(a, 52, ramp(t, tLower - 0.1, tLower + 0.35));
    a = lerp(a, -60, ramp(t, tFlame, tFlame + 0.12));                // jolts up
    if (t > tPanic0) {                                               // flails with the arm
      var e = J.elR, hnd = J.haR; a = lerp(a, Math.atan2(hnd[1] - e[1], (hnd[0] - e[0]) * f) * 180 / Math.PI, ramp(t, tPanic0, tPanic0 + 0.1));
    }
    a = lerp(a, 90, ramp(t, tHit + 0.55, tHit + 1.0));             // hangs limp
    return { hand: J.haR, ang: dir(a) };
  }
  var _sunFrom = null;
  function sunFrom() { if (!_sunFrom) { var J0 = jointsSam(tFlame), h0 = Kit.headInfo(J0, RS, G0); _sunFrom = [h0.head[0] + RS.HR * 0.42, h0.head[1] - RS.HR * 0.1]; } return _sunFrom; }
  function flameShape(cx, cy, s, t) {
    var fl = function (k) { return 1 + 0.12 * Math.sin(t * 23 + k) + 0.08 * Math.sin(t * 37 + k * 2); };
    var hgt = 46 * s * fl(0), wd = 15 * s;
    var o = "M " + (cx - wd) + " " + cy + " C " + (cx - wd * 1.3) + " " + (cy - hgt * 0.4) + ", " + (cx - wd * 0.2 + Math.sin(t * 17) * 3) + " " + (cy - hgt * 0.6) + ", " + (cx + Math.sin(t * 13) * 4 * s) + " " + (cy - hgt) +
      " C " + (cx + wd * 0.5) + " " + (cy - hgt * 0.62 * fl(1)) + ", " + (cx + wd * 1.4) + " " + (cy - hgt * 0.4) + ", " + (cx + wd) + " " + cy + " Z";
    var h2 = hgt * 0.55, w2 = wd * 0.55;
    var i = "M " + (cx - w2) + " " + cy + " C " + (cx - w2 * 1.2) + " " + (cy - h2 * 0.5) + ", " + cx + " " + (cy - h2 * 0.7) + ", " + (cx + Math.sin(t * 19) * 2 * s) + " " + (cy - h2) +
      " C " + (cx + w2 * 0.6) + " " + (cy - h2 * 0.6) + ", " + (cx + w2 * 1.2) + " " + (cy - h2 * 0.4) + ", " + (cx + w2) + " " + cy + " Z";
    return [o, i];
  }
  function flameScale(t) {
    if (t < tFlame) return 0;
    var pop = U.easeOutBack(clamp((t - tFlame) / 0.22, 0, 1));
    var grow = 1 + 0.5 * ramp(t, tPanic0, tHit);                     // his fanning makes it bigger
    return pop * grow * (1 - ramp(t, tHit, tHit + 0.35));
  }

  // ---------- camera ----------
  var H0 = { sam: G0 - Kit.headInfo(jointsSam(tArr + 0.6, true), RS, G0).top, layla: G0 - Kit.headInfo(ML.raw(segL[4], tWalk1 + 0.5), RL, G0).top };
  function resolve(id, t) {
    if (id === "mound") return { head: [MX, G0 - 60], top: G0 - 120, feet: G0, f: 1, h: H0.sam };
    var c = id === "sam" ? Kit.headInfo(jointsSam(t), RS, G0) : Kit.headInfo(jointsLayla(t), RL, G0); c.h = H0[id]; return c;
  }
  var cam = Shots.camera(SHOTS, { width: 1920, height: 1080, duration: DUR, resolve: resolve });
  var tfx = Shots.fx(document.getElementById("fxg"), []);

  // ---------- PHONE INSET (screen space) + review bubbles ----------
  var PX = 1370, PY = 590, PW = 400, PH = 720, insetG = el("g", {}, ui), inset = el("g", {}, insetG);
  el("path", { d: rr(PX - PW / 2, PY - PH / 2, PW, PH, 54), fill: "#33302c", stroke: INK, "stroke-width": 7 }, inset);
  el("path", { d: rr(PX - PW / 2 + 20, PY - PH / 2 + 26, PW - 40, PH - 52, 34), fill: "#fbfdff", stroke: INK, "stroke-width": 3 }, inset);
  el("rect", { x: PX - 44, y: PY - PH / 2 + 8, width: 88, height: 12, rx: 6, fill: "#1e1c19" }, inset);
  var logo = el("text", { x: PX, y: PY - PH / 2 + 110, "text-anchor": "middle", "font-family": "Caveat, cursive", "font-weight": 700, "font-size": 64 }, inset);
  [["S", "#2f7f8f"], ["e", "#c4453b"], ["a", "#e8a33a"], ["r", "#2f7f8f"], ["c", "#5f9a3a"], ["h", "#c4453b"], ["y", "#e8a33a"]].forEach(function (c) {
    var ts = el("tspan", { fill: c[1] }, logo); ts.textContent = c[0]; });
  el("path", { d: rr(PX - PW / 2 + 40, PY - PH / 2 + 140, PW - 80, 72, 36), fill: "#ffffff", stroke: INK, "stroke-width": 4 }, inset);
  el("circle", { cx: PX - PW / 2 + 78, cy: PY - PH / 2 + 174, r: 13, fill: "none", stroke: INK, "stroke-width": 4 }, inset);
  el("path", { d: "M " + (PX - PW / 2 + 87) + " " + (PY - PH / 2 + 184) + " l 11 11", stroke: INK, "stroke-width": 5, "stroke-linecap": "round" }, inset);
  var qText = el("text", { x: PX - PW / 2 + 104, y: PY - PH / 2 + 188, "font-family": "Caveat, cursive", "font-weight": 700, "font-size": 29, fill: INK }, inset);
  var caret = el("rect", { y: PY - PH / 2 + 160, width: 3, height: 30, fill: "#2f7f8f" }, inset);
  var kbd = el("g", {}, inset), KB = [];                               // keyboard: three rows of keys
  for (var r = 0; r < 3; r++) for (var c = 0; c < 9 - r; c++) {
    var kx = PX - PW / 2 + 46 + r * 18 + c * 37, ky = PY + PH / 2 - 230 + r * 54;
    KB.push(el("rect", { x: kx, y: ky, width: 31, height: 44, rx: 7, fill: "#e8e4da", stroke: INK, "stroke-width": 2 }, kbd));
  }
  el("rect", { x: PX - 90, y: PY + PH / 2 - 68, width: 180, height: 36, rx: 9, fill: "#e8e4da", stroke: INK, "stroke-width": 2 }, kbd);
  var res = el("g", {}, inset);                                      // the result card
  el("path", { d: rr(PX - PW / 2 + 40, PY - PH / 2 + 250, PW - 80, 300, 22), fill: "#fff8e3", stroke: INK, "stroke-width": 4 }, res);
  var resHead = el("text", { x: PX - PW / 2 + 66, y: PY - PH / 2 + 296, "font-family": "Caveat, cursive", "font-weight": 700, "font-size": 30, fill: "#7d776c" }, res);
  resHead.textContent = "Top result";
  var resStep = el("text", { x: PX, y: PY - PH / 2 + 382, "text-anchor": "middle", "font-family": "Caveat, cursive", "font-weight": 700, "font-size": 70, fill: INK }, res);
  var resBody = el("text", { x: PX, y: PY - PH / 2 + 470, "text-anchor": "middle", "font-family": "Caveat, cursive", "font-weight": 700, "font-size": 66, fill: "#2f7f8f" }, res);
  var resUnder = el("path", { fill: "none", stroke: "#c4453b", "stroke-width": 6, "stroke-linecap": "round" }, res);
  var bub = Kit.bubble(ui), STARS = [];
  for (var sk = 0; sk < 5; sk++) STARS.push(el("path", { d: starD(0, 0, 30, 13), stroke: INK, "stroke-width": 4, "stroke-linejoin": "round" }, bub.inner));
  var fallStar = el("path", { d: starD(0, 0, 30, 13), fill: "#fffdf6", stroke: INK, "stroke-width": 4, "stroke-linejoin": "round" }, ui);
  function rr(x, y, w_, h, r_) { return "M " + (x + r_) + " " + y + " H " + (x + w_ - r_) + " Q " + (x + w_) + " " + y + " " + (x + w_) + " " + (y + r_) + " V " + (y + h - r_) + " Q " + (x + w_) + " " + (y + h) + " " + (x + w_ - r_) + " " + (y + h) +
    " H " + (x + r_) + " Q " + x + " " + (y + h) + " " + x + " " + (y + h - r_) + " V " + (y + r_) + " Q " + x + " " + y + " " + (x + r_) + " " + y + " Z"; }
  function starD(cx, cy, R, r_) { var p = []; for (var k = 0; k < 10; k++) { var a = -Math.PI / 2 + k * Math.PI / 5, q = k % 2 ? r_ : R; p.push((cx + Math.cos(a) * q).toFixed(1) + " " + (cy + Math.sin(a) * q).toFixed(1)); } return "M " + p.join(" L ") + " Z"; }
  function insetK(t) {
    return ramp(t, tInset0, tInset0 + 0.3) * (1 - ramp(t, tStar1 - 0.3, tStar1 - 0.05)) + ramp(t, tInset2, tInset2 + 0.3) * (1 - ramp(t, tStar0 - 0.3, tStar0 - 0.05));
  }
  function renderInset(t) {
    var k = insetK(t);
    insetG.setAttribute("display", k > 0.005 ? "inline" : "none"); if (k <= 0.005) return;
    insetG.setAttribute("transform", "translate(0 " + ((1 - U.easeOutBack(k)) * 880).toFixed(1) + ") rotate(3 " + PX + " " + PY + ")");
    var second = t > tInset2 - 0.5, n = second ? QUERY.length : typed(t);
    qText.textContent = QUERY.slice(0, n);
    var tw = qText.getComputedTextLength ? qText.getComputedTextLength() : n * 16;
    caret.setAttribute("x", (PX - PW / 2 + 106 + tw).toFixed(1));
    caret.setAttribute("visibility", (!second && t < tRes1 - 0.2 && Math.floor(t * 2.6) % 2 === 0) ? "visible" : "hidden");
    var pressed = -1; KEYS.forEach(function (kk, i) { if (kk.ch !== " " && t >= kk.t - 0.02 && t < kk.t + 0.12) pressed = Math.floor(U.hash(i * 3.7 + 1) * 24); });
    KB.forEach(function (b, i) { b.setAttribute("fill", i === pressed ? "#2f7f8f" : "#e8e4da"); });
    var showRes = second || t > tRes1;
    kbd.setAttribute("visibility", showRes ? "hidden" : "visible");
    res.setAttribute("visibility", showRes ? "visible" : "hidden");
    if (showRes) {
      var p = second ? clamp((t - tInset2 - 0.15) / 0.3, 0, 1) : clamp((t - tRes1) / 0.25, 0, 1);
      res.setAttribute("transform", "translate(0 " + ((1 - U.smooth(p)) * 40).toFixed(1) + ")"); res.setAttribute("opacity", p.toFixed(2));
      resStep.textContent = second ? "Step 2:" : "Step 1:";
      if (second) {
        resBody.innerHTML = ""; var a1 = el("tspan", {}, resBody); a1.textContent = "Be ";
        var a2 = el("tspan", { fill: "#c4453b" }, resBody); a2.textContent = "MORE"; var a3 = el("tspan", {}, resBody); a3.textContent = " patient.";
        resBody.setAttribute("font-size", 48);
        resUnder.setAttribute("d", "M " + (PX - 84) + " " + (PY - PH / 2 + 482) + " q 40 6 92 -2"); resUnder.setAttribute("visibility", "visible");
      } else { resBody.textContent = "Be patient."; resBody.setAttribute("font-size", 66); resUnder.setAttribute("visibility", "hidden"); }
    }
  }
  function renderBubble(t, c, JS) {
    var on1 = t > tStar1 && t < L.l10.start - 0.05, on0 = t > tStar0 && t < L.l13.start - 0.05;
    bub.inner.setAttribute("display", (on1 || on0) ? "inline" : "none");
    if (!on1 && !on0) { bub.set({ hidden: true }); fallStar.setAttribute("visibility", "hidden"); return; }
    var t0 = on1 ? tStar1 : tStar0, hs = cam.toScreen(Kit.headInfo(JS, RS, G0).head, c);
    var bx = clamp(hs[0] + 480, 760, 1560), by = clamp(hs[1] - 150, 170, 700);
    var s = U.easeOutBack(clamp((t - t0) / 0.25, 0, 1));
    bub.set({ x: bx, y: by, w: 440, h: 140, tail: [clamp(hs[0] + 150, bx - 220, bx - 60), by + 150], s: s });
    STARS.forEach(function (st, i) {
      var filled = on1 && i === 0, stamp = filled ? U.easeOutBack(clamp((t - t0 - 0.3) / 0.2, 0, 1)) : 1;
      var gone = on0 && i === 4 && t > tFall;
      st.setAttribute("visibility", gone ? "hidden" : "visible");
      st.setAttribute("fill", filled && t > t0 + 0.3 ? "#f2c94c" : "#fffdf6");
      var sc = filled && t > t0 + 0.3 ? 0.7 + 0.3 * stamp + 0.25 * bump(t, t0 + 0.3, 0.25) : 1;
      var wob = on0 && i === 4 ? Math.sin((t - t0) * 30) * 6 * ramp(t, tFall - 0.35, tFall) : 0;
      st.setAttribute("transform", "translate(" + (bx - 164 + i * 82) + " " + by + ") rotate(" + wob.toFixed(1) + ") scale(" + sc.toFixed(3) + ")");
    });
    if (on0 && t > tFall) {                                         // the fifth star drops off the bubble
      var dt = t - tFall, fy = by + 260 * dt + 900 * dt * dt, fxp = bx - 164 + 4 * 82 + 60 * dt;
      fallStar.setAttribute("visibility", fy < 1200 ? "visible" : "hidden");
      fallStar.setAttribute("transform", "translate(" + fxp.toFixed(1) + " " + fy.toFixed(1) + ") rotate(" + (dt * 300).toFixed(0) + ")");
    } else fallStar.setAttribute("visibility", "hidden");
  }

  // ---------- render ----------
  function render(t) {
    var c = cam.apply(camG, t); Y.update(t, c);
    var JL = jointsLayla(t), JS = jointsSam(t), f = JS._f || 1;
    RL.set(JL, t, { zoom: c[2] }); RS.set(JS, t, { zoom: c[2] });
    mound.set(t, {}); tree.set(0, t, { season: "summer" });
    // Layla's knitting: in her hands while seated, left on the stool while she is up
    var kw = knitW(t), seated = kw > 0.5;
    knit.set(JL, { len: KNITLEN(t), click: (t * 1.6) % 1, G0: G0, hidden: !seated, packed: !seated });   // packed: works around child visibility overriding hidden
    heap.setAttribute("visibility", seated ? "hidden" : "visible");
    // the bottle
    var inHand = BOT(t) === 1, bx, by, ba = 0;
    if (inHand) {
      var pour = ramp(t, tWalk1 + 0.05, tPour + 0.15) * (1 - ramp(t, tPourEnd, tPourEnd + 0.35));
      bx = JL.haR[0]; by = JL.haR[1]; ba = (JL._f || 1) * 118 * pour;
    } else { bx = BOTTLE_AT[0]; by = BOTTLE_AT[1] - 30; }
    bottleG.setAttribute("transform", "translate(" + bx.toFixed(1) + " " + by.toFixed(1) + ") rotate(" + ba.toFixed(1) + ")");
    var lev = lerp(-12, 24, ramp(t, tHit - 0.2, tPourEnd));          // the water level drops as she pours
    bWater.setAttribute("d", "M -10 " + lev.toFixed(1) + " L 10 " + lev.toFixed(1) + " L 11 28 L -11 28 Z");
    // the glass
    var gs = glassState(t, JS);
    if (gs.behind || gs.ground) { GB.set(gs); GF.set(null); } else { GF.set(gs); GB.set(null); }
    glassBack.setAttribute("transform", gs.ground ? "translate(0 " + (G0 - 4) + ") scale(1 0.32) translate(0 " + (-(G0 - 4)) + ")" : "");
    var G = gs.behind || gs.ground ? GB : GF;
    // sunbeam + hot dot
    var dotK = ramp(t, tDot - 0.15, tDot + 0.15) * (1 - ramp(t, tFlame - 0.05, tFlame + 0.08));
    var hot = 0.6 + 0.4 * ramp(t, tLower, tLower + 0.4);
    dotGlow.setAttribute("opacity", (dotK * (0.85 + 0.15 * Math.sin(t * 40))).toFixed(2));
    dotGlow.setAttribute("r", (dotK * (26 - 8 * hot + 2 * Math.sin(t * 31))).toFixed(1));
    if (dotK > 0.01 && G.c) {
      var cc = G.c, R = G.R * 0.9;
      beam.setAttribute("d", "M " + (cc[0] - R) + " " + cc[1] + " L " + DOT[0] + " " + DOT[1] + " L " + (cc[0] + R) + " " + cc[1] + " Z");
      beam.setAttribute("opacity", (0.45 * dotK).toFixed(2));
    } else beam.setAttribute("opacity", 0);
    // smoke: a curl from the dot, thicker as it cooks, gone after the splash
    var smk = ramp(t, tSmoke - 0.4, tSmoke + 2.5) * (1 - ramp(t, tHit + 0.2, tHit + 1.2));
    SMK.forEach(function (p, j) {
      var ph = (t * 0.55 + j / 4) % 1, pts = [], sx = DOT[0] + 4, sy = DOT[1] - 6 - ph * 150;
      for (var q = 0; q <= 8; q++) pts.push([sx + Math.sin(q * 0.9 + t * 3 + j * 1.7) * (6 + q * 2.2) + q * 2, sy - q * 13]);
      p.setAttribute("d", ip(pts, { wobble: 0.3, step: 6, seed: 160 + j }));
      p.setAttribute("opacity", (smk * Math.sin(ph * Math.PI) * 0.85).toFixed(2));
      p.setAttribute("stroke-width", (5 + 4 * ph).toFixed(1));
    });
    // flame
    var fs = flameScale(t);
    flameG.setAttribute("visibility", fs > 0.01 ? "visible" : "hidden");
    if (fs > 0.01) { var fsh = flameShape(DOT[0], DOT[1] + 2, fs, t); flO.setAttribute("d", fsh[0]); flI.setAttribute("d", fsh[1]); }
    // water stream (bottle mouth -> flame) + steam
    var flow = ramp(t, tHit - 0.28, tHit - 0.12) * (1 - ramp(t, tPourEnd - 0.15, tPourEnd + 0.05));
    if (inHand && flow > 0.01) {
      var a = ba * Math.PI / 180, mth = [bx + Math.sin(a) * 34, by - Math.cos(a) * 34];
      var end = [DOT[0] + 4, DOT[1] - 4], q0 = [lerp(mth[0], end[0], 0.25), mth[1] + 6];
      var reach = clamp((t - (tHit - 0.28)) / 0.18, 0, 1), e2 = [lerp(mth[0], end[0], reach), lerp(mth[1], end[1], reach * reach)];
      stream.setAttribute("d", "M " + U.pt(mth) + " Q " + U.pt(q0) + " " + U.pt(e2)); stream.setAttribute("opacity", (0.95 * flow).toFixed(2));
      DROPS.forEach(function (d, j) {
        var ph = (t * 3 + j / 5) % 1, dx = (j - 2) * 9 + Math.sin(j * 2.3) * 4;
        d.setAttribute("cx", (end[0] + dx * ph * 2.2).toFixed(1)); d.setAttribute("cy", (end[1] - 26 * Math.sin(ph * Math.PI) + 4).toFixed(1));
        d.setAttribute("visibility", reach >= 1 ? "visible" : "hidden");
      });
      streamG.setAttribute("visibility", "visible");
    } else streamG.setAttribute("visibility", "hidden");
    var stK = ramp(t, tHit, tHit + 0.2) * (1 - ramp(t, tHit + 1.8, tHit + 2.8));
    steamG.setAttribute("visibility", stK > 0.01 ? "visible" : "hidden");
    if (stK > 0.01) STM.forEach(function (ci, j) {
      var ph = ((t - tHit) * 0.8 + j / 9) % 1, x = DOT[0] + (U.hash(j + 3) - 0.5) * 70 + Math.sin(ph * 5 + j) * 12, y = DOT[1] - 10 - ph * 170;
      ci.setAttribute("cx", x.toFixed(1)); ci.setAttribute("cy", y.toFixed(1)); ci.setAttribute("r", (10 + 26 * ph).toFixed(1));
      ci.setAttribute("opacity", (stK * Math.sin(ph * Math.PI) * 0.9).toFixed(2));
    });
    // phone + screen glow on his face
    var ph0 = ramp(t, tPhone0 + 0.15, tPhone1) * (1 - ramp(t, tPocket + 0.45, tPocket + 0.6));
    var hi = Kit.headInfo(JS, RS, G0), HR = RS.HR;
    phoneG.setAttribute("visibility", ph0 > 0.02 ? "visible" : "hidden");
    phoneG.setAttribute("transform", "translate(" + JS.haR[0].toFixed(1) + " " + (JS.haR[1] - 10).toFixed(1) + ") rotate(" + (f * -14) + ") scale(" + (0.4 + 0.6 * ph0).toFixed(2) + ")");
    glow.setAttribute("cx", (hi.head[0] + f * HR * 0.5).toFixed(1)); glow.setAttribute("cy", (hi.head[1] + HR * 0.35).toFixed(1));
    glow.setAttribute("rx", (HR * 1.15).toFixed(1)); glow.setAttribute("ry", (HR * 1.0).toFixed(1));
    glow.setAttribute("opacity", (ph0 * (0.8 + 0.2 * typeTap(t))).toFixed(2));
    // sunglasses: on his eyes; the flame pops -> they fly off and land on the grass in front of him
    var gk = clamp((t - tFlame) / 0.6, 0, 1), ex0 = hi.head[0] + f * HR * 0.42, ey0 = hi.head[1] - HR * 0.1, ex, ey, rot;
    var GL_AT = [XS + 70, G0 - 7];
    if (t < tFlame) { ex = ex0; ey = ey0; rot = 0; }
    else if (gk < 1) { var e0 = sunFrom(); ex = lerp(e0[0], GL_AT[0], gk); ey = lerp(e0[1], GL_AT[1], gk) - Math.sin(Math.PI * gk) * 120; rot = gk * 540; }
    else { ex = GL_AT[0]; ey = GL_AT[1]; rot = 170; }
    var lw = HR * 0.36, lh = HR * 0.27, ff = t < tFlame ? f : 1;
    shL.setAttribute("d", "M " + (ex - lw) + " " + (ey - lh * 0.8) + " L " + (ex + lw) + " " + (ey - lh * 0.8) + " Q " + (ex + lw) + " " + (ey + lh) + " " + ex + " " + (ey + lh) + " Q " + (ex - lw) + " " + (ey + lh) + " " + (ex - lw) + " " + (ey - lh * 0.8) + " Z");
    shBar.setAttribute("d", "M " + (ex - ff * lw) + " " + (ey - lh * 0.6) + " L " + (ex - ff * HR * 1.05) + " " + (ey - lh * 0.2));
    shGl.setAttribute("d", "M " + (ex - lw * 0.55) + " " + (ey - lh * 0.35) + " L " + (ex - lw * 0.15) + " " + (ey - lh * 0.35));
    shades.setAttribute("transform", "rotate(" + rot.toFixed(1) + " " + ex.toFixed(1) + " " + ey.toFixed(1) + ")");
    var lcw = Math.pow(c[2], -0.6) * 1.0;
    shL.setAttribute("stroke-width", (3 * lcw * 1.3).toFixed(2)); shBar.setAttribute("stroke-width", (3.5 * lcw * 1.3).toFixed(2));
    // the fly: buzzes around his head, lands on his nose
    var flyOn = t > tFly0;
    flyG.setAttribute("visibility", flyOn ? "visible" : "hidden");
    if (flyOn) {
      var nose = [hi.head[0] + f * HR * 1.02, hi.head[1] + HR * 0.12], landK = U.smooth((t - (tFlyLand - 0.5)) / 0.5);
      var tt = t - tFly0, orbit = [hi.head[0] + f * HR * 0.9 + Math.sin(tt * 4.1) * HR * 2.2 + Math.sin(tt * 9.3) * HR * 0.4, hi.head[1] - HR * 0.9 + Math.cos(tt * 5.3) * HR * 1.2 + Math.sin(tt * 11) * HR * 0.3];
      var enter = clamp(tt / 0.8, 0, 1), from = [hi.head[0] + f * HR * 6, hi.head[1] - HR * 3];
      var p = [lerp(from[0], orbit[0], U.smooth(enter)), lerp(from[1], orbit[1], U.smooth(enter))];
      if (t > tFlyLand - 0.5) p = [lerp(p[0], nose[0], landK), lerp(p[1], nose[1] - 3, landK)];
      var sc = clamp(4.2 / c[2], 0.4, 1.6), landed = t > tFlyLand, flap = landed ? 0.25 : Math.abs(Math.sin(t * 90));
      flyWings.setAttribute("d", "M -1 -2 C -8 " + (-14 * (0.4 + flap)) + ", 6 " + (-16 * (0.4 + flap)) + ", 3 -2 Z M 1 -2 C 4 " + (-12 * (0.3 + flap)) + ", 14 " + (-10 * (0.3 + flap)) + ", 5 -1 Z");
      flyG.setAttribute("transform", "translate(" + p[0].toFixed(1) + " " + p[1].toFixed(1) + ") scale(" + (f * sc * 1.2).toFixed(2) + " " + (sc * 1.2).toFixed(2) + ")");
    }
    // cartoon marks
    var hl = Kit.headInfo(JL, RL, G0);
    fx.set({
      lines: t > tFlame && t < tFlame + 0.5 ? { x: hi.head[0], y: hi.head[1], r: HR * 1.5, n: 7, amp: 20 } : (t > tStar0 && t < tStar0 + 0.4 ? { x: hi.head[0], y: hi.head[1], r: HR * 1.5, n: 6, amp: 18 } : null),
      sweat: t > tHit + 0.3 && t < L.l6.end ? { x: hi.head[0] - f * HR * 0.75, y: hi.head[1] - HR * 0.3, k: ramp(t, tHit + 0.3, L.l5.end) } : null,
      puff: t > tContact && t < tContact + 0.6 ? { x: JS.hips[0], y: G0 - 6, k: (t - tContact) / 0.6, s: 0.7 } :
        (t > tDrop + 0.3 && t < tDrop + 0.8 ? { x: 400, y: G0 - 6, k: (t - tDrop - 0.3) / 0.5, s: 0.5 } : null),
      anger: t > tStar1 && t < tStar1 + 0.9 ? { x: hi.head[0] - f * HR * 0.55, y: hi.head[1] - HR * 0.9, k: ramp(t, tStar1, tStar1 + 0.15) } :
        (t > tStar0 && t < tStar0 + 1.2 ? { x: hi.head[0] - f * HR * 0.55, y: hi.head[1] - HR * 0.9, k: ramp(t, tStar0, tStar0 + 0.15) } : null),
      sparkle: (G.c && t > 1.1 && t < 1.6) ? { x: G.c[0] - G.R * 0.4, y: G.c[1] - G.R * 0.45, k: (t - 1.1) / 0.5, s: 0.9 } : null   // glint as he strides in
    }, t);
    renderInset(t);
    renderBubble(t, c, JS);
    tfx.update(t);
  }
  window.__film = { MS: MS, ML: ML, RS: RS, RL: RL, cam: cam, resolve: resolve, jointsSam: jointsSam, jointsLayla: jointsLayla,
    seg: { S: segS.map(function (s) { return [s.t0, s.x0, s.x1]; }), L: segL.map(function (s) { return [s.t0, s.x0, s.x1]; }) }, DROP_S: DROP_S, DROP_L: DROP_L,
    beats: { tArr: tArr, tDot: tDot, tSmoke: tSmoke, tFlame: tFlame, tRise0: tRise0, tWalk1: tWalk1, tPour: tPour, tHit: tHit, tStare: tStare, tDrop: tDrop,
      tBack0: tBack0, tSitL1: tSitL1, tPhone0: tPhone0, tInset0: tInset0, tRes1: tRes1, tStar1: tStar1, tInset2: tInset2, tStar0: tStar0, tFall: tFall,
      tPocket: tPocket, tStomp: tStomp, tTurn: tTurn, tSit0: tSit0, tContact: tContact, tCross: tCross, tFly0: tFly0, tFlyLand: tFlyLand, tGlance: tGlance, DUR: DUR } };
  window.__timelines = window.__timelines || {};
  window.__timelines["main"] = SF.timeline(DUR, render);
})();
