# RASCENSO 4.4 · Renovación Visual

**Rama de trabajo:** `rascenso-4-4-renovacion-visual`  
**Base:** RASCENSO 4.3, commit `f5825a9f8d3002905349ebd50f95dadf19ac5478`  
**Alcance:** UI del retiro, Centro de Partido y presentación de los 20 minijuegos; sin modificaciones de física, IA deportiva ni probabilidades.

## Implementado

- **Último silbatazo**: portada de despedida deportiva, tipografía y composición de estadio. El veredicto anterior, estadísticas globales, clubes, títulos, premios y recuerdos se conservan.
- **Tres actos del legado**: primera temporada, temporada destacada y último año. Todos los datos provienen del historial; se adaptan a arqueros y a carreras cortas. Sellos de carrera solo con logros reales (internacionalidades, goles, clubes, longevidad).
- **Centro de Partido**: marcador grande con escudos de clubes, ambiente visual de estadio, contexto de riesgo, indicadores y calendario de momentos. El modo rápido/inmersivo permanece intacto.
- **20 jugadas vivas**: cinco estilos definidos según escenario: duelo, vuelo, lectura, presión y velocidad. Nuevas capas Canvas de iluminación, indicadores y efectos de resultado. No tocan RNG, entradas ni cálculo de resultados.
- **Vista del minijuego**: estilos de ventana según tipo de jugada y controles legibles.
- **CSS separado**: `visual44.css` para que el parche sea reversible sin reescribir los 150 KB del estilo central.
- **Caché renovada**: versión 440 de CSS/JS.

## Validaciones

- **244/244 pruebas unitarias aprobadas** en la rama de desarrollo.
- Los 20 escenarios siguen completándose en las simulaciones de CI.
- Pruebas reales en Chromium, Firefox y WebKit.
- Carrera hasta el retiro y panel de temporada comprobados en 1920×1080 y 390×844.
- Capturas de navegador verificadas: `retirement-1920.png`, `retirement-390.png`, `matchday-1920.png`, `matchday-390.png`. Las capturas generadas en CI se adjuntan en GitHub Actions como artefacto.
- Nuevas pruebas de no mutación de estado por efectos y de identidad gráfica de los 20 minijuegos.

## Pendientes / calidad

- Evaluación humana de las sensaciones y fluidez de los minijuegos: un bot no mide diversión ni respuesta de entrada.
- El catálogo completo de escudos continúa sujeto a auditoría; los tests sin recursos precompilados pueden mostrar iniciales en lugar de los escudos.
- Se mantienen los sistemas narrativos, IA y dificultades de 4.3. Este parche es visual, no una reescritura deportiva.
- Sonidos y compatibilidad con versiones antiguas de partidas no se priorizan.

## Regla de publicación

Integrar a `main` solo cuando la última revisión en GitHub Actions pase y comprobar el despliegue de GitHub Pages antes de anunciarlo como publicado.
