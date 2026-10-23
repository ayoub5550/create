#!/usr/bin/env python3
"""Assemble a HyperFrames project from a film folder.

    python tools/build/build.py <film_dir>

<film_dir>/template.html   page skeleton; the token %FILM% is replaced by the contents of film.js (inlined: HyperFrames
                           lint needs the window.__timelines registration inside index.html)
<film_dir>/film.js         the film code (pure function of t)
Writes <film_dir>/proj/index.html and copies the shared engine (engine/*.js) and fonts (assets/fonts) into proj/.
Also copies <film_dir>/film_clips.js and <film_dir>/assets/ (voice, images) into proj/. proj/ is a build output
(git-ignored); score.py writes proj/assets/mix.wav.
"""
import os, shutil, sys
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

def main():
    d = os.path.abspath(sys.argv[1]); proj = os.path.join(d, "proj")
    os.makedirs(os.path.join(proj, "assets"), exist_ok=True)
    html = open(os.path.join(d, "template.html"), encoding="utf-8").read()
    if "%FILM%" in html:
        html = html.replace("%FILM%", open(os.path.join(d, "film.js"), encoding="utf-8").read())
    open(os.path.join(proj, "index.html"), "w", encoding="utf-8").write(html)
    shutil.copytree(os.path.join(ROOT, "engine"), os.path.join(proj, "engine"), dirs_exist_ok=True)
    shutil.copytree(os.path.join(ROOT, "assets", "fonts"), os.path.join(proj, "fonts"), dirs_exist_ok=True)
    if os.path.exists(os.path.join(d, "film_clips.js")): shutil.copy(os.path.join(d, "film_clips.js"), proj)
    if os.path.isdir(os.path.join(d, "assets")): shutil.copytree(os.path.join(d, "assets"), os.path.join(proj, "assets"), dirs_exist_ok=True)
    print("built", os.path.join(proj, "index.html"))

if __name__ == "__main__":
    main()
