# RASCENSO · Del barrio a la historia

**Alfa 0.4 · 30 de octubre de 2026** — Simulador de carrera futbolística web de Ragamoofi.

Sitio: https://ragamoofi.github.io/RASCENSO/

## Qué incluye la versión 0.4

- 49 países y **más de 800 clubes reales de referencia**: los equipos pertenecen a distintas temporadas y divisiones; no son una nómina oficial de la temporada 2026.
- Identidad del jugador, origen, estilo, sueño profesional y **equipo de hincha opcional**. Conservar el club favorito no favorece artificialmente las transferencias.
- Draft de ocho atributos con **tres propuestas de leyendas por ronda**. Solo se acepta una por ronda; el peso cambia según la posición. Hay modos Clásico y Purista.
- Club inicial: tres ofertas de equipos del país seleccionado.
- Carrera: avances anuales, evolución, trofeos, lesiones, fichajes, historial y retiro.
- Escenas de **decisiones futbolísticas**: entrenamiento, táctica, vestuario, mercado, presión y club favorito. Se eliminó la interfaz de preguntas libres y la columna de familiares/personas. **Son eventos guionizados, no un narrador de IA libre.**
- En pantallas de escritorio, tablero a tres columnas con ficha, escenario central y tabla ilustrativa a la derecha. Adaptación para móviles.
- Banderas con respaldo de emoji y distintivos de clubes, priorizando escudos públicos donde se encuentran en la fuente de archivos, con fallback original.

### Alcance y limitaciones actuales

La clasificación lateral es **ilustrativa y determinista**, no proviene todavía de un calendario real partido a partido. Los puntos son estimaciones visuales ordenadas por el modelo y el puesto del jugador en la última temporada se conserva. No se representan como resultados oficiales. La simulación de ligas, planteles y mercado sigue en evolución. Las cifras de leyendas son interpretaciones ficticias del juego, no estadísticas oficiales.

### Imágenes y atribuciones

Los escudos enlazados proceden del repositorio comunitario [JoseArroyave/football-logos](https://github.com/JoseArroyave/football-logos), que declara uso libre; **los emblemas y las marcas de los equipos siguen perteneciendo a sus respectivos titulares**. No se incluyen ni se reclaman licencias de marcas. Las imágenes se cargan bajo demanda desde el repositorio de origen, con un diseño original de respaldo si no están disponibles. Las banderas se muestran desde [FlagCDN](https://flagcdn.com). El fondo deportivo utiliza una fotografía proporcionada por [Unsplash](https://unsplash.com/license); si no carga, el tema CSS mantiene la identidad visual.

### Compatibilidad con partidas previas

La clave de guardado `rascenso-save-v2` se **mantiene**. No se eliminan temporadas, estadísticas, elecciones, equipo favorito ni bitácora. Los IDs de clubes originales se preservan. El nuevo catálogo agrega IDs distintos para evitar conflictos.

## Probar y publicar

Github Pages publica los archivos estáticos mediante `.github/workflows/pages.yml`, cada vez que se actualiza `main`. No se necesita Python ni cuentas nuevas.

Pruebas automáticas del motor:

```bash
node --test tests/*.test.mjs
```

© 2026 Ragamoofi. RASCENSO es un proyecto independiente, no afiliado a Copero, ni a ligas o clubes.