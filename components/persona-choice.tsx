'use client';
import type {Persona} from '../lib/banter/personas';
import {PERSONA_IDS,CHARACTER_PERSONAS} from '../lib/presentation/personas';
import PersonaPortrait from './persona-portrait';
export default function PersonaChoice({value,onChange,disabled=false}:{value:Persona;onChange:(p:Persona)=>void;disabled?:boolean}){return <fieldset className="persona-choice"><legend>CHOOSE YOUR ARCANA</legend><p>This is how the table will see you.</p><div>{PERSONA_IDS.map(id=><button type="button" aria-pressed={value===id} disabled={disabled} key={id} onClick={()=>onChange(id)} style={{borderColor:value===id?CHARACTER_PERSONAS[id].color:undefined}}><PersonaPortrait persona={id}/><b>{CHARACTER_PERSONAS[id].name}</b><small>{CHARACTER_PERSONAS[id].palette}</small></button>)}</div></fieldset>}
