import React, { useEffect, useState } from 'react';
import { CommonActions } from '@react-navigation/native';
import { navigationRef } from '@/notifications/deepLink';
import { startTargetToNavigateAction } from '@/navigation/startTarget';
import { EXPLORE_SECTIONS } from '@/data/discovery/sections';
import { setExploreVisible } from '@/data/discovery/store';
import ExploreSheet from './ExploreSheet';

/** Explicit Settings replay: no automatic cadence or preference writes. */
export default function ExplorePreview({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    setExploreVisible(true);
    return () => setExploreVisible(false);
  }, []);
  const [index, setIndex] = useState(0);
  const section = EXPLORE_SECTIONS[index];
  const next = () => {
    if (index + 1 < EXPLORE_SECTIONS.length) setIndex(index + 1);
    else onClose();
  };
  return <ExploreSheet key={section.id} section={section} onDismiss={onClose} onNext={next} onOpen={name => {
    onClose();
    const target = section.id === 'suvichar'
      ? { ...section.target, params: { exploreDraft: { name, deity: 'ram-darbar' } } }
      : section.target;
    navigationRef.dispatch(CommonActions.navigate(startTargetToNavigateAction(target)));
  }} />;
}
