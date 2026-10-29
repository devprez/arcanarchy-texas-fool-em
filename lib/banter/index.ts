import type {Room} from '../game.ts';
import {PERSONAS,CHANCES,type Trigger,type Persona} from './personas.ts';
import {DIALOGUE} from './dialogue.ts';
export type BanterMessage={id:string;playerId:string;name:string;body:string;sentAt:number;bot:Persona};
export type BanterState={sequence:number;lastAt:number;lastBot:Record<string,number>;used:Record<string,number[]>;streak:Record<string,number>;messages:BanterMessage[]};
export function hash(s:string){let h=2166136261;for(const c of s)h=Math.imul(h^c.charCodeAt(0),16777619);return h>>>0}
export function speak(r:Room,trigger:Trigger,actor?:string,now=Date.now(),force=false){
 const s=r.banter??={sequence:0,lastAt:0,lastBot:{},used:{},streak:{},messages:[]};const seq=++s.sequence;
 if(!force&&now-s.lastAt<2500)return;
 const candidates=r.players.filter(p=>p.bot&&(actor?p.id===actor:true)).sort((a,b)=>hash(`${r.code}:${seq}:${a.id}`)-hash(`${r.code}:${seq}:${b.id}`));
 for(const p of candidates){const kind=p.bot!;const seed=`${r.code}:${r.matchId}:${seq}:${p.id}:${trigger}`;
 if(!force&&(now-(s.lastBot[p.id]||0)<9000||hash(seed)%10000/10000>=CHANCES[trigger]*PERSONAS[kind].frequency))continue;
 const pool=DIALOGUE[kind][trigger],key=`${p.id}:${trigger}`;let used=s.used[key]||[];if(used.length>=pool.length)used=[];
 const available=pool.map((_,i)=>i).filter(i=>!used.includes(i));const index=available[hash(seed+':line')%available.length];s.used[key]=[...used,index];s.lastAt=now;s.lastBot[p.id]=now;
 s.messages.push({id:`banter:${r.matchId||r.code}:${seq}:${p.id}`,playerId:p.id,name:p.name,body:pool[index],sentAt:now,bot:kind});s.messages=s.messages.slice(-30);return;
 }
}
export function afterAction(r:Room,id:string,type:string,before:{phase:string;round:number;raised:boolean},now=Date.now()){
 const p=r.players.find(p=>p.id===id)!;
 const solo=r.players.length===2&&r.players.filter(p=>p.bot).length===1;
 const emit=(trigger:Trigger,actor?:string)=>speak(r,trigger,actor,now,solo&&!p.bot);
 if(type==='start'){if(r.banter)r.banter.streak={};emit(before.phase==='finished'?'rematch':'game_start');return}
 if(type==='next'&&solo&&!p.bot){emit('game_start');return}
 if(before.phase==='betting'&&r.phase!=='betting'){
  const s=r.banter??={sequence:0,lastAt:0,lastBot:{},used:{},streak:{},messages:[]};
  for(const player of r.players)s.streak[player.id]=r.winners.includes(player.id)?(s.streak[player.id]||0)+1:0;
  const winner=r.players.find(p=>p.bot&&r.winners.includes(p.id));
  const loser=r.players.find(p=>p.bot&&!r.winners.includes(p.id));
  if(hash(`${r.matchId}:${r.round}:showdown`)%5===0&&r.players.filter(p=>!p.folded).length>1)emit('showdown',undefined);else if(winner)emit('bot_win',winner.id);else if(r.players.some(p=>!p.bot&&s.streak[p.id]>=2))emit('player_win_streak',undefined);else if(loser)emit('bot_loss',loser.id);else emit('showdown',undefined);
  return;
 }
 if(type==='fool')emit('fool_event',undefined);
 else if(type==='fold')emit(p.bot?'fold':'opponent_fold',p.bot?id:undefined);
 else if(type==='raise')emit(r.prize>=6?'big_raise':'raise',p.bot?id:undefined);
 else if((p.bot||solo)&&(type==='check'||type==='call'))emit(type,p.bot?id:undefined);
}
