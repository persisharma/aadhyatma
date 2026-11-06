import React from 'react';
import { ScrollView } from 'react-native';
import { sanatanSources, type SanatanTopic } from '@/data/sanatan-parichay';
import { Copy, Panel, useSanatanText } from './Primitives';

/** Reading credits are plain text. Research URLs stay in repository provenance. */
export default function SourceCredits({ topic }: { topic: SanatanTopic }) {
  const t = useSanatanText();
  return <ScrollView contentContainerStyle={{ padding: 22, gap: 16 }}>
    <Copy>{t(['यह एक संक्षिप्त सम्पादकीय परिचय है। अलग ग्रन्थों और परम्पराओं में विवरण भिन्न हो सकते हैं।','This is a short editorial introduction. Details may differ across texts and traditions.'])}</Copy>
    {topic.refs.map(id => { const source = sanatanSources[id]; return <Panel key={id}>
      <Copy heading>{source.title}</Copy><Copy>{source.edition}</Copy><Copy>{source.location}</Copy>
    </Panel>; })}
  </ScrollView>;
}
