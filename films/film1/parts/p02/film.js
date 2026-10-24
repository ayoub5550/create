/* Sam & Layla Ep. 1 — P02 "Plan B: water / the scarf / Plan C: pep talk" (~59 s). Built on the P01 reference structure.
 * Beat sheet: hard cut in from the title. OPEN WS: Sam fills a bucket bigger than his torso from a garden hose — a
 * trickle; he taps his foot and glares at the hose, shakes it, squeezes the nozzle -> JET, the bucket fills to the brim ->
 * MS: tosses the hose, heaves the bucket barely off the ground, "Plants love water." -> WS: "So..." wind-up (leans back),
 * "MAXIMUM" heave -> a big water arc over the mound DRENCHES Layla (splash, spray). Music dies -> MCU Layla dripping (drops,
 * puddle, dark wet hijab, arms held out stiff) -> Pip on the birdhouse shakes itself dry -> "Wow. Very motivating." ->
 * "Sorry! Too much?" (bucket upside down) -> "I'm fine." she pulls a folding stool from her tote, flicks it open, tosses it
 * over her shoulder without looking (it lands open at x 1420), sits on it on "just..." (squelch), "air-dry." — out come
 * the needles: the scarf (B-story) starts (len 0 -> 40, wet 1 -> 0.25) -> "What are you making?" WS -> "A scarf." (she
 * lifts the tiny piece) -> "Done by lunch?" -> "Done by winter." -> CU Sam, hands on his head: "Winter?!" -> "Slowly. Knit
 * one, purl one." (a click on each word) -> MCU Sam stares at the slow needles (eye twitch) -> "Okay. Plan C." finger up
 * -> "Every champion needs a coach." he pulls a coach cap (whistle on a string) from behind his back and slaps it on,
 * TWEET, kneels by the mound like a coach -> MS low: the inspirational pep talk swells ("strong" flex, "tall" rises) ->
 * "You are... a TREE!" fist up -> RECORD SCRATCH -> WS: nothing happened, he is frozen, crickets -> Pip tilts its head ->
 * "I think it's taking a nap." -> "No naps! Champions don't nap!" he crouches at the mound and blasts the whistle at it
 * (the flag whips, dirt flies) -> smash cut.
 * Beat times derive from the dialogue timeline; score.py uses the same formulas. Everything is a pure function of t. */
(function () {
  "use strict";
  var SF = window.StickFilm, U = SF.u, el = U.el, ramp = U.ramp, clamp = U.clamp, lerp = U.lerp;
  var DATA = window.FILM_DATA, CAST = window.FILM_CAST.characters, SHOTS = window.FILM_SHOTS.shots;
  var CL = Object.assign({ stand: SF.standClip() }, window.FILM_CLIPS || {});
  var K = Kit.lines(DATA), L = K.L, w = K.w, F = Kit.FACE, bump = Kit.bump;
  var DUR = DATA.total, G0 = 820, INK = "#2b2a28";
  function lin(t, a, b) { return clamp((t - a) / (b - a), 0, 1); }

  // ---------- beats (same formulas in score.py) ----------
  var tJet = L.l1.start - 1.8, tFull = L.l1.start - 1.0, tToss = L.l1.start - 0.75;        // OPEN: trickle -> JET -> full -> toss
  var tLift = L.l1.start - 0.1;                                                           // the heavy lift (barely off the ground)
  var tWind0 = w("l1", 3).t0 - 0.1, tHeave = w("l1", 4).t0, tRel = tHeave + 0.2;          // "So..." wind-up, "MAXIMUM" heave
  var tSplash = tRel + 0.55, tPipShake = L.l2.start - 1.25;
  var tDown = L.l4.start - 0.1;                                                           // the bucket is set down (off screen)
  var tBag = L.l4.start + 0.05, tOut = w("l4", 1).t0 - 0.1, tUnf = w("l4", 1).t0 + 0.1;   // stool out of the tote, flicked open
  var tThrow = w("l4", 2).t0 - 0.2, tLand = tThrow + 0.45;                                // tossed over her shoulder, lands open
  var tSit0 = w("l4", 3).t0 + 0.05, tSit1 = w("l4", 3).t1 - 0.1;                          // sits on "just..." (squelch)
  var tBagDown = tSit1 + 0.15, tKnit = w("l4", 4).t0 + 0.25;                              // tote down, needles out on "air-dry."
  var RATE = 2.0;                                                                          // needle clicks per second
  var tStare = L.l10.end + 0.2, tTwitchS = tStare + 0.55;
  var tReach = w("l11", 3).t0 - 0.1, tCapUp = w("l11", 5).t0, tCapOn = w("l11", -1).t0;    // cap from behind his back, slapped on
  var tTweet = L.l11.end + 0.2, tKneel0 = tTweet + 0.55, tKneel1 = tKneel0 + 0.45;         // whistle, then the coach crouch
  var tStep = tKneel0 - 0.42, STEP = 72;                                                   // two quick steps toward the mound
  var tStrong = w("l12", 5).t0, tTall = w("l12", -1).t0;
  var tRise0 = L.l13.start, tTree = w("l13", -1).t0, tScr = L.l13.end;                    // "You are... a TREE!" -> scratch
  var tThaw = L.l14.start - 0.6, tPipTilt = L.l14.start - 1.0;
  var tStomp = w("l15", 1).t0, tPointD = w("l15", 2).t0 - 0.1, tBlow = L.l15.end + 0.12, tBlowEnd = tBlow + 0.75;

  // ---------- staging ----------
  var MX = 1000, XS = 780, XL = 1330, SX = 1420;                                            // Sam · Layla · her stool
  var BX = XS + 80;                                                                        // the bucket on the ground
  var LS = CAST.sam.look, LL = CAST.layla.look;
  var MS = SF.motion({ clips: CL, scale: LS.scale, ground: G0, segments: [{ t0: 0, t1: DUR + 1, clip: "stand", hold: 0 }], anchor: { seg: 0, x: XS, edge: "start" } });
  var ML = SF.motion({ clips: CL, scale: LL.scale, ground: G0, segments: [{ t0: 0, t1: DUR + 1, clip: "stand", hold: 0, f: -1 }], anchor: { seg: 0, x: XL, edge: "start" } });
  var CS = DATA.chars.sam, CY = DATA.chars.layla;

  /* move a hand to a world point (weight w); the elbow is solved by IK so the arm keeps its length */
  function reach(M, J, side, tgt, wt, eside) {
    if (wt <= 0) return;
    var f = J._f || 1, sh = J["sh" + side], h0 = J["ha" + side], l1 = 84 * M.S, l2 = 58 * M.S;
    var h = [lerp(h0[0], tgt[0], wt), lerp(h0[1], tgt[1], wt)], d = Math.hypot(h[0] - sh[0], h[1] - sh[1]), mx = (l1 + l2) * 0.995;
    if (d > mx) h = [sh[0] + (h[0] - sh[0]) * mx / d, sh[1] + (h[1] - sh[1]) * mx / d];
    J["ha" + side] = h; J["el" + side] = Kit.ik(sh, h, l1, l2, eside == null ? -f : eside);
  }
  function rot(v, deg) { var a = deg * Math.PI / 180, c = Math.cos(a), s = Math.sin(a); return [v[0] * c - v[1] * s, v[0] * s + v[1] * c]; }
  function knee(J, side, f) {                                                              // re-solve a knee after moving a foot / hip
    var l1 = 117 * (J._S || 0.74), l2 = 118 * (J._S || 0.74);
    J["kn" + side] = Kit.ik(J["hip" + side], J["ft" + side], l1, l2, f);
  }

  // ---------- the bucket's path (grip = the bail top in Sam's hands; pure function of t) ----------
  var GRIP = 112;
  function bucketHands(t) {                                                                // world target for both hands
    var f = 1, sx = XS;
    var carry = [sx + 66, G0 - 77 - GRIP - 22], wind = [sx - 22, G0 - 210], up = [sx + 112, G0 - 352], hold = [sx + 98, G0 - 135];
    var h = [BX, G0 - 77 - GRIP];
    var k1 = ramp(t, tLift, tLift + 0.5); h = [lerp(h[0], carry[0], k1), lerp(h[1], carry[1], k1)];
    var k2 = ramp(t, tWind0, tHeave); h = [lerp(h[0], wind[0], k2), lerp(h[1], wind[1], k2)];
    var k3 = U.smooth(lin(t, tHeave, tRel + 0.05)); h = [lerp(h[0], up[0], k3), lerp(h[1], up[1], k3)];
    var k4 = ramp(t, tRel + 0.1, tRel + 0.55); h = [lerp(h[0], hold[0], k4), lerp(h[1], hold[1], k4)];
    var wob = (t > tLift - 0.3 && t < tWind0) ? Math.sin(t * (t < tLift ? 40 : 11)) * 3 : 0;
    return [h[0] + wob, h[1] + Math.abs(wob)];
  }
  function bucketState(t) {                                                                // {c: centre, th: degrees, level}
    if (t >= tDown) return { c: [455, G0 - 77], th: 180, level: 0 };
    var hnd = bucketHands(t);
    var th = 22 * ramp(t, tWind0, tHeave) + (100 - 22) * U.smooth(lin(t, tHeave, tRel)) + 80 * ramp(t, tRel, tRel + 0.4);
    var q = 0.6 * U.smooth(lin(t, tHeave, tRel)) + 0.4 * ramp(t, tRel, tRel + 0.45);
    var off = rot([0, GRIP * (1 - q)], th), c = [hnd[0] + off[0], hnd[1] + off[1]];
    if (t < tLift) c = [BX, G0 - 77];
    var lv = t < tJet ? 0.12 + 0.28 * lin(t, 0.3, tJet) : t < tFull ? 0.4 + 0.58 * lin(t, tJet, tFull) : 0.98;
    if (t > tRel) lv = 0.98 * (1 - lin(t, tRel - 0.05, tRel + 0.25));
    return { c: c, th: th, level: lv, hands: hnd };
  }
  function mouthOf(b) { var m = rot([0, -75], b.th); return [b.c[0] + m[0], b.c[1] + m[1]]; }

  // ---------- acting: Sam ----------
  var HEADGRAB = function (J, M, wt) {                                                    // l9: both hands clutching his head
    M.pose(J, { elR: ["neck", 74, -30], haR: ["neck", 58, -106], elL: ["neck", -62, -30], haL: ["neck", -38, -108] }, wt);
  };
  var SAM_ACT = [
    { g: "explain", t0: L.l5.start - 0.15, t1: L.l5.end + 0.2, amp: 0.9 },                // "What are you making?"
    { g: "explain", t0: w("l7", 1).t0 - 0.15, t1: L.l7.end + 0.35, ease: 0.2 },             // "Done by lunch?" one finger
    { g: "raise1", t0: w("l11", 1).t0 - 0.15, t1: tReach + 0.05, ease: 0.15 },             // "Plan C." finger up
    { g: "pointDown", t0: tPointD, t1: tBlow - 0.3, ease: 0.2, amp: 1 }                    // "Champions don't nap!"
  ];
  var BUSY_S = [[0, tDown + 0.1], [L.l9.start - 0.1, L.l9.end + 0.3], [tReach - 0.2, DUR + 1]];
  var SAM_BEATS = CS.beats.filter(function (b) { return !BUSY_S.some(function (r) { return b > r[0] && b < r[1]; }); });
  var EX_S = Kit.expr([[0, [-0.35, -0.95, 0.9]], [tJet - 0.1, [0.75, -0.6, 1.05], 0.15], [tFull, F.excited, 0.2],
    [L.l1.start + 0.1, [0.75, 0.35, 1.05], 0.3], [tWind0, F.scheming, 0.2], [tHeave, [0.95, -0.4, 1.45], 0.1],
    [tSplash + 0.05, F.shock, 0.1], [L.l3.start - 0.2, [0.3, 0.95, 1.05], 0.25], [L.l4.start + 0.2, F.listen, 0.4],
    [L.l5.start - 0.1, F.ask, 0.2], [L.l6.start + 0.3, F.listen, 0.3], [L.l7.start - 0.1, F.hope, 0.2], [L.l8.start + 0.2, F.listen, 0.3],
    [w("l8", -1).t0 + 0.05, F.shock, 0.1], [L.l9.start, F.panic, 0.15], [L.l9.end + 0.2, F.huh, 0.3], [tStare, [-0.35, -0.45, 0.85], 0.4],
    [L.l11.start - 0.05, F.determined, 0.2], [w("l11", 1).t0, F.scheming, 0.2], [tCapOn, F.proud, 0.15], [tTweet - 0.05, [0.1, -0.7, 1.0], 0.1],
    [L.l12.start - 0.1, [0.4, -0.7, 1.05], 0.3], [tStrong - 0.1, F.excited, 0.2], [L.l13.start, F.wow, 0.3], [tTree - 0.05, [0.95, -0.35, 1.5], 0.1],
    [tThaw, [0.2, 0.6, 1.1], 0.6], [L.l14.start + 0.4, F.huh, 0.3], [L.l15.start - 0.1, F.angry, 0.15], [tBlow - 0.1, [-0.2, -1.0, 1.15], 0.1]]);
  var lipS = Talk.mouth(CS.mouth), lipL = Talk.mouth(CY.mouth);
  function blowing(t) { return (t > tTweet - 0.15 && t < tTweet + 0.45) || (t > tBlow - 0.1 && t < tBlowEnd + 0.05); }
  function mouthS(t) {
    if (blowing(t)) return "F";                                                             // lips on the whistle
    if (t > tScr && t < tThaw) return "D";                                                 // frozen mid-shout
    if (t > tSplash + 0.05 && t < L.l2.start - 0.3) return "E";                            // "oh no" o
    return lipS(t);
  }
  var BLINK_S = CS.blinks.filter(function (b) { var b0 = b[0] != null ? b[0] : b; return !(b0 > tScr - 0.2 && b0 < tThaw); })
    .concat([[tThaw + 0.05, 0.09], [tThaw + 0.24, 0.09]]);

  function samCapOn(t) { return t >= tCapOn; }
  function jointsSam(t) {
    var tt = t > tScr && t < tThaw ? tScr : t;                                              // frozen after the record scratch
    var J = MS.joints(tt), f = 1; J._S = MS.S;
    Talk.idle(J, tt, "sam", { amp: 1.1 });
    Talk.act(MS, J, tt, SAM_ACT);
    Talk.beats(MS, J, tt, SAM_BEATS, { amp: CS.gesture });
    Talk.accents(J, tt, CS.accents, 2.6);
    Talk.nods(J, tt, CS.nods, 4.5);
    // OPEN: glares at the trickle (head down to the nozzle), taps his foot, shakes the hose, squeezes -> JET
    var hoseW = 1 - ramp(tt, tToss, tToss + 0.12);
    if (hoseW > 0) {
      var shake = tt > tJet - 0.9 && tt < tJet - 0.3 ? Math.sin(tt * 38) * 9 : 0;
      reach(MS, J, "R", [BX - 14 + shake, G0 - 77 - 75 - 62 + Math.abs(shake) * 0.4], hoseW);
      M_hips(J, MS, hoseW);
      J.head[1] += 4 * hoseW; J.head[0] += 3 * hoseW;
      var tap = tt > 0.35 && tt < tJet - 0.95 ? Math.max(0, Math.sin((tt - 0.35) * 2 * Math.PI * 2.4)) : 0;
      J.ftR[1] -= tap * 9; J.ftR[0] += tap * 4; knee(J, "R", f);
    }
    // the toss: the nozzle flies back over his shoulder
    var tossW = bump(tt, tToss - 0.05, 0.35); if (tossW > 0) reach(MS, J, "R", [XS - 60, G0 - 330], tossW);
    // the bucket: grab, heave, hold upside down (until it is set down off screen)
    var bw = ramp(tt, tToss + 0.15, tToss + 0.45) * (1 - ramp(tt, tDown - 0.05, tDown));
    if (bw > 0) {
      var grab = ramp(tt, tToss + 0.15, tToss + 0.45) * (1 - ramp(tt, tLift, tLift + 0.35));
      Kit.crouch(MS, J, 0.35 * grab + 0.15 * bump(tt, tLift - 0.3, 0.45), { hands: 0 });
      var strain = ramp(tt, tLift, tLift + 0.3) * (1 - ramp(tt, tWind0, tWind0 + 0.3));
      Kit.crouch(MS, J, 0.18 * strain, { hands: 0 }); Kit.lean(MS, J, -8, 0, strain);
      Kit.lean(MS, J, -16, 4, ramp(tt, tWind0, tHeave) * (1 - U.smooth(lin(tt, tHeave, tRel))));      // wind-up: leans back
      Kit.lean(MS, J, 22, 6, U.smooth(lin(tt, tHeave, tRel)) * (1 - ramp(tt, tRel + 0.2, tRel + 0.9)) ); // the heave: lunges in
      var hb = bucketHands(tt);
      reach(MS, J, "R", [hb[0] + 5, hb[1]], bw); reach(MS, J, "L", [hb[0] - 7, hb[1] + 3], bw);
      if (tt > tRel + 0.2) { var hs = bucketState(tt); reach(MS, J, "R", [hs.c[0] + 30, hs.c[1] - 10], bw); reach(MS, J, "L", [hs.c[0] - 30, hs.c[1] - 6], bw); }
    }
    var sorry = ramp(tt, L.l3.start, L.l3.start + 0.3) * (1 - ramp(tt, L.l3.end, L.l3.end + 0.4));
    J.head[1] += sorry * 4; J.neck[1] += sorry * 2;
    // l9: hands on his head, rocks back
    var hg = ramp(tt, L.l9.start - 0.05, L.l9.start + 0.2) * (1 - ramp(tt, L.l9.end - 0.1, L.l9.end + 0.35));
    if (hg > 0) {
      Kit.lean(MS, J, -8 - 3 * Math.sin(tt * 7), 0, hg);
      var HRg = MS.S * 46, hcx = J.head[0], hcy = J.head[1] - HRg * 0.32;
      reach(MS, J, "R", [hcx + HRg * 0.3, hcy - HRg * 1.02], hg, 1); reach(MS, J, "L", [hcx - HRg * 0.8, hcy - HRg * 0.72], hg, -1);
    }
    // stare: slow lean in toward the needles, then pulls back
    Kit.lean(MS, J, 6, 2, ramp(tt, tStare, tStare + 1.0) * (1 - ramp(tt, L.l11.start - 0.2, L.l11.start + 0.1)));
    // l11: cap from behind his back, up, slapped on; then the whistle to his lips
    var cw1 = ramp(tt, tReach, tReach + 0.22) * (1 - ramp(tt, tCapUp - 0.15, tCapUp + 0.1));
    if (cw1 > 0) reach(MS, J, "R", [J.neck[0] - 46 * MS.S, J.neck[1] + 70 * MS.S], cw1, 1);
    var cw2 = ramp(tt, tCapUp - 0.15, tCapUp + 0.15) * (1 - ramp(tt, tCapOn + 0.12, tCapOn + 0.45));
    if (cw2 > 0) {
      var hR = (MS.S * 46) * 1, hx = J.head[0], hy = J.head[1] - hR * 0.32;
      var slap = ramp(tt, tCapOn - 0.18, tCapOn);
      reach(MS, J, "R", [hx + 30 * (1 - slap) + 4, hy - hR * (2.4 - 1.25 * slap)], cw2, 1);
    }
    var dip = bump(tt, tCapOn - 0.02, 0.28); J.head[1] += dip * 9; J.neck[1] += dip * 3; J.head[1] -= bump(tt, tCapOn + 0.24, 0.2) * 3;
    var wh = whistleW(tt);
    if (wh > 0) { var hR2 = MS.S * 46, hy2 = J.head[1] - hR2 * 0.32; reach(MS, J, "R", [J.head[0] + hR2 * 1.25, hy2 + hR2 * 0.75], wh, 1); }
    stepFwd(J, tt, tStep, STEP);
    // coach crouch by the mound (hands on knees), flex on "strong", rising on "tall", standing up on "You are..."
    var kn = ramp(tt, tKneel0, tKneel1) * (1 - 0.45 * ramp(tt, tTall - 0.1, tTall + 0.4)) * (1 - ramp(tt, tRise0 + 0.1, tRise0 + 0.7));
    var flex = ramp(tt, tStrong - 0.15, tStrong + 0.05) * (1 - ramp(tt, tStrong + 0.55, tStrong + 0.8));
    var tall = ramp(tt, tTall - 0.15, tTall + 0.2) * (1 - ramp(tt, tRise0, tRise0 + 0.4));
    var handsOnKnees = 1 - Math.max(flex, tall);
    kneel(J, kn, handsOnKnees);
    if (flex > 0) MS.pose(J, { elR: ["neck", 66, 14], haR: ["neck", 72, -52] }, flex);
    if (tall > 0) MS.pose(J, { elR: ["neck", 70, -20], haR: ["neck", 96, -76] }, tall);
    var fist = ramp(tt, tTree - 0.12, tTree + 0.04) * (1 - ramp(tt, tThaw + 0.3, tThaw + 1.1));
    if (fist > 0) { MS.pose(J, { elR: ["neck", 62, -40], haR: ["neck", 92, -104] }, fist); }
    Kit.lean(MS, J, -6, 0, ramp(tt, w("l13", 1).t0, w("l13", 1).t0 + 0.4) * (1 - ramp(tt, tTree, tTree + 0.1)));   // "are..." chest out
    Kit.hop(J, bump(tt, tTree - 0.05, 0.3) * 18);
    // l15: stomp on "naps!", then down to the mound for the whistle blast
    Kit.hop(J, bump(tt, tStomp - 0.2, 0.22) * 12);
    var dn = ramp(tt, tPointD + 0.4, tBlow - 0.15);
    Kit.crouch(MS, J, dn * 0.5, { hands: 0 }); Kit.lean(MS, J, 10, 6, dn);
    return J;
  }
  function stepFwd(J, t, t0, dist) {
    var a = ramp(t, t0, t0 + 0.22), b = ramp(t, t0 + 0.18, t0 + 0.42), m = (a + b) / 2 * dist;
    if (a <= 0) return;
    J.ftR[0] += a * dist; J.ftR[1] -= bump(t, t0, 0.22) * 10; J.ftL[0] += b * dist; J.ftL[1] -= bump(t, t0 + 0.18, 0.24) * 10;
    ["hips", "hipR", "hipL", "chest", "neck", "head", "shR", "elR", "haR", "shL", "elL", "haL"].forEach(function (j) { J[j][0] += m; });
    knee(J, "R", 1); knee(J, "L", 1);
  }
  function kneel(J, wk, hands) {                                                           // coach kneel: back knee down, front knee up
    if (wk <= 0) return;
    var S = MS.S, f = 1, th = 117 * S, sh = 118 * S;
    var dx = f * 8 * wk, dy = (G0 - th - 8 - J.hips[1]) * wk;
    ["hips", "hipR", "hipL", "chest", "neck", "head", "shR", "elR", "haR", "shL", "elL", "haL"].forEach(function (j) { J[j][0] += dx; J[j][1] += dy; });
    var fR = [J.hipR[0] + f * 56, G0 - 2]; J.ftR = [lerp(J.ftR[0], fR[0], wk), lerp(J.ftR[1], fR[1], wk)]; knee(J, "R", f);
    var kL = [J.hipL[0] - f * 4, G0 - 7], fL = [kL[0] - f * sh * 0.97, G0 - 5];
    J.knL = [lerp(J.knL[0], kL[0], wk), lerp(J.knL[1], kL[1], wk)]; J.ftL = [lerp(J.ftL[0], fL[0], wk), lerp(J.ftL[1], fL[1], wk)];
    Kit.lean(MS, J, 12, 4, wk);
    var hw = wk * hands;
    if (hw > 0) { reach(MS, J, "R", [J.knR[0] + f * 4, J.knR[1] - 10], hw); reach(MS, J, "L", [lerp(J.hipL[0], J.knL[0], 0.5) + f * 14, lerp(J.hipL[1], J.knL[1], 0.5) - 14], hw); }
  }
  function M_hips(J, M, wt) {                                                              // far hand on the hip (impatient)
    M.pose(J, { elL: ["neck", -40, 50], haL: ["neck", -6, 68] }, wt);
  }
  function whistleW(t) {
    return Math.max(ramp(t, tTweet - 0.3, tTweet - 0.08) * (1 - ramp(t, tTweet + 0.45, tTweet + 0.7)),
      ramp(t, tBlow - 0.35, tBlow - 0.1) * (1 - ramp(t, DUR + 0.5, DUR + 1)));
  }

  // ---------- acting: Layla ----------
  var LAYLA_ACT = [];
  var EX_L = Kit.expr([[0, F.calm], [w("l1", 4).t0 + 0.1, F.ask, 0.2], [tSplash, [-0.25, 0.5, 0.22], 0.06], [tSplash + 0.9, F.dead, 0.4],
    [L.l2.start + 0.1, [0.0, -0.2, 0.68], 0.3], [L.l4.start, F.dead, 0.3], [tKnit, F.calm, 0.5], [L.l6.start - 0.1, [0.3, 0.1, 0.9], 0.2],
    [L.l8.start - 0.1, [0.15, -0.1, 0.8], 0.2], [L.l9.start + 0.3, [0.3, 0.05, 0.85], 0.4], [L.l10.start - 0.1, [0.35, 0.25, 0.55], 0.4],
    [L.l11.start, F.calm, 0.4], [L.l14.start - 0.2, F.dead, 0.3], [L.l15.start + 0.3, [0.25, 0.3, 0.85], 0.4]]);
  var BLINK_L = CY.blinks.filter(function (b) { var b0 = b[0] != null ? b[0] : b; return !(b0 > tSplash - 0.2 && b0 < tSplash + 1.0); })
    .concat([[tSplash + 1.3, 0.35], [L.l2.start - 0.15, 0.3]]);                              // slow, offended blinks
  var BUSY_L = [[tSplash, tKnit + 99]];
  var LAYLA_BEATS = CY.beats.filter(function (b) { return !BUSY_L.some(function (r) { return b > r[0] && b < r[1]; }); });
  var STOOL_Y = G0 - 92;
  function sitW(t) { return ramp(t, tSit0, tSit1); }
  function knitW(t) { return ramp(t, tKnit - 0.5, tKnit); }
  function clickAmt(t) {                                                                   // needle tap at each integer phase
    if (t < tKnit) return 0; var ph = (t - tKnit) * RATE, x = ph - Math.floor(ph); return Math.exp(-x * 9);
  }
  function jointsLayla(t) {
    var J = ML.joints(t), f = -1; J._S = ML.S;
    var sw = sitW(t);
    Talk.idle(J, t, "layla", { amp: 0.9 * (1 - 0.5 * ramp(t, tSplash, tSplash + 0.3) * (1 - ramp(t, L.l2.end, L.l2.end + 0.5))) });
    Talk.beats(ML, J, t, LAYLA_BEATS, { amp: CY.gesture });
    Talk.accents(J, t, CY.accents, 2.0);
    Talk.nods(J, t, CY.nods, 4.5);
    // drenched: a flinch (shoulders up, head down), then stiff "wet cat" arms held away from the body
    var fl = ramp(t, tSplash - 0.02, tSplash + 0.06) * (1 - ramp(t, tSplash + 0.3, tSplash + 0.9));
    J.head[1] += fl * 8; J.neck[1] += fl * 3; Kit.lean(ML, J, -6, 0, fl);
    var wc = ramp(t, tSplash + 0.15, tSplash + 0.5) * (1 - ramp(t, tBag - 0.25, tBag));
    if (wc > 0) ML.pose(J, { elR: ["neck", 36, 74], haR: ["neck", 58, 116], elL: ["neck", -30, 74], haL: ["neck", -48, 118] }, wc);
    // "Wow." a slow head turn to camera-side; tiny head shake on "Very motivating."
    J.head[0] += Math.sin(Math.max(0, t - w("l2", 1).t0) * 9) * 2 * bump(t, w("l2", 1).t0, 0.7);
    // the stool: near hand to the tote, out, flick open, toss over the shoulder
    var r1 = ramp(t, tBag, tBag + 0.15) * (1 - ramp(t, tOut, tOut + 0.15));
    if (r1 > 0) reach(ML, J, "R", [J.haL[0] - 8, J.haL[1] - 34], r1);
    var r2 = ramp(t, tOut, tOut + 0.18) * (1 - ramp(t, tThrow - 0.05, tThrow + 0.12));
    if (r2 > 0) ML.pose(J, { elR: ["neck", 30, 62], haR: ["neck", 64, 46] }, r2);
    J.haR[1] -= bump(t, tUnf, 0.25) * 10;                                                   // the flick
    var r3 = bump(t, tThrow - 0.05, 0.4);
    if (r3 > 0) ML.pose(J, { elR: ["neck", -30, -20], haR: ["neck", -52, -92] }, r3);       // over the shoulder
    // sitting down onto the stool (backs onto it without looking; feet stay planted in front)
    if (sw > 0) {
      var dx = (SX - J.hips[0]) * sw, dy = (STOOL_Y - 6 - J.hips[1]) * sw;
      ["hips", "hipR", "hipL", "chest", "neck", "head", "shR", "elR", "haR", "shL", "elL", "haL"].forEach(function (j) { J[j][0] += dx; J[j][1] += dy; });
      ["R", "L"].forEach(function (s, i) {
        var tgt = [SX + f * (80 - 10 * i), G0 - 2];
        J["ft" + s] = [lerp(J["ft" + s][0], tgt[0], sw), lerp(J["ft" + s][1], tgt[1], sw)];
        knee(J, s, f);
      });
      J.head[1] += bump(t, tSit1 - 0.05, 0.3) * 5;                                          // the squelch settle
    }
    // tote down beside the stool (far hand), then the needles come out
    var bd = ramp(t, tSit1 - 0.1, tBagDown) * (1 - ramp(t, tBagDown + 0.1, tBagDown + 0.35));
    if (bd > 0) reach(ML, J, "L", [SX + 30, G0 - 50], bd, 1);
    var kw = knitW(t);
    if (kw > 0) {
      var c = clickAmt(t), lift = (ramp(t, w("l6", 1).t0 - 0.2, w("l6", 1).t0 + 0.1) * (1 - ramp(t, L.l6.end + 0.2, L.l6.end + 0.6))) * 22;
      ML.pose(J, { elR: ["neck", 16, 66], haR: ["neck", 52, 82], elL: ["neck", 4, 70], haL: ["neck", 40, 88] }, kw);
      J.haR[1] -= c * 4 + lift; J.haL[1] += c * 2 - lift; J.haR[0] += f * c * 3;
      J.elR[1] -= lift * 0.5; J.elL[1] -= lift * 0.5;
      J.head[1] += 3 * kw;                                                                  // eyes on the needles
    }
    return J;
  }

  // ---------- world ----------
  var back = document.getElementById("back"), props = document.getElementById("props"), figG = document.getElementById("fig");
  var front = document.getElementById("front"), camG = document.getElementById("cam");
  var Y = FilmSet.yard({ G0: G0, ref: [1040, 560, 1.25], look: "day", season: "summer", garden: { x: MX } });
  // the garden hose (behind the rock): from off the left edge, along the grass, up to his hand
  var hoseG = el("g", {}, back);
  var hoseInk = el("path", { fill: "none", stroke: INK, "stroke-width": 13, "stroke-linecap": "round", "stroke-linejoin": "round" }, hoseG);
  var hoseP = el("path", { fill: "none", stroke: "#4f9a4a", "stroke-width": 8, "stroke-linecap": "round", "stroke-linejoin": "round" }, hoseG);
  var rock = Props.rock(back, 610, G0);
  var stool = Props.stool(back, SX, G0);
  var bh = Kit.birdhouse(back, 1640, G0);
  var puddles = el("g", {}, props);
  var PUD = [0, 1, 2].map(function () { return el("ellipse", { fill: "#8fcbe6", stroke: "#5f9fbf", "stroke-width": 2.5, opacity: 0.85 }, puddles); });
  var mound = Props.mound(props, MX, G0);
  var tree = Props.tree(props, MX - 16, G0 - 26);
  var pip = Props.pip(props);
  var nozG = el("g", {}, back);                                                            // the nozzle (in hand / tossed)
  el("path", { d: "M -6 -14 L 6 -14 L 5 10 L -5 10 Z", fill: "#d9a441", stroke: INK, "stroke-width": 3, "stroke-linejoin": "round" }, nozG);
  el("path", { d: "M -9 -20 L 9 -20 L 6 -12 L -6 -12 Z", fill: "#c4453b", stroke: INK, "stroke-width": 2.5, "stroke-linejoin": "round" }, nozG);
  var bagG = el("g", {}, figG), bag = Kit.bag(bagG);
  var flyStool = el("g", {}, figG);                                                        // the folding stool while in her hand / flying
  var fsLegs = el("path", { fill: "none", stroke: "#8b6a43", "stroke-width": 7, "stroke-linecap": "round" }, flyStool);
  var fsLegs2 = el("path", { fill: "none", stroke: INK, "stroke-width": 2, "stroke-opacity": 0.6, "stroke-linecap": "round" }, flyStool);
  var fsSeat = el("path", { fill: "#2f7f8f", stroke: INK, "stroke-width": 3.5, "stroke-linejoin": "round" }, flyStool);
  var RL = SF.rig(figG, { scale: LL.scale, head: LL.head, ink: LL.ink, color: LL.color, accessories: LL.accessories, backInk: "#5a5751",
    expr: EX_L, blinks: BLINK_L, mouth: lipL, mouthFill: "#8e352d", lineComp: 0.6, seed: 2 });
  var hijab = RL.g.querySelector('path[fill="' + LL.color + '"]');
  var wetG = el("g", {}, figG);                                                            // wet streaks over her hijab
  var STREAK = [0, 1, 2].map(function () { return el("path", { fill: "none", stroke: "#174a54", "stroke-width": 3, "stroke-linecap": "round" }, wetG); });
  var knit = Props.knitting(figG);
  var rigS = { scale: LS.scale, head: LS.head, ink: LS.ink, color: LS.color, backInk: "#5a5751", expr: EX_S, blinks: BLINK_S, mouth: mouthS,
    mouthFill: "#8e352d", lineComp: 0.6, seed: 1 };
  var RS = SF.rig(figG, Object.assign({}, rigS, { accessories: LS.accessories }));
  var RS2 = SF.rig(figG, Object.assign({}, rigS, { accessories: ["scarf", { type: "cap", color: "#33507a" }] }));
  // coach gear: whistle on a string (on his neck after the cap), the cap in his hand before it goes on
  var gear = el("g", {}, figG);
  var wString = el("path", { fill: "none", stroke: "#e8e2d2", "stroke-width": 2.6, "stroke-linecap": "round" }, gear);
  var wBody = el("g", {}, gear);
  el("path", { d: "M -9 -6 L 12 -6 L 12 2 C 12 10, -10 12, -11 2 Z", fill: "#cfd6dc", stroke: INK, "stroke-width": 2.6, "stroke-linejoin": "round" }, wBody);
  el("path", { d: "M 12 -6 L 22 -6 L 22 -1 L 12 -1", fill: "#cfd6dc", stroke: INK, "stroke-width": 2.4, "stroke-linejoin": "round" }, wBody);
  el("circle", { cx: -1, cy: 3, r: 2.6, fill: INK }, wBody);
  var fistC = el("circle", { r: 9, fill: "#fbfaf6", stroke: INK, "stroke-width": 4 }, figG);
  var blast = el("path", { fill: "none", stroke: INK, "stroke-width": 4.5, "stroke-linecap": "round" }, gear);
  var capHand = el("g", {}, gear);
  el("path", { d: "M -24 0 C -24 -26, 24 -26, 24 0 Z", fill: "#33507a", stroke: INK, "stroke-width": 3, "stroke-linejoin": "round" }, capHand);
  el("path", { d: "M 18 -2 L 42 2", stroke: "#24395a", "stroke-width": 7, "stroke-linecap": "round" }, capHand);
  el("circle", { cx: 0, cy: -19, r: 3, fill: "#24395a" }, capHand);
  // the bucket (drawn over Sam: it is in front of him)
  var bucketG = el("g", {}, figG);
  var defs = document.querySelector("#stage defs");
  var clip = el("clipPath", { id: "p02rim" }, defs); el("ellipse", { cx: 0, cy: -75, rx: 64, ry: 15 }, clip);
  var bucket = el("g", {}, bucketG);
  el("path", { d: "M -66 -70 C -60 -128, 60 -128, 66 -70", fill: "none", stroke: "#6c7a86", "stroke-width": 5, "stroke-linecap": "round" }, bucket);   // bail
  el("path", { d: Ink.path([[-66, -75], [66, -75], [52, 75], [-52, 75]], { wobble: 0.5, step: 12, seed: 61, closed: true }), fill: "#a9bccb", stroke: INK, "stroke-width": 4.5, "stroke-linejoin": "round" }, bucket);
  el("path", { d: "M -61 -36 L 61 -36 M -55 42 L 55 42", stroke: "#7f94a6", "stroke-width": 5, fill: "none" }, bucket);
  el("path", { d: "M -36 -60 L -28 60", stroke: "#ffffff", "stroke-width": 7, "stroke-opacity": 0.45, "stroke-linecap": "round" }, bucket);
  var rimOpen = el("g", {}, bucket);                                                      // seen from above: the open rim + water
  el("ellipse", { cx: 0, cy: -75, rx: 64, ry: 15, fill: "#56636e", stroke: INK, "stroke-width": 4 }, rimOpen);
  var waterIn = el("g", { "clip-path": "url(#p02rim)" }, rimOpen);
  var wSurf = el("ellipse", { fill: "#7cc4ea", stroke: "#4f9fca", "stroke-width": 2.5 }, waterIn);
  el("ellipse", { cx: 0, cy: -75, rx: 64, ry: 15, fill: "none", stroke: INK, "stroke-width": 4 }, rimOpen);
  var rimFlat = el("path", { d: "M -66 -75 L 66 -75", stroke: INK, "stroke-width": 4.5, "stroke-linecap": "round" }, bucket);   // upside down
  var botTop = el("path", { d: "M -52 75 L 52 75", stroke: INK, "stroke-width": 4.5, "stroke-linecap": "round" }, bucket);
  el("circle", { cx: -66, cy: -70, r: 5, fill: "#6c7a86", stroke: INK, "stroke-width": 2 }, bucket);
  el("circle", { cx: 66, cy: -70, r: 5, fill: "#6c7a86", stroke: INK, "stroke-width": 2 }, bucket);
  // water: hose stream, the big arc, spray, drips (front layer)
  var waterG = el("g", {}, front);
  var streamInk = el("path", { fill: "none", stroke: "#4f9fca", "stroke-linecap": "round" }, waterG);
  var stream = el("path", { fill: "none", stroke: "#bfe6f7", "stroke-linecap": "round" }, waterG);
  var arcP = el("path", { fill: "#8fd0ef", stroke: "#3f8fbd", "stroke-width": 3.5, "stroke-linejoin": "round" }, waterG);
  var arcHi = el("path", { fill: "none", stroke: "#e9f7fd", "stroke-width": 5, "stroke-linecap": "round" }, waterG);
  var crown = el("path", { fill: "#bfe6f7", stroke: "#3f8fbd", "stroke-width": 3.5, "stroke-linejoin": "round" }, waterG);
  var DROPS = []; for (var i = 0; i < 44; i++) DROPS.push(el("path", { d: "M 0 -9 C 5 -2, 6 3, 0 6 C -6 3, -5 -2, 0 -9 Z", fill: "#9ad6f0", stroke: "#3f8fbd", "stroke-width": 1.8 }, waterG));
  var fx = Kit.emanata(front);

  // ---------- Pip: on the birdhouse perch the whole part (never on the fence) ----------
  var PIP_AT = bh.perch;
  function pipState(t) {
    var ch = 0;[tSplash + 0.3, tPipShake + 0.85, tPipTilt + 0.45].forEach(function (c) { if (t > c && t < c + 0.18) ch = (t - c) / 0.18; });
    var sh = t > tPipShake && t < tPipShake + 0.75 ? Math.sin((t - tPipShake) * 2 * Math.PI * 9) : 0;
    var tilt = sh * 28 + ramp(t, tPipTilt, tPipTilt + 0.2) * (1 - ramp(t, L.l14.start + 0.6, L.l14.start + 1.0)) * 26;
    var hopK = (t - tSplash - 0.15) / 0.3;
    return { x: PIP_AT[0] + sh * 4, y: PIP_AT[1], f: -1, t: t, pose: hopK > 0 && hopK < 1 ? "hop" : "perch", hop: hopK, chirp: ch, tilt: tilt, seed: 1 };
  }

  // ---------- camera ----------
  var H0 = { sam: G0 - Kit.headInfo(MS.joints(0), RS, G0).top, layla: G0 - Kit.headInfo(ML.joints(0), RL, G0).top };
  function resolve(id, t) {
    if (id === "mound") return { head: [MX, G0 - 60], top: G0 - 120, feet: G0, f: 1, h: H0.sam };
    if (id === "pip") return { head: [PIP_AT[0], PIP_AT[1]], top: PIP_AT[1] - 40, feet: PIP_AT[1] + 24, f: -1, h: 120 };
    var c = id === "sam" ? Kit.headInfo(jointsSam(t), RS, G0) : Kit.headInfo(jointsLayla(t), RL, G0); c.h = H0[id]; return c;
  }
  var BAG_HAND = jointsLayla(tBagDown).haL;
  var cam = Shots.camera(SHOTS, { width: 1920, height: 1080, duration: DUR, resolve: resolve });

  // ---------- water helpers ----------
  var P0 = mouthOf(bucketState(tRel)), JLs = jointsLayla(tSplash), HL = Kit.headInfo(JLs, RL, G0);
  var P1 = [HL.head[0] + 6, HL.head[1] - RL.HR * 0.6];
  function arcAt(s) { return [lerp(P0[0], P1[0], s), lerp(P0[1], P1[1], s) - 230 * 4 * s * (1 - s)]; }
  function wetness(t) { return t < tSplash ? 0 : 1 - 0.7 * lin(t, tSplash + 2, DUR); }
  function drop(i, x, y, s, r) {
    var d = DROPS[i]; if (!d) return;
    if (s <= 0) { d.setAttribute("visibility", "hidden"); return; }
    d.setAttribute("visibility", "visible"); d.setAttribute("transform", "translate(" + x.toFixed(1) + " " + y.toFixed(1) + ") rotate(" + (r || 0).toFixed(0) + ") scale(" + s.toFixed(2) + ")");
  }

  function render(t) {
    var c = cam.apply(camG, t); Y.update(t, c);
    var JL = jointsLayla(t), JS = jointsSam(t), capOn = samCapOn(t);
    RL.set(JL, t, { zoom: c[2] });
    (capOn ? RS2 : RS).set(JS, t, { zoom: c[2] });
    RS.g.setAttribute("display", capOn ? "none" : "inline"); RS2.g.setAttribute("display", capOn ? "inline" : "none");   // display, not visibility: the rig sets visibility on its own children
    var R = capOn ? RS2 : RS, HR = R.HR, hs = Kit.headInfo(JS, R, G0), hl = Kit.headInfo(JL, RL, G0);
    mound.set(t, { wind: t > tBlow && t < tBlowEnd + 0.2 ? 5 : 1 }); tree.set(0, t, { season: "summer" });
    pip.set(pipState(t));

    // hose + nozzle
    var hx = JS.haR, inHand = t < tToss + 0.05, tf = lin(t, tToss + 0.05, tToss + 0.7);
    var noz = inHand ? [hx[0], hx[1] + 14] : [lerp(hx[0], 470, U.smooth(tf)), lerp(hx[1], G0 - 10, tf) - Math.sin(Math.PI * tf) * 190];
    if (!inHand && tf >= 1) noz = [470, G0 - 10];
    nozG.setAttribute("transform", "translate(" + noz[0].toFixed(1) + " " + noz[1].toFixed(1) + ") rotate(" + (inHand ? 8 : 8 + 540 * tf) + ")");
    var hp = Ink.path([[-200, G0 - 4], [200, G0 - 7], [Math.min(480, noz[0] - 90), G0 - 3], [Math.min(noz[0] - 40, 700), G0 - 6], [noz[0] - 18, Math.min(G0 - 8, noz[1] + 70)], [noz[0], noz[1] - 16]], { wobble: 0.5, step: 18, seed: 44 });
    hoseInk.setAttribute("d", hp); hoseP.setAttribute("d", hp);
    // hose water: a trickle -> squeeze -> JET (until the toss); a dribble on the grass after
    var st = t < tToss ? (t < tJet ? 0.25 + 0.1 * Math.sin(t * 13) : 1) : 0;
    if (st > 0) {
      var b = bucketState(t), sy = b.c[1] - 75 + (1 - b.level) * 6, pts = [], n = 8;
      for (var k = 0; k <= n; k++) { var q = k / n; pts.push([lerp(noz[0], b.c[0] - 8, q) + Math.sin(t * 30 + q * 9) * 2.2 * st, lerp(noz[1] + 10, sy, q)]); }
      var sd = Ink.path(pts, { wobble: 0.6, step: 8, seed: 3 + Math.floor(t * 15) % 4 });
      stream.setAttribute("d", sd); streamInk.setAttribute("d", sd);
      stream.setAttribute("stroke-width", (3 + 9 * st).toFixed(1)); streamInk.setAttribute("stroke-width", (6 + 11 * st).toFixed(1));
      stream.setAttribute("stroke-dasharray", st < 0.5 ? "10 7" : "none"); stream.setAttribute("stroke-dashoffset", (-t * 160).toFixed(0));
      stream.setAttribute("visibility", "visible"); streamInk.setAttribute("visibility", "visible");
    } else { stream.setAttribute("visibility", "hidden"); streamInk.setAttribute("visibility", "hidden"); }

    // the bucket
    var bs = bucketState(t);
    bucket.setAttribute("transform", "translate(" + bs.c[0].toFixed(1) + " " + bs.c[1].toFixed(1) + ") rotate(" + bs.th.toFixed(1) + ")");
    var up = bs.th < 125; rimOpen.setAttribute("visibility", up ? "visible" : "hidden");
    rimFlat.setAttribute("visibility", up ? "hidden" : "visible"); botTop.setAttribute("visibility", up ? "hidden" : "visible");
    var lv = bs.level, slosh = (t > tLift && t < tRel) ? Math.sin(t * 9) * 3 : 0;
    wSurf.setAttribute("cx", slosh.toFixed(1)); wSurf.setAttribute("cy", (-75 + (1 - lv) * 30).toFixed(1));
    wSurf.setAttribute("rx", (64 - (1 - lv) * 10).toFixed(1)); wSurf.setAttribute("ry", (14 - (1 - lv) * 3).toFixed(1));
    wSurf.setAttribute("visibility", lv > 0.02 ? "visible" : "hidden");

    // the big water arc
    var sh = lin(t, tRel, tSplash), stl = lin(t, tRel + 0.17, tSplash + 0.12);
    if (t > tRel && stl < 1) {
      var top = [], bot = [], N = 16;
      for (var k2 = 0; k2 <= N; k2++) {
        var s = lerp(stl, sh, k2 / N), p = arcAt(s), p2 = arcAt(Math.min(1, s + 0.01)), dx = p2[0] - p[0], dy = p2[1] - p[1], dl = Math.hypot(dx, dy) || 1;
        var wv = (6 + 24 * Math.sin(Math.PI * k2 / N)) * (0.6 + 0.4 * (1 - stl)), wb = Math.sin(k2 * 1.7 + t * 30) * 3;
        top.push([p[0] - dy / dl * (wv + wb), p[1] + dx / dl * (wv + wb)]); bot.push([p[0] + dy / dl * wv, p[1] - dx / dl * wv]);
      }
      arcP.setAttribute("d", Ink.path(top.concat(bot.reverse()), { wobble: 0.6, step: 14, seed: 8, closed: true }));
      arcHi.setAttribute("d", Ink.path(top.slice(3, N - 3).map(function (p, i) { return [p[0], p[1] + 9]; }), { wobble: 0.3, step: 14, seed: 9 }));
      arcP.setAttribute("visibility", "visible"); arcHi.setAttribute("visibility", "visible");
    } else { arcP.setAttribute("visibility", "hidden"); arcHi.setAttribute("visibility", "hidden"); }
    // the splash crown on her head + spray
    var ck = lin(t, tSplash, tSplash + 0.45);
    if (ck > 0 && ck < 1) {
      var cx0 = hl.head[0], cy0 = hl.top + 10, cp = [], rr = 30 + 90 * Math.sqrt(ck);
      for (var a = 0; a <= 12; a++) { var an = Math.PI * (1.05 + a / 12 * 0.9), ro = a % 2 ? rr * 0.55 : rr; cp.push([cx0 + Math.cos(an) * ro * 1.3, cy0 + Math.sin(an) * ro * (1 - 0.3 * ck)]); }
      crown.setAttribute("d", Ink.path(cp, { wobble: 0.5, step: 10, seed: 12, closed: true })); crown.setAttribute("visibility", "visible");
      crown.setAttribute("opacity", (1 - ck * ck).toFixed(2));
    } else crown.setAttribute("visibility", "hidden");
    var di = 0;
    for (var jb = 0; jb < 4; jb++) {
      var ab = lin(t, tSplash + 0.02 * jb, tSplash + 0.55 + 0.04 * jb), xb = lerp(hl.head[0], PIP_AT[0] - 30 + jb * 22, ab), yb = lerp(hl.top, PIP_AT[1] - 30 + jb * 6, ab) - Math.sin(Math.PI * ab) * 120;
      drop(di++, xb, yb, ab > 0 && ab < 1 ? 1.1 : 0, 90 + ab * 60);
    }
    for (var j = 0; j < 18; j++) {                                                        // spray (some reach the birdhouse)
      var age = t - tSplash, vx = (U.hash(j + 3) - 0.35) * (j < 4 ? 700 : 420), vy = -260 - U.hash(j + 9) * 380;
      var ok = age > 0 && age < 1.1, x = hl.head[0] + vx * age, y = hl.top + 10 + vy * age + 900 * age * age;
      drop(di++, x, y, ok && y < G0 ? 0.8 + U.hash(j) * 0.7 : 0, Math.atan2(vy + 1800 * age, vx) * 57 + 90);
    }
    // the bucket's last drips while it is held upside down (l3)
    for (var j2 = 0; j2 < 3; j2++) {
      var pd = 0.9, t0 = tRel + 0.5 + j2 * 0.35, ph = (t - t0) % pd, mo = mouthOf(bs);
      var on = t > t0 && t < L.l3.end && bs.th > 150, yy = mo[1] + 6 + 0.5 * 1500 * ph * ph;
      drop(di++, mo[0] - 20 + j2 * 20, yy, on && yy < G0 ? 0.9 : 0, 0);
    }
    // Layla drips (rate follows how wet she still is)
    var wet = wetness(t);
    var SRC = [[hl.head[0] - 30, hl.head[1] + HR * 1.6], [hl.head[0] + 22, hl.head[1] + HR * 1.75], [JL.haR[0], JL.haR[1] + 4], [JL.haL[0], JL.haL[1] + 4],
      [JL.elR[0], JL.elR[1] + 6], [hl.head[0] - 48, hl.head[1] + HR * 0.9], [JL.hips[0] + 4, JL.hips[1] + 10]];
    SRC.forEach(function (sp, k) {
      for (var m = 0; m < 2; m++) {
        var per = (0.55 + U.hash(k * 7 + m) * 0.5) / Math.max(0.25, wet), off = U.hash(k * 3 + m * 11) * per, ag = ((t - tSplash - 0.2 + off) % per);
        var yy2 = sp[1] + 0.5 * 1500 * ag * ag, vis = t > tSplash + 0.2 && wet > 0.28 && yy2 < G0 - 2 && ag < per * 0.8;
        drop(di++, sp[0] + (m ? 3 : -2), yy2, vis ? 0.75 : 0, 0);
      }
    });
    for (; di < DROPS.length; di++) drop(di, 0, 0, 0, 0);
    // puddles: where she stood, under the stool, and under the hose nozzle
    var p1 = 0.75 * ramp(t, tSplash + 0.05, tSplash + 0.35) + 0.25 * ramp(t, tSplash + 0.35, tSplash + 2.5), p2 = ramp(t, tSit1, tSit1 + 6) * 0.7, p3 = ramp(t, tToss + 0.5, tToss + 3);
    [[XL - 4, G0 + 2, 86 * p1, 11 * p1], [SX - 6, G0 + 3, 60 * p2, 8 * p2], [470, G0 + 1, 34 * p3, 6 * p3]].forEach(function (pd, k) {
      PUD[k].setAttribute("cx", pd[0]); PUD[k].setAttribute("cy", pd[1]); PUD[k].setAttribute("rx", Math.max(0.1, pd[2]).toFixed(1)); PUD[k].setAttribute("ry", Math.max(0.1, pd[3]).toFixed(1));
      PUD[k].setAttribute("visibility", pd[2] > 1 ? "visible" : "hidden");
    });
    // wet hijab: darker + streaks
    if (hijab) hijab.setAttribute("fill", wet > 0 ? FilmSet.mixHex(LL.color, "#1b5761", wet) : LL.color);
    STREAK.forEach(function (p, k) {
      var x0 = hl.head[0] + (14 + k * 16) * 1 - 4, y0 = hl.head[1] - HR * (0.2 - k * 0.15);
      p.setAttribute("d", wet > 0 ? "M " + (x0 + 6).toFixed(1) + " " + (y0 + HR * 0.2).toFixed(1) + " q -4 " + (HR * 0.35).toFixed(1) + " 2 " + (HR * 0.7).toFixed(1) : "M 0 0");
      p.setAttribute("opacity", (wet * 0.8).toFixed(2)); p.setAttribute("stroke-width", (3 / Math.pow(c[2], 0.6)).toFixed(2));
      p.setAttribute("visibility", wet > 0.05 ? "visible" : "hidden");
    });
    wetG.setAttribute("transform", "");

    // tote: in her far hand -> set down beside the stool
    var hb = JL.haL, onGround = t > tBagDown, bpos = [hb[0] - 4, Math.min(hb[1] + 6, G0 - 42)];
    if (onGround) { var hd = BAG_HAND, fall = ramp(t, tBagDown, tBagDown + 0.12); bpos = [hd[0] - 4 + 22 * fall, lerp(Math.min(hd[1] + 6, G0 - 42), G0 - 42, fall)]; }
    bag.set(bpos[0], bpos[1], { rot: onGround ? 0 : Math.sin(t * 5) * 1.5 });

    // the folding stool: in her hand (folded) -> flick open -> tossed over her shoulder -> lands open (Props.stool takes over)
    var landed = t >= tLand;
    stool.g.setAttribute("visibility", landed ? "visible" : "hidden");
    var showFly = t > tOut && !landed;
    flyStool.setAttribute("visibility", showFly ? "visible" : "hidden");
    if (showFly) {
      var u = ramp(t, tUnf, tUnf + 0.22), hh = 92 + (1 - u) * 14, pos, rt = 0;
      if (t < tThrow - 0.05) { pos = [JL.haR[0], JL.haR[1] - 6]; rt = (1 - u) * -70; }
      else {
        var tq = lin(t, tThrow - 0.05, tLand), JT = jointsLayla(tThrow - 0.05), p0 = [JT.haR[0], JT.haR[1] - 6], p1q = [SX, STOOL_Y];
        pos = [lerp(p0[0], p1q[0], tq), lerp(p0[1], p1q[1], tq) - Math.sin(Math.PI * tq) * 240]; rt = -360 * U.smooth(tq);
      }
      var sx2 = 34 * u, tx2 = 30 * u + 3;
      fsLegs.setAttribute("d", "M " + (-sx2 - 3) + " " + hh + " L " + tx2 + " 8 M " + (sx2 + 3) + " " + hh + " L " + (-tx2) + " 8");
      fsLegs2.setAttribute("d", fsLegs.getAttribute("d"));
      var sw2 = 44 * u + 8;
      fsSeat.setAttribute("d", "M " + (-sw2) + " 0 L " + sw2 + " 0 L " + (sw2 - 4) + " 12 L " + (-sw2 + 4) + " 12 Z");
      flyStool.setAttribute("transform", "translate(" + pos[0].toFixed(1) + " " + pos[1].toFixed(1) + ") rotate(" + rt.toFixed(1) + " 0 " + (hh / 2) + ")");
    }

    // knitting (B-story): needles from "air-dry.", scarf 0 -> 40 px, wet 1 -> 0.25
    var kn = knitW(t);
    var ph = (t - tKnit) * RATE;
    knit.set(JL, { len: 10 + 30 * lin(t, tKnit, DUR), click: kn > 0 ? (ph - Math.floor(ph)) * 0.5 : 0, wet: 1 - 0.75 * lin(t, tKnit, DUR), G0: G0, hidden: kn < 0.5 });
    knit.g.setAttribute("display", kn < 0.5 ? "none" : "inline");

    // coach gear
    var N = JS.neck, f = 1, wh = whistleW(t);
    var hy = JS.head[1] - HR * 0.32, mouthP = [JS.head[0] + HR * 0.62, hy + HR * 0.42];
    var chestP = [N[0] + f * HR * 0.25, N[1] + HR * 0.95];
    var wp = [lerp(chestP[0], mouthP[0] + HR * 0.45, wh), lerp(chestP[1], mouthP[1] + 2, wh)];
    gear.setAttribute("visibility", t > tReach ? "visible" : "hidden");
    var showW = t >= tCapOn;
    wBody.setAttribute("visibility", showW || t > tReach ? "visible" : "hidden");
    var capIn = t > tReach + 0.15 && t < tCapOn, capInW = false;
    var wpos = showW ? wp : [JS.haR[0] + 4, JS.haR[1] + 26];
    wBody.setAttribute("transform", "translate(" + wpos[0].toFixed(1) + " " + wpos[1].toFixed(1) + ") rotate(" + (showW ? -8 * wh : 20) + ") scale(" + (-0.9 / Math.pow(c[2], 0.15)).toFixed(2) + " " + (0.9 / Math.pow(c[2], 0.15)).toFixed(2) + ")");
    wBody.setAttribute("visibility", showW ? "visible" : "hidden");
    wString.setAttribute("d", showW ? "M " + (N[0] - HR * 0.3).toFixed(1) + " " + (N[1] + 2).toFixed(1) + " Q " + (N[0] - HR * 0.05).toFixed(1) + " " + (N[1] + HR * 0.9).toFixed(1) + " " + (wpos[0] - 8).toFixed(1) + " " + (wpos[1] - 4).toFixed(1) +
      " M " + (N[0] + HR * 0.32).toFixed(1) + " " + (N[1] - 2).toFixed(1) + " Q " + (N[0] + HR * 0.45).toFixed(1) + " " + (N[1] + HR * 0.6).toFixed(1) + " " + (wpos[0] - 8).toFixed(1) + " " + (wpos[1] - 4).toFixed(1)
      : capInW ? "M " + JS.haR[0].toFixed(1) + " " + (JS.haR[1] - 4).toFixed(1) + " L " + (wpos[0] - 6).toFixed(1) + " " + (wpos[1] - 5).toFixed(1) : "M 0 0");
    capHand.setAttribute("visibility", capIn ? "visible" : "hidden");
    if (capIn) capHand.setAttribute("transform", "translate(" + JS.haR[0].toFixed(1) + " " + (JS.haR[1] - 4).toFixed(1) + ") scale(" + (HR / 33).toFixed(2) + ")");

    var fw = ramp(t > tScr && t < tThaw ? tScr : t, tTree - 0.12, tTree + 0.04) * (1 - ramp(t, tThaw + 0.3, tThaw + 1.1));
    fistC.setAttribute("visibility", fw > 0.5 ? "visible" : "hidden");
    fistC.setAttribute("cx", JS.haR[0].toFixed(1)); fistC.setAttribute("cy", JS.haR[1].toFixed(1)); fistC.setAttribute("r", (HR * 0.3).toFixed(1));
    fistC.setAttribute("stroke-width", (4 / Math.pow(c[2], 0.6)).toFixed(2));
    var bl = (t > tTweet && t < tTweet + 0.4) || (t > tBlow && t < tBlowEnd);
    if (bl) {
      var jt = Math.sin(t * 60) * 3, bx = wp[0] + HR * 0.55, by = wp[1], d2 = "";
      [-0.5, 0, 0.5].forEach(function (k) { d2 += "M " + (bx + 6).toFixed(1) + " " + (by + k * HR * 0.7 + jt).toFixed(1) + " L " + (bx + HR * 1.1).toFixed(1) + " " + (by + k * HR * 1.3 + jt).toFixed(1) + " "; });
      blast.setAttribute("d", d2); blast.setAttribute("visibility", "visible"); blast.setAttribute("stroke-width", (4.5 / Math.pow(c[2], 0.6)).toFixed(2));
    } else blast.setAttribute("visibility", "hidden");
    // emanata
    var fS = 1;
    fx.set({
      lines: (t > tSplash && t < tSplash + 0.45) ? { x: hl.head[0], y: hl.head[1], r: HR * (1.5 + 0.6 * lin(t, tSplash, tSplash + 0.45)), n: 7, amp: 30 * (1 - lin(t, tSplash, tSplash + 0.45)) }
        : (t > L.l9.start && t < L.l9.start + 0.6) ? { x: hs.head[0], y: hs.head[1], r: HR * (1.5 + 0.6 * lin(t, L.l9.start, L.l9.start + 0.6)), n: 7, amp: 32 * (1 - lin(t, L.l9.start, L.l9.start + 0.6)) }
        : null,
      twitch: t > tTwitchS && t < tTwitchS + 0.7 ? { x: hs.head[0] + fS * HR * 0.2, y: hs.head[1] + 4, k: 1 } : null,
      sweat: t > L.l3.start && t < L.l3.end ? { x: hs.head[0] - HR * 0.75, y: hs.head[1] - HR * 0.3, k: ramp(t, L.l3.start, L.l3.end) } : null,
      puff: (t > tBlow + 0.05 && t < tBlow + 0.5) ? { x: MX - 10, y: G0 - 18, k: (t - tBlow - 0.05) / 0.45, s: 0.8 }
        : (t > tBlow + 0.45 && t < tBlow + 0.95) ? { x: MX + 40, y: G0 - 14, k: (t - tBlow - 0.45) / 0.5, s: 1.0 }
        : (t > tLand && t < tLand + 0.45) ? { x: SX, y: G0 - 4, k: (t - tLand) / 0.45, s: 0.55 }
        : (t > tStomp - 0.05 && t < tStomp + 0.45) ? { x: JS.ftR[0], y: G0 - 4, k: (t - tStomp + 0.05) / 0.5, s: 0.6 } : null,
      sparkle: (t > tCapOn && t < tCapOn + 0.4) ? { x: hs.head[0] + 10, y: hs.top - 6, k: (t - tCapOn) / 0.4, s: 1.1 } : null
    }, t);
  }
  window.__film = { MS: MS, ML: ML, RS: RS, RL: RL, cam: cam, resolve: resolve, jointsSam: jointsSam, jointsLayla: jointsLayla, bh: bh,
    beats: { tJet: tJet, tFull: tFull, tToss: tToss, tLift: tLift, tWind0: tWind0, tHeave: tHeave, tRel: tRel, tSplash: tSplash, tPipShake: tPipShake,
      tOut: tOut, tUnf: tUnf, tThrow: tThrow, tLand: tLand, tSit1: tSit1, tBagDown: tBagDown, tKnit: tKnit, tStare: tStare, tTwitchS: tTwitchS,
      tReach: tReach, tCapOn: tCapOn, tTweet: tTweet, tKneel0: tKneel0, tStrong: tStrong, tTall: tTall, tTree: tTree, tScr: tScr, tThaw: tThaw,
      tPipTilt: tPipTilt, tStomp: tStomp, tBlow: tBlow, tBlowEnd: tBlowEnd, DUR: DUR } };
  window.__timelines = window.__timelines || {};
  window.__timelines["main"] = SF.timeline(DUR, render);
})();
