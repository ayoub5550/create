"""P09 score + Foley (common/toon.py on the repo mixer tools/audio/sound.py). Run from this folder after dialogue.py.
Beats use the same formulas as film.js. Comedy in sound: the morning opens on birdsong and Sam's snores (no music); a light
"happy" bed walks in with Layla; a glass clink on the hand-off; a climbing xylophone as he looks up... and up; a stomp thud
and a coffee splash on "NOW!"; a sly "sneaky" pizzicato under "Look! A bird!", cut dead on "Where?!"; behind his back the
tree rumbles, creaks and BOOMS (magic swell, leaves burst, Pip's wings), an orchestra hit as the apples pop out, then a
lone snap and the BONK (mug clatters); tweety dizzy birds, apples thud into the grass, BONK #2; the theme bursts in on
"It grew!" with three boings; crunch + chewing; the music STOPS before "Years." (dead air, a thud, an eye twitch); the faint
whooshes down to a heavy body THUD, crickets, Pip's wings and two chirps. Mastered to -16 LUFS (assembly goes to -14)."""
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
SR = T.SR

# ---- beats (same formulas as film.js)
t_walk0 = 1.7; t_arrive = L["l1"]["end"] - 0.1
t_jolt = L["l2"]["start"] - 0.3
t_offer = w("l3", 2)["t0"] - 0.15; t_give = L["l3"]["end"] + 0.2
t_notice = L["l4"]["start"] - 0.3
t_sip = L["l5"]["start"] + 0.15
t_now = w("l6", -1)["t0"]
t_point = w("l7", 2)["t0"] - 0.15
t_turn = L["l8"]["start"] - 0.15
t_rum0 = L["l8"]["end"] - 0.3; t_grow0 = t_rum0 + 0.6; t_grow1 = t_grow0 + 1.2
t_drop = t_grow1 + 0.7; t_bonk = t_drop + 0.3
t_r1 = t_bonk + 0.6; t_r2 = t_bonk + 1.0; t_bonk2 = t_bonk + 1.45; t_r4 = t_bonk + 1.9
t_shake = L["l9"]["end"] + 0.2; t_realize = L["l10"]["start"] - 0.55
t_jump = L["l10"]["start"] - 0.1
t_bite = L["l12"]["start"] - 0.75; t_crunch = t_bite + 0.3
t_wide = w("l12", -1)["t0"] - 0.2
t_shock = L["l14"]["end"] + 0.15
t_ws = L["l14"]["end"] + 1.65; t_faint = t_ws + 0.25; t_land = t_faint + 0.5
t_pip_in = t_land + 0.6; t_pip_land = t_pip_in + 0.9
SNORE, SN0 = 2.4, 0.2
t_stop = L["l13"]["end"] + 0.15                 # the music dies after "...How long?"

def cut(x, d, r=0.08):
    n = int(d * SR); x = x[:n].copy(); m = min(len(x), int(r * SR)); x[len(x) - m:] *= np.linspace(1, 0, m); return x

S = Score(DUR)
# ---- ambience: morning yard + birdsong (Foley bus, low)
S.sfx_add(T.sfx("yard_amb", d=DUR), 0.0, 0.07)
S.sfx_add(T.sfx("birdsong", d=8.0), 0.0, 0.14)
S.sfx_add(T.sfx("birdsong", d=DUR - 8.0, density=0.6, seed=8), 8.0, 0.05)
# OPEN: snores (leaf flutters on each inhale), Pip's chirps on the rock
t = SN0
while t < t_jolt - 0.4:
    S.sfx_add(cut(T.sfx("snore", d=SNORE), t_jolt - t), t, 0.26); t += SNORE
for c in (1.0, 2.4, t_point + 0.5, L["l8"]["start"] + 0.2):
    S.sfx_add(T.chirp(int(c * 10) % 5), c, 0.2)

# ---- music I: a light "happy" bed walks in with Layla, until her sly ploy
t_bed = t_walk0 + 0.3; t_sly = L["l7"]["start"] - 0.3
S.music_add(T.cue("happy", t_sly - t_bed, busy=0.5), t_bed, 0.5)
for k, m in enumerate((72, 76, 79, 84)):                                     # looking up... and up: the xylophone climbs
    S.music_add(T.xylo(m, 0.5), t_notice + 0.1 + k * 0.12, 0.35)
for k, m in enumerate((79, 84, 88, 91)):
    S.music_add(T.xylo(m, 0.5), w("l4", 1)["t0"] - 0.15 + k * 0.12, 0.3)
# ---- music II: sneaky pizz under "Look! A bird!", cut dead on "Where?!"
S.music_add(T.cue("sneaky", t_turn - t_sly + 0.3), t_sly, 0.55)
S.music_gap(t_turn + 0.12, t_grow0 - 0.05, 0.08)
# ---- music III: the BOOM (magic swell) ... dazed silence ... the THEME bursts in on "It grew!"
S.music_add(T.cue("magic", t_grow1 - t_grow0 + 0.3), t_grow0 - 0.05, 0.8)
S.music_add(T.cue("theme"), L["l10"]["start"] - 0.05, 0.95)
t_happy = L["l10"]["start"] + 2.3
S.music_add(T.cue("happy", t_stop - t_happy + 0.4, busy=0.8), t_happy, 0.6)
S.music_gap(t_stop, DUR, 0.15)                                               # "Years." lands in dead air

# ---- Foley / gags (Foley bus: never ducked)
t = t_walk0
while t < t_arrive:                                                          # Layla's footsteps on the grass + scarf drag
    S.sfx_add(T.foley("footstep_grass", int(t * 10) % 5), t, 0.16); t += 0.52
S.sfx_add(T.sfx("rustle"), t_walk0 + 1.2, 0.06); S.sfx_add(T.sfx("rustle"), t_walk0 + 2.4, 0.05)
S.sfx_add(T.sfx("eye_twitch"), t_jolt - 0.32, 0.15); S.sfx_add(T.sfx("boing"), t_jolt, 0.38); S.sfx_add(T.sfx("whoosh"), t_jolt - 0.05, 0.2)    # springs up stiff as a board
S.sfx_add(T.foley("cloth", 2), t_jolt + 0.05, 0.25)
S.sfx_add(T.sfx("whoosh"), t_jolt + 0.2, 0.05)                                # the leaf flies off
S.sfx_add(T.foley("cloth", 1), t_offer, 0.1)
S.sfx_add(T.foley("glass", 1), t_give, 0.4)                                   # clink
S.sfx_add(T.sfx("gulp"), t_sip + 0.35, 0.22)                                  # slurp
S.sfx_add(T.foley("impactSoft_heavy", 0), t_now, 0.45); S.sfx_add(T.sfx("bass_thump"), t_now, 0.3)   # STOMP
S.sfx_add(T.sfx("small_splash"), t_now + 0.05, 0.15)                          # coffee slops
S.sfx_add(T.sfx("whoosh"), t_point - 0.05, 0.08)                              # she points
S.sfx_add(T.sfx("whoosh"), t_turn - 0.05, 0.22); S.sfx_add(T.boing(0.35, 360), t_turn + 0.05, 0.14)   # spins round
S.sfx_add(T.sfx("rumble", d=1.0), t_rum0, 0.45); S.sfx_add(T.sfx("tree_creak"), t_rum0 + 0.15, 0.3)
S.sfx_add(T.sfx("boom"), t_grow0, 0.55); S.sfx_add(T.sfx("rustle"), t_grow0 + 0.05, 0.35)
S.sfx_add(T.sfx("wings"), t_grow0 + 0.2, 0.22); S.sfx_add(T.sfx("wings"), t_grow0 + 0.7, 0.14)   # Pip flees
S.sfx_add(T.sfx("orch_hit"), t_grow1, 0.45)
for k in range(7):                                                            # the apples pop out
    S.sfx_add(T.sfx("pop", f0=300 + 60 * k, f1=1200 + 120 * k), t_grow1 - 0.05 + k * 0.6 / 7 + 0.05, 0.16)
S.sfx_add(T.sfx("pop", f0=900, f1=500), t_drop, 0.18)                        # snap
S.sfx_add(T.sfx("bonk"), t_bonk, 0.55)
S.sfx_add(T.foley("impactWood_light", 1), t_bonk + 0.3, 0.25); S.sfx_add(T.foley("glass", 3), t_bonk + 0.32, 0.18)   # mug drops
S.sfx_add(T.sfx("small_splash"), t_bonk + 0.4, 0.14)                          # ...tips over, spills
S.sfx_add(T.sfx("dizzy", d=4.0), t_bonk + 0.2, 0.22)
S.sfx_add(T.sfx("dizzy", d=2.4), t_bonk + 4.2, 0.14)
for tr in (t_r1, t_r2, t_r4):
    S.sfx_add(T.foley("impactSoft_medium", int(tr * 10) % 3), tr + 0.35, 0.28)
S.sfx_add(T.sfx("bonk"), t_bonk2, 0.55); S.sfx_add(T.foley("impactSoft_medium", 1), t_bonk2 + 0.5, 0.2)
S.sfx_add(T.sfx("whoosh"), t_shake, 0.12); S.sfx_add(T.sfx("whoosh"), t_shake + 0.22, 0.1)    # brrr
S.sfx_add(T.sfx("twinkle"), t_realize, 0.2)
for k in range(3):                                                            # hops for joy
    S.sfx_add(T.boing(0.4, 300 + 40 * k), t_jump + k * 0.38, 0.18)
S.sfx_add(T.sfx("crunch"), t_crunch, 0.5)
t = t_crunch + 0.25
while t < L["l12"]["start"] - 0.1:                                            # chewing
    S.sfx_add(T.sfx("crunch", d=0.2, seed=int(t * 10)), t, 0.12); t += 0.24
S.sfx_add(T.sfx("whoosh"), t_wide, 0.12)
S.sfx_add(thud(70, 0.3), w("l14", 0)["t0"] + 0.12, 0.3)                       # "Years." hits him
S.sfx_add(T.sfx("eye_twitch"), t_shock + 0.45, 0.18)
S.sfx_add(T.sfx("whoosh_big"), t_faint, 0.22)                                 # faints stiff as a board
S.sfx_add(T.foley("impactSoft_heavy", 1), t_land, 0.55); S.sfx_add(thud(55, 0.35), t_land, 0.35)
S.sfx_add(T.sfx("crickets"), t_land + 0.4, 0.08)
S.sfx_add(T.sfx("wings"), t_pip_in + 0.1, 0.16); S.sfx_add(T.sfx("wings"), t_pip_in + 0.6, 0.12)
S.sfx_add(T.foley("click", 2), t_pip_land, 0.1)
S.sfx_add(T.chirp(0), t_pip_land + 0.35, 0.26); S.sfx_add(T.chirp(4), t_pip_land + 0.75, 0.24)

S.voice({k: v["start"] for k, v in L.items()}, "assets/voice/{}.mp3")
os.makedirs("proj/assets", exist_ok=True)
S.render("proj/assets/mix.wav", music_gain=0.3, duck=0.6, fade_in=0.3, fade_out=0.6, lufs=-16)
