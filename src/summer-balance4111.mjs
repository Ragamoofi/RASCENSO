/* RASCENSO 4.11 — contrapartidas reales para opciones con riesgo.
 * Cambios deliberados, locales a la lista; no alteran reglas ni resultados guardados. */
export function balanceSummerRisk(activities){
 const mode=(activity,id)=>activities.find(a=>a.id===activity)?.modes?.find(m=>m.id===id);
 const outcome=(activity,id,result)=>mode(activity,id)?.outcomes?.find(x=>x.id===result);
 function fx(a,m,o,changes){const v=outcome(a,m,o);if(v)v.fx={...(v.fx||{}),...changes};}
 // Un titular viral puede pagar mucho, pero la polémica sigue siendo probable.
 const press=mode('rueda_prensa','picante');if(press){press.outcomes.find(x=>x.id==='viral').p=.45;press.outcomes.find(x=>x.id==='escandalo').p=.35;}
 fx('rueda_prensa','picante','viral',{reputacion:5,hinchada:3,dinero:.65});
 // El campamento intensivo arriesga sobrecarga a cambio de un techo de desarrollo superior.
 const altitude=mode('campamento','altura');if(altitude){altitude.outcomes.find(x=>x.id==='pico').p=.6;altitude.outcomes.find(x=>x.id==='sobrecarga').p=.2;altitude.outcomes.find(x=>x.id==='pico').next.desarrollo=.05;}
 fx('fiesta_plantel','toda_la_noche','epica',{vestuario:4,vinculoCompanero:4,moral:4,reputacion:3,dinero:.1});
 fx('negocio','restaurante','boom',{dinero:1.3,reputacion:1});fx('negocio','restaurante','estable',{dinero:.65});
 fx('patrocinio','marca_polemica','ok',{dinero:.6,reputacion:1});fx('patrocinio','marca_polemica','polemica',{dinero:.6,reputacion:-2,hinchada:-2});
 fx('documental','autentico','ok',{hinchada:2,impactoSocial:1,reputacion:1});
 fx('documental','espectaculo','exito',{reputacion:5,dinero:.7});
 const controversial=mode('prensa_polemica','contraatacar');if(controversial){controversial.outcomes.find(x=>x.id==='viral').p=.5;controversial.outcomes.find(x=>x.id==='fuego').p=.5;}
 fx('prensa_polemica','contraatacar','viral',{hinchada:4,reputacion:5});
 fx('reunion_capitanes','tomar_mando','lider',{vestuario:4,confianzaDT:2,reputacion:1});
 fx('evento_hinchas','cercano','ok',{hinchada:2,moral:1});
 fx('evento_hinchas','publicitario','bien',{hinchada:1,dinero:.25,reputacion:1});fx('evento_hinchas','publicitario','criticas',{hinchada:-2,reputacion:-1,dinero:.25});
 const barrio=mode('torneo_barrio','jugar');if(barrio){barrio.outcomes.find(x=>x.id==='lindo').p=.85;barrio.outcomes.find(x=>x.id==='golpe').p=.15;}
 fx('torneo_barrio','jugar','lindo',{moral:4,vinculoFamiliar:2,hinchada:1});
 fx('libro_memorias','explosivo','ventas',{dinero:.5,reputacion:4});
 return activities;
}
