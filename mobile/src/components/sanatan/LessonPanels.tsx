import React from 'react';
import {View,Text,useWindowDimensions} from 'react-native';
import {useTheme} from '@/theme/ThemeContext';
import {useGitaLanguage} from '@/data/gita/language';
import {isLatinLang,titleFontByLang} from '@/utils/langType';
import {ListingSectionHeader} from '@/components/ListingCard';
import {experiences,type RelatedLesson} from '@/data/sanatan-parichay/experience';
import {getSanatanLegend} from '@/data/sanatan-parichay/knowledge';
import type {Pair} from '@/data/sanatan-parichay';
import {Copy,LinkRow,TermHead,useSanatanText} from './Primitives';

/** A quiet callout: a small ruled label over a soft card. `lead` is the question the body answers. */
export function LearningNote({title,lead,body}: {title:Pair;lead?:Pair;body:Pair}){
 const t=useSanatanText(),{colors,radii,typography}=useTheme(),{lang}=useGitaLanguage();
 const latin=isLatinLang(lang);
 const rule={flex:1,height:1,backgroundColor:colors.gold,opacity:0.6};
 return <View style={{gap:8,marginTop:16}}>
  <View style={{flexDirection:'row',alignItems:'center',gap:10}}>
   <View style={rule}/>
   <Text accessibilityRole="header" style={{...typography.listingEyebrow,fontFamily:titleFontByLang(lang),color:colors.saffronDeep}}>{t(title)}</Text>
   <View style={rule}/>
  </View>
  <View style={{backgroundColor:colors.parchmentSoft,borderWidth:1,borderColor:colors.divider,borderRadius:radii.md,paddingHorizontal:16,paddingVertical:4}}>
   {lead&&<Text style={{...(latin?typography.listingTitleLatin:typography.listingTitle),fontFamily:titleFontByLang(lang),fontStyle:latin?'italic':'normal',color:colors.ink,marginTop:8}}>{t(lead)}</Text>}
   <Copy>{t(body)}</Copy>
  </View>
 </View>;
}
export function LessonAnswer({id,question}:{id:string;question:Pair}){return <LearningNote title={['सरल उत्तर','The simple answer']} lead={question} body={experiences[id].answer}/>;}
export function LessonTakeaway({id}:{id:string}){return <LearningNote title={['याद रखने की बात','One thing to remember']} body={experiences[id].takeaway}/>;}
export function LessonTerms({id}:{id:string}){
 const t=useSanatanText(),{colors}=useTheme();
 return <View testID={`sanatan-terms-${id}`} style={{gap:4,marginTop:16}}><ListingSectionHeader>{t(['शब्दों को समझें','Understand the terms'])}</ListingSectionHeader>
  {experiences[id].terms.map(term=><View key={term.name[1]} style={{paddingVertical:10,borderBottomWidth:1,borderBottomColor:colors.divider}}>
   <TermHead>{t(term.name)}</TermHead><Copy>{t(term.meaning)}</Copy>
  </View>)}
 </View>;
}
export function LessonRelated({id,onOpen}:{id:string;onOpen:(link:RelatedLesson)=>void}){
 const t=useSanatanText();
 return <View style={{gap:10}}><ListingSectionHeader>{t(['आगे जानें','Continue exploring'])}</ListingSectionHeader>
  {experiences[id].related.map(link=><LinkRow key={link.label[1]} label={t(link.label)} onPress={()=>onOpen(link)}/>)}
 </View>;
}
/**
 * The names painted on the teaching plate, as real text under it: they follow
 * Reading Size and reach screen readers, which baked labels cannot.
 */
export function LessonLegend({id}:{id:string}){
 const t=useSanatanText(),{colors,typography}=useTheme(),{lang}=useGitaLanguage();
 const {width,fontScale}=useWindowDimensions();
 const sections=getSanatanLegend(id);
 if(!sections.length)return null;
 const latin=isLatinLang(lang);
 const columns=width<360||fontScale>1.3?1:2;
 const row={...(latin?typography.listingTitleLatin:typography.listingTitle),fontFamily:titleFontByLang(lang),color:colors.ink};
 return <View testID={`sanatan-legend-${id}`} style={{gap:12}}>
  {sections.map((section,index)=><View key={index} style={{gap:4}}>
   {section.heading&&<ListingSectionHeader>{t(section.heading)}</ListingSectionHeader>}
   {section.layout==='list'
    ?section.rows.map(item=><View key={item.name[1]} style={{paddingVertical:10,borderBottomWidth:1,borderBottomColor:colors.divider}}>
      <TermHead>{t(item.name)}</TermHead>{item.detail&&<Copy>{t(item.detail)}</Copy>}
     </View>)
    :<View style={{flexDirection:'row',flexWrap:'wrap',justifyContent:'space-between',borderTopWidth:1,borderTopColor:colors.divider}}>
      {section.rows.map(item=><View key={item.name[1]} style={{width:columns===1?'100%':'47.5%',paddingVertical:6,borderBottomWidth:1,borderBottomColor:colors.divider}}>
       <Text style={row}><Text style={{color:colors.saffronDeep}}>{t(item.name)}</Text>{item.detail?` · ${t(item.detail)}`:''}</Text>
      </View>)}
     </View>}
  </View>)}
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
  if(h&&e)return <View key={i} style={{paddingTop:10}}><TermHead>{t([h[1],e[1]])}</TermHead><Copy>{t([h[2],e[2]])}</Copy></View>;
  return <Copy key={i}>{t(pair)}</Copy>;
 })}</>;
}
