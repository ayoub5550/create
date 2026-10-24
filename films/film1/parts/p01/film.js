/* Sam & Layla Ep. 1 — P01 "Cold open + title" (~50 s). THE REFERENCE PART: every other part follows its structure.
 * Data: FILM_DATA (dialogue.py: timeline, lip sync, blinks, beats, nods, accents) · FILM_CAST (cast.json) · FILM_SHOTS
 * (shots.json, hand-directed, word-anchored). Shared code: common/set.js (the yard), props.js (mound, rock, tree, Pip...),
 * kit.js (lines/words, faces, crouch, cards, emanata, bag, birdhouse).
 * Beat sheet: OPEN establishing EWS push-in, Pip lands on the birdhouse -> CU low: Sam crouched nose-to-dirt, "Grow. Grow...
 * grow!" (each louder, pushing in) -> WS reveal: tiny mound in a big yard, Layla walks in with her knitting tote -> "I'm
 * motivating a tree" (never looks away) -> "A tree. Where?" (she looks round the empty yard) -> "Right there!" (points down)
 * -> "When did you plant it?" -> "Yesterday!" (springs up, chest out) -> "trees take time" (palms up) -> rule of three
 * "How much time? An hour? Two hours?" (shrug / one hand / both hands, leaning in, a hop) -> music stops: CU "Years." ->
 * CU Sam frozen (burst lines, eye twitch, crickets) -> cutaway: Pip tilts its head, chirps -> "...Years?" (tiny) -> he
 * narrows his eyes: "Okay. Plan B." (finger up) -> SMASH to the TITLE: "Sam & Layla" draws on, "Grow Faster!" pops,
 * Pip flies over the card and lands on the title, a sprout pops under it.
 * Beat times derive from the dialogue timeline; score.py uses the same formulas. Everything is a pure function of t. */
(function () {
  "use strict";
  var SF = window.StickFilm, U = SF.u, el = U.el, ramp = U.ramp;
  var DATA = window.FILM_DATA, CAST = window.FILM_CAST.characters, SHOTS = window.FILM_SHOTS.shots;
  var CL = Object.assign({ stand: SF.standClip() }, window.FILM_CLIPS || {});
  var K = Kit.lines(DATA), L = K.L, w = K.w, F = Kit.FACE, bump = Kit.bump;
  var DUR = DATA.total, G0 = 820;

  // ---------- beats (same formulas in score.py) ----------
  var tArrive = L.l2.end - 1.0;                                   // Layla reaches her mark near the end of her first line
  var tLook0 = w("l4", 2).t0 - 0.35, tLook1 = L.l4.end + 0.15;    // "Where?": she looks round the empty yard
  var tUp = w("l7", 0).t0 - 0.2;                                 // "Yesterday!": he springs up out of the crouch
  var W9 = L.l9.words;                                            // How much time? / An hour? / Two hours?
  var tQ1 = W9[2].t0, tQ2 = W9[4].t0, tQ3 = W9[6].t0;
  var tYears = L.l10.words[0].t0, tShock = L.l10.end + 0.08;      // "Years." lands -> his frozen take
  var tTwitch = tShock + 0.75, tPip = L.l11.start - 1.4, tPipEnd = L.l11.start - 0.4;
  var tNarrow = L.l11.end + 0.35;
  var tTitle = L.l12.end + 0.3;                                   // SMASH to the title card
  var tPop2 = tTitle + 0.68, tPipIn = tTitle + 1.7, tPipLand = tTitle + 2.9, tSprout = tTitle + 3.5;
  if (tTitle + 6.5 > DUR) console.warn("p01: scene.json tail too short for the title");

  // ---------- staging: Sam left of the mound (faces right), Layla walks in from the right (faces left) ----------
  var MX = 1000, XS = 872, XL = 1330;
  var segS = [{ t0: 0, t1: DUR + 1, clip: "stand", hold: 0 }];
  var segL = [
    { t0: 0, t1: tArrive, clip: "walk", loop: true, f: -1 },
    { t0: tArrive, t1: tLook0, clip: "stand", hold: 0, f: -1, blend: 0.35 },
    { t0: tLook0, t1: tLook1, clip: "stand", hold: 0, f: 1, blend: 0.18 },
    { t0: tLook1, t1: DUR + 1, clip: "stand", hold: 0, f: -1, blend: 0.18 }
  ];
  var LS = CAST.sam.look, LL = CAST.layla.look;
  var MS = SF.motion({ clips: CL, scale: LS.scale, ground: G0, segments: segS, anchor: { seg: 0, x: XS, edge: "start" } });
  var ML = SF.motion({ clips: CL, scale: LL.scale, ground: G0, segments: segL, anchor: { seg: 1, x: XL, edge: "start" } });

  // ---------- acting ----------
  var CS = DATA.chars.sam, CY = DATA.chars.layla;
  var SAM_ACT = [
    { g: "pointDown", t0: w("l5", 1).t0 - 0.25, t1: w("l5", 4).t1 + 0.3, ease: 0.2 },        // "there! Under the dirt."
    { g: "shrug", t0: tQ1 - 0.22, t1: tQ2 + 0.1, ease: 0.2 },                                 // rule of three: "time?"
    { g: "raise1", t0: tQ2 - 0.12, t1: tQ3 + 0.1, ease: 0.2 },                                //   "An hour?"
    { g: "raise2", t0: tQ3 - 0.12, t1: tYears + 0.25, ease: 0.2, easeOut: 0.4 },              //   "Two hours?!"
    { g: "chin", t0: tNarrow - 0.1, t1: L.l12.start + 0.9, ease: 0.3 },                       // a plan forms...
    { g: "raise1", t0: w("l12", 1).t0 - 0.15, t1: DUR + 1, ease: 0.15 }                       // "Plan B." finger up
  ];
  var SAM_BEATS = CS.beats.filter(function (b) { return (b < tQ1 - 0.4 || b > tYears) && (b < L.l5.start || b > L.l5.end); });
  var LAYLA_ACT = [
    { g: "palmsUp", t0: w("l8", 1).t0 - 0.2, t1: L.l8.end + 0.35, amp: 0.95 },              // "Sam, trees take time."
    { g: "hips", t0: L.l9.start + 0.3, t1: tYears - 0.3, amp: 0.8 }                           // listening to the bargaining
  ];
  var EX_S = Kit.expr([[0, [0.1, -0.7, 1.5]], [w("l1", 2).t0 - 0.1, [-0.3, -1.0, 1.75], 0.12],        // intense -> SHOUT
    [L.l1.end + 0.3, [0.15, -0.6, 1.45], 0.4], [L.l3.start - 0.1, F.proud], [L.l4.start, F.listen, 0.4], [L.l5.start - 0.1, F.excited],
    [L.l6.start + 0.2, F.listen, 0.4], [tUp, F.proud, 0.15], [w("l8", 4).t0, F.huh, 0.2], [tQ1 - 0.12, F.hope, 0.2],
    [tQ3 - 0.1, F.hope2, 0.25], [tYears + 0.12, F.shock, 0.1], [L.l11.start - 0.1, F.sad, 0.3], [tNarrow, [-0.05, -0.9, 0.62], 0.6],
    [w("l12", 1).t0, F.scheming, 0.2]]);
  var EX_L = Kit.expr([[0, F.calm], [L.l2.start - 0.1, F.ask, 0.25], [L.l2.end + 0.3, F.calm, 0.4], [L.l4.start - 0.1, F.dead, 0.25],
    [L.l6.start - 0.1, F.ask, 0.2], [L.l8.start - 0.1, [0.5, 0.35, 1.0], 0.25], [L.l9.start + 0.4, F.calm, 0.4],
    [tYears - 0.6, F.dead, 0.3]]);
  var lipS = Talk.mouth(CS.mouth), lipL = Talk.mouth(CY.mouth);
  function mouthS(t) { return t > tShock && t < L.l11.start - 0.05 ? "E" : lipS(t); }        // frozen "o" of disbelief
  var tSlow = tYears - 0.55;                                                                  // her slow blink before "Years."
  var BLINK_S = CS.blinks.filter(function (b) { var b0 = b[0] != null ? b[0] : b; return b0 < tYears - 0.2 || b0 > L.l11.start; })
    .concat([[tPipEnd + 0.05, 0.09], [tPipEnd + 0.24, 0.09]]);                                // disbelieving double blink
  var BLINK_L = CY.blinks.filter(function (b) { var b0 = b[0] != null ? b[0] : b; return Math.abs(b0 - tSlow) > 0.7; }).concat([[tSlow, 0.4]]);
  var crouchW = function (t) { return 1 - ramp(t, tUp, tUp + 0.3); };

  function jointsSam(t, noCrouch) {
    var J = MS.joints(t), f = J._f || 1;
    Talk.idle(J, t, "sam", { amp: 1.1 });
    Talk.act(MS, J, t, SAM_ACT);
    Talk.beats(MS, J, t, SAM_BEATS, { amp: CS.gesture });
    Talk.accents(J, t, CS.accents, 2.6);
    Talk.nods(J, t, CS.nods, 4.5);
    if (noCrouch) return J;
    var pt = ramp(t, w("l5", 1).t0 - 0.3, w("l5", 1).t0) * (1 - ramp(t, w("l5", 4).t1 + 0.1, w("l5", 4).t1 + 0.4));
    Kit.crouch(MS, J, crouchW(t), { hands: 1 - pt });
    var push = 0; L.l1.words.forEach(function (wd, i) { push += bump(t, wd.t0 - 0.05, 0.45) * (6 + i * 5); });   // each "grow" louder
    Kit.lean(MS, J, push, push * 0.3, 1);
    var up = bump(t, tUp, 0.5); Kit.hop(J, up * 16);                                        // springs up...
    var chest = ramp(t, tUp + 0.2, tUp + 0.45) * (1 - ramp(t, L.l8.start, L.l8.start + 0.5)); Kit.lean(MS, J, -9, -3, chest);   // ...chest out
    var hope = (ramp(t, tQ1 - 0.1, tQ1 + 0.15) + ramp(t, tQ2 - 0.1, tQ2 + 0.15) + ramp(t, tQ3 - 0.1, tQ3 + 0.15)) / 3 * (1 - ramp(t, tShock, tShock + 0.2));
    Kit.lean(MS, J, 18, 4, hope); Kit.hop(J, bump(t, tQ3 - 0.06, 0.3) * 10);
    var sh = ramp(t, tYears + 0.1, tYears + 0.2) * (1 - ramp(t, L.l11.start, L.l11.start + 0.6)); Kit.lean(MS, J, -10, 0, sh);   // "Years." pushes him back
    J.head[1] += ramp(t, L.l11.start - 0.1, L.l11.start + 0.4) * (1 - ramp(t, tNarrow, tNarrow + 0.5)) * 6;                   // deflates
    return J;
  }
  function jointsLayla(t) {
    var J = ML.joints(t), f = J._f || 1, walking = t < tArrive;
    Talk.idle(J, t, "layla", { amp: walking ? 0.3 : 0.9 });
    Talk.act(ML, J, t, LAYLA_ACT);
    Talk.beats(ML, J, t, CY.beats, { amp: CY.gesture });
    Talk.accents(J, t, CY.accents, 2.0);
    Talk.nods(J, t, CY.nods.concat([w("l8", -1).t0 + 0.05]), 4.5);
    var tilt = ramp(t, L.l2.start, L.l2.start + 0.3) * (1 - ramp(t, L.l2.end, L.l2.end + 0.4));          // "...yelling at dirt?" head tilt
    J.head[0] += f * tilt * 3; J.head[1] += tilt * 2;
    var dead = ramp(t, tYears - 0.4, tYears - 0.1); J.head[1] += dead * 2;                                 // chin down: deadpan
    return J;
  }

  // ---------- world ----------
  var back = document.getElementById("back"), props = document.getElementById("props"), figG = document.getElementById("fig");
  var front = document.getElementById("front"), camG = document.getElementById("cam");
  var Y = FilmSet.yard({ G0: G0, ref: [1040, 560, 1.25], look: "day", season: "summer", garden: { x: MX } });
  var rock = Props.rock(back, 610, G0);
  var bh = Kit.birdhouse(back, 1640, G0);
  var mound = Props.mound(props, MX, G0);
  var tree = Props.tree(props, MX - 16, G0 - 26);
  var pip = Props.pip(props);
  var bagG = el("g", {}, figG), bag = Kit.bag(bagG);                                    // behind Layla (far hand)
  var RL = SF.rig(figG, { scale: LL.scale, head: LL.head, ink: LL.ink, color: LL.color, accessories: LL.accessories, backInk: "#5a5751",
    expr: EX_L, blinks: BLINK_L, mouth: lipL, mouthFill: "#8e352d", lineComp: 0.6, seed: 2 });
  var RS = SF.rig(figG, { scale: LS.scale, head: LS.head, ink: LS.ink, color: LS.color, accessories: LS.accessories, backInk: "#5a5751",
    expr: EX_S, blinks: BLINK_S, mouth: mouthS, mouthFill: "#8e352d", lineComp: 0.6, seed: 1 });
  var fx = Kit.emanata(front);

  // Pip: flies in over the yard and lands on the birdhouse (OPEN); the cutaway at tPip tilts its head and chirps
  var PIP_FROM = [1980, 300], PIP_AT = bh.perch, tFly0 = 0.9, tFly1 = 2.5;
  function pipState(t) {
    if (t < tFly1) {
      var p = U.clamp((t - tFly0) / (tFly1 - tFly0), 0, 1), e = U.smooth(p);
      return { x: U.lerp(PIP_FROM[0], PIP_AT[0], e), y: U.lerp(PIP_FROM[1], PIP_AT[1], e) - Math.sin(Math.PI * e) * 70, f: -1, t: t, pose: "fly", hidden: t < tFly0 };
    }
    var ch = 0;[tFly1 + 0.4, tFly1 + 0.9, tPip + 0.3].forEach(function (c) { if (t > c && t < c + 0.18) ch = (t - c) / 0.18; });
    var tilt = ramp(t, tPip, tPip + 0.2) * (1 - ramp(t, tPipEnd, tPipEnd + 0.2)) * 24;
    return { x: PIP_AT[0], y: PIP_AT[1], f: -1, t: t, pose: t < tFly1 + 0.25 ? "hop" : "perch", hop: (t - tFly1) / 0.25, chirp: ch, tilt: tilt, seed: 1 };
  }

  // ---------- camera ----------
  var H0 = { sam: G0 - Kit.headInfo(jointsSam(0, true), RS, G0).top, layla: G0 - Kit.headInfo(jointsLayla(tArrive + 1), RL, G0).top };
  function resolve(id, t) {
    if (id === "mound") return { head: [MX, G0 - 60], top: G0 - 120, feet: G0, f: 1, h: H0.sam };
    if (id === "pip") return { head: [PIP_AT[0], PIP_AT[1]], top: PIP_AT[1] - 40, feet: PIP_AT[1] + 24, f: -1, h: 120 };
    var c = id === "sam" ? Kit.headInfo(jointsSam(t), RS, G0) : Kit.headInfo(jointsLayla(t), RL, G0); c.h = H0[id]; return c;
  }
  var cam = Shots.camera(SHOTS, { width: 1920, height: 1080, duration: DUR, resolve: resolve });
  var tfx = Shots.fx(document.getElementById("fxg"), [{ t: 0, type: "fadeIn", dur: 0.6 }]);

  // ---------- the title card (screen space, above everything) ----------
  var cardEl = document.getElementById("card");
  var cards = Kit.cards(cardEl, [{ t0: tTitle, t1: DUR + 1, c1: "Sam & Layla", c2: "Grow Faster!", c3: "Episode 1", fade: 0, wipe: true, pop: tPop2, pop3: tPop2 + 0.25 }]);
  var cg = Kit.cardSvg(cardEl);
  var cMound = el("g", {}, cg), cSprout = el("g", {}, cg);
  el("path", { d: Ink.path([[880, 960], [920, 934], [962, 928], [1002, 936], [1040, 960]], { wobble: 0.6, step: 8, seed: 9 }) + " Z", fill: "#b08a5e", stroke: "#2b2a28", "stroke-width": 4.5, "stroke-linejoin": "round" }, cMound);
  el("path", { d: "M 0 0 C 2 -16, -3 -30, 0 -46", stroke: "#5f9a3a", "stroke-width": 5, fill: "none", "stroke-linecap": "round" }, cSprout);
  el("path", { d: "M 0 -42 C -16 -58, -36 -51, -40 -40 C -27 -35, -11 -35, 0 -42 Z", fill: "#8cc265", stroke: "#2b2a28", "stroke-width": 3 }, cSprout);
  el("path", { d: "M 0 -44 C 14 -62, 34 -58, 38 -47 C 25 -40, 11 -40, 0 -44 Z", fill: "#8cc265", stroke: "#2b2a28", "stroke-width": 3 }, cSprout);
  var cPip = Props.pip(cg), cFx = Kit.emanata(cg);
  var CP_FROM = [-80, 260], CP_AT = [1052, 344];
  function cardPip(t) {
    if (t < tPipLand) {
      var p = U.clamp((t - tPipIn) / (tPipLand - tPipIn), 0, 1), e = U.smooth(p);
      return { x: U.lerp(CP_FROM[0], CP_AT[0], e), y: U.lerp(CP_FROM[1], CP_AT[1], e) - Math.sin(Math.PI * e) * 120, f: 1, t: t, pose: "fly", s: 1.6, hidden: t < tPipIn };
    }
    var ch = 0;[tPipLand + 0.35, tPipLand + 0.75].forEach(function (c) { if (t > c && t < c + 0.18) ch = (t - c) / 0.18; });
    return { x: CP_AT[0], y: CP_AT[1], f: 1, t: t, s: 1.6, pose: t < tPipLand + 0.25 ? "hop" : "perch", hop: (t - tPipLand) / 0.25, chirp: ch, look: 1, tilt: ramp(t, tSprout - 0.2, tSprout) * -18 };
  }

  function render(t) {
    var c = cam.apply(camG, t); Y.update(t, c);
    var JL = jointsLayla(t), JS = jointsSam(t);
    RL.set(JL, t, { zoom: c[2] }); RS.set(JS, t, { zoom: c[2] });
    var hb = JL.haL; bag.set(hb[0] - 4, hb[1] + 6, { rot: Math.sin(t * 5) * (t < tArrive ? 6 : 1.5) });
    mound.set(t, {}); tree.set(0, t, { season: "summer" });
    pip.set(pipState(t));
    var hs = Kit.headInfo(JS, RS, G0), f = JS._f || 1;
    fx.set({
      lines: t > tShock && t < tShock + 0.5 ? { x: hs.head[0], y: hs.head[1], r: RS.HR * 1.5, n: 7, amp: 22 } : null,
      twitch: t > tTwitch && t < tTwitch + 0.6 ? { x: hs.head[0] + f * RS.HR * 0.2, y: hs.head[1] + 4, k: 1 } : null,
      puff: t > tUp + 0.2 && t < tUp + 0.8 ? { x: JS.ftR[0], y: G0 - 4, k: (t - tUp - 0.2) / 0.6, s: 0.8 } : null,
      sweat: t > tShock + 0.2 && t < L.l11.start ? { x: hs.head[0] - f * RS.HR * 0.75, y: hs.head[1] - RS.HR * 0.3, k: ramp(t, tShock + 0.2, L.l11.start) } : null
    }, t);
    tfx.update(t);
    cards.update(t);
    var sp = U.clamp((t - tSprout) / 0.35, 0, 1);
    cSprout.setAttribute("transform", "translate(946 934) scale(" + (U.easeOutBack(sp) * 1.5).toFixed(3) + ")");
    cMound.setAttribute("opacity", ramp(t, tSprout - 0.6, tSprout - 0.3).toFixed(2));
    cPip.set(cardPip(t));
    cFx.set({ sparkle: t > tSprout && t < tSprout + 0.6 ? { x: 1000, y: 850, k: (t - tSprout) / 0.6, s: 1.4 } : null }, t);
  }
  window.__film = { MS: MS, ML: ML, RS: RS, RL: RL, cam: cam, resolve: resolve, jointsSam: jointsSam, jointsLayla: jointsLayla, bh: bh,
    beats: { tArrive: tArrive, tLook0: tLook0, tUp: tUp, tQ1: tQ1, tYears: tYears, tShock: tShock, tPip: tPip, tTitle: tTitle, tSprout: tSprout, DUR: DUR } };
  window.__timelines = window.__timelines || {};
  window.__timelines["main"] = SF.timeline(DUR, render);
})();
