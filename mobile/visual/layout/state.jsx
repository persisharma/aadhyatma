import React from 'react';
const p=new URLSearchParams(location.search);
export const lang=p.get('lang')||'hi';export const size=p.get('size')||'M';
export const LANGUAGES=[{value:'hi',script:'devanagari',nativeLabel:'हिन्दी',a11yLabel:'Hindi'},{value:'en',script:'latin',nativeLabel:'English',a11yLabel:'English'},{value:'gu',script:'gujarati',nativeLabel:'ગુજરાતી',a11yLabel:'Gujarati'},{value:'kn',script:'kannada',nativeLabel:'ಕನ್ನಡ',a11yLabel:'Kannada'}];
export function useGitaLanguage(){return{lang,regionalLang:lang==='en'?'hi':lang,setLang:()=>{}};}
export function useFontScale(){return{scale:size,factor:size==='L'?1.15:1,isLoading:false,setScale:()=>{}};}
export function getDeityMeta(){return undefined;}
export const SKIP_SECONDS=15;
const call=(name,...args)=>{window.__layoutCalls??=[];window.__layoutCalls.push({name,args});};
export function useAudioPlayerContext(){return{currentTrack:{id:'fixture-real-aarti-title',titleHi:'ॐ जय शिव ओंकारा',titleEn:'Om Jai Shiv Omkara',kind:'recitation'},nowPlayingOpen:true,isPlaying:false,isBuffering:false,positionSec:45,durationSec:360,isLooping:false,togglePlay:(...args)=>call('togglePlay',...args),seekTo:(...args)=>call('seekTo',...args),skipBy:(...args)=>call('skipBy',...args),skipToNext:(...args)=>call('skipToNext',...args),skipToPrevious:(...args)=>call('skipToPrevious',...args),toggleLoop:(...args)=>call('toggleLoop',...args),closeNowPlaying:(...args)=>call('closeNowPlaying',...args)};}
