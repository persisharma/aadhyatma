import React, { useMemo, useState } from 'react';
import {
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '@/theme/ThemeContext';
import { useGitaLanguage } from '@/data/gita/language';
import LanguageToggle from '@/components/LanguageToggle';
import IndiaMap, { type IndiaMapPin } from '@/components/IndiaMap';
import {
  temples,
  templesInGroup,
  otherFamous,
  groupMeta,
  groupOrder,
  type TempleEntry,
  type TheerthGroup,
} from '@/data/theerth/temples';
import type { HomeStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<HomeStackParamList, 'TheerthMap'>;
type Lang = 'hi' | 'en';
type ListMode = 'category' | 'state';
type CategoryKey = TheerthGroup | 'other';

const CATEGORY_KEYS: readonly CategoryKey[] = [...groupOrder, 'other'];

function categoryTemples(key: CategoryKey): TempleEntry[] {
  return key === 'other' ? otherFamous() : templesInGroup(key);
}

function categoryLabel(key: CategoryKey, lang: Lang): string {
  if (key === 'other') return lang === 'hi' ? 'अन्य प्रसिद्ध तीर्थ' : 'Other Famous Temples';
  const m = groupMeta[key];
  return lang === 'hi' ? m.nameHi : m.nameEn;
}

const stateName = (t: TempleEntry, lang: Lang) => (lang === 'hi' ? t.stateHi : t.stateEn);
const templeName = (t: TempleEntry, lang: Lang) => (lang === 'hi' ? t.nameHi : t.nameEn);
const templeCity = (t: TempleEntry, lang: Lang) =>
  lang === 'hi' ? `${t.cityHi}, ${t.stateHi}` : `${t.cityEn}, ${t.stateEn}`;

export default function TheerthMapScreen({ navigation, route }: Props) {
  const { colors, typography, spacing, radii } = useTheme();
  const { lang } = useGitaLanguage();
  const group = route.params?.group as CategoryKey | undefined;
  const stateEn = route.params?.stateEn;
  const isDrill = !!group || !!stateEn;

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[colors.parchmentHighlight, colors.parchmentGradientEnd]}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <TopBar
          title={
            isDrill
              ? group
                ? categoryLabel(group, lang)
                : drillStateTitle(stateEn!, lang)
              : lang === 'hi'
                ? 'तीर्थ'
                : 'Theerth'
          }
          onBack={() => navigation.goBack()}
          colors={colors}
          typography={typography}
        />
        {isDrill ? (
          <DrillIn
            group={group}
            stateEn={stateEn}
            lang={lang}
            colors={colors}
            typography={typography}
            radii={radii}
            spacing={spacing}
            onTemplePress={(id) => navigation.navigate('TheerthDetail', { templeId: id })}
          />
        ) : (
          <Listing
            lang={lang}
            colors={colors}
            typography={typography}
            radii={radii}
            spacing={spacing}
            onOpenCategory={(key) => navigation.push('TheerthMap', { group: key })}
            onOpenState={(s) => navigation.push('TheerthMap', { stateEn: s })}
          />
        )}
      </SafeAreaView>
    </View>
  );
}

function drillStateTitle(stateEn: string, lang: Lang): string {
  const t = temples.find((x) => x.stateEn === stateEn);
  return t ? stateName(t, lang) : stateEn;
}

type ThemeBits = {
  colors: ReturnType<typeof useTheme>['colors'];
  typography: ReturnType<typeof useTheme>['typography'];
  radii: ReturnType<typeof useTheme>['radii'];
  spacing: ReturnType<typeof useTheme>['spacing'];
};

function TopBar({
  title,
  onBack,
  colors,
  typography,
}: {
  title: string;
  onBack: () => void;
  colors: ThemeBits['colors'];
  typography: ThemeBits['typography'];
}) {
  return (
    <>
      <View style={styles.topBar}>
        <Pressable
          onPress={onBack}
          accessibilityRole="button"
          accessibilityLabel="Back"
          hitSlop={16}
          style={({ pressed }) => [
            styles.backBtn,
            { backgroundColor: colors.parchmentSoft, borderColor: colors.divider },
            pressed && { opacity: 0.7 },
          ]}
        >
          <Text style={{ color: colors.inkSoft, fontSize: 18 }}>{'‹'}</Text>
        </Pressable>
        <Text
          numberOfLines={1}
          style={{
            fontFamily: typography.readerTitle.fontFamily,
            fontSize: typography.readerTitle.fontSize,
            color: colors.ink,
            maxWidth: 220,
          }}
        >
          {title}
        </Text>
        <View style={styles.backBtnSpacer} />
      </View>
      {/* Language toggle at the top, consistent across every Theerth screen. */}
      <View style={styles.langRow}>
        <LanguageToggle />
      </View>
    </>
  );
}

/** Pilgrimage listing: By Category / By State cards. No map, no add-to-routine. */
function Listing({
  lang,
  colors,
  typography,
  radii,
  spacing,
  onOpenCategory,
  onOpenState,
}: {
  lang: Lang;
  onOpenCategory: (key: CategoryKey) => void;
  onOpenState: (stateEn: string) => void;
} & ThemeBits) {
  const [mode, setMode] = useState<ListMode>('category');

  const categoryCards = useMemo(
    () =>
      CATEGORY_KEYS.map((key) => ({ key, label: categoryLabel(key, lang), count: categoryTemples(key).length }))
        .filter((c) => c.count > 0),
    [lang],
  );

  const stateCards = useMemo(() => {
    const map = new Map<string, TempleEntry[]>();
    temples.forEach((t) => {
      if (!map.has(t.stateEn)) map.set(t.stateEn, []);
      map.get(t.stateEn)!.push(t);
    });
    return [...map.entries()]
      .map(([key, list]) => ({ key, label: stateName(list[0], lang), count: list.length }))
      .sort((a, b) => a.key.localeCompare(b.key));
  }, [lang]);

  return (
    <ScrollView
      contentContainerStyle={[styles.scroll, { paddingHorizontal: spacing.xxl, paddingBottom: spacing.xxl * 2 }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.viewToggleRow}>
        <ModeToggle mode={mode} onChange={setMode} lang={lang} colors={colors} typography={typography} radii={radii} />
      </View>
      {(mode === 'category' ? categoryCards : stateCards).map((c) => (
        <BrowseCard
          key={c.key}
          glyph={mode === 'category' ? '॥' : 'ॐ'}
          name={c.label}
          meta={`${c.count} ${lang === 'hi' ? 'तीर्थ' : 'temples'}`}
          colors={colors}
          typography={typography}
          radii={radii}
          onPress={() => (mode === 'category' ? onOpenCategory(c.key as CategoryKey) : onOpenState(c.key))}
        />
      ))}
    </ScrollView>
  );
}

/** Drill-in: real India map (scoped) + a flat list of just this subsection. */
function DrillIn({
  group,
  stateEn,
  lang,
  colors,
  typography,
  radii,
  spacing,
  onTemplePress,
}: {
  group?: CategoryKey;
  stateEn?: string;
  lang: Lang;
  onTemplePress: (id: string) => void;
} & ThemeBits) {
  const list = useMemo<TempleEntry[]>(() => {
    const base = group ? categoryTemples(group) : temples.filter((t) => t.stateEn === stateEn);
    return [...base].sort((a, b) => templeName(a, lang).localeCompare(templeName(b, lang)));
  }, [group, stateEn, lang]);

  const screenWidth = Dimensions.get('window').width;
  const mapWidth = Math.min(screenWidth - 2 * spacing.xxl, 320);

  const pins: IndiaMapPin[] = useMemo(
    () =>
      list.map((t) => ({
        id: t.id,
        lat: t.coordinates.lat,
        lng: t.coordinates.lng,
        label: templeName(t, lang),
      })),
    [list, lang],
  );

  return (
    <ScrollView
      contentContainerStyle={[styles.scroll, { paddingHorizontal: spacing.xxl, paddingBottom: spacing.xxl * 2 }]}
      showsVerticalScrollIndicator={false}
    >
      <IndiaMap
        pins={pins}
        width={mapWidth}
        onPinPress={onTemplePress}
        highlightStateEn={stateEn}
      />
      <Text
        style={[
          styles.hint,
          {
            color: colors.inkMuted,
            fontFamily: typography.swipeHint.fontFamily,
            fontSize: typography.swipeHint.fontSize,
            marginTop: spacing.lg,
            marginBottom: spacing.lg,
          },
        ]}
      >
        {lang === 'hi' ? 'पिन छूकर मंदिर की कथा पढ़ें' : 'Tap a pin to read the temple’s story'}
      </Text>
      {list.map((temple) => (
        <BrowseCard
          key={temple.id}
          glyph="ॐ"
          name={templeName(temple, lang)}
          meta={templeCity(temple, lang)}
          colors={colors}
          typography={typography}
          radii={radii}
          onPress={() => onTemplePress(temple.id)}
        />
      ))}
    </ScrollView>
  );
}

function ModeToggle({
  mode,
  onChange,
  lang,
  colors,
  typography,
  radii,
}: {
  mode: ListMode;
  onChange: (next: ListMode) => void;
  lang: Lang;
} & Omit<ThemeBits, 'spacing'>) {
  const options: { value: ListMode; hi: string; en: string }[] = [
    { value: 'state', hi: 'राज्य', en: 'By State' },
    { value: 'category', hi: 'श्रेणी', en: 'By Category' },
  ];
  return (
    <View
      style={[toggleStyles.group, { backgroundColor: colors.parchmentSoft, borderColor: colors.divider, borderRadius: radii.pill }]}
      accessibilityRole="radiogroup"
    >
      {options.map((opt) => {
        const selected = mode === opt.value;
        return (
          <Pressable
            key={opt.value}
            onPress={() => onChange(opt.value)}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            hitSlop={6}
            style={({ pressed }) => [
              toggleStyles.half,
              { backgroundColor: selected ? colors.saffronTint : 'transparent', borderRadius: radii.pill },
              pressed && !selected && { opacity: 0.7 },
            ]}
          >
            <Text
              style={{
                fontFamily: lang === 'hi' ? typography.cardHindi.fontFamily : typography.cardLatin.fontFamily,
                fontSize: 12,
                fontStyle: lang === 'en' ? 'italic' : 'normal',
                color: selected ? colors.saffronDeep : colors.inkMuted,
              }}
            >
              {lang === 'hi' ? opt.hi : opt.en}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function BrowseCard({
  glyph,
  name,
  meta,
  colors,
  typography,
  radii,
  onPress,
}: {
  glyph: string;
  name: string;
  meta: string;
  onPress: () => void;
} & Omit<ThemeBits, 'spacing'>) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={name}
      style={({ pressed }) => [
        rowStyles.card,
        { backgroundColor: colors.parchmentSoft, borderColor: colors.divider, borderRadius: radii.md },
        pressed && { opacity: 0.85 },
      ]}
    >
      <View style={[rowStyles.thumb, { backgroundColor: colors.cardThumbActiveFrom, borderRadius: radii.sm }]}>
        <Text style={{ fontFamily: typography.thumb.fontFamily, fontSize: 18, color: colors.parchmentSoft }}>
          {glyph}
        </Text>
      </View>
      <View style={rowStyles.textColumn}>
        <Text
          numberOfLines={1}
          style={{
            fontFamily: typography.cardHindi.fontFamily,
            fontSize: 17,
            color: colors.ink,
          }}
        >
          {name}
        </Text>
        <Text
          numberOfLines={1}
          style={{
            color: colors.inkMuted,
            fontFamily: typography.cardLatin.fontFamily,
            fontSize: 12,
            marginTop: 2,
            fontStyle: 'italic',
          }}
        >
          {meta}
        </Text>
      </View>
      <Text style={{ color: colors.saffron, fontSize: 22, marginLeft: 8 }}>{'›'}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 14,
    paddingBottom: 14,
  },
  backBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtnSpacer: { width: 34, height: 34 },
  langRow: { alignItems: 'center', paddingTop: 2, paddingBottom: 10 },
  viewToggleRow: { alignItems: 'center', paddingBottom: 14, paddingTop: 2 },
  scroll: { paddingTop: 4 },
  hint: { textAlign: 'center', fontStyle: 'italic', includeFontPadding: false },
});

const toggleStyles = StyleSheet.create({
  group: { flexDirection: 'row', borderWidth: 1, padding: 3, alignSelf: 'center' },
  half: { minWidth: 100, paddingVertical: 7, paddingHorizontal: 16, alignItems: 'center', justifyContent: 'center' },
});

const rowStyles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', padding: 14, borderWidth: 1, marginBottom: 10 },
  thumb: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  textColumn: { flex: 1 },
});
