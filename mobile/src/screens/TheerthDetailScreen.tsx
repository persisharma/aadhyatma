import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '@/theme/ThemeContext';
import { useGitaLanguage, type Lang } from '@/data/gita/language';
import { contentByLang, pick } from '@/utils/localize';
import { meaningToken, pillTextStyle, scriptBodyFont, scriptTitleFont } from '@/utils/langType';
import { getTheerthBackground } from '@/data/backgrounds';
import BackgroundLayer from '@/components/BackgroundLayer';
import LanguageToggle from '@/components/LanguageToggle';
import { getTempleById } from '@/data/theerth/temples';
import type { Deity } from '@/data/texts';
import type { HomeStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<HomeStackParamList, 'TheerthDetail'>;

const DEITY_LABELS: Record<Deity, { hi: string; en: string }> = {
  rama: { hi: 'राम', en: 'RAMA' },
  krishna: { hi: 'कृष्ण', en: 'KRISHNA' },
  vishnu: { hi: 'विष्णु', en: 'VISHNU' },
  shiva: { hi: 'शिव', en: 'SHIVA' },
  hanuman: { hi: 'हनुमान', en: 'HANUMAN' },
  durga: { hi: 'दुर्गा', en: 'DURGA' },
  ganesha: { hi: 'गणेश', en: 'GANESHA' },
  savitr: { hi: 'सूर्य', en: 'SURYA' },
  saraswati: { hi: 'सरस्वती', en: 'SARASWATI' },
  lakshmi: { hi: 'लक्ष्मी', en: 'LAKSHMI' },
  surya: { hi: 'सूर्य', en: 'SURYA' },
  radha: { hi: 'राधा', en: 'RADHA' },
  kartikeya: { hi: 'कार्तिकेय', en: 'KARTIKEYA' },
  kubera: { hi: 'कुबेर', en: 'KUBERA' },
  ganga: { hi: 'गंगा', en: 'GANGA' },
  parvati: { hi: 'पार्वती', en: 'PARVATI' },
  narasimha: { hi: 'नरसिंह', en: 'NARASIMHA' },
  dattatreya: { hi: 'दत्तात्रेय', en: 'DATTATREYA' },
  shani: { hi: 'शनि', en: 'SHANI' },
  kali: { hi: 'काली', en: 'KALI' },
  navagraha: { hi: 'नवग्रह', en: 'NAVAGRAHA' },
};

function deityLabel(deity: Deity, lang: Lang): string {
  const entry = DEITY_LABELS[deity];
  return contentByLang(lang, entry.hi, entry.en);
}

export default function TheerthDetailScreen({ route, navigation }: Props) {
  const { templeId } = route.params;
  const { colors, typography, spacing } = useTheme();
  const { lang } = useGitaLanguage();

  const temple = getTempleById(templeId);

  if (!temple) {
    return (
      <View style={[styles.root, { backgroundColor: colors.parchment }]}>
        <SafeAreaView style={styles.safe} edges={['top']}>
          <Text style={{ color: colors.ink, padding: 24 }}>
            Temple not found: {templeId}
          </Text>
        </SafeAreaView>
      </View>
    );
  }

  const name = contentByLang(lang, temple.nameHi, temple.nameEn);
  const cityState = `${contentByLang(lang, temple.cityHi, temple.cityEn)}, ${contentByLang(lang, temple.stateHi, temple.stateEn)}`;

  return (
    <View style={[styles.root, { backgroundColor: colors.parchment }]}>
      {/* Each temple sits on its presiding deity's faded background (RULEBOOK
          §11.4 / §10.8) — a relevant per-temple plate instead of a flat wash. */}
      <BackgroundLayer source={getTheerthBackground(temple.id, temple.deity)} />
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
            <Text style={{ color: colors.inkSoft, fontSize: 18 }}>{'‹'}</Text>
          </Pressable>
          {/* Language toggle at the top (consistent with the map/listing screens);
              the temple name lives only in the hero below, never duplicated here. */}
          <LanguageToggle />
          <View style={styles.backBtnSpacer} />
        </View>

        <ScrollView
          contentContainerStyle={[
            styles.scroll,
            { paddingHorizontal: spacing.xxl, paddingBottom: spacing.xxl * 2 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.hero}>
            <Text
              style={{
                fontFamily: typography.screenTitle.fontFamily,
                fontSize: 28,
                color: colors.ink,
                textAlign: 'center',
                includeFontPadding: false,
              }}
            >
              {name}
            </Text>
            <Text
              style={{
                fontFamily: lang === 'en' ? typography.cardLatin.fontFamily : scriptBodyFont(lang, typography.meaning.fontFamily),
                fontSize: 14,
                color: colors.inkMuted,
                textAlign: 'center',
                marginTop: 6,
                fontStyle: lang === 'en' ? 'italic' : 'normal',
              }}
            >
              {cityState}
            </Text>
            <View
              style={[
                styles.deityPill,
                { backgroundColor: colors.saffronTint, borderColor: colors.divider },
              ]}
            >
              <Text
                style={{
                  // pillTextStyle: tracking splits the shirorekha on Indic labels.
                  ...pillTextStyle(lang, typography.versePill),
                  color: colors.saffronDeep,
                }}
              >
                {deityLabel(temple.deity, lang)}
              </Text>
            </View>
          </View>

          <Ornament colors={colors} />

          <SectionBlock
            labelHi="महिमा"
            labelEn="Significance"
            lang={lang}
            colors={colors}
            typography={typography}
          />
          <DetailProse
            text={contentByLang(lang, temple.significanceHi, temple.significanceEn)}
            lang={lang}
            colors={colors}
            typography={typography}
          />

          <Ornament colors={colors} />

          <SectionBlock
            labelHi="उद्भव कथा"
            labelEn="Origin Story"
            lang={lang}
            colors={colors}
            typography={typography}
          />
          <DetailProse
            text={contentByLang(lang, temple.originStoryHi, temple.originStoryEn)}
            lang={lang}
            colors={colors}
            typography={typography}
          />

          <Text
            style={{
              textAlign: 'center',
              fontFamily: lang === 'en' ? typography.cardLatin.fontFamily : scriptBodyFont(lang, typography.meaning.fontFamily),
              fontSize: 12,
              color: colors.inkMuted,
              marginTop: spacing.xl,
              fontStyle: lang === 'en' ? 'italic' : 'normal',
              opacity: 0.7,
            }}
          >
            {`${pick(lang, { hi: 'स्रोत', en: 'Sources', gu: 'સ્રોત', kn: 'ಮೂಲಗಳು' })} — ${temple.sources.map((s) => s.label).join(', ')}`}
          </Text>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function Ornament({ colors }: { colors: ReturnType<typeof useTheme>['colors'] }) {
  return (
    <View style={styles.ornamentRow}>
      <View style={[styles.ornamentLine, { backgroundColor: colors.saffron, opacity: 0.6 }]} />
      <Text style={{ color: colors.saffronDeep, fontSize: 20, marginHorizontal: 12 }}>
        {'॥'}
      </Text>
      <View style={[styles.ornamentLine, { backgroundColor: colors.saffron, opacity: 0.6 }]} />
    </View>
  );
}

type SectionBlockProps = {
  labelHi: string;
  labelEn: string;
  lang: Lang;
  colors: ReturnType<typeof useTheme>['colors'];
  typography: ReturnType<typeof useTheme>['typography'];
};

function SectionBlock({ labelHi, labelEn, lang, colors, typography }: SectionBlockProps) {
  // Bilingual stacked label: reading-language form leads, English supports.
  const first = contentByLang(lang, labelHi, labelEn);
  const second = lang === 'en' ? labelHi : labelEn;
  return (
    <Text
      style={{
        textAlign: 'center',
        // The label is always mixed-script (reading-language word · the other),
        // so a Latin face would clip the Devanagari half on Android. Use the
        // script serif (it carries Latin glyphs too) and drop the tracking,
        // which would split the Devanagari shirorekha.
        fontFamily: scriptTitleFont(lang, typography.readerTitle.fontFamily),
        fontSize: typography.meaningLabel.fontSize,
        color: colors.saffronDeep,
        textTransform: 'uppercase',
        marginVertical: 12,
      }}
    >
      {first} · {second}
    </Text>
  );
}

type DetailProseProps = {
  text: string;
  lang: Lang;
  colors: ReturnType<typeof useTheme>['colors'];
  typography: ReturnType<typeof useTheme>['typography'];
};

function DetailProse({ text, lang, colors, typography }: DetailProseProps) {
  const tok = meaningToken(lang, typography); // per-script body token (gu/kn → their serif)
  return (
    <Text
      style={{
        fontFamily: tok.fontFamily,
        fontSize: tok.fontSize,
        lineHeight: tok.lineHeight,
        color: colors.inkSoft,
        textAlign: 'center',
        fontStyle: lang === 'en' ? 'italic' : 'normal',
        marginBottom: 14,
        paddingHorizontal: 8,
      }}
    >
      {text}
    </Text>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 14,
    paddingBottom: 14,
  },
  backBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtnSpacer: { width: 34, height: 34 },
  scroll: {
    paddingTop: 4,
  },
  hero: {
    alignItems: 'center',
    paddingTop: 24,
    paddingBottom: 16,
  },
  deityPill: {
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
  },
  ornamentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 12,
  },
  ornamentLine: {
    height: 1,
    width: 60,
  },
});
