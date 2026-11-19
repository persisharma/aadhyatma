import React from 'react';
import CompactOccasionCard from './CompactOccasionCard';
import type { OccasionTiming } from '@/panchang/occasionTimings';

type Props = {
  presentation: 'summary' | 'illustrated'; items: readonly OccasionTiming[];
  date: Date; place: string; placeEn?: string; error?: boolean; onRetry?: () => void;
  onOpenVrat: () => void; onOpenDetail?: (ruleId: string, date: Date) => void;
};
/** The heavy screen/share artwork graph is evaluated only in the Vrat view. */
export default function OccasionSection({ presentation, ...props }: Props) {
  if (presentation === 'summary') return <CompactOccasionCard {...props} />;
  const Cards = require('./OccasionTimingsCard').default as typeof import('./OccasionTimingsCard').default;
  return <Cards {...props} />;
}
