import assert from 'node:assert/strict';
import {ROOM_ENVIRONMENTS} from '../lib/room-environments.ts';
const base=process.argv[2]||'http://127.0.0.1:5173';const tokens=[crypto.randomUUID(),crypto.randomUUID()];let code;
async function post(i,action,extra={}){const response=await fetch(`${base}/api/game`,{method:'POST',headers:{Authorization:`Bearer ${tokens[i]}`,'Content-Type':'application/json'},body:JSON.stringify({action,code,...extra})});const t=await response.json();assert.ok(!t.error,t.error);return t}
async function get(i){const response=await fetch(`${base}/api/game?code=${code}`,{headers:{Authorization:`Bearer ${tokens[i]}`}});const t=await response.json();assert.ok(!t.error,t.error);return t}
let t=await post(0,'create',{name:'Environment Host',persona:'fool',environmentId:'not-client-selectable'});code=t.code;const assigned=t.environmentId;assert.ok(ROOM_ENVIRONMENTS.some(e=>e.id===assigned));
const guest=await post(1,'join',{name:'Environment Guest',persona:'priestess'});assert.equal(guest.environmentId,assigned);
for(let i=0;i<2;i++)assert.equal((await get(i)).environmentId,assigned);
t=await post(0,'start');const ids=t.players.map(p=>p.id);const hostId=t.me;
for(let round=1;round<=5;round++){
 while(t.phase==='betting'){const i=t.pending[0]===hostId?0:1;t=await post(i,t.raised?'call':'check');assert.equal(t.environmentId,assigned)}
 for(let i=0;i<2;i++)assert.equal((await get(i)).environmentId,assigned);
 if(round<5)t=await post(0,'next');
}
t=await post(0,'start');assert.equal(t.environmentId,assigned);
await post(1,'leave');await post(0,'leave');
const b=await post(0,'create',{name:'Environment Room B'});assert.ok(ROOM_ENVIRONMENTS.some(e=>e.id===b.environmentId));code=b.code;await post(0,'leave');
// One CPU exercises authoritative solo progression across all five hands.
t=await post(0,'solo',{name:'Environment Solo',soloComputers:1});code=t.code;const soloEnvironment=t.environmentId;
for(let round=1;round<=5;round++){
 const until=Date.now()+45000;
 while(t.phase==='betting'){
  assert.ok(Date.now()<until,'AI stalled');
  if(t.pending[0]===t.me)t=await post(0,t.raised?'call':'check');
  else{await new Promise(r=>setTimeout(r,300));t=await get(0)}
  assert.equal(t.environmentId,soloEnvironment);
 }
 if(round<5)t=await post(0,'next');
}
assert.equal(t.phase,'finished');await post(0,'leave');
console.log(JSON.stringify({status:'PASS',base,assigned,soloEnvironment,checks:['server-assigned stable ID','two independent human clients','join and repeated refresh/reconnect reads','five multiplayer hands','same-room rematch','new room uses catalog','five solo hands']},null,2));
