import React from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '@/theme/ThemeContext';
import { useGitaLanguage } from '@/data/gita/language';
import { contentByLang } from '@/utils/localize';
import { scriptTitleFont } from '@/utils/langType';
import ReaderHeader from '@/components/ReaderHeader';
import ListCard, { CardThumb } from '@/components/ListCard';
import { useAbujhDays } from '@/panchang/useMuhuratFinder';
import { formatShortDate } from '@/panchang/muhuratFormat';
import { VARA_NAMES_HI, VARA_NAMES_EN } from '@/panchang/names';
import { transliterateDevanagari } from '@/utils/transliterate';
import type { PanchangStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<PanchangStackParamList, 'AbujhDays'>;

const MONTHS_EN = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const MONTHS_HI = ['जनवरी','फ़रवरी','मार्च','अप्रैल','मई','जून','जुलाई','अगस्त','सितंबर','अक्तूबर','नवंबर','दिसंबर'];

/**
 * विशेष शुभ दिन — the abujh calendar (PRD-16 Phase 1, design.md §60). Days
 * auspicious in their entirety: festival-anchored ones resolved by the shipped
 * festival engine, plus computed Guru/Ravi Pushya yoga days. Uses the shared
 * `ListCard`, so each day reads like the finder's result cards and every other
 * list in the app.
 */
export default function AbujhDaysScreen({ navigation }: Props) {
  const { colors, typography, spacing } = useTheme();
  const { lang } = useGitaLanguage();
  const { loading, days } = useAbujhDays();
  const titleFont = scriptTitleFont(lang, typography.cardHindi.fontFamily);

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]} edges={['top']}>
      <ReaderHeader
        title={contentByLang(lang, 'विशेष शुभ दिन', 'Special auspicious days')}
        variant="index"
        onBack={() => navigation.goBack()}
      />

      {loading ? (
        <View style={styles.loading} testID="abujh-loading">
          <ActivityIndicator color={colors.saffron} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ paddingHorizontal: spacing.readingGutter, paddingBottom: spacing.xxl }}>
          <Text
            style={{
              fontFamily: typography.cardLatin.fontFamily,
              fontSize: 13,
              color: colors.inkSoft,
              lineHeight: 21,
              marginBottom: spacing.md,
            }}
          >
            {contentByLang(
              lang,
              'ये दिन सम्पूर्ण रूप से शुभ माने जाते हैं — कोई शुद्धि आवश्यक नहीं। कोई भी समय उपयुक्त है।',
              'These days are auspicious in their entirety — no panchang shuddhi is required. Any hour works.'
            )}
          </Text>

          {days.map((d) => {
            const date = new Date(d.dateMs);
            const weekday =
              lang === 'en'
                ? VARA_NAMES_EN[date.getDay()]
                : lang === 'hi'
                  ? VARA_NAMES_HI[date.getDay()]
                  : transliterateDevanagari(VARA_NAMES_HI[date.getDay()], lang);
            return (
              <ListCard
                key={`${d.dateMs}-${d.nameEn}`}
                testID={`abujh-day-${date.getMonth() + 1}-${date.getDate()}`}
                accessibilityLabel={`${contentByLang(lang, d.nameHi, d.nameEn)} ${formatShortDate(date, lang)}`}
                onPress={() => navigation.navigate('MuhuratDetail', { dateMs: d.dateMs })}
                leading={
                  <CardThumb>
                    <Text style={{ fontFamily: typography.cardHindi.fontFamily, fontSize: 22, color: colors.parchmentSoft }}>
                      {date.getDate()}
                    </Text>
                  </CardThumb>
                }
              >
                <Text style={{ fontFamily: titleFont, fontSize: 16, color: colors.ink, lineHeight: 24 }}>
                  {contentByLang(lang, MONTHS_HI[date.getMonth()], MONTHS_EN[date.getMonth()])} · {weekday}
                </Text>
                <Text style={{ fontFamily: titleFont, fontSize: 14, color: colors.saffronDeep, lineHeight: 22, marginTop: 1 }}>
                  {contentByLang(lang, d.nameHi, d.nameEn)}
                </Text>
                <Text style={{ fontFamily: typography.cardLatin.fontFamily, fontSize: 12, color: colors.inkMuted, lineHeight: 18 }}>
                  {contentByLang(lang, d.nakshatraHi, d.nakshatraEn)}
                </Text>
              </ListCard>
            );
          })}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
