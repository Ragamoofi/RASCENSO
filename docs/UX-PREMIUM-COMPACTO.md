# RASCENSO — Premium compacto

Estado: implementación de composición realizada; validación visual y funcional en curso.

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
