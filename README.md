# RASCENSO · Del barrio a la historia

**RASCENSO 3.0 — Jugadas Vivas** · © Ragamoofi.

Sitio oficial de prueba: https://ragamoofi.github.io/RASCENSO/

## Novedades 3.0 · Jugadas Vivas

Los minijuegos se reconstruyeron desde cero con un **motor 2D propio en canvas** (sin dependencias): cancha vista desde arriba y vista de portería, física de pelota con altura y sombra, rivales con IA, efectos y control por ratón, táctil o teclado.

- **20 jugadas distintas, repartidas por posición.** Cada puesto tiene situaciones y controles propios:
  - **Delantero:** mano a mano, penal, cabezazo y remate de primera.
  - **Extremo:** duelo contra el lateral, diagonal con rosca, centro a la carrera y tiro libre.
  - **Mediocampista:** pase filtrado (con línea de fuera de juego), contragolpe 3 contra 2, control del ritmo y recuperación.
  - **Defensa:** duelo defensivo, anticipación, despeje aéreo y línea del fuera de juego.
  - **Arquero:** asedio de remates, penal en contra, achique y salida por arriba.
- **Hasta 3 jugadas por temporada** según tu rol, en partidos reales del calendario y preferentemente ajustados. Cada una tiene minuto, marcador previo, presión, cansancio y dificultad según el rival y la etapa de la carrera.
- **Instrucciones sin prisa:** cada jugada empieza en una pantalla de lectura sin límite de tiempo; la cuenta 3, 2, 1 solo arranca cuando pulsas «Empezar» (o Enter/Espacio).
- **Atributos que importan:** velocidad, pulso al rematar (que tiembla con la presión y la falta de serenidad), alcance de entrada, salto y reflejos salen de tus atributos. Los arqueros rivales recuerdan hacia dónde pateas los penales.
- **Sin contradicciones con la simulación:** lograr la jugada suma exactamente un gol o una asistencia en ese partido, o evita exactamente un gol rival. Fallar deja el partido como lo simuló el motor. El resto de la temporada no cambia. Puedes resolver una jugada automáticamente (se muestra la probabilidad) o dejarla sin jugar.



El mundo ya no espera al jugador: clubes, entrenadores y futbolistas evolucionan cada temporada, y cada decisión deja huella.

- **Motor de carrera reconstruido.** La media se calcula siempre a partir de los atributos reales según el puesto. Cada atributo tiene un *techo* propio (heredado del legado + talento oculto) que puede subir con una temporada de explosión o bajar por falta de minutos o lesiones graves. Llegar a 90 es posible, pero raro (≈1–2 % de las carreras); la mayoría son carreras profesionales modestas, y el retiro llega de forma orgánica (normalmente entre los 34 y los 39).
- **Draft honesto.** La cifra de la leyenda es solo una referencia: cada carta muestra el valor real con el que empieza tu juvenil y el techo estimado de esa faceta. Se mantienen las tres oportunidades de cambiar propuestas.
- **Mundo vivo.** Los clubes suben o se hunden según resultados, inversiones y crisis; sus niveles alimentan la simulación y el mercado. Cada club tiene un entrenador con personalidad (formador, pragmático, ofensivo, disciplinario, gestor, estratega) que puede ser despedido. Estrellas, promesas de tu generación y un **rival generacional** progresan, cambian de club, ganan premios y se retiran; cada año irrumpen nuevas promesas.
- **Vestuario.** Competidor directo por el puesto (con nombre, edad y media), confianza del técnico, directiva, hinchada, capitanía, estatus de ídolo y relaciones con compañero, representante, prensa y familia.
- **Objetivos de temporada** de la directiva y del entrenador (según presupuesto del club, rol y puesto), evaluados al cierre y con efectos en renovaciones, confianza y afición.
- **Narrativa con memoria.** 22 escenas nuevas conectadas al contexto real (entrenador nuevo, lucha por el puesto, cambio de posición, promesa rota, interés de otro club, rival generacional, lesión grave, veteranía, crisis económica, descenso, ascenso, capitanía, hinchada, mentor, gala de premios, selección, vida personal, polémicas, cambio táctico, profesionalismo). Las decisiones crean **compromisos** que el juego recuerda y cobra más adelante; cada opción muestra sus consecuencias.
- **Premios y récords.** Balón de Ascenso (top 10 mundial), Trofeo Promesa, Bota, Mejor jugador, Revelación y Guante de la liga; nota media por temporada; récords personales, hitos, gráfico de evolución y veredicto de legado al retirarte.
- **Mercado con negociación.** Pedir más sueldo, titularidad o un año más (el club puede aceptar, mantener o retirar la oferta); renovar con mejora; los clubes muestran entrenador y tendencia. Retiro voluntario desde los 32 años.
- **Interfaz.** Nueva pestaña *Vestuario*, *Mundo* rediseñado (noticias, Balón de Ascenso, tu generación, figuras, poder de clubes), temporada a dos columnas sin desplazamiento en 1920×1080, atributos con barra de techo, cierre de temporada con objetivos, premios y titulares.
- **Compatibilidad.** Guardado versión 9 con la misma clave `rascenso-save-v2`; las partidas v1–v8 se migran conservando historial, títulos y contratos (los atributos se reajustan para coincidir con la media guardada). Si el navegador se queda sin espacio, las temporadas antiguas se compactan automáticamente.

Todos los futbolistas y entrenadores generados por el mundo vivo son **ficticios**. Detalle completo de cambios en [`CHANGELOG-2.0.md`](CHANGELOG-2.0.md).

## Ejecutar pruebas

```bash
node --test tests/*.test.mjs
node tests/ui-smoke.mjs
```

Pruebas de navegador opcionales (requieren Playwright y un servidor estático en la raíz):

```bash
python3 -m http.server 8765
node tests/browser/e2e.cjs http://localhost:8765/index.html chromium
node tests/browser/plays-e2e.cjs
```

`tests/browser/plays-harness.html` es un banco de pruebas de las 20 jugadas: incluye un bot aleatorio y uno competente (`runSmart`) para medir el equilibrio.

---

# Historial de versiones anteriores


## La nueva versión

- **Nueva identidad visual**: azul noche, azules eléctricos y cobre; ya no utiliza el esquema verde/negro. Interfaz original de tres columnas para 1920×1080, adaptable a pantallas pequeñas.
- **La carrera sigue siendo rápida**: creación en cuatro capítulos, draft de ocho cualidades con leyendas de referencia, tres ofertas nacionales, avance por temporada, decisiones, fichajes y retiro.
- **841 clubes en 49 países**, catálogo de referencia con equipos de distintas categorías y temporadas. **No es una base oficial de ligas 2026.** Un primer contrato pertenece siempre al país seleccionado. Club favorito opcional y persistente, sin fichajes garantizados.
- **Nuevo motor propio de ligas**: se genera un calendario de ida y vuelta entre los participantes de cada liga simulada. Los marcadores se resuelven con fuerza del club, localía y contribución del jugador. Las tablas con PJ, PG, PE, PP, GF, GC, DG y puntos se **suman desde los resultados** (3/1/0). Los resultados por fecha y las apariciones personales se guardan en el historial.
- **Estadísticas del futbolista a partir de encuentros**: las apariciones, minutos, goles y asistencias se cuentan en partidos en los que participa y nunca exceden los goles del equipo. El arquero registra porterías a cero y goles recibidos.
- **Planes antes de cada temporada**: Equilibrio colectivo, Atacar los espacios o Disciplina táctica; influyen en la simulación. Las situaciones narrativas posteriores ofrecen decisiones sobre fútbol y consecuencias persistentes.
- **Desarrollo separado del talento**: el OVR inicial no equivale al potencial; progresión, edad, minutos y lesiones intervienen en la evolución y el declive.
- **Mercado de pases**: propuestas con años de contrato y retribuciones ficticias, conservando el club de hincha y la continuidad narrativa.
- **Navegación mejorada**: Mi carrera, Historial y Mundo. A la derecha, alternancia entre clasificación y resultados individuales.
- **Compatibilidad de guardados**: conserva la clave `rascenso-save-v2` y migra partidas antiguas; exportación/importación JSON y respaldo local periódico.

## Alcance real (importante)

El simulador **sí calcula encuentros y posiciones de liga reales dentro de su universo ficticio**. Sin embargo, la selección de participantes es un grupo deportivo generado desde la base disponible, no la nómina federativa oficial de cada campeonato. Los equipos no disponen de plantillas individuales detalladas. Los torneos de copa, la clasificación continental y los calendarios de selecciones todavía requieren motores propios. Los eventos narrativos están escritos de antemano: **no existe un narrador libre de IA tipo Rasthoria**. Los equipos y leyendas reales se incluyen como referencias y no implican patrocinio ni afiliación.

La implementación es **original e independiente**. La auditoría del HAR de Copero inspiró la elección de sistemas y el enfoque de carrera rápida, pero no se ha incorporado código JavaScript extraído de Copero.

## Fuentes visuales

- Escudos externos: repositorio comunitario [JoseArroyave/football-logos](https://github.com/JoseArroyave/football-logos), con emblema original de respaldo donde falta correspondencia. Las marcas pertenecen a sus titulares.
- Banderas: [FlagCDN](https://flagcdn.com).
- Fotografía de ambiente: [Unsplash](https://unsplash.com/license).

### Publicación

`main` dispara `.github/workflows/pages.yml`; no se requiere Python ni GitHub Desktop para jugar en la dirección de GitHub Pages.

## Versión Alfa 0.6 · Competiciones verificadas 2026/27

- **13 divisiones confirmadas**, de 11 países, con 246 inscripciones: CL Primera y Ascenso, BR A y B, AR Primera (2 zonas), EN, ES, DE, IT, FR, NL, PT y SC principales. Datos iniciales en `src/leagues2026.mjs`, con fuente por competición. Las temporadas europeas parten como **2026/27**.
- Las **otras 38 selecciones nacionales** y los clubes no clasificados en estas ligas se mantienen en el catálogo para la carrera, pero su competición se muestra honestamente como **circuito de referencia**, sin afirmar que sea una nómina oficial 2026. Hay que seguir verificando estas ligas antes de activar una división oficial de esos países.
- Chile tiene **16 clubes de Primera y 16 de Ascenso**, sin filiales B. Los equipos antiguos que ya no participan quedan en el catálogo histórico para no eliminar guardados; no entran a las competiciones verificadas.
- Para países con dos divisiones verificadas (CL/BR), las partidas simulan dos ascensos y descensos por temporada, **ficticios**, usando los resultados de la carrera (no predicen clubes reales de 2027+).
- Argentina usa las dos zonas de 15 integrantes, representadas con 30 fechas por club en este motor; no incluye todavía el playoff oficial del Apertura/Clausura ni la totalidad de sus reglas de desempate.
- **Tarjetas originales RASCENSO**: Bronce 0-64, Plata 65-74, Oro 75-82 y Élite 83+, fondos PNG en `assets/cards/`. No contienen imágenes de EA FC.
- El motor conserva los IDs históricos y migra las partidas anteriores; tablas ya jugadas no se recalculan retroactivamente.

Fuentes de clubes: [Chile Primera](https://www.emol.com/especiales/2026/deportes/liga-de-primera/equipos.asp), [Chile Ascenso](https://www.cooperativa.cl/noticias/deportes/futbol/liga-de-ascenso/asi-quedo-la-tabla-del-ascenso-tras-la-desafiliacion-de-san-marcos-por/2026-10-27/213307.html), [Brasil A](https://www.cbf.com.br/futebol-brasileiro/times/campeonato-brasileiro/serie-a/2026), [Brasil B](https://www.cnnbrasil.com.br/esportes/brasileirao/campeonato-brasileiro-veja-os-clubes-que-participarao-da-serie-b-em-2026/), [Argentina](https://www.afa.com.ar/es/posts/sorteo-de-la-liga-profesional-2026-se-definen-los-grupos-del-torneo-apertura-y-torneo-clausura), [Premier League](https://www.premierleague.com/en/news/4365156), [España](https://www.laliga.com/laliga-easports/clubes), [Alemania](https://www.bundesliga.com/en/bundesliga/clubs), [Italia](https://sport.sky.it/calcio/serie-a/serie-a-2026-2027-squadre), [Francia](https://ligue1.com/fr/articles/l1_article_5293-les-dates-de-reprise-des-clubs-de-l1-2627), [Holanda](https://eredivisie.nl/competitie/clubs/), [Portugal](https://bolanarede.pt/especial-bola-na-rede/atualidade/contas-fechadas-eis-as-18-equipas-que-vao-disputar-a-primeira-liga-2026-27/), [Escocia](https://spfl.co.uk/clubs).


## Alfa 0.7 · Mercado vivo (30 octubre 2026)

- **Ofertas proporcionales:** el mercado evalúa OVR, estadísticas recientes, reputación, edad y prestigio deportivo del destino. Los antiguos ratings semilla (tope 75) ya no determinan en solitario las ofertas.
- **Representante activo:** opción para consultar interesados tras al menos una temporada y hasta dos búsquedas adicionales por mercado; puede orientar búsqueda por país, minutos o salario (motor preparado). Las búsquedas no prometen ofertas concretas.
- **Directiva con autonomía:** contratos que vencen sin renovación, transferencias forzadas por descarte y cesiones juveniles; ya no se renueva automáticamente cada contrato. Una salida forzada no ofrece el botón de permanencia.
- **Cesiones:** duran una temporada, guardan el contrato original y retornan al club de origen.
- **Economía en EUR por año:** calibración por mercado/país, prestigio, rol y OVR. Son **estimaciones de simulación**, no cifras oficiales de los contratos de cada institución. Se registran ingresos por temporadas nuevas. No se alteran ganancias históricas de guardados antiguos.
- **Banderas:** elimina caracteres superpuestos en navegadores Windows.
- **Corrección adicional:** clubes en circuitos de referencia siempre participan en su liga simulada incluso si no están entre los 16 mejor rankeados de su país.
- **Compatibilidad:** guarda y migra partidas versión 1 a 6, sin reiniciar el historial anterior.

Para la economía se usan órdenes de magnitud de las ligas (no salarios reales de cada plantilla). Es un modelo original y modificable.


## Alfa 0.8 · Identidad, legados y vida de carrera (2026-10-30)

- **Creador ampliado a 6 pasos**: identidad, raíces, estilo, mentalidad, ambición y resumen. Nuevas opciones de entorno, imagen pública, tolerancia al riesgo y senda de desarrollo. Se almacenan en el guardado y modifican probabilidades de minutos, rendimiento, lesiones, moral, confianza o mercado. Ningún rasgo garantiza fichajes ni títulos.
- **Legados con fotografía cuando existe una fuente comprobada**: capa visual fotográfica detrás de los valores que ya existían, con un fondo abstracto propio de respaldo. No se copia el diseño ni las imágenes de EA FC.
- **ADN emergente**: se resume el arquetipo de juego a partir de los ocho atributos elegidos. Se muestra al finalizar el draft y dentro del perfil.
- **Pretemporada**: seis enfoques, una elección definitiva por año; definición, creación, físico, táctica, recuperación o liderazgo. Modifica parámetros usados en la simulación original de RASCENSO.
- **Más situaciones deportivas**: se incorporan ojeadores, lucha por la titularidad, clásicos y liderazgo; hasta dos escenas por temporada tras el cierre anual, con decisiones y consecuencias persistentes. Siguen siendo situaciones programadas, **no un narrador libre de IA**.
- **Vitrina**: miniaturas PNG de trofeos originales de RASCENSO, con nombre de competición y año en el detalle. **No son imágenes oficiales licenciadas de cada copa**, que requieren una curaduría de derechos por torneo.
- **Compatibilidad**: versión de guardado 7, migración de versiones 1–6 conservando temporadas, títulos, contratos y estadísticas. Los títulos anteriores conservan el año cuando está en el historial; de lo contrario se indican sin año.

### Créditos de fotografías de leyendas

Se muestran desde Wikimedia Commons (sitio externo, bajo la licencia individual de cada archivo, con sus respectivas condiciones y autoría). No se redistribuyen dentro del repositorio. Los enlaces de origen y autoría se encuentran en las páginas siguientes:

- [Lionel Messi WC2022](https://commons.wikimedia.org/wiki/File:Lionel_Messi_WC2022.jpg)
- [Cristiano Ronaldo 2018](https://commons.wikimedia.org/wiki/File:Cristiano_Ronaldo_2018.jpg)
- [Ronaldo Nazário](https://commons.wikimedia.org/wiki/File:Ronaldo_Naz%C3%A1rio.jpg)
- [Andrés Iniesta 2018](https://commons.wikimedia.org/wiki/File:Andres_Iniesta_2018_(edited).jpg)
- [Xavi Hernández](https://commons.wikimedia.org/wiki/File:2012_2013_-_06_Xavi_Hern%C3%A1ndez.jpg)
- [Ronaldinho 2019](https://commons.wikimedia.org/wiki/File:Ronaldinho_in_2019.jpg)
- [Luka Modrić](https://commons.wikimedia.org/wiki/File:Luka_Modric.jpg)

La disponibilidad de estas fotos depende del servicio externo. El resto de leyendas utiliza un fondo abstracto original hasta contar con archivos y atribuciones verificadas. Las imágenes del juego no implican relación comercial con los deportistas.


## Alfa 0.9 · Carrera Viva (30-10-2026)

- Draft de **78 referentes** (íconos históricos, figuras y futbolistas profesionales), cifras ficticias no oficiales. Las opciones de menor media pueden aumentar el margen de evolución del personaje.
- **14 fotografías de referencia** con URL a Wikimedia Commons cuando están disponibles. Todos los demás futbolistas disponen de una ilustración vectorial propia de reemplazo; no se presentan como retratos reales. Las imágenes externas pueden fallar o dejar de estar disponibles, pero las cartas siguen visibles.
- **20 contextos de temporada** con tres decisiones cada uno, consecuencias acotadas para minutos, salud física, moral, confianza y producción deportiva. Sustituyen la antigua barra repetitiva de pretemporada. La opción de no intervenir se mantiene.
- **15 escenas futbolísticas adicionales**, incluyendo minutos, ojeadores, liderazgo y futuro contractual, y selección que evita repetir sucesivamente los eventos registrados. Los eventos narrativos duran entre 2 y 3 escenas según la temporada.
- Mejoras conservadoras de emparejamiento de nombres para escudos PNG: se requiere correspondencia muy alta y sin ambigüedad; cuando falta un logo oficial se mantiene un emblema provisional.
- **Propuesta de integración de IA** en `IA-RASCENSO-ARQUITECTURA.md`. Solo se incluyeron el protocolo y su validador (`src/ai-bridge.mjs`); no se conectó ninguna API todavía.

### Fotos y licencias
Las fotografías enlazadas provienen de distintas páginas de Wikimedia Commons: para créditos de autor y licencia exacta, consulta cada página `File:` enlazada desde `src/legend-art.mjs` usando la función `legendPhotoCredit()`. No se descargan ni redistribuyen fotografías en el repositorio. La utilización futura, especialmente comercial, requiere revisar las condiciones y atribuciones de cada archivo. Los escudos de equipos son marcas de sus titulares.

### Compatibilidad de guardados
Se mantienen los identificadores, estadísticas y estados previos. Las nuevas agendas se guardan en `seasonAgenda` y `careerMoments`; son opcionales y no cambian las temporadas anteriores.

## RASCENSO 1.0 — Director de Carrera y cierre anual

- **Resultados narrativos verificables:** los eventos de partidos destacados y clásicos nombran el rival, la fecha, el resultado, y los minutos sacados del historial `lastSeason.playerMatches`; una escena posterior al campeonato ya no habla de un partido todavía por jugar.
- **Balance después de cada campaña:** el primer panel de eventos muestra clasificación, media inicial/final, partidos, goles, asistencias, lesiones y títulos, con un comentario ficticio del entrenador o la prensa generado según los datos. La recapitulación no modifica ningún marcador.
- **Director de Carrera (versión manual, sin costo adicional):** chat auxiliar en la zona central que crea un prompt con contexto de tu partida, permite copiarlo y abrir ChatGPT, e importar de regreso la respuesta pegada. El registro del chat se guarda localmente y no cambia el motor, ni llama APIs, ni exige claves. Si el portapapeles falla aparece el texto para copiarlo manualmente.
- **Integración oficial pendiente:** Sign in with ChatGPT para páginas web requiere aprobación y un servicio de autenticación seguro. GitHub Pages no puede ofrecer automáticamente esa función solo con el código público. No se almacenan contraseñas ni tokens de ChatGPT en RASCENSO.
- **Compatibilidad:** los guardados anteriores se conservan; `recapPending` solo se activa para temporadas simuladas después de actualizar.

Documentación oficial relevante: https://developers.openai.com/siwc/quickstart y https://developers.openai.com/siwc/token-sharing-open-source.


## Alfa 1.2 — Identidad mundial

- El draft dispone de un PNG local por cada uno de los 78 referentes. Los retratos reales se obtienen de Wikimedia Commons únicamente cuando la licencia es reutilizable y se muestra atribución completa; cuando no, se emplea una ilustración original que no pretende ser el deportista. El proceso genera `assets/MEDIA_CREDITS.html`.
- Los 13 campeonatos verificados disponen de distintivo PNG; se usa el logo referencial procedente de Commons si su licencia permite reutilización, o un distintivo original en caso contrario. Los logos pueden seguir siendo marcas de sus titulares.
- Competiciones y copas mundiales se presentan como referencia visual; no se finge que todas sean ya competiciones jugables. La vitrina usa imágenes reales de trofeos con licencia libre donde existen.
- En escenas y cierres de temporada aparecen nombres de medios deportivos reales según el país, pero **todas las noticias, entrevistas y titulares son ficciones originales de RASCENSO**. Ningún medio está asociado con el juego.
- Se genera una guía pública de licencias, autores y enlaces para permitir revisión y retirada de recursos.


## Alfa 1.3 — Competiciones globales (formato simplificado)
- Marca oficial aportada por el creador: wordmark horizontal + icono cuadrado PNG y favicon.
- 50 nacionalidades jugables, incluida Nueva Zelanda (OFC); para ligas sin plantillas oficiales verificadas se sigue usando el circuito de referencia.
- Copa nacional anual para cada país, con llaves, partidos, resultados, clasificación y trofeo.
- Torneos continentales de clubes de seis confederaciones, con acceso simplificado por posición de liga.
- Convocatoria por rendimiento, eliminatorias, copa continental de selección y Mundial según ciclo del año; sus partidos se guardan separados de los de club.
- Historial de competiciones y recapitulaciones con llaves y trofeos; guardados anteriores se migran sin perder títulos.
- **Advertencia:** formatos de referencia de hasta 16 equipos, eliminación directa. No equivale a recrear los reglamentos oficiales de cada torneo ni su calendario completo.


## Alfa 1.4 — Temporada Mundial (30 octubre 2026)

Esta actualización **profundiza** las competiciones simuladas, pero no reproduce íntegramente las reglas oficiales ni las temporadas completas de las 50 federaciones. Conserva `rascenso-save-v2` y la estructura histórica de partidas anteriores.

- **Grupos de cuatro y tablas reales dentro del simulador**: puntos, goles, diferencia de goles, clasificación de los dos primeros y eliminatorias por torneo. Las copas continentales de clubes tienen ida/vuelta salvo final; el Mundial y los torneos regionales de selecciones tienen partido único en eliminatorias.
- **Eliminatorias mundialistas consistentes**: las tablas de 2029 deciden los participantes del Mundial 2030; las de 2033, el Mundial 2034. El Mundial inicial de 2026 usa la clasificación retrospectiva ficticia de 2025. Se usa un cuadro de 32 selecciones por simplicidad, **no el formato FIFA real**.
- **Selecciones invitadas**: el catálogo sigue teniendo 50 nacionalidades jugables, pero los torneos con pocas federaciones (especialmente OFC y CONCACAF) incluyen selecciones adicionales reales como rivales simulados. Estas selecciones no están disponibles como nacionalidad elegible.
- **Cupos continentales por campaña anterior**: si no cambias de club, cuenta la posición alcanzada el año anterior. En la primera temporada se conserva el acceso provisional del sistema 1.3 para no romper las carreras iniciadas. Si te transfieres, no heredas automáticamente el cupo de tu exclub.
- **Más torneos**: Mundial de Clubes ficticio por ciclo, Recopa Sudamericana y supercopas continentales para campeones elegibles; todos sujetos a simplificación de cupos y calendario.
- **Historial y calendario**: por cada competición se conservan partidos con marcador, rondas, grupos y tabla; la pantalla de resumen muestra estos datos y el calendario de copas/selección con ventanas orientativas.
- **Separación de estadísticas**: liga, copas de clubes y selección figuran en campos propios; el rendimiento en títulos y citaciones incide en reputación. Los datos viejos no se modifican al cargar guardados.
- **Determinismo**: rendimiento individual, minutos y estadísticas del usuario no alteran el sorteo de resultados de las demás selecciones durante sus clasificatorias.

**Pendientes conocidos**: todavía faltan reglamentos y cupos exactos de cada federación; ligas menores siguen usando un catálogo de referencia; no hay encuentros manuales fecha por fecha ni plantillas individuales reales. Las ventanas de calendario no representan fechas oficiales y el Mundial tiene 32 selecciones en vez del formato real. Estos puntos no se anuncian como terminados.


## 1.5 — Carrera sin límite fijo, expediente y momentos especiales

- Eliminada la jubilación automática a los 40: la continuidad dependerá de renovaciones, rendimiento y ofertas simuladas. Los veteranos pueden bajar de categoría o volver a su país; no se garantiza empleo perpetuo.
- Tarjeta de jugador: valor de mercado orientativo en EUR que varía por OVR, edad, club y forma, contrato y salario mensual estimado. Todos los salarios y valores son ficticios.
- Una jugada opcional por temporada, ligada a un partido del calendario que el jugador efectivamente disputó (penal, tiro libre, pase, corte o atajada según la posición). Elegir zona resuelve una prueba probabilística determinista; el éxito modifica el marcador registrado y la estadística correspondiente. No es todavía un minijuego en tiempo real.
- Archivo final completo con insignias, temporadas, títulos, selección y estadísticas; botón para crear un póster PNG local sin APIs ni pagos, junto al guardado JSON existente.
- Mejor contexto deportivo en escenas de entrenador, prensa y rivales: se identifican encuentros realmente disputados, sus marcadores y rivales.
- Guardados v1–v8 migrables y verificados mediante pruebas automáticas.
- Inspiración de género: se revisó Gambeta (gambetaoficial.ar) para identificar el valor de los lances jugables; todo el código, reglas y visuales añadidos son originales.

### Limitaciones conocidas

La simulación de la temporada sigue siendo por campaña completa. Los minijuegos son lances de elección de objetivo y probabilidad, no físicos ni en tiempo real; se prevé profundizarlos. La portada final muestra hasta 10 clubes y los últimos 5 títulos en el PNG, mientras la pantalla contiene más detalles. Algunas edades muy avanzadas pueden requerir varias búsquedas de oferta antes del retiro.


## 1.6 — Jugadas Vivas

- Los cinco momentos futbolísticos por posición pasan a dos fases: dirección y ejecución mediante medidor animado. Se puede detener con botón o barra espaciadora. La ventana ideal, la dificultad, el atributo y la decisión quedan reflejados en la probabilidad; el motor mantiene una tirada reproducible para evitar manipulación tras recargar.
- Las partidas 1.5 se conservan: jugadas antiguas sin valor `timing` siguen siendo válidas y sus probabilidades no se alteran.
- El expediente compartible es una imagen PNG de 1400×1000 con escudos de hasta doce clubes y miniaturas de siete trofeos, títulos y fechas.
- Marca visible actualizada para evitar mostrar una versión antigua a pesar de desplegar código nuevo.


## Alfa 1.7 — Identidad del futbolista

- Clases específicas para cada una de las doce posiciones (múltiples perfiles), fortaleza y debilidad elegibles. Ajustes pequeños a los atributos del draft y a minutos, presión y clase de jugada especial. No altera retroactivamente atributos históricos.
- Tarjeta de carrera: valor, sueldo y contrato como líneas tipográficas sin caja superpuesta. Creador: silueta original en lugar de letra gigante.
- Minijuego: el medidor usa `requestAnimationFrame` tanto para dibujar la posición real de la aguja como para evaluar el resultado; no depende de una animación CSS que puede quedar desincronizada.
- Al ejecutar muestra gol, fallo, atajada o corte y un **marcador proyectado** reproducible para el rival y fecha; al simular, el resumen anual confirma el marcador definitivo. Si cambias decisiones de la temporada entre ambos pasos, el resultado podrá variar.
- El formato de guardado sigue en versión 8 y migra perfiles antiguos con un valor predeterminado válido.


## Corrección 1.7.1 — Continuidad y simulación

- Las lesiones afectan fechas consecutivas del club, en lugar de ausencias dispersas.
- Las estadísticas de copas respetan la posición y no atribuyen goles de campo aleatorios al arquero.
- Una posición alta en segunda división no entrega cupo continental de primera, ni tras ascender.
- El representante ahora permite priorizar minutos, sueldo, país o salida internacional antes de buscar ofertas.
- Guardado más robusto: el respaldo no puede impedir escribir la partida principal; si el guardado principal falla, no se confirma el cambio visualmente y se muestra un aviso.
- Se conserva la versión de partida y la compatibilidad con los guardados existentes.
- Astra inició un pulido en otra sesión, pero sus cambios no estaban publicados en la rama main al revisar el repositorio.


## Alfa 1.8 — Identidad, decisiones y minijuegos nuevos

- El creador muestra una de **50 camisetas conceptuales PNG originales**, una por nacionalidad. Son diseños ficticios basados en los colores del país, **no camisetas oficiales**. Generación reproducible: `python scripts/build_kits18.py [destino]`.
- Más opciones en personalidad, desarrollo, raíces, estilo y sueños. Varias introducen modificadores moderados y comprobables de minutos, asistencias, goles y desgaste; los guardados antiguos mantienen sus IDs.
- El ADN solo presenta rostros reales cuando existe una fotografía reutilizable reconocida en el catálogo Wikimedia. Sin fotografía se muestra un fondo gráfico, no un retrato falso.
- Nuevas escenas contextuales: porteros, defensa, temporada continental, experiencia, suplencia, lucha por la permanencia, liderazgo y racha goleadora. Decisiones rediseñadas con sus posibles costes o ventajas.
- Minijuegos: precisión/reflejos por medidor (controlado por requestAnimationFrame, sin animación CSS contradictoria) y memoria de tres direcciones. Más situaciones: córner, centro, cabezazo, remate, regate, desmarque, despeje, achique y salida aérea. **Fallar el medidor o patrón obliga a un resultado negativo**. Superarlo habilita una posibilidad de éxito según atributos.
- El resultado tras cada jugada sigue siendo proyectado hasta simular toda la temporada. El marcador definitivo queda registrado después.
- Sin IA externa, sin claves de pago y sin cambiar el formato de guardados.


## Reparación de fotografías y camisetas — 1.8.1

- Las cartas de ADN leen tanto `assets/media12.json` (PNG realmente descargados) como `assets/portrait-catalog.json` (imágenes con licencia). Los PNG locales se intentan primero; la URL de Wikimedia se usa solo de respaldo.
- Los retratos no disponibles tienen un fondo tipográfico, sin caras genéricas ni el rombo anterior.
- Las camisetas conceptuales dejaron de mostrarse en el creador. La vista usa la identidad del país y, si existe un kit real aportado, carga la camiseta PNG/WebP.
- Para incorporar camisetas: subir los archivos a `assets/kits/official/`, y registrar `{\"CL\":\"chile-home-2026.png\"}` en `assets/kits/official/catalog.json`. El catálogo por defecto está vacío hasta tener material verificable.
- No se modifican atributos ni partidas guardadas.

## Actualización de carrera — 1.8.2

- Tres cambios de propuesta disponibles durante el draft de 8 legados.
- Las cartas muestran el atributo del referente debajo del nombre, separado de los valores iniciales del futbolista juvenil.
- Los ocho atributos propios (`pace`, `shot`, `pass`, `dribble`, `defense`, `physical`, `skills` y `weak`) se guardan y evolucionan en cada temporada según minutos, edad, puesto, potencial y desarrollo.
- Resumen visual de atributos con variaciones en la tarjeta del futbolista; las partidas antiguas conservan sus valores guardados.
- Las tres ofertas del primer contrato pueden ser de clubes nacionales y extranjeros, priorizando proyectos modestos o divisiones de ascenso; solo un 3,5 % de las carreras incluye una propuesta extraordinaria de un gigante.
- Contrato inicial visible en cada tarjeta con duración, rol y sueldo mensual/anual. Se firma exactamente lo ofrecido.
- Escudo de Colo-Colo: enlace directo a la versión vectorial identificable de FootyLogos (sujeto a conectividad del usuario).

La generación y los valores económicos son ficticios, propios de la simulación, sin pretender reproducir contratos reales.
