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
  groupMeta,
  groupOrder,
  type TempleEntry,
  type TheerthGroup,
} from '@/data/theerth/temples';
import { library } from '@/data/texts';
import type { HomeStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<HomeStackParamList, 'TheerthMap'>;
type ViewMode = 'state' | 'category';
type GroupFilter = TheerthGroup | 'all';

// The library entry the user came from scopes which temples show. There is no
// in-screen filter anymore — the Home category / CategoryList already picks the
// set (PRD-08 refinement), so the only in-screen control is the State/Category
// grouping toggle.
const ENTRY_TO_FILTER: Record<string, GroupFilter> = {
  'dvadasha-jyotirlinga': 'jyotirlinga',
  'char-dham': 'char-dham',
  'chota-char-dham': 'chota-char-dham',
  'shakti-peeth': 'shakti-peeth',
  'famous-theerth': 'all',
};

export default function TheerthMapScreen({ navigation, route }: Props) {
  const { colors, typography, spacing, radii } = useTheme();
  const { lang } = useGitaLanguage();
  const theerthId = route.params?.theerthId;
  const entry = useMemo(
    () => (theerthId ? library.find((e) => e.id === theerthId) : undefined),
    [theerthId],
  );
  const filter: GroupFilter = theerthId ? ENTRY_TO_FILTER[theerthId] ?? 'all' : 'all';

  const [mode, setMode] = useState<ViewMode>('state');
  // By-State view: which state's region is highlighted on the map.
  const [focusedState, setFocusedState] = useState<string | null>(null);

  const screenWidth = Dimensions.get('window').width;
  const mapWidth = Math.min(screenWidth - 2 * spacing.xxl, 320);

  const filteredTemples = useMemo<readonly TempleEntry[]>(() => {
    if (filter === 'all') return temples;
    return temples.filter((t) => t.groups.includes(filter));
  }, [filter]);

  const pins: IndiaMapPin[] = useMemo(
    () =>
      filteredTemples.map((t) => ({
        id: t.id,
        lat: t.coordinates.lat,
        lng: t.coordinates.lng,
        label: lang === 'hi' ? t.nameHi : t.nameEn,
      })),
    [filteredTemples, lang],
  );

  const stateSections = useMemo(
    () => groupByState(filteredTemples, lang),
    [filteredTemples, lang],
  );
  const categorySections = useMemo(
    () => buildCategorySections(filteredTemples, lang),
    [filteredTemples, lang],
  );

  const handleTemplePress = (id: string) => {
    navigation.navigate('TheerthDetail', { templeId: id });
  };

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[colors.parchmentHighlight, colors.parchmentGradientEnd]}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <View style={[styles.topBar, { paddingHorizontal: spacing.xxl }]}>
          <Pressable
            onPress={() => navigation.goBack()}
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
            {entry ? (lang === 'hi' ? entry.nameHi : entry.nameEn) : lang === 'hi' ? 'तीर्थ' : 'Theerth'}
          </Text>
          <View style={styles.backBtnSpacer} />
        </View>

        <View style={styles.toggleRow}>
          <LanguageToggle />
        </View>

        <ScrollView
          contentContainerStyle={[
            styles.scroll,
            { paddingHorizontal: spacing.xxl, paddingBottom: spacing.xxl * 2 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* The real India map is the hero — always visible, above the toggle. */}
          <IndiaMap
            pins={pins}
            width={mapWidth}
            onPinPress={handleTemplePress}
            highlightStateEn={mode === 'state' ? focusedState ?? undefined : undefined}
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
            {lang === 'hi'
              ? 'पिन छूकर मंदिर की कथा पढ़ें'
              : 'Tap a pin to read the temple’s story'}
          </Text>

          <View style={styles.viewToggleRow}>
            <ViewToggle
              mode={mode}
              onChange={setMode}
              lang={lang}
              colors={colors}
              typography={typography}
              radii={radii}
            />
          </View>

          {mode === 'state' ? (
            <View>
              {stateSections.map((group) => {
                const isFocused = focusedState === group.stateKey;
                return (
                  <View key={group.stateKey} style={{ marginBottom: spacing.lg }}>
                    <Pressable
                      onPress={() =>
                        setFocusedState(isFocused ? null : group.stateKey)
                      }
                      accessibilityRole="button"
                      accessibilityState={{ selected: isFocused }}
                      accessibilityLabel={group.label}
                      hitSlop={8}
                    >
                      <Text
                        style={[
                          styles.sectionHeader,
                          {
                            color: isFocused ? colors.saffronDeep : colors.inkMuted,
                            fontSize: typography.sectionLabel.fontSize,
                            letterSpacing: typography.sectionLabel.letterSpacing,
                          },
                        ]}
                      >
                        {isFocused ? '◆ ' : ''}
                        {group.label}
                      </Text>
                    </Pressable>
                    {group.temples.map((temple) => (
                      <TempleListRow
                        key={temple.id}
                        temple={temple}
                        lang={lang}
                        colors={colors}
                        typography={typography}
                        radii={radii}
                        onPress={() => handleTemplePress(temple.id)}
                      />
                    ))}
                  </View>
                );
              })}
            </View>
          ) : (
            <View>
              {categorySections.map((section) => (
                <View key={section.key} style={{ marginBottom: spacing.lg }}>
                  <Text
                    style={[
                      styles.sectionHeader,
                      {
                        color: colors.saffronDeep,
                        fontSize: typography.sectionLabel.fontSize,
                        letterSpacing: typography.sectionLabel.letterSpacing,
                      },
                    ]}
                  >
                    {section.label} · {section.temples.length}
                  </Text>
                  {section.temples.map((temple) => (
                    <TempleListRow
                      key={`${section.key}-${temple.id}`}
                      temple={temple}
                      lang={lang}
                      colors={colors}
                      typography={typography}
                      radii={radii}
                      onPress={() => handleTemplePress(temple.id)}
                    />
                  ))}
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

type Lang = 'hi' | 'en';
type ThemeBits = {
  colors: ReturnType<typeof useTheme>['colors'];
  typography: ReturnType<typeof useTheme>['typography'];
  radii: ReturnType<typeof useTheme>['radii'];
};

function ViewToggle({
  mode,
  onChange,
  lang,
  colors,
  typography,
  radii,
}: {
  mode: ViewMode;
  onChange: (next: ViewMode) => void;
  lang: Lang;
} & ThemeBits) {
  const options: Array<{ value: ViewMode; hi: string; en: string }> = [
    { value: 'state', hi: 'राज्य', en: 'By State' },
    { value: 'category', hi: 'श्रेणी', en: 'By Category' },
  ];

  return (
    <View
      style={[
        toggleStyles.group,
        {
          backgroundColor: colors.parchmentSoft,
          borderColor: colors.divider,
          borderRadius: radii.pill,
        },
      ]}
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
              {
                backgroundColor: selected ? colors.saffronTint : 'transparent',
                borderRadius: radii.pill,
              },
              pressed && !selected && { opacity: 0.7 },
            ]}
          >
            <Text
              style={{
                fontFamily:
                  lang === 'hi' ? typography.cardHindi.fontFamily : typography.cardLatin.fontFamily,
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

function TempleListRow({
  temple,
  lang,
  colors,
  typography,
  radii,
  onPress,
}: {
  temple: TempleEntry;
  lang: Lang;
  onPress: () => void;
} & ThemeBits) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={lang === 'hi' ? temple.nameHi : temple.nameEn}
      style={({ pressed }) => [
        rowStyles.card,
        {
          backgroundColor: colors.parchmentSoft,
          borderColor: colors.divider,
          borderRadius: radii.md,
        },
        pressed && { opacity: 0.85 },
      ]}
    >
      <View style={[rowStyles.thumb, { backgroundColor: colors.cardThumbActiveFrom, borderRadius: radii.sm }]}>
        <Text
          style={{
            fontFamily: typography.thumb.fontFamily,
            fontSize: 18,
            color: colors.parchmentSoft,
          }}
        >
          {'ॐ'}
        </Text>
      </View>
      <View style={rowStyles.textColumn}>
        <Text
          numberOfLines={1}
          style={{
            fontFamily:
              lang === 'hi' ? typography.cardHindi.fontFamily : typography.cardLatin.fontFamily,
            fontSize: lang === 'hi' ? 17 : 16,
            fontStyle: lang === 'en' ? 'italic' : 'normal',
            color: colors.ink,
          }}
        >
          {lang === 'hi' ? temple.nameHi : temple.nameEn}
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
          {lang === 'hi'
            ? `${temple.cityHi}, ${temple.stateHi}`
            : `${temple.cityEn}, ${temple.stateEn}`}
        </Text>
      </View>
      <Text style={{ color: colors.saffron, fontSize: 22, marginLeft: 8 }}>{'›'}</Text>
    </Pressable>
  );
}

type StateGroup = { stateKey: string; label: string; temples: TempleEntry[] };

/** Group every temple in the current set by its state (By State view). */
function groupByState(list: readonly TempleEntry[], lang: Lang): StateGroup[] {
  const map = new Map<string, TempleEntry[]>();
  list.forEach((t) => {
    const key = t.stateEn;
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(t);
  });
  const groups: StateGroup[] = [];
  map.forEach((temples, stateKey) => {
    const sample = temples[0];
    const label = `${sample.stateHi} · ${sample.stateEn}`;
    const sorted = [...temples].sort((a, b) =>
      lang === 'hi' ? a.nameHi.localeCompare(b.nameHi) : a.nameEn.localeCompare(b.nameEn),
    );
    groups.push({ stateKey, label, temples: sorted });
  });
  groups.sort((a, b) => a.stateKey.localeCompare(b.stateKey));
  return groups;
}

type CategorySection = { key: string; label: string; temples: TempleEntry[] };

/**
 * Group the current set by pilgrimage category (Jyotirlinga, Char Dham, …),
 * respecting the entry filter. A temple in multiple categories appears under
 * each; ungrouped temples fall under "Other Famous Temples". Empty categories
 * are omitted.
 */
function buildCategorySections(list: readonly TempleEntry[], lang: Lang): CategorySection[] {
  const sections: CategorySection[] = groupOrder
    .map((g) => ({
      key: g,
      label: lang === 'hi' ? groupMeta[g].nameHi : groupMeta[g].nameEn,
      temples: list.filter((t) => t.groups.includes(g)),
    }))
    .filter((s) => s.temples.length > 0);
  const other = list.filter((t) => t.groups.length === 0);
  if (other.length > 0) {
    sections.push({
      key: 'other-famous',
      label: lang === 'hi' ? 'अन्य प्रसिद्ध तीर्थ' : 'Other Famous Temples',
      temples: [...other],
    });
  }
  return sections;
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  toggleRow: { alignItems: 'center', paddingTop: 4, paddingBottom: 8 },
  viewToggleRow: { alignItems: 'center', paddingBottom: 12 },
  scroll: { paddingTop: 4 },
  hint: { textAlign: 'center', fontStyle: 'italic', includeFontPadding: false },
  sectionHeader: {
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 8,
    marginTop: 8,
  },
});

const toggleStyles = StyleSheet.create({
  group: {
    flexDirection: 'row',
    borderWidth: 1,
    padding: 3,
    alignSelf: 'center',
  },
  half: {
    minWidth: 100,
    paddingVertical: 7,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

const rowStyles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderWidth: 1,
    marginBottom: 10,
  },
  thumb: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  textColumn: {
    flex: 1,
  },
});
