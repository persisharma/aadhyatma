import React, { useState } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '@/theme/ThemeContext';
import { useGitaLanguage, type Lang } from '@/data/gita/language';
import { fontFamilies } from '@/theme/typography';
import { contentByLang, pick } from '@/utils/localize';
import { useBookmarks, type BookmarkRef } from '@/contexts/BookmarksContext';
import { library } from '@/data/texts';
import { aartiCollection, aartiIndexById } from '@/data/aarti';
import { findJapamMantra } from '@/data/japam';
import { canonicalSourceId } from '@/data/sourceIdMigration';
import { titleFontByLang } from '@/utils/langType';
import { buildBookmarkTarget } from '@/navigation/entryRoutes';
import type { MoreStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<MoreStackParamList, 'Wishlist'>;

function getSourceLabel(bm: BookmarkRef, lang: Lang): string {
  const sourceId = canonicalSourceId(bm.sourceId);

  // Library entries (chalisas, granths, stotrams)
  const entry = library.find((e) => e.id === sourceId);
  if (entry) return contentByLang(lang, entry.nameHi, entry.nameEn);

  // Aartis (canonical id is the library id; fallback by index)
  const aartiIndex = aartiIndexById[sourceId as keyof typeof aartiIndexById];
  if (aartiIndex != null) {
    const aarti = aartiCollection[aartiIndex];
    if (aarti) return contentByLang(lang, aarti.titleHi, aarti.titleEn);
  }

  // Japam mantras (rarely bookmarked, but cover the case)
  const mantra = findJapamMantra(sourceId);
  if (mantra) return contentByLang(lang, mantra.nameHi, mantra.nameEn);

  return sourceId;
}

function getVerseLabel(bm: BookmarkRef, lang: Lang): string {
  const parts = bm.id.split(':');
  if (bm.sourceId === 'bhagavad-gita' || bm.sourceId === 'shiva-strotam') {
    const ref = `${parts[1]}.${Number(parts[2]) + 1}`;
    return contentByLang(lang, `श्लोक ${ref}`, `Shloka ${ref}`);
  }
  const n = bm.verseIndex + 1;
  return contentByLang(lang, `श्लोक ${n}`, `Verse ${n}`);
}

export default function WishlistScreen({ navigation }: Props) {
  const { colors, typography, spacing, radii } = useTheme();
  const { lang } = useGitaLanguage();
  // null for hi/en → callers fall back to the original font (byte-identical); the
  // bundled Noto serif for gu/kn so transliterated text renders in-script.
  const scriptSerif = lang === 'gu' ? fontFamilies.gujarati : lang === 'kn' ? fontFamilies.kannada : null;
  const scriptSerifBold =
    lang === 'gu' ? fontFamilies.gujaratiBold : lang === 'kn' ? fontFamilies.kannadaBold : null;
  const removeLabel = pick(lang, { hi: 'हटायें', en: 'Remove', gu: 'દૂર કરો', kn: 'ತೆಗೆದುಹಾಕಿ' });
  const cancelLabel = pick(lang, { hi: 'रद्द करें', en: 'Cancel', gu: 'રદ કરો', kn: 'ರದ್ದುಮಾಡಿ' });
  const { bookmarks, isLoading, removeBookmark } = useBookmarks();
  const rootNav = useNavigation<any>();
  const [pendingRemoveId, setPendingRemoveId] = useState<string | null>(null);

  const handlePress = (bm: BookmarkRef) => {
    const target = buildBookmarkTarget(bm);
    if (!target) return;
    rootNav.navigate('HomeTab', target);
  };

  const confirmRemove = () => {
    if (pendingRemoveId) {
      removeBookmark(pendingRemoveId);
      setPendingRemoveId(null);
    }
  };

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[colors.parchmentHighlight, colors.parchmentGradientEnd]}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <View style={[styles.topBar, { paddingHorizontal: spacing.xxl }]}>
          <Pressable
            onPress={() => navigation.goBack()}
            accessibilityRole="button"
            accessibilityLabel="Back"
            hitSlop={16}
            style={({ pressed }) => [
              styles.backBtn,
              { backgroundColor: colors.parchmentSoft, borderColor: colors.divider },
              pressed && { opacity: 0.7 },
            ]}
          >
            <Text style={{ color: colors.inkSoft, fontSize: 18 }}>‹</Text>
          </Pressable>
          <View>
            <Text
              style={{
                fontFamily: titleFontByLang(lang),
                fontSize: 16,
                fontStyle: lang === 'en' ? 'italic' : 'normal',
                color: colors.ink,
              }}
            >
              {pick(lang, { hi: 'संग्रह', en: 'Saved Verses', gu: 'સંગ્રહ', kn: 'ಸಂಗ್ರಹ' })}
            </Text>
            <Text
              style={{
                fontFamily:
                  lang === 'en' ? typography.meaning.fontFamily : fontFamilies.latinItalic,
                fontStyle: lang === 'en' ? 'normal' : 'italic',
                fontSize: 11,
                color: colors.inkMuted,
              }}
            >
              {lang === 'en' ? 'संग्रह' : 'Saved Verses'}
            </Text>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingHorizontal: spacing.xxl }]}
          showsVerticalScrollIndicator={false}
        >
          {isLoading ? (
            <View style={styles.empty}>
              <ActivityIndicator color={colors.saffron} />
            </View>
          ) : bookmarks.length === 0 ? (
            <View style={styles.empty}>
              <Text style={{ fontFamily: typography.readerTitle.fontFamily, fontSize: 24, color: colors.inkMuted, opacity: 0.4 }}>॥</Text>
              <Text style={{ fontFamily: scriptSerif ?? typography.meaning.fontFamily, fontSize: 15, color: colors.inkMuted, textAlign: 'center', marginTop: 12 }}>
                {contentByLang(lang, 'अभी तक कोई श्लोक सहेजा नहीं', 'अभी तक कोई श्लोक सहेजा नहीं')}
              </Text>
              <Text style={{ fontFamily: fontFamilies.latinItalic, fontSize: 14, color: colors.inkMuted, textAlign: 'center', marginTop: 4 }}>
                No verses saved yet
              </Text>
              <Text style={{ fontFamily: fontFamilies.latinItalic, fontSize: 12, color: colors.inkMuted, textAlign: 'center', marginTop: 8, opacity: 0.6 }}>
                Tap the ♡ icon while reading to save verses
              </Text>
            </View>
          ) : (
            bookmarks.map((bm) => (
              <Pressable
                key={bm.id}
                onPress={() => handlePress(bm)}
                accessibilityRole="button"
                accessibilityLabel={`${getSourceLabel(bm, lang)}, ${getVerseLabel(bm, lang)}`}
                style={({ pressed }) => [
                  styles.bmCard,
                  { backgroundColor: colors.parchmentSoft, borderColor: colors.divider },
                  pressed && { opacity: 0.85 },
                ]}
              >
                <View style={styles.bmContent}>
                  <Text
                    style={{ fontFamily: scriptSerif ?? typography.verse.fontFamily, fontSize: 14, color: colors.ink, lineHeight: 22 }}
                    numberOfLines={2}
                  >
                    {contentByLang(lang, bm.previewHi, bm.previewEn)}
                  </Text>
                  <View style={styles.bmMeta}>
                    <View style={[styles.bmPillWrap, { backgroundColor: 'rgba(184, 98, 27, 0.14)' }]}>
                      <Text style={[styles.bmPillText, { color: colors.saffronDeep }]}>
                        {getVerseLabel(bm, lang)}
                      </Text>
                    </View>
                    <Text style={{ fontFamily: fontFamilies.latinItalic, fontSize: 12, color: colors.inkMuted }}>
                      {getSourceLabel(bm, lang)}
                    </Text>
                  </View>
                </View>
                <Pressable
                  onPress={() => setPendingRemoveId(bm.id)}
                  accessibilityRole="button"
                  accessibilityLabel="Remove from wishlist"
                  hitSlop={12}
                  style={({ pressed }) => [styles.removeBtn, pressed && { opacity: 0.6 }]}
                >
                  <Text style={{ color: colors.saffron, fontSize: 18 }}>♥</Text>
                </Pressable>
                <Text
                  accessible={false}
                  importantForAccessibility="no"
                  style={{ color: colors.saffron, fontSize: 18, includeFontPadding: false }}
                >
                  ›
                </Text>
              </Pressable>
            ))
          )}
        </ScrollView>
      </SafeAreaView>

      <Modal
        visible={pendingRemoveId !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setPendingRemoveId(null)}
      >
        <Pressable
          style={[styles.backdrop, { backgroundColor: colors.modalBackdrop }]}
          onPress={() => setPendingRemoveId(null)}
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
            style={[
              styles.confirmCard,
              { backgroundColor: colors.parchment, borderColor: colors.cardActiveBorder, borderRadius: radii.lg },
            ]}
          >
            <Text style={[styles.confirmTitle, { color: colors.ink, fontFamily: scriptSerifBold ?? typography.readerTitle.fontFamily }]}>
              {pick(lang, {
                hi: 'विशलिस्ट से हटायें?',
                en: 'Remove from wishlist?',
                gu: 'વિશલિસ્ટમાંથી દૂર કરવું?',
                kn: 'ವಿಶ್‌ಲಿಸ್ಟ್‌ನಿಂದ ತೆಗೆದುಹಾಕಬೇಕೆ?',
              })}
            </Text>
            <Text style={[styles.confirmBody, { color: colors.inkSoft, fontFamily: lang === 'en' ? typography.cardLatin.fontFamily : (scriptSerif ?? typography.meaning.fontFamily) }]}>
              {pick(lang, {
                hi: 'यह श्लोक विशलिस्ट से हटा दिया जायेगा।',
                en: 'This verse will be removed from your wishlist.',
                gu: 'આ શ્લોક તમારી વિશલિસ્ટમાંથી દૂર કરવામાં આવશે.',
                kn: 'ಈ ಶ್ಲೋಕವನ್ನು ನಿಮ್ಮ ವಿಶ್‌ಲಿಸ್ಟ್‌ನಿಂದ ತೆಗೆದುಹಾಕಲಾಗುತ್ತದೆ.',
              })}
            </Text>
            <Pressable
              onPress={confirmRemove}
              accessibilityRole="button"
              accessibilityLabel={removeLabel}
              style={({ pressed }) => [
                styles.confirmPrimary,
                { backgroundColor: colors.saffron, borderRadius: radii.md },
                pressed && { opacity: 0.85 },
              ]}
            >
              <Text style={[styles.confirmPrimaryText, { color: colors.onPrimary ?? '#fff', fontFamily: scriptSerifBold ?? typography.readerTitle.fontFamily }]}>
                {removeLabel}
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setPendingRemoveId(null)}
              accessibilityRole="button"
              accessibilityLabel={cancelLabel}
              style={({ pressed }) => [styles.confirmCancel, pressed && { opacity: 0.6 }]}
              hitSlop={8}
            >
              <Text style={[styles.confirmCancelText, { color: colors.inkMuted, fontFamily: lang === 'en' ? typography.cardLatin.fontFamily : (scriptSerif ?? typography.meaning.fontFamily) }]}>
                {cancelLabel}
              </Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  topBar: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, gap: 12 },
  backBtn: { width: 44, height: 44, borderRadius: 22, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  scroll: { paddingTop: 8, paddingBottom: 40, gap: 10 },
  empty: { alignItems: 'center', justifyContent: 'center', paddingTop: 80 },
  bmCard: { borderRadius: 14, borderWidth: 1, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 10 },
  bmContent: { flex: 1, minWidth: 0 },
  bmMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 },
  bmPillWrap: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999 },
  bmPillText: { fontSize: 10, fontFamily: fontFamilies.latinSemiBold },
  removeBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  backdrop: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 },
  confirmCard: { width: '100%', maxWidth: 360, borderWidth: 1, paddingVertical: 22, paddingHorizontal: 22 },
  confirmTitle: { fontSize: 18, textAlign: 'center' },
  confirmBody: { marginTop: 10, fontSize: 13, fontStyle: 'italic', textAlign: 'center' },
  confirmPrimary: { marginTop: 18, paddingVertical: 13, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  confirmPrimaryText: { fontSize: 15 },
  confirmCancel: { marginTop: 10, paddingVertical: 12, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  confirmCancelText: { fontSize: 13, fontStyle: 'italic', opacity: 0.85 },
});
