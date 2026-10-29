import type {SfxName} from './catalog.ts';
export type AudioTable={omen?:number;code:string;matchId?:string;round:number;phase:string;me:string;board:unknown[];raised:boolean;winners:string[];players:{id:string;folded:boolean;used:boolean;acted:boolean;score:number}[]};
export type Cue={name:SfxName;id:string;delay?:number};
type ChatItem={id:string;playerId:string};

// Pure authoritative-snapshot observer: no React effects or audio nodes here.
export class AudioEventTracker {
  private table:AudioTable|null=null;
  private tableTime=0;
  private generation=0;
  private pastMatches=new Set<string>();
  private resync=true;
  private chat=new Map<string,{ids:Set<string>;time:number}>();
  resetChat(room:string){this.chat.delete(room)}
  markResync(){this.resync=true;this.chat.clear()}
  leave(){this.table=null;this.tableTime=0;this.resync=true;this.chat.clear()}
  observeTable(next:AudioTable,options:{intent?:string;now?:number;silent?:boolean}={}):Cue[]{
    const now=options.now??Date.now(),prev=this.table;
    const sameRoom=prev?.code===next.code;
    const newMatch=sameRoom&&!!next.matchId&&next.matchId!==prev?.matchId;
    if(newMatch&&this.pastMatches.has(`${next.code}:${next.matchId}`))return [];
    // Ignore old same-match responses that arrive after a move response.
    if(sameRoom&&!newMatch&&prev){
      if(next.round<prev.round&&!(prev.phase==='finished'&&next.round===1))return [];
      if(next.round===prev.round&&['results','finished'].includes(prev.phase)&&next.phase==='betting')return [];
    }
    const first=!sameRoom;
    const gap=!!this.tableTime&&now-this.tableTime>5000;
    const explicitDeal=['solo','start','next'].includes(options.intent||'');
    const baseline=options.silent||gap||(this.resync&&!explicitDeal)||(first&&!explicitDeal);
    if(newMatch||(!next.matchId&&sameRoom&&prev&&next.round<prev.round))this.generation++;
    if(next.matchId)this.pastMatches.add(`${next.code}:${next.matchId}`);
    this.table=structuredClone(next);this.tableTime=now;this.resync=false;
    if(baseline)return [];
    const key=`${next.code}:${next.matchId||this.generation}:${next.round}`;
    const cues:Cue[]=[];
    const deal=next.round>0&&next.phase==='betting'&&(first||newMatch||next.round!==prev?.round||prev?.phase==='lobby');
    if(deal){cues.push({name:'cardDeal',id:`${key}:deal`});if(next.omen)cues.push({name:'omen',id:`${key}:omen`,delay:.28})}
    if(!prev||!sameRoom)return cues;
    if(next.phase==='lobby'){
      const joined=next.players.filter(p=>p.id!==next.me&&!prev.players.some(old=>old.id===p.id));
      if(joined.length)cues.push({name:'join',id:`${key}:join:${joined.map(p=>p.id).sort().join(',')}`});
      return cues;
    }
    if(deal||newMatch||next.round!==prev.round)return cues;
    const fools=next.players.filter(p=>p.used&&!prev.players.find(old=>old.id===p.id)?.used);
    const folded=next.players.filter(p=>p.folded&&!prev.players.find(old=>old.id===p.id)?.folded);
    if(fools.length)cues.push({name:'fool',id:`${key}:fool:${fools.map(p=>p.id).sort().join(',')}`});
    if(folded.length)cues.push({name:'fold',id:`${key}:fold:${folded.map(p=>p.id).sort().join(',')}`,delay:fools.length?.12:0});
    const revealed=next.board.length>prev.board.length&&next.board.length===5;
    if(revealed)cues.push({name:'cardReveal',id:`${key}:reveal`});
    const result=['results','finished'].includes(next.phase)&&prev.phase==='betting';
    if(result)cues.push({name:next.winners.includes(next.me)?'win':'loss',id:`${key}:result`,delay:fools.length?.65:revealed?.16:0});
    if(!result&&!fools.length&&!folded.length){
      const acted=next.players.filter(p=>p.acted&&!prev.players.find(old=>old.id===p.id)?.acted);
      if(acted.length||(!prev.raised&&next.raised))cues.push({name:'uiSelect',id:`${key}:decision:${next.raised?'raised':acted.map(p=>p.id).sort().join(',')}`});
    }
    return cues;
  }
  observeChat(room:string,me:string,messages:ChatItem[],options:{now?:number;silent?:boolean}={}):Cue[]{
    const now=options.now??Date.now(),prior=this.chat.get(room);
    const baseline=!prior||now-prior.time>5000||options.silent;
    const fresh=prior?messages.filter(m=>!prior.ids.has(m.id)&&m.playerId!==me):[];
    const ids=new Set(prior?.ids||[]);messages.forEach(m=>ids.add(m.id));
    this.chat.set(room,{ids:ids.size>500?new Set(messages.map(m=>m.id)):ids,time:now});
    return baseline||!fresh.length?[]:[{name:'chat',id:`${room}:chat:${fresh.map(m=>m.id).sort().join(',')}`}];
  }
}
