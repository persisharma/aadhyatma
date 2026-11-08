import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useGitaLanguage } from '@/data/gita/language';
import { getPrathaForMasa, getPrathaForRule, hasPratha, hasPrathaForMasa, type PrathaEntry } from '@/data/pratha';
import type { PanchangData } from '@/panchang/types';
import { useTheme } from '@/theme/ThemeContext';
import { meaningToken, scriptTitleFont } from '@/utils/langType';
import { contentByLang } from '@/utils/localize';
import { ListingCardFrame, ListingSectionHeader } from '@/components/ListingCard';
import AppIcon from '@/components/AppIcon';
import { getPrathaForSanatanTopic } from '@/data/pratha';

export function PrathaQuestionCard({ entry, onPress, testID }: { entry: PrathaEntry; onPress: () => void; testID?: string }) {
  const { colors, typography } = useTheme();
  const { lang } = useGitaLanguage();
  const title = contentByLang(lang, entry.questionHi, entry.questionEn);
  return <ListingCardFrame testID={testID} onPress={onPress} accessibilityLabel={title}
    contentStyle={{ padding: 16, gap: 8 }}>
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
      <Text style={{ ...meaningToken(lang, typography), fontFamily: scriptTitleFont(lang, typography.readerTitle.fontFamily), color: colors.ink, flex: 1, minWidth: 0 }}>{title}</Text>
      <AppIcon name="next" size={18} color={colors.saffronDeep} />
    </View>
    <Text style={{ ...meaningToken(lang, typography), color: colors.inkSoft }}>{contentByLang(lang, entry.practiceHi, entry.practiceEn)}</Text>
  </ListingCardFrame>;
}

export function PrathaRelatedCard({ topicId, onOpen }: { topicId: string; onOpen: (id: string) => void }) {
  const { lang } = useGitaLanguage();
  const entries = getPrathaForSanatanTopic(topicId);
  return entries.length ? <View style={{ gap: 12 }}>
    <ListingSectionHeader>{contentByLang(lang, 'प्रथा के पीछे की कथा', 'The story behind the custom')}</ListingSectionHeader>
    {entries.map(entry => <PrathaQuestionCard key={entry.id} entry={entry} testID={`pratha-related-${entry.id}`} onPress={() => onOpen(entry.id)} />)}
  </View> : null;
}

function Questions({ title, entries, onOpen, footer }: { title: string; entries: readonly PrathaEntry[]; onOpen: (id: string) => void; footer?: React.ReactNode }) {
  const { colors, typography } = useTheme();
  const { lang } = useGitaLanguage();
  const meaning = meaningToken(lang, typography);
  return <ListingCardFrame style={styles.card}>
    <Text style={{ color: colors.ink, fontFamily: scriptTitleFont(lang, typography.readerTitle.fontFamily), fontSize: 20, marginBottom: 8 }}>{title}</Text>
    {entries.slice(0, 3).map((entry) => <Pressable key={entry.id} testID={`pratha-context-${entry.id}`}
      accessibilityRole="button" onPress={() => onOpen(entry.id)} style={[styles.question, { borderColor: colors.divider }]}>
      <Text style={{ ...meaning, color: colors.saffronDeep }}>{contentByLang(lang, entry.questionHi, entry.questionEn)} →</Text>
    </Pressable>)}
    {footer}
  </ListingCardFrame>;
}

export function PrathaObservanceCard({ ruleId, onOpen }: { ruleId: string; onOpen: (id: string) => void }) {
  const { lang } = useGitaLanguage();
  const entries = hasPratha() ? getPrathaForRule(ruleId) : [];
  return entries.length ? <View testID="pratha-observance-card"><Questions title={contentByLang(lang, 'यह क्यों?', 'Why this custom?')} entries={entries} onOpen={onOpen} /></View> : null;
}

export function PrathaMonthCard({ month, onOpen, onHub }: { month: PanchangData['lunarMonth']; onOpen: (id: string) => void; onHub: () => void }) {
  const { colors, typography } = useTheme();
  const { lang } = useGitaLanguage();
  if (!hasPrathaForMasa(month.index, month.isAdhik)) return null;
  return <View testID="pratha-month-card"><Questions
    title={contentByLang(lang, `इस मास की प्रथाएँ · ${month.isAdhik ? 'अधिक ' : ''}${month.nameHi}`, `Customs this month · ${month.isAdhik ? 'Adhik ' : ''}${month.nameEn}`)}
    entries={getPrathaForMasa(month.index, month.isAdhik)} onOpen={onOpen}
    footer={<Pressable testID="pratha-month-hub" accessibilityRole="button" onPress={onHub} style={styles.question}>
      <Text style={{ ...meaningToken(lang, typography), color: colors.saffronDeep }}>{contentByLang(lang, 'इस मास के सभी प्रश्न', 'All questions for this month')} →</Text>
    </Pressable>} /></View>;
}

const styles = StyleSheet.create({
  card: { padding: 18, marginVertical: 12, borderWidth: 1, borderRadius: 18 },
  question: { minHeight: 48, paddingVertical: 12, borderTopWidth: StyleSheet.hairlineWidth },
});
