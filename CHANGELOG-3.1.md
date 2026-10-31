# RASCENSO 3.1 · Creador, Legado y ADN — Registro de cambios

## Diagnóstico del sistema anterior

Auditoría de todas las elecciones del creador y de su efecto en la carrera:

| Hallazgo | Estado anterior |
|---|---|
| **Origen «Club amateur»** | Prometía «mayor crecimiento cuando tienes minutos» y no hacía nada. |
| **Sueño, entorno, senda de desarrollo** | Casi sin efecto: el sueño solo pesaba en el sorteo de escenas. La senda de desarrollo no cambiaba qué atributos crecen. |
| **Perfiles de decisión** | «Cerca de mi gente», «Aventurero» y «Lealtad al escudo» no tenían efecto en el mercado. |
| **Pierna hábil, dorsal, «historia»** | Cosméticos o ignorados. La historia personal ni siquiera se usaba. |
| **Draft de legados** | El referente de cada carta se elegía al azar, así que un portero podía ofrecerte «Tiro». Ninguna influencia dejaba una huella de estilo. |
| **Navegación** | Las pestañas del creador solo permitían retroceder, no saltar hacia adelante. |
| **Persistencia** | El borrador se perdía al recargar la página. |
| **Espacio** | El diseño usaba ≈1450 px de 1920 y todo era un listado largo de tarjetas de texto. |

## Nuevo sistema de identidad (`src/identity30.mjs`)

Un único módulo reúne las elecciones del creador y sus efectos:

- **Efectos de cada opción** (`choiceFx`):
  - desarrollo global, juvenil, con pocos o muchos minutos, y por atributo;
  - años de declive, techos por atributo, valores de arranque, serenidad, presión;
  - bonos anuales de moral, confianza del DT, reputación, hinchada y directiva;
  - mercado, convocatoria a la selección, amague, entrada, reflejos y sprint.
  - Los efectos que ya existían en el motor se describen en las fichas, pero **no se aplican dos veces**.
- **Familias de ADN de los referentes.**
  - Las 78 leyendas se clasifican en 7 familias, repartidas entre 7 y 14 leyendas cada una. Se normaliza su perfil respecto al catálogo y se fijan a mano las figuras cuyo recuerdo no coincide con sus números.
  - Cada familia tiene un rasgo, un conjunto de techos y modificadores, y un **coste**:
    - el velocista pierde ritmo antes y se lesiona más;
    - el muro marca menos;
    - el creador, menos goles.
- **ADN del jugador** (`dnaFromPicks`): la familia más repetida entre tus 8 influencias es tu ADN. Si ninguna domina, eres **Mosaico**. Puede haber una familia secundaria al 50 %.
  - **Encaje con el puesto:** natural (100 %), parcial (85 %) o atípico (60 %).
- **Sueños con meta medible** (`dreamProgress`): 9 metas con su unidad, objetivo y recompensa única (reputación, moral, hinchada, directiva, premio de carrera y la escena «Sueño cumplido»).

## Qué cambia en la carrera

| Elección | Efecto real |
|---|---|
| **Formación** | Amateur: +10 % desarrollo si juegas mucho. Barrio: +12 % desarrollo con pocos minutos, +5 de moral inicial. Cantera: +10 de confianza del DT y más desarrollo juvenil. Academia: +4 de reputación, +1 a Tiro, Pase y Regate, y más presión. |
| **Entorno** | Serenidad, vínculo familiar inicial, techos físicos, adaptación al jugar fuera, desarrollo. |
| **Desarrollo** | Técnica favorece Pase y Regate; lo físico, Ritmo y Físico; la táctica, Defensa y Pase; mental da serenidad y moral; recuperación y maduración tardía retrasan el declive. |
| **Carácter, estilo, imagen** | Se suman bonos anuales de confianza, reputación, hinchada y directiva, además de los efectos de partido que ya existían. |
| **Fortaleza y debilidad** | Suben o bajan el techo del atributo asociado. |
| **Sueño** | Bonos pasivos (convocatoria a la selección, mercado hacia los grandes, hinchada…) y la meta con su recompensa. |
| **Edad de inicio** | 18 años: +2 y 19 años: +4 a los atributos clave al empezar. |
| **Pierna hábil** | Zurdo: +1 de demanda de mercado y +2 % de minutos en bandas izquierdas; extremo derecho zurdo = perfil invertido. |
| **Modo Purista** | +1 de techo en todo como premio por elegir sin ver las cifras. |
| **ADN** | Goles, asistencias, lesiones y minutos; amague, entrada, reflejos, sprint y precisión de pase en las jugadas; techos y velocidad de declive del ritmo. |
| **Perfiles de decisión** | «Cerca de mi gente», «Aventurero» y «Lealtad» ahora pesan en las ofertas. |

## Interfaz

- **Creador en 6 pasos** (`src/creator30.mjs`):
  - posición elegida sobre una cancha, clases con sus bonos y barras con la importancia de cada atributo en tu puesto;
  - tarjetas con icono, descripción y los efectos de cada opción (verdes: ventajas; rojos: costes);
  - panel lateral con el cartel del jugador y las consecuencias de lo que llevas elegido;
  - perfiles sugeridos y «Sorpréndeme»;
  - resumen con frase de presentación, botones de edición por decisión y radar de bonos de arranque y techo.
  - Aprovecha 1920×1080: los pasos Identidad, Raíces, Sueños y Resumen caben sin desplazamiento; Futbolista y Mentalidad, con 24-25 opciones, se desplazan solo dentro del panel.
- **Legado**:
  - 3 cartas por ronda con el radar del referente, valor de la leyenda → tu juvenil → techo, familia de juego y rasgo;
  - panel con tu radar en construcción, el ADN que se forma, tus influencias elegidas y las 7 familias.
- **ADN heredado:** al cerrar el draft se muestra una tarjeta con la familia, el rasgo, el encaje, los efectos y el radar. El ADN y el sueño aparecen en la tarjeta del jugador, en Vestuario y en el expediente final.
- **Accesibilidad:** las tarjetas son controles de radio con foco visible y se pueden recorrer con teclado.
- **Responsivo:** 1920, 1366, 1280 y 390 px sin desborde horizontal.

## Correcciones durante la revisión

- Las pestañas del creador solo permitían retroceder.
- El borrador del creador no se guardaba y la «historia» se perdía al recargar (la detectó la prueba de navegador).
- La tarjeta del jugador recortaba su contenido por tener una altura fija.
- Al cambiar de paso, el panel conservaba el desplazamiento del anterior.
- La columna de la aplicación crecía con el contenido y provocaba desborde horizontal en pantallas pequeñas.
- Al elegir referentes por su valor, los techos de todas las carreras subieron unos 10 puntos. Se recalibró (mediana de pico 74; 85 o más en 7–9 %; 90 o más en 0–2 %), igual que antes de esta versión.
- La escena «Sueño cumplido» tiene prioridad sobre un cambio de entrenador.

## Pruebas

- `tests/identity30.test.mjs`: 12 pruebas nuevas.
  - Cada opción del creador tiene su ficha, sin fichas huérfanas.
  - Las 78 leyendas están clasificadas y todas las familias tienen representantes.
  - Las cartas son coherentes (valores no irrelevantes, familias variadas).
  - Dominante, Mosaico, secundario y encaje del ADN.
  - Determinismo del draft y migración.
  - Punto de partida por origen y entorno.
  - La senda de desarrollo cambia qué atributos crecen.
  - Las elecciones llegan al simulador de jugadas.
  - La meta del sueño se cumple una sola vez y premia.
  - Las 6 pantallas del creador se dibujan con cualquier posición y escapan el HTML.
  - Los perfiles sugeridos y aleatorios son válidos.
  - El equilibrio general se mantiene.
- `tests/browser/creator-e2e.cjs`: recorre el creador en un navegador real, con selector de cancha, clase, dorsal, sueño, salto entre pasos, recarga con borrador, perfil sugerido, edición desde el resumen, draft con cambio de propuestas, ADN, firma y comprobación de lo guardado, Vestuario y tarjeta.
- Total: **148 pruebas** superadas, más la prueba de humo de la interfaz y los recorridos en navegador (carrera completa, creador, 20 jugadas).

## Limitaciones conocidas

- Solo probado en Chromium (Chrome, Brave y Edge); Firefox no estaba disponible.
- Las fotografías de las leyendas se generan al publicar en GitHub Pages; en local se ven los fondos de respaldo.
- Los efectos de cada elección son pequeños por diseño. El equilibrio se verificó con carreras simuladas, pero puede requerir ajustes tras partidas reales.
- Los pasos Futbolista y Mentalidad requieren desplazamiento interno en 1920×1080.
