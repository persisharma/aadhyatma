import React, { useMemo, useRef, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import BackgroundLayer from '@/components/BackgroundLayer';
import KathaSectionPage from '@/components/KathaSectionPage';
import LanguageToggle from '@/components/LanguageToggle';
import ReaderHeader from '@/components/ReaderHeader';
import ReadingProgressBar from '@/components/ReadingProgressBar';
import ReadAloudButton from '@/components/readAloud/ReadAloudButton';
import AutoSlideButton from '@/components/AutoSlideButton';
import ShareButton from '@/components/ShareButton';
import { readingParchment } from '@/data/backgroundAsset';
import { useGitaLanguage } from '@/data/gita/language';
import { getPratha, hasPratha } from '@/data/pratha';
import { PRATHA_TIERS, prathaPages, type PrathaPage } from '@/data/pratha/presentation';
import type { HomeStackParamList, PrathaStackParamList, TabParamList } from '@/navigation/types';
import { navigateToHomeStackTarget } from '@/navigation/entryRoutes';
import { useReaderPlayback } from './_useAutoSlide';
import { useTheme } from '@/theme/ThemeContext';
import { contentByLang } from '@/utils/localize';
import { meaningToken } from '@/utils/langType';
import { useShare } from '@/utils/shareVerse';
import { prathaShareable } from '@/utils/shareContent';

type Props = NativeStackScreenProps<PrathaStackParamList, 'PrathaReader'>;

export default function PrathaReaderScreen({ route, navigation }: Props) {
  const rootNav = useNavigation<NativeStackNavigationProp<HomeStackParamList & TabParamList>>();
  const { colors, typography } = useTheme();
  const { lang } = useGitaLanguage();
  const { width } = useWindowDimensions();
  const { share, busy } = useShare();
  const entry = hasPratha() ? getPratha(route.params.prathaId) : null;
  const pages = useMemo(() => entry ? prathaPages(entry) : [], [entry]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const listRef = useRef<FlatList<PrathaPage>>(null);
  const { readAloud, autoSlide } = useReaderPlayback({
    sourceId: `pratha-${route.params.prathaId}`, data: pages, offset: 0,
    verseCount: pages.length, currentIndex, listRef,
  });
  const meaning = meaningToken(lang, typography);
  const link = (id: string, hi: string, en: string, onPress: () => void) => (
    <Pressable key={id} testID={`pratha-link-${id}`} accessibilityRole="button"
      onPress={onPress} style={[styles.link, { borderColor: colors.divider }]}>
      <Text style={{ ...meaning, color: colors.saffronDeep }}>{contentByLang(lang, hi, en)} →</Text>
    </Pressable>
  );
  const handoffs = entry ? <View>
    {entry.kathas.map((s, i) => s.ref ? link(`ref-${i}`, s.canonHi, s.canonEn, () => {
      const ref = s.ref!;
      if (ref.kind === 'gita') navigateToHomeStackTarget(rootNav, { screen: 'GitaReader', params: { chapter: ref.chapter, initialIndex: ref.verseIndex } });
      else navigateToHomeStackTarget(rootNav, { screen: 'ValmikiRamayanReader', params: { chapter: ref.chapter, initialIndex: ref.verseIndex } });
    }) : null)}
    {entry.anchors.kathaIds?.map((id) => link(`katha-${id}`, 'पूरी व्रत कथा', 'Full vrat katha', () =>
      navigateToHomeStackTarget(rootNav, { screen: 'VratKathaReader', params: { kathaId: id } })))}
    {entry.anchors.vidhiIds?.map((id) => link(`vidhi-${id}`, 'पूजा विधि', 'Puja guide', () =>
      navigateToHomeStackTarget(rootNav, { screen: 'VidhiDetail', params: { vidhiId: id } })))}
    {entry.anchors.theerthIds?.map((id) => link(`theerth-${id}`, 'तीर्थ परिचय', 'Temple introduction', () =>
      navigateToHomeStackTarget(rootNav, { screen: 'TheerthDetail', params: { templeId: id } })))}
    {entry.anchors.prathaIds?.filter((id) => getPratha(id)).map((id) => {
      const related = getPratha(id)!;
      return link(`related-${id}`, related.questionHi, related.questionEn, () => navigation.push('PrathaReader', { prathaId: id }));
    })}
    {link('hub', 'और प्रश्न', 'More questions', () => navigation.navigate('Pratha'))}
  </View> : null;

  return <View style={[styles.root, { backgroundColor: colors.parchment }]} testID="pratha-reader">
    <BackgroundLayer source={readingParchment} />
    <SafeAreaView style={styles.root} edges={['top', 'left', 'right']}>
      <ReaderHeader title={contentByLang(lang, 'ऐसा क्यों?', 'Why do we do this?')} onBack={() => navigation.goBack()}
        sideWidth={96} right={entry ? <View style={styles.headerActions}>
          <Text testID="pratha-counter" style={{ color: colors.inkMuted, fontFamily: typography.pageCounter.fontFamily }}>{currentIndex + 1} / {pages.length}</Text>
          <ShareButton onPress={() => void share(prathaShareable(entry, currentIndex), lang)} busy={busy}
            accessibilityLabel="Share this explanation" accessibilityHint="Opens share options for this page" />
        </View> : null} />
      {entry ? <>
        <ReadingProgressBar current={currentIndex + 1} total={pages.length} />
        <View style={styles.controls}>
          <View style={styles.autoSlide}><AutoSlideButton control={autoSlide} floating={false} /></View>
          <LanguageToggle />
          <View style={styles.actions}>
            <ReadAloudButton control={readAloud} />
          </View>
        </View>
        <FlatList ref={listRef} data={pages} CellRendererComponent={autoSlide.Cell} horizontal pagingEnabled
          extraData={lang} keyExtractor={(page) => page.id} showsHorizontalScrollIndicator={false}
          initialNumToRender={1} windowSize={3} maxToRenderPerBatch={2}
          getItemLayout={(_, index) => ({ length: width, offset: width * index, index })}
          onScroll={(event) => setCurrentIndex(Math.max(0, Math.min(pages.length - 1, Math.round(event.nativeEvent.contentOffset.x / width))))}
          scrollEventThrottle={16}
          renderItem={({ item, index }) => <View style={styles.root} testID={`pratha-page-${item.id}`}>
            <KathaSectionPage section={item} width={width} index={index} total={pages.length}
              pillHi={item.tier ? PRATHA_TIERS[item.tier].hi : 'परिचय'}
              pillEn={item.tier ? PRATHA_TIERS[item.tier].en : 'Introduction'}
              sourceLabel={item.canonHi && item.canonEn ? contentByLang(lang, item.canonHi, item.canonEn) : undefined}
              footer={item.id === 'links' ? handoffs : undefined} />
          </View>} />
        <View style={styles.dots} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
          {pages.map((page, i) => <View key={page.id} style={{ width: i === currentIndex ? 16 : 5, height: 5, borderRadius: 3, backgroundColor: i === currentIndex ? colors.saffronDeep : colors.dotRest }} />)}
        </View>
      </> : <View style={styles.empty} testID="pratha-unavailable">
        <Text style={{ ...meaning, color: colors.ink }}>{contentByLang(lang, 'यह परिचय अभी उपलब्ध नहीं है।', 'This introduction is not available yet.')}</Text>
        {hasPratha() ? link('hub', 'और प्रश्न', 'More questions', () => navigation.navigate('Pratha')) : null}
      </View>}
    </SafeAreaView>
  </View>;
}

const styles = StyleSheet.create({
  root: { flex: 1 }, controls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 6 },
  autoSlide: { position: 'absolute', left: 16 }, actions: { position: 'absolute', right: 16, flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6, paddingVertical: 12 },
  link: { minHeight: 48, paddingVertical: 12, borderTopWidth: 1 }, empty: { padding: 24 },
});
