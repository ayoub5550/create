"""Score + Foley for «حوار» (tools/audio/sound.py). Run from this folder after tools/voice/dialogue.py:  python score.py
Comedy timing in sound: a light Ajam bed under the talk; the music STOPS for the beat before the punchline ("سنوات." lands
in silence, only a faint cricket — the 4.3 kHz chirps are that cricket); a gasp + low thud on Sami's take; the bed comes
back sadder (Nahawand) while he decides to wait; a thump when he plops onto the rock, a slap when Layla facepalms; a pop +
bells when the sprout appears, a rising oud arpeggio under the iris, and a sting exactly when the iris closes.
Mastered to -15 LUFS integrated (stereo) with a peak limiter (render(lufs=...))."""
import json, os, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "tools", "audio"))
from sound import *

TL = json.load(open("timeline.json", encoding="utf-8"))
L = {l["id"]: l for l in TL["lines"]}; DUR = TL["total"]
S = Score(DUR)
BPM = 96; B = 60 / BPM
t_stop = L["l3"]["end"] + 0.25                   # the comic beat: dead air after "ساعتين؟", "سنوات." lands in silence
t_back = L["l5"]["start"] - 0.4
# same beats (same formulas) as film.js
t_shock = L["l4"]["end"] + 0.05
t_sit = L["l5"]["end"] + 0.15; t_seated = t_sit + 1.7; t_face = t_seated - 0.35
t_two = t_seated + 1.35; t_nod = t_two + 0.3; t_sprout = t_two + 1.1
t_iris = t_sprout + 1.2; t_close = t_iris + 1.9

# I. light bed in D Ajam: soft pad + a plucked figure, until the beat
t = 0.2
while t < t_stop - 0.5:
    S.music_add(pad([50, 57, 62, 66], 4 * B + 0.6, 0.6, 0.8), t, 0.16)
    S.phrase(t, maqam_line("ajam", 62, [0, 2, 4, 2, 1, 2, 0, None], [.5, .5, .5, .5, .5, .5, 1, 1]), bpm=BPM, gain=.2, bright=.6)
    t += 4 * B
S.music_gap(t_stop, t_back, 0.25)                # no ringing note or reverb tail leaks into the beat
# II. after the punchline: Nahawand, sparse, a little sad and stubborn — quiet, so the Foley reads over it
S.music_add(drone(38, t_sprout + 0.6 - t_back, 1.2, 0.8), t_back, 0.07)
for k, (dt, m) in enumerate([(0.0, 62), (1.3, 65), (2.6, 69), (3.9, 67), (5.2, 65)]):
    if t_back + dt < t_sprout - 0.5: S.music_add(oud(m, 2.2, .4, .997), t_back + dt, .22)
# III. the sprout: pop, bells, and a rising Ajam arpeggio under the iris
S.sfx_add(pop(.22, 380, 1500), t_sprout, .3)
for i, m in enumerate([74, 78, 81, 86]): S.sfx_add(bell(hz(m), 1.1), t_sprout + 0.12 + i * .07, .06)
for i, m in enumerate([62, 66, 69, 74, 78, 81]): S.music_add(oud(m, 2.4, .7, .998), t_sprout + 0.5 + i * .11, .26)
S.music_add(pad([50, 57, 62, 66, 69], 2.2, 0.3, 1.2), t_sprout + 0.45, 0.18)
# IV. the button: a bright pluck + bell over a soft low D exactly when the iris closes (Foley bus: never ducked or faded)
S.sfx_add(oud(74, 2.4, .85, .998), t_close, .3)
S.sfx_add(bell(hz(86), 2.2), t_close + 0.01, .07)
S.sfx_add(oud(50, 2.8, .35, .998), t_close, .32)

# Foley (times from the same beats as film.js)
S.sfx_add(crickets(1.3), L["l3"]["end"] + 0.2, .04)                # the awkward silence gag: a faint cricket in the beat
S.sfx_add(thud(70, .3), t_shock + 0.07, .24)                       # the reaction hit: his startle (CU on Sami)
S.sfx_add(whoosh(.18, 900, 2600), t_shock + 0.04, .05)              # the gasp
S.sfx_add(whoosh(.3, 300, 1500), t_sit + 0.2, .05)                  # he drops...
S.sfx_add(thud(105, .22), t_sit + 0.62, .26)                        # ...onto the rock (the sit clip lands ~0.6 s in)
S.sfx_add(slap(), t_face + 0.35, .3)                                # her palm meets her forehead
S.sfx_add(thud(150, .1), t_nod + 0.2, .06)                          # the firm nod

S.voice({k: v["start"] for k, v in L.items()}, "assets/voice/{}.mp3")
os.makedirs("proj/assets", exist_ok=True)
S.render("proj/assets/mix.wav", music_gain=.3, fade_out=0.8, lufs=-15)
