import React, { createContext, useContext, useState } from 'react';
import { artworkRequest } from '@/data/artworkAsset';
import { Image, View } from 'react-native';
const params = new URLSearchParams(location.search);
const initial = params.get('lang') || 'hi';
const Context = createContext<any>({ lang: initial, regionalLang: initial === 'en' ? 'hi' : initial });
export const LANGUAGES = [
 { value:'hi',script:'devanagari',nativeLabel:'हिन्दी',shortLabel:'हिं',a11yLabel:'Hindi' },
 { value:'en',script:'latin',nativeLabel:'English',shortLabel:'En',a11yLabel:'English' },
 { value:'gu',script:'gujarati',nativeLabel:'ગુજરાતી',shortLabel:'ગુ',a11yLabel:'Gujarati' },
 { value:'kn',script:'kannada',nativeLabel:'ಕನ್ನಡ',shortLabel:'ಕನ',a11yLabel:'Kannada' },
];
export function PreviewLanguage({children}:{children:React.ReactNode}) {
 const [lang,setLang] = useState(initial);
 return <Context.Provider value={{lang,setLang,regionalLang:initial==='en'?'hi':initial}}>{children}</Context.Provider>;
}
export const useGitaLanguage = () => useContext(Context);
export const useFontScale = () => ({ scale:params.get('size') || 'M', factor:params.get('size')==='L'?1.15:1,isLoading:false });
export const useSafeAreaInsets = () => ({top:0,bottom:0,left:0,right:0});
export const SafeAreaView = ({children,edges,...props}:any) => <View {...props}>{children}</View>;
export const storage = { getItem:async(key:string)=>localStorage.getItem(key),setItem:async(key:string,value:string)=>localStorage.setItem(key,value),removeItem:async(key:string)=>localStorage.removeItem(key) };
// Browser layout only; the real native cache/placeholder is exercised by Jest/device QA.
export const useCachedAsset = (request:any) => params.get('cdn') === '1' ? request?.remoteUrl ?? null : null;
export default storage;
export const ImpactFeedbackStyle={Light:'Light'};
export const impactAsync=async()=>{};
export const trigger=()=>{};
export const notificationAsync=async()=>{};
export const useShare=()=>({busy:false,share:async()=>{window.alert('Native sharing requires device verification.');}});
function PreviewPageCell({children,style,onLayout,onFocusCapture}:any) {
 return <View onLayout={onLayout} onFocusCapture={onFocusCapture} style={[style,{height:'100%',minHeight:0}]}>{children}</View>;
}
export function useReaderPlayback() { return {
 readAloud:{visible:true,unavailable:false,isSpeaking:false,toggle:()=>{},stop:()=>{}},
 autoSlide:{visible:true,playing:false,speed:'normal',countdownMs:null,countdownKey:0,toggle:()=>{},stop:()=>{},cycleSpeed:()=>{},Cell:PreviewPageCell},
}; }
export function LinearGradient({colors,style,children,...props}:any) {
 return <View {...props} style={[style,{backgroundImage:'linear-gradient(135deg, '+colors.join(', ')+')'}]}>{children}</View>;
}
export function CachedArtwork({source,style,imageStyle,resizeMode='cover',fallback}:any) {
 const url = artworkRequest(source)?.remoteUrl;
 if(url) source={uri:url};
 return source?.uri ? <Image source={source} style={[style,imageStyle]} resizeMode={resizeMode}/> : <View style={style}>{fallback}</View>;
}

// Only native services are adapted; AartiReaderScreen and its visual children are production imports.
export const useAudioPlayerContext=()=>({playTrack:()=>{},openNowPlaying:()=>{}});
export const useReadingProgress=()=>({setProgress:()=>{},getProgress:()=>null});
export const useReadDwell=()=>{};
export const useRoutineSheet=()=>({openAddToRoutine:()=>alert('Routine persistence needs native verification.')});
export const useBookmarks=()=>({bookmarks:[],addBookmark:()=>{},removeBookmark:()=>{},isBookmarked:()=>false});
export const WebView=()=>null;

export const useNewContent=()=>({isNew:()=>false});
export const useReadCoverage=()=>({getSourceCoverage:()=>null});
export const useProgressReset=()=>({ask:()=>{},sheet:null});
export const useTodayKey=()=>params.get('date')||'2026-11-16';
export const previewNavigation={
 goBack:()=>history.back(), replace:(name:string,args:any)=>previewNavigation.navigate(name,args),
 getState:()=>({routeNames:['VratKathaReader']}),
 navigate:(name:string,args:any={})=>{
  const kinds:any={StutiReader:'stuti',SuktamReader:'suktam',AshtakamReader:'ashtakam',KavachamReader:'kavacham',VishnuSahasranamaReader:'vishnu',SaptashatiCore:'saptashati',KathaLibrary:'katha'};
  const kind=kinds[name];
  (window as any).__lastNavigation={name,args};
  if(!kind)return;
  const next=new URLSearchParams(location.search);next.set('kind',kind);next.set('page',String(args.initialIndex||0));
  for(const [key,value] of Object.entries(args))if(key.endsWith('Id'))next.set('id',String(value));
  if(args.chapter)next.set('chapter',String(args.chapter));
  location.search=next.toString();
 }
};
export const useNavigation=()=>previewNavigation;
