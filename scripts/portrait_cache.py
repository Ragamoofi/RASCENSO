#!/usr/bin/env python3
"""Preserve verified Wikimedia portrait images between ephemeral GitHub Pages builds."""
import html
import json
import shutil
import sys
from pathlib import Path

mode=sys.argv[1]
site=Path(sys.argv[2]); target=Path(sys.argv[3]); assets=site/'assets'
status_file=assets/'portrait-status.json'; catalog_file=assets/'portrait-catalog.json'; media_file=assets/'media12.json'


def slug(name):
 import unicodedata,re
 return re.sub(r'[^a-z0-9]+','-',unicodedata.normalize('NFD',name).encode('ascii','ignore').decode().lower()).strip('-')


def load(path):
 try:return json.loads(path.read_text(encoding='utf-8'))
 except (OSError,ValueError):return {}


def save(path,data):path.write_text(json.dumps(data,ensure_ascii=False,indent=2),encoding='utf-8')

if mode=='export':
 report=load(status_file);target.mkdir(parents=True,exist_ok=True)
 for f in ['portrait-status.json','portrait-catalog.json','portrait-debug.json']:
  src=assets/f
  if src.exists():shutil.copy2(src,target/f)
 portraits=target/'portraits';portraits.mkdir(exist_ok=True)
 count=0
 for name,credit in report.get('sources',{}).items():
  if not credit:continue
  src=assets/'portraits'/(slug(name)+'.png')
  if src.exists() and src.stat().st_size>=4500:
   shutil.copy2(src,portraits/src.name);count+=1
 print('PORTRAIT-CACHE EXPORT:',count,flush=True)
elif mode=='import':
 old=load(target/'portrait-status.json')
 new=load(status_file);media=load(media_file);cat=load(catalog_file)
 oldcat=load(target/'portrait-catalog.json')
 sources=new.get('sources',{})
 existing={(c.get('kind'),c.get('name')) for c in media.get('credits',[])}
 count=0
 for name,credit in old.get('sources',{}).items():
  if not credit or sources.get(name):continue
  src=target/'portraits'/(slug(name)+'.png')
  if not src.exists() or src.stat().st_size<4500:continue
  shutil.copy2(src,assets/'portraits'/src.name)
  sources[name]=credit
  if ('portrait',name) not in existing:media.setdefault('credits',[]).append(credit)
  if name in oldcat:cat[name]=oldcat[name]
  count+=1
 total=new.get('total',78)
 new['real_photographs']=sum(1 for x in sources.values() if x)
 new['missing']=[n for n,x in sources.items() if not x]
 media.setdefault('summary',{})['portraits']=new['real_photographs']
 save(status_file,new);save(media_file,media);save(catalog_file,cat)
 if count:
  credits=assets/'MEDIA_CREDITS.html'
  page=credits.read_text(encoding='utf-8')
  for name in sources:
   if name not in old.get('sources',{}) or name in new.get('missing',[]):continue
   credit=old['sources'][name]
   if not credit:continue
   if '>'+html.escape(name)+'</b>' in page:continue
   line='<li><b>'+html.escape(name)+'</b> · portrait — '+html.escape(credit.get('artist',''))+' ('+html.escape(credit.get('license',''))+') · <a href="'+html.escape(credit.get('source',''))+'" target="_blank" rel="noopener">Archivo y licencia</a></li>'
   page=page.replace('</ul>',line+'</ul>')
  credits.write_text(page,encoding='utf-8')
 print(f'PORTRAIT-CACHE IMPORT: {count} restored; total {new["real_photographs"]}/{total}',flush=True)
else:raise SystemExit('Usage: portrait_cache.py import|export SITE DIR')