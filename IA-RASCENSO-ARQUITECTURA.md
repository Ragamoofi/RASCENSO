# RASCENSO · IA como director narrativo (propuesta 0.9)

**Estado:** solo diseño y validador. No hay conexión activa a ChatGPT, Claude ni Gemini y la web funciona sin ellos.

## Arquitectura recomendada

**RASCENSO (motor autoritativo):** simula calendarios, minutos, goles, fichajes, sueldos, edad y archivos de carrera. Nadie debe alterar estos datos directamente desde un chat.

**Director narrativo (modelo opcional):** recibe un resumen acotado de hechos de la partida, relaciones e hitos recientes; escribe eventos futbolísticos, diálogos y alternativas contextualizadas. Devuelve un formato estructurado compatible con JSON Schema. Puede sugerir cambios pequeños a moral, reputación o confianza. El motor valida cada efecto y registra la elección solo después de una acción explícita del usuario.

**Servidor intermedio:** se propone una función segura de servidor (por ejemplo Supabase Edge Functions) que implemente adaptadores a APIs oficiales de OpenAI, Anthropic y Google, con autenticación, límites de coste, control de acceso, política de datos y claves **solo en el servidor**. Publicar claves en el JavaScript de GitHub Pages sería inseguro.

## ¿Por qué no depender de una extensión que lea ChatGPT/Claude/Gemini?

Una extensión Manifest V3 podría añadir un panel lateral o un puente de mensajes consentido por el usuario, pero **los sitios web de chat no exponen necesariamente sus conversaciones como API para una extensión externa**. Automatizar sus interfaces o leer su DOM es frágil, puede dejar de funcionar cuando actualicen sus páginas y requiere permisos sensibles. No debemos prometer una conexión automática con las cuentas ya iniciadas.

El plan es: 1) motor de RASCENSO y API de eventos; 2) adaptadores seguros de los proveedores; 3) opción de extensión compatible con Brave/Chrome/Edge como acompañamiento, no como dependencia del juego; 4) modo offline sin IA.

## Contrato inicial de evento

```json
{
  "type": "career_event",
  "title": "El entrenador modifica el esquema",
  "narration": "El club ha probado una alineación diferente. El técnico te llama después de entrenar...",
  "options": [
    {"title":"Aceptar una nueva función","detail":"Buscar más minutos","effects":{"coachTrust":2}},
    {"title":"Pedir una reunión táctica","detail":"Defender mi rol actual","effects":{"reputation":1}}
  ]
}
```

Se permite sugerir **solo** modificaciones pequeñas de `coachTrust`, `morale` y `reputation` (enteros entre -3 y +3). Nunca se aceptan órdenes arbitrarias, scripts, cambios de OVR, invenciones de contratos, goles, transferencias, dinero ni títulos. Los resultados se calculan con el motor. Se conserva un registro y posibilidad de recuperación.

## Privacidad y costes

No enviar datos de cuenta, llaves de API, `localStorage` completo, ni datos no necesarios; transmitir solo la instantánea `narrativeContext()` de la partida. Las APIs de los modelos pueden tener coste separado de una suscripción web a ChatGPT/Claude/Gemini. El jugador debe optar explícitamente por conectarse y poder desactivar IA en cualquier momento.
