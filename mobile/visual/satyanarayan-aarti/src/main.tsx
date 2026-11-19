import React from 'react';
import {createRoot} from 'react-dom/client';
import {ThemeProvider} from '@/theme/ThemeContext';
import AartiReaderScreen from '@/screens/AartiReaderScreen';
import {PreviewLanguage} from './platform';
const params=new URLSearchParams(location.search);
const navigation={goBack:()=>{location.hash='back';},navigate:()=>{}};
const route={key:'b1-preview',name:'AartiReader',params:{aartiIndex:22,initialIndex:Number(params.get('page')||0)}};
createRoot(document.getElementById('root')!).render(<PreviewLanguage><ThemeProvider>
<div style={{font:'11px sans-serif',padding:'7px',textAlign:'center',background:'#fff3d7'}}>ACTUAL READER CODE · WEB ADAPTER · NOT NATIVE QA</div>
<AartiReaderScreen navigation={navigation} route={route}/>
</ThemeProvider></PreviewLanguage>);
