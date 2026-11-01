# RASCENSO — Renovación visual integral

**Estado: implementación y revisión completadas.** 1 de noviembre de 2026.

## Base, rama y commits

- Base: `b8462152cfa9f933a69e4f6f477e9f2fd1ee1794`, última versión de `main` contrastada antes de editar y nuevamente al terminar.
- Rama: `visual/premium-editorial`.
- Último commit de interfaz: `fca1959be909e3070a98ad4d309dc2fe18b15dbc`.
- Inventario inicial: `3f5fa92`; sistema visual: `5a15e7a`; ajustes y Canvas: `6da8221`; prioridad de partido y captura: `fca1959`.
- Este cierre documental se guarda en un commit posterior; consultar `git log -1` para su SHA.
- No se mezcló `main` ni se desplegó sobre la web pública. La rama contiene el parche completo para revisar e integrar.

## Dirección y arquitectura

**Fútbol premium editorial:** azul marino mate, cobre para prioridad y selección, jerarquía de medio deportivo, identidad del futbolista y marcador de transmisión. Logo oficial conservado.

`src/editorial.css` consolida tokens de colores, tipografías, escala de espacio, radios, sombras, capas y movimiento. Se carga después de las capas históricas para conservar todas las pantallas y estados existentes. No se reescribe el proyecto ni el motor.

Barlow Condensed 600/700 e Inter 400/500/600/700 son locales, comprimidas en WOFF, con `font-display: swap`, alternativas del sistema y licencias OFL. Se elimina la dependencia de Google Fonts. Iconos lineales SVG propios para navegación y ajustes, sin bibliotecas adicionales.

## Inventario real y resultado

| Área | Pantallas, componentes y estados revisados |
|---|---|
| Entrada | Arranque con logo y estado de carga; creador inicial. La versión base no tiene un menú de inicio separado. |
| Creador | Identidad, Raíces, Futbolista, Mentalidad, Sueños y Resumen; presets, informe, posición, consecuencias y búsqueda de club favorito. |
| Legado / ADN | Ocho rondas, cartas de referentes, valores heredados, comparación, influencias recogidas y resumen del ADN. |
| Primer contrato | Tres propuestas, rol, duración, sueldo mensual/anual y firma. |
| Carrera y perfil | Identidad, club, edad, posición, proyección, contrato, economía, temporada, atributos, objetivos, rival por el puesto, representante y decisiones. |
| Partidos | Centro de partido, escudos, marcador, minuto, contexto, calendario, ritmo, instrucciones, controles y resultados. Los 20 minijuegos conservan física y lógica. |
| Narrativa | Acontecimientos, diálogos, alternativas, consecuencias, resultado y resolución automática. |
| Vestuario | Entrenador, competidor, club, relaciones, compromisos, memoria, sueño y ADN. |
| Historial | Temporadas, estadísticas, selección, hitos, competiciones, partidos, calendario, jugadas y veranos. |
| Mundo | Noticias, portadas, premios, generaciones, figuras, poder de clubes, catálogo, países y buscadores. |
| Clubes y plantillas | Fichas, carga/error, escudo, datos, búsqueda, filtro, orden, tabla, sin plantilla y sin coincidencias. |
| Competiciones y palmarés | Clasificación, filas del club propio, calendario, copas, grupos, trofeos, vitrina y detalle de copa. |
| Mercado | Ofertas, negociación, cesión, renovación, representante, sin ofertas y salida forzada. |
| Verano | Calendario de seis semanas, actividades, modos, coste, riesgo, servicios, acontecimiento, resultado, resumen, historial y exportación. |
| Retiro | Portada, tres actos, cifras, clubes, curva, recuerdos, premios, trofeos y acciones de exportación. |
| Ajustes y ayuda | Fondos, intensidad, profundidad, compacto, restauración, importar/exportar, nueva carrera, retiro, créditos e instrucciones de juego. No existe una pantalla de ayuda separada. |
| Componentes globales | Navegación, submenús, formularios, controles, barras, insignias, estados, notificaciones, diálogos y foco. |

Todas las áreas anteriores fueron revisadas en su código real y cubiertas por el sistema de presentación; los flujos principales y variantes descritas abajo se recorrieron en Chromium.

## Cambios de experiencia y correcciones

- Titulares deportivos, texto legible, cifras tabulares, superficies mates y cobre moderado; personalidad distinta para creación, noticias, partido, mercado, verano y retiro.
- En vistas apiladas, identidad y siguiente partido preceden al análisis secundario. En escritorio ancho, carrera y partido comparten columnas.
- Las tablas de historial y plantillas conservan columnas, incluido el valor de mercado en móvil, con desplazamiento local y ayuda visible.
- Ajustes con cierre superior reconocible, Escape, Tab/Shift+Tab contenido, fondo inerte y retorno del foco. Navegación actual y paso actual se anuncian; existe enlace para saltar al contenido.
- Los controles principales miden al menos 44 px en los recorridos comprobados. `prefers-reduced-motion` cubre CSS y efectos decorativos de Canvas: pulsos, ondas, cámara y partículas.
- Se corrige la captura accidental de clics en el selector del club favorito por el sistema universal de fichas. No se anotan botones, etiquetas ni términos del informe como si fueran clubes.
- Se corrige un aviso de rasgos que convertía dos veces las unidades: +4 puntos porcentuales aparecía como +400. Solo cambia la presentación, sin alterar bonos ni resultados.
- Cache de archivos modificados actualizada. Pages comprueba que existan la capa editorial y fuentes locales.
- Pruebas antiguas actualizadas al versionado vigente y al ciclo real de verano. Un bucle del test mundial quedaba infinito al llegar a la fase `summer`.

## Comprobaciones realizadas

### Código y motor

- Sintaxis de todos los módulos de `src/*.mjs` y `tests/*.mjs`: aprobada.
- `node --test --test-timeout=60000 tests/*.test.mjs`: **380 pruebas aprobadas, 0 fallidas**.
- `node tests/ui-smoke.mjs`: aprobado; repetido después del último ajuste de composición.
- `node tests/career-sim40.mjs`: cuatro carreras completas, CL/DC, AR/DFC, FR/MC y JP/POR; retiro en 21–22 temporadas.
- Regresión añadida para la presentación correcta de puntos porcentuales.
- Contraste de tokens en `docs/editorial-contraste.json`: texto principal 17.07:1, secundario 8.48:1, botón principal 5.74:1; estados funcionales al menos 4.76:1. No equivale a una certificación WCAG completa.

### Navegador y responsive

- Flujo: seis pasos → ocho influencias → ADN → contratos → firma → decisión narrativa → carrera → minijuego → simulación de temporada → resumen, hito de debut y calendario.
- Se recorrieron todas las etapas del creador en móvil, tablet y escritorio; se comprobaron selecciones, consecuencias, edición de resumen y búsqueda de Universidad Católica.
- Carrera, mercado, verano y retiro medidos a 360, 390, 430, 768, 1280 y 1920 px: `scrollWidth` del documento coincide con `clientWidth`. La carrera prioriza el partido en todos los anchos.
- Historial de tres temporadas: tabla de 680 px en contenedor móvil de 315 px, con scroll local y filas visibles.
- Fichas de Deportes Antofagasta y Barcelona: 30 y 25 futbolistas; filtros de porteros, búsqueda sin coincidencias, orden, cierre y vuelta al juego. Valor de mercado disponible en móvil.
- Mundo: noticias, rankings, catálogo desplegable y explorador; búsqueda Barcelona con ocho resultados, apertura de ficha y consulta de plantilla.
- Ajustes: cierre, ciclo Tab/Shift+Tab, Escape y retorno de foco comprobados.
- Apertura y cierre de los 20 minijuegos: Canvas y títulos correctos. Cinco familias revisadas a 390 px, con ayuda HTML visible y botón de inicio de 44 px. Una jugada de remate llegó al resultado normal `perdida`.
- Verano: elección de entrenamiento, coste aplicado, resultado, avance a semana 3 y resumen del resto hasta completar seis semanas.
- Retiro: siete secciones, estadísticas, dos trofeos, recuerdos y acciones, sin desbordes en seis resoluciones.
- Consola: sin errores de la aplicación en los recorridos finales. Los mensajes de la extensión del navegador de pruebas se excluyeron del diagnóstico del juego.
- Recursos de publicación preparados para QA con los scripts originales y activos del sitio; última vista comprobada sin imágenes rotas.

### Guardado y exportación

- Partidas de prueba generadas con el motor base antes de editar y cargadas con la interfaz nueva, incluidas una de tres temporadas y una de 21 temporadas.
- JSON exportado desde la interfaz y comparado: nombre, país, posición, atributos, edad, club, contrato, historial, trofeos y veranos idénticos. Los procesos originales normalizan mundo y finanzas al cargar.
- Ese JSON se volvió a importar mediante el selector de archivos real y se restauró la carrera: 489 partidos, 206 goles, 73 asistencias, dos títulos y 47 partidos de selección.
- Recuerdo PNG exportado desde la interfaz: imagen válida de 1400 × 1000 px.

## Límites reales y pendientes

**No hay tareas de implementación pendientes dentro del alcance visual revisado.**

- No se contó con un guardado personal del usuario. La compatibilidad se verificó con los guardados de prueba anteriores al cambio y las migraciones cubiertas por la suite.
- Revisión interactiva realizada en Chromium, con viewports efectivos mediante iframes de QA. No se ejecutaron Safari/WebKit, Firefox ni dispositivos físicos en esta sesión.
- Los recursos de escudos, fotografías y trofeos que Pages genera mantienen su pipeline original y sus fallbacks existentes. No se altera ni se amplía la base de jugadores o clubes.
- No se hizo una auditoría WCAG exhaustiva ni se ejecutó toda posible combinación narrativa/deportiva; sí se revisaron sus componentes, estados y flujos representativos.
- La publicación pública queda para la integración de la rama en `main`; no es una funcionalidad faltante del parche.

## Evidencia y continuación

Captura real: `docs/renovacion-visual-carrera.jpg`.

Para revisar o continuar: abrir `visual/premium-editorial`, comprobar `git status` y `git log -5`, y ejecutar las pruebas anteriores. Entrada real: `index.html` → `experience494.mjs` → `experience.mjs`; capa visual `editorial.css`; accesibilidad `editorial-ui.mjs`. No reiniciar desde ZIPs anteriores ni desde otros checkouts de parches.

No hace falta rehacer el diagnóstico, inventariar otra vez ni reemplazar el motor. Cualquier modificación nueva debe conservar el importmap y el pipeline de Pages, volver a comprobar los tamaños afectados y quedar registrada aquí.
