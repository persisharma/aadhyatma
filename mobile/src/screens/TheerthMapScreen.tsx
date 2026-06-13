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
import { jyotirlingas, type JyotirlingaPlaceholder } from '@/data/theerth/jyotirlingas';
import type { HomeStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<HomeStackParamList, 'TheerthMap'>;

type ViewMode = 'map' | 'state';

export default function TheerthMapScreen({ navigation }: Props) {
  const { colors, typography, spacing, radii } = useTheme();
  const { lang } = useGitaLanguage();
  const [mode, setMode] = useState<ViewMode>('map');

  const screenWidth = Dimensions.get('window').width;
  const mapWidth = Math.min(screenWidth - 2 * spacing.xxl, 320);

  const pins: IndiaMapPin[] = useMemo(
    () =>
      jyotirlingas.map((j) => ({
        id: j.id,
        lat: j.coordinates.lat,
        lng: j.coordinates.lng,
        label: lang === 'hi' ? j.nameHi : j.nameEn,
      })),
    [lang],
  );

  const grouped = useMemo(() => groupByState(jyotirlingas, lang), [lang]);

  const handlePinPress = (id: string) => {
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
            style={{
              fontFamily: typography.readerTitle.fontFamily,
              fontSize: typography.readerTitle.fontSize,
              color: colors.ink,
            }}
          >
            {lang === 'hi' ? 'तीर्थ' : 'Theerth'}
          </Text>
          <View style={styles.backBtnSpacer} />
        </View>

        <View style={styles.toggleRow}>
          <LanguageToggle />
        </View>

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

        <ScrollView
          contentContainerStyle={[
            styles.scroll,
            { paddingHorizontal: spacing.xxl, paddingBottom: spacing.xxl * 2 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {mode === 'map' ? (
            <View>
              <IndiaMap pins={pins} width={mapWidth} onPinPress={handlePinPress} />
              <Text
                style={[
                  styles.hint,
                  {
                    color: colors.inkMuted,
                    fontFamily: typography.swipeHint.fontFamily,
                    fontSize: typography.swipeHint.fontSize,
                    marginTop: spacing.lg,
                  },
                ]}
              >
                {lang === 'hi'
                  ? 'पिन छूकर मंदिर की कथा पढ़ें'
                  : 'Tap a pin to read the temple’s story'}
              </Text>
              <Text
                style={[
                  styles.previewNotice,
                  {
                    color: colors.inkMuted,
                    fontFamily: typography.cardLatin.fontFamily,
                    fontSize: 12,
                    marginTop: spacing.sm,
                  },
                ]}
              >
                {lang === 'hi'
                  ? 'झलक — १२ ज्योतिर्लिङ्ग'
                  : 'Preview — 12 Jyotirlingas'}
              </Text>
            </View>
          ) : (
            <View>
              {grouped.map((group) => (
                <View key={group.stateKey} style={{ marginBottom: spacing.lg }}>
                  <Text
                    style={[
                      styles.stateHeader,
                      {
                        color: colors.inkMuted,
                        fontSize: typography.sectionLabel.fontSize,
                        letterSpacing: typography.sectionLabel.letterSpacing,
                      },
                    ]}
                  >
                    {group.label}
                  </Text>
                  {group.temples.map((temple) => (
                    <TempleListRow
                      key={temple.id}
                      temple={temple}
                      lang={lang}
                      colors={colors}
                      typography={typography}
                      radii={radii}
                      onPress={() => handlePinPress(temple.id)}
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

type ViewToggleProps = {
  mode: ViewMode;
  onChange: (next: ViewMode) => void;
  lang: 'hi' | 'en';
  colors: ReturnType<typeof useTheme>['colors'];
  typography: ReturnType<typeof useTheme>['typography'];
  radii: ReturnType<typeof useTheme>['radii'];
};

function ViewToggle({ mode, onChange, lang, colors, typography, radii }: ViewToggleProps) {
  const options: Array<{ value: ViewMode; hi: string; en: string }> = [
    { value: 'map', hi: 'मानचित्र', en: 'Map' },
    { value: 'state', hi: 'राज्य', en: 'By State' },
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
      accessibilityLabel="Theerth view mode"
    >
      {options.map((opt) => {
        const selected = mode === opt.value;
        return (
          <Pressable
            key={opt.value}
            onPress={() => onChange(opt.value)}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            hitSlop={8}
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
                fontSize: 13,
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

type TempleListRowProps = {
  temple: JyotirlingaPlaceholder;
  lang: 'hi' | 'en';
  colors: ReturnType<typeof useTheme>['colors'];
  typography: ReturnType<typeof useTheme>['typography'];
  radii: ReturnType<typeof useTheme>['radii'];
  onPress: () => void;
};

function TempleListRow({ temple, lang, colors, typography, radii, onPress }: TempleListRowProps) {
  return (
    <Pressable
      onPress={onPress}
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
      <View
        style={[
          rowStyles.thumb,
          { backgroundColor: colors.cardThumbActiveFrom, borderRadius: radii.sm },
        ]}
      >
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
          {lang === 'hi' ? temple.cityHi : temple.cityEn}
        </Text>
      </View>
      <Text style={{ color: colors.saffron, fontSize: 22, marginLeft: 8 }}>{'›'}</Text>
    </Pressable>
  );
}

type StateGroup = {
  stateKey: string;
  label: string;
  temples: JyotirlingaPlaceholder[];
};

function groupByState(
  list: readonly JyotirlingaPlaceholder[],
  lang: 'hi' | 'en',
): StateGroup[] {
  const map = new Map<string, JyotirlingaPlaceholder[]>();
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
  toggleRow: {
    alignItems: 'center',
    paddingTop: 4,
    paddingBottom: 12,
  },
  viewToggleRow: {
    alignItems: 'center',
    paddingBottom: 12,
  },
  scroll: {
    paddingTop: 4,
  },
  hint: {
    textAlign: 'center',
    fontStyle: 'italic',
    includeFontPadding: false,
  },
  previewNotice: {
    textAlign: 'center',
    fontStyle: 'italic',
    opacity: 0.7,
    includeFontPadding: false,
  },
  stateHeader: {
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
    minWidth: 96,
    paddingVertical: 7,
    paddingHorizontal: 22,
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
