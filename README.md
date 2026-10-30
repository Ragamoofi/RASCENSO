# RASCENSO · Del barrio a la historia

**Alfa 0.3 · 30 de octubre de 2026** — Juego web original de carrera futbolística de Ragamoofi.

El modo de carrera combina la simulación de temporadas con elecciones de vida profesional y escenas narrativas con continuidad. Es un prototipo independiente, no afiliado a Copero ni a los clubes mencionados.

## Cómo jugar

Abre **https://ragamoofi.github.io/RASCENSO/** cuando GitHub Pages esté habilitado. No requiere Python ni instalaciones. Los archivos son estáticos (HTML/CSS/JavaScript). Guarda automáticamente en `localStorage` de tu navegador y permite exportar tu historial al retirarte.

En la creación eliges nombre, país, ciudad, posición, origen, personalidad, estilo y sueño. Puedes añadir **un equipo del que seas hincha** o dejar el campo vacío. Esa elección no cambia las probabilidades de las ofertas ni garantiza llegar a ese club. La simulación puede reconocerla en conversaciones, fichajes y despedidas. Todos los clubes disponibles son una base de referencia, no un censo oficial de las ligas en 2026.

Tras el draft de ocho atributos recibes tres ofertas de clubes de tu país. Las temporadas se resuelven en el simulador, con eventos, resultados estimados, trayectoria individual, premios y mercado. En la primera firma y al terminar temporadas aparecen escenas narrativas.

## Historia viva — alcance actual

- Escenas originales con distintos interlocutores: entrenador, compañero, representante, periodista y familia.
- Situaciones condicionales: presentación, falta de minutos, lesiones, reconocimiento, prensa y club del que eres hincha.
- Roleo breve en **dos pasos**: una escena, una elección del jugador (con texto libre opcional), reacción y consecuencia. No avanza la historia sin que la persona confirme o salte la escena.
- La respuesta escrita se conserva literalmente en una bitácora, y las relaciones e impactos numéricos persisten entre temporadas.
- **No es una IA conversacional libre**: por ahora, la reacción se determina según la postura seleccionada y el contexto, no interpreta semánticamente toda la respuesta escrita. El objetivo siguiente es profundizar la simulación de partidos, el manejo de NPC y las relaciones.

## Compatibilidad y seguridad de guardados

- El guardado sigue usando la clave `rascenso-save-v2` para migrar partidas alfa 0.2 y versiones anteriores sin borrarlas.
- El motor migra el estado a versión 3 añadiendo vínculos y bitácora.
- Las elecciones se escapan en la interfaz antes de mostrarse, y el texto personalizado tiene límite de 240 caracteres.
- Las pruebas automáticas se ejecutan al publicar con GitHub Actions.

## Pruebas

```bash
node --test tests/*.test.mjs
```

## Publicación

GitHub Actions publica en Pages desde `main`, usando el archivo `.github/workflows/pages.yml`. Requiere que el repositorio tenga GitHub Pages configurado para usar **GitHub Actions**.

© 2026 Ragamoofi. Código e interfaz originales. Los nombres de los clubes se usan con finalidad identificativa.
