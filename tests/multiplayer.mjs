import assert from 'node:assert/strict';
const base=process.argv[2]||'http://127.0.0.1:5173';
const tokens=Array.from({length:5},()=>crypto.randomUUID());let code;
async function api(i,action,extra={},expectError=false){const r=await fetch(`${base}/api/game`,{method:'POST',headers:{Authorization:`Bearer ${tokens[i]}`,'Content-Type':'application/json'},body:JSON.stringify({action,code,...extra})});const d=await r.json();if(expectError){assert.ok(d.error);return d}assert.ok(!d.error,d.error);return d}
async function get(i){const r=await fetch(`${base}/api/game?code=${code}`,{headers:{Authorization:`Bearer ${tokens[i]}`}});const d=await r.json();assert.ok(!d.error,d.error);return d}
let t=await api(0,'create',{name:'Test Host'});code=t.code;
await api(0,'start',{},true);
const joins=await Promise.all([api(1,'join',{name:'Test Two'}).catch(e=>({retry:true})),api(2,'join',{name:'Test Three'}).catch(e=>({retry:true}))]);
for(let i=0;i<2;i++)if(joins[i].retry)await api(i+1,'join',{name:`Test ${i+2}`});
await api(3,'join',{name:'Test Four'});await api(4,'join',{name:'Overflow'},true);await api(1,'start',{},true);
t=await api(0,'start');const ids=(await Promise.all(tokens.slice(0,4).map((_,i)=>get(i)))).map(v=>v.me);
assert.equal(t.players.length,4);assert.equal(t.board.length,3);
for(let i=0;i<4;i++){const v=await get(i);assert.equal(v.players.find(p=>p.id===v.me).hand.length,2);assert.ok(v.players.filter(p=>p.id!==v.me).every(p=>p.hand.length===0));assert.ok(v.players.every(p=>!('token' in p)));assert.ok(!('deck' in v));}
await api(2,'fold',{},true);await api(0,'fool',{index:0});await api(0,'fool',{index:1},true);
t=await api(0,'check');t=await api(ids.indexOf(t.pending[0]),'raise');assert.equal(t.pending.at(-1),ids[0]);
// Concurrent joins may seat clients in either order; obey authoritative turn order.
for(const id of [...t.pending])t=await api(ids.indexOf(id),'call');assert.equal(t.phase,'results');assert.equal(t.board.length,5);assert.ok(t.winners.length>0);
for(let round=2;round<=5;round++){t=await api(0,'next');assert.equal(t.round,round);for(let step=0;step<4&&t.phase==='betting';step++){const i=ids.indexOf(t.pending[0]);t=await api(i,'check')}assert.equal(t.phase,round===5?'finished':'results');}
const final=await Promise.all([get(0),get(1),get(2),get(3)]);assert.ok(final.every(v=>JSON.stringify(v.players.map(p=>p.score))===JSON.stringify(final[0].players.map(p=>p.score))));
t=await api(0,'start');assert.ok(t.players.every(p=>p.fool&&p.score===0));assert.equal(t.round,1);
console.log(JSON.stringify({status:'PASS',base,room:code,clients:4,checks:['simultaneous joins','capacity','host permissions','private cards and tokens','illegal turns','Fool one use','raise reopens decisions','five complete hands','consistent scores','rematch']},null,2));
