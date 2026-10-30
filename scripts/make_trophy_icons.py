from PIL import Image,ImageDraw,ImageFilter
from pathlib import Path
from math import sin,cos,pi
out=Path(__file__).resolve().parents[1]/'assets'/'trophies';out.mkdir(parents=True,exist_ok=True)
settings={'league':('#f2c885','#a96736'),'cup':('#d7e9f4','#668dac'),'continental':('#fff1a4','#ab8037'),'world':('#e3d3fd','#8667c9')}
for name,(pale,dark) in settings.items():
    im=Image.new('RGBA',(160,170));d=ImageDraw.Draw(im)
    if name=='league':
        d.ellipse((41,24,119,42),fill=pale);d.polygon([(41,32),(51,92),(66,109),(94,109),(110,92),(119,32)],fill=pale);d.ellipse((50,35,110,50),fill=dark)
    elif name=='cup':
        d.polygon([(42,26),(118,26),(110,95),(90,114),(70,114),(50,95)],fill=pale);d.ellipse((41,18,119,36),fill=dark)
    elif name=='continental':
        d.ellipse((53,25,107,85),fill=pale);d.ellipse((63,35,97,75),fill=dark);d.arc((20,25,70,97),60,265,fill=pale,width=10);d.arc((90,25,140,97),275,120,fill=pale,width=10)
    else:
        d.ellipse((41,19,119,96),fill=pale);d.ellipse((51,29,109,86),fill=dark);d.arc((53,27,108,87),55,260,fill=pale,width=7);d.arc((55,30,110,86),240,75,fill=pale,width=6)
    d.rounded_rectangle((70,102,90,126),radius=4,fill=pale);d.rounded_rectangle((48,125,112,139),radius=5,fill=pale);d.rounded_rectangle((38,139,122,151),radius=4,fill=dark)
    im.save(out/f'{name}.png')
print('Created',len(settings),'original trophy illustrations',out)
