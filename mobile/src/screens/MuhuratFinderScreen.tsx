import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '@/theme/ThemeContext';
import { useGitaLanguage } from '@/data/gita/language';
import { contentByLang, pick } from '@/utils/localize';
import { scriptTitleFont, scriptBodyFont } from '@/utils/langType';
import ReaderHeader from '@/components/ReaderHeader';
import { EVENT_RULES } from '@/panchang/eventMuhurat';
import type { PanchangStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<PanchangStackParamList, 'MuhuratFinder'>;

/**
 * शुभ मुहूर्त खोज — the occasion picker (PRD-16 Phase 1, design.md §60).
 * One decision: the occasion. The window defaults to ~3 months
 * (FINDER_WINDOW_DAYS); a range chooser is deliberately NOT on this screen
 * (v2 design review: "occasion is the one real decision").
 */
export default function MuhuratFinderScreen({ navigation }: Props) {
  const { colors, typography, spacing, radii, elevation } = useTheme();
  const { lang } = useGitaLanguage();
  const titleFont = scriptTitleFont(lang, typography.cardHindi.fontFamily);
  const bodyFont = scriptBodyFont(lang, typography.meaning.fontFamily);

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]} edges={['top']}>
      <ReaderHeader
        title={contentByLang(lang, 'शुभ मुहूर्त खोज', 'Find a Muhurat')}
        variant="index"
        onBack={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={{ paddingHorizontal: spacing.readingGutter, paddingBottom: spacing.xxl }}>
        <Text
          style={{
            fontFamily: typography.cardLatin.fontFamily,
            fontSize: 13,
            color: colors.inkMuted,
            textAlign: 'center',
            lineHeight: 20,
            marginBottom: spacing.lg,
          }}
        >
          {contentByLang(lang, 'आप क्या करने जा रहे हैं?', 'What are you planning?')}
        </Text>
        <View
          style={[
            styles.list,
            { borderColor: colors.border, backgroundColor: colors.cardSurface, borderRadius: radii.md },
            elevation.subtle,
          ]}
        >
          {EVENT_RULES.map((rule, i) => (
            <Pressable
              key={rule.id}
              testID={`muhurat-occasion-${rule.id}`}
              accessibilityRole="button"
              accessibilityLabel={contentByLang(lang, rule.nameHi, rule.nameEn)}
              onPress={() => navigation.navigate('MuhuratResults', { occasionId: rule.id })}
              style={[styles.row, i < EVENT_RULES.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border }]}
            >
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: titleFont, fontSize: 16, color: colors.ink, lineHeight: 25 }}>
                  {contentByLang(lang, rule.nameHi, rule.nameEn)}
                </Text>
                <Text style={{ fontFamily: lang === 'en' ? bodyFont : typography.cardLatin.fontFamily, fontSize: 12, color: colors.inkMuted, lineHeight: 18 }}>
                  {lang === 'en' ? rule.nameHi : rule.nameEn}
                </Text>
              </View>
              <Text style={{ color: colors.saffron, fontSize: 16 }}>›</Text>
            </Pressable>
          ))}
        </View>

        <Pressable
          testID="muhurat-abujh-door"
          accessibilityRole="button"
          accessibilityLabel={pick(lang, {
            hi: 'विशेष शुभ दिन',
            en: 'Special auspicious days',
            gu: 'વિશેષ શુભ દિન',
            kn: 'ವಿಶೇಷ ಶುಭ ದಿನ',
          })}
          onPress={() => navigation.navigate('AbujhDays')}
          style={[
            styles.abujh,
            { borderColor: colors.border, backgroundColor: colors.cardSurface, borderRadius: radii.md, marginTop: spacing.lg },
            elevation.subtle,
          ]}
        >
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: titleFont, fontSize: 16, color: colors.ink, lineHeight: 25 }}>
              {contentByLang(lang, 'विशेष शुभ दिन', 'Special auspicious days')}
            </Text>
            <Text style={{ fontFamily: typography.cardLatin.fontFamily, fontSize: 12, color: colors.inkMuted, lineHeight: 18 }}>
              {contentByLang(lang, 'अबूझ मुहूर्त — कोई गणना आवश्यक नहीं', 'Abujh days — no muhurat needed')}
            </Text>
          </View>
          <Text style={{ color: colors.saffron, fontSize: 16 }}>›</Text>
        </Pressable>

        <Text
          style={{
            fontFamily: typography.cardLatin.fontFamily,
            fontSize: 12,
            color: colors.inkMuted,
            textAlign: 'center',
            marginTop: spacing.lg,
            lineHeight: 19,
          }}
        >
          {contentByLang(lang, 'अगले 3 महीनों में खोजा जाएगा', 'Searching the next 3 months')}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  list: { borderWidth: 1, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 12, minHeight: 58 },
  abujh: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 12, minHeight: 60, borderWidth: 1 },
});
