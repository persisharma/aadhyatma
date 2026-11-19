import React, { useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NavigationProp } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import CatalogBackground from '@/components/CatalogBackground';
import ReaderHeader from '@/components/ReaderHeader';
import TextField from '@/components/TextField';
import FeatureIcon from '@/components/FeatureIcon';
import CategoryCard from '@/components/CategoryCard';
import CategoryIcon, { type CategoryIconKey } from '@/components/CategoryIcon';
import ListingCard from '@/components/ListingCard';
import TodayRecommendationsRow from '@/components/TodayRecommendationsRow';
import DeityDayLinks from '@/components/DeityDayLinks';
import { readingLinks } from '@/data/readingLinks';
import { categories } from '@/data/categories';
import { library, type ContentCategory } from '@/data/texts';
import { getKathaLibrary } from '@/panchang/vratCatalog';
import { BHOG_CONTENT, isBhogEntryExposed } from '@/panchang/bhogContent';
import { getDaanKathas } from '@/data/daan';
import { getSanatanTopics } from '@/data/sanatan-parichay';
import { kidsStories } from '@/data/kidsStories';
import { VIDHI_ENTRIES } from '@/data/vidhi';
import { useGitaLanguage } from '@/data/gita/language';
import { useNewContent } from '@/contexts/NewContentContext';
import {
  moreTabTarget,
  navigateReadingLink,
  navigateToEntryStart,
  panchangTabTarget,
} from '@/navigation/entryRoutes';
import type { HomeStackParamList, TabParamList } from '@/navigation/types';
import { useTheme } from '@/theme/ThemeContext';
import { contentByLang } from '@/utils/localize';
import { titleFontByLang } from '@/utils/langType';

type Props = NativeStackScreenProps<HomeStackParamList, 'ReadingLibrary'>;
type Shelf = {
  hi: string;
  en: string;
  icon: CategoryIconKey | React.ReactElement;
  open: () => void;
  category?: ContentCategory;
};
type Row = Pick<Shelf, 'hi' | 'en' | 'open'>;
const fold = (s: string) =>
  s
    .normalize('NFC')
    .toLowerCase()
    .replace(/[\u00c0-\u024f\u1e00-\u1eff]/g, (c) => c.normalize('NFD')[0]);

export default function ReadingLibraryScreen({ navigation, route }: Props) {
  const features = route.params?.features;
  const tabs = navigation.getParent<NavigationProp<TabParamList>>();
  const { lang } = useGitaLanguage();
  const { colors, spacing } = useTheme();
  const { hasNewInCategory, markSeen } = useNewContent();
  const { width, fontScale } = useWindowDimensions();
  const [query, setQuery] = useState('');
  const [detail, setDetail] = useState<'bhog' | 'giving'>();
  const label = (hi: string, en: string) => contentByLang(lang, hi, en);
  const shelf = (hi: string, en: string, icon: CategoryIconKey | React.ReactElement, open: () => void): Shelf => ({
    hi,
    en,
    icon,
    open,
  });
  const form = (id: ContentCategory): Shelf => {
    const c = categories.find((item) => item.id === id)!;
    return {
      hi: c.nameHi,
      en: c.shortNameEn ?? c.nameEn,
      icon: id,
      category: id,
      open: () => navigation.navigate('CategoryList', { categoryId: id }),
    };
  };
  const books = form('granth');
  const kathas = shelf('व्रत और पर्व कथाएँ', 'Vrat & festival kathas', 'vrat', () =>
    navigation.navigate('KathaLibrary'),
  );
  const recite = (['chalisa', 'aarti', 'stotram', 'kavacham', 'ashtakam', 'suktam', 'japam'] as const).map(form);
  const learning = [
    shelf('बच्चों की चित्र-कथाएँ', 'Stories for kids', 'sanskar', () => navigation.navigate('KidsStoryLibrary')),
    shelf('रामायण कॉमिक', 'Ramayan comics', 'granth', () => navigation.navigate('RamayanComic')),
    shelf('सनातन परिचय', 'Sanatan Parichay', 'granth', () => navigation.navigate('SanatanParichay')),
    shelf('देवता परिचय', 'Deities', 'deity', () => navigation.navigate('DeityIndex')),
    shelf('तीर्थ और मंदिर', 'Temples & pilgrimages', <FeatureIcon name="theerth" size={56} />, () =>
      navigation.navigate('TheerthMap'),
    ),
  ];
  const rituals = [
    shelf('पूजा विधि', 'Guided pujas', <FeatureIcon name="puja-vidhi" size={56} />, () =>
      navigation.navigate('VidhiCatalog'),
    ),
    shelf('भोग और नैवेद्य', 'Food offerings', 'vrat', () => setDetail('bhog')),
    shelf('दान कथाएँ', 'Stories of giving', 'daan', () => setDetail('giving')),
    shelf('पितृ परिचय', 'Ancestor traditions', 'sanskar', () =>
      tabs.navigate('MoreTab', moreTabTarget('PitruParichayReader')),
    ),
    shelf('नवग्रह परिचय', 'Nine grahas', 'insight', () => navigation.navigate('GrahaReference')),
    shelf('व्रत और उपवास', 'Vrat guides', 'vrat', () =>
      tabs.navigate('VratTab', panchangTabTarget('ObservanceList', { category: 'vrat' })),
    ),
    shelf('वास्तु मार्गदर्शन', 'Vastu guidance', 'purpose', () =>
      tabs.navigate('MoreTab', moreTabTarget('VastuDisha')),
    ),
    shelf('आज का विधान', 'Today’s guide', <FeatureIcon name="jijnasa" size={56} />, () =>
      navigation.navigate('TodayVidhan'),
    ),
    shelf('सुविचार', 'Devotional reflections', 'granth', () => navigation.navigate('Suvichar')),
  ];
  const tools = [
    shelf('पुस्तकालय', 'Library', 'granth', () => navigation.push('ReadingLibrary')),
    shelf('जपमाला', 'Japmala', 'japam', () =>
      navigation.navigate('CategoryList', { categoryId: 'japam', practice: true }),
    ),
    shelf('कुंडली', 'Kundali', 'insight', () =>
      tabs.navigate('PanchangTab', panchangTabTarget('PanchangHome', { initialTab: 'jyotish' })),
    ),
    shelf('मुहूर्त', 'Muhurat', 'muhurat', () =>
      tabs.navigate('PanchangTab', panchangTabTarget('MuhuratFinder', undefined)),
    ),
    shelf('उद्देश्य', 'By purpose', 'purpose', () => navigation.navigate('BrowseByPurpose')),
    shelf('नित्य साधना', 'Daily routine', <FeatureIcon name="routine" size={56} />, () =>
      navigation.navigate('RoutineToday'),
    ),
    shelf('संकल्प', 'Practice programs', <FeatureIcon name="sankalp" size={56} />, () =>
      navigation.navigate('SadhanaPrograms'),
    ),
    shelf('दान-पुण्य', 'Giving', <FeatureIcon name="daan-punya" size={56} />, () =>
      navigation.navigate('DaanPunya'),
    ),
    shelf('दर्शन', 'Darshan', 'theerth', () => navigation.navigate('DarshanQuick')),
    shelf('दैनिक भक्ति', 'Daily Bhakti', <FeatureIcon name="daily-bhakti" size={56} />, () =>
      tabs.navigate('DailyBhaktiTab'),
    ),
    shelf('पितृ स्मरण', 'Family remembrance', <FeatureIcon name="pitru-smaran" size={56} />, () =>
      tabs.navigate('MoreTab', moreTabTarget('PitruSmaranList')),
    ),
    shelf('विजेट', 'Widgets', <FeatureIcon name="home-widgets" size={56} />, () =>
      tabs.navigate('MoreTab', moreTabTarget('WidgetGallery')),
    ),
  ];
  const giving: Row[] = getDaanKathas().map((k) => ({
    hi: k.titleHi,
    en: k.titleEn,
    open: () => navigation.navigate('DaanKatha', { kathaId: k.id }),
  }));
  const bhog: Row[] = BHOG_CONTENT.filter(isBhogEntryExposed)
    .filter((b) => b.vidhiIds.length || b.observanceIds.length)
    .map((b) => ({
      hi: b.titleHi,
      en: b.titleEn,
      open: () =>
        b.vidhiIds.length
          ? navigation.navigate('VidhiDetail', { vidhiId: b.vidhiIds[0] })
          : tabs.navigate('VratTab', panchangTabTarget('ObservanceDetail', { ruleId: b.observanceIds[0] })),
    }));
  const term = fold(query.trim());
  const searchRows = (): Row[] =>
    [
      books,
      kathas,
      ...recite,
      ...learning,
      ...rituals,
      form('sanskar'),
      ...(features ? tools : []),
      ...library
        .filter((e) => !e.hidden && e.status === 'active')
        .map((e) => ({
          hi: e.nameHi,
          en: e.nameEn,
          open: () => {
            markSeen(e.id);
            navigateToEntryStart(navigation, e);
          },
        })),
      ...readingLinks.map((r) => ({
        hi: r.titleHi,
        en: r.titleEn,
        open: () => navigateReadingLink(navigation, r.id),
      })),
      ...getKathaLibrary().map((k) => ({
        hi: k.titleHi,
        en: k.titleEn,
        open: () => navigation.navigate('VratKathaReader', { kathaId: k.id }),
      })),
      ...getSanatanTopics().map((t) => ({
        hi: t.title[0],
        en: t.title[1],
        open: () => navigation.navigate('SanatanReader', { topicId: t.id }),
      })),
      ...kidsStories.map((s) => ({
        hi: s.title.hi,
        en: s.title.en,
        open: () => navigation.navigate('KidsStoryReader', { storyId: s.id }),
      })),
      ...VIDHI_ENTRIES.map((v) => ({
        hi: v.titleHi,
        en: v.titleEn,
        open: () => navigation.navigate('VidhiDetail', { vidhiId: v.id }),
      })),
      ...bhog,
      ...giving,
    ].filter((r) => fold([r.hi, r.en, label(r.hi, r.en)].join(' ')).includes(term));
  const group = (hi: string, en: string, items: Shelf[], covers = false) => {
    const columns = covers || fontScale > 1.2 ? 2 : 3;
    const w = Math.floor((width - 2 * spacing.lg - (columns - 1) * 10) / columns);
    return (
      <View style={styles.group}>
        <Text
          accessibilityRole="header"
          style={{ fontFamily: titleFontByLang(lang), fontSize: 16, color: colors.inkSoft }}
        >
          {label(hi, en)}
        </Text>
        <View style={styles.grid}>
          {items.map((item) => (
            <View key={item.en} style={{ width: w }}>
              <CategoryCard
                variant="launcher"
                status="active"
                nameHi={item.hi}
                nameEn={item.en}
                launcherLabelLines={2}
                hasNew={!!item.category && hasNewInCategory(item.category)}
                onPress={item.open}
                icon={
                  covers ? (
                    <Image
                      source={
                        item === books
                          ? require('../../assets/home-readings/gita.jpg')
                          : require('../../assets/sanatan-parichay/basics.webp')
                      }
                      style={{ width: w - 2, height: 70, borderRadius: 16 }}
                    />
                  ) : typeof item.icon === 'string' ? (
                    <CategoryIcon iconKey={item.icon} size={59} />
                  ) : (
                    item.icon
                  )
                }
              />
            </View>
          ))}
        </View>
      </View>
    );
  };
  const title =
    detail === 'bhog'
      ? label('भोग और नैवेद्य', 'Food offerings')
      : detail === 'giving'
        ? label('दान कथाएँ', 'Stories of giving')
        : features
          ? label('सभी सुविधाएँ', 'All features')
          : label('पुस्तकालय', 'Library');
  const rows = detail ? (detail === 'bhog' ? bhog : giving) : term ? searchRows() : undefined;
  return (
    <View style={styles.root}>
      <CatalogBackground />
      <SafeAreaView style={styles.root} edges={['top', 'left', 'right']}>
        <ReaderHeader title={title} onBack={() => (detail ? setDetail(undefined) : navigation.goBack())} />
        <ScrollView
          key={detail || 'catalog'}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: 40 }}
        >
          {!detail && (
            <TextField
              testID="reading-library-search"
              value={query}
              onChangeText={setQuery}
              placeholder={label('पाठ, कथा या संग्रह खोजें', 'Search readings and collections')}
              style={{ minHeight: 44 }}
            />
          )}
          {rows ? (
            <>
              {rows.map((r, i) => (
                <ListingCard
                  thumbnail={<CategoryIcon iconKey="granth" />}
                  meta={null}
                  key={r.en + i}
                  language={lang}
                  title={label(r.hi, r.en)}
                  onPress={r.open}
                />
              ))}
              {!detail && (
                <ListingCard
                  thumbnail={<CategoryIcon iconKey="purpose" />}
                  meta={null}
                  title={label('पूरे ऐप में खोजें', 'Search the whole app')}
                  language={lang}
                  onPress={() => navigation.navigate('Search', { initialQuery: query.trim() })}
                />
              )}
            </>
          ) : (
            <>
              {features && group('सभी सुविधाएँ', 'All features', tools)}
              {group('ग्रन्थ और कथा', 'Books and kathas', [books, kathas], true)}
              {group('नित्य पाठ', 'Daily recitation', recite)}
              {group('कथाएँ और परिचय', 'Stories and learning', learning)}
              {group('विधि और परंपरा', 'Rituals and traditions', rituals)}
              {features && (
                <>
                  <TodayRecommendationsRow />
                  <DeityDayLinks />
                </>
              )}
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
const styles = StyleSheet.create({
  root: { flex: 1 },
  group: { marginTop: 20, gap: 10 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
});
