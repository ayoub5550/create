#!/usr/bin/env python3
"""Publish a finished film to YouTube with the owner's own Google Cloud OAuth client (YouTube Data API v3).

Recipe (Arabic, step by step, incl. the one-time Google Cloud setup): docs/recipe/09-publish-youtube.md

  python tools/publish/youtube.py auth                   # 1. print the consent link (the channel owner opens it)
  python tools/publish/youtube.py auth '<redirect URL>'  # 2. paste back the URL they land on (contains code=)
  python tools/publish/youtube.py whoami                 #    which channel the token can publish to
  python tools/publish/youtube.py upload films/<slug> --dry-run   # 3. validate youtube.json + files + channel
  python tools/publish/youtube.py upload films/<slug>    # 4. upload -> captions -> thumbnail -> playlist -> published.json
  python tools/publish/youtube.py status films/<slug>    #    processing / privacy / captions of the published video
  python tools/publish/youtube.py thumbnail films/<slug> #    retry only the thumbnail (e.g. after phone verification)
  python tools/publish/youtube.py captions films/<slug>  #    retry only the captions
  python tools/publish/youtube.py set films/<slug> --kids no --ai no [--privacy public]   # update status fields

Inputs:  films/<slug>/youtube.json (metadata; paths in it are relative to the repo root).
Output:  films/<slug>/published.json (video id + url; commit it). The upload skips if the video already exists.
Secrets: OUTSIDE the repo, in $YT_SECRETS_DIR (default ~/.config/create/youtube/):
         client_secret.json (downloaded from Google Cloud) and token.json (written by `auth`). Never commit them.
Standard library only (no extra pip packages).
"""
import argparse
import html
import json
import os
import secrets
import sys
import time
import urllib.error
import urllib.parse
import urllib.request

ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", ".."))
SECRETS = os.path.expanduser(os.environ.get("YT_SECRETS_DIR", "~/.config/create/youtube"))
SCOPE = "https://www.googleapis.com/auth/youtube.force-ssl"
PLAYGROUND = "https://developers.google.com/oauthplayground"
API = "https://www.googleapis.com/youtube/v3"
UP = "https://www.googleapis.com/upload/youtube/v3"
CHUNK = 16 * 1024 * 1024

# (text to look for in the error body, hint, only for this call or None)
HINTS = [
    ("accessNotConfigured", "Enable 'YouTube Data API v3' in the Google Cloud project (APIs & Services -> Library).", None),
    ("SERVICE_DISABLED", "Enable 'YouTube Data API v3' in the Google Cloud project (APIs & Services -> Library).", None),
    ("quotaExceeded", "This Cloud project's daily quota is used up. It resets at midnight Pacific time; retry then.", None),
    ("uploadLimitExceeded", "The channel hit YouTube's daily upload limit. Retry after midnight Pacific time.", None),
    ("Video Uploads per day", "Daily upload limit reached. Retry after midnight Pacific time.", None),
    ("rateLimitExceeded", "Too many requests / daily upload limit. Retry after midnight Pacific time.", None),
    ("invalid_grant", "The code was already used or expired (~10 min), or the refresh token expired (apps in 'Testing' "
                      "get 7-day tokens). Run `youtube.py auth` again and have the owner reopen the link.", None),
    ("redirect_uri_mismatch", "Add https://developers.google.com/oauthplayground as an Authorized redirect URI on the "
                              "OAuth client (Google Auth Platform -> Clients), wait a few minutes, retry.", None),
    ("", "Custom thumbnails need a phone-verified channel: the owner opens https://www.youtube.com/verify, then run "
         "`youtube.py thumbnail films/<slug>`.", "thumbnails.set"),
]


# ---------------------------------------------------------------- http helpers (stdlib)
class _NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, *a, **k):  # resumable uploads answer 308 "Resume Incomplete": never follow it
        return None


_OPENER = urllib.request.build_opener(_NoRedirect)


def http(method: str, url: str, params: dict | None = None, data: bytes | None = None,
         headers: dict | None = None, timeout: int = 60) -> tuple[int, dict, bytes]:
    if params:
        url += ("&" if "?" in url else "?") + urllib.parse.urlencode(params)
    req = urllib.request.Request(url, data=data, method=method, headers=headers or {})
    try:
        with _OPENER.open(req, timeout=timeout) as r:
            return r.status, {k.lower(): v for k, v in r.headers.items()}, r.read()
    except urllib.error.HTTPError as e:
        return e.code, {k.lower(): v for k, v in (e.headers or {}).items()}, e.read() or b""


def explain(status: int, body: bytes, what: str) -> str:
    text = body.decode("utf-8", "replace")
    hint = next((h for needle, h, only in HINTS
                 if (only is None or only == what) and (needle in text if needle else status == 403)), "")
    return f"{what} FAILED {status}: {text[:600]}" + (f"\n  HINT: {hint}" if hint else "")


def die(msg: str, code: int = 2) -> None:
    print(msg)
    sys.exit(code)


# ---------------------------------------------------------------- secrets / oauth
def spath(name: str) -> str:
    return os.path.join(SECRETS, name)


def client() -> tuple[dict, str]:
    p = spath("client_secret.json")
    if not os.path.exists(p):
        die(f"Missing {p}\n  Download the OAuth client JSON from Google Cloud (Google Auth Platform -> Clients) and "
            f"save it there (or set YT_SECRETS_DIR). See docs/recipe/09-publish-youtube.md.", 5)
    raw = json.load(open(p))
    c = raw.get("web") or raw.get("installed")
    if not c:
        die("client_secret.json has neither 'web' nor 'installed' section", 5)
    uris = c.get("redirect_uris") or []
    if "web" in raw:
        redirect = next((u for u in uris if "oauthplayground" in u), uris[0] if uris else PLAYGROUND)
    else:  # Desktop client: loopback redirect; the page will not load, but the address bar holds the code
        redirect = "http://localhost"
    return c, redirect


def save_json(path: str, obj: dict) -> None:
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w") as f:
        json.dump(obj, f, indent=1)
    os.chmod(path, 0o600)


def parse_pasted(arg: str) -> tuple[str, str | None]:
    """Accepts the full redirect URL (also Slack-mangled: <url|url>, &amp;) or a bare code."""
    arg = html.unescape(arg.strip().strip("<>")).split("|")[0]
    if "code=" not in arg:
        return arg, None
    q = urllib.parse.parse_qs(urllib.parse.urlparse(arg).query)
    return q["code"][0], (q.get("state") or [None])[0]


def cmd_auth(a) -> None:
    c, redirect = client()
    if not a.url:
        state = secrets.token_urlsafe(16)
        save_json(spath("state.json"), {"state": state, "redirect": redirect})
        q = {"client_id": c["client_id"], "redirect_uri": redirect, "response_type": "code", "scope": SCOPE,
             "access_type": "offline", "prompt": "consent select_account", "include_granted_scopes": "true",
             "state": state}
        print("Send this link to the channel owner (or open it yourself, signed in as the channel's Google account):\n")
        print(c.get("auth_uri", "https://accounts.google.com/o/oauth2/v2/auth") + "?" + urllib.parse.urlencode(q))
        print("\nThey click: account of the channel -> 'Advanced' -> 'Go to <app> (unsafe)' -> Continue/Allow -> channel."
              "\nThen they copy the FULL address-bar URL of the page they land on (it contains code=) and you run:"
              "\n  python tools/publish/youtube.py auth '<that URL>'      (within ~10 minutes; the code is single-use)")
        return
    code, state = parse_pasted(a.url)
    st = json.load(open(spath("state.json"))) if os.path.exists(spath("state.json")) else {}
    if state and st.get("state") and state != st["state"]:
        print("WARNING: state does not match the last `auth` link (an older link?) - trying anyway")
    redirect = st.get("redirect", redirect)
    body = urllib.parse.urlencode({"code": code, "client_id": c["client_id"], "client_secret": c["client_secret"],
                                   "redirect_uri": redirect, "grant_type": "authorization_code"}).encode()
    s, _, b = http("POST", c.get("token_uri", "https://oauth2.googleapis.com/token"), data=body,
                   headers={"Content-Type": "application/x-www-form-urlencoded"})
    if s != 200:
        die(explain(s, b, "token exchange"))
    tok = json.loads(b)
    tok["expires_at"] = time.time() + tok.get("expires_in", 3600) - 60
    tok["created"] = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    save_json(spath("token.json"), tok)
    print("OK token saved | scope:", tok.get("scope"), "| refresh_token:", "yes" if tok.get("refresh_token") else "NO")
    cmd_whoami(a)


def access_token() -> str:
    p = spath("token.json")
    if not os.path.exists(p):
        die("No token yet. Run `python tools/publish/youtube.py auth` first.", 5)
    tok = json.load(open(p))
    if time.time() < tok.get("expires_at", 0):
        return tok["access_token"]
    if not tok.get("refresh_token"):
        die("Access token expired and there is no refresh token. Run `auth` again.", 5)
    c, _ = client()
    body = urllib.parse.urlencode({"client_id": c["client_id"], "client_secret": c["client_secret"],
                                   "refresh_token": tok["refresh_token"], "grant_type": "refresh_token"}).encode()
    s, _, b = http("POST", c.get("token_uri", "https://oauth2.googleapis.com/token"), data=body,
                   headers={"Content-Type": "application/x-www-form-urlencoded"})
    if s != 200:
        die(explain(s, b, "token refresh"), 5)
    new = json.loads(b)
    tok.update(access_token=new["access_token"], expires_at=time.time() + new.get("expires_in", 3600) - 60)
    save_json(p, tok)
    return tok["access_token"]


def auth_h(extra: dict | None = None) -> dict:
    h = {"Authorization": f"Bearer {access_token()}"}
    h.update(extra or {})
    return h


def api(method: str, path: str, what: str, params: dict | None = None, body: dict | None = None) -> dict:
    data = json.dumps(body).encode() if body is not None else None
    h = auth_h({"Content-Type": "application/json"} if data else None)
    s, _, b = http(method, f"{API}/{path}", params=params, data=data, headers=h)
    if s >= 300:
        die(explain(s, b, what))
    return json.loads(b) if b else {}


def my_channels() -> list[tuple[str, str]]:
    d = api("GET", "channels", "channels.list", {"part": "id,snippet", "mine": "true"})
    return [(i["id"], i["snippet"]["title"]) for i in d.get("items", [])]


def cmd_whoami(a) -> None:
    ch = my_channels()
    print("token can publish to:", ch or "NO CHANNEL (this Google account has no YouTube channel)")


# ---------------------------------------------------------------- film metadata
def rel(p: str) -> str:
    return p if os.path.isabs(p) else os.path.join(ROOT, p)


def load_film(film: str) -> tuple[str, dict]:
    d = rel(film.rstrip("/"))
    p = os.path.join(d, "youtube.json")
    if not os.path.exists(p):
        die(f"Missing {p} - copy films/film1/youtube.json and edit it (docs/recipe/09-publish-youtube.md).", 5)
    m = json.load(open(p, encoding="utf-8"))
    if "description_file" in m and not m.get("description"):
        m["description"] = open(rel(m["description_file"]), encoding="utf-8").read().strip()
    return d, m


def validate(m: dict) -> list[str]:
    errs = []
    for k in ("channel_id", "video", "title", "description", "category_id", "privacy"):
        if not m.get(k):
            errs.append(f"youtube.json: '{k}' is required")
    t = m.get("title", "")
    if len(t) > 100 or "<" in t or ">" in t:
        errs.append("title: max 100 characters, no < or >")
    if len(m.get("description", "").encode()) > 5000 or "<" in m.get("description", "") or ">" in m.get("description", ""):
        errs.append("description: max 5000 bytes, no < or >")
    if sum(len(x) + (2 if " " in x else 0) for x in m.get("tags", [])) + max(len(m.get("tags", [])) - 1, 0) > 500:
        errs.append("tags: max 500 characters in total")
    if m.get("privacy") not in ("public", "unlisted", "private"):
        errs.append("privacy: public | unlisted | private")
    for k in ("video", "captions", "thumbnail"):
        if m.get(k) and not os.path.exists(rel(m[k])):
            errs.append(f"{k}: file not found: {m[k]}")
    th = m.get("thumbnail")
    if th and os.path.exists(rel(th)) and os.path.getsize(rel(th)) > 2 * 1024 * 1024:
        errs.append("thumbnail: must be <= 2 MB (YouTube limit)")
    return errs


def video_body(m: dict) -> dict:
    status = {"privacyStatus": m["privacy"], "embeddable": True, "license": "youtube", "publicStatsViewable": True}
    if m.get("made_for_kids") is not None:  # owner's decision; null = leave it to YouTube Studio
        status["selfDeclaredMadeForKids"] = bool(m["made_for_kids"])
    if m.get("synthetic_media") is not None:  # owner's decision ("altered or synthetic content" disclosure)
        status["containsSyntheticMedia"] = bool(m["synthetic_media"])
    if m.get("publish_at"):  # scheduled release (ISO 8601, needs privacy=private)
        status["publishAt"] = m["publish_at"]
    lang = m.get("language", "en")
    snip = {"title": m["title"], "description": m["description"], "tags": m.get("tags", []),
            "categoryId": str(m["category_id"]), "defaultLanguage": lang, "defaultAudioLanguage": lang}
    return {"snippet": snip, "status": status}


def published_path(d: str) -> str:
    return os.path.join(d, "published.json")


def read_published(d: str) -> dict:
    p = published_path(d)
    return json.load(open(p, encoding="utf-8")) if os.path.exists(p) else {}


def write_published(d: str, pub: dict) -> None:
    with open(published_path(d), "w", encoding="utf-8") as f:
        json.dump(pub, f, indent=1, ensure_ascii=False)
        f.write("\n")


def require_channel(m: dict, force: bool) -> None:
    ch = my_channels()
    print("token can publish to:", ch)
    if not any(c[0] == m["channel_id"] for c in ch) and not force:
        die(f"ABORT: the token's account does not own channel {m['channel_id']}. Re-run `auth` and pick the "
            f"channel's Google account (or pass --any-channel if this is intended).", 3)


def find_existing(m: dict) -> str | None:
    uploads = "UU" + m["channel_id"][2:]
    s, _, b = http("GET", f"{API}/playlistItems", {"part": "snippet", "playlistId": uploads, "maxResults": 50},
                   headers=auth_h())
    if s == 404:  # brand-new channel: no uploads playlist yet
        return None
    if s >= 300:
        die(explain(s, b, "playlistItems.list"))
    for it in json.loads(b).get("items", []):
        if it["snippet"]["title"].strip() == m["title"].strip():
            return it["snippet"]["resourceId"]["videoId"]
    return None


# ---------------------------------------------------------------- upload steps
def session_file(d: str) -> str:
    return spath(f"session-{os.path.basename(d)}.json")


def start_session(d: str, m: dict, size: int) -> str:
    s, h, b = http("POST", f"{UP}/videos", {"uploadType": "resumable", "part": "snippet,status"},
                   data=json.dumps(video_body(m)).encode(),
                   headers=auth_h({"Content-Type": "application/json; charset=UTF-8",
                                   "X-Upload-Content-Length": str(size), "X-Upload-Content-Type": "video/*"}))
    if s != 200:
        die(explain(s, b, "videos.insert (start)"))
    uri = h["location"]
    save_json(session_file(d), {"uri": uri, "size": size, "t": time.time()})
    return uri


def probe(uri: str, size: int) -> tuple[int, dict | None]:
    s, h, b = http("PUT", uri, headers=auth_h({"Content-Range": f"bytes */{size}", "Content-Length": "0"}), data=b"")
    if s in (200, 201):
        return size, json.loads(b)
    if s == 308:
        rng = h.get("range")
        return (int(rng.split("-")[1]) + 1 if rng else 0), None
    return -1, None


def upload_file(d: str, m: dict) -> dict:
    path = rel(m["video"])
    size = os.path.getsize(path)
    uri = None
    if os.path.exists(session_file(d)):
        ss = json.load(open(session_file(d)))
        if ss.get("size") == size and time.time() - ss.get("t", 0) < 6 * 86400:
            uri = ss["uri"]
            print("resuming the saved upload session")
    if not uri:
        uri = start_session(d, m, size)
    off, done = probe(uri, size)
    if off < 0:
        uri = start_session(d, m, size)
        off, done = 0, None
    t0, sent0, fails = time.time(), off, 0
    with open(path, "rb") as f:
        while done is None:
            f.seek(off)
            buf = f.read(CHUNK)
            end = off + len(buf) - 1
            try:
                s, h, b = http("PUT", uri, data=buf, timeout=600,
                               headers=auth_h({"Content-Range": f"bytes {off}-{end}/{size}",
                                               "Content-Length": str(len(buf))}))
            except OSError as e:  # network hiccup: ask the server where we are and continue
                s, h, b = -1, {}, str(e).encode()
            if s in (200, 201):
                done = json.loads(b)
            elif s == 308:
                rng = h.get("range")
                off = int(rng.split("-")[1]) + 1 if rng else 0
                rate = (off - sent0) / max(time.time() - t0, 0.1) / 1e6
                print(f"{off / size * 100:5.1f}%  {rate:.1f} MB/s", flush=True)
                fails = 0
            elif s == -1 or s >= 500:
                fails += 1
                print(f"chunk failed ({s}), retry {fails}/8", flush=True)
                if fails > 8:
                    die("upload interrupted - run the same command again to resume", 4)
                time.sleep(min(2 ** fails, 60))
                off, done = probe(uri, size)
                if off < 0:
                    off = 0
            else:
                die(explain(s, b, "videos.insert (upload)"))
    os.remove(session_file(d))
    return done


def do_captions(m: dict, vid: str) -> str:
    if not m.get("captions"):
        return "skipped (no captions in youtube.json)"
    lang = m.get("language", "en")
    d = api("GET", "captions", "captions.list", {"part": "snippet", "videoId": vid})
    for it in d.get("items", []):
        if it["snippet"].get("language") == lang and it["snippet"].get("trackKind") == "standard":
            return "already present"
    meta = json.dumps({"snippet": {"videoId": vid, "language": lang, "name": m.get("captions_name", "English"),
                                   "isDraft": False}})
    bnd = "create_caption_boundary"
    payload = (f"--{bnd}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n{meta}\r\n"
               f"--{bnd}\r\nContent-Type: application/octet-stream\r\n\r\n").encode() + \
        open(rel(m["captions"]), "rb").read() + f"\r\n--{bnd}--\r\n".encode()
    s, _, b = http("POST", f"{UP}/captions", {"uploadType": "multipart", "part": "snippet"}, data=payload,
                   headers=auth_h({"Content-Type": f"multipart/related; boundary={bnd}"}), timeout=180)
    return "ok" if s < 300 else explain(s, b, "captions.insert")


def do_thumbnail(m: dict, vid: str) -> str:
    if not m.get("thumbnail"):
        return "skipped (no thumbnail in youtube.json)"
    p = rel(m["thumbnail"])
    ctype = "image/png" if p.lower().endswith(".png") else "image/jpeg"
    s, _, b = http("POST", f"{UP}/thumbnails/set", {"videoId": vid, "uploadType": "media"},
                   data=open(p, "rb").read(), headers=auth_h({"Content-Type": ctype}), timeout=180)
    return "ok" if s < 300 else explain(s, b, "thumbnails.set")


def do_playlist(m: dict, vid: str) -> str:
    pl = m.get("playlist_id")
    if not pl:
        return "skipped"
    s, _, b = http("POST", f"{API}/playlistItems", {"part": "snippet"},
                   data=json.dumps({"snippet": {"playlistId": pl, "resourceId": {"kind": "youtube#video",
                                                                                 "videoId": vid}}}).encode(),
                   headers=auth_h({"Content-Type": "application/json"}))
    return "ok" if s < 300 else explain(s, b, "playlistItems.insert")


def video_state(vid: str) -> dict:
    d = api("GET", "videos", "videos.list", {"part": "status,processingDetails,snippet", "id": vid})
    if not d.get("items"):
        return {"error": "video not found (deleted, or not visible to this account)"}
    it = d["items"][0]
    return {"title": it["snippet"]["title"], "channel": it["snippet"]["channelTitle"], "status": it["status"],
            "processing": it.get("processingDetails", {}).get("processingStatus")}


def cmd_upload(a) -> None:
    d, m = load_film(a.film)
    if a.privacy:
        m["privacy"] = a.privacy
    errs = validate(m)
    if errs:
        die("youtube.json problems:\n  - " + "\n  - ".join(errs), 5)
    require_channel(m, a.any_channel)
    pub = read_published(d)
    vid = pub.get("video_id") or find_existing(m)
    if a.dry_run:
        print(json.dumps(video_body(m), indent=1, ensure_ascii=False))
        print(f"\nDRY RUN OK - video {os.path.getsize(rel(m['video'])) / 1e6:.0f} MB"
              + (f" | ALREADY PUBLISHED as {vid} (upload would be skipped)" if vid else " | ready to upload"))
        return
    if vid and not a.force:
        print(f"already on the channel: https://youtu.be/{vid} - skipping the upload (use --force to upload again)")
    else:
        done = upload_file(d, m)
        vid = done["id"]
        print("uploaded:", f"https://youtu.be/{vid}", "| status:", done.get("status"))
    pub.update({"video_id": vid, "url": f"https://youtu.be/{vid}", "channel_id": m["channel_id"],
                "title": m["title"]})
    pub.setdefault("published_at", time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()))
    write_published(d, pub)  # written before the extras, so a crash never causes a second upload
    pub["captions"] = do_captions(m, vid)
    print("captions:", pub["captions"])
    pub["thumbnail"] = do_thumbnail(m, vid)
    print("thumbnail:", pub["thumbnail"])
    pl = do_playlist(m, vid)
    if pl != "skipped":
        pub["playlist"] = pl
        print("playlist:", pl)
    stt = video_state(vid)
    pub["privacy"] = stt.get("status", {}).get("privacyStatus")
    for k in ("captions", "thumbnail", "playlist"):
        if isinstance(pub.get(k), str) and "FAILED" in pub[k]:  # keep the hint, drop the raw error body
            pub[k] = "FAILED - " + (pub[k].split("HINT: ", 1)[1] if "HINT: " in pub[k] else pub[k].split(":", 1)[0])
    write_published(d, pub)
    print(json.dumps(stt, indent=1, ensure_ascii=False))
    print(f"\nDONE: https://youtu.be/{vid}  -> commit {os.path.relpath(published_path(d), ROOT)}")


def need_vid(d: str) -> str:
    vid = read_published(d).get("video_id")
    if not vid:
        die("No published.json with video_id for this film - upload it first.", 5)
    return vid


def cmd_status(a) -> None:
    d, m = load_film(a.film)
    vid = need_vid(d)
    stt = video_state(vid)
    caps = api("GET", "captions", "captions.list", {"part": "snippet", "videoId": vid})
    stt["captions"] = [(c["snippet"]["language"], c["snippet"]["name"], c["snippet"].get("status"))
                       for c in caps.get("items", [])]
    print(f"https://youtu.be/{vid}")
    print(json.dumps(stt, indent=1, ensure_ascii=False))


def cmd_thumbnail(a) -> None:
    d, m = load_film(a.film)
    vid = need_vid(d)
    res = do_thumbnail(m, vid)
    print("thumbnail:", res)
    if res == "ok":
        pub = read_published(d)
        pub["thumbnail"] = "ok"
        write_published(d, pub)


def cmd_captions(a) -> None:
    d, m = load_film(a.film)
    vid = need_vid(d)
    res = do_captions(m, vid)
    print("captions:", res)
    if res in ("ok", "already present"):
        pub = read_published(d)
        pub["captions"] = "ok"
        write_published(d, pub)


def cmd_set(a) -> None:
    d, m = load_film(a.film)
    vid = need_vid(d)
    cur = api("GET", "videos", "videos.list", {"part": "status", "id": vid})["items"][0]["status"]
    st = {k: cur[k] for k in ("privacyStatus", "embeddable", "license", "publicStatsViewable") if k in cur}
    if a.privacy:
        st["privacyStatus"] = a.privacy
    if a.kids:
        st["selfDeclaredMadeForKids"] = a.kids == "yes"
    if a.ai:
        st["containsSyntheticMedia"] = a.ai == "yes"
    out = api("PUT", "videos", "videos.update", {"part": "status"}, {"id": vid, "status": st})
    print("updated status:", out.get("status"))


def main() -> None:
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = p.add_subparsers(dest="cmd", required=True)
    s = sub.add_parser("auth", help="print the consent link, or exchange the pasted redirect URL")
    s.add_argument("url", nargs="?")
    s.set_defaults(fn=cmd_auth)
    sub.add_parser("whoami", help="channels the token can publish to").set_defaults(fn=cmd_whoami)
    s = sub.add_parser("upload", help="upload films/<slug> per its youtube.json")
    s.add_argument("film")
    s.add_argument("--dry-run", action="store_true")
    s.add_argument("--privacy", choices=["public", "unlisted", "private"])
    s.add_argument("--force", action="store_true", help="upload even if the title is already on the channel")
    s.add_argument("--any-channel", action="store_true", help="skip the channel_id safety check")
    s.set_defaults(fn=cmd_upload)
    for name, fn in (("status", cmd_status), ("thumbnail", cmd_thumbnail), ("captions", cmd_captions)):
        s = sub.add_parser(name)
        s.add_argument("film")
        s.set_defaults(fn=fn)
    s = sub.add_parser("set", help="update privacy / made-for-kids / synthetic-media on the published video")
    s.add_argument("film")
    s.add_argument("--privacy", choices=["public", "unlisted", "private"])
    s.add_argument("--kids", choices=["yes", "no"])
    s.add_argument("--ai", choices=["yes", "no"])
    s.set_defaults(fn=cmd_set)
    a = p.parse_args()
    a.fn(a)


if __name__ == "__main__":
    main()
