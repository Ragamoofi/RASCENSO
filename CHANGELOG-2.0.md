# RASCENSO 2.0 · Mundo Vivo — Registro de cambios

## 1. Errores y problemas estructurales corregidos

| Problema detectado (versión 1.8.2) | Corrección |
|---|---|
| Las carreras simuladas terminaban a los **44–47 años** y pasaban por **17–24 clubes**. | Declive por atributos con edad oculta de inicio, mercado que se enfría con la edad, retiro voluntario y escena de veteranía. Ahora el retiro suele llegar entre los 34 y los 39 años (tope de seguridad a los 44) y la mediana es de unos 4 clubes por carrera. |
| **La media no dependía de los atributos**: un delantero podía tener Defensa 80 y Pase 82 con media 64. Las escenas subían la media sin tocar ningún atributo. | La media se calcula siempre con `ovrFromAttributes(puesto, atributos)`. Cuando una escena mejora la media, sube un atributo real. |
| El juvenil heredaba valores casi de leyenda (hasta 87) desde el primer día. | El juvenil empieza con un valor modesto (34–66) y un **techo** propio en cada faceta. La carta del draft muestra la cifra de la leyenda, tu valor real y el techo estimado. |
| Ser superestrella era prácticamente imposible (ninguna de 30 carreras pasó de 84) y los defensores quedaban topados en ~68 de potencial. | Techos por atributo con talento oculto de cola larga. En 160 carreras simuladas: mediana de 72; según el estilo de draft, entre el 4 % y el 10 % llega a 85 o más y entre el 0,8 % y el 1,9 % a 90 o más. |
| El nombre del entrenador era fijo por país y **no cambiaba al cambiar de club**. | Cada club tiene su entrenador; al fichar, la relación empieza de cero con el técnico real. |
| El rol (titular/suplente) se calculaba contra una cifra abstracta del club. | Compites contra un compañero concreto, influido por la confianza, el estilo del técnico y tus compromisos. |
| Mercado demasiado frecuente: casi todos los años se abría una ventana. | La ventana se abre por contrato, por pedido propio, por interés de un club o cuando superas claramente a tu club. |
| Al escribir el nombre en el creador y pulsar «Continuar», **el primer clic se perdía** (el campo redibujaba la pantalla al perder el foco). | Los campos de texto ya no redibujan la pantalla al perder el foco. |
| A 1366×768 la tarjeta del jugador quedaba aplastada e ilegible. | El carril izquierdo se desplaza en vez de comprimir su contenido. |
| En 1920×1080 el botón «Simular temporada» quedaba fuera de la vista (contenido de 1329 px en un panel de 866 px). | Vista de temporada en dos columnas: información y acción a la izquierda; decisión y jugada a la derecha, sin desplazamiento. |
| La tabla del historial se colapsaba a altura 0 al añadir contenido. | El archivo se desplaza como documento. |
| La confianza del técnico y la moral se saturaban en 100 % por la acumulación de escenas. | Rendimientos decrecientes en las escenas, límites por temporada y tendencia a estabilizarse. |
| Código muerto: `src/app.mjs` y `style.css` (interfaz 1.0) no se cargaban desde ningún sitio. | Movidos a `legacy/` con una nota; ya no se publican en GitHub Pages. |

## 2. Sistemas mejorados

- **Progresión** (`src/career20.mjs`): crecimiento por atributo según edad, perfil de desarrollo (precoz/tardío), minutos (con piso formativo para juveniles en cantera y reserva), nota media, estilo del entrenador, pretemporada (que ahora prioriza atributos concretos), personalidad y compromisos. Hay explosiones de talento, estancamientos, secuelas de lesiones graves y declive diferenciado: la velocidad cae antes y el pase y la lectura de juego se mantienen más tiempo.
- **Proyección visible**: los ojeadores muestran un rango de potencial que se estrecha con la edad. Los ojeadores no son infalibles.
- **Nota media por temporada** calibrada: mediana ≈ 6,7; una temporada de 7,4 ya es sobresaliente. Con pocos minutos, la nota se acerca a lo esperado (sin notas infladas para suplentes).
- **Mercado** (`src/market.mjs`): prestigio dinámico de los clubes, demanda que tiene en cuenta la nota, veteranos con menos ofertas, directiva que influye en renovaciones y salidas, e interés de clubes que se concreta en una oferta.
- **Ligas** (`src/league.mjs`): los niveles de los clubes cambian según el mundo de la partida; el rol, los minutos, las lesiones y los goles reciben los efectos del entrenador y de los compromisos.

## 3. Mecánicas nuevas

- **Mundo vivo** (`src/world20.mjs`): simulación anual de todas las ligas del catálogo; evolución del nivel de los clubes; inversiones y crisis; despidos y llegadas de entrenadores con seis estilos; más de 40 futbolistas ficticios (estrellas, tu generación, promesas nuevas cada año y un rival generacional) que progresan, se traspasan y se retiran, con renovación automática de la élite; noticias contextuales; campeones por año.
- **Premios individuales**: Balón de Ascenso (top 10), Trofeo Promesa (sub-21) y, en tu liga, Bota, Mejor jugador, Revelación y Guante. Afectan a la reputación, la moral y el mercado.
- **Vestuario**: competidor directo que envejece, mejora, se marcha o es reemplazado por un fichaje o un canterano; directiva; hinchada; capitanía; estatus de ídolo.
- **Objetivos de temporada** de la directiva (título, puestos altos, mitad superior, permanencia o ascenso) y del técnico (goles, participaciones de gol, vallas invictas o partidos), además de una meta de continuidad.
- **Compromisos con memoria** (17 tipos): promesa de minutos, pedido de salida, desafío público, doble turno, prueba en otra posición, club interesado, rebaja solidaria, capitanía, mentor, regreso apresurado, conflicto con la hinchada, ultimátum de la directiva, ausencia en la selección, asunto familiar, polémica mediática, plan profesional y última función. Tienen efectos reales en la simulación y desencadenan escenas posteriores, como la promesa rota.
- **22 escenas nuevas** (`src/story20.mjs`), elegidas por el contexto real. Cada opción muestra sus consecuencias.
- **Cambio de posición**: se propone cuando tus atributos rinden más en un puesto vecino.
- **Ascensos y descensos** detectados para tu club, con escenas propias.
- **Negociación de ofertas y renovaciones**.
- **Retiro voluntario** desde los 32 años, temporada de despedida y veredicto de legado (leyenda mundial, estrella de élite, ídolo de un club, coleccionista de títulos, trotamundos…).
- **Récords e hitos**: mejores temporadas, club de tu vida, hitos de partidos, goles y asistencias, premios y gráfico de evolución de la media frente a la proyección.

## 4. Cambios visuales

- Nueva pestaña **Vestuario** y pestaña **Mundo** rediseñada.
- Tarjeta del jugador con proyección y nota; atributos con barra de valor y marca de techo; filigranas y pierna mala con estrellas.
- Temporada a dos columnas con objetivos, duelo por el puesto, entrenador y compromisos activos.
- Cierre de temporada con objetivos cumplidos o fallados, premios y ranking, desarrollo y titulares del mundo.
- Decisiones con fichas de consecuencias; mercado con negociación, entrenador y tendencia del club; expediente final con veredicto de legado y premios.
- Animaciones sutiles de entrada (desactivadas con `prefers-reduced-motion`), diseño adaptable a 1920, 1366, 1280 y 390 px sin desplazamiento horizontal. Se mantienen la paleta azul marino y cobre y el logo oficial.

## 5. Pruebas

- `node --test tests/*.test.mjs`: **125 pruebas superadas** (113 existentes + 12 nuevas en `tests/world20.test.mjs`).
- Pruebas existentes actualizadas: 5 esperaban la versión de guardado 8 (ahora 9), 2 exigían carreras de más de 40 años (el defecto corregido), 1 comparaba atributos antes de una escena que ahora mejora atributos reales y 1 buscaba un club sin sincronizar el vestuario.
- `node tests/ui-smoke.mjs`: actualizada para la interfaz 2.0.
- `tests/browser/e2e.cjs` (nueva, opcional): recorre en un navegador real la creación, el draft, el contrato, las escenas, más de 9 temporadas, la negociación y todas las pestañas, comprobando que no haya errores de JavaScript ni desplazamiento horizontal. Se ejecutó con Chromium (motor de Chrome, Brave y Edge). Firefox no estaba disponible en el entorno de trabajo: se revisaron estáticamente las APIs utilizadas (`Array.at`, `findLast`, `replaceAll`), que son compatibles con las versiones actuales de Firefox.
- Migración probada con una partida real generada por el código 1.8.2 original: carga, conserva historial y títulos, y se puede jugar hasta el retiro.

## 6. Pendientes y limitaciones conocidas

- Firefox no pudo probarse en un navegador real en este entorno (ver arriba).
- Los futbolistas del mundo tienen media y estadísticas, pero no plantillas completas por club; tu competidor directo y los rivales de premios se generan.
- Los niveles base de los clubes siguen viniendo del catálogo de referencia (escala 55–80), que no siempre refleja el prestigio real; el mundo vivo los modifica a partir de ahí.
- Los ascensos y descensos reales solo existen en los países con dos divisiones verificadas (Chile y Brasil); en el resto, la evolución se refleja en el nivel de los clubes.
- La simulación sigue siendo por temporada completa: no hay partidos jugados fecha a fecha, salvo la jugada decisiva.
- Las fotografías, los escudos generados y los logos de competiciones se crean durante la publicación en GitHub Pages (`pages.yml`). En local se ven los respaldos tipográficos.

## 7. Revisión 2.0.1 (con las skills `code-review`, `simplify` e `impeccable`)

**`code-review` — 10 errores corregidos**
- En ligas no verificadas (por ejemplo, Japón), el mundo volvía a simular tu liga con otro resultado. Ahora usa la tabla que jugaste.
- Una escena con efecto negativo sobre la media se anulaba en silencio.
- Una partida antigua cuyo club había quedado inactivo no cargaba.
- El veredicto «Ídolo de…» nombraba el club equivocado.
- El rival generacional podía desaparecer en carreras largas al recortar la lista de futbolistas.
- Una pretemporada táctica de años anteriores seguía dando ventaja.
- Una relación con confianza 0 se trataba como 50.
- Tras compactar el guardado, el respaldo grande se volvía a escribir y llenaba de nuevo el espacio.
- Había una fórmula de prestigio duplicada y algo de código sobrante.

**`simplify` — cuatro revisores (reutilización, simplificación, eficiencia y altura)**
- Helpers duplicados eliminados: `clamp`, `hash`, `rng`, `careerYear`, el catálogo de clubes, el escapado HTML, el formato de números y la paleta de tarjetas. Ahora hay un único escapador HTML.
- Nuevos helpers compartidos: `keysByWeight`, `potentialFrom`, `adjustOvr`, `pushNews` y `ELIGIBLE_CLUBS`.
- Arreglos de raíz en lugar de parches:
  - Las escenas mueven atributos reales dentro de `resultOfScene`, y los efectos extendidos (hinchada, directiva, compromisos…) valen para cualquier escena.
  - El cambio de entrenador se detecta en `syncClub`.
  - La liga usa un único algoritmo de rol.
  - El mercado usa el prestigio dinámico en todos los casos.
- Rendimiento:
  - `pickClubNear` hace una sola pasada sobre el catálogo.
  - El prestigio base está en caché.
  - Los rankings por grupo y los campeones usan `Map` y `Set`.
  - La jugada de temporada se memoriza por estado.
  - No se reescribe un guardado sin cambios.
  - Resultado: la simulación es alrededor de un 10–20 % más rápida.
- Verificación: una huella de 12 carreras completas hasta el retiro, resumidas en un hash, se mantuvo **idéntica** antes y después de todos los refactors. Estos cambios no alteraron la simulación.
- Omitido a propósito:
  - Recortar automáticamente las temporadas antiguas al guardarlas, porque cambiaría lo que muestra el historial.
  - Reescribir todas las escenas para recibir el contexto como parámetro (se resolvió con una caché por estado).
  - Consolidar los `!important` antiguos del CSS (es solo cosmético).

**`impeccable` — auditoría y pulido de la interfaz**
- Foco de teclado visible y uniforme en toda la interfaz (antes casi no existía).
- El botón principal ahora supera el contraste AA de 4,5:1 (antes 3,99).
- Ningún texto informativo baja de 10 px.
- Cifras tabulares en las tablas.
- Áreas táctiles de 36 px en móvil.
- Corregido el desborde horizontal en 390 px: la cabecera con 4 pestañas y el mercado.
- Carril del jugador a una columna en móvil.
- Las referencias internas de la skill no estaban instaladas en este entorno, así que la auditoría se hizo con un script propio (contraste WCAG, tamaños, áreas táctiles y desbordes en 8 pantallas, a 1920 y a 390 px).

**Realismo detectado durante la revisión**
- Los niveles del catálogo original infravaloraban a varios gigantes (Arsenal 67, Atlético 67, Getafe 71), y el Real Madrid o el Liverpool podían terminar últimos. Ahora los clubes reconocidos tienen un nivel mínimo acorde a su prestigio (`simLevel`).
- Un entrenador que termina en el podio ya no puede ser despedido al azar.
- En 4 carreras × 20 temporadas, LaLiga la ganan sobre todo el Real Madrid y el Barcelona, y la Premier el City, el Arsenal y el Liverpool, con sorpresas ocasionales.

Pruebas: **126 superadas** (se añadió una de realismo de ligas), más la prueba de humo de la interfaz y el recorrido en navegador sin errores.
