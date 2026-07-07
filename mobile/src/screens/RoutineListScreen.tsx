import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '@/theme/ThemeContext';
import { useGitaLanguage } from '@/data/gita/language';
import { contentByLang, pick } from '@/utils/localize';
import { pillTextStyle, scriptBodyFont, scriptTitleFont } from '@/utils/langType';
import { useRoutines } from '@/contexts/RoutineContext';
import { RoutineShell, RoutineButton } from '@/components/RoutineShell';
import type { HomeStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<HomeStackParamList, 'RoutineList'>;

export default function RoutineListScreen({ navigation }: Props) {
  const { colors, typography, spacing, radii, elevation } = useTheme();
  const { lang } = useGitaLanguage();
  const { routines } = useRoutines();

  return (
    <RoutineShell
      titleHi="मेरी साधनाएँ"
      titleEn="My Routines"
      onBack={() => navigation.goBack()}
    >
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: spacing.xxl, paddingTop: 8, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {routines.length === 0 && (
          <Text
            style={{
              fontFamily: typography.meaning.fontFamily,
              fontSize: 14,
              color: colors.inkMuted,
              textAlign: 'center',
              marginVertical: 40,
            }}
          >
            {pick(lang, { hi: 'अभी कोई साधना नहीं', en: 'No routines yet', gu: 'હજી કોઈ સાધના નથી', kn: 'ಇನ್ನೂ ಯಾವುದೇ ಸಾಧನೆ ಇಲ್ಲ' })}
          </Text>
        )}

        {routines.map((r) => (
          <Pressable
            key={r.id}
            onPress={() => navigation.navigate('RoutineDetail', { routineId: r.id })}
            accessibilityRole="button"
            style={({ pressed }) => [
              styles.card,
              {
                borderWidth: 1,
                borderColor: colors.cardActiveBorder,
                borderRadius: radii.lg,
                padding: spacing.lg,
                marginBottom: spacing.md,
              },
              elevation.card,
              pressed && { opacity: 0.85 },
            ]}
          >
            <LinearGradient
              colors={[colors.cardActiveFrom, colors.cardActiveTo]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.cardBg, { borderRadius: radii.lg }]}
            />
            <View style={styles.cardBody}>
              <View style={styles.cardTop}>
                <Text
                  style={{
                    fontFamily: scriptTitleFont(lang, typography.cardHindi.fontFamily),
                    fontSize: typography.cardHindi.fontSize,
                    color: colors.ink,
                    flexShrink: 1,
                  }}
                >
                  {contentByLang(lang, r.nameHi || r.nameEn, r.nameEn || r.nameHi)}
                </Text>
                <View style={{ backgroundColor: colors.saffronTint, borderRadius: radii.pill, paddingHorizontal: 8, paddingVertical: 3 }}>
                  <Text style={{ ...pillTextStyle(lang, typography.versePill), color: colors.saffronDeep }}>
                    {r.mode === 'weekday'
                      ? pick(lang, { hi: 'वार', en: 'WEEKDAY', gu: 'વાર', kn: 'ವಾರ' })
                      : pick(lang, { hi: 'दैनिक', en: 'DAILY', gu: 'દૈનિક', kn: 'ದೈನಿಕ' })}
                  </Text>
                </View>
              </View>
              <Text
                style={{
                  // §46 meta convention — Inter/cardMeta has no Indic glyphs.
                  fontFamily:
                    lang === 'en'
                      ? typography.cardMeta.fontFamily
                      : scriptBodyFont(lang, typography.meaning.fontFamily),
                  fontSize: typography.cardMeta.fontSize,
                  color: colors.inkMuted,
                  marginTop: 4,
                }}
              >
                {pick(lang, {
                  hi: `${r.items.length} वस्तुएँ`,
                  en: `${r.items.length} items`,
                  gu: `${r.items.length} વસ્તુઓ`,
                  kn: `${r.items.length} ವಸ್ತುಗಳು`,
                })}
              </Text>
            </View>
            <Text style={[styles.chev, { color: colors.saffron }]}>›</Text>
          </Pressable>
        ))}

        <RoutineButton
          label={pick(lang, { hi: 'नई साधना बनाएँ', en: 'New routine', gu: 'નવી સાધના બનાવો', kn: 'ಹೊಸ ಸಾಧನೆ ರಚಿಸಿ' })}
          variant="ghost"
          onPress={() => navigation.navigate('RoutineCreate')}
        />
        <RoutineButton
          label={pick(lang, {
            hi: 'तैयार संकल्प चुनें',
            en: 'Browse sankalps',
            gu: 'તૈયાર સંકલ્પ પસંદ કરો',
            kn: 'ಸಿದ್ಧ ಸಂಕಲ್ಪ ಆರಿಸಿ',
          })}
          variant="ghost"
          onPress={() => navigation.navigate('SadhanaPrograms')}
        />
      </ScrollView>
    </RoutineShell>
  );
}

const styles = StyleSheet.create({
  // Warm "active Library Card" language (design.md §8) — gradient fill under
  // the content, saffron-tinted border, standard card shadow.
  card: { position: 'relative', flexDirection: 'row', alignItems: 'center', gap: 8, overflow: 'hidden' },
  cardBg: { ...StyleSheet.absoluteFillObject },
  cardBody: { flex: 1, minWidth: 0 },
  cardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  chev: { fontSize: 26, marginLeft: 2 },
});
