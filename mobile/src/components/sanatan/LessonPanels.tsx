import React from 'react';
import {View,Text} from 'react-native';
import {useTheme} from '@/theme/ThemeContext';
import {useGitaLanguage} from '@/data/gita/language';
import {meaningToken,titleFontByLang} from '@/utils/langType';
import {experiences,type RelatedLesson} from '@/data/sanatan-parichay/experience';
import type {Pair} from '@/data/sanatan-parichay';
import {Action,Copy,useSanatanText} from './Primitives';

export function LearningNote({title,body}: {title:Pair;body:Pair}){
 const t=useSanatanText(),{colors}=useTheme();
 return <View style={{backgroundColor:colors.parchmentSoft,borderLeftWidth:3,borderLeftColor:colors.saffronDeep,paddingHorizontal:16,paddingVertical:8,borderRadius:12}}>
  <Copy heading>{t(title)}</Copy><Copy>{t(body)}</Copy>
 </View>;
}
export function LessonAnswer({id}:{id:string}){return <LearningNote title={['सरल उत्तर','The simple answer']} body={experiences[id].answer}/>;}
export function LessonTakeaway({id}:{id:string}){return <LearningNote title={['याद रखने की बात','One thing to remember']} body={experiences[id].takeaway}/>;}
export function LessonTerms({id}:{id:string}){
 const t=useSanatanText(),{colors,typography}=useTheme(),{lang}=useGitaLanguage();
 return <View testID={`sanatan-terms-${id}`} style={{gap:4,marginTop:16}}><Copy heading>{t(['शब्दों को समझें','Understand the terms'])}</Copy>
  {experiences[id].terms.map(term=><View key={term.name[1]} style={{paddingVertical:10,borderBottomWidth:1,borderBottomColor:colors.divider}}>
   <Text style={{...meaningToken(lang,typography),fontFamily:titleFontByLang(lang),color:colors.saffronDeep}}>{t(term.name)}</Text><Copy>{t(term.meaning)}</Copy>
  </View>)}
 </View>;
}
export function LessonRelated({id,onOpen}:{id:string;onOpen:(link:RelatedLesson)=>void}){
 const t=useSanatanText();
 return <View style={{gap:10}}><Copy heading>{t(['आगे जानें','Continue exploring'])}</Copy>
  {experiences[id].related.map(link=><Action key={link.label[1]} label={t(link.label)} onPress={()=>onOpen(link)}/>)}
 </View>;
}
/** Authored paragraph boundaries remain complete; steps and definitions get native hierarchy. */
export function ReadingBlocks({body}:{body:Pair}){
 const t=useSanatanText(),{colors}=useTheme();
 const hi=body[0].split(/\n\s*\n/),en=body[1].split(/\n\s*\n/);
 return <>{hi.map((paragraph,i)=>{
  const pair:Pair=[paragraph,en[i]??''];
  const step=paragraph.match(/^(\d+)\.\s+/);
  if(step)return <View key={i} style={{flexDirection:'row',gap:12,alignItems:'flex-start',paddingVertical:6}}>
   <View style={{minWidth:34,minHeight:34,borderRadius:17,alignItems:'center',justifyContent:'center',backgroundColor:colors.saffronTint,marginTop:8}}><Copy>{step[1]}</Copy></View>
   <View style={{flex:1,minWidth:0}}><Copy>{t([pair[0].replace(/^\d+\.\s+/,''),pair[1].replace(/^\d+\.\s+/,'')])}</Copy></View>
  </View>;
  const h=paragraph.match(/^([^:]{1,35}):\s*(.*)$/s),e=pair[1].match(/^([^:]{1,55}):\s*(.*)$/s);
  if(h&&e)return <View key={i} style={{paddingVertical:6}}><Copy heading>{t([h[1],e[1]])}</Copy><Copy>{t([h[2],e[2]])}</Copy></View>;
  return <Copy key={i}>{t(pair)}</Copy>;
 })}</>;
}
