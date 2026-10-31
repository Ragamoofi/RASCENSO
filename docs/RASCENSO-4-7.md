# RASCENSO 4.7 · Trofeos del ZIP identificado

## Origen
Importación del archivo `TROFEOS_IDENTIFICADOS_PARA_JUEGO.zip` aportado por el autor del juego el 31 de octubre de 2026. Contenía 863 PNG identificados (no incluye los 1.318 trofeos sin identificar del archivo original usado para prepararlo). El inventario contenía el nombre de competición y el ID de Football Manager de cada PNG. **Estos ID son referencias de identificación, no certificaciones de licencia o de uso oficial de las imágenes.**

## Instalación en el propio GitHub
- Los PNG se optimizaron a un máximo de **144 × 144 px**, paleta de 128 colores para no sobrecargar la web, preservando transparencia.
- Las **863** imágenes permanecen en un paquete comprimido reconstruido desde 7 blobs binarios versionados, `assets/trophies/fm-parts/part-01.bin` hasta `part-07.bin` (≈4,7 MB en total).
- `scripts/build_fm_trophy_pack.py` comprueba el número exacto de entradas, los nombres `fm/ID.png`, la firma PNG, los ID duplicados y el tamaño esperado; luego extrae a `_site/assets/trophies/fm/<FM_ID>.png` **durante la publicación**.
- `src/fm-trophy-catalog.mjs` contiene **855 nombres únicos** del inventario para búsquedas automáticas, más equivalencias por ID con las ligas y competiciones que usa RASCENSO. Los nombres ambiguos se excluyen de la búsqueda genérica, salvo equivalencias explícitas bien conocidas.
- Se asignan directamente **36 identificadores** de ligas, copas nacionales, continentales y selecciones; además se reconocen otras competiciones por su nombre único. El inventario preparado había detectado 48 nombres prioritarios, incluyendo torneos adicionales.
- El motor, los resultados y las partidas antiguas no se modificaron; solo cambia la imagen mostrada. Si una copa no existe en el ZIP o no tiene un equivalente seguro, se conserva la imagen anterior.
- La vitrina lateral, el historial con mini copas, la pantalla de retiro y la sección de competiciones históricas comparten el mismo catálogo visual.

## Correspondencias de ejemplo
| Competición de RASCENSO | ID del ZIP |
| --- | --- |
| Liga de Primera (Chile) | 5250792 |
| Primera B / Liga de Ascenso (Chile) | 5250793 |
| Premier League | 11 |
| Bundesliga | 22 |
| LaLiga | 67 |
| Serie A italiana | 32 |
| Libertadores | 102415 |
| Sudamericana | 317567 |
| UEFA Champions League | 1301394 |
| UEFA Europa League | 1301396 |
| UEFA Conference League | 31051584 |
| FIFA World Cup | 1301385 |
| FIFA Club World Cup | 121092 |
| Copa América | 1301389 |
| Copa Africana de Naciones | 1301390 |

El ZIP identificado **no traía un PNG llamado Copa Chile**. Esa competición conserva su imagen anterior, en lugar de atribuirle una copa de otro torneo.

## Créditos y condiciones de reutilización
Las imágenes son aportadas por el usuario y están vinculadas a un pack de gráficos para Football Manager. No se ha verificado la licencia individual de cada fotografía o recorte, ni se afirma que Sports Interactive, UEFA, FIFA o una federación autoricen su uso. Para redistribución pública/comercial, el autor debe comprobar los derechos y las condiciones de atribución aplicables.

## Pruebas
- Pruebas JS: `tests/fm-trophies47.test.mjs` (IDs, nombre normalizado y respaldo).
- Pruebas de navegador: `tests/browser/trophies45.cjs` comprueba la carga real del PNG de Libertadores en escritorio y móvil.
- Pipeline: el paquete binario se verifica y extrae íntegro antes del despliegue.
