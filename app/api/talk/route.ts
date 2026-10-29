import {REPLIES} from '../../../lib/banter/replies';
import { env } from 'cloudflare:workers';
import type { Room } from '../../../lib/game';

export const dynamic = 'force-dynamic';
const response = (data: unknown, status = 200) => Response.json(data, { status, headers: { 'Cache-Control': 'no-store' } });
const uuid = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;
type MessageRow = { id: string; playerId: string; name: string; body: string; sentAt: number };

async function seat(request: Request, code: string) {
  const token = request.headers.get('Authorization')?.replace(/^Bearer /, '') || '';
  if (!uuid.test(token) || !/^[A-Z2-9]{6}$/.test(code)) throw new Error('Join this room to use Table Talk.');
  const row = await env.DB!.prepare('SELECT state, updated FROM rooms WHERE code=?').bind(code).first<{state: string; updated: number}>();
  if (!row || Date.now() - row.updated > 86400000) throw new Error('This room is unavailable or expired.');
  const room = JSON.parse(row.state) as Room;
  const player = room.players.find(p => !p.bot && p.token === token);
  if (!player) throw new Error('Only players seated in this room can use Table Talk.');
  return {player,room};
}

async function reply(room:Room,message:MessageRow){
 if(room.players.filter(p=>!p.bot).length!==1||!room.players.some(p=>p.bot))return;
 const count=await env.DB!.prepare('SELECT COUNT(*) AS n FROM table_talk WHERE room_code=? AND player_id=? AND (sent_at<? OR (sent_at=? AND id<=?))').bind(room.code,message.playerId,message.sentAt,message.sentAt,message.id).first<{n:number}>();
 // Stable message ID selects exactly one responder, also on retries.
 const bots=room.players.filter(p=>p.bot);
 const hash=Array.from(message.id).reduce((n,c)=>(n*31+c.charCodeAt(0))>>>0,0);
 const bot=bots[hash%bots.length];
 const pool=REPLIES[bot.bot!];const body=pool[((count?.n||1)-1)%pool.length];
 await env.DB!.prepare('INSERT OR IGNORE INTO table_talk (room_code,id,player_id,name,body,sent_at) VALUES (?,?,?,?,?,?)').bind(room.code,`ai-reply:${message.id}`,bot.id,bot.name,body,message.sentAt+1).run();
}
export async function GET(request: Request) {
  try {
    const code = (new URL(request.url).searchParams.get('code') || '').toUpperCase();
    const {room} = await seat(request, code);
    const rows = await env.DB!.prepare('SELECT id, player_id AS playerId, name, body, sent_at AS sentAt FROM table_talk WHERE room_code=? ORDER BY sent_at DESC, id DESC LIMIT 50').bind(code).all<MessageRow>();
    return response({ messages: [...rows.results.map(m=>({...m,bot:m.id.startsWith('ai-reply:')?room.players.find(p=>p.id===m.playerId)?.bot:undefined})),...(room.banter?.messages||[])].map(m=>({...m,color:room.colors?.[m.playerId]??Math.max(0,room.players.findIndex(p=>p.id===m.playerId))%4})).sort((a,b)=>a.sentAt-b.sentAt||a.id.localeCompare(b.id)).slice(-50) });
  } catch (error) {
    return response({ error: (error as Error).message }, 403);
  }
}

export async function POST(request: Request) {
  try {
    if (request.headers.get('Origin') && request.headers.get('Origin') !== new URL(request.url).origin) return response({error: 'Invalid origin.'}, 403);
    const payload = await request.json() as {code?: unknown; body?: unknown; id?: unknown};
    const code = String(payload.code || '').toUpperCase();
    const {player,room} = await seat(request, code);
    if (typeof payload.body !== 'string' || typeof payload.id !== 'string' || !uuid.test(payload.id)) return response({error: 'Please enter a message.'}, 400);
    const body = payload.body.replace(/[\u0000-\u0008\u000b-\u001f\u007f]/g, '').trim();
    if (!body || body.length > 300) return response({error: 'Messages must be 1–300 characters.'}, 400);
    // Idempotent retries prevent duplicate messages after a lost response.
    const existing = await env.DB!.prepare('SELECT id, player_id AS playerId, name, body, sent_at AS sentAt FROM table_talk WHERE room_code=? AND id=?').bind(code, payload.id).first<MessageRow>();
    if (existing) {
      if (existing.playerId !== player.id || existing.body !== body) return response({error: 'Please send this as a new message.'}, 409);
      await reply(room,existing);return response({message: existing});
    }
    const now = Date.now();
    // This atomic insert throttles concurrent sends without touching room state.
    const result = await env.DB!.prepare(`INSERT INTO table_talk (room_code,id,player_id,name,body,sent_at)
      SELECT ?,?,?,?,?,? WHERE NOT EXISTS (SELECT 1 FROM table_talk WHERE room_code=? AND player_id=? AND sent_at>?)
      ON CONFLICT(room_code,id) DO NOTHING`).bind(code,payload.id,player.id,player.name,body,now,code,player.id,now-1500).run();
    if (!result.meta.changes) {
      const duplicate = await env.DB!.prepare('SELECT id, player_id AS playerId, name, body, sent_at AS sentAt FROM table_talk WHERE room_code=? AND id=?').bind(code,payload.id).first<MessageRow>();
      if (duplicate?.playerId === player.id && duplicate.body === body){await reply(room,duplicate);return response({message:duplicate});}
      return response({error:'Give the table a moment—try again in two seconds.'},429);
    }
    const message={id:payload.id,playerId:player.id,name:player.name,body,sentAt:now};await reply(room,message);return response({message},201);
  } catch (error) {
    return response({error:(error as Error).message},403);
  }
}
