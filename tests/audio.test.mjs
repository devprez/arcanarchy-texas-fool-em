import {test} from 'node:test';
import assert from 'node:assert/strict';
import {AudioManager} from '../lib/audio/manager.ts';
import {AudioEventTracker} from '../lib/audio/events.ts';
import {ALL_FILES,MUSIC,normalizeSettings} from '../lib/audio/catalog.ts';
const copy=v=>structuredClone(v);
const base=()=>({code:'SOUND2',matchId:'match-one',round:0,phase:'lobby',me:'a',board:[],raised:false,winners:[],players:[{id:'a',folded:false,used:false,acted:false,score:0}]});
function rig({installed=ALL_FILES,failed=[],decodeFailure=false,storageText=null,denyStorage=false,resumeFailure=false}={}){
  let now=0,visible=true,created=0;const requests=[],sources=[],gains=[];let saved=storageText;
  const param=()=>({value:0,values:[],cancelScheduledValues(){},setTargetAtTime(v){this.value=v;this.values.push(v)},setValueAtTime(v){this.value=v},linearRampToValueAtTime(v){this.value=v}});
  const ctx={state:'suspended',currentTime:0,destination:{},resumeCalls:0,async resume(){this.resumeCalls++;if(resumeFailure)throw new Error('blocked');this.state='running'},createGain(){const node={gain:param(),connect(){},disconnect(){}};gains.push(node);return node},createBufferSource(){const s={playbackRate:{value:1},connect(){},disconnect(){},start(at=0){this.started=at;this.starts=(this.starts||0)+1},stop(at=0){this.stopped=at},loop:false};sources.push(s);return s},async decodeAudioData(){if(decodeFailure)throw new Error('corrupt');return{duration:.8}}};
  const manager=new AudioManager({fetcher:async url=>{requests.push(url);if(url==='/audio/manifest.json')return new Response(JSON.stringify({installed}));if(failed.includes(url))return new Response('',{status:404});return new Response(new Uint8Array([1,2,3,4]))},createContext:()=>{created++;return ctx},storage:()=>{if(denyStorage)throw new Error('storage denied');return{getItem:()=>saved,setItem:(k,v)=>{saved=v}}},now:()=>now,visible:()=>visible,random:()=>.75});
  return{manager,ctx,requests,sources,gains,created:()=>created,saved:()=>saved,time:v=>{now=v},visible:v=>{visible=v}};
}
const flush=()=>new Promise(r=>setImmediate(r));
test('restore baseline is silent; intended solo/host deal and repeated responses emit once',()=>{
  const tracker=new AudioEventTracker(),r=base();assert.deepEqual(tracker.observeTable(r,{now:0}),[]);
  r.players.push({id:'b',folded:false,used:false,acted:false,score:0});assert.deepEqual(tracker.observeTable(r,{now:100}).map(c=>c.name),['join']);
  r.round=1;r.phase='betting';r.board=[1,2,3];assert.deepEqual(tracker.observeTable(r,{intent:'start',now:200}).map(c=>c.name),['cardDeal']);assert.deepEqual(tracker.observeTable(copy(r),{now:300}),[]);
  const solo=new AudioEventTracker();assert.equal(solo.observeTable(r,{intent:'solo',now:0})[0].name,'cardDeal');const joined=new AudioEventTracker();assert.deepEqual(joined.observeTable(r,{now:0}),[]);
});
test('remote fold/Fool and win/loss/reveal react to authoritative state, once per round',()=>{
  const r=base();r.players.push({id:'b',folded:false,used:false,acted:false,score:0});r.round=1;r.phase='betting';r.board=[1,2,3];const tracker=new AudioEventTracker();tracker.observeTable(r,{now:0});
  r.players[1].used=true;assert.deepEqual(tracker.observeTable(r,{now:100}).map(c=>c.name),['fool']);assert.deepEqual(tracker.observeTable(r,{now:200}),[]);
  r.players[1].folded=true;r.phase='results';r.winners=['a'];r.board=[1,2,3,4,5];const result=tracker.observeTable(r,{now:300});assert.deepEqual(result.map(c=>c.name),['fold','cardReveal','win']);assert.deepEqual(tracker.observeTable(r,{now:400}),[]);
  const loss=new AudioEventTracker();const first=copy(r);first.phase='betting';first.board=[1,2,3];first.players[1].folded=false;loss.observeTable(first,{now:0});r.winners=['b'];assert.ok(loss.observeTable(r,{now:100}).some(c=>c.name==='loss'));
});
test('rematches get new IDs; stale prior match and prior-round responses cannot replay',()=>{
  const tracker=new AudioEventTracker(),r=base();r.round=5;r.phase='finished';r.board=[1,2,3,4,5];tracker.observeTable(r,{now:0});const old=copy(r);r.matchId='match-two';r.round=1;r.phase='betting';r.board=[1,2,3];const cues=tracker.observeTable(r,{now:100});assert.equal(cues[0].name,'cardDeal');assert.ok(cues[0].id.includes('match-two'));assert.deepEqual(tracker.observeTable(old,{now:200}),[]);assert.deepEqual(tracker.observeTable(r,{now:300}),[]);
});
test('reconnect, visibility return, and long poll gaps establish silent baselines',()=>{
  const tracker=new AudioEventTracker(),r=base();tracker.observeTable(r,{now:0});r.phase='betting';r.round=1;r.board=[1,2,3];tracker.markResync();assert.deepEqual(tracker.observeTable(r,{now:100}),[]);r.players[0].used=true;assert.deepEqual(tracker.observeTable(r,{now:200,silent:true}),[]);assert.deepEqual(tracker.observeTable(r,{now:300}),[]);r.phase='results';r.board=[1,2,3,4,5];r.winners=['a'];assert.deepEqual(tracker.observeTable(r,{now:6500}),[]);
});
test('chat history and own messages are silent; new remote batches coalesce; reconnect is silent',()=>{
  const tracker=new AudioEventTracker(),history=[{id:'old',playerId:'b'}];assert.deepEqual(tracker.observeChat('ROOM','a',history,{now:0}),[]);const own=[...history,{id:'own',playerId:'a'}];assert.deepEqual(tracker.observeChat('ROOM','a',own,{now:100}),[]);const fresh=[...own,{id:'new1',playerId:'b'},{id:'new2',playerId:'b'}];assert.deepEqual(tracker.observeChat('ROOM','a',fresh,{now:200}).map(c=>c.name),['chat']);assert.deepEqual(tracker.observeChat('ROOM','a',fresh,{now:300}),[]);tracker.resetChat('ROOM');assert.deepEqual(tracker.observeChat('ROOM','a',[...fresh,{id:'missed',playerId:'b'}],{now:400}),[]);
});
test('no context/autoplay before a gesture; manifest preloads real files and handles missing catalog silently',async()=>{
  const r=rig({installed:[]});await r.manager.init();assert.equal(r.created(),0);assert.equal(r.manager.getSnapshot().status,'pending');assert.deepEqual(r.requests,['/audio/manifest.json']);assert.equal(await r.manager.playSfx('fool',{id:'locked'}),false);await r.manager.unlock();assert.equal(r.created(),1);assert.equal(await r.manager.playSfx('fool',{id:'locked'}),false);assert.equal(r.sources.length,0);
});
test('settings clamp and persist, including zero volume and opt-in music; denied storage is harmless',async()=>{
  assert.deepEqual(normalizeSettings({sfxVolume:2,musicVolume:-1,muted:true,musicEnabled:true}),{sfxVolume:1,musicVolume:0,muted:true,musicEnabled:true});
  const r=rig();await r.manager.init();r.manager.setMusicVolume(.07);r.manager.setSfxVolume(0);r.manager.toggleMute();r.manager.setMusicEnabled(true);const second=rig({storageText:r.saved()});await second.manager.init();assert.deepEqual(second.manager.getSnapshot().settings,{muted:true,musicEnabled:true,musicVolume:.07,sfxVolume:0});assert.equal(second.created(),0);const denied=rig({denyStorage:true});await denied.manager.init();assert.doesNotThrow(()=>denied.manager.setSfxVolume(.3));
});
test('manager deduplicates snapshot events, varies paper pitch narrowly, caps Fool, and suppresses muted history',async()=>{
  const r=rig();await r.manager.init();await r.manager.unlock();assert.equal(await r.manager.playSfx('cardDeal',{id:'deal'}),true);assert.equal(await r.manager.playSfx('cardDeal',{id:'deal'}),false);assert.ok(r.sources[0].playbackRate.value>=.975&&r.sources[0].playbackRate.value<=1.025);
  r.time(1000);assert.equal(await r.manager.playSfx('fool',{id:'fool'}),true);assert.equal(r.sources.at(-1).playbackRate.value,1);assert.ok(r.sources.at(-1).stopped-r.sources.at(-1).started<=1);
  r.manager.toggleMute();assert.equal(await r.manager.playSfx('win',{id:'muted-win'}),false);r.manager.toggleMute();assert.equal(await r.manager.playSfx('win',{id:'muted-win'}),false);assert.equal(r.manager.getDiagnostics().active,0);
});
test('music is optional, one seamless buffer loop, low gain; mute/zero/hidden stop it without new SFX',async()=>{
  const r=rig();await r.manager.init();await r.manager.unlock();await flush();assert.equal(r.manager.getDiagnostics().musicPlaying,false);r.manager.setMusicEnabled(true);await flush();assert.equal(r.manager.getDiagnostics().musicStarts,1);const music=r.sources.find(s=>s.loop);assert.equal(music.loopStart,0);assert.equal(music.loopEnd,music.buffer.duration);assert.equal(r.gains[2].gain.value,.18*.25);
  await r.manager.unlock();r.manager.setMusicVolume(.1);await flush();assert.equal(r.manager.getDiagnostics().musicStarts,1);r.visible(false);r.manager.handleVisibility();assert.equal(r.manager.getDiagnostics().musicPlaying,false);assert.equal(await r.manager.playSfx('chat',{id:'background'}),false);r.visible(true);r.manager.handleVisibility();await flush();assert.equal(r.manager.getDiagnostics().musicStarts,2);r.manager.setMusicVolume(0);assert.equal(r.manager.getDiagnostics().musicPlaying,false);assert.equal(r.manager.getDiagnostics().played,0);
});
test('failed fetch/decode and blocked resume never reject or destabilize play',async()=>{
  const missing=rig({installed:['/audio/sfx/fool.mp3'],failed:['/audio/sfx/fool.mp3']});await missing.manager.init();await missing.manager.unlock();assert.equal(await missing.manager.playSfx('fool'),false);assert.equal(missing.requests.filter(p=>p.endsWith('fool.mp3')).length,1);assert.equal(await missing.manager.playSfx('fool'),false);
  const corrupt=rig({installed:['/audio/sfx/fool.mp3'],decodeFailure:true});await corrupt.manager.init();await corrupt.manager.unlock();assert.equal(await corrupt.manager.playSfx('fool'),false);const blocked=rig({resumeFailure:true});await blocked.manager.init();assert.equal(await blocked.manager.unlock(),false);assert.equal(await blocked.manager.playSfx('win'),false);
});
test('slow decoded cues are dropped rather than playing late; hidden/pause cancels active nodes',async()=>{
  const r=rig();await r.manager.init();await r.manager.unlock();const pending=r.manager.playSfx('fold',{id:'late'});r.time(1000);assert.equal(await pending,false);r.time(2000);await r.manager.playSfx('win',{id:'visible'});assert.equal(r.manager.getDiagnostics().active,1);r.manager.pause();assert.equal(r.manager.getDiagnostics().active,0);assert.ok(r.sources.at(-1).stopped!==undefined);
});
test('integration: duplicate move + poll responses produce exactly one deal/reveal/outcome',async()=>{
  const r=rig();await r.manager.init();await r.manager.unlock();const tracker=new AudioEventTracker(),table=base();tracker.observeTable(table,{now:0});table.round=1;table.phase='betting';table.board=[1,2,3];for(const cue of [...tracker.observeTable(table,{intent:'start',now:10}),...tracker.observeTable(table,{now:20})])await r.manager.playSfx(cue.name,{id:cue.id});
  r.time(1000);table.board=[1,2,3,4,5];table.phase='results';table.winners=['a'];const cues=tracker.observeTable(table,{now:100});for(const cue of [...cues,...cues,...tracker.observeTable(table,{now:200})])await r.manager.playSfx(cue.name,{id:cue.id,delay:cue.delay});assert.equal(r.manager.getDiagnostics().played,3);assert.equal(r.manager.getDiagnostics().deduplicated,2);
});

// Omen uses the authoritative hand/match key; repeated polls never replay it.
test('a Major Arcana reveal sounds once per hand and stays silent on reconnect',()=>{
 const tracker=new AudioEventTracker();
 const table={code:'OMEN22',matchId:'omen-match',round:1,omen:2,phase:'betting',me:'a',board:[1,2,3],raised:false,winners:[],players:[{id:'a',folded:false,used:false,acted:false,score:0}]};
 assert.deepEqual(tracker.observeTable(table,{intent:'solo',now:1000}).map(c=>c.name),['cardDeal','omen']);
 assert.deepEqual(tracker.observeTable(table,{now:1100}),[]);
 tracker.markResync();assert.deepEqual(tracker.observeTable(table,{now:1200}),[]);
});

test('a fresh gesture can unlock audio after an earlier mobile resume remains pending',async()=>{
 const r=rig();await r.manager.init();let release;
 r.ctx.resume=()=>{r.ctx.resumeCalls++;if(r.ctx.resumeCalls===1)return new Promise(resolve=>{release=resolve});r.ctx.state='running';return Promise.resolve()};
 const first=r.manager.unlock();
 assert.equal(r.manager.getSnapshot().unlocked,false);
 assert.equal(await r.manager.unlock(),true);
 assert.equal(r.ctx.resumeCalls,2);assert.equal(r.created(),1);
 assert.equal(await r.manager.playSfx('uiSelect',{id:'after-mobile-tap'}),true);
 release();await first;
 r.manager.setMusicEnabled(true);await flush();assert.equal(r.manager.getDiagnostics().musicStarts,1);
});
