import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {choiceFx, chipsFor, marketRarity} from '../src/identity30.mjs';

const neutral = (foot, position) => choiceFx({foot, position});
const close = (actual, expected) => assert.ok(Math.abs(actual-expected)<1e-12, `Esperado ${expected}, obtenido ${actual}`);

test('la derecha y la izquierda reciben exactamente el mismo bono en sus bandas naturales', () => {
 for (const [right,left] of [['ED','EI'],['MD','MI'],['LD','LI']]) {
  const r=neutral('Derecha',right), l=neutral('Izquierda',left);
  close(r.minutes,.02);close(l.minutes,.02);
  close(r.goals,1);close(l.goals,1);
  close(r.assists,1);close(l.assists,1);
 }
});

test('ambas piernas reciben los mismos efectos invertidas en la banda contraria', () => {
 for (const [left,right] of [['EI','ED'],['MI','MD'],['LI','LD']]) {
  const r=neutral('Derecha',left), l=neutral('Izquierda',right);
  close(r.minutes,0);close(l.minutes,0);
  close(r.goals,1.03);close(l.goals,1.03);
  close(r.assists,.99);close(l.assists,.99);
 }
});

test('un jugador de posición central no gana ventajas automáticas por la pierna hábil', () => {
 for (const position of ['DC','MCO','MC','MCD','DFC','POR']){
  const r=neutral('Derecha',position),l=neutral('Izquierda',position);
  close(r.minutes,0);close(l.minutes,0);
  close(r.goals,1);close(l.goals,1);
  close(r.assists,1);close(l.assists,1);
 }
});

test('el mercado no penaliza ni favorece por elegir derecha o izquierda', () => {
 assert.equal(marketRarity({foot:'Derecha'}),0);
 assert.equal(marketRarity({foot:'Izquierda'}),0);
});

test('ambas opciones enseñan tres efectos equivalentes sin promesas de mercado', () => {
 const r=chipsFor('foot','Derecha'),l=chipsFor('foot','Izquierda');
 assert.equal(r.length,3);assert.equal(l.length,3);
 assert.match(r[0][0],/\+2 % minutos/);assert.match(l[0][0],/\+2 % minutos/);
 assert.match(r[1][0],/\+3 % goles/);assert.match(l[1][0],/\+3 % goles/);
 assert.match(r[2][0],/−1 % asistencias/);assert.match(l[2][0],/−1 % asistencias/);
 assert.doesNotMatch(JSON.stringify([r,l]),/mercado|rareza/i);
});

test('el HTML usa la nueva versión del motor sin cambiar la entrada de RASCENSO',()=>{
 const html=readFileSync(new URL('../index.html', import.meta.url),'utf8');
 assert.match(html,/RASCENSO 4\.(?:10\.(?:[5-9]|[1-9]\d+)|11\.\d+)/);
 assert.match(html,/"\.\/src\/identity30\.mjs":"\.\/src\/identity30\.mjs\?v=\d+"/);
 assert.match(html,/src\/experience494\.mjs\?v=\d+/);
 assert.match(html,/src\/creator-layout4103\.mjs\?v=507/);
});
