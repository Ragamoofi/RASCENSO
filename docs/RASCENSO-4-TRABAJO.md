# RASCENSO 4.0 · Estado de desarrollo

Rama de trabajo: `rascenso-4-integral`. Base: `bb85f188cf63e016ba8429b8d24b44d5320cfd00`.

## Avance
- Cancha cenital: trama estable de césped, red con profundidad y pelota con paneles. Pendiente de inspección visual de esta versión.
- Movimiento: aceleración y frenado; teclado y ratón cambian de modo según la última entrada, con diagonales normalizadas. Prueba real en navegador pendiente.
- Mano a mano: elección entre definición colocada y potente. Cabezazo y remate: momento de contacto influye en potencia.
- Recuperación y entrada: el cansancio reduce el margen. Anticipación: intercepción por trayectoria continua.
- Tiro libre: salto temporal de la barrera. Penal en contra: desvío visible. Reflejos: rebote según contacto y recuperación afectada por reflejos y cansancio.
- Fuera de juego: la decisión usa la posición real del último defensor, y la defensa del futbolista influye en la velocidad de la línea.
- Salida aérea: la captura depende de posición, altura, reflejos y presión; una falla deja rebote en juego.
- Despeje: el balón se sigue físicamente hasta salir del área, ser interceptado o llegar al arco; se retiró el resultado aleatorio instantáneo.
- Achique: movimiento manual y estirada tras el remate; el duelo a los pies usa posición y reflejos. Pendiente de probar equilibrio humano.
- Arquero frontal: silueta articulada con camiseta, pantalón, guantes y botas; falta inspección visual de esta versión.
- Penal: remate potente o colocado, con diferencias en precisión y velocidad; desvío animado de las atajadas con indicación de guantes o cuerpo. Pruebas unitarias iniciales.
- Selección: la división actual prevalece tras ascensos o descensos; la evaluación incluye minutos, titularidad, forma previa y experiencia internacional.
- Carreras completas simuladas: CL/DC 21 temporadas, AR/DFC 21, FR/MC 22 y JP/POR 22, todas hasta el retiro; se comprobó lectura del guardado y continuidad básica.
- Titularidad: el rendimiento previo en el mismo club influye moderadamente en la competencia por el puesto.
- Vestuario: una amistad con el competidor aporta moral mientras compartan club y abre una escena contextual con elecciones persistentes.
- Interfaz: nueva jerarquía visual, foco visible y ajustes de movimiento reducido. Pendiente de validación visual en navegador.
- Pase filtrado, contragolpe, centro y encare: el receptor define con un remate visible y el arquero puede reaccionar; la calidad del pase y espacio afectan la definición. El arquero de cancha puede equivocarse al anticipar.
- Opciones: engranaje y acceso a importar disponibles también en el creador, con preferencias persistentes. Pendiente de comprobación en navegador.
- Rondo: rivales reparten tareas entre perseguir balón, anticipar trayectoria y cubrir receptor según dificultad.
- Centro, encare, contragolpe y rondo: señal visual del espacio en la línea de pase al apuntar; no garantiza recepción.
- Mercado: la competencia conocida por el puesto en el mundo simulado afecta interés y rol de ofertas; sin datos no se inventa una vacante.
- Mercado temprano: el peso por país evita que la cantidad de clubes extranjeros domine las ofertas; conserva búsqueda internacional. Pruebas iniciales con semillas de Chile, Argentina, Francia y Japón.
- Auditoría local de 874 clubes: 826 fuentes identificadas, 48 pendientes y cero alias inválidos; falta revisión externa de las fuentes y su vigencia.
- Mundo: las promesas con partidos y progreso real pueden convertirse en revelaciones y generar noticias una sola vez.
- Mundo: lesiones reproducibles de futbolistas del mundo reducen partidos y oportunidades de desarrollo, y generan noticias verificables para figuras y rivales.
- Amagues: elegir dirección y ejecutarlos cerca del marcador puede desequilibrarlo según atributos y resistencia. El bot de encare pasó de 0/100 a 22/100 en nivel 55 y dificultad alta en la muestra evaluada.
- Equilibrio pendiente: el bot obtiene tasas extremas en varias jugadas; conoce información interna y no equivale a pruebas humanas. Se agregó una matriz de 100 semillas con dos niveles y dos dificultades.

- Pase filtrado: alternativa bombeada con clic derecho y desmarque hacia el punto elegido; aún requiere calibración y comprobación visual.
- Mundo: los juveniles generados se anuncian como incorporaciones, sin presentarlos como revelaciones antes de jugar.

- Recuperación: el portador intenta escapar lateralmente de la presión y escoge la línea de pase con más espacio.

## Pendiente para considerar 4.0 completo
- Completar la renovación individual de las 20 jugadas; hay cambios iniciales en penal, pases, duelos de banda, achique, salida aérea, despeje y fuera de juego.
- Rediseño de interfaz y accesibilidad en resoluciones y navegadores.
- Profundizar carrera, mundo, mercado, relaciones, selección nacional y narrativa; revisar creación y compatibilidad de guardados.
- Auditoría de escudos y fuentes verificables.
- Pruebas de carreras, tasas de éxito, controles, animaciones y diseño en navegador; comparación con la base.
- Integrar y desplegar solo después de comprobar los criterios del encargo.

## Continuación: ajuste de pase raso
- Último commit anterior a este ajuste: e832bb2b7480e6c30a39ada3327493b9eb3eaa2a. Este documento y el ajuste se guardan juntos en el commit siguiente.
- Se incrementó la velocidad del pase filtrado raso para reducir intercepciones inevitables. En 100 semillas por caso, el bot pasó de 19/2/26/9 a 31/11/55/13 éxitos (niveles 55 y 85, dificultades 0,25 y 0,85). El bot accede a información interna: falta validar con personas.
- La matriz sigue mostrando extremos en recuperación, achique, salida aérea y reflejos; priorizar su calibración sin resultados arbitrarios. El pase filtrado sigue difícil con dificultad alta.
- Pendientes: renovación individual y pruebas manuales de los 20 minijuegos, interfaz, mundo y narrativa; revisar los 48 escudos sin fuente y verificar externamente los demás. No fusionar ni desplegar hasta completar y validar.
- Antes de este ajuste: 214 pruebas locales aprobadas, cuatro carreras simuladas completas; pruebas de navegador anteriores aprobadas, sin validar visualmente este ajuste.
