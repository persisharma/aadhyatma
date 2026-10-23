import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, PixelRatio, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { captureRef, releaseCapture } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import ReaderHeader from '@/components/ReaderHeader';
import SuvicharCard from '@/components/SuvicharCard';
import SuvicharPresetPicker from '@/components/SuvicharPresetPicker';
import SuvicharFramePicker from '@/components/SuvicharFramePicker';
import AppIcon from '@/components/AppIcon';
import { suvicharTemplates, type SuvicharTemplate } from '@/data/suvicharTemplates';
import { useGitaLanguage } from '@/data/gita/language';
import { defaultSuvichar, initialSuvichar, parseSuvicharPreferences, suvicharDeities, suvicharReflections, NAME_LIMIT, MESSAGE_LIMIT } from '@/data/suvichar';
import { useTheme } from '@/theme/ThemeContext';
import { androidBoxShadow } from '@/theme/elevation';
import { contentByLang, pick, type LocalizedStrings } from '@/utils/localize';
import { meaningToken, titleFontByLang } from '@/utils/langType';
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
  // The sender is typed once and remembered; afterwards it is a compact editable row.
  const [editingName, setEditingName] = useState(false);
  const scroll = useRef<ScrollView>(null);
  const card = useRef<View>(null);
  const lock = useRef(false);
  const measurement = useRef<{ identity: string; height: number } | null>(null);
  const latestReady = useRef<string | null>(null);
  useEffect(() => { let active = true; void saves.then(() => AsyncStorage.getItem(KEY)).then(raw => { if (active) { const parsed = parseSuvicharPreferences(raw); setPrefs(parsed); setEditingName(!parsed.name); setLoaded(true); } }).catch(() => { if (active) { setEditingName(true); setLoaded(true); } }); return () => { active = false; }; }, []);
  useEffect(() => { if (loaded) saves = saves.catch(() => undefined).then(() => AsyncStorage.setItem(KEY, JSON.stringify(prefs))).catch(() => undefined); }, [prefs, loaded]);
  const tr = (s: LocalizedStrings) => pick(lang, s);
  const title = tr({ hi: 'सुविचार', en: 'Suvichar', gu: 'સુવિચાર', kn: 'ಸುವಿಚಾರ' });
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
  const off = busy || !loaded;
  const face = titleFontByLang(lang);
  const eyebrow = { fontFamily: face, fontSize: 13, lineHeight: 20, color: colors.inkMuted };
  const hint = { fontFamily: meaningToken(lang, typography).fontFamily, fontSize: 12, lineHeight: 18, color: colors.inkMuted };
  // Three tiers: the mode segment (top-level choice), underline tabs (filters) and pill chips (saved items).
  const segment = (label: string, press: () => void, selected: boolean, testID: string) => <Pressable key={testID} testID={testID} accessibilityRole="tab" accessibilityState={{ selected, disabled: off }} disabled={off} onPress={press}
    style={({ pressed }) => ({ flex: 1, minHeight: 44, alignItems: 'center', justifyContent: 'center', borderRadius: radii.pill, backgroundColor: selected ? colors.saffronTint : 'transparent', opacity: pressed && !selected ? 0.7 : 1 })}>
    <Text style={{ fontFamily: face, fontSize: 15, lineHeight: 24, color: selected ? colors.saffronDeep : colors.inkMuted }}>{label}</Text></Pressable>;
  const tab = (label: string, press: () => void, selected: boolean, testID: string) => <Pressable key={testID} testID={testID} accessibilityRole="tab" accessibilityState={{ selected, disabled: off }} disabled={off} onPress={press}
    style={{ minHeight: 44, justifyContent: 'center', borderBottomWidth: 2, borderColor: selected ? colors.saffron : 'transparent' }}>
    <Text style={{ fontFamily: face, fontSize: 15, lineHeight: 24, color: selected ? colors.saffronDeep : colors.inkMuted }}>{label}</Text></Pressable>;
  const chip = (label: string, press: () => void, testID: string) => <Pressable key={testID} testID={testID} accessibilityRole="button" accessibilityState={{ disabled: off }} disabled={off} onPress={press}
    style={({ pressed }) => ({ minHeight: 44, justifyContent: 'center', paddingHorizontal: spacing.md + 2, borderRadius: radii.pill, borderWidth: 1, borderColor: colors.divider, backgroundColor: colors.parchmentSoft, opacity: pressed ? 0.8 : 1 })}>
    <Text style={{ fontFamily: face, fontSize: 14, lineHeight: 22, color: colors.inkSoft }}>{label}</Text></Pressable>;
  const inputStyle = { color: colors.ink, fontFamily: face, fontSize: 16, lineHeight: 26, backgroundColor: colors.cardActiveFrom, borderColor: colors.cardActiveBorder, borderWidth: 1, borderRadius: radii.md, padding: spacing.md };
  const nextReflection = () => {
    const index = suvicharReflections.findIndex(r => contentByLang(lang, r.hi, r.en) === prefs.message);
    const next = suvicharReflections[(index + 1) % suvicharReflections.length];
    update({ message: contentByLang(lang, next.hi, next.en) });
  };
  const dailyTemplates = suvicharTemplates.filter(t => t.kind === 'daily');
  const shareOff = !ready || off;
  const myFavorites = tr({ hi: 'मेरे पसंदीदा', en: 'My favorites', gu: 'મારી પસંદ', kn: 'ನನ್ನ ಮೆಚ್ಚಿನವುಗಳು' });
  return <SafeAreaView style={{ flex: 1, backgroundColor: colors.parchment }} edges={['top', 'left', 'right']}>
    <ReaderHeader title={title} onBack={() => navigation.goBack()} sideWidth={48} right={prefs.favorites.length ? <Pressable testID="suvichar-favorites-jump" accessibilityRole="button" accessibilityLabel={myFavorites}
      onPress={() => scroll.current?.scrollToEnd({ animated: true })} style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}><AppIcon name="saved" /></Pressable> : undefined} />
    {!loaded ? <ActivityIndicator color={colors.saffron} /> : <ScrollView ref={scroll} keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: spacing.lg, paddingTop: spacing.xs, gap: spacing.xl, paddingBottom: spacing.xxl }}>
      <View accessibilityRole="tablist" style={{ flexDirection: 'row', padding: 3, borderWidth: 1, borderColor: colors.divider, borderRadius: radii.pill, backgroundColor: colors.parchmentSoft }}>
        {segment(tr({ hi: 'तैयार कार्ड', en: 'Ready-made cards', gu: 'તૈયાર કાર્ડ', kn: 'ಸಿದ್ಧ ಕಾರ್ಡ್‌ಗಳು' }), () => setMode('ready'), mode === 'ready', 'suvichar-mode-ready')}
        {segment(tr({ hi: 'अपना बनाएँ', en: 'Create your own', gu: 'તમારું બનાવો', kn: 'ನಿಮ್ಮದೇ ರಚಿಸಿ' }), () => setMode('custom'), mode === 'custom', 'suvichar-mode-custom')}
      </View>
      {mode === 'ready' ? <View style={{ gap: spacing.sm }}>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', columnGap: spacing.lg }}>
          <Text style={[eyebrow, { paddingBottom: spacing.sm + 2 }]}>{tr({ hi: 'कार्ड चुनें', en: 'Choose a card', gu: 'કાર્ડ પસંદ કરો', kn: 'ಕಾರ್ಡ್ ಆಯ್ಕೆ ಮಾಡಿ' })}</Text>
          <View accessibilityRole="tablist" style={{ flexDirection: 'row', gap: spacing.lg }}>
            {tab(tr({ hi: 'भक्ति संदेश', en: 'Devotional cards', gu: 'ભક્તિ સંદેશ', kn: 'ಭಕ್ತಿ ಸಂದೇಶಗಳು' }), () => setPresetKind('daily'), presetKind === 'daily', 'suvichar-presets-daily')}
            {tab(tr({ hi: 'शुभकामनाएँ', en: 'Wishes', gu: 'શુભેચ્છાઓ', kn: 'ಶುಭಾಶಯಗಳು' }), () => setPresetKind('wish'), presetKind === 'wish', 'suvichar-presets-wish')}
          </View>
        </View>
        <SuvicharPresetPicker templates={suvicharTemplates.filter(t => t.kind === presetKind)} lang={lang} selectedId={selectedTemplate?.id} disabled={off} onSelect={chooseTemplate} />
      </View> : <View style={{ gap: spacing.sm }}>
        <Text style={eyebrow}>{tr({ hi: 'देवता चुनें', en: 'Choose a deity', gu: 'દેવતા પસંદ કરો', kn: 'ದೇವತೆಯನ್ನು ಆಯ್ಕೆ ಮಾಡಿ' })}</Text>
        <SuvicharPresetPicker compact templates={dailyTemplates} lang={lang} selectedId={dailyTemplates.find(t => t.deity === prefs.deity)?.id} disabled={off}
          onSelect={t => update({ deity: t.deity })} testIDFor={t => `suvichar-deity-${t.deity}`} />
      </View>}
      <View style={{ gap: spacing.sm }}>
        <Text style={eyebrow}>{tr({ hi: 'फ्रेम', en: 'Frame', gu: 'ફ્રેમ', kn: 'ಚೌಕಟ್ಟು' })}</Text>
        <SuvicharFramePicker deity={prefs.deity} frame={prefs.frame} lang={lang} disabled={off} onSelect={frame => update({ frame })} />
      </View>
      <View style={{ gap: spacing.sm }}>
        <View ref={card} collapsable={false} style={{ alignSelf: 'center', width }}><SuvicharCard key={JSON.stringify([prefs.deity, prefs.frame, retry])} deity={prefs.deity} frame={prefs.frame} name={prefs.name} message={message} lang={lang} width={width} onReady={onReady} onHeight={onHeight} original={original} /></View>
        {!ready ? <Pressable testID="suvichar-retry" accessibilityRole="button" disabled={off} onPress={() => { setReadyIdentity(null); setRetry(n => n + 1); }} style={{ alignSelf: 'center', minHeight: 44, justifyContent: 'center' }}>
          <Text style={{ fontFamily: face, fontSize: 14, color: colors.saffronDeep }}>{tr({ hi: 'चित्र फिर लाएँ', en: 'Reload artwork', gu: 'ચિત્ર ફરી લાવો', kn: 'ಚಿತ್ರವನ್ನು ಮತ್ತೆ ಲೋಡ್ ಮಾಡಿ' })}</Text></Pressable> : null}
      </View>
      <View style={{ gap: spacing.xs + 2 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={eyebrow}>{tr({ hi: 'संदेश', en: 'Message', gu: 'સંદેશ', kn: 'ಸಂದೇಶ' })}</Text>
          <Pressable testID="suvichar-next" accessibilityRole="button" disabled={off} onPress={nextReflection} style={{ minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: spacing.xs + 2 }}>
            <AppIcon name="repeat" size={16} color={colors.saffronDeep} />
            <Text style={{ fontFamily: face, fontSize: 14, lineHeight: 22, color: colors.saffronDeep }}>{tr({ hi: 'दूसरा सुविचार', en: 'Another thought', gu: 'બીજો સુવિચાર', kn: 'ಇನ್ನೊಂದು ಸುವಿಚಾರ' })}</Text>
          </Pressable>
        </View>
        <TextInput testID="suvichar-message" accessibilityLabel={tr({ hi: 'आपका संदेश', en: 'Your message', gu: 'તમારો સંદેશ', kn: 'ನಿಮ್ಮ ಸಂದೇಶ' })} multiline value={prefs.message} maxLength={MESSAGE_LIMIT} editable={!busy} onChangeText={message => update({ message })} placeholder={message} placeholderTextColor={colors.inkMuted} style={inputStyle} />
        <Text style={hint}>{tr({ hi: 'तैयार संदेश बदलें या अपने शब्दों में लिखें', en: 'Edit the ready message or write your own', gu: 'તૈયાર સંદેશ બદલો અથવા તમારા શબ્દોમાં લખો', kn: 'ಸಿದ್ಧ ಸಂದೇಶ ಬದಲಿಸಿ ಅಥವಾ ನಿಮ್ಮ ಮಾತಿನಲ್ಲಿ ಬರೆಯಿರಿ' })} · {prefs.message.length}/{MESSAGE_LIMIT}</Text>
      </View>
      {editingName ? <View style={{ gap: spacing.xs + 2 }}>
        <Text style={eyebrow}>{tr({ hi: 'आपका नाम / परिवार (वैकल्पिक)', en: 'Your name / family (optional)', gu: 'તમારું નામ / પરિવાર (વૈકલ્પિક)', kn: 'ನಿಮ್ಮ ಹೆಸರು / ಕುಟುಂಬ (ಐಚ್ಛಿಕ)' })}</Text>
        <TextInput testID="suvichar-name" accessibilityLabel={tr({ hi: 'आपका नाम', en: 'Your name', gu: 'તમારું નામ', kn: 'ನಿಮ್ಮ ಹೆಸರು' })} value={prefs.name} maxLength={NAME_LIMIT} editable={!busy} autoFocus={!!prefs.name}
          onChangeText={name => update({ name })} onBlur={() => setEditingName(!prefs.name.trim())} returnKeyType="done" style={inputStyle} />
        <Text style={hint}>{tr({ hi: 'कार्ड पर “सप्रेम — नाम” दिखेगा; एक बार लिखें, आगे याद रहेगा', en: 'Shown as “With love — name”; saved for next time', gu: 'કાર્ડ પર “સપ્રેમ — નામ” દેખાશે; એક વાર લખો, પછી યાદ રહેશે', kn: 'ಕಾರ್ಡ್‌ನಲ್ಲಿ “ಪ್ರೀತಿಯಿಂದ — ಹೆಸರು” ಕಾಣುತ್ತದೆ; ಒಮ್ಮೆ ಬರೆಯಿರಿ, ಮುಂದೆ ನೆನಪಿರುತ್ತದೆ' })}</Text>
      </View> : <Pressable testID="suvichar-name-row" accessibilityRole="button" accessibilityLabel={tr({ hi: 'भेजने वाले का नाम बदलें', en: 'Change sender name', gu: 'મોકલનારનું નામ બદલો', kn: 'ಕಳುಹಿಸುವವರ ಹೆಸರು ಬದಲಿಸಿ' })} disabled={busy} onPress={() => setEditingName(true)}
        style={({ pressed }) => ({ minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingHorizontal: spacing.md + 2, borderRadius: radii.md, borderWidth: 1, borderStyle: 'dashed', borderColor: colors.cardActiveBorder, opacity: pressed ? 0.8 : 1 })}>
        <Text style={{ flex: 1, fontFamily: face, fontSize: 14, lineHeight: 22, color: colors.inkSoft }}>{tr({ hi: 'सप्रेम', en: 'With love', gu: 'સપ્રેમ', kn: 'ಪ್ರೀತಿಯಿಂದ' })} — <Text style={{ color: colors.ink }}>{prefs.name}</Text></Text>
        <AppIcon name="edit" size={16} color={colors.saffronDeep} />
      </Pressable>}
      {prefs.favorites.length ? <View style={{ gap: spacing.sm }}>
        <Text style={eyebrow}>{myFavorites}</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
          {prefs.favorites.map((f, i) => chip(`${contentByLang(lang, suvicharDeities.find(d => d.id === f.deity)!.hi, suvicharDeities.find(d => d.id === f.deity)!.en)} · ${f.name || contentByLang(lang, 'सुविचार', 'Suvichar')}`, () => update(f), `suvichar-saved-${i}`))}
        </View>
      </View> : null}
    </ScrollView>}
    {loaded ? <View style={{ flexDirection: 'row', gap: spacing.sm + 2, paddingHorizontal: spacing.lg, paddingTop: spacing.sm + 2, paddingBottom: spacing.md, backgroundColor: colors.parchmentSoft, borderTopWidth: StyleSheet.hairlineWidth, borderColor: colors.divider }}>
      <Pressable testID="suvichar-favorite" accessibilityRole="button" accessibilityLabel={savedIndex >= 0 ? tr({ hi: 'पसंदीदा से हटाएँ', en: 'Remove favorite', gu: 'પસંદમાંથી દૂર કરો', kn: 'ಮೆಚ್ಚಿನವುಗಳಿಂದ ತೆಗೆದುಹಾಕಿ' }) : tr({ hi: 'पसंदीदा में रखें', en: 'Save favorite', gu: 'પસંદમાં રાખો', kn: 'ಮೆಚ್ಚಿನದಾಗಿ ಉಳಿಸಿ' })}
        accessibilityState={{ selected: savedIndex >= 0, disabled: off }} disabled={off} onPress={() => setPrefs(p => ({ ...p, favorites: savedIndex >= 0 ? p.favorites.filter((_, i) => i !== savedIndex) : [...p.favorites.slice(-49), favorite] }))}
        style={({ pressed }) => ({ width: 52, height: 52, alignItems: 'center', justifyContent: 'center', borderRadius: radii.md, borderWidth: 1, borderColor: colors.cardActiveBorder, backgroundColor: colors.cardActiveFrom, opacity: pressed ? 0.85 : 1 })}>
        <AppIcon name="heart" color={colors.saffronDeep} weight={savedIndex >= 0 ? 'fill' : 'regular'} />
      </Pressable>
      <Pressable testID="suvichar-share" accessibilityRole="button" accessibilityState={{ disabled: shareOff, busy }} disabled={shareOff} onPress={() => void share()}
        style={({ pressed }) => ({ flex: 1, height: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm + 2, borderRadius: radii.md, backgroundColor: colors.saffronDeep,
          opacity: shareOff && !busy ? 0.55 : pressed ? 0.88 : 1, shadowColor: colors.saffronDeep, shadowOpacity: 0.25, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, ...androidBoxShadow(3, 8, 'rgba(138, 62, 11, 0.25)') })}>
        {busy ? <ActivityIndicator color={colors.parchmentSoft} /> : <AppIcon name="share" size={20} color={colors.parchmentSoft} />}
        <Text style={{ fontFamily: face, fontSize: 17, lineHeight: 26, color: colors.parchmentSoft }}>{tr({ hi: 'साझा करें', en: 'Share', gu: 'શેર કરો', kn: 'ಹಂಚಿಕೊಳ್ಳಿ' })}</Text>
      </Pressable>
    </View> : null}
  </SafeAreaView>;
}
