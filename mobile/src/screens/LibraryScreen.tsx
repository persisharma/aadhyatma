/**
 * पाठ — the library index, pushed from Home's पाठ row (TRD-42 §5.3).
 *
 * This holds what used to be Home's CATEGORIES grid. The grid sorted texts by
 * literary FORM — चालीसा, अष्टकम्, सूक्तम् — which is a librarian's axis, not a
 * devotee's, and it gave सूक्तम् (3 texts) the same weight as the whole vrat
 * engine while pushing the almanac features below two screenfuls.
 *
 * So the two axes a devotee actually thinks in come first here — देवता and
 * उद्देश्य — and the forms follow with their real counts.
 */
import React, { useMemo } from 'react';
import { Dimensions, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '@/theme/ThemeContext';
import { fontFamilies } from '@/theme/typography';
import { useGitaLanguage } from '@/data/gita/language';
import { contentByLang } from '@/utils/localize';
import { pillTextStyle, scriptTitleFont } from '@/utils/langType';
import { categories } from '@/data/categories';
import { deities } from '@/data/deities';
import { purposes } from '@/data/purposes';
import { libraryCounts } from '@/data/libraryCounts';
import ReaderHeader from '@/components/ReaderHeader';
import CategoryCard from '@/components/CategoryCard';
import CategoryIcon from '@/components/CategoryIcon';
import DeityIcon from '@/components/DeityIcon';
import { useNewContent } from '@/contexts/NewContentContext';
import { useTilePressController, TilePressProvider } from '@/contexts/TilePressContext';
import type { ContentCategory } from '@/data/texts';
import type { HomeStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<HomeStackParamList, 'Library'>;

/** How many deity avatars ride the rail before the "+N और" chip. */
const DEITY_RAIL_LIMIT = 8;

export default function LibraryScreen({ navigation }: Props) {
  const { colors, typography, spacing, radii, elevation } = useTheme();
  const { lang } = useGitaLanguage();
  const { hasNewInCategory } = useNewContent();

  // The whole screen shares Home's first-tap controller: these cards live in a
  // ScrollView, and iOS can cancel a child Pressable's onPress without a real
  // drag (design.md §18).
  const tilePress = useTilePressController();
  const { beginTilePress, markTileDrag, finishTilePress, activateTile } = tilePress;

  const counts = useMemo(() => libraryCounts(), []);
  const railDeities = deities.slice(0, DEITY_RAIL_LIMIT);
  const remainingDeities = deities.length - railDeities.length;

  const screenWidth = Dimensions.get('window').width;
  const gridGap = 10;
  const tileWidth = (screenWidth - 2 * spacing.xxl - 2 * gridGap) / 3;

  const openCategory = (id: ContentCategory) => () =>
    id === 'theerth'
      ? navigation.navigate('TheerthMap', {})
      : navigation.navigate('CategoryList', { categoryId: id });

  const sectionLabel = (hi: string, en: string) => (
    <Text
      style={[
        styles.sectionLabel,
        pillTextStyle(lang, typography.sectionLabel),
        { color: colors.inkMuted },
      ]}
    >
      {contentByLang(lang, hi, en)}
    </Text>
  );

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[colors.parchmentHighlight, colors.parchmentGradientEnd]}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <TilePressProvider value={tilePress}>
          <ReaderHeader
            variant="index"
            title={contentByLang(lang, 'पाठ', 'Library')}
            onBack={() => navigation.goBack()}
          />
          <ScrollView
            contentContainerStyle={[
              styles.scroll,
              { paddingHorizontal: spacing.xxl, paddingBottom: spacing.xxl * 3 },
            ]}
            showsVerticalScrollIndicator={false}
            onScrollBeginDrag={markTileDrag}
          >
            {/* Search is the fastest path to a named text, so it leads. */}
            <Pressable
              onPress={() => navigation.navigate('Search')}
              accessibilityRole="button"
              accessibilityLabel="Search the library"
              style={({ pressed }) => [
                styles.search,
                {
                  borderRadius: radii.md,
                  backgroundColor: colors.parchmentSoft,
                  borderColor: colors.cardActiveBorder,
                  paddingHorizontal: spacing.md,
                },
                elevation.subtle,
                pressed && { opacity: 0.8 },
              ]}
            >
              <Text style={{ color: colors.saffron, fontSize: 16 }}>⌕</Text>
              <Text
                style={{
                  flex: 1,
                  color: colors.inkMuted,
                  fontFamily: scriptTitleFont(lang, fontFamilies.devanagari),
                  fontSize: 14,
                }}
                numberOfLines={1}
              >
                {contentByLang(lang, 'खोजें — हनुमान, गीता, शांति…', 'Search — Hanuman, Gita, peace…')}
              </Text>
            </Pressable>

            {sectionLabel('देवता', 'By deity')}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ marginHorizontal: -spacing.xxl }}
              contentContainerStyle={{ paddingHorizontal: spacing.xxl, gap: 12, paddingVertical: 4 }}
              onScrollBeginDrag={markTileDrag}
            >
              {railDeities.map((deity) => {
                const press = () => navigation.navigate('DeityDetail', { deityId: deity.id });
                return (
                  <Pressable
                    key={deity.id}
                    onPress={() => activateTile(press)}
                    onPressIn={() => beginTilePress(press)}
                    onPressOut={finishTilePress}
                    accessibilityRole="button"
                    accessibilityLabel={`${deity.nameEn}. Tap to open.`}
                    style={({ pressed }) => [styles.deity, pressed && { opacity: 0.75 }]}
                  >
                    <View
                      style={[
                        styles.deityDisc,
                        { backgroundColor: colors.cardThumbRest, borderColor: colors.cardActiveBorder },
                      ]}
                    >
                      <DeityIcon iconKey={deity.iconKey} fallbackText={deity.nameHi.slice(0, 1)} size={30} />
                    </View>
                    <Text
                      style={[
                        styles.deityLabel,
                        { color: colors.inkSoft, fontFamily: scriptTitleFont(lang, fontFamilies.devanagari) },
                      ]}
                      numberOfLines={1}
                    >
                      {contentByLang(lang, deity.nameHi, deity.nameEn)}
                    </Text>
                  </Pressable>
                );
              })}
              {remainingDeities > 0 ? (
                <Pressable
                  onPress={() => navigation.navigate('DeityIndex')}
                  accessibilityRole="button"
                  accessibilityLabel={`All ${deities.length} deities`}
                  style={({ pressed }) => [styles.deity, pressed && { opacity: 0.75 }]}
                >
                  <View
                    style={[
                      styles.deityDisc,
                      { backgroundColor: colors.parchmentSoft, borderColor: colors.cardActiveBorder },
                    ]}
                  >
                    <Text style={{ color: colors.saffronDeep, fontFamily: fontFamilies.interSemiBold, fontSize: 13 }}>
                      +{remainingDeities}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.deityLabel,
                      { color: colors.inkSoft, fontFamily: scriptTitleFont(lang, fontFamilies.devanagari) },
                    ]}
                    numberOfLines={1}
                  >
                    {contentByLang(lang, 'और', 'More')}
                  </Text>
                </Pressable>
              ) : null}
            </ScrollView>

            {sectionLabel('उद्देश्य', 'By purpose')}
            <View style={styles.purposes}>
              {purposes.map((purpose) => (
                <Pressable
                  key={purpose.id}
                  onPress={() => navigation.navigate('PurposeList', { purposeId: purpose.id })}
                  accessibilityRole="button"
                  accessibilityLabel={`${purpose.nameEn}. Tap to open.`}
                  style={({ pressed }) => [
                    styles.purpose,
                    {
                      borderRadius: radii.pill,
                      backgroundColor: colors.saffronTint,
                      borderColor: colors.cardActiveBorder,
                    },
                    pressed && { opacity: 0.75 },
                  ]}
                >
                  <Text
                    style={{
                      color: colors.saffronDeep,
                      fontFamily: scriptTitleFont(lang, fontFamilies.devanagari),
                      fontSize: 12.5,
                    }}
                  >
                    {contentByLang(lang, purpose.nameHi, purpose.nameEn)}
                  </Text>
                </Pressable>
              ))}
            </View>

            {sectionLabel('पाठ के प्रकार', 'By form')}
            <View style={[styles.grid, { gap: gridGap }]}>
              {categories.map((category) => {
                const press = openCategory(category.id);
                const count = counts[category.id];
                return (
                  <View key={category.id} style={{ width: tileWidth }}>
                    <CategoryCard
                      nameHi={category.nameHi}
                      nameEn={category.nameEn}
                      displayNameEn={category.shortNameEn}
                      status={category.status}
                      icon={<CategoryIcon iconKey={category.id} />}
                      onPress={() => activateTile(press)}
                      onPressIn={() => beginTilePress(press)}
                      onPressOut={finishTilePress}
                      hasNew={category.status === 'active' ? hasNewInCategory(category.id) : undefined}
                      variant="launcher"
                    />
                    {count ? (
                      <Text
                        style={[styles.count, { color: colors.saffronDeep }]}
                        numberOfLines={1}
                      >
                        {count}
                      </Text>
                    ) : null}
                  </View>
                );
              })}
            </View>

            {/* संग्रह and भजन close the grid so everything readable or listenable
                has one index. Wishlist is registered on this stack too, so Back
                returns here rather than dropping the user on the More tab. */}
            <View style={[styles.grid, styles.tailGrid, { gap: gridGap }]}>
              <View style={{ width: tileWidth }}>
                <CategoryCard
                  nameHi="संग्रह"
                  nameEn="Wishlist"
                  status="active"
                  icon={<CategoryIcon iconKey="stotram" />}
                  onPress={() => activateTile(() => navigation.navigate('Wishlist'))}
                  onPressIn={() => beginTilePress(() => navigation.navigate('Wishlist'))}
                  onPressOut={finishTilePress}
                  variant="launcher"
                />
              </View>
            </View>
          </ScrollView>
        </TilePressProvider>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  scroll: { paddingTop: 4 },
  search: { flexDirection: 'row', alignItems: 'center', gap: 8, height: 44, borderWidth: 1, marginTop: 8 },
  sectionLabel: { paddingHorizontal: 4, marginTop: 18, marginBottom: 8 },
  deity: { width: 58, alignItems: 'center', gap: 5 },
  deityDisc: { width: 50, height: 50, borderRadius: 25, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  deityLabel: { fontSize: 10.5 },
  purposes: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  purpose: { borderWidth: 1, paddingHorizontal: 11, paddingVertical: 6 },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  tailGrid: { marginTop: 10 },
  count: { fontFamily: fontFamilies.interSemiBold, fontSize: 10.5, textAlign: 'center', marginTop: 2 },
});
