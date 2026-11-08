import React,{useState} from 'react';
import {View,Text,useWindowDimensions} from 'react-native';
import Svg,{Circle,Ellipse,Line,Path,Polygon,Text as SvgText} from 'react-native-svg';
import {useTheme} from '@/theme/ThemeContext';
import {useGitaLanguage} from '@/data/gita/language';
import {meaningToken,titleFontByLang} from '@/utils/langType';
import {directions} from '@/data/sanatan-parichay/knowledge';
import {Action,Copy,useSanatanText} from './Primitives';

/** An orthographic teaching schematic, not a live compass or a 3-D rendering engine. */
export default function TenDirectionsDiagram(){
 const [selected,setSelected]=useState(8),t=useSanatanText();
 const {colors,typography}=useTheme(),{lang}=useGitaLanguage(),{width}=useWindowDimensions();
 const token=meaningToken(lang,typography),stack=width<350;
 const d=directions[selected];
 return <View testID="sanatan-ten-directions" style={{gap:12}}>
  <Copy>{t(['चारों ओर 8 · ऊपर 1 · नीचे 1 = 10','8 around · 1 above · 1 below = 10'])}</Copy>
  <View style={{backgroundColor:colors.parchmentSoft,borderRadius:18,paddingVertical:10}}>
   <View style={{alignItems:'center',paddingHorizontal:12}}><Text style={{...token,fontFamily:titleFontByLang(lang),color:colors.saffronDeep,textAlign:'center'}}>{t(['9 · ऊर्ध्व — ब्रह्मा','9 · Above — Brahma'])}</Text></View>
   <Svg width="100%" height={260} viewBox="0 0 320 260" accessible={false}>
    <Ellipse cx={160} cy={132} rx={123} ry={44} fill={colors.goldTint} stroke={colors.gold} strokeWidth={1}/>
    <Path d="M37 132Q160 195 283 132" fill="none" stroke={colors.gold} strokeDasharray="3 5"/>
    {directions.slice(0,8).map((_,i)=>{
     // Offset the projected plane so no horizontal direction sits behind the vertical axis.
     const a=(i*45-67.5)*Math.PI/180,x=160+115*Math.cos(a),y=132+40*Math.sin(a);
     return <React.Fragment key={i}><Line x1={160} y1={132} x2={x} y2={y} stroke={selected===i?colors.saffronDeep:colors.gold} strokeWidth={selected===i?3:1.5}/>
      <Circle cx={x} cy={y} r={12} fill={selected===i?colors.saffronDeep:colors.parchmentSoft} stroke={colors.gold}/>
      <SvgText x={x} y={y+5} textAnchor="middle" fontSize={15} fill={selected===i?colors.brandIvory:colors.ink}>{i+1}</SvgText>
     </React.Fragment>;
    })}
    <Line x1={160} y1={132} x2={160} y2={24} stroke={colors.saffronDeep} strokeWidth={3}/>
    <Line x1={160} y1={144} x2={160} y2={232} stroke={colors.saffronDeep} strokeWidth={3} strokeDasharray="5 4"/>
    <Polygon points="160,14 153,29 167,29" fill={colors.saffronDeep}/><Polygon points="160,242 153,227 167,227" fill={colors.saffronDeep}/>
    <Circle cx={160} cy={132} r={7} fill={colors.saffronDeep}/>
   </Svg>
   <View style={{alignItems:'center',paddingHorizontal:12}}><Text style={{...token,fontFamily:titleFontByLang(lang),color:colors.saffronDeep,textAlign:'center'}}>{t(['10 · अधो — विष्णु','10 · Below — Vishnu'])}</Text></View>
  </View>
  <Copy>{t(['तिरछा धरातल आठ दिशाएँ दिखाता है। खड़ा अक्ष ऊपर और नीचे को अलग करता है। अंकों को नीचे दिए नामों से मिलाएँ। यह स्थिर योजना है, चल रहा कम्पास नहीं।','The tilted plane contains eight directions. The vertical axis distinguishes above and below. Match the numbers to the names below. This is a static schematic, not a live compass.'])}</Copy>
  <View testID="sanatan-directions-legend" style={{flexDirection:'row',flexWrap:'wrap',gap:8}}>
   {directions.map((item,i)=><View key={item[1]} style={{flexBasis:stack?'100%':'47%',flexGrow:1,minWidth:0}}>
    <Action testID={`sanatan-direction-${i}`} label={`${i+1} · ${t([item[0],item[1]])}\n${t([item[2],item[3]])}`} selected={selected===i} onPress={()=>setSelected(i)}/>
   </View>)}
  </View>
  <View style={{padding:14,backgroundColor:colors.saffronTint,borderRadius:14}}><Copy heading>{t([d[0]+' · '+d[2],d[1]+' · '+d[3]])}</Copy>
   <Copy>{t(selected===8?['धरातल से ऊपर की दिशा। इस कामिक आगम-आधारित चयन में ब्रह्मा इसके पालक हैं।','Above the plane. Brahma is its guardian in this Kamika Agama selection.']:selected===9?['धरातल से नीचे की दिशा। यहाँ विष्णु हैं; अन्य नामावलियों में अनन्त का चयन भी मिलता है।','Below the plane. This selection uses Vishnu; another documented roster uses Ananta.']:['यह धरातल की आठ दिशाओं में से एक है। दक्षिण और अधो अलग दिशाएँ हैं।','One of the eight horizontal directions. South and below are different directions.'])}</Copy>
  </View>
 </View>;
}
