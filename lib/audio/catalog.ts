export const SFX = {
  cardDeal: {files:['card-deal-01.mp3','card-deal-02.mp3','card-deal-03.mp3','card-deal-04.mp3'],gain:.75,pitch:.025,cooldown:150,maxDuration:.5},
  cardReveal: {files:['card-reveal.mp3'],gain:.7,pitch:.012,cooldown:200,maxDuration:.6},
  omen: {files:['omen-reveal.mp3'],gain:.6,pitch:0,cooldown:1000,maxDuration:.95},
  uiSelect: {files:['ui-select.mp3'],gain:.5,pitch:.018,cooldown:100,maxDuration:.2},
  fold: {files:['fold.mp3'],gain:.55,pitch:.015,cooldown:220,maxDuration:.5},
  fool: {files:['fool.mp3'],gain:.8,pitch:0,cooldown:650,maxDuration:1},
  win: {files:['win.mp3'],gain:.65,pitch:0,cooldown:700,maxDuration:1.5},
  loss: {files:['loss.mp3'],gain:.45,pitch:0,cooldown:700,maxDuration:1.1},
  join: {files:['notify.mp3'],gain:.38,pitch:.01,cooldown:400,maxDuration:.35},
  chat: {files:['notify.mp3'],gain:.25,pitch:.01,cooldown:1000,maxDuration:.35},
} as const;
export type SfxName=keyof typeof SFX;
export const MUSIC='/audio/music/table-ambience.mp3';
export const ALL_FILES=[...new Set(Object.values(SFX).flatMap(s=>s.files.map(file=>`/audio/sfx/${file}`))),MUSIC];
export type AudioSettings={muted:boolean;musicEnabled:boolean;musicVolume:number;sfxVolume:number};
export const DEFAULT_SETTINGS:AudioSettings={muted:false,musicEnabled:false,musicVolume:.18,sfxVolume:.65};
export function normalizeSettings(input:unknown):AudioSettings {
  const v=input&&typeof input==='object'?input as Partial<AudioSettings>:{};
  const volume=(x:unknown,fallback:number)=>typeof x==='number'&&Number.isFinite(x)?Math.max(0,Math.min(1,x)):fallback;
  return {muted:typeof v.muted==='boolean'?v.muted:false,musicEnabled:typeof v.musicEnabled==='boolean'?v.musicEnabled:false,musicVolume:volume(v.musicVolume,.18),sfxVolume:volume(v.sfxVolume,.65)};
}
