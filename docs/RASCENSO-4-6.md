# RASCENSO 4.6 — Historial, Selección y Legado

## Historial sin duplicaciones
- Cada temporada muestra el escudo del club, su nombre completo (truncado solo en pantalla y recuperable al pasar el mouse), y hasta cuatro miniaturas PNG de sus copas, con nombre en tooltip. Los títulos adicionales se resumen con un contador.
- Los trofeos se obtienen de `trophyRecords` filtrando club y temporada; si el guardado es anterior al catálogo, se recuperan de `history[].titles`, excluyendo los trofeos evidentes de selecciones.
- Eliminado el panel redundante «Por club» de la parte inferior. Se conservan el gráfico de media, récords y premios, más el detalle de competiciones bajo su año.

## Informe de selección en Historial
Aparece si el futbolista ha jugado por su país y utiliza únicamente la información guardada:
partidos, goles, asistencias, minutos, temporadas con convocatoria, competiciones, títulos, victorias, empates, derrotas y goles del equipo a favor/en contra. Para arquero se indica las porterías a cero **del equipo**, no una estadística individual inventada. Los marcadores se cuentan solo cuando se conoce el equipo y el resultado de un encuentro en el que participó el jugador. Si faltan fixtures de partidas antiguas se muestran guiones, nunca porcentajes inventados.

## Legado 1920×1080
- Encabezado mucho más compacto, sin perder nombre, años, firma ni equipo final.
- Tres actos con menos alto y las cifras relevantes visibles.
- Estadísticas en banda horizontal y tarjetas con grilla de dos columnas, menos relleno y menos desplazamiento.
- El ajuste agresivo se aplica solo a pantallas anchas y altas; el móvil conserva el layout adaptativo.

## Vitrina
La caja compacta aumenta a 135 px, suficientes para PNG completos, nombre de hasta tres líneas y desplazamiento horizontal; se conserva el aspecto libre sin recuadros individuales. El diseño previo de 97 px recortaba copas y textos.

## Verificación
- `tests/history46.test.mjs` para asociación de copas, selección y compatibilidad con guardados antiguos.
- `tests/browser/retirement42.cjs` comprueba compactación de 1920×1080, y luego navegación al Historial con miniaturas y selección.
- `tests/browser/trophies45.cjs` conserva verificación de vitrina y navegación móvil, con límite de alto ampliado a 138 px.
- Motor y guardados no se alteran. Las estadísticas antiguas se conservan sin migraciones forzosas.
