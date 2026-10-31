# RASCENSO 4.3 — Jugadas Decisivas

Rama de implementación: `rascenso-4-3-gran-parche`.
Base: versión pública 4.2. No se requiere conservar partidas antiguas para cambios futuros, por decisión del propietario.

## Implementado

- 20 perfiles de minijuego en `src/play-tuning43.mjs`: ajustes específicos al rival, arquero, delantero y resolución automática, sin imponer éxito o fracaso.
- Duelos defensivos: entrada de pie que considera distancia, ventana temporal, atributos, rival y fatiga; recuperación con portador más reactivo.
- Pase filtrado: mejoras de ventana de recepción, control de error, pase bombeado y respuesta de defensas.
- Rondo, fuera de juego, achique, salida aérea y reflejos: IA y físicas calibradas para dar espacio a la habilidad del futbolista.
- Presentación Canvas de transmisión en los 20 minijuegos: etiquetas específicas, presión del partido, indicador de urgencia y momentos clave; sin sonidos.
- `src/play-impact43.mjs`: impacto real de las jugadas en moral, entrenador, hinchada y reputación, con límites por temporada. Partidos jugados personalmente pesan más que los automáticos.
- Noticias contextuales del mundo futbolístico solamente para jugadas realmente ocurridas.
- Resumen anual con efecto numérico real y progreso visible; portada deportiva con titulares relevantes.
- Modo rápido: al simular una temporada resuelve y registra las jugadas pendientes, en vez de descartarlas.
- Pruebas unitarias y de navegador para los nuevos sistemas y flujo de temporada.

## Control de calidad

- Primera implementación: 239/239 pruebas, 20 minijuegos completados por el bot, carreras hasta el retiro y pantallas en navegadores.
- Segunda pasada: 239/239 y pruebas de Chromium, Firefox y WebKit con modo rápido y 4-6 jugadas automáticas registradas.
- Nota importante: las simulaciones del bot acceden al estado interno de las jugadas. No reemplazan pruebas humanas de diversión y dificultad.
- Los valores de dificultad de las jugadas siguen siendo parámetros de diseño, no resultados garantizados.

## Pendientes de diseño

- Medir con jugadores humanos, especialmente Rondo, Salida aérea, Fuera de juego, Recuperación y Entrada.
- Revisión animada individual de los 20 escenarios, personajes más expresivos y variaciones gráficas por estadio.
- Mejoras de rejugabilidad con nuevos encuentros, presión de temporada y opciones deportivas.
- Auditoría externa de escudos y licencias.
- No se priorizan sonidos.

## Reglas de continuidad

Conservar la rama de desarrollo, validar cada cambio y publicar únicamente después de GitHub Actions exitosa.
