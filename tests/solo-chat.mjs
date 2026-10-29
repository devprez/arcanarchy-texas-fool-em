import assert from 'node:assert/strict';
const base=process.argv[2]||'http://127.0.0.1:5181';
for(const count of [1,2,3]){
 const token=crypto.randomUUID(),headers={Authorization:`Bearer ${token}`,'Content-Type':'application/json'};
 const game=async body=>(await fetch(base+'/api/game',{method:'POST',headers,body:JSON.stringify(body)})).json();
 const t=await game({action:'solo',name:'Chat QA',soloComputers:count});assert.ok(!t.error,t.error);
 const id=crypto.randomUUID(),body={code:t.code,id,body:'Nice hand!'};
 for(let retry=0;retry<3;retry++){const response=await fetch(base+'/api/talk',{method:'POST',headers,body:JSON.stringify(body)});assert.ok(response.ok,await response.text())}
 const history=await(await fetch(base+'/api/talk?code='+t.code,{headers})).json();
 const replies=history.messages.filter(m=>m.id===`ai-reply:${id}`);assert.equal(replies.length,1);assert.ok(replies[0].bot);assert.ok(t.players.some(p=>p.id===replies[0].playerId&&p.bot));
 await game({action:'leave',code:t.code});
}
console.log('PASS: 1, 2, 3 CPU solo chat returns exactly one scripted reply, including repeated retries.');
