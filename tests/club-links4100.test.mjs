import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {COUNTRIES} from '../src/countries.mjs';
import {CLUB_LINKS4100} from '../src/club-links4100.mjs';
import {resolveClub,loadClubSquad} from '../src/club-squads495.mjs';
import {isFemaleClubRecord497} from '../src/world-gender497.mjs';

const data = path=>JSON.parse(gunzipSync(readFileSync(new URL('../assets/world-data/'+path+'.gz',import.meta.url))));
const idx=data('clubs.json');
const clubs=new Map(COUNTRIES.flatMap(c=>c.clubs.map(x=>[x.id,x])));
const noMappings={mapping:{},countries:{CL:'190',AR:'187',ES:'170'}};

test('583 correspondencias de la exportación de 2026 tienen ID, país y nombre íntegros',()=>{
 assert.ok(Object.keys(CLUB_LINKS4100).length>=580);
 for(const [gameId,[uid,country,worldName,gameName]] of Object.entries(CLUB_LINKS4100)){
  assert.equal(clubs.get(gameId)?.name,gameName,gameId+' cambió de identidad');
  assert.equal(idx[uid]?.nombre,worldName,gameId+' nombre de la base distinto');
  assert.equal(String(idx[uid]?.pais_id_fm),country,gameId+' país incorrecto');
  assert.ok(Number(idx[uid]?.n_jugadores)>0,gameId+' sin registros');
  assert.equal(isFemaleClubRecord497(uid,idx[uid]),false,gameId+' marcado femenino');
 }
});

test('Universidad Católica, Deportes Iquique y Wanderers usan el UID profesional original',()=>{
 for(const [id,uid] of [['cl-3','401'],['cl-extra-3','130787'],['cl-extra-9','120784']]){
  const club=resolveClub({kind:'game',id},idx,noMappings);
  assert.equal(club.uid,uid,id);
  assert.equal(club.entry.nombre,idx[uid].nombre);
 }
});

test('no se enlaza un UID si cambia el nombre o el país del registro',()=>{
 const idxChanged={...idx,'401':{...idx['401'],pais_id_fm:'99999'}};
 const club=resolveClub({kind:'game',id:'cl-3'},idxChanged,noMappings);
 assert.notEqual(club.uid,'401');
});

test('fichas de equipos chilenos recuperan jugadores reales desde sus shards',async()=>{
 for(const [id,uid] of [['cl-3','401'],['cl-extra-3','130787'],['cl-extra-9','120784']]){
  const meta=idx[uid];
  const shard=data(meta.archivo);
  const world=shard.clubes.find(x=>String(x.club_uid)===uid);
  assert.ok(world?.jugadores?.length>=11,id);
  const api={getWorldMappingInfo:async()=>noMappings,getWorldIndex:async()=>idx,
   readWorldClub:async target=>target===uid?{uid,name:world.nombre,players:world.jugadores}:null,
   getWorldPlayer:async()=>null};
  const result=await loadClubSquad({kind:'game',id},{fm26:{year:2026,changes:{}}},api);
  assert.equal(result.uid,uid,id);
  assert.ok(result.players.length>=11,id+' plantilla quedó vacía');
  assert.ok(result.players.length<=30,id+' mostró reserva completa');
  assert.equal(result.generatedCount,0);
 }
});
