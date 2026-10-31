import test from 'node:test';
import assert from 'node:assert/strict';
import {clearFM26Memory,registerFM26Club,loadedFM26Clubs,getFM26Squad,getFM26PlayerById,getFM26BestCompetitor,
 fm26Position,fm26Attributes,fm26OVR,transferFM26,advanceFM26Season,verifyFM26Mapping,isRealClubReady} from '../src/fm26-real.mjs';
import {positionCompetition} from '../src/market.mjs';
import {leagueParticipants} from '../src/league.mjs';
import {newCareer,syncClub,migrateCareer} from '../src/engine.mjs';
const candidates=[
 ['es-1','1734'],['es-2','1708'],['cl-1','399'],['cl-2','404'],['ar-1','82'],['ar-2','94']
];
const verified=(clubId,fmUID)=>({clubId,fmUID,status:'verified',genderVerified:true,countryVerified:true,evidence:'VALIDATED_BY_TEST_FIXTURE_CLUBS_AND_NATIONS'});
const positions=['GK','DC','DL','DR','DM','MC','AMC','AML','AMR','STC','MC','STC','DC','DL','ML','MR','STC','GK','DC','MC','STC','DL','MC','STC'];
const fixture=(clubId,fmUID,i)=>({id:'fm26:'+(Number(fmUID)*1000+i),nombre:'Jugador prueba '+clubId+' '+i,edad:21+i%9,
 posiciones:[positions[i%positions.length]],equipo_slot:0,ca_fm:90+i%70,pa_fm:130+i%60,stats:{pase:10,remate:12,velocidad:13},
 club_uid:String(fmUID),nacion_fm:190});
const clubData=(clubId,fmUID)=>({club_uid:String(fmUID),pais_id_fm:'190',jugadores:Array.from({length:24},(_,i)=>fixture(clubId,fmUID,i))});
test('los homónimos NO pasan sin evidencia externa de género y país',()=>{
 assert.equal(verifyFM26Mapping({clubId:'es-1',fmUID:'2000167907',status:'pending'}),false);
 assert.equal(verifyFM26Mapping({...verified('es-1','1734'),genderVerified:false}),false);
 assert.throws(()=>registerFM26Club({clubId:'es-1',fmUID:'1734',status:'pending'},clubData('es-1','1734')),/verificado/);
 assert.throws(()=>registerFM26Club(verified('es-1','1734'),clubData('es-1','2000167907')),/FM UID distinto/);
});
test('conversor FM26 mantiene escala y posiciones; no inventa nacionalidad ISO',()=>{
 assert.equal(fm26Position(['STC']),'DC');assert.equal(fm26Position(['GK']),'POR');
 assert.equal(fm26OVR(100),70);assert.equal(fm26OVR(200),99);
 const a=fm26Attributes({remate:18,velocidad:19});assert.ok(a.shot>=60);
});
test('seis planteles y 144 candidatos de prueba sin colisiones de ID',()=>{
 clearFM26Memory();
 for(const [clubId,uid] of candidates){const r=registerFM26Club(verified(clubId,uid),clubData(clubId,uid));assert.equal(r.players,24)}
 assert.equal(loadedFM26Clubs().length,6);
 assert.ok(isRealClubReady('es-1'));assert.ok(!isRealClubReady('es-999'));
 const players=candidates.flatMap(([clubId])=>getFM26Squad(clubId,{}));
 assert.equal(players.length,144);assert.equal(new Set(players.map(x=>x.id)).size,144);
 assert.equal(positionCompetition({position:'POR',world:{players:[]}},'es-1').origin,'fm26');
 assert.equal(getFM26BestCompetitor('es-1','DC',{}).origin,'fm26');
});
test('fichaje conserva dueño único, ID y club tras JSON recargado',()=>{
 let s={fm26:{schema:1,changes:{}}};
 const id=getFM26Squad('es-1',s)[0].id;
 s=transferFM26(s,id,'es-2',2028);s=JSON.parse(JSON.stringify(s));
 assert.equal(getFM26PlayerById(id,s).clubId,'es-2');
 assert.equal(getFM26Squad('es-1',s).some(p=>p.id===id),false);
 assert.equal(getFM26Squad('es-2',s).filter(p=>p.id===id).length,1);
 assert.equal(getFM26PlayerById(id,s).transferHistory[0].from,'es-1');
});
test('dos temporadas: partidos, desarrollo, lesiones y retiros persistentes',()=>{
 let s={fm26:{schema:1,changes:{}}};
 const id=getFM26Squad('cl-1',s)[0].id,age=getFM26PlayerById(id,s).age;
 s=advanceFM26Season(s,2026);s=advanceFM26Season(s,2027);
 const after=getFM26PlayerById(id,s);
 assert.equal(after.age,age+2);assert.equal(after.seasons.length,2);
 assert.ok(after.apps>=0);assert.equal(after.seasons[0].year,2026);assert.equal(after.seasons[1].year,2027);
 const saved=JSON.parse(JSON.stringify(s));assert.equal(getFM26PlayerById(id,saved).age,age+2);
 assert.equal(Object.keys(saved.fm26.changes).length,144);
 assert.equal(Object.keys(saved.fm26.changes).some(x=>x.includes('playerName')),false);
});
test('club desconocido sin datos sigue con sistema ficticio; plantel verificado usa competidor real',()=>{
 assert.equal(getFM26Squad('fr-999',{}).length,0);
 let s=newCareer({name:'Prueba',country:'CL',position:'DC',seed:'fm26-test-2026'});
 s={...s,clubId:'cl-1',phase:'season',attributes:{pace:65,shot:66,pass:62,dribble:61,defense:58,physical:64},ovr:64};
 s=syncClub(s,{fresh:true});
 assert.equal(s.squad.realCoverage,true);assert.ok(s.squad.rival?.id?.startsWith('fm26:'));
 const migrated=migrateCareer(JSON.parse(JSON.stringify(s)));
 assert.equal(migrated?.squad?.rival?.origin,'fm26');
 assert.equal(positionCompetition({position:'POR',world:{players:[]}},'xx-123'),null);
});
test('las plantillas influyen levemente en nivel de liga sin cambiar formato',()=>{
 const s={clubId:'cl-1',world:{v:1,clubs:{},players:[],awards:[],news:[],champions:{}},fm26:{schema:1,changes:{}}};
 const c=leagueParticipants('CL','cl-1',s).find(x=>x.id==='cl-1');assert.ok(c);assert.ok(c.level>=40&&c.level<=94);
 clearFM26Memory();
});
