import React,{useState} from 'react';
import {Text,View} from 'react-native';
import Svg,{Circle,Line,Path,Rect} from 'react-native-svg';
import {useTheme} from '@/theme/ThemeContext';
import type {Pair} from '@/data/sanatan-parichay';
import {elementNames} from '@/data/sanatan-parichay/knowledge';
import {Action,Copy,useSanatanText} from './Primitives';

export function TempleSpaces(){
 const t=useSanatanText(),{colors}=useTheme();
 const spaces:readonly Pair[]=[['प्रवेश','Entrance'],['मण्डप · सभा का स्थान','Mandapa · Gathering hall'],['अन्तराल · जोड़ने वाला भाग','Antarala · Connecting space'],['गर्भगृह · मुख्य देव-प्रतिमा','Sanctum · Principal sacred image']];
 return <View style={{gap:10}}><Copy>{t(['बाहर से भीतरी केन्द्र तक','From outside toward the inner centre'])}</Copy>
  {spaces.map((p,i)=><View key={p[1]} style={{marginHorizontal:i*9,padding:14,borderWidth:i===3?2:1,borderColor:colors.gold,borderRadius:12,backgroundColor:i===3?colors.saffronTint:colors.parchmentSoft}}><Copy heading>{`${i+1}. ${t(p)}`}</Copy></View>)}
  <Copy>{t(['यह स्थान समझाने की सरल योजना है। वास्तविक मंदिर की योजना और प्रवेश-व्यवस्था अलग हो सकती है।','This is a simplified spatial plan. A temple’s actual plan and visitor access may differ.'])}</Copy>
  <View style={{gap:8,marginTop:10}}>
   <Copy heading>{t(['ऊँचा भाग कहाँ है?','Where does the tower stand?'])}</Copy>
   <View style={{flexDirection:'row',gap:12}}>
    <View style={{flex:1}}><Svg accessible={false} width="100%" height={130} viewBox="0 0 130 130"><Path d="M25 108H105V85H95L85 40L65 10L45 40L35 85H25Z" fill={colors.goldTint} stroke={colors.gold} strokeWidth={2}/><Rect x={50} y={87} width={30} height={21} fill={colors.saffronTint}/></Svg><Copy>{t(['शिखर / विमान\nगर्भगृह के ऊपर','Shikhara / Vimana\nAbove the sanctum'])}</Copy></View>
    <View style={{flex:1}}><Svg accessible={false} width="100%" height={130} viewBox="0 0 130 130"><Path d="M15 108V85H23V65H31V45H39V25H91V45H99V65H107V85H115V108Z" fill={colors.goldTint} stroke={colors.gold} strokeWidth={2}/><Path d="M49 108V86Q65 66 81 86V108" fill={colors.parchmentSoft} stroke={colors.gold} strokeWidth={2}/></Svg><Copy>{t(['गोपुर\nप्रवेश-द्वार का टॉवर','Gopura\nEntrance gateway tower'])}</Copy></View>
   </View>
  </View>
 </View>;
}
const examples:readonly Pair[]=[['दीपक जिस स्थान में है—आकाश को समझने की उपमा।','The space the lamp occupies helps illustrate Akasha.'],['लौ के आसपास की हवा—वायु।','Air around the flame illustrates Vayu.'],['जलती लौ की ऊष्मा—अग्नि।','The flame’s heat illustrates Agni.'],['मिट्टी का पात्र बनाने में काम आया जल।','Water used to shape the clay vessel.'],['दीपक का मिट्टी का पात्र—पृथ्वी।','The lamp’s clay body illustrates Prithivi.']];
export function ElementLamp(){const[selected,setSelected]=useState(0),t=useSanatanText(),{colors}=useTheme();
 return <View style={{gap:12}}>
  <Svg width="100%" height={185} viewBox="0 0 320 185" accessible={false}>
   <Circle cx={160} cy={95} r={78} fill={colors.goldTint}/><Path d="M74 112Q160 177 247 112Q160 140 74 112" fill={colors.saffronTint} stroke={colors.gold} strokeWidth={3}/>
   <Path d="M210 112Q178 74 207 38Q236 70 210 112" fill={colors.gold} stroke={colors.saffronDeep} strokeWidth={2}/><Path d="M210 110Q199 85 211 70Q222 93 210 110" fill={colors.brandIvory}/>
   <Path d="M54 70Q85 55 112 70M42 84Q76 69 100 84" fill="none" stroke={colors.gold} strokeWidth={2}/>
  </Svg>
  <Copy>{t(['एक दीपक से पाँच नाम समझें। यह सीखने की उपमा है।','Explore five terms through one lamp. This is a learning analogy.'])}</Copy>
  <View style={{flexDirection:'row',flexWrap:'wrap',gap:8}}>{elementNames.map((n,i)=><Action key={n[1]} label={t(n)} selected={i===selected} onPress={()=>setSelected(i)}/>)}</View>
  <Copy heading>{t(elementNames[selected])}</Copy><Copy>{t(examples[selected])}</Copy>
 </View>;
}
export function TithiExample(){const t=useSanatanText(),{colors}=useTheme();return <View style={{gap:12}}>
 <Copy heading>{t(['तिथि का अन्तर समझें','Understand the angular interval'])}</Copy>
 <View style={{backgroundColor:colors.parchmentSoft,borderRadius:14,padding:14,gap:10}}>
  <Copy>{t(['पृथ्वी से देखें: सूर्य की दिशा से चन्द्रमा की दिशा तक का कोण।','Viewed from Earth: the angle from the Sun’s direction to the Moon’s direction.'])}</Copy>
  <Svg accessible={false} width="100%" height={145} viewBox="0 0 300 145"><Circle cx={35} cy={108} r={12} fill={colors.inkMuted}/><Line x1={35} y1={108} x2={265} y2={108} stroke={colors.gold} strokeWidth={2}/><Line x1={35} y1={108} x2={258} y2={60} stroke={colors.saffronDeep} strokeWidth={2}/><Circle cx={265} cy={108} r={15} fill={colors.gold}/><Circle cx={258} cy={60} r={9} fill={colors.inkMuted}/><Path d="M95 108A60 60 0 0 0 94 95" stroke={colors.saffronDeep} strokeWidth={3} fill="none"/></Svg>
  <Copy>{t(['बायाँ बिन्दु: पृथ्वी · दायाँ बड़ा: सूर्य · दायाँ छोटा: चन्द्रमा। हर अगला 12° अगली तिथि का खण्ड है। चित्र दूरी या आकार के अनुपात में नहीं है।','Left point: Earth · larger right point: Sun · smaller right point: Moon. Each next 12° is another tithi interval. Distances and sizes are not to scale.'])}</Copy>
 </View>
 <Copy heading>{t(['पंचांग की पंक्ति पढ़ें','Read a Panchang row'])}</Copy>
 <View style={{backgroundColor:colors.saffronTint,borderRadius:14,padding:16}}><Copy heading>{t(['चतुर्दशी · 14:15 तक','Chaturdashi · until 14:15'])}</Copy><Copy>{t(['समझाने का उदाहरण: 14:15 पर चतुर्दशी समाप्त होकर अगली तिथि शुरू होती है। यह आज का पंचांग नहीं है।','Illustrative example: Chaturdashi ends and the next tithi begins at 14:15. This is not today’s Panchang.'])}</Copy></View>
 <Copy>{t(['वार · तिथि · नक्षत्र · योग · करण','Vara · Tithi · Nakshatra · Yoga · Karana'])}</Copy>
 </View>;}
export function TextLayers(){const t=useSanatanText(),{colors}=useTheme();const rows:readonly [Pair,Pair][]=[
 [['संहिता','Samhita'],['मन्त्रों का संग्रह','Collections of mantras']],
 [['ब्राह्मण','Brahmana'],['यज्ञ और अर्थ-विवेचन','Ritual and its explanation']],
 [['आरण्यक','Aranyaka'],['उपासना और अन्तर्निहित अर्थ','Contemplation and deeper meanings']],
 [['उपनिषद्','Upanishad'],['आत्मा, ब्रह्म और ज्ञान के प्रश्न','Questions of self, Brahman and knowledge']]];
 return <View style={{gap:8}}>{rows.map(([name,body],i)=><View key={name[1]} style={{padding:14,borderLeftWidth:3,borderLeftColor:colors.gold,backgroundColor:colors.parchmentSoft,borderRadius:12}}><Copy heading>{t(name)}</Copy><Copy>{t(body)}</Copy></View>)}<Copy>{t(['ये साहित्य के प्रकार हैं; सीमाएँ हर पाठ में बिल्कुल अलग-अलग नहीं हैं।','These are types of literature; their boundaries can overlap.'])}</Copy></View>;
}
export function DialoguePath(){const t=useSanatanText(),{colors}=useTheme();return <View style={{gap:12}}>
 {[['गार्गी: जगत किसमें स्थित है?','Gargi: what supports the world?'],['याज्ञवल्क्य: आकाश।','Yajnavalkya: akasha.'],['गार्गी: वह आकाश किसमें स्थित है?','Gargi: what supports akasha?'],['याज्ञवल्क्य: अक्षर—अविनाशी आधार।','Yajnavalkya: Akshara, the Imperishable.']].map((p,i)=><View key={i} style={{marginLeft:i%2?18:0,marginRight:i%2?0:18,padding:14,borderRadius:14,backgroundColor:i%2?colors.saffronTint:colors.parchmentSoft}}><Copy>{t([p[0],p[1]])}</Copy></View>)}
 <Copy>{t(['संवाद की सरल पुनर्कथा; मूल मन्त्र का उद्धरण नहीं। मैत्रेयी का प्रश्न अलग प्रसंग में आता है।','A simplified retelling, not a quotation of the original mantra. Maitreyi’s question belongs to another episode.'])}</Copy>
 </View>;}
