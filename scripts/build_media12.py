#!/usr/bin/env python3
"""Build local PNGs from licensed Wikimedia media, with deterministic branded fallbacks.
Cautious: no official-logo scraping and no nonfree player photos. CC author/license
attributions are shipped in the published site's MEDIA_CREDITS.html.
"""
import io,json,re,sys,time,html,unicodedata,urllib.parse,urllib.request
from concurrent.futures import ThreadPoolExecutor,as_completed
from pathlib import Path
from PIL import Image,ImageDraw,ImageFont,ImageOps

ROOT=Path(sys.argv[1] if len(sys.argv)>1 else '_site')
MEDIA=ROOT/'assets'; PORTRAITS=MEDIA/'portraits'; COMP=MEDIA/'competitions'; TROPH=MEDIA/'trophies'
for p in [PORTRAITS,COMP,TROPH]: p.mkdir(parents=True,exist_ok=True)
SRC=Path('src/draft09.mjs').read_text(encoding='utf-8')
# Exact referent data from the game, never a third-party or generated roster.
NAMES=re.findall(r"\['([^']+)',\[",SRC)
OVERRIDE={
 'Ronaldo Nazário':'Ronaldo (Brazilian footballer)', 'Marta':'Marta (footballer)',
 'Claudio Bravo':'Claudio Bravo (footballer)', 'Raphinha':'Raphinha (footballer)',
 'Alexis Sánchez':'Alexis Sánchez', 'Andrés Iniesta':'Andrés Iniesta',
 'Erling Haaland':'Erling Haaland','Kaká':'Kaká',
 'Neymar':'Neymar','Pelé':'Pelé','Son Heung-min':'Son Heung-min',
 'Paulo Díaz':'Paulo Díaz (footballer)','João Palhinha':'João Palhinha',
 'Emiliano Martínez':'Emiliano Martínez (footballer, born 1992)',
 'Santiago Giménez':'Santiago Giménez', 'Julián Álvarez':'Julián Álvarez (footballer)',
 'Luis Suárez':'Luis Suárez','Ángel Correa':'Ángel Correa',
 'Christian Pulisic':'Christian Pulisic','Enzo Fernández':'Enzo Fernández',
 'David Raya':'David Raya','Felipe Loyola':'Felipe Loyola',
 'Darío Osorio':'Darío Osorio','Mia Hamm':'Mia Hamm',
 'Manuel Neuer':'Manuel Neuer','Iker Casillas':'Iker Casillas',
 'Giorgian de Arrascaeta':'Giorgian de Arrascaeta',
 'Marcelino Núñez':'Marcelino Núñez','Lucas Assadi':'Lucas Assadi'
}
LOGOS={
 'CL1':None,'CL2':None,'BR1':'Campeonato Brasileiro Série A logo.svg',
 'BR2':'Campeonato Brasileiro Série B logo (2025).svg','AR1':'Logo Liga Profesional de Fútbol de Argentina.svg',
 'EN1':'Premier League.svg','ES1':'LaLiga logo 2023.svg','DE1':'Bundesliga logo.svg',
 'IT1':'Serie A.svg','FR1':"Ligue 1 McDonald's logo.svg",
 'NL1':'VriendenLoterij Eredivisie Logo.png','PT1':'Liga Portugal Betclic logo.svg','SC1':'Scottish Premiership logo.svg'
}
CUPS={
 'libertadores':'Conmebol Copa Libertadores Trophy45013.png',
 'sudamericana':'CopaSulamericana2002-.png',
 'recopa':'Taça Recopa Sulamericana.jpg',
 'copaamerica':'Copa América de Fútbol.png',
 'champions':'UEFA Champions LeagueTrophy7612.png',
 'worldcup':'FIFA World Cup Trophy photo by Djuradj Vujcic.jpg'
}
USER_AGENT='RASCENSO/1.2 (noncommercial football game; GitHub Ragamoofi/RASCENSO; open media attribution)'

def req(url, binary=False):
 try:
  with urllib.request.urlopen(urllib.request.Request(url,headers={'User-Agent':USER_AGENT,'Accept':'application/json' if not binary else 'image/*'}),timeout=15) as r:
   data=r.read(3_200_000)
   return data if binary else json.loads(data)
 except Exception as exc:
  return None

def api(host,query):
 if __import__('os').environ.get('RASCENSO_MEDIA_OFFLINE')=='1':return None
 return req('https://'+host+'/w/api.php?'+urllib.parse.urlencode(query))

def chunks(seq,n):
 for i in range(0,len(seq),n): yield seq[i:i+n]

def slug(name):
 s=unicodedata.normalize('NFD',name).encode('ascii','ignore').decode().lower()
 return re.sub(r'[^a-z0-9]+','-',s).strip('-')

def font(size):
 for name in ['/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf','/usr/share/fonts/truetype/liberation2/LiberationSans-Bold.ttf']:
  try:return ImageFont.truetype(name,size)
  except OSError:pass
 return ImageFont.load_default()

def fallback(path,label,kind):
 if kind=='portrait':
  im=Image.new('RGBA',(420,520),(24,45,74,255));d=ImageDraw.Draw(im)
  d.ellipse((35,-75,385,310),fill=(37,67,102),outline=(97,128,168),width=3)
  d.ellipse((139,125,279,265),fill=(98,124,148),outline=(161,190,213),width=4)
  d.rounded_rectangle((74,282,348,598),72,fill=(75,100,136),outline=(143,176,210),width=4)
  d.text((210,460),'RETRATO NO DISPONIBLE',anchor='mm',fill=(194,209,225),font=font(13))
 else:
  size=(245,150) if kind=='logo' else (160,210)
  im=Image.new('RGBA',size,(0,0,0,0));d=ImageDraw.Draw(im)
  w,h=size
  d.rounded_rectangle((4,4,w-4,h-4),22,fill=(25,58,99,255),outline=(174,130,92,255),width=3)
  initials=''.join(word[0] for word in label.split(' ') if word and word[0].isalnum())[:4].upper()
  d.text((w/2,h/2),initials or 'R',font=font(37),fill=(235,198,159,255),anchor='mm')
 im.save(path,'PNG',optimize=True)

def get_pagephotos():
 # MediaWiki normaliza y redirige nombres; asociar cada título a su página correcta.
 mapped={}
 for group in chunks(list(dict.fromkeys(OVERRIDE.get(n,n) for n in NAMES)),30):
  q=api('en.wikipedia.org',dict(action='query',format='json',redirects=1,prop='pageimages',piprop='thumbnail|name',pithumbsize=520,titles='|'.join(group)))
  query=(q or {}).get('query',{})
  pages={p.get('title',''):p for p in query.get('pages',{}).values() if p.get('pageimage') and p.get('thumbnail',{}).get('source')}
  aliases={x['from']:x['to'] for x in query.get('normalized',[])+query.get('redirects',[]) if 'from' in x and 'to' in x}
  for name in NAMES:
   source=OVERRIDE.get(name,name)
   if source not in group:continue
   title=source
   for _ in range(6):
    nxt=aliases.get(title)
    if not nxt or nxt==title:break
    title=nxt
   page=pages.get(title)
   if not page:
    candidates=[p for title2,p in pages.items() if slug(title2)==slug(title)]
    if len(candidates)==1:page=candidates[0]
   if page:mapped[name]=page
 return mapped

def filename_key(value):
 return unicodedata.normalize('NFC',urllib.parse.unquote(str(value)).replace('_',' ')).casefold()

def commons_metadata(filenames):
 info={}
 for group in chunks(sorted(set(x for x in filenames if x)),28):
  q=api('commons.wikimedia.org',dict(action='query',format='json',prop='imageinfo',iiprop='url|extmetadata',iiurlwidth=550,titles='|'.join('File:'+n for n in group)))
  for page in (q or {}).get('query',{}).get('pages',{}).values():
   if 'imageinfo' not in page: continue
   name=page['title'].removeprefix('File:')
   info[filename_key(name)]=page['imageinfo'][0]
 return info

def clean(value):return re.sub('<[^>]+>','',html.unescape(str(value or ''))).strip()[:400]

def legal(meta):
 if not meta:return False
 x=clean(meta.get('extmetadata',{}).get('LicenseShortName',{}).get('value','')).lower()
 return bool(re.search(r'cc[ -]?by|cc0|public domain|pd-',x)) and 'noncommercial' not in x

def credits(meta,filename):
 attrs=meta.get('extmetadata',{})
 return dict(file=filename,artist=clean(attrs.get('Artist',{}).get('value','')) or 'Autor identificado en Commons',license=clean(attrs.get('LicenseShortName',{}).get('value','')),source='https://commons.wikimedia.org/wiki/File:'+urllib.parse.quote(filename.replace(' ','_'),safe='():-_.'))

def normalized_image(content,kind):
 im=Image.open(io.BytesIO(content)).convert('RGBA')
 if kind=='portrait':return ImageOps.fit(im,(420,520),Image.Resampling.LANCZOS,centering=(.5,.27))
 if kind=='logo':
  im.thumbnail((225,135),Image.Resampling.LANCZOS)
  canvas=Image.new('RGBA',(245,150),(0,0,0,0));canvas.alpha_composite(im,((245-im.width)//2,(150-im.height)//2));return canvas
 im.thumbnail((145,195),Image.Resampling.LANCZOS)
 canvas=Image.new('RGBA',(160,210),(0,0,0,0));canvas.alpha_composite(im,((160-im.width)//2,(210-im.height)//2));return canvas

def main():
 media=[]; pagephotos=get_pagephotos(); names={n:pagephotos[n]['pageimage'] for n in pagephotos}
 metadata=commons_metadata(list(names.values())+[v for v in LOGOS.values() if v]+list(CUPS.values()))
 print('MEDIA12 indexed',len(NAMES),'candidates',len(names),'licensed assets',len(metadata),flush=True)
 photo_catalog={}
 for name in NAMES:
  filename=names.get(name);meta=metadata.get(filename_key(filename))
  if meta and legal(meta):
   url=meta.get('thumburl') or meta.get('url')
   if url and url.startswith('https://upload.wikimedia.org/'):
    photo_catalog[name]={'url':url,**credits(meta,filename)}
 (MEDIA/'portrait-catalog.json').write_text(json.dumps(photo_catalog,ensure_ascii=False),encoding='utf-8')

 tasks=[]
 for name in NAMES:
  filename=names.get(name); meta=metadata.get(filename_key(filename))
  if meta and legal(meta):tasks.append((PORTRAITS/(slug(name)+'.png'),'portrait',name,meta,filename))
  else:fallback(PORTRAITS/(slug(name)+'.png'),name,'portrait')
 for id,filename in LOGOS.items():
  meta=metadata.get(filename_key(filename))
  if meta and legal(meta):tasks.append((COMP/(id+'.png'),'logo',id,meta,filename))
  else:fallback(COMP/(id+'.png'),id,'logo')
 for name,filename in CUPS.items():
  meta=metadata.get(filename_key(filename))
  if meta and legal(meta):tasks.append((TROPH/('real-'+name+'.png'),'trophy',name,meta,filename))
  else:fallback(TROPH/('real-'+name+'.png'),name,'trophy')
 def download_task(item):
  path,kind,key,meta,filename=item
  url=meta.get('thumburl') or meta.get('url')
  raw=req(url,binary=True) if url else None
  if raw:
   try:
    normalized_image(raw,kind).save(path,'PNG',optimize=True)
    return dict(kind=kind,name=key,**credits(meta,filename))
   except Exception:pass
  fallback(path,key,kind)
  return None
 with ThreadPoolExecutor(max_workers=6) as executor:
  for result in executor.map(download_task,tasks):
   if result:media.append(result)
 summary={'portraits':len([x for x in media if x['kind']=='portrait']), 'logos':len([x for x in media if x['kind']=='logo']), 'trophies':len([x for x in media if x['kind']=='trophy']), 'totalPortraits':len(NAMES), 'licensedPortraitSources':len(photo_catalog), 'totalLeagues':len(LOGOS)}
 (MEDIA/'media12.json').write_text(json.dumps({'summary':summary,'credits':media},ensure_ascii=False,indent=2),encoding='utf-8')
 lines=['<!doctype html><html lang="es"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Créditos de imágenes · RASCENSO</title><style>body{max-width:900px;margin:30px auto;padding:15px;background:#10253e;color:#ecf5ff;font:15px/1.5 system-ui}a{color:#adceff}li{margin:14px 0}</style><h1>Créditos de imágenes · RASCENSO</h1><p>Imágenes alojadas con permiso de licencia libre según la ficha de Wikimedia Commons. Los logos pueden ser marcas registradas; su aparición es referencial y no indica patrocinio.</p><p>Los archivos no enumerados usan diseño original de RASCENSO. Todas las noticias de prensa del juego son ficticias.</p><ul>']
 all_credits={ (c['kind'],c['name']):c for c in media }
 for name,c in photo_catalog.items():all_credits.setdefault(('portrait',name),dict(kind='portrait',name=name,artist=c['artist'],license=c['license'],source=c['source']))
 for m in sorted(all_credits.values(),key=lambda x:(x['kind'],x['name'])):
  lines.append('<li><b>'+html.escape(m['name'])+'</b> · '+html.escape(m['kind'])+' — '+html.escape(m['artist'])+' ('+html.escape(m['license'])+') · <a href="'+html.escape(m['source'])+'" target="_blank" rel="noopener">Archivo y licencia</a></li>')
 lines.append('</ul></html>')
 (MEDIA/'MEDIA_CREDITS.html').write_text('\n'.join(lines),encoding='utf-8')
 print('MEDIA12 '+json.dumps(summary,ensure_ascii=False),flush=True)

if __name__=='__main__':main()
