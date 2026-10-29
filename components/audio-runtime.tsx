'use client';
import {useEffect} from 'react';
import {audioManager,gameAudio} from '../lib/audio';
export default function AudioRuntime(){useEffect(()=>{
  void audioManager.init();
  const activate=(event:Event)=>{
    if(!event.isTrusted)return;
    // A touch pointerdown is not a user-activation event on iPhone/WebKit.
    // Retry on the completed tap/click while activation is still synchronous.
    if(event.type==='pointerdown'&&'pointerType' in event&&(event as PointerEvent).pointerType!=='mouse')return;
    void audioManager.unlock();
  };
  const gestures=['pointerdown','pointerup','touchend','click','keydown'];
  const visibility=()=>{gameAudio.resync();audioManager.handleVisibility()};
  gestures.forEach(type=>document.addEventListener(type,activate,true));document.addEventListener('visibilitychange',visibility);
  const pagehide=()=>{gameAudio.resync();audioManager.pause()};window.addEventListener('pagehide',pagehide);window.addEventListener('pageshow',visibility);
  return()=>{gestures.forEach(type=>document.removeEventListener(type,activate,true));document.removeEventListener('visibilitychange',visibility);window.removeEventListener('pagehide',pagehide);window.removeEventListener('pageshow',visibility)};
},[]);return null}
