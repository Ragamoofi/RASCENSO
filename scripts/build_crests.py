"""Build PNG club badges for the published RASCENSO site.

Known matches are rasterized from referenced SVGs. Everything else gets an
original, clearly generic PNG placeholder. No guessing which real crest matches.
The JSON catalog comes from src/countries.mjs via scripts/export-clubs.mjs.
"""
from __future__ import annotations
import concurrent.futures as futures
import hashlib
import difflib
import io
import json
import re
import sys
import unicodedata
import urllib.parse
import urllib.request
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
OUT = Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT / '_site' / 'assets' / 'crests'
OFFLINE = '--offline' in sys.argv
OUT.mkdir(parents=True, exist_ok=True)
CATALOG = ROOT / 'clubs-export.json'
CLUBS = json.loads(CATALOG.read_text(encoding='utf8'))
INDEX = {}
for part in range(1, 5):
    p = ROOT / 'assets' / f'logos-{part}.json'
    INDEX.update(json.loads(p.read_text(encoding='utf8')))
DIRS = {'AR':'argentina','BO':'bolivia','BR':'brazil','CL':'chile','CO':'colombia','EC':'ecuador','PY':'paraguay','PE':'peru','UY':'uruguay','VE':'venezuela','MX':'mexico','CN':'china','US':'usa','CR':'costa-rica','ES':'spain','EN':'england','DE':'germany','IT':'italy','FR':'france','PT':'portugal','NL':'netherlands','BE':'belgium','TR':'turkey','HR':'croatia','CH':'switzerland','AT':'austria','SC':'scotland','GR':'greece','RS':'serbia','CZ':'czech-republic','PL':'poland','UA':'ukraine','SE':'sweden','NO':'norway','DK':'denmark','JP':'japan','KR':'south-korea','AU':'australia','SA':'saudi-arabia','QA':'qatar','IR':'iran','MA':'morocco','EG':'egypt','SN':'senegal','NG':'nigeria','DZ':'algeria','GH':'ghana','CM':'cameroon','TN':'tunisia'}
ALIASES = {
('CL','Deportes La Serena'):'La_Serena.svg', ('CL','Colo-Colo'):'Colo_Colo.svg', ('CL','Colo-Colo B'):None,
('CL','Ñublense'):'Ñublense.svg',('CL','Universidad Católica'):'Universidad_Católica.svg',('CL','Unión La Calera'):'Unión_La_Calera.svg',
('CL','O\'Higgins'):"O'Higgins.svg", ('AR','Argentinos Juniors'):'Argeninos_Juniors.svg',
('AR','Huracán'):'CA_Huracán.svg',('AR','Belgrano de Córdoba'):'Belgrano.svg',
('BR','América Mineiro'):'América_Mineiro.svg',('BR','Atlético Mineiro'):'Atlético_Mineiro.svg',
('BR','Athletico Paranaense'):'Athletico_Paranaense.svg',('EN','Tottenham Hotspur'):'Tottenham_Hotspur.svg'
}

def norm(text: str) -> str:
    text = unicodedata.normalize('NFKD', text)
    return re.sub(r'[^a-z0-9]', '', ''.join(c for c in text if not unicodedata.combining(c)).lower())


def select_file(code: str, name: str) -> str | None:
    names=INDEX.get(code,[])
    explicit=ALIASES.get((code,name),'NOT_SET')
    if explicit is None: return None
    if explicit!='NOT_SET' and explicit in names: return explicit
    matches=[f for f in names if norm(f.removesuffix('.svg'))==norm(name)]
    if len(matches)==1: return matches[0]
    # Variantes menores de escritura entre el catálogo y los nombres de archivo.
    # Exigir similitud alta y coincidencia ÚNICA; nunca adivinar entre varios clubes.
    # Las filiales no heredan el escudo del primer equipo.
    if re.search(r'\b(?:B|II|U20|U21|U23)\b',name,re.IGNORECASE):return None
    key=norm(name)
    if len(key)<7:return None
    rank=sorted(((difflib.SequenceMatcher(None,key,norm(f.removesuffix('.svg'))).ratio(),f) for f in names),reverse=True)
    if rank and rank[0][0]>=.94 and (len(rank)==1 or rank[0][0]-rank[1][0]>=.08):return rank[0][1]
    return None


def fallback(club: dict):
    seed=int(hashlib.sha1(club['id'].encode()).hexdigest()[:8],16)
    palette=[('#24476B','#7AC4EC'),('#53395B','#DEACD8'),('#30575D','#88C3B4'),('#674A3B','#F4C3A0'),('#374968','#A5BBF2')]
    bg,highlight=palette[seed%len(palette)]
    im=Image.new('RGBA',(112,112),(0,0,0,0)); d=ImageDraw.Draw(im)
    d.polygon([(56,5),(101,22),(96,70),(80,91),(56,108),(32,91),(16,70),(11,22)], fill=bg, outline=highlight, width=4)
    d.polygon([(56,14),(91,27),(87,68),(74,84),(56,98),(38,84),(25,68),(21,27)], outline=highlight,width=2)
    tokens=[x for x in re.split(r'\s+',club['name']) if x.lower() not in {'de','da','del','la','el','fc','club','ac','do'}]
    letters=''.join(t[0] for t in tokens[:2]).upper()[:2] or 'FC'
    try: font=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',33)
    except OSError:font=ImageFont.load_default()
    bb=d.textbbox((0,0),letters,font=font)
    d.text(((112-(bb[2]-bb[0]))/2,46-(bb[3]-bb[1])/2),letters,font=font,fill='#FFFFFF')
    d.line([(41,78),(71,78)],fill=highlight,width=3)
    return im


def render_logo(svg: bytes):
    import cairosvg
    raster=cairosvg.svg2png(bytestring=svg,output_width=104,output_height=104)
    icon=Image.open(io.BytesIO(raster)).convert('RGBA')
    im=Image.new('RGBA',(112,112),(0,0,0,0));im.alpha_composite(icon,(4,4))
    return im


def process(item: dict):
    club=item['club'];code=item['country']; name=club['name']; cid=club['id']
    selected=select_file(code,name)
    matched=False
    if selected and not OFFLINE:
        source=f'https://raw.githubusercontent.com/JoseArroyave/football-logos/main/logos/{DIRS[code]}/{urllib.parse.quote(selected)}'
        try:
            req=urllib.request.Request(source,headers={'User-Agent':'RASCENSO/0.5 (independent football career demo)'})
            with urllib.request.urlopen(req,timeout=9) as resp: raw=resp.read(350_000)
            if b'<svg' in raw[:500] or b'<svg' in raw:
                picture=render_logo(raw)
                matched=True
        except Exception: pass
    if not matched:picture=fallback(club)
    path=OUT / f'{cid}.png'
    picture.save(path,format='PNG',optimize=True)
    return {'id':cid,'name':name,'country':code,'kind':'reference-crest' if matched else 'original-placeholder',
            'source':f'JoseArroyave/football-logos/{DIRS[code]}/{selected}' if matched else None}

with futures.ThreadPoolExecutor(max_workers=16 if not OFFLINE else 6) as pool:
    results=list(pool.map(process,CLUBS))
manifest={'total':len(results),'referenceCrests':sum(x['kind']=='reference-crest' for x in results),
          'originalPlaceholders':sum(x['kind']=='original-placeholder' for x in results),
          'logos':results}
(OUT.parent/'crest-manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf8')
print('Clubes:',manifest['total'],'Escudos de referencia:',manifest['referenceCrests'],'Provisionales:',manifest['originalPlaceholders'])
if manifest['total']<800:sys.exit('El catálogo generado está incompleto')
