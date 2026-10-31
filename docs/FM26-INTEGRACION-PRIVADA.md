# FM26 · Mundo real privado — avance de integración

## Seguridad / publicación
**Rama de desarrollo separada** `fm26-mundo-real-privado`. Nunca fusionar automáticamente a `main` ni a GitHub Pages. No incluir `runtime/por_pais`, `runtime/libres`, `indice_clubes.json` ni fichas derivadas de FM26 dentro del sitio o repositorio. El ZIP proporcionado por el usuario contiene datos sujetos a autorización y no certifica el género de sus clubes ni el país ISO de sus jugadores.

El nuevo runtime es **local y opcional**. Lee un ZIP seleccionado en el navegador y un JSON separado de mapeos verificados. Si el JSON de verificación no existe, muestra una advertencia y **NO activa ninguna plantilla**. Los JSON seleccionados sólo se guardan localmente por club en IndexedDB, no se envían a un servidor. El guardado normal sólo conserva trayectorias por IDs, no una copia estática del catálogo completo.

## Inspección del ZIP entregado
- Total de clubes candidatos de FM: **12.725**; primera plantilla probable: **119.963** adultos; reservas adultas: **29.832**; libres: **30.944**.
- Candidatos totales: **180.739**, entre plantilla y libres. No significa que sean personas automáticamente utilizables ni género masculino certificado.
- Identificador de jugadores estable: `fm26:<uid>`.
- Seis UIDs piloto examinados dentro de los archivos reales, comparando el índice, su shard y `club_uid` y país interno:
  - Real Madrid: 26 en `equipo_slot=0`.
  - Barcelona: 25.
  - Colo-Colo: 23.
  - Universidad de Chile: 27.
  - Boca Juniors: 23.
  - River Plate: 23.
- Total piloto: **147 primera plantilla probable**.
- **Aprobados sin dudas de género y país: 0. Activables hoy sin verificación independiente: 0.**
- Homónimos identificados (ej. varios UIDs de Real Madrid y Colo-Colo). **Jamás mapear por nombre o por similitud**.

## Mapeo exigido
`src/fm26-real.mjs::verifyFM26Mapping` requiere:
```json
{
  "clubId": "xx-123",
  "fmUID": "123456",
  "fmCountryId": "999",
  "isoCountry": "XX",
  "status": "verified",
  "genderVerified": true,
  "countryVerified": true,
  "evidence": "Referencia concreta a clubs.csv y nations.csv verificados"
}
```
No rellenar esta estructura con supuestos ni usar el propio paquete sin fuente adicional para establecer `genderVerified`. El importador comprueba UID y código de país del shard. Sólo importa `equipo_slot=0` (primera plantilla probable) y exige al menos 11 candidatos válidos.

## Implementado en código
- `src/fm26-real.mjs`: conversión pura de posiciones y CA/PA a OVR 40–99; perfiles de seis atributos; ID único; registro de clubes estrictamente verificados; consulta por ID; listado del plantel por club y competencia por posición.
- El `state.fm26.changes` persiste por jugador: club actual, edad, media, partidos, goles, asistencias, lesiones, títulos y temporadas. Los registros estáticos originales no se colocan en la partida.
- `transferFM26` cambia el club propietario, conserva historial de movimientos y evita que un jugador figure en dos plantillas; se conserva al serializar y recargar.
- `advanceFM26Season`: progresión determinista, partidos, lesiones, empeoramiento por edad, mercado entre clubes activados y jubilación; el jugador mantiene su UID.
- `src/fm26-local.mjs`: lector ZIP selectivo, importación y almacenamiento privado por club en IndexedDB, restauración al abrir el juego, posibilidad de borrar datos locales.
- `src/market.mjs` y `src/engine.mjs`: rival real de la misma posición y competencia por puesto al fichar por un club con plantilla verificada.
- `src/league.mjs`: influencia **acotada (18 %)** del promedio de los once primeros jugadores aprobados sobre el nivel de simulación. Conserva el calendario y los resultados propios de RASCENSO.
- `src/world20.mjs`: los títulos, premios y rankings pueden ver jugadores reales importados; no se almacenan los 150k en `world.players` ni se les aplica el tope de 120.
- `src/ui20.mjs`: panel de compañeros reales y OVR dentro de Vestuario cuando el club está habilitado.
- `src/experience.mjs`: controles para importación privada y eliminación de fichas localmente, sin servidor.

## Limitaciones reales (no declarar completo)
- Sin `clubs.csv` con género confiable, `nations.csv` o equivalencia nacional verificada, **no hay seis plantillas aprobadas ni una base global abierta**.
- El convertidor FM CA/PA es una escala inicial. Comparación local del piloto: CA promedio Real Madrid 152,9; Barcelona 151,7; Colo-Colo 104,4; U de Chile 105,1; Boca 126,5 y River 125,7; el ajuste de liga es deliberadamente moderado hasta calibración manual.
- Sin `nations.csv` no existe mapeo de nacionalidades/selecciones; no se atribuyen convocatorias falsas.
- El mercado de NPC real sólo considera clubes cargados y aprobados. Los agentes libres no están vinculados todavía a la búsqueda de contratos.
- El motor todavía simplifica alineaciones, no utiliza los 24 atributos para cada duelo; las estadísticas son temporada agregada. Las noticias reales se alimentan de transferencias/retiros/lesiones del overlay.
- Para temporadas muy largas hacen falta más prospectos nuevos y reemplazo gradual tras los retiros. No hay afirmación de que 180k jugadores corran todos en vivo.

## Pruebas y aceptación
Pruebas sintéticas SIN datos reales: `tests/fm26-real.test.mjs` con seis clubes ficticiamente verificados, 144 fichas ficticias, identidad estable, dos temporadas, traspaso, rival, mercado, fallback sin datos y ausencia de colisiones. El informe de CI es visible en la rama. La auditoría del ZIP real se ejecutó localmente sobre los seis UIDs candidatos, sin subir imágenes, nombres ni jugadores al repositorio.

## Siguiente etapa
1. Conseguir `clubs.csv`, `nations.csv` y autorización de uso o alternativa con licencias aptas para publicación; revalidar homónimos y posición/género.
2. Ampliar flujo de mapeos club→FM verificados y filtros de primera plantilla, reservas y cesiones.
3. Añadir agentes libres, selecciones basadas en nacionalidades verificadas, estadísticas por partido y traspasos más profundos.
4. Evaluar rendimiento y navegación real con ZIP privado, cargar sólo shards de clubes activados, comprobar conservación de traspasos tras cerrar/abrir Chrome y Firefox.
