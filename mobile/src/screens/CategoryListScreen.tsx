import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '@/theme/ThemeContext';
import { library } from '@/data/texts';
import { categories } from '@/data/categories';
import LibraryCard from '@/components/LibraryCard';
import type { HomeStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<HomeStackParamList, 'CategoryList'>;

export default function CategoryListScreen({ navigation, route }: Props) {
  const { colors, typography, spacing } = useTheme();
  const { categoryId } = route.params;

  const categoryMeta = categories.find((c) => c.id === categoryId);
  const items = library.filter((e) => e.category === categoryId && !e.hidden);

  const handlePress = (entryId: string) => {
    if (entryId === 'hanuman-chalisa') navigation.navigate('ChalisaReader', { initialIndex: 0, chalisaId: 'hanuman-chalisa' });
    else if (entryId === 'shiv-chalisa') navigation.navigate('ChalisaReader', { initialIndex: 0, chalisaId: 'shiv-chalisa' });
    else if (entryId === 'durga-chalisa') navigation.navigate('ChalisaReader', { initialIndex: 0, chalisaId: 'durga-chalisa' });
    else if (entryId === 'ganesh-chalisa') navigation.navigate('ChalisaReader', { initialIndex: 0, chalisaId: 'ganesh-chalisa' });
    else if (entryId === 'bhagavad-gita') navigation.navigate('GitaChapters');
    else if (entryId === 'sundarkand') navigation.navigate('SundarkandChapters');
    else if (entryId === 'shiva-strotam') navigation.navigate('ShivaStrotamChapters');
    else if (entryId === 'durga-stotram') navigation.navigate('DurgaStotramChapters');
    else if (entryId === 'ganesh-stotram') navigation.navigate('GaneshStotramChapters');
    else if (entryId === 'vishnu-sahasranama') navigation.navigate('VishnuSahasranamaChapters');
    else if (entryId === 'hanuman-ashtak') navigation.navigate('HanumanAshtakChapters');
    else if (entryId === 'ram-stuti') navigation.navigate('RamStutiChapters');
    else if (entryId === 'ramcharitmanas') navigation.navigate('RamcharitmanasChapters');
    else if (entryId === 'om-jai-jagdish') navigation.navigate('AartiReader', { aartiIndex: 0 });
    else if (entryId === 'hanuman-aarti') navigation.navigate('AartiReader', { aartiIndex: 1 });
    else if (entryId === 'sankat-mochan') navigation.navigate('AartiReader', { aartiIndex: 2 });
    else if (entryId === 'jai-ganesh-deva') navigation.navigate('AartiReader', { aartiIndex: 3 });
    else if (entryId === 'om-jai-shiv-omkara') navigation.navigate('AartiReader', { aartiIndex: 4 });
    else if (entryId === 'jai-ambe-gauri') navigation.navigate('AartiReader', { aartiIndex: 5 });
    else if (entryId === 'aarti-kunj-bihari') navigation.navigate('AartiReader', { aartiIndex: 6 });
  };

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[colors.parchmentHighlight, colors.parchmentGradientEnd]}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        {/* Top bar */}
        <View style={[styles.topBar, { paddingHorizontal: spacing.xxl }]}>
          <Pressable
            onPress={() => navigation.goBack()}
            hitSlop={16}
            style={[styles.backBtn, { backgroundColor: colors.parchmentSoft, borderColor: colors.divider }]}
          >
            <Text style={{ color: colors.inkSoft, fontSize: 18 }}>‹</Text>
          </Pressable>
          <View style={styles.titleRow}>
            <Text
              style={{
                fontFamily: typography.readerTitle.fontFamily,
                fontSize: 16,
                color: colors.ink,
              }}
            >
              {categoryMeta?.nameHi ?? ''}
            </Text>
            <Text
              style={{
                fontFamily: 'CormorantGaramond_400Regular_Italic',
                fontSize: 13,
                color: colors.inkMuted,
                marginLeft: 6,
              }}
            >
              · {categoryMeta?.nameEn ?? ''}
            </Text>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingHorizontal: spacing.xxl, gap: spacing.md }]}
          showsVerticalScrollIndicator={false}
        >
          {items.map((entry) => {
            const onPress = entry.status === 'active' ? () => handlePress(entry.id) : undefined;
            return <LibraryCard key={entry.id} entry={entry} onPress={onPress} />;
          })}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  scroll: {
    paddingTop: 8,
    paddingBottom: 40,
  },
});
