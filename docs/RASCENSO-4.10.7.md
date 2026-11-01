# RASCENSO 4.10.7 — El jugador siente sus decisiones

## Tres módulos complementarios

### Rasgos visibles
`traitSignals4110(state,play,playerStats)` calcula la diferencia real de cada rasgo respecto del mismo futbolista sin él. Solo se anuncian modificadores que cambian una capacidad en la escena (serenidad/nervios, amague, reflejos, alcance, sprint o desviación de pase). Los avisos muestran puntos porcentuales cuando corresponde, **no prometen** haber cambiado el resultado de un disparo. El panel de final de temporada muestra otros modificadores pasivos, como crecimiento y riesgo de lesión, declarados como multiplicadores y no causalidad ficticia.

### Variedad contextual
`contextVariation4110` añade una capa textual de presentación a las 20 jugadas existentes: clásico, última jornada real, primera temporada, últimos minutos, remontada, empate o lectura del rival. Se rota la presentación de cada tipo según cuántas veces fue jugado en temporadas anteriores. Si el calendario identifica explícitamente una `Final`, el evento recibe tratamiento de final. No se altera la física de pelota ni el balance existente de la jugada.

La selección narrativa ahora consulta `sceneSeen4110` además del `storyLog`, favoreciendo escenas sin estrenar en los dos catálogos. En escenas mundiales contextuales ya vistas, se exige un intervalo de tres años si hay alternativas. Las escenas urgentes de eventos nuevos (ascensos, cambios de DT, sueños cumplidos) siguen pudiendo aparecer cuando sus condiciones se cumplen.

### Hitos
`seasonMilestones4110` se ejecuta **después de simular la temporada** y registra primera participación profesional, primer gol, primera asistencia, debut de selección y primer título. Revisa primero el historial para no repetir hitos. Los anuncios aparecen durante el resumen de temporada y pueden consultarse luego en Historial. La vista de celebración guarda el estado de lectura en una preferencia local, separada de la partida.

## Compatibilidad
No modifica `SAVE_VERSION`, mantiene `migrateCareer`, agrega solamente `milestones4110` y `sceneSeen4110` al estado. Las partidas antiguas importadas no generan falsos primeros goles o títulos. No añade bibliotecas externas ni bases de datos. El ZIP tiene estructura de carpetas de la raíz y no incluye instaladores.

## Pruebas
- 34 pruebas locales de integración, opciones, narrativa y nuevos sistemas: todas aprobadas.
- 5 carreras completas de 19, 22, 22, 22 y 23 temporadas, posiciones DC, POR, MC, DFC, EI: retiros normales y estado de memoria persistente.
- Sintaxis de módulos JavaScript: verificada.
- Pendientes: validación visual real, navegador móvil, trabajo de GitHub Actions tras publicación.

## Límites relevantes
La simulación representa temporadas resumidas: la tarjeta de «primer gol» acredita la temporada, no una fecha exacta. La lógica de capítulos especiales de una final de copa queda preparada cuando el motor entregue una jugada con fase explícita Final; no se convierte artificialmente un partido de liga en final de copa. No se crean nuevas escenas jugables; las 20 situaciones reciben variaciones de presentación y memoria de escenas vistas.
