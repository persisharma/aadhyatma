import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/theme/ThemeContext';
import { useGitaLanguage } from '@/data/gita/language';
import { getKathaLibrary } from '@/panchang/vratCatalog';
import type { PanchangStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<PanchangStackParamList, 'KathaLibrary'>;

export default function KathaLibraryScreen({ navigation }: Props) {
  const { colors, typography, spacing, radii } = useTheme();
  const { lang } = useGitaLanguage();
  const isHindi = lang === 'hi';
  const rootNav = useNavigation<any>();
  const [query, setQuery] = useState('');

  const library = useMemo(() => getKathaLibrary(), []);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return library;
    return library.filter((k) => `${k.titleHi} ${k.titleEn}`.toLowerCase().includes(q));
  }, [library, query]);

  const openKatha = (kathaId: string) => {
    rootNav.navigate('HomeTab', { screen: 'VratKathaReader', params: { kathaId } });
  };

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[colors.parchmentHighlight, colors.parchmentGradientEnd]}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <View style={styles.topBar}>
          <Pressable
            onPress={() => navigation.goBack()}
            accessibilityRole="button"
            accessibilityLabel={isHindi ? 'वापस' : 'Back'}
            hitSlop={12}
            style={({ pressed }) => [styles.backButton, { borderColor: colors.divider }, pressed && { opacity: 0.6 }]}
          >
            <Text style={{ color: colors.inkSoft, fontSize: 20 }}>‹</Text>
          </Pressable>
          <View style={{ alignItems: 'center' }}>
            <Text style={{ fontFamily: typography.readerTitle.fontFamily, fontSize: 16, color: colors.ink }}>
              {isHindi ? 'कथा संग्रह' : 'Katha Library'}
            </Text>
            <Text style={{ fontFamily: 'CormorantGaramond_400Regular_Italic', fontSize: 11, color: colors.inkMuted }}>
              {isHindi ? 'Katha Library' : 'कथा संग्रह'} · {library.length}
            </Text>
          </View>
          <View style={{ width: 36 }} />
        </View>

        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingHorizontal: spacing.xxl }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder={isHindi ? 'कथाएँ खोजें…' : 'Search stories…'}
            placeholderTextColor={colors.inkMuted}
            style={[styles.search, { backgroundColor: colors.parchmentSoft, borderColor: colors.divider, borderRadius: radii.md, color: colors.ink }]}
          />

          {filtered.map((katha) => (
            <Pressable
              key={katha.id}
              onPress={() => openKatha(katha.id)}
              accessibilityRole="button"
              accessibilityLabel={`Read katha ${katha.titleEn}`}
              style={({ pressed }) => [styles.row, { borderBottomColor: colors.divider }, pressed && { opacity: 0.6 }]}
            >
              <Text style={{ fontSize: 18, color: colors.saffron, marginRight: 12 }}>॥</Text>
              <View style={{ flex: 1, paddingRight: 10 }}>
                <Text style={{ fontFamily: typography.readerTitle.fontFamily, fontSize: 15, color: colors.ink }}>
                  {isHindi ? katha.titleHi : katha.titleEn}
                </Text>
                <Text style={{ fontFamily: 'CormorantGaramond_400Regular_Italic', fontSize: 12, color: colors.inkMuted, marginTop: 1 }}>
                  {isHindi ? katha.titleEn : katha.titleHi} · {katha.sections.length} {isHindi ? 'खंड' : 'sections'}
                </Text>
              </View>
              <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 11, color: colors.saffronDeep }}>
                {isHindi ? 'पढ़ें' : 'Read'}
              </Text>
            </Pressable>
          ))}
          {filtered.length === 0 && (
            <Text style={{ fontFamily: typography.meaning.fontFamily, fontSize: 13, color: colors.inkMuted, marginTop: 24, textAlign: 'center' }}>
              {isHindi ? 'कोई कथा नहीं मिली।' : 'No stories found.'}
            </Text>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 8 },
  backButton: { width: 36, height: 36, borderWidth: 1, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  scroll: { paddingTop: 8, paddingBottom: 32 },
  search: { width: '100%', height: 44, borderWidth: 1, paddingHorizontal: 14, fontFamily: 'CormorantGaramond_500Medium', fontSize: 15, marginBottom: 8 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 13, borderBottomWidth: StyleSheet.hairlineWidth },
});
