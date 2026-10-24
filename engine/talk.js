/* talk.js — acting layers for TALKING stick figures (MIT). Load after stickfilm.js.
 *
 * Everything is a pure function of t (seek-safe), layered on top of the joints from M.joints(t):
 *   var J = M.joints(t);
 *   Talk.idle(J, t, "sami");                                  // breathing + tiny sway, phased per character
 *   Talk.act(M, J, t, [{g: "explain", t0: 3.1, t1: 5.4}]);    // named gestures with smooth in/out
 *   Talk.beats(M, J, t, C.beats);                             // small hand strokes on stressed words
 *   Talk.nods(J, t, C.nods);  Talk.accents(J, t, C.accents);  // listener nods, head bob on stressed syllables
 *   Talk.act(M, J, t, Talk.fromLines(DATA.lines, "sami"));    // quick first pass: scene.json line gestures
 *   R.set(J, t, {zoom: cam.at(t)[2]});                        // rig with mouth: Talk.mouth(C.mouth)
 * C = FILM_DATA.chars.<id> from tools/voice/dialogue.py (mouth cues, blinks, beats, nods, accents per character).
 *
 * Gesture specs are joint -> [anchorJoint, dx, dy] in CMU clip units (dx follows the facing direction: + = in front of
 * the character, dy + = down). They keep roughly the CMU bone lengths (upper arm ~80, forearm ~58), so arms never stretch.
 * Head circle in the same units: centre ~[11, -61] from the neck, radius 46 — a hand raised near the face must stay
 * >= 60 units from that centre (the arm is drawn over the head) or it reads as a hand IN the face. `palm: 1` = draw an
 * open stick hand (a fan of fingers, rig) at the near hand. New gestures: check them on a model sheet (tools/render/model_sheet.py) first.
 */
(function (root) {
  "use strict";
  var SF = root.StickFilm, U = SF.u;

  var GESTURES = {                  // elbows sit ~10 units above where they are drawn (arms start at the top of the spine)
    rest:      { elR: ["neck", -4, 78], haR: ["neck", 4, 134], elL: ["neck", 4, 78], haL: ["neck", 10, 132] },
    explain:   { elR: ["neck", 15, 85], haR: ["neck", 70, 67] },                                   // forearm forward, palm up
    palmsUp:   { elR: ["neck", 24, 76], haR: ["neck", 76, 58], elL: ["neck", -6, 78], haL: ["neck", 40, 66] },   // two separate forearms
    point:     { elR: ["neck", 78, -3], haR: ["neck", 135, -11] },                                 // at the one in front
    pointDown: { elR: ["neck", 50, 58], haR: ["neck", 88, 108] },                                  // at something on the ground in front
    shrug:     { elR: ["neck", 28, 80], haR: ["neck", 60, 30], elL: ["neck", -22, 80], haL: ["neck", -50, 32], head: [0, 5] },
    crossArms: { elR: ["neck", 60, 40], haR: ["neck", 4, 36], elL: ["neck", 52, 46], haL: ["neck", -2, 42] },   // elbows out front, forearms across the chest
    hips:      { elR: ["neck", -36, 52], haR: ["neck", 8, 68], elL: ["neck", -30, 54], haL: ["neck", 12, 70] },
    chin:      { elR: ["neck", 34, 34], haR: ["neck", 40, -24], head: [0, 2] },                    // thinking
    wave:      { elR: ["neck", 75, -30], haR: ["neck", 88, -78], osc: ["haR", 12, 2.6] },          // hand beside the face, never on it
    celebrate: { elR: ["neck", 62, -52], haR: ["neck", 104, -118], elL: ["neck", -58, -52], haL: ["neck", -98, -116] },
    handChest: { elR: ["neck", 52, 46], haR: ["neck", 14, 24] },                                   // "أنا" (me) / "oh!"
    facepalm:  { elR: ["neck", 50, 8], haR: ["neck", 36, -40], head: [0, 12], palm: 1, spread: 0.45 },   // flat hand over the eye, head bowed
    stop:      { elR: ["neck", 60, 30], haR: ["neck", 112, -4], palm: 1 },                         // palm out: "wait!"
    pointBack: { elL: ["neck", -55, 45], haL: ["neck", -100, 70] },                                // far arm, behind and down
    raise1:    { elR: ["neck", 80, -10], haR: ["neck", 92, -58] },                                 // one hand up, clear of the face: "one?"
    raise2:    { elR: ["neck", 78, -24], haR: ["neck", 94, -72], elL: ["neck", -78, -28], haL: ["neck", -80, -76] }   // a V: "two?!"
  };

  function seedOf(s) { return typeof s === "string" ? s.split("").reduce(function (a, c) { return (a * 31 + c.charCodeAt(0)) & 0xffff; }, 7) : (s || 1); }

  /* apply one gesture with weight w (0..1). side "L" mirrors an R-only gesture onto the far arm. */
  function pose(M, J, name, w, side, t) {
    var G = GESTURES[name]; if (!G || w <= 0) return;
    var spec = {};
    for (var j in G) {
      if (j === "head" || j === "osc" || j === "palm" || j === "spread") continue;
      var jj = side === "L" ? j.replace(/R$/, "L") : j;
      if (side === "L" && /L$/.test(j) && G[j.replace(/L$/, "R")]) continue;
      spec[jj] = G[j].slice();
    }
    if (G.osc && t != null) { var o = G.osc, k = side === "L" ? o[0].replace(/R$/, "L") : o[0]; if (spec[k]) spec[k][1] += o[1] * Math.sin(t * o[2] * Math.PI * 2); }
    M.pose(J, spec, w);
    if (G.head) { var f = J._f || 1; J.head[0] += f * G.head[0] * M.S * w; J.head[1] += G.head[1] * M.S * w; }
    if (G.palm && side !== "L") { J._palm = Math.max(J._palm || 0, w); if (G.spread) J._palmSpread = G.spread; }   // rig: open hand at haR
  }

  /* schedule [{g, t0, t1, amp = 1, side = "R", ease = 0.3, easeOut = ease}] — seconds to enter / leave the pose
     (a snappy entrance with a slow sink: {ease: 0.2, easeOut: 0.5}) */
  function act(M, J, t, schedule) {
    (schedule || []).forEach(function (s) {
      var e = s.ease == null ? 0.3 : s.ease, eo = s.easeOut == null ? e : s.easeOut;
      var w = U.ramp(t, s.t0, s.t0 + e) * (1 - U.ramp(t, s.t1 - eo, s.t1));
      if (w > 0) pose(M, J, s.g, w * (s.amp == null ? 1 : s.amp), s.side, t);
    });
  }

  /* beat gestures: a short stroke of the near hand peaking at each time (word onset), out and back in ~0.6 s.
     Relative to the current pose (works on top of act() gestures); opt.g = a gesture name to pose toward instead. */
  function beats(M, J, t, times, opt) {
    opt = opt || {}; var amp = opt.amp == null ? 1 : opt.amp, w = 0;
    (times || []).forEach(function (tb) { var x = (t - tb) / 0.2; if (x > -3 && x < 3) w = Math.max(w, Math.exp(-x * x)); });
    if (w < 0.01) return;
    if (opt.g) { pose(M, J, opt.g, w * Math.min(1, amp), opt.side, t); return; }
    var f = J._f || 1, k = M.S * w * amp, ha = opt.side === "L" ? "haL" : "haR", elb = opt.side === "L" ? "elL" : "elR";
    J[ha][0] += f * 14 * k; J[ha][1] -= 20 * k; J[elb][0] += f * 6 * k; J[elb][1] -= 7 * k;
  }

  /* listener nods: head dips twice, small, over 0.5 s */
  function nods(J, t, times, amp) {
    amp = amp == null ? 6 : amp; var dy = 0;
    (times || []).forEach(function (tn) { var x = t - tn; if (x > 0 && x < 0.5) dy += amp * Math.sin(x / 0.5 * Math.PI * 2) * Math.sin(x / 0.5 * Math.PI); });
    J.head[1] += Math.abs(dy) * 0.9; J.head[0] += (J._f || 1) * dy * 0.25;
  }

  /* head bob on stressed syllables (speaker): a quick dip at each accent time */
  function accents(J, t, times, amp) {
    amp = amp == null ? 3.2 : amp; var dy = 0;
    (times || []).forEach(function (ta) { var x = (t - ta) / 0.09; if (x > -3 && x < 3) dy = Math.max(dy, Math.exp(-x * x)); });
    J.head[1] += dy * amp; J.head[0] += (J._f || 1) * dy * amp * 0.35;
  }

  /* moving hold: breathing + sway, never in unison across characters (phase from the seed) */
  function idle(J, t, seed, opt) {
    opt = opt || {}; var s = seedOf(seed), ph = U.hash(s) * 6.283, amp = opt.amp == null ? 1 : opt.amp;
    var br = Math.sin(t * 2 * Math.PI / (3.4 + U.hash(s + 3) * 0.8) + ph) * 1.8 * amp;
    var sw = (Math.sin(t * 2 * Math.PI / (5.1 + U.hash(s + 5)) + ph * 1.3) + 0.5 * Math.sin(t * 1.7 + ph * 2.1)) * 1.1 * amp;
    SF.UPPER.concat(["chest"]).forEach(function (j) { J[j][1] += br * (j === "chest" ? 0.5 : 1); J[j][0] += sw * (j === "head" ? 1.3 : 0.7); });
  }

  /* default acting schedule from the script: every line of character `who` with a "gesture" (scene.json) holds that
     gesture from just before the line to just after it — a quick first pass; hand-write the schedule for key moments */
  function fromLines(lines, who, opt) {
    opt = opt || {}; var pre = opt.pre == null ? 0.15 : opt.pre, post = opt.post == null ? 0.3 : opt.post;
    return (lines || []).filter(function (l) { return l.who === who && l.gesture && GESTURES[l.gesture]; })
      .map(function (l) { return { g: l.gesture, t0: l.start - pre, t1: l.end + post, amp: opt.amp }; });
  }

  /* lip-sync track: cues [[t, "A".."H"|"X"], ...] (absolute seconds) -> function(t) for StickFilm.rig({mouth}) */
  function mouth(cues) { return U.track(cues || [], "X"); }

  /* true while the character's mouth is moving (any cue but X) — e.g. to pick who the camera follows */
  function speaking(cues, t) { return mouth(cues)(t) !== "X"; }

  root.Talk = { GESTURES: GESTURES, pose: pose, act: act, beats: beats, nods: nods, accents: accents, idle: idle, mouth: mouth,
    speaking: speaking, fromLines: fromLines };
})(typeof window !== "undefined" ? window : globalThis);
