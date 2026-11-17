import React from 'react';
import {createRoot} from 'react-dom/client';
import {View, ScrollView} from 'react-native';
import {ThemeProvider} from '@/theme/ThemeContext';
import StutiReaderScreen from '@/screens/StutiReaderScreen';
import SuktamReaderScreen from '@/screens/SuktamReaderScreen';
import AshtakamReaderScreen from '@/screens/AshtakamReaderScreen';
import KavachamReaderScreen from '@/screens/KavachamReaderScreen';
import VishnuSahasranamaReaderScreen from '@/screens/VishnuSahasranamaReaderScreen';
import SaptashatiCoreScreen from '@/screens/SaptashatiCoreScreen';
import KathaLibraryScreen from '@/screens/KathaLibraryScreen';
import ReadingLinks from '@/components/ReadingLinks';
import DeityDayLinks from '@/components/DeityDayLinks';
import {navigateReadingLink} from '@/navigation/entryRoutes';
import {PreviewLanguage, previewNavigation} from './platform';
const p=new URLSearchParams(location.search);
const kind=p.get('kind')||'stuti';
const id=p.get('id')||({stuti:'kanakadhara-stotram',suktam:'shri-suktam',ashtakam:'kalabhairav-ashtakam',kavacham:'durga-devi-kavacham'}[kind]);
const Reader={stuti:StutiReaderScreen,suktam:SuktamReaderScreen,ashtakam:AshtakamReaderScreen,kavacham:KavachamReaderScreen,vishnu:VishnuSahasranamaReaderScreen,saptashati:SaptashatiCoreScreen,katha:KathaLibraryScreen}[kind];
const route={key:'content-preview',params:{[kind+'Id']:id,chapter:Number(p.get('chapter')||3),initialIndex:Number(p.get('page')||0)}};
createRoot(document.getElementById('root')!).render(<PreviewLanguage><ThemeProvider>
<div style={{font:'11px sans-serif',padding:7,flexShrink:0,textAlign:'center',background:'#fff3d7'}}>PRODUCTION COMPONENTS · WEB ADAPTER · NOT NATIVE QA</div>
{Reader ? <Reader navigation={previewNavigation} route={route}/> : <ScrollView><View style={{padding:20,gap:16}}>{kind==='weekday'?<DeityDayLinks/>:<ReadingLinks onOpen={id=>navigateReadingLink(previewNavigation,id)}/>}</View></ScrollView>}
</ThemeProvider></PreviewLanguage>);
