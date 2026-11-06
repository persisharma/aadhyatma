import React from 'react';
import { View } from 'react-native';
import { searchSanatanTopics } from '@/data/sanatan-parichay';
import { Action, Copy, Painting, useSanatanText } from './sanatan/Primitives';

export default function SanatanSearchResults({ query, onOpen }: { query: string; onOpen: (id: string) => void }) {
  const t = useSanatanText();
  const matches = query.trim() ? searchSanatanTopics(query).slice(0, 3) : [];
  if (!matches.length) return null;
  return <View style={{ gap: 12, marginVertical: 16 }}>
    <Copy heading>{t(['सनातन परिचय', 'Sanatan Parichay'])}</Copy>
    {matches.map(topic => <View key={topic.id} style={{ gap: 8 }}>
      <Painting id={topic.id} small /><Action label={t(topic.question)} onPress={() => onOpen(topic.id)} />
    </View>)}
  </View>;
}
