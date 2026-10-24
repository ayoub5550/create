"""P06 score + Foley (common/toon.py on the repo mixer tools/audio/sound.py). Run from this folder after dialogue.py.
Beats use the same formulas as film.js. Comedy in sound: a "scheme" pizzicato under the briefing with a wood TAP on every
row of the sign; it stops for Layla's dry "Step four"; an oom-pah march + heavy footsteps that cut DEAD when Sam leaves the
frame -> silence (yard only), a creak and a slow slide whistle as the sprout stretches, a pop when his head appears, two
"innocent" music-box notes, crickets after "...Ha?"; a little whistled tune (sine + vibrato) over the "sneaky" cue for the
disguise, dead air for "Hi, Sam.", a squeak, a falling whistle and a tiny tick for the mustache; THE BUSH: "sneaky" music
and leaf rustle that stop dead on every freeze (x3), Pip's wings, a zip when the scarf is yanked in, a pop + glock flourish
when it pokes back out, pecks, a boing for the head bursting out, angry chirps, pop-pop-pop + a magic shimmer as the sprout
grows leaves, a small glock button for Layla. Ambience (yard) + soft knitting clicks run under the whole part."""
import json, os, sys
import numpy as np
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path[:0] = [os.path.join(HERE, "..", "..", "..", "..", "tools", "audio"), os.path.join(HERE, "..", "..", "common")]
from sound import Score, SR
import toon as T

os.chdir(HERE)
TL = json.load(open("timeline.json", encoding="utf-8"))
LS = json.load(open("lipsync.json", encoding="utf-8"))
L = {l["id"]: l for l in TL["lines"]}; DUR = TL["total"]
def w(i, k): ws = L[i]["words"]; return ws[max(0, min(len(ws) - 1, k if k >= 0 else len(ws) + k))]
def onset(i):
    l = L[i]
    for c in LS[i]["cues"]:
        t = l["start"] + c[0]
        if t >= l["start"] - 0.01 and t < l["end"] and c[1] != "X": return t
    return l["start"]
def smooth(x): x = min(1, max(0, x)); return x * x * (3 - 2 * x)

# ---- beats (same formulas as film.js)
t_sweep0 = w("l1", 0)["t0"] - 0.1; t_sweep1 = w("l1", 2)["t1"]
TAPS = [w("l1", 4)["t0"] - 0.05, w("l2", 1)["t0"] - 0.05, w("l2", 5)["t0"] - 0.05]
t_drop = TAPS[2] + 0.45; t_turn = w("l2", 7)["t0"] - 0.3; t_wave = w("l5", 1)["t0"] - 0.15
t_march = w("l5", 3)["t0"] - 0.12; MARCH_K = 1.3; MARCH_D = (131 - 20) / 30 / MARCH_K
t_stretch0 = L["l5"]["end"] + 0.9; t_pop = onset("l6") - 0.14; t_ha2 = w("l6", 1)["t0"]
t_stepin = L["l7"]["start"] - 0.05; t_march2 = w("l8", 3)["t0"] + 0.05
t_cutl1 = t_march2 + 1.8; t_ws3 = t_cutl1 + 1.0
t_arrd = L["l9"]["start"] - 0.05; t_stroll = t_arrd - 2.3
t_reach = onset("l11") - 0.3; t_pull = onset("l11") + 0.12
t_peel = t_pull + 0.75; t_fall0 = t_pull + 0.95; t_land = t_fall0 + 0.38
t_cutl2 = t_land + 0.5; t_storm = t_cutl2 + 0.15; t_bushws = t_cutl2 + 1.0
t_b0 = t_bushws + 0.2; t_f1 = t_b0 + 2.0; t_r1 = t_f1 + 0.9; t_f2 = t_r1 + 1.4; t_r2 = t_f2 + 1.1; t_f3 = L["l12"]["start"] - 0.78
t_pipfly = t_r2 + 0.2; t_pipland = t_pipfly + 0.75
t_peek = L["l13"]["start"] - 0.28
t_yank = L["l14"]["end"] + 0.1; t_flourish = w("l15", 0)["t0"] - 0.05
t_peck = onset("l16") - 0.42; t_ow = onset("l16") - 0.04
t_leaf0 = L["l16"]["end"] - 0.05; t_leaf1 = t_leaf0 + 1.2; t_lay = t_leaf1 + 0.35
GLANCES = [t_f1 - 0.14, t_f2 - 0.14, t_f3 - 0.14]
MOVES = [(t_b0, t_f1), (t_r1, t_f2), (t_r2, t_f3)]
CHIRPS = [1.4, 9.9, t_stretch0 - 0.3, t_ws3 + 1.2, t_pipland + 0.3, t_ow + 1.0, t_ow + 1.45, L["l16"]["end"] + 0.2, L["l16"]["end"] + 0.65]
STEP = (104 - 69) / 30 / 2                      # walk clip: half a cycle per footstep at 1x
if "--beats" in sys.argv:
    print({k: round(v, 3) for k, v in dict(globals()).items() if k.startswith("t_") and isinstance(v, float)}); sys.exit()

S = Score(DUR)
# ---- under everything: the yard + Layla's needles (Foley bus, low)
S.sfx_add(T.sfx("yard_amb", d=DUR), 0.0, 0.09)
S.sfx_add(T.sfx("knitting", d=DUR - 0.5), 0.2, 0.035)

# ---- I. the briefing: "scheme" pizzicato, a wood tap per row of the sign
S.music_add(T.cue("scheme", L["l3"]["start"] - 0.3), 0.25, 0.65)
S.sfx_add(T.sfx("whoosh"), t_sweep0 + 0.3, 0.06)
for k, t in enumerate(TAPS):
    S.sfx_add(T.woodblock(84 + 3 * k, 0.15), t + 0.01, 0.35); S.sfx_add(T.foley("impactWood_light", k), t + 0.01, 0.3)
S.sfx_add(T.foley("impactWood_light", 3), t_drop + 0.3, 0.35); S.sfx_add(T.foley("impactWood_light", 4), t_drop + 0.42, 0.15)   # the stick falls
S.sfx_add(T.boing(0.45, 300), w("l2", 9)["t0"] - 0.03, 0.18)                     # "growing!" hop
S.sfx_add(T.pizz(55, 0.4), L["l3"]["start"] - 0.25, 0.3)                          # music out: Layla's dry line in quiet
S.sfx_add(T.foley("cloth", 0), L["l4"]["start"] - 0.05, 0.12)                     # waves it off

# ---- II. the loud march: oom-pah + stomping, CUT DEAD when he is out of frame
t_exit = t_march + 2.15
oom = []; t = t_march + 0.1; k = 0
while t < t_exit - 0.05:
    oom.append((t, k)); t += STEP / MARCH_K; k += 1
for t, k in oom:
    S.music_add(T.brass(43 if k % 2 == 0 else 50, 0.22), t, 0.55 if k % 2 == 0 else 0.4)
    if k % 2: S.music_add(T.brass(59, 0.18, mute=0.3), t, 0.25)
    S.music_add(T.snare(0.1), t, 0.25 if k % 2 else 0.12)
    S.sfx_add(T.foley("footstep_grass", k % 5), t, 0.5 * max(0.25, 1 - (t - t_march) / 3.0))
    S.sfx_add(T.foley("impactSoft_medium", k % 3), t, 0.12)
S.music_add(T.cymbal(0.6), t_march + 0.05, 0.12)
S.music_gap(t_exit, L["l7"]["start"], 0.03)
S.sfx_add(T.foley("footstep_grass", 2), t_exit + 0.1, 0.08); S.sfx_add(T.foley("footstep_grass", 3), t_exit + 0.55, 0.04)   # off, far away
# the sprout stretches in the silence... Sam pops in
S.sfx_add(T.sfx("tree_creak"), t_stretch0, 0.22)
S.sfx_add(T.slide_whistle(True, t_pop - t_stretch0 - 0.35), t_stretch0 + 0.35, 0.08)
S.sfx_add(T.sfx("pop"), t_pop + 0.02, 0.4); S.sfx_add(T.sfx("whoosh"), t_pop - 0.08, 0.15)
S.sfx_add(T.woodblock(96, 0.1), t_pop + 0.08, 0.25)                                # the sprout freezes
S.sfx_add(T.musicbox(84, 0.8), t_pop + 0.45, 0.25); S.sfx_add(T.musicbox(88, 1.0), t_pop + 0.75, 0.22)   # innocent
S.sfx_add(T.sfx("crickets"), L["l6"]["end"] + 0.1, 0.06)
S.sfx_add(T.boing(0.4, 260), L["l7"]["start"] + 0.5, 0.06)                         # (off screen) the sprout settles back
for i in range(3): S.sfx_add(T.foley("footstep_grass", i), t_stepin + 0.15 + i * STEP, 0.06)
# second march off
t_exit2 = t_march2 + 1.75; t = t_march2 + 0.1; k = 0
while t < t_exit2:
    S.music_add(T.brass(43 if k % 2 == 0 else 50, 0.2), t, 0.45)
    S.music_add(T.snare(0.1), t, 0.2 if k % 2 else 0.1)
    S.sfx_add(T.foley("footstep_grass", k % 5), t, 0.45 * max(0.3, 1 - (t - t_march2) / 2.5)); t += STEP / MARCH_K; k += 1
S.music_gap(t_exit2, t_ws3 - 0.35, 0.03)

# ---- III. the disguise: "sneaky" + a whistled tune (sine with vibrato), dead air for "Hi, Sam."
S.music_add(T.cue("sneaky", L["l10"]["start"] - (t_ws3 - 0.35)), t_ws3 - 0.35, 0.45)
def whistle(m, d):
    n = int(SR * d); tt = np.arange(n) / SR
    f = 440 * 2 ** ((m - 69) / 12) * (1 + 0.012 * np.sin(2 * np.pi * 6.2 * tt) * np.clip(tt / 0.12, 0, 1))
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) + 0.04 * np.random.default_rng(int(m)).standard_normal(n)
    e = np.minimum(1, tt / 0.03) * np.minimum(1, (d - tt) / 0.06); return s * e
mel = [(76, .22), (79, .22), (84, .4), (83, .2), (79, .22), (76, .5)]
t = t_stroll + 0.15
for m, d in mel:
    if t + d > t_arrd - 0.05: break
    S.sfx_add(whistle(m, d * 0.92), t, 0.16); t += d
t = t_stroll + 0.1
while t < t_arrd - 0.1:
    S.sfx_add(T.foley("footstep_grass", int(t * 7) % 5), t, 0.12); t += STEP
S.music_gap(L["l10"]["start"] - 0.1, DUR, 0.08)
S.sfx_add(T.sfx("gulp"), L["l10"]["end"] + 0.05, 0.16)
S.sfx_add(T.foley("cloth", 2), t_pull, 0.2); S.sfx_add(T.sfx("pop", f0=900, f1=500), t_pull + 0.1, 0.18)   # glasses off
S.sfx_add(T.sfx("eye_twitch"), t_pull + 0.4, 0.14)
S.sfx_add(T.sfx("squeak", d=0.25, n_=1), t_peel, 0.1)                                # it peels...
S.sfx_add(T.fall_whistle(t_land - t_fall0 + 0.05), t_fall0, 0.12)
S.sfx_add(T.woodblock(100, 0.07), t_land, 0.3)                                        # ...tiny tick
S.sfx_add(T.sfx("crickets"), t_land + 0.15, 0.05)
for i in range(4): S.sfx_add(T.foley("footstep_grass", i), t_storm + 0.15 + i * STEP / MARCH_K, 0.3 * (1 - i * 0.22))   # stomps off

# ---- IV. THE BUSH: sneaky music + rustle that stop dead on every freeze; Pip rides in
t_bm = t_bushws - 0.1
S.music_add(T.cue("sneaky", t_f3 - t_bm + 0.1), t_bm, 0.65)
for a, b in MOVES:
    S.sfx_add(T.sfx("rustle", d=b - a + 0.05, seed=int(a * 10)), a, 0.2)
    t = a + 0.1
    while t < b - 0.05: S.sfx_add(T.foley("footstep_grass", int(t * 9) % 5), t, 0.05); t += STEP / 0.557
for a, b in [(t_f1, t_r1), (t_f2, t_r2)]:
    S.music_gap(a, b, 0.02)
    S.sfx_add(T.woodblock(91, 0.06), a, 0.12)                                         # the freeze: a tiny "tk"
S.music_gap(t_f3, L["l13"]["start"] - 0.1, 0.02); S.sfx_add(T.woodblock(91, 0.06), t_f3, 0.12)
for g in GLANCES: S.sfx_add(T.foley("cloth", 3), g, 0.06)
S.sfx_add(T.sfx("wings"), t_pipfly + 0.05, 0.18); S.sfx_add(T.sfx("wings"), t_pipfly + 0.45, 0.14)
S.sfx_add(T.foley("click", 1), t_pipland, 0.1)
S.sfx_add(T.sfx("crickets"), t_f3 + 0.2, 0.05)
S.sfx_add(T.sfx("rustle", d=0.35, seed=5), t_peek, 0.22)                              # the leaves part
S.music_add(T.cue("sneaky", t_yank - L["l13"]["start"] + 0.4), L["l13"]["start"] - 0.1, 0.35)
S.sfx_add(T.sfx("zip"), t_yank - 0.03, 0.3); S.sfx_add(T.sfx("rustle", d=0.3, seed=6), t_yank, 0.18)   # scarf yanked in
S.music_gap(t_yank, t_flourish - 0.05, 0.03)
S.sfx_add(T.sfx("pop", f0=500, f1=1500), t_flourish + 0.02, 0.3)                      # ...and pokes back out
S.sfx_add(T.glock(84, 0.8), t_flourish + 0.08, 0.2); S.sfx_add(T.glock(91, 1.0), t_flourish + 0.22, 0.2)
S.sfx_add(T.sfx("peck"), t_peck, 0.5)
S.sfx_add(T.sfx("boing"), t_ow, 0.3); S.sfx_add(T.sfx("rustle", d=0.5, seed=7), t_ow - 0.02, 0.3)
S.sfx_add(T.sfx("wings"), t_ow + 0.05, 0.22); S.sfx_add(T.sfx("wings"), t_ow + 0.8, 0.12)
for c in CHIRPS: S.sfx_add(T.chirp(int(c * 10) % 5), c, 0.24 if c > t_ow else 0.16)
for c in (t_ow + 1.0, t_ow + 1.45, L["l16"]["end"] + 0.2, L["l16"]["end"] + 0.65): S.sfx_add(T.chirp(3), c + 0.09, 0.18)   # angry double chirps
# the sprout pops new leaves behind him (leaf thresholds of props.js: g = .2167 / .2333 / .25)
for p in (0.278, 0.556, 0.833):
    x = 0.0
    for _ in range(60): x += (p - smooth(x)) / max(0.05, 6 * x * (1 - x))
    S.sfx_add(T.sfx("pop", f0=420 + 200 * p, f1=1400 + 500 * p), t_leaf0 + x * (t_leaf1 - t_leaf0), 0.3)
S.music_add(T.cue("magic", t_leaf1 - t_leaf0 + 0.6), t_leaf0 - 0.1, 0.45)
S.sfx_add(T.sfx("twinkle"), t_leaf1 - 0.2, 0.18)
S.music_add(T.pizz(67, 0.5), t_lay + 0.35, 0.35); S.music_add(T.glock(79, 1.2), t_lay + 0.6, 0.25)   # Layla's little button

S.voice({k: v["start"] for k, v in L.items()}, "assets/voice/{}.mp3")
os.makedirs("proj/assets", exist_ok=True)
S.render("proj/assets/mix.wav", music_gain=0.3, duck=0.6, fade_in=0.3, fade_out=0.6, lufs=-16)
