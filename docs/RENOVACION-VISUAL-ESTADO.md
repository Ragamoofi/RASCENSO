# Renovación visual — Fútbol premium editorial

## Base y continuidad
- Base comprobada contra `origin/main`: `b8462152cfa9f933a69e4f6f477e9f2fd1ee1794` (RASCENSO 4.11.0, 1 noviembre 2026).
- Rama: `visual/premium-editorial`.
- No existe AGENTS.md en el checkout ni en sus directorios ascendentes.
- Aplicación estática, sin framework ni package.json. Entrada `experience494.mjs` → `experience.mjs`, importmap, render por cadenas HTML. Ampliaciones de creador, clubes, hitos y verano.
- Motor, datos mundiales y claves/formato de guardado se conservan.

## Dirección
Azul marino mate, cobre para prioridad/selección, Barlow Condensed 600/700 para titulares y cifras; Inter 400–700 para lectura. Superficies sobrias, cabeceras editoriales, marcador de transmisión, filas y separadores en lugar de tarjetas idénticas. Fuentes locales con alternativas seguras. Tokens globales de color, tipografía, espacio, profundidad, movimiento y capas.

## Inventario real y revisión
| Área | Pantallas y estados existentes | Estado |
|---|---|---|
| Entrada | Arranque y creador inicial; no hay menú de inicio separado | Revisada (código + presentación) |
| Creador | Identidad, Raíces, Futbolista, Mentalidad, Sueños, Resumen; presets, informe, búsqueda club, selección de posición | Revisada (código + presentación) |
| Legado/ADN | Ocho rondas, cartas/referentes, comparación, coleccionados, resumen ADN | Revisada (código + presentación) |
| Primer contrato | Tres ofertas, sueldo, rol, firma | Revisada (código + presentación) |
| Carrera y perfil | Tarjeta, economía, atributos, temporada, objetivos, representante, decisiones | Revisada (código + presentación) |
| Partido | Previa/centro, calendario, dificultad/ritmo, 20 minijuegos, instrucciones, pausa, resultado, recap anual | Revisada (código + presentación) |
| Narrativa | Evento, alternativas, consecuencias, resolución automática | Revisada (código + presentación) |
| Vestuario | Plantilla, entrenador, relaciones, competencia por puesto, hilos | Revisada (código + presentación) |
| Historial | Estadísticas, temporadas, selección, competiciones, calendario, jugadas, hitos | Revisada (código + presentación) |
| Mundo | Noticias, rankings, premios, catálogo, países, búsqueda jugadores/clubes | Revisada (código + presentación) |
| Club | Ficha, carga, errores, búsqueda, filtro, orden, plantilla vacía | Revisada (código + presentación) |
| Competición | Clasificaciones, partidos, copas, grupos, calendarios y trofeos/detalle | Revisada (código + presentación) |
| Mercado | Ofertas, agente, negociación, renovación, cesión, sin ofertas, salida forzada | Revisada (código + presentación) |
| Verano | Seis semanas, actividades/modos, costes/riesgos, servicios, evento, resumen, historial, PNG | Revisada (código + presentación) |
| Retiro | Hero, actos, estadísticas, recuerdos, vitrina, historial, exportación PNG | Revisada (código + presentación) |
| Ajustes | Apariencia, compacto, fondos, profundidad, importar/exportar, nueva carrera, retiro, créditos | Revisada (código + presentación) |
| Global | Navegación, submenús, estados, foco, notificaciones y ventanas | Revisada (código + presentación) |

## Cambios implementados
- `src/editorial.css`: tokens y composición por familia de pantalla; responsive 360–1920, tablas con scroll local, tipografía legible, foco y movimiento reducido.
- Barlow Condensed 600/700 e Inter 400–700 locales, WOFF comprimido (sin petición de Google Fonts), licencias OFL incluidas.
- Creador con cabecera editorial, pasos semánticos y consecuencias originales; marca y arranque oficiales.
- `editorial-ui.mjs`: foco de destino, enlace para saltar al contenido, ajustes con foco contenido/restaurado, fondo inert, cierre superior y por fondo.
- Corrección comprobada en navegador: clic en un resultado del club favorito ya no es capturado por el sistema universal de fichas. Se excluyen controles/etiquetas y términos del informe del formador.
- Versionado de recursos modificados actualizado; semántica de navegación actual/paso/selección.
- Pruebas heredadas adaptadas a cache versionada y ciclo de verano real: un bucle antiguo de `world20.test.mjs` quedaba infinito al llegar a verano.

## Validación
- Checkout limpio de main antes de crear la rama.
- `git ls-remote origin refs/heads/main` coincide con la base.
- Preview gestionada disponible para revisión real en navegador.
- Pruebas del proyecto: `node --test tests/*.test.mjs`, `node tests/ui-smoke.mjs`; pruebas de navegador existentes requieren Playwright local y algunas conservan selectores anteriores a 4.9.7.

## Problemas conocidos
- Ficha de club original oculta valor de mercado en móvil: se corregirá manteniendo columnas y scroll local.
- La versión visual mostrada por extensiones no coincide con 4.11.0.
- Estilos previos usan fuentes remotas, muchos textos de 8–11 px, brillos, altura rígida y overflow oculto.

## Pendientes prioritarios
1. Terminar revisión real de resoluciones y flujos restantes.
2. Corregir hallazgos visuales de la revisión.
3. Recorrer flujo completo y variantes reales; comprobar resoluciones y tablas.
4. Ejecutar suite, revisar consola/recursos/guardado y corregir hallazgos.
5. Documentar evidencia, commits y limitaciones; subir rama final.

## Cómo continuar
Desde la rama indicada, revisar este documento y `git log -3`. No reutilizar el checkout de otros parches en /workspace. La preview utiliza una copia temporal ignorada en `.preview`; sincronizar allí los archivos cambiados antes de refrescar. No publicar ni mezclar main automáticamente: el usuario pidió rama de trabajo.


## Validación acumulada del navegador
- Chromium real, preview del código del checkout; recursos generados de Pages recuperados para revisar con escudos y fotografías auténticos (solo en copia QA, sin cambiar activos fuente).
- Flujo completo de 6 pasos → 8 influencias → ADN → tres contratos → firma → evento/decisión → carrera.
- Búsqueda Universidad Católica y selección sin abrir ficha accidentalmente.
- Ajustes: cierre superior, Tab/Shift+Tab contenido, Escape y retorno de foco a Ajustes comprobados.
- Clubes: Deportes Antofagasta y Barcelona; 30 y 25 futbolistas respectivamente, filtros por porteros y búsqueda sin coincidencias. Tabla conserva valor en móvil y scroll interno.
- Mundo: noticias, premios, generaciones, catálogo desplegable y explorador con ocho coincidencias para Barcelona.
- Historial de tres temporadas: tabla de 680 px en contenedor móvil de 315 px; sin desborde general.
- Mercado, verano y retiro: 360, 390, 430, 768, 1280 y 1920 px; scrollWidth del documento igual a su clientWidth.
- Verano: actividad elegida, coste aplicado, resultado, avance a semana 3 y resumen automático con seis semanas completadas.
- Apertura/cierre de los 20 minijuegos existentes, todos con Canvas y encabezado correctos; una jugada de remate terminó por la vía normal con resultado `perdida`.
- JSON exportado desde UI comparado con fixture de retiro anterior al rediseño: nombre, nacionalidad, posición, atributos, club, contrato, historial, trofeos y veranos se conservan. Los procesos originales normalizan mundo y finanzas al cargar; no hay cambios en el formato del guardado.
- 380/380 pruebas unitarias aprobadas; smoke de interfaz aprobado; cuatro carreras completas (CL/DC, AR/DFC, FR/MC, JP/POR) llegan al retiro en 21–22 temporadas.
- Contraste de tokens calculado en `docs/editorial-contraste.json`: texto principal 17.07:1, secundario 8.48:1, botón principal 5.74:1; estados funcionales ≥4.76:1.

## Refinamientos después de QA
- En móvil, identidad → centro de carrera → paneles secundarios → competiciones. No se eliminan datos.
- Iconos lineales SVG propios para navegación y ajustes; sin librería adicional.
- Marcador/brief/controles Canvas con Inter, Barlow y CTA cobre; reducción de movimiento cubre pulsos, ondas de resultado, cámara y partículas decorativas.
- Corrección exclusivamente de texto: los avisos de rasgos multiplicaban dos veces los puntos porcentuales (+400 en lugar de +4). Prueba de regresión agregada; bonos y física intactos.
- Ayuda visible para desplazar tablas de historial y plantillas en móvil.
- CI de Pages comprueba la presencia de la capa editorial y fuentes locales.
