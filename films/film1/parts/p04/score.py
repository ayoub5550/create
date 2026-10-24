"""P04 score + Foley (common/toon.py on the repo mixer tools/audio/sound.py). Run from this folder after dialogue.py.
Beats use the same formulas as film.js. Comedy in sound: Sam strides in on footsteps + a lens "ting"; the "scheme" cue
creeps under "Plan F"; a hot-dot sizzle and a low "tension" bed while the smoke curls; the music STOPS for the flame
(pop + uh-oh), the panic is flaps, boings and a crackle in dry air; the water: pour, sizzle + steam, then dead air;
crickets under her flat stare and an offscreen thud (the glass); a light "happy" bed for the internet; a click on every
key, a ding for the result, a sad trombone for "One star!", the slide whistle for the falling star; stomps, a sit thud,
then the staring contest: clock ticks over a thin tension bed, a fly buzz, a tiny "tk" when it lands. -16 LUFS."""
import json, os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path[:0] = [os.path.join(HERE, "..", "..", "..", "..", "tools", "audio"), os.path.join(HERE, "..", "..", "common")]
from sound import Score, thud
import toon as T

os.chdir(HERE)
TL = json.load(open("timeline.json", encoding="utf-8"))
L = {l["id"]: l for l in TL["lines"]}; DUR = TL["total"]
def w(i, k): ws = L[i]["words"]; return ws[k if k >= 0 else len(ws) + k]

# ---- beats (same formulas as film.js)
t_arr = L["l1"]["start"] - 0.15
t_lift0 = w("l1", 1)["t0"] - 0.1; t_dot = w("l1", 3)["t0"]; t_lower = w("l1", 4)["t0"]
t_smoke = L["l1"]["end"] - 0.3
t_flame = L["l3"]["end"] - 0.02
t_rise0 = L["l3"]["start"] + 0.1; t_rise1 = t_rise0 + 1.0
t_grab0 = t_rise1 + 0.05; t_grab1 = t_rise1 + 0.65
WALKD = 1.35; t_walk1 = t_grab1 + WALKD
t_pour = t_walk1 + 0.25; t_hit = t_pour + 0.3; t_pour_end = t_pour + 1.15
t_panic0 = L["l4"]["start"] - 0.12
t_hide = w("l6", 1)["t0"] - 0.3
t_stare = L["l6"]["end"] + 0.05; t_drop = w("l7", 0)["t0"] + 0.12
t_back0 = t_stare + 0.85
t_phone0 = w("l7", 1)["t0"] - 0.2
t_inset0 = L["l8"]["start"] - 0.35
t_res1 = L["l8"]["end"] + 0.3
t_star1 = w("l9", 4)["t0"] - 0.05
t_inset2 = L["l12"]["start"] - 0.3
t_star0 = w("l12", 5)["t0"] - 0.05; t_fall = w("l12", 6)["t0"] + 0.12
t_pocket = w("l14", 1)["t0"] - 0.1
t_stomp = L["l15"]["start"]; STOMPD = 0.66; t_turn = t_stomp + STOMPD
t_sit0 = t_turn + 0.3; t_contact = t_sit0 + 1.3 * 44 / 56
t_cross = w("l15", 5)["t0"] - 0.1
t_fly0 = L["l15"]["end"] + 0.35; t_fly_land = DUR - 1.2
t_glance = L["l15"]["end"] + 1.2

# typed keys (film.js KEYS): letters spread over each word of l8
QW = ["how ", "to ", "grow ", "a ", "tree ", "fast"]; KEYS = []
for i, wd in enumerate(L["l8"]["words"]):
    s = QW[i] if i < len(QW) else ""; n = len(s.rstrip(" ")); d = max(0.22, min(0.5, wd["t1"] - wd["t0"]))
    for k, ch in enumerate(s):
        KEYS.append((wd["t0"] + (d * k / max(1, n) if k < n else d + 0.04), ch))

S = Score(DUR)
# ---- ambience: the yard (Foley bus, not ducked; low)
S.sfx_add(T.sfx("yard_amb", d=DUR), 0.0, 0.09)

# ---- music I: the scheme under Plan F -> tension while it cooks -> STOP for the flame
S.music_add(T.cue("scheme", t_smoke + 0.6), 0.0, 0.6)
S.music_add(T.cue("tension", t_flame - t_smoke + 0.3), t_smoke, 0.7)
S.music_gap(t_flame - 0.06, t_hit + 2.2, 0.06)                  # the flame pops into dry air; the splash, then silence
# ---- music II: a light bed for "let's ask the internet" (stops for each review)
t_bed = L["l7"]["start"] - 0.2
S.music_add(T.cue("happy", t_star1 - t_bed + 0.6, busy=0.5), t_bed, 0.55)
S.music_gap(t_star1 - 0.05, L["l10"]["start"] + 0.25, 0.05)
t_bed2 = L["l10"]["start"] + 0.2
S.music_add(T.cue("happy", t_star0 - t_bed2 + 0.6, busy=0.6, key=2), t_bed2, 0.5)
S.music_gap(t_star0 - 0.05, L["l13"]["start"] + 0.3, 0.05)
S.music_add(T.cue("scheme", t_contact - L["l13"]["start"] + 0.4), L["l13"]["start"] + 0.2, 0.45)
S.music_gap(t_contact - 0.05, t_contact + 0.6, 0.05)
S.music_add(T.cue("tension", DUR - t_contact - 0.5), t_contact + 0.5, 0.45)       # the staring contest

# ---- OPEN: footsteps of the stride, a "ting" glint on the lens
t = 0.12
while t < t_arr:
    S.sfx_add(T.foley("footstep_grass", int(t * 10) % 5), t, 0.2); t += 0.36
S.sfx_add(T.sfx("twinkle"), 1.15, 0.16)
S.sfx_add(T.sfx("knitting", d=t_rise0), 0.2, 0.06)                # her needles while she knits
S.sfx_add(T.foley("cloth", 2), t_lift0 + 0.05, 0.16); S.sfx_add(T.sfx("whoosh"), t_lift0 + 0.05, 0.1)
S.sfx_add(T.sfx("twinkle", base=96), t_dot - 0.05, 0.2)           # the dot ignites
S.sfx_add(T.sfx("sizzle", d=t_flame - t_dot), t_dot, 0.05)        # a faint frying hiss under it
S.sfx_add(T.sfx("sizzle", d=1.4), t_lower + 0.2, 0.06)

# ---- the flame + panic
S.sfx_add(T.sfx("pop", f0=300, f1=1200), t_flame, 0.4)
S.sfx_add(T.sfx("uh_oh"), t_flame + 0.12, 0.42)
S.sfx_add(T.sfx("boing", d=0.4, f=520), t_flame + 0.03, 0.12)      # sunglasses jump
S.sfx_add(T.sfx("sizzle", d=t_hit - t_flame), t_flame, 0.12)       # it crackles
k = 0; t = t_panic0 + 0.07
while t < t_hit - 0.05:                                           # every flap a whoosh, every hop a little boing
    S.sfx_add(T.sfx("whoosh"), t, 0.09)
    if k % 2 == 0: S.sfx_add(T.boing(0.25, 300 + 40 * (k % 3)), t + 0.05, 0.08)
    t += 1 / 3.6; k += 1
# Layla: up off the stool, crouch for the bottle, calm steps
S.sfx_add(T.foley("creak", 1), t_rise0 + 0.2, 0.14)
S.sfx_add(T.foley("cloth", 3), t_grab0 + 0.1, 0.12)
t = t_grab1 + 0.15
while t < t_walk1:
    S.sfx_add(T.foley("footstep_grass", int(t * 10) % 5), t, 0.14); t += 0.55
S.sfx_add(T.sfx("small_splash"), t_hit - 0.12, 0.3)
S.sfx_add(T.sfx("sizzle"), t_hit, 0.5); S.sfx_add(T.sfx("steam"), t_hit + 0.15, 0.4)
S.sfx_add(T.sfx("drips", d=1.6), t_pour_end - 0.2, 0.12)
S.sfx_add(T.sfx("gulp"), L["l6"]["start"] - 0.35, 0.14)
S.sfx_add(T.foley("cloth", 1), t_hide, 0.14)
S.sfx_add(T.sfx("crickets"), t_stare + 0.05, 0.08)
S.sfx_add(T.sfx("whoosh"), t_drop - 0.05, 0.16); S.sfx_add(T.foley("impactWood_light", 1), t_drop + 0.3, 0.2)   # tossed; lands offscreen
# Layla walks back (offscreen) + sits again
t = t_back0 + 0.2
while t < t_back0 + WALKD:
    S.sfx_add(T.foley("footstep_grass", int(t * 10) % 5), t, 0.08); t += 0.55

# ---- the internet
S.sfx_add(T.foley("cloth", 0), t_phone0, 0.16); S.sfx_add(T.sfx("bloop"), t_phone0 + 0.45, 0.16)
S.sfx_add(T.sfx("whoosh"), t_inset0, 0.14); S.sfx_add(T.sfx("whoosh"), t_inset2, 0.14)
for i, (tk, ch) in enumerate(KEYS):
    if ch != " ": S.sfx_add(T.foley("click", i % 5), tk, 0.22)
S.sfx_add(T.sfx("ding"), t_res1, 0.22)
S.sfx_add(T.sfx("pop"), t_star1, 0.3); S.sfx_add(T.foley("impactPunch_medium", 0), t_star1 + 0.3, 0.2)   # stamp: one star
S.sfx_add(T.sfx("sad_trombone"), t_star1 + 0.35, 0.36)
S.sfx_add(T.sfx("ding", m=93), t_inset2 + 0.2, 0.16)
S.sfx_add(T.sfx("pop"), t_star0, 0.3); S.sfx_add(T.foley("jingles_PIZZI", 4), t_star0 + 0.25, 0.22)
S.sfx_add(T.sfx("squeak", d=0.3, n_=2), t_fall - 0.35, 0.08)
S.sfx_add(T.sfx("slide_down"), t_fall, 0.3)
S.sfx_add(T.foley("cloth", 2), t_pocket, 0.16)

# ---- the stomp + sit
t = t_stomp + 0.08
while t < t_turn:
    S.sfx_add(T.foley("footstep_grass", int(t * 10) % 5), t, 0.3); S.sfx_add(thud(60, 0.12), t, 0.12); t += 0.26
S.sfx_add(T.foley("impactSoft_heavy", 0), t_contact, 0.32); S.sfx_add(thud(55, 0.3), t_contact, 0.2)
S.sfx_add(T.foley("cloth", 3), t_cross, 0.16)
# ---- the staring contest
S.sfx_add(T.sfx("clock_tick", d=DUR - t_contact - 0.4), t_contact + 0.4, 0.2)
S.sfx_add(T.sfx("flies", d=t_fly_land - t_fly0 + 0.1, k=1), t_fly0, 0.12)
S.sfx_add(T.foley("click", 3), t_fly_land, 0.08)
S.sfx_add(T.sfx("knitting", d=DUR - t_glance), t_glance + 0.7, 0.07)

S.voice({k: v["start"] for k, v in L.items()}, "assets/voice/{}.mp3")
os.makedirs("proj/assets", exist_ok=True)
S.render("proj/assets/mix.wav", music_gain=0.3, duck=0.6, fade_in=0.3, fade_out=0.6, lufs=-16)
