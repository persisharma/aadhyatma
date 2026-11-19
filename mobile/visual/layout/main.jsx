import React,{useEffect,useState}from'react';import{createRoot}from'react-dom/client';import{View,Text}from'react-native';
import{ThemeProvider,useTheme}from'@/theme/ThemeContext';
import ReaderHeader from'@/components/ReaderHeader';import TextField from'@/components/TextField';import NowPlayingScreen from'@/screens/audio/NowPlayingScreen';
import ReadingSizePickerSheet from'@/components/ReadingSizePickerSheet';import LanguagePickerSheet from'@/components/LanguagePickerSheet';import ProgressResetDialog from'@/components/ProgressResetDialog';
import{contentByLang}from'@/utils/localize';import{lang}from'./state';import CityPicker from'./city.generated';
const p=new URLSearchParams(location.search),view=p.get('view')||'header';
function Test(){const[closed,setClosed]=useState(false);const{colors}=useTheme();const title=contentByLang(lang,'ॐ जय शिव ओंकारा','Om Jai Shiv Omkara');useEffect(()=>{window.__layoutHarness='screen-clipping-fix';window.__fullTitle=title;document.documentElement.dataset.ready='true';},[]);
if(view==='audio')return <NowPlayingScreen/>;
if(view==='city')return closed?<Text>City picker closed</Text>:<CityPicker visible selectedCityId="delhi" lang={lang} onSelect={city=>{window.__selectedCity=city.id;setClosed(true);}} onClose={()=>setClosed(true)}/>;
if(view==='size')return <ReadingSizePickerSheet visible onClose={()=>{}}/>;
if(view==='language')return <LanguagePickerSheet visible onClose={()=>{}}/>;
if(view==='reset')return <ProgressResetDialog visible targetLabel={title} readCount={100} onConfirm={()=>{}} onCancel={()=>{}}/>;
return <View style={{flex:1,backgroundColor:colors.parchment}}><ReaderHeader sideWidth={Number(p.get('side'))||undefined} title={title} onBack={()=>{}} right={<Text style={{fontSize:14,fontFamily:'CormorantGaramond_400Regular_Italic',color:colors.inkMuted}}>1 / 12</Text>}/><View style={{padding:24,gap:12}}><Text style={{fontFamily:'Inter_500Medium',fontSize:11,color:colors.inkMuted}}>PRODUCTION HEADER · ISOLATED BROWSER TEST</Text><Text style={{fontFamily:'Inter_500Medium',fontSize:13}}>Complete source title:</Text><Text testID="source-title" style={{fontFamily:lang==='en'?'CormorantGaramond_400Regular_Italic':lang==='hi'?'NotoSerifDevanagari_600SemiBold':lang==='gu'?'NotoSerifGujarati_600SemiBold':'NotoSerifKannada_600SemiBold',fontSize:22,color:colors.ink}}>{title}</Text><Text style={{fontSize:12,lineHeight:18,color:colors.inkMuted}}>The bar above uses the unchanged ReaderHeader and its default right-slot sizing. This text below is a test reference, not an app screen.</Text></View></View>;
}
createRoot(document.getElementById('root')).render(<ThemeProvider><Test/></ThemeProvider>);
