/**
 * दान-द्वार — the giving directory list (PRD-26 §5 P2). Reached ONLY from a
 * journey's terminal step (§2.7): this screen is not a tab, has no More-hub
 * row, and no other surface links it. Rows are grouped by kind; each states
 * its work before any action exists (the detail screen carries the hand-off,
 * behind the honest interstitial).
 */
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import ReaderHeader from '@/components/ReaderHeader';
import { useGitaLanguage } from '@/data/gita/language';
import { getDaanOrgs, type DaanOrgEntry } from '@/data/daan';
import type { DaanStackParamList } from '@/navigation/types';
import { useTheme } from '@/theme/ThemeContext';
import { contentByLang, meaningByLang } from '@/utils/localize';
import { scriptBodyFont, scriptTitleFont } from '@/utils/langType';

type Props = NativeStackScreenProps<DaanStackParamList, 'DaanDirectory'>;

const KIND_ORDER: readonly DaanOrgEntry['kind'][] = ['anna-kshetra', 'temple-trust', 'ngo', 'seva-portal'];
const KIND_LABELS: Readonly<Record<DaanOrgEntry['kind'], { hi: string; en: string }>> = {
  'anna-kshetra': { hi: 'अन्नक्षेत्र', en: 'Anna-kshetra' },
  'temple-trust': { hi: 'देवस्थान ट्रस्ट', en: 'Temple trusts' },
  ngo: { hi: 'सेवा-संस्थाएँ', en: 'Seva organizations' },
  'seva-portal': { hi: 'सेवा-पोर्टल', en: 'Seva portals' },
};

export default function DaanDirectoryScreen({ navigation }: Props) {
  const { colors, typography, spacing, radii, elevation } = useTheme();
  const { lang } = useGitaLanguage();
  const titleFont = scriptTitleFont(lang, typography.readerTitle.fontFamily);
  const bodyFont = scriptBodyFont(lang, typography.meaning.fontFamily);
  const orgs = getDaanOrgs();

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
    <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]} edges={['top']} testID="daan-directory-screen">
      <ReaderHeader
        title={contentByLang(lang, 'दान-द्वार', 'Daan dwaar')}
        variant="index"
        onBack={() => navigation.goBack()}
      />
      <ScrollView contentContainerStyle={{ paddingHorizontal: spacing.readingGutter, paddingBottom: spacing.xxl }}>
        <Text style={{ fontFamily: titleFont, fontSize: 15, lineHeight: 23, color: colors.ink, textAlign: 'center', marginTop: spacing.sm }}>
          {contentByLang(lang, 'देशे काले च पात्रे', 'Deshe kāle cha pātre')}
        </Text>
        <Text style={{ fontFamily: bodyFont, fontSize: 12, lineHeight: 18, color: colors.inkMuted, textAlign: 'center', marginTop: 4 }}>
          {meaningByLang(
            lang,
            'सत्यापित पात्र — ऐप किसी लेन-देन का हिस्सा नहीं है।',
            'Verified patra — the app is never part of any transaction.'
          )}
        </Text>

        {KIND_ORDER.map((kind) => {
          const rows = orgs.filter((org) => org.kind === kind);
          if (rows.length === 0) return null;
          return (
            <View key={kind}>
              <Text style={sectionLabelStyle}>{contentByLang(lang, KIND_LABELS[kind].hi, KIND_LABELS[kind].en)}</Text>
              {rows.map((org) => (
                <Pressable
                  key={org.id}
                  testID={`daan-org-${org.id}`}
                  accessibilityRole="button"
                  accessibilityLabel={`Organization ${org.nameEn}`}
                  onPress={() => navigation.navigate('DaanDirectoryDetail', { orgId: org.id })}
                  style={[styles.rowCard, { backgroundColor: colors.parchmentSoft, borderColor: colors.divider, borderRadius: radii.lg }, elevation.card]}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontFamily: titleFont, fontSize: 14.5, lineHeight: 21, color: colors.ink }}>
                      {contentByLang(lang, org.nameHi, org.nameEn)}
                    </Text>
                    <Text style={{ fontFamily: bodyFont, fontSize: 11.5, lineHeight: 17, color: colors.inkMuted, marginTop: 2 }} numberOfLines={2}>
                      {meaningByLang(lang, org.aboutHi, org.aboutEn)}
                    </Text>
                  </View>
                  <Text style={{ fontSize: 18, color: colors.inkMuted }}>›</Text>
                </Pressable>
              ))}
            </View>
          );
        })}

        <Text style={{ fontFamily: bodyFont, fontSize: 11.5, lineHeight: 18, color: colors.inkMuted, textAlign: 'center', marginTop: spacing.lg }}>
          {meaningByLang(
            lang,
            'यह सूची छोटी और सत्यापित रहती है — हर पंक्ति दो स्वतंत्र स्रोतों से जाँची गई; 18 माह में पुनः-सत्यापन, अन्यथा अदृश्य।',
            'This list stays small and verified — every row checked against two independent sources; re-verified within 18 months or it disappears.'
          )}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  rowCard: { borderWidth: 1, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 9, flexDirection: 'row', alignItems: 'center', gap: 10 },
});
