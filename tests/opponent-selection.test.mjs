import {test} from 'node:test';import assert from 'node:assert/strict';
import {createRoom} from '../lib/game.ts';import {addBot,BOTS} from '../lib/ai.ts';
const personas=['fool','magician','priestess','empress'];
test('each human Arcana gets only distinct eligible rivals; all six three-CPU seat orders are reachable',t=>{
 for(const human of personas){
  const orders=new Set(),seats=[new Set(),new Set(),new Set()];
  for(let first=0;first<3;first++)for(let second=0;second<2;second++){
   const r=createRoom('RIVAL2','Human',crypto.randomUUID(),human);const choices=[first,second,0];
   const mock=t.mock.method(crypto,'getRandomValues',array=>{array[0]=choices.shift()??0;return array});
   for(let count=0;count<3;count++)addBot(r,r.host);
   mock.mock.restore();
   const bots=r.players.slice(1).map(p=>p.bot);assert.equal(new Set(bots).size,3);assert.ok(!bots.includes(human));
   assert.deepEqual(new Set(bots),new Set(personas.filter(p=>p!==human)));orders.add(bots.join(','));bots.forEach((p,i)=>seats[i].add(p));
  }
  assert.equal(orders.size,6,`${human}: fixed seat order`);assert.ok(seats.every(s=>s.size===3));
 }
});
test('one/two CPU selections reach every eligible Arcana, including the green Empress',t=>{
 for(const human of personas)for(const count of [1,2]){
  const reached=new Set();
  for(let choice=0;choice<3;choice++){
   const r=createRoom('RIVAL2','Human',crypto.randomUUID(),human);const choices=[choice,0];
   const mock=t.mock.method(crypto,'getRandomValues',array=>{array[0]=choices.shift()??0;return array});
   for(let i=0;i<count;i++)addBot(r,r.host);mock.mock.restore();
   const bots=r.players.slice(1).map(p=>p.bot);assert.equal(new Set(bots).size,count);assert.ok(!bots.includes(human));bots.forEach(p=>reached.add(p));
  }
  assert.deepEqual(reached,new Set(personas.filter(p=>p!==human)));
  if(human!=='empress')assert.ok(reached.has('empress'));
 }
});
test('explicit AI invitations cannot select an occupied human Arcana',()=>{
 for(const human of personas){const r=createRoom('RIVAL2','Human',crypto.randomUUID(),human);assert.throws(()=>addBot(r,r.host,BOTS.findIndex(b=>b.kind===human)),/available/)}
});
