/**
 * तुलना — homes side by side (PRD-24 Phase 2 §E3/US-13). One column per
 * selected `considering` home (2–3): label, door, the five class pills (zeros
 * included), then every room either home measured, registry order, each cell
 * naming zone + class. NO winner, NO rank, NO superlative, no colour beyond
 * the class tokens — the closing line hands the decision back to the user
 * (RULEBOOK §22 amended rule 5). Ids no longer on the roster silently drop;
 * fewer than two left degrades to the roster's empty-state copy.
 */
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import ReaderHeader from '@/components/ReaderHeader';
import { useGitaLanguage } from '@/data/gita/language';
import { getHomeTemplate } from '@/data/vastu/homeTemplates';
import { zoneLabel } from '@/data/vastu/mandala';
import { getVastuRoomEntries } from '@/data/vastu/roomGuidance';
import { DISHA_LABELS } from '@/panchang/eventMuhurat';
import { useTheme } from '@/theme/ThemeContext';
import { contentByLang, meaningByLang } from '@/utils/localize';
import { scriptBodyFont, scriptTitleFont } from '@/utils/langType';
import {
  FINDING_CLASS_LABELS,
  FINDING_CLASS_ORDER,
  assessHome,
  type FindingClass,
  type HomeAssessmentModel,
} from '@/vastu/assessHome';
import { useHomeRoster } from '@/vastu/homeRecordStore';

type Navigation = { goBack: () => void };
type Route = { params: { homeIds: readonly string[] } };

const findingKey = (roomId: string, ordinal: number) => `${roomId}-${ordinal}`;

export default function GharVastuCompareScreen({ navigation, route }: { navigation: Navigation; route: Route }) {
  const { colors, typography, spacing, radii } = useTheme();
  const { lang } = useGitaLanguage();
  const titleFont = scriptTitleFont(lang, typography.readerTitle.fontFamily);
  const bodyFont = scriptBodyFont(lang, typography.meaning.fontFamily);
  const { hydrated, roster } = useHomeRoster();

  // Ids that left the roster since selection silently drop.
  const homes = route.params.homeIds
    .map((id) => roster.homes.find((home) => home.id === id))
    .filter((home): home is NonNullable<typeof home> => home != null);

  if (!hydrated || homes.length < 2) {
    return (
      <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]} edges={['top']} testID="ghar-vastu-compare-screen">
        <ReaderHeader title={contentByLang(lang, 'तुलना', 'Compare')} variant="index" onBack={() => navigation.goBack()} />
        {hydrated ? (
          <Text style={{ fontFamily: bodyFont, fontSize: 13, color: colors.inkMuted, textAlign: 'center', marginTop: spacing.xl }}>
            {contentByLang(lang, 'तुलना के लिए कम से कम दो घर चाहिए — कोई घर अब सूची में नहीं है।', 'Comparing needs at least two homes — one is no longer on the roster.')}
          </Text>
        ) : null}
      </SafeAreaView>
    );
  }

  const models: HomeAssessmentModel[] = homes.map((home) => assessHome(home));
  const findingByKey = models.map(
    (model) => new Map(model.groups.flatMap((group) => group.findings).map((finding) => [findingKey(finding.roomId, finding.ordinal), finding]))
  );

  // The union of every measured-or-seeded room across the columns, registry
  // order first (the reading's order, never a ranking), ordinal within.
  const registryOrder = new Map(getVastuRoomEntries().map((entry, index) => [entry.id, index] as const));
  const unionKeys = [
    ...new Map(
      models
        .flatMap((model) => model.groups.flatMap((group) => group.findings))
        .filter((finding) => finding.roomId !== 'main-door')
        .map((finding) => [findingKey(finding.roomId, finding.ordinal), finding] as const)
    ).values(),
  ].sort((a, b) => {
    const byRegistry = (registryOrder.get(a.roomId) ?? 99) - (registryOrder.get(b.roomId) ?? 99);
    return byRegistry !== 0 ? byRegistry : a.ordinal - b.ordinal;
  });

  const clsTextColor = (cls: FindingClass) =>
    cls === 'forbidden' ? colors.avoidDeep : cls === 'in-keeping' ? colors.saffronDeep : colors.inkSoft;

  const zoneText = (zone: string | null) =>
    zone == null
      ? contentByLang(lang, 'अभी मापा नहीं', 'Not yet measured')
      : zoneLabel(zone as never, lang === 'en' ? 'en' : 'hi');

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]} edges={['top']} testID="ghar-vastu-compare-screen">
      <ReaderHeader title={contentByLang(lang, 'तुलना', 'Compare')} variant="index" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={{ paddingHorizontal: spacing.readingGutter, paddingBottom: spacing.xxl }}>
        {/* header row — one column per home */}
        <View style={[styles.row, { marginTop: spacing.md }]}>
          {homes.map((home, index) => {
            const template = getHomeTemplate(home.template);
            return (
              <View key={home.id} style={styles.col} testID={`compare-col-${home.id}`}>
                <Text numberOfLines={2} style={{ fontFamily: titleFont, fontSize: 13.5, lineHeight: 19, color: colors.ink }}>
                  {home.label}
                </Text>
                <Text style={{ fontFamily: bodyFont, fontSize: 11, lineHeight: 16, color: colors.inkMuted, marginTop: 2 }}>
                  {[
                    template ? contentByLang(lang, template.labelHi, template.labelEn) : home.template,
                    home.facing
                      ? `${contentByLang(lang, 'मुख', 'Facing')} ${contentByLang(lang, DISHA_LABELS[home.facing].hi, DISHA_LABELS[home.facing].en)}`
                      : null,
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                </Text>
                {/* class pills — vertical micro-strip, zeros render */}
                <View style={{ gap: 3, marginTop: 8 }} testID={`compare-pills-${index}`}>
                  {FINDING_CLASS_ORDER.filter(
                    (cls) => cls !== 'unmeasured' || models.some((model) => model.counts.unmeasured > 0)
                  ).map((cls) => (
                    <View
                      key={cls}
                      style={[
                        styles.pill,
                        {
                          backgroundColor:
                            cls === 'forbidden' ? colors.avoidChipBg : cls === 'in-keeping' ? colors.goldChipBg : colors.parchment,
                          borderColor: cls === 'forbidden' || cls === 'in-keeping' ? 'transparent' : colors.divider,
                          borderRadius: radii.pill,
                        },
                      ]}
                    >
                      <Text style={{ fontFamily: titleFont, fontSize: 10, lineHeight: 14, color: clsTextColor(cls) }}>
                        {contentByLang(lang, FINDING_CLASS_LABELS[cls].hi, FINDING_CLASS_LABELS[cls].en)}
                        {` ${models[index]!.counts[cls]}`}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            );
          })}
        </View>

        {/* door row */}
        <Text style={[styles.sectionLabel, { color: colors.inkMuted, fontFamily: typography.sectionLabel.fontFamily, fontSize: typography.sectionLabel.fontSize, marginTop: spacing.xl }]}>
          {contentByLang(lang, 'मुख्य द्वार', 'Main door')}
        </Text>
        <View style={styles.row}>
          {homes.map((home, index) => {
            const door = findingByKey[index]!.get(findingKey('main-door', 1));
            return (
              <View key={home.id} style={styles.col}>
                <Text style={{ fontFamily: bodyFont, fontSize: 11.5, lineHeight: 17, color: door ? clsTextColor(door.cls) : colors.inkMuted }}>
                  {door ? `${zoneText(door.zone)} · ${contentByLang(lang, FINDING_CLASS_LABELS[door.cls].hi, FINDING_CLASS_LABELS[door.cls].en)}` : '—'}
                </Text>
              </View>
            );
          })}
        </View>

        {/* per-room rows across the union */}
        {unionKeys.map((room) => (
          <View key={findingKey(room.roomId, room.ordinal)} testID={`compare-room-${findingKey(room.roomId, room.ordinal)}`}>
            <Text style={{ fontFamily: titleFont, fontSize: 12.5, lineHeight: 18, color: colors.ink, marginTop: spacing.md }}>
              {contentByLang(lang, room.titleHi, room.titleEn)}
              {room.ordinal > 1 ? ` ${room.ordinal}` : ''}
            </Text>
            <View style={[styles.row, { marginTop: 3 }]}>
              {homes.map((home, index) => {
                const finding = findingByKey[index]!.get(findingKey(room.roomId, room.ordinal));
                return (
                  <View key={home.id} style={styles.col}>
                    {finding && finding.zone != null ? (
                      <Text style={{ fontFamily: bodyFont, fontSize: 11.5, lineHeight: 17, color: clsTextColor(finding.cls) }}>
                        {zoneText(finding.zone)}
                        {' · '}
                        {contentByLang(lang, FINDING_CLASS_LABELS[finding.cls].hi, FINDING_CLASS_LABELS[finding.cls].en)}
                      </Text>
                    ) : (
                      <Text style={{ fontFamily: bodyFont, fontSize: 11.5, lineHeight: 17, color: colors.inkMuted }}>
                        {`— · ${contentByLang(lang, 'अभी मापा नहीं', 'Not yet measured')}`}
                      </Text>
                    )}
                  </View>
                );
              })}
            </View>
          </View>
        ))}

        {/* the closing line — the stance, verbatim (US-13) */}
        <Text testID="compare-closing" style={{ fontFamily: bodyFont, fontSize: 12, lineHeight: 19, color: colors.inkSoft, marginTop: spacing.xl }}>
          {meaningByLang(
            lang,
            'कौन-सा घर — यह निर्णय आपका है; यहाँ केवल विधान का पाठ है।',
            'Which home — that decision is yours; this is only a reading of the convention.'
          )}
        </Text>
        <View style={[styles.privacy, { borderLeftColor: colors.goldChipBg }]}>
          <Text style={{ fontFamily: bodyFont, fontSize: 11.5, lineHeight: 17, color: colors.inkMuted, fontStyle: 'italic' }}>
            {meaningByLang(lang, 'ये मानचित्र केवल इस फ़ोन पर हैं — कहीं भेजे नहीं जाते।', 'These maps live only on this phone — they are sent nowhere.')}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  row: { flexDirection: 'row', gap: 10 },
  col: { flex: 1 },
  pill: { borderWidth: 1, paddingHorizontal: 7, paddingVertical: 2, alignSelf: 'flex-start' },
  sectionLabel: { textTransform: 'uppercase', marginBottom: 6 },
  privacy: { borderLeftWidth: 2, paddingLeft: 10, paddingVertical: 4, marginTop: 12 },
});
