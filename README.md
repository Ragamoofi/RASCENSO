# RASCENSO · Del barrio a la historia

**Alfa 0.6 — Competiciones y tarjetas** · 30 de octubre de 2026 · © Ragamoofi.

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
