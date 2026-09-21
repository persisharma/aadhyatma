import React, { useMemo } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useGitaLanguage, type Lang } from '@/data/gita/language';
// The sheet is the one surface that needs the whole registry, and it is opened
// by a tap — never on the launch path, so it may import it directly.
import {
  LENS_GROUP_LABELS,
  LENS_GROUP_ORDER,
  lensesInGroup,
  type LensDefinition,
} from '@/panchang/lensRegistry';
import { useLenses } from '@/panchang/useLenses';
import { getRulesForLens } from '@/panchang/vratCatalog';
import { useTheme } from '@/theme/ThemeContext';
import { cardFontByLang, scriptBodyFont } from '@/utils/langType';
import { contentByLang, meaningByLang } from '@/utils/localize';

/**
 * क्षेत्रीय पंचांग · Regional & tradition calendars (PRD-42 §4, design.md §72).
 *
 * The one place a lens is turned on or off. Everything about this sheet follows
 * from two promises the feature makes, both of which are stated ON the sheet
 * rather than buried in a help page:
 *
 *   1. **A calendar only ever ADDS days.** The subtitle says so in both languages,
 *      because the single question a user has when they see a list of regions and
 *      traditions is "will turning this on take away my festivals?". It will not.
 *   2. **Nothing here asks who you are.** The rows are calendars, not identities —
 *      which is why the two tradition lenses sit in a group with the regions
 *      rather than behind a "your community" question, and why the sheet never
 *      pre-selects anything the user's own city did not already imply.
 *
 * The rows are checkboxes, NOT radios: lenses compose (a Marwari family in
 * Bengaluru may want both राजस्थान and कर्नाटक), and a tap applies immediately —
 * there is no confirm step, because every change is instantly reversible and the
 * calendar behind the sheet visibly answers it.
 *
 * Two things the first version left out, both from the same Sept 2026 report
 * ("I turned जैन on and it still shows everything; what did I actually get?"):
 *
 *   3. **Every row names what it adds.** The additive contract is the right one,
 *      but it makes the answer invisible on the calendar — a lensed day sits among
 *      the universal ones unmarked. So the row's third line lists the observances
 *      this calendar adds in THIS build (`getRulesForLens`), or says honestly that
 *      it adds none yet. The व्रत-पर्व landing then lists the same rules, tappable,
 *      under "आपके पंचांग से".
 *   4. **सभी चुनें / सभी हटाएँ** at the head of the list. Twenty-two taps to see
 *      everything was the other half of the report. Each control hides when it
 *      would be a no-op, so the header never offers a dead button.
 */
export default function LensPickerSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { colors, typography, spacing } = useTheme();
  const { lang } = useGitaLanguage();
  const { lenses, activeCount, availableCount, allSelected, toggle, selectAll, clearAll } = useLenses();

  const groups = useMemo(
    () => LENS_GROUP_ORDER.map((group) => ({ group, items: lensesInGroup(group) })),
    []
  );

  const titleFont = cardFontByLang(lang);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable
        accessible={false}
        style={[styles.backdrop, { backgroundColor: colors.modalBackdrop }]}
        onPress={onClose}
      >
        <Pressable
          accessible={false}
          onPress={(e) => e.stopPropagation()}
          style={[styles.sheet, { backgroundColor: colors.parchmentHighlight }]}
        >
          <View style={[styles.grabber, { backgroundColor: colors.divider }]} />
          <View style={{ paddingHorizontal: spacing.xxl }}>
            <Text
              accessibilityRole="header"
              style={{ fontFamily: titleFont, fontSize: 18, color: colors.ink, textAlign: 'center' }}
            >
              {contentByLang(lang, 'क्षेत्रीय पंचांग', 'Regional calendars')}
            </Text>
            {/* Promise 1, stated where the decision is made. */}
            <Text
              style={{
                fontFamily: scriptBodyFont(lang, typography.meaning.fontFamily),
                fontSize: 12.5,
                lineHeight: 19,
                color: colors.inkSoft,
                textAlign: 'center',
                marginTop: 4,
              }}
            >
              {contentByLang(
                lang,
                'अपने क्षेत्र या परंपरा का पंचांग चुनें — तिथियाँ केवल जुड़ती हैं, कुछ हटता नहीं।',
                'Choose your region’s or tradition’s calendar — days are only ever added, never removed.'
              )}
            </Text>
            <Text
              style={{
                fontFamily: typography.subtitle.fontFamily,
                fontSize: 11,
                color: colors.inkMuted,
                textAlign: 'center',
                marginTop: 6,
                marginBottom: spacing.sm,
              }}
            >
              {activeCount === 0
                ? meaningByLang(lang, `कोई चयन नहीं · ${availableCount} उपलब्ध`, `None selected · ${availableCount} available`)
                : allSelected
                  ? meaningByLang(lang, `सभी ${availableCount} सक्रिय`, `All ${availableCount} on`)
                  : meaningByLang(
                      lang,
                      `${activeCount} सक्रिय · ${availableCount - activeCount} और उपलब्ध`,
                      `${activeCount} on · ${availableCount - activeCount} more available`
                    )}
            </Text>
            {/* Promise 4: bulk controls, each hidden when it would do nothing. */}
            <View style={styles.bulkRow}>
              {!allSelected && (
                <BulkButton
                  label={contentByLang(lang, 'सभी चुनें', 'Select all')}
                  accessibilityLabel={`Select all ${availableCount} calendars`}
                  testID="lens-select-all"
                  onPress={selectAll}
                />
              )}
              {activeCount > 0 && (
                <BulkButton
                  label={contentByLang(lang, 'सभी हटाएँ', 'Clear all')}
                  accessibilityLabel="Clear all calendars"
                  testID="lens-clear-all"
                  onPress={clearAll}
                />
              )}
            </View>
          </View>

          <ScrollView
            style={{ maxHeight: 460 }}
            contentContainerStyle={{ paddingHorizontal: spacing.xxl, paddingBottom: spacing.xl }}
            showsVerticalScrollIndicator={false}
          >
            {groups.map(({ group, items }) => (
              <View key={group}>
                <Text
                  style={{
                    fontFamily: typography.subtitle.fontFamily,
                    fontSize: 10,
                    letterSpacing: 1,
                    textTransform: 'uppercase',
                    color: colors.inkMuted,
                    marginTop: spacing.md,
                    marginBottom: 2,
                  }}
                >
                  {contentByLang(lang, LENS_GROUP_LABELS[group].hi, LENS_GROUP_LABELS[group].en)}
                </Text>
                {items.map((lens) => (
                  <LensRow
                    key={lens.id}
                    lens={lens}
                    selected={lenses.has(lens.id)}
                    onToggle={() => toggle(lens.id, !lenses.has(lens.id))}
                  />
                ))}
              </View>
            ))}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function BulkButton({
  label,
  accessibilityLabel,
  testID,
  onPress,
}: {
  label: string;
  accessibilityLabel: string;
  testID: string;
  onPress: () => void;
}) {
  const { colors, radii } = useTheme();
  const { lang } = useGitaLanguage();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      testID={testID}
      style={({ pressed }) => [
        styles.bulkButton,
        { borderColor: colors.saffron, borderRadius: radii.pill },
        pressed && { opacity: 0.6 },
      ]}
    >
      <Text style={{ fontFamily: cardFontByLang(lang), fontSize: 12.5, color: colors.saffronDeep }}>{label}</Text>
    </Pressable>
  );
}

/** The third line of a row: what this calendar adds in this build, or that it adds nothing yet. */
function additionsLine(lens: LensDefinition, lang: Lang): { text: string; en: string; empty: boolean } {
  const rules = getRulesForLens(lens.id);
  if (rules.length === 0) {
    return {
      text: contentByLang(lang, 'अभी कोई विशेष तिथि नहीं — आगामी अद्यतन में', 'No dates of its own yet — coming in a later update'),
      en: 'Adds no dates yet',
      empty: true,
    };
  }
  const names = rules.map((rule) => contentByLang(lang, rule.nameHi, rule.nameEn)).join(' · ');
  const namesEn = rules.map((rule) => rule.nameEn).join(', ');
  return {
    text: contentByLang(lang, `जोड़ता है: ${names}`, `Adds: ${names}`),
    en: `Adds ${rules.length}: ${namesEn}`,
    empty: false,
  };
}

function LensRow({
  lens,
  selected,
  onToggle,
}: {
  lens: LensDefinition;
  selected: boolean;
  onToggle: () => void;
}) {
  const { colors, typography, radii } = useTheme();
  const { lang } = useGitaLanguage();
  const additions = useMemo(() => additionsLine(lens, lang), [lens, lang]);

  return (
    <Pressable
      onPress={onToggle}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected }}
      // English label even in Hindi UI, matching every other a11y label in the app,
      // and naming the observances so a screen-reader user can tell two regional
      // calendars apart without hearing only a place name. The additions clause
      // is the same answer the sighted user reads on the third line.
      accessibilityLabel={`${lens.nameEn} calendar. ${lens.exampleEn}. ${additions.en}`}
      style={({ pressed }) => [
        styles.row,
        { borderBottomColor: colors.divider },
        pressed && { opacity: 0.7 },
      ]}
    >
      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: cardFontByLang(lang), fontSize: 15, color: colors.ink }}>
          {contentByLang(lang, lens.nameHi, lens.nameEn)}
        </Text>
        <Text
          numberOfLines={1}
          style={{
            fontFamily: scriptBodyFont(lang, typography.meaning.fontFamily),
            fontSize: 11,
            color: colors.inkMuted,
            marginTop: 2,
          }}
        >
          {contentByLang(lang, lens.exampleHi, lens.exampleEn)}
        </Text>
        {/* Promise 3: what THIS build adds. Saffron-deep when it adds something
            (the same register as the ledger's live state), muted when it does
            not — the honest empty reads as information, not as a fault. */}
        <Text
          numberOfLines={2}
          style={{
            fontFamily: scriptBodyFont(lang, typography.meaning.fontFamily),
            fontSize: 11,
            color: additions.empty ? colors.inkMuted : colors.saffronDeep,
            marginTop: 2,
          }}
        >
          {additions.text}
        </Text>
      </View>
      <View
        style={[
          styles.check,
          {
            borderColor: selected ? colors.saffron : colors.divider,
            backgroundColor: selected ? colors.saffron : 'transparent',
            borderRadius: radii.pill,
          },
        ]}
      >
        {selected && <Text style={{ color: colors.onPrimary, fontSize: 12 }}>✓</Text>}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: 'flex-end' },
  sheet: { borderTopLeftRadius: 22, borderTopRightRadius: 22, paddingTop: 10, paddingBottom: 28 },
  grabber: { width: 40, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: 12 },
  // 44 pt floor: these are controls, and the row is the whole tap target.
  row: { flexDirection: 'row', alignItems: 'center', minHeight: 52, paddingVertical: 9, gap: 12, borderBottomWidth: 1 },
  check: { width: 22, height: 22, borderWidth: 1.6, alignItems: 'center', justifyContent: 'center' },
  bulkRow: { flexDirection: 'row', justifyContent: 'center', gap: 10, marginBottom: 4 },
  // Pill outlines, 36 pt tall with hitSlop-free padding: they sit in a header,
  // not a list, and two side by side must not crowd the sheet's centred copy.
  bulkButton: { minHeight: 36, paddingHorizontal: 14, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
});
