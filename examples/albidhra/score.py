"""Score + Foley for «البذرة» (tools/audio/sound.py). Run from this folder:  python score.py
Story arc in maqamat: dry land = Hijaz (journey, thirst) -> night & cold = Nahawand -> morning = Ajam -> tree = rising Ajam."""
import json, os, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "tools", "audio"))
from sound import *

S = Score(60.0)
VO_START = json.load(open("starts.json"))   # one place for the VO start times (score, captions): s4 is split at 2.54 s
BPM = 72; B = 60 / BPM

# I. dry land — D Hijaz (D Eb F# G A Bb C)
S.music_add(drone(38, 26.5), 0.4, 0.22); S.music_add(drone(45, 25.0), 1.5, 0.08)
H1 = [(62, 1), (63, .5), (66, .5), (67, 1.5), (None, .5), (69, .5), (67, .5), (66, .5), (63, .5), (62, 2)]
H2 = [(69, 1), (70, .5), (69, .5), (67, 1), (66, .5), (63, .5), (66, 1), (62, 2)]
H3 = [(57, .5), (62, .5), (63, .5), (66, .5), (67, 1), (66, .5), (63, .5), (62, 2)]
t = S.phrase(0.8, H1, BPM, .42); t = S.phrase(t + 1.0, H2, BPM, .4); t = S.phrase(t + 0.8, H3, BPM, .38)
t = S.phrase(t + 0.6, H1, BPM, .4); S.phrase(t + 0.6, H2, BPM, .36)
# II. night & cold — D Nahawand, sparse
S.music_add(drone(38, 12.0, 2.0, 3.0), 26.0, 0.25)
for tt, m in [(26.4, 65), (28.0, 62), (29.6, 69), (31.0, 65)]: S.music_add(oud(m, 2.6, .35, .997), tt, .32)
for tt, m in [(28.8, 86), (30.4, 81)]: S.music_add(bell(hz(m), 2.5), tt, .05)
# III. morning — D Ajam (major), brighter, quicker
S.music_add(pad([50, 57, 62, 66], 7.5), 37.8, 0.18)
A1 = [(62, .5), (66, .5), (69, .5), (74, .5), (73, .5), (69, .5), (66, .5), (69, .5)]
t = S.phrase(38.2, A1, BPM, .34, .7); S.phrase(t, [(67, .5), (71, .5), (74, .5), (79, 1), (78, .5), (76, .5), (74, 1)], BPM, .34, .7)
# IV. the tree grows — rising arpeggios over a pad, then resolve
prog = [([50, 57, 62, 66], [62, 66, 69, 74]), ([43, 55, 59, 62], [67, 71, 74, 79]), ([45, 57, 61, 64], [69, 73, 76, 81]), ([50, 57, 62, 66], [74, 78, 81, 86])]
t = 45.2
while t <= 54.2:
    for chord, arp in prog:
        S.music_add(pad(chord, 4 * B * 0.5 + 0.8), t, 0.2); S.music_add(oud(chord[0] - 12 if chord[0] > 40 else chord[0], 1.8, .4), t, .4)
        for i, m in enumerate(arp + arp[::-1][1:3] + [arp[1]]): S.music_add(oud(m, 1.3, .75), t + i * B / 4, .26)
        t += 2 * B
        if t > 54.2: break
S.music_add(pad([38, 50, 57, 62, 66, 69], 5.5, .4, 3.0), 54.6, 0.32)
for i, m in enumerate([62, 66, 69, 74, 78]): S.music_add(oud(m, 3.0, .6, .998), 54.7 + i * .12, .3)

# ---- Foley / SFX (times come from film.js beats) ----
S.sfx_add(scribble(1.9, 1), 1.3, .2); S.sfx_add(scribble(0.9, 2), 3.0, .16); S.sfx_add(scribble(0.5, 3), 3.6, .14)
for i in range(11): S.sfx_add(scribble(.2, 10 + i), 3.1 + i * .06, .05)              # cracks
for k in range(11): S.sfx_add(thud(), 4.5 + k * 0.583, .18 if k > 1 else .08)       # tired footsteps
for k in range(3): S.sfx_add(thud(), 20.95 + k * 0.583, .14)
S.sfx_add(glint(93), 10.75, .06)                                                     # the seed glints
for tt in (16.05, 16.75, 17.4): S.sfx_add(dig(), tt, .22); S.sfx_add(thud(80), tt, .18)
S.sfx_add(thud(300, .08), 20.9, .1)                                                  # seed drops in
S.sfx_add(crickets(4.6), 27.6, .035); S.sfx_add(wind(6), 27.8, .12)
S.sfx_add(thunder(), 32.6, .45); S.sfx_add(rain(5.2), 32.75, .32)
for k, tt0 in enumerate([38.6, 39.2, 40.9, 42.3, 43.1, 47.5, 51.8, 56.0]): S.sfx_add(bird(k), tt0, .05); S.sfx_add(bird(k), tt0 + .22, .04)
S.sfx_add(pop(), 39.9, .2)                                                           # sprout
for i, m in enumerate([74, 78, 81, 86, 90]): S.sfx_add(bell(hz(m), 1.2), 43.0 + i * .06, .07)   # joy
for tt in (41.95, 42.5, 51.3, 51.85): S.sfx_add(thud(), tt, .12)
for tt in (43.75, 44.45): S.sfx_add(thud(90), tt, .16)                               # hops
S.sfx_add(noise_band(int(SR * 4.2), 120, 700) * np.sin(np.pi * np.arange(int(SR * 4.2)) / SR / 4.2) ** 2, 45.9, .12)  # tree creak
for k in range(22): S.sfx_add(noise_band(int(SR * .06), 1500, 6000) * np.exp(-np.arange(int(SR * .06)) / SR / .012), 48.2 + k * 0.09, .06)  # leaves
for k, m in enumerate([86, 88, 91, 93, 95, 98, 100]): S.sfx_add(bell(hz(m), .9), 50.3 + k * .19, .05)  # fruits

S.voice(VO_START, "assets/voice/{}.mp3")
os.makedirs("proj/assets", exist_ok=True)
S.render("proj/assets/mix.wav")
