"""Music bed + UI sounds for the kinetic demo (tools/audio/sound.py). python score.py"""
import json, os, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "tools", "audio"))
from sound import *
K = json.load(open("kinetic.json")); T = json.load(open("tts.json")); VO = K["vo"]
S = Score(28.3)
# pulse in D Ajam: pad chords + a plucked ostinato, a frame drum on every card change
chords = [[50, 57, 62, 66], [47, 55, 59, 62], [43, 55, 59, 62], [45, 57, 61, 64]]
t, k = 0.3, 0
while t < 27:
    S.music_add(pad(chords[k % 4], 3.6), t, .25)
    S.phrase(t, maqam_line("ajam", 62, [0, 2, 4, 7, 4, 2, 4, 2], [.5] * 8), bpm=128, gain=.22, bright=.7)
    t += 3.75; k += 1
for sid, t0 in VO.items():
    S.sfx_add(whoosh(.45), t0 - .45, .18); S.sfx_add(frame_drum(), t0, .3)
# a pop on every *keyword* (same timing rule as the build: tokens with '*')
for s in json.load(open("script.json")):
    toks = s["text"].split(); key = False
    for i, w in enumerate(toks):
        if w.startswith("*"): key = True
        if key and i < len(T[s["id"]]["words"]): S.sfx_add(pop(.18, 500, 1400), VO[s["id"]] + T[s["id"]]["words"][i]["timestamp"][0], .12)
        if w.rstrip("،,.!؟?:؛…").endswith("*"): key = False
S.voice(VO, "assets/voice/{}.mp3")
os.makedirs("proj/assets", exist_ok=True)
S.render("proj/assets/mix.wav", music_gain=.33)
