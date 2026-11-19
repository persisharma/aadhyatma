import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, AppState, Pressable, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { HomeStackParamList } from '@/navigation/types';
import { navigateToEntryStart } from '@/navigation/entryRoutes';
import ReaderHeader from '@/components/ReaderHeader';
import LibraryCard from '@/components/LibraryCard';
import AppIcon from '@/components/AppIcon';
import { useNewContent } from '@/contexts/NewContentContext';
import LanguageToggle from '@/components/LanguageToggle';
import DockedYouTubePlayer from '@/components/video/DockedYouTubePlayer';
import { useTheme } from '@/theme/ThemeContext';
import { useGitaLanguage } from '@/data/gita/language';
import { useFontScale } from '@/contexts/FontScaleContext';
import { cardFontByLang, titleLeading } from '@/utils/langType';
import { contentByLang, meaningByLang, pick } from '@/utils/localize';
import { darshanForTemple, darshanChannels } from '@/data/darshan/channels';
import { getTempleDetailById } from '@/data/theerth/temples';
import { darshanReadingsForDeity } from '@/video/darshanContent';
import { resolveDarshanVideo } from '@/video/darshanSource';
import { useDarshanFavorites } from '@/video/darshanFavorites';
import { DarshanAction, DarshanCard, DarshanText, darshanStyles } from '@/components/darshan/DarshanUI';

type Phase = 'loading' | 'playing' | 'idle';
export default function DarshanPlayerScreen({ navigation, route }: NativeStackScreenProps<HomeStackParamList, 'DarshanPlayer'>) {
  const { colors } = useTheme();
  const { markSeen } = useNewContent();
  const { lang } = useGitaLanguage();
  const { factor } = useFontScale();
  const { height: viewportHeight } = useWindowDimensions();
  const { ids, ready, failed, toggle, retry } = useDarshanFavorites();
  const channel = darshanForTemple(route.params.templeId);
  // Existing sourced temple content loads only in this on-demand route.
  const temple = useMemo(() => getTempleDetailById(route.params.templeId), [route.params.templeId]);
  const [phase, setPhase] = useState<Phase>('idle');
  const [videoId, setVideoId] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [storyOpen, setStoryOpen] = useState(false);
  const request = useRef<{ controller: AbortController; timer: ReturnType<typeof setTimeout> } | null>(null);
  const cancel = useCallback(() => {
    if (!request.current) return;
    clearTimeout(request.current.timer);
    request.current.controller.abort();
    request.current = null;
  }, []);
  const load = useCallback(() => {
    cancel();
    setVideoId(null);
    setAttempt((n) => n + 1);
    if (!channel) return;
    // Every audited channel has a visible in-app channel embed. Prefer the
    // dedicated sanctum embed when the temple publishes one; never scrape
    // YouTube channel HTML or bundle today's video IDs.
    if (!channel.livePage) { setPhase('playing'); return; }
    setPhase('loading');
    const controller = new AbortController();
    const timer = setTimeout(() => {
      controller.abort();
      request.current = null;
      setPhase('playing'); // Visible stable channel player handles availability.
    }, 12000);
    request.current = { controller, timer };
    void resolveDarshanVideo(channel, controller.signal)
      .then((id) => {
        if (!controller.signal.aborted) { setVideoId(id); setPhase('playing'); }
      })
      .catch(() => { if (!controller.signal.aborted) setPhase('playing'); })
      .finally(() => {
        clearTimeout(timer);
        if (request.current?.controller === controller) request.current = null;
      });
  }, [cancel, channel]);
  useEffect(() => { load(); return cancel; }, [load, cancel]);
  useFocusEffect(useCallback(() => () => {
    cancel(); setVideoId(null); setPhase('idle');
  }, [cancel]));
  useEffect(() => {
    const sub = AppState.addEventListener('change', (next) => {
      if (next !== 'active') { cancel(); setVideoId(null); setPhase('idle'); }
    });
    return () => sub.remove();
  }, [cancel]);

  const heading = pick(lang, { hi: 'मंदिर दर्शन', en: 'Temple Darshan', gu: 'મંદિર દર્શન', kn: 'ದೇವಾಲಯ ದರ್ಶನ' });
  if (!channel || !temple) return <SafeAreaView style={[darshanStyles.root, { backgroundColor: colors.parchment }]}>
    <ReaderHeader title={heading} onBack={() => navigation.goBack()} />
    <View style={darshanStyles.body}><DarshanText>{pick(lang, { hi: 'मंदिर नहीं मिला', en: 'Temple not found', gu: 'મંદિર મળ્યું નથી', kn: 'ದೇವಾಲಯ ಕಂಡುಬಂದಿಲ್ಲ' })}</DarshanText>
      <DarshanAction label={pick(lang, { hi: 'अन्य मंदिर देखें', en: 'Browse temples', gu: 'બીજાં મંદિરો જુઓ', kn: 'ಇತರ ದೇವಾಲಯಗಳನ್ನು ನೋಡಿ' })} onPress={() => navigation.navigate('DarshanList')} />
    </View>
  </SafeAreaView>;
  const title = contentByLang(lang, temple.nameHi, temple.nameEn);
  const saved = ids.includes(channel.templeId);
  const saveLabel = saved
    ? pick(lang, { hi: 'पसंदीदा से हटाएँ', en: 'Remove favourite', gu: 'મનપસંદમાંથી દૂર કરો', kn: 'ಮೆಚ್ಚಿನವುಗಳಿಂದ ತೆಗೆಯಿರಿ' })
    : pick(lang, { hi: 'पसंदीदा मंदिर में जोड़ें', en: 'Save temple', gu: 'મનપસંદ મંદિરમાં ઉમેરો', kn: 'ಮೆಚ್ಚಿನ ದೇವಾಲಯಗಳಿಗೆ ಸೇರಿಸಿ' });
  const readings = darshanReadingsForDeity(temple.deity);
  return <SafeAreaView edges={['top', 'left', 'right']} style={[darshanStyles.root, { backgroundColor: colors.parchment }]}>
    <ReaderHeader title={heading} onBack={() => navigation.goBack()} right={
      <Pressable testID="darshan-save" onPress={() => toggle(channel.templeId)} disabled={!ready}
        accessibilityRole="button" accessibilityLabel={saveLabel} accessibilityState={{ selected: saved, disabled: !ready }}
        style={[styles.save, { backgroundColor: saved ? colors.saffronTint : colors.parchmentSoft }]}>
        <AppIcon name="saved" size={22} weight={saved ? 'fill' : 'regular'} color={colors.saffronDeep} />
      </Pressable>
    } />
    <View testID="darshan-hero" style={[styles.hero, { backgroundColor: colors.surface, borderColor: colors.divider }]}>
        {phase === 'playing' && <DockedYouTubePlayer
          key={`${channel.templeId}:${videoId ?? 'channel'}:${attempt}`}
          mapping={{ videoId: videoId ?? undefined, titleHi: temple.nameHi, titleEn: temple.nameEn, channel: channel.channel }}
          channelId={videoId ? undefined : channel.channelId}
          broadcast uiLang={lang} onRefreshSource={load}
          onChooseBroadcast={() => navigation.navigate('DarshanList')}
          onClose={() => { setVideoId(null); setPhase('idle'); }}
        />}
        {phase !== 'playing' && <View testID="darshan-start" style={[styles.start, { minHeight: viewportHeight < 700 ? 200 : 240, backgroundColor: colors.parchmentDeep }]}>
          {phase === 'loading' ? <><ActivityIndicator color={colors.saffron} />
            <DarshanText>{pick(lang, { hi: 'दर्शन जुड़ रहे हैं…', en: 'Connecting to Darshan…', gu: 'દર્શન સાથે જોડાઈ રહ્યા છીએ…', kn: 'ದರ್ಶನಕ್ಕೆ ಸಂಪರ್ಕಿಸಲಾಗುತ್ತಿದೆ…' })}</DarshanText></>
            : <DarshanAction primary testID="darshan-watch" label={pick(lang, { hi: 'दर्शन फिर शुरू करें', en: 'Resume Darshan', gu: 'દર્શન ફરી શરૂ કરો', kn: 'ದರ್ಶನವನ್ನು ಪುನರಾರಂಭಿಸಿ' })} onPress={load} />}
        </View>}

      </View>
    <ScrollView testID="darshan-content" style={{ flex: 1 }} contentContainerStyle={styles.scroll}>
      <View style={styles.body}>
        <View testID="darshan-summary" style={styles.summary}>
          <View testID="darshan-title-row" style={styles.titleRow}>
            <DarshanText testID="darshan-title" accessibilityRole="header" style={{ fontFamily: cardFontByLang(lang), fontSize: 24 * factor, lineHeight: titleLeading(24 * factor), flexGrow: 1, flexShrink: 1, flexBasis: 180 }}>{title}</DarshanText>
            <LanguageToggle compact />
          </View>
          <View style={styles.location}><AppIcon name="location" size={14} color={colors.saffronDeep} />
            <DarshanText style={{ color: colors.inkMuted, fontSize: 14 * factor, lineHeight: 22 * factor }}>{contentByLang(lang, temple.cityHi, temple.cityEn)} · {contentByLang(lang, temple.stateHi, temple.stateEn)}</DarshanText>
          </View>
          <DarshanText style={{ color: colors.inkMuted, fontSize: 12 * factor, lineHeight: 20 * factor }}>{channel.channel}</DarshanText>
          {channel.kind === 'tv' && <DarshanText style={{ color: colors.inkMuted, fontSize: 12 * factor, lineHeight: 20 * factor }}>{pick(lang, { hi: 'मंदिर का भक्ति टीवी प्रसारण', en: 'Temple devotional TV', gu: 'મંદિરનું ભક્તિ ટીવી પ્રસારણ', kn: 'ದೇವಾಲಯದ ಭಕ್ತಿ ಟಿವಿ ಪ್ರಸಾರ' })}</DarshanText>}
        </View>
        {failed && <View style={{ gap: 8 }}><DarshanText accessibilityLiveRegion="polite">{pick(lang, { hi: 'पसंदीदा सहेज नहीं सके। फिर प्रयास करें।', en: 'Could not save favourites. Please retry.', gu: 'મનપસંદ સાચવી શકાયા નથી. ફરી પ્રયાસ કરો.', kn: 'ಮೆಚ್ಚಿನವುಗಳನ್ನು ಉಳಿಸಲಾಗಲಿಲ್ಲ. ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.' })}</DarshanText><DarshanAction testID="darshan-save-retry" label={pick(lang, { hi: 'फिर प्रयास करें', en: 'Retry saving', gu: 'ફરી પ્રયાસ કરો', kn: 'ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ' })} onPress={() => { void retry(); }} /></View>}
        <View testID="darshan-about" style={[styles.about, { backgroundColor: colors.parchmentSoft, borderColor: colors.divider }]}>
          <DarshanText accessibilityRole="header" style={{ color: colors.saffronDeep, fontFamily: cardFontByLang(lang) }}>{pick(lang, { hi: 'इस तीर्थ का महत्व', en: 'Why this temple is sacred', gu: 'આ તીર્થનું મહત્વ', kn: 'ಈ ಕ್ಷೇತ್ರದ ಮಹತ್ವ' })}</DarshanText>
          <DarshanText>{meaningByLang(lang, temple.significanceHi, temple.significanceEn)}</DarshanText>
          {!!temple.originStoryHi && <>
            <Pressable testID="darshan-story" accessibilityRole="button" accessibilityState={{ expanded: storyOpen }} onPress={() => setStoryOpen(!storyOpen)} style={[styles.textAction, { borderColor: colors.divider }]}>
              <DarshanText style={{ color: colors.saffronDeep, flex: 1 }}>{pick(lang, { hi: 'मंदिर की कथा व परंपरा', en: 'Temple story and tradition', gu: 'મંદિરની કથા અને પરંપરા', kn: 'ದೇವಾಲಯದ ಕಥೆ ಮತ್ತು ಪರಂಪರೆ' })}</DarshanText>
              <AppIcon name={storyOpen ? 'caretUp' : 'caretDown'} size={20} color={colors.saffronDeep} />
            </Pressable>
            {storyOpen && <DarshanText testID="darshan-story-content">{meaningByLang(lang, temple.originStoryHi, temple.originStoryEn)}</DarshanText>}
          </>}
          <Pressable testID="darshan-guide" accessibilityRole="button" onPress={() => navigation.navigate('TheerthDetail', { templeId: temple.id })} style={styles.textAction}>
            <DarshanText style={{ color: colors.saffronDeep, flex: 1 }}>{pick(lang, { hi: 'पूरा मंदिर परिचय पढ़ें', en: 'Read the complete temple guide', gu: 'મંદિરનો સંપૂર્ણ પરિચય વાંચો', kn: 'ಸಂಪೂರ್ಣ ದೇವಾಲಯ ಪರಿಚಯ ಓದಿ' })}</DarshanText>
            <AppIcon name="next" size={18} color={colors.saffronDeep} />
          </Pressable>
        </View>
        {!!readings.length && <View testID="darshan-readings" style={styles.section}>
          <DarshanText accessibilityRole="header" style={{ fontFamily: cardFontByLang(lang), fontSize: 22 * factor, lineHeight: titleLeading(22 * factor) }}>{pick(lang, { hi: 'दर्शन के साथ आरती व पाठ', en: 'Aarti and readings for your devotion', gu: 'દર્શન સાથે આરતી અને પાઠ', kn: 'ದರ್ಶನದೊಂದಿಗೆ ಆರತಿ ಮತ್ತು ಪಠಣ' })}</DarshanText>
          {readings.map((entry) => <LibraryCard key={entry.id} entry={entry} onPress={() => { markSeen(entry.id); navigateToEntryStart(navigation, entry); }} />)}
        </View>}
        <View style={styles.section}>
          <DarshanText accessibilityRole="header" style={{ fontFamily: cardFontByLang(lang), fontSize: 22 * factor, lineHeight: titleLeading(22 * factor) }}>{pick(lang, { hi: 'अन्य मंदिरों के दर्शन', en: 'Darshan from other temples', gu: 'બીજાં મંદિરોના દર્શન', kn: 'ಇತರ ದೇವಾಲಯಗಳ ದರ್ಶನ' })}</DarshanText>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.temples}>
            {darshanChannels.filter((c) => c.templeId !== channel.templeId).map((c) => <View key={c.templeId} style={{ width: 280 }}>
              <DarshanCard channel={c} onPress={() => navigation.replace('DarshanPlayer', { templeId: c.templeId })} />
            </View>)}
          </ScrollView>
        </View>
      </View>
    </ScrollView>
  </SafeAreaView>;
}
const styles = StyleSheet.create({
  scroll: { paddingBottom: 40, width: '100%', maxWidth: 840, alignSelf: 'center' },
  hero: { width: '100%', maxWidth: 840, alignSelf: 'center', borderBottomWidth: 1 },
  start: { minHeight: 240, alignItems: 'center', justifyContent: 'center', padding: 22, gap: 14 },
  body: { paddingHorizontal: 22, paddingTop: 12, gap: 16 },
  summary: { gap: 4 },
  titleRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8 },
  location: { flexDirection: 'row', gap: 6, alignItems: 'center', flexWrap: 'wrap' },
  save: { minHeight: 48, minWidth: 48, alignItems: 'center', justifyContent: 'center', borderRadius: 24 },
  about: { borderWidth: 1, borderRadius: 22, padding: 18, gap: 14 },
  textAction: { minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, paddingVertical: 8 },
  section: { gap: 14 },
  temples: { gap: 12, paddingBottom: 4 },
});
