import { sqliteTable, text, integer, primaryKey, index } from 'drizzle-orm/sqlite-core';
export const rooms = sqliteTable('rooms', { code: text('code').primaryKey(), state: text('state').notNull(), revision: integer('revision').notNull().default(0), updated: integer('updated').notNull() });

export const tableTalk = sqliteTable('table_talk', {
  roomCode: text('room_code').notNull().references(() => rooms.code, { onDelete: 'cascade' }),
  id: text('id').notNull(),
  playerId: text('player_id').notNull(),
  name: text('name').notNull(),
  body: text('body').notNull(),
  sentAt: integer('sent_at').notNull(),
}, (t) => [primaryKey({ columns: [t.roomCode, t.id] }), index('table_talk_recent').on(t.roomCode, t.sentAt)]);
