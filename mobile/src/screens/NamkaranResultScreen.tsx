import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import JyotishShareSheet from '@/components/JyotishShareSheet';
import ListCard, { CardThumb } from '@/components/ListCard';
import NameDetailSheet from '@/components/NameDetailSheet';
import NamaksharCard from '@/components/NamaksharCard';
import NamkaranShareCard from '@/components/NamkaranShareCard';
import ReaderHeader from '@/components/ReaderHeader';
import { useGitaLanguage, type Lang } from '@/data/gita/language';
import { loadNamesForCharana, loadNamesForNakshatra } from '@/data/namkaran';
import type { NameGender, NameRecord } from '@/data/namkaran/types';
import type { PanchangStackParamList } from '@/navigation/types';
import { RASHI_NAMES_EN, RASHI_NAMES_HI } from '@/panchang/kundali';
import { NAKSHATRA_NAMES_EN, NAKSHATRA_NAMES_HI } from '@/panchang/names';
import {
  distinctRashiIndices,
  rashiCharanaEntries,
  type CharanaCandidate,
  type NamkaranResult,
} from '@/panchang/namkaran';
import type { CharanaEntry } from '@/panchang/namkaranConvention';
import { buildNamkaranShareModel } from '@/panchang/namkaranShare';
import { useNamkaran } from '@/panchang/useNamkaran';
import { useNamkaranShortlist } from '@/panchang/useNamkaranShortlist';
import { useTheme } from '@/theme/ThemeContext';
import { fontFamilies } from '@/theme/typography';
import { contentByLang, meaningByLang } from '@/utils/localize';
import { indicSafeTag, pillTextStyle, scriptBodyFont, scriptTitleFont } from '@/utils/langType';

type Props = NativeStackScreenProps<PanchangStackParamList, 'NamkaranResult'>;
type CountFilter = 'all' | 2 | 3 | 4;

function formatWindow(candidate: CharanaCandidate): string {
  if (!candidate.window) return '';
  const formatter = new Intl.DateTimeFormat('en-IN', { timeZone: 'Asia/Kolkata', hour: 'numeric', minute: '2-digit', hour12: true });
  return `${formatter.format(candidate.window.startMs)} – ${formatter.format(candidate.window.endMs)} IST`;
}

export default function NamkaranResultScreen({ navigation, route }: Props) {
  const computeState = useNamkaran(route.params.basis);
  const { colors } = useTheme();
  const { lang } = useGitaLanguage();
  if (computeState.status === 'computing') {
    return <SafeAreaView style={[styles.root, styles.center, { backgroundColor: colors.parchment }]}><ActivityIndicator color={colors.saffronDeep} accessibilityLabel="Calculating Namkaran syllable" /></SafeAreaView>;
  }
  if (computeState.status === 'error') {
    return <SafeAreaView style={[styles.root, styles.center, { backgroundColor: colors.parchment }]}><Text style={[styles.empty, { color: colors.avoidDeep }]}>{contentByLang(lang, 'नामाक्षर की गणना नहीं हो सकी।', 'The namakshar could not be calculated.')}</Text><Pressable onPress={navigation.goBack} accessibilityRole="button" accessibilityLabel="Back to Namkaran input"><Text style={[styles.primaryText, { color: colors.saffronDeep }]}>{contentByLang(lang, 'वापस जाएँ', 'Go back')}</Text></Pressable></SafeAreaView>;
  }
  return <NamkaranResultContent navigation={navigation} route={route} result={computeState.result} />;
}

function NamkaranResultContent({ navigation, route, result }: Props & { result: NamkaranResult }) {
  const fromUnknownTime = route.params.fromUnknownTime === true;
  const rootNav = useNavigation<any>();
  const { colors, typography, spacing, radii } = useTheme();
  const { lang } = useGitaLanguage();
  const [names, setNames] = useState<readonly NameRecord[]>([]);
  const [loadingNames, setLoadingNames] = useState(true);
  const [nameError, setNameError] = useState(false);
  const [fallbackUsed, setFallbackUsed] = useState(false);
  const [showDerivation, setShowDerivation] = useState(false);
  const [gender, setGender] = useState<NameGender | 'all'>('all');
  const [count, setCount] = useState<CountFilter>('all');
  const [selectedName, setSelectedName] = useState<NameRecord | null>(null);
  const [shareVisible, setShareVisible] = useState(false);
  const [includeShortlist, setIncludeShortlist] = useState(false);
  const { ids: shortlistIds, toggle: toggleShortlist, error: shortlistError } = useNamkaranShortlist();
  // Micro-label face/tracking/case. The raw style carried Inter + Latin tracking,
  // so in Hindi "नाम देखें" / "कैसे निकला?" / "राशि अनुसार अक्षर" rendered in an
  // unpredictable fallback face with the tracking prising each cluster apart
  // (design.md §3.0). Layout stays in the StyleSheet entries below.
  const microLabel = pillTextStyle(lang, typography.sectionLabel);
  const candidates = useMemo(
    () => result.kind === 'exact' ? [result.candidate] : result.candidates,
    [result]
  );
  const primaryCandidate = candidates[0];
  // An unknown-time day can cross a 30° boundary, so the rashi cross-check is a
  // set, not the first candidate's rashi — naming one would rank a candidate
  // the range path explicitly refuses to rank (PRD-17 §4.2).
  const rashiIndices = useMemo(() => distinctRashiIndices(candidates), [candidates]);
  const currentCharanas = useMemo(
    () => new Set(candidates.map((candidate) => candidate.entry.charanaIndex)),
    [candidates]
  );

  useEffect(() => {
    let active = true;
    setLoadingNames(true);
    const load = async () => {
      const direct = (await Promise.all(candidates.map((candidate) => loadNamesForCharana(candidate.entry.charanaIndex)))).flat();
      const needsFallback = candidates.some((candidate) => candidate.entry.thin) || direct.length === 0;
      const loaded = needsFallback && result.kind === 'exact'
        ? await loadNamesForNakshatra(primaryCandidate.entry.nakshatraIndex)
        : direct;
      if (!active) return;
      setNames([...new Map(loaded.map((name) => [name.id, name])).values()]);
      setFallbackUsed(needsFallback);
      setNameError(false);
    };
    void load().catch(() => { if (active) setNameError(true); }).finally(() => { if (active) setLoadingNames(false); });
    return () => { active = false; };
  }, [candidates, primaryCandidate.entry.nakshatraIndex, result.kind]);

  const filtered = useMemo(() => names.filter((name) =>
    (gender === 'all' || name.gender === gender || name.gender === 'any')
    && (count === 'all' || name.syllableCount === count)
  ), [count, gender, names]);
  const clearFilters = () => {
    setGender('all');
    setCount('all');
  };
  const shortlistedNames = useMemo(() => names.filter((name) => shortlistIds.includes(name.id)), [names, shortlistIds]);
  // A charana opened from an unknown-time day is browsable in full — hero,
  // context, names, shortlist — but it is one of that day's possibilities, so
  // it carries no exact-syllable share (PRD-17 §8.3 invariant 5).
  const shareAllowed = result.kind === 'exact' && !fromUnknownTime;
  const shareModel = shareAllowed
    ? buildNamkaranShareModel(primaryCandidate, includeShortlist ? shortlistedNames : [])
    : null;

  const header = (
    <View style={styles.headerContent}>
      {result.kind === 'exact' && fromUnknownTime ? (
        <View testID="namkaran-uncertain-notice" style={[styles.notice, { borderColor: colors.gold, backgroundColor: colors.goldChipBg, borderRadius: radii.md }]}>
          <Text style={[styles.noticeTitle, microLabel, { color: colors.saffronDeep }]}>{contentByLang(lang, 'दिन की एक सम्भावना', 'ONE OF THE DAY’S POSSIBILITIES')}</Text>
          <Text maxFontSizeMultiplier={1.25} style={{ color: colors.ink, fontFamily: scriptBodyFont(lang, typography.meaning.fontFamily), fontSize: 11, lineHeight: 17 }}>{meaningByLang(lang, 'जन्म समय ज्ञात न होने से यह उस दिन के सम्भावित अक्षरों में से एक है। सही समय मिलने पर एक ही अक्षर रहेगा।', 'Because the birth time is unknown, this is one of that day’s possible sounds. An exact time settles it to one.')}</Text>
        </View>
      ) : null}
      {result.kind === 'exact' ? <NamaksharCard candidate={primaryCandidate} lang={lang} /> : (
        <View>
          <Text style={{ color: colors.ink, fontFamily: scriptTitleFont(lang, typography.readerTitle.fontFamily), fontSize: 22 }}>{contentByLang(lang, 'सम्भावित नामाक्षर', 'Possible namakshar')}</Text>
          <Text style={{ color: colors.inkMuted, fontFamily: scriptBodyFont(lang, typography.meaning.fontFamily), fontSize: 12, lineHeight: 18, marginTop: 5 }}>{meaningByLang(lang, 'चन्द्रमा दिन भर में नक्षत्र बदल सकता है — इसलिए सम्भावित अक्षर एक से अधिक हैं। किसी एक को अधिक सम्भावित नहीं माना गया।', 'The Moon can change charana through the day, so more than one starting sound is possible. None is ranked as more likely.')}</Text>
          <View style={{ marginTop: 12 }}>{candidates.map((candidate) => <CandidateRow key={`${candidate.entry.charanaIndex}-${candidate.window?.startMs}`} candidate={candidate} lang={lang} onPress={() => navigation.navigate('NamkaranResult', { basis: { kind: 'manual', nakshatraIndex: candidate.entry.nakshatraIndex, pada: candidate.entry.pada }, fromUnknownTime: true })} />)}</View>
          <Text style={{ color: colors.inkMuted, fontFamily: scriptBodyFont(lang, typography.meaning.fontFamily), fontSize: 11, lineHeight: 17, marginTop: 8 }}>{meaningByLang(lang, 'किसी भी सम्भावना पर टैप करके उसका नामाक्षर और नाम देखें।', 'Tap any possibility to see its namakshar and names.')}</Text>
        </View>
      )}
      {result.kind === 'exact' ? <View style={[styles.notice, { borderColor: colors.divider, borderRadius: radii.md }]}>
        <Pressable onPress={() => setShowDerivation((current) => !current)} accessibilityRole="button" accessibilityState={{ expanded: showDerivation }} accessibilityLabel="How this namakshar was derived" style={styles.disclosure}>
          <Text style={[styles.noticeTitle, microLabel, { color: colors.saffronDeep }]}>{contentByLang(lang, 'कैसे निकला?', 'HOW THIS WAS DERIVED')}</Text>
          <Text style={{ color: colors.saffronDeep, fontSize: 18 }}>{showDerivation ? '−' : '+'}</Text>
        </Pressable>
        {showDerivation ? <Text style={{ color: colors.inkMuted, fontFamily: scriptBodyFont(lang, typography.meaning.fontFamily), fontSize: 11, lineHeight: 17 }}>{meaningByLang(lang, 'लाहिरी पद्धति से जन्म के समय चन्द्रमा के नक्षत्र और चरण के अनुसार पारम्परिक नामाक्षर मिलता है।', 'The traditional starting sound follows the Moon’s nakshatra and pada at birth using the Lahiri method.')}</Text> : null}
      </View> : null}
      {fallbackUsed ? <Text style={{ color: colors.inkMuted, fontFamily: scriptBodyFont(lang, typography.meaning.fontFamily), fontSize: 11, lineHeight: 17 }}>{meaningByLang(lang, 'इस पद के लिए प्रचलित नाम सीमित हैं — पूरे नक्षत्र के उपलब्ध अक्षर दिखाए जा रहे हैं।', 'Common names for this pada are limited, so available sounds from the whole nakshatra are shown.')}</Text> : null}
      <Text style={[styles.section, microLabel, { color: colors.inkMuted }]}>{contentByLang(lang, 'नाम देखें', 'BROWSE NAMES')}</Text>
      <View style={styles.filters}>
        {(['all', 'boy', 'girl'] as const).map((value) => <FilterButton key={value} selected={gender === value} label={value === 'all' ? contentByLang(lang, 'सभी', 'All') : value === 'boy' ? contentByLang(lang, 'बालक', 'Boy') : contentByLang(lang, 'बालिका', 'Girl')} accessibilityLabel={`Filter names: ${value}`} onPress={() => setGender(value)} />)}
      </View>
      <View style={styles.filters}>
        {(['all', 2, 3, 4] as const).map((value) => <FilterButton key={value} selected={count === value} label={value === 'all' ? contentByLang(lang, 'सभी लंबाई', 'Any length') : value === 4 ? contentByLang(lang, '४+ अक्षर', '4+ syllables') : contentByLang(lang, `${value} अक्षर`, `${value} syllables`)} accessibilityLabel={`Filter name length: ${value}`} onPress={() => setCount(value)} />)}
      </View>
      {loadingNames ? <ActivityIndicator color={colors.saffronDeep} accessibilityLabel="Loading Namkaran names" /> : null}
      {nameError ? <Text style={[styles.empty, { color: colors.avoidDeep }]}>{contentByLang(lang, 'नाम-संग्रह लोड नहीं हुआ। फिर प्रयास करें।', 'The name corpus could not be loaded. Try again.')}</Text> : null}
      {!loadingNames && !nameError && filtered.length === 0 ? <View style={styles.emptyState}>
        <Text style={[styles.empty, { color: colors.inkMuted }]}>{names.length ? contentByLang(lang, 'चुने फ़िल्टर में नाम नहीं मिला।', 'No names match the selected filters.') : contentByLang(lang, 'इस अक्षर के नाम अभी उपलब्ध नहीं हैं।', 'Names for this sound are not yet available.')}</Text>
        {names.length && (gender !== 'all' || count !== 'all') ? <Pressable onPress={clearFilters} accessibilityRole="button" accessibilityLabel="Show all available Namkaran names" style={[styles.resetFilters, { borderColor: colors.divider, borderRadius: radii.pill }]}><Text maxFontSizeMultiplier={1.25} style={[styles.resetText, { color: colors.saffronDeep }]}>{contentByLang(lang, 'सभी उपलब्ध नाम देखें', 'Show all available names')}</Text></Pressable> : null}
      </View> : null}
    </View>
  );

  const footer = (
    <View style={styles.footer}>
      <Text style={[styles.section, microLabel, { color: colors.inkMuted }]}>{contentByLang(lang, 'राशि अनुसार अक्षर', 'RASHI SOUNDS')}</Text>
      {rashiIndices.length > 1 ? <Text style={{ color: colors.inkMuted, fontFamily: scriptBodyFont(lang, typography.meaning.fontFamily), fontSize: 11, lineHeight: 17 }}>{meaningByLang(lang, 'इस दिन चन्द्रमा ने राशि भी बदली — दोनों राशियों के अक्षर नीचे हैं।', 'The Moon also changed rashi during this day, so both rashis are shown.')}</Text> : null}
      {rashiIndices.map((rashiIndex) => (
        <RashiSoundsCard
          key={rashiIndex}
          rashiIndex={rashiIndex}
          lang={lang}
          currentCharanas={currentCharanas}
          onOpenCharana={(entry) => navigation.navigate('NamkaranResult', { basis: { kind: 'manual', nakshatraIndex: entry.nakshatraIndex, pada: entry.pada } })}
          onOpenRashi={() => navigation.navigate('NamkaranRashi', {
            rashiIndex,
            // Carry the day's charanas so the detail cannot reopen one of them
            // as a settled, shareable answer.
            ...(result.kind === 'range' || fromUnknownTime ? { dayCharanas: [...currentCharanas] } : {}),
          })}
        />
      ))}
      <Text maxFontSizeMultiplier={1.25} style={{ color: colors.inkMuted, fontFamily: scriptBodyFont(lang, typography.meaning.fontFamily), fontSize: 11, lineHeight: 17 }}>{meaningByLang(lang, 'कुछ परिवार चरण के बजाय चन्द्र राशि से नाम रखते हैं; दोनों परम्पराएँ प्रचलित हैं।', 'Some families name by Moon rashi rather than charana; both traditions are in use.')}</Text>
      {shareAllowed ? (
        <>
          {shortlistedNames.length ? <View style={[styles.shareOptIn, { borderColor: colors.divider, borderRadius: radii.md }]}><View style={{ flex: 1 }}><Text style={[styles.noticeTitle, microLabel, { color: colors.ink }]}>{contentByLang(lang, 'चुने नाम शेयर में जोड़ें', 'INCLUDE SHORTLIST')}</Text><Text style={{ color: colors.inkMuted, fontFamily: scriptBodyFont(lang, typography.meaning.fontFamily), fontSize: 10, lineHeight: 15 }}>{meaningByLang(lang, 'इसे हर शेयर के लिए अलग से चुनना होगा। जन्म तिथि और समय कभी शामिल नहीं होते।', 'This is a per-share opt-in. Birth date and time are never included.')}</Text></View><Switch value={includeShortlist} onValueChange={setIncludeShortlist} accessibilityLabel="Include shortlisted names in this share" trackColor={{ false: colors.divider, true: colors.saffron }} thumbColor={colors.parchment} /></View> : null}
          <Pressable onPress={() => setShareVisible(true)} accessibilityRole="button" accessibilityLabel="Preview privacy-safe Namkaran share card" style={[styles.primary, { backgroundColor: colors.saffronDeep, borderRadius: radii.pill }]}><Text style={[styles.primaryText, { color: colors.onPrimary }]}>{contentByLang(lang, 'शेयर कार्ड देखें', 'Preview share card')}</Text></Pressable>
        </>
      ) : null}
      <ListCard leading={<CardThumb><Text style={[styles.thumbText, { color: colors.saffronDeep }]}>मु</Text></CardThumb>} onPress={() => navigation.navigate('MuhuratResults', { occasionId: 'namkaran' })} accessibilityLabel="Open Namkaran Muhurat"><Text style={{ color: colors.ink, fontFamily: scriptTitleFont(lang, typography.readerTitle.fontFamily), fontSize: 16 }}>{contentByLang(lang, 'नामकरण मुहूर्त', 'Namkaran Muhurat')}</Text><Text style={{ color: colors.inkMuted, fontFamily: scriptBodyFont(lang, typography.meaning.fontFamily), fontSize: 11, lineHeight: 17 }}>{meaningByLang(lang, 'शुभ नामकरण-समारोह दिन देखें।', 'Browse suitable naming-ceremony days.')}</Text></ListCard>
      <Pressable onPress={() => navigation.goBack()} accessibilityRole="button" accessibilityLabel="Edit Namkaran details" style={[styles.secondary, { borderColor: colors.divider, borderRadius: radii.pill }]}><Text style={[styles.primaryText, { color: colors.saffronDeep }]}>{contentByLang(lang, 'विवरण बदलें', 'Edit details')}</Text></Pressable>
      {shortlistError ? <Text style={[styles.empty, { color: colors.avoidDeep }]}>{contentByLang(lang, 'चुने नाम सहेजे नहीं जा सके।', 'The shortlist could not be saved.')}</Text> : null}
    </View>
  );

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.parchment }]} edges={['top', 'bottom']}>
      <ReaderHeader title={contentByLang(lang, 'नामाक्षर', 'Namakshar')} variant="index" onBack={navigation.goBack} backAccessibilityLabel="Back to Namkaran input" />
      <FlatList
        testID="namkaran-name-list"
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: spacing.readingGutter, paddingBottom: 36 }}
        ListHeaderComponent={header}
        ListFooterComponent={footer}
        renderItem={({ item }) => <NameRow name={item} lang={lang} shortlisted={shortlistIds.includes(item.id)} onOpen={() => setSelectedName(item)} onToggle={() => toggleShortlist(item.id)} />}
      />
      <NameDetailSheet name={selectedName} lang={lang} shortlisted={Boolean(selectedName && shortlistIds.includes(selectedName.id))} onToggle={() => { if (selectedName) toggleShortlist(selectedName.id); }} onClose={() => setSelectedName(null)} onOpenDeity={(deityId) => { setSelectedName(null); rootNav.navigate('HomeTab', { screen: 'DeityDetail', params: { deityId } }); }} />
      {shareModel ? <JyotishShareSheet visible={shareVisible} lang={lang} titleHi="नामाक्षर साझा करें" titleEn="Share Namakshar" privacyHi={includeShortlist ? 'आपके चुने नाम शामिल होंगे। जन्म तिथि, समय और अन्य निजी विवरण शामिल नहीं हैं।' : 'केवल नामाक्षर, नक्षत्र, पद और राशि साझा होंगे। जन्म विवरण शामिल नहीं हैं।'} privacyEn={includeShortlist ? 'Your shortlisted names will be included. Birth date, time, and other private details are excluded.' : 'Only namakshar, nakshatra, pada, and rashi are shared. Birth details are excluded.'} onClose={() => setShareVisible(false)} renderCard={(width) => <NamkaranShareCard width={width} lang={lang} model={shareModel} />} /> : null}
    </SafeAreaView>
  );
}

/**
 * The rashi cross-check (PRD-17 §5.4), rendered as nine *charana* cells rather
 * than a flattened syllable strip. Two reasons: a charana is the unit that maps
 * to names, so every cell can be a real destination; and flattening breaks the
 * 3×3 shape wherever a charana carries alternates (Shravana's ज/ख series gives
 * Makara thirteen syllables across its nine charanas).
 */
function RashiSoundsCard({ rashiIndex, lang, currentCharanas, onOpenCharana, onOpenRashi }: {
  rashiIndex: number;
  lang: Lang;
  /** Charanas this result already shows. Their cells mark as current instead of
   * navigating — pushing a duplicate of the screen you are reading is not a
   * destination, and the names for them are already in the list above. */
  currentCharanas: ReadonlySet<number>;
  onOpenCharana: (entry: CharanaEntry) => void;
  onOpenRashi: () => void;
}) {
  const { colors, radii, typography } = useTheme();
  const entries = rashiCharanaEntries(rashiIndex);
  return (
    <View testID={`namkaran-rashi-card-${rashiIndex}`} style={[styles.rashi, { borderColor: colors.divider, borderRadius: radii.lg }]}>
      <Text maxFontSizeMultiplier={1.25} style={{ color: colors.ink, fontFamily: scriptTitleFont(lang, typography.readerTitle.fontFamily), fontSize: 18 }}>{contentByLang(lang, RASHI_NAMES_HI[rashiIndex], RASHI_NAMES_EN[rashiIndex])}</Text>
      <View style={styles.rashiGrid}>
        {entries.map((entry) => {
          const hi = entry.syllables.map((value) => value.hi).join(' / ');
          const latin = entry.syllables.map((value) => value.latin).join(' / ');
          const current = currentCharanas.has(entry.charanaIndex);
          const glyphSize = hi.length > 3 ? 12 : current ? 15 : 17;
          const glyph = (
            <Text maxFontSizeMultiplier={1.15} style={{ color: colors.saffronDeep, fontFamily: fontFamilies.devanagariBold, fontSize: glyphSize }}>{hi}</Text>
          );
          // Word + tint, never tint alone (§12): the current cell is legible in
          // greyscale by its "यही · this one" caption, not by its fill.
          if (current) {
            return (
              <View
                key={entry.charanaIndex}
                testID={`namkaran-rashi-sound-${entry.charanaIndex}`}
                accessibilityRole="summary"
                accessibilityLabel={`${NAKSHATRA_NAMES_EN[entry.nakshatraIndex]} pada ${entry.pada}, ${latin}. This result.`}
                style={[styles.rashiSyllable, styles.rashiSyllableCurrent, { backgroundColor: colors.goldChipBg, borderColor: colors.gold, borderRadius: radii.sm }]}
              >
                {glyph}
                <Text maxFontSizeMultiplier={1.15} style={[styles.rashiCurrentTag, indicSafeTag(lang), { color: colors.inkMuted }]}>{contentByLang(lang, 'यही', 'this one')}</Text>
              </View>
            );
          }
          return (
            <Pressable
              key={entry.charanaIndex}
              testID={`namkaran-rashi-sound-${entry.charanaIndex}`}
              onPress={() => onOpenCharana(entry)}
              accessibilityRole="button"
              accessibilityLabel={`${NAKSHATRA_NAMES_EN[entry.nakshatraIndex]} pada ${entry.pada}, ${latin}. Open names.`}
              style={({ pressed }) => [styles.rashiSyllable, { backgroundColor: colors.saffronTint, borderColor: colors.goldTint, borderRadius: radii.sm }, pressed && { opacity: 0.72 }]}
            >
              {glyph}
            </Pressable>
          );
        })}
      </View>
      <Pressable
        onPress={onOpenRashi}
        accessibilityRole="button"
        accessibilityLabel={`Open ${RASHI_NAMES_EN[rashiIndex]} rashi naming detail`}
        style={styles.rashiDetail}
      >
        <Text maxFontSizeMultiplier={1.25} style={[styles.rashiDetailText, { color: colors.saffronDeep }]}>{contentByLang(lang, 'इस राशि का विवरण', 'Rashi naming detail')}</Text>
        <Text style={{ color: colors.saffronDeep, fontSize: 18 }}>›</Text>
      </Pressable>
    </View>
  );
}

/**
 * A candidate is a destination, not a verdict. Opening one shows that charana's
 * namakshar card, context and names — what the parent came for — while the row
 * itself stays uniform with its siblings (no rank, no emphasis) and the opened
 * screen keeps its uncertain provenance and offers no exact share.
 */
function CandidateRow({ candidate, lang, onPress }: { candidate: CharanaCandidate; lang: Lang; onPress: () => void }) {
  const { colors, typography } = useTheme();
  const syllable = candidate.entry.syllables[0];
  return <ListCard testID="namkaran-candidate-row" leading={<CardThumb><Text style={{ color: colors.saffronDeep, fontFamily: fontFamilies.devanagariBold, fontSize: 20 }}>{syllable.hi}</Text></CardThumb>} onPress={onPress} accessibilityLabel={`${formatWindow(candidate)}. ${NAKSHATRA_NAMES_EN[candidate.entry.nakshatraIndex]}, pada ${candidate.entry.pada}, ${syllable.latin}. Open namakshar.`}><Text style={[styles.window, { color: colors.saffronDeep }]}>{formatWindow(candidate)}</Text><Text style={{ color: colors.ink, fontFamily: scriptTitleFont(lang, typography.readerTitle.fontFamily), fontSize: 15 }}>{contentByLang(lang, `${NAKSHATRA_NAMES_HI[candidate.entry.nakshatraIndex]} · पद ${candidate.entry.pada} → ${syllable.hi}`, `${NAKSHATRA_NAMES_EN[candidate.entry.nakshatraIndex]} · Pada ${candidate.entry.pada} → ${syllable.latin}`)}</Text></ListCard>;
}

function NameRow({ name, lang, shortlisted, onOpen, onToggle }: { name: NameRecord; lang: Lang; shortlisted: boolean; onOpen: () => void; onToggle: () => void }) {
  const { colors, typography } = useTheme();
  return <View style={styles.nameRow}>
    <ListCard leading={<CardThumb><Text maxFontSizeMultiplier={1.25} style={[styles.thumbText, { color: colors.saffronDeep }]}>{name.hi.slice(0, 1)}</Text></CardThumb>} onPress={onOpen} accessibilityLabel={`Open name ${name.latin}. ${name.meaningEn}`} right={<View style={styles.starSpace} />} style={shortlisted ? styles.shortlistedRow : undefined}><Text maxFontSizeMultiplier={1.25} numberOfLines={1} style={{ color: colors.ink, fontFamily: scriptTitleFont(lang, typography.readerTitle.fontFamily), fontSize: 17 }}>{name.hi}</Text><Text maxFontSizeMultiplier={1.25} numberOfLines={2} style={{ color: colors.inkMuted, fontFamily: scriptBodyFont(lang, typography.meaning.fontFamily), fontSize: 11, lineHeight: 17 }}>{name.latin} · {meaningByLang(lang, name.meaningHi, name.meaningEn)}</Text></ListCard>
    <ShortlistStar shortlisted={shortlisted} latin={name.latin} onToggle={onToggle} />
  </View>;
}

// The shortlist toggle is the prototype's ☆/★ star in the ListCard's trailing
// slot — a fill change (greyscale-legible per PRD §10), not a text pill.
function ShortlistStar({ shortlisted, latin, onToggle }: { shortlisted: boolean; latin: string; onToggle: () => void }) {
  const { colors, radii } = useTheme();
  return <Pressable onPress={onToggle} accessibilityRole="button" accessibilityState={{ selected: shortlisted }} accessibilityLabel={`${shortlisted ? 'Remove' : 'Add'} ${latin} ${shortlisted ? 'from' : 'to'} shortlist`} hitSlop={8} style={[styles.star, { borderColor: shortlisted ? colors.gold : colors.goldTint, backgroundColor: shortlisted ? colors.goldChipBg : colors.parchmentSoft, borderRadius: radii.pill }]}><Text style={[styles.starGlyph, { color: shortlisted ? colors.saffronDeep : colors.gold }]}>{shortlisted ? '★' : '☆'}</Text></Pressable>;
}

function FilterButton({ selected, label, accessibilityLabel, onPress }: { selected: boolean; label: string; accessibilityLabel: string; onPress: () => void }) {
  const { colors, radii } = useTheme();
  return <Pressable onPress={onPress} accessibilityRole="button" accessibilityState={{ selected }} accessibilityLabel={accessibilityLabel} style={[styles.filter, { borderColor: selected ? colors.saffronDeep : colors.divider, backgroundColor: selected ? colors.saffronTint : colors.parchmentSoft, borderRadius: radii.pill }]}><Text maxFontSizeMultiplier={1.15} numberOfLines={1} style={[styles.filterText, { color: selected ? colors.saffronDeep : colors.inkMuted }]}>{label}</Text></Pressable>;
}

const styles = StyleSheet.create({
  root: { flex: 1 }, center: { alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24 },
  // `gap` only spaces the header's own children, so the first name row used to
  // butt straight against the length-filter chips — close enough that the card's
  // shadow bled over them and the two read as one overlapping block. The padding
  // gives row 1 the same clearance the rows have from each other.
  headerContent: { gap: 14, paddingBottom: 14 }, footer: { gap: 14, paddingTop: 6 },
  notice: { borderWidth: 1, padding: 12, gap: 4 }, disclosure: { minHeight: 36, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  // Font family/size/tracking/case for both micro labels come from
  // `pillTextStyle` at the call sites (script-aware, design.md §3.0); these
  // entries hold only layout and the ≥1.4× leading the 10 pt floor requires.
  noticeTitle: { lineHeight: 16, flexShrink: 1 },
  section: { lineHeight: 16, marginTop: 4 }, filters: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  filter: { minHeight: 44, paddingHorizontal: 13, borderWidth: 1, justifyContent: 'center' }, filterText: { fontFamily: fontFamilies.interSemiBold, fontSize: 11 },
  emptyState: { alignItems: 'center', gap: 4 }, empty: { fontFamily: fontFamilies.inter, fontSize: 12, lineHeight: 18, textAlign: 'center', paddingVertical: 12 }, resetFilters: { minHeight: 44, borderWidth: 1, paddingHorizontal: 16, alignItems: 'center', justifyContent: 'center' }, resetText: { fontFamily: fontFamilies.interSemiBold, fontSize: 12 }, window: { fontFamily: fontFamilies.interSemiBold, fontSize: 10, lineHeight: 15 },
  thumbText: { fontFamily: fontFamilies.devanagariBold, fontSize: 18 }, nameRow: { position: 'relative' }, starSpace: { width: 44, height: 44 }, star: { position: 'absolute', right: 16, top: 16, width: 44, height: 44, borderWidth: 1, alignItems: 'center', justifyContent: 'center' }, starGlyph: { fontSize: 18, includeFontPadding: false }, shortlistedRow: { opacity: 0.92 },
  rashi: { borderWidth: 1, padding: 14 }, rashiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginTop: 10 },
  // The cells are tap targets now, so they carry the 44 pt floor (design.md §12).
  rashiSyllable: { width: '31%', minHeight: 44, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  // The tag holds the documented 10 pt chrome floor (§3.0), so the current cell
  // is a little taller than its siblings — the grid rows size to the tallest.
  rashiSyllableCurrent: { borderWidth: 1.5, paddingVertical: 5 },
  rashiCurrentTag: { fontSize: 10, lineHeight: 14, marginTop: 1 },
  rashiDetail: { minHeight: 44, marginTop: 6, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  rashiDetailText: { fontFamily: fontFamilies.interSemiBold, fontSize: 12 },
  shareOptIn: { borderWidth: 1, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 10 },
  primary: { minHeight: 50, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 18 }, secondary: { minHeight: 48, borderWidth: 1, alignItems: 'center', justifyContent: 'center' }, primaryText: { fontFamily: fontFamilies.interSemiBold, fontSize: 13 },
});
