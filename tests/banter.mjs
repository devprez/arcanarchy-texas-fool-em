import assert from 'node:assert/strict';
const base=process.argv[2]||'http://127.0.0.1:5173';
const host=crypto.randomUUID(),guest=crypto.randomUUID();
async function game(token,action,extra={}){const r=await fetch(`${base}/api/game`,{method:'POST',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},body:JSON.stringify({action,...extra})});const d=await r.json();assert.ok(!d.error,d.error);return d}
async function talk(token,code){const r=await fetch(`${base}/api/talk?code=${code}`,{headers:{Authorization:`Bearer ${token}`}});const d=await r.json();assert.ok(!d.error,d.error);return d.messages}
const r=await game(host,'create',{name:'Host'}),code=r.code;
await game(guest,'join',{code,name:'Guest'});await game(host,'add_ai',{code,index:3});await game(host,'add_ai',{code,index:2});
const a=await talk(host,code),b=await talk(guest,code);assert.deepEqual(a,b);assert.ok(a.every(m=>m.bot&&m.id.startsWith('banter:')&&m.body.length<=300));
await Promise.all(Array.from({length:8},()=>fetch(`${base}/api/game?code=${code}`,{headers:{Authorization:`Bearer ${host}`}})));assert.deepEqual(await talk(host,code),a);
const bad=await fetch(`${base}/api/talk`,{method:'POST',headers:{Authorization:`Bearer ${guest}`,'Content-Type':'application/json'},body:JSON.stringify({code,id:crypto.randomUUID(),body:'Human message',bot:'empress',name:'The Empress'})});assert.equal(bad.status,201);const message=(await bad.json()).message;assert.equal(message.name,'Guest');assert.equal(message.bot,undefined);
const state=await game(host,'start',{code});assert.equal(state.banter,undefined);const history=await talk(host,code);assert.equal(new Set(history.map(m=>m.id)).size,history.length);assert.deepEqual(history,await talk(guest,code));
console.log(JSON.stringify({status:'PASS',base,checks:['all clients share authoritative AI messages','repeated/concurrent sync does not invent dialogue','human cannot spoof AI attribution','room memory stays server-side','refresh reads stable history'],observedAiLines:history.filter(m=>m.bot).length},null,2));
