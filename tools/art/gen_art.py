#!/usr/bin/env python3
"""Generate whiteboard illustrations from art.json (one image per element, shared STYLE, + the photo hand).

    python tools/art/gen_art.py art.json proj/assets [el1 el2 ...]     # needs OPENAI_API_KEY (gpt-image-1)
art.json = {"style": "...", "elements": {"el1": {"size": "1536x1024", "prompt": "..."}}, "hand": "...prompt..."}
Sizes: 1536x1024 (wide), 1024x1024, 1024x1536 (tall). The hand is generated with a transparent background.
Then: python tools/art/art_meta.py proj/assets art_meta.json  and LOOK at every image (contact sheet) before building.
No API key? Any image model works (Flux / SDXL locally, Gemini, Ideogram...) as long as the art is isolated on pure
white with no text — or draw the elements yourself as SVG line art and export PNG. Reuse examples/sky/art/hand.png.
"""
import base64, json, os, sys, urllib.request

def gen(prompt, size, background):
    key = os.environ.get("OPENAI_API_KEY") or sys.exit("set OPENAI_API_KEY (or use another image model, see docstring)")
    body = {"model": os.environ.get("OPENAI_IMAGE_MODEL", "gpt-image-1"), "prompt": prompt, "size": size,
            "background": background, "output_format": "png", "n": 1}
    req = urllib.request.Request("https://api.openai.com/v1/images/generations", data=json.dumps(body).encode(),
                                 headers={"Authorization": f"Bearer {key}", "Content-Type": "application/json"})
    return base64.b64decode(json.load(urllib.request.urlopen(req, timeout=300))["data"][0]["b64_json"])

def main():
    spec, out = json.load(open(sys.argv[1])), sys.argv[2]; only = sys.argv[3:]; os.makedirs(out, exist_ok=True)
    for k, e in spec["elements"].items():
        if only and k not in only: continue
        open(os.path.join(out, f"{k}.png"), "wb").write(gen(e["prompt"] + " " + spec["style"], e.get("size", "1536x1024"), "opaque")); print(k)
    if spec.get("hand") and (not only or "hand" in only):
        open(os.path.join(out, "hand.png"), "wb").write(gen(spec["hand"], "1024x1536", "transparent")); print("hand")

if __name__ == "__main__":
    main()
