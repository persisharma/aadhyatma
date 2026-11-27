/**
 * दान को समझें — "Learn daan in three short reads" (design.md §73, approved
 * revamp canvas: the Option B home's read cards open the guide's steps 1, 2
 * and 5). One read per page:
 *
 *   1. What daan is — one line, small daans you know, daan is not only money,
 *      and the Ṛgveda's verse (`dana-sukta`);
 *   2. How to give — the Taittirīya's six words (`shraddhaya-deyam`), the
 *      Gita's sattvik gift with desha · kaala · patra (`sattvik-daan`), and
 *      the three kinds of giving;
 *   3. Remember it quietly — the register, how entries look, why gupt daan
 *      comes first, and doors to the register.
 *
 * A progress bar and read header sit on top; the footer keeps the दान-द्वार
 * door on every read with पिछला / आगे under it. Verses, cites and meanings come
 * from the verified principle registry; the glosses from `data/daan/learn.ts`.
 * The app never transacts; nothing narrates where the register is stored.
 */
import React, { useMemo, useRef, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Path } from 'react-native-svg';

import DaanCauseIcon from '@/components/DaanCauseIcon';
import ReaderHeader from '@/components/ReaderHeader';
import { storybookSources } from '@/components/storybookSources';
import { useGitaLanguage } from '@/data/gita/language';
import { getDaanPrinciples, type DaanPrincipleEntry } from '@/data/daan';
import {
  DAAN_LEARN_CHECKS,
  DAAN_LEARN_EXAMPLES,
  DAAN_LEARN_KINDS,
  DAAN_LEARN_NOT_MONEY,
  DAAN_LEARN_ONE_LINE,
  DAAN_LEARN_READS,
  DAAN_LEARN_REGISTER,
  DAAN_LEARN_SIX_WAYS,
  type DaanLearnReadId,
  type DaanLearnWayIcon,
} from '@/data/daan/learn';
import type { DaanStackParamList } from '@/navigation/types';
import { useTheme } from '@/theme/ThemeContext';
import { contentByLang, meaningByLang, verseLinesByLang } from '@/utils/localize';
import { isLatinLang, scriptBodyFont, scriptTitleFont } from '@/utils/langType';

type Props = NativeStackScreenProps<DaanStackParamList, 'DaanLearn'>;

const READ_ICONS = [storybookSources.daan, storybookSources.suktam, storybookSources.granth] as const;

/** The six-ways line icons from the design (24-unit stroke glyphs). */
function WayIcon({ kind, color }: { kind: DaanLearnWayIcon; color: string }) {
  const p = { stroke: color, strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, fill: 'none' };
  return (
    <Svg width={26} height={26} viewBox="0 0 24 24">
      {kind === 'faith' ? (<><Path {...p} d="M4 15h16c-1 3-4 5-8 5s-7-2-8-5z" /><Path {...p} d="M12 4c2 2.5 2 5 0 7-2-2-2-4.5 0-7z" /></>) : null}
      {kind === 'no' ? (<><Path {...p} d="M12 20s-7.5-4.6-7.5-10.2A4.2 4.2 0 0 1 12 7.3a4.2 4.2 0 0 1 7.5 2.5C19.5 15.4 12 20 12 20z" /><Path {...p} d="M4 4l16 16" /></>) : null}
      {kind === 'means' ? (<><Path {...p} d="M12 4v15M7 20h10M5 7h14" /><Path {...p} d="M5 7l-3 6h6zM19 7l-3 6h6z" /></>) : null}
      {kind === 'humble' ? (<><Path {...p} d="M12 3c-1.5 2-3 5-3 9v5l-3 3M12 3c1.5 2 3 5 3 9v5l3 3" /><Path {...p} d="M12 3v14" /></>) : null}
      {kind === 'awe' ? (<><Path {...p} d="M12 6c2 2.5 2 6 0 9-2-3-2-6.5 0-9z" /><Path {...p} d="M12 15c-3-1-6-3.5-7-7 3.5 0 6 2 7 4M12 15c3-1 6-3.5 7-7-3.5 0-6 2-7 4" /><Path {...p} d="M5 19h14" /></>) : null}
      {kind === 'know' ? (<><Path {...p} d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12z" /><Circle {...p} cx={12} cy={12} r={2.8} /></>) : null}
    </Svg>
  );
}

/** The night panels' scattered 2pt star points (decorative). */
function Stars({ color, at }: { color: string; at: readonly { left?: number; right?: number; top?: number; bottom?: number }[] }) {
  return (
    <>
      {at.map((pos, i) => (
        <View key={i} pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={[styles.star, pos, { backgroundColor: color }]} />
      ))}
    </>
  );
}
const STARS_A = [{ left: 24, top: 18 }, { right: 30, top: 30 }, { left: 52, bottom: 40 }, { right: 60, bottom: 22 }] as const;
const STARS_B = [{ left: 30, top: 16 }, { right: 26, bottom: 30 }, { right: 80, top: 34 }] as const;

export function clampLearnRead(read: unknown): DaanLearnReadId {
  return read === 2 || read === 3 ? read : 1;
}

export default function DaanLearnScreen({ navigation, route }: Props) {
  const { colors, typography, spacing, radii, elevation } = useTheme();
  const { lang } = useGitaLanguage();
  const rootNav = useNavigation<any>();
  const titleFont = scriptTitleFont(lang, typography.readerTitle.fontFamily);
  const bodyFont = scriptBodyFont(lang, typography.meaning.fontFamily);
  // Indic lines reserve >=1.65em or matras clip on iOS (RULEBOOK §3).
  const latin = isLatinLang(lang);
  const lead = (size: number, latinLeading: number) => (latin ? latinLeading : Math.ceil(size * 1.7));
  const t = (bi: { hi: string; en: string }) => contentByLang(lang, bi.hi, bi.en);

  const [read, setRead] = useState<DaanLearnReadId>(clampLearnRead(route.params?.read));
  const scrollRef = useRef<ScrollView>(null);
  const goTo = (next: DaanLearnReadId) => {
    setRead(next);
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  };
  const meta = DAAN_LEARN_READS[read - 1];

  const principles = useMemo(() => getDaanPrinciples(), []);
  const principle = (id: string) => principles.find((entry) => entry.id === id);

  const label = (color: string) => ({
    fontFamily: typography.sectionLabel.fontFamily,
    fontSize: 11,
    lineHeight: lead(11, 16),
    letterSpacing: latin ? 1.1 : 0,
    textTransform: 'uppercase' as const,
    color,
  });
  const h3 = { fontFamily: titleFont, fontSize: 19, lineHeight: lead(19, 27), color: colors.ink, marginBottom: 10 };
  const tile = [{ borderColor: colors.panchangTileBorder, borderRadius: radii.lg }, elevation.card] as const;
  const night = [colors.skyNightTop, colors.skyNightUpper, colors.skyNightHorizon] as const;

  /** A verified verse on a night panel: label, verse, cite, and (optionally) its meaning. */
  const VersePanel = ({ entry, title, icon, children, testID }: {
    entry?: DaanPrincipleEntry;
    title: string;
    icon?: number;
    children?: React.ReactNode;
    testID: string;
  }) =>
    entry ? (
      <LinearGradient testID={testID} colors={night} locations={[0, 0.55, 1]} style={[styles.panel, { borderColor: colors.gold, borderRadius: radii.xl }]}>
        <Stars color={colors.starLight} at={STARS_A} />
        {icon ? <Image source={icon} style={styles.panelIcon} resizeMode="contain" accessibilityElementsHidden importantForAccessibility="no" /> : null}
        <Text style={[label(colors.nightGold), { textAlign: 'center' }]}>{title}</Text>
        <View style={[styles.rule, { backgroundColor: colors.gold }]} />
        {entry.verseLines ? (
          <Text style={{ fontFamily: titleFont, fontSize: 17, lineHeight: lead(17, 30), color: colors.nightGold, textAlign: 'center' }}>
            {verseLinesByLang(lang, entry.verseLines, entry.iastLines ?? entry.verseLines).join('\n')}
          </Text>
        ) : null}
        <View style={[styles.rule, { backgroundColor: colors.gold }]} />
        <Text style={[label(colors.nightInkMuted), { textAlign: 'center', textTransform: 'none' }]}>{contentByLang(lang, entry.citeHi, entry.citeEn)}</Text>
        {children}
      </LinearGradient>
    ) : null;

  const readOne = (
    <>
      <LinearGradient
        colors={[colors.cardActiveFrom, colors.cardActiveTo]}
        style={[styles.oneLine, { borderColor: colors.cardActiveBorder, borderRadius: radii.xl }, elevation.card]}
      >
        <Text style={label(colors.saffronDeep)}>{contentByLang(lang, 'एक पंक्ति में', 'In one line')}</Text>
        <Text style={{ fontFamily: titleFont, fontSize: 21, lineHeight: lead(21, 30), color: colors.ink, marginTop: 6 }}>{t(DAAN_LEARN_ONE_LINE)}</Text>
      </LinearGradient>
      <View>
        <Text style={h3}>{contentByLang(lang, 'छोटे दान, जो आप शायद जानते हैं', 'Small daans you may already know')}</Text>
        <View style={{ gap: 10 }}>
          {DAAN_LEARN_EXAMPLES.map((example) => (
            <LinearGradient key={example.cause} colors={[colors.panchangTileFrom, colors.panchangTileTo]} style={[styles.exampleRow, ...tile]}>
              <DaanCauseIcon cause={example.cause} size={54} />
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={{ fontFamily: titleFont, fontSize: 15.5, lineHeight: lead(15.5, 23), color: colors.ink }}>{t(example.title)}</Text>
                <Text style={{ fontFamily: bodyFont, fontSize: 13, lineHeight: lead(13, 20), color: colors.inkMuted }}>{t(example.why)}</Text>
              </View>
            </LinearGradient>
          ))}
        </View>
      </View>
      <View>
        <Text style={h3}>{contentByLang(lang, 'दान केवल धन नहीं', 'Daan is not only money')}</Text>
        <View style={styles.grid3}>
          {DAAN_LEARN_NOT_MONEY.map((item) => (
            <LinearGradient key={item.label.en} colors={[colors.panchangTileFrom, colors.panchangTileTo]} style={[styles.notMoneyTile, ...tile]}>
              {item.cause ? (
                <DaanCauseIcon cause={item.cause} size={52} />
              ) : (
                <Image source={storybookSources.practice} style={{ width: 52, height: 52 }} resizeMode="contain" accessibilityElementsHidden importantForAccessibility="no" />
              )}
              <Text style={{ fontFamily: titleFont, fontSize: 13, lineHeight: lead(13, 19), color: colors.ink, textAlign: 'center' }}>{t(item.label)}</Text>
            </LinearGradient>
          ))}
        </View>
      </View>
      <VersePanel testID="daan-learn-veda" entry={principle('dana-sukta')} title={contentByLang(lang, 'वेद क्या कहता है', 'What the Veda says')}>
        {principle('dana-sukta') ? (
          <Text style={[styles.panelMeaning, { fontFamily: bodyFont, lineHeight: lead(14, 22), color: colors.nightInkSoft }]}>
            {meaningByLang(lang, principle('dana-sukta')!.meaningHi, principle('dana-sukta')!.meaningEn)}
          </Text>
        ) : null}
      </VersePanel>
    </>
  );

  const sattvik = principle('sattvik-daan');
  const readTwo = (
    <>
      <VersePanel testID="daan-learn-upanishad" entry={principle('shraddhaya-deyam')} icon={storybookSources.suktam} title={contentByLang(lang, 'उपनिषद् के छह वचन', 'The Upanishad’s six words')} />
      <View>
        <Text style={h3}>{contentByLang(lang, 'देने के छह ढंग, सरल शब्दों में', 'Six ways to give, in plain words')}</Text>
        <View style={styles.grid2}>
          {DAAN_LEARN_SIX_WAYS.map((way, i) => (
            <LinearGradient
              key={way.word}
              colors={way.not ? [colors.avoidTint, colors.avoidTint] : [colors.panchangTileFrom, colors.panchangTileTo]}
              style={[styles.wayTile, { borderColor: way.not ? colors.panchangAvoidBorder : colors.panchangTileBorder, borderRadius: radii.xl }, elevation.card]}
            >
              <View style={styles.wayTop}>
                <LinearGradient colors={[colors.nightGold, colors.gold]} style={styles.wayNum}>
                  <Text style={{ fontFamily: typography.sectionLabel.fontFamily, fontSize: 13, lineHeight: 17, color: colors.skyNightUpper }}>{i + 1}</Text>
                </LinearGradient>
                <WayIcon kind={way.icon} color={way.not ? colors.avoidDeep : colors.saffronDeep} />
              </View>
              <Text style={{ fontFamily: titleFont, fontSize: 20, lineHeight: Math.ceil(20 * 1.7), color: way.not ? colors.avoidDeep : colors.saffronDeep, marginTop: 8 }}>
                {contentByLang(lang, way.word, way.word)}
              </Text>
              <Text style={{ fontFamily: titleFont, fontSize: 15, lineHeight: lead(15, 22), color: colors.ink }}>{t(way.plain)}</Text>
              <Text style={{ fontFamily: bodyFont, fontSize: 13, lineHeight: lead(13, 20), color: colors.inkSoft, marginTop: 2 }}>{t(way.child)}</Text>
            </LinearGradient>
          ))}
        </View>
      </View>
      <VersePanel testID="daan-learn-gita-panel" entry={sattvik} title={contentByLang(lang, 'सात्त्विक दान — गीता', 'The Gita on the sattvik gift')}>
        {sattvik ? (
          <>
            <Text style={[styles.panelMeaning, { fontFamily: bodyFont, lineHeight: lead(14, 22), color: colors.nightInkSoft }]}>
              {meaningByLang(lang, sattvik.meaningHi, sattvik.meaningEn)}
            </Text>
            <Text style={[label(colors.nightGold), { marginTop: 14 }]}>{contentByLang(lang, 'देने से पहले तीन बातें', 'Three checks before you give')}</Text>
            <View style={[styles.grid3, { marginTop: 8 }]}>
              {DAAN_LEARN_CHECKS.map((check) => (
                <View key={check.word.en} style={[styles.checkTile, { backgroundColor: colors.nightGlass, borderColor: colors.nightGlassBorder, borderRadius: radii.md }]}>
                  <Text style={{ fontFamily: titleFont, fontSize: 16, lineHeight: lead(16, 23), color: colors.nightGold }}>{t(check.word)}</Text>
                  <Text style={{ fontFamily: bodyFont, fontSize: 12.5, lineHeight: lead(12.5, 18), color: colors.nightInk, textAlign: 'center' }}>{t(check.plain)}</Text>
                </View>
              ))}
            </View>
          </>
        ) : null}
      </VersePanel>
      <View>
        <Text style={h3}>{contentByLang(lang, 'दान के तीन प्रकार · गीता 17.20–22', 'Three kinds of giving · Gita 17.20–22')}</Text>
        <View style={{ gap: 8 }}>
          {DAAN_LEARN_KINDS.map((kind) => {
            const tint = kind.id === 'sattvik' ? colors.goldTint : kind.id === 'rajasik' ? colors.saffronTint : colors.avoidTint;
            const bar = kind.id === 'sattvik' ? colors.gold : kind.id === 'rajasik' ? colors.saffron : colors.avoid;
            return (
              <View key={kind.id} style={[styles.kindRow, { backgroundColor: tint, borderRadius: radii.lg }]}>
                <View style={[styles.kindBar, { backgroundColor: bar }]} />
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={{ fontFamily: titleFont, fontSize: 15, lineHeight: lead(15, 22), color: colors.ink }}>{t(kind.name)}</Text>
                  <Text style={{ fontFamily: bodyFont, fontSize: 13, lineHeight: lead(13, 20), color: colors.inkSoft }}>{t(kind.plain)}</Text>
                </View>
              </View>
            );
          })}
        </View>
        {sattvik?.gitaRef ? (
          <Pressable
            testID="daan-learn-gita"
            accessibilityRole="button"
            onPress={() =>
              rootNav.navigate('HomeTab', {
                screen: 'GitaReader',
                params: { chapter: sattvik.gitaRef!.chapter, initialIndex: sattvik.gitaRef!.verseIndex },
              })
            }
            style={({ pressed }) => [styles.outlineBtn, { borderColor: colors.saffron, borderRadius: radii.pill, marginTop: 12 }, pressed && { opacity: 0.7 }]}
          >
            <Text style={{ fontFamily: titleFont, fontSize: 14.5, lineHeight: lead(14.5, 20), color: colors.saffronDeep }}>
              {contentByLang(lang, 'गीता 17.20–22 पढ़ें', 'Read Gita 17.20–22')}
            </Text>
          </Pressable>
        ) : null}
      </View>
    </>
  );

  const R = DAAN_LEARN_REGISTER;
  const readThree = (
    <>
      <LinearGradient colors={[colors.panchangTileFrom, colors.panchangTileTo]} style={[styles.regCard, ...tile]}>
        <Image source={storybookSources.granth} style={{ width: 72, height: 72 }} resizeMode="contain" accessibilityElementsHidden importantForAccessibility="no" />
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={{ fontFamily: titleFont, fontSize: 19, lineHeight: lead(19, 27), color: colors.ink }}>{t(R.title)}</Text>
          <Text style={{ fontFamily: bodyFont, fontSize: 13.5, lineHeight: lead(13.5, 21), color: colors.inkSoft }}>{t(R.body)}</Text>
        </View>
      </LinearGradient>
      <View>
        <Text style={h3}>{contentByLang(lang, 'प्रविष्टियाँ ऐसी दिखती हैं', 'How entries look')}</Text>
        <View style={[styles.sample, { backgroundColor: colors.parchmentSoft, borderRadius: radii.lg }]}>
          <View style={styles.sampleHead}>
            <Text style={{ fontFamily: titleFont, fontSize: 15, lineHeight: lead(15, 22), color: colors.ink }}>{t(R.sampleCat)}</Text>
            <Text style={{ fontFamily: typography.sectionLabel.fontFamily, fontSize: 12, lineHeight: lead(12, 17), color: colors.inkMuted }}>{t(R.sampleDate)}</Text>
          </View>
          <Text style={{ fontFamily: bodyFont, fontSize: 13, lineHeight: lead(13, 20), color: colors.inkMuted }}>{t(R.sampleTithi)}</Text>
          <Text style={{ fontFamily: bodyFont, fontSize: 13.5, lineHeight: lead(13.5, 21), color: colors.ink, marginTop: 4 }}>{t(R.sampleNote)}</Text>
        </View>
        <View style={[styles.sample, { backgroundColor: colors.goldChipBg, borderRadius: radii.lg, marginTop: 8 }]}>
          <View style={styles.sampleHead}>
            <Text style={{ fontFamily: titleFont, fontSize: 15, lineHeight: lead(15, 22), color: colors.saffronDeep }}>{t(R.guptName)}</Text>
            <Text style={{ fontFamily: typography.sectionLabel.fontFamily, fontSize: 12, lineHeight: lead(12, 17), color: colors.inkSoft }}>{t(R.guptDate)}</Text>
          </View>
          <Text style={{ fontFamily: bodyFont, fontSize: 13, lineHeight: lead(13, 20), color: colors.inkSoft }}>{t(R.guptRow)}</Text>
        </View>
      </View>
      <LinearGradient testID="daan-learn-gupt" colors={night} locations={[0, 0.55, 1]} style={[styles.panel, { borderColor: colors.gold, borderRadius: radii.xl, alignItems: 'stretch' }]}>
        <Stars color={colors.starLight} at={STARS_B} />
        <Text style={{ fontFamily: titleFont, fontSize: 19, lineHeight: lead(19, 27), color: colors.nightGold }}>{t(R.guptLabel)}</Text>
        <Text style={{ fontFamily: bodyFont, fontSize: 15, lineHeight: lead(15, 25), color: colors.nightInk, marginTop: 6 }}>{t(R.guptMeaning)}</Text>
        <View style={[styles.rule, { backgroundColor: colors.gold, width: '100%', marginVertical: 14 }]} />
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Image source={storybookSources.krishna} style={{ width: 40, height: 40 }} resizeMode="contain" accessibilityElementsHidden importantForAccessibility="no" />
          <Text style={{ fontFamily: titleFont, fontSize: 17, lineHeight: lead(17, 24), color: colors.nightGold }}>{t(R.sudamaLabel)}</Text>
        </View>
        <Text style={{ fontFamily: bodyFont, fontSize: 15, lineHeight: lead(15, 25), color: colors.nightInk, marginTop: 6 }}>{t(R.sudamaTeaching)}</Text>
      </LinearGradient>
      <View style={styles.row}>
        <Pressable
          testID="daan-learn-ledger"
          accessibilityRole="button"
          onPress={() => navigation.navigate('DaanLedger')}
          style={({ pressed }) => [styles.outlineBtn, { flex: 1, borderColor: colors.saffron, borderRadius: radii.pill }, pressed && { opacity: 0.7 }]}
        >
          <Text style={{ fontFamily: titleFont, fontSize: 14.5, lineHeight: lead(14.5, 20), color: colors.saffronDeep }}>{contentByLang(lang, 'खाता खोलें', 'Open register')}</Text>
        </Pressable>
        <Pressable
          testID="daan-learn-record"
          accessibilityRole="button"
          onPress={() => navigation.navigate('DaanEntry', undefined)}
          style={({ pressed }) => [styles.outlineBtn, { flex: 1.2, backgroundColor: colors.saffronDeep, borderColor: colors.saffronDeep, borderRadius: radii.pill }, pressed && { opacity: 0.85 }]}
        >
          <Text style={{ fontFamily: titleFont, fontSize: 15, lineHeight: lead(15, 21), color: colors.onPrimary }}>{contentByLang(lang, 'दान दर्ज करें', 'Record a daan')}</Text>
        </Pressable>
      </View>
    </>
  );

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.parchment }]} edges={['top']} testID="daan-learn-screen">
      <ReaderHeader title={contentByLang(lang, 'दान को समझें', 'Learn daan')} variant="index" onBack={() => navigation.goBack()} />
      {/* Progress + the read header */}
      <View style={{ paddingHorizontal: spacing.readingGutter, paddingTop: 6 }}>
        <View style={styles.segments} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
          {DAAN_LEARN_READS.map((entry) => (
            <View key={entry.id} style={[styles.segment, { backgroundColor: entry.id <= read ? colors.saffronDeep : colors.goldChipBg }]} />
          ))}
        </View>
        <View style={styles.readHead}>
          <Image source={READ_ICONS[read - 1]} style={styles.readIcon} resizeMode="contain" accessibilityElementsHidden importantForAccessibility="no" />
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={label(colors.saffronDeep)}>{contentByLang(lang, `पाठ ${read} / 3`, `Read ${read} of 3`)}</Text>
            <Text testID={`daan-learn-read-${read}`} accessibilityRole="header" style={{ fontFamily: titleFont, fontSize: 24, lineHeight: lead(24, 32), color: colors.ink }}>
              {t(meta.title)}
            </Text>
            <Text style={{ fontFamily: bodyFont, fontSize: 13.5, lineHeight: lead(13.5, 21), color: colors.inkMuted }}>{t(meta.lede)}</Text>
          </View>
        </View>
      </View>
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={{ paddingHorizontal: spacing.readingGutter, paddingTop: 16, paddingBottom: spacing.xl, gap: 22 }}
        showsVerticalScrollIndicator={false}
      >
        {read === 1 ? readOne : read === 2 ? readTwo : readThree}
      </ScrollView>
      {/* Footer: the दान-द्वार door on every read, then पिछला / आगे. */}
      <View style={[styles.footer, { backgroundColor: colors.parchmentHighlight, borderTopColor: colors.panchangTileBorder, paddingHorizontal: spacing.readingGutter }, elevation.lifted]}>
        <Pressable
          testID="daan-learn-dwaar"
          accessibilityRole="button"
          accessibilityLabel={contentByLang(lang, 'दान-द्वार — सत्यापित संस्थाएँ', 'Daan-dwaar — verified orgs')}
          onPress={() => navigation.navigate('DaanDirectory', {})}
          style={({ pressed }) => [styles.dwaar, { backgroundColor: colors.panchangTileFrom, borderColor: colors.gold, borderRadius: radii.pill }, pressed && { opacity: 0.7 }]}
        >
          <Svg width={16} height={16} viewBox="0 0 24 24" accessibilityElementsHidden importantForAccessibility="no">
            <Path d="M5 21V9l7-5 7 5v12" stroke={colors.saffronDeep} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <Path d="M10 21v-6h4v6" stroke={colors.saffronDeep} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </Svg>
          <Text style={{ fontFamily: titleFont, fontSize: 14.5, lineHeight: lead(14.5, 20), color: colors.saffronDeep }}>{contentByLang(lang, 'दान-द्वार ›', 'Daan-dwaar ›')}</Text>
        </Pressable>
        <View style={styles.row}>
          <Pressable
            testID="daan-learn-prev"
            accessibilityRole="button"
            onPress={() => (read === 1 ? navigation.goBack() : goTo((read - 1) as DaanLearnReadId))}
            style={({ pressed }) => [styles.navBtn, { flex: 1, borderColor: colors.saffron, borderRadius: radii.pill }, pressed && { opacity: 0.7 }]}
          >
            <Text style={{ fontFamily: titleFont, fontSize: 15, lineHeight: lead(15, 21), color: colors.saffronDeep }}>
              {read === 1 ? contentByLang(lang, '‹ वापस', '‹ Back') : contentByLang(lang, '‹ पिछला', '‹ Previous')}
            </Text>
          </Pressable>
          <Pressable
            testID="daan-learn-next"
            accessibilityRole="button"
            onPress={() => (read === 3 ? navigation.goBack() : goTo((read + 1) as DaanLearnReadId))}
            style={({ pressed }) => [styles.navBtn, { flex: 1.4, backgroundColor: colors.saffronDeep, borderColor: colors.saffronDeep, borderRadius: radii.pill }, pressed && { opacity: 0.85 }]}
          >
            <Text style={{ fontFamily: titleFont, fontSize: 15.5, lineHeight: lead(15.5, 21), color: colors.onPrimary }}>
              {read === 3 ? contentByLang(lang, 'पूर्ण', 'Finish') : contentByLang(lang, 'आगे ›', 'Next ›')}
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  segments: { flexDirection: 'row', gap: 4 },
  segment: { flex: 1, height: 6, borderRadius: 3 },
  readHead: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 12 },
  readIcon: { width: 56, height: 56 },
  oneLine: { borderWidth: 1, padding: 18 },
  exampleRow: { flexDirection: 'row', alignItems: 'center', gap: 14, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 12 },
  grid3: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  grid2: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  notMoneyTile: { width: '31.5%', flexGrow: 1, borderWidth: 1, alignItems: 'center', gap: 8, paddingTop: 14, paddingBottom: 12, paddingHorizontal: 6 },
  panel: { borderWidth: 1, paddingHorizontal: 18, paddingVertical: 20, alignItems: 'center' },
  panelIcon: { width: 54, height: 54, marginBottom: 4 },
  panelMeaning: { fontSize: 14, marginTop: 12, alignSelf: 'stretch' },
  rule: { width: 120, height: 1, opacity: 0.8, marginVertical: 12 },
  wayTile: { width: '48%', flexGrow: 1, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 14 },
  wayNum: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  checkTile: { flex: 1, minWidth: 84, borderWidth: 1, alignItems: 'center', paddingVertical: 10, paddingHorizontal: 6 },
  kindRow: { flexDirection: 'row', gap: 12, paddingHorizontal: 14, paddingVertical: 12 },
  kindBar: { width: 8, borderRadius: 4 },
  outlineBtn: { minHeight: 48, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 12 },
  regCard: { flexDirection: 'row', alignItems: 'center', gap: 14, borderWidth: 1, padding: 16 },
  sample: { paddingHorizontal: 16, paddingVertical: 14 },
  row: { flexDirection: 'row', gap: 10 },
  footer: { gap: 8, paddingTop: 10, paddingBottom: 12, borderTopWidth: 1 },
  dwaar: { minHeight: 46, borderWidth: 1, flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center' },
  star: { position: 'absolute', width: 2, height: 2, borderRadius: 1 },
  wayTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sampleHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  navBtn: { minHeight: 52, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
});
