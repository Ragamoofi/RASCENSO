# RASCENSO 4.9.4 · Países, clubes y fichajes en Mundo

Base: `main` `0e069da4dfa0556c9382ac5da6ef131a89b651cc` (4.9.3).

## Cambios

1. En **Balón de Ascenso**, rankings anteriores pueden carecer de `cc` incluso si corresponden a un jugador real. Se consulta el UID estable del jugador en la base mundial empaquetada y se muestra su nacionalidad, nunca la del equipo. El render utiliza un estado derivado que no escribe en el guardado.
2. Las noticias de fichajes podían mostrar `Traspaso de es-2 a es-1` y titulares genéricos. Se resuelven los IDs con el catálogo de clubes del juego. Cuando falta una correspondencia, se indica que el club no está identificado.
3. Para transferencias entre clubes, las noticias presentan una tasación aproximada con la misma función `marketValueEUR` que usa RASCENSO, incorporando prima de comprador y una variación determinista de ±10 %. Se etiqueta **traspaso estimado** porque el motor histórico no ha contabilizado una cuota real negociada. No se altera presupuesto, contrato ni historial.
4. La información de nacionalidad proviene del directorio global y nunca se confunde con el país de origen del club. Nombres homónimos ambiguos no se fusionan.

## Compatibilidad

Es una adición sobre 4.9.3: `index.html` reemplazado; cuatro módulos nuevos en `src`; sin modificar `world20.mjs`, `ui20.mjs`, `engine.mjs`, datos mundiales ni partidas. Import-map mantiene el módulo 4.9.3 de rankings y presenta UI 4.9.4.

## Validación

`node --test tests/world-news494.test.mjs` — 6 pruebas: banderas históricas, traspaso con clubes reales, ausencia de montos infundados, lesiones sin cambios, valor económico proporcional y no duplicación. Validación visual sobre GitHub Pages pendiente de que se publique el parche. El error previo de `tests/browser/trophies45.cjs` no forma parte de este cambio.
