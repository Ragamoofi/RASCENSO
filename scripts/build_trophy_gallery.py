#!/usr/bin/env python3
"""Produce PNGs DISTINCTOS para cada competición no cubierta por una foto libre.
Las ilustraciones son originales de RASCENSO, NO reproducciones oficiales.
En el despliegue se crean DESPUÉS de descargar copas licenciadas de Commons.
"""
from PIL import Image, ImageDraw, ImageFont, ImageFilter
from pathlib import Path
import re,sys,hashlib,colorsys,json
ROOT=Path(sys.argv[1] if len(sys.argv)>1 else '_site')
OUT=ROOT/'assets'/'trophies';OUT.mkdir(parents=True,exist_ok=True)
COUNTRY_SRC=Path('src/countries.mjs').read_text(encoding='utf-8')
COUNTRIES=sorted(set(re.findall(r'(?:["\x27]?code["\x27]?\s*:\s*)["\x27]([A-Z]{2})["\x27]',COUNTRY_SRC)))
LEAGUES=['CL1','CL2','BR1','BR2','AR1','EN1','ES1','DE1','IT1','FR1','NL1','PT1','SC1']
EXTRAS=['club-world','supercup','continental-generic','continental-europa','continental-conference','continental-concacaf','continental-afc2','continental-cafconf','continental-ofc','continental-superuefa','national-generic','national-conmebol','national-uefa','national-caf','national-afc','national-concacaf','national-ofc']
REAL=['libertadores','sudamericana','recopa','copaamerica','champions','worldcup',
      'premier','eredivisie','copadelrey','copachile','brasileirao','afcchampions','cafchampions']
KEYS=([(f'league-{code.lower()}','league',code) for code in COUNTRIES]+
 [(f'cup-{code.lower()}','cup',code) for code in COUNTRIES]+
 [(f'league-{id.lower()}','league',id) for id in LEAGUES]+
 [(k,k.split('-')[0],k.split('-')[-1].upper()) for k in EXTRAS]+
 [(f'real-{k}','continental' if k not in ['copachile','copadelrey','premier','eredivisie','brasileirao'] else 'cup',k[:4].upper()) for k in REAL])
def font(size):
 for file in ('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf','/usr/share/fonts/truetype/liberation2/LiberationSans-Bold.ttf'):
  try:return ImageFont.truetype(file,size)
  except OSError: pass
 return ImageFont.load_default()
def col(seed,brightness):
 h=((int(hashlib.sha256(seed.encode()).hexdigest()[:8],16)%360)/360)
 r,g,b=colorsys.hsv_to_rgb(h,.33,brightness)
 return tuple(round(v*255) for v in (r,g,b))
def make(key,kind,code):
 w,h=320,420
 img=Image.new('RGBA',(w,h)); d=ImageDraw.Draw(img)
 gold=(248,214,155,255); ice=(194,229,244,255)
 main=(*col(key,.85),255); dark=(*col(key,.42),255)
 label=code[:6]
 d.ellipse((60,358,262,396),fill=(5,15,29,78))
 d.rounded_rectangle((91,340,229,372),radius=8,fill=dark,outline=gold,width=4)
 d.rounded_rectangle((108,315,213,341),radius=8,fill=main,outline=gold,width=3)
 d.rounded_rectangle((145,270,175,325),radius=6,fill=gold)
 form=int(hashlib.md5(key.encode()).hexdigest()[:2],16)%5
 if kind in ('league','national'):
  if form==0 or kind=='national':
   d.ellipse((76,66,246,237),fill=main,outline=gold,width=10)
   d.ellipse((91,81,231,222),outline=ice,width=4)
   d.arc((101,91,221,211),50,310,fill=gold,width=5)
  elif form==1:
   d.polygon([(86,89),(235,89),(224,217),(161,270),(97,217)],fill=main)
   d.line([(86,89),(235,89),(224,217),(161,270),(97,217),(86,89)],fill=gold,width=8)
  elif form==2:
   d.ellipse((65,82,259,228),fill=main,outline=gold,width=9)
   d.ellipse((96,113,228,200),outline=ice,width=3)
  elif form==3:
   d.polygon([(161,59),(248,135),(217,233),(161,265),(104,233),(74,135)],fill=main)
   d.line([(161,59),(248,135),(217,233),(161,265),(104,233),(74,135),(161,59)],fill=gold,width=8)
  else:
   d.rounded_rectangle((83,78,238,247),radius=32,fill=main,outline=gold,width=8)
   d.ellipse((111,99,210,202),outline=ice,width=4)
 else:
  if kind in ('cup','supercup'):
   d.arc((45,111,140,235),75,272,fill=gold,width=14)
   d.arc((182,111,277,235),268,108,fill=gold,width=14)
   if form%2: d.polygon([(97,93),(224,93),(210,203),(187,240),(135,240),(111,204)],fill=main)
   else: d.ellipse((91,81,231,133),fill=main);d.polygon([(95,110),(227,110),(205,219),(176,241),(146,241),(116,219)],fill=main)
   d.ellipse((93,84,229,112),outline=gold,width=8)
  elif kind in ('continental','club'):
   d.ellipse((88,59,235,223),fill=main,outline=gold,width=9)
   d.arc((49,85,139,249),90,265,fill=ice,width=9)
   d.arc((184,85,273,249),276,92,fill=ice,width=9)
   if kind=='club':
    d.arc((119,73,205,208),55,310,fill=gold,width=6);d.arc((106,115,219,174),10,180,fill=gold,width=5)
  else:
   d.polygon([(160,55),(235,129),(205,229),(160,257),(115,229),(85,129)],fill=main)
   d.line([(160,55),(235,129),(205,229),(160,257),(115,229),(85,129),(160,55)],fill=gold,width=8)
 # Ornamento y grabado distintos por código
 deco=int(hashlib.sha256((key+'detail').encode()).hexdigest()[:4],16)
 for j in range(3+(deco%3)):
  a=118+j*20;d.ellipse((a,125,a+5,130),fill=ice)
 d.text((161,177),label,anchor='mm',fill=gold,font=font(42 if len(label)<5 else 29),stroke_width=2,stroke_fill=dark)
 d.line((115,265,205,265),fill=ice,width=4)
 for x in (122,161,200):
  d.regular_polygon((x,295,5),5,rotation=270,fill=gold)
 img.resize((160,210),Image.Resampling.LANCZOS).save(OUT/(key+'.png'),'PNG',optimize=True)
def main():
 credits=ROOT/'assets'/'media12.json'
 try:verified={c['name'] for c in json.loads(credits.read_text(encoding='utf-8')).get('credits',[]) if c.get('kind')=='trophy'}
 except (OSError,ValueError,KeyError):verified=set()
 for key,kind,code in KEYS:
  # Si Wikimedia no entregó imagen licenciada, no presentar el respaldo genérico como oficial.
  if key.startswith('real-'):
   if key[5:] not in verified:make(key,kind,code)
  elif not (OUT/(key+'.png')).exists():make(key,kind,code)
 print('RASCENSO 4.5: ',len(KEYS),'ilustraciones PNG únicas disponibles, más trofeos reales licenciados; países:',len(COUNTRIES),flush=True)
if __name__=='__main__':main()
