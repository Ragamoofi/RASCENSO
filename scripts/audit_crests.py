#!/usr/bin/env python3
"""Audit reference crest availability without network or downloading images."""
from __future__ import annotations
import difflib,json,re,sys,unicodedata
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
CATALOG=json.loads((ROOT/'clubs-export.json').read_text(encoding='utf8'))
INDEX={}
for i in range(1,5): INDEX.update(json.loads((ROOT/'assets'/f'logos-{i}.json').read_text(encoding='utf8')))
ALIASES=json.loads((ROOT/'scripts/crest_aliases.json').read_text(encoding='utf8'))
COMMONS=json.loads((ROOT/'scripts/crest_commons.json').read_text(encoding='utf8'))
def norm(text):
 text=unicodedata.normalize('NFKD',text)
 return re.sub(r'[^a-z0-9]','', ''.join(c for c in text if not unicodedata.combining(c)).lower())
legacy={('CL','Deportes La Serena'):'La_Serena.svg',('CL','Colo-Colo'):'Colo_Colo.svg',('CL','Colo-Colo B'):None,('CL','Ñublense'):'Ñublense.svg',('CL','Universidad Católica'):'Universidad_Católica.svg',('CL','Unión La Calera'):'Unión_La_Calera.svg',('CL',"O'Higgins"):"O'Higgins.svg",('AR','Argentinos Juniors'):'Argeninos_Juniors.svg',('AR','Huracán'):'CA_Huracán.svg',('AR','Belgrano de Córdoba'):'Belgrano.svg',('BR','América Mineiro'):'América_Mineiro.svg',('BR','Atlético Mineiro'):'Atlético_Mineiro.svg',('BR','Athletico Paranaense'):'Athletico_Paranaense.svg',('EN','Tottenham Hotspur'):'Tottenham_Hotspur.svg'}
def select(c,name,cid):
 files=INDEX.get(c,[])
 explicit=ALIASES.get(cid)
 if explicit and explicit['country']==c and explicit['file'] in files:return explicit['file']
 e=legacy.get((c,name),'NOT_SET')
 if e is None:return None
 if e!='NOT_SET' and e in files:return e
 exact=[f for f in files if norm(f.removesuffix('.svg'))==norm(name)]
 if len(exact)==1:return exact[0]
 if re.search(r'\b(?:B|II|U20|U21|U23)\b',name,re.IGNORECASE):return None
 key=norm(name)
 if len(key)<7:return None
 rank=sorted(((difflib.SequenceMatcher(None,key,norm(f.removesuffix('.svg'))).ratio(),f) for f in files),reverse=True)
 if rank and rank[0][0]>=.94 and (len(rank)==1 or rank[0][0]-rank[1][0]>=.08):return rank[0][1]
 return None
rows=[{'id':x['club']['id'],'name':x['club']['name'],'country':x['country'],'filename':select(x['country'],x['club']['name'],x['club']['id']) or (COMMONS.get(x['club']['id'],{}).get('file'))} for x in CATALOG]
byid={x['club']['id']:x for x in CATALOG}
errors=[cid for cid,v in ALIASES.items() if cid not in byid or byid[cid]['country']!=v['country'] or v['file'] not in INDEX.get(v['country'],[])]
matched=sum(bool(x['filename']) for x in rows)
summary={'total':len(rows),'mapped':matched,'unmatched':len(rows)-matched,'aliasCount':len(ALIASES),'invalidAliases':errors,'missing':[{'id':x['id'],'name':x['name'],'country':x['country']} for x in rows if not x['filename']]}
print('Clubes:',len(rows),'fuentes relacionadas:',matched,'pendientes:',len(rows)-matched,'alias inválidos:',len(errors))
if '--json' in sys.argv:print(json.dumps(summary,ensure_ascii=False,indent=2))
if '--write' in sys.argv:(ROOT/'assets/crest-audit.json').write_text(json.dumps(summary,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
if errors or len(rows)!=874 or matched<826:sys.exit('Revisión de escudos incorrecta')
