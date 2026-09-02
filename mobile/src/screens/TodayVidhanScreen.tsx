/**
 * आज का विधान (PRD-25 Phase 2, design.md §67): the briefing of standing
 * questions — what is today, what today asks of me, the day's windows, my
 * sankalp — each rendered as the same AskAnswerCard the search box uses.
 *
 * Launch discipline (§13.7): the briefing module is a dynamic import and the
 * composition runs after interactions, so pushing this screen never blocks a
 * frame and nothing here touches the launch graph. Panchang solves come from
 * the shared day store, which the Home Today strip has usually warmed already.
 */
import React, { useEffect, useState } from 'react';
import { InteractionManager, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import ReaderHeader from '@/components/ReaderHeader';
import AskAnswerCard from '@/components/AskAnswerCard';
import { useTheme } from '@/theme/ThemeContext';
import { fontFamilies } from '@/theme/typography';
import { useGitaLanguage } from '@/data/gita/language';
import { contentByLang, pick } from '@/utils/localize';
import { eyebrowTextStyle, scriptBodyFont } from '@/utils/langType';
import { useAskContextBuilder } from '@/ask/useAsk';
import { navigateAskTarget } from '@/ask/actions';
import type { AskTarget } from '@/ask/types';
import type { BriefingSection } from '@/ask/briefing';
import type { HomeStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<HomeStackParamList, 'TodayVidhan'>;

export default function TodayVidhanScreen({ navigation }: Props) {
  const { colors, spacing, radii } = useTheme();
  const { lang } = useGitaLanguage();
  const buildContext = useAskContextBuilder();
  const [sections, setSections] = useState<BriefingSection[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    const task = InteractionManager.runAfterInteractions(() => {
      import('@/ask/briefing')
        .then((m) => {
          if (cancelled) return;
          setSections(m.composeBriefing(buildContext()));
        })
        .catch(() => {
          if (!cancelled) setSections([]);
        });
    });
    return () => {
      cancelled = true;
      task.cancel();
    };
  }, [buildContext]);

  const onAction = (target: AskTarget) => navigateAskTarget(navigation as never, target);
  const bodyFont = scriptBodyFont(lang, fontFamilies.devanagari);

  return (
    <View style={styles.root}>
      <LinearGradient colors={[colors.parchmentHighlight, colors.parchmentGradientEnd]} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <ReaderHeader
          variant="index"
          title={contentByLang(lang, 'आज का विधान', "Today's Vidhan")}
          onBack={() => navigation.goBack()}
        />
        <ScrollView contentContainerStyle={[styles.scroll, { paddingHorizontal: spacing.xxl, paddingBottom: spacing.xxl * 2 }]} showsVerticalScrollIndicator={false}>
          <Text style={[styles.lede, { color: colors.inkMuted, fontFamily: lang === 'en' ? fontFamilies.latinItalic : bodyFont }]}>
            {contentByLang(lang, 'आज के प्रश्न, आपकी ओर से पूछे गए — हर उत्तर अपनी गणना दिखाता है।', 'Today’s questions, asked on your behalf — every answer shows its working.')}
          </Text>

          {sections === null ? (
            <Text style={[styles.loading, { color: colors.inkMuted, fontFamily: bodyFont }]} accessibilityLabel="Composing today's vidhan">
              {pick(lang, { hi: 'गणना हो रही है…', en: 'Composing…', gu: 'ગણતરી થઈ રહી છે…', kn: 'ಲೆಕ್ಕಾಚಾರ ನಡೆಯುತ್ತಿದೆ…' })}
            </Text>
          ) : sections.length === 0 ? (
            <Text style={[styles.loading, { color: colors.inkMuted, fontFamily: bodyFont }]}>
              {pick(lang, { hi: 'आज के लिए कुछ नहीं मिला।', en: 'Nothing to show for today.', gu: 'આજ માટે કંઈ મળ્યું નહીં.', kn: 'ಇಂದಿಗೆ ಏನೂ ಸಿಗಲಿಲ್ಲ.' })}
            </Text>
          ) : (
            sections.map((s) => (
              <View key={s.key} style={{ marginTop: spacing.lg }}>
                <Text style={[eyebrowTextStyle(lang, 11, 1.1), { color: colors.inkMuted, marginBottom: spacing.sm }]}>
                  {contentByLang(lang, s.heading.hi, s.heading.en)}
                </Text>
                <AskAnswerCard answer={s.answer} lang={lang} onAction={onAction} compact />
              </View>
            ))
          )}

          <View
            style={[styles.askMore, { marginTop: spacing.xxl, borderColor: colors.divider, borderRadius: radii.lg, backgroundColor: colors.parchmentSoft }]}
            accessibilityRole="button"
            accessibilityLabel="Ask something else"
            onTouchEnd={() => navigation.navigate('Search')}
          >
            <Text style={{ fontSize: 16, color: colors.saffron }}>⌕</Text>
            <Text style={[styles.askMoreText, { color: colors.inkSoft, fontFamily: bodyFont }]}>
              {contentByLang(lang, 'कुछ और पूछें — भोग, विधि, दिशा, मुहूर्त…', 'Ask something else — bhog, vidhi, direction, muhurat…')}
            </Text>
            <Text style={{ color: colors.saffron, fontSize: 18 }}>›</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  scroll: { paddingTop: 4 },
  lede: { fontSize: 14, lineHeight: 21 },
  loading: { fontSize: 14, marginTop: 24, textAlign: 'center' },
  askMore: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, paddingVertical: 12, borderWidth: 1 },
  askMoreText: { flex: 1, fontSize: 13.5, lineHeight: 20 },
});
