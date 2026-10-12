import React, { useState } from 'react';
import { View, Text, ActivityIndicator, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import ReaderHeader from '@/components/ReaderHeader';
import { useGitaLanguage } from '@/data/gita/language';
import { useTheme } from '@/theme/ThemeContext';
import { pick } from '@/utils/localize';
import { titleFontByLang } from '@/utils/langType';
import { comicById } from '@/data/comics';
import type { HomeStackParamList } from '@/navigation/types';

/**
 * Hosts a CDN-hosted comic reader (self-contained HTML/JS) inside a WebView.
 * The reader bundle lives on the R2 CDN; we only load its index.html by https
 * URL, so its relative fetches (book.json, page art) resolve against the CDN.
 */
export default function ComicReaderScreen({
  route,
  navigation,
}: NativeStackScreenProps<HomeStackParamList, 'ComicReader'>) {
  const { lang } = useGitaLanguage();
  const { colors } = useTheme();
  const [failed, setFailed] = useState(false);
  const comic = comicById(route.params.comicId);

  const title = comic ? pick(lang, comic.title) : '';
  const errorText = pick(lang, {
    hi: 'कॉमिक अभी लोड नहीं हो सका।',
    en: 'Could not load the comic.',
    gu: 'કોમિક અત્યારે લોડ થઈ શક્યું નહીં.',
    kn: 'ಕಾಮಿಕ್ ಈಗ ಲೋಡ್ ಆಗಲಿಲ್ಲ.',
  });
  const retryText = pick(lang, { hi: 'पुनः प्रयास करें', en: 'Try again', gu: 'ફરી પ્રયાસ કરો', kn: 'ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ' });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.parchment }} edges={['top', 'left', 'right']}>
      <ReaderHeader title={title} onBack={() => navigation.goBack()} variant="index" />
      {!comic || failed ? (
        <View style={styles.center} testID="comic-reader-error">
          <Text style={{ color: colors.inkSoft, fontFamily: titleFontByLang(lang), fontSize: 17, textAlign: 'center' }}>
            {errorText}
          </Text>
          {comic && (
            <Pressable
              testID="comic-reader-retry"
              onPress={() => setFailed(false)}
              style={[styles.retry, { backgroundColor: colors.saffron }]}
            >
              <Text style={{ color: '#fff', fontFamily: titleFontByLang(lang), fontSize: 15 }}>{retryText}</Text>
            </Pressable>
          )}
        </View>
      ) : (
        <WebView
          testID="comic-reader-webview"
          source={{ uri: comic.url }}
          onError={() => setFailed(true)}
          onHttpError={() => setFailed(true)}
          startInLoadingState
          renderLoading={() => (
            <View style={styles.center}>
              <ActivityIndicator color={colors.saffron} />
            </View>
          )}
          style={{ flex: 1, backgroundColor: colors.parchment }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24 },
  retry: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 999 },
});
