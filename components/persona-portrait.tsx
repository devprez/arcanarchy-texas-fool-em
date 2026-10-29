import type {CSSProperties} from 'react';
import type {Persona} from '../lib/banter/personas';
import {characterAsset,CHARACTER_PERSONAS,type Expression,type Region} from '../lib/presentation/personas';
export function AtlasRegion({region,className='',label}:{region:Region;className?:string;label?:string}){const r=region;return <span role={label?'img':undefined} aria-label={label} aria-hidden={label?undefined:true} className={`atlas-region ${className}`} style={{aspectRatio:`${r.width}/${r.height}`,backgroundImage:`url("${r.src}")`,backgroundSize:`${r.sheetWidth/r.width*100}% ${r.sheetHeight/r.height*100}%`,backgroundPosition:`${(r.sheetWidth===r.width?0:r.x/(r.sheetWidth-r.width)*100)}% ${(r.sheetHeight===r.height?0:r.y/(r.sheetHeight-r.height)*100)}%`} as CSSProperties}/>}
export default function PersonaPortrait({persona,expression='default',className=''}:{persona:Persona;expression?:Expression;className?:string}){
 const asset=characterAsset(persona,expression),fallback=characterAsset(persona,'default').src;
 return <img className={`persona-portrait ${className}`} src={asset.src} width={1000} height={1000} alt={`${CHARACTER_PERSONAS[persona].name}, ${expression}`} onError={event=>{const image=event.currentTarget;if(image.getAttribute('src')!==fallback)image.src=fallback}}/>;
}
