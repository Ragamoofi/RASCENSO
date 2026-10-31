# RASCENSO 4.5 · Sala de Trofeos

## Objetivo y alcance
La vitrina lateral **mantiene su altura (97 px)**. No se ha convertido en una pantalla más grande: las piezas tienen una disposición horizontal compacta y un desplazamiento para explorar todos los títulos. Cada tarjeta muestra **trofeo PNG diferenciado, nombre y año**. Al hacer clic o tocar, se abre una ficha accesible con nombre completo, temporada, club o selección y enlace a los créditos. Escape cierra la ficha.

La sala de trofeos del retiro conserva su cuadrícula y el límite de alto de **370 px**; mejora imágenes, nombres, años, veces ganadas y clubes. Las competiciones repetidas se agrupan en el epílogo sin perder sus temporadas. Los títulos históricos siguen funcionando.

## Imágenes y licencias
Los PNG reales/representativos de copas son reproducciones **alojadas bajo licencias libres en Wikimedia Commons**, con comprobación de metadatos y créditos en \`assets/MEDIA_CREDITS.html\` del sitio publicado. No son imágenes facilitadas oficialmente por las federaciones ni indican patrocinio.

La canalización ya existente \`scripts/build_media12.py\` contempla **13 identidades** de trofeos de referencia: Libertadores, Sudamericana, Recopa, Copa América, Champions, Mundial, Premier League, Eredivisie, Copa del Rey, Copa Chile, Brasileirão, AFC Champions y CAF Champions.

\`scripts/build_trophy_gallery.py\` genera variantes PNG propias **distintas** para las 13 ligas verificadas, copas nacionales por país y competiciones continentales o de selecciones sin imagen libre validada. Cuando la descarga o licencia no permite usar una reproducción real, sustituye el genérico por una ilustración original y **no la presenta como copa oficial**. Es deliberado: el catálogo de RASCENSO no debe confundir diseño de referencia con imagen oficial.

Fuentes de ejemplo:
- [CONMEBOL Libertadores](https://commons.wikimedia.org/wiki/File:Conmebol_Copa_Libertadores_Trophy45013.png)
- [UEFA Champions League](https://commons.wikimedia.org/wiki/File:UEFA_Champions_LeagueTrophy7612.png)
- [Copa Chile](https://commons.wikimedia.org/wiki/File:Copa_Chile_(transparente).png)
- [Premier League](https://commons.wikimedia.org/wiki/File:Premier_league_trophy_icon_(adjusted).png)
- [Copa América](https://commons.wikimedia.org/wiki/File:Copa_América_de_Fútbol.png)

## Mecánicas intactas
No cambian resultados, probabilidades, creación, contratos, guardados, títulos ganados ni el historial. Las diferencias de imágenes son solamente de presentación.

## Validación
- \`node --test tests/trophy45.test.mjs\` y batería completa de Node.
- \`tests/browser/trophies45.cjs\` con Chromium a 1920×1080 y 390×844: nombre, número de títulos, ventana de detalle, Escape y alto inalterado.
- GitHub Actions construye PNG después de la descarga autorizada de Commons y antes de publicar el sitio.
- Antes de fusionar se debe revisar el resultado de GitHub Actions; **no declarar publicado antes de comprobar el despliegue en main**.

## Pendiente posterior
Auditoría de fuentes para ampliar el porcentaje de copas oficiales reconocibles en todas las ligas del catálogo (incluidas las de referencia), con licencia y versión correspondientes a cada período. Las imágenes originales de respaldo no son sustitutos de esta verificación.
