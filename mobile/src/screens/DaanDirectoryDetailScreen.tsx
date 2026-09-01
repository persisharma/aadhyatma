/**
 * पात्र-परिचय — one directory organization (PRD-26 §5 P2, §6). Educate-first
 * even here: the work → the verification (shown to the user — trust is the
 * feature) → related teaching → and only then the action row, record leading.
 * The hand-off is Linking.openURL to the organization's OWN official page,
 * behind the honest interstitial: the app never collects, confirms, or takes
 * a share of anything. After a hand-off, ONE gentle record offer renders —
 * declining is silent.
 */
import React, { useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import ReaderHeader from '@/components/ReaderHeader';
import { useGitaLanguage } from '@/data/gita/language';
import { getDaanKatha, getDaanOrg } from '@/data/daan';
import type { DaanStackParamList } from '@/navigation/types';
import { useTheme } from '@/theme/ThemeContext';
import { contentByLang, meaningByLang } from '@/utils/localize';
import { scriptBodyFont, scriptTitleFont } from '@/utils/langType';

type Props = NativeStackScreenProps<DaanStackParamList, 'DaanDirectoryDetail'>;

export default function DaanDirectoryDetailScreen({ navigation, route }: Props) {
  const { colors, typography, spacing, radii, elevation } = useTheme();
  const { lang } = useGitaLanguage();
  const titleFont = scriptTitleFont(lang, typography.readerTitle.fontFamily);
  const bodyFont = scriptBodyFont(lang, typography.meaning.fontFamily);

  const org = getDaanOrg(route.params.orgId);
  const relatedKatha = org?.daanKathaId ? getDaanKatha(org.daanKathaId) : null;
  // 'idle' → 'confirming' (interstitial) → 'handedOff' (one gentle record offer).
  const [handOff, setHandOff] = useState<'idle' | 'confirming' | 'handedOff'>('idle');

  if (!org) {
    return (
      <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]} edges={['top']}>
        <ReaderHeader title={contentByLang(lang, 'दान-द्वार', 'Daan dwaar')} variant="index" onBack={() => navigation.goBack()} />
      </SafeAreaView>
    );
  }

  const openOfficial = () => {
    setHandOff('handedOff');
    Linking.openURL(org.donateUrl).catch(() => undefined);
  };

  const sectionLabelStyle = {
    fontFamily: typography.sectionLabel.fontFamily,
    fontSize: typography.sectionLabel.fontSize,
    letterSpacing: lang === 'en' ? typography.sectionLabel.letterSpacing : 0,
    color: colors.inkMuted,
    textTransform: 'uppercase' as const,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  };

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]} edges={['top']} testID="daan-org-detail-screen">
      <ReaderHeader
        title={contentByLang(lang, 'पात्र-परिचय', 'The patra')}
        variant="index"
        onBack={() => navigation.goBack()}
      />
      <ScrollView contentContainerStyle={{ paddingHorizontal: spacing.readingGutter, paddingBottom: spacing.xxl }}>
        <Text style={{ fontFamily: titleFont, fontSize: 19, lineHeight: 28, color: colors.ink, textAlign: 'center', marginTop: spacing.sm }}>
          {contentByLang(lang, org.nameHi, org.nameEn)}
        </Text>

        <Text style={sectionLabelStyle}>{contentByLang(lang, 'ये क्या करते हैं', 'The work')}</Text>
        <View style={[styles.card, { backgroundColor: colors.parchmentSoft, borderColor: colors.divider, borderRadius: radii.lg }, elevation.card]}>
          <Text style={{ fontFamily: bodyFont, fontSize: 13, lineHeight: 21, color: colors.inkSoft }}>
            {meaningByLang(lang, org.aboutHi, org.aboutEn)}
          </Text>
        </View>

        <Text style={sectionLabelStyle}>{contentByLang(lang, 'सत्यापन', 'Verification')}</Text>
        <View
          testID="daan-org-verification"
          style={[styles.card, { backgroundColor: colors.parchmentSoft, borderColor: colors.cardActiveBorder, borderRadius: radii.lg }, elevation.card]}
        >
          <Text style={{ fontFamily: bodyFont, fontSize: 12.5, lineHeight: 19, color: colors.inkSoft }}>
            {meaningByLang(lang, org.registrationHi, org.registrationEn)}
          </Text>
          <Text style={{ fontFamily: bodyFont, fontSize: 12, lineHeight: 18, color: colors.inkSoft, marginTop: 6 }}>
            {contentByLang(lang, 'आधिकारिक: ', 'Official: ')}
            {org.officialUrl.replace(/^https?:\/\//, '')}
          </Text>
          <Text style={{ fontFamily: bodyFont, fontSize: 11.5, lineHeight: 17, color: colors.saffronDeep, marginTop: 8 }}>
            {contentByLang(
              lang,
              `✓ दो स्वतंत्र स्रोतों से सत्यापित · ${org.verifiedOn} · 18 माह में पुनः-सत्यापन`,
              `✓ Verified against two independent sources · ${org.verifiedOn} · re-verified within 18 months`
            )}
          </Text>
        </View>

        {org.nonMonetaryHi && org.nonMonetaryEn ? (
          <View style={[styles.card, { backgroundColor: colors.goldChipBg, borderColor: colors.divider, borderRadius: radii.lg, marginTop: 4 }]}>
            <Text style={{ fontFamily: bodyFont, fontSize: 12.5, lineHeight: 19, color: colors.saffronDeep }}>
              {meaningByLang(lang, org.nonMonetaryHi, org.nonMonetaryEn)}
            </Text>
          </View>
        ) : null}

        {relatedKatha ? (
          <>
            <Text style={sectionLabelStyle}>{contentByLang(lang, 'इनसे जुड़ी शिक्षा', 'The teaching behind this')}</Text>
            <Pressable
              testID="daan-org-katha"
              accessibilityRole="button"
              accessibilityLabel={`Read story ${relatedKatha.titleEn}`}
              onPress={() => navigation.navigate('DaanKatha', { kathaId: relatedKatha.id })}
              style={[styles.rowCard, { backgroundColor: colors.parchmentSoft, borderColor: colors.divider, borderRadius: radii.lg }, elevation.card]}
            >
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: titleFont, fontSize: 14.5, lineHeight: 21, color: colors.ink }}>
                  {contentByLang(lang, relatedKatha.titleHi, relatedKatha.titleEn)}
                </Text>
                <Text style={{ fontFamily: bodyFont, fontSize: 11.5, lineHeight: 17, color: colors.inkMuted, marginTop: 2 }}>
                  {contentByLang(lang, relatedKatha.subtitleHi, relatedKatha.subtitleEn)}
                </Text>
              </View>
              <Text style={{ fontSize: 18, color: colors.inkMuted }}>›</Text>
            </Pressable>
          </>
        ) : null}

        <View style={[styles.terminal, { borderTopColor: colors.divider }]}>
          {handOff === 'handedOff' ? (
            <View
              testID="daan-org-return-offer"
              style={[styles.card, { backgroundColor: colors.goldChipBg, borderColor: colors.divider, borderRadius: radii.lg, marginBottom: 10 }]}
            >
              <Text style={{ fontFamily: bodyFont, fontSize: 12.5, lineHeight: 19, color: colors.inkSoft }}>
                {meaningByLang(
                  lang,
                  'लौट आए? चाहें तो इसे खाते में दर्ज कर लें — न दर्ज करना भी उतना ही ठीक है।',
                  'Back? If you wish, record it in your register — not recording is just as fine.'
                )}
              </Text>
            </View>
          ) : null}
          <View style={styles.actionRow}>
            <Pressable
              testID="daan-org-record"
              accessibilityRole="button"
              accessibilityLabel="Record in my daan ledger"
              onPress={() => navigation.navigate('DaanEntry', {})}
              style={[styles.actionBtn, { backgroundColor: colors.saffron, borderColor: colors.saffron, borderRadius: radii.pill }]}
            >
              <Text style={{ fontFamily: titleFont, fontSize: 13, color: colors.onPrimary }}>
                {contentByLang(lang, 'खाते में दर्ज करें', 'Record in my register')}
              </Text>
            </Pressable>
            <Pressable
              testID="daan-org-give"
              accessibilityRole="button"
              accessibilityLabel="Give, opens externally"
              onPress={() => setHandOff('confirming')}
              style={[styles.actionBtn, { borderColor: colors.saffron, borderRadius: radii.pill }]}
            >
              <Text style={{ fontFamily: titleFont, fontSize: 13, color: colors.saffronDeep }}>
                {contentByLang(lang, 'दान करें (बाहरी)', 'Give (external)')}
              </Text>
            </Pressable>
          </View>
          <Text style={{ fontFamily: bodyFont, fontSize: 11.5, lineHeight: 18, color: colors.inkMuted, textAlign: 'center', marginTop: 10 }}>
            {meaningByLang(
              lang,
              'ऐप इस लेन-देन का हिस्सा नहीं है — दान संस्था के अपने आधिकारिक माध्यम पर, ऐप के बाहर होगा।',
              'The app is not part of this transaction — the daan happens on the organization’s own official channel, outside the app.'
            )}
          </Text>
        </View>

        {handOff === 'confirming' ? (
          <View
            testID="daan-org-interstitial"
            style={[styles.card, { backgroundColor: colors.parchmentSoft, borderColor: colors.cardActiveBorder, borderRadius: radii.lg, marginTop: 12 }, elevation.card]}
          >
            <Text style={{ fontFamily: titleFont, fontSize: 14.5, lineHeight: 22, color: colors.ink, textAlign: 'center' }}>
              {contentByLang(lang, 'बाहरी माध्यम पर जा रहे हैं', 'Leaving for the official channel')}
            </Text>
            <Text style={{ fontFamily: bodyFont, fontSize: 12.5, lineHeight: 19, color: colors.inkSoft, textAlign: 'center', marginTop: 6 }}>
              {contentByLang(
                lang,
                `${org.donateUrl.replace(/^https?:\/\//, '')} आपके ब्राउज़र में खुलेगा। यह ऐप न राशि लेता है, न पुष्टि कर सकता है, न कोई अंश पाता है।`,
                `${org.donateUrl.replace(/^https?:\/\//, '')} opens in your browser. This app takes no money, cannot confirm anything, and receives no share.`
              )}
            </Text>
            <View style={[styles.actionRow, { marginTop: 12 }]}>
              <Pressable
                testID="daan-org-cancel"
                accessibilityRole="button"
                accessibilityLabel="Stay in the app"
                onPress={() => setHandOff('idle')}
                style={[styles.actionBtn, { borderColor: colors.border, borderRadius: radii.pill }]}
              >
                <Text style={{ fontFamily: titleFont, fontSize: 13, color: colors.inkMuted }}>
                  {contentByLang(lang, 'रहने दें', 'Not now')}
                </Text>
              </Pressable>
              <Pressable
                testID="daan-org-open"
                accessibilityRole="button"
                accessibilityLabel="Open the official page"
                onPress={openOfficial}
                style={[styles.actionBtn, { backgroundColor: colors.saffron, borderColor: colors.saffron, borderRadius: radii.pill }]}
              >
                <Text style={{ fontFamily: titleFont, fontSize: 13, color: colors.onPrimary }}>
                  {contentByLang(lang, 'खोलें ↗', 'Open ↗')}
                </Text>
              </Pressable>
            </View>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  card: { borderWidth: 1, paddingHorizontal: 14, paddingVertical: 13 },
  rowCard: { borderWidth: 1, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 9, flexDirection: 'row', alignItems: 'center', gap: 10 },
  terminal: { borderTopWidth: 1, marginTop: 18, paddingTop: 14 },
  actionRow: { flexDirection: 'row', gap: 8 },
  actionBtn: { flex: 1, borderWidth: 1.5, minHeight: 42, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8 },
});
