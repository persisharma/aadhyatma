import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

import ReaderHeader from '@/components/ReaderHeader';
import { useGitaLanguage } from '@/data/gita/language';
import { usePitruSmaran } from '@/contexts/PitruSmaranContext';
import { useBirthProfileRoster } from '@/panchang/useKundali';
import { useKulRecord, kulVratRuleById } from '@/panchang/kulParamparaStore';
import { buildKulParamparaExport, kuldevDisplayName } from '@/panchang/kulParampara';
import { kulParamparaExportFilename, shareKulParamparaFile } from '@/panchang/kulParamparaShare';
import { relationLabels } from '@/panchang/pitruSmaran';
import { getTempleById } from '@/data/theerth/temples';
import { useTheme } from '@/theme/ThemeContext';
import { fontFamilies } from '@/theme/typography';
import { contentByLang } from '@/utils/localize';
import { transliterateDevanagari } from '@/utils/transliterate';
import { scriptBodyFont, scriptTitleFont } from '@/utils/langType';
import type { MoreStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<MoreStackParamList, 'KulParamparaExport'>;

/**
 * आगे सौंपें (PRD-29 §3.7) — the point of the record. Shows EXACTLY what will
 * leave the device, then one action: the OS share sheet over a versioned JSON
 * file. The app never prompts for this; the user walked here. appVersion is
 * read lazily so `expo-constants` stays out of the Jest module graph.
 */
export default function KulParamparaExportScreen({ navigation }: Props) {
  const { colors, typography, spacing, radii } = useTheme();
  const { lang } = useGitaLanguage();
  const { record } = useKulRecord();
  const { roster } = useBirthProfileRoster();
  const { entries } = usePitruSmaran();
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState<'none' | 'unavailable' | 'error'>('none');

  const bodyFont = scriptBodyFont(lang, typography.meaning.fontFamily);
  const titleFont = scriptTitleFont(lang, typography.readerTitle.fontFamily);
  const reScript = (hi: string): string => (lang === 'gu' || lang === 'kn' ? transliterateDevanagari(hi, lang) : hi);

  const temple = record.temple?.templeId ? getTempleById(record.temple.templeId) : undefined;
  const vratRule = record.kulVrat?.ruleId ? kulVratRuleById(record.kulVrat.ruleId) : null;

  const rows = useMemo(() => {
    const list: { k: string; v: string }[] = [];
    if (record.kuldev) {
      list.push({
        k: record.kuldev.kind === 'kuldevi'
          ? contentByLang(lang, 'कुलदेवी', 'Kuldevi')
          : contentByLang(lang, 'कुलदेवता', 'Kuldevta'),
        v: lang === 'en' ? kuldevDisplayName(record.kuldev, 'en') : reScript(kuldevDisplayName(record.kuldev, 'hi')),
      });
    }
    if (record.temple) {
      list.push({
        k: contentByLang(lang, 'कुल मन्दिर', 'Family temple'),
        v: temple
          ? (lang === 'en' ? temple.nameEn : reScript(temple.nameHi))
          : record.temple.customName ?? '',
      });
    }
    if (record.gotra) list.push({ k: contentByLang(lang, 'गोत्र', 'Gotra'), v: record.gotra });
    if (record.kulVrat) {
      list.push({
        k: contentByLang(lang, 'कुल व्रत', 'Family observance'),
        v: vratRule ? contentByLang(lang, vratRule.nameHi, vratRule.nameEn) : record.kulVrat.customText ?? '',
      });
    }
    if (record.notes) {
      list.push({ k: contentByLang(lang, 'परिवार की बात', 'Family notes'), v: contentByLang(lang, 'सम्मिलित', 'Included') });
    }
    list.push({
      k: contentByLang(lang, 'जन्म तिथियाँ', 'Janma tithis'),
      v: contentByLang(lang, `${roster.people.length} सदस्य`, `${roster.people.length} people`),
    });
    list.push({
      k: contentByLang(lang, 'पितृ तिथियाँ', 'Pitru tithis'),
      v: contentByLang(lang, `${entries.length} प्रविष्टि`, `${entries.length} entries`),
    });
    return list;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [record, temple, vratRule, roster.people.length, entries.length, lang]);

  const share = async () => {
    setBusy(true);
    setFailed('none');
    try {
      const now = new Date();
      // Lazy so expo-constants never enters the static module graph (Jest
      // cannot parse its untranspiled ESM — the buildFingerprint rule).
      let appVersion = 'unknown';
      try {
        const Constants = require('expo-constants').default;
        appVersion = Constants?.expoConfig?.version ?? 'unknown';
      } catch {
        appVersion = 'unknown';
      }
      const envelope = buildKulParamparaExport({
        record,
        people: roster.people,
        smaranEntries: entries,
        appVersion,
        now,
        ruleNames: (ruleId) => {
          const rule = kulVratRuleById(ruleId);
          return rule ? { nameHi: rule.nameHi, nameEn: rule.nameEn } : null;
        },
        relationLabelEn: (entry) => relationLabels(entry.relation).labelEn,
      });
      const shared = await shareKulParamparaFile(
        JSON.stringify(envelope, null, 2),
        kulParamparaExportFilename(now)
      );
      if (!shared) setFailed('unavailable');
    } catch {
      setFailed('error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[colors.parchmentHighlight, colors.parchmentGradientEnd]}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <ReaderHeader
          variant="index"
          title={contentByLang(lang, 'आगे सौंपें', 'Hand It On')}
          onBack={() => navigation.goBack()}
        />
        <ScrollView contentContainerStyle={[styles.scroll, { paddingHorizontal: spacing.xxl }]} showsVerticalScrollIndicator={false}>
          <View style={[styles.card, { backgroundColor: colors.parchmentSoft, borderColor: colors.divider, borderRadius: radii.lg }]}>
            <Text style={{ fontFamily: titleFont, fontSize: 15.5, color: colors.ink }}>
              {contentByLang(lang, 'कुल परम्परा · निर्यात', 'Kul Parampara · Export')}
            </Text>
            <Text style={{ fontFamily: fontFamilies.latinItalic, fontSize: 12, lineHeight: 18, color: colors.inkMuted, marginTop: 5 }}>
              {contentByLang(
                lang,
                'जो अभिलेख उपकरण से बाहर न जा सके, वह अपना एकमात्र काम नहीं कर पाता।',
                'A record that cannot leave the device fails at the one job it has.'
              )}
            </Text>
            <View style={[styles.divider, { backgroundColor: colors.divider }]} />
            {rows.map(({ k, v }) => (
              <View key={k} style={styles.kv}>
                <Text style={{ fontFamily: bodyFont, fontSize: 12.5, color: colors.inkMuted }}>{k}</Text>
                <Text style={{ fontFamily: bodyFont, fontSize: 13.5, color: colors.ink, textAlign: 'right', flexShrink: 1 }} numberOfLines={1}>
                  {v}
                </Text>
              </View>
            ))}

            {failed === 'unavailable' && (
              <Text style={{ fontFamily: bodyFont, fontSize: 13, color: colors.saffronDeep, marginTop: 10, textAlign: 'center' }}>
                {contentByLang(lang, 'साझा-पत्रक उपलब्ध नहीं है।', 'The share sheet is not available here.')}
              </Text>
            )}
            {failed === 'error' && (
              <Text style={{ fontFamily: bodyFont, fontSize: 13, color: colors.saffronDeep, marginTop: 10, textAlign: 'center' }}>
                {contentByLang(lang, 'निर्यात नहीं हो सका — फिर प्रयास करें।', 'Could not export — try again.')}
              </Text>
            )}

            <Pressable
              onPress={share}
              disabled={busy}
              testID="kul-parampara-share"
              accessibilityRole="button"
              accessibilityLabel="Share kul parampara file"
              style={({ pressed }) => [
                styles.primaryBtn,
                { backgroundColor: colors.saffron, borderRadius: radii.md },
                (pressed || busy) && { opacity: 0.8 },
              ]}
            >
              <Text style={{ fontFamily: titleFont, fontSize: 14.5, color: colors.onPrimary }}>
                {contentByLang(lang, busy ? 'तैयार हो रहा है…' : 'साझा करें', busy ? 'Preparing…' : 'Share')}
              </Text>
            </Pressable>
          </View>

          <Text style={[styles.lock, { borderLeftColor: colors.goldTint, color: colors.inkMuted }]}>
            {contentByLang(
              lang,
              'फ़ाइल OS के साझा-पत्रक से जाती है — कोई क्लाउड नहीं, कोई सर्वर नहीं। साझा करना आपका निर्णय है, ऐप का नहीं।',
              'The file goes through the OS share sheet — no cloud, no server. Sharing is your decision, never the app’s.'
            )}
          </Text>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  scroll: { paddingTop: 4, paddingBottom: 40 },
  card: { borderWidth: 1, padding: 16 },
  divider: { height: 1, marginVertical: 12 },
  kv: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', gap: 12, paddingVertical: 7 },
  primaryBtn: { minHeight: 50, alignItems: 'center', justifyContent: 'center', marginTop: 16 },
  lock: { fontFamily: fontFamilies.latinItalic, fontSize: 11.5, lineHeight: 18, borderLeftWidth: 2, paddingLeft: 10, marginTop: 14 },
});
