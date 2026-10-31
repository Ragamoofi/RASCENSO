# RASCENSO 3.0 · Jugadas Vivas — Registro de cambios

## Qué se reemplazó

**Antes (1.5–2.0):**
- Una sola jugada por temporada.
- La mecánica era casi siempre la misma: elegir izquierda, centro o derecha y luego detener una aguja o repetir una secuencia de tres flechas.
- Los atributos influían poco y no había contexto de partido.

**Ahora:**
- Hasta **3 jugadas por temporada**.
- **20 situaciones distintas** en un **motor 2D propio**.
- Mecánicas diferentes para cada posición.
- Rivales con IA, física de pelota, contexto real del partido e integración exacta con la simulación.

El sistema anterior sigue en el código (`moments15.mjs`) solo por compatibilidad: si una partida guardada ya tenía resuelta la jugada antigua de esa temporada, se respeta y se muestra.

## Arquitectura

| Archivo | Función |
|---|---|
| `src/plays30.mjs` | Lógica pura, sin DOM. Catálogo de 20 jugadas, repertorio por puesto y selección de partidos. Calcula contexto (minuto, marcador previo, presión, cansancio, dificultad), capacidades del jugador a partir de sus atributos, IA rival según la dificultad, resolución automática, saneamiento del resultado y efecto sobre el partido. |
| `src/match2d.mjs` | Motor 2D en canvas. Bucle con `dt`, entrada por ratón, táctil y teclado, y física de pelota (altura, rebote, rodadura, efecto). Dibuja la cancha, los jugadores, la pelota y el HUD (minuto, marcador, presión, cansancio, tiempo), la cuenta regresiva con lo que está en juego, los carteles, las partículas, la cámara lenta, el temblor y el viñeteado en jugadas decisivas. |
| `src/scenes-field.mjs` | 16 jugadas en vista cenital. |
| `src/scenes-goal.mjs` | 4 jugadas en vista de portería. |
| `src/plays-ui.mjs` | Tarjetas de la temporada y ventana de juego. |

## Jugadas por posición

| Puesto | Jugadas | Mecánicas propias |
|---|---|---|
| Delantero | Mano a mano · Penal · Cabezazo · Remate de primera | Conducir y rematar contra un arquero que achica y un defensor que persigue. Penal con pulso tembloroso y carga de potencia. Llegar al punto de contacto del centro y saltar a tiempo. Remate sin control cuando el balón cruza tu anillo. |
| Extremo | Duelo contra el lateral · Diagonal y rosca · Centro a la carrera · Tiro libre | Amague (Espacio o clic derecho) para desequilibrar al lateral. Rosca hacia el palo lejano. Centro a uno de tres compañeros que atacan el área con marcadores. Tiro libre con barrera que salta y efecto según arrastres el ratón. |
| Mediocampista | Pase filtrado · Contragolpe 3 contra 2 · Control del ritmo · Recuperación | Línea defensiva móvil con la línea del fuera de juego dibujada. Fijar a un defensor y decidir entre pasar o rematar. Mantener la posesión ante tres presionantes. Robar cuando el balón se separa del pie del rival. |
| Defensa | Duelo defensivo · Anticipación · Despeje aéreo · Línea del fuera de juego | Temporizar la entrada (entrar antes de tiempo es falta o penal). Leer la mirada del pasador, que a veces engaña. Ganar el salto al 9. Subir la línea en el instante del pase. |
| Arquero | Asedio de remates · Penal en contra · Achique · Salida por arriba | Tres remates seguidos con rebotes. Leer la cadera del pateador (si te adelantas, te cambia el lado). Reducir el ángulo y elegir cuándo salir a los pies. Atrapar entre empujones. |

## Atributos, contexto y evolución

- **Del atributo a la cancha:**
  - Ritmo: tu velocidad.
  - Tiro y Físico: potencia.
  - Tiro, con la presión y el cansancio: el desvío del remate.
  - Pase: velocidad y precisión del pase.
  - Regate y filigranas: eficacia del amague.
  - Defensa: alcance de la entrada y probabilidad de robo.
  - Físico: altura del salto.
  - Defensa y Ritmo: reflejos del arquero.
  - Moral, personalidad y debilidad: la serenidad (por ejemplo, «Sangre fría» frente a «Presión»).
- **Contexto real:**
  - El partido se elige del calendario simulado, con preferencia por partidos ajustados (empates o diferencias de un gol).
  - Las jugadas decisivas llegan en los últimos minutos, con más presión y un borde de pantalla que late.
  - El cansancio crece con el minuto y se mitiga con el atributo Físico.
- **Dificultad creciente:**
  - Depende del nivel del rival frente a tu media, el prestigio de tu club, la categoría, la presión y la experiencia acumulada.
  - Afecta la reacción y el alcance del arquero, la velocidad y la reacción de los defensores, la resistencia al amague, el engaño del pasador y la calidad del pateador rival.
- **Memoria:** el arquero rival estudia hacia dónde pateaste tus últimos penales.
- **Variedad:** cada temporada prioriza situaciones que no jugaste el año anterior. Titular: 3 jugadas; rotación: 2; suplente: 1.

## Integración con la carrera (sin contradicciones)

- La jugada parte del **marcador que el simulador ya calculó** para ese partido.
  - Ofensiva lograda: **+1 gol** del equipo, acreditado como gol o asistencia según lo que hiciste. Si en una jugada de asistencia rematas tú, cuenta como gol.
  - Defensiva lograda: **−1 gol rival**.
  - Fallida: el partido queda exactamente igual.
- El resto de la temporada no cambia. Verificado con pruebas: los demás resultados, la tabla y tus otros partidos quedan idénticos.
- Moral, confianza del técnico y reputación se ajustan **al cerrar la temporada**. Hacerlo antes alteraba los minutos simulados y cambiaba todo el calendario; este error lo detectaron las propias pruebas y quedó corregido.
- Puedes resolver una jugada automáticamente (se muestra la probabilidad estimada según tus atributos) o simular la temporada sin jugarlas; antes de simular se te avisa.
- Una carrera en la que no juegas ninguna jugada es **idéntica** a la de la versión 2.0.1 (comprobado con una huella de 8 carreras completas).
- El cierre de temporada muestra «Tus Jugadas Vivas» con el resultado final de cada partido, y quedan también en «Jugadas para recordar».

## Pruebas y equilibrio

- `tests/plays30.test.mjs` (10 pruebas nuevas):
  - repertorio por puesto;
  - determinismo;
  - +1 gol exacto sin cambios en el resto;
  - asistencia frente a gol;
  - defensa −1 y fallo neutro;
  - persistencia en la temporada;
  - influencia de los atributos y la presión;
  - variedad;
  - saneamiento del informe;
  - memoria de penales.
- `tests/browser/plays-e2e.cjs`: las 20 jugadas, con dos niveles de jugador y de dificultad, terminan siempre con un resultado y sin errores (40/40).
- `tests/browser/plays-harness.html` incluye un **bot competente** con una estrategia por jugada. Se usó para medir y ajustar el equilibrio. Durante el ajuste detectó varios errores, todos corregidos:
  - La pelota conducida no seguía al jugador: al rematar, salía desde la esquina de la cancha.
  - Fricción irreal: los pases perdían el 68 % de su velocidad por segundo.
  - Los centros eran imposibles de cabecear: ahora se marca el punto de contacto, no el de caída.
  - El centro elegía al compañero peor ubicado.
  - Había arqueros con alcance desmedido y defensas que ganaban siempre.
- Equilibrio final con el bot competente, que conoce la jugada de antemano: un jugador humano rendirá algo menos.
  - Ofensivas: entre un 25 % y un 85 % de éxito según el nivel del jugador.
  - Defensivas: entre un 50 % y un 90 %.
  - Ninguna jugada es imposible y todas escalan con los atributos.
- Toda la batería: **136 pruebas superadas**, más la prueba de humo de la interfaz y el recorrido en navegador.

## Limitaciones conocidas

- Solo se probó en Chromium (el motor de Chrome, Brave y Edge). Firefox no estaba disponible en el entorno: el código usa canvas 2D y eventos de puntero estándar.
- El equilibrio se midió con un bot. Puede requerir ajustes finos tras partidas reales de personas.
- Las jugadas ocurren solo en partidos de liga; las copas y la selección se siguen simulando sin intervención.
- Algunas jugadas defensivas siguen siendo relativamente fáciles para alguien con buenos reflejos (recuperación, achique).
