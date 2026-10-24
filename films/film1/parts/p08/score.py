"""P08 score + Foley (common/toon.py on the repo mixer tools/audio/sound.py). Run from this folder after dialogue.py.
Beats use the same formulas as film.js. Night ambience all through (crickets + breeze), an owl; the LULLABY (music box)
plays Sam to sleep and STOPS DEAD on each snap ("I'm up!"), restarting softer; xylophone plinks + a soft "baa" per counted
sheep, pops when they turn into trees; snore cycles (one every SP s) from the moment he nods off, a huge one freezes Layla
mid-step; pizzicato tiptoes on her footfalls, cloth on the drape, a click for the headlamp; then the TIME-LAPSE cue
(speeding music box -> warm major chord at dawn), a fast-forward whoosh, the windows click off, pops + twinkles on every
growth step, birdsong and Pip's chirps at dawn. Mastered to -16 LUFS (assembly goes to -14)."""
import json, os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path[:0] = [os.path.join(HERE, "..", "..", "..", "..", "tools", "audio"), os.path.join(HERE, "..", "..", "common")]
from sound import Score
import toon as T

os.chdir(HERE)
TL = json.load(open("timeline.json", encoding="utf-8"))
L = {l["id"]: l for l in TL["lines"]}; DUR = TL["total"]
def w(i, k): ws = L[i]["words"]; return ws[k if k >= 0 else len(ws) + k]

# ---- beats (same formulas as film.js)
t_owl = 1.3
t_sip0 = L["l1"]["end"] + 0.45
t_close1 = L["l2"]["end"] + 0.15; t_snap1 = L["l3"]["start"] - 0.22
t_grow1 = [t_close1 + 0.9, t_close1 + 1.75]
t_close2 = L["l3"]["end"] + 0.45; t_snap2 = t_close2 + 1.15
t_grow2 = [t_close2 + 0.35, t_close2 + 0.75]
t_shake = t_snap2 + 0.15
t_bub0 = w("l4", 2)["t0"] - 0.15
t_j = [w("l4", 4)["t0"] + 0.1, w("l4", 6)["t0"] + 0.1, w("l5", 0)["t0"] + 0.1]
t_m = [w("l5", 2)["t0"], w("l5", 2)["t0"] + 0.12, w("l5", 1)["t0"]]
t_close3 = L["l5"]["end"] - 0.1; t_bub_out = L["l5"]["end"] + 0.3
t_in0 = L["l5"]["end"] + 0.3; P_IN = 0.6; N_IN = 4
t_freeze = t_in0 + 1.5 * P_IN; FREEZE = 1.0
t_arr = t_in0 + N_IN * P_IN + FREEZE
SP = 2.6; t_snore0 = t_freeze - 0.25
t_d0 = t_arr + 0.05; t_d1 = t_d0 + 1.0
t_reach = t_d1 + 0.1; t_click = t_reach + 0.4
t_turn = L["l6"]["end"] + 0.2
t_popL = L["l7"]["end"] + 0.35
t_out0 = L["l7"]["end"] + 1.45; P_OUT = 0.55; N_OUT = 10
t_tl = t_out0 + 0.25
t_fast = t_tl + 1.4
t_win = t_tl + 3.2
t_grow_t = [t_tl + 2.6 + k * 1.8 for k in range(4)]
t_leaf_shot = t_tl + 9.3; t_leaf0 = t_leaf_shot - 0.4; t_leaf1 = t_leaf_shot + 1.6
t_wide2 = t_leaf_shot + 6.0
t_grow_t += [t_wide2 + 0.8, t_wide2 + 2.6]
t_dawn0 = t_tl + 13.4
t_pip = DUR - 3.6
t_poses = [t_tl + 2.0, t_tl + 4.4, t_tl + 6.6]

S = Score(DUR)
# ---- ambience (Foley bus, not ducked — keep it low): night crickets + breeze, then birdsong at dawn
S.sfx_add(T.sfx("night_amb", d=t_dawn0 + 6.0), 0.0, 0.10)
S.sfx_add(T.sfx("birdsong", d=DUR - t_dawn0 - 3.0), t_dawn0 + 3.0, 0.16)
S.sfx_add(T.sfx("owl"), t_owl, 0.22)
S.sfx_add(T.sfx("owl"), t_tl + 4.6, 0.16)

# ---- music I: the lullaby (music box waltz) plays him to sleep; it STOPS DEAD on each snap
S.music_add(T.cue("lullaby", t_snap1 - 0.6), 0.6, 0.7)
S.music_gap(t_snap1 - 0.02, L["l3"]["end"] + 0.3, 0.05)
S.music_add(T.cue("lullaby", t_snap2 - L["l3"]["end"] - 0.3), L["l3"]["end"] + 0.3, 0.55)
S.music_gap(t_snap2 - 0.02, L["l4"]["start"] - 0.1, 0.05)
S.music_add(T.cue("lullaby", t_tl - L["l4"]["start"] + 0.2), L["l4"]["start"] - 0.1, 0.65)
S.music_gap(t_tl - 0.05, t_tl + 0.02, 0.1)
# ---- music II: the time-lapse (speeding music box -> warm major chord at dawn)
S.music_add(T.cue("timelapse", DUR - t_tl - 0.2), t_tl, 0.9)

# ---- Foley / gags (Foley bus: never ducked)
S.sfx_add(T.foley("cloth", 2), w("l1", 5)["t0"] - 0.3, 0.10)                         # leans in: "I'm not blinking"
S.sfx_add(T.sfx("eye_twitch"), w("l1", 7)["t1"] + 0.15, 0.12)
S.sfx_add(T.foley("cloth", 0), t_sip0, 0.12)                                         # the sip
S.sfx_add(T.foley("glass", 1), t_sip0 + 0.4, 0.12)
S.sfx_add(T.sfx("gulp"), t_sip0 + 1.05, 0.22); S.sfx_add(T.sfx("gulp"), t_sip0 + 1.4, 0.2)
S.sfx_add(T.sfx("steam", d=1.0), t_sip0 + 1.8, 0.08)
S.sfx_add(T.foley("impactWood_light", 1), t_sip0 + 2.15, 0.14)
# droop #1: head slides down, a tiny snore, the sapling grows (pop + twinkle), SNAP
S.sfx_add(T.slide_whistle(False, 0.8), L["l2"]["end"] - 0.05, 0.12)
S.sfx_add(T.sfx("snore", d=1.6), t_close1 + 0.75, 0.16)
for tg in t_grow1 + t_grow2:
    S.sfx_add(T.sfx("pop", f0=380, f1=1500), tg, 0.2); S.sfx_add(T.sfx("twinkle"), tg + 0.03, 0.12)
S.sfx_add(T.boing(0.5, 300), t_snap1, 0.3); S.sfx_add(T.sfx("whoosh"), t_snap1 - 0.05, 0.15)
# droop #2 (silent, faster): a quicker slide, it grows twice, a BIGGER snap + head shake (brrr)
S.sfx_add(T.slide_whistle(False, 0.5), L["l3"]["end"] + 0.18, 0.12)
S.sfx_add(T.boing(0.6, 360), t_snap2, 0.38); S.sfx_add(T.sfx("whoosh"), t_snap2 - 0.05, 0.2)
for k in range(5): S.sfx_add(T.sfx("whoosh", d=0.12), t_shake + k * 0.12, 0.06)
# counting sheep: the bubble bloops up; xylophone count + a soft baa per sheep; they turn into trees (pops)
S.sfx_add(T.sfx("bloop"), t_bub0, 0.25)
for k, (tj, m) in enumerate(zip(t_j, (72, 76, 79))):
    S.sfx_add(T.boing(0.35, 420 - 40 * k), tj - 0.3, 0.08)
    S.music_add(T.xylo(m, 0.6), tj - 0.02, 0.4)
    S.sfx_add(T.sfx("baa", d=0.6 + 0.15 * k, f=330 - 30 * k), tj + 0.35, 0.10)
for tm in t_m:
    S.sfx_add(T.sfx("pop", f0=500, f1=1700), tm, 0.2)
S.sfx_add(T.sfx("twinkle"), t_m[0] + 0.1, 0.14)
S.sfx_add(T.slide_whistle(False, 1.0), t_close3 - 0.1, 0.10)                      # nods off
S.sfx_add(T.sfx("pop"), t_bub_out, 0.25)                                             # the bubble pops
# snoring: one cycle every SP s from t_snore0 to the end; the first one is HUGE (Layla freezes)
t = t_snore0; k = 0
while t < DUR - 0.5:
    g = 0.42 if k == 0 else (0.24 if t < t_tl else 0.14)
    S.sfx_add(T.sfx("snore", d=SP), t, g); t += SP; k += 1
S.sfx_add(T.sfx("eye_twitch"), t_freeze + 0.15, 0.12)
# Layla: pizzicato tiptoes on her footfalls (in), cloth on the drape, the headlamp click
for i in range(N_IN):
    ts = t_in0 + i * P_IN + 0.3 * P_IN
    if ts > t_freeze: ts += FREEZE
    S.sfx_add(T.pizz((67, 70, 74, 70)[i % 4], 0.25), ts, 0.30)
    S.sfx_add(T.foley("footstep_grass", i), ts, 0.06)
S.sfx_add(T.foley("cloth", 1), t_d0 + 0.2, 0.22); S.sfx_add(T.sfx("whoosh", d=0.5), t_d0 + 0.3, 0.1)
S.sfx_add(T.foley("cloth", 3), t_d1 - 0.1, 0.16)
S.sfx_add(T.foley("click", 1), t_click, 0.3)
S.sfx_add(T.sfx("pop", f0=600, f1=1800), t_popL, 0.16); S.sfx_add(T.sfx("twinkle"), t_popL + 0.05, 0.14)
# tiptoe out (normal speed), then fast-forward
for i in range(4):
    S.sfx_add(T.pizz((74, 70, 67, 70)[i % 4], 0.25), t_out0 + i * P_OUT + 0.3 * P_OUT, 0.26)
S.sfx_add(T.sfx("whoosh", d=0.6, lo=600, hi=5000), t_fast - 0.1, 0.18)
S.sfx_add(T.foley("click", 3), t_win, 0.22)
for tg in t_grow_t:
    S.sfx_add(T.sfx("pop", f0=380, f1=1500), tg, 0.18); S.sfx_add(T.sfx("twinkle"), tg + 0.03, 0.10)
for tp in t_poses: S.sfx_add(T.foley("cloth", 2), tp, 0.08)
S.sfx_add(T.sfx("rustle", d=0.8), t_leaf0, 0.06)
S.sfx_add(T.foley("cloth", 0), t_leaf1, 0.06)
# dawn: Pip wakes, wing stretch, chirps
S.sfx_add(T.sfx("wings"), t_pip + 0.4, 0.12)
for k, c in enumerate([t_pip + 0.75, t_pip + 1.05, t_pip + 1.6, t_pip + 2.2]): S.sfx_add(T.chirp(k), c, 0.22)

S.voice({k: v["start"] for k, v in L.items()}, "assets/voice/{}.mp3")
os.makedirs("proj/assets", exist_ok=True)
S.render("proj/assets/mix.wav", music_gain=0.3, duck=0.6, fade_in=0.3, fade_out=0.6, lufs=-16)
