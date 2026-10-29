export type Persona = 'fool'|'magician'|'priestess'|'empress';
export const PERSONAS:Record<Persona,{name:string;frequency:number}>={
  fool:{name:'The Fool',frequency:1},magician:{name:'The Magician',frequency:1},
  priestess:{name:'The High Priestess',frequency:.55},empress:{name:'The Empress',frequency:.9}
};
export const CHANCES={game_start:.65,player_join:.45,check:.2,call:.2,raise:.3,big_raise:.5,fold:.2,opponent_fold:.2,fool_event:.9,showdown:.8,bot_win:.9,bot_loss:.8,player_win_streak:.65,rematch:.65} as const;
export type Trigger=keyof typeof CHANCES;
