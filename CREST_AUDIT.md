# RASCENSO — Auditoría de escudos

Se revisaron los **874 clubes** de los 50 países del catálogo.

- **577** archivos SVG relacionados por la lógica original.
- **241** equivalencias adicionales verificadas por nombre, país y archivo SVG.
- **818** equipos con fuente de escudo reconocida (**93,6 %** del catálogo).
- **56** equipos sin un archivo SVG verificable en la biblioteca consultada. Permanecen con una insignia original genérica para no adjudicarles la identidad de otro club.

El listado exhaustivo está en [`assets/crest-audit.json`](assets/crest-audit.json). Los nombres especiales se mantienen en [`scripts/crest_aliases.json`](scripts/crest_aliases.json), vinculados al **ID persistente** de cada equipo. Así, Liverpool utiliza `Liverpool_FC.svg`, West Ham utiliza `West_Ham.svg`, Botafogo utiliza `Botafogo_FR.svg`, Estrella Roja utiliza `Crvena_Zvezda.svg`, etc.

La publicación genera `assets/crest-manifest.json`, que distingue entre escudos descargados correctamente, fuentes identificadas cuya descarga falló temporalmente y clubes sin referencia conocida. Si falla la descarga en GitHub Actions, la interfaz vuelve a intentar cargar la fuente reconocida en el navegador. La vista local conserva insignias provisionales, sin suplantar otro escudo.

**Fuente de referencia:** [JoseArroyave/football-logos](https://github.com/JoseArroyave/football-logos), catálogo SVG organizado por país (MIT). Los escudos siguen siendo marcas e identidades de sus respectivos clubes.

Para reproducir la revisión: `node scripts/export-clubs.mjs && python scripts/audit_crests.py --write`. Para generar el sitio: `python scripts/build_crests.py _site/assets/crests` (requiere Pillow, CairoSVG y conexión de red).
