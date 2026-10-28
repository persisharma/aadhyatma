import React, { useRef } from 'react';
import { ScrollView, View } from 'react-native';
import AutoSlideScrollView from '@/components/AutoSlideScrollView';
import { comicPages, type ComicLanguage } from '@/data/comicBooks';
import ComicPanel from './ComicPanel';
import { useTheme } from '@/theme/ThemeContext';

type Page = ReturnType<typeof comicPages>[number];
export default function ComicPage({ page, width, language, comicId, anchor, onUserScroll }: { page: Page; width: number; language: ComicLanguage; comicId?: string; anchor?: string; onUserScroll: () => void }) {
  const scroll = useRef<ScrollView>(null);
  const { typography } = useTheme();
  return <AutoSlideScrollView ref={scroll} testID={`comic-page-${page.id}`} directionalLockEnabled nestedScrollEnabled
    onScrollBeginDrag={onUserScroll} style={{ width, flex: 1 }} contentContainerStyle={{ paddingHorizontal: 4, paddingTop: 4, paddingBottom: 8, gap: 8 }}>
    {page.rows.map((row, i) => <View key={row.map(p => p.id).join('-')} testID={`comic-row-${page.number}-${i + 1}`}
      onLayout={event => { if (anchor && row.some(p => p.id === anchor)) { const y = event.nativeEvent.layout.y; requestAnimationFrame(() => scroll.current?.scrollTo({ y, animated: false })); } }}
      style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 6 }}>
      {row.map(panel => <View key={panel.id} style={{ flex: 1, minWidth: 0 }}>
        <ComicPanel key={`${panel.id}-${language}-${typography.meaning.fontSize}`} panel={panel} language={language} comicId={comicId} />
      </View>)}
    </View>)}
  </AutoSlideScrollView>;
}
