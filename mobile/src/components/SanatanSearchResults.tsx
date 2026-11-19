import React from 'react';
import { View } from 'react-native';
import { searchSanatanMatches } from '@/data/sanatan-parichay';
import { Action, Copy, Painting, useSanatanText } from './sanatan/Primitives';

export default function SanatanSearchResults({ query, onOpen }: { query: string; onOpen: (id: string, page: number) => void }) {
  const t = useSanatanText();
  const matches = query.trim() ? searchSanatanMatches(query).slice(0, 3) : [];
  if (!matches.length) return null;
  return <View style={{ gap: 12, marginVertical: 16 }}>
    <Copy heading>{t(['सनातन परिचय', 'Sanatan Parichay'])}</Copy>
    {matches.map(({topic,page}) => <View key={topic.id} style={{ gap: 8 }}>
      <Painting id={topic.id} small /><Action label={t(topic.question)} onPress={() => onOpen(topic.id,page)} />
    </View>)}
  </View>;
}
