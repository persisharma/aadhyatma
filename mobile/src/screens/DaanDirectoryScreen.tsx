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
 *  - filtered (a cause selected) → the cause page (design: CausePage): a chip
 *    row of every live cause (active = night), a night header with the painted
 *    icon, the teaching (mahatva) card, the vaar strip of days the tradition
 *    gives it, then the places that serve it and a "record this daan" door.
 *    Another chip switches cause; the active chip clears back to the grid.
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
import { LinearGradient } from 'expo-linear-gradient';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import ReaderHeader from '@/components/ReaderHeader';
import DaanCauseIcon from '@/components/DaanCauseIcon';
import { useGitaLanguage } from '@/data/gita/language';
import { DAAN_CAUSES, DAAN_VAAR_ENTRIES, getDaanOrgs, type DaanCause, type DaanCauseMeta, type DaanOrgEntry } from '@/data/daan';
import type { DaanStackParamList } from '@/navigation/types';
import { useTheme } from '@/theme/ThemeContext';
import { contentByLang, meaningByLang } from '@/utils/localize';
import { isLatinLang, scriptBodyFont, scriptTitleFont } from '@/utils/langType';

type Props = NativeStackScreenProps<DaanStackParamList, 'DaanDirectory'>;

export default function DaanDirectoryScreen({ navigation, route }: Props) {
  const { colors, typography, spacing, radii, elevation } = useTheme();
  const { lang } = useGitaLanguage();
  const titleFont = scriptTitleFont(lang, typography.readerTitle.fontFamily);
  const bodyFont = scriptBodyFont(lang, typography.meaning.fontFamily);
  // Indic lines reserve >=1.65em or matras clip on iOS (RULEBOOK §3).
  const latin = isLatinLang(lang);
  const lead = (size: number, latinLeading: number) => (latin ? latinLeading : Math.ceil(size * 1.7));

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


  const eyebrow = (color: string) => ({
    fontFamily: typography.sectionLabel.fontFamily,
    fontSize: 11,
    lineHeight: lead(11, 16),
    letterSpacing: latin ? 1.1 : 0,
    textTransform: 'uppercase' as const,
    color,
  });

  // The cause page (design: CausePage) — a night header, the teaching ABOVE the
  // places (RULEBOOK §27.14), the vaar strip, then the places. No count anywhere.
  const CausePage = ({ cause }: { cause: DaanCauseMeta }) => {
    const rows = orgs.filter((org) => org.causes.includes(cause.id));
    const position = liveCauses.findIndex((entry) => entry.id === cause.id) + 1;
    const todayIdx = new Date().getDay();
    const days = DAAN_VAAR_ENTRIES.map((entry) => ({ entry, gives: (entry.causes ?? []).includes(cause.id) }));
    return (
      <View style={{ gap: 18, marginTop: 14 }}>
        <LinearGradient
          testID={`daan-cause-hero-${cause.id}`}
          colors={[colors.skyNightTop, colors.skyNightUpper, colors.skyNightHorizon]}
          locations={[0, 0.55, 1]}
          style={[styles.causeHero, { borderColor: colors.gold, borderRadius: radii.xl }, elevation.lifted]}
        >
          <View pointerEvents="none" style={[styles.star, { right: 30, top: 14, backgroundColor: colors.starLight }]} />
          <View pointerEvents="none" style={[styles.star, { right: 90, bottom: 16, backgroundColor: colors.starLight }]} />
          <DaanCauseIcon cause={cause.id} size={72} />
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={eyebrow(colors.nightGold)}>
              {contentByLang(lang, `सेवा ${position} / ${liveCauses.length}`, `Seva ${position} of ${liveCauses.length}`)}
            </Text>
            <Text style={{ fontFamily: titleFont, fontSize: 23, lineHeight: lead(23, 31), color: colors.nightInk }}>
              {contentByLang(lang, cause.nameHi, cause.nameEn)}
            </Text>
            <Text style={{ fontFamily: bodyFont, fontSize: 13.5, lineHeight: lead(13.5, 21), color: colors.nightInkSoft }}>
              {meaningByLang(lang, cause.whomHi, cause.whomEn)}
            </Text>
          </View>
        </LinearGradient>

        <View
          testID={`daan-cause-mahatva-${cause.id}`}
          style={[styles.whyCard, { backgroundColor: colors.panchangTileFrom, borderColor: colors.panchangTileBorder, borderRadius: radii.xl }]}
        >
          <Text style={eyebrow(colors.saffronDeep)}>{contentByLang(lang, 'यह दान क्यों प्रिय है', 'Why this daan is held dear')}</Text>
          <Text style={{ fontFamily: bodyFont, fontSize: 14.5, lineHeight: lead(14.5, 25), color: colors.ink, marginTop: 8 }}>
            {meaningByLang(lang, cause.mahatvaHi, cause.mahatvaEn)}
          </Text>
          {cause.citeHi && cause.citeEn ? (
            <Text style={{ fontFamily: typography.sectionLabel.fontFamily, fontSize: 12, lineHeight: lead(12, 18), color: colors.inkMuted, marginTop: 10 }}>
              {contentByLang(lang, cause.citeHi, cause.citeEn)}
            </Text>
          ) : null}
        </View>

        {days.some((day) => day.gives) ? (
          <View testID={`daan-cause-days-${cause.id}`}>
            <Text style={[eyebrow(colors.saffronDeep), { marginBottom: 10 }]}>
              {contentByLang(lang, 'परम्परा में इस दान के वार', 'Days the tradition gives this daan')}
            </Text>
            <View style={styles.dayStrip}>
              {days.map(({ entry, gives }) => {
                const isToday = entry.weekday === todayIdx;
                const dark = gives && isToday;
                return (
                  <View
                    key={entry.weekday}
                    accessible
                    accessibilityLabel={`${entry.vaarEn}${isToday ? ', today' : ''}${gives ? ', gives this daan' : ''}`}
                    style={[
                      styles.dayCell,
                      {
                        borderRadius: radii.md,
                        backgroundColor: dark ? colors.skyNightUpper : gives ? colors.parchmentSoft : colors.panchangTileFrom,
                        borderColor: gives ? colors.cardActiveBorder : colors.panchangTileBorder,
                        borderStyle: gives ? 'solid' : 'dashed',
                      },
                    ]}
                  >
                    <Text numberOfLines={1} style={{ fontFamily: typography.sectionLabel.fontFamily, fontSize: 12, lineHeight: lead(12, 17), color: dark ? colors.nightGold : gives ? colors.saffronDeep : colors.inkMuted }}>
                      {contentByLang(lang, entry.vaarHi.replace(/वार$/, ''), entry.vaarEn.slice(0, 3))}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        ) : null}

        <View>
          <Text style={[eyebrow(colors.saffronDeep), { marginBottom: 10 }]}>{contentByLang(lang, 'जो स्थान यह सेवा करते हैं', 'Places that serve it')}</Text>
          <View style={{ gap: 10 }}>
            {rows.map((org) => (
              <OrgRow key={org.id} org={org} />
            ))}
          </View>
        </View>

        <Pressable
          testID="daan-cause-record"
          accessibilityRole="button"
          onPress={() => navigation.navigate('DaanEntry', undefined)}
          style={({ pressed }) => [styles.recordBtn, { borderColor: colors.saffron, borderRadius: radii.pill }, pressed && { opacity: 0.7 }]}
        >
          <Text style={{ fontFamily: titleFont, fontSize: 15, lineHeight: lead(15, 21), color: colors.saffronDeep }}>
            {contentByLang(lang, 'यह दान अपने खाते में दर्ज करें', 'Record this daan in your register')}
          </Text>
        </Pressable>
      </View>
    );
  };

  // A place: night initial square, name, its one line, and where the tap leads.
  const OrgRow = ({ org }: { org: DaanOrgEntry }) => (
    <Pressable
      testID={`daan-org-${org.id}`}
      accessibilityRole="button"
      accessibilityLabel={`Organization ${org.nameEn}`}
      onPress={() => navigation.navigate('DaanDirectoryDetail', { orgId: org.id })}
      style={({ pressed }) => [
        styles.rowCard,
        { backgroundColor: colors.panchangTileFrom, borderColor: colors.panchangTileBorder, borderRadius: radii.lg },
        elevation.card,
        pressed && { opacity: 0.8 },
      ]}
    >
      <LinearGradient colors={[colors.skyNightUpper, colors.skyNightLower]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.initial, { borderRadius: radii.md }]}>
        <Text style={{ fontFamily: typography.sectionLabel.fontFamily, fontSize: 15, lineHeight: 20, color: colors.nightGold }}>
          {org.nameEn.replace(/^The /, '').charAt(0)}
        </Text>
      </LinearGradient>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={{ fontFamily: titleFont, fontSize: 15, lineHeight: lead(15, 23), color: colors.ink }}>
          {contentByLang(lang, org.nameHi, org.nameEn)}
        </Text>
        <Text style={{ fontFamily: bodyFont, fontSize: 12.5, lineHeight: lead(12.5, 19), color: colors.inkMuted }} numberOfLines={3}>
          {meaningByLang(lang, org.aboutHi, org.aboutEn)}
        </Text>
        <Text style={{ fontFamily: typography.sectionLabel.fontFamily, fontSize: 12, lineHeight: lead(12, 18), color: colors.saffronDeep, marginTop: 4 }}>
          {org.directPay
            ? contentByLang(lang, 'उनका दान-पृष्ठ खुलता है ›', 'Opens their donation page ›')
            : contentByLang(lang, 'उनकी वेबसाइट खुलती है ›', 'Opens their website ›')}
          {org.nonMonetaryHi ? contentByLang(lang, ' · धन नहीं', ' · not money') : ''}
        </Text>
      </View>
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
            borderColor: ringed ? colors.cardActiveBorder : colors.panchangTileBorder,
            backgroundColor: ringed ? colors.goldChipBg : colors.panchangTileFrom,
            borderRadius: radii.lg,
          },
          elevation.card,
        ]}
      >
        <DaanCauseIcon cause={cause.id} size={46} testID={`daan-cause-tile-icon-${cause.id}`} />
        <Text style={{ marginTop: 8, fontFamily: titleFont, fontSize: 15, lineHeight: lead(15, 23), color: ringed ? colors.saffronDeep : colors.ink }}>
          {contentByLang(lang, cause.nameHi, cause.nameEn)}
        </Text>
        <Text style={{ fontFamily: bodyFont, fontSize: 11.5, lineHeight: lead(11.5, 18), color: colors.inkMuted, marginTop: 4 }}>
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
      <ScrollView contentContainerStyle={{ paddingHorizontal: spacing.readingGutter, paddingTop: spacing.sm, paddingBottom: spacing.xxl }}>
        {selected ? (
          (() => {
            const meta = DAAN_CAUSES.find((cause) => cause.id === selected)!;
            return (
              <View testID="daan-directory-filtered">
                {fromOccasion ? (
                  <Text
                    testID="daan-directory-occasion-line"
                    style={{ fontFamily: bodyFont, fontSize: 12.5, lineHeight: lead(12.5, 19), color: colors.saffronDeep, marginBottom: 10 }}
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
                {/* Every live cause as a chip; the active one (night) clears back to the grid. */}
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={{ marginHorizontal: -spacing.readingGutter }}
                  contentContainerStyle={{ paddingHorizontal: spacing.readingGutter, gap: 8 }}
                >
                  {liveCauses.map((cause) => {
                    const active = cause.id === selected;
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
                            borderRadius: radii.pill,
                            backgroundColor: active ? colors.skyNightUpper : colors.panchangTileFrom,
                            borderColor: active ? colors.skyNightUpper : colors.panchangTileBorder,
                            borderWidth: active ? 1.5 : 1,
                          },
                        ]}
                      >
                        <DaanCauseIcon cause={cause.id} size={34} />
                        <Text numberOfLines={1} style={{ fontFamily: titleFont, fontSize: 13, lineHeight: lead(13, 18), color: active ? colors.nightGold : colors.inkSoft }}>
                          {contentByLang(lang, cause.nameHi, cause.nameEn)}
                        </Text>
                      </Pressable>
                    );
                  })}
                </ScrollView>
                <CausePage cause={meta} />
              </View>
            );
          })()
        ) : (
          <>
            <Text style={{ fontFamily: titleFont, fontSize: 15, lineHeight: lead(15, 23), color: colors.ink, textAlign: 'center', marginTop: spacing.sm }}>
              {contentByLang(lang, 'देशे काले च पात्रे', 'Deshe kāle cha pātre')}
            </Text>
            <Text style={{ fontFamily: bodyFont, fontSize: 12, lineHeight: lead(12, 18), color: colors.inkMuted, textAlign: 'center', marginTop: 4 }}>
              {meaningByLang(
                lang,
                'दान संस्था की अपनी वेबसाइट पर होगा — ऐप किसी लेन-देन का हिस्सा नहीं है।',
                'The giving happens on the organization’s own website — the app is never part of any transaction.'
              )}
            </Text>
            <View testID="daan-directory-grid" style={styles.grid}>
              {liveCauses.map((cause) => (
                <CauseTile key={cause.id} cause={cause} />
              ))}
            </View>
          </>
        )}

        <Text style={{ fontFamily: bodyFont, fontSize: 12.5, lineHeight: lead(12.5, 19), color: colors.inkMuted, textAlign: 'center', marginTop: spacing.lg }}>
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
  rowCard: { borderWidth: 1, paddingHorizontal: 14, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', gap: 12 },
  initial: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  chip: { minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 6, paddingLeft: 4, paddingRight: 14 },
  causeHero: { flexDirection: 'row', alignItems: 'center', gap: 14, borderWidth: 1, paddingHorizontal: 16, paddingVertical: 18, overflow: 'hidden' },
  star: { position: 'absolute', width: 2, height: 2, borderRadius: 1 },
  whyCard: { borderWidth: 1, paddingHorizontal: 18, paddingVertical: 16 },
  dayStrip: { flexDirection: 'row', gap: 5 },
  dayCell: { flex: 1, minHeight: 44, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  recordBtn: { minHeight: 50, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 12 },
});
