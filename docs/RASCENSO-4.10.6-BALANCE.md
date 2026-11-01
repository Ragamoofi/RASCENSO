# RASCENSO 4.10.6 — Balance de elecciones

## Qué se ha cambiado

Se eligió la vía de **costes explícitos** en lugar de imponer un presupuesto nuevo de puntos: se conserva la interfaz del creador, el guardado y la posibilidad de construir estilos distintos. Las fortalezas especializan a cambio de sacrificar un crecimiento secundario; el modo Clásico y el perfil Calculador se mantienen neutrales (sin bono gratis).

Los costes se agregan a los efectos numéricos reales mediante `choiceFx`, separados de los efectos históricos de `career08.mjs`, evitando sumar dos veces beneficios y perjuicios. Las etiquetas de coste se muestran en segundo lugar para que no desaparezcan cuando el creador enseña dos efectos.

### Opciones más problemáticas

- **Recuperación:** mantiene la reducción del 20 % de lesiones ya aplicada por el motor y el retraso de 1,5 años del declive; ahora sacrifica un 8 % de crecimiento y un 1,2 % de minutos.
- **Mixta:** conserva un 5 % de crecimiento general; sacrifica un punto de techo en Tiro y Defensa, no en todos los atributos.
- **Mental:** conserva serenidad y desarrollo general; Ritmo y Físico crecen un 6 % más despacio.
- **Campesino:** conserva robustez, techo físico y crecimiento; Pase crece un 6 % más despacio.
- **Migrante:** conserva adaptación y minutos; empieza con tres puntos menos de confianza del técnico.
- **Maduración tardía:** mantiene la vida deportiva prolongada y sus techos; ahora tiene un 9 % menos de crecimiento general y un 1 % menos de minutos.
- **Carácter y otros grupos:** 41 nuevas advertencias de coste, incluyendo estilos, sueños, origen e imagen pública.

## Cómo se auditó

- **1.056 carreras completas** de la matriz final (66 variantes × 16 semillas). y **1.168 ejecuciones en total** contando las 112 de recalibración.
- Variantes evaluadas individualmente frente al resto de opciones de su misma categoría, manteniendo las demás decisiones constantes y **repitiendo las mismas semillas y puestos** por categoría.
- Siete posiciones rotatorias: DC, MC, DFC, POR, EI, MCD y LI; país Chile; edad inicial 17; draft y primera oferta automática; carrera simulada hasta retiro.
- Se extrajeron años de carrera, media máxima, minutos, goles, asistencias, semanas lesionado y títulos.
- **No es una simulación exhaustiva de las combinaciones cruzadas** (son más de cuarenta millones) ni un intervalo de confianza estadístico. Dieciséis semillas por variante sirven para detectar sesgos grandes, no para afirmar que todas las opciones tienen idéntica fuerza.
- Se ejecutó el **motor real** en modo offline; no se cargó toda la base mundial de 180.739 registros ni se simuló interacción humana con las Jugadas Vivas.

### Métricas de Desarrollo (promedios de 16 carreras completas)

| Senda | Media máxima | Temporadas | Goles | Asistencias | Semanas lesionado |
|---|---:|---:|---:|---:|---:|
| tecnica | 72.56 | 20.44 | 103.00 | 75.31 | 8.69 |
| fisica | 72.63 | 20.50 | 92.56 | 75.31 | 5.69 |
| tactica | 72.38 | 20.38 | 81.50 | 69.06 | 8.69 |
| mental | 72.69 | 20.31 | 91.00 | 72.44 | 6.06 |
| mixta | 72.31 | 20.31 | 87.00 | 73.75 | 6.19 |
| recuperacion | 71.75 | 20.94 | 88.38 | 79.06 | 6.25 |
| tardio | 73.69 | 21.50 | 112.56 | 77.94 | 5.13 |

### Lectura prudente de los resultados

- Recuperación ya no se comporta como una opción sin contrapartida: cede media, crecimiento y minutos frente a rutas especializadas, aunque protege la salud y alarga la carrera.
- Mixta dejó de estar penalizada en seis techos a la vez; se recalibró para que sea una alternativa de versatilidad y no una trampa de elección.
- Maduración tardía sigue mostrando un techo y una longevidad atractivos: **es la candidata más clara para otra ronda de balance**. Su coste recién agregado reduce la progresión y las oportunidades de minutos, pero la muestra es insuficiente para declarar perfecto el equilibrio.
- Ninguna comparación de medias implica causalidad universal: transferencias, recompensas, títulos y contexto de cada club varían incluso con semillas compartidas si una opción altera el camino de la carrera.

## Costes añadidos, opción por opción

### Formación de origen

- `barrio`: −4 % crecimiento con muchos minutos: formación informal.
- `cantera`: −4 % desarrollo si juegas pocos minutos.

### Entorno

- `sin_contactos`: −4 % interés en el mercado: sin contactos.
- `familia_futbolera`: +3 presión: expectativas del entorno.
- `club_formativo`: −4 % crecimiento con pocos minutos.
- `autodidacta`: −4 % crecimiento del Pase.
- `migrante`: −3 confianza inicial: adaptación al club.
- `campesino`: −6 % crecimiento del Pase.
- `escuela`: −4 % desarrollo juvenil: tiempo compartido.

### Senda de desarrollo

- `mental`: −6 % crecimiento del Físico y Ritmo.
- `mixta`: −1 techo Tiro y Defensa: sin picos de especialización.
- `recuperacion`: −8 % desarrollo general y −1,2 % minutos.
- `tardio`: −9 % desarrollo global y −1 % minutos: madurez tardía.

### Carácter

- `disciplinado`: −5 % interés externo: perfil de continuidad.
- `ambicioso`: +4 presión por expectativas altas.
- `leal`: −10 % interés externo por permanecer.
- `carismatico`: +3 presión por visibilidad pública.
- `sereno`: −4 % crecimiento al priorizar estabilidad.
- `lider`: −3 % desarrollo por deberes de liderazgo.
- `solidario`: −5 % goles por priorizar pases.

### Estilo de juego

- `equilibrado`: −3 % crecimiento de Tiro: sin especialización.
- `goleador`: −6 % asistencias: más remates propios.
- `creador`: −6 % goles: prioridad al pase.
- `asociativo`: −4 % goles: prefieres combinar.
- `aereo`: +3 % riesgo de lesión en duelos aéreos.

### Fortaleza

- `tecnica`: −2 % crecimiento Físico: énfasis técnico.
- `explosividad`: −2 % crecimiento Pase: énfasis en velocidad.
- `definicion`: −2 % crecimiento Defensa: énfasis rematador.
- `resistencia`: −2 % crecimiento Tiro: énfasis físico.
- `lectura`: −2 % crecimiento Ritmo: énfasis táctico.

### Sueño

- `seleccion`: −2 % crecimiento general por fechas internacionales.
- `idolo`: −7 % interés externo: prioridad a un club.
- `titulos`: +3 presión en partidos decisivos.
- `cantera`: −2 % goles: tiempo dedicado a enseñar.
- `regresar`: −6 % interés extranjero por volver a casa.
- `capitan`: −2 % desarrollo individual por liderazgo.
- `goleador`: −3 % asistencias: más foco en definir.
- `resistencia`: −4 % desarrollo juvenil: cuidar la carga.

### Imagen pública

- `referente`: −4 % interés externo por compromiso con el club.
- `solidario`: −2 % desarrollo por compromisos comunitarios.
- `analitico`: −3 % interés externo: perfil de sistema.
- `confiado`: +2 presión: más exposición y responsabilidad.

## Archivos del parche

- `src/identity30.mjs`: tabla `BALANCE_TRADEOFFS`, costes aplicados por `choiceFx` y etiquetas visibles.
- `index.html`: versión 4.10.6 y cambio del caché de identidad a `v=510`.
- `tests/balance-choices4106.test.mjs`: pruebas de todos los cambios, del motor y la repetibilidad.
- `tests/foot-balance4105.test.mjs`, `tests/creator-layout4104.test.mjs`: tolerancia a versiones posteriores, sin eliminar otras comprobaciones.
- `scripts/audit-balance4106.mjs`: auditor reproducible con `--seeds`, `--category` y `--out`; es una herramienta de desarrollo **opcional**, no un instalador.
- `docs/balance4106-results.json`: matriz completa de promedios, fuente de las cifras de este documento.

## Limitaciones y mejoras futuras

- Ampliar la muestra a cientos o miles de semillas **por variante** y a países y puestos adicionales.
- Evaluar Jugadas Vivas con bots de distintos estilos para representar presión, serenidad y control manual.
- Probar interacciones de dos o tres opciones (por ejemplo Recuperación + Disciplinado) con diseños factoriales parciales y control de error estadístico.
- Separar metas de balance por posición y estilo: goles no es el criterio para un arquero.
- No se modifican partidas guardadas. Las decisiones ya tomadas se recalculan con sus nuevos costes cuando corresponda, porque el motor usa `choiceFx` en tiempo de ejecución.

## Estado de verificación

Se verificó la sintaxis de los módulos y se ejecutaron las pruebas específicas, además de la simulación de carreras completas sin errores. La publicación de GitHub Actions y una sesión de navegador real siguen pendientes.
