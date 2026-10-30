# RASCENSO · Del barrio a la historia

**Alfa 0.9 — Carrera Viva** · 30 de octubre de 2026 · © Ragamoofi.

Sitio oficial de prueba: https://ragamoofi.github.io/RASCENSO/

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

## Ejecutar pruebas

```bash
node --test tests/engine.test.mjs
node tests/ui-smoke.mjs
```

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


## Corrección de experiencia (1.0.1)

- Se retira el panel de intercambio manual con ChatGPT (copiar, abrir otra pestaña y pegar), porque no proporcionaba un chat realmente integrado.
- Se conservan las escenas futbolísticas, los resúmenes anuales y todas las partidas; no se borran posibles textos guardados localmente del panel anterior.
- Un chat con IA solo deberá anunciarse como integrado cuando disponga de autenticación autorizada, conexión real y validación de consecuencias.


## Versión 1.1 — Historias deportivas y continuidad

- 26 conflictos deportivos nuevos y tres decisiones por escena, con requisitos por posición, edad, rendimiento, objetivos y lesiones.
- Selección ponderada que evita los últimos doce acontecimientos y reduce la repetición de categorías narrativas.
- Respuestas del entrenador o interlocutor visibles después de cada decisión, además de la consecuencia.
- Variaciones coherentes en los comentarios de cierre de temporada; no se inventan resultados, fichajes ni convocatorias.
- Se conserva el formato actual de guardados, sin reiniciar partidas.
- **ChatGPT:** no se incorporó un falso inicio de sesión. El uso de la suscripción desde GitHub Pages requiere autorización/configuración que RASCENSO no tiene; no se solicitó API ni credenciales.


## Alfa 1.2 — Fotografías, prensa y competiciones
- 78 PNG en el draft: fotografía real con licencia reutilizable verificada o ilustración de respaldo. El despliegue registra autor, licencia y fuente en `assets/MEDIA_CREDITS.html`.
- Distintivos PNG para 13 competiciones. Logos reconocibles cuando la licencia encontrada permite uso; en otros casos aparece insignia original. Las marcas pertenecen a sus titulares.
- En la vitrina y el Mundo aparecen imágenes licenciadas de copas internacionales. Algunas copas aún NO forman parte del motor jugable.
- Medios deportivos de cada país se citan solo como simulación narrativa. **Ningún titular o entrevista es una publicación real ni implica colaboración del medio**.
- Sin cambios en los guardados ni en el progreso deportivo de partidas existentes.

### Imágenes con carga diferida 1.2.1
Los PNG locales siguen funcionando sin red. Si GitHub Actions no pudo descargar una fotografía licenciada, las tres tarjetas visibles intentan recuperarla desde la URL documentada en `assets/portrait-catalog.json` y atribuida en `MEDIA_CREDITS.html`. No se usan fotos sin licencia documentada.
