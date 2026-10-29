// Shared server/client catalog. Rooms persist only environmentId, never asset paths.
export type RoomEnvironment={id:string;name:string;background:string;bakedTable:boolean;focalPoint?:string};
export const ROOM_ENVIRONMENTS:readonly RoomEnvironment[]=[
 {id:'observatory',name:'The Observatory',background:'/art/rooms/rendered/observatory-library.png',bakedTable:false},
 {id:'astral-library',name:'The Astral Library',background:'/art/rooms/environments/astral-library.webp',bakedTable:true},
 {id:'ashen-wastes',name:'The Ashen Wastes',background:'/art/rooms/environments/ashen-wastes.webp',bakedTable:true},
 {id:'moon-garden',name:'The Moon Garden',background:'/art/rooms/environments/moon-garden.webp',bakedTable:true},
 {id:'neon-spire',name:'The Neon Spire',background:'/art/rooms/environments/neon-spire.webp',bakedTable:true}
];
// Missing IDs belong to pre-feature rooms. Never randomly reroll on read/reconnect.
export function roomEnvironment(id:unknown):RoomEnvironment{return ROOM_ENVIRONMENTS.find(e=>e.id===id)||ROOM_ENVIRONMENTS[0]}
