import React from 'react';
import { Image, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Svg, { Defs, LinearGradient as SvgGradient, Path, Stop, Text as SvgText } from 'react-native-svg';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTilePress } from '@/contexts/TilePressContext';
import { useJapamCounter } from '@/contexts/JapamCounterContext';
import { useGitaLanguage } from '@/data/gita/language';
import { findJapamMantra, JAPAM_BEADS_PER_ROUND } from '@/data/japam';
import { getPracticeHymn } from '@/data/practiceHymn';
import type { HomeStackParamList } from '@/navigation/types';
import { contentByLang, pick } from '@/utils/localize';
import AppIcon from '@/components/AppIcon';
import { titleFontByLang } from '@/utils/langType';

const curve =
  'M86 32 C66 12 54 4 36 5 C-4 6 -4 58 36 59 C55 60 70 48 86 32 C105 13 120 4 137 5 C177 6 177 58 137 59 C117 60 104 49 86 32 Z';
// Native SVG dash distances use viewBox units, even when rendered at phone size.
const loopLength = 416.63;
const numerals = { hi: 'hi-IN-u-nu-deva', gu: 'gu-IN-u-nu-gujr', kn: 'kn-IN-u-nu-knda', en: 'en-IN' };

export default function JapmalaBanner({
  navigation,
}: {
  navigation: NativeStackNavigationProp<HomeStackParamList, 'Home'>;
}) {
  const { lang } = useGitaLanguage();
  const press = useTilePress();
  const { fontScale } = useWindowDimensions();
  const { entries, recitations, getEntry } = useJapamCounter();
  const fmt = React.useMemo(() => new Intl.NumberFormat(numerals[lang]), [lang]);
  const mantraId = React.useMemo(
    () =>
      Object.keys(entries)
        .sort((a, b) => entries[b].updatedAt - entries[a].updatedAt)
        .find((id) => findJapamMantra(id)) ?? 'sita-ram-naam',
    [entries],
  );
  const lastHymn = React.useMemo(
    () =>
      Object.keys(recitations)
        .sort((a, b) => recitations[b].updatedAt - recitations[a].updatedAt)
        .map(getPracticeHymn)
        .find(Boolean),
    [recitations],
  );
  const mantra = findJapamMantra(mantraId)!;
  const beads = getEntry(mantraId);
  const hymn = lastHymn && recitations[lastHymn.id].updatedAt > beads.updatedAt ? lastHymn : undefined;
  const count = hymn ? recitations[hymn.id].count : beads.count;
  const title = hymn
    ? contentByLang(lang, hymn.nameHi, hymn.nameEn)
    : mantraId === 'sita-ram-naam'
      ? contentByLang(lang, 'सीता राम', 'Sita Ram')
      : contentByLang(lang, mantra.nameHi, mantra.nameEn);
  const label = pick(lang, {
    hi: 'जपमाला | अनंत जप',
    en: 'Japmala | Anant jap',
    gu: 'જપમાળા | અનંત જપ',
    kn: 'ಜಪಮಾಲೆ | ಅನಂತ ಜಪ',
  });
  const fontFamily = titleFontByLang(lang);
  const stat = hymn
    ? contentByLang(lang, 'पाठ', 'recitations')
    : fmt.format(beads.rounds) + ' ' + contentByLang(lang, 'माला', beads.rounds === 1 ? 'mala' : 'malas');
  // The banner is one door into the Japmala section (owner's direction, 19 Nov
  // 2026): it shows the last practice and its count, but nothing is counted on
  // Home. Counting, choosing and starting all happen in the section itself.
  const openSection = () =>
    navigation.navigate('CategoryList', { categoryId: hymn ? 'stotram' : 'japam', practice: true });
  return (
    <View testID="home-japa-banner" style={styles.banner}>
      <Image
        source={require('../../../assets/home-readings/ananta-jap.jpg')}
        resizeMode="stretch"
        style={styles.artwork}
        accessible={false}
        accessibilityIgnoresInvertColors
      />
      <Pressable
        testID="home-japa-choose"
        accessibilityRole="button"
        accessibilityLabel={
          pick(lang, { hi: 'जपमाला खोलें', en: 'Open Japmala', gu: 'જપમાળા ખોલો', kn: 'ಜಪಮಾಲೆ ತೆರೆಯಿರಿ' }) + ' · ' + title
        }
        accessibilityValue={{ text: fmt.format(count) + ' ' + stat }}
        style={({ pressed }) => [styles.door, pressed && styles.pressed]}
        onPressIn={() => press.beginTilePress(openSection)}
        onPressOut={press.finishTilePress}
        onPress={() => press.activateTile(openSection)}
      >
        <View style={styles.info}>
          <Text style={{ fontFamily, fontSize: 11, lineHeight: 14, color: '#873c15' }}>{label}</Text>
          <Text style={{ fontFamily, fontSize: 21, lineHeight: 28, color: '#782b1a' }}>{title}</Text>
          <View style={styles.count}>
            {!hymn && fontScale <= 1.2 ? (
              <Svg width={92} height={34} viewBox="-3 -2 179 68" accessible={false}>
                <Defs>
                  <SvgGradient id="japGold" x1="0%" y1="0%" x2="70%" y2="100%">
                    <Stop offset="0" stopColor="#af4a16" />
                    <Stop offset="0.4" stopColor="#ffc550" />
                    <Stop offset="1" stopColor="#aa4619" />
                  </SvgGradient>
                </Defs>
                <Path d={curve} stroke="#954819" fill="none" strokeWidth={6.4} />
                <Path d={curve} stroke="url(#japGold)" fill="none" strokeWidth={4.7} />
                {count > 0 && (
                  <Path
                    d={curve}
                    stroke="#c44e14"
                    fill="none"
                    strokeWidth={4}
                    strokeDasharray={[(count / JAPAM_BEADS_PER_ROUND) * loopLength, 1000]}
                    strokeLinecap="round"
                  />
                )}
                <Path
                  d={curve}
                  stroke="#ffda75"
                  fill="none"
                  strokeWidth={7}
                  strokeLinecap="round"
                  strokeDasharray={[0.05, loopLength + 1]}
                  strokeDashoffset={(-count / JAPAM_BEADS_PER_ROUND) * loopLength}
                />
                {[count, JAPAM_BEADS_PER_ROUND].map((n, i) => (
                  <SvgText
                    key={i}
                    x={i ? 131 : 41}
                    y={41}
                    fontSize={26}
                    fontFamily={fontFamily}
                    textAnchor="middle"
                    fill="#762b12"
                  >
                    {fmt.format(n)}
                  </SvgText>
                ))}
              </Svg>
            ) : (
              <Text style={{ fontFamily, color: '#762b12' }}>
                {fmt.format(count)}
                {hymn ? '' : ' / ' + fmt.format(108)}
              </Text>
            )}
            <Text style={{ fontFamily, fontSize: 12, color: '#694324' }}>{stat}</Text>
          </View>
        </View>
        {/* A drawn cue, not a second button: the whole banner is the target. */}
        <View style={styles.open}>
          <AppIcon name="next" size={22} color="#fff5d9" />
        </View>
      </Pressable>
    </View>
  );
}
const styles = StyleSheet.create({
  banner: {
    minHeight: 100,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#d69a58',
    borderRadius: 18,
    backgroundColor: '#fff0d2',
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
  },
  // Keep foreground spacing off the frame so the image fills its entire inner bounds.
  artwork: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%' },
  door: { flex: 1, minHeight: 98, flexDirection: 'row', alignItems: 'center' },
  info: { marginLeft: '28%', flex: 1, minWidth: 0, paddingLeft: 3, paddingVertical: 6, justifyContent: 'center' },
  count: { minHeight: 36, flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 5 },
  pressed: { opacity: 0.8 },
  open: {
    width: 44,
    height: 44,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ba521a',
    borderColor: '#eeb85a',
    borderWidth: 2,
    borderRadius: 22,
  },
});
