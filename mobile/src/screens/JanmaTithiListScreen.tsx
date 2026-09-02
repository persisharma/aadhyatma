import React from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation, type NavigationProp } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

import ReaderHeader from '@/components/ReaderHeader';
import ObservanceListRow from '@/components/ObservanceListRow';
import { personLabel } from '@/components/PersonChips';
import { useGitaLanguage, type Lang } from '@/data/gita/language';
import { usePitruSmaran } from '@/contexts/PitruSmaranContext';
import { tithiRuleLabel } from '@/panchang/pitruSmaran';
import { useSmaranListSolve } from '@/panchang/usePitruSmaranSolves';
import { useJanmaTithiList } from '@/panchang/useJanmaTithi';
import {
  entryCaption,
  entryDisplayName,
  relativeDayLabel,
  shortDateWithYear,
  startOfLocalDay,
} from '@/panchang/pitruSmaranDisplay';
import { useTheme } from '@/theme/ThemeContext';
import { fontFamilies } from '@/theme/typography';
import { contentByLang } from '@/utils/localize';
import { transliterateDevanagari } from '@/utils/transliterate';
import { scriptBodyFont, scriptTitleFont } from '@/utils/langType';
import { panchangTabTarget } from '@/navigation/entryRoutes';
import type { MoreStackParamList, TabParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<MoreStackParamList, 'JanmaTithiList'>;

/**
 * जन्म तिथि list (PRD-29 §3.2) — the living and the remembered on one tithi
 * engine, side by side. Living rows come from the Kundali birth-profile roster
 * (read-only here — RULEBOOK §14.5: the roster keeps its single owner); the
 * पितृ section is the shipped PRD-17 ledger as quiet rows into its own detail.
 * §33 ObservanceList row pattern throughout; no share affordances anywhere.
 */
export default function JanmaTithiListScreen({ navigation }: Props) {
  const { colors, typography, spacing, radii } = useTheme();
  const { lang } = useGitaLanguage();
  const rootNav = useNavigation<NavigationProp<TabParamList>>();
  const { entries } = usePitruSmaran();

  const today = startOfLocalDay(new Date());
  const todayMs = today.getTime();

  const living = useJanmaTithiList(todayMs);
  const smaranSolve = useSmaranListSolve(entries, todayMs);

  const bodyFont = scriptBodyFont(lang, typography.meaning.fontFamily);
  const titleFont = scriptTitleFont(lang, typography.readerTitle.fontFamily);
  const dateFont = lang === 'en' ? fontFamilies.latinSemiBold : bodyFont;

  const ruleCaption = (rule: Parameters<typeof tithiRuleLabel>[0] | null): string => {
    if (!rule) return contentByLang(lang, 'तिथि नहीं निकल सकी', 'Tithi could not be derived');
    const hi = tithiRuleLabel(rule, 'hi');
    return lang === 'en' ? tithiRuleLabel(rule, 'en') : lang === 'hi' ? hi : transliterateDevanagari(hi, lang);
  };

  const sectionHead = (labelHi: string, labelEn: string) => (
    <Text style={[styles.sectionHead, { color: colors.inkMuted, fontFamily: sectionFont(lang) }]}>
      {contentByLang(lang, labelHi, labelEn)}
    </Text>
  );

  const openKundali = () =>
    rootNav.navigate('PanchangTab', panchangTabTarget('Kundali', undefined));

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[colors.parchmentHighlight, colors.parchmentGradientEnd]}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <ReaderHeader
          variant="index"
          title={contentByLang(lang, 'जन्म तिथि', 'Janma Tithi')}
          onBack={() => navigation.goBack()}
        />
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingHorizontal: spacing.xxl }]}
          showsVerticalScrollIndicator={false}
        >
          {sectionHead('जीवित · जन्म तिथि', 'LIVING · JANMA TITHI')}

          {living === null ? (
            <View style={styles.loading}>
              <ActivityIndicator color={colors.saffron} />
            </View>
          ) : living.length === 0 ? (
            <View style={styles.empty}>
              <Text style={{ fontSize: 30, color: colors.gold }}>✦</Text>
              <Text style={{ fontFamily: titleFont, fontSize: 15, color: colors.ink, textAlign: 'center', marginTop: 10 }}>
                {contentByLang(lang, 'जन्म विवरण से तिथि निकलती है', 'The tithi comes from saved birth details')}
              </Text>
              <Text style={{ fontFamily: bodyFont, fontSize: 13, lineHeight: 21, color: colors.inkSoft, textAlign: 'center', marginTop: 6 }}>
                {contentByLang(
                  lang,
                  'कुंडली में सहेजे हर व्यक्ति की जन्म तिथि यहाँ स्वयं दिखेगी — हिन्दू जन्मदिन तिथि से आता है, अंग्रेज़ी तारीख़ से नहीं।',
                  'Every person saved in Kundali appears here automatically — a Hindu birthday follows the tithi, not the civil date.'
                )}
              </Text>
              <Pressable
                onPress={openKundali}
                accessibilityRole="button"
                accessibilityLabel="Add birth details in Kundali"
                style={({ pressed }) => [
                  styles.addBtn,
                  { borderColor: colors.gold, backgroundColor: colors.parchmentHighlight, borderRadius: radii.md },
                  pressed && { opacity: 0.8 },
                ]}
              >
                <Text style={{ fontFamily: titleFont, fontSize: 14, color: colors.saffronDeep }}>
                  {contentByLang(lang, '+ कुंडली में जन्म विवरण जोड़ें', '+ Add birth details in Kundali')}
                </Text>
              </Pressable>
            </View>
          ) : (
            living.map(({ person, rule, next }) => (
              <ObservanceListRow
                key={person.id}
                leading={(
                  <View style={[styles.lead, { borderColor: colors.goldTint, backgroundColor: colors.parchmentHighlight }]}>
                    <Text style={{ fontSize: 13, color: colors.inkMuted }}>✦</Text>
                  </View>
                )}
                title={(
                  <Text style={{ fontFamily: titleFont, fontSize: 15, color: colors.ink }} numberOfLines={1}>
                    {personLabel(person)}
                  </Text>
                )}
                caption={(
                  <Text style={{ fontFamily: bodyFont, fontSize: 13, color: colors.inkMuted, marginTop: 2 }} numberOfLines={1}>
                    {ruleCaption(rule)}
                  </Text>
                )}
                trailing={next ? (
                  <View style={styles.rowRight}>
                    <Text style={{ fontFamily: dateFont, fontSize: 13, color: colors.inkSoft }}>
                      {shortDateWithYear(next, lang)}
                    </Text>
                    <Text style={{ fontFamily: dateFont, fontSize: 13, color: colors.inkSoft, marginTop: 1 }}>
                      {relativeDayLabel(next, today, lang)}
                    </Text>
                  </View>
                ) : undefined}
                onPress={() => navigation.navigate('JanmaTithiDetail', { personId: person.id })}
                accessibilityLabel={[
                  `Janma tithi ${personLabel(person)}`,
                  ruleCaption(rule),
                  next ? `This year ${shortDateWithYear(next, 'en')}, ${relativeDayLabel(next, today, 'en')}` : null,
                ].filter(Boolean).join(', ')}
              />
            ))
          )}

          {entries.length > 0 && (
            <>
              {sectionHead('पितृ · स्मरण तिथि', 'ANCESTORS · SMARAN TITHI')}
              {entries.map((entry) => {
                const next = smaranSolve?.nextByEntryId.get(entry.id) ?? null;
                return (
                  <ObservanceListRow
                    key={entry.id}
                    leading={(
                      <View style={[styles.lead, { borderColor: colors.goldTint, backgroundColor: colors.parchmentHighlight }]}>
                        <Text style={{ fontSize: 14, color: colors.inkMuted }}>॥</Text>
                      </View>
                    )}
                    title={(
                      <Text style={{ fontFamily: titleFont, fontSize: 15, color: colors.ink }} numberOfLines={1}>
                        {entryDisplayName(entry, lang)}
                      </Text>
                    )}
                    caption={(
                      <Text style={{ fontFamily: bodyFont, fontSize: 13, color: colors.inkMuted, marginTop: 2 }} numberOfLines={1}>
                        {entryCaption(entry, lang)}
                      </Text>
                    )}
                    trailing={next ? (
                      <View style={styles.rowRight}>
                        <Text style={{ fontFamily: dateFont, fontSize: 13, color: colors.inkSoft }}>
                          {shortDateWithYear(next, lang)}
                        </Text>
                        <Text style={{ fontFamily: dateFont, fontSize: 13, color: colors.inkSoft, marginTop: 1 }}>
                          {relativeDayLabel(next, today, lang)}
                        </Text>
                      </View>
                    ) : undefined}
                    onPress={() => navigation.navigate('PitruSmaranDetail', { entryId: entry.id })}
                    accessibilityLabel={`Smaran ${entryDisplayName(entry, 'en')}, ${entryCaption(entry, lang)}`}
                  />
                );
              })}
            </>
          )}

          <Text style={{ fontFamily: fontFamilies.latinItalic, fontSize: 12, lineHeight: 19, color: colors.inkMuted, textAlign: 'center', marginTop: 14 }}>
            {contentByLang(
              lang,
              'एक ही तिथि-गणित, दोनों ओर — यह सूची केवल इसी फ़ोन पर रहती है',
              'One tithi engine, both directions — this list lives only on this phone'
            )}
          </Text>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function sectionFont(lang: Lang): string {
  return lang === 'en' ? fontFamilies.interSemiBold : fontFamilies.devanagariBold;
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  scroll: { paddingTop: 4, paddingBottom: 32 },
  sectionHead: { fontSize: 11, letterSpacing: 0.7, marginTop: 14, marginBottom: 8 },
  loading: { paddingVertical: 36, alignItems: 'center' },
  empty: { alignItems: 'center', paddingVertical: 20, paddingHorizontal: 12 },
  lead: { width: 34, height: 34, borderRadius: 17, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  rowRight: { alignItems: 'flex-end' },
  addBtn: { borderWidth: 1.5, minHeight: 48, alignItems: 'center', justifyContent: 'center', marginTop: 16, alignSelf: 'stretch' },
});
