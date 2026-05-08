import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '@/theme/ThemeContext';
import { useGitaLanguage } from '@/data/gita/language';
import { useBookmarks, type BookmarkRef } from '@/contexts/BookmarksContext';
import { library } from '@/data/texts';
import { buildWishlistNavigationTarget } from '@/navigation/wishlistRoutes';
import type { MoreStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<MoreStackParamList, 'Wishlist'>;

function getSourceLabel(bm: BookmarkRef): string {
  const entry = library.find((e) => e.id === bm.sourceId);
  if (!entry) return bm.sourceId;
  return entry.nameHi;
}

function getVerseLabel(bm: BookmarkRef): string {
  const parts = bm.id.split(':');
  if (bm.sourceId === 'bhagavad-gita') {
    return `श्लोक ${parts[1]}.${Number(parts[2]) + 1}`;
  }
  if (bm.sourceId === 'shiva-strotam') {
    return `श्लोक ${parts[1]}.${Number(parts[2]) + 1}`;
  }
  return `verse ${bm.verseIndex + 1}`;
}

export default function WishlistScreen({ navigation }: Props) {
  const { colors, typography, spacing } = useTheme();
  const { lang } = useGitaLanguage();
  const { bookmarks, removeBookmark } = useBookmarks();
  const rootNav = useNavigation<any>();

  const handlePress = (bm: BookmarkRef) => {
    rootNav.navigate('HomeTab', buildWishlistNavigationTarget(bm));
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
            hitSlop={16}
            style={[styles.backBtn, { backgroundColor: colors.parchmentSoft, borderColor: colors.divider }]}
          >
            <Text style={{ color: colors.inkSoft, fontSize: 18 }}>‹</Text>
          </Pressable>
          <Text style={{ fontFamily: typography.readerTitle.fontFamily, fontSize: 16, color: colors.ink }}>
            Wishlist
          </Text>
        </View>

        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingHorizontal: spacing.xxl }]}
          showsVerticalScrollIndicator={false}
        >
          {bookmarks.length === 0 ? (
            <View style={styles.empty}>
              <Text style={{ fontFamily: typography.readerTitle.fontFamily, fontSize: 24, color: colors.inkMuted, opacity: 0.4 }}>॥</Text>
              <Text style={{ fontFamily: typography.meaning.fontFamily, fontSize: 15, color: colors.inkMuted, textAlign: 'center', marginTop: 12 }}>
                अभी तक कोई श्लोक सहेजा नहीं
              </Text>
              <Text style={{ fontFamily: 'CormorantGaramond_400Regular_Italic', fontSize: 14, color: colors.inkMuted, textAlign: 'center', marginTop: 4 }}>
                No verses saved yet
              </Text>
              <Text style={{ fontFamily: 'CormorantGaramond_400Regular_Italic', fontSize: 12, color: colors.inkMuted, textAlign: 'center', marginTop: 8, opacity: 0.6 }}>
                Tap the ♡ icon while reading to save verses
              </Text>
            </View>
          ) : (
            bookmarks.map((bm) => (
              <Pressable
                key={bm.id}
                onPress={() => handlePress(bm)}
                style={({ pressed }) => [
                  styles.bmCard,
                  { backgroundColor: colors.parchmentSoft, borderColor: colors.divider },
                  pressed && { opacity: 0.8 },
                ]}
              >
                <View style={styles.bmContent}>
                  <Text
                    style={{ fontFamily: typography.verse.fontFamily, fontSize: 14, color: colors.ink, lineHeight: 22 }}
                    numberOfLines={2}
                  >
                    {lang === 'hi' ? bm.previewHi : bm.previewEn}
                  </Text>
                  <View style={styles.bmMeta}>
                    <Text style={[styles.bmPill, { color: colors.saffronDeep, backgroundColor: 'rgba(184, 98, 27, 0.08)' }]}>
                      {getVerseLabel(bm)}
                    </Text>
                    <Text style={{ fontFamily: 'CormorantGaramond_400Regular_Italic', fontSize: 12, color: colors.inkMuted }}>
                      {getSourceLabel(bm)}
                    </Text>
                  </View>
                </View>
                <Pressable onPress={() => removeBookmark(bm.id)} hitSlop={8}>
                  <Text style={{ color: colors.saffron, fontSize: 14 }}>♥</Text>
                </Pressable>
                <Text style={{ color: colors.saffron, fontSize: 18 }}>›</Text>
              </Pressable>
            ))
          )}
        </ScrollView>
      </SafeAreaView>
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
  bmPill: { fontSize: 10, fontFamily: 'CormorantGaramond_600SemiBold', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999, overflow: 'hidden' },
});
