"""Generate transparent PNG crests for every RASCENSO team at deployment.
Exact SVG matches are rendered; missing images use ORIGINAL generic shields.
Club names and trademarks belong to their respective owners.
"""
import concurrent.futures
import hashlib
import io
import json
import re
import sys
import unicodedata
import urllib.parse
import urllib.request
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import cairosvg

root = Path(__file__).resolve().parent.parent
target = root / "_site/assets/crests"
target.mkdir(parents=True, exist_ok=True)
clubs = json.loads((root / "clubs-export.json").read_text(encoding="utf-8"))
available = {}
for i in range(1, 5):
    available.update(json.loads((root / f"assets/logos-{i}.json").read_text(encoding="utf-8")))
country_dirs = dict(zip(
    "AR BO BR CL CO EC PY PE UY VE MX CN US CR ES EN DE IT FR PT NL BE TR HR CH AT SC GR RS CZ PL UA SE NO DK JP KR AU SA QA IR MA EG SN NG DZ GH CM TN".split(),
    "argentina bolivia brazil chile colombia ecuador paraguay peru uruguay venezuela mexico china usa costa-rica spain england germany italy france portugal netherlands belgium turkey croatia switzerland austria scotland greece serbia czech-republic poland ukraine sweden norway denmark japan south-korea australia saudi-arabia qatar iran morocco egypt senegal nigeria algeria ghana cameroon tunisia".split()
))
aliases = {
    ("CL", "Deportes La Serena"): "La_Serena.svg",
    ("CL", "Colo-Colo"): "Colo_Colo.svg",
    ("CL", "Colo-Colo B"): None,
    ("AR", "Argentinos Juniors"): "Argeninos_Juniors.svg",
    ("AR", "Huracán"): "CA_Huracán.svg",
    ("AR", "Belgrano de Córdoba"): "Belgrano.svg",
    ("BR", "América Mineiro"): "América_Mineiro.svg",
    ("BR", "Atlético Mineiro"): "Atlético_Mineiro.svg",
    ("EN", "Tottenham Hotspur"): "Tottenham_Hotspur.svg"
}
def compact(s):
    s = unicodedata.normalize("NFKD", s.lower())
    return re.sub("[^a-z0-9]", "", "".join(x for x in s if not unicodedata.combining(x)))
def find_logo(code, name):
    files = available.get(code, [])
    forced = aliases.get((code, name), "unknown")
    if forced is None:
        return None
    if forced != "unknown" and forced in files:
        return forced
    found = [f for f in files if compact(f.removesuffix(".svg")) == compact(name)]
    return found[0] if len(found) == 1 else None
def placeholder(item):
    club = item["club"]
    digest = int(hashlib.sha256(club["id"].encode()).hexdigest()[:8], 16)
    palettes = [("#23466E", "#91CEFC"), ("#57415D", "#E1ADE3"), ("#365B5B", "#9AE0D0"), ("#694A3C", "#F7C99C")]
    dark, light = palettes[digest % len(palettes)]
    canvas = Image.new("RGBA", (112, 112), (0, 0, 0, 0))
    draw = ImageDraw.Draw(canvas)
    shape = [(56, 4), (103, 20), (98, 68), (83, 90), (56, 108), (29, 90), (14, 68), (9, 20)]
    draw.polygon(shape, fill=dark, outline=light, width=4)
    draw.polygon([(56, 14), (92, 28), (87, 67), (56, 97), (25, 67), (20, 28)], outline=light, width=2)
    words = [w for w in club["name"].split() if w.lower() not in {"de", "la", "el", "del", "do", "da", "fc", "club"}]
    initials = "".join(word[0] for word in words[:2]).upper() or "FC"
    try:
        font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 31)
    except OSError:
        font = ImageFont.load_default()
    bbox = draw.textbbox((0, 0), initials, font=font)
    draw.text(((112 - (bbox[2]-bbox[0])) / 2, 42), initials, font=font, fill="#FFFFFF")
    draw.line([(40, 80), (72, 80)], fill=light, width=3)
    return canvas
def render(item):
    club, code = item["club"], item["country"]
    selected = find_logo(code, club["name"])
    picture = None
    if selected:
        url = "https://raw.githubusercontent.com/JoseArroyave/football-logos/main/logos/" + country_dirs[code] + "/" + urllib.parse.quote(selected)
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "RASCENSO-Club-Crests/0.5"})
            with urllib.request.urlopen(req, timeout=8) as response:
                svg = response.read(350000)
            if b"<svg" in svg:
                png = cairosvg.svg2png(bytestring=svg, output_width=104, output_height=104)
                icon = Image.open(io.BytesIO(png)).convert("RGBA")
                picture = Image.new("RGBA", (112, 112), (0, 0, 0, 0))
                picture.alpha_composite(icon, (4, 4))
        except Exception:
            picture = None
    official_reference = picture is not None
    if not official_reference:
        picture = placeholder(item)
    picture.save(target / (club["id"] + ".png"), format="PNG", optimize=True)
    return {"id": club["id"], "type": "reference" if official_reference else "original-placeholder", "source": selected if official_reference else None}
with concurrent.futures.ThreadPoolExecutor(max_workers=16) as pool:
    outcomes = list(pool.map(render, clubs))
manifest = {"total": len(outcomes), "reference": sum(x["type"] == "reference" for x in outcomes), "provisional": sum(x["type"] != "reference" for x in outcomes), "logos": outcomes}
(target.parent / "crest-manifest.json").write_text(json.dumps(manifest, ensure_ascii=False), encoding="utf-8")
print("Escudos PNG:", manifest["total"], "referencias:", manifest["reference"], "provisionales:", manifest["provisional"])
if manifest["total"] != len(clubs) or manifest["total"] < 800:
    sys.exit("Faltan escudos PNG en la publicacion")
