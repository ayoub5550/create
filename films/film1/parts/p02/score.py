"""P02 score + Foley (common/toon.py on the repo mixer tools/audio/sound.py). Run from this folder after dialogue.py.
Beats use the same formulas as film.js. Comedy in sound: a light "happy" bed under the hose (a trickle, foot taps, a hiss
and a JET when he squeezes), a slide-whistle wind-up and a big whoosh on "maximum", then the SPLASH lands and the music is
gone: drips, dead air, Pip's wings as it shakes dry, "Wow. Very motivating." in near silence. A soft "happy" bed returns
under the stool business (clack, whoosh, wooden landing, a wet squelch on the sit) and dies on "winter." (dun sting on
"Winter?!"); needle clicks tick on her rhythm under everything once she knits, louder in his stare (eye twitch). A
pizzicato "scheme" for Plan C, cloth + pop + twinkle for the cap, a coach-whistle TWEET, then the "inspire" swell builds
under the pep talk and a RECORD SCRATCH kills it on "tree!": crickets, a chirp. A stomp on "naps!", and the part ends on
the whistle blast at the mound. Mastered to -16 LUFS (assembly goes to -14)."""
import json, os, sys
import numpy as np
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path[:0] = [os.path.join(HERE, "..", "..", "..", "..", "tools", "audio"), os.path.join(HERE, "..", "..", "common")]
from sound import Score, thud
import toon as T

os.chdir(HERE)
TL = json.load(open("timeline.json", encoding="utf-8"))
L = {l["id"]: l for l in TL["lines"]}; DUR = TL["total"]
def w(i, k): ws = L[i]["words"]; return ws[k if k >= 0 else len(ws) + k]

# ---- beats (same formulas as film.js)
t_jet = L["l1"]["start"] - 1.8; t_full = L["l1"]["start"] - 1.0; t_toss = L["l1"]["start"] - 0.75
t_lift = L["l1"]["start"] - 0.1
t_wind0 = w("l1", 3)["t0"] - 0.1; t_heave = w("l1", 4)["t0"]; t_rel = t_heave + 0.2
t_splash = t_rel + 0.55; t_pip_shake = L["l2"]["start"] - 1.25
t_bag = L["l4"]["start"] + 0.05; t_out = w("l4", 1)["t0"] - 0.1; t_unf = w("l4", 1)["t0"] + 0.1
t_throw = w("l4", 2)["t0"] - 0.2; t_land = t_throw + 0.45
t_sit0 = w("l4", 3)["t0"] + 0.05; t_sit1 = w("l4", 3)["t1"] - 0.1
t_bag_down = t_sit1 + 0.15; t_knit = w("l4", 4)["t0"] + 0.25; RATE = 2.0
t_stare = L["l10"]["end"] + 0.2; t_twitch = t_stare + 0.55
t_reach = w("l11", 3)["t0"] - 0.1; t_cap_up = w("l11", 5)["t0"]; t_cap_on = w("l11", -1)["t0"]
t_tweet = L["l11"]["end"] + 0.2; t_kneel0 = t_tweet + 0.55; t_kneel1 = t_kneel0 + 0.45
t_strong = w("l12", 5)["t0"]; t_tree = w("l13", -1)["t0"]; t_scr = L["l13"]["end"]
t_pip_tilt = L["l14"]["start"] - 1.0
t_stomp = w("l15", 1)["t0"]; t_blow = L["l15"]["end"] + 0.12

S = Score(DUR)
# ---- ambience: the yard, the whole part (Foley bus, never ducked: keep it low)
S.sfx_add(T.sfx("yard_amb", d=DUR), 0.0, 0.06)

# ---- music I: light "happy" under the hose, dies as the splash lands
S.music_add(T.cue("happy", t_splash + 0.4, busy=0.6), 0.0, 0.55)
S.music_add(T.sfx("slide_up"), t_wind0, 0.25)                                 # the wind-up
S.music_gap(t_splash - 0.04, L["l3"]["start"] + 0.2, 0.05)                    # dead air: drips, "Wow."

# hose: trickle (sparse drips + thin hiss) -> squeeze -> JET (hiss + gush) -> full (bloop) -> tossed
S.sfx_add(T.sfx("drips", d=t_jet - 0.2, rate=9.0, seed=4), 0.2, 0.16)
hiss = T.bp(np.random.default_rng(5).standard_normal(int(T.SR * (t_toss - 0.2))), 700, 2400)
env = np.ones(len(hiss)); n_jet = int(T.SR * (t_jet - 0.2)); env[:n_jet] = 0.18; env[n_jet:] = 1.0
S.sfx_add(T.fade(T.norm(hiss * env), 0.2, 0.08), 0.2, 0.10)
t = 0.35 + 0.5 / 2.4                                                          # the toe taps (same rhythm as film.js)
while t < t_jet - 0.95:
    S.sfx_add(T.foley("footstep_grass", int(t * 10) % 5), t, 0.22); t += 1 / 2.4
S.sfx_add(T.sfx("rustle"), t_jet - 0.9, 0.18)                                 # he shakes the hose
S.sfx_add(T.sfx("steam"), t_jet - 0.03, 0.25); S.sfx_add(T.sfx("small_splash"), t_jet + 0.05, 0.18)
S.sfx_add(T.sfx("bloop"), t_full, 0.3)
S.sfx_add(T.sfx("whoosh"), t_toss, 0.25)
S.sfx_add(T.foley("impactSoft_medium", 1), t_toss + 0.5, 0.25); S.sfx_add(T.sfx("small_splash"), t_toss + 0.52, 0.12)
S.sfx_add(T.foley("creak", 1), t_lift, 0.18); S.sfx_add(T.foley("cloth", 2), t_toss + 0.2, 0.12)   # the heavy lift
S.sfx_add(T.sfx("small_splash"), t_lift + 0.6, 0.08)                          # slosh
S.sfx_add(T.sfx("whoosh_big"), t_heave, 0.35)
S.sfx_add(T.sfx("splash"), t_splash - 0.02, 0.75)
S.sfx_add(T.sfx("drips", d=5.5, rate=3.0), t_splash + 0.4, 0.2)
S.sfx_add(T.sfx("wings"), t_pip_shake, 0.25); S.sfx_add(T.sfx("rustle", seed=21), t_pip_shake + 0.05, 0.12)
S.sfx_add(T.chirp(2), t_pip_shake + 0.85, 0.28)
S.sfx_add(T.sfx("drips", d=2.5, rate=1.6, seed=12), L["l3"]["start"], 0.14)  # the bucket's last drips

# ---- music II: a soft bed under the stool and the scarf talk, dies on "winter."
t_m2 = L["l3"]["start"] + 0.3; t_m2e = w("l8", -1)["t0"]
S.music_add(T.cue("happy", t_m2e - t_m2, busy=0.4), t_m2, 0.38)
S.music_gap(t_m2e, t_reach - 0.4, 0.08)
S.sfx_add(T.foley("cloth", 1), t_bag, 0.18); S.sfx_add(T.sfx("rustle", seed=22), t_out - 0.05, 0.12)
S.sfx_add(T.foley("impactWood_light", 2), t_unf + 0.2, 0.35)                 # clack: the stool opens
S.sfx_add(T.sfx("whoosh"), t_throw, 0.2)
S.sfx_add(T.foley("impactWood_medium", 1), t_land, 0.35)
S.sfx_add(T.sfx("small_splash"), t_sit1 - 0.02, 0.3); S.sfx_add(T.foley("impactSoft_medium", 0), t_sit1, 0.18)   # squelch
S.sfx_add(T.foley("cloth", 3), t_bag_down, 0.15)
S.sfx_add(T.sfx("sting_dun"), L["l9"]["start"] - 0.05, 0.3)
# needle clicks on her rhythm (low under the lines, louder in his stare)
k = 0
while t_knit + k / RATE < DUR - 0.2:
    tc = t_knit + k / RATE
    g = 0.42 if t_stare - 0.2 < tc < L["l11"]["start"] else 0.18
    S.sfx_add(T.knitting(0.12, rate=10, seed=27 + k % 5), tc - 0.05, g); k += 1
S.sfx_add(T.sfx("eye_twitch"), t_twitch, 0.2)

# ---- music III: Plan C (scheme) -> the coach gear
S.music_add(T.cue("scheme", t_kneel0 - L["l11"]["start"] + 0.4), L["l11"]["start"] - 0.1, 0.5)
S.sfx_add(T.foley("cloth", 0), t_reach, 0.2)
S.sfx_add(T.sfx("whoosh"), t_cap_up - 0.1, 0.15)
S.sfx_add(T.foley("cloth", 2), t_cap_on - 0.02, 0.3); S.sfx_add(T.sfx("pop"), t_cap_on, 0.25); S.sfx_add(T.sfx("twinkle"), t_cap_on + 0.05, 0.18)
S.sfx_add(T.sfx("coach_whistle", d=0.5), t_tweet - 0.05, 0.5)
S.sfx_add(T.foley("impactSoft_medium", 2), t_kneel1 - 0.05, 0.15); S.sfx_add(T.foley("cloth", 1), t_kneel0, 0.15)

# ---- music IV: the inspirational swell, killed by the record scratch on "tree!"
t_m4 = L["l12"]["start"] - 0.3
S.music_add(T.cue("inspire", t_scr - t_m4 + 0.6), t_m4, 0.75)
S.music_gap(t_scr - 0.02, DUR, 0.03)
S.sfx_add(T.sfx("whoosh"), t_strong - 0.1, 0.1)
S.sfx_add(T.sfx("record_scratch"), t_scr - 0.06, 0.6)
S.sfx_add(T.sfx("crickets"), t_scr + 0.35, 0.12)
S.sfx_add(T.chirp(5), t_pip_tilt + 0.45, 0.28)
S.sfx_add(thud(80, 0.25), t_stomp - 0.1, 0.35)                                # the stomp on "naps!"
S.sfx_add(T.sfx("coach_whistle", d=0.8), t_blow, 0.6)                        # the blast at the mound
S.sfx_add(T.sfx("rustle", seed=23), t_blow + 0.05, 0.2); S.sfx_add(T.sfx("whoosh"), t_blow, 0.15)

S.voice({k: v["start"] for k, v in L.items()}, "assets/voice/{}.mp3")
os.makedirs("proj/assets", exist_ok=True)
S.render("proj/assets/mix.wav", music_gain=0.3, duck=0.6, fade_in=0.3, fade_out=0.6, lufs=-16)
