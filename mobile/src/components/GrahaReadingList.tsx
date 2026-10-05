/**
 * The nine graha cards of the compiled report (RULEBOOK §14.7, design.md §78).
 *
 * The section's intro bullets, then one row per graha — name, house, and its
 * counted label — that opens into the full card. Every block of the card is a
 * short bullet list under its own heading: about this graha (meaning, sign,
 * karaka), friends and enemies, why it carries its label (+ helps, − asks for
 * care), what it gives, where to take care, the houses it rules for this
 * Lagna; then its upay (day, daan, seva, mantra, one paath). After the rows,
 * the empty houses — each read through its lord (§14.7.9). Every आधार chain
 * sits behind its own toggle so the reading stays plain; it is always one tap
 * away (§14.3.1).
 */
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import BasisChain from '@/components/BasisChain';
import type { Lang } from '@/data/gita/language';
import { library } from '@/data/texts';
import { MAITRI_LABELS } from '@/panchang/grahaReadingContent';
import type { Graha } from '@/panchang/kundali';
import type { KundaliEmptyHouses, KundaliGrahaCard, KundaliGrahaTone } from '@/panchang/kundaliReportModel';
import { useTheme } from '@/theme/ThemeContext';
import { fontFamilies } from '@/theme/typography';
import { contentByLang, meaningByLang } from '@/utils/localize';
import { pillTextStyle, scriptBodyFont, scriptTitleFont } from '@/utils/langType';

type Props = {
  cards: readonly KundaliGrahaCard[];
  /** The section's intro bullets, index-aligned across languages. */
  introHi: readonly string[];
  introEn: readonly string[];
  /** The houses no graha occupies, shown after the nine rows. */
  emptyHouses?: KundaliEmptyHouses;
  lang: Lang;
  onPractice: (sourceId: string) => void;
};

export default function GrahaReadingList({ cards, introHi, introEn, emptyHouses, lang, onPractice }: Props) {
  const { colors, typography, radii } = useTheme();
  const [open, setOpen] = useState<ReadonlySet<Graha>>(() => new Set());
  const [basisOpen, setBasisOpen] = useState<ReadonlySet<Graha>>(() => new Set());
  const [emptyBasisOpen, setEmptyBasisOpen] = useState(false);

  const toggle = (set: ReadonlySet<Graha>, graha: Graha): ReadonlySet<Graha> => {
    const next = new Set(set);
    if (next.has(graha)) next.delete(graha);
    else next.add(graha);
    return next;
  };

  return (
    <View testID="graha-reading-list" style={styles.list}>
      <Bullets lang={lang} hi={introHi} en={introEn} />
      <Text
        style={{
          color: colors.inkMuted,
          fontFamily: scriptBodyFont(lang, typography.meaning.fontFamily),
          fontSize: 11,
          lineHeight: 17,
        }}
      >
        {meaningByLang(lang, 'किसी ग्रह को छूकर उसका पूरा विवेचन खोलें।', 'Tap a graha to open its full reading.')}
      </Text>
      {cards.map((card) => {
        const expanded = open.has(card.graha);
        return (
          <View
            key={card.id}
            style={[styles.card, { borderColor: colors.divider, backgroundColor: colors.cardSurface, borderRadius: radii.md }]}
          >
            <Pressable
              testID={`graha-row-${card.graha}`}
              onPress={() => setOpen((current) => toggle(current, card.graha))}
              accessibilityRole="button"
              accessibilityLabel={`${card.nameEn} reading`}
              accessibilityState={{ expanded }}
              accessibilityValue={{ text: `${card.placeEn}. ${card.toneLabelEn}` }}
              style={({ pressed }) => [styles.row, pressed && { opacity: 0.7 }]}
            >
              <View style={styles.rowCopy}>
                <Text
                  style={{
                    color: colors.ink,
                    fontFamily: scriptTitleFont(lang, typography.readerTitle.fontFamily),
                    fontSize: 14,
                    lineHeight: 21,
                  }}
                >
                  {contentByLang(lang, card.nameHi, card.nameEn)}
                </Text>
                <Text
                  numberOfLines={expanded ? undefined : 2}
                  style={{
                    color: colors.inkSoft,
                    fontFamily: scriptBodyFont(lang, typography.meaning.fontFamily),
                    fontSize: 11.5,
                    lineHeight: 18,
                  }}
                >
                  {meaningByLang(lang, card.placeHi, card.placeEn)}
                </Text>
              </View>
              <TonePill tone={card.tone} label={contentByLang(lang, card.toneLabelHi, card.toneLabelEn)} lang={lang} />
              <Text style={[styles.chevron, { color: colors.saffron }]} accessibilityElementsHidden>
                {expanded ? '▴' : '▾'}
              </Text>
            </Pressable>

            {expanded && (
              <View testID={`graha-card-${card.graha}`} style={styles.body}>
                <Label lang={lang} hi="इस ग्रह के बारे में" en="About this graha" />
                <Bullets
                  lang={lang}
                  hi={[`${card.nameHi} — ${card.meaningHi}`, card.strengthHi, ...card.notesHi, card.karakaHi]}
                  en={[`${card.nameEn} — ${card.meaningEn}`, card.strengthEn, ...card.notesEn, card.karakaEn]}
                />
                {card.maitri && (
                  <>
                    <Label lang={lang} hi="मित्र और शत्रु" en="Friends and enemies" />
                    <Bullets
                      lang={lang}
                      hi={[
                        `${MAITRI_LABELS.friends.hi}: ${card.maitri.friendsHi}`,
                        `${MAITRI_LABELS.enemies.hi}: ${card.maitri.enemiesHi}`,
                        `${MAITRI_LABELS.neutral.hi}: ${card.maitri.neutralHi}`,
                      ]}
                      en={[
                        `${MAITRI_LABELS.friends.en}: ${card.maitri.friendsEn}`,
                        `${MAITRI_LABELS.enemies.en}: ${card.maitri.enemiesEn}`,
                        `${MAITRI_LABELS.neutral.en}: ${card.maitri.neutralEn}`,
                      ]}
                    />
                  </>
                )}
                <Label lang={lang} hi={`‘${card.toneLabelHi}’ क्यों`} en={`Why “${card.toneLabelEn}”`} />
                {card.reasons.length > 0 ? (
                  card.reasons.map((reason) => (
                    <Bullet
                      key={reason.id}
                      lang={lang}
                      glyph={reason.vote === 'supports' ? '+' : '−'}
                      vote={reason.vote}
                      hi={reason.textHi}
                      en={reason.textEn}
                    />
                  ))
                ) : (
                  <Bullets lang={lang} hi={[card.toneLineHi]} en={[card.toneLineEn]} />
                )}
                <Label lang={lang} hi="क्या देता है" en="What it gives" />
                <Bullets lang={lang} hi={card.givesHi} en={card.givesEn} />
                <Label lang={lang} hi="कहाँ सावधानी रखें" en="Where to take care" />
                <Bullets lang={lang} hi={card.careHi} en={card.careEn} />
                {card.rulesEn.length > 0 && (
                  <>
                    <Label lang={lang} hi="आपके लग्न के लिए इन भावों का स्वामी भी" en="For your Lagna it also rules" />
                    <Bullets lang={lang} hi={card.rulesHi} en={card.rulesEn} />
                  </>
                )}

                <View style={[styles.upay, { borderColor: colors.divider, backgroundColor: colors.goldTint, borderRadius: radii.md }]}>
                  <Label lang={lang} hi={`उपाय · ${card.upay.introHi}`} en={`Upay · ${card.upay.introEn}`} />
                  <UpayRow lang={lang} labelHi="वार" labelEn="Day" hi={card.upay.vaarHi} en={card.upay.vaarEn} />
                  <UpayRow lang={lang} labelHi="दान" labelEn="Daan" hi={card.upay.daanHi} en={card.upay.daanEn} />
                  <UpayRow lang={lang} labelHi="सेवा" labelEn="Seva" hi={card.upay.sevaHi} en={card.upay.sevaEn} />
                  <UpayRow
                    lang={lang}
                    labelHi="मंत्र"
                    labelEn="Mantra"
                    hi={`${card.upay.mantraHi} — ${card.upay.mantraCountHi}`}
                    en={`${card.upay.mantraEn} — ${card.upay.mantraCountEn}`}
                  />
                  <PracticeLink sourceId={card.upay.practiceSourceId} lang={lang} onPractice={onPractice} />
                </View>

                <Pressable
                  testID={`graha-basis-toggle-${card.graha}`}
                  onPress={() => setBasisOpen((current) => toggle(current, card.graha))}
                  accessibilityRole="button"
                  accessibilityLabel={`${basisOpen.has(card.graha) ? 'Hide' : 'Show'} the basis for ${card.nameEn}`}
                  accessibilityState={{ expanded: basisOpen.has(card.graha) }}
                  style={({ pressed }) => [styles.basisToggle, pressed && { opacity: 0.7 }]}
                >
                  <Text style={[styles.basisToggleText, { color: colors.saffronDeep }]}>
                    {basisOpen.has(card.graha)
                      ? contentByLang(lang, 'आधार छिपाएँ', 'Hide the basis')
                      : contentByLang(lang, 'आधार देखें — यह कैसे निकाला गया', 'See the basis — how this was worked out')}
                  </Text>
                </Pressable>
                {basisOpen.has(card.graha) && (
                  <BasisChain basis={card.basis} lang={lang} testID={`basis-graha-${card.graha}`} />
                )}
              </View>
            )}
          </View>
        );
      })}
      {emptyHouses && emptyHouses.houses.length > 0 && (
        <View
          testID="graha-empty-houses"
          style={[styles.emptyBlock, { borderColor: colors.divider, backgroundColor: colors.cardSurface, borderRadius: radii.md }]}
        >
          <Label lang={lang} hi={emptyHouses.titleHi} en={emptyHouses.titleEn} />
          <Bullets lang={lang} hi={emptyHouses.introHi} en={emptyHouses.introEn} />
          <Label lang={lang} hi="आपकी कुंडली में" en="In your chart" />
          <Bullets
            lang={lang}
            hi={emptyHouses.houses.map((entry) => entry.lineHi)}
            en={emptyHouses.houses.map((entry) => entry.lineEn)}
          />
          <Pressable
            testID="graha-empty-basis-toggle"
            onPress={() => setEmptyBasisOpen((current) => !current)}
            accessibilityRole="button"
            accessibilityLabel={`${emptyBasisOpen ? 'Hide' : 'Show'} the basis for the empty houses`}
            accessibilityState={{ expanded: emptyBasisOpen }}
            style={({ pressed }) => [styles.basisToggle, pressed && { opacity: 0.7 }]}
          >
            <Text style={[styles.basisToggleText, { color: colors.saffronDeep }]}>
              {emptyBasisOpen
                ? contentByLang(lang, 'आधार छिपाएँ', 'Hide the basis')
                : contentByLang(lang, 'आधार देखें — यह कैसे निकाला गया', 'See the basis — how this was worked out')}
            </Text>
          </Pressable>
          {emptyBasisOpen && (
            <BasisChain
              basis={emptyHouses.houses.flatMap((entry) => entry.basis)}
              lang={lang}
              testID="basis-empty-houses"
            />
          )}
        </View>
      )}
    </View>
  );
}

function TonePill({ tone, label, lang }: { tone: KundaliGrahaTone; label: string; lang: Lang }) {
  const { colors, typography, radii } = useTheme();
  const palette =
    tone === 'supportive'
      ? { backgroundColor: colors.goldChipBg, color: colors.saffronDeep }
      : tone === 'care'
        ? { backgroundColor: colors.avoidTint, color: colors.avoidDeep }
        : { backgroundColor: colors.saffronTint, color: colors.inkSoft };
  return (
    <View style={[styles.pill, { backgroundColor: palette.backgroundColor, borderRadius: radii.pill }]}>
      <Text
        maxFontSizeMultiplier={1.25}
        style={[pillTextStyle(lang, typography.sectionLabel), { color: palette.color, fontSize: lang === 'en' ? 10 : 12 }]}
      >
        {label}
      </Text>
    </View>
  );
}

function Label({ lang, hi, en }: { lang: Lang; hi: string; en: string }) {
  const { colors, typography } = useTheme();
  return (
    <Text
      style={[
        pillTextStyle(lang, typography.sectionLabel),
        styles.label,
        { color: colors.saffronDeep, fontSize: lang === 'en' ? 10 : 12 },
      ]}
    >
      {contentByLang(lang, hi, en)}
    </Text>
  );
}

function Bullets({ lang, hi, en }: { lang: Lang; hi: readonly string[]; en: readonly string[] }) {
  return (
    <>
      {en.map((textEn, index) => (
        <Bullet key={`${index}-${textEn}`} lang={lang} hi={hi[index]} en={textEn} />
      ))}
    </>
  );
}

/** One bullet; a reason's glyph is + (helps) or − (asks for care), read aloud as words. */
function Bullet({
  lang,
  hi,
  en,
  glyph = '•',
  vote,
}: {
  lang: Lang;
  hi: string;
  en: string;
  glyph?: string;
  vote?: 'supports' | 'cautions';
}) {
  const { colors, typography } = useTheme();
  const text = meaningByLang(lang, hi, en);
  const glyphColor = vote === 'cautions' ? colors.avoidDeep : vote === 'supports' ? colors.saffronDeep : colors.saffron;
  return (
    <View
      style={styles.bulletRow}
      accessible={vote !== undefined}
      accessibilityLabel={vote === undefined ? undefined : `${vote === 'supports' ? 'Helps' : 'Asks for care'}: ${en}`}
    >
      <Text style={[styles.bulletGlyph, { color: glyphColor }]} accessibilityElementsHidden importantForAccessibility="no">
        {glyph}
      </Text>
      <Text
        style={{
          flex: 1,
          color: colors.inkSoft,
          fontFamily: scriptBodyFont(lang, typography.meaning.fontFamily),
          fontSize: 12,
          lineHeight: 19,
        }}
      >
        {text}
      </Text>
    </View>
  );
}

function UpayRow({ lang, labelHi, labelEn, hi, en }: { lang: Lang; labelHi: string; labelEn: string; hi: string; en: string }) {
  const { colors, typography } = useTheme();
  return (
    <View style={styles.upayRow}>
      <Text
        maxFontSizeMultiplier={1.25}
        style={[
          pillTextStyle(lang, typography.sectionLabel),
          styles.upayLabel,
          { color: colors.inkMuted, fontSize: lang === 'en' ? 10 : 12 },
        ]}
      >
        {contentByLang(lang, labelHi, labelEn)}
      </Text>
      <Text
        style={{
          flex: 1,
          color: colors.ink,
          fontFamily: scriptBodyFont(lang, typography.meaning.fontFamily),
          fontSize: 12,
          lineHeight: 19,
        }}
      >
        {meaningByLang(lang, hi, en)}
      </Text>
    </View>
  );
}

function PracticeLink({ sourceId, lang, onPractice }: { sourceId: string; lang: Lang; onPractice: (sourceId: string) => void }) {
  const { colors, radii } = useTheme();
  const entry = library.find((candidate) => candidate.id === sourceId && candidate.status === 'active');
  if (!entry) return null;
  return (
    <Pressable
      onPress={() => onPractice(entry.id)}
      accessibilityRole="button"
      accessibilityLabel={`Open ${entry.nameEn} practice`}
      style={({ pressed }) => [
        styles.practiceLink,
        { borderColor: colors.divider, backgroundColor: colors.cardSurface, borderRadius: radii.pill },
        pressed && { opacity: 0.7 },
      ]}
    >
      <Text style={[styles.practiceLinkText, { color: colors.saffronDeep }]}>
        {contentByLang(lang, `${entry.nameHi} पढ़ें`, `Read ${entry.nameEn}`)} ›
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  list: { marginTop: 10, gap: 8 },
  card: {
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  row: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rowCopy: { flex: 1 },
  chevron: { fontSize: 14, width: 14, textAlign: 'center' },
  pill: { paddingHorizontal: 9, paddingVertical: 3 },
  body: { paddingBottom: 8 },
  label: { fontSize: 10, marginTop: 12, marginBottom: 2 },
  bulletRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 7, marginTop: 4 },
  bulletGlyph: { width: 10, fontSize: 13, lineHeight: 19, textAlign: 'center' },
  upay: {
    marginTop: 12,
    padding: 10,
    borderWidth: 1,
  },
  upayRow: { flexDirection: 'row', gap: 8, marginTop: 6 },
  // 64 pt fits MANTRA at the section-label tracking (2.4) without breaking the word.
  upayLabel: { width: 64, fontSize: 10, paddingTop: 2 },
  practiceLink: {
    minHeight: 38,
    marginTop: 10,
    paddingHorizontal: 13,
    borderWidth: 1,
    alignSelf: 'flex-start',
    alignItems: 'center',
    justifyContent: 'center',
  },
  practiceLinkText: {
    fontFamily: fontFamilies.interSemiBold,
    fontSize: 10,
  },
  emptyBlock: { borderWidth: 1, paddingHorizontal: 12, paddingTop: 2, paddingBottom: 4 },
  basisToggle: { minHeight: 36, justifyContent: 'center', marginTop: 6, alignSelf: 'flex-start' },
  basisToggleText: { fontFamily: fontFamilies.interSemiBold, fontSize: 10 },
});
