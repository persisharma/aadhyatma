import React from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useGitaLanguage } from '@/data/gita/language';
import { OBSERVANCE_LENSES, type LensGroup } from '@/panchang/lenses';
import { useObservanceLenses } from '@/panchang/usePanchang';
import { useTheme } from '@/theme/ThemeContext';
import { contentByLang } from '@/utils/localize';
import { scriptBodyFont, scriptTitleFont } from '@/utils/langType';

/**
 * `group` scopes the sheet to one section. The क्षेत्र ledger row opens it with
 * `group="state"`, the सम्प्रदाय row with `group="tradition"`. Left undefined it
 * renders both sections (the pre-split behaviour, kept for safety).
 */
export default function LensPickerSheet({ visible, onClose, group }: {
  visible: boolean;
  onClose: () => void;
  group?: LensGroup;
}) {
  const { colors, typography, spacing, radii } = useTheme();
  const { lang } = useGitaLanguage();
  const [active, setActive] = useObservanceLenses();

  const toggle = (id: (typeof OBSERVANCE_LENSES)[number]['id']) => {
    setActive(active.includes(id) ? active.filter((lens) => lens !== id) : [...active, id]);
  };

  const groups: readonly LensGroup[] = group ? [group] : (['state', 'tradition'] as const);
  const headerTitle = group === 'tradition'
    ? contentByLang(lang, 'सम्प्रदाय कैलेंडर', 'Tradition calendars')
    : group === 'state'
      ? contentByLang(lang, 'क्षेत्रीय कैलेंडर', 'Regional calendars')
      : contentByLang(lang, 'क्षेत्रीय कैलेंडर', 'Regional calendars');
  const headerSubtitle = group === 'tradition'
    ? contentByLang(lang, 'अपने सम्प्रदाय की परम्पराएँ चुनें', 'Choose the traditions your family follows')
    : group === 'state'
      ? contentByLang(lang, 'अपने क्षेत्र के पर्व चुनें', 'Choose your region’s festivals')
      : contentByLang(lang, 'अपने परिवार की परम्पराएँ चुनें', 'Choose the traditions your family follows');

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={[styles.root, { backgroundColor: colors.parchment }]}>
        <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
          <View style={[styles.header, { borderBottomColor: colors.divider, paddingHorizontal: spacing.xxl }]}>
            <View style={{ flex: 1, paddingRight: 12 }}>
              <Text style={{ color: colors.ink, fontFamily: scriptTitleFont(lang, typography.readerTitle.fontFamily), fontSize: 21 }}>
                {headerTitle}
              </Text>
              <Text style={{ color: colors.inkMuted, fontFamily: scriptBodyFont(lang, typography.meaning.fontFamily), fontSize: 13, marginTop: 3 }}>
                {headerSubtitle}
              </Text>
            </View>
            <Pressable
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel={contentByLang(lang, 'बंद करें', 'Close')}
              hitSlop={12}
              style={({ pressed }) => [styles.close, pressed && { opacity: 0.65 }]}
            >
              <Text style={{ color: colors.saffron, fontSize: 20 }}>✕</Text>
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={{ paddingHorizontal: spacing.xxl, paddingBottom: spacing.xxl }}>
            {groups.map((section) => (
              <View key={section}>
                <Text style={[styles.group, { color: colors.saffronDeep, fontFamily: scriptTitleFont(lang, typography.readerTitle.fontFamily) }]}>
                  {section === 'state'
                    ? contentByLang(lang, 'राज्य · क्षेत्र', 'By state · region')
                    : contentByLang(lang, 'सम्प्रदाय', 'By tradition')}
                </Text>
                {OBSERVANCE_LENSES.filter((lens) => lens.group === section).map((lens) => {
                  const checked = active.includes(lens.id);
                  const name = contentByLang(lang, lens.nameHi, lens.nameEn);
                  return (
                    <Pressable
                      key={lens.id}
                      testID={`lens-row-${lens.id}`}
                      onPress={() => toggle(lens.id)}
                      accessibilityRole="checkbox"
                      accessibilityState={{ checked }}
                      accessibilityLabel={`${name}. ${checked
                        ? contentByLang(lang, 'चुना हुआ', 'Selected')
                        : contentByLang(lang, 'नहीं चुना', 'Not selected')}`}
                      style={({ pressed }) => [
                        styles.row,
                        { borderBottomColor: colors.divider },
                        pressed && { opacity: 0.65 },
                      ]}
                    >
                      <View style={{ flex: 1, paddingRight: 12 }}>
                        <Text style={{ color: colors.ink, fontFamily: scriptTitleFont(lang, typography.readerTitle.fontFamily), fontSize: 16 }}>
                          {name}
                        </Text>
                        <Text style={{ color: colors.inkMuted, fontFamily: scriptBodyFont(lang, typography.meaning.fontFamily), fontSize: 12, lineHeight: 18, marginTop: 2 }}>
                          {contentByLang(lang, lens.examplesHi, lens.examplesEn)}
                        </Text>
                      </View>
                      <View style={[
                        styles.check,
                        { borderColor: checked ? colors.saffron : colors.divider, backgroundColor: checked ? colors.saffron : colors.parchmentSoft, borderRadius: radii.sm },
                      ]}>
                        {checked && <Text style={styles.checkGlyph}>✓</Text>}
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            ))}
          </ScrollView>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  header: { minHeight: 76, borderBottomWidth: StyleSheet.hairlineWidth, flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  close: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  group: { fontSize: 14, marginTop: 22, marginBottom: 4 },
  row: { minHeight: 64, borderBottomWidth: StyleSheet.hairlineWidth, flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  check: { width: 28, height: 28, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  checkGlyph: { color: '#FFFFFF', fontSize: 17, fontWeight: '700' },
});
