# RASCENSO 3.2 · Origen y Legado

Base: rama main, commit 7c8a4b3cc4ba1174fa903f012a47e6221b3b821b.

## Primer contrato

- Se priorizan dos ofertas nacionales para las 50 nacionalidades. La tercera también puede ser local.
- Se eliminó la plaza extranjera obligatoria y la lotería global de gigantes.
- Los clubes accesibles se ponderan por nivel y categoría; las ofertas internacionales favorecen la misma confederación.
- La edad, el perfil de decisiones y el entorno migrante cambian la posibilidad de emigrar. Son reglas de simulación, no reglamentos legales.
- Las tres propuestas se almacenan al cerrar el Legado y sobreviven al guardado y la importación. No se modifican contratos ya firmados.
- Cada oferta explica su procedencia nacional, regional o internacional.

## Creación e identidad

- Informe contextual en Identidad, Raíces, Futbolista, Mentalidad, Sueños y Resumen.
- Conexión explícita de nacionalidad, edad y carácter con el primer mercado.
- Resumen numérico por atributo: bonos de arranque y techo, incluidos negativos antes ocultos por el radar.
- Se aclara el efecto real de las edades 18 y 19: afecta los seis atributos, no solo los principales.
- Dorsales enteros; el borrador solo se elimina cuando la nueva carrera se guarda correctamente.
- Distribución más amplia para decisiones y comparaciones en escritorio; se conservan las reglas adaptables a pantallas pequeñas.

## Legado y ADN

- Selector de faceta: comparar tres referentes de un mismo atributo, o mantener el modo Explorar con facetas distintas.
- Elegir una faceta no consume los tres cambios disponibles. Cambiar repetidamente de faceta no cambia las cartas de esa faceta para la misma ronda y semilla.
- Vista previa del ADN primario, secundario y encaje posicional para cada carta.
- Selección de faceta persistente y reinicio automático tras aceptar una influencia.
- Referentes arqueros para facetas de portería, cuando hay candidatos disponibles en el nivel correspondiente.
- La clase de especialista en penales ya no puede superar cinco estrellas.
- Se mantienen ambos modos de Legado, las ocho elecciones, todos los referentes, las familias, sus efectos y la evolución posterior.

## Corrección adicional

La clasificación conserva la última temporada disputada aunque el equipo haya cambiado de división. Evita reemplazar la tabla recién terminada por una clasificación vacía después de ascender.

## Validación

- 153 pruebas automatizadas aprobadas (148 existentes y 5 nuevas).
- Cobertura nueva: 750 mercados iniciales en los 50 países; 1.200 comienzos chilenos para comparar edades/perfiles; las 12 posiciones con selección de las ocho facetas, migración, firma y límites de estrellas.
- Muestra chilena, 300 por perfil: 13 ofertas internacionales en menores calculadores, 65 en adultos calculadores, 12 en adultos hogareños y 154 en adultos aventureros.
- Prueba de renderizado de la interfaz aprobada y comprobación de sintaxis de módulos.
- Se ajustó una prueba antigua que exigía oferta extranjera obligatoria. La prueba de preparación ahora contrasta múltiples semillas: una mejora probabilística no garantiza un marcador distinto en una única temporada.
- Prueba E2E del creador ampliada para comparación, vista previa y recarga. NO ejecutada aquí: no hay navegador instalado y las descargas de Chromium devolvieron archivos inválidos. La distribución a 1920×1080 queda pendiente de inspección visual real.

Los cambios se entregan en el ZIP; no se han publicado en GitHub Pages ni enviado a main.
