import React from 'react';
import { useGitaLanguage } from '@/data/gita/language';
import VedanshWordmark from './VedanshWordmark';

export default function HomeWordmark({ compact = false, showTagline = true }: {
  compact?: boolean; showTagline?: boolean;
}) {
  const { lang } = useGitaLanguage();
  return <VedanshWordmark lang={lang} compact={compact} showTagline={showTagline} />;
}
