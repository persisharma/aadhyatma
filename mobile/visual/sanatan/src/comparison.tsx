/** Actual production teaching components. Preview does not execute native IO. */
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {StyleSheet,View} from 'react-native';
import {ThemeProvider} from '@/theme/ThemeContext';
import {PreviewLanguage} from './platform';
import {Copy,Painting,useSanatanText} from '@/components/sanatan/Primitives';
import ExploreDiagram from '@/components/sanatan/ExploreDiagram';
import BeforeExploreDiagram from './BeforeExploreDiagram';
import {LessonAnswer,LessonTerms,LessonTakeaway,LessonRelated,ReadingBlocks} from '@/components/sanatan/LessonPanels';
import SwastikaGuide from '@/components/sanatan/SwastikaGuide';
import ProseReadingCard from '@/components/ProseReadingCard';
import {getSanatanTopic,getSanatanPageTitles} from '@/data/sanatan-parichay';
function Comparison(){
 const p=new URLSearchParams(location.search),topic=getSanatanTopic(p.get('topic')||'dikpal')!;
 const before=p.get('before')==='1',page=Number(p.get('page')||1),t=useSanatanText();
 return <View style={{padding:20,gap:16}}>
  <Copy heading>{t(topic.title)}</Copy>
  <Copy>{`${page+1}/${topic.pages.length}`}</Copy>
  {page===0&&<Painting id={topic.id}/>}
  <ProseReadingCard heading={<Copy heading>{t(getSanatanPageTitles(topic)[page])}</Copy>}>
   {!before&&page===0&&<LessonAnswer id={topic.id}/>}
   {!before&&page===1&&<ExploreDiagram topic={topic} onCollection={()=>{}} onRelated={()=>{}}/>}
   {topic.id==='symbols'&&page===2&&<SwastikaGuide mode="drawing"/>}
   {before?t(topic.pages[page]).split(/\n\s*\n/).map((paragraph,i)=><Copy key={i}>{paragraph}</Copy>):<ReadingBlocks body={topic.pages[page]}/>}
   {before&&page===1&&<BeforeExploreDiagram topic={topic} onCollection={()=>{}}/>}
   {!before&&page===0&&<LessonTerms id={topic.id}/>}
   {!before&&page===2&&<><LessonTakeaway id={topic.id}/><LessonRelated id={topic.id} onOpen={()=>{}}/></>}
  </ProseReadingCard>
 </View>;
}
const html=renderToStaticMarkup(<PreviewLanguage><ThemeProvider><Comparison/></ThemeProvider></PreviewLanguage>);
console.log(JSON.stringify({html,css:(StyleSheet as any).getSheet().textContent}));
