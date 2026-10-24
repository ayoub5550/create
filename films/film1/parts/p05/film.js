/* Sam & Layla Ep. 1 — P05 "The watched pot" (ACT BREAK, ~48.6 s). Structure copied from the reference part p01.
 * Data: FILM_DATA (dialogue.py) · FILM_CAST · FILM_SHOTS (shots.json, word-anchored). Shared: common/set.js, props.js, kit.js.
 * Beat sheet: card "5 minutes later..." -> a western STARING CONTEST: WS (Sam on the rock, arms crossed; Layla knitting on her
 * stool) -> ECU Sam's narrowed eyes -> the mound (nothing; a tumbleweed rolls by) -> tighter ECU, eye twitch -> "a watched pot
 * never boils" (Layla, not looking up) -> Sam springs off the rock and marches over to lecture her, his BACK to the mound;
 * behind him the sprout POPS on "different" and grooves; Layla's eyes widen -> "What's that face?" -> he whips round: the sprout
 * freezes (innocent wiggle) -> PEEKABOO rule of three: turn away (it grows, whoosh + glock) / whip back (frozen) x2, the third
 * time he FAKES the turn and catches it mid-stretch, leaning right at him; it straightens sheepishly -> "Did it just... move?"
 * (crouched, nose to leaf; the sprout sweats) -> "Maybe it's shy." -> "Trees aren't shy" (back to Layla: a new leaf unfurls, Pip
 * lands and chirps at it) -> "Wait." -> a slooow creaking turn: sprout and Pip freeze mid-dance -> slow push-in CU "It only
 * grows... when nobody's looking." + dun-dun-DUN (ACT BREAK) -> "Or... it just needs time." -> CU "Layla. This calls for a
 * plan." (brows down, steepled fingers, slow nod) -> WS button: the sprout wiggles behind him; whoosh to P06.
 * Every beat time derives from the dialogue timeline; score.py uses the same formulas. Pure function of t. */
(function () {
  "use strict";
  var SF = window.StickFilm, U = SF.u, el = U.el, ramp = U.ramp, clamp = U.clamp, lerp = U.lerp;
  var DATA = window.FILM_DATA, CAST = window.FILM_CAST.characters, SHOTS = window.FILM_SHOTS.shots;
  var CL = Object.assign({ stand: SF.standClip() }, window.FILM_CLIPS || {});
  CL.march = Object.assign({}, CL.walk, { fps: 37 });                      // the same walk, brisker: an indignant march
  var K = Kit.lines(DATA), L = K.L, w = K.w, F = Kit.FACE, bump = Kit.bump;
  var DUR = DATA.total, G0 = 820, INK = "#2b2a28";

  // ---------- beats (same formulas in score.py) ----------
  var T1 = L.l1.start;
  var tEst = T1 - 4.0, tEye1 = T1 - 2.95, tMound = T1 - 1.95, tEye2 = T1 - 0.95, tTwitch = T1 - 0.62;   // OPEN
  var tWeed0 = tMound + 0.05, tWeed1 = tMound + 1.0;                       // the tumbleweed crosses the mound shot
  var tRise = L.l1.end - 0.5, tStood = tRise + 0.5, WALK = 1.9, tArr = tStood + WALK;   // off the rock -> marches over
  var tPop = w("l2", 7).t0;                                                // "different": the sprout POPS behind him
  var tWhip1 = L.l3.end + 0.12;                                            // "What's that face?" -> he whips round
  var a1 = tWhip1 + 0.95, b1 = a1 + 0.65, a2 = b1 + 0.65, b2 = a2 + 0.6, a3 = b2 + 0.7, b3 = a3 + 0.45;   // peekaboo x3
  var tSettle = b3 + 1.1, tCrouch = b3 + 1.55, tUnCrouch = L.l5.end + 0.05;
  var tTurnL = w("l6", 0).t0 - 0.3;                                        // "Shy?" -> back to Layla
  var tLeaf = w("l6", 1).t0, tPip0 = w("l6", 1).t0 - 0.7, tPip1 = tPip0 + 1.0;
  var tSlow0 = L.l7.end + 0.1, tFlip = tSlow0 + 1.0;                      // "Wait." ... the slooow turn
  var tLook = w("l8", -1).t0;                                              // "...nobody's LOOKING."
  var tFaceL = L.l10.start - 0.3;                                          // "Layla." -> he turns to her
  var tWide = L.l10.end + 0.8, tWhoosh = DUR - 0.45;
  var SCARF0 = 110, SCARF1 = 150;
  if (tWide + 1.5 > DUR) console.warn("p05: tail too short");

  // ---------- staging ----------
  var MX = 1000, ROCKX = 610, STOOLX = 1420, XS = 1110;
  var segS = [
    { t0: 0, t1: tRise, clip: "sit", hold: 115 },
    { t0: tRise, t1: tStood, clip: "sit", from: 115, to: 159 },
    { t0: tStood, t1: tArr, clip: "march", loop: true, blend: 0.2 },
    { t0: tArr, t1: tWhip1, clip: "stand", hold: 0, blend: 0.3 },
    { t0: tWhip1, t1: a1, clip: "stand", hold: 0, f: -1, blend: 0.08 },
    { t0: a1, t1: b1, clip: "stand", hold: 0, blend: 0.18 },
    { t0: b1, t1: a2, clip: "stand", hold: 0, f: -1, blend: 0.07 },
    { t0: a2, t1: b2, clip: "stand", hold: 0, blend: 0.18 },
    { t0: b2, t1: a3, clip: "stand", hold: 0, f: -1, blend: 0.07 },
    { t0: a3, t1: b3, clip: "stand", hold: 0, blend: 0.35 },
    { t0: b3, t1: tTurnL, clip: "stand", hold: 0, f: -1, blend: 0.06 },
    { t0: tTurnL, t1: tFlip, clip: "stand", hold: 0, blend: 0.16 },
    { t0: tFlip, t1: tFaceL, clip: "stand", hold: 0, f: -1, blend: 0.05 },
    { t0: tFaceL, t1: DUR + 1, clip: "stand", hold: 0, blend: 0.12 }
  ];
  var segL = [{ t0: 0, t1: DUR + 1, clip: "sit", hold: 115, f: -1 }];
  var LS = CAST.sam.look, LL = CAST.layla.look;
  var MS = SF.motion({ clips: CL, scale: LS.scale, ground: G0, segments: segS, anchor: { seg: 3, x: XS, edge: "start" } });
  var ML = SF.motion({ clips: CL, scale: LL.scale, ground: G0, segments: segL, anchor: { seg: 0, x: STOOLX, edge: "start" } });
  // facing changes as cartoon turns: the figure squashes flat through the turn (the slow one creaks)
  var WHIPS = [tWhip1, a1, b1, a2, b2, a3, b3, tTurnL, tFaceL];
  function turnX(t) {
    var s = 1; WHIPS.forEach(function (tw, i) { s = Math.min(s, 1 - (i === 5 ? 0.3 : 0.4) * bump(t, tw - 0.03, i === 5 ? 0.25 : 0.1)); });
    if (t > tSlow0 && t < tFlip + 0.14) s = Math.min(s, t < tFlip ? 1 - 0.86 * U.smooth((t - tSlow0) / (tFlip - tSlow0)) : 0.14 + 0.86 * U.smooth((t - tFlip) / 0.14));
    return s;
  }

  // ---------- local poses (CMU units from the neck; dx follows the facing) ----------
  var KNIT = { elR: ["neck", 10, 72], haR: ["neck", 54, 40], elL: ["neck", 0, 74], haL: ["neck", 46, 46] };
  var BEHIND = { elR: ["neck", -34, 46], haR: ["neck", -24, 82], elL: ["neck", -30, 48], haL: ["neck", -20, 84] };   // innocent whistle
  var STEEPLE = { elR: ["neck", 34, 62], haR: ["neck", 54, 6], elL: ["neck", 22, 66], haL: ["neck", 48, 4] };     // "a plan."
  var REACH = { elR: ["neck", 60, 40], haR: ["neck", 110, 50], elL: ["neck", 40, 48], haL: ["neck", 88, 62] };      // caught! arms out

  // seated: lower the hips onto the seat, feet stay planted, knees by IK
  function seat(M, J, seatY, wgt) {
    if (wgt <= 0) return;
    var S = M.S, dy = (seatY - (J.hips[1] + 9 * S)) * wgt, f = J._f || 1;
    var lens = [["hipR", "knR", "ftR"], ["hipL", "knL", "ftL"]].map(function (k) { return [Math.hypot(J[k[0]][0] - J[k[1]][0], J[k[0]][1] - J[k[1]][1]), Math.hypot(J[k[1]][0] - J[k[2]][0], J[k[1]][1] - J[k[2]][1])]; });
    SF.JOINTS.forEach(function (j) { if (j !== "ftR" && j !== "ftL") J[j][1] += dy; });
    [["hipR", "knR", "ftR"], ["hipL", "knL", "ftL"]].forEach(function (k, i) { J[k[1]] = Kit.ik(J[k[0]], J[k[2]], lens[i][0], lens[i][1], f); });
  }

  // ---------- acting ----------
  var CS = DATA.chars.sam, CY = DATA.chars.layla;
  var SAM_ACT = [
    { g: "crossArms", t0: -1, t1: tRise + 0.15, ease: 0.3, easeOut: 0.15 },
    { g: "raise1", t0: w("l2", 4).t0 - 0.2, t1: w("l2", 8).t0 + 0.1, ease: 0.2 },        // "Trees are totally different." (finger up)
    { g: "explain", t0: w("l2", 8).t0 - 0.1, t1: L.l2.end + 0.2, ease: 0.2 },            // "Trees are—"
    { g: "shrug", t0: w("l3", 0).t0 - 0.1, t1: w("l3", 1).t0, ease: 0.2 },                // "What?"
    { g: "palmsUp", t0: w("l3", 1).t0 - 0.1, t1: tWhip1 + 0.05, ease: 0.2, easeOut: 0.08 }, // "What's that face?"
    { g: "point", t0: b1 - 0.02, t1: a2 - 0.05, ease: 0.08, amp: 0.9 },                  // GOTCHA (no.)
    { g: "point", t0: b2 - 0.02, t1: a3 - 0.05, ease: 0.08, amp: 0.9 },
    { g: "palmsUp", t0: tTurnL, t1: w("l6", 1).t0 + 0.1, ease: 0.2 },                     // "Shy?"
    { g: "explain", t0: w("l6", 1).t0 - 0.05, t1: L.l6.end + 0.3, ease: 0.2 },           // "Trees aren't shy."
    { g: "stop", t0: L.l7.start - 0.15, t1: tSlow0 + 0.5, ease: 0.15, easeOut: 0.4 },    // "Wait."
    { g: "chin", t0: L.l8.start - 0.2, t1: tLook - 0.05, ease: 0.35, easeOut: 0.15 },    // "It only grows..."
    { g: "point", t0: tLook - 0.1, t1: L.l9.start + 0.2, ease: 0.12, easeOut: 0.5 }     // "...LOOKING."
  ];
  var QUIET = [[tWhip1 - 0.3, tCrouch + 0.2], [L.l8.start - 0.3, L.l9.start], [L.l10.start - 0.4, DUR]];
  var SAM_BEATS = CS.beats.filter(function (b) { return !QUIET.some(function (q) { return b > q[0] && b < q[1]; }) && (b < tRise || b > tArr); });
  var LAYLA_ACT = [];
  var squint = [-0.15, -0.85, 0.58], suspicious = [-0.1, -0.75, 0.78], smug = [0.6, 0.35, 0.8];
  var EX_S = Kit.expr([[0, squint], [tTwitch - 0.2, [-0.2, -1.0, 0.5], 0.15], [tTwitch, [-0.25, -1.0, 0.25], 0.03], [tTwitch + 0.09, [-0.2, -1.0, 0.55], 0.03],
    [tTwitch + 0.18, [-0.25, -1.0, 0.25], 0.03], [tTwitch + 0.27, [-0.2, -1.0, 0.5], 0.03], [L.l1.end - 0.6, F.indig, 0.15],
    [L.l2.start, [0.55, 0.45, 1.05], 0.3], [w("l2", 4).t0, [0.5, 0.2, 0.95], 0.3], [L.l3.start - 0.1, [-0.2, 0.6, 1.15], 0.15], [w("l3", 1).t0, [-0.25, -0.45, 0.95], 0.2],
    [tWhip1, suspicious, 0.06], [a1, smug, 0.1], [b1, [-0.2, -0.9, 1.35], 0.05], [b1 + 0.3, suspicious, 0.2], [a2, smug, 0.1],
    [b2, [-0.2, -0.9, 1.35], 0.05], [b2 + 0.3, suspicious, 0.2], [a3, [0.7, 0.4, 0.55], 0.15], [b3, [-0.4, 1.1, 1.65], 0.05],
    [b3 + 0.7, suspicious, 0.35], [tCrouch, squint, 0.3], [w("l4", 3).t0 - 0.1, [-0.1, 0.4, 1.3], 0.15], [L.l5.start, squint, 0.3],
    [tTurnL, [0.25, 0.7, 1.1], 0.15], [w("l6", 1).t0, [0.3, -0.3, 0.95], 0.2], [L.l7.start - 0.25, [-0.1, 0.9, 1.4], 0.12],
    [tFlip, [-0.15, -0.6, 1.2], 0.1], [L.l8.start, [-0.2, -0.95, 0.9], 0.4], [tLook - 0.05, [-0.3, -1.0, 1.6], 0.1],
    [L.l9.start + 0.3, [-0.1, -0.6, 0.9], 0.4], [L.l10.start - 0.2, [0.3, -0.7, 0.85], 0.2], [w("l10", 3).t0, F.scheming, 0.3],
    [L.l10.end + 0.2, [0.75, -0.75, 0.75], 0.4]]);
  var wideL = [0.0, 0.9, 1.45];
  var EX_L = Kit.expr([[0, F.calm], [L.l1.start - 0.1, [0.3, 0.1, 0.8], 0.3], [L.l1.end + 0.3, F.calm, 0.3], [tPop + 0.12, wideL, 0.08],
    [tPop + 1.6, [0.1, 0.6, 1.25], 0.4], [L.l3.end, [0.25, -0.2, 0.85], 0.3], [b3, wideL, 0.06], [b3 + 0.7, [0.3, -0.25, 0.8], 0.3],
    [L.l5.start - 0.1, [0.35, -0.3, 0.78], 0.25], [tLeaf, [0.2, 0.5, 1.15], 0.2], [L.l7.start, [0.3, -0.2, 0.8], 0.3],
    [L.l8.end, F.dead, 0.3], [L.l9.start - 0.1, [0.3, 0.05, 0.85], 0.25], [L.l10.start, F.dead, 0.3], [L.l10.end + 0.3, [0.2, 0.4, 0.95], 0.4]]);
  var lipS = Talk.mouth(CS.mouth), lipL = Talk.mouth(CY.mouth);
  function mouthS(t) { return (t > b3 + 0.02 && t < b3 + 0.5) ? "E" : lipS(t); }               // caught: a little "o"
  var mouthL = lipL;
  var BLINK_S = CS.blinks.filter(function (b) { var b0 = b[0] != null ? b[0] : b; return b0 > T1 + 0.4 && (b0 < tWhip1 - 0.3 || b0 > tSettle) && (b0 < tSlow0 || b0 > L.l8.end); })
    .concat([[tSettle + 0.1, 0.09], [tSettle + 0.3, 0.09]]);                                    // OPEN: the staring contest -> NO blinks
  var BLINK_L = CY.blinks.filter(function (b) { var b0 = b[0] != null ? b[0] : b; return Math.abs(b0 - tPop) > 1.2 && Math.abs(b0 - b3) > 0.8; })
    .concat([[L.l9.start - 0.5, 0.35]]);
  var walking = function (t) { return t > tStood && t < tArr; };
  var crouchW = function (t) { return ramp(t, tCrouch, tCrouch + 0.45) * (1 - ramp(t, tUnCrouch, tUnCrouch + 0.35)); };
  var rockTop = G0 - 118, seatS = function (t) { return 1 - ramp(t, tRise, tRise + 0.35); };

  function jointsSam(t, bare) {
    var J = MS.joints(t), f = J._f || 1;
    seat(MS, J, rockTop, seatS(t));
    if (bare) return J;
    Talk.idle(J, t, "sam", { amp: walking(t) ? 0.3 : 1.1 });
    Talk.act(MS, J, t, SAM_ACT);
    var aw = 0; [[a1, b1], [a2, b2]].forEach(function (p) { aw = Math.max(aw, ramp(t, p[0] + 0.05, p[0] + 0.25) * (1 - ramp(t, p[1] - 0.06, p[1]))); });
    aw = Math.max(aw, ramp(t, a3 + 0.1, a3 + 0.4) * (1 - ramp(t, b3 - 0.02, b3 + 0.04)));
    MS.pose(J, BEHIND, aw);                                                                         // whistling, not looking
    var rw = ramp(t, b3, b3 + 0.06) * (1 - ramp(t, tSettle - 0.2, tSettle + 0.3)); MS.pose(J, REACH, rw * 0.85);
    var sw = ramp(t, w("l10", 3).t0 - 0.3, w("l10", 3).t0 + 0.1); MS.pose(J, STEEPLE, sw);
    var tap = ramp(t, L.l10.end + 0.2, L.l10.end + 0.4) * Math.sin(t * 2 * Math.PI * 3.2) * 3 * MS.S;   // evil finger tapping
    J.haR[1] += tap; J.haL[1] -= tap;
    Talk.beats(MS, J, t, SAM_BEATS, { amp: CS.gesture });
    Talk.accents(J, t, CS.accents, 2.6);
    Talk.nods(J, t, CS.nods.filter(function (n) { return n < L.l10.start; }), 4.5);
    // big moves
    Kit.hop(J, bump(t, tRise + 0.1, 0.4) * 14);                                                   // springs off the rock
    if (walking(t)) { var mx = (J.hips[0] - MX) / 95; Kit.hop(J, 36 * Math.max(0, 1 - mx * mx)); }               // steps up over the mound
    var lec = ramp(t, w("l2", 4).t0 - 0.2, w("l2", 4).t0 + 0.2) * (1 - ramp(t, L.l2.end, L.l2.end + 0.4));
    Kit.lean(MS, J, -6, -2, lec);                                                                  // chest out: lecturing
    [b1, b2].forEach(function (tb) { Kit.lean(MS, J, 14, 3, bump(t, tb - 0.02, 0.45)); Kit.hop(J, bump(t, tb - 0.02, 0.22) * 8); });   // GOTCHA jolt
    Kit.lean(MS, J, 10, 2, ramp(t, tWhip1 + 0.1, tWhip1 + 0.4) * (1 - ramp(t, a1 - 0.1, a1)));     // leans in, staring
    var cau = ramp(t, b3, b3 + 0.05) * (1 - ramp(t, b3 + 0.9, b3 + 1.4)); Kit.lean(MS, J, 18, 4, cau); Kit.hop(J, bump(t, b3, 0.25) * 12);
    var whis = (ramp(t, a1 + 0.1, a1 + 0.3) * (1 - ramp(t, b1 - 0.05, b1)) + ramp(t, a2 + 0.1, a2 + 0.3) * (1 - ramp(t, b2 - 0.05, b2)));
    J.head[1] -= whis * 4; J.head[0] -= f * whis * 3;                                              // chin up, eyes to the sky
    var cw = crouchW(t);
    if (cw > 0) { Kit.crouch(MS, J, cw, { hands: 1, depth: 0.8 }); Kit.lean(MS, J, 26, 10, cw); }   // nose to leaf
    var wt = ramp(t, L.l7.start - 0.3, L.l7.start) * (1 - ramp(t, tSlow0 + 0.2, tSlow0 + 0.5)); J.head[1] += wt * 3;
    var drama = ramp(t, L.l8.start, L.l8.start + 0.5) * (1 - ramp(t, L.l9.start, L.l9.start + 0.5)); Kit.lean(MS, J, 8, 3, drama);
    var tn = L.l10.end + 0.1, nod = Math.sin(clamp((t - tn) / 1.2, 0, 1) * Math.PI) ; J.head[1] += nod * 9; J.head[0] += f * nod * 2;  // slow nod
    J.head[1] += bump(t, w("l10", 0).t0, 0.5) * 4;
    return J;
  }
  function jointsLayla(t, bare) {
    var J = ML.joints(t), f = J._f || 1;
    seat(ML, J, stool.seatY, 1);
    if (bare) return J;
    Talk.idle(J, t, "layla", { amp: 0.8 });
    var stopK = 1 - bump(t, tPop + 0.1, 2.0) * 0.6;                                                 // the needles stop: she saw that
    var ck = Math.sin(t * 2 * Math.PI * 1.6) * 4 * knitOn(t);
    var spec = JSON.parse(JSON.stringify(KNIT)); spec.haR[2] += ck; spec.haL[2] -= ck * 0.6;
    ML.pose(J, spec, 1);
    if (stopK < 1) Kit.lean(ML, J, -4, -2, 1 - stopK);
    Talk.beats(ML, J, t, CY.beats, { amp: CY.gesture * 0.4 });
    Talk.accents(J, t, CY.accents, 2.0);
    Talk.nods(J, t, CY.nods.concat([L.l9.end - 0.2]), 4);
    var down = knitOn(t) * 4;                                                                       // eyes on her knitting
    J.head[1] += down; J.head[0] += f * down * 0.6;
    J.head[1] -= bump(t, tPop + 0.1, 0.5) * 6;                                                      // a tiny double take
    var shake = Math.sin(clamp((t - (L.l10.end + 0.6)) / 1.0, 0, 1) * Math.PI * 4) * (t > L.l10.end + 0.6 && t < L.l10.end + 1.6 ? 3 : 0);
    J.head[0] += shake;                                                                             // the slow head shake
    return J;
  }
  // she knits whenever she is not reacting / speaking a key line
  function knitOn(t) {
    var off = Math.max(bump(t, tPop + 0.05, 2.2), ramp(t, b3, b3 + 0.1) * (1 - ramp(t, b3 + 1.0, b3 + 1.3)),
      ramp(t, tLeaf, tLeaf + 0.2) * (1 - ramp(t, tLeaf + 1.4, tLeaf + 1.7)));
    return 1 - off;
  }

  // ---------- world ----------
  var back = document.getElementById("back"), props = document.getElementById("props"), figG = document.getElementById("fig");
  var front = document.getElementById("front"), camG = document.getElementById("cam"), ui = document.getElementById("ui");
  var Y = FilmSet.yard({ G0: G0, ref: [1040, 560, 1.25], look: "day", season: "summer", garden: { x: MX } });
  var rock = Props.rock(back, ROCKX, G0);
  var bh = Kit.birdhouse(back, 1640, G0);
  var stool = Props.stool(back, STOOLX, G0);
  var mound = Props.mound(props, MX, G0);
  var tree = Props.tree(props, MX - 16, G0 - 26);
  var SPX = MX - 16, SPY = G0 - 26;
  var fxP = Kit.emanata(props);
  var pipSh = el("ellipse", { rx: 20, ry: 4, fill: "#2b2a28", opacity: 0.18 }, props), weedSh = el("ellipse", { rx: 22, ry: 4, fill: "#2b2a28", opacity: 0.15 }, props);   // contact shadows
  var pip = Props.pip(props);
  // local prop: a tumbleweed (the staring contest is a western) — a ball of ink scribbles that rolls and bounces
  var weed = el("g", {}, props), weedIn = el("g", {}, weed);
  for (var k = 0; k < 5; k++) {
    var pts = []; for (var q = 0; q <= 14; q++) { var a = q / 14 * Math.PI * 2 + k * 1.3, rr = 20 + 9 * U.hash(k * 7 + q); pts.push([Math.cos(a) * rr * (k % 2 ? 1 : 0.8), Math.sin(a) * rr * (k % 2 ? 0.8 : 1)]); }
    el("path", { d: Ink.path(pts, { wobble: 0.8, step: 6, seed: 60 + k }), fill: "none", stroke: k < 2 ? "#a88a55" : "#8b6a43", "stroke-width": k < 2 ? 3.5 : 2.5, "stroke-linecap": "round" }, weedIn);
  }
  function weedSet(t) {
    var p = (t - tWeed0) / (tWeed1 - tWeed0), on = p > 0 && p < 1;
    weed.setAttribute("visibility", on ? "visible" : "hidden"); weedSh.setAttribute("visibility", on ? "visible" : "hidden"); if (!on) return;
    var x = lerp(MX - 210, MX + 230, p), y = G0 - 30 - Math.abs(Math.sin(p * Math.PI * 3)) * 22;
    weed.setAttribute("transform", "translate(" + x.toFixed(1) + " " + y.toFixed(1) + ")"); weedSh.setAttribute("cx", x.toFixed(1)); weedSh.setAttribute("cy", G0 - 2);
    weedSh.setAttribute("rx", (22 - (G0 - 30 - y) * 0.3).toFixed(1)); weedIn.setAttribute("transform", "rotate(" + (p * 540).toFixed(0) + ")");
  }
  var RL = SF.rig(figG, { scale: LL.scale, head: LL.head, ink: LL.ink, color: LL.color, accessories: LL.accessories, backInk: "#5a5751",
    expr: EX_L, blinks: BLINK_L, mouth: mouthL, mouthFill: "#8e352d", lineComp: 0.6, seed: 2 });
  var knit = Props.knitting(figG);
  var RS = SF.rig(figG, { scale: LS.scale, head: LS.head, ink: LS.ink, color: LS.color, accessories: LS.accessories, backInk: "#5a5751",
    expr: EX_S, blinks: BLINK_S, mouth: mouthS, mouthFill: "#8e352d", lineComp: 0.6, seed: 1 });
  var fxS = Kit.emanata(ui), fxL = Kit.emanata(ui);                      // screen space: marks keep their size in close-ups
  // local overlay: the dramatic vignette that closes in on "It only grows... when nobody's looking."
  var overSvg = ui.ownerSVGElement, defs = el("defs", {}, overSvg);
  var rg = el("radialGradient", { id: "p05drama", cx: "50%", cy: "45%", r: "70%" }, defs);
  el("stop", { offset: "0.32", "stop-color": "#1d1a2a", "stop-opacity": 0 }, rg); el("stop", { offset: "1", "stop-color": "#1d1a2a", "stop-opacity": 0.92 }, rg);
  var twitchG = el("g", {}, ui), TWP = [0, 1, 2].map(function () { return el("path", { stroke: INK, "stroke-width": 9, "stroke-linecap": "round", fill: "none" }, twitchG); });
  var drama = el("rect", { x: 0, y: 0, width: 1920, height: 1080, fill: "url(#p05drama)", opacity: 0 }, ui);

  // ---------- the sprout: grows only while Sam is not looking ----------
  var G = [[0, 0], [tPop, 0], [tPop + 0.2, 0.075], [tWhip1 - 0.05, 0.1], [a1 + 0.1, 0.1], [a1 + 0.55, 0.13], [a2 + 0.1, 0.13], [a2 + 0.5, 0.155],
    [a3 + 0.15, 0.155], [b3, 0.168], [tLeaf - 0.05, 0.168], [tLeaf + 0.6, 0.187], [tSlow0 + 0.2, 0.187], [tFlip - 0.05, 0.2], [DUR + 1, 0.2]];
  function gAt(t) {
    for (var i = 0; i < G.length - 1; i++) if (t < G[i + 1][0]) {
      var p = clamp((t - G[i][0]) / (G[i + 1][0] - G[i][0]), 0, 1); return lerp(G[i][1], G[i + 1][1], i === 1 ? p : U.smooth(p));
    }
    return G[G.length - 1][1];
  }
  function sproutState(t) {
    var wig = 0, bend = 0;
    [tWhip1, b1, b2, tFlip].forEach(function (tf) { wig = Math.max(wig, ramp(t, tf, tf + 0.05) * (1 - ramp(t, tf + 0.55, tf + 0.8))); });
    wig = Math.max(wig, ramp(t, tSettle + 0.4, tSettle + 0.5) * (1 - ramp(t, tSettle + 0.9, tSettle + 1.1)));
    wig = Math.max(wig, ramp(t, tWide + 0.6, tWide + 0.7) * (1 - ramp(t, tWide + 1.3, tWide + 1.5)));   // the button
    var groove = ramp(t, tPop + 0.25, tPop + 0.6) * (1 - ramp(t, tWhip1 - 0.06, tWhip1));               // grooving behind his back
    bend += groove * 22 * Math.sin((t - tPop) * 2 * Math.PI * 1.7);
    [[a1, b1], [a2, b2]].forEach(function (p) { bend += ramp(t, p[0] + 0.05, p[0] + 0.2) * (1 - ramp(t, p[1] - 0.04, p[1])) * 16 * Math.sin((t - p[0]) * 2 * Math.PI * 2.2); });
    var lean = ramp(t, a3 + 0.15, b3) * (1 - ramp(t, tSettle, tSettle + 0.4));                         // stretching to peek at him...
    bend += lean * 42;                                                                                    // ...caught leaning right at him
    var happy = ramp(t, tLeaf, tLeaf + 0.2) * (1 - ramp(t, tPip1 + 0.8, tPip1 + 1.0));
    bend += happy * 12 * Math.sin((t - tLeaf) * 2 * Math.PI * 1.4);
    var tDance = tPip1 + 0.9, dance2 = ramp(t, tDance, tDance + 0.2) * (1 - ramp(t, tFlip - 0.03, tFlip));   // Pip + sprout dance behind his back
    var frozenDance = t >= tFlip && t < tFlip + 0.9 ? 1 - ramp(t, tFlip + 0.5, tFlip + 0.9) : 0;           // frozen mid-sway, then eases back
    bend += dance2 * 30 * Math.sin((t - tDance) * 2 * Math.PI * 1.8) + frozenDance * 24 * Math.sin((tFlip - tDance) * 2 * Math.PI * 1.8);
    // the whole sprout as a cartoon character (group transform, pivot at its base): grooves, spurts up, leans, freezes
    var rot = 0, sy = 1, ph;
    ph = t - tPop; rot += groove * 16 * Math.sin(ph * 2 * Math.PI * 1.7); sy += groove * 0.14 * Math.sin(ph * 2 * Math.PI * 3.4);
    [[a1, b1], [a2, b2]].forEach(function (p) {
      var k = ramp(t, p[0] + 0.05, p[0] + 0.2) * (1 - ramp(t, p[1] - 0.05, p[1]));
      sy += 0.55 * bump(t, p[0] + 0.08, p[1] - p[0] - 0.1) + k * 0.06 * Math.sin((t - p[0]) * 2 * Math.PI * 4.4); rot += k * 14 * Math.sin((t - p[0]) * 2 * Math.PI * 2.2);
    });
    rot += lean * 24; sy += lean * 0.3;
    rot += dance2 * 22 * Math.sin((t - tDance) * 2 * Math.PI * 1.8) + frozenDance * 18 * Math.sin((tFlip - tDance) * 2 * Math.PI * 1.8);
    sy += dance2 * 0.12 * Math.abs(Math.sin((t - tDance) * 2 * Math.PI * 1.8)) + frozenDance * 0.12 * Math.abs(Math.sin((tFlip - tDance) * 2 * Math.PI * 1.8));
    rot += happy * 10 * Math.sin((t - tLeaf) * 2 * Math.PI * 1.4);
    rot += wig * 5 * Math.sin(t * 2 * Math.PI / 0.4);
    return { g: gAt(t), wiggle: wig, bend: bend * 0.5, rot: rot, sy: sy };
  }

  // ---------- Pip: lands next to the sprout (on the mound), chirps at it, freezes with it ----------
  var PIP_FROM = [520, 380], PIP_AT = [902, G0 - 24];                 // on the ground at the foot of the mound, clear of the leaves
  var tCh = [tPip1 + 0.45, tPip1 + 0.9, tFlip + 1.0];
  function pipState(t) {
    if (t < tPip0) return { x: 0, y: 0, hidden: true, t: t };
    if (t < tPip1) {
      var p = clamp((t - tPip0) / (tPip1 - tPip0), 0, 1), e = U.smooth(p);
      return { x: lerp(PIP_FROM[0], PIP_AT[0], e), y: lerp(PIP_FROM[1], PIP_AT[1], e) - Math.sin(Math.PI * e) * 60, f: 1, t: t, pose: "fly" };
    }
    var ch = 0; tCh.forEach(function (c) { if (t > c && t < c + 0.18) ch = (t - c) / 0.18; });
    var bob = t > tPip1 + 0.9 && t < tFlip, frozen = t >= tFlip && t < tFlip + 0.8;
    var tilt = ramp(t, tPip1 + 0.3, tPip1 + 0.5) * 20;
    if (bob) return { x: PIP_AT[0], y: PIP_AT[1], f: 1, t: t, pose: "hop", hop: ((t - tPip1) * 2.6) % 1, tilt: 12 * Math.sin((t - tPip1) * 2 * Math.PI * 1.8), seed: 2 };   // dancing
    if (frozen) return { x: PIP_AT[0], y: PIP_AT[1] - 14, f: 1, t: tFlip, pose: "perch", tilt: 14, seed: 2 };           // caught mid-hop, in the air
    var away = t > tFlip + 0.8 ? -1 : 1;                                                                  // ...then nonchalantly looks away
    return { x: PIP_AT[0], y: PIP_AT[1], f: away, t: t, pose: t < tPip1 + 0.25 ? "hop" : "perch", hop: (t - tPip1) / 0.25, chirp: ch, tilt: tilt, seed: 2 };
  }

  // ---------- camera ----------
  var stand = function (look) { var M = SF.motion({ clips: CL, scale: look.scale, ground: G0, segments: [{ t0: 0, t1: 1, clip: "stand", hold: 0 }], anchor: { seg: 0, x: 0, edge: "start" } }); return M.joints(0); };
  var H0 = { sam: G0 - Kit.headInfo(stand(LS), RS, G0).top, layla: G0 - Kit.headInfo(stand(LL), RL, G0).top };
  function resolve(id, t) {
    if (id === "mound") return { head: [MX, G0 - 60], top: G0 - 120, feet: G0, f: 1, h: H0.sam };
    if (id === "sprout") return { head: [SPX, G0 - 70], top: G0 - 120, feet: G0, f: 1, h: 120 };
    var c = id === "sam" ? Kit.headInfo(jointsSam(t), RS, G0) : Kit.headInfo(jointsLayla(t), RL, G0); c.h = H0[id]; return c;
  }
  // extreme close-ups on Sam's eyes: {"ecu": "sam", "zoom": z, "ex": dx, "ey": dy} -> a locked frame centred on his eye
  SHOTS.forEach(function (s) {
    if (!s.ecu) return;
    var ts = Shots.time(s.t, DATA) + 0.05;
    s.frame = function () { var J = jointsSam(ts), hx = J.head[0], hy = J.head[1] - RS.HR * 0.32, f = J._f || 1; return [hx + f * RS.HR * (0.3 + (s.ex || 0)), hy - RS.HR * (0.1 - (s.ey || 0)), s.zoom || 12]; };
  });
  // tracking pan: {"track": "sam", "frame0": [cx0, cy, z], "frame1": [cx1, cy, z]} follows his march (no vertical bob)
  SHOTS.forEach(function (s) {
    if (!s.track) return;
    var x0 = MS.SEG[0].x0, x1 = XS;
    s.follow = true;
    s.frame = function (t) { var J = MS.raw(MS.segAt(t), t), p = U.smooth((J.hips[0] - x0) / (x1 - x0)); return [lerp(s.frame0[0], s.frame1[0], p), lerp(s.frame0[1], s.frame1[1], p), lerp(s.frame0[2], s.frame1[2], p)]; };
  });
  var cam = Shots.camera(SHOTS, { width: 1920, height: 1080, duration: DUR, resolve: resolve });
  var tfx = Shots.fx(document.getElementById("fxg"), []);
  var cards = Kit.cards(document.getElementById("card"), [{ t0: -1, t1: tEst, c1: "5 minutes later...", fade: 0.25, wipe: true }]);

  function render(t) {
    var c = cam.apply(camG, t); Y.update(t, c);
    var JL = jointsLayla(t), JS = jointsSam(t);
    RL.set(JL, t, { zoom: c[2] }); RS.set(JS, t, { zoom: c[2] });
    var sx = turnX(t), hx0 = JS.hips[0];
    RS.g.setAttribute("transform", sx < 0.999 ? "translate(" + hx0.toFixed(1) + " 0) scale(" + sx.toFixed(3) + " 1) translate(" + (-hx0).toFixed(1) + " 0)" : "");
    knit.set(JL, { len: lerp(SCARF0, SCARF1, clamp(t / DUR, 0, 1)), click: (t * 1.6) % 1 * knitOn(t), G0: G0 });
    mound.set(t, {});
    var sp = sproutState(t); tree.set(sp.g, t, { wiggle: sp.wiggle, bend: sp.bend, season: "summer" });
    tree.g.setAttribute("transform", "translate(" + SPX + " " + SPY + ") rotate(" + sp.rot.toFixed(2) + ") scale(" + (1 / Math.sqrt(sp.sy)).toFixed(3) + " " + sp.sy.toFixed(3) + ") translate(" + (-SPX) + " " + (-SPY) + ")");
    var ps = pipState(t); pip.set(ps);
    pipSh.setAttribute("visibility", !ps.hidden && t > tPip1 - 0.1 ? "visible" : "hidden"); pipSh.setAttribute("cx", PIP_AT[0] + 2); pipSh.setAttribute("cy", PIP_AT[1] + 25);
    weedSet(t);
    var tip = tree.tip(sp.g), hs = Kit.headInfo(JS, RS, G0), f = JS._f || 1, hl = Kit.headInfo(JL, RL, G0);
    fxP.set({
      sparkle: t > tPop && t < tPop + 0.7 ? { x: SPX + 34, y: G0 - 70, k: (t - tPop) / 0.7, s: 1.2 } : (t > tLeaf + 0.3 && t < tLeaf + 0.9 ? { x: SPX - 30, y: G0 - 100, k: (t - tLeaf - 0.3) / 0.6, s: 0.9 } : null),
      puff: t > tPop && t < tPop + 0.6 ? { x: SPX, y: G0 - 22, k: (t - tPop) / 0.6, s: 0.55 } : null,
      sweat: t > tSettle + 0.5 && t < L.l5.start ? { x: tip[0] + 26, y: tip[1] - 6, k: ramp(t, tSettle + 0.5, L.l5.start - 0.2) } : null,
      lines: t > b3 && t < b3 + 0.35 ? { x: tip[0] + 20, y: tip[1] + 10, r: 34, n: 5, amp: 16 } : null
    }, t);
    var scr = function (p) { return cam.toScreen(p, c); }, z = c[2];
    var hS = scr(hs.head), eS = scr([hs.head[0] + f * RS.HR * 0.42, hs.head[1] - RS.HR * 0.1]), hL = scr(hl.head);
    fxS.set({
      lines: (t > b3 && t < b3 + 0.4) || (t > tLook + 0.1 && t < tLook + 0.7) ? { x: hS[0], y: hS[1], r: Math.min(RS.HR * 1.45 * z, 470), n: 7, amp: 18 + 6 * Math.min(z, 4) } : null,
      sweat: t > tWhip1 + 0.3 && t < a1 ? { x: hS[0] - f * RS.HR * 0.8 * z, y: hS[1] - RS.HR * 0.4 * z, k: ramp(t, tWhip1 + 0.3, a1) } : null
    }, t);
    var tw = t > tTwitch && t < tTwitch + 0.55, tz = Math.min(z, 8), jit = Math.sin(t * 70) * 4;
    twitchG.setAttribute("visibility", tw ? "visible" : "hidden");
    if (tw) TWP.forEach(function (p, i) {
      var a = (-60 + i * 35) * Math.PI / 180, r0 = RS.HR * 0.3 * tz, r1 = RS.HR * 0.55 * tz, cx = eS[0] + f * RS.HR * 0.12 * tz, cy = eS[1] - RS.HR * 0.05 * tz;
      p.setAttribute("d", "M " + (cx + f * Math.cos(a) * r0 + jit).toFixed(1) + " " + (cy + Math.sin(a) * r0).toFixed(1) + " L " + (cx + f * Math.cos(a) * r1 + jit).toFixed(1) + " " + (cy + Math.sin(a) * r1).toFixed(1));
    });
    fxL.set({ lines: t > tPop + 0.12 && t < tPop + 0.55 ? { x: hL[0], y: hL[1], r: RL.HR * 1.6 * z, n: 5, amp: 26 } : null }, t);
    drama.setAttribute("opacity", (ramp(t, L.l8.start, tLook) * 1.0 * (1 - ramp(t, L.l9.start - 0.2, L.l9.start + 0.1))).toFixed(3));
    tfx.update(t);
    cards.update(t);
  }
  window.__film = { MS: MS, ML: ML, RS: RS, RL: RL, cam: cam, resolve: resolve, jointsSam: jointsSam, jointsLayla: jointsLayla, gAt: gAt,
    beats: { tEst: tEst, tRise: tRise, tStood: tStood, tArr: tArr, tPop: tPop, tWhip1: tWhip1, a1: a1, b1: b1, a2: a2, b2: b2, a3: a3, b3: b3,
      tSettle: tSettle, tCrouch: tCrouch, tTurnL: tTurnL, tLeaf: tLeaf, tPip0: tPip0, tPip1: tPip1, tSlow0: tSlow0, tFlip: tFlip, tLook: tLook,
      tFaceL: tFaceL, tWide: tWide, DUR: DUR, samX0: MS.SEG[0].x0 } };
  window.__timelines = window.__timelines || {};
  window.__timelines["main"] = SF.timeline(DUR, render);
})();
