# RASCENSO 4.11.0 — Sistema de Verano

## Fuente y verificación (FASE 0)

Base contrastada con `main` de RASCENSO: `0bcffa15204a5a5f2e0b0dfee9d72c555a245cc0` (2026-11-01), con los archivos `summer-activities.mjs`, `summer-engine.mjs` y `summer-demo.mjs` proporcionados para este encargo.

### Flujo del juego

Antes: `season` → `advanceSeason` → `event` (resumen al abrir `recapPending` y escenas) → posible `transfer` → `season`.

Ahora: `season` → `event` (resumen, premios y escenas, sin cambios) → posible `transfer` (ofertas/renovación, sin cambios) → **`summer`** → `season` (agenda, preparación y táctica).

Si no abre el mercado, Verano empieza al terminar las escenas. Si abre mercado, empieza después de fichar o quedarse. Las escenas al llegar a un club se respetan antes de la fase de Verano. No aparece antes del primer contrato ni durante el draft. Si la carrera finaliza por retiro, no abre un verano artificial.

### Mapa de atributos reales

| Propuesta verano | Estado real RASCENSO |
|---|---|
| moral | `s.morale` (0–100) |
| reputacion | `s.reputation` (0–100) |
| confianzaDT | `s.coachTrust` y `s.relationships.coach.trust` (0–100) |
| hinchada | `s.squad.fans` (0–100) |
| directiva | `s.squad.board` (0–100) |
| vestuario | `s.squad.morale` (0–100) |
| forma | `s.form` (0–100) |
| fatiga | `s.summerFatigue` (-20–100) y leve ajuste deportivo |
| vinculoFamiliar | `s.relationships.family.trust` |
| vinculoPrensa | `s.relationships.press.trust` |
| vinculoRepresentante | `s.relationships.agent.trust` |
| vinculoCompanero | `s.relationships.teammate.trust` |
| dinero | `s.summerFinance.cashEUR` (moneda efectiva, normalizada al salario anual al pagar) |
| impactoSocial, escandalos | `s.summerFinance.impactSocial`, `.escandalos` |
| lesiones | multiplicador en `playLeague`, más semanas por lesión de verano |
| minutos | modificación del ratio de jugar en `playLeague` |
| desarrollo | modificación sobre `careerFx.growth` al desarrollar atributos |
| serenidad | aportación a `composure` en el motor de las Jugadas Vivas |
| mercadoGrandes | peso de clubes prestigiosos en `market.mjs` |

Mapeo de rasgos: `origin -> formacion`, `environment -> entorno`, `developmentPath -> desarrollo`, `personality -> caracter`, `style -> estilo`, `publicImage -> imagen`, `riskProfile -> decisiones`, `dream -> sueno`. Los IDs usados se cotejaron con los objetos reales del creador.

La economía original tiene `contract.salary` **EUR/año**, `careerEarnings` y `salaryEarned` por año. Esto último se conserva como historial; el patrimonio disponible se registra aparte para no duplicar salarios ni asumir que el acumulado histórico está líquido.

### FASES 1–4: motor, dinero, pantalla y guardado

- Se mantiene el motor base proporcionado: actividad → modo → resultado; `validateActivities`, `drawOffers`, `chooseMode`, riesgo, probabilidades, cooldown y tope anual.
- Adapter de RASCENSO en `summer-career4111.mjs`, sin ciclo de dependencias con `engine.mjs`.
- Seis cupos, tres propuestas ponderadas por semana, dos máximo por categoría, repetición penalizada por `×0,5` por actividad previa de esa categoría, actividades de una o dos semanas, descanso ligero, resumen del resto automático.
- Patrimonio: `cashEUR`, `earnedEUR`, `spentEUR`; las actividades y servicios cotizan en **fracciones del sueldo anual actual**, pero el dinero persistente queda en euros. El saldo nunca baja de cero tras compras verificadas.
- Los servicios (`nutri`, `fisio`, `psico` y `casa_*`) pagan el coste de alta al contratar y el mantenimiento con el salario de cierre de cada año. Si falta efectivo, el servicio se cancela y la contratación puede reintentarse en años posteriores.
- Guardado en las mismas partidas v9 con campos nuevos opcionales; migración segura que rellena valores faltantes. Verano en proceso, saldo, ofertas reproducibles, servicios, flags, cooldowns, eventos pendientes y registros de verano persisten en `localStorage` y exportaciones JSON.
- El motor usa semilla derivada de carrera + año + contador de sorteos. Reabrir la página muestra las mismas ofertas, sin volver a tirar los dados accidentalmente.
- La interfaz se monta desde `summer-ui4111.mjs` cuando el estado guardado dice `phase:'summer'`. Para evitar sustituir la interfaz original de 70 KB y sus integraciones, la capa mantiene el guardado y sincroniza el estado de juego con una recarga **solo al salir del verano**.

### FASE 5: escenas futuras

Se añadieron seis continuaciones persistentes, con elección de respuesta al llegar el año de ejecución:
`inauguracion_barrio`, `nino_prometedor`, `prensa_recuerda`, `boicot_marca`, `academia_talento`, `becario_destaca`.

Se evalúan con una semilla propia cuando vence la temporada prevista y quedan en `summerFollowUpLog` y `careerMoments`. Las noticias sobre juveniles son narrativas: **no crean automáticamente un jugador real ni un contrato de primer equipo**.

### FASE 6: feedback y legado

- Panel de resultado mostrando todos los efectos inmediatos aplicados, con datos positivos/negativos y mensajes cuando `traitMods` modificó probabilidades.
- Historial de veranos y titulares conservados; el apartado de retiro contiene impacto social, escándalos, veranos y frases célebres.
- La vista Historial incluye un resumen de las decisiones estivales.
- Exportación de un **PNG específico de los veranos** con métricas y principales recuerdos. La función de PNG general de carrera permanece intacta.

### FASE 7: balance

- 39 actividades válidas, 3000 veranos por cada una de seis políticas en `src/summer-demo.mjs` (18000 veranos), reproducibles.
- Después de ajustes en `summer-balance4111.mjs`, no hay ninguna elección por encima de 20 % de las decisiones del optimizador en esa muestra.
- Ninguna política monotemática supera al optimizador en la muestra, aunque éste aún rinde más que el azar; ese resultado se documenta, no se oculta.
- Se aumenta el premio de algunas opciones arriesgadas, manteniendo costes y posibilidad de resultados negativos.
- Las pruebas de integración simulan varias carreras completas de distintas posiciones hasta el retiro.
- **No es posible garantizar equilibrio perfecto de las combinaciones de carrera** con una muestra de 18000 veranos aislados. Queda abierta una batería más grande con combinaciones de rasgos y sueldos a múltiples temporadas.

### FASE 8: más contenido

39 actividades, con requisitos y nuevos elementos a partir de 16–19, 20–27, 28–31 y 32+ años. El catálogo de los 15 ejemplos se conserva y se suman 24 actividades adicionales en `summer-expansion4111.mjs`. Ver `summer-activities.mjs` para el listado total y sus modos/resultados.

## Limitaciones conocidas

- La capa visual no reemplaza el dibujo de todos los elementos existentes del juego; solo introduce Verano y el legado social. El orden flujo está integrado en el motor.
- El PNG de verano se exporta aparte del PNG general de carrera, que no se altera.
- La interfaz fue validada por inspección de código y pruebas del motor, pero no se consiguió completar la captura visual automática de Chromium desde este entorno.
- El sistema narrativo externo sigue simplificado. Una noticia de un juvenil futuro no genera automáticamente ficha FM26 ni transferencias.
- Los beneficios `next` se aplican a **una** temporada; los servicios se aplican mientras estén activos y sean costeables.
- La economía usa costes relativos al sueldo anual real con patrimonio en euros; no pretende simular impuestos ni las cuentas de una institución deportiva.

## Instalación

Extraer el ZIP en la raíz del repositorio (`Documentos/GitHub/RASCENSO`), sobrescribir y hacer Commit → Push origin en GitHub Desktop. No se necesitan `.cmd`, `.bat`, `.ps1` ni importar datos mundiales. Comprobar la acción «Publicar RASCENSO». La prueba de navegador independiente ya presentaba fallas previas; esta versión debe validarse visualmente tras publicar.
