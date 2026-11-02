# RASCENSO — Premium compacto

Estado: implementación completada, CI independiente aprobada; PR disponible para revisión humana antes de fusionar.

- Base comprobada con `git fetch origin main`: `af565af8a36252c085ed7d9744823a06c5d5f57c`.
- Rama: `ux/premium-compacto`. No fusionar automáticamente.
- Dirección: conservar azul marino mate, cobre, Inter, Barlow Condensed y logo; reducir desplazamiento mediante composición, columnas y acciones próximas.

## Auditoría real previa

Chromium, siete viewports CSS efectivos dentro de un iframe a tamaño exacto, escalado únicamente para capturar en la ventana disponible: 1920×1080, 1600×900, 1366×768, 1280×720, 768×1024, 390×844, 360×800. Las medidas son píxeles CSS del juego, no píxeles de la imagen escalada. Capturas iniciales y mosaicos por tramos del scroll principal. Los cuadros modales se miden por separado del documento de fondo.

Revisadas: seis etapas originales, Legado, ADN, contratos, carrera, narrativa, balance anual, mercado, verano, historial, mundo, vestuario, retiro, ajustes y ficha de club/plantilla. Los 20 minijuegos comparten contenedor; en revisión individual.

Hallazgos confirmados:

- Creador: panel lateral con 13 consecuencias repetidas domina la altura; continuar queda a 1.767 px en Identidad/1366. Rejilla de identidad forzada a una columna.
- Carrera: simulación a 1.418 px/1366. Columnas de temporada deshechas antes de 1680; ficha lateral excesiva en móvil.
- Mundo: 5.275 px de documento/1366, catálogo/buscadores al final.
- Verano: primer modo a 744 px/1366; tres actividades no caben con su cabecera actual. Alturas mínimas y espacios de servicios desbalancean la vista.
- Legado: cartas de al menos 500 px y familias en un lateral muy largo.
- Minijuegos: rasgos repetidos y ayuda con scroll interior en móvil; debe conservarse la relación 16:9 del Canvas para no alterar coordenadas de interacción.
- `height:auto` y `overflow:visible` permiten un solo scroll de página: no son por sí solos un error. El problema medido es la composición y el contenido repetido.

## Inventario / alcance pendiente

1. Terminar auditoría individual de jugadas y guardar línea base.
2. Consolidar cascada CSS; creador seis etapas sin subpestañas, resumen editable, Legado y ADN.
3. Carrera: mando y próximo partido primero; columnas estables entre 1280 y 1679; decisiones y acciones arriba.
4. Verano: calendario compacto, tres propuestas comparables, acciones persistentes, servicios secundarios.
5. Mercado/contratos, mundo/búsqueda, vestuario, narrativa, balance, historial/competiciones, retiro, ajustes y clubes.
6. Recapturar siete resoluciones, comparar alturas/acciones, revisar contenido completo y ausencia de recortes/solapamientos.
7. Recorrer creación → Legado → ADN → firma → carrera → decisión → jugada → avance; guardado/carga, JSON, PNG, verano y filtros de plantilla.
8. Suite automatizada, regresiones pertinentes, informe por pantalla y PR sin fusionar.

## Continuidad

Último checkpoint: consultar `git log -1`. La composición compacta está implementada; aún faltan las verificaciones finales y el informe comparativo completo. `docs/ux-compacto/antes.json` conserva mediciones. El servidor QA vive en `.preview` (ignorado); el arnés de medición está versionado en `tests/browser/ux-audit`. No sustituir datos de partida por ejemplos en el producto.

El contenedor de la herramienta Chromium tuvo un límite de uso durante la primera sesión; acceso restablecido al continuar el 2 de noviembre. No se considera validado ningún resultado posterior hasta guardar capturas y repetir las medidas.

## Implementado (checkpoint, no cierre)

- Capas históricas aisladas en `@layer legacy`, sin `!important`; la presentación editorial gobierna la cascada.
- Seis etapas originales con barra de acción persistente, opciones en rejillas y resumen lateral editable. Bonos conservados en categoría y Resumen.
- Carrera: acciones arriba, partido y decisión en dos columnas desde 1200 px; todos los análisis y calendarios permanecen.
- Legado: tres cartas comparables, familias en referencia común; ADN y contratos compactos.
- Mundo: ambos buscadores al inicio; rankings en columnas y noticias con scroll local.
- Verano: tres actividades sin altura mínima, servicios en rail secundario y descanso/resumen persistentes.
- Minijuegos: ayuda HTML única, Canvas proporcional; sin modificar física ni dificultad.
- Narrativa, balance, tablas, vestuario, retiro y ajustes comparten la escala compacta.

Pruebas al checkpoint: `node --test --test-timeout=60000 tests/*.test.mjs`: **380/380**. `node tests/ui-smoke.mjs`: aprobado. Versionado actualizado en pruebas de carga; ninguna regla del motor modificada.

Pendiente prioritario: terminar comparación responsive de mercado/verano/mundo/historial/vestuario/retiro/club/ajustes; verificar las 20 jugadas, filtros y flujo completo; comprobar JSON/PNG y restauración; consolidar reglas editoriales repetidas y emitir PR.

### Segundo checkpoint de implementación

- Se retiran 9 KB de declaraciones editoriales sustituidas, manteniendo el orden de cascada. Cero reglas `!important` en las siete hojas activas.
- Buscador de clubes abierto por defecto en el nuevo dock de Mundo; no se altera el explorador cuando se usa fuera de él.
- Canvas ajustado a las alturas reales de cabecera, ayuda, rasgos y pie mediante `ResizeObserver`, sin modificar resolución, física o entrada. Observador y listener se desconectan al cerrar.
- Ocultar ayuda redimensiona en el mismo evento para mantener estable el cierre; estados `[hidden]` prevalecen sobre layouts responsive.
- 16/20 jugadas comprobadas individualmente: inicio HTML visible, ayuda oculta al empezar, proporción 16:9 y cierre. Faltan las cuatro de portería y completar el recorrido integral.
- Segunda suite completa: 380/380; simulación de cuatro carreras hasta retiro aprobada.
- Pendientes inmediatos: cuatro jugadas, revalidar Mundo y retiro/1280, creador móvil, JSON/PNG, filtros y navegación; guardar evidencias comparativas y abrir PR.


## Cierre de recuperación tras interrupción de Terra — 2 de noviembre de 2026

La rama `ux/premium-compacto` se recuperó con los commits `ce0c489`, `22b35d4` y `a76d3c3`, sin pérdida de cambios ni divergencias de `main`. Se abrió el [PR #8](https://github.com/Ragamoofi/RASCENSO/pull/8), sin fusionarlo ni publicar cambios.

### Comprobación independiente de GitHub Actions

- [Workflow de revisión UX #41408634807](https://github.com/Ragamoofi/RASCENSO/actions/runs/41408634807) — **dos jobs aprobados**.
- `node --test --test-timeout=60000 tests/*.test.mjs`: **380 aprobadas, 0 fallidas**.
- `node tests/ui-smoke.mjs` y `node tests/career-sim40.mjs`: aprobados.
- Chromium: **28 combinaciones** (Identidad, Futbolista, Carrera y Verano por siete resoluciones) sin errores JavaScript ni overflow horizontal.
- Capturas superiores, capturas completas a 1366 y 390, y `metricas.json` adjuntos como artefacto `ux-compacto-revision-chromium` del workflow. Estas imágenes permiten la revisión visual humana final; un resultado automatizado no equivale a certificación exhaustiva de diseño.

### Comparación cuantitativa de desplazamiento vertical

Documentos de la auditoría inicial (`docs/ux-compacto/antes.json`) frente al recorrido Chromium final en el mismo tamaño CSS. `Altura` corresponde a `document.documentElement.scrollHeight`.

| Vista | Resolución | Antes | Después | Reducción |
|---|---|---:|---:|---:|
| Identidad | 1366×768 | 2704 px | 1159 px | 57,1 % |
| Futbolista | 1366×768 | 2704 px | 1178 px | 56,4 % |
| Carrera | 1366×768 | 2731 px | 1585 px | 42,0 % |
| Verano | 1366×768 | 1074 px | 768 px | 28,5 % |
| Identidad | 390×844 | 5271 px | 3016 px | 42,8 % |
| Futbolista | 390×844 | 5684 px | 3388 px | 40,4 % |
| Carrera | 390×844 | 6007 px | 4596 px | 23,5 % |
| Verano | 390×844 | 2722 px | 1904 px | 30,1 % |

A 1366×768 el botón Continuar de Identidad pasó de posición vertical inicial 1767 px a aproximadamente 716 px, dentro del primer viewport al conservar su barra de acción. En Carrera la acción prioritaria pasó de 1418 px a aproximadamente 161 px. No se ocultan los apartados que ahora pueden consultarse más abajo.

### Alcance y limitaciones

- El cierre de la rama quedó verificado mediante CI y capturas; **falta la aceptación visual y de jugabilidad por parte del usuario antes de integrar a `main`**.
- La comprobación automatizada nueva cubre cuatro pantallas clave en siete viewports; Terra también dejó constancia de revisar el resto de pantallas y los veinte minijuegos, pero la nueva CI no repite exhaustivamente todos esos recorridos interactivos.
- No se probó el guardado personal del usuario, ni Firefox, Safari o dispositivos físicos.
- Ningún fichero de la rama se ha fusionado, desplegado ni usado para reemplazar `main` desde esta recuperación.

## Revisión visual final asistida — 2 de noviembre de 2026

### Evidencia visual y funcional
Se revisaron las **capturas renderizadas por Chromium**, no solo las hojas CSS ni sus métricas. Las imágenes proceden del workflow de la rama de trabajo.

- [CI de revisión extendida](https://github.com/Ragamoofi/RASCENSO/actions/runs/41411224700): dos jobs verdes.
- **380/380** pruebas del motor, más UI smoke y carreras completas.
- **28/28** combinaciones visuales principales (Identidad, Futbolista, Carrera, Verano × 7 resoluciones).
- **33/33** recorridos de interacción adicionales en 1366×768, 390×844 y 360×800: las seis etapas del creador, navegación entre Carrera/Vestuario/Historial/Mundo y elección de un modo de actividad en Verano. Cero excepciones JS y cero desbordamientos horizontales en esos recorridos.
- Capturas visibles de las cuatro pantallas principales en escritorio y móvil, y capturas de página completa para Carrera (1366) y Verano (390). Evidencia descargable desde el artefacto `ux-compacto-revision-chromium` del workflow.

### Hallazgos y últimos ajustes
1. **Creador móvil:** la introducción editorial duplicaba el texto explicativo de cada capítulo y consumía el primer viewport. Se conservó para lectores de pantalla, pero se retiró de la presentación visual bajo 768 px; sigue visible el título principal y la descripción propia de cada etapa. Las seis etapas permanecen a la vista, sin subpestañas.
2. **Tarjeta del jugador en móvil:** ajustes finos de separación económica y club para mantener visible Jugar próximo partido sin necesidad de grandes desplazamientos iniciales.
3. **Verano móvil:** las acciones de descanso y resumen persisten mientras se consulta la lista. Se añadió margen de desplazamiento al interactuar con los modos para reducir el riesgo de que una opción enfocada quede bajo los botones persistentes. Un clic real en un modo pasó el test de Chromium.
4. **Pantallas de escritorio:** el próximo partido y las decisiones comparten el área principal, los tres modos de actividad de Verano se muestran juntos y los beneficios del creador son consultables sin bloquear el avance. No se detectaron espacios vacíos grandes por alturas mínimas artificiales en las capturas revisadas.
5. **Cascada CSS:** esta revisión final no añade nuevas reglas `!important`; los ajustes responden a errores visuales concretos observados en Chromium.

### Métricas actualizadas
La primera auditoría de Terra quedó en `docs/ux-compacto/antes.json`. El test final registra lo siguiente:

| Pantalla | Resolución | Antes | Revisión final | Reducción |
|---|---|---:|---:|---:|
| Identidad | 1366×768 | 2704 px | 1159 px | 57,1 % |
| Futbolista | 1366×768 | 2704 px | 1178 px | 56,4 % |
| Carrera | 1366×768 | 2731 px | 1585 px | 42,0 % |
| Verano | 1366×768 | 1074 px | 768 px | 28,5 % |
| Identidad | 390×844 | 5271 px | 2939 px | 44,2 % |
| Futbolista | 390×844 | 5684 px | 3311 px | 41,7 % |
| Carrera | 390×844 | 6007 px | 4588 px | 23,6 % |
| Verano | 390×844 | 2722 px | 1904 px | 30,1 % |

Las pantallas de móvil siguen siendo verticalmente largas cuando contienen muchas alternativas; la barra de avance y las acciones principales quedan accesibles. Reducción de altura no significa necesariamente que todo el contenido quepa en el viewport.

### Resultado y límites
**Revisión final de composición y recorridos clave: aprobada para revisión del usuario.** Las pruebas del motor y navegador no evidencian regresiones en los flujos comprobados.

No se han repetido exhaustivamente todas las secuencias de los 20 minijuegos ni se ha realizado una auditoría completa de accesibilidad; Terra documentó el recorrido inicial, y la nueva revisión automática volvió a comprobar las pantallas principales y su navegación. No se verificaron Firefox, Safari, dispositivos reales ni guardados personales. La revisión definitiva de preferencia visual queda para el usuario.

**No fusionar desde la herramienta:** esta rama permanece separada de `main`, conservando el sitio público y las partidas de usuario.
