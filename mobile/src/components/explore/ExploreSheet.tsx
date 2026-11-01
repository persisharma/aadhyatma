import React, { useRef, useState } from 'react';
import { AccessibilityInfo, findNodeHandle, Image, KeyboardAvoidingView, Modal, PanResponder, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/theme/ThemeContext';
import { useGitaLanguage } from '@/data/gita/language';
import { contentByLang, pick } from '@/utils/localize';
import { meaningToken, titleFontByLang } from '@/utils/langType';
import { useReducedMotion } from '@/utils/useReducedMotion';
import { EXPLORE_ART } from '@/data/discovery/artwork';
import type { ExploreSection } from '@/data/discovery/sections';
import AppIcon from '@/components/AppIcon';
import TextField from '@/components/TextField';
export default function ExploreSheet({ section, onDismiss, onOpen, onDisable }: {
    section: ExploreSection;
    onDismiss: () => void;
    onOpen: (name: string) => void;
    onDisable: () => void;
}) {
    const { colors, typography } = useTheme(), { lang } = useGitaLanguage();
    const reduced = useReducedMotion();
    const [name, setName] = useState('');
    const heading = useRef<Text>(null), dismiss = useRef(onDismiss);
    dismiss.current = onDismiss;
    const pan = useRef(PanResponder.create({ onMoveShouldSetPanResponder: (_, g) => g.dy > 8 && Math.abs(g.dy) > Math.abs(g.dx), onPanResponderRelease: (_, g) => { if (g.dy > 55 || g.vy > .8)
            dismiss.current(); } })).current;
    const tr = (p: readonly [
        string,
        string
    ]) => contentByLang(lang, p[0], p[1]);
    const body = meaningToken(lang, typography);
    const title = { ...typography.practiceHeroTitle, fontFamily: titleFontByLang(lang), color: colors.ink };
    const text = { fontFamily: body.fontFamily, fontSize: typography.practiceItemTitle.fontSize, lineHeight: typography.practiceItemTitle.lineHeight, color: colors.inkSoft };
    const small = { fontFamily: body.fontFamily, fontSize: typography.practiceItemMeta.fontSize, lineHeight: typography.practiceItemMeta.lineHeight, color: colors.inkMuted };
    const notNow = pick(lang, { hi: 'अभी नहीं', en: 'Not now', gu: 'હમણાં નહીં', kn: 'ಈಗ ಬೇಡ' });
    const label = pick(lang, { hi: 'वेदांश में और भी', en: 'More to discover', gu: 'વેદાંશમાં વધુ જાણો', kn: 'ವೈದಾಂಶದಲ್ಲಿ ಇನ್ನಷ್ಟು' });
    return <Modal visible transparent animationType={reduced ? 'none' : 'slide'} onRequestClose={onDismiss} statusBarTranslucent onShow={() => { const node = findNodeHandle(heading.current); if (node)
        AccessibilityInfo.setAccessibilityFocus(node); }}>
  <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.overlay}>
   <Pressable accessible={false} importantForAccessibility="no" onPress={onDismiss} style={[StyleSheet.absoluteFill, { backgroundColor: colors.modalBackdrop }]} testID="explore-backdrop"/>
   <SafeAreaView edges={['left', 'right', 'bottom']} accessibilityViewIsModal style={[styles.sheet, { backgroundColor: colors.parchmentHighlight }]}>
    <View {...pan.panHandlers} style={styles.handleTarget}><View style={[styles.handle, { backgroundColor: colors.gold }]}/></View>
    <ScrollView keyboardShouldPersistTaps="handled" bounces={false} contentContainerStyle={styles.scroll}>
     {section.kind === 'wish' ? <View style={[styles.wishHero, { backgroundColor: colors.parchmentDeep }]}>
      <Text style={[small, { marginBottom: 10, color: colors.saffronDeep }]}>{label}</Text>
      <View style={[styles.wishCard, { borderColor: colors.gold, backgroundColor: colors.parchmentHighlight }]}>
       <Image source={EXPLORE_ART.suvichar} resizeMode="contain" style={styles.wishArt} accessible={false}/>
       <View style={styles.wishCopy}><Text style={small}>{tr(['वेदांश', 'Vedansh'])}</Text><Text style={[title, { fontSize: typography.practiceItemTitle.fontSize }]}>{tr(['जय श्री राम', 'Jai Shri Ram'])}</Text><Text style={small}>{pick(lang, { hi: 'श्री राम का आशीर्वाद आपके जीवन में सुख और शांति लाए।', en: 'May Shri Ram bless your life with peace and joy.', gu: 'શ્રી રામના આશીર્વાદ તમારા જીવનમાં સુખ અને શાંતિ લાવે.', kn: 'ಶ್ರೀರಾಮನ ಆಶೀರ್ವಾದ ನಿಮ್ಮ ಜೀವನದಲ್ಲಿ ಸುಖ ಮತ್ತು ಶಾಂತಿಯನ್ನು ತರಲಿ.' })}</Text><Text testID="explore-greeting-signature" style={[small, { color: colors.saffronDeep }]}>{name.trim() || pick(lang, { hi: 'आपका नाम', en: 'Your name', gu: 'તમારું નામ', kn: 'ನಿಮ್ಮ ಹೆಸರು' })}</Text></View>
      </View>
     </View> : <View style={styles.hero}><Image testID={`explore-art-${section.id}`} source={EXPLORE_ART[section.id]} style={styles.heroImage} resizeMode="cover" accessible={false}/><LinearGradient pointerEvents="none" colors={['transparent', colors.parchmentHighlight]} style={styles.fade}/><Text style={[small, styles.heroLabel, { backgroundColor: colors.parchmentHighlight, color: colors.saffronDeep }]}>{label}</Text></View>}
     <View style={styles.copy}>
      <Text style={[small, { color: colors.saffronDeep }]}>{tr(section.title)}</Text><Text ref={heading} testID="explore-heading" accessibilityRole="header" style={title}>{tr(section.hook)}</Text><Text style={[text, { marginTop: 6 }]}>{tr(section.description)}</Text>
      <View style={[styles.preview, { backgroundColor: colors.parchment, borderColor: colors.divider }]}>
       {section.kind === 'wish' ? <><Text style={small}>{pick(lang, { hi: 'कार्ड पर आपका नाम', en: 'Your name on the card', gu: 'કાર્ડ પર તમારું નામ', kn: 'ಕಾರ್ಡ್‌ನಲ್ಲಿ ನಿಮ್ಮ ಹೆಸರು' })}</Text><TextField testID="explore-sender-name" variant="form" value={name} onChangeText={setName} maxLength={24} accessibilityLabel={pick(lang, { hi: 'आपका नाम', en: 'Your name', gu: 'તમારું નામ', kn: 'ನಿಮ್ಮ ಹೆಸರು' })}/></> :
            section.kind === 'steps' ? <View style={styles.steps}>{section.examples.map((e, i) => <View key={e[1]} style={styles.step}><Text style={[small, { color: colors.saffronDeep }]}>{i + 1}</Text><Text style={small}>{tr(e)}</Text></View>)}</View> :
                section.kind === 'chips' ? <View style={styles.chips}>{section.examples.map(e => <Pressable key={e[1]} accessibilityRole="button" onPress={() => onOpen(name)} style={[styles.chip, { borderColor: colors.divider }]}><Text style={small}>{tr(e)}</Text></Pressable>)}</View> :
                    <Pressable accessibilityRole="button" onPress={() => onOpen(name)} style={styles.row}><Image source={EXPLORE_ART[section.id]} style={styles.thumb} accessible={false}/><View style={styles.grow}>{section.examples.slice(0, section.kind === 'widgets' ? 2 : 1).map(e => <Text key={e[1]} style={text}>{tr(e)}</Text>)}{section.kind === 'mala' && <Text style={small}>{tr(['108 मनकों की माला', '108-bead mala'])}</Text>}{section.kind === 'days' && <Text style={small}>{tr(['प्रतिदिन का पाठ और प्रगति', 'Daily readings and progress'])}</Text>}</View><AppIcon name="next" size={18}/></Pressable>}
      </View>
     </View>
    </ScrollView>
    <View style={styles.footer}><Pressable testID="explore-open" accessibilityRole="button" onPress={() => onOpen(name.trim())} style={[styles.primary, { backgroundColor: colors.saffronDeep }]}><Text style={[text, { color: colors.parchmentHighlight, textAlign: 'center', flexShrink: 1 }]}>{tr(section.cta)}</Text><AppIcon name="next" size={20} color={colors.parchmentHighlight}/></Pressable><Pressable testID="explore-not-now" accessibilityRole="button" accessibilityLabel="Not now" onPress={onDismiss} style={styles.secondary}><Text style={small}>{notNow}</Text></Pressable><Pressable testID="explore-disable" accessibilityRole="button" onPress={onDisable} style={styles.secondary}><Text style={small}>{pick(lang, { hi: 'ऐसे सुझाव बंद करें', en: 'Turn off suggestions', gu: 'આવા સૂચનો બંધ કરો', kn: 'ಇಂತಹ ಸಲಹೆಗಳನ್ನು ನಿಲ್ಲಿಸಿ' })}</Text></Pressable></View>
    <Pressable accessibilityRole="button" accessibilityLabel={notNow} onPress={onDismiss} style={[styles.close, { backgroundColor: colors.parchmentHighlight }]}><AppIcon name="close" size={20}/></Pressable>
   </SafeAreaView>
  </KeyboardAvoidingView>
 </Modal>;
}
const styles = StyleSheet.create({ overlay: { flex: 1, justifyContent: 'flex-end' }, sheet: { maxHeight: '88%', borderTopLeftRadius: 28, borderTopRightRadius: 28, overflow: 'hidden' }, handleTarget: { height: 24, alignItems: 'center', justifyContent: 'center' }, handle: { height: 4, width: 36, borderRadius: 4 }, scroll: { paddingBottom: 8 }, hero: { height: 190, overflow: 'hidden' }, heroImage: { width: '100%', height: '100%' }, fade: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 58 }, heroLabel: { position: 'absolute', bottom: 10, left: 24, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 14 }, close: { position: 'absolute', right: 14, top: 25, width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' }, copy: { paddingHorizontal: 24, paddingTop: 4 }, preview: { borderWidth: 1, borderRadius: 16, padding: 13, marginTop: 14 }, row: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 50 }, thumb: { width: 52, height: 52, borderRadius: 12 }, grow: { flex: 1 }, footer: { paddingHorizontal: 24, paddingTop: 8, paddingBottom: 4 }, primary: { minHeight: 52, padding: 12, borderRadius: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }, secondary: { minHeight: 44, alignItems: 'center', justifyContent: 'center', paddingVertical: 7 }, chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, chip: { minHeight: 44, borderWidth: 1, borderRadius: 12, padding: 10 }, steps: { flexDirection: 'row', gap: 12 }, step: { flex: 1, gap: 7 }, wishHero: { padding: 24, paddingTop: 4 }, wishCard: { borderWidth: 1, borderRadius: 10, flexDirection: 'row', overflow: 'hidden' }, wishArt: { width: '50%', minHeight: 170 }, wishCopy: { width: '50%', padding: 12, gap: 6 } });
