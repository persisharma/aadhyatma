/**
 * मेरा घर — the assessment (PRD-24 Phase 2 §C3, design.md §66.5). ONE reading:
 * the mandala grid (UX decision 2026-09-05 — the ledger variant was dropped),
 * then the class-count strip (five pills always, a zero included; unmeasured
 * appears only when something is unmeasured), then the finding groups in the
 * frozen order forbidden → differs → preferred-unmet → alternate → in-keeping
 * → unmeasured, registry order within a group.
 *
 * Stance (RULEBOOK §22, amended): weighted convention read against the user's
 * placements — NO composite score, NO percentage, NO rank, NO remedies. Every
 * finding is "the texts say X about this placement", never "your home is bad".
 */
import React from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import ReaderHeader from '@/components/ReaderHeader';
import VastuMandalaGrid, { type MandalaGridChip } from '@/components/VastuMandalaGrid';
import { useGitaLanguage } from '@/data/gita/language';
import { getDoorPadaByIndex } from '@/data/vastu/doorPadas';
import { getHomeTemplate } from '@/data/vastu/homeTemplates';
import { zoneLabel } from '@/data/vastu/mandala';
import { DISHA_LABELS } from '@/panchang/eventMuhurat';
import { useTheme } from '@/theme/ThemeContext';
import { contentByLang, meaningByLang } from '@/utils/localize';
import { scriptBodyFont, scriptTitleFont } from '@/utils/langType';
import {
  FINDING_CLASS_LABELS,
  FINDING_CLASS_ORDER,
  WEIGHT_LABELS,
  assessHome,
  type FindingClass,
  type HomeFinding,
} from '@/vastu/assessHome';
import { deleteHome, useHomeRoster } from '@/vastu/homeRecordStore';

type Navigation = {
  goBack: () => void;
  navigate: (route: string, params?: object) => void;
};

type Route = { params: { homeId: string } };

export default function GharVastuScreen({ navigation, route }: { navigation: Navigation; route: Route }) {
  const { colors, typography, spacing, radii } = useTheme();
  const { lang } = useGitaLanguage();
  const titleFont = scriptTitleFont(lang, typography.readerTitle.fontFamily);
  const bodyFont = scriptBodyFont(lang, typography.meaning.fontFamily);
  const { hydrated, roster } = useHomeRoster();

  const home = roster.homes.find((h) => h.id === route.params.homeId);

  if (!hydrated || !home) {
    return (
      <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]} edges={['top']} testID="ghar-vastu-screen">
        <ReaderHeader title={contentByLang(lang, 'मेरा घर', 'My home')} variant="index" onBack={() => navigation.goBack()} />
        {hydrated ? (
          <Text style={{ fontFamily: bodyFont, fontSize: 13, color: colors.inkMuted, textAlign: 'center', marginTop: spacing.xl }}>
            {contentByLang(lang, 'यह घर अब सूची में नहीं है।', 'This home is no longer on the roster.')}
          </Text>
        ) : null}
      </SafeAreaView>
    );
  }

  const model = assessHome(home);
  const template = getHomeTemplate(home.template);

  const gridChips: MandalaGridChip[] = model.groups
    .flatMap((group) => group.findings)
    .filter((finding) => finding.zone != null)
    .map((finding) => ({
      key: `${finding.roomId}-${finding.ordinal}`,
      label:
        finding.ordinal > 1
          ? `${contentByLang(lang, finding.titleHi, finding.titleEn)} ${finding.ordinal}`
          : contentByLang(lang, finding.titleHi, finding.titleEn),
      zone: finding.zone!,
      at: finding.at,
      cls: finding.cls,
    }));

  const gridNarration = model.groups
    .flatMap((g) => g.findings)
    .filter((f) => f.zone != null)
    .map(
      (f) =>
        `${f.titleEn}${f.ordinal > 1 ? ` ${f.ordinal}` : ''} in ${zoneLabel(f.zone!, 'en')}, ${FINDING_CLASS_LABELS[f.cls].en}`
    )
    .join('; ');

  // The measured pada surfaces only while its wall's registry rows stay
  // verified (US-11: facing only otherwise — never a placeholder).
  const doorPada = home.doorPada != null ? getDoorPadaByIndex(home.doorPada) : null;

  const subtitle = [
    template ? contentByLang(lang, template.labelHi, template.labelEn) : home.template,
    home.facing
      ? `${contentByLang(lang, 'मुख', 'Facing')} ${contentByLang(lang, DISHA_LABELS[home.facing].hi, DISHA_LABELS[home.facing].en)}${
          doorPada ? ` · ${contentByLang(lang, `${doorPada.pada.nameHi} पद`, `${doorPada.pada.nameEn} pada`)}` : ''
        }`
      : null,
    home.role === 'living' ? contentByLang(lang, 'यहाँ रहते हैं', 'We live here') : contentByLang(lang, 'देख रहे हैं', 'Viewing'),
  ]
    .filter(Boolean)
    .join(' · ');

  const confirmDelete = () => {
    Alert.alert(
      contentByLang(lang, 'घर हटाएँ?', 'Delete this home?'),
      contentByLang(lang, 'यह रिकॉर्ड केवल इसी फ़ोन पर है — हटाने के बाद वापस नहीं आता।', 'This record lives only on this phone — deleting it cannot be undone.'),
      [
        { text: contentByLang(lang, 'रहने दें', 'Keep'), style: 'cancel' },
        {
          text: contentByLang(lang, 'हटाएँ', 'Delete'),
          style: 'destructive',
          onPress: () => {
            void deleteHome(home.id);
            navigation.goBack();
          },
        },
      ]
    );
  };

  const sectionLabelStyle = {
    fontFamily: typography.sectionLabel.fontFamily,
    fontSize: typography.sectionLabel.fontSize,
    letterSpacing: lang === 'en' ? typography.sectionLabel.letterSpacing : 0,
    color: colors.inkMuted,
    textTransform: 'uppercase' as const,
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
  };

  // Five pills always render (a zero is information); unmeasured joins only
  // when something is actually unmeasured (PRD-24 Phase 2 US-09).
  const stripClasses = FINDING_CLASS_ORDER.filter(
    (cls) => cls !== 'unmeasured' || model.counts.unmeasured > 0
  );

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]} edges={['top']} testID="ghar-vastu-screen">
      <ReaderHeader title={home.label} variant="index" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={{ paddingHorizontal: spacing.readingGutter, paddingBottom: spacing.xxl }}>
        <Text style={{ fontFamily: bodyFont, fontSize: 12.5, lineHeight: 19, color: colors.inkMuted }}>{subtitle}</Text>

        <Text style={sectionLabelStyle}>{contentByLang(lang, 'वास्तु पुरुष मंडल · आपके कक्ष', 'Vastu Purusha Mandala · your rooms')}</Text>
        <VastuMandalaGrid
          chips={gridChips}
          facing={home.facing}
          accessibilityLabel={
            gridNarration ||
            contentByLang(lang, 'मंडल — अभी कोई कक्ष नहीं रखा गया', 'Mandala — no rooms placed yet')
          }
        />

        {/* class summary strip — never a total, never a percent */}
        <View style={[styles.strip]} testID="ghar-class-strip">
          {stripClasses.map((cls) => {
            const forbidden = cls === 'forbidden';
            return (
              <View
                key={cls}
                testID={`ghar-pill-${cls}`}
                style={[
                  styles.pill,
                  {
                    backgroundColor: forbidden ? colors.avoidChipBg : cls === 'in-keeping' ? colors.goldChipBg : colors.parchmentSoft,
                    borderColor: forbidden || cls === 'in-keeping' ? 'transparent' : colors.divider,
                    borderRadius: radii.pill,
                  },
                ]}
              >
                <Text
                  style={{
                    fontFamily: titleFont,
                    fontSize: 11,
                    lineHeight: 16,
                    color: forbidden ? colors.avoidDeep : cls === 'in-keeping' ? colors.saffronDeep : colors.inkSoft,
                  }}
                >
                  {contentByLang(lang, FINDING_CLASS_LABELS[cls].hi, FINDING_CLASS_LABELS[cls].en)}
                  <Text style={{ fontFamily: typography.meaning.fontFamily }}>{` ${model.counts[cls]}`}</Text>
                </Text>
              </View>
            );
          })}
        </View>

        {/* finding groups in the frozen order */}
        {model.groups.map((group) => (
          <View key={group.cls} testID={`ghar-group-${group.cls}`}>
            <Text
              style={[
                sectionLabelStyle,
                group.cls === 'forbidden' ? { color: colors.avoidDeep } : null,
              ]}
            >
              {contentByLang(lang, FINDING_CLASS_LABELS[group.cls].hi, FINDING_CLASS_LABELS[group.cls].en)}
            </Text>
            {group.findings.map((finding) => (
              <FindingRow key={`${finding.roomId}-${finding.ordinal}`} finding={finding} cls={group.cls} />
            ))}
          </View>
        ))}

        <Text style={{ fontFamily: bodyFont, fontSize: 11.5, lineHeight: 18, color: colors.inkMuted, marginTop: spacing.lg }}>
          {meaningByLang(
            lang,
            'यह शास्त्रीय परंपरा का, भार सहित, पाठ है — घर का नहीं, स्थान का विधान। जो बदला नहीं जा सकता, उसका व्यावहारिक रूप परंपरा ने ही बताया है।',
            'This is a reading of the classical convention, with its weight — a statement about placement, never a verdict on the home. Where something cannot change, tradition itself states the practical form.'
          )}
        </Text>
        <View style={[styles.privacy, { borderLeftColor: colors.goldChipBg }]}>
          <Text style={{ fontFamily: bodyFont, fontSize: 11.5, lineHeight: 17, color: colors.inkMuted, fontStyle: 'italic' }}>
            {meaningByLang(
              lang,
              'यह मानचित्र केवल इस फ़ोन पर है — कहीं भेजा नहीं जाता।',
              'This map lives only on this phone — it is sent nowhere.'
            )}
          </Text>
        </View>

        <View style={{ flexDirection: 'row', gap: 8, marginTop: spacing.lg, flexWrap: 'wrap' }}>
          <Pressable
            testID="ghar-remeasure"
            accessibilityRole="button"
            accessibilityLabel="Measure again"
            onPress={() => navigation.navigate('GharVastuSetup', { homeId: home.id })}
            style={[styles.action, { borderColor: colors.cardActiveBorder, borderRadius: radii.pill }]}
          >
            <Text style={{ fontFamily: titleFont, fontSize: 12.5, color: colors.saffronDeep }}>
              {contentByLang(lang, 'पुनः मापें', 'Measure again')}
            </Text>
          </Pressable>
          <Pressable
            testID="ghar-delete"
            accessibilityRole="button"
            accessibilityLabel="Delete this home"
            onPress={confirmDelete}
            style={[styles.action, { borderColor: colors.divider, borderRadius: radii.pill }]}
          >
            <Text style={{ fontFamily: titleFont, fontSize: 12.5, color: colors.inkMuted }}>
              {contentByLang(lang, 'हटाएँ', 'Delete')}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function FindingRow({ finding, cls }: { finding: HomeFinding; cls: FindingClass }) {
  const { colors, typography } = useTheme();
  const { lang } = useGitaLanguage();
  const titleFont = scriptTitleFont(lang, typography.readerTitle.fontFamily);
  const bodyFont = scriptBodyFont(lang, typography.meaning.fontFamily);

  const dikList = (values: readonly string[]): string =>
    values
      .map((value) =>
        value === 'center'
          ? contentByLang(lang, 'ब्रह्मस्थान', 'Centre')
          : contentByLang(lang, DISHA_LABELS[value as keyof typeof DISHA_LABELS].hi, DISHA_LABELS[value as keyof typeof DISHA_LABELS].en)
      )
      .join(' / ');

  const title =
    finding.ordinal > 1
      ? `${contentByLang(lang, finding.titleHi, finding.titleEn)} ${finding.ordinal}`
      : contentByLang(lang, finding.titleHi, finding.titleEn);

  const viaGlyph = finding.via === 'compass' ? '⌖' : finding.via === 'manual' ? '✎' : finding.via ? '▦' : '';

  return (
    <View
      testID={`ghar-finding-${finding.roomId}-${finding.ordinal}`}
      style={[styles.findingRow, { borderBottomColor: colors.divider }]}
    >
      <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8 }}>
        <Text style={{ flex: 1, fontFamily: titleFont, fontSize: 14.5, lineHeight: 21, color: colors.ink }}>{title}</Text>
        <Text
          style={{
            fontFamily: titleFont,
            fontSize: 11.5,
            lineHeight: 21,
            color: cls === 'forbidden' ? colors.avoidDeep : colors.saffronDeep,
          }}
        >
          {contentByLang(lang, FINDING_CLASS_LABELS[cls].hi, FINDING_CLASS_LABELS[cls].en)}
        </Text>
      </View>
      <Text style={{ fontFamily: bodyFont, fontSize: 12, lineHeight: 18, color: colors.inkSoft, marginTop: 3 }}>
        {contentByLang(lang, 'परंपरा · ', 'Tradition · ')}
        {finding.directions.length > 0 ? dikList(finding.directions) : contentByLang(lang, 'केंद्र', 'Centre')}
        {finding.alternateDirections.length > 0
          ? ` (${contentByLang(lang, 'विकल्प', 'alternate')} ${dikList(finding.alternateDirections)})`
          : ''}
        <Text style={{ fontSize: 10, color: colors.inkMuted }}>
          {`  · ${contentByLang(lang, WEIGHT_LABELS[finding.weight].hi, WEIGHT_LABELS[finding.weight].en)}`}
        </Text>
      </Text>
      {finding.zone != null ? (
        <Text style={{ fontFamily: bodyFont, fontSize: 12, lineHeight: 18, color: colors.inkSoft, marginTop: 2 }}>
          {contentByLang(lang, 'आपके घर में · ', 'In your home · ')}
          {finding.zone === 'center'
            ? contentByLang(lang, 'ब्रह्मस्थान', 'Centre')
            : contentByLang(lang, DISHA_LABELS[finding.zone as keyof typeof DISHA_LABELS].hi, DISHA_LABELS[finding.zone as keyof typeof DISHA_LABELS].en)}
          <Text style={{ fontSize: 10.5, color: colors.inkMuted }}>{viaGlyph ? `  ${viaGlyph}` : ''}</Text>
        </Text>
      ) : null}
      {(cls === 'forbidden' || cls === 'differs') && finding.accommodationHi ? (
        <Text style={{ fontFamily: bodyFont, fontSize: 11.5, lineHeight: 17, color: colors.inkMuted, marginTop: 4 }}>
          <Text style={{ color: colors.saffronDeep }}>{contentByLang(lang, 'जहाँ संभव न हो · ', 'Where that is not possible · ')}</Text>
          {meaningByLang(lang, finding.accommodationHi, finding.accommodationEn ?? finding.accommodationHi)}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  strip: { flexDirection: 'row', flexWrap: 'wrap', gap: 5, marginTop: 10 },
  pill: { borderWidth: 1, paddingHorizontal: 8, paddingVertical: 3 },
  findingRow: { borderBottomWidth: 1, paddingVertical: 9 },
  privacy: { borderLeftWidth: 2, paddingLeft: 10, paddingVertical: 4, marginTop: 12 },
  action: { borderWidth: 1, paddingHorizontal: 14, paddingVertical: 8 },
});
