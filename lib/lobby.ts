import type {Persona} from './banter/personas.ts';
import type {Room} from './game.ts';
import {BOTS} from './ai.ts';
export function configure(r:Room,humans:unknown,computers:unknown){
 if(!Number.isInteger(humans)||!Number.isInteger(computers)||Number(humans)<1||Number(computers)<0||Number(humans)+Number(computers)<2||Number(humans)+Number(computers)>4)throw new Error('Choose 2–4 seats, including at least one human.');
 r.capacity=Number(humans)+Number(computers);r.humanSeats=Number(humans);
}
export function joinRoom(r:Room,name:string,token:string,persona:Persona='fool'){
 const existing=r.players.find(p=>!p.bot&&p.token===token);if(existing)return false;
 if(r.closed)throw new Error('This table has closed. Choose another table.');
 if(r.phase!=='lobby')throw new Error('This match is underway. Join when the table returns to the lobby.');
 if(r.players.length>=(r.capacity||4))throw new Error('This table is full. The host can remove a CPU before you join.');
 r.colors??=Object.fromEntries(r.players.map((p,i)=>[p.id,i]));const id=crypto.randomUUID();r.colors[id]=[0,1,2,3].find(c=>!r.players.some(p=>r.colors![p.id]===c))??0;r.players.push({id,token,name,persona,hand:[],score:0,fool:true,folded:false,acted:false,used:false});
 r.log.push(`${name} joined the table.`);return true;
}
export function leaveRoom(r:Room,token:string){
 r.colors??=Object.fromEntries(r.players.map((p,i)=>[p.id,i]));const p=r.players.find(p=>!p.bot&&p.token===token);if(!p)throw new Error('Seat not found.');
 const others=r.players.filter(x=>!x.bot&&x.id!==p.id);
 if(r.phase!=='lobby'&&others.length){const bot=BOTS.find(b=>!r.players.some(x=>x.bot===b.kind))!;p.bot=bot.kind;p.persona=bot.kind;p.name=`${bot.name} (substitute)`;p.token=crypto.randomUUID();p.substitute=true;r.log.push('A departing player’s seat is now controlled by a substitute AI.');}
 else r.players=r.players.filter(x=>x.id!==p.id);
 if(r.host===p.id)r.host=others[0]?.id||'';
 if(!others.length){r.players=[];r.phase='lobby';r.pending=[];r.host='';r.closed=true;}
 
}
export function returnToLobby(r:Room,id:string){
 if(r.host!==id)throw new Error('Only the host can reopen the table.');if(r.phase==='betting')throw new Error('Finish this hand before reopening the table.');
 r.players=r.players.filter(p=>!p.substitute);r.phase='lobby';r.pending=[];r.round=0;r.board=[];r.deck=[];r.winners=[];
 r.players.forEach(p=>{p.hand=[];p.score=0;p.acted=false;p.folded=false;p.used=false;p.fool=true;delete p.label});r.log=['The table is back in the lobby. Open seats welcome.'];
}
