# RASCENSO · Del barrio a la historia

**Alfa 0.5 — Nueva Era** · 30 de octubre de 2026 · © Ragamoofi.

Sitio oficial de prueba: https://ragamoofi.github.io/RASCENSO/

## La nueva versión

- **Nueva identidad visual**: azul noche, azules eléctricos y cobre; ya no utiliza el esquema verde/negro. Interfaz original de tres columnas para 1920×1080, adaptable a pantallas pequeñas.
- **La carrera sigue siendo rápida**: creación en cuatro capítulos, draft de ocho cualidades con leyendas de referencia, tres ofertas nacionales, avance por temporada, decisiones, fichajes y retiro.
- **841 clubes en 49 países**, catálogo de referencia con equipos de distintas categorías y temporadas. **No es una base oficial de ligas 2026.** Un primer contrato pertenece siempre al país seleccionado. Club favorito opcional y persistente, sin fichajes garantizados.
- **Nuevo motor propio de ligas**: se genera un calendario de ida y vuelta entre los participantes de cada liga simulada. Los marcadores se resuelven con fuerza del club, localía y contribución del jugador. Las tablas con PJ, PG, PE, PP, GF, GC, DG y puntos se **suman desde los resultados** (3/1/0). Los resultados por fecha y las apariciones personales se guardan en el historial.
- **Estadísticas del futbolista a partir de encuentros**: las apariciones, minutos, goles y asistencias se cuentan en partidos en los que participa y nunca exceden los goles del equipo. El arquero registra porterías a cero y goles recibidos.
- **Planes antes de cada temporada**: Equilibrio colectivo, Atacar los espacios o Disciplina táctica; influyen en la simulación. Las situaciones narrativas posteriores ofrecen decisiones sobre fútbol y consecuencias persistentes.
- **Desarrollo separado del talento**: el OVR inicial no equivale al potencial; progresión, edad, minutos y lesiones intervienen en la evolución y el declive.
- **Mercado de pases**: propuestas con años de contrato y retribuciones ficticias, conservando el club de hincha y la continuidad narrativa.
- **Navegación mejorada**: Mi carrera, Historial y Mundo. A la derecha, alternancia entre clasificación y resultados individuales.
- **Compatibilidad de guardados**: conserva la clave `rascenso-save-v2` y migra partidas antiguas; exportación/importación JSON y respaldo local periódico.

## Alcance real (importante)

El simulador **sí calcula encuentros y posiciones de liga reales dentro de su universo ficticio**. Sin embargo, la selección de participantes es un grupo deportivo generado desde la base disponible, no la nómina federativa oficial de cada campeonato. Los equipos no disponen de plantillas individuales detalladas. Los torneos de copa, la clasificación continental y los calendarios de selecciones todavía requieren motores propios. Los eventos narrativos están escritos de antemano: **no existe un narrador libre de IA tipo Rasthoria**. Los equipos y leyendas reales se incluyen como referencias y no implican patrocinio ni afiliación.

La implementación es **original e independiente**. La auditoría del HAR de Copero inspiró la elección de sistemas y el enfoque de carrera rápida, pero no se ha incorporado código JavaScript extraído de Copero.

## Fuentes visuales

- Escudos externos: repositorio comunitario [JoseArroyave/football-logos](https://github.com/JoseArroyave/football-logos), con emblema original de respaldo donde falta correspondencia. Las marcas pertenecen a sus titulares.
- Banderas: [FlagCDN](https://flagcdn.com).
- Fotografía de ambiente: [Unsplash](https://unsplash.com/license).

## Ejecutar pruebas

```bash
node --test tests/engine.test.mjs
node tests/ui-smoke.mjs
```

### Publicación

`main` dispara `.github/workflows/pages.yml`; no se requiere Python ni GitHub Desktop para jugar en la dirección de GitHub Pages.
