/* Sam & Layla Ep. 1 — P03 "Plan D: plant food / Plan E: music" (~52 s). Built on the P01 reference structure.
 * Data: FILM_DATA (dialogue.py) · FILM_CAST (cast.json) · FILM_SHOTS (shots.json, word-anchored) · FILM_CLIPS (walk, sit,
 * dance = CMU 120_05 "Mickey dance"). Shared: common/set.js (yard, look "day"), props.js (mound, tree g=0, Pip, knitting,
 * stool), kit.js (lines, faces, crouch, emanata, birdhouse). Local props drawn here: wheelbarrow + "PLANT FOOD XXL" sack, the
 * plant-food MOUNTAIN, three cartoon flies, a shovel + flying dirt clods, the chunky BOOMBOX (pulsing speakers), a
 * screen-space diagonal WIPE, wind lines.
 * Beat sheet: WS, Sam rolls in a squeaky wheelbarrow with a huge sack ("Plan D. Plant food!"), Layla knits on her stool ->
 * "How much plant food?" (she looks up) -> "All of it." he tips it: a mountain buries the mound (dust puff, thud, shake)
 * -> cutaway: Pip flees the birdhouse -> flies circle the mountain -> "That's a mountain." -> "Big tree. Big appetite."
 * (hands on hips, smug) -> she pinches her nose, smell lines -> CU Sam sniffs... gags -> diagonal WIPE: speed-shovel
 * montage, the pile shrinks, shovel tossed -> he zips out and back in DRAGGING a boombox -> "Plan E. Plants love music!"
 * -> SLAMS play: groove -> THE DANCE (mocap); Pip returns and head-bobs; Layla's needles click on the beat, her foot taps
 * -> "Feel the beat, little buddy!" -> "It doesn't have ears." -> "Then it'll feel the BASS!" he cranks it: the boombox
 * hops, the mound shakes, wind lines, Layla's scarf flaps out sideways, Pip is blown off tumbling -> the boombox topples:
 * "bwomp" — silence -> CU Layla, windswept deadpan: "I think it prefers jazz." -> crickets.
 * Beat times derive from the dialogue timeline; score.py uses the same formulas. Everything is a pure function of t. */
(function () {
  "use strict";
  var SF = window.StickFilm, U = SF.u, el = U.el, ramp = U.ramp, hash = U.hash, lerp = U.lerp, clamp = U.clamp;
  var DATA = window.FILM_DATA, CAST = window.FILM_CAST.characters, SHOTS = window.FILM_SHOTS.shots;
  var CL = Object.assign({ stand: SF.standClip() }, window.FILM_CLIPS || {});
  var K = Kit.lines(DATA), L = K.L, w = K.w, F = Kit.FACE, bump = Kit.bump;
  var DUR = DATA.total, G0 = 820, INK = "#2b2a28";
  function ip(pts, o) { return Ink.path(pts, Object.assign({ wobble: 0.7, step: 10 }, o || {})); }

  // ---------- beats (same formulas in score.py) ----------
  var tArr = w("l1", 2).t0 - 0.15;                               // wheelbarrow parked on "Plant food!"
  var tLift = L.l3.start - 0.1, tTip = w("l3", 2).t0, tDump = tTip + 0.22;   // "All of it." -> tips it on "it."
  var tDrop = tTip + 0.95, tRel = tDrop + 0.35;
  var tFlee = tDump + 0.55;
  var tPipBack = L.l11.end + 0.6, tPipPerch = tPipBack + 1.0;      // the button: Pip lands on the fallen boombox                                      // Pip bolts from the birdhouse
  var tPinch0 = L.l6.start - 0.25, tPinch1 = L.l6.end + 0.35;
  var tSniff = L.l6.end + 0.2, tGag = tSniff + 0.8, tWipe = tGag + 1.05, WD = 0.5, tSwap = tWipe + WD / 2;
  var NSC = 6, SCOOP = 0.25, tMontEnd = tSwap + NSC * SCOOP;    // six scoops, 4 per second
  var tToss = tMontEnd + 0.05, tTurn = tToss + 0.2, tZip = tTurn + 0.12, tBack = tZip + 0.42;
  var tArr2 = L.l7.start - 0.1;                                  // the boombox is in place
  var tPlay = L.l7.end + 0.3;                                    // SLAM play
  var BPM = 104, BEAT = 60 / BPM, tMus = tPlay;           // the groove (score.py: T.cue("groove") at tMus)
  var tDance = tPlay + 0.4;
  var tPipIn = tPlay + 1.4, tPipLand = tPlay + 2.5;
  var tCrank0 = L.l10.start - 0.35, tTwist = w("l10", 2).t0 - 0.05, tBass = w("l10", 4).t1 - 0.05;   // the blast lands right AFTER "bass!" (keeps the word clear)
  var tBlow = tBass + 0.35, tTopple = tBass + 1.45, tFallen = tTopple + 0.3;
  if (L.l11.start < tFallen + 0.8) console.warn("p03: l11 gap too short for the topple");

  // ---------- staging ----------
  var MX = 1000, XS0 = 740, XM = 800, XS = 880, XL = 1420, BBX = 765;
  var LS = CAST.sam.look, LL = CAST.layla.look, SS = LS.scale;
  // Sam A: rolls the wheelbarrow in, parks, dumps (until the wipe)
  var MA = SF.motion({ clips: CL, scale: SS, ground: G0, anchor: { seg: 0, x: XS0, edge: "end" }, segments: [
    { t0: -0.3, t1: tArr, clip: "walk", loop: true },
    { t0: tArr, t1: DUR + 1, clip: "stand", hold: 0, blend: 0.35 }] });
  // Sam B: the shovel montage, then turns and zips out left
  var MB = SF.motion({ clips: CL, scale: SS, ground: G0, anchor: { seg: 0, x: XM, edge: "start" }, segments: [
    { t0: tSwap - 0.5, t1: tTurn, clip: "stand", hold: 0 },
    { t0: tTurn, t1: DUR + 1, clip: "stand", hold: 0, f: -1, blend: 0.1 }] });
  // Sam C: zips back in dragging the boombox, Plan E, slams play, DANCES, cranks it
  var MC = SF.motion({ clips: CL, scale: SS, ground: G0, anchor: { seg: 0, x: XS, edge: "end" }, segments: [
    { t0: tBack - 0.6, t1: tArr2, clip: "walk", loop: true },
    { t0: tArr2, t1: tPlay - 0.35, clip: "stand", hold: 0, blend: 0.35 },
    { t0: tPlay - 0.35, t1: tPlay + 0.3, clip: "stand", hold: 0, f: -1, blend: 0.12 },
    { t0: tPlay + 0.3, t1: tDance, clip: "stand", hold: 0, blend: 0.12 },
    { t0: tDance, t1: tCrank0, clip: "dance", from: 14, to: 330, blend: 0.3 },
    { t0: tCrank0, t1: DUR + 1, clip: "stand", hold: 0, f: -1, blend: 0.3 }] });
  // Layla: seated on her stool, knitting, the whole part
  var ML = SF.motion({ clips: CL, scale: LL.scale, ground: G0, segments: [{ t0: -1, t1: DUR + 1, clip: "sit", hold: 80, f: -1 }], anchor: { seg: 0, x: XL + 6, edge: "start" } });
  var MLs = SF.motion({ clips: CL, scale: LL.scale, ground: G0, segments: [{ t0: -1, t1: DUR + 1, clip: "stand", hold: 0, f: -1 }], anchor: { seg: 0, x: XL, edge: "start" } });

  // NOTE engine/stickfilm.js motion(): `var shift` (anchor) hoists over the shift() helper, so M.shift is a number -> local helper
  function shiftJ(J, dx, dy) { SF.JOINTS.forEach(function (j) { J[j][0] += dx; J[j][1] += dy; }); }
  function samPhase(t) { return t < tSwap ? "A" : t < tBack ? "B" : "C"; }
  function samM(t) { var p = samPhase(t); return p === "A" ? MA : p === "B" ? MB : MC; }

  // ---------- acting ----------
  var CS = DATA.chars.sam, CY = DATA.chars.layla;
  function dist(a, b) { return Math.hypot(a[0] - b[0], a[1] - b[1]); }
  function armTo(M, J, side, tgt, wt) {          // put a hand on a world point (elbow by IK, bone lengths kept)
    if (wt <= 0) return; var f = J._f || 1, S = M.S, sh = J["sh" + side];
    var h = [lerp(J["ha" + side][0], tgt[0], wt), lerp(J["ha" + side][1], tgt[1], wt)];
    var e = Kit.ik(sh, h, 82 * S, 66 * S, -f);
    J["el" + side] = [lerp(J["el" + side][0], e[0], wt), lerp(J["el" + side][1], e[1], wt)]; J["ha" + side] = h;
  }
  var SAM_ACT = [
    { g: "explain", t0: w("l1", 2).t0 - 0.05, t1: L.l1.end + 0.25, ease: 0.2, side: "L" },      // presents the sack
    { g: "hips", t0: tRel, t1: L.l6.end + 0.1, ease: 0.3 },                                     // proud, hands on hips
    { g: "raise1", t0: w("l7", 0).t0 - 0.15, t1: w("l7", 2).t0 - 0.05, ease: 0.18 },            // "Plan E." finger up
    { g: "celebrate", t0: w("l7", 4).t0 - 0.15, t1: L.l7.end + 0.1, ease: 0.18, amp: 0.85 }     // "music!"
  ];
  var SAM_BEATS = CS.beats.filter(function (b) { return (b > L.l2.start && b < L.l7.end) && !(b > tSniff - 0.5 && b < tArr2); });
  var EX_S = Kit.expr([[0, F.excited], [L.l2.start, F.listen, 0.3], [L.l3.start - 0.1, F.scheming, 0.2], [tDump, F.wow, 0.15],
    [tDump + 0.9, F.proud, 0.3], [L.l4.start + 0.2, F.listen, 0.4], [L.l5.start - 0.1, F.sly, 0.25], [L.l6.start + 0.3, F.proud, 0.3],
    [tSniff - 0.05, [0.1, 0.5, 1.15], 0.15], [tGag, [-0.8, 0.9, 0.55], 0.1], [tSwap, F.determined, 0.05], [tToss, F.excited, 0.15],
    [tBack, F.determined, 0.1], [L.l7.start - 0.1, F.excited, 0.2], [tPlay, F.wow, 0.12], [tDance + 0.5, F.happy, 0.3],
    [L.l8.start - 0.1, F.excited, 0.2], [L.l9.start + 0.3, F.happy, 0.4], [L.l10.start - 0.1, F.scheming, 0.2], [tBass, F.excited, 0.1],
    [tBass + 0.25, F.panic, 0.15], [tTopple + 0.15, [-0.35, 0.85, 1.25], 0.25]]);
  var EX_L = Kit.expr([[0, [0.3, 0, 0.85]], [L.l2.start - 0.15, F.ask, 0.25], [L.l2.end + 0.3, [0.3, 0, 0.85], 0.4],
    [tDump, [0.0, 0.5, 1.2], 0.12], [tDump + 0.7, F.dead, 0.4], [L.l6.start - 0.3, [-0.35, -0.35, 0.7], 0.25],
    [L.l6.end + 0.5, F.dead, 0.4], [tPlay, [0.1, 0.35, 1.05], 0.2], [tPlay + 1.0, [0.3, 0, 0.8], 0.4], [L.l9.start - 0.15, F.dead, 0.25],
    [tBass + 0.1, [-0.25, -0.4, 0.42], 0.15], [tTopple + 0.2, F.dead, 0.35]]);
  var lipS = Talk.mouth(CS.mouth), lipL = Talk.mouth(CY.mouth);
  function mouthS(t) {
    if (t > tSniff && t < tGag) return "X";
    if (t > tGag && t < tGag + 0.7) return "F";                                                // cheeks puffed: the gag
    if (t > tSwap && t < tMontEnd) return "D";                                                 // effort
    if (t > tBass + 0.25 && t < tTopple) return "E";
    return lipS(t);
  }
  var BLINK_S = CS.blinks.filter(function (b) { var b0 = b[0] != null ? b[0] : b; return !(b0 > tBass && b0 < tTopple + 0.3); })
    .concat([[tTopple + 0.45, 0.09], [tTopple + 0.65, 0.09]]);
  var tSlow = L.l11.end + 0.6;
  var BLINK_L = CY.blinks.filter(function (b) { var b0 = b[0] != null ? b[0] : b; return !(b0 > tBass - 0.2 && b0 < tTopple + 0.6) && Math.abs(b0 - tSlow) > 0.8; })
    .concat([[tSlow, 0.45]]);

  // wheelbarrow angle (deg, + = handles up) and the hands on its grips
  function wbAngle(t) {
    if (t < tArr) return 15 + Math.sin(t * 9) * 1.2;
    var a = 15 * (1 - ramp(t, tArr, tArr + 0.3));
    a += 13 * ramp(t, tLift, tLift + 0.3);
    a += 26 * U.easeOutBack(clamp((t - tTip + 0.05) / 0.3, 0, 1)) * (1 - U.easeOutBack(clamp((t - tDrop) / 0.3, 0, 1)));
    a -= 13 * U.easeOutBack(clamp((t - tDrop) / 0.3, 0, 1));
    return a;
  }
  var WS = 0.72, BS = 0.72;                                     // wheelbarrow / boombox drawing scale
  function wbX(t) { return t < tArr + 0.3 ? MA.joints(Math.min(t, tArr)).hips[0] + 200 : XS0 + 200; }
  var GRIP = [-232, -52];
  function wbPt(t, p) {
    var a = wbAngle(t) * Math.PI / 180, c = Math.cos(a), s = Math.sin(a);
    return [wbX(t) + WS * (p[0] * c - p[1] * s), G0 - 22 * WS + WS * (p[0] * s + p[1] * c)];
  }
  var KNOB = [BBX, G0 - 32 * 0.72];

  function jointsSam(t) {
    var M = samM(t), J = M.joints(t), f = J._f || 1, ph = samPhase(t);
    var dancing = t > tDance && t < tCrank0 + 0.3;
    Talk.idle(J, t, "sam", { amp: dancing ? 0.3 : 1.1 });
    Talk.act(M, J, t, SAM_ACT);
    if (!dancing) Talk.beats(M, J, t, SAM_BEATS, { amp: CS.gesture });
    Talk.accents(J, t, CS.accents, 2.6);
    Talk.nods(J, t, CS.nods, 4.5);
    if (ph === "A") {
      // hands on the wheelbarrow grips while pushing / lifting / tipping (the near hand lets go to present the sack)
      var hold = 1 - ramp(t, tRel - 0.25, tRel), near = hold * (1 - bump(t, w("l1", 2).t0 - 0.1, L.l1.end + 0.4 - w("l1", 2).t0));
      var tipLean = ramp(t, tTip - 0.1, tTip + 0.15) * (1 - ramp(t, tDrop, tDrop + 0.3));
      Kit.lean(M, J, 26 * tipLean, 8 * tipLean, 1); Kit.hop(J, bump(t, tTip - 0.05, 0.35) * 10);
      if (t < tArr) Kit.lean(M, J, 12, 6, 1);                                                  // leaning into the push
      var g = wbPt(t, GRIP);
      armTo(M, J, "L", [g[0] - 4, g[1] + 2], hold);
      armTo(M, J, "R", [g[0] + 4, g[1]], near);
      var proud = ramp(t, tDump + 0.1, tDump + 0.3) * (1 - ramp(t, L.l4.start, L.l4.start + 0.5));
      Kit.lean(M, J, -7, -2, proud);
      // the sniff (head forward twice) and the gag (lurch, shudder)
      var sn = bump(t, tSniff, 0.3) + bump(t, tSniff + 0.32, 0.3);
      J.head[0] += f * sn * 6; J.head[1] -= sn * 3;
      var gag = ramp(t, tGag, tGag + 0.1) * (1 - ramp(t, tWipe, tWipe + 0.2));
      Kit.lean(M, J, 14 * gag, 12 * gag, 1);
      if (gag > 0) { var sh = Math.sin(t * 60) * 2.5 * gag; SF.UPPER.forEach(function (j) { J[j][0] += sh; }); }
    } else if (ph === "B") {
      shovelPose(M, J, t);
      var zz = ramp(t, tZip, tZip + 0.22);                                                     // ZIP out to the left
      var ant = bump(t, tTurn, tZip + 0.05 - tTurn);
      Kit.lean(M, J, -10 * ant + 30 * zz, 4 * ant, 1);
      shiftJ(J, -1300 * zz * zz, 0);
    } else {
      // the dance: the mocap + a knee-dip and head-bob ON the beat, "raise the roof" arms every other 8 beats
      var dw = ramp(t, tDance, tDance + 0.4) * (1 - ramp(t, tCrank0 - 0.25, tCrank0));
      if (dw > 0) {
        var bp = (t - tMus) / BEAT, dip = Math.pow(1 - Math.abs(Math.sin(Math.PI * bp)), 2);
        Kit.crouch(M, J, 0.16 * dip * dw, { hands: 0 }); J.head[1] += 5 * dip * dw;
        var sec = bp / 8, ph8 = sec - Math.floor(sec), on = Math.floor(sec) % 2 === 1 ? 1 : 0;
        var aw = on * U.smooth(Math.min(ph8, 1 - ph8) * 8) * dw;
        if (aw > 0) Talk.pose(M, J, "raise2", aw * (0.55 + 0.35 * Math.abs(Math.cos(Math.PI * bp))), null, t);
        var sway = Math.sin(Math.PI * bp) * 7 * dw; SF.UPPER.concat(["chest"]).forEach(function (j) { J[j][0] += sway; });
      }
      var zi = 1 - ramp(t, tBack, tBack + 0.28);                                               // ...and ZIP back in, dragging
      shiftJ(J, -900 * zi * zi, 0);
      if (t < tArr2 + 0.3) {
        var dw = 1 - ramp(t, tArr2, tArr2 + 0.3);
        Kit.lean(M, J, 22 * dw, 10 * dw, 1);
        M.pose(J, { elL: ["neck", -40, 76], haL: ["neck", -82, 118] }, dw);
      }
      // SLAM play (facing the boombox), then the crank at the boombox
      var sl = ramp(t, tPlay - 0.3, tPlay - 0.05) * (1 - ramp(t, tPlay + 0.12, tPlay + 0.3));
      armTo(M, J, "R", [BBX - 26, G0 - 86 - 30 * (1 - ramp(t, tPlay - 0.12, tPlay))], sl);
      Kit.lean(M, J, 22 * sl, 16 * sl, 1); Kit.crouch(M, J, 0.3 * sl, { hands: 0 });
      var cr = ramp(t, tCrank0 + 0.1, tCrank0 + 0.4) * (1 - ramp(t, tBass + 0.1, tBass + 0.3));
      var tw = ramp(t, tTwist, tTwist + 0.5) * 18;
      armTo(M, J, "R", [KNOB[0] + 6 + Math.cos(tw * 0.15) * 6, KNOB[1] - 6 - Math.sin(tw * 0.15) * 6], cr);
      Kit.lean(M, J, 22 * cr, 26 * cr, 1); Kit.crouch(M, J, 0.25 * cr, { hands: 0 });
      // the BASS blows him back (he faces the boombox: leaning away = negative dx), shuddering, sliding right
      var bl = ramp(t, tBass, tBass + 0.12) * (1 - ramp(t, tTopple, tTopple + 0.4));
      if (bl > 0) {
        Kit.lean(M, J, -24 * bl, 2 * bl, 1);
        var jit = Math.sin(t * 55) * 3 * bl; SF.JOINTS.forEach(function (j) { J[j][0] += jit; });
        M.pose(J, { elR: ["neck", 40, 30], haR: ["neck", 70, -20], elL: ["neck", 30, 40], haL: ["neck", 64, -6] }, bl * 0.9);
      }
      var slide = 50 * ramp(t, tBass, tTopple);
      shiftJ(J, slide, 0);
      J.head[1] += ramp(t, tTopple + 0.2, tTopple + 0.8) * 5;                                   // deflates
    }
    return J;
  }

  // the shovel (montage): phase per scoop; blade down at the pile, then a fast toss back over the shoulder
  function shovelPhase(t) { var x = (t - tSwap) / SCOOP; return x < 0 ? -1 : x >= NSC ? -1 : x; }
  function shovelGeom(J, t) {
    var f = J._f || 1, x = shovelPhase(t), a;
    var top = [J.chest[0] + f * 6, J.chest[1] + 4];
    if (x < 0) { a = t < tSwap ? 70 : t < tToss ? 70 : 70; }
    else { var k = x % 1; a = k < 0.55 ? lerp(-125, 55, U.smooth(k / 0.55)) : lerp(55, -125, U.smooth((k - 0.55) / 0.45)); }
    if (t >= tMontEnd) a = 72;                                                                   // leaning on it, panting
    var r = a * Math.PI / 180, d = [f * Math.cos(r), Math.sin(r)], Lh = 150;
    var blade = [top[0] + d[0] * Lh, top[1] + d[1] * Lh];
    return { top: top, d: d, blade: blade, a: a, mid: [top[0] + d[0] * 55, top[1] + d[1] * 55] };
  }
  function shovelPose(M, J, t) {
    if (t > tToss + 0.05) return;
    var x = shovelPhase(t), k = x < 0 ? 0 : x % 1, scoop = k < 0.55 ? U.smooth(k / 0.55) : 1 - U.smooth((k - 0.55) / 0.45);
    if (x >= 0) { Kit.lean(M, J, 8 + 14 * scoop, 6 * scoop, 1); Kit.crouch(M, J, 0.25 * scoop, { hands: 0 }); }
    var G = shovelGeom(J, t);
    armTo(M, J, "L", G.top, 1); armTo(M, J, "R", G.mid, 1);
  }

  // Layla seated: the sit clip, hips lowered onto the stool seat, knees re-solved (feet planted), knitting hands
  var stoolSeat = G0 - 92;
  var KNIT = { elR: ["neck", 18, 74], haR: ["neck", 52, 60], elL: ["neck", 8, 78], haL: ["neck", 44, 70] };
  function clickPhase(t) {
    if (t > tMus && t < tBass) return ((t - tMus) / BEAT) % 1;                                  // on the beat (she doesn't notice)
    if (t >= tBass) return 0;
    return (t * 1.7 + 0.3 * Math.sin(t * 0.9)) % 1;
  }
  function tapAmt(t) { if (t < tMus + 0.8 || t > tBass) return 0; var k = ((t - tMus) / BEAT) % 1; return Math.max(0, Math.sin(k * Math.PI * 2)) * ramp(t, tMus + 0.8, tMus + 1.6); }
  function jointsLayla(t) {
    var J = ML.joints(t), f = J._f || 1, S = ML.S;
    var lens = [["hipR", "knR", "ftR"], ["hipL", "knL", "ftL"]].map(function (k) { return [k, dist(J[k[0]], J[k[1]]), dist(J[k[1]], J[k[2]])]; });
    var dy = (stoolSeat - 4) - J.hips[1];
    ["hips", "hipR", "hipL", "chest", "neck", "head", "shR", "elR", "haR", "shL", "elL", "haL"].forEach(function (j) { J[j][1] += dy; });
    J.ftR[0] += f * 6; J.ftL[0] -= f * 4;
    var tap = tapAmt(t); J.ftR[1] -= tap * 9; J.ftR[0] += f * tap * 2;
    lens.forEach(function (l) { J[l[0][1]] = Kit.ik(J[l[0][0]], J[l[0][2]], l[1], l[2], f); });
    Talk.idle(J, t, "layla", { amp: 0.6 });
    M_pose(J, KNIT, 1);
    var c = clickPhase(t), kk = Math.sin(c * Math.PI * 2);
    J.haR[1] += kk * 2.5; J.haL[1] -= kk * 2; J.haR[0] += f * kk * 1.5;
    // pinches her nose (near hand at the FRONT EDGE of the head, never inside it); the far hand keeps both needles
    var pn = ramp(t, tPinch0, tPinch0 + 0.25) * (1 - ramp(t, tPinch1 - 0.25, tPinch1));
    // head: down at the knitting, up at Sam when talking / something happens
    var up = Math.max(ramp(t, L.l2.start - 0.4, L.l2.start) * (1 - ramp(t, L.l2.end + 0.2, L.l2.end + 0.6)),
      ramp(t, tDump - 0.05, tDump + 0.1) * (1 - ramp(t, L.l6.end + 0.6, L.l6.end + 1.0)),
      ramp(t, tPlay - 0.1, tPlay + 0.1) * (1 - ramp(t, tPlay + 0.9, tPlay + 1.3)),
      ramp(t, L.l9.start - 0.4, L.l9.start) * (1 - ramp(t, L.l9.end + 0.3, L.l9.end + 0.8)),
      ramp(t, tBass - 0.2, tBass));
    J.head[0] += f * 4 * (1 - up); J.head[1] += 5 * (1 - up);
    Talk.accents(J, t, CY.accents, 1.8);
    Talk.nods(J, t, CY.nods, 4);
    var bob = t > tMus + 2 && t < tBass ? Math.abs(Math.sin((t - tMus) / BEAT * Math.PI)) * 1.6 : 0;   // tiny unconscious head bob
    J.head[1] += bob;
    if (pn > 0) M_pose(J, { elR: ["neck", 62, 6], haR: ["head", 54, -6] }, pn);
    // the BASS: she leans back into the wind
    var wd = ramp(t, tBass + 0.05, tBass + 0.25) * (1 - ramp(t, tTopple, tTopple + 0.5));
    if (wd > 0) { J.haR[0] += Math.sin(t * 53) * 5 * wd; J.haR[1] += Math.cos(t * 61) * 4 * wd; J.haL[0] += Math.sin(t * 59 + 1) * 5 * wd; J.haL[1] -= 6 * wd; }
    if (wd > 0) { var jt = Math.sin(t * 47) * 1.5 * wd; SF.UPPER.concat(["chest"]).forEach(function (j) { J[j][0] -= f * (8 * wd) - jt; }); J.head[0] -= f * 4 * wd; }
    return J;
  }
  function M_pose(J, spec, wt) { ML.pose(J, spec, wt); }

  // ---------- world ----------
  var back = document.getElementById("back"), props = document.getElementById("props"), figG = document.getElementById("fig");
  var front = document.getElementById("front"), camG = document.getElementById("cam"), ui = document.getElementById("ui");
  var weather = document.getElementById("weather");
  var Y = FilmSet.yard({ G0: G0, ref: [1040, 560, 1.25], look: "day", season: "summer", garden: { x: MX } });
  var rock = Props.rock(back, 610, G0);
  var bh = Kit.birdhouse(back, 1640, G0);
  var stool = Props.stool(back, XL, G0);
  var mound = Props.mound(props, MX, G0);
  var tree = Props.tree(props, MX - 16, G0 - 26);

  // the MOUNTAIN of plant food (~300 x 180, lumpy, ink outline), scaled from its base centre
  var mtn = el("g", { visibility: "hidden" }, props);
  (function () {
    var pts = [[-158, 0], [-150, -40], [-128, -78], [-104, -96], [-86, -122], [-58, -140], [-34, -168], [-6, -180], [22, -172], [40, -152],
      [66, -146], [92, -118], [112, -96], [134, -64], [150, -30], [160, 0]];
    el("path", { d: ip(pts, { wobble: 1.2, step: 9, seed: 31 }) + " Z", fill: "#7b5a3a", stroke: INK, "stroke-width": 5, "stroke-linejoin": "round" }, mtn);
    el("path", { d: ip([[-120, -60], [-80, -84], [-40, -96], [10, -100], [60, -92], [110, -70]], { wobble: 1, step: 10, seed: 32 }), fill: "none", stroke: "#5e4229", "stroke-width": 4, "stroke-linecap": "round" }, mtn);
    el("path", { d: ip([[-90, -24], [-30, -40], [40, -38], [120, -22]], { wobble: 1, step: 10, seed: 33 }), fill: "none", stroke: "#5e4229", "stroke-width": 4, "stroke-linecap": "round" }, mtn);
    for (var i = 0; i < 16; i++) { var x = -130 + hash(i * 3.1) * 260, y = -10 - hash(i * 7.7) * 140 * (1 - Math.abs(x) / 200); el("circle", { cx: x.toFixed(1), cy: y.toFixed(1), r: (3 + hash(i) * 4).toFixed(1), fill: i % 3 ? "#5e4229" : "#a58058" }, mtn); }
    el("path", { d: "M -40 -150 C -30 -160, -18 -158, -14 -168", stroke: "#a58058", "stroke-width": 4, fill: "none", "stroke-linecap": "round" }, mtn);
  })();
  function mtnScale(t) {
    if (t < tDump) return 0;
    if (t < tSwap) return U.easeOutBack(clamp((t - tDump) / 0.45, 0, 1));
    var x = (t - tSwap) / SCOOP; if (x >= NSC) return 0;
    var k = Math.floor(x), fr = x - k, step = fr < 0.55 ? 0 : U.smooth((fr - 0.55) / 0.2);
    return 1 - (k + step) / NSC;
  }

  // the wheelbarrow + sack (local coords: origin = wheel axle, +x = forward)
  var wb = el("g", {}, props), wbIn = el("g", {}, wb);
  el("path", { d: "M -118 -24 L -122 22 M -64 -24 L -60 22", stroke: "#5a5751", "stroke-width": 6, "stroke-linecap": "round" }, wbIn);   // legs
  el("path", { d: "M -12 -30 L -240 -52", stroke: "#8b6a43", "stroke-width": 8, "stroke-linecap": "round" }, wbIn);                      // handles
  el("path", { d: "M -12 -30 L -240 -52", stroke: INK, "stroke-width": 2, "stroke-opacity": 0.5, "stroke-linecap": "round" }, wbIn);
  var sackG = el("g", {}, wbIn);
  var sackP = el("path", { fill: "#d8c08e", stroke: INK, "stroke-width": 4, "stroke-linejoin": "round" }, sackG);
  var sackTie = el("path", { fill: "none", stroke: "#8b6a43", "stroke-width": 4, "stroke-linecap": "round" }, sackG);
  var sackTxt = el("g", {}, sackG);
  var tx1 = el("text", { x: -86, y: -128, "text-anchor": "middle", "font-family": "Caveat, cursive", "font-weight": 700, "font-size": 30, fill: "#3a5a2a" }, sackTxt); tx1.textContent = "PLANT FOOD";
  var tx2 = el("text", { x: -86, y: -96, "text-anchor": "middle", "font-family": "Caveat, cursive", "font-weight": 700, "font-size": 38, fill: "#c4453b" }, sackTxt); tx2.textContent = "XXL";
  el("path", { d: ip([[14, -70], [-22, -22], [-122, -22], [-164, -70]], { wobble: 0.5, step: 10, seed: 41 }) + " Z", fill: "#5f9a3a", stroke: INK, "stroke-width": 4.5, "stroke-linejoin": "round" }, wbIn);   // tray
  el("path", { d: "M 8 -62 L -158 -62", stroke: "#4b7a2e", "stroke-width": 3, "stroke-linecap": "round" }, wbIn);
  el("circle", { r: 22, fill: "#3a3a3a", stroke: INK, "stroke-width": 4 }, wbIn);
  el("circle", { r: 8, fill: "#c9c3b5", stroke: INK, "stroke-width": 2.5 }, wbIn);
  var spokes = el("path", { stroke: "#c9c3b5", "stroke-width": 3, "stroke-linecap": "round" }, wbIn);
  function sackShape(full) {          // a fat burlap sack sitting in the tray; full 1 -> 0 (empty, flopped)
    var hgt = 30 + 110 * full, cx = -78, wdt = 70 + 6 * full;
    return ip([[cx - wdt, -40], [cx - wdt - 6 * full, -40 - hgt * 0.55], [cx - wdt * 0.7, -40 - hgt], [cx - 14, -40 - hgt - 8 * full], [cx + 14, -40 - hgt - 8 * full],
      [cx + wdt * 0.7, -40 - hgt], [cx + wdt + 6 * full, -40 - hgt * 0.55], [cx + wdt, -40]], { wobble: 0.6, step: 10, seed: 43, closed: true });
  }

  // the pour: a lumpy stream of plant food from the tray lip to the ground
  var pour = el("path", { fill: "none", stroke: "#7b5a3a", "stroke-width": 26, "stroke-linecap": "round" }, props);
  var pourInk = el("path", { fill: "none", stroke: INK, "stroke-width": 3, "stroke-linecap": "round", "stroke-dasharray": "14 10" }, props);
  // the boombox (local: origin = bottom centre)
  var bbG = el("g", {}, props), bbIn = el("g", { transform: "scale(0.72)" }, bbG);
  var strap = el("path", { fill: "none", stroke: INK, "stroke-width": 4, "stroke-linecap": "round" }, props);
  el("path", { d: "M -46 -104 C -44 -150, 44 -150, 46 -104", fill: "none", stroke: INK, "stroke-width": 9, "stroke-linecap": "round" }, bbIn);
  el("path", { d: "M -46 -104 C -44 -150, 44 -150, 46 -104", fill: "none", stroke: "#8a8f98", "stroke-width": 4, "stroke-linecap": "round" }, bbIn);
  el("path", { d: ip([[-92, 0], [92, 0], [92, -106], [-92, -106]], { wobble: 0.4, step: 12, seed: 61, closed: true }), fill: "#4a5059", stroke: INK, "stroke-width": 5, "stroke-linejoin": "round" }, bbIn);
  el("path", { d: "M -88 -86 L 88 -86", stroke: "#6b727c", "stroke-width": 3 }, bbIn);
  var playBtn = null;
  [-60, -36, 36, 60].forEach(function (x, k) { var b = el("rect", { x: x - 8, y: -116, width: 16, height: 10, rx: 2, fill: k === 1 ? "#e8772e" : "#c9c3b5", stroke: INK, "stroke-width": 2.5 }, bbIn); if (k === 1) playBtn = b; });
  el("rect", { x: -22, y: -78, width: 44, height: 28, rx: 3, fill: "#d9e6ea", stroke: INK, "stroke-width": 3 }, bbIn);   // cassette window
  el("circle", { cx: -9, cy: -64, r: 5, fill: "none", stroke: INK, "stroke-width": 2 }, bbIn); el("circle", { cx: 9, cy: -64, r: 5, fill: "none", stroke: INK, "stroke-width": 2 }, bbIn);
  var led = el("circle", { cx: 0, cy: -94, r: 4, fill: "#5a5751", stroke: INK, "stroke-width": 1.5 }, bbIn);
  var knobG = el("g", { transform: "translate(0 -32)" }, bbIn);
  el("circle", { r: 9, fill: "#e8772e", stroke: INK, "stroke-width": 2.5 }, knobG); el("path", { d: "M 0 0 L 0 -8", stroke: INK, "stroke-width": 2.5 }, knobG);
  var cones = [-54, 54].map(function (x) {
    el("circle", { cx: x, cy: -46, r: 34, fill: "#2b2a28", stroke: INK, "stroke-width": 3 }, bbIn);
    var c = el("g", { transform: "translate(" + x + " -46)" }, bbIn);
    el("circle", { r: 25, fill: "#6b727c", stroke: "#1e1d1b", "stroke-width": 3 }, c);
    el("circle", { r: 13, fill: "#8a8f98", stroke: "#1e1d1b", "stroke-width": 2.5 }, c);
    el("circle", { r: 5, fill: "#2b2a28" }, c);
    return { g: c, x: x };
  });
  var notes = [0, 1, 2].map(function (k) { var n = el("text", { "font-family": "Caveat, cursive", "font-weight": 700, "font-size": 44, fill: INK, visibility: "hidden" }, props); n.textContent = k % 2 ? "\u266B" : "\u266A"; return n; });

  // cartoon flies, the shovel, dirt clods, speed lines
  var flies = [0, 1, 2].map(function () {
    var g = el("g", {}, front);
    var wg = el("path", { d: "M -2 -2 C -10 -14, 4 -14, 2 -2 M 2 -2 C 8 -12, 18 -6, 4 0", fill: "#ffffff", "fill-opacity": 0.8, stroke: INK, "stroke-width": 1.5 }, g);
    el("ellipse", { rx: 6, ry: 4.5, fill: INK }, g);
    return { g: g, wg: wg };
  });
  var flyTrail = el("path", { fill: "none", stroke: INK, "stroke-width": 1.5, "stroke-dasharray": "3 6", opacity: 0.45 }, front);
  var shovelG = el("g", {}, figG);
  var shaft = el("path", { stroke: "#8b6a43", "stroke-width": 7, "stroke-linecap": "round", fill: "none" }, shovelG);
  var bladeP = el("path", { fill: "#9aa0a6", stroke: INK, "stroke-width": 3.5, "stroke-linejoin": "round" }, shovelG);
  var clods = [0, 1, 2, 3, 4, 5].map(function () { return el("path", { d: ip([[-12, 0], [-6, -10], [8, -9], [13, 2], [2, 10], [-9, 7]], { wobble: 0.5, step: 6, closed: true }), fill: "#7b5a3a", stroke: INK, "stroke-width": 3 }, front); });
  var speed = el("g", {}, front), SPL = [0, 1, 2, 3, 4].map(function () { return el("path", { stroke: INK, "stroke-width": 4, "stroke-linecap": "round", fill: "none" }, speed); });

  // characters
  var RL = SF.rig(figG, { scale: LL.scale, head: LL.head, ink: LL.ink, color: LL.color, accessories: LL.accessories, backInk: "#5a5751",
    expr: EX_L, blinks: BLINK_L, mouth: lipL, mouthFill: "#8e352d", lineComp: 0.6, seed: 2 });
  var knit = Props.knitting(figG);
  var RS = SF.rig(figG, { scale: LS.scale, head: LS.head, ink: LS.ink, color: LS.color, accessories: LS.accessories, backInk: "#5a5751",
    expr: EX_S, blinks: BLINK_S, mouth: mouthS, mouthFill: "#8e352d", lineComp: 0.6, seed: 1 });
  figG.appendChild(shovelG);
  var pipWrap = el("g", {}, props), pip = Props.pip(pipWrap);
  var feather = el("g", { visibility: "hidden" }, front);
  el("path", { d: "M 0 -22 C 9 -12, 9 10, 0 22 C -9 10, -9 -12, 0 -22 Z", fill: "#6aa9d8", stroke: INK, "stroke-width": 2.5 }, feather);
  el("path", { d: "M 0 -18 L 0 28", stroke: INK, "stroke-width": 2, "stroke-linecap": "round" }, feather);
  var fx = Kit.emanata(front), fxL = Kit.emanata(front), fxP = Kit.emanata(front);
  // dust, not cotton balls: tint the shared puff circles earthy (the only <circle>s in Kit.emanata)
  Array.prototype.forEach.call(fx.g.querySelectorAll("circle"), function (c) { c.setAttribute("fill", "#cdb48c"); c.setAttribute("stroke-width", "2.5"); });

  // Pip: perched -> startled -> flees right (the dump) ... returns, head-bobs to the groove ... blown off, tumbling
  var PIP_AT = bh.perch;
  function pipState(t) {
    if (t < tFlee) {
      var st = ramp(t, tDump, tDump + 0.1);
      return { x: PIP_AT[0], y: PIP_AT[1], f: -1, t: t, pose: t > tFlee - 0.3 ? "hop" : "perch", hop: (t - tFlee + 0.3) / 0.3, tilt: -st * 14, seed: 1 };
    }
    if (t < tPipIn) {
      var p = clamp((t - tFlee) / 1.0, 0, 1), e = p * p;
      return { x: lerp(PIP_AT[0], 2350, e), y: lerp(PIP_AT[1], 260, e) - Math.sin(Math.PI * p) * 40, f: 1, t: t, pose: "fly", hidden: p >= 1 };
    }
    if (t < tPipLand) {
      var q = U.smooth((t - tPipIn) / (tPipLand - tPipIn));
      return { x: lerp(2250, PIP_AT[0], q), y: lerp(330, PIP_AT[1], q) - Math.sin(Math.PI * q) * 60, f: -1, t: t, pose: "fly" };
    }
    if (t < tBlow) return { x: PIP_AT[0], y: PIP_AT[1], f: -1, t: t - tMus, pose: t < tPipLand + 0.3 ? "hop" : "bob", hop: (t - tPipLand) / 0.3, bpm: BPM, seed: 1 };
    var PB = [BBX - 12 - 66 - 38, G0 - 132 * 1.0 - 22];
    if (t > tPipPerch) { var ch2 = 0; [tPipPerch + 0.45, tPipPerch + 0.8].forEach(function (c) { if (t > c && t < c + 0.18) ch2 = (t - c) / 0.18; });
      return { x: PB[0], y: PB[1], f: 1, t: t, pose: t < tPipPerch + 0.25 ? "hop" : "perch", hop: (t - tPipPerch) / 0.25, chirp: ch2, tilt: ramp(t, tPipPerch + 0.9, tPipPerch + 1.1) * 18, seed: 2 }; }
    if (t > tPipBack) { var r2 = U.smooth((t - tPipBack) / (tPipPerch - tPipBack));
      return { x: lerp(PB[0] + 760, PB[0], r2), y: lerp(PB[1] - 300, PB[1], r2) - Math.sin(Math.PI * r2) * 60, f: -1, t: t, pose: "fly" }; }
    var b = clamp((t - tBlow) / 1.1, 0, 1);
    return { x: PIP_AT[0] + b * 900, y: PIP_AT[1] - Math.sin(b * Math.PI * 0.8) * 120 + b * 40, f: -1, t: t, pose: "fly", rot: b * 900, hidden: b >= 1 };
  }

  // ---------- camera ----------
  var H0 = { sam: G0 - Kit.headInfo(MA.joints(tArr + 1), RS, G0).top, layla: G0 - Kit.headInfo(MLs.joints(1), RL, G0).top };
  function resolve(id, t) {
    if (id === "mound" || id === "pile") return { head: [MX, G0 - 90], top: G0 - 200, feet: G0, f: 1, h: H0.sam };
    if (id === "boombox") return { head: [BBX, G0 - 60], top: G0 - 110, feet: G0, f: 1, h: H0.sam };
    if (id === "pip") return { head: [PIP_AT[0], PIP_AT[1]], top: PIP_AT[1] - 40, feet: PIP_AT[1] + 24, f: -1, h: 120 };
    var c = id === "sam" ? Kit.headInfo(jointsSam(t), RS, G0) : Kit.headInfo(jointsLayla(t), RL, G0); c.h = H0[id]; return c;
  }
  var cam = Shots.camera(SHOTS, { width: 1920, height: 1080, duration: DUR, resolve: resolve });
  var tfx = Shots.fx(document.getElementById("fxg"), []);

  // ---------- screen-space overlays: the diagonal WIPE, wind lines ----------
  var wipeG = el("g", { visibility: "hidden" }, ui);
  var wipeR = el("path", { fill: "#c4453b", stroke: INK, "stroke-width": 6 }, wipeG);
  var wipeY = el("path", { fill: "#f2c94c", stroke: INK, "stroke-width": 6 }, wipeG);
  var wipeP = el("path", { fill: "#2f7f8f", stroke: INK, "stroke-width": 8 }, wipeG);
  var windG = el("g", {}, weather), WL = [];
  for (var i = 0; i < 14; i++) WL.push(el("path", { stroke: INK, "stroke-width": 6, "stroke-linecap": "round", fill: "none", opacity: 0 }, windG));

  function render(t) {
    var c = cam.apply(camG, t); Y.update(t, c);
    var JL = jointsLayla(t), JS = jointsSam(t), f = JS._f || 1, ph = samPhase(t);
    RL.set(JL, t, { zoom: c[2] }); RS.set(JS, t, { zoom: c[2] });
    // knitting: while the near hand pinches her nose, the far hand holds both needles
    var pn = ramp(t, tPinch0, tPinch0 + 0.25) * (1 - ramp(t, tPinch1 - 0.25, tPinch1));
    var KJ = JL; if (pn > 0.01) KJ = { haR: [lerp(JL.haR[0], JL.haL[0] - 10 * (JL._f || 1), 1), JL.haL[1] - 6], haL: JL.haL, _f: JL._f };
    knit.set(KJ, { len: lerp(40, 70, clamp(t / DUR, 0, 1)), click: clickPhase(t), G0: G0 });
    // the scarf flaps out sideways in the blast and stays stuck out (windswept), drooping slowly in the tail
    var gust = ramp(t, tBass + 0.05, tBass + 0.3), droop = ramp(t, L.l11.end + 0.4, DUR);
    var sk = gust * (1 - droop * 0.7) * (34 + (t < tTopple ? Math.sin(t * 31) * 10 : 0));
    var hx = (JL.haR[0] + JL.haL[0]) / 2, hy = (JL.haR[1] + JL.haL[1]) / 2;
    knit.g.setAttribute("transform", sk ? "translate(" + hx.toFixed(1) + " " + hy.toFixed(1) + ") skewX(" + (-sk).toFixed(2) + ") translate(" + (-hx).toFixed(1) + " " + (-hy).toFixed(1) + ")" : "");

    // the mound shakes in the bass; the mountain buries it, then shrinks scoop by scoop
    var quake = t > tBass && t < tTopple ? 1 : 0;
    mound.g.setAttribute("transform", quake ? "translate(" + (Math.sin(t * 70) * 3).toFixed(1) + " " + (Math.abs(Math.sin(t * 53)) * -3).toFixed(1) + ")" : "");
    mound.set(t, { wind: quake ? 4 : 1 }); tree.set(0, t, { season: "summer" });
    var ms = mtnScale(t);
    mtn.setAttribute("visibility", ms > 0.01 ? "visible" : "hidden");
    mtn.setAttribute("transform", "translate(" + MX + " " + G0 + ") scale(" + (0.9 + 0.1 * ms).toFixed(3) + " " + ms.toFixed(3) + ")");

    // wheelbarrow (gone after the wipe: he took it away) + sack
    var wbOn = t < tSwap;
    wb.setAttribute("visibility", wbOn ? "visible" : "hidden");
    if (wbOn) {
      var ang = wbAngle(t), full = 1 - ramp(t, tDump - 0.06, tDump + 0.25);
      wb.setAttribute("transform", "translate(" + wbX(t).toFixed(1) + " " + (G0 - 22 * WS).toFixed(1) + ") scale(" + WS + ") rotate(" + ang.toFixed(2) + ")");
      var roll = (wbX(t) / (22 * WS)) * 180 / Math.PI;
      spokes.setAttribute("d", [0, 60, 120].map(function (a) { var r = (a + roll) * Math.PI / 180; return "M " + (Math.cos(r) * -18).toFixed(1) + " " + (Math.sin(r) * -18).toFixed(1) + " L " + (Math.cos(r) * 18).toFixed(1) + " " + (Math.sin(r) * 18).toFixed(1); }).join(" "));
      var slide = 26 * ramp(t, tTip - 0.05, tDump);
      sackG.setAttribute("transform", "translate(" + slide.toFixed(1) + " 0)");
      sackP.setAttribute("d", sackShape(full));
      sackTie.setAttribute("d", full > 0.3 ? "M -96 " + (-40 - (30 + 110 * full) + 6) + " L -60 " + (-40 - (30 + 110 * full) + 6) : "");
      sackTxt.setAttribute("opacity", full.toFixed(2));
      sackTxt.setAttribute("transform", "translate(0 " + (80 * (1 - full)).toFixed(1) + ")");
    }

    var pk = (t - tTip) / (tDump + 0.35 - tTip);
    if (pk > 0 && pk < 1) {
      var lip = wbPt(t, [14, -70]), gy = G0 - 20 - 120 * mtnScale(t), pts = [];
      for (var q = 0; q <= 5; q++) { var v = q / 5; pts.push([lip[0] + 30 * v + Math.sin(t * 40 + q) * 4, lip[1] + (gy - lip[1]) * v]); }
      var dd = Ink.path(pts, { wobble: 0.8, step: 8 });
      pour.setAttribute("d", dd); pourInk.setAttribute("d", dd);
      pour.setAttribute("stroke-width", (26 * Math.sin(pk * Math.PI) + 4).toFixed(1));
    } else { pour.setAttribute("d", ""); pourInk.setAttribute("d", ""); }
    // boombox: dragged in (handle in Sam's far hand), set down, plays (speakers pulse), the BASS (hops), topples, dead
    var bbOn = t > tBack - 0.1;
    bbG.setAttribute("visibility", bbOn ? "visible" : "hidden");
    var playing = t > tMus && t < tTopple, beatK = playing ? Math.pow(Math.max(0, Math.cos(((t - tMus) / BEAT % 1) * Math.PI * 2)), 6) : 0;
    if (bbOn) {
      var bx = BBX, by = G0, rot = 0, pivot = [0, 0];
      if (t < tArr2 + 0.15) { var hl = JS.haL; bx = hl[0] - 70; rot = -4 * (1 - ramp(t, tArr2, tArr2 + 0.15)) + Math.sin(t * 13) * 1.5; if (t > tArr2) bx = lerp(bx, BBX, ramp(t, tArr2, tArr2 + 0.15)); }
      var blast = t > tBass && t < tTopple;
      if (blast) {
        var hp = Math.abs(Math.sin((t - tBass) * Math.PI * BPM / 60 * 2)), drift = -12 * ramp(t, tBass, tTopple);
        bx += drift + Math.sin(t * 63) * 3; by -= hp * 18 * ramp(t, tBass, tBass + 0.2); rot = Math.sin(t * 41) * 5;
      }
      if (t >= tTopple) { bx -= 12; var tp = U.easeOutBack(clamp((t - tTopple) / 0.3, 0, 1)); rot = -90 * Math.min(1, tp) - (tp > 1 ? (tp - 1) * 10 : 0); pivot = [-66, 0]; }
      bbG.setAttribute("transform", "translate(" + bx.toFixed(1) + " " + by.toFixed(1) + ") rotate(" + rot.toFixed(2) + " " + pivot[0] + " " + pivot[1] + ")");
      var amp = blast ? 0.32 : 0.14;
      cones.forEach(function (cn) { cn.g.setAttribute("transform", "translate(" + cn.x + " -46) scale(" + (1 + amp * beatK + (blast ? Math.sin(t * 90) * 0.05 : 0)).toFixed(3) + ")"); });
      playBtn.setAttribute("transform", t > tPlay - 0.03 && t < tTopple ? "translate(0 5)" : "");
      led.setAttribute("fill", playing ? (beatK > 0.3 ? "#9be36b" : "#5fbf3a") : "#5a5751");
      knobG.setAttribute("transform", "translate(0 -32) rotate(" + (ramp(t, tTwist, tTwist + 0.5) * 150).toFixed(1) + ")");
    }
    var stOn = bbOn && t < tArr2 + 0.1;
    strap.setAttribute("d", stOn ? "M " + U.pt(JS.haL) + " Q " + U.pt([(JS.haL[0] + bx) / 2, Math.max(JS.haL[1], G0 - 100) + 30]) + " " + U.pt([bx + 10, G0 - 100]) : "");
    notes.forEach(function (n, k) {          // music notes floating up out of the speakers
      var on = playing && t > tMus + 0.2, phs = ((t - tMus) * 0.6 + k / 3) % 1;
      n.setAttribute("visibility", on ? "visible" : "hidden");
      if (on) { n.setAttribute("x", (BBX + (k - 1) * 50 + Math.sin(phs * 6 + k) * 14 + (t > tBass ? phs * 160 : 0)).toFixed(1)); n.setAttribute("y", (G0 - 110 - phs * 150).toFixed(1)); n.setAttribute("opacity", Math.sin(phs * Math.PI).toFixed(2)); }
    });

    // the shovel (montage), dirt clods flying back over his shoulder
    var shOn = ph === "B" && t < tToss + 0.05;
    shovelG.setAttribute("visibility", shOn || (t > tToss && t < tToss + 0.8) ? "visible" : "hidden");
    if (shOn) {
      var G = shovelGeom(JS, t), bl = G.blade, d = G.d, n = [-d[1], d[0]];
      shaft.setAttribute("d", "M " + U.pt([G.top[0] - d[0] * 14, G.top[1] - d[1] * 14]) + " L " + U.pt(bl));
      var b1 = [bl[0] + n[0] * 16, bl[1] + n[1] * 16], b2 = [bl[0] - n[0] * 16, bl[1] - n[1] * 16];
      bladeP.setAttribute("d", "M " + U.pt(b1) + " L " + U.pt([b1[0] + d[0] * 34, b1[1] + d[1] * 34]) + " Q " + U.pt([bl[0] + d[0] * 48, bl[1] + d[1] * 48]) + " " + U.pt([b2[0] + d[0] * 34, b2[1] + d[1] * 34]) + " L " + U.pt(b2) + " Z");
      shovelG.setAttribute("transform", "");
    } else if (t > tToss && t < tToss + 0.8) {          // tossed over his shoulder, spinning off-screen left
      var q = (t - tToss) / 0.8;
      shovelG.setAttribute("transform", "translate(" + (-950 * q).toFixed(1) + " " + (-700 * q + 1300 * q * q).toFixed(1) + ") rotate(" + (-q * 720).toFixed(1) + " " + XM + " " + (G0 - 220) + ")");
    }
    clods.forEach(function (cd, k) {
      var x = (t - tSwap) / SCOOP - 0.62 - k, on = ph === "B" && x >= 0 && x < 1.4 && k < NSC;
      cd.setAttribute("visibility", on ? "visible" : "hidden");
      if (on) { var tau = x * SCOOP * 1.6, x0 = XM - 40, y0 = G0 - 260; cd.setAttribute("transform", "translate(" + (x0 - 900 * tau).toFixed(1) + " " + (y0 - 420 * tau + 700 * tau * tau).toFixed(1) + ") rotate(" + (tau * 400).toFixed(0) + ")"); }
    });
    // speed lines: the zip out / zip in / the montage
    var spOn = (t > tZip && t < tZip + 0.35) || (t > tBack && t < tBack + 0.35);
    SPL.forEach(function (p, k) {
      if (!spOn) { p.setAttribute("d", ""); return; }
      var hipsX = JS.hips[0], yy = G0 - 60 - k * 45, len = 120 + hash(k) * 90, dir = t < tBack ? 1 : -1;
      p.setAttribute("d", "M " + (hipsX + dir * 40).toFixed(1) + " " + yy + " L " + (hipsX + dir * (40 + len)).toFixed(1) + " " + yy);
    });

    // flies circling the mountain
    var flyOn = t > tDump + 0.5 && t < tSwap;
    var trail = [];
    flies.forEach(function (fl, k) {
      fl.g.setAttribute("visibility", flyOn ? "visible" : "hidden"); if (!flyOn) return;
      var a = t * (3.2 + k * 0.7) + k * 2.1, rx = 120 + k * 22, ry = 34 + k * 8;
      var x = MX + Math.cos(a) * rx + Math.sin(t * 7 + k) * 8, y = G0 - 200 - k * 18 + Math.sin(a) * ry + Math.sin(t * 11 + k) * 5;
      fl.g.setAttribute("transform", "translate(" + x.toFixed(1) + " " + y.toFixed(1) + ") scale(" + (Math.sin(a) > 0 ? -1 : 1) + " 1)");
      fl.wg.setAttribute("transform", "scale(1 " + (0.5 + 0.5 * Math.abs(Math.sin(t * 90 + k))).toFixed(2) + ")");
      if (k === 0) for (var s = 1; s < 8; s++) { var aa = a - s * 0.12; trail.push([MX + Math.cos(aa) * rx, G0 - 200 + Math.sin(aa) * ry]); }
    });
    flyTrail.setAttribute("d", flyOn && trail.length ? "M " + trail.map(U.pt).join(" L ") : "");

    // Pip (wrapped so it can tumble)
    var ps = pipState(t), rotP = ps.rot || 0;
    pipWrap.setAttribute("transform", "translate(" + ps.x.toFixed(1) + " " + ps.y.toFixed(1) + ") rotate(" + rotP.toFixed(1) + ")");
    ps.x = 0; ps.y = 0; pip.set(ps);

    // emanata
    var hs = Kit.headInfo(JS, RS, G0), hl2 = Kit.headInfo(JL, RL, G0);
    var smellK = ramp(t, tDump + 1.0, tDump + 2.0) * (1 - ramp(t, tWipe, tSwap));
    var puffK = (t - tDump) / 0.9, shakeOn = t > tBass && t < tTopple;
    fx.set({
      puff: puffK > 0 && puffK < 1 ? { x: MX, y: G0 - 20, k: puffK, s: 1.9 } : (t > tZip && t < tZip + 0.6 ? { x: XM, y: G0 - 6, k: (t - tZip) / 0.6, s: 0.7 } : (t > tTopple + 0.2 && t < tTopple + 0.9 ? { x: BBX - 110, y: G0 - 4, k: (t - tTopple - 0.2) / 0.7, s: 0.8 } : null)),
      smell: smellK > 0 ? { x: MX - 10, y: G0 - 190, k: smellK } : null,
      sweat: (t > tSwap && t < tBack) ? { x: hs.head[0] - f * RS.HR * 0.8, y: hs.head[1] - RS.HR * 0.4, k: ((t - tSwap) * 2.2) % 1 } :
        (t > tBass + 0.2 && t < tTopple + 1.2 ? { x: hs.head[0] + f * RS.HR * 0.9, y: hs.head[1] - RS.HR * 0.5, k: ramp(t, tBass + 0.2, tTopple + 1.2) } : null),
      lines: t > tPlay - 0.02 && t < tPlay + 0.3 ? { x: BBX, y: G0 - 70, r: 60, n: 6, amp: 26 } : (t > tDump && t < tDump + 0.4 ? { x: hl2.head[0], y: hl2.head[1], r: RL.HR * 1.5, n: 5, amp: 18 } : null),
      stars: null
    }, t);
    // smell lines drift over to Layla / to Sam during the sniff
    var fxLp = t < L.l6.end + 0.5 ? [hl2.head[0] - 40, hl2.head[1] + 20] : [hs.head[0] + f * 70, hs.head[1] + 40];
    fxL.g.setAttribute("transform", "translate(" + U.pt(fxLp) + ") scale(0.45) translate(" + (-fxLp[0]).toFixed(1) + " " + (-fxLp[1]).toFixed(1) + ")");
    fxL.set({ smell: t > L.l6.start - 0.4 && t < L.l6.end + 0.5 ? { x: fxLp[0], y: fxLp[1] + 60, k: 0.85 } : (t > tSniff - 0.3 && t < tWipe ? { x: fxLp[0], y: fxLp[1] + 60, k: 0.9 } : null),
      twitch: t > tGag && t < tWipe ? { x: hs.head[0] + f * RS.HR * 0.2, y: hs.head[1] + 4, k: 1 } : null }, t);
    fxP.set({ lines: t > tFlee - 0.3 && t < tFlee ? { x: PIP_AT[0] + 6, y: PIP_AT[1] - 12, r: 34, n: 5, amp: 14 } : null,
      sparkle: null }, t);

    // the diagonal WIPE (screen space)
    var wk = (t - tWipe) / WD;
    wipeG.setAttribute("visibility", wk > 0 && wk < 1 ? "visible" : "hidden");
    if (wk > 0 && wk < 1) {
      var px = lerp(-2600, 4500, U.smooth(wk)), half = 2000, sl = 420;
      var band = function (a, b) { return "M " + (px + a - sl) + " 1100 L " + (px + a + sl) + " -20 L " + (px + b + sl) + " -20 L " + (px + b - sl) + " 1100 Z"; };
      wipeR.setAttribute("d", band(-half - 40, half + 150)); wipeY.setAttribute("d", band(-half - 20, half + 80));
      wipeP.setAttribute("d", band(-half, half));
    }
    // wind lines in the blast (screen space, rushing right)
    var windOn = t > tBass + 0.05 && t < tTopple + 0.15;
    WL.forEach(function (p, k) {
      if (!windOn) { p.setAttribute("opacity", 0); return; }
      var sp = 2600, phs = ((t - tBass) * sp / 2400 + hash(k * 1.7)) % 1, x = -300 + phs * 2400, y = 180 + hash(k * 3.3) * 720, len = 140 + hash(k) * 160, pts = [];
      for (var s = 0; s <= 6; s++) pts.push([x + s * len / 6, y + Math.sin(s * 1.3 + t * 20 + k) * 6]);
      p.setAttribute("d", "M " + pts.map(U.pt).join(" L ")); p.setAttribute("opacity", (0.8 * Math.sin(phs * Math.PI)).toFixed(2));
    });
    // one of Pip's feathers see-saws down past Layla's windswept deadpan
    var fq = (t - tTopple - 0.6) / 4.2;
    feather.setAttribute("visibility", fq > 0 && fq < 1 ? "visible" : "hidden");
    if (fq > 0 && fq < 1) feather.setAttribute("transform", "translate(" + (XL - 140 + Math.sin(fq * 9) * 26).toFixed(1) + " " + (G0 - 430 + fq * 260).toFixed(1) + ") rotate(" + (Math.cos(fq * 9) * 35).toFixed(1) + ") scale(0.8)");
    tfx.update(t);
  }
  window.__film = { MA: MA, MB: MB, MC: MC, ML: ML, RS: RS, RL: RL, cam: cam, resolve: resolve, jointsSam: jointsSam, jointsLayla: jointsLayla, bh: bh,
    beats: { tArr: tArr, tTip: tTip, tDump: tDump, tFlee: tFlee, tSniff: tSniff, tGag: tGag, tWipe: tWipe, tSwap: tSwap, tMontEnd: tMontEnd, tZip: tZip,
      tBack: tBack, tArr2: tArr2, tPlay: tPlay, tDance: tDance, tPipIn: tPipIn, tPipLand: tPipLand, tCrank0: tCrank0, tBass: tBass, tTopple: tTopple, DUR: DUR } };
  window.__timelines = window.__timelines || {};
  window.__timelines["main"] = SF.timeline(DUR, render);
})();
