import React from 'react';
import { Image, StyleSheet, View, Text } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import CategoryCard from '@/components/CategoryCard';
import { useNewContent } from '@/contexts/NewContentContext';
import { useTilePress } from '@/contexts/TilePressContext';
import { useGitaLanguage } from '@/data/gita/language';
import type { HomeStackParamList } from '@/navigation/types';
import { useTheme } from '@/theme/ThemeContext';
import { contentByLang, pick } from '@/utils/localize';
import { titleFontByLang } from '@/utils/langType';

type Nav = NativeStackNavigationProp<HomeStackParamList, 'Home'>;
const readings = [
  {
    id: 'gita-saar',
    hi: 'गीता सार',
    en: 'Gita Saar',
    art: require('../../../assets/home-readings/saar.jpg'),
    open: (n: Nav) => n.navigate('GitaSaarChapters'),
  },
  {
    id: 'bhagavad-gita',
    hi: 'भगवद् गीता',
    en: 'Bhagavad Gita',
    art: require('../../../assets/home-readings/gita.jpg'),
    open: (n: Nav) => n.navigate('GitaReader', { chapter: 1, initialIndex: 0 }),
  },
  {
    id: 'sundarkand',
    hi: 'सुंदरकाण्ड',
    en: 'Sundarkand',
    art: require('../../../assets/home-readings/sundar.jpg'),
    open: (n: Nav) => n.navigate('SundarkandReader', { chapter: 1, initialIndex: 0 }),
  },
  {
    id: 'valmiki-ramayan',
    hi: 'वाल्मीकि रामायण',
    en: 'Valmiki Ramayan',
    art: require('../../../assets/home-readings/rama.jpg'),
    open: (n: Nav) => n.navigate('ValmikiRamayanReader', { chapter: 1, initialIndex: 0 }),
  },
  {
    id: 'hanuman-chalisa',
    hi: 'हनुमान चालीसा',
    en: 'Hanuman Chalisa',
    art: require('../../../assets/home-readings/chal.jpg'),
    open: (n: Nav) => n.navigate('ChalisaReader', { chalisaId: 'hanuman-chalisa', initialIndex: 0 }),
  },
  {
    id: 'aarti',
    hi: 'आरती',
    en: 'Aarti',
    art: require('../../../assets/home-readings/cat-aarti.jpg'),
    open: (n: Nav) => n.navigate('CategoryList', { categoryId: 'aarti' }),
  },
];

export default function FeaturedReadings({
  navigation,
  width,
  largeText,
}: {
  navigation: Nav;
  width: number;
  largeText: boolean;
}) {
  const { lang } = useGitaLanguage();
  const { colors, radii } = useTheme();
  const { isNew, hasNewInCategory, markSeen } = useNewContent();
  const press = useTilePress();
  const columns = largeText ? 2 : 3;
  const tileWidth = Math.floor((width - (columns - 1) * 10) / columns);
  const height = Math.min(96, Math.round(tileWidth * 0.53));
  return (
    <View style={styles.section}>
      <Text
        accessibilityRole="header"
        style={{ fontFamily: titleFontByLang(lang), fontSize: 15, color: colors.inkSoft }}
      >
        {pick(lang, { hi: 'प्रमुख पाठ', en: 'Featured readings', gu: 'મુખ્ય પાઠ', kn: 'ಪ್ರಮುಖ ಪಾಠಗಳು', mr: 'प्रमुख पाठ', te: 'ప్రముఖ పాఠాలు' })}
      </Text>
      <View style={styles.grid}>
        {readings.map((r) => {
          const newReading = r.id === 'aarti' ? hasNewInCategory('aarti') : isNew(r.id);
          const open = () => {
            if (r.id !== 'aarti') markSeen(r.id);
            r.open(navigation);
          };
          return (
            <View key={r.id} style={{ width: tileWidth }}>
              <CategoryCard
                testID={`home-featured-${r.id}`}
                accessibilityLabel={
                  contentByLang(lang, r.hi, r.en) +
                  (newReading
                    ? ' · ' + pick(lang, { hi: 'नया', en: 'New', gu: 'નવું', kn: 'ಹೊಸದು', mr: 'नवीन', te: 'కొత్తది' })
                    : '')
                }
                variant="launcher"
                status="active"
                nameHi={r.hi}
                nameEn={r.en}
                launcherLabelLines={2}
                launcherHeight={height}
                hasNew={newReading}
                icon={
                  <Image
                    accessibilityIgnoresInvertColors
                    source={r.art}
                    resizeMode="cover"
                    style={{ width: tileWidth - 2, height: height - 2, borderRadius: radii.lg - 1 }}
                  />
                }
                onPressIn={() => press.beginTilePress(open)}
                onPressOut={press.finishTilePress}
                onPress={() => press.activateTile(open)}
              />
            </View>
          );
        })}
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  section: { marginTop: 12, gap: 7 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
});
