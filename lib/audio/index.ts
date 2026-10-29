import {AudioEventTracker,type AudioTable} from './events.ts';
import {audioManager} from './manager.ts';
export {audioManager};
const tracker=new AudioEventTracker();
const silent=()=>typeof document!=='undefined'&&document.hidden;
export const gameAudio={
  table(snapshot:AudioTable,intent?:string){for(const cue of tracker.observeTable(snapshot,{intent,silent:silent()}))void audioManager.playSfx(cue.name,{id:cue.id,delay:cue.delay})},
  chat(room:string,me:string,messages:{id:string;playerId:string}[]){for(const cue of tracker.observeChat(room,me,messages,{silent:silent()}))void audioManager.playSfx(cue.name,{id:cue.id})},
  chatResync(room:string){tracker.resetChat(room)},
  resync(){tracker.markResync()},leave(){tracker.leave()},
  select(){void audioManager.playSfx('uiSelect')},
};
