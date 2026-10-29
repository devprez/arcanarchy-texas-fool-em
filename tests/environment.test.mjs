import {test} from 'node:test';import assert from 'node:assert/strict';
import {catState,OBSERVATORY_TABLE} from '../lib/presentation/stage.ts';import {ROOM_ENVIRONMENTS,roomEnvironment} from '../lib/room-environments.ts';import {SUPPORT_ASSETS,characterAsset} from '../lib/presentation/personas.ts';
test('cats are absent at calm stakes and always use full-cat regions when present',()=>{const t={round:1,omen:1,raised:false};assert.equal(catState(t),'calm');assert.equal(catState({...t,raised:true}),'watchful');assert.equal(catState({...t,round:5}),'ominous');assert.equal(catState(t,true),'fate');assert.ok(SUPPORT_ASSETS.cat.watchful.height>SUPPORT_ASSETS.cat.watchful.width);assert.ok(SUPPORT_ASSETS.cat.ominous.height>SUPPORT_ASSETS.cat.ominous.width)});
test('five production environments have exact display names and correct table flags',()=>{assert.deepEqual(ROOM_ENVIRONMENTS.map(e=>e.name),['The Observatory','The Astral Library','The Ashen Wastes','The Moon Garden','The Neon Spire']);assert.equal(roomEnvironment(undefined).id,'observatory');assert.equal(roomEnvironment('unknown').id,'observatory');assert.equal(roomEnvironment('observatory').bakedTable,false);assert.equal(OBSERVATORY_TABLE,'/art/rooms/rendered/celestial-velvet-table.png');assert.ok(ROOM_ENVIRONMENTS.slice(1).every(e=>e.bakedTable))});
test('server creation selects every configured environment and only stores its ID',async(t)=>{
 const {createRoom}=await import('../lib/game.ts');
 for(let i=0;i<ROOM_ENVIRONMENTS.length;i++){
  const mock=t.mock.method(crypto,'getRandomValues',array=>{array[0]=i;return array});
  const r=createRoom('ENV123','Host',crypto.randomUUID());mock.mock.restore();
  assert.equal(r.environmentId,ROOM_ENVIRONMENTS[i].id);
  assert.equal(r.background,undefined);assert.equal(r.includesTable,undefined);
 }
});
test('environment survives joins, serialization, five hands, rematch and reopened lobby',async()=>{
 const {createRoom,action,view}=await import('../lib/game.ts');const {joinRoom,returnToLobby}=await import('../lib/lobby.ts');
 let r=createRoom('ENV123','Host',crypto.randomUUID());const assigned=r.environmentId;
 const token=crypto.randomUUID();joinRoom(r,'Guest',token,'priestess');
 assert.equal(view(r,token).environmentId,assigned);r=JSON.parse(JSON.stringify(r));
 action(r,r.host,'start');
 for(let hand=1;hand<=5;hand++){
  while(r.phase==='betting')action(r,r.pending[0],r.raised?'call':'check');
  assert.equal(r.environmentId,assigned);assert.equal(view(JSON.parse(JSON.stringify(r)),token).environmentId,assigned);
  if(hand<5)action(r,r.host,'next');
 }
 action(r,r.host,'start');assert.equal(r.environmentId,assigned);
 while(r.phase==='betting')action(r,r.pending[0],'check');
 returnToLobby(r,r.host);assert.equal(r.environmentId,assigned);
});
