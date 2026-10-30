import {
  GitaSaarStoryHero,
  GitaSaarStoryDoor,
  GitaSaarStoryDetails,
} from './GitaSaarStory';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Keyboard, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import AutoSlideScrollView from './AutoSlideScrollView';
import { useTheme } from '@/theme/ThemeContext';
import { fontFamilies } from '@/theme/typography';
import { useGitaLanguage } from '@/data/gita/language';
import {
  gitaSaarChaptersManifest,
  resolveGitaSaarRef,
  type GitaSaarVerse,
} from '@/data/gita-saar';
import {
  gitaSaarExperiences,
  type LearningCopy,
} from '@/data/gita-saar/experience';
import { MAX_REFLECTION_LENGTH } from '@/data/gita-saar/learningStore';
import {
  contentByLang,
  meaningByLang,
  meaningSourceLang,
  pick,
  verseLinesByLang,
} from '@/utils/localize';
import {
  meaningToken,
  scriptTitleFont,
  verseToken,
  pillTextStyle,
} from '@/utils/langType';
import { getReaderBackground } from '@/data/backgrounds';
import BackgroundLayer from './BackgroundLayer';
import ProseParagraph from './ProseParagraph';
import AppIcon from './AppIcon';
import TextField from './TextField';

type Props = {
  verse: GitaSaarVerse;
  sourceId: string;
  chapterTitle?: string;
  width: number;
  height?: number;
  topActions?: React.ReactNode;
  closing?: { hi: string; en: string };
  onOpenInGita?: () => void;
  onOpenGitaRef?: (chapter: number, verse: number) => void;
  onOpenRamayanRef?: (kanda: number, sarga: number) => void;
  isSaved?: boolean;
  initialReflection?: string;
  onSaveLearning?: (text: string) => Promise<void>;
  onReflectionFocus?: () => void;
  onOpenStory?: () => void;
};
/** One continuous, essence-first lesson. Deeper scripture and writing are optional. */
export default function GitaSaarVersePage({
  verse,
  sourceId,
  chapterTitle,
  width,
  height,
  topActions,
  closing,
  onOpenInGita,
  onOpenGitaRef,
  onOpenRamayanRef,
  isSaved = false,
  initialReflection = '',
  onSaveLearning,
  onReflectionFocus,
  onOpenStory,
}: Props) {
  const { colors, typography, spacing, radii } = useTheme();
  const { lang } = useGitaLanguage();
  const themeId = gitaSaarChaptersManifest[verse.chapter - 1]?.id;
  const experience = gitaSaarExperiences[themeId];
  const [sourceOpen, setSourceOpen] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const scrollToOriginal = useRef(false);
  const [writing, setWriting] = useState(false);
  const [reflection, setReflection] = useState(initialReflection);
  const [dirty, setDirty] = useState(false);
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>(
    'idle'
  );
  useEffect(() => {
    if (!dirty) setReflection(initialReflection);
  }, [initialReflection, dirty]);
  useEffect(() => {
    if (!isSaved && status === 'saved') setStatus('idle');
  }, [isSaved, status]);
  const original = useMemo(
    () =>
      sourceOpen
        ? resolveGitaSaarRef({
            chapter: verse.gitaChapter,
            verse: verse.gitaVerse,
          })
        : null,
    [sourceOpen, verse.gitaChapter, verse.gitaVerse]
  );
  const copy = (value: LearningCopy) => meaningByLang(lang, value.hi, value.en);
  const tok = meaningToken(meaningSourceLang(lang), typography);
  const body = {
    fontFamily: tok.fontFamily,
    fontSize: tok.fontSize,
    lineHeight: tok.lineHeight,
    color: colors.inkSoft,
  } as const;
  const title = {
    fontFamily:
      lang === 'en'
        ? fontFamilies.latinSemiBold
        : scriptTitleFont(lang, typography.screenTitle.fontFamily),
    color: colors.ink,
  } as const;
  const label = {
    fontFamily: tok.fontFamily,
    fontSize: 12,
    lineHeight: 22,
    color: colors.saffronDeep,
  } as const;
  const saved = isSaved && !dirty;
  async function save() {
    if (!onSaveLearning || status === 'saving') return;
    Keyboard.dismiss();
    setStatus('saving');
    try {
      await onSaveLearning(reflection);
      setDirty(false);
      setStatus('saved');
    } catch {
      setStatus('error');
    }
  }
  return (
    <View
      style={[
        styles.page,
        { width, height, backgroundColor: colors.parchment },
      ]}
    >
      <BackgroundLayer source={getReaderBackground(sourceId, verse)} />
      <AutoSlideScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          { paddingHorizontal: spacing.screenGutter },
        ]}
        nestedScrollEnabled
        directionalLockEnabled
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        accessible={false}
      >
        <View style={styles.contextRow}>
          {chapterTitle && (
            <ProseParagraph style={[label, styles.context]}>
              {chapterTitle}
            </ProseParagraph>
          )}
          {topActions && <View style={styles.actions}>{topActions}</View>}
        </View>
        {verse.number === 1 ? (
          <GitaSaarStoryHero
            themeId={themeId}
            width={width - spacing.screenGutter * 2}
          />
        ) : (
          <GitaSaarStoryDoor themeId={themeId} onPress={onOpenStory} />
        )}
        <ProseParagraph
          style={[
            pillTextStyle(lang, typography.versePill),
            { color: colors.saffronDeep, marginTop: 5, marginBottom: 13 },
          ]}
        >
          {contentByLang(
            lang,
            `श्लोक · ${verse.gitaChapter}.${verse.gitaVerse}`,
            `Shloka · ${verse.gitaChapter}.${verse.gitaVerse}`
          )}
        </ProseParagraph>
        <ProseParagraph
          accessibilityRole="header"
          style={[
            title,
            {
              fontSize: tok.fontSize + 8,
              lineHeight: tok.lineHeight + 8,
              marginBottom: 20,
            },
          ]}
        >
          {contentByLang(lang, verse.themeHi, verse.themeEn)}
        </ProseParagraph>
        <ProseParagraph style={[label, { marginBottom: 9 }]}>
          {pick(lang, { hi: 'सार', en: 'Essence', gu: 'સાર', kn: 'ಸಾರ' })}
        </ProseParagraph>
        <ProseParagraph
          testID="gita-saar-essence"
          style={[body, { color: colors.ink, marginBottom: 23 }]}
        >
          {meaningByLang(lang, verse.meaningHi, verse.meaningEn)}
        </ProseParagraph>
        {verse.number === 1 && (
          <GitaSaarStoryDetails
            themeId={themeId}
            onOpenGitaRef={onOpenGitaRef}
            onOpenRamayanRef={onOpenRamayanRef}
          />
        )}
        <Pressable
          testID="gita-saar-source-toggle"
          accessibilityRole="button"
          accessibilityLabel="Show original Gita verse and meaning"
          accessibilityState={{ expanded: sourceOpen }}
          onPress={() => {
            scrollToOriginal.current = !sourceOpen;
            setSourceOpen((open) => !open);
          }}
          style={[styles.sourceToggle, { borderColor: colors.divider }]}
        >
          <AppIcon name="text" size={19} color={colors.saffronDeep} />
          <ProseParagraph style={[label, { flex: 1 }]}>
            {pick(lang, {
              hi: 'मूल श्लोक और अर्थ',
              en: 'Original verse & meaning',
              gu: 'મૂળ શ્લોક અને અર્થ',
              kn: 'ಮೂಲ ಶ್ಲೋಕ ಮತ್ತು ಅರ್ಥ',
            })}
          </ProseParagraph>
          <AppIcon
            name={sourceOpen ? 'close' : 'next'}
            size={17}
            color={colors.saffronDeep}
          />
        </Pressable>
        {sourceOpen && (
          <View
            testID="gita-saar-original"
            onLayout={(event) => {
              if (!scrollToOriginal.current) return;
              scrollToOriginal.current = false;
              const y = Math.max(0, event.nativeEvent.layout.y - 12);
              requestAnimationFrame(() => scrollRef.current?.scrollTo({ y, animated: true }));
            }}
            style={[
              styles.original,
              {
                borderColor: colors.divider,
                backgroundColor: colors.cardSurface,
                borderRadius: radii.md,
              },
            ]}
          >
            {verseLinesByLang(lang, verse.sanskrit, verse.transliteration).map(
              (line, i) => {
                const vtok = verseToken(lang, typography);
                return (
                  <ProseParagraph
                    key={i}
                    style={{
                      fontFamily: vtok.fontFamily,
                      fontSize: vtok.fontSize,
                      lineHeight: vtok.lineHeight,
                      color: colors.ink,
                      marginBottom: 12,
                    }}
                  >
                    {line}
                  </ProseParagraph>
                );
              }
            )}
            {original && (
              <>
                <ProseParagraph
                  style={[label, { marginTop: 12, marginBottom: 8 }]}
                >
                  {pick(lang, {
                    hi: 'भावार्थ',
                    en: 'Meaning',
                    gu: 'ભાવાર્થ',
                    kn: 'ಭಾವಾರ್ಥ',
                  })}
                </ProseParagraph>
                <ProseParagraph style={body}>
                  {meaningByLang(lang, original.meaningHi, original.meaningEn)}
                </ProseParagraph>
              </>
            )}
          </View>
        )}
        {onOpenInGita && (
          <Pressable
            testID="gita-saar-open-in-gita"
            accessibilityRole="button"
            accessibilityLabel={`Open Gita reader for ${verse.gitaChapter}.${verse.gitaVerse}`}
            onPress={onOpenInGita}
            style={styles.handoff}
          >
            <ProseParagraph style={[label, { flex: 1 }]}>
              {pick(lang, {
                hi: 'पूरा अर्थ गीता में पढ़ें',
                en: 'Read the full meaning in the Gita',
                gu: 'પૂરો અર્થ ગીતામાં વાંચો',
                kn: 'ಪೂರ್ಣ ಅರ್ಥವನ್ನು ಗೀತೆಯಲ್ಲಿ ಓದಿ',
              })}
            </ProseParagraph>
            <AppIcon name="next" size={17} color={colors.saffronDeep} />
          </Pressable>
        )}
        <View style={[styles.group, { borderColor: colors.divider }]}>
          <ProseParagraph
            testID="gita-saar-group"
            style={[
              title,
              { fontSize: tok.fontSize, lineHeight: tok.lineHeight },
            ]}
          >
            {contentByLang(lang, verse.groupTitleHi, verse.groupTitleEn)}
          </ProseParagraph>
          <ProseParagraph style={[body, { marginTop: 9 }]}>
            {contentByLang(lang, verse.groupIntroHi, verse.groupIntroEn)}
          </ProseParagraph>
        </View>
        {experience && verse.number !== 1 && (
          <View
            style={[
              styles.takeaway,
              {
                backgroundColor: colors.cardSurface,
                borderColor: colors.divider,
                borderRadius: radii.md,
              },
            ]}
          >
            <ProseParagraph style={label}>
              {pick(lang, {
                hi: 'आज साथ ले जाएँ',
                en: 'Take it into your day',
                gu: 'આજ સાથે લઈ જાઓ',
                kn: 'ಇಂದಿನ ದಿನಕ್ಕೆ ಜೊತೆಯಾಗಲಿ',
              })}
            </ProseParagraph>
            <ProseParagraph
              style={[body, { color: colors.ink, marginTop: 12 }]}
            >
              {copy(experience.takeaway)}
            </ProseParagraph>
          </View>
        )}
        {onSaveLearning && (
          <View style={styles.keep}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Write a Gita Saar reflection"
              accessibilityState={{ expanded: writing }}
              onPress={() => {
                if (writing) Keyboard.dismiss();
                setWriting((open) => !open);
              }}
              style={[styles.writeToggle, { borderColor: colors.divider }]}
            >
              <AppIcon name="edit" size={19} color={colors.saffronDeep} />
              <ProseParagraph style={[label, { flex: 1 }]}>
                {pick(lang, {
                  hi: 'अपना एक विचार लिखें',
                  en: 'Add a thought of your own',
                  gu: 'તમારો એક વિચાર લખો',
                  kn: 'ನಿಮ್ಮ ಒಂದು ವಿಚಾರ ಬರೆಯಿರಿ',
                })}
              </ProseParagraph>
              <ProseParagraph style={[label, { color: colors.inkMuted }]}>
                {pick(lang, {
                  hi: 'वैकल्पिक',
                  en: 'Optional',
                  gu: 'વૈકલ્પિક',
                  kn: 'ಐಚ್ಛಿಕ',
                })}
              </ProseParagraph>
            </Pressable>
            {writing && (
              <View style={{ marginBottom: 18 }}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'flex-start',
                    gap: 12,
                    marginTop: 15,
                    marginBottom: 13,
                  }}
                >
                  {experience && (
                    <ProseParagraph style={[body, { flex: 1 }]}>
                      {copy(experience.reflection)}
                    </ProseParagraph>
                  )}
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Finish writing Gita Saar reflection"
                    onPress={() => Keyboard.dismiss()}
                    style={{
                      minHeight: 44,
                      minWidth: 44,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <ProseParagraph style={label}>
                      {pick(lang, {
                        hi: 'पूर्ण',
                        en: 'Done',
                        gu: 'પૂર્ણ',
                        kn: 'ಮುಗಿಯಿತು',
                      })}
                    </ProseParagraph>
                  </Pressable>
                </View>
                <TextField
                  variant="form"
                  multiline
                  maxLength={MAX_REFLECTION_LENGTH}
                  accessibilityLabel="Gita Saar reflection"
                  testID="gita-saar-reflection"
                  value={reflection}
                  onFocus={onReflectionFocus}
                  onChangeText={(text) => {
                    setReflection(text);
                    setDirty(true);
                    setStatus('idle');
                  }}
                  placeholder={pick(lang, {
                    hi: 'आज मैं…',
                    en: 'Today, I…',
                    gu: 'આજે હું…',
                    kn: 'ಇಂದು ನಾನು…',
                  })}
                  style={[
                    body,
                    {
                      minHeight: 125,
                      height: undefined,
                      textAlignVertical: 'top',
                      paddingVertical: 12,
                    },
                  ]}
                />
              </View>
            )}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Save Gita Saar learning"
              accessibilityState={{ disabled: status === 'saving' }}
              disabled={status === 'saving'}
              testID="gita-saar-save-learning"
              onPress={() => void save()}
              style={[
                styles.save,
                {
                  backgroundColor: saved ? colors.goldTint : colors.saffronDeep,
                  borderColor: saved ? colors.gold : colors.saffronDeep,
                  borderRadius: radii.md,
                },
              ]}
            >
              <ProseParagraph
                style={[
                  body,
                  {
                    color: saved ? colors.saffronDeep : colors.onPrimary,
                    flex: 1,
                  },
                ]}
              >
                {status === 'saving'
                  ? pick(lang, {
                      hi: 'सहेज रहे हैं…',
                      en: 'Saving…',
                      gu: 'સાચવી રહ્યા છીએ…',
                      kn: 'ಉಳಿಸಲಾಗುತ್ತಿದೆ…',
                    })
                  : saved
                    ? pick(lang, {
                        hi: 'सीख सहेज ली गई',
                        en: 'Teaching saved',
                        gu: 'શીખ સાચવી લીધી',
                        kn: 'ಕಲಿಕೆ ಉಳಿಸಲಾಗಿದೆ',
                      })
                    : reflection.trim()
                      ? pick(lang, {
                          hi: 'सीख और विचार सहेजें',
                          en: 'Save teaching & reflection',
                          gu: 'શીખ અને વિચાર સાચવો',
                          kn: 'ಕಲಿಕೆ ಮತ್ತು ವಿಚಾರ ಉಳಿಸಿ',
                        })
                      : pick(lang, {
                          hi: 'सीख सहेजें',
                          en: 'Keep this teaching',
                          gu: 'શીખ સાચવો',
                          kn: 'ಕಲಿಕೆ ಉಳಿಸಿ',
                        })}
              </ProseParagraph>
              <AppIcon
                name={saved ? 'saved' : 'next'}
                size={21}
                color={saved ? colors.saffronDeep : colors.onPrimary}
              />
            </Pressable>
            <ProseParagraph
              accessibilityLiveRegion="polite"
              style={[
                label,
                {
                  color:
                    status === 'error' ? colors.avoidDeep : colors.inkMuted,
                  marginTop: 10,
                  textAlign: 'center',
                },
              ]}
            >
              {status === 'error'
                ? pick(lang, {
                    hi: 'सहेजा नहीं जा सका। आपका लिखा यहीं है; फिर कोशिश करें।',
                    en: 'Could not save. Your writing is still here; try again.',
                    gu: 'સાચવી શકાયું નથી. તમારું લખાણ અહીં છે; ફરી પ્રયાસ કરો.',
                    kn: 'ಉಳಿಸಲಾಗಲಿಲ್ಲ. ನಿಮ್ಮ ಬರಹ ಇಲ್ಲಿದೆ; ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.',
                  })
                : saved
                  ? pick(lang, {
                      hi: 'मेरी सीख में कभी भी लौटकर पढ़ें।',
                      en: 'Return to it anytime in My learning.',
                      gu: 'મારી શીખમાં ગમે ત્યારે ફરી વાંચો.',
                      kn: 'ನನ್ನ ಕಲಿಕೆಯಲ್ಲಿ ಮತ್ತೆ ಓದಿ.',
                    })
                  : pick(lang, {
                      hi: 'आपके निजी विचार, आपकी सीख के साथ।',
                      en: 'Your private reflections, kept with your learning.',
                      gu: 'તમારા ખાનગી વિચારો, તમારી શીખ સાથે.',
                      kn: 'ನಿಮ್ಮ ಖಾಸಗಿ ವಿಚಾರಗಳು, ನಿಮ್ಮ ಕಲಿಕೆಯ ಜೊತೆಗೆ.',
                    })}
            </ProseParagraph>
          </View>
        )}
        {closing && (
          <View style={[styles.closing, { borderColor: colors.gold }]}>
            <ProseParagraph style={label}>
              {pick(lang, {
                hi: 'एक पंक्ति में',
                en: 'In one line',
                gu: 'એક પંક્તિમાં',
                kn: 'ಒಂದು ಸಾಲಿನಲ್ಲಿ',
              })}
            </ProseParagraph>
            <ProseParagraph
              style={[body, { color: colors.saffronDeep, marginTop: 12 }]}
            >
              {meaningByLang(lang, closing.hi, closing.en)}
            </ProseParagraph>
          </View>
        )}
      </AutoSlideScrollView>
    </View>
  );
}
const styles = StyleSheet.create({
  page: { overflow: 'hidden' },
  scroll: { flex: 1 },
  content: { paddingTop: 12, paddingBottom: 100 },
  contextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minHeight: 44,
  },
  context: { flex: 1 },
  actions: { flexDirection: 'row', gap: 8 },
  sourceToggle: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  original: {
    padding: 18,
    marginTop: 16,
    borderWidth: StyleSheet.hairlineWidth,
  },
  handoff: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    marginBottom: 16,
  },
  group: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 20,
    marginBottom: 24,
  },
  explanation: { marginBottom: 26 },
  learningRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    paddingVertical: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  learningSymbol: {
    width: 48,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 24,
  },
  learningCopy: { flex: 1 },
  takeaway: {
    padding: 20,
    borderWidth: StyleSheet.hairlineWidth,
    marginTop: 4,
    marginBottom: 18,
  },
  keep: { marginTop: 4 },
  writeToggle: {
    minHeight: 58,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginBottom: 18,
  },
  save: {
    minHeight: 56,
    paddingHorizontal: 18,
    paddingVertical: 13,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: StyleSheet.hairlineWidth,
  },
  closing: {
    paddingVertical: 24,
    borderTopWidth: StyleSheet.hairlineWidth,
    marginTop: 26,
  },
});
