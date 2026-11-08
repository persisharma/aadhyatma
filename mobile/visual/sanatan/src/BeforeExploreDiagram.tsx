// Comparison baseline: main 62d9b6d; preview only, never imported by the app.
import React, { useState } from 'react';
import { View } from 'react-native';
import Svg, { Circle, Line, Text as SvgText } from 'react-native-svg';
import { useTheme } from '@/theme/ThemeContext';
import type { Pair, SanatanTopic } from '@/data/sanatan-parichay';
import { Action, Copy, Painting, Panel, useSanatanText } from '@/components/sanatan/Primitives';
import SwastikaGuide from '@/components/sanatan/SwastikaGuide';

const directions = [
  ['उत्तर', 'North', 'कुबेर', 'Kubera'], ['ईशान', 'Northeast', 'ईशान', 'Ishana'],
  ['पूर्व', 'East', 'इन्द्र', 'Indra'], ['आग्नेय', 'Southeast', 'अग्नि', 'Agni'],
  ['दक्षिण', 'South', 'यम', 'Yama'], ['नैऋत्य', 'Southwest', 'निरृति', 'Nirriti'],
  ['पश्चिम', 'West', 'वरुण', 'Varuna'], ['वायव्य', 'Northwest', 'वायु', 'Vayu'],
  ['ऊर्ध्व', 'Above', 'ब्रह्मा', 'Brahma'], ['अधो', 'Below', 'विष्णु', 'Vishnu'],
];
const groups = [
  ['8 · वसु', '8 · Vasus', 'अग्नि, पृथ्वी, वायु, अन्तरिक्ष, आदित्य, द्यौ, चन्द्रमा और नक्षत्र।', 'Agni, Prithivi, Vayu, Antariksha, Aditya, Dyau, Chandramas and Nakshatras.'],
  ['11 · रुद्र', '11 · Rudras', 'दस प्राण और ग्यारहवाँ आत्मा। शरीर से इनके निकलने पर सम्बन्धी रोते हैं; संवाद इसी से रुद्र नाम समझाता है।', 'Ten pranas and the self as eleventh. The dialogue connects their departure from the body with the weeping of relatives, explaining the name Rudra.'],
  ['12 · आदित्य', '12 · Adityas', 'इस संवाद में बारह महीनों से व्याख्या की गई है।', 'Explained here through the twelve months.'],
  ['1 · इन्द्र', '1 · Indra', 'इस संदर्भ में वज्र का परिचय।', 'The thunderbolt in this context.'],
  ['1 · प्रजापति', '1 · Prajapati', 'इस संवाद में यज्ञ का संदर्भ।', 'Yajna in this dialogue.'],
];
const grahas: Pair[] = [['सूर्य','Surya'],['चन्द्र','Chandra'],['मंगल','Mangala'],['बुध','Budha'],['बृहस्पति','Brihaspati'],['शुक्र','Shukra'],['शनि','Shani'],['राहु','Rahu'],['केतु','Ketu']];
// Short original explanations of the stotra's epithets; not copied translations.
const grahaDescriptions: Pair[] = [
  ['स्तोत्र सूर्य को दिवाकर—दिन बनाने वाला—कहता है।', 'Surya is praised as Divakara, maker of the day.'],
  ['चन्द्र का स्मरण शिव के मुकुट के भूषण के रूप में है।', 'Chandra is remembered as an adornment of Shiva’s crown.'],
  ['मंगल धरती से उत्पन्न और हाथ में शक्ति लिए हुए वर्णित हैं।', 'Mangala is described as earth-born and carrying a spear.'],
  ['बुध के सौम्य गुणों और अनुपम रूप का वर्णन है।', 'Budha is praised for a gentle nature and exceptional beauty.'],
  ['बृहस्पति देवों और ऋषियों के गुरु कहे गए हैं।', 'Brihaspati is the teacher of deities and rishis.'],
  ['भार्गव नाम से स्मरण किए गए शुक्र दैत्यों के गुरु हैं।', 'Shukra, addressed as Bhargava, is the preceptor of the daityas.'],
  ['शनैश्चर सूर्य और छाया की सन्तान के रूप में स्मरण किए गए हैं।', 'Shanaishchara is remembered as the child of Surya and Chhaya.'],
  ['राहु का अर्धकाय रूप स्तोत्र में आता है। खगोल में यह चन्द्र-कक्षा के दो पात-बिन्दुओं में से एक है।', 'The hymn describes Rahu with half a body. Astronomically, Rahu denotes one of the lunar orbital nodes.'],
  ['केतु के तेज की तुलना पलाश के फूल से है। खगोल में यह दूसरा चन्द्र-पात है।', 'Ketu’s appearance is likened to a palasha flower. Astronomically, Ketu denotes the other lunar node.'],
];

/** Exact educational schematics stay vector-based; collection paintings remain unchanged. */
export default function ExploreDiagram({ topic, onCollection }: { topic: SanatanTopic; onCollection: (id: string) => void }) {
  const t = useSanatanText();
  const { colors } = useTheme();
  const [selected, setSelected] = useState(0);
  const [lens, setLens] = useState(0);
  const choices = (items: readonly Pair[]) => <View style={{ gap: 8, flexDirection: 'row', flexWrap: 'wrap' }}>
    {items.map((item, index) => <Action key={item[1]} label={t(item)} selected={selected === index}
      style={{ flexBasis: '45%', flexGrow: 1 }} onPress={() => setSelected(index)} />)}
  </View>;
  let body: React.ReactNode;
  switch (topic.kind) {
    case 'directions': {
      const direction = directions[selected];
      body = <>
        <Svg width="100%" height={220} viewBox="0 0 280 240" accessible={false}>
          <Circle cx={140} cy={120} r={62} fill="none" stroke={colors.gold} />
          {directions.slice(0, 8).map((d, i) => {
            const angle = (i * 45 - 90) * Math.PI / 180;
            return <React.Fragment key={d[1]}><Line x1={140} y1={120} x2={140 + 62 * Math.cos(angle)} y2={120 + 62 * Math.sin(angle)}
              onPress={() => setSelected(i)} stroke={selected === i ? colors.saffronDeep : colors.gold} strokeWidth={selected === i ? 4 : 2} />
              <SvgText x={140 + 92 * Math.cos(angle)} y={125 + 92 * Math.sin(angle)}
                textAnchor="middle" fontSize={12} fill={colors.ink} onPress={() => setSelected(i)}>{t([d[0], d[1]])}</SvgText></React.Fragment>;
          })}
          <Circle cx={140} cy={120} r={6} fill={colors.saffronDeep} />
        </Svg>
        <Copy heading>{`${t([direction[0], direction[1]])} · ${t([direction[2], direction[3]])}`}</Copy>
        {choices(directions.slice(0, 8).map(d => [d[0], d[1]]))}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {directions.slice(8).map((d, i) => <Action key={d[1]} label={t([d[0],d[1]])}
            selected={selected === i + 8} onPress={() => setSelected(i + 8)} />)}
        </View>
        <Copy>{t(['कामिक आगम का दिशाक्रम', 'Direction sequence in Kamika Agama'])}</Copy>
      </>;
      break;
    }
    case 'groups':
      body = <><Copy heading>8 + 11 + 12 + 1 + 1 = 33</Copy>
        {choices(groups.map(g => [g[0], g[1]]))}
        <Copy>{t([groups[selected][2], groups[selected][3]])}</Copy>
        <Copy>{t(['बृहदारण्यक उपनिषद् 3.9', 'Brihadaranyaka Upanishad 3.9'])}</Copy></>;
      break;
    case 'avatars': {
      const names: Pair[] = [['मत्स्य','Matsya'],['कूर्म','Kurma'],['वराह','Varaha'],['नरसिंह','Narasimha'],['वामन','Vamana'],['परशुराम','Parashurama'],['राम','Rama'],['बलराम','Balarama'],lens ? ['बुद्ध','Buddha'] : ['कृष्ण','Krishna'],['कल्कि','Kalki']];
      body = <><Action label={t(['बलराम–कृष्ण क्रम', 'Balarama–Krishna sequence'])} selected={lens === 0} onPress={() => setLens(0)} />
        <Action label={t(['जयदेव', 'Jayadeva'])} selected={lens === 1} onPress={() => setLens(1)} />
        {names.map((name, i) => <Copy key={i}>{`${i + 1}. ${t(name)}`}</Copy>)}
        <Copy>{t(lens ? ['कृष्ण इस स्तवन में सम्बोधित हैं।', 'Krishna is the addressee in this hymn.'] : ['बलराम और कृष्ण वाला चयन।', 'The selection with Balarama and Krishna.'])}</Copy></>;
      break;
    }
    case 'grahas':
      body = <>{choices(grahas)}<Copy heading>{t(grahas[selected])}</Copy>
        <Copy>{t(grahaDescriptions[selected])}</Copy>
        <Copy>{t(['नवग्रह स्तोत्र · पद्य 1–9','Navagraha Stotra · verses 1–9'])}</Copy></>;
      break;
    case 'swastika':
      body = <SwastikaGuide mode="meaning" />;
      break;
    case 'elements':
      body = <>{[['आकाश','Space'],['वायु','Air'],['अग्नि','Fire'],['जल','Water'],['पृथ्वी','Earth']].map((p, i) => <Copy key={i}>{`${i + 1}. ${t([p[0], p[1]])}`}</Copy>)}
        <Copy>{t(['तैत्तिरीय उपनिषद् 2.1.1 का क्रम','Sequence in Taittiriya Upanishad 2.1.1'])}</Copy></>;
      break;
    case 'tithi':
      body = <><Svg accessible={false} width="100%" height={160} viewBox="0 0 260 160">
        <Circle cx={40} cy={110} r={12} fill={colors.inkMuted} />
        <Line x1={40} y1={110} x2={235} y2={110} stroke={colors.gold} strokeWidth={2} />
        <Line x1={40} y1={110} x2={231} y2={69} stroke={colors.saffronDeep} strokeWidth={2} />
        <Circle cx={235} cy={110} r={13} fill={colors.gold} /><Circle cx={231} cy={69} r={8} fill={colors.inkMuted} />
      </Svg><Copy>{t(['तिथि: सूर्य और चन्द्र की भूकेन्द्रीय देशान्तर-दूरी में हर 12° का खण्ड।','Tithi: each 12° interval of geocentric longitude separation between Sun and Moon.'])}</Copy>
        <Copy>{t(['वार · तिथि · नक्षत्र · योग · करण','Vara · Tithi · Nakshatra · Yoga · Karana'])}</Copy></>;
      break;
    case 'temple':
      body = <>{[['गर्भगृह','Sanctum'],['मण्डप','Mandapa'],['प्रवेश','Entrance']].map((p, i) => <View key={i} style={{ borderWidth: 2, borderColor: colors.gold, padding: 12, marginHorizontal: (2 - i) * 12 }}><Copy>{t([p[0], p[1]])}</Copy></View>)}
        <Copy>{t(['स्थान समझाने की सरल योजना; वास्तु-नक्शा नहीं।','A simplified spatial illustration, rather than an architectural plan.'])}</Copy></>;
      break;
    case 'dialogue':
      body = <><Copy heading>{t(['गार्गी','Gargi'])}</Copy><Copy>{t(['जगत का आधार क्या है?','What is the basis of the world?'])}</Copy>
        <Copy>{t(['याज्ञवल्क्य के साथ अक्षर पर चर्चा।','A discussion of the Immutable with Yajnavalkya.'])}</Copy>
        <Copy>{t(['पहला प्रश्न जगत से आकाश की ओर ले जाता है; दूसरा आकाश के आधार, अक्षर, की ओर।','The first question leads from the world to akasha; the second asks about its ground, the Akshara.'])}</Copy></>;
      break;
    case 'texts':
      body = <>{[['संहिता','Samhita'],['ब्राह्मण','Brahmana'],['आरण्यक','Aranyaka'],['उपनिषद्','Upanishad']].map((p, i) => <Copy key={i}>{`${i + 1}. ${t([p[0], p[1]])}`}</Copy>)}</>;
      break;
    case 'categories':
      body = <>{[['अवतार','Avatara','forms'],['स्वरूप','Divine form','deity'],['देवसमूह','Collection','dikpal']].map(([hi,en,id]) => <View key={id} style={{ gap: 8 }}><Painting id={id} small /><Action label={t([hi,en])} onPress={() => onCollection(id)} /></View>)}</>;
      break;
    default:
      body = <><Painting id={topic.id} /><Copy>{t(topic.kind === 'plant' ? ['पत्ते · माला · तुलसी विवाह','Leaves · prayer beads · Tulasi Vivaha'] : ['स्वरूप के आयुध, मुद्रा और साथ के पात्र पहचान में सहायता करते हैं।','Attributes, posture and accompanying figures help identify a form.'])}</Copy></>;
  }
  return <Panel><Copy heading testID={`sanatan-explore-${topic.id}`}>{t(['चित्र से समझें', 'Explore visually'])}</Copy>{body}</Panel>;
}
