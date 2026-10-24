#!/usr/bin/env python3
"""Assemble a HyperFrames project from a film folder.

    python tools/build/build.py <film_dir>

<film_dir>/template.html   page skeleton; the token %FILM% is replaced by the contents of film.js (inlined: HyperFrames
                           lint needs the window.__timelines registration inside index.html); %DUR% by the film length
                           (timeline.json "total" for dialogue films)
<film_dir>/film.js         the film code (pure function of t)
Writes <film_dir>/proj/index.html and copies the shared engine (engine/*.js) and fonts (assets/fonts) into proj/.
Also copies <film_dir>/film_clips.js and <film_dir>/assets/ (voice, images) into proj/. proj/ is a build output
(git-ignored); score.py writes proj/assets/mix.wav.
Dialogue films: film_data.js (tools/voice/dialogue.py) + cast.json + shots.json (tools/direct/shotlist.py) are merged into
proj/film_data.js as window.FILM_DATA / FILM_CAST / FILM_SHOTS — load it with <script src="film_data.js">.
"""
import json, os, shutil, sys
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


def main():
    d = os.path.abspath(sys.argv[1]); proj = os.path.join(d, "proj")
    os.makedirs(os.path.join(proj, "assets"), exist_ok=True)
    html = open(os.path.join(d, "template.html"), encoding="utf-8").read()
    if "%FILM%" in html:
        html = html.replace("%FILM%", open(os.path.join(d, "film.js"), encoding="utf-8").read())
    if "%DUR%" in html:
        tl = os.path.join(d, "timeline.json")
        if not os.path.exists(tl): sys.exit("template uses %DUR% but timeline.json is missing (run tools/voice/dialogue.py)")
        html = html.replace("%DUR%", str(json.load(open(tl, encoding="utf-8"))["total"]))
    open(os.path.join(proj, "index.html"), "w", encoding="utf-8").write(html)
    shutil.copytree(os.path.join(ROOT, "engine"), os.path.join(proj, "engine"), dirs_exist_ok=True)
    shutil.copytree(os.path.join(ROOT, "assets", "fonts"), os.path.join(proj, "fonts"), dirs_exist_ok=True)
    if os.path.exists(os.path.join(d, "film_clips.js")): shutil.copy(os.path.join(d, "film_clips.js"), proj)
    if os.path.isdir(os.path.join(d, "assets")): shutil.copytree(os.path.join(d, "assets"), os.path.join(proj, "assets"), dirs_exist_ok=True)
    data = []
    if os.path.exists(os.path.join(d, "film_data.js")): data.append(open(os.path.join(d, "film_data.js"), encoding="utf-8").read().strip())
    for name, var in (("cast.json", "FILM_CAST"), ("shots.json", "FILM_SHOTS")):
        p = os.path.join(d, name)
        if os.path.exists(p): data.append(f"window.{var} = " + json.dumps(json.load(open(p, encoding="utf-8")), ensure_ascii=False) + ";")
    if data: open(os.path.join(proj, "film_data.js"), "w", encoding="utf-8").write("\n".join(data) + "\n")
    print("built", os.path.join(proj, "index.html"))


if __name__ == "__main__":
    main()
