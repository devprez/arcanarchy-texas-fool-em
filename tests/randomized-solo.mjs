import assert from 'node:assert/strict';
const base=process.argv[2]||'http://127.0.0.1:5182',personas=['fool','magician','priestess','empress'];
const summary=[];
for(const persona of personas)for(const count of [1,2,3]){
 const seen=new Set(),orders=new Set(),seats=Array.from({length:count},()=>new Set());let games=0;
 for(;games<64;games++){
  const token=crypto.randomUUID(),headers={Authorization:`Bearer ${token}`,'Content-Type':'application/json'};
  const post=async payload=>(await fetch(base+'/api/game',{method:'POST',headers,body:JSON.stringify(payload)})).json();
  const r=await post({action:'solo',name:'Rival QA',persona,soloComputers:count});assert.ok(!r.error,r.error);
  const rivals=r.players.filter(p=>p.id!==r.me),kinds=rivals.map(p=>p.bot);
  assert.equal(kinds.length,count);assert.equal(new Set(kinds).size,count);assert.ok(!kinds.includes(persona));assert.ok(rivals.every(p=>p.hand.length===0));
  kinds.forEach((p,i)=>{seen.add(p);seats[i].add(p)});orders.add(kinds.join(','));
  const refreshed=await(await fetch(base+'/api/game?code='+r.code,{headers})).json();
  assert.equal(refreshed.environmentId,r.environmentId);assert.deepEqual(refreshed.players.map(p=>p.bot),r.players.map(p=>p.bot));
  await post({action:'leave',code:r.code});
  if(seen.size===3&&(count!==3||orders.size===6))break;
 }
 assert.deepEqual(seen,new Set(personas.filter(p=>p!==persona)));
 if(count===3){assert.equal(orders.size,6);assert.ok(seats.every(s=>s.size===3))}
 summary.push({human:persona,cpus:count,newGames:games+1,opponents:[...seen],orders:orders.size});
}
console.log(JSON.stringify({status:'PASS',base,summary},null,2));
