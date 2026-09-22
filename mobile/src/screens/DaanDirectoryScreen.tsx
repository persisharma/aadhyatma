/**
 * दान-द्वार — the giving directory, organised by प्रयोजन (cause), PRD-26 §5.1.
 * Reached ONLY from a journey's terminal step (§2.7): not a tab, no More-hub
 * row, no other surface links it.
 *
 * Two states:
 *  - grid (nothing selected) → a tile per live cause, each carrying its name
 *    and its "whom this serves" line. NO count anywhere (RULEBOOK §27.14).
 *    Tapping a tile drills into that one cause. If the day arrived carrying its
 *    own causes (`route.params.causes`), those tiles wear the gold ring so the
 *    door points at the day's own प्रयोजन.
 *  - filtered (a cause selected) → that cause's teaching (mahatva) above a thin
 *    list of the places that serve it. Tapping the active chip clears back to
 *    the grid.
 *
 * Cause tiles/chips are DERIVED from the rows present (`liveCauses`) — a cause
 * with no verified row never renders, so the taxonomy can never show an empty
 * shelf.
 *
 * EXPLAIN BEFORE LISTING (RULEBOOK §27.14): the filtered द्वार renders the
 * cause's **mahatva** — why this daan is held dear, with its citation where it
 * makes a textual claim — ABOVE the places that serve it. Nothing about an
 * organization beyond its one line lives here, and the screen never shows a
 * give/open affordance (that lives on the detail, §2.7).
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
  // Only causes that actually have a verified row may become a tile.
  const liveCauses = useMemo(
    () => DAAN_CAUSES.filter((cause) => orgs.some((org) => org.causes.includes(cause.id))),
    [orgs]
  );
  // The occasion's causes arrive as strings; keep only the live ones, in order.
  const occasionCauses = useMemo(() => {
    const asked = route.params?.causes ?? [];
    return liveCauses.filter((cause) => asked.includes(cause.id)).map((cause) => cause.id);
  }, [route.params?.causes, liveCauses]);
  // Arrival routing (§5.1): exactly one live cause asked → open it filtered
  // directly; multiple → grid with those ringed; none → plain grid.
  const [selected, setSelected] = useState<DaanCause | null>(
    occasionCauses.length === 1 ? occasionCauses[0] : null
  );
  const fromOccasion = occasionCauses.length > 0;

  const sectionLabelStyle = {
    fontFamily: typography.sectionLabel.fontFamily,
    fontSize: typography.sectionLabel.fontSize,
    letterSpacing: lang === 'en' ? typography.sectionLabel.letterSpacing : 0,
    color: colors.inkMuted,
    textTransform: 'uppercase' as const,
    marginTop: spacing.lg,
    marginBottom: 4,
  };

  // The teaching, above the places — the filtered द्वार never loses the reason
  // it exists (RULEBOOK §27.14).
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

  // One cause tile in the grid. No count — just the name and whom it serves.
  const CauseTile = ({ cause }: { cause: DaanCauseMeta }) => {
    const ringed = occasionCauses.includes(cause.id);
    return (
      <Pressable
        testID={`daan-cause-tile-${cause.id}`}
        accessibilityRole="button"
        accessibilityState={{ selected: ringed }}
        accessibilityLabel={`Cause ${cause.nameEn}`}
        onPress={() => setSelected(cause.id)}
        style={[
          styles.tile,
          {
            borderColor: ringed ? colors.cardActiveBorder : colors.divider,
            backgroundColor: ringed ? colors.goldChipBg : colors.parchmentSoft,
            borderRadius: radii.lg,
          },
          elevation.card,
        ]}
      >
        <Text style={{ fontFamily: titleFont, fontSize: 15, lineHeight: 22, color: ringed ? colors.saffronDeep : colors.ink }}>
          {contentByLang(lang, cause.nameHi, cause.nameEn)}
        </Text>
        <Text style={{ fontFamily: bodyFont, fontSize: 11.5, lineHeight: 17, color: colors.inkMuted, marginTop: 4 }}>
          {meaningByLang(lang, cause.whomHi, cause.whomEn)}
        </Text>
      </Pressable>
    );
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
            'दान संस्था की अपनी वेबसाइट पर होगा — ऐप किसी लेन-देन का हिस्सा नहीं है।',
            'The giving happens on the organization’s own website — the app is never part of any transaction.'
          )}
        </Text>

        {selected ? (
          (() => {
            const meta = DAAN_CAUSES.find((cause) => cause.id === selected)!;
            const rows = orgs.filter((org) => org.causes.includes(selected));
            return (
              <View testID="daan-directory-filtered">
                {fromOccasion ? (
                  <Text
                    testID="daan-directory-occasion-line"
                    style={{ fontFamily: bodyFont, fontSize: 12.5, lineHeight: 19, color: colors.saffronDeep, textAlign: 'center', marginTop: spacing.sm }}
                  >
                    {contentByLang(lang, 'इस दिन की सेवा — ', 'This day serves — ')}
                    {occasionCauses
                      .map((id) => {
                        const c = DAAN_CAUSES.find((cause) => cause.id === id)!;
                        return contentByLang(lang, c.nameHi, c.nameEn);
                      })
                      .join(' · ')}
                  </Text>
                ) : null}
                {/* The active chip: tapping it clears back to the grid. */}
                <View style={styles.chips}>
                  <Pressable
                    testID={`daan-cause-${meta.id}`}
                    accessibilityRole="button"
                    accessibilityState={{ selected: true }}
                    accessibilityLabel={`Cause ${meta.nameEn}`}
                    onPress={() => setSelected(null)}
                    style={[
                      styles.chip,
                      { borderColor: colors.cardActiveBorder, backgroundColor: colors.goldChipBg, borderRadius: radii.pill },
                    ]}
                  >
                    <Text style={{ fontFamily: titleFont, fontSize: 12.5, lineHeight: 19, color: colors.saffronDeep }}>
                      {contentByLang(lang, meta.nameHi, meta.nameEn)}
                    </Text>
                  </Pressable>
                </View>
                <CauseHeading cause={meta} />
                {rows.map((org) => (
                  <OrgRow key={org.id} org={org} />
                ))}
              </View>
            );
          })()
        ) : (
          <View testID="daan-directory-grid" style={styles.grid}>
            {liveCauses.map((cause) => (
              <CauseTile key={cause.id} cause={cause} />
            ))}
          </View>
        )}

        <Text style={{ fontFamily: bodyFont, fontSize: 11.5, lineHeight: 18, color: colors.inkMuted, textAlign: 'center', marginTop: spacing.lg }}>
          {meaningByLang(
            lang,
            'ऐप इन संस्थाओं का प्रतिनिधि नहीं है — केवल उनकी आधिकारिक वेबसाइट तक पहुँचाता है।',
            'The app does not represent these organizations — it only points to their official website.'
          )}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 14, gap: 10 },
  tile: { borderWidth: 1, paddingHorizontal: 13, paddingVertical: 13, flexBasis: '47%', flexGrow: 1 },
  rowCard: { borderWidth: 1, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 9, flexDirection: 'row', alignItems: 'center', gap: 10 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, justifyContent: 'center', marginTop: 12 },
  chip: { borderWidth: 1, paddingHorizontal: 12, paddingVertical: 6 },
  mahatva: { borderWidth: 1, paddingHorizontal: 14, paddingVertical: 13 },
});
