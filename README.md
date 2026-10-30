# RASCENSO ↗

**Del barrio a la historia.** Un simulador original de carrera futbolística con decisiones, países, clubes identificativos, draft de atributos y progresión temporada a temporada. Proyecto independiente de Ragamoofi.

## Jugar

Dirección prevista cuando GitHub Pages esté habilitado: https://ragamoofi.github.io/RASCENSO/

Para probar localmente sin instalar Python, puedes usar cualquier servidor de archivos estáticos. Este proyecto utiliza módulos JavaScript (`.mjs`), por lo que abrir el HTML con doble clic no es una forma compatible de ejecución.

## Características de esta versión alfa 0.2

- Creación de futbolista en cuatro etapas: identidad, raíces, personalidad/estilo y sueño.
- 49 nacionalidades y 166 clubes de referencia (base inicial, no cobertura mundial exhaustiva).
- Tres clubes del país elegido para el primer contrato.
- Draft de ocho atributos, estilos Clásico y Purista.
- Temporadas, evolución de media/potencial, estadísticas, eventos y fichajes.
- Decisiones que influyen en moral, reputación y confianza del entrenador.
- Partida automática en almacenamiento local y exportación a JSON.
- Lectura compatible con partidas antiguas del prototipo Carrera Mundial si se cargan desde el mismo dominio del navegador.

## Límites conocidos

La clasificación de la liga es estimada; todavía no se simulan todos los encuentros de cada club, ni hay plantillas reales, contratos económicos, tablas persistentes, competiciones completas o integración de IA. Las estadísticas y niveles de los equipos son ficticios. No estamos afiliados a Copero ni a los clubes mencionados.

## Desarrollo

`node --test tests/*.test.mjs` ejecuta las pruebas del motor con Node.js 22.
La publicación usa GitHub Actions en `.github/workflows/pages.yml`; si no se despliega, activar **Settings → Pages → Source: GitHub Actions**.

© 2026 Ragamoofi. Interfaz, narrativas y código propios de RASCENSO. Los nombres de clubes se utilizan con fines identificativos, no como representación oficial.
