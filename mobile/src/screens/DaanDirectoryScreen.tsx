/**
 * दान-द्वार — the giving directory, organised by प्रयोजन (cause), PRD-26 §5.1.
 * Reached ONLY from a journey's terminal step (§2.7): not a tab, no More-hub
 * row, no other surface links it.
 *
 * Two grouping states:
 *  - unfiltered → grouped by cause in `DAAN_CAUSES` order, each heading
 *    carrying its "whom this serves" line. A row appears under every cause it
 *    serves (the theerth multi-group-tag precedent), so the axis reads as a
 *    purpose taxonomy rather than a flat list.
 *  - filtered → the flat set for one cause. `route.params.causes` arrives from
 *    the occasion (Sankranti → anna · vastra · gau), so the day points at its
 *    own door; tapping the active chip clears back to all.
 *
 * Cause chips are DERIVED from the rows present — a cause with no verified row
 * never renders a chip, so the taxonomy can never show an empty shelf.
 *
 * EXPLAIN BEFORE LISTING (RULEBOOK §27.14): every cause renders its **mahatva**
 * — why this daan is held dear, with its citation where it makes a textual
 * claim — ABOVE the places that serve it. The teaching is the larger half of
 * the screen; the places are a short, thin list underneath. Nothing about an
 * organization beyond its one line lives here.
 */
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import ReaderHeader from '@/components/ReaderHeader';
import { useGitaLanguage } from '@/data/gita/language';
import { DAAN_CAUSES, getDaanOrgs, type DaanCause, type DaanCauseMeta, type DaanOrgEntry } from '@/data/daan';
import type { DaanStackParamList } from '@/navigation/types';
import { useTheme } from '@/theme/ThemeContext';
import { contentByLang, meaningByLang } from '@/utils/localize';
import { scriptBodyFont, scriptTitleFont } from '@/utils/langType';

type Props = NativeStackScreenProps<DaanStackParamList, 'DaanDirectory'>;

const KIND_LABELS: Readonly<Record<DaanOrgEntry['kind'], { hi: string; en: string }>> = {
  'anna-kshetra': { hi: 'अन्नक्षेत्र', en: 'Anna-kshetra' },
  'temple-trust': { hi: 'देवस्थान ट्रस्ट', en: 'Temple trust' },
  ngo: { hi: 'सेवा-संस्था', en: 'Seva organization' },
  'seva-portal': { hi: 'सेवा-पोर्टल', en: 'Seva portal' },
};

export default function DaanDirectoryScreen({ navigation, route }: Props) {
  const { colors, typography, spacing, radii, elevation } = useTheme();
  const { lang } = useGitaLanguage();
  const titleFont = scriptTitleFont(lang, typography.readerTitle.fontFamily);
  const bodyFont = scriptBodyFont(lang, typography.meaning.fontFamily);

  const orgs = getDaanOrgs();
  // Only causes that actually have a verified row may become a chip.
  const liveCauses = useMemo(
    () => DAAN_CAUSES.filter((cause) => orgs.some((org) => org.causes.includes(cause.id))),
    [orgs]
  );
  // The occasion's causes arrive as strings; keep only the live ones.
  const occasionCauses = useMemo(() => {
    const asked = route.params?.causes ?? [];
    return liveCauses.filter((cause) => asked.includes(cause.id)).map((cause) => cause.id);
  }, [route.params?.causes, liveCauses]);
  const [selected, setSelected] = useState<DaanCause | null>(occasionCauses[0] ?? null);

  const sectionLabelStyle = {
    fontFamily: typography.sectionLabel.fontFamily,
    fontSize: typography.sectionLabel.fontSize,
    letterSpacing: lang === 'en' ? typography.sectionLabel.letterSpacing : 0,
    color: colors.inkMuted,
    textTransform: 'uppercase' as const,
    marginTop: spacing.lg,
    marginBottom: 4,
  };

  // The teaching, above the places. Rendered identically in both grouping
  // states so a filtered द्वार never loses the reason it exists.
  const CauseHeading = ({ cause }: { cause: DaanCauseMeta }) => (
    <View testID={`daan-cause-mahatva-${cause.id}`}>
      <Text style={sectionLabelStyle}>{contentByLang(lang, cause.nameHi, cause.nameEn)}</Text>
      <View style={[styles.mahatva, { backgroundColor: colors.parchmentSoft, borderColor: colors.divider, borderRadius: radii.lg }]}>
        <Text style={{ fontFamily: bodyFont, fontSize: 13, lineHeight: 21, color: colors.inkSoft }}>
          {meaningByLang(lang, cause.mahatvaHi, cause.mahatvaEn)}
        </Text>
        {cause.citeHi && cause.citeEn ? (
          <Text style={{ fontFamily: bodyFont, fontSize: 11.5, lineHeight: 17, color: colors.gold, marginTop: 7 }}>
            {contentByLang(lang, cause.citeHi, cause.citeEn)}
          </Text>
        ) : null}
      </View>
      <Text style={{ fontFamily: bodyFont, fontSize: 11.5, lineHeight: 17, color: colors.inkMuted, marginTop: spacing.md, marginBottom: 6 }}>
        {contentByLang(lang, 'ये स्थान यह सेवा करते हैं — ', 'Places doing this seva — ')}
        {meaningByLang(lang, cause.whomHi, cause.whomEn)}
      </Text>
    </View>
  );

  const OrgRow = ({ org }: { org: DaanOrgEntry }) => (
    <Pressable
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
        <Text style={{ fontFamily: bodyFont, fontSize: 11, lineHeight: 16, color: colors.gold, marginTop: 3 }}>
          {contentByLang(lang, KIND_LABELS[org.kind].hi, KIND_LABELS[org.kind].en)}
          {org.nonMonetaryHi ? contentByLang(lang, ' · धन नहीं', ' · not money') : ''}
        </Text>
      </View>
      <Text style={{ fontSize: 18, color: colors.inkMuted }}>›</Text>
    </Pressable>
  );

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
            'पहले प्रयोजन का महत्त्व, फिर वे स्थान जो यह सेवा करते हैं। दान उनकी अपनी वेबसाइट पर होगा — ऐप किसी लेन-देन का हिस्सा नहीं है।',
            'First why each cause matters, then the places doing that seva. The giving happens on their own website — the app is never part of any transaction.'
          )}
        </Text>

        {occasionCauses.length > 0 ? (
          <Text
            testID="daan-directory-occasion-line"
            style={{ fontFamily: bodyFont, fontSize: 12.5, lineHeight: 19, color: colors.saffronDeep, textAlign: 'center', marginTop: spacing.sm }}
          >
            {contentByLang(lang, 'इस दिन की सेवा — ', 'This day serves — ')}
            {occasionCauses
              .map((id) => {
                const meta = DAAN_CAUSES.find((cause) => cause.id === id)!;
                return contentByLang(lang, meta.nameHi, meta.nameEn);
              })
              .join(' · ')}
          </Text>
        ) : null}

        {/* प्रयोजन chips — derived from rows present, so never an empty shelf. */}
        <View style={styles.chips}>
          {liveCauses.map((cause) => {
            const active = selected === cause.id;
            return (
              <Pressable
                key={cause.id}
                testID={`daan-cause-${cause.id}`}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                accessibilityLabel={`Cause ${cause.nameEn}`}
                onPress={() => setSelected(active ? null : cause.id)}
                style={[
                  styles.chip,
                  {
                    borderColor: active ? colors.cardActiveBorder : colors.border,
                    backgroundColor: active ? colors.goldChipBg : colors.surface,
                    borderRadius: radii.pill,
                  },
                ]}
              >
                <Text style={{ fontFamily: titleFont, fontSize: 12.5, lineHeight: 19, color: active ? colors.saffronDeep : colors.inkSoft }}>
                  {contentByLang(lang, cause.nameHi, cause.nameEn)}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {selected ? (
          (() => {
            const meta = DAAN_CAUSES.find((cause) => cause.id === selected)!;
            const rows = orgs.filter((org) => org.causes.includes(selected));
            return (
              <View testID="daan-directory-filtered">
                <CauseHeading cause={meta} />
                {rows.map((org) => (
                  <OrgRow key={org.id} org={org} />
                ))}
              </View>
            );
          })()
        ) : (
          liveCauses.map((cause) => {
            const rows = orgs.filter((org) => org.causes.includes(cause.id));
            return (
              <View key={cause.id} testID={`daan-cause-group-${cause.id}`}>
                <CauseHeading cause={cause} />
                {rows.map((org) => (
                  <OrgRow key={`${cause.id}-${org.id}`} org={org} />
                ))}
              </View>
            );
          })
        )}

        <Text style={{ fontFamily: bodyFont, fontSize: 11.5, lineHeight: 18, color: colors.inkMuted, textAlign: 'center', marginTop: spacing.lg }}>
          {meaningByLang(
            lang,
            'यह सूची जान-बूझकर छोटी रखी गई है। ऐप इनका प्रतिनिधि नहीं — केवल आधिकारिक वेबसाइट तक पहुँचाता है; पात्र का चयन आपका अपना है।',
            'This list is kept deliberately short. The app does not represent these places — it only points to their official website; choosing the patra is your own.'
          )}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  rowCard: { borderWidth: 1, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 9, flexDirection: 'row', alignItems: 'center', gap: 10 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, justifyContent: 'center', marginTop: 12 },
  chip: { borderWidth: 1, paddingHorizontal: 12, paddingVertical: 6 },
  mahatva: { borderWidth: 1, paddingHorizontal: 14, paddingVertical: 13 },
});
