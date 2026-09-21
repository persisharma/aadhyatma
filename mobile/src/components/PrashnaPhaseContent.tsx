import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Lang } from '@/data/gita/language';
import type { PrashnaPhase } from '@/panchang/prashnaPhase';
import { formatIstDateEn, formatIstDateHi } from '@/panchang/reportFormat';
import { useTheme } from '@/theme/ThemeContext';
import { fontFamilies } from '@/theme/typography';
import { contentByLang } from '@/utils/localize';
import { pillTextStyle, scriptBodyFont, scriptTitleFont } from '@/utils/langType';
import BasisChain from './BasisChain';

export default function PrashnaPhaseContent({ phase, lang, children }: { phase: PrashnaPhase; lang: Lang; children?: React.ReactNode }) {
  const { colors, typography, radii } = useTheme();
  const [expanded, setExpanded] = useState(false);
  const t = (p: { hi: string; en: string }) => contentByLang(lang, p.hi, p.en);
  const body = { fontFamily: scriptBodyFont(lang, lang === 'en' ? fontFamilies.latin : typography.meaning.fontFamily), fontSize: lang === 'en' ? 18 : 15, lineHeight: 25, color: colors.inkSoft };
  const heading = { fontFamily: scriptTitleFont(lang, lang === 'en' ? fontFamilies.latinSemiBold : typography.readerTitle.fontFamily), fontSize: lang === 'en' ? 22 : 18, lineHeight: 29, color: colors.ink };
  const label = (hi: string, en: string) => <Text style={[pillTextStyle(lang, typography.sectionLabel), { fontSize: lang === 'en' ? 10 : 12, lineHeight: 20, color: colors.saffronDeep }]}>{contentByLang(lang, hi, en)}</Text>;
  const card = [styles.card, { borderRadius: radii.lg, borderColor: colors.divider, backgroundColor: colors.parchmentSoft }];
  const date = (iso: string) => contentByLang(lang, formatIstDateHi(new Date(iso)), formatIstDateEn(new Date(iso)));
  // Same-lord maha/antar has one explanation; both named periods remain in the hero.
  const visible = phase.signals.filter(s => s.layer !== 'gochar' || s.houses.length).filter((s, i, all) => !all.slice(0, i).some(other => other.layer === s.layer && other.graha === s.graha && other.meaning.en === s.meaning.en));
  return <>
    <View testID="prashna-phase" style={[card, { borderColor: colors.cardActiveBorder, backgroundColor: colors.cardActiveFrom }]}>
      {label('अभी का समय', 'Your current phase')}
      <Text testID="prashna-saar" style={heading}>{t(phase.title)}</Text>
      <Text style={body}>{t(phase.summary)}</Text>
      {phase.currentPeriod && <View style={[styles.period, { borderTopColor: colors.divider }]}>
        <Text style={[body, { color: colors.saffronDeep }]}>{t(phase.currentPeriod.label)}</Text>
        <Text style={[body, { fontSize: lang === 'en' ? 16 : 14 }]}>{date(phase.currentPeriod.start)} → {date(phase.currentPeriod.end)}</Text>
        <Text style={[body, { fontSize: lang === 'en' ? 15 : 13, color: colors.inkMuted }]}>{contentByLang(lang, 'वर्तमान अन्तर्दशा की अवधि', 'Dates of the current Antardasha')}</Text>
      </View>}
    </View>
    <View style={card}>
      {label('ऐसा क्यों', 'Why this reading')}
      {visible.map(signal => <View key={signal.id} testID={`phase-signal-${signal.id}`} style={styles.reason}>
        <Text style={[heading, { fontSize: lang === 'en' ? 19 : 16, lineHeight: 26 }]}>{t(signal.title)}</Text>
        <Text style={body}>{t(signal.meaning)}</Text>
      </View>)}
    </View>
    <View testID="phase-direction" style={card}>
      {label('इस समय दिशा', 'Guidance for this phase')}
      <Text style={body}>{t(phase.directions[0].text)}</Text>
      <Text style={[body, { color: colors.inkMuted }]}>{t(phase.directions[1].text)}</Text>
      {children}
    </View>
    <View testID="phase-next" style={card}>
      {label('अगली दशा का बदलाव', 'Next period change')}
      {phase.next ? <>
        <Text style={[body, { color: colors.saffronDeep }]}>{t(phase.next.date)}</Text>
        <Text style={heading}>{t(phase.next.title)}</Text>
        <Text style={body}>{t(phase.next.text)}</Text>
      </> : <Text style={body}>{contentByLang(lang, 'गणना की सीमा में अगली अवधि उपलब्ध नहीं है।', 'The next period is outside the calculated range.')}</Text>}
    </View>
    <Pressable testID="prashna-basis-toggle" accessibilityRole="button" accessibilityState={{ expanded }}
      accessibilityLabel={contentByLang(lang, expanded ? 'ज्योतिषीय आधार छिपाएँ' : 'ज्योतिषीय आधार देखें', expanded ? 'Hide Jyotish basis' : 'See Jyotish basis')}
      onPress={() => setExpanded(v => !v)} style={[styles.toggle, { borderColor: colors.divider, borderRadius: radii.md }]}>
      <Text style={[body, { color: colors.saffronDeep }]}>{contentByLang(lang, expanded ? 'ज्योतिषीय आधार छिपाएँ' : 'ज्योतिषीय आधार देखें', expanded ? 'Hide Jyotish basis' : 'See Jyotish basis')}</Text>
    </Pressable>
    {expanded && <View style={card}>
      {label('गणना और आधार', 'Calculation and basis')}
      <Text style={body}>{contentByLang(lang, 'जन्मकुंडली, महादशा–अन्तर्दशा और गुरु–शनि का गोचर व दृष्टि साथ पढ़े गए हैं। गोचर आज सुबह 6 बजे IST का है।', 'This combines the natal chart, Mahadasha–Antardasha, and Jupiter–Saturn transits and aspects. Transits use today’s 06:00 IST positions.')}</Text>
      {phase.signals.map((signal, index) => <View key={signal.id} style={styles.reason}>
        <Text style={body}>{t(signal.text)}</Text>
        <BasisChain basis={signal.basis} lang={lang} labelHi={signal.title.hi} labelEn={signal.title.en} testID={`prashna-chain-${index}`} />
      </View>)}
    </View>}
    <Text style={[body, { color: colors.inkMuted, fontSize: lang === 'en' ? 16 : 13, paddingHorizontal: 4 }]}>{t(phase.limitation)}</Text>
  </>;
}
const styles = StyleSheet.create({
  card: { padding: 18, borderWidth: 1, gap: 10, marginBottom: 12 },
  period: { borderTopWidth: 1, paddingTop: 10, gap: 3 },
  reason: { gap: 5, marginTop: 6 },
  toggle: { minHeight: 48, padding: 14, borderWidth: 1, marginBottom: 12 },
});
