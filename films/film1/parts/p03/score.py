"""P03 score + Foley (common/toon.py on the repo mixer tools/audio/sound.py). Run from this folder after dialogue.py.
Beats use the same formulas as film.js. Comedy in sound: a pizzicato "scheme" bed for Plan D with a squeaky wheel; the
dump is a big dirt_dump THUD + dust; Pip's wings as it bolts; the flies buzz; a stink trombone on the smell lines; the
music stops for the sniff... sniff... gag; a big whoosh on the wipe into a sped-up shovel montage (scrape/crunch per
scoop, a fast xylophone run), the shovel clangs off-screen, zip-out / zip-in whooshes, the boombox scrapes along the
grass; a CLICK + the "groove" cue through a small speaker for the dance (Layla's needles click and her foot taps ON the
beat, Pip chirps along); "Then it'll feel the BASS!": the full-range groove + boom + bass thumps + wind, boombox hop
clunks, Pip's tumbling squawk; the boombox topples: power_down "bwomp" — dead silence — crickets under the deadpan.
Mastered to -16 LUFS (assembly goes to -14)."""
import json, os, sys
import numpy as np
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path[:0] = [os.path.join(HERE, "..", "..", "..", "..", "tools", "audio"), os.path.join(HERE, "..", "..", "common")]
from sound import Score, thud
import toon as T

os.chdir(HERE)
TL = json.load(open("timeline.json", encoding="utf-8"))
L = {l["id"]: l for l in TL["lines"]}; DUR = TL["total"]
def w(i, k): ws = L[i]["words"]; return ws[max(0, min(len(ws) - 1, k if k >= 0 else len(ws) + k))]

# ---- beats (same formulas as film.js)
t_arr = w("l1", 2)["t0"] - 0.15
t_lift = L["l3"]["start"] - 0.1; t_tip = w("l3", 2)["t0"]; t_dump = t_tip + 0.22
t_drop = t_tip + 0.95
t_flee = t_dump + 0.55
t_pinch0 = L["l6"]["start"] - 0.25
t_sniff = L["l6"]["end"] + 0.2; t_gag = t_sniff + 0.8; t_wipe = t_gag + 1.05; WD = 0.5; t_swap = t_wipe + WD / 2
NSC, SCOOP = 6, 0.25; t_mont_end = t_swap + NSC * SCOOP
t_toss = t_mont_end + 0.05; t_turn = t_toss + 0.2; t_zip = t_turn + 0.12; t_back = t_zip + 0.42
t_arr2 = L["l7"]["start"] - 0.1
t_play = L["l7"]["end"] + 0.3
BPM = 104; BEAT = 60 / BPM; t_mus = t_play
t_pip_in = t_play + 1.4; t_pip_land = t_play + 2.5
t_crank0 = L["l10"]["start"] - 0.35; t_twist = w("l10", 2)["t0"] - 0.05; t_bass = w("l10", 4)["t1"] - 0.05
t_blow = t_bass + 0.35; t_topple = t_bass + 1.45

S = Score(DUR)
R = np.random.default_rng(3)
def sniff(seed):
    n = int(T.SR * 0.22); x = T.bp(np.random.default_rng(seed).standard_normal(n), 1800, 7000)
    e = np.sin(np.linspace(0, np.pi, n)) ** 2; return T.norm(x * e)
def scrape(d, seed=5):          # boombox dragged over grass: low rough noise, pulsing with the steps
    n = int(T.SR * d); x = T.bp(np.random.default_rng(seed).standard_normal(n), 180, 1400)
    tt = np.arange(n) / T.SR; e = (0.55 + 0.45 * np.abs(np.sin(tt * np.pi * 2.6))) * np.minimum(1, tt / 0.05) * np.minimum(1, (d - tt) / 0.1)
    return T.norm(x * e)

# ---- ambience: the yard (Foley bus, low) — through the whole part, under the silence too
S.sfx_add(T.sfx("yard_amb", d=DUR), 0.0, 0.09)

# ---- music I: Plan D "scheme" bed, stops for the sniff
S.music_add(T.cue("scheme", t_sniff - 0.1 + 0.2), 0.0, 0.7)
S.music_gap(t_sniff - 0.1, t_wipe, 0.12)
# ---- montage: a fast happy run (sped up)
S.music_add(T.cue("happy", t_mont_end - t_swap + 0.3, bpm=168, busy=1.0), t_swap - 0.05, 0.75)
for k in range(8):
    S.music_add(T.xylo(72 + [0, 2, 4, 5, 7, 9, 11, 12][k], 0.25), t_swap + k * 0.17, 0.35)
S.music_gap(t_mont_end + 0.25, t_mus - 0.02, 0.08)
# ---- music II: the boombox groove (small speaker) ... the BASS (full range) ... power down -> silence
S.music_add(T.cue("groove", t_bass - t_mus + 0.1, bpm=BPM), t_mus, 1.0)
S.music_add(T.cue("groove", t_topple - t_bass + 0.2, bpm=BPM, speaker=False), t_bass, 1.0)
S.music_gap(t_topple + 0.05, DUR, 0.05)

# ---- Foley / gags
t = 0.15
while t < t_arr:                                                              # the squeaky wheel + footsteps
    S.sfx_add(T.sfx("squeak", d=0.3, n_=1, seed=int(t * 10)), t, 0.16); t += 0.42
t = 0.1
while t < t_arr:
    S.sfx_add(T.foley("footstep_grass", int(t * 10) % 5), t, 0.14); t += 0.55
S.sfx_add(T.foley("impactWood_light", 1), t_arr + 0.25, 0.25)              # sets it down
S.sfx_add(T.foley("creak", 1), t_lift, 0.18)                                 # lifts the handles
S.sfx_add(T.sfx("whoosh"), t_tip - 0.05, 0.2)
S.sfx_add(T.sfx("dirt_dump"), t_dump - 0.05, 0.45)                            # THE MOUNTAIN
S.sfx_add(thud(60, 0.4), t_dump, 0.45)
S.sfx_add(T.chirp(4), t_flee - 0.3, 0.3); S.sfx_add(T.chirp(2), t_flee - 0.15, 0.25)     # Pip: alarm chirps + bolts
S.sfx_add(T.sfx("wings"), t_flee, 0.28); S.sfx_add(T.sfx("whoosh", d=0.4, lo=900, hi=5000), t_flee + 0.05, 0.12)
S.sfx_add(T.sfx("flies", d=t_swap - t_dump - 0.5), t_dump + 0.5, 0.18)     # buzzing until the wipe
S.sfx_add(T.sfx("stink"), t_dump + 1.1, 0.22)
S.sfx_add(T.sfx("stink"), t_pinch0 + 0.1, 0.16)
S.sfx_add(sniff(1), t_sniff, 0.35); S.sfx_add(sniff(2), t_sniff + 0.32, 0.4)
S.sfx_add(T.brass(46, 0.55, bend=-4, mute=0.8), t_gag, 0.16)                # "hurk"
S.sfx_add(T.sfx("gulp"), t_gag + 0.35, 0.25)
S.sfx_add(T.sfx("whoosh_big"), t_wipe - 0.05, 0.4)                           # the WIPE
for k in range(NSC):                                                          # speed shovelling
    S.sfx_add(T.sfx("crunch", seed=21 + k), t_swap + k * SCOOP + 0.05, 0.3)
    S.sfx_add(T.sfx("whoosh", d=0.2, lo=600, hi=4000, seed=k), t_swap + (k + 0.55) * SCOOP, 0.12)
S.sfx_add(T.sfx("whoosh"), t_toss, 0.2); S.sfx_add(T.foley("metalPot", 2), t_toss + 0.72, 0.32); S.sfx_add(T.foley("impactPlank_medium", 0), t_toss + 0.78, 0.2)   # shovel tossed: CLANG off-screen
S.sfx_add(T.sfx("whoosh", d=0.35, lo=400, hi=5000, seed=7), t_zip, 0.35)   # zip out
S.sfx_add(T.sfx("whoosh", d=0.35, lo=400, hi=5000, seed=8), t_back - 0.05, 0.35)   # zip in
S.sfx_add(scrape(t_arr2 - t_back), t_back, 0.22)                             # dragging the boombox
t = t_back + 0.3
while t < t_arr2:
    S.sfx_add(T.foley("footstep_grass", int(t * 10) % 5), t, 0.14); t += 0.5
S.sfx_add(T.foley("impactWood_medium", 1), t_arr2 + 0.1, 0.3)               # sets it down
S.sfx_add(T.foley("click", 1), t_play, 0.4); S.sfx_add(T.foley("impactWood_light", 2), t_play, 0.3)   # SLAM play
# the dance: Layla's needles + foot ON the beat; Pip arrives and chirps along
k = 0; t = t_mus + BEAT
while t < t_bass:
    S.sfx_add(T.foley("click", k % 3), t, 0.06)
    if t > t_mus + 0.8: S.sfx_add(T.foley("footstep_grass", k % 5, rate=1.4), t, 0.07)
    t += BEAT; k += 1
S.sfx_add(T.sfx("wings"), t_pip_in + 0.2, 0.2); S.sfx_add(T.sfx("wings"), t_pip_in + 0.8, 0.15)
S.sfx_add(T.chirp(0), t_pip_land + 0.6, 0.18); S.sfx_add(T.chirp(3), t_pip_land + 0.6 + 2 * BEAT, 0.16)
# the BASS
for k in range(5): S.sfx_add(T.foley("tick", k % 3), t_twist + k * 0.1, 0.25)    # the knob ratchets
S.sfx_add(T.sfx("boom"), t_bass, 0.22)
S.sfx_add(T.sfx("bass_thump", d=t_topple - t_bass, bpm=BPM * 2), t_bass, 0.35)
S.sfx_add(T.sfx("wind"), t_bass + 0.05, 0.22)
S.sfx_add(T.sfx("rumble", d=t_topple - t_bass), t_bass, 0.2)
t = t_bass; k = 0
while t < t_topple - 0.05:                                                    # the boombox hops
    S.sfx_add(T.foley("impactWood_light", k % 3), t + 60 / BPM / 2 * 0.5, 0.12); t += 60 / BPM / 2; k += 1
S.sfx_add(T.chirp(4), t_blow, 0.3); S.sfx_add(T.sfx("slide_down"), t_blow + 0.05, 0.18)   # Pip blown away
S.sfx_add(T.foley("impactWood_heavy", 0), t_topple + 0.28, 0.22)            # it topples...
S.sfx_add(T.sfx("power_down"), t_topple, 0.3)                                # "bwomp"
S.sfx_add(T.sfx("crickets"), t_topple + 1.0, 0.08)
S.sfx_add(T.sfx("crickets"), L["l11"]["end"] - 0.5, 0.07)
t_pip_back = L["l11"]["end"] + 0.6; t_pip_perch = t_pip_back + 1.0
S.sfx_add(T.sfx("wings"), t_pip_back + 0.2, 0.18); S.sfx_add(T.foley("click", 2), t_pip_perch, 0.12)
S.sfx_add(T.chirp(1), t_pip_perch + 0.45, 0.25); S.sfx_add(T.chirp(3), t_pip_perch + 0.8, 0.22)

S.voice({k: v["start"] for k, v in L.items()}, "assets/voice/{}.mp3")
os.makedirs("proj/assets", exist_ok=True)
S.render("proj/assets/mix.wav", music_gain=0.3, duck=0.6, fade_in=0.3, fade_out=0.6, lufs=-16)
