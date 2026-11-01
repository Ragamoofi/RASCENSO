/* RASCENSO 4.9.7 — Filtro por evidencia verificable, sin inferir sexo por nombres personales.
 * Los registros sin información fiable permanecen SIN CLASIFICAR; no se borra la fuente.
 */
import {isExcludedClub,isExcludedPlayer} from './world-exclusions.mjs';
const norm=value=>String(value??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().toLowerCase();
const marker=/\b(?:women(?:'s)?|womens|woman|female|femenino|femenina|feminin(?:e|es)|feminino|feminina|frauen|ladies|mujeres|damas|fem|wfc)\b/i;
const sexFields=['genero','género','sexo','sex','gender','gender_category','categoria_genero','categoriaSexo','rama'];
function femaleTag(record){
 if(!record||typeof record!=='object')return false;
 for(const key of sexFields){const v=norm(record[key]);if(['femenino','femenina','female','women','woman','mujer','mujeres','f','w'].includes(v))return true;}
 return false;
}
export function isFemaleClubRecord497(uid,record){
 if(isExcludedClub(uid)||isExcludedClub(record?.club_uid))return true;
 if(femaleTag(record))return true;
 // Etiquetas inequívocas de *equipos*, no inferencia desde el nombre de la persona.
 const name=norm(record?.nombre||record?.name);
 return !!name&&marker.test(name);
}
export function isFemalePlayerRecord497(player){
 if(!player)return false;
 const id=player.id??player.playerId;
 return isExcludedPlayer(id)||femaleTag(player);
}
export function filterWorldIndex497(index){
 return Object.fromEntries(Object.entries(index||{}).filter(([uid,record])=>!isFemaleClubRecord497(uid,record)));
}
export function filterWorldDirectory497(rows,index){
 const allowed=new Set(Object.keys(index||{}));
 return (rows||[]).filter(row=>Array.isArray(row)&&!isFemalePlayerRecord497({id:row[0]})&&(!row[5]||allowed.has(String(row[5]))));
}
export function filterWorldShard497(data){
 if(!data||typeof data!=='object')return data;
 return {...data,
  clubes:Array.isArray(data.clubes)?data.clubes.filter(c=>!isFemaleClubRecord497(c.club_uid,c)).map(c=>({...c,jugadores:(c.jugadores||[]).filter(p=>!isFemalePlayerRecord497(p))})):data.clubes,
  jugadores:Array.isArray(data.jugadores)?data.jugadores.filter(p=>!isFemalePlayerRecord497(p)):data.jugadores};
}
