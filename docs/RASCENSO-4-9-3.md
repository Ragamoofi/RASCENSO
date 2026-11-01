# RASCENSO 4.9.3 — Mundo y nacionalidades (parche directo)

Base: main `7b3da5493` (4.9.2). Instalación: extraer ZIP en la raíz del repositorio;
no requiere scripts de instalación.

## Cambios
- `index.html`: import map del navegador y entrada `src/experience493.mjs`.
- `src/world20-493.mjs`: sustituye exclusivamente las exportaciones TOP y generación,
  reexportando todas las demás funciones del módulo anterior.
- `src/ui20-493.mjs`: presenta el nombre real del club de procedencia de los jugadores.
- `src/world-highlights493.mjs`: extrae candidatos de ranking desde el directorio
  mundial de jugadores y convierte sus nacionalidades con `fm26-nations.mjs`.
- `tests/world-highlights493.test.mjs`: prueba aislada del módulo de rankings.

Conserva el catálogo completo del juego, sus trofeos, historial y partidas guardadas.
Ningún archivo de la base de 180.739 futbolistas va en este parche.

Pendiente: validar visualmente en GitHub Pages y corregir por separado la prueba
`tests/browser/trophies45.cjs` que falla en el título de la copa.
