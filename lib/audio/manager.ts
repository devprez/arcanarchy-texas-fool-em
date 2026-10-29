import {ALL_FILES,DEFAULT_SETTINGS,MUSIC,SFX,normalizeSettings,type AudioSettings,type SfxName} from './catalog.ts';
type StorageLike=Pick<Storage,'getItem'|'setItem'>;
type Dependencies={fetcher:(url:string)=>Promise<Response>;createContext:()=>AudioContext|null;storage:()=>StorageLike|null;now:()=>number;visible:()=>boolean;random:()=>number};
export type AudioSnapshot={settings:AudioSettings;status:'loading'|'pending'|'ready'|'partial'|'unsupported';installed:number;available:number;unlocked:boolean};
const STORAGE_KEY='arcanarchy-audio-v1';
const defaults:Dependencies={
  fetcher:url=>fetch(url),
  createContext:()=>{if(typeof window==='undefined')return null;const Ctor=window.AudioContext||(window as unknown as {webkitAudioContext?:typeof AudioContext}).webkitAudioContext;return Ctor?new Ctor():null},
  storage:()=>{try{return typeof localStorage==='undefined'?null:localStorage}catch{return null}},
  now:()=>Date.now(),visible:()=>typeof document==='undefined'||!document.hidden,random:()=>Math.random(),
};

export class AudioManager {
  private deps:Dependencies;
  private settings:AudioSettings={...DEFAULT_SETTINGS};
  private status:AudioSnapshot['status']='loading';
  private listeners=new Set<()=>void>();
  private installed=new Set<string>();
  private failed=new Set<string>();
  private raw=new Map<string,Promise<ArrayBuffer|null>>();
  private buffers=new Map<string,Promise<AudioBuffer|null>>();
  private context:AudioContext|null=null;
  private master:GainNode|null=null;
  private sfxBus:GainNode|null=null;
  private musicBus:GainNode|null=null;
  private music:AudioBufferSourceNode|null=null;
  private musicPending=false;
  private active=new Set<AudioBufferSourceNode>();
  private consumed=new Set<string>();
  private cooldown=new Map<SfxName,number>();
  private interacted=false;
  private initialized:Promise<void>|null=null;
  private unlocking:Promise<boolean>|null=null;
  private generation=0;
  private stats={requested:0,played:0,deduplicated:0,skipped:0,musicStarts:0};
  constructor(deps:Partial<Dependencies>={}){this.deps={...defaults,...deps}}
  getSnapshot=():AudioSnapshot=>({settings:{...this.settings},status:this.status,installed:this.installed.size,available:[...this.installed].filter(p=>!this.failed.has(p)).length,unlocked:this.interacted&&this.context?.state==='running'});
  getDiagnostics(){return {...this.stats,active:this.active.size,musicPlaying:!!this.music,contextState:this.context?.state||'not-created'}}
  subscribe=(listener:()=>void)=>{this.listeners.add(listener);return()=>{this.listeners.delete(listener)}};
  private emit(){this.listeners.forEach(fn=>fn())}
  init(){if(this.initialized)return this.initialized;this.initialized=this.initialize();return this.initialized}
  private async initialize(){
    try{this.settings=normalizeSettings(JSON.parse(this.deps.storage()?.getItem(STORAGE_KEY)||'null'))}catch{this.settings={...DEFAULT_SETTINGS}}
    this.emit();
    try{const response=await this.deps.fetcher('/audio/manifest.json');if(!response.ok)throw new Error('manifest');const manifest=await response.json() as {installed?:unknown};if(Array.isArray(manifest.installed))for(const path of manifest.installed)if(typeof path==='string'&&ALL_FILES.includes(path))this.installed.add(path)}catch{/* Missing manifest means silence, never speculative 404 requests. */}
    this.updateStatus();
    // Fetch short assets early; context creation and playback still require a gesture.
    await Promise.all([...this.installed].filter(path=>path!==MUSIC).map(path=>this.loadRaw(path)));
    if(this.interacted){await this.preload();void this.syncMusic()}
  }
  private updateStatus(){if(this.status!=='unsupported'){const available=[...this.installed].filter(p=>!this.failed.has(p)).length;const complete=Object.values(SFX).every(c=>c.files.some(f=>this.installed.has(`/audio/sfx/${f}`)&&!this.failed.has(`/audio/sfx/${f}`)));this.status=!this.installed.size?'pending':available<this.installed.size||!complete?'partial':'ready'}this.emit()}
  private loadRaw(path:string):Promise<ArrayBuffer|null>{
    if(!this.installed.has(path)||this.failed.has(path))return Promise.resolve(null);
    const existing=this.raw.get(path);if(existing)return existing;
    const promise=(async()=>{try{const response=await this.deps.fetcher(path);if(!response.ok)throw new Error('asset');const bytes=await response.arrayBuffer();if(!bytes.byteLength)throw new Error('empty');return bytes}catch{this.failed.add(path);this.updateStatus();return null}})();
    this.raw.set(path,promise);return promise;
  }
  private loadBuffer(path:string):Promise<AudioBuffer|null>{
    const existing=this.buffers.get(path);if(existing)return existing;
    if(!this.context)return Promise.resolve(null);
    const context=this.context;
    const promise=(async()=>{const bytes=await this.loadRaw(path);if(!bytes)return null;try{return await context.decodeAudioData(bytes.slice(0))}catch{this.failed.add(path);this.updateStatus();return null}})();
    this.buffers.set(path,promise);return promise;
  }
  async unlock(){
    this.interacted=true;
    if(this.context?.state==='running')return true;
    // A prior mobile resume can remain pending. A fresh trusted gesture must
    // call resume again rather than wait forever on that earlier attempt.
    // Called only from trusted pointer/keyboard activation by AudioRuntime.
    try{
      if(!this.context){this.context=this.deps.createContext();if(!this.context){this.status='unsupported';this.emit();return false}this.master=this.context.createGain();this.sfxBus=this.context.createGain();this.musicBus=this.context.createGain();this.sfxBus.connect(this.master);this.musicBus.connect(this.master);this.master.connect(this.context.destination);this.applyGains()}
      const context=this.context;
      const attempt:Promise<boolean>=(async()=>{try{await context.resume();const running=context.state==='running';this.emit();if(running){void this.preload();void this.syncMusic()}return running}catch{return false}})();
      this.unlocking=attempt;
      void attempt.then(()=>{if(this.unlocking===attempt)this.unlocking=null});
      return await attempt;
    }catch{this.status='unsupported';this.emit();return false}
  }
  private async preload(){if(!this.context)return;await Promise.all([...this.installed].filter(p=>p!==MUSIC).map(p=>this.loadBuffer(p)))}
  private gain(node:GainNode|null,value:number){if(!node||!this.context)return;try{node.gain.cancelScheduledValues(this.context.currentTime);node.gain.setTargetAtTime(value,this.context.currentTime,.02)}catch{node.gain.value=value}}
  private applyGains(){this.gain(this.master,this.settings.muted?0:1);this.gain(this.sfxBus,this.settings.sfxVolume);this.gain(this.musicBus,this.settings.musicVolume*.25)}
  private persist(){try{this.deps.storage()?.setItem(STORAGE_KEY,JSON.stringify(this.settings))}catch{/* Private browsing/storage denial must not affect play. */}this.applyGains();this.emit();void this.syncMusic()}
  setMusicVolume(value:number){this.settings=normalizeSettings({...this.settings,musicVolume:value});this.persist()}
  setSfxVolume(value:number){this.settings=normalizeSettings({...this.settings,sfxVolume:value});if(!this.settings.sfxVolume)this.stopSfx();this.persist()}
  setMusicEnabled(value:boolean){this.settings={...this.settings,musicEnabled:value};this.persist()}
  toggleMute(){this.settings={...this.settings,muted:!this.settings.muted};if(this.settings.muted)this.stopSfx();this.persist();return this.settings.muted}
  private stopSfx(){this.generation++;for(const source of this.active){try{source.stop();source.disconnect()}catch{}}this.active.clear()}
  private stopMusic(){if(this.music){try{this.music.stop();this.music.disconnect()}catch{}this.music=null}}
  pause(){this.stopSfx();this.stopMusic()}
  handleVisibility(){if(!this.deps.visible()){this.stopSfx();this.stopMusic()}else void this.syncMusic()}
  private async syncMusic(){
    const allowed=()=>!!this.context&&this.context.state==='running'&&this.interacted&&this.deps.visible()&&!this.settings.muted&&this.settings.musicEnabled&&this.settings.musicVolume>0;
    if(!allowed()){this.stopMusic();return}
    if(this.music||this.musicPending||!this.installed.has(MUSIC)||this.failed.has(MUSIC))return;
    this.musicPending=true;
    try{const buffer=await this.loadBuffer(MUSIC);if(!buffer||!allowed()||this.music)return;const source=this.context!.createBufferSource();source.buffer=buffer;source.loop=true;source.loopStart=0;source.loopEnd=buffer.duration;source.connect(this.musicBus!);source.onended=()=>{source.disconnect();if(this.music===source)this.music=null};source.start();this.music=source;this.stats.musicStarts++}catch{this.stopMusic()}finally{this.musicPending=false}
  }
  async playSfx(name:SfxName,options:{id?:string;delay?:number}={}){
    this.stats.requested++;
    if(options.id){if(this.consumed.has(options.id)){this.stats.deduplicated++;return false}this.consumed.add(options.id);if(this.consumed.size>2000)this.consumed.delete(this.consumed.values().next().value!)}
    const config=SFX[name],now=this.deps.now();
    const allowed=()=>this.interacted&&!!this.context&&!this.settings.muted&&this.settings.sfxVolume>0&&this.deps.visible();
    if(!allowed()||now-(this.cooldown.get(name)??-Infinity)<config.cooldown){this.stats.skipped++;return false}
    const files=config.files.map(file=>`/audio/sfx/${file}`).filter(path=>this.installed.has(path)&&!this.failed.has(path));
    if(!files.length){this.stats.skipped++;return false}
    this.cooldown.set(name,now);const generation=this.generation;
    const path=files[Math.min(files.length-1,Math.floor(this.deps.random()*files.length))];
    try{
      if(this.unlocking)await this.unlocking;
      const buffer=await this.loadBuffer(path);
      // A late file/context response is dropped, never queued for a future turn.
      if(!buffer||!allowed()||generation!==this.generation||this.context!.state!=='running'||this.deps.now()-now>350||this.active.size>=6){this.stats.skipped++;return false}
      const context=this.context!,source=context.createBufferSource(),envelope=context.createGain();
      source.buffer=buffer;source.playbackRate.value=1+(this.deps.random()*2-1)*config.pitch;
      const start=context.currentTime+Math.max(0,Math.min(options.delay||0,.8));
      const duration=Math.min(buffer.duration/source.playbackRate.value,config.maxDuration);
      envelope.gain.setValueAtTime(0,start);envelope.gain.linearRampToValueAtTime(config.gain,start+.004);envelope.gain.setValueAtTime(config.gain,Math.max(start+.004,start+duration-.025));envelope.gain.linearRampToValueAtTime(0,start+duration);
      source.connect(envelope);envelope.connect(this.sfxBus!);source.onended=()=>{this.active.delete(source);source.disconnect();envelope.disconnect()};this.active.add(source);source.start(start);source.stop(start+duration);this.stats.played++;return true;
    }catch{this.stats.skipped++;return false}
  }
}
export const audioManager=new AudioManager();
