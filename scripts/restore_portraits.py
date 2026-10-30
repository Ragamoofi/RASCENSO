#!/usr/bin/env python3
"""Resolve and cache real, freely reusable footballer photographs for the 78 ADN cards.

Preserves authors, file URLs and licenses, and reports any unresolved people instead
of silently presenting decorative artwork as a photograph. Called during Pages build
AFTER build_media12.py, which supplies a first pass via Wikipedia pageimages.
"""
import html
import io
import json
import re
import sys
import time
import urllib.parse
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

from PIL import Image
import build_media12 as base

ROOT = Path(sys.argv[1] if len(sys.argv)>1 else '_site')
DIR = ROOT / 'assets'
PORTRAITS = DIR / 'portraits'
PORTRAITS.mkdir(parents=True, exist_ok=True)
NAMES = list(dict.fromkeys(base.NAMES))
FILE_CACHE = {}
# Pinned Commons photographs verified by title/description, then checked for a free license on the build.
PINNED = {
    'Marta': 'Marta, 2023.jpg',
    'Paolo Maldini': 'Paolo Maldini.jpg',
    'Sergio Ramos': 'SergioRamos.jpg',
    'Kaká': 'Kaká Postgame In Houston, March 2015 (cropped).jpg',
    'Mia Hamm': 'Mia Hamm 2010 cropped.jpg',
    'Diego Maradona': 'DiegoMaradona.jpg',
    'Andrea Pirlo': 'AndreaPirlo.jpg',
    'Alexis Sánchez': 'Alexis Sánchez.jpg',
    'Virgil van Dijk': 'Virgil van Dijk 2019.jpg',
    'Federico Valverde': 'Federico Valverde Real Madrid 2018.jpg',
    'Claudio Bravo': 'Claudio Bravo headshot.jpg',
    'Ederson': 'Ederson 2019.jpg',
    'Paulo Díaz': 'Paulo Díaz (cropped).jpg',
    'Marcelino Núñez': 'Marcelino Nunez.png',
    'Erick Pulgar': 'ErickPulgar.png',
    'Charles Aránguiz': 'Charles Aránguiz en la Copa Mundial de Fútbol de 2014.JPG',
    'Ángel Correa': 'Ángel Correa.jpg',
    'Giorgian de Arrascaeta': 'Giorgian De Arrascaeta 20171114 AUT URU 4546 (cropped).jpg',
    'Richarlison': 'Richarlison Copa do Mundo 2022 (cropped).jpg',
    'Raphinha': 'Raphinha.jpg',
    'Kaoru Mitoma': 'Kaoru Mitoma.jpg',
    'Santiago Giménez': 'Santiago Giménez profile picture.jpg',
    'Emiliano Martínez': 'Dibu Martínez - ARG v CAN - 2024-07-09 (cropped).jpg',
    'Youssouf Fofana': 'Youssouf Fofana (footballer, born 1999) (cropped).jpg',
}


def wiki_people():
    """Resolve exact enwiki page to Wikidata QID; redirects are handled by MediaWiki."""
    result = {}
    for group in base.chunks(list(dict.fromkeys(base.OVERRIDE.get(n, n) for n in NAMES)), 20):
        res = base.api('en.wikipedia.org', {
            'action':'query','format':'json','redirects':1,
            'prop':'pageprops|pageimages','ppprop':'wikibase_item','piprop':'name',
            'titles':'|'.join(group)
        }) or {}
        data = res.get('query', {})
        aliases = {e['from']:e['to'] for e in data.get('normalized',[]) + data.get('redirects',[]) if 'from' in e}
        pages = {v.get('title'):v for v in data.get('pages',{}).values()}
        for name in NAMES:
            title = base.OVERRIDE.get(name,name)
            if title not in group: continue
            for _ in range(10):
                if title not in aliases:break
                title = aliases[title]
            page = pages.get(title) or next((p for k,p in pages.items() if base.slug(k)==base.slug(title)),None)
            if page:
                result[name] = (page.get('pageprops',{}).get('wikibase_item'),page.get('pageimage'))
    return result


def wikidata_photos(people):
    result = {}
    qids = {n:x[0] for n,x in people.items() if x[0]}
    for group in base.chunks(list(dict.fromkeys(qids.values())), 40):
        res = base.api('www.wikidata.org', {
            'action':'wbgetentities', 'format':'json', 'ids':'|'.join(group), 'props':'claims'
        }) or {}
        for name,qid in qids.items():
            obj=res.get('entities',{}).get(qid,{})
            claims=obj.get('claims',{}).get('P18',[])
            for item in claims:
                value=item.get('mainsnak',{}).get('datavalue',{}).get('value')
                if isinstance(value,str) and re.search(r'\.(jpg|jpeg|png|webp)$',value,re.I):
                    result[name]=value;break
    return result


def commons_candidates(name):
    """Optional last resort: filename must identify the footballer, not just a club."""
    words=[w for w in base.slug(name).split('-') if len(w)>=3]
    if len(words)<2:return []
    data=base.api('commons.wikimedia.org',{
       'action':'query','format':'json','generator':'search',
       'gsrnamespace':6,'gsrsearch':'"'+name+'" filetype:bitmap',
       'gsrlimit':20,'prop':'imageinfo','iiprop':'url|extmetadata|size','iiurlwidth':520
    }) or {}
    out=[]
    for item in data.get('query',{}).get('pages',{}).values():
        filename=item.get('title','').removeprefix('File:')
        slug=base.slug(filename)
        # Avoid portraits of namesakes: require first AND last name (or distinctive two-part phrase).
        if len(words)>=2 and words[0] not in slug:continue
        if words[-1] not in slug:continue
        i=(item.get('imageinfo') or [{}])[0]
        if base.legal(i):
            score=sum(w in slug for w in words)+int('portrait' in slug or 'crop' in slug)
            out.append((score,filename,i))
    return sorted(out,reverse=True)


def media_metadata(filenames):
    missing=[f for f in filenames if f and base.filename_key(f) not in FILE_CACHE]
    if missing:
        FILE_CACHE.update(base.commons_metadata(missing))
    return {f:FILE_CACHE.get(base.filename_key(f)) for f in filenames if f}


def download_one(name,meta,filename):
    path=PORTRAITS/(base.slug(name)+'.png')
    for url in [meta.get('thumburl'),meta.get('url')]:
        if not url or not url.startswith('https://upload.wikimedia.org/'): continue
        for delay in [0,1,2.5]:
            if delay:time.sleep(delay)
            raw=base.req(url,binary=True)
            if not raw:continue
            try:
                base.normalized_image(raw,'portrait').save(path,'PNG',optimize=True)
                if path.stat().st_size>4500:return True
            except (OSError,ValueError):pass
    return False


def main():
    info_path=DIR/'media12.json'
    cat_path=DIR/'portrait-catalog.json'
    media=json.loads(info_path.read_text())
    catalog=json.loads(cat_path.read_text())
    licensed={c['name'] for c in media.get('credits',[]) if c.get('kind')=='portrait'}
    missing=[n for n in NAMES if n not in licensed]
    print(f'RESTORE-PORTRAITS initial={len(licensed)}/{len(NAMES)} missing={len(missing)}',flush=True)
    people=wiki_people()
    qid_photos=wikidata_photos(people)
    candidates={}
    for name in missing:
        p=people.get(name)
        options=[qid_photos.get(name),p[1] if p else None]
        candidates[name]=[x for x in dict.fromkeys(options) if x]
    all_files=[x for values in candidates.values() for x in values]
    meta=media_metadata(all_files)
    chosen={}
    for name in missing:
        for filename in candidates[name]:
            item=meta.get(filename)
            if item and base.legal(item) and (item.get('thumburl') or item.get('url')):
                chosen[name]=(filename,item);break
    pinned_info=media_metadata([PINNED[name] for name in missing if name in PINNED])
    for name in missing:
        if name not in PINNED:continue
        filename=PINNED[name]
        info=pinned_info.get(filename)
        if info and base.legal(info) and (info.get('thumburl') or info.get('url')):
            chosen[name]=(filename,info)
    # MediaWiki search is used ONLY when both Wikidata P18 and enwiki picture failed.
    for i,name in enumerate(missing):
        if name in chosen:continue
        alternatives=commons_candidates(name)
        if alternatives:
            _,fn,m=alternatives[0]
            chosen[name]=(fn,m)
        if i%8==0:print(f'RESTORE-PORTRAITS search={i+1}/{len(missing)} sources={len(chosen)}',flush=True)
    def do(item):
        n,(fn,m)=item
        return n,fn,m,download_one(n,m,fn)
    new=[]
    with ThreadPoolExecutor(max_workers=4) as pool:
        for name,filename,m,ok in pool.map(do,chosen.items()):
            if ok:
                licensed.add(name)
                credit={'kind':'portrait','name':name,**base.credits(m,filename)}
                new.append(credit)
                url=m.get('thumburl') or m.get('url')
                catalog[name]={'url':url,**base.credits(m,filename)}
    media['credits'].extend(new)
    media['summary']['portraits']=len(licensed)
    media['summary']['licensedPortraitSources']=len(catalog)
    cat_path.write_text(json.dumps(catalog,ensure_ascii=False,indent=2),encoding='utf-8')
    info_path.write_text(json.dumps(media,ensure_ascii=False,indent=2),encoding='utf-8')
    # Report both resolved images and missing photos. The baseline build may have generated decorative fallbacks.
    missing_final=[n for n in NAMES if n not in licensed]
    report={'total':len(NAMES),'real_photographs':len(licensed),'missing':missing_final,'sources':{
        n:next((x for x in media['credits'] if x.get('kind')=='portrait' and x.get('name')==n),None)
        for n in NAMES}}
    (DIR/'portrait-status.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
    credits=DIR/'MEDIA_CREDITS.html'
    page=credits.read_text(encoding='utf-8')
    lines=[]
    for c in new:
        lines.append('<li><b>'+html.escape(c['name'])+'</b> · portrait — '+html.escape(c['artist'])+
                     ' ('+html.escape(c['license'])+') · <a href="'+html.escape(c['source'])+
                     '" target="_blank" rel="noopener">Archivo y licencia</a></li>')
    credits.write_text(page.replace('</ul>', '\n'.join(lines)+'</ul>'),encoding='utf-8')
    print(f'RESTORE-PORTRAITS FINAL {len(licensed)}/{len(NAMES)} photos, added={len(new)}',flush=True)
    if missing_final:print('RESTORE-PORTRAITS STILL MISSING: '+', '.join(missing_final),flush=True)

if __name__=='__main__':main()