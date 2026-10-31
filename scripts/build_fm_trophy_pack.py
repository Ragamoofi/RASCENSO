#!/usr/bin/env python3
"""Reconstituye el paquete de 863 PNG de trofeos del usuario desde blobs Git.
Solo publica IDs de Football Manager verificados: no adivinar nombres.
Los segmentos se guardan como binarios en el repositorio; no dependen de URLs externas.
"""
from pathlib import Path
from zipfile import ZipFile, BadZipFile
from io import BytesIO
import re
import sys

SITE = Path(sys.argv[1]) if len(sys.argv) > 1 else Path("_site")
PARTS = Path("assets/trophies/fm-parts")
OUT = SITE / "assets/trophies/fm"
EXPECTED = 863
EXPECTED_BYTES = 4658784
REQUIRED = {"102415", "317567", "1301394", "1301385", "5250792", "11", "22"}

def build():
    fragments = sorted(PARTS.glob("part-*.bin"))
    if len(fragments) != 7:
        raise RuntimeError(f"Faltan segmentos del ZIP de trofeos: {len(fragments)} de 7")
    data = b"".join(p.read_bytes() for p in fragments)
    if len(data) != EXPECTED_BYTES:
        raise RuntimeError(f"Paquete incompleto: {len(data)} bytes, esperados {EXPECTED_BYTES}")
    OUT.mkdir(parents=True, exist_ok=True)
    with ZipFile(BytesIO(data)) as z:
        members = [m for m in z.infolist() if not m.is_dir()]
        if len(members) != EXPECTED:
            raise RuntimeError(f"Catálogo FM: {len(members)} PNG, esperados {EXPECTED}")
        ids = set()
        for m in members:
            match = re.fullmatch(r"fm/([0-9]+)\.png", m.filename)
            if not match and m.filename != "fm/.png":
                raise ValueError("Ruta inesperada: " + m.filename)
            # 862 copas traen ID FM; una fue identificada solo por nombre.
            ident = match.group(1) if match else "_2016-copa-bicentenario"
            if ident in ids:
                raise ValueError("ID duplicado: " + ident)
            ids.add(ident)
            payload = z.read(m)
            if not payload.startswith(b"\x89PNG\r\n\x1a\n"):
                raise ValueError("No es PNG: " + m.filename)
            (OUT / (ident + ".png")).write_bytes(payload)
    if not REQUIRED.issubset(ids):
        raise RuntimeError("Faltan copas importantes: " + repr(REQUIRED - ids))
    print(f"RASCENSO · {len(ids)} trofeos reales del ZIP instalados ({len(data)} bytes); IDs verificados")

if __name__ == "__main__":
    try:
        build()
    except (BadZipFile, ValueError, RuntimeError) as err:
        raise SystemExit("ERROR en paquete de trofeos FM: " + str(err))
