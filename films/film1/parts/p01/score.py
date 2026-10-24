"""P01 score + Foley (common/toon.py on the repo mixer tools/audio/sound.py). Run from this folder after dialogue.py.
Beats use the same formulas as film.js. Comedy in sound: the cold open is ambience only (the first "Grow" lands in a quiet
yard); a light "happy" bed enters with Layla; xylophone steps climb with the rule of three; the music STOPS before "Years."
(dead air, then crickets, an eye twitch, Pip's chirp); a low pizzicato "scheme" creeps in under "Okay. Plan B." and the
whoosh SMASHES into the title sting; scribble on the draw-on, a pop on "Grow Faster!", Pip's wings and chirps over the card,
a pop + twinkle when the sprout appears, a short happy tag to the cut. Mastered to -16 LUFS (assembly goes to -14)."""
import json, os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path[:0] = [os.path.join(HERE, "..", "..", "..", "..", "tools", "audio"), os.path.join(HERE, "..", "..", "common")]
from sound import Score, scribble, thud
import toon as T

os.chdir(HERE)
TL = json.load(open("timeline.json", encoding="utf-8"))
L = {l["id"]: l for l in TL["lines"]}; DUR = TL["total"]
def w(i, k): ws = L[i]["words"]; return ws[k if k >= 0 else len(ws) + k]

# ---- beats (same formulas as film.js)
t_arrive = L["l2"]["end"] - 1.0
t_up = w("l7", 0)["t0"] - 0.2
W9 = L["l9"]["words"]; t_q = [W9[2]["t0"], W9[4]["t0"], W9[6]["t0"]]
t_years = L["l10"]["words"][0]["t0"]; t_shock = L["l10"]["end"] + 0.08
t_twitch = t_shock + 0.75; t_pip = L["l11"]["start"] - 1.4
t_narrow = L["l11"]["end"] + 0.35
t_title = L["l12"]["end"] + 0.3
t_pop2 = t_title + 0.68; t_pip_in = t_title + 1.7; t_pip_land = t_title + 2.9; t_sprout = t_title + 3.5
t_stop = t_q[2] + 0.75                        # the music dies right after "Two hours?"

S = Score(DUR)
# ---- ambience: the yard (Foley bus, so it is not ducked by the voices — keep it low)
S.sfx_add(T.sfx("yard_amb", d=t_shock + 0.5), 0.0, 0.10)
S.sfx_add(T.sfx("yard_amb", d=DUR - t_narrow, seed=7), t_narrow, 0.08)
# OPEN: Pip flies in and lands on the birdhouse, two chirps
S.sfx_add(T.sfx("wings"), 1.2, 0.18); S.sfx_add(T.sfx("wings"), 2.0, 0.12)
S.sfx_add(T.chirp(1), 2.5 + 0.4, 0.22); S.sfx_add(T.chirp(3), 2.5 + 0.9, 0.2)

# ---- music I: light "happy" bed from the reveal to the beat before "Years."
t_bed = L["l1"]["end"] + 0.25
S.music_add(T.cue("happy", t_stop - t_bed, busy=0.6), t_bed, 0.75)
for i, (t, m) in enumerate(zip(t_q, (72, 76, 79))):                          # rule of three: the xylophone climbs
    S.music_add(T.xylo(m, 0.6), t - 0.02, 0.5); S.music_add(T.xylo(m + 12, 0.5), t + 0.08, 0.25)
S.music_gap(t_stop, t_narrow - 0.4, 0.15)                                     # dead air: "Years." lands in silence

# ---- music II: the scheme creeps in under "Okay. Plan B." -> SMASH to the title sting
S.music_add(T.cue("scheme", t_title - t_narrow + 0.2), t_narrow - 0.2, 0.55)
S.music_gap(t_title - 0.05, t_title + 0.02, 0.04)                             # a clean cut into the sting
S.music_add(T.cue("theme"), t_title, 1.0)
t_tag = t_sprout + 0.4
S.music_add(T.cue("happy", DUR - t_tag - 0.6), t_tag, 0.6)

# ---- Foley / gags (Foley bus: never ducked)
for k, wd in enumerate(L["l1"]["words"]):                                     # each "grow" pushes in: tiny whooshes
    S.sfx_add(T.sfx("whoosh"), wd["t0"] - 0.1, 0.04 + 0.02 * k)
t = t_bed
while t < t_arrive:                                                           # Layla's footsteps on the grass
    S.sfx_add(T.foley("footstep_grass", int(t * 10) % 5), t, 0.18); t += 0.52
S.sfx_add(T.foley("cloth", 1), t_arrive - 0.1, 0.12)
S.sfx_add(T.sfx("bloop"), t_up + 0.05, 0.35); S.sfx_add(T.sfx("whoosh"), t_up, 0.12)     # springs up out of the crouch
S.sfx_add(T.boing(0.5, 330), t_q[2] - 0.02, 0.18)                            # the hop on "Two hours?"
S.sfx_add(thud(70, 0.3), t_years + 0.12, 0.3)                                 # "Years." hits him
S.sfx_add(T.sfx("crickets"), t_shock + 0.1, 0.07)
S.sfx_add(T.sfx("eye_twitch"), t_twitch, 0.18)
S.sfx_add(T.chirp(2), t_pip + 0.3, 0.3)                                       # the cutaway chirp
S.sfx_add(T.sfx("gulp"), L["l11"]["start"] - 0.35, 0.15)
S.sfx_add(T.sfx("whoosh_big"), t_title - 0.3, 0.35)                           # SMASH
S.sfx_add(scribble(0.9, 3), t_title + 0.1, 0.25)                              # the title draws on
S.sfx_add(T.sfx("pop"), t_pop2, 0.35); S.sfx_add(T.sfx("pop", f0=500, f1=1700), t_pop2 + 0.25, 0.25)
S.sfx_add(T.sfx("wings"), t_pip_in + 0.2, 0.2); S.sfx_add(T.sfx("wings"), t_pip_in + 0.9, 0.16)
S.sfx_add(T.foley("click", 2), t_pip_land, 0.12)
S.sfx_add(T.chirp(0), t_pip_land + 0.35, 0.25); S.sfx_add(T.chirp(4), t_pip_land + 0.75, 0.22)
S.sfx_add(T.sfx("pop", f0=380, f1=1500), t_sprout, 0.35); S.sfx_add(T.sfx("twinkle"), t_sprout + 0.05, 0.2)

S.voice({k: v["start"] for k, v in L.items()}, "assets/voice/{}.mp3")
os.makedirs("proj/assets", exist_ok=True)
S.render("proj/assets/mix.wav", music_gain=0.3, duck=0.6, fade_in=0.3, fade_out=0.6, lufs=-16)
