#!/usr/bin/env python3
"""50 camisetas conceptuales propias: no son indumentaria oficial."""
import re,sys
from pathlib import Path
from PIL import Image,ImageDraw,ImageFont
root=Path(sys.argv[1] if len(sys.argv)>1 else 'assets/kits');root.mkdir(parents=True,exist_ok=True)
src=Path('src/countries.mjs').read_text()
codes=[a or b for a,b in re.findall(r'code:\s*"([A-Z]{2})"|"code":\s*"([A-Z]{2})"',src)]
col={'AR':('#92D7F4','#FFFFFF'),'BR':('#F3D03F','#1C834F'),'CL':('#CA3144','#FFFFFF'),'UY':('#FFFFFF','#68B2DB'),'CO':('#E8C63E','#2C57B8'),'PE':('#FFFFFF','#CB3140'),'MX':('#216947','#FFFFFF'),'US':('#FFFFFF','#CA293C'),'ES':('#C8393A','#E4C042'),'EN':('#FFFFFF','#C82F3F'),'DE':('#FFFFFF','#202020'),'IT':('#237DA8','#FFFFFF'),'FR':('#24478C','#FFFFFF'),'NL':('#EB7A31','#1B2945'),'PT':('#C72E3C','#257249'),'JP':('#2D569F','#FFFFFF'),'KR':('#FFFFFF','#CA293C'),'NZ':('#EAEAEA','#202020'),'AU':('#EAD53F','#23784A'),'MA':('#BE303E','#18754F'),'EG':('#C7323F','#FFFFFF'),'NG':('#28784E','#FFFFFF'),'SN':('#FFFFFF','#238657')}
font=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',42)
for i,c in enumerate(codes):
 a,b=col.get(c,('#244F83','#E4ECF5'))
 im=Image.new('RGBA',(340,430));d=ImageDraw.Draw(im,'RGBA')
 d.polygon([(80,75),(125,45),(155,51),(185,51),(220,45),(260,75),(311,166),(266,193),(248,167),(250,393),(90,393),(92,167),(74,193),(28,166)],fill=a,outline='#F4F4F4',width=3)
 if i%4==0:
  for x in [114,163,212]:d.rectangle((x,74,x+18,386),fill=b)
 elif i%4==1:d.rectangle((91,173,250,212),fill=b)
 elif i%4==2:
  for y in [120,224,328]:d.rectangle((91,y,248,y+12),fill=b)
 else:d.polygon([(91,120),(250,235),(250,265),(91,150)],fill=b)
 d.polygon([(145,51),(170,85),(195,51),(185,47),(170,65),(154,47)],fill='#DFE7F0')
 d.ellipse((157,134,183,160),fill=b,outline='#FFFFFF',width=2)
 box=d.textbbox((0,0),c,font=font);d.text((170-(box[2]-box[0])/2,254),c,font=font,fill='#FFFFFF',stroke_width=2,stroke_fill='#10283D')
 im.save(root/(c+'.png'),optimize=True)
print('Camisetas conceptuales:',len(codes))
