import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import Svg, { Circle } from 'react-native-svg';

import BirthDetailsForm from '@/components/BirthDetailsForm';
import GunaMilanShareCard from '@/components/GunaMilanShareCard';
import JyotishShareSheet from '@/components/JyotishShareSheet';
import ReaderHeader from '@/components/ReaderHeader';
import { useGitaLanguage, type Lang } from '@/data/gita/language';
import type { PanchangStackParamList } from '@/navigation/types';
import {
  calculateGunaMilan,
  type ExactGunaMilanResult,
  type GunaMilanPersonInput,
  type GunaMilanResult,
  type KootaId,
} from '@/panchang/gunaMilan';
import { localizedKootaInputList, localizedNakshatraList } from '@/panchang/gunaMilanDisplay';
import { buildGunaMilanShareModel } from '@/panchang/gunaMilanShare';
import {
  clearRememberedGunaMilanDraft,
  incrementGunaMilanMetric,
  loadRememberedGunaMilanDraft,
  saveRememberedGunaMilanDraft,
  validateGunaMilanPerson,
  type PersonInputErrors,
} from '@/panchang/gunaMilanState';
import { useKundali } from '@/panchang/useKundali';
import { useTheme } from '@/theme/ThemeContext';
import { fontFamilies } from '@/theme/typography';
import { contentByLang, meaningByLang } from '@/utils/localize';
import { scriptBodyFont, scriptTitleFont } from '@/utils/langType';

type Props = NativeStackScreenProps<PanchangStackParamList, 'GunaMilan'>;

const EMPTY_PERSON: GunaMilanPersonInput = { date: '', time: '' };

const KOOTA_COPY: Record<KootaId, { hi: string; en: string; detailHi: string; detailEn: string }> = {
  varna: { hi: 'वर्ण', en: 'Varna', detailHi: 'दोनों चन्द्र राशियों के पारम्परिक वर्ण-क्रम की वर से वधू दिशा में तुलना।', detailEn: 'Compares the traditional Moon-sign Varna order in the groom-to-bride direction.' },
  vashya: { hi: 'वश्य', en: 'Vashya', detailHi: 'चन्द्र राशि और धनु-मकर के ठीक १५° विभाजन से वश्य वर्ग।', detailEn: 'Uses Moon sign and the exact 15° Sagittarius/Capricorn Vashya splits.' },
  tara: { hi: 'तारा', en: 'Tara', detailHi: 'दोनों दिशाओं में जन्म नक्षत्रों की गिनती; हर अनुकूल दिशा के १.५ अंक।', detailEn: 'Counts birth stars in both directions; each favorable direction contributes 1.5.' },
  yoni: { hi: 'योनि', en: 'Yoni', detailHi: 'दोनों नक्षत्रों के पारम्परिक पशु-वर्ग की पूर्ण तालिका से तुलना।', detailEn: 'Compares the traditional animal classes using the complete matrix.' },
  grahaMaitri: { hi: 'ग्रह मैत्री', en: 'Graha Maitri', detailHi: 'दोनों चन्द्र राशियों के स्वामियों की पारम्परिक मैत्री।', detailEn: 'Uses the traditional relationship of both Moon-sign rulers.' },
  gana: { hi: 'गण', en: 'Gana', detailHi: 'देव, मनुष्य और राक्षस गण की दिशात्मक तालिका।', detailEn: 'Uses the directional Deva, Manushya, and Rakshasa matrix.' },
  bhakoot: { hi: 'भकूट', en: 'Bhakoot', detailHi: 'चन्द्र राशियों के २/१२, ५/९ और ६/८ सम्बन्ध की जाँच।', detailEn: 'Checks the Moon signs for 2/12, 5/9, and 6/8 relationships.' },
  nadi: { hi: 'नाड़ी', en: 'Nadi', detailHi: 'दोनों जन्म नक्षत्रों के आदि, मध्य या अन्त्य नाड़ी वर्ग की तुलना।', detailEn: 'Compares the Adi, Madhya, or Antya Nadi classes of both birth stars.' },
};

const BAND_COPY = {
  excellent: ['अति उत्तम', 'Excellent'],
  'very-good': ['बहुत अच्छा', 'Very good'],
  middling: ['मध्यम', 'Middling'],
  'below-reference': ['पारम्परिक अनुकूल सीमा से कम', 'Below the reference threshold'],
} as const;

function ScoreDial({ result, lang }: { result: ExactGunaMilanResult; lang: Lang }) {
  const { colors } = useTheme();
  const radius = 48;
  const circumference = 2 * Math.PI * radius;
  return (
    <View testID="guna-milan-score-dial" accessibilityRole="image" accessibilityLabel={contentByLang(lang, `३६ में से ${result.total}, ${BAND_COPY[result.band][0]}`, `${result.total} out of 36, ${BAND_COPY[result.band][1]}`)} style={styles.dialWrap}>
      <Svg width={118} height={118} viewBox="0 0 118 118">
        <Circle cx="59" cy="59" r={radius} fill="none" stroke={colors.divider} strokeWidth="8" />
        <Circle
          cx="59" cy="59" r={radius} fill="none" stroke={colors.saffronDeep} strokeWidth="8"
          strokeLinecap="round" strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={circumference * (1 - result.total / 36)} transform="rotate(-90 59 59)"
        />
      </Svg>
      <View style={styles.dialText}>
        <Text style={[styles.dialTotal, { color: colors.ink }]}>{result.total}</Text>
        <Text style={[styles.dialMax, { color: colors.inkMuted }]}>/ 36</Text>
      </View>
    </View>
  );
}

export default function GunaMilanScreen({ navigation }: Props) {
  const { colors, typography, radii, spacing } = useTheme();
  const { lang } = useGitaLanguage();
  const { profile: savedProfile } = useKundali();
  const [groom, setGroom] = useState<GunaMilanPersonInput>(EMPTY_PERSON);
  const [bride, setBride] = useState<GunaMilanPersonInput>(EMPTY_PERSON);
  const [groomErrors, setGroomErrors] = useState<PersonInputErrors>({});
  const [brideErrors, setBrideErrors] = useState<PersonInputErrors>({});
  const [remember, setRemember] = useState(false);
  const [hasRememberedDraft, setHasRememberedDraft] = useState(false);
  const [result, setResult] = useState<GunaMilanResult | null>(null);
  const [expanded, setExpanded] = useState<KootaId | null>(null);
  const [shareVisible, setShareVisible] = useState(false);
  const [storageMessage, setStorageMessage] = useState('');

  useEffect(() => {
    let active = true;
    void loadRememberedGunaMilanDraft().then((draft) => {
      if (!active || !draft) return;
      setGroom(draft.groom);
      setBride(draft.bride);
      setRemember(true);
      setHasRememberedDraft(true);
      setStorageMessage(contentByLang(lang, 'इस उपकरण से सहेजे गए विवरण लोड किए गए।', 'Remembered details loaded from this device.'));
    }).catch(() => undefined);
    return () => { active = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- capture mount-time language; the load message is transient.
  }, []);

  const fillFromSaved = useCallback((role: 'groom' | 'bride') => {
    if (!savedProfile) return;
    const copy: GunaMilanPersonInput = {
      ...(savedProfile.name ? { name: savedProfile.name } : {}),
      date: savedProfile.date,
      time: savedProfile.time,
    };
    if (role === 'groom') setGroom(copy);
    else setBride(copy);
    setResult(null);
  }, [savedProfile]);

  const calculate = useCallback(() => {
    const nextGroomErrors = validateGunaMilanPerson(groom);
    const nextBrideErrors = validateGunaMilanPerson(bride);
    setGroomErrors(nextGroomErrors);
    setBrideErrors(nextBrideErrors);
    if (Object.keys(nextGroomErrors).length || Object.keys(nextBrideErrors).length) return;
    void incrementGunaMilanMetric('started');
    const next = calculateGunaMilan(groom, bride);
    setResult(next);
    setExpanded(null);
    void incrementGunaMilanMetric('completed');
    if (remember) {
      void saveRememberedGunaMilanDraft({ groom, bride }).then(() => {
        setHasRememberedDraft(true);
        setStorageMessage(contentByLang(lang, 'इस उपकरण पर सहेजा गया।', 'Remembered on this device.'));
      }).catch(() => setStorageMessage(contentByLang(lang, 'ये विवरण सहेजे नहीं जा सके।', 'Could not remember these details.')));
    } else {
      void clearRememberedGunaMilanDraft();
    }
  }, [bride, groom, remember, lang]);

  const clearSaved = useCallback(() => {
    void clearRememberedGunaMilanDraft().then(() => {
      setRemember(false);
      setHasRememberedDraft(false);
      setStorageMessage(contentByLang(lang, 'सहेजा गया मिलान हटाया गया।', 'Remembered match cleared.'));
    });
  }, [lang]);

  const shareModel = useMemo(() => result?.kind === 'exact'
    ? buildGunaMilanShareModel(result, { groom: groom.name, bride: bride.name })
    : null, [bride.name, groom.name, result]);

  const title = contentByLang(lang, 'अष्टकूट मिलान', 'Guna Milan');
  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.parchment }]} edges={['top', 'bottom']}>
      <ReaderHeader title={title} variant="index" onBack={navigation.goBack} backAccessibilityLabel={contentByLang(lang, 'ज्योतिष पर वापस', 'Back to Jyotish')} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={[styles.content, { paddingHorizontal: spacing.readingGutter }]}> 
          {!result ? (
            <>
              <View style={styles.intro}>
                <Text style={{ color: colors.ink, fontFamily: scriptTitleFont(lang, typography.readerTitle.fontFamily), fontSize: 25 }}>
                  {contentByLang(lang, '३६ गुण — पूरा हिसाब सामने', '36 points, with every step visible')}
                </Text>
                <Text style={{ color: colors.inkMuted, fontFamily: scriptBodyFont(lang, typography.meaning.fontFamily), fontSize: 13, lineHeight: 20, marginTop: 5 }}>
                  {meaningByLang(lang, 'जन्म तिथि और समय IST (UTC+5:30) में भरें। स्थान आवश्यक नहीं है। गणना केवल इस उपकरण पर होती है।', 'Enter birth date and time in IST (UTC+5:30). No location is needed. Calculation stays on this device.')}
                </Text>
              </View>
              <BirthDetailsForm role="groom" lang={lang} value={groom} onChange={(value) => { setGroom(value); setResult(null); }} errors={groomErrors} savedAvailable={Boolean(savedProfile)} onUseSaved={() => fillFromSaved('groom')} />
              <BirthDetailsForm role="bride" lang={lang} value={bride} onChange={(value) => { setBride(value); setResult(null); }} errors={brideErrors} savedAvailable={Boolean(savedProfile)} onUseSaved={() => fillFromSaved('bride')} />
              <View style={[styles.rememberRow, { borderColor: colors.divider, borderRadius: radii.md }]}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: colors.ink, fontFamily: fontFamilies.interSemiBold, fontSize: 12 }}>{contentByLang(lang, 'इस उपकरण पर याद रखें', 'Remember on this device')}</Text>
                  <Text style={{ color: colors.inkMuted, fontFamily: scriptBodyFont(lang, typography.meaning.fontFamily), fontSize: 11, lineHeight: 16, marginTop: 2 }}>{meaningByLang(lang, 'डिफ़ॉल्ट रूप से विवरण केवल इस सत्र तक रहते हैं।', 'Details are session-only by default.')}</Text>
                </View>
                <Switch
                  value={remember}
                  onValueChange={(next) => {
                    setRemember(next);
                    if (!next) clearSaved();
                  }}
                  accessibilityLabel={contentByLang(lang, 'इस उपकरण पर मिलान विवरण याद रखें', 'Remember match details on this device')}
                />
              </View>
              {hasRememberedDraft ? <Pressable accessibilityRole="button" accessibilityLabel={contentByLang(lang, 'सहेजा गया मिलान हटाएँ', 'Clear remembered match')} onPress={clearSaved} style={styles.clearButton}><Text style={{ color: colors.avoidDeep, fontFamily: fontFamilies.interSemiBold, fontSize: 12 }}>{contentByLang(lang, 'सहेजा गया मिलान हटाएँ', 'Clear remembered match')}</Text></Pressable> : null}
              {storageMessage ? <Text accessibilityLiveRegion="polite" style={[styles.storageMessage, { color: colors.inkMuted }]}>{storageMessage}</Text> : null}
              <Pressable
                testID="guna-milan-calculate" onPress={calculate} accessibilityRole="button" accessibilityLabel={contentByLang(lang, 'गुण मिलान की गणना करें', 'Calculate Guna Milan')}
                style={({ pressed }) => [styles.primary, { backgroundColor: colors.saffronDeep, borderRadius: radii.pill }, pressed && { opacity: 0.72 }]}
              >
                <Text style={[styles.primaryText, { color: colors.onPrimary }]}>{contentByLang(lang, 'मिलान करें', 'Calculate match')}</Text>
              </Pressable>
            </>
          ) : (
            <View accessibilityLabel={result.kind === 'exact' ? contentByLang(lang, `गुण मिलान परिणाम, ३६ में से ${result.total}`, `Guna Milan result, ${result.total} out of 36`) : contentByLang(lang, `गुण मिलान अंक सीमा, ३६ में से ${result.minTotal} से ${result.maxTotal}`, `Guna Milan score range, ${result.minTotal} to ${result.maxTotal} out of 36`)}>
              <View style={[styles.resultHero, { backgroundColor: colors.parchmentSoft, borderColor: colors.divider, borderRadius: radii.lg }]}>
                {result.kind === 'exact' ? (
                  <>
                    <ScoreDial result={result} lang={lang} />
                    <Text style={{ color: colors.ink, fontFamily: scriptTitleFont(lang, typography.readerTitle.fontFamily), fontSize: 22, textAlign: 'center' }}>
                      {contentByLang(lang, BAND_COPY[result.band][0], BAND_COPY[result.band][1])}
                    </Text>
                    {result.allTimesChecked ? <Text style={[styles.checked, { color: colors.inkMuted }]}>{contentByLang(lang, 'पूरे IST दिन की सभी सम्भावनाओं में यही परिणाम', 'Same result across every checked IST time')}</Text> : null}
                  </>
                ) : (
                  <>
                    <Text style={[styles.range, { color: colors.ink }]}>{result.minTotal}–{result.maxTotal}</Text>
                    <Text style={[styles.rangeMax, { color: colors.inkMuted }]}>/ 36</Text>
                    <Text style={{ color: colors.avoidDeep, fontFamily: scriptTitleFont(lang, typography.readerTitle.fontFamily), fontSize: 17, textAlign: 'center', marginTop: 8 }}>{contentByLang(lang, 'सटीक समय आवश्यक', 'Exact time needed')}</Text>
                    <Text style={{ color: colors.inkMuted, fontFamily: scriptBodyFont(lang, typography.meaning.fontFamily), fontSize: 12, lineHeight: 18, textAlign: 'center', marginTop: 5 }}>{meaningByLang(lang, 'पूरे IST दिन में नक्षत्र या कूट बदलते हैं, इसलिए एकल स्कोर या निष्कर्ष नहीं दिखाया गया।', 'Nakshatra or koota changes across the IST day, so no single score or band is shown.')}</Text>
                  </>
                )}
              </View>
              {result.unknownTimeRoles.length > 0 ? (
                <View style={[styles.possibilities, { borderColor: colors.divider, borderRadius: radii.md }]} accessibilityLabel={contentByLang(lang, 'अज्ञात जन्म समय के सम्भावित नक्षत्र', 'Possible nakshatras for unknown birth times')}>
                  <Text style={{ color: colors.ink, fontFamily: fontFamilies.interSemiBold, fontSize: 12 }}>{contentByLang(lang, 'सम्भावित जन्म नक्षत्र', 'Possible birth nakshatras')}</Text>
                  {result.unknownTimeRoles.includes('groom') ? (
                    <Text accessibilityLabel={`${contentByLang(lang, 'वर के सम्भावित नक्षत्र', 'Groom possible nakshatras')}: ${localizedNakshatraList(result.groomNakshatraIndices, lang)}`} style={[styles.possibilityText, { color: colors.inkMuted, fontFamily: scriptBodyFont(lang, typography.meaning.fontFamily) }]}>
                      {contentByLang(lang, 'वर', 'Groom')}: {localizedNakshatraList(result.groomNakshatraIndices, lang)}
                    </Text>
                  ) : null}
                  {result.unknownTimeRoles.includes('bride') ? (
                    <Text accessibilityLabel={`${contentByLang(lang, 'वधू के सम्भावित नक्षत्र', 'Bride possible nakshatras')}: ${localizedNakshatraList(result.brideNakshatraIndices, lang)}`} style={[styles.possibilityText, { color: colors.inkMuted, fontFamily: scriptBodyFont(lang, typography.meaning.fontFamily) }]}>
                      {contentByLang(lang, 'वधू', 'Bride')}: {localizedNakshatraList(result.brideNakshatraIndices, lang)}
                    </Text>
                  ) : null}
                </View>
              ) : null}
              {result.kind === 'range' ? (
                <View style={[styles.varying, { backgroundColor: colors.avoidTint, borderColor: colors.avoidDeep, borderRadius: radii.md }]}>
                  <Text style={{ color: colors.avoidDeep, fontFamily: fontFamilies.interSemiBold, fontSize: 12 }}>{contentByLang(lang, 'बदलने वाले कूट', 'Kootas that vary')}</Text>
                  <Text style={{ color: colors.avoidDeep, fontFamily: scriptBodyFont(lang, typography.meaning.fontFamily), fontSize: 12, lineHeight: 18, marginTop: 4 }}>{result.varyingKootas.map((id) => contentByLang(lang, KOOTA_COPY[id].hi, KOOTA_COPY[id].en)).join(' · ')}</Text>
                </View>
              ) : (
                <>
                  {result.flags.filter((flag) => flag.present).map((flag) => (
                    <View key={flag.id} style={[styles.flag, { backgroundColor: colors.avoidTint, borderColor: colors.avoidDeep, borderRadius: radii.md }]} accessibilityLabel={contentByLang(lang, `${flag.id === 'nadi' ? 'नाड़ी' : 'भकूट'} सम्बन्धी, ${flag.cancelled ? 'समर्थित निरस्तीकरण लागू' : 'कोई समर्थित निरस्तीकरण नहीं'}`, `${flag.id} finding, ${flag.cancelled ? 'supported cancellation applies' : 'no supported cancellation'}`)}>
                      <Text style={{ color: colors.avoidDeep, fontFamily: fontFamilies.interSemiBold, fontSize: 12 }}>{flag.id === 'nadi' ? 'नाड़ी · Nadi' : 'भकूट · Bhakoot'}</Text>
                      <Text style={{ color: colors.avoidDeep, fontFamily: scriptBodyFont(lang, typography.meaning.fontFamily), fontSize: 11, lineHeight: 17, marginTop: 3 }}>{flag.cancelled ? contentByLang(lang, 'पिन की गई परम्परा में समर्थित निरस्तीकरण लागू है; मूल अंक नहीं बदले गये।', 'A supported cancellation applies under the pinned convention; the base score is unchanged.') : contentByLang(lang, 'पिन की गई परम्परा में कोई समर्थित निरस्तीकरण लागू नहीं है।', 'No supported cancellation applies under the pinned convention.')}</Text>
                    </View>
                  ))}
                  <View style={styles.kootas} accessibilityLabel={contentByLang(lang, 'अष्टकूट के आठ घटक अंक', 'Eight Guna Milan component scores')}>
                    {result.kootas.map((row) => {
                      const open = expanded === row.id;
                      const copy = KOOTA_COPY[row.id];
                      return (
                        <Pressable
                          key={row.id} onPress={() => setExpanded(open ? null : row.id)} accessibilityRole="button"
                          accessibilityState={{ expanded: open }} accessibilityLabel={contentByLang(lang, `${copy.hi}, ${row.max} में से ${row.score}, ${open ? 'खुला' : 'बंद'}`, `${copy.en}, ${row.score} out of ${row.max}, ${open ? 'expanded' : 'collapsed'}`)}
                          style={[styles.kootaRow, { borderBottomColor: colors.divider }]}
                        >
                          <View style={styles.kootaHeading}>
                            <Text style={{ flex: 1, color: colors.ink, fontFamily: scriptTitleFont(lang, typography.readerTitle.fontFamily), fontSize: 15 }}>{contentByLang(lang, copy.hi, copy.en)}</Text>
                            <Text style={[styles.kootaScore, { color: colors.ink }]}>{row.score}/{row.max}</Text>
                            <Text style={{ color: colors.saffronDeep, fontSize: 18, width: 24, textAlign: 'right' }}>{open ? '−' : '+'}</Text>
                          </View>
                          <View style={[styles.bar, { backgroundColor: colors.divider }]}><View style={{ height: 4, width: `${row.max ? row.score / row.max * 100 : 0}%`, backgroundColor: colors.gold }} /></View>
                          {open ? <Text style={{ color: colors.inkMuted, fontFamily: scriptBodyFont(lang, typography.meaning.fontFamily), fontSize: 12, lineHeight: 18, marginTop: 8 }}>{meaningByLang(lang, copy.detailHi, copy.detailEn)}{`\n${contentByLang(lang, 'वर', 'Groom')}: ${localizedKootaInputList(row.id, result.groomClassifications, lang)} · ${contentByLang(lang, 'वधू', 'Bride')}: ${localizedKootaInputList(row.id, result.brideClassifications, lang)}`}{result.allTimesChecked
                            ? `\n${meaningByLang(lang, 'पूरे IST दिन में वर्ग बदल सकता है, पर यह अंक नहीं बदलता।', 'The class may vary across the IST day, but this score does not.')}`
                            : ''}</Text> : null}
                        </Pressable>
                      );
                    })}
                  </View>
                  <Pressable accessibilityRole="button" accessibilityLabel={contentByLang(lang, 'निजता-सुरक्षित शेयर कार्ड देखें', 'Preview privacy-safe Guna Milan share card')} onPress={() => { setShareVisible(true); void incrementGunaMilanMetric('previewGenerated'); }} style={[styles.primary, { backgroundColor: colors.saffronDeep, borderRadius: radii.pill, marginTop: 16 }]}>
                    <Text style={[styles.primaryText, { color: colors.onPrimary }]}>{contentByLang(lang, 'शेयर कार्ड देखें', 'Preview share card')}</Text>
                  </Pressable>
                </>
              )}
              <Text style={{ color: colors.inkMuted, fontFamily: scriptBodyFont(lang, typography.meaning.fontFamily), fontSize: 11, lineHeight: 17, textAlign: 'center', marginTop: 16 }}>{meaningByLang(lang, 'यह पारम्परिक अष्टकूट गणना है — मार्गदर्शन हेतु, निर्णय हेतु नहीं।', 'This is a traditional Ashtakoota calculation — for guidance, not a decision.')}</Text>
              <Pressable accessibilityRole="button" accessibilityLabel={contentByLang(lang, 'गुण मिलान विवरण बदलें', 'Edit Guna Milan details')} onPress={() => setResult(null)} style={[styles.secondary, { borderColor: colors.divider, borderRadius: radii.pill }]}><Text style={{ color: colors.saffronDeep, fontFamily: fontFamilies.interSemiBold, fontSize: 13 }}>{contentByLang(lang, 'विवरण बदलें', 'Edit details')}</Text></Pressable>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
      {shareModel ? (
        <JyotishShareSheet
          visible={shareVisible} lang={lang} titleHi="अष्टकूट मिलान साझा करें" titleEn="Share Guna Milan"
          privacyHi="केवल वैकल्पिक नाम, भूमिकाएँ और गुण साझा होंगे। जन्म तिथि, समय या अन्य निजी विवरण शामिल नहीं हैं।"
          privacyEn="Only optional names, roles, and scores are shared. Birth date, time, and other private details are excluded."
          onClose={() => setShareVisible(false)} onShareSheetOpened={() => { void incrementGunaMilanMetric('shareSheetOpened'); }}
          renderCard={(width) => <GunaMilanShareCard width={width} lang={lang} model={shareModel} />}
        />
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { paddingBottom: 30, gap: 14 },
  intro: { marginBottom: 2 },
  rememberRow: { minHeight: 64, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 9, flexDirection: 'row', alignItems: 'center', gap: 10 },
  clearButton: { minHeight: 44, alignSelf: 'flex-start', justifyContent: 'center' },
  storageMessage: { fontFamily: fontFamilies.inter, fontSize: 11 },
  primary: { minHeight: 50, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 18 },
  primaryText: { fontFamily: fontFamilies.interSemiBold, fontSize: 14 },
  resultHero: { borderWidth: 1, padding: 16, alignItems: 'center' },
  dialWrap: { width: 118, height: 118, alignSelf: 'center' },
  dialText: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  dialTotal: { fontFamily: fontFamilies.interSemiBold, fontSize: 28, lineHeight: 30 },
  dialMax: { fontFamily: fontFamilies.inter, fontSize: 10 },
  checked: { fontFamily: fontFamilies.inter, fontSize: 11, textAlign: 'center', marginTop: 5 },
  range: { fontFamily: fontFamilies.interSemiBold, fontSize: 44, lineHeight: 48 },
  rangeMax: { fontFamily: fontFamilies.inter, fontSize: 12 },
  varying: { borderWidth: 1, padding: 12 },
  possibilities: { borderWidth: 1, padding: 12 },
  possibilityText: { fontSize: 12, lineHeight: 18, marginTop: 5 },
  flag: { borderWidth: 1, padding: 12 },
  kootas: { marginTop: 2 },
  kootaRow: { minHeight: 64, paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth },
  kootaHeading: { minHeight: 28, flexDirection: 'row', alignItems: 'center' },
  kootaScore: { fontFamily: fontFamilies.interSemiBold, fontSize: 13, marginRight: 8 },
  bar: { height: 4, borderRadius: 2, overflow: 'hidden', marginTop: 6 },
  secondary: { minHeight: 48, borderWidth: 1, alignItems: 'center', justifyContent: 'center', marginTop: 10 },
});
