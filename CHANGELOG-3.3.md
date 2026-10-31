# RASCENSO 3.3 — Vestuario, Selección y Escudos

## Cambios funcionales

- **Selección nacional adulta:** se evalúan edad, continuidad, reputación, nivel real, trayectoria y división. Los grandes torneos requieren mayor experiencia; un debutante de 17 años en el ascenso deja de jugar un Mundial sin haber construido carrera. La rareza de cada selección se ajusta por confederación.
- **Orden narrativo:** cuando se juega una campaña con la selección, la escena posterior es una entrevista **sobre el debut ya disputado**, no una falsa llamada previa después del Mundial.
- **Vínculos de Vestuario con consecuencias:** compañero de confianza afecta ligeramente la continuidad/minutos y moral; representante orienta las opciones de mercado; periodista la reputación; familia la moral y riesgo de lesión. Las diferencias están acotadas y se explican en pantalla. La confianza del entrenador ya impactaba en el rol/minutos y sigue funcionando.
- **Tarjeta del jugador:** proyección integrada en una sola línea sin caja rectangular, a la vista en el perfil.
- **Pretemporada:** desaparecen los niveles, pronósticos y clasificaciones estimadas. Los participantes se muestran alfabéticamente, sin revelar quién es favorito.
- **Escudos:** segunda auditoría manual de los 56 pendientes y ocho nuevas fuentes de Wikimedia Commons con su origen y licencia en `scripts/crest_commons.json`. Cuando su descarga funcione se usan directamente; de lo contrario se informa fuente pendiente, sin asignar imágenes de otro club. Total de fuentes identificadas: 826/874. No son 826 descargas verificadas.

## Compatibilidad y pruebas

- Guardados anteriores conservados (sin cambio de `SAVE_VERSION`).
- Pruebas unitarias nuevas y de regresión (162 pruebas totales antes de publicación), validación de sintaxis y prueba de interfaz.
- La cantidad de imágenes realmente descargadas se determina en el registro `assets/crest-manifest.json` **después del despliegue**; no se infiere de la disponibilidad nominal del catálogo.

## Pendiente

- 48 clubes aún sin una imagen con identificación/licencia suficientemente segura, y fuentes sujetas a posibles borrados externos. Ver `CREST_AUDIT.md`.
