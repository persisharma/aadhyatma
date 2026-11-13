import React, { useState } from 'react';
import { View } from 'react-native';
import { useTheme } from '@/theme/ThemeContext';
import type { Pair, SanatanTopic } from '@/data/sanatan-parichay';
import { Action, Copy, Painting, Panel, useSanatanText } from './Primitives';
import SwastikaGuide from './SwastikaGuide';
import TenDirectionsDiagram from './TenDirectionsDiagram';
import {groups,grahas,grahaDescriptions,avatarNames,jayadevaNames} from '@/data/sanatan-parichay/knowledge';
import {TempleSpaces,ElementLamp,TithiExample,TextLayers,DialoguePath} from './ConceptFigures';
import LessonArt from './LessonArt';
import {experiences,type RelatedLesson} from '@/data/sanatan-parichay/experience';

/** Exact educational schematics stay vector-based; collection paintings remain unchanged. */
export default function ExploreDiagram({ topic, onCollection, onRelated }: { topic: SanatanTopic; onCollection: (id: string) => void; onRelated?: (link:RelatedLesson)=>void }) {
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
    case 'directions':
      body=<TenDirectionsDiagram/>;
      break;
    case 'groups':
      body = <><Copy heading>8 + 11 + 12 + 1 + 1 = 33</Copy>
        {choices(groups.map(g => [g[0], g[1]]))}
        <Copy>{t([groups[selected][2], groups[selected][3]])}</Copy>
        <Copy>{t(['बृहदारण्यक उपनिषद् 3.9', 'Brihadaranyaka Upanishad 3.9'])}</Copy></>;
      break;
    case 'avatars': {
      const names=lens?jayadevaNames:avatarNames;
      body = <><Action label={t(['बलराम–कृष्ण क्रम', 'Balarama–Krishna sequence'])} selected={lens === 0} onPress={() => setLens(0)} />
        <Action label={t(['जयदेव', 'Jayadeva'])} selected={lens === 1} onPress={() => setLens(1)} />
        <View style={{gap:8}}>{names.map((name,i)=><View key={name[1]} style={{paddingHorizontal:14,paddingVertical:7,borderLeftWidth:3,borderLeftColor:colors.gold,backgroundColor:colors.parchmentSoft,borderRadius:10}}><Copy>{`${i+1}. ${t(name)}`}</Copy></View>)}</View>
        <Copy>{t(lens ? ['कृष्ण इस स्तवन में सम्बोधित हैं।', 'Krishna is the addressee in this hymn.'] : ['बलराम और कृष्ण वाला चयन।', 'The selection with Balarama and Krishna.'])}</Copy></>;
      break;
    }
    case 'grahas':
      body = <>{choices(grahas)}<Copy heading>{t(grahas[selected])}</Copy>
        <Copy>{t(grahaDescriptions[selected])}</Copy>
        {onRelated&&<Action label={t(['यह श्लोक पढ़ें','Read this verse'])} onPress={()=>onRelated({label:['नवग्रह स्तोत्र','Navagraha Stotram'],target:{kind:'reading',id:'navagraha-stotram',index:selected}})}/>}
        {onRelated&&<Action label={t(['ज्योतिष में इस ग्रह को जानें','This graha in Jyotish'])} onPress={()=>onRelated({label:['ग्रह परिचय','Graha reference'],target:{kind:'graha',id:(['sun','moon','mars','mercury','jupiter','venus','saturn','rahu','ketu'] as const)[selected]}})}/>}
        <Copy>{t(['नवग्रह स्तोत्र · पद्य 1–9','Navagraha Stotra · verses 1–9'])}</Copy></>;
      break;
    case 'swastika':
      body = <SwastikaGuide mode="meaning" />;
      break;
    case 'elements':body=<ElementLamp/>;break;
    case 'tithi':body=<TithiExample/>;break;
    case 'temple':body=<TempleSpaces/>;break;
    case 'dialogue':body=<DialoguePath/>;break;
    case 'texts':body=<TextLayers/>;break;
    case 'categories':
      body = <>{[['अवतार','Avatara','forms'],['स्वरूप','Divine form','deity'],['देवसमूह','Collection','dikpal']].map(([hi,en,id]) => <View key={id} style={{ gap: 8 }}><Painting id={id} small /><Action label={t([hi,en])} onPress={() => onCollection(id)} /></View>)}</>;
      break;
    case 'image':
      body=<><LessonArt topicId={topic.id}/><Copy>{t(['गणपति अथर्वशीर्ष का चुना हुआ चार-हाथों वाला ध्यान-रूप। अन्य कलाकृतियों में रूप बदल सकते हैं।','The selected four-armed meditation form in Ganapati Atharvashirsha. Other depictions may differ.'])}</Copy>
       {experiences.deity.terms.map(term=><View key={term.name[1]} style={{padding:12,borderRadius:12,backgroundColor:colors.parchmentSoft}}><Copy heading>{t(term.name)}</Copy><Copy>{t(term.meaning)}</Copy></View>)}
       <Copy>{t(['वरद मुद्रा: वर देने का भाव। मूषकध्वज: मूषक से जुड़ा चिह्न।','Varada gesture: the giving of a boon. Mushakadhvaja: the mouse emblem.'])}</Copy></>;break;
    default:
      body=<><LessonArt topicId={topic.id}/><Copy heading>{t(['एक पौधा, अलग उपयोग','One plant, distinct uses'])}</Copy>
       {experiences.plants.terms.map(term=><View key={term.name[1]} style={{padding:12,borderRadius:12,backgroundColor:colors.parchmentSoft}}><Copy heading>{t(term.name)}</Copy><Copy>{t(term.meaning)}</Copy></View>)}
       <Copy>{t(['जीवित पौधे की देखभाल, पत्र अर्पण और मनके बनाना अलग काम हैं।','Caring for the living plant, offering leaves and making beads are distinct activities.'])}</Copy></>;

  }
  return <Panel><Copy heading testID={`sanatan-explore-${topic.id}`}>{t(['चित्र से समझें', 'Explore visually'])}</Copy>{body}</Panel>;
}
