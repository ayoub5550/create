#!/usr/bin/env python3
"""Shot list for dialogue films: automatic coverage from the dialogue timeline, and an editing linter.

    python tools/direct/shotlist.py auto <film_dir>              # timeline.json (+ scene.json hints) -> shots.json
    python tools/direct/shotlist.py check <film_dir>/shots.json  # continuity / pacing warnings (exit 1 on errors)

auto = the classic coverage pattern (docs: skills/film-director, skills/film-editor):
  establishing two-shot (WS) -> singles on the speaker, cut a few frames BEFORE each new line (--lead, default 0.1 s)
  -> MS early, MCU as the scene heats up (emotion != neutral, later exchanges), CU on "key": true lines
  -> "react": true on a line = hold the listener's reaction after it (L-cut: we cut while the last word ends)
  -> long lines (> 5 s) get a reaction cutaway in the middle -> back to the two-shot every --wide-every exchanges,
  on "wide": true lines, and for the closing. Shots shorter than --min seconds are merged away.
scene.json line hints: "shot": {"size": "CU", "on": ["layla"]} forces a shot; "move": {"zoom": 1.3, "dx": -100} adds
an in-shot camera move to the line's shot; "key", "wide", "react" as above.
scene.json "set": ["mound", "sami", "layla"] = what the wide shots frame (ids the film's resolve() knows; default: speakers).
shots.json = {"fps": 30, "total": 18.4, "shots": [{"t": 0.0, "size": "WS", "on": ["sami", "layla"], "why": "establishing"},
              {"t": 3.27, "size": "MS", "on": ["layla"], "over": "sami", "why": "speaker"}, ...]}
Hand direction: edit shots.json after `auto` (build scripts keep it). Anchor times to words so re-voicing never breaks the
edit: "t": "l4" (line start), "l4.end", "l4@2" (word 2 start), "l4@2e" (word end), plus "+0.3" / "-0.1".
engine/shots.js plays it: Shots.camera(DATA.shots, {resolve}) — hard cuts, framing from the characters.
check: no WS/EWS in the first 3 s, same subject + same size back to back (jump cut), shots < 1 s (unless "impact": true), the speaker off screen
for most of a line, monotone rhythm, long static shots, too many non-cut transitions, mirrored shots (180-degree rule).
"""
import argparse, json, os, re, statistics, sys

ORDER = ["EWS", "WS", "MS", "MCU", "CU"]


def frame(t, fps): return round(round(t * fps) / fps, 3)


def parse_time(x, lines):
    """shot times: seconds, or anchored to the dialogue like engine/shots.js: "l4", "l4.end", "l4@2" (word 2 start),
    "l4@2e" (its end), each with an optional "+0.3" / "-0.1" — re-voicing then never breaks a hand-made edit"""
    if isinstance(x, (int, float)): return float(x)
    m = re.fullmatch(r"\s*([\w-]+)(?:(\.end)|@(\d+)(e?))?\s*([+-]\s*[\d.]+)?\s*", str(x))
    L = {l["id"]: l for l in lines}
    if not m or m.group(1) not in L: raise SystemExit(f"bad shot time {x!r} (lines: {list(L)})")
    l = L[m.group(1)]
    v = l["end"] if m.group(2) else (l["words"][int(m.group(3))]["t1" if m.group(4) else "t0"] if m.group(3) else l["start"])
    return v + (float(m.group(5).replace(" ", "")) if m.group(5) else 0.0)


def auto(d, a):
    tl = json.load(open(os.path.join(d, "timeline.json"), encoding="utf-8")); fps = tl.get("fps", 30)
    sp = os.path.join(d, "scene.json")
    scene = json.load(open(sp, encoding="utf-8")) if os.path.exists(sp) else {}
    hint = {l["id"]: l for l in scene.get("lines", [])}
    lines = tl["lines"]; total = tl["total"]
    speakers = []
    for l in lines:
        if l["who"] not in speakers: speakers.append(l["who"])
    everyone = scene.get("set", speakers)          # wide shots frame these ids (characters + props the film resolves)
    S = [{"t": 0.0, "size": "WS", "on": everyone, "why": "establishing", "prio": 3}]
    exchanges = 0; prev_who = None
    for i, l in enumerate(lines):
        h = hint.get(l["id"], {}); who = l["who"]; others = [c for c in speakers if c != who]
        if prev_who is not None and who != prev_who: exchanges += 1
        if h.get("shot"):
            sh = dict(h["shot"]); sh.setdefault("on", [who]); sh["why"] = "forced"
        elif h.get("wide") or (exchanges and exchanges % a.wide_every == 0 and who != prev_who):
            sh = {"size": "WS", "on": everyone, "why": "reset"}
        else:
            size = "CU" if h.get("key") else ("MCU" if (l.get("emotion", "neutral") != "neutral" or exchanges >= 3) else "MS")
            sh = {"size": size, "on": [who], "why": "speaker"}
            if prev_who and prev_who != who and size != "CU": sh["over"] = prev_who   # a key line gets a clean close-up
        if i == 0:
            if l["end"] < 4.5: sh = None                              # a short first line plays in the establishing shot
            else:                                                     # hold the wide >= 2.2 s, cut on a word boundary
                ends = [w["t1"] for w in l["words"] if w["t1"] >= 2.2 and w["t1"] < l["end"] - 1.2]
                sh["t"] = frame((min(ends) if ends else 2.2) + 0.05, fps)
        else:
            sh["t"] = frame(l["start"] - a.lead, fps)                 # cut a few frames before the new line
        if sh:
            if h.get("move"): sh["move"] = h["move"]                     # e.g. a slow push-in for the closing
            sh["prio"] = 4 if (h.get("key") or h.get("shot")) else 2; S.append(sh)
            seg0 = sh["t"]; nxt = lines[i + 1] if i + 1 < len(lines) else None
            long_ = sh["size"] != "WS" and l["end"] - max(seg0, l["start"]) > 4.5 and others
            if long_ and nxt and nxt["who"] in others and not l.get("react"):   # L-cut: the next speaker's face, ~1 s early
                S.append({"t": frame(l["end"] - 1.0, fps), "size": "MCU", "on": [nxt["who"]], "why": "reaction", "prio": 1})
            elif long_ and l["end"] - max(seg0, l["start"]) > 5.0:              # long monologue: listener cutaway + back
                mid = max(seg0, l["start"]) + (l["end"] - max(seg0, l["start"])) * 0.55
                ends = [w["t1"] for w in l["words"] if abs(w["t1"] - mid) < 1.2]
                tc = min(ends, key=lambda x: abs(x - mid)) if ends else mid
                if tc - seg0 >= a.min and l["end"] - tc >= 1.2:
                    S.append({"t": frame(tc, fps), "size": "MCU", "on": [others[0]], "why": "reaction", "prio": 1})
                    if l["end"] - (tc + 1.6) >= 1.5:
                        S.append({"t": frame(tc + 1.6, fps), "size": sh["size"], "on": [who], "why": "speaker", "prio": 0})
        if l.get("react") and others:                                 # punchline / reveal: hold the listener's face
            t_r = max(l["end"] - 0.25, (sh["t"] if sh else 0) + a.min)  # the punchline shot still gets its >= min seconds
            S.append({"t": frame(t_r, fps), "size": "MCU", "on": others, "why": "reaction", "prio": 3})
        prev_who = who
    if lines and total - lines[-1]["end"] >= 1.0:
        S.append({"t": frame(lines[-1]["end"] + 0.35, fps), "size": "WS", "on": everyone, "why": "closing", "prio": 2})
    # tidy: no-op cuts go; two cuts closer than --min: delay the later one a little (<= 0.45 s, a J-cut), else the
    # higher-priority shot keeps the slot
    same = lambda x, y: x["size"] == y["size"] and sorted(x["on"]) == sorted(y["on"])   # (over-the-shoulder or not)
    S.sort(key=lambda x: x["t"]); out = []
    for s in S:
        while s is not None:
            if out and same(out[-1], s): s = None; break
            if out and s["t"] - out[-1]["t"] < a.min - 1e-6:
                need = frame(out[-1]["t"] + a.min, fps)
                if need - s["t"] <= 0.45 and s["why"] != "reaction": s["t"] = need; continue
                if len(out) > 1 and s["prio"] > out[-1]["prio"]: out.pop(); continue
                s = None; break
            break
        if s: out.append(s)
    for i, s in enumerate(out):                                       # long single: a slow push-in keeps it alive
        du = (out[i + 1]["t"] if i + 1 < len(out) else total) - s["t"]
        if du > 4.5 and len(s["on"]) == 1 and "move" not in s: s["move"] = {"zoom": 1.06}
        s.pop("prio", None)
    res = {"fps": fps, "total": total, "shots": out}
    json.dump(res, open(os.path.join(d, "shots.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print(f"{len(out)} shots -> {os.path.join(d, 'shots.json')}")
    for s in out: print(f"  {s['t']:6.2f}  {s['size']:4} {','.join(s['on']):16} {('over ' + s['over']) if s.get('over') else '':12} {s['why']}")
    return res


def check(path, a):
    S = json.load(open(path, encoding="utf-8"))
    d = os.path.dirname(os.path.abspath(path)); tlp = os.path.join(d, "timeline.json")
    TL = json.load(open(tlp, encoding="utf-8")) if os.path.exists(tlp) else {"lines": []}; lines = TL["lines"]
    shots = sorted([dict(x, t=parse_time(x["t"], lines)) for x in S["shots"]], key=lambda x: x["t"])
    total = TL.get("total", S.get("total", shots[-1]["t"] + 3))
    err, warn = [], []
    if shots[0]["t"] > 0: err.append("the first shot must start at t=0")
    if not any(s.get("size") in ("EWS", "WS") and s["t"] <= 3.0 for s in shots):   # a close hook first is fine if the WS follows
        warn.append("no establishing shot in the first 3 s: show EWS/WS early so the audience knows where everyone is")
    durs = []
    for i, s in enumerate(shots):
        t1 = shots[i + 1]["t"] if i + 1 < len(shots) else total; du = t1 - s["t"]; durs.append(du)
        if du <= 0: err.append(f"shot {i} at {s['t']}: times must increase")
        if du < 1.0 and not s.get("impact"): warn.append(f"shot {i} at {s['t']:.2f}: {du:.2f} s is too short to read (>= 1 s; mark \"impact\": true for hits)")
        if du > 8 and not s.get("move"): warn.append(f"shot {i} at {s['t']:.2f}: {du:.1f} s static — add a move, a reaction or a cut")
        if s.get("mirror") or s.get("flip"): err.append(f"shot {i}: mirrored framing breaks the 180-degree rule (screen sides must stay)")
        if i and sorted(s.get("on", [])) == sorted(shots[i - 1].get("on", [])) and s.get("size") == shots[i - 1].get("size") and not s.get("frame"):
            err.append(f"shot {i} at {s['t']:.2f}: same subject and size as the previous shot = jump cut (merge, or change size >= 1 step)")
    if len(durs) >= 5 and statistics.pstdev(durs) / (statistics.mean(durs) or 1) < 0.2:
        warn.append("monotone rhythm: shot lengths are all alike — vary them (short-short-long)")
    trans = [s for s in shots if s.get("transition", "cut") != "cut"]
    if len(shots) > 3 and len(trans) / len(shots) > 0.1: warn.append(f"{len(trans)} non-cut transitions: keep >= 90% straight cuts")
    if any(s.get("transition") == "dissolve" for s in shots) and lines: warn.append("dissolve inside a dialogue scene: use it only for time passing")
    def shot_at(t):
        k = 0
        for i, s in enumerate(shots):
            if s["t"] <= t: k = i
        return shots[k]
    for l in lines:
        seen = sum(1 for k in range(10) if l["who"] in shot_at(l["start"] + l["dur"] * (k + 0.5) / 10).get("on", []))
        if seen < 4 and not any(shot_at(l["start"] + l["dur"] * (k + 0.5) / 10).get("why") == "reaction" for k in range(10)):
            warn.append(f"line {l['id']} ({l['who']}): the speaker is on screen only {seen * 10}% of the line")
    asl = statistics.mean(durs)
    print(f"{len(shots)} shots, average {asl:.2f} s (min {min(durs):.2f}, max {max(durs):.2f})")
    for m in err: print("ERROR", m)
    for m in warn: print("WARN ", m)
    if not err and not warn: print("ok: no continuity or pacing problems found")
    return 1 if err else 0


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("cmd", choices=["auto", "check"]); ap.add_argument("path")
    ap.add_argument("--lead", type=float, default=0.1, help="cut this many seconds before a new line (2-6 frames)")
    ap.add_argument("--min", type=float, default=1.2, help="minimum shot length (s)")
    ap.add_argument("--wide-every", type=int, default=5, help="back to the two-shot every N exchanges")
    a = ap.parse_args()
    if a.cmd == "auto":
        auto(os.path.abspath(a.path), a); sys.exit(check(os.path.join(os.path.abspath(a.path), "shots.json"), a))
    sys.exit(check(a.path, a))


if __name__ == "__main__":
    main()
