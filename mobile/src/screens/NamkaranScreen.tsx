import React, { useCallback, useEffect, useState } from 'react';
import { Dimensions, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import BirthDetailsForm from '@/components/BirthDetailsForm';
import CategoryCard from '@/components/CategoryCard';
import ListCard, { CardThumb } from '@/components/ListCard';
import ReaderHeader from '@/components/ReaderHeader';
import { useGitaLanguage, type Lang } from '@/data/gita/language';
import type { PanchangStackParamList } from '@/navigation/types';
import { GRAHA_NAMES_EN, GRAHA_NAMES_HI, RASHI_NAMES_EN, RASHI_NAMES_HI } from '@/panchang/kundali';
import { NAKSHATRA_NAMES_EN, NAKSHATRA_NAMES_HI } from '@/panchang/names';
import { CHARANA_TABLE, NAKSHATRA_ATTRS, type CharanaEntry } from '@/panchang/namkaranConvention';
import {
  clearRememberedNamkaranSession,
  loadRememberedNamkaranSession,
  saveRememberedNamkaranSession,
  validateNamkaranInput,
  type NamkaranInput,
  type NamkaranInputErrors,
} from '@/panchang/namkaranState';
import { useTheme } from '@/theme/ThemeContext';
import { fontFamilies } from '@/theme/typography';
import { contentByLang, meaningByLang } from '@/utils/localize';
import { scriptBodyFont, scriptTitleFont } from '@/utils/langType';

type Props = NativeStackScreenProps<PanchangStackParamList, 'Namkaran'>;
type BrowseMode = 'landing' | 'nakshatra' | 'rashi' | 'all';

const EMPTY_INPUT: NamkaranInput = { date: '', time: '' };

export default function NamkaranScreen({ navigation }: Props) {
  const { colors, typography, radii, spacing } = useTheme();
  const { lang } = useGitaLanguage();
  const [input, setInput] = useState<NamkaranInput>(EMPTY_INPUT);
  const [errors, setErrors] = useState<NamkaranInputErrors>({});
  const [remember, setRemember] = useState(false);
  const [hasSaved, setHasSaved] = useState(false);
  const [message, setMessage] = useState('');
  const [browseMode, setBrowseMode] = useState<BrowseMode>('landing');
  const [selectedNakshatra, setSelectedNakshatra] = useState<number | null>(null);

  useEffect(() => {
    let active = true;
    void loadRememberedNamkaranSession().then((saved) => {
      if (!active || !saved) return;
      setInput(saved);
      setRemember(true);
      setHasSaved(true);
      setMessage(contentByLang(lang, 'सहेजे गए विवरण लोड हुए।', 'Saved details loaded.'));
    }).catch(() => { if (active) setMessage(contentByLang(lang, 'सहेजे विवरण पढ़े नहीं जा सके।', 'Remembered details could not be read.')); });
    return () => { active = false; };
  }, [lang]);

  const clearSaved = useCallback(() => {
    void clearRememberedNamkaranSession().then(() => {
      setRemember(false);
      setHasSaved(false);
      setMessage(contentByLang(lang, 'सहेजे जन्म विवरण हटा दिए गए।', 'Remembered birth details cleared.'));
    }).catch(() => setMessage(contentByLang(lang, 'सहेजे विवरण हटाए नहीं जा सके।', 'Remembered details could not be cleared.')));
  }, [lang]);

  const calculate = useCallback(() => {
    const nextErrors = validateNamkaranInput(input);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    if (remember) {
      void saveRememberedNamkaranSession(input).then(() => {
        setHasSaved(true);
      }).catch(() => setMessage(contentByLang(lang, 'जन्म विवरण सहेजे नहीं जा सके।', 'Birth details could not be remembered.')));
    } else {
      void clearRememberedNamkaranSession();
    }
    navigation.navigate('NamkaranResult', { basis: { kind: 'birth', ...input } });
  }, [input, lang, navigation, remember]);

  const openManual = (nakshatraIndex: number, pada: 1 | 2 | 3 | 4) => {
    navigation.navigate('NamkaranResult', { basis: { kind: 'manual', nakshatraIndex, pada } });
  };

  const openRashi = (rashiIndex: number) => {
    navigation.navigate('NamkaranRashi', { rashiIndex });
  };

  const title = contentByLang(lang, 'नामकरण', 'Namkaran');
  const nakshatraGridGap = 10;
  // Floor the exact division: sub-pixel rounding can otherwise push the third
  // launcher onto the next row on 3x-density iPhones.
  const nakshatraTileWidth = Math.floor((Dimensions.get('window').width - 2 * spacing.readingGutter - 2 * nakshatraGridGap) / 3) - 1;
  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.parchment }]} edges={['top', 'bottom']}>
      <ReaderHeader title={title} variant="index" onBack={browseMode === 'landing' ? navigation.goBack : () => { setBrowseMode('landing'); setSelectedNakshatra(null); }} backAccessibilityLabel={browseMode === 'landing' ? 'Back to Jyotish' : 'Back to Namkaran start'} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={[styles.content, { paddingHorizontal: spacing.readingGutter }]}>
          {browseMode === 'landing' ? (
            <>
              <View>
                <Text style={{ color: colors.ink, fontFamily: scriptTitleFont(lang, typography.readerTitle.fontFamily), fontSize: 25 }}>{contentByLang(lang, 'नाम का पारम्परिक आरम्भ', 'A traditional starting sound')}</Text>
                <Text style={{ color: colors.inkMuted, fontFamily: scriptBodyFont(lang, typography.meaning.fontFamily), fontSize: 13, lineHeight: 20, marginTop: 5 }}>{meaningByLang(lang, 'जन्म क्षण के चन्द्र-चरण से नामाक्षर पाएँ, या बिना जन्म विवरण के नक्षत्र से देखें।', 'Find the namakshar from the Moon at birth, or browse by nakshatra without entering birth details.')}</Text>
              </View>
              <BirthDetailsForm role="child" lang={lang} value={input} onChange={(value) => { setInput({ date: value.date, time: value.time }); setErrors({}); }} errors={errors} />
              <View style={[styles.remember, { borderColor: colors.divider, borderRadius: radii.md }]}>
                <View style={{ flex: 1 }}><Text style={[styles.controlTitle, { color: colors.ink }]}>{contentByLang(lang, 'जन्म विवरण याद रखें', 'Remember birth details')}</Text><Text style={{ color: colors.inkMuted, fontFamily: scriptBodyFont(lang, typography.meaning.fontFamily), fontSize: 11, lineHeight: 16 }}>{meaningByLang(lang, 'अगली बार यह फ़ॉर्म पहले से भरा मिलेगा।', 'Prefill this form next time.')}</Text></View>
                <Switch value={remember} onValueChange={(next) => { setRemember(next); if (!next) clearSaved(); }} accessibilityLabel="Remember newborn birth details" trackColor={{ false: colors.divider, true: colors.saffron }} thumbColor={colors.parchment} ios_backgroundColor={colors.divider} />
              </View>
              {hasSaved ? <Pressable onPress={clearSaved} accessibilityRole="button" accessibilityLabel="Clear remembered newborn birth details" style={styles.clear}><Text style={[styles.controlTitle, { color: colors.avoidDeep }]}>{contentByLang(lang, 'सहेजे जन्म विवरण हटाएँ', 'Clear remembered birth details')}</Text></Pressable> : null}
              {message ? <Text accessibilityLiveRegion="polite" style={[styles.message, { color: colors.inkMuted }]}>{message}</Text> : null}
              <Pressable onPress={calculate} accessibilityRole="button" accessibilityLabel="Calculate Namkaran syllable" style={({ pressed }) => [styles.primary, { backgroundColor: colors.saffronDeep, borderRadius: radii.pill }, pressed && { opacity: 0.72 }]}><Text style={[styles.primaryText, { color: colors.onPrimary }]}>{contentByLang(lang, 'नामाक्षर निकालें', 'Find namakshar')}</Text></Pressable>
              <Text style={[styles.section, { color: colors.inkMuted }]}>{contentByLang(lang, 'बिना जन्म विवरण', 'WITHOUT BIRTH DETAILS')}</Text>
              <BrowseDoor glyph="न" titleHi="नक्षत्र से चुनें" titleEn="Choose by nakshatra" bodyHi="नक्षत्र और पद पहले से जानते हैं तो सीधे नाम देखें।" bodyEn="If you know the nakshatra and pada, go straight to names." onPress={() => setBrowseMode('nakshatra')} />
              {/* Rashi is a peer door, not a second answer: many families are
                  told the Moon sign rather than the charana, and a rashi is
                  exactly nine charanas of the same table (convention §4). */}
              <BrowseDoor glyph="रा" titleHi="राशि से चुनें" titleEn="Choose by rashi" bodyHi="चन्द्र राशि पता है तो उसके नौ चरण और अक्षर देखें।" bodyEn="Know the Moon rashi? See its nine charanas and their sounds." onPress={() => setBrowseMode('rashi')} />
              <BrowseDoor glyph="१०८" titleHi="सभी नामाक्षर" titleEn="Browse all 108" bodyHi="पूरी नक्षत्र-पद तालिका से कोई भी अक्षर चुनें।" bodyEn="Choose any sound from the complete nakshatra-pada index." onPress={() => setBrowseMode('all')} />
            </>
          ) : browseMode === 'nakshatra' ? (
            <>
              <Text style={[styles.section, { color: colors.inkMuted }]}>{contentByLang(lang, 'नक्षत्र चुनें', 'CHOOSE NAKSHATRA')}</Text>
              {selectedNakshatra === null ? (
                <View testID="namkaran-nakshatra-grid" style={[styles.nakshatraGrid, { gap: nakshatraGridGap }]}>
                  {NAKSHATRA_NAMES_HI.map((name, index) => (
                    <View key={name} testID={`namkaran-nakshatra-${index + 1}`} style={{ width: nakshatraTileWidth }}>
                      <CategoryCard
                        nameHi={name}
                        nameEn={NAKSHATRA_NAMES_EN[index]}
                        status="active"
                        variant="launcher"
                        launcherLabelLines={2}
                        launcherLabelPosition="tile"
                        onPress={() => setSelectedNakshatra(index)}
                      />
                    </View>
                  ))}
                </View>
              ) : (
                <>
                  <Text style={{ color: colors.ink, fontFamily: scriptTitleFont(lang, typography.readerTitle.fontFamily), fontSize: 22 }}>{contentByLang(lang, NAKSHATRA_NAMES_HI[selectedNakshatra], NAKSHATRA_NAMES_EN[selectedNakshatra])}</Text>
                  {[1, 2, 3, 4].map((pada) => {
                    const entry = CHARANA_TABLE[selectedNakshatra * 4 + pada - 1];
                    return <BrowseDoor key={pada} glyph={entry.syllables[0].hi} titleHi={`पद ${pada}`} titleEn={`Pada ${pada}`} bodyHi={entry.syllables.map((value) => value.hi).join(' · ')} bodyEn={entry.syllables.map((value) => value.latin).join(' · ')} onPress={() => openManual(selectedNakshatra, pada as 1 | 2 | 3 | 4)} />;
                  })}
                </>
              )}
            </>
          ) : browseMode === 'rashi' ? (
            <>
              <Text style={[styles.section, { color: colors.inkMuted }]}>{contentByLang(lang, 'राशि चुनें', 'CHOOSE RASHI')}</Text>
              <Text style={{ color: colors.inkMuted, fontFamily: scriptBodyFont(lang, typography.meaning.fontFamily), fontSize: 11, lineHeight: 16, marginTop: -6 }}>{meaningByLang(lang, 'हर राशि नौ चरणों की होती है — उसी नक्षत्र-पद तालिका से।', 'Each rashi holds nine charanas of the same nakshatra-pada table.')}</Text>
              <View testID="namkaran-rashi-grid" style={[styles.nakshatraGrid, { gap: nakshatraGridGap }]}>
                {RASHI_NAMES_HI.map((name, index) => (
                  <View key={name} testID={`namkaran-rashi-${index + 1}`} style={{ width: nakshatraTileWidth }}>
                    <CategoryCard
                      nameHi={name}
                      nameEn={RASHI_NAMES_EN[index]}
                      status="active"
                      variant="launcher"
                      launcherLabelLines={2}
                      launcherLabelPosition="tile"
                      onPress={() => openRashi(index)}
                    />
                  </View>
                ))}
              </View>
            </>
          ) : (
            <>
              <Text style={[styles.section, { color: colors.inkMuted }]}>{contentByLang(lang, 'सभी १०८ नामाक्षर', 'ALL 108 NAMAKSHAR')}</Text>
              <Text style={{ color: colors.inkMuted, fontFamily: scriptBodyFont(lang, typography.meaning.fontFamily), fontSize: 11, lineHeight: 16, marginTop: -6 }}>{meaningByLang(lang, 'कोई जन्म विवरण आवश्यक नहीं — किसी भी अक्षर पर टैप करें।', 'No birth details needed — tap any sound.')}</Text>
              <View testID="namkaran-all-grid" style={styles.allGrid}>
                {NAKSHATRA_NAMES_HI.map((_, nakshatraIndex) => <NakshatraIndexGroup key={nakshatraIndex} nakshatraIndex={nakshatraIndex} lang={lang} onPick={openManual} />)}
              </View>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function BrowseDoor({ glyph, titleHi, titleEn, bodyHi, bodyEn, onPress }: { glyph: string; titleHi: string; titleEn: string; bodyHi: string; bodyEn: string; onPress: () => void }) {
  const { colors, typography } = useTheme();
  const { lang } = useGitaLanguage();
  return <ListCard leading={<CardThumb><Text maxFontSizeMultiplier={1.25} style={{ color: colors.saffronDeep, fontFamily: fontFamilies.devanagariBold, fontSize: glyph.length > 2 ? 12 : 18 }}>{glyph}</Text></CardThumb>} onPress={onPress} accessibilityLabel={`${titleEn}. ${bodyEn}`}><Text maxFontSizeMultiplier={1.25} style={{ color: colors.ink, fontFamily: scriptTitleFont(lang, typography.readerTitle.fontFamily), fontSize: 16 }}>{contentByLang(lang, titleHi, titleEn)}</Text><Text maxFontSizeMultiplier={1.25} numberOfLines={2} style={{ color: colors.inkMuted, fontFamily: scriptBodyFont(lang, typography.meaning.fontFamily), fontSize: 11, lineHeight: 17, marginTop: 3 }}>{meaningByLang(lang, bodyHi, bodyEn)}</Text></ListCard>;
}

const GANA_LABELS: Record<'dev' | 'manushya' | 'rakshasa', { hi: string; en: string }> = {
  dev: { hi: 'देव', en: 'Dev' },
  manushya: { hi: 'मनुष्य', en: 'Manushya' },
  rakshasa: { hi: 'राक्षस', en: 'Rakshasa' },
};

// The "all 108" browse is a grid grouped by nakshatra (design.md prototype §
// guest-108): a group header + a row of four tappable pada cells — not a flat
// list of full-width rows. Each cell lands on the same manual result.
function NakshatraIndexGroup({ nakshatraIndex, lang, onPick }: { nakshatraIndex: number; lang: Lang; onPick: (nakshatraIndex: number, pada: 1 | 2 | 3 | 4) => void }) {
  const { colors, typography } = useTheme();
  const attrs = NAKSHATRA_ATTRS[nakshatraIndex];
  const meta = `${NAKSHATRA_NAMES_EN[nakshatraIndex]} · ${contentByLang(lang, GRAHA_NAMES_HI[attrs.lord], GRAHA_NAMES_EN[attrs.lord])} · ${contentByLang(lang, GANA_LABELS[attrs.gana].hi, GANA_LABELS[attrs.gana].en)}`;
  return (
    <View testID={`namkaran-all-group-${nakshatraIndex + 1}`}>
      <View style={styles.idxHeader}>
        <Text style={{ color: colors.ink, fontFamily: scriptTitleFont(lang, typography.readerTitle.fontFamily), fontSize: 14 }}>{nakshatraIndex + 1} · {contentByLang(lang, NAKSHATRA_NAMES_HI[nakshatraIndex], NAKSHATRA_NAMES_EN[nakshatraIndex])}</Text>
        <Text numberOfLines={1} style={{ color: colors.inkMuted, fontFamily: scriptBodyFont(lang, typography.meaning.fontFamily), fontSize: 11, flexShrink: 1, textAlign: 'right', marginLeft: 8 }}>{meta}</Text>
      </View>
      <View style={styles.idxRow}>
        {[1, 2, 3, 4].map((pada) => (
          <PadaCell key={pada} entry={CHARANA_TABLE[nakshatraIndex * 4 + pada - 1]} pada={pada as 1 | 2 | 3 | 4} nakshatraIndex={nakshatraIndex} lang={lang} onPress={() => onPick(nakshatraIndex, pada as 1 | 2 | 3 | 4)} />
        ))}
      </View>
    </View>
  );
}

function PadaCell({ entry, pada, nakshatraIndex, lang, onPress }: { entry: CharanaEntry; pada: 1 | 2 | 3 | 4; nakshatraIndex: number; lang: Lang; onPress: () => void }) {
  const { colors, radii } = useTheme();
  const syllables = entry.syllables.map((value) => value.hi).join(' / ');
  const latin = entry.syllables.map((value) => value.latin).join(' / ');
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${NAKSHATRA_NAMES_EN[nakshatraIndex]} pada ${pada}, ${latin}. Tap to open.`}
      style={({ pressed }) => [styles.idxCell, { borderColor: colors.divider, backgroundColor: colors.parchmentSoft, borderRadius: radii.md, borderStyle: entry.thin ? 'dashed' : 'solid' }, pressed && { opacity: 0.72 }]}
    >
      <Text style={[styles.idxCellPada, { color: colors.inkMuted, fontFamily: scriptBodyFont(lang, fontFamilies.interSemiBold), letterSpacing: lang === 'en' ? 0.4 : 0 }]}>{contentByLang(lang, `पद ${pada}`, `Pada ${pada}`)}</Text>
      <Text style={{ color: entry.thin ? colors.inkMuted : colors.ink, fontFamily: fontFamilies.devanagariBold, fontSize: syllables.length > 3 ? 13 : 17 }}>{syllables}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 }, content: { paddingBottom: 36, gap: 14 },
  nakshatraGrid: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'flex-start' },
  allGrid: { gap: 14 },
  idxHeader: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 6 },
  idxRow: { flexDirection: 'row', gap: 8 },
  idxCell: { flex: 1, minHeight: 56, borderWidth: 1, alignItems: 'center', justifyContent: 'center', gap: 2, paddingVertical: 6 },
  idxCellPada: { fontSize: 10, lineHeight: 14 },
  remember: { minHeight: 64, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 9, flexDirection: 'row', alignItems: 'center', gap: 10 },
  controlTitle: { fontFamily: fontFamilies.interSemiBold, fontSize: 12 }, clear: { minHeight: 44, justifyContent: 'center', alignSelf: 'flex-start' },
  message: { fontFamily: fontFamilies.inter, fontSize: 11 }, primary: { minHeight: 50, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 18 },
  primaryText: { fontFamily: fontFamilies.interSemiBold, fontSize: 14 }, section: { fontFamily: fontFamilies.interSemiBold, fontSize: 10, letterSpacing: 1.2, marginTop: 8 },
});
