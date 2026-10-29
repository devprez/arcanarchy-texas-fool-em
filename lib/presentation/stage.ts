import type {Card} from '../game.ts';
import type {Persona} from '../banter/personas.ts';
import type {Expression} from './personas.ts';
export type StageSeat={persona?:Persona;bot?:Persona;id:string;name:string;hand:Card[];score:number;fool:boolean;folded:boolean;acted:boolean;used:boolean;label?:string};
export type StageTable={environmentId?:string;colors?:Record<string,number>;matchId?:string;code:string;players:StageSeat[];host:string;phase:string;round:number;board:Card[];omen:number;raised:boolean;pending:string[];deadline:number;winners:string[];prize:number;log:string[];me:string};
export type CatState='calm'|'watchful'|'ominous'|'fate';
export const OBSERVATORY_TABLE='/art/rooms/rendered/celestial-velvet-table.png';
export function opponents(t:StageTable){const at=t.players.findIndex(p=>p.id===t.me);return [...t.players.slice(at+1),...t.players.slice(0,at)].filter(p=>p.id!==t.me)}
export function expressionFor(t:StageTable,p:StageSeat,react=false,chat=false):Expression{
 if(t.phase==='results'||t.phase==='finished')return t.winners.includes(p.id)?'smile':'lose';
 if(p.folded)return 'lose';
 if(react)return 'react';
 if(chat)return 'smile';
 return 'default';
}
export function catState(t:StageTable,chaos=false):CatState{return chaos?'fate':t.round===5?'ominous':t.raised?'watchful':'calm'}

