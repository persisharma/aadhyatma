import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, PixelRatio, Platform, Pressable, ScrollView, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { captureRef, releaseCapture } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import ReaderHeader from '@/components/ReaderHeader';
import SuvicharCard from '@/components/SuvicharCard';
import SuvicharPresetPicker from '@/components/SuvicharPresetPicker';
import { suvicharTemplates, type SuvicharTemplate } from '@/data/suvicharTemplates';
import { useGitaLanguage } from '@/data/gita/language';
import { defaultSuvichar, initialSuvichar, parseSuvicharPreferences, suvicharArtKey, suvicharDeities, suvicharFrames, suvicharWishes, suvicharReflections, NAME_LIMIT, MESSAGE_LIMIT } from '@/data/suvichar';
import { useTheme } from '@/theme/ThemeContext';
import { contentByLang, pick, type LocalizedStrings } from '@/utils/localize';
import { titleFontByLang } from '@/utils/langType';
import { suvicharCaptureSize } from '@/utils/suvicharCapture';
import { shareFiles } from '@/utils/multiShare';
import type { HomeStackParamList } from '@/navigation/types';

const KEY = '@vedansh/suvichar/v1';
// Serialize writes: a slow earlier save must never replace the latest name.
let saves: Promise<unknown> = Promise.resolve();
export default function SuvicharScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<HomeStackParamList>>();
  const { lang } = useGitaLanguage();
  const { colors, spacing, radii, typography } = useTheme();
  const { width: windowWidth } = useWindowDimensions();
  const width = Math.min(540, windowWidth - spacing.lg * 2);
  const [prefs, setPrefs] = useState(initialSuvichar);
  const [loaded, setLoaded] = useState(false);
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState<'ready' | 'custom'>('ready');
  const [presetKind, setPresetKind] = useState<'daily' | 'wish'>('daily');
  const [readyIdentity, setReadyIdentity] = useState<string | null>(null);
  const [retry, setRetry] = useState(0);
  const card = useRef<View>(null);
  const lock = useRef(false);
  const measurement = useRef<{ identity: string; height: number } | null>(null);
  const latestReady = useRef<string | null>(null);
  useEffect(() => { let active = true; void saves.then(() => AsyncStorage.getItem(KEY)).then(raw => { if (active) { setPrefs(parseSuvicharPreferences(raw)); setLoaded(true); } }).catch(() => { if (active) setLoaded(true); }); return () => { active = false; }; }, []);
  useEffect(() => { if (loaded) saves = saves.catch(() => undefined).then(() => AsyncStorage.setItem(KEY, JSON.stringify(prefs))).catch(() => undefined); }, [prefs, loaded]);
  const tr = (s: LocalizedStrings) => pick(lang, s);
  const title = tr({ hi: 'सुविचार', en: 'Suvichar', gu: 'સુવિચાર', kn: 'ಸುವಿಚಾರ' });
  const style = { color: colors.ink, fontFamily: titleFontByLang(lang), fontSize: typography.readerTitle.fontSize, lineHeight: typography.readerTitle.fontSize * 1.65 };
  const message = prefs.message.trim() || contentByLang(lang, defaultSuvichar.hi, defaultSuvichar.en);
  const selectedTemplate = suvicharTemplates.find(t => t.deity === prefs.deity && contentByLang(lang, t.messageHi, t.messageEn) === message);
  const original = !prefs.message.trim() || selectedTemplate?.kind === 'daily' || suvicharReflections.some(r => contentByLang(lang, r.hi, r.en) === message);
  const favorite = { deity: prefs.deity, frame: prefs.frame, message: prefs.message, name: prefs.name };
  const savedIndex = prefs.favorites.findIndex(f => JSON.stringify(f) === JSON.stringify(favorite));
  const identity = JSON.stringify([prefs.deity, prefs.frame, prefs.name, message, width, lang, retry]);
  const ready = readyIdentity === identity;
  const update = (patch: Partial<typeof prefs>) => setPrefs(p => ({ ...p, ...patch }));
  const chooseTemplate = (template: SuvicharTemplate) => update({ deity: template.deity, frame: template.frame, message: contentByLang(lang, template.messageHi, template.messageEn) });
  // Each mounted preview owns its readiness, so stale decode callbacks cannot unlock a replacement.
  const activeIdentity = useRef(identity); activeIdentity.current = identity;
  const onReady = useCallback((value: boolean) => { if (activeIdentity.current === identity) { latestReady.current = value ? identity : null; setReadyIdentity(latestReady.current); } }, [identity]);
  const onHeight = useCallback((height: number) => {
    if (activeIdentity.current === identity && Number.isFinite(height) && height > 0) measurement.current = { identity, height };
  }, [identity]);
  const share = async () => {
    if (lock.current || !ready || !loaded) return;
    lock.current = true; setBusy(true);
    let uri: string | undefined;
    try {
      await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
      const measured = measurement.current;
      if (activeIdentity.current !== identity || latestReady.current !== identity || measured?.identity !== identity) throw new Error('Card changed before capture');
      const captureScale = Platform.OS === 'ios' ? PixelRatio.get() : 1;
      const size = suvicharCaptureSize(width, measured.height, captureScale);
      uri = await captureRef(card, { format: 'png', quality: 1, result: 'tmpfile', ...size });
      if (!await shareFiles([uri], { title })) {
        if (!await Sharing.isAvailableAsync()) throw new Error('Sharing unavailable');
        await Sharing.shareAsync(uri, { mimeType: 'image/png', UTI: 'public.png', dialogTitle: title });
      }
    } catch { Alert.alert(tr({ hi: 'शेयर नहीं हो पाया', en: 'Could not share', gu: 'શેર થઈ શક્યું નહીં', kn: 'ಹಂಚಿಕೊಳ್ಳಲಾಗಲಿಲ್ಲ' }), tr({ hi: 'कृपया दोबारा कोशिश करें।', en: 'Please try again.', gu: 'કૃપા કરીને ફરી પ્રયાસ કરો.', kn: 'ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.' })); }
    finally { if (uri) releaseCapture(uri); lock.current = false; setBusy(false); }
  };
  const button = (label: string, press: () => void, selected = false, testID?: string, disabled = false) => <Pressable key={testID ?? label} testID={testID} accessibilityRole="button" accessibilityState={{ selected, disabled: disabled || busy || !loaded }} disabled={disabled || busy || !loaded} onPress={press} style={{ minHeight: 48, justifyContent: 'center', paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, borderWidth: 1, borderColor: selected ? colors.saffron : colors.divider, borderRadius: radii.md, backgroundColor: selected ? colors.saffronTint : colors.parchmentSoft, opacity: disabled ? .5 : 1 }}><Text style={style}>{label}</Text></Pressable>;
  const inputStyle = { ...style, backgroundColor: colors.parchmentSoft, borderColor: colors.divider, borderWidth: 1, borderRadius: radii.md, padding: spacing.md };
  return <SafeAreaView style={{ flex: 1, backgroundColor: colors.parchment }} edges={['top', 'left', 'right']}>
    <ReaderHeader title={title} onBack={() => navigation.goBack()} />
    {!loaded ? <ActivityIndicator color={colors.saffron} /> : <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.screenGutter }}>
      <Text style={style}>{tr({ hi: 'अपनों को भेजें, अपने नाम के साथ', en: 'A little devotion, with your name', gu: 'તમારા નામ સાથે પ્રિયજનોને મોકલો', kn: 'ನಿಮ್ಮ ಹೆಸರಿನೊಂದಿಗೆ ಆತ್ಮೀಯರಿಗೆ ಕಳುಹಿಸಿ' })}</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
        {button(tr({ hi: 'तैयार कार्ड', en: 'Ready-made cards', gu: 'તૈયાર કાર્ડ', kn: 'ಸಿದ್ಧ ಕಾರ್ಡ್‌ಗಳು' }), () => setMode('ready'), mode === 'ready', 'suvichar-mode-ready')}
        {button(tr({ hi: 'अपना बनाएँ', en: 'Create your own', gu: 'તમારું બનાવો', kn: 'ನಿಮ್ಮದೇ ರಚಿಸಿ' }), () => setMode('custom'), mode === 'custom', 'suvichar-mode-custom')}
      </View>
      {mode === 'ready' ? <>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
          {button(tr({ hi: 'भक्ति संदेश', en: 'Devotional cards', gu: 'ભક્તિ સંદેશ', kn: 'ಭಕ್ತಿ ಸಂದೇಶಗಳು' }), () => setPresetKind('daily'), presetKind === 'daily', 'suvichar-presets-daily')}
          {button(tr({ hi: 'शुभकामनाएँ', en: 'Wishes', gu: 'શુભેચ્છાઓ', kn: 'ಶುಭಾಶಯಗಳು' }), () => setPresetKind('wish'), presetKind === 'wish', 'suvichar-presets-wish')}
        </View>
        <SuvicharPresetPicker templates={suvicharTemplates.filter(t => t.kind === presetKind)} lang={lang} selectedId={selectedTemplate?.id} disabled={busy || !loaded} onSelect={chooseTemplate} />
      </> : <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.sm }}>{suvicharDeities.map(d => button(contentByLang(lang, d.hi, d.en), () => update({ deity: d.id }), prefs.deity === d.id, `suvichar-deity-${d.id}`))}</ScrollView>}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.sm }}>{suvicharFrames.map(f => button(contentByLang(lang, f.hi, f.en), () => update({ frame: f.id }), prefs.frame === f.id, `suvichar-frame-${f.id}`))}</ScrollView>
      {mode === 'custom' ? <><Text style={style}>{tr({ hi: 'शुभकामनाएँ चुनें', en: 'Choose a wish', gu: 'શુભેચ્છા પસંદ કરો', kn: 'ಶುಭಾಶಯ ಆಯ್ಕೆ ಮಾಡಿ' })}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.sm }}>{suvicharWishes.map(w => button(contentByLang(lang, w.hi, w.en), () => update({ deity: w.deity, message: contentByLang(lang, w.messageHi, w.messageEn) }), false, `suvichar-wish-${w.id}`))}</ScrollView>
      </> : null}
      <View ref={card} collapsable={false} style={{ alignSelf: 'center', width }}><SuvicharCard key={JSON.stringify([prefs.deity, prefs.frame, retry])} deity={prefs.deity} frame={prefs.frame} name={prefs.name} message={message} lang={lang} width={width} onReady={onReady} onHeight={onHeight} original={original} /></View>
      {!ready ? button(tr({ hi: 'चित्र फिर लाएँ', en: 'Reload artwork', gu: 'ચિત્ર ફરી લાવો', kn: 'ಚಿತ್ರವನ್ನು ಮತ್ತೆ ಲೋಡ್ ಮಾಡಿ' }), () => { setReadyIdentity(null); setRetry(n => n + 1); }, false, 'suvichar-retry') : null}
      {mode === 'custom' ? button(tr({ hi: 'अगला सुविचार', en: 'Next thought', gu: 'આગળનો સુવિચાર', kn: 'ಮುಂದಿನ ಸುವಿಚಾರ' }), () => {
        const index = suvicharReflections.findIndex(r => contentByLang(lang, r.hi, r.en) === prefs.message);
        const next = suvicharReflections[(index + 1) % suvicharReflections.length];
        update({ message: contentByLang(lang, next.hi, next.en) });
      }, false, 'suvichar-next') : null}
      <Text style={style}>{tr({ hi: 'आपका नाम / परिवार (वैकल्पिक)', en: 'Your name / family (optional)', gu: 'તમારું નામ / પરિવાર (વૈકલ્પિક)', kn: 'ನಿಮ್ಮ ಹೆಸರು / ಕುಟುಂಬ (ಐಚ್ಛಿಕ)' })}</Text>
      <TextInput testID="suvichar-name" accessibilityLabel={tr({ hi: 'आपका नाम', en: 'Your name', gu: 'તમારું નામ', kn: 'ನಿಮ್ಮ ಹೆಸರು' })} value={prefs.name} maxLength={NAME_LIMIT} editable={!busy} onChangeText={name => update({ name })} style={inputStyle} />
      {mode === 'custom' ? <>
      <Text style={style}>{tr({ hi: 'अपना संदेश लिखें (वैकल्पिक)', en: 'Write your message (optional)', gu: 'તમારો સંદેશ લખો (વૈકલ્પિક)', kn: 'ನಿಮ್ಮ ಸಂದೇಶ ಬರೆಯಿರಿ (ಐಚ್ಛಿಕ)' })}</Text>
      <TextInput testID="suvichar-message" accessibilityLabel={tr({ hi: 'आपका संदेश', en: 'Your message', gu: 'તમારો સંદેશ', kn: 'ನಿಮ್ಮ ಸಂದೇಶ' })} multiline value={prefs.message} maxLength={MESSAGE_LIMIT} editable={!busy} onChangeText={message => update({ message })} placeholder={message} placeholderTextColor={colors.inkMuted} style={inputStyle} />
      </> : null}
      {button(tr({ hi: 'WhatsApp / साझा करें', en: 'WhatsApp / Share', gu: 'WhatsApp / શેર કરો', kn: 'WhatsApp / ಹಂಚಿಕೊಳ್ಳಿ' }), () => void share(), true, 'suvichar-share', !ready)}
      {button(savedIndex >= 0 ? tr({ hi: 'पसंदीदा से हटाएँ', en: 'Remove favorite', gu: 'પસંદમાંથી દૂર કરો', kn: 'ಮೆಚ್ಚಿನವುಗಳಿಂದ ತೆಗೆದುಹಾಕಿ' }) : tr({ hi: 'पसंदीदा में रखें', en: 'Save favorite', gu: 'પસંદમાં રાખો', kn: 'ಮೆಚ್ಚಿನದಾಗಿ ಉಳಿಸಿ' }), () => setPrefs(p => ({ ...p, favorites: savedIndex >= 0 ? p.favorites.filter((_, i) => i !== savedIndex) : [...p.favorites.slice(-49), favorite] })), savedIndex >= 0, 'suvichar-favorite')}
      {prefs.favorites.length ? <Text style={style}>{tr({ hi: 'मेरे पसंदीदा', en: 'My favorites', gu: 'મારી પસંદ', kn: 'ನನ್ನ ಮೆಚ್ಚಿನವುಗಳು' })}</Text> : null}
      {prefs.favorites.map((f, i) => button(`${contentByLang(lang, suvicharDeities.find(d => d.id === f.deity)!.hi, suvicharDeities.find(d => d.id === f.deity)!.en)} · ${f.name || contentByLang(lang, 'सुविचार', 'Suvichar')}`, () => update(f), false, `suvichar-saved-${i}`))}
      {busy ? <ActivityIndicator color={colors.saffron} /> : null}
    </ScrollView>}
  </SafeAreaView>;
}
