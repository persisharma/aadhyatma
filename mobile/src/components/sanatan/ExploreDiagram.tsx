import React from 'react';
import type { SanatanTopic } from '@/data/sanatan-parichay';
import { Copy, Panel, useSanatanText } from './Primitives';
import LessonArt from './LessonArt';
import { experiences } from '@/data/sanatan-parichay/experience';

/**
 * The lesson's painted teaching plate, chosen by reading language, with a single
 * caption line. The illustration carries the concept; onward links live on the
 * last page (LessonRelated). The plate replaces the earlier vector schematics.
 */
export default function ExploreDiagram({ topic }: { topic: SanatanTopic }) {
  const t = useSanatanText();
  const caption = experiences[topic.id]?.answer;
  return <Panel>
    <Copy heading testID={`sanatan-explore-${topic.id}`}>{t(['चित्र से समझें', 'Explore visually'])}</Copy>
    <LessonArt topicId={topic.id} accessibilityLabel={t(caption ?? topic.question)} />
    {caption && <Copy>{t(caption)}</Copy>}
  </Panel>;
}
