import {AtlasRegion} from './persona-portrait';
// Prepared stack groups from the supplied production sheet: one node per total.
const columns=[{x:0,w:370},{x:375,w:350},{x:730,w:355},{x:1090,w:360},{x:1455,w:350},{x:1810,w:362}];
export default function ChipStack({amount,color=0}:{amount:number;color?:number}){
 if(amount<=0)return null;
 const c=columns[((color%columns.length)+columns.length)%columns.length];
 return <span className="chip-stack" aria-hidden="true"><AtlasRegion region={{src:'/art/production/chips.png',x:c.x,y:405,width:c.w,height:319,sheetWidth:2172,sheetHeight:724}}/></span>;
}
