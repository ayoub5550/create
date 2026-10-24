"""P05 score + Foley (common/toon.py on the repo mixer tools/audio/sound.py). Run from this folder after dialogue.py.
Beats use the same formulas as film.js. Comedy in sound: a clock ticks under the "5 minutes later..." card; a western
staring contest (tension strings + heartbeat timpani, a wind gust for the tumbleweed, the eye twitch); a light "happy" bed
while Sam lectures; the sprout POPS (pop + twinkle + magic shimmer) behind his back; the PEEKABOO is scored with "sneaky"
pizzicato that STOPS dead on every whip-back (a music gap + a squeak of the innocent wiggle), each grow a whoosh + a rising
glock; the third time is caught (uh-oh); Pip's wings and chirps; the slow turn creaks; the music drops out for "It only
grows... when nobody's looking" under a tremolo swell and the dun-dun-DUN sting (ACT BREAK); crickets after Layla's dry
reply; a "scheme" pizzicato creeps in under "This calls for a plan" and a whoosh carries into P06. Mastered to -16 LUFS."""
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
T1 = L["l1"]["start"]
t_est, t_eye1, t_mound, t_eye2, t_twitch = T1 - 4.0, T1 - 2.95, T1 - 1.95, T1 - 0.95, T1 - 0.62
t_weed0 = t_mound + 0.05
t_rise = L["l1"]["end"] - 0.5; t_stood = t_rise + 0.5; WALK = 1.9; t_arr = t_stood + WALK
t_pop = w("l2", 7)["t0"]
t_whip1 = L["l3"]["end"] + 0.12
a1 = t_whip1 + 0.95; b1 = a1 + 0.65; a2 = b1 + 0.65; b2 = a2 + 0.6; a3 = b2 + 0.7; b3 = a3 + 0.45
t_settle = b3 + 1.1; t_crouch = b3 + 1.55; t_uncrouch = L["l5"]["end"] + 0.05
t_turnL = w("l6", 0)["t0"] - 0.3
t_leaf = w("l6", 1)["t0"]; t_pip0 = t_leaf - 0.7; t_pip1 = t_pip0 + 1.0
t_slow0 = L["l7"]["end"] + 0.1; t_flip = t_slow0 + 1.0
t_look = w("l8", -1)["t0"]
t_faceL = L["l10"]["start"] - 0.3
t_wide = L["l10"]["end"] + 0.8; t_whoosh = DUR - 0.45

S = Score(DUR)
# ---- ambience (Foley bus, low)
S.sfx_add(T.sfx("yard_amb", d=DUR), 0.0, 0.08)

# ---- OPEN: the card ticks, then a western staring contest
S.sfx_add(T.sfx("clock_tick", d=t_est - 0.1), 0.05, 0.22)
S.music_add(T.cue("tension", T1 + 0.6 - t_est), t_est, 0.6)
S.sfx_add(T.sfx("whoosh", d=1.0, lo=150, hi=900), t_weed0, 0.45); S.sfx_add(T.sfx("rustle", d=0.9), t_weed0 + 0.05, 0.3)   # a dry desert gust + the weed    # a dry gust
for k in range(3): S.sfx_add(T.foley("impactSoft_medium", k), t_weed0 + 0.2 + k * 0.3, 0.12)             # the tumbleweed bounces
S.sfx_add(T.sfx("eye_twitch"), t_twitch, 0.3)
S.music_gap(T1 + 0.3, t_rise - 0.1, 0.3)                                     # "a watched pot never boils" in the quiet yard
S.sfx_add(T.sfx("knitting", d=L["l1"]["end"] - T1 + 0.4), T1 - 0.2, 0.08)

# ---- he springs off the rock and marches over; a light bed while he lectures
S.sfx_add(T.sfx("whoosh"), t_rise, 0.14); S.sfx_add(T.foley("cloth", 2), t_rise + 0.05, 0.14)
t = t_stood + 0.15
while t < t_arr - 0.1:
    S.sfx_add(T.foley("footstep_grass", int(t * 10) % 5), t, 0.2); t += 0.47
S.music_add(T.cue("happy", t_whip1 - t_rise + 0.2, busy=0.6), t_rise, 0.45)
# the sprout POPS behind his back on "different" (and grooves)
S.sfx_add(T.sfx("pop", f0=380, f1=1500), t_pop - 0.02, 0.75); S.sfx_add(T.sfx("twinkle"), t_pop + 0.06, 0.32)
S.music_add(T.cue("magic", 1.6), t_pop, 0.4)
S.sfx_add(T.foley("drop", 1), t_pop + 0.02, 0.06)                            # a little dirt
S.sfx_add(T.sfx("gulp"), t_pop + 0.3, 0.06)                                  # Layla: "...oh"

# ---- the whip round: everything stops
S.music_gap(t_whip1 - 0.03, a1 - 0.1, 0.05)
S.sfx_add(T.sfx("whoosh", d=0.25, lo=600, hi=4000), t_whip1 - 0.08, 0.45)
S.sfx_add(T.sfx("squeak", d=0.35, f=1900, n_=2), t_whip1 + 0.1, 0.07)        # innocent wiggle

# ---- PEEKABOO x3: sneaky pizz that stops dead on each whip-back
for (ta, tb, m) in ((a1, b1, 76), (a2, b2, 79)):
    S.music_add(T.cue("sneaky", tb - ta + 0.1), ta, 0.45)
    S.sfx_add(T.sfx("whoosh"), ta - 0.04, 0.25)                              # turns away...
    S.sfx_add(T.sfx("slide_up"), ta + 0.1, 0.22)                             # the sprout spurts up
    S.sfx_add(T.reed(84, 0.22, vib=0.02, bright=0.15), ta + 0.12, 0.2); S.sfx_add(T.reed(88, 0.3, vib=0.03, bright=0.15), ta + 0.3, 0.2)   # ...whistling
    S.sfx_add(T.xylo(m, 0.4), ta + 0.12, 0.18); S.sfx_add(T.xylo(m + 5, 0.5), ta + 0.3, 0.16)
    S.sfx_add(T.glock(m + 12, 0.8), ta + 0.15, 0.22); S.sfx_add(T.glock(m + 16, 0.8), ta + 0.35, 0.2); S.sfx_add(T.glock(m + 19, 0.9), ta + 0.5, 0.2)
    S.sfx_add(T.sfx("whoosh", d=0.25, lo=600, hi=4000), tb - 0.08, 0.5)        # WHIP
    S.sfx_add(T.woodblock(84), tb + 0.02, 0.3)                                # snap-freeze
    S.music_gap(tb - 0.02, tb + 0.55, 0.03)
    S.sfx_add(T.sfx("squeak", d=0.3, f=2000, n_=2), tb + 0.08, 0.12)
# third time: a slow, smug turn... the fake... CAUGHT
S.sfx_add(T.sfx("tiptoe", steps=3, gap=0.13), a3, 0.18)
S.sfx_add(T.reed(86, 0.3, vib=0.03, bright=0.15), a3 + 0.1, 0.2)
S.sfx_add(T.glock(88, 0.6), a3 + 0.25, 0.14)
S.sfx_add(T.sfx("whoosh", d=0.2, lo=800, hi=5000), b3 - 0.06, 0.5)
S.sfx_add(T.sfx("record_scratch"), b3, 0.22)
S.sfx_add(T.sfx("uh_oh"), b3 + 0.25, 0.3)
S.sfx_add(T.foley("creak", 1), t_settle, 0.16)                               # sheepishly straightens
S.sfx_add(T.foley("cloth", 1), t_crouch, 0.12)                               # crouches to inspect
S.sfx_add(T.glock(96, 0.5), t_settle + 0.7, 0.25); S.sfx_add(T.sfx("bloop"), t_settle + 0.75, 0.15)   # plink: the sprout sweats   # the sprout sweats
S.sfx_add(T.sfx("crickets"), t_settle + 0.3, 0.05)

# ---- "Maybe it's shy." / "Trees aren't shy": a new leaf, Pip
S.sfx_add(T.sfx("knitting", d=L["l5"]["end"] - L["l5"]["start"] + 0.6), L["l5"]["start"] - 0.3, 0.08)
S.music_add(T.cue("happy", t_slow0 - t_uncrouch, busy=0.5), t_uncrouch, 0.35)
S.sfx_add(T.sfx("whoosh"), t_turnL, 0.1)
S.sfx_add(T.sfx("twinkle"), t_leaf + 0.3, 0.18)
S.sfx_add(T.glock(84, 0.8), t_leaf + 0.05, 0.16); S.sfx_add(T.glock(88, 0.8), t_leaf + 0.25, 0.16); S.sfx_add(T.glock(91, 1.0), t_leaf + 0.45, 0.16)
S.sfx_add(T.sfx("wings"), t_pip0 + 0.2, 0.18); S.sfx_add(T.sfx("wings"), t_pip0 + 0.7, 0.12)
S.sfx_add(T.foley("click", 2), t_pip1, 0.1)
S.sfx_add(T.chirp(1), t_pip1 + 0.45, 0.26); S.sfx_add(T.chirp(3), t_pip1 + 0.9, 0.24)

# ---- "Wait." ... the slooow creaking turn; sprout and Pip freeze
S.music_gap(L["l7"]["start"] - 0.25, L["l8"]["start"], 0.15)
S.sfx_add(T.sfx("tree_creak", d=1.0), t_slow0, 0.4)
t_dance = t_pip1 + 0.9; k = 0; t = t_dance                                  # sprout + Pip dance behind his back (stops dead on the turn)
while t < t_flip - 0.1:
    S.sfx_add(T.xylo((72, 76, 79, 76)[k % 4], 0.25), t, 0.14); t += 1 / 2.6; k += 1
S.sfx_add(T.sfx("whoosh", d=0.2, lo=800, hi=4500), t_flip - 0.05, 0.35); S.sfx_add(T.woodblock(84), t_flip, 0.3)
S.sfx_add(T.sfx("squeak", d=0.3, f=2200, n_=1), t_flip + 0.1, 0.08)
S.sfx_add(T.chirp(4), t_flip + 1.0, 0.2)                                     # Pip, whistling innocently

# ---- ACT BREAK: "It only grows... when nobody's looking." + dun-dun-DUN
S.music_add(T.cue("tension", t_look - L["l8"]["start"] + 0.4), L["l8"]["start"] - 0.1, 0.4)
S.sfx_add(T.sfx("sting_dun"), t_look - 0.35, 0.6)
S.sfx_add(T.sfx("crickets"), L["l9"]["start"] - 0.4, 0.06)

# ---- "This calls for a plan." the scheme creeps in; whoosh into P06
S.music_add(T.cue("scheme", DUR - L["l10"]["start"] + 0.3), L["l10"]["start"] - 0.3, 0.42)
S.sfx_add(T.sfx("whoosh", d=0.2, lo=600, hi=4000), t_faceL - 0.05, 0.3)
S.sfx_add(T.foley("cloth", 3), w("l10", 3)["t0"] - 0.3, 0.2); S.sfx_add(T.foley("click", 1), w("l10", 3)["t0"] + 0.05, 0.15)                 # steepled fingers
S.sfx_add(T.sfx("squeak", d=0.3, f=1900, n_=2), t_wide + 0.62, 0.3)          # the button: the sprout wiggles
S.sfx_add(T.sfx("rustle", d=0.6), t_wide + 0.6, 0.25)
for k in range(4): S.sfx_add(T.xylo((79, 76)[k % 2], 0.15), t_wide + 0.62 + k * 0.2, 0.2)
S.sfx_add(T.sfx("whoosh_big"), t_whoosh - 0.1, 0.3)

S.voice({k: v["start"] for k, v in L.items()}, "assets/voice/{}.mp3")
os.makedirs("proj/assets", exist_ok=True)
S.render("proj/assets/mix.wav", music_gain=0.3, duck=0.6, fade_in=0.3, fade_out=0.6, lufs=-16)
