import React from 'react';
import { View } from 'react-native';
import type { SanatanTopic } from '@/data/sanatan-parichay';
import { ListingScope } from '@/components/ListingCard';
import { experiences } from '@/data/sanatan-parichay/experience';
import { useSanatanText } from './Primitives';
import LessonArt from './LessonArt';
import { LessonLegend } from './LessonPanels';

/**
 * The figure page: the lesson's painted teaching plate (edge to edge, opens in
 * the picture viewer), one caption line, then the plate's names as native text
 * where the lesson has an authored roster. Onward links live on the last page.
 */
export default function ExploreDiagram({ topic, onOpenPicture }: { topic: SanatanTopic; onOpenPicture?: () => void }) {
  const t = useSanatanText();
  const caption = experiences[topic.id]?.answer;
  return <View testID={`sanatan-explore-${topic.id}`} style={{ gap: 10 }}>
    <LessonArt topicId={topic.id} title={t(topic.title)} caption={t(caption ?? topic.question)} onOpen={onOpenPicture} />
    {caption && <ListingScope>{t(caption)}</ListingScope>}
    <LessonLegend id={topic.id} />
  </View>;
}
