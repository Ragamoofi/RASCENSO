# RASCENSO — Base mundial de jugadores · 180.739

## Objetivo
Los futbolistas entregados por el usuario se usan como **base mundial del fútbol**, no como un motor Football Manager ni como seis clubes piloto. El ZIP contiene 180.739 identidades adultas únicas: **149.795** vinculadas a **12.725 clubes** y **30.944 agentes libres**. Todas las entradas son consultables después de **instalar localmente el ZIP completo**.

## Cómo utilizarlo
1. Abrir la versión de RASCENSO con estos cambios incorporados. En **Opciones → Base mundial de jugadores**, presionar **Instalar base mundial completa**.
2. Seleccionar `RASCENSO_FM26_JUGADORES_REALES_LISTO_PARA_INTEGRAR.zip` (el mismo ZIP original, sin descomprimir).
3. La instalación guarda **280 shards de clubes**, **31 shards de agentes libres** y sus índices en **IndexedDB del navegador**. El ZIP no se envía a GitHub ni a ningún servidor.
4. En **Mundo**, buscar cualquier futbolista por nombre o cualquiera de los clubes del paquete. Los jugadores sin correspondencia jugable siguen disponibles en la base y sus equipos se pueden consultar.
5. Los clubes RASCENSO con una correspondencia local inequívoca por país/UID se usan para competidores de posición, planteles, simulación, premios y mercado. Al fichar en un nuevo club se carga en ese momento.
6. Cada navegador/dispositivo que quiera utilizar los datos debe importar el ZIP una vez. La partida `.json` no incluye todas las fichas base, sólo sus cambios e identificadores.

## Correspondencias y límites
La base tiene 12.725 clubes de origen, pero RASCENSO simula menos clubes: la vinculación se hace mediante un algoritmo conservador (club + país de origen único, más seis UIDs piloto del archivo original). Los homónimos ambiguos no se mezclan: quedan en el catálogo mundial consultable hasta aclarar su correspondencia.

**El CSV original no trae sexo ni tabla de nacionalidades ISO.** Por tanto, las fichas adultas del paquete se conservan como *candidatas de género no verificado*, sin afirmar que todas son hombres. Se excluyeron del paquete los femeninos explícitos detectables por nombre en el procesamiento previo. Las selecciones reales basadas en nacionalidad individual quedan pendientes hasta disponer de equivalencias fiables.

No se distribuyen las fichas dentro del repositorio público. La instalación es sólo local; compartir la base fuera del juego puede requerir permisos que deben verificarse.

## Rendimiento y progreso
No se crean 180 mil objetos `world.players` ni se pegan 180 mil fichas en `localStorage`.
- El navegador guarda los shards por separado en IndexedDB y un directorio pequeño para búsqueda.
- La página carga planteles de equipos relevantes; otros equipos se consultan a demanda.
- Cada ID `fm26:<uid>` es estable. Las edades y medias de jugadores secundarios avanzan por año lógico. El historial detallado (partidos, goles, asistencias, fichajes, lesiones y retiros) se serializa para una burbuja acotada de jugadores relevantes a la carrera.
- Los cambios de club guardados tienen prioridad sobre el equipo base del paquete; no se duplica el jugador.
- El motor sigue generando nuevas generaciones cuando los futbolistas originales envejecen o se retiran.

## Pruebas
- Auditoría completa del ZIP proporcionado: **180.739 IDs únicos, cero colisiones**, 12.725 clubes, 280+31 shards.
- `tests/fm26-real.test.mjs`: identidad única, seis clubes sintéticos, simulación de dos temporadas, traspasos y guardado.
- `tests/browser/fm26-universe.cjs`: ZIP sintético real con DEFLATE, 2 clubes, agentes libres, correspondencias piloto, búsqueda y recarga de IndexedDB.
- `.github/workflows/fm26-private.yml`: verifica el motor y que no se hayan publicado archivos de fichas.
- El flujo completo de navegador está en `.github/workflows/plays-browser.yml`.

## Pendiente para integración todavía más profunda
1. Avanzar todas las ligas y clubes de origen no jugables hacia competiciones simuladas propias, con fichajes interclubes a gran escala y estadísticas por partido.
2. Enlazar los **30.944 agentes libres** con el mercado activo, para que puedan firmar contratos simulados.
3. Traducir IDs de nacionalidades de la base a países y selecciones de RASCENSO, y activar convocatorias.
4. Ajustar la calidad de plantillas por liga con métricas reales a lo largo de varias temporadas.
5. Mantener mapeos explícitos para los homónimos que el algoritmo conservador deja sin enlazar.

## Estado de ramas
Mantener el trabajo aislado en `fm26-mundo-real-privado` hasta pasar pruebas. El ZIP y todos los datos derivados siguen fuera de GitHub. No sobrescribir commits de trofeos ni forzar main. Se puede publicar el **código del importador** sin incluir la base privada una vez aprobado.
