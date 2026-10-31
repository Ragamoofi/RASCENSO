# RASCENSO 3.2

Este paquete contiene el proyecto completo, su código, recursos, scripts y pruebas, basado en main (7c8a4b3).

Para jugar localmente, abre una terminal en esta carpeta y ejecuta:

    python3 -m http.server 8765

Después abre http://localhost:8765. No abras index.html mediante file://, porque el juego utiliza módulos JavaScript.

Los guardados pertenecen al navegador y al origen web. Para pasar una partida de GitHub Pages al servidor local, expórtala desde el juego e impórtala en el otro. No borres los datos del navegador. El formato de guardado sigue siendo compatible con la versión 9.

Las mejoras de ofertas y selección de Legado se aprovechan creando una carrera nueva. Las partidas ya empezadas conservan club, atributos e historial.

Pruebas:

    node --test tests/*.test.mjs
    node tests/ui-smoke.mjs

Prueba de navegador (requiere Playwright y Chromium):

    node tests/browser/creator-e2e.cjs http://localhost:8765/index.html

Los recursos de publicación adicionales se generan con los scripts originales. Este ZIP incluye sus recursos de respaldo generados sin descargas; las fotografías y escudos externos autorizados pueden reconstruirse mediante el flujo de publicación existente. El logo oficial de RASCENSO está incluido.

Detalle de cambios y limitaciones de validación: CHANGELOG-3.2.md.
