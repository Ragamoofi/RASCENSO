#!/usr/bin/env python3
"""RASCENSO 4.9: compila el archivo ZIP entregado por el jugador a recursos estáticos preinstalados.
No utiliza servicios externos. Ejecutar una sola vez al preparar una versión del juego.
"""
import argparse,gzip,hashlib,json,pathlib,zipfile,shutil

def compact(value):
    return json.dumps(value,ensure_ascii=False,separators=(",",":")).encode("utf8")
def compress(data):
    return gzip.compress(data,compresslevel=9,mtime=0)

def build(source,output,expected=180739):
    base=pathlib.Path(output)/"assets"/"world-data"
    if base.exists():shutil.rmtree(base)
    base.mkdir(parents=True)
    with zipfile.ZipFile(source) as z:
        src=next((n for n in z.namelist() if n.endswith("/runtime/indice_clubes.json")),None)
        if not src:raise ValueError("Falta runtime/indice_clubes.json")
        clubs=json.loads(z.read(src))
        files=sorted(n for n in z.namelist() if ("/runtime/por_pais/" in n or "/runtime/libres/" in n) and n.endswith(".json"))
        ids=set();directory=[];nclub=nfree=0;sha={}
        for name in files:
            rel=name.split("/runtime/",1)[1]
            doc=json.loads(z.read(name))
            pairs=[("",p) for p in doc.get("jugadores",[])]
            for c in doc.get("clubes",[]):
                pairs.extend((str(c["club_uid"]),p) for p in c["jugadores"])
            for uid,p in pairs:
                if p["id"] in ids:raise ValueError("Duplicated player ID "+p["id"])
                ids.add(p["id"])
                directory.append([p["id"],p["nombre"],p.get("edad"),(p.get("posiciones") or [""])[0],p.get("ca_fm"),uid,str(p.get("nacion_fm","")),rel])
                if uid:nclub+=1
                else:nfree+=1
            data=compress(compact(doc))
            dest=base/(rel+".gz")
            dest.parent.mkdir(parents=True,exist_ok=True);dest.write_bytes(data)
            sha[rel]=hashlib.sha256(data).hexdigest()
        if len(ids)!=expected:raise ValueError(f"Esperados {expected} jugadores, hay {len(ids)}")
        club_index={str(uid):{**item,"archivo":item["archivo"].split("runtime/",1)[-1]} for uid,item in clubs.items()}
        (base/"clubs.json.gz").write_bytes(compress(compact(club_index)))
        (base/"directory.json.gz").write_bytes(compress(compact(directory)))
        manifest={"schema":"rascenso-bundled-world-v1","version":"2026-10-31","total":len(ids),"players":nclub,
                  "freePlayers":nfree,"clubs":len(clubs),"shards":len(files),"directory":"directory.json.gz",
                  "clubIndex":"clubs.json.gz","compression":"gzip","lazy":True,"sexNotVerified":True}
        (base/"manifest.json").write_bytes(compact(manifest))
        (base/"SHA256.json").write_bytes(compact(sha))
        return manifest

if __name__=="__main__":
    parser=argparse.ArgumentParser(description="Build player universe assets for the RASCENSO website")
    parser.add_argument("input_zip")
    parser.add_argument("website_root",help="Root folder of the RASCENSO website (index.html)")
    args=parser.parse_args()
    print(json.dumps(build(args.input_zip,args.website_root),indent=2,ensure_ascii=False))
