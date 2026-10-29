import type {Persona} from '../banter/personas.ts';
export const CHARACTER_STATES=['default','smile','react','lose'] as const;
export type Expression=typeof CHARACTER_STATES[number];
export const PERSONA_IDS:Persona[]=['fool','magician','priestess','empress'];
export const CHARACTER_PERSONAS:Record<Persona,{name:string;roman:string;color:string;palette:string;motif:string;row:number}>={
 fool:{name:'The Fool',roman:'0',color:'#ff4baf',palette:'Hot pink / black',motif:'Charming chaos',row:0},
 magician:{name:'The Magician',roman:'I',color:'#e45b5b',palette:'Red / black',motif:'Occult trickster',row:1},
 priestess:{name:'The High Priestess',roman:'II',color:'#aacbea',palette:'Blue / silver',motif:'Lunar intuition',row:2},
 empress:{name:'The Empress',roman:'III',color:'#9bc994',palette:'Green / ivory',motif:'Floral abundance',row:3}
};
export function validPersona(value:unknown):value is Persona{return PERSONA_IDS.includes(value as Persona)}
export function personaOf(p:{persona?:Persona;bot?:Persona}){return p.bot||p.persona||'fool'}
// Authoritative upgraded default masters supplied by the user. Reaction state
// events stay intact; future art changes belong only in this mapping.
export type Region={src:string;x:number;y:number;width:number;height:number;sheetWidth:number;sheetHeight:number};
export type CharacterAsset={kind:'image';src:string};
const launchDefault=(name:string)=>`/art/characters/approved-masters/${name}_default.png`;
function defaultStates(src:string):Record<Expression,string>{return {default:src,smile:src,react:src,lose:src}}
export const CHARACTER_ASSETS:Record<Persona,Record<Expression,string>>={
 fool:defaultStates(launchDefault('fool')),
 magician:defaultStates(launchDefault('magician')),
 priestess:defaultStates(launchDefault('high_priestess')),
 empress:defaultStates(launchDefault('empress'))
};
export function characterAsset(persona:Persona,expression:Expression='default'):CharacterAsset{
 return {kind:'image',src:CHARACTER_ASSETS[persona][expression]||CHARACTER_ASSETS[persona].default};
}
export const SUPPORT_ASSETS={dealer:{src:'/art/characters/atlas-v2.png',x:322,y:824,width:66,height:102,sheetWidth:1536,sheetHeight:1024},cat:{watchful:{x:580,y:812,width:52,height:88},ominous:{x:580,y:812,width:52,height:88},fate:{x:758,y:830,width:109,height:68}}};
