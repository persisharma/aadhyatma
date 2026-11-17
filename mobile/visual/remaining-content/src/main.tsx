import React from 'react';
import {createRoot} from 'react-dom/client';
import {ThemeProvider} from '@/theme/ThemeContext';
import StutiReaderScreen from '@/screens/StutiReaderScreen';
import SuktamReaderScreen from '@/screens/SuktamReaderScreen';
import AshtakamReaderScreen from '@/screens/AshtakamReaderScreen';
import {PreviewLanguage} from './platform';
const p=new URLSearchParams(location.search);
const navigation={goBack:()=>{location.hash='back';},navigate:()=>{}};
const kind=p.get('kind')||'stuti';
const id=p.get('id')||({stuti:'kanakadhara-stotram',suktam:'shri-suktam',ashtakam:'kalabhairav-ashtakam'}[kind]);
const Reader={stuti:StutiReaderScreen,suktam:SuktamReaderScreen,ashtakam:AshtakamReaderScreen}[kind];
const route={key:'content-preview',params:{[kind+'Id']:id,initialIndex:Number(p.get('page')||0)}};
createRoot(document.getElementById('root')!).render(<PreviewLanguage><ThemeProvider>
<div style={{font:'11px sans-serif',padding:7,textAlign:'center',background:'#fff3d7'}}>ACTUAL READER CODE · WEB ADAPTER · NOT NATIVE QA</div>
<Reader navigation={navigation} route={route}/>
</ThemeProvider></PreviewLanguage>);
