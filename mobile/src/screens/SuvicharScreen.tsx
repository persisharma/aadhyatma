import type { RouteProp } from '@react-navigation/native';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import ReaderHeader from '@/components/ReaderHeader';
import SuvicharCard from '@/components/SuvicharCard';
import SuvicharPresetPicker from '@/components/SuvicharPresetPicker';
import SuvicharFramePicker from '@/components/SuvicharFramePicker';
import SuvicharSenderPhoto from '@/components/SuvicharSenderPhoto';
import SuvicharThoughtPicker from '@/components/SuvicharThoughtPicker';
import AppIcon from '@/components/AppIcon';
import { isSuvicharThought, suvicharDay, suvicharTemplatesFor, type SuvicharTemplate } from '@/data/suvicharTemplates';
import { suvicharVaarFor, suvicharVaarTemplates, withTodaysVaar } from '@/data/suvicharVaar';
import { findSuvicharThought, nextSuvicharThought, suvicharSourceLabel, suvicharThoughtsFor, type SuvicharThought } from '@/data/suvicharContent';
import { WEEKDAY_LABELS } from '@/data/routine/vaar';
import { useGitaLanguage } from '@/data/gita/language';
import { buildSuvicharShareMessage } from '@/data/shareLinks';
import { cleanSender, fullPhotoFit, initialSuvichar, parseSuvicharPreferences, suvicharDeities, NAME_LIMIT, MESSAGE_LIMIT } from '@/data/suvichar';
import { useTheme } from '@/theme/ThemeContext';
import { androidBoxShadow } from '@/theme/elevation';
import { contentByLang, pick, type LocalizedStrings } from '@/utils/localize';
import { meaningToken, titleFontByLang } from '@/utils/langType';
import { useShare } from '@/utils/shareVerse';
import { deleteSenderPhoto, isSenderPhotoAvailable, pickSenderPhoto, senderPhotoUri } from '@/utils/suvicharPhoto';
import { useTodayKey } from '@/utils/useTodayKey';
import type { HomeStackParamList } from '@/navigation/types';

const KEY = '@vedansh/suvichar/v1';
// Serialize writes: a slow earlier save must never replace the latest name.
let saves: Promise<unknown> = Promise.resolve();
export default function SuvicharScreen({route}:{route?:RouteProp<HomeStackParamList,'Suvichar'>}={}) {
  const navigation = useNavigation<NativeStackNavigationProp<HomeStackParamList>>();
  const { lang } = useGitaLanguage();
  const { colors, spacing, radii, typography } = useTheme();
  const { width: windowWidth } = useWindowDimensions();
  const width = Math.min(540, windowWidth - spacing.lg * 2);
  const [prefs, setPrefs] = useState(initialSuvichar);
  const [loaded, setLoaded] = useState(false);
  const [thoughtsOpen, setThoughtsOpen] = useState(false);
  const [mode, setMode] = useState<'ready' | 'custom'>('ready');
  // Today's pairing of thoughts to deity cards and the weekday card, both re-read at midnight and on app return.
  const todayKey = useTodayKey();
  const now = useMemo(() => new Date(), [todayKey]); // eslint-disable-line react-hooks/exhaustive-deps
  const vaar = suvicharVaarFor(now);
  const [presetKind, setPresetKind] = useState<'vaar' | 'daily' | 'wish'>(vaar ? 'vaar' : 'daily');
  const kind = presetKind === 'vaar' && !vaar ? 'daily' : presetKind;
  const [readyIdentity, setReadyIdentity] = useState<string | null>(null);
  const [retry, setRetry] = useState(0);
  // The sender is typed once and remembered; afterwards it is a compact editable row.
  const [editingName, setEditingName] = useState(false);
  const scroll = useRef<ScrollView>(null);
  const picking = useRef(false);
  useEffect(() => { let active = true; void saves.then(() => AsyncStorage.getItem(KEY)).then(raw => { if (active) { const parsed = parseSuvicharPreferences(raw); setPrefs(withTodaysVaar(isSuvicharThought(parsed.message) ? { ...parsed, message: '', thoughtId: '' } : parsed, new Date())); setEditingName(!parsed.name); setLoaded(true); } }).catch(() => { if (active) { setPrefs(p => withTodaysVaar(p, new Date())); setEditingName(true); setLoaded(true); } }); return () => { active = false; }; }, []);
  const appliedExploreDraft = useRef<object | null>(null);
  useEffect(()=>{
    const draft=route?.params?.exploreDraft;
    if(!loaded||!draft||appliedExploreDraft.current===draft)return;
    appliedExploreDraft.current=draft;
    setPrefs(p=>({...p,name:cleanSender(draft.name),deity:draft.deity,vaar:false}));
    setPresetKind('daily');setEditingName(!draft.name.trim());
    navigation.setParams({exploreDraft:undefined});
  },[loaded,route?.params?.exploreDraft,navigation]);
  // A new day re-opens on its own card, unless the reader has written their own message.
  const openedDay = useRef(todayKey);
  useEffect(() => {
    if (!loaded || openedDay.current === todayKey) return;
    openedDay.current = todayKey;
    setPrefs(p => withTodaysVaar(p, now));
    setPresetKind(suvicharVaarFor(now) ? 'vaar' : 'daily');
  }, [todayKey, loaded]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (loaded) saves = saves.catch(() => undefined).then(() => AsyncStorage.setItem(KEY, JSON.stringify(prefs))).catch(() => undefined); }, [prefs, loaded]);
  const tr = (s: LocalizedStrings) => pick(lang, s);
  const title = tr({ hi: 'सुविचार', en: 'Suvichar', gu: 'સુવિચાર', kn: 'ಸುವಿಚಾರ' });
  // An unedited thought is not kept, so each visit opens on today's.
  const templates = useMemo(() => suvicharTemplatesFor(suvicharDay(now)), [now]);
  const vaarTemplates = useMemo(() => suvicharVaarTemplates(now, templates), [now, templates]);
  const cardTitle = prefs.vaar && vaar ? contentByLang(lang, vaar.hi, vaar.en) : undefined;
  const dailyTemplates = templates.filter(t => t.kind === 'daily');
  const todays = dailyTemplates.find(t => t.deity === prefs.deity)!;
  const storedThought = prefs.message.trim() ? findSuvicharThought(prefs.deity, prefs.message, prefs.thoughtId) : undefined;
  const message = storedThought ? contentByLang(lang, storedThought.hi, storedThought.en) : prefs.message.trim() || contentByLang(lang, todays.messageHi, todays.messageEn);
  const thought = storedThought ?? (!prefs.message.trim() ? findSuvicharThought(prefs.deity, message, todays.thoughtId) : undefined);
  const attribution = thought ? suvicharSourceLabel(thought, lang) : undefined;
  const selectedTemplate = prefs.vaar ? undefined : templates.find(t => t.deity === prefs.deity && contentByLang(lang, t.messageHi, t.messageEn) === message);
  const original = !prefs.message.trim() || selectedTemplate?.kind === 'daily' || !!thought || isSuvicharThought(message);
  const favorite = { deity: prefs.deity, frame: prefs.frame, message: prefs.message, name: prefs.name, ...(prefs.vaar ? { vaar: true as const } : {}), ...(prefs.message && thought ? { thoughtId: thought.id } : {}) };
  const savedIndex = prefs.favorites.findIndex(f => JSON.stringify(f) === JSON.stringify(favorite));
  const photoUri = useMemo(() => prefs.photo ? senderPhotoUri(prefs.photo) : null, [prefs.photo]);
  const cardPhoto = prefs.photoOn ? photoUri : null;
  const identity = JSON.stringify([prefs.deity, prefs.frame, prefs.name, cardPhoto, prefs.photoFit, message, cardTitle, attribution, width, lang, retry]);
  const ready = readyIdentity === identity;
  const update = (patch: Partial<typeof prefs>) => setPrefs(p => ({ ...p, ...patch }));
  // A weekday card keeps its message empty so it always shows the deity's thought for the current day.
  const chooseTemplate = (template: SuvicharTemplate) => update(template.kind === 'vaar' ? { deity: template.deity, frame: template.frame, message: '', thoughtId: '', vaar: true }
    : { deity: template.deity, frame: template.frame, message: contentByLang(lang, template.messageHi, template.messageEn), thoughtId: template.thoughtId ?? '', vaar: false });
  const chooseThought = (item: SuvicharThought) => update({ message: contentByLang(lang, item.hi, item.en), thoughtId: item.id });
  const chooseDeity = (deity: typeof prefs.deity) => update({ deity, ...(isSuvicharThought(prefs.message) ? { message: '', thoughtId: '' } : {}) });
  // Each mounted preview owns its readiness, so stale decode callbacks cannot unlock a replacement.
  const activeIdentity = useRef(identity); activeIdentity.current = identity;
  const onReady = useCallback((value: boolean) => { if (activeIdentity.current === identity) setReadyIdentity(value ? identity : null); }, [identity]);
  // The Daily Bhakti share flow (design.md §39.10): the provider mounts its own 540 dp
  // copy of this card, waits for its art, and offers WhatsApp (with the invite caption),
  // Instagram post / story and Send as text. The card prints its own brand and link.
  const { share: openShare, busy } = useShare();
  const share = () => {
    if (!ready || !loaded) return;
    const deity = suvicharDeities.find(d => d.id === prefs.deity)!;
    const label = cardTitle ?? tr({ hi: 'आज का सुविचार', en: 'A thought for today', gu: 'આજનો સુવિચાર', kn: 'ಇಂದಿನ ಸುವಿಚಾರ' });
    const sender = cleanSender(prefs.name);
    const card = { deity: prefs.deity, frame: prefs.frame, name: prefs.name, photo: cardPhoto, photoFit: prefs.photoFit, message, title: cardTitle, attribution, original };
    void openShare({
      kind: 'card',
      sourceId: `suvichar.${prefs.deity}`,
      width: 540,
      awaitsArt: true,
      branded: true,
      title: { hi: 'सुविचार साझा करें', en: 'Share Suvichar', gu: 'સુવિચાર શેર કરો', kn: 'ಸುವಿಚಾರ ಹಂಚಿಕೊಳ್ಳಿ' },
      tagNameHi: 'सुविचार',
      tagNameEn: 'Suvichar',
      render: ({ onReady: cardReady }) => <SuvicharCard {...card} lang={lang} width={540} onReady={cardReady} />,
      caption: () => ({ sectionName: label, label: contentByLang(lang, deity.hi, deity.en), firstLine: [message, attribution].filter(Boolean).join('\n') }),
      message: buildSuvicharShareMessage,
      text: () => [label, '', message, ...(attribution ? [attribution] : []), ...(sender ? ['', `${tr({ hi: 'सप्रेम', en: 'With love', gu: 'સપ્રેમ', kn: 'ಪ್ರೀತಿಯಿಂದ' })} — ${sender}`] : [])].join('\n'),
    }, lang);
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
    chooseThought(nextSuvicharThought(prefs.deity, message, thought?.id));
  };
  const shareOff = !ready || off;
  // The sender photo is optional and on-device only; binaries without the picker never show the control.
  const photoAvailable = isSenderPhotoAvailable();
  const choosePhoto = async () => {
    if (picking.current) return;
    picking.current = true;
    const previous = prefs.photo;
    try {
      const next = await pickSenderPhoto();
      if (next) { update({ photo: next.name, photoFit: next.fit }); if (previous) deleteSenderPhoto(previous); }
    } catch { Alert.alert(tr({ hi: 'फ़ोटो नहीं जुड़ पाई', en: 'Could not add the photo', gu: 'ફોટો ઉમેરી શકાયો નહીં', kn: 'ಫೋಟೋ ಸೇರಿಸಲಾಗಲಿಲ್ಲ' }), tr({ hi: 'कृपया दोबारा कोशिश करें।', en: 'Please try again.', gu: 'કૃપા કરીને ફરી પ્રયાસ કરો.', kn: 'ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.' })); }
    finally { picking.current = false; }
  };
  const removePhoto = () => { deleteSenderPhoto(prefs.photo); update({ photo: '', photoFit: fullPhotoFit }); };
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
        <Text style={eyebrow}>{tr({ hi: 'कार्ड चुनें', en: 'Choose a card', gu: 'કાર્ડ પસંદ કરો', kn: 'ಕಾರ್ಡ್ ಆಯ್ಕೆ ಮಾಡಿ' })}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View accessibilityRole="tablist" style={{ flexDirection: 'row', columnGap: spacing.lg }}>
            {vaar ? tab(`${tr({ hi: 'आज', en: 'Today', gu: 'આજ', kn: 'ಇಂದು' })} · ${contentByLang(lang, WEEKDAY_LABELS[now.getDay()].hi, WEEKDAY_LABELS[now.getDay()].en)}`, () => setPresetKind('vaar'), kind === 'vaar', 'suvichar-presets-vaar') : null}
            {tab(tr({ hi: 'भक्ति संदेश', en: 'Devotional cards', gu: 'ભક્તિ સંદેશ', kn: 'ಭಕ್ತಿ ಸಂದೇಶಗಳು' }), () => setPresetKind('daily'), kind === 'daily', 'suvichar-presets-daily')}
            {tab(tr({ hi: 'शुभकामनाएँ', en: 'Wishes', gu: 'શુભેચ્છાઓ', kn: 'ಶುಭಾಶಯಗಳು' }), () => setPresetKind('wish'), kind === 'wish', 'suvichar-presets-wish')}
          </View>
        </ScrollView>
        <SuvicharPresetPicker templates={kind === 'vaar' ? vaarTemplates : templates.filter(t => t.kind === kind)} lang={lang}
          selectedId={kind === 'vaar' ? (prefs.vaar ? vaarTemplates.find(t => t.deity === prefs.deity && t.frame === prefs.frame)?.id : undefined) : selectedTemplate?.id} disabled={off} onSelect={chooseTemplate} />
      </View> : <View style={{ gap: spacing.sm }}>
        <Text style={eyebrow}>{tr({ hi: 'देवता चुनें', en: 'Choose a deity', gu: 'દેવતા પસંદ કરો', kn: 'ದೇವತೆಯನ್ನು ಆಯ್ಕೆ ಮಾಡಿ' })}</Text>
        <SuvicharPresetPicker compact templates={dailyTemplates} lang={lang} selectedId={dailyTemplates.find(t => t.deity === prefs.deity)?.id} disabled={off}
          onSelect={t => chooseDeity(t.deity)} testIDFor={t => `suvichar-deity-${t.deity}`} />
      </View>}
      <View style={{ gap: spacing.sm }}>
        <Text style={eyebrow}>{tr({ hi: 'फ्रेम', en: 'Frame', gu: 'ફ્રેમ', kn: 'ಚೌಕಟ್ಟು' })}</Text>
        <SuvicharFramePicker deity={prefs.deity} frame={prefs.frame} lang={lang} disabled={off} onSelect={frame => update({ frame })} />
      </View>
      <View style={{ gap: spacing.sm }}>
        <View style={{ alignSelf: 'center', width }}><SuvicharCard key={JSON.stringify([prefs.deity, prefs.frame, retry])} deity={prefs.deity} frame={prefs.frame} name={prefs.name} photo={cardPhoto} photoFit={prefs.photoFit} onPhotoError={() => update({ photo: '', photoFit: fullPhotoFit })} message={message} title={cardTitle} lang={lang} width={width} onReady={onReady} original={original} attribution={attribution} /></View>
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
        <Pressable testID="suvichar-browse-thoughts" accessibilityRole="button" disabled={off} onPress={() => setThoughtsOpen(true)} style={{ minHeight: 44, justifyContent: 'center' }}>
          <Text style={{ fontFamily: face, fontSize: 15, color: colors.saffronDeep }}>{tr({ hi: 'सभी सुविचार देखें', en: 'Browse all thoughts', gu: 'બધા સુવિચાર જુઓ', kn: 'ಎಲ್ಲ ಸುವಿಚಾರಗಳನ್ನು ನೋಡಿ' })} · {suvicharThoughtsFor(prefs.deity).length}</Text>
        </Pressable>
        <TextInput testID="suvichar-message" accessibilityLabel={tr({ hi: 'आपका संदेश', en: 'Your message', gu: 'તમારો સંદેશ', kn: 'ನಿಮ್ಮ ಸಂದೇಶ' })} multiline value={prefs.message ? message : ''} maxLength={MESSAGE_LIMIT} editable={!busy} onChangeText={message => update({ message, thoughtId: '' })} placeholder={message} placeholderTextColor={colors.inkMuted} style={inputStyle} />
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
      {photoAvailable || prefs.photo ? <View style={{ gap: spacing.sm }}>
      <View style={{ minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
        <Text style={[eyebrow, { flex: 1 }]}>{tr({ hi: 'कार्ड पर अपनी फ़ोटो भी लगाएँ', en: 'Add your photo to the card', gu: 'કાર્ડ પર તમારો ફોટો પણ મૂકો', kn: 'ಕಾರ್ಡ್‌ನಲ್ಲಿ ನಿಮ್ಮ ಫೋಟೋ ಕೂಡ ಹಾಕಿ' })}</Text>
        <Switch testID="suvichar-photo-toggle" value={prefs.photoOn} onValueChange={photoOn => update({ photoOn })} disabled={off}
          trackColor={{ true: colors.saffron, false: colors.divider }} thumbColor={colors.onPrimary} ios_backgroundColor={colors.divider}
          accessibilityLabel={tr({ hi: 'कार्ड पर फ़ोटो चालू / बंद', en: 'Toggle photo on card', gu: 'કાર્ડ પર ફોટો ચાલુ / બંધ', kn: 'ಕಾರ್ಡ್‌ನಲ್ಲಿ ಫೋಟೋ ಆನ್ / ಆಫ್' })} />
      </View>
      {prefs.photoOn ? <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
        <Pressable testID="suvichar-photo" accessibilityRole="button" accessibilityLabel={prefs.photo ? tr({ hi: 'फ़ोटो बदलें', en: 'Change photo', gu: 'ફોટો બદલો', kn: 'ಫೋಟೋ ಬದಲಿಸಿ' }) : tr({ hi: 'अपनी फ़ोटो जोड़ें', en: 'Add your photo', gu: 'તમારો ફોટો ઉમેરો', kn: 'ನಿಮ್ಮ ಫೋಟೋ ಸೇರಿಸಿ' })}
          accessibilityState={{ disabled: off || !photoAvailable }} disabled={off || !photoAvailable} onPress={() => void choosePhoto()}
          style={({ pressed }) => ({ flex: 1, minHeight: 56, flexDirection: 'row', alignItems: 'center', gap: spacing.sm + 2, paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: radii.md, borderWidth: 1, borderStyle: 'dashed', borderColor: colors.cardActiveBorder, opacity: pressed ? 0.8 : 1 })}>
          {photoUri ? <SuvicharSenderPhoto testID="suvichar-photo-thumb" uri={photoUri} fit={prefs.photoFit} size={40} ring={1} color={colors.gold} />
            : <AppIcon name="photo" size={28} color={colors.saffronDeep} />}
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: face, fontSize: 14, lineHeight: 22, color: colors.inkSoft }}>{prefs.photo ? tr({ hi: 'फ़ोटो बदलें', en: 'Change photo', gu: 'ફોટો બદલો', kn: 'ಫೋಟೋ ಬದಲಿಸಿ' }) : tr({ hi: 'अपनी फ़ोटो जोड़ें (वैकल्पिक)', en: 'Add your photo (optional)', gu: 'તમારો ફોટો ઉમેરો (વૈકલ્પિક)', kn: 'ನಿಮ್ಮ ಫೋಟೋ ಸೇರಿಸಿ (ಐಚ್ಛಿಕ)' })}</Text>
            <Text style={hint}>{tr({ hi: 'नाम के ऊपर गोल फ़ोटो; चेहरा अपने-आप बीच में आता है', en: 'Shown round above your name; faces are centred automatically', gu: 'નામની ઉપર ગોળ ફોટો; ચહેરો આપમેળે વચ્ચે આવે છે', kn: 'ಹೆಸರಿನ ಮೇಲೆ ವೃತ್ತಾಕಾರದ ಫೋಟೋ; ಮುಖ ತಾನಾಗಿ ಮಧ್ಯಕ್ಕೆ ಬರುತ್ತದೆ' })}</Text>
          </View>
        </Pressable>
        {prefs.photo ? <Pressable testID="suvichar-photo-remove" accessibilityRole="button" accessibilityLabel={tr({ hi: 'फ़ोटो हटाएँ', en: 'Remove photo', gu: 'ફોટો દૂર કરો', kn: 'ಫೋಟೋ ತೆಗೆದುಹಾಕಿ' })} disabled={off} onPress={removePhoto}
          style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}><AppIcon name="close" size={18} color={colors.inkMuted} /></Pressable> : null}
      </View> : null}
      </View> : null}
      {prefs.favorites.length ? <View style={{ gap: spacing.sm }}>
        <Text style={eyebrow}>{myFavorites}</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
          {prefs.favorites.map((f, i) => chip(`${contentByLang(lang, suvicharDeities.find(d => d.id === f.deity)!.hi, suvicharDeities.find(d => d.id === f.deity)!.en)} · ${f.name || contentByLang(lang, 'सुविचार', 'Suvichar')}`, () => update({ ...f, thoughtId: f.thoughtId ?? '', vaar: f.vaar === true }), `suvichar-saved-${i}`))}
        </View>
      </View> : null}
    </ScrollView>}
    {loaded ? <View style={{ flexDirection: 'row', gap: spacing.sm + 2, paddingHorizontal: spacing.lg, paddingTop: spacing.sm + 2, paddingBottom: spacing.md, backgroundColor: colors.parchmentSoft, borderTopWidth: StyleSheet.hairlineWidth, borderColor: colors.divider }}>
      <Pressable testID="suvichar-favorite" accessibilityRole="button" accessibilityLabel={savedIndex >= 0 ? tr({ hi: 'पसंदीदा से हटाएँ', en: 'Remove favorite', gu: 'પસંદમાંથી દૂર કરો', kn: 'ಮೆಚ್ಚಿನವುಗಳಿಂದ ತೆಗೆದುಹಾಕಿ' }) : tr({ hi: 'पसंदीदा में रखें', en: 'Save favorite', gu: 'પસંદમાં રાખો', kn: 'ಮೆಚ್ಚಿನದಾಗಿ ಉಳಿಸಿ' })}
        accessibilityState={{ selected: savedIndex >= 0, disabled: off }} disabled={off} onPress={() => setPrefs(p => ({ ...p, favorites: savedIndex >= 0 ? p.favorites.filter((_, i) => i !== savedIndex) : [...p.favorites.slice(-49), favorite] }))}
        style={({ pressed }) => ({ width: 52, height: 52, alignItems: 'center', justifyContent: 'center', borderRadius: radii.md, borderWidth: 1, borderColor: colors.cardActiveBorder, backgroundColor: colors.cardActiveFrom, opacity: pressed ? 0.85 : 1 })}>
        <AppIcon name="heart" color={colors.saffronDeep} weight={savedIndex >= 0 ? 'fill' : 'regular'} />
      </Pressable>
      <Pressable testID="suvichar-share" accessibilityRole="button" accessibilityState={{ disabled: shareOff, busy }} disabled={shareOff} onPress={share}
        style={({ pressed }) => ({ flex: 1, height: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm + 2, borderRadius: radii.md, backgroundColor: colors.saffronDeep,
          opacity: shareOff && !busy ? 0.55 : pressed ? 0.88 : 1, shadowColor: colors.saffronDeep, shadowOpacity: 0.25, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, ...androidBoxShadow(3, 8, 'rgba(138, 62, 11, 0.25)') })}>
        {busy ? <ActivityIndicator color={colors.parchmentSoft} /> : <AppIcon name="share" size={20} color={colors.parchmentSoft} />}
        <Text style={{ fontFamily: face, fontSize: 17, lineHeight: 26, color: colors.parchmentSoft }}>{tr({ hi: 'साझा करें', en: 'Share', gu: 'શેર કરો', kn: 'ಹಂಚಿಕೊಳ್ಳಿ' })}</Text>
      </Pressable>
    </View> : null}
    <SuvicharThoughtPicker visible={thoughtsOpen} deity={prefs.deity} lang={lang} selectedId={thought?.id} onClose={() => setThoughtsOpen(false)} onSelect={chooseThought} />
  </SafeAreaView>;
}
