'use client';
import {useEffect,useState} from 'react';
type Listing={code:string;host:string;humans:number;computers:number;seated:number;capacity:number};
export default function OpenTables({onJoin,disabled}:{onJoin:(code:string)=>void;disabled:boolean}){
 const [tables,setTables]=useState<Listing[]>([]),[error,setError]=useState('');
 useEffect(()=>{let alive=true;let timer:ReturnType<typeof setTimeout>;async function poll(){try{const r=await fetch('/api/game?lobby=1');const d=await r.json() as {tables:Listing[];error?:string};if(!r.ok||d.error)throw Error();if(alive){setTables(d.tables);setError('')}}catch{if(alive)setError('Open tables are temporarily unavailable. Room codes still work.')}if(alive)timer=setTimeout(poll,5000)}poll();return()=>{alive=false;clearTimeout(timer)}},[]);
 return <section className="open-tables"><p className="eyebrow">THE COMMON ROOM</p><h2>Find your table.</h2><p>Listed tables welcome new players before dealing. Full tables can open a human seat when the host removes a CPU.</p>{error?<p role="status">{error}</p>:tables.length?<div className="table-list">{tables.map(t=><article key={t.code}><div><h3>{t.host}’s table</h3><p>{t.humans} human · {t.computers} CPU · {t.seated}/{t.capacity} seated</p></div><button className="secondary" disabled={disabled||t.seated>=t.capacity} onClick={()=>onJoin(t.code)}>{t.seated<t.capacity?'Request open seat ↗':'Full · host can free CPU seat'}</button></article>)}</div>:<p>No listed tables yet. Open one for the rebellion.</p>}</section>
}
