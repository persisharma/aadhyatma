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
import { fontFamilies } from '@/theme/typography';
import { useGitaLanguage, type Lang } from '@/data/gita/language';
import { contentByLang, pick } from '@/utils/localize';
import { cardFontByLang, isLatinLang, scriptBodyFont } from '@/utils/langType';
import { useNewContent, templeNewKey } from '@/contexts/NewContentContext';
import BackgroundLayer from '@/components/BackgroundLayer';
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
import { useTourTarget } from '@/components/tour/tourTargets';

type Props = NativeStackScreenProps<HomeStackParamList, 'TheerthMap'>;
type ListMode = 'category' | 'state';
type CategoryKey = TheerthGroup | 'other';

const CATEGORY_KEYS: readonly CategoryKey[] = [...groupOrder, 'other'];

function categoryTemples(key: CategoryKey): TempleEntry[] {
  return key === 'other' ? otherFamous() : templesInGroup(key);
}

function categoryLabel(key: CategoryKey, lang: Lang): string {
  if (key === 'other')
    return pick(lang, {
      hi: 'अन्य प्रसिद्ध तीर्थ',
      en: 'Other Famous Temples',
      gu: 'અન્ય પ્રસિદ્ધ તીર્થ',
      kn: 'ಇತರ ಪ್ರಸಿದ್ಧ ತೀರ್ಥ',
    });
  const m = groupMeta[key];
  return contentByLang(lang, m.nameHi, m.nameEn);
}

const stateName = (t: TempleEntry, lang: Lang) => contentByLang(lang, t.stateHi, t.stateEn);
const templeName = (t: TempleEntry, lang: Lang) => contentByLang(lang, t.nameHi, t.nameEn);
const templeCity = (t: TempleEntry, lang: Lang) =>
  `${contentByLang(lang, t.cityHi, t.cityEn)}, ${contentByLang(lang, t.stateHi, t.stateEn)}`;

export default function TheerthMapScreen({ navigation, route }: Props) {
  const { colors, typography, spacing, radii } = useTheme();
  const { lang } = useGitaLanguage();
  const { isNew, markSeen } = useNewContent();
  // Feature-tour anchor for the Theerth "inside" step (design.md §47).
  const theerthInsideRef = useTourTarget('theerthInside');
  const group = route.params?.group as CategoryKey | undefined;
  const stateEn = route.params?.stateEn;
  const isDrill = !!group || !!stateEn;

  // Opening a temple acknowledges its NEW chip, mirroring how opening a text
  // markSeen()s a LibraryCard before navigating.
  const handleTemplePress = (id: string) => {
    markSeen(templeNewKey(id));
    navigation.navigate('TheerthDetail', { templeId: id });
  };
  const isTempleNew = (id: string) => isNew(templeNewKey(id));

  return (
    <View style={styles.root}>
      {/* No decorative image backdrop on Theerth: the busy books/japa-mala sketch
          showed through behind the transparent India map and camouflaged the
          saffron outline + pins. A flat parchment gradient keeps the map legible. */}
      <BackgroundLayer source={null} />
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <TopBar
          title={
            isDrill
              ? group
                ? categoryLabel(group, lang)
                : drillStateTitle(stateEn!, lang)
              : pick(lang, { hi: 'तीर्थ', en: 'Theerth', gu: 'તીર્થ', kn: 'ತೀರ್ಥ' })
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
            isTempleNew={isTempleNew}
            onTemplePress={handleTemplePress}
          />
        ) : (
          <Listing
            lang={lang}
            colors={colors}
            typography={typography}
            radii={radii}
            spacing={spacing}
            isTempleNew={isTempleNew}
            firstCardRef={theerthInsideRef}
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
  isTempleNew,
  firstCardRef,
  onOpenCategory,
  onOpenState,
}: {
  lang: Lang;
  isTempleNew: (id: string) => boolean;
  firstCardRef?: React.Ref<View>;
  onOpenCategory: (key: CategoryKey) => void;
  onOpenState: (stateEn: string) => void;
} & ThemeBits) {
  const [mode, setMode] = useState<ListMode>('category');

  // A browse card flags NEW when any temple it leads to is still unseen — the
  // group/state equivalent of LibraryCard's per-text chip.
  const categoryCards = useMemo(
    () =>
      CATEGORY_KEYS.map((key) => {
        const list = categoryTemples(key);
        return { key, label: categoryLabel(key, lang), count: list.length, hasNew: list.some((t) => isTempleNew(t.id)) };
      }).filter((c) => c.count > 0),
    [lang, isTempleNew],
  );

  const stateCards = useMemo(() => {
    const map = new Map<string, TempleEntry[]>();
    temples.forEach((t) => {
      if (!map.has(t.stateEn)) map.set(t.stateEn, []);
      map.get(t.stateEn)!.push(t);
    });
    return [...map.entries()]
      .map(([key, list]) => ({
        key,
        label: stateName(list[0], lang),
        count: list.length,
        hasNew: list.some((t) => isTempleNew(t.id)),
      }))
      .sort((a, b) => a.key.localeCompare(b.key));
  }, [lang, isTempleNew]);

  return (
    <ScrollView
      contentContainerStyle={[styles.scroll, { paddingHorizontal: spacing.xxl, paddingBottom: spacing.xxl * 2 }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.viewToggleRow}>
        <ModeToggle mode={mode} onChange={setMode} lang={lang} colors={colors} typography={typography} radii={radii} />
      </View>
      {(mode === 'category' ? categoryCards : stateCards).map((c, i) => {
        const card = (
          <BrowseCard
            glyph={mode === 'category' ? '॥' : 'ॐ'}
            name={c.label}
            meta={`${c.count} ${pick(lang, { hi: 'तीर्थ', en: 'temples', gu: 'તીર્થ', kn: 'ತೀರ್ಥ' })}`}
            hasNew={c.hasNew}
            lang={lang}
            colors={colors}
            typography={typography}
            radii={radii}
            onPress={() => (mode === 'category' ? onOpenCategory(c.key as CategoryKey) : onOpenState(c.key))}
          />
        );
        return i === 0 ? (
          <View key={c.key} ref={firstCardRef} collapsable={false}>
            {card}
          </View>
        ) : (
          <React.Fragment key={c.key}>{card}</React.Fragment>
        );
      })}
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
  isTempleNew,
  onTemplePress,
}: {
  group?: CategoryKey;
  stateEn?: string;
  lang: Lang;
  isTempleNew: (id: string) => boolean;
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
        {pick(lang, {
          hi: 'पिन छूकर मंदिर की कथा पढ़ें',
          en: 'Tap a pin to read the temple’s story',
          gu: 'પિન સ્પર્શ કરી મંદિરની કથા વાંચો',
          kn: 'ಪಿನ್ ಸ್ಪರ್ಶಿಸಿ ದೇವಸ್ಥಾನದ ಕಥೆ ಓದಿ',
        })}
      </Text>
      {list.map((temple) => (
        <BrowseCard
          key={temple.id}
          glyph="ॐ"
          name={templeName(temple, lang)}
          meta={templeCity(temple, lang)}
          hasNew={isTempleNew(temple.id)}
          lang={lang}
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
                fontFamily: cardFontByLang(lang),
                fontSize: isLatinLang(lang) ? 14 : 15,
                fontStyle: lang === 'en' ? 'italic' : 'normal',
                color: selected ? colors.saffronDeep : colors.inkMuted,
              }}
            >
              {contentByLang(lang, opt.hi, opt.en)}
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
  hasNew,
  lang,
  colors,
  typography,
  radii,
  onPress,
}: {
  glyph: string;
  name: string;
  meta: string;
  hasNew?: boolean;
  lang: Lang;
  onPress: () => void;
} & Omit<ThemeBits, 'spacing'>) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={hasNew ? `${name}. New.` : name}
      style={({ pressed }) => [
        rowStyles.card,
        {
          // Match the active LibraryCard treatment used across other sections:
          // warm gradient fill (below), saffron-tinted border, lifted shadow.
          borderColor: colors.cardActiveBorder,
          borderRadius: radii.lg,
          shadowColor: '#3C1E0A',
          shadowOpacity: 0.14,
          shadowRadius: 16,
          shadowOffset: { width: 0, height: 6 },
          elevation: 4,
        },
        pressed && { opacity: 0.85 },
      ]}
    >
      <LinearGradient
        colors={[colors.cardActiveFrom, colors.cardActiveTo]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[rowStyles.cardBg, { borderRadius: radii.lg }]}
      />
      <LinearGradient
        colors={[colors.cardThumbActiveFrom, colors.cardThumbActiveTo]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[rowStyles.thumb, { borderRadius: radii.sm }]}
      >
        <Text style={{ fontFamily: typography.thumb.fontFamily, fontSize: 18, color: colors.parchmentSoft }}>
          {glyph}
        </Text>
      </LinearGradient>
      <View style={rowStyles.textColumn}>
        <Text
          numberOfLines={1}
          style={{
            // Card titles follow the active language's face (design.md §type-scale):
            // Devanagari for hi; Cormorant Bold for en, sized a step up + 0.3 tracking
            // so the lighter Latin face reads at parity with the denser Devanagari.
            fontFamily:
              lang === 'gu'
                ? fontFamilies.gujaratiBold
                : lang === 'kn'
                  ? fontFamilies.kannadaBold
                  : lang === 'hi'
                    ? typography.cardHindi.fontFamily
                    : fontFamilies.latinBold,
            fontSize: isLatinLang(lang) ? 19 : 17,
            letterSpacing: lang === 'en' ? 0.3 : undefined,
            color: colors.ink,
          }}
        >
          {name}
        </Text>
        <Text
          numberOfLines={1}
          style={{
            color: colors.inkMuted,
            // §46 meta convention: script serif for Indic (Inter has no Indic
            // glyphs) and tracking only on Latin — spacing splits the shirorekha.
            fontFamily: scriptBodyFont(lang, isLatinLang(lang) ? typography.cardMeta.fontFamily : fontFamilies.devanagari),
            fontSize: typography.cardMeta.fontSize,
            letterSpacing: isLatinLang(lang) ? typography.cardMeta.letterSpacing : 0,
            opacity: 0.9,
            marginTop: 3,
          }}
        >
          {meta}
        </Text>
      </View>
      <Text style={{ color: colors.saffron, fontSize: 22, marginLeft: 8 }}>{'›'}</Text>
      {hasNew ? (
        <View
          style={[rowStyles.badge, { backgroundColor: colors.newBadgeBg, borderRadius: radii.pill }]}
          pointerEvents="none"
        >
          <Text style={[rowStyles.badgeText, { color: colors.newBadgeText, letterSpacing: 1.6 }]}>
            NEW
          </Text>
        </View>
      ) : null}
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
  half: { minWidth: 100, minHeight: 44, paddingVertical: 11, paddingHorizontal: 18, alignItems: 'center', justifyContent: 'center' },
});

const rowStyles = StyleSheet.create({
  card: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderWidth: 1,
    marginBottom: 10,
    overflow: 'hidden',
  },
  cardBg: { ...StyleSheet.absoluteFillObject },
  thumb: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  textColumn: { flex: 1 },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
});
