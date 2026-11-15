import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  AppState,
  Linking,
  ScrollView,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { HomeStackParamList } from "@/navigation/types";
import { navigateToEntryStart } from "@/navigation/entryRoutes";
import ReaderHeader from "@/components/ReaderHeader";
import LibraryCard from "@/components/LibraryCard";
import { useNewContent } from "@/contexts/NewContentContext";
import LanguageToggle from "@/components/LanguageToggle";
import DockedYouTubePlayer from "@/components/video/DockedYouTubePlayer";
import { useTheme } from "@/theme/ThemeContext";
import { useGitaLanguage } from "@/data/gita/language";
import { contentByLang, pick } from "@/utils/localize";
import { darshanForTemple, channelLiveUrl } from "@/data/darshan/channels";
import { baseTemples } from "@/data/theerth/templeRows";
import { relatedReadingsForDeity } from "@/data/theerth/relatedReadings";
import { resolveDarshanVideo } from "@/video/darshanSource";
import { useDarshanFavorites } from "@/video/darshanFavorites";
import {
  DarshanAction,
  DarshanText,
  darshanStyles as styles,
} from "@/components/darshan/DarshanUI";
type Phase = "loading" | "unavailable" | "playing" | "idle";
export default function DarshanPlayerScreen({
  navigation,
  route,
}: NativeStackScreenProps<HomeStackParamList, "DarshanPlayer">) {
  const { colors } = useTheme();
  const { markSeen } = useNewContent();
  const { lang } = useGitaLanguage();
  const { ids, ready, failed, toggle } = useDarshanFavorites();
  const channel = darshanForTemple(route.params.templeId);
  const temple = baseTemples.find((t) => t.id === route.params.templeId);
  const [phase, setPhase] = useState<Phase>("idle");
  const [videoId, setVideoId] = useState<string | null>(null);
  const [linkFailed, setLinkFailed] = useState(false);
  const request = useRef<{
    controller: AbortController;
    timer: ReturnType<typeof setTimeout>;
  } | null>(null);
  const cancel = useCallback(() => {
    if (request.current) {
      clearTimeout(request.current.timer);
      request.current.controller.abort();
      request.current = null;
    }
  }, []);
  const load = useCallback(() => {
    cancel();
    setVideoId(null);
    if (!channel?.livePage) {
      setPhase("unavailable");
      return;
    }
    setPhase("loading");
    const controller = new AbortController();
    const timer = setTimeout(() => {
      controller.abort();
      setPhase("unavailable");
    }, 12000);
    request.current = { controller, timer };
    void resolveDarshanVideo(channel, controller.signal)
      .then((id) => {
        if (!controller.signal.aborted) {
          setVideoId(id);
          setPhase(id ? "playing" : "unavailable");
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) setPhase("unavailable");
      })
      .finally(() => {
        clearTimeout(timer);
        if (request.current?.controller === controller) request.current = null;
      });
  }, [cancel, channel]);
  useEffect(() => {
    load();
    return cancel;
  }, [load, cancel]);
  // Never finish a lookup / start a WebView behind another route. Return requires
  // another explicit Watch tap, matching the existing player's no-auto-resume rule.
  useFocusEffect(
    useCallback(
      () => () => {
        cancel();
        setVideoId(null);
        setPhase("idle");
      },
      [cancel],
    ),
  );
  useEffect(() => {
    const sub = AppState.addEventListener("change", (next) => {
      if (next !== "active") {
        cancel();
        setVideoId(null);
        setPhase("idle");
      }
    });
    return () => sub.remove();
  }, [cancel]);
  const open = (url: string) => {
    setLinkFailed(false);
    void Linking.openURL(url).catch(() => setLinkFailed(true));
  };
  if (!channel || !temple)
    return (
      <SafeAreaView
        style={[styles.root, { backgroundColor: colors.parchment }]}
      >
        <ReaderHeader
          title={pick(lang, {
            hi: "मंदिर नहीं मिला",
            en: "Temple not found",
            gu: "મંદિર મળ્યું નથી",
            kn: "ದೇವಾಲಯ ಕಂಡುಬಂದಿಲ್ಲ",
          })}
          onBack={() => navigation.goBack()}
        />
      </SafeAreaView>
    );
  const title = contentByLang(lang, temple.nameHi, temple.nameEn);
  const retry = pick(lang, {
    hi: "प्रसारण फिर जाँचें",
    en: "Check broadcast again",
    gu: "પ્રસારણ ફરી તપાસો",
    kn: "ಪ್ರಸಾರವನ್ನು ಮತ್ತೆ ಪರಿಶೀಲಿಸಿ",
  });
  const readings = relatedReadingsForDeity(temple.deity).slice(0, 3);
  return (
    <SafeAreaView
      edges={["top", "left", "right"]}
      style={[styles.root, { backgroundColor: colors.parchment }]}
    >
      <ReaderHeader title={title} onBack={() => navigation.goBack()} />
      <View
        style={{
          width: "100%",
          maxWidth: 680,
          alignSelf: "center",
          paddingHorizontal: 22,
        }}
      >
        {phase === "playing" && videoId && (
          <DockedYouTubePlayer
            key={videoId}
            mapping={{
              videoId,
              titleHi: temple.nameHi,
              titleEn: temple.nameEn,
              channel: channel.channel,
            }}
            uiLang={lang}
            broadcast
            onRefreshSource={load}
            onClose={() => {
              setVideoId(null);
              setPhase("idle");
            }}
          />
        )}
      </View>
      <ScrollView contentContainerStyle={styles.body}>
        <LanguageToggle />
        {phase === "loading" && (
          <View accessibilityLiveRegion="polite">
            <ActivityIndicator color={colors.saffron} />
            <DarshanText>
              {pick(lang, {
                hi: "मंदिर का प्रसारण खोज रहे हैं…",
                en: "Finding the temple broadcast…",
                gu: "મંદિરનું પ્રસારણ શોધી રહ્યા છીએ…",
                kn: "ದೇವಾಲಯದ ಪ್ರಸಾರವನ್ನು ಹುಡುಕಲಾಗುತ್ತಿದೆ…",
              })}
            </DarshanText>
          </View>
        )}
        {phase === "idle" && channel.livePage && (
          <DarshanAction
            primary
            testID="darshan-watch"
            label={retry}
            onPress={load}
          />
        )}
        {phase === "unavailable" && (
          <View
            style={[
              styles.panel,
              {
                backgroundColor: colors.parchmentSoft,
                borderColor: colors.divider,
              },
            ]}
          >
            <DarshanText accessibilityLiveRegion="polite">
              {pick(lang, {
                hi: "ऐप में प्रसारण अभी उपलब्ध नहीं है। मंदिर के YouTube चैनल पर उपलब्धता देखें।",
                en: "An in-app broadcast is unavailable. Check the temple’s YouTube channel for availability.",
                gu: "ઍપમાં પ્રસારણ અત્યારે ઉપલબ્ધ નથી. મંદિરની YouTube ચેનલ પર ઉપલબ્ધતા જુઓ.",
                kn: "ಆ್ಯಪ್‌ನಲ್ಲಿ ಪ್ರಸಾರ ಈಗ ಲಭ್ಯವಿಲ್ಲ. ದೇವಾಲಯದ YouTube ಚಾನಲ್‌ನಲ್ಲಿ ಲಭ್ಯತೆ ನೋಡಿ.",
              })}
            </DarshanText>
            {channel.livePage && (
              <DarshanAction
                testID="darshan-retry"
                label={retry}
                onPress={load}
              />
            )}
          </View>
        )}
        <DarshanText>{channel.channel}</DarshanText>
        <DarshanText style={{ color: colors.inkMuted }}>
          {channel.kind === "tv"
            ? pick(lang, {
                hi: "यह मंदिर का भक्ति टीवी प्रसारण है; गर्भगृह का निरंतर कैमरा नहीं।",
                en: "Temple devotional TV programming; a continuous sanctum camera is not promised.",
                gu: "મંદિરનું ભક્તિ ટીવી પ્રસારણ; ગર્ભગૃહનો સતત કૅમેરો હોવાની ખાતરી નથી.",
                kn: "ದೇವಾಲಯದ ಭಕ್ತಿ ಟಿವಿ ಪ್ರಸಾರ; ನಿರಂತರ ಗರ್ಭಗುಡಿ ಕ್ಯಾಮೆರಾ ಪ್ರಸಾರ ಖಚಿತವಲ್ಲ.",
              })
            : pick(lang, {
                hi: "प्रसारण और उसका समय मंदिर द्वारा नियंत्रित हैं। यहाँ दिखना अभी लाइव होने की पुष्टि नहीं है।",
                en: "The temple controls its broadcast and timings. A listed broadcast is not confirmation that it is live now.",
                gu: "પ્રસારણ અને સમય મંદિર નિયંત્રિત કરે છે. અહીં દેખાવું એટલે અત્યારે લાઇવ હોવાની પુષ્ટિ નથી.",
                kn: "ಪ್ರಸಾರ ಮತ್ತು ಸಮಯವನ್ನು ದೇವಾಲಯ ನಿಯಂತ್ರಿಸುತ್ತದೆ. ಇಲ್ಲಿ ಕಾಣುವುದು ಈಗ ಲೈವ್ ಇದೆ ಎಂಬ ದೃಢೀಕರಣವಲ್ಲ.",
              })}
        </DarshanText>
        <DarshanAction
          primary={phase !== "playing"}
          testID="darshan-youtube"
          label={pick(lang, {
            hi: "YouTube में खोलें",
            en: "Open in YouTube",
            gu: "YouTube માં ખોલો",
            kn: "YouTube ನಲ್ಲಿ ತೆರೆ",
          })}
          onPress={() => open(channelLiveUrl(channel))}
        />
          {!new URL(channel.sourceUrl).hostname.endsWith('youtube.com') && <DarshanAction testID="darshan-website" label={pick(lang, { hi: 'मंदिर की वेबसाइट पर जाएँ', en: 'Visit temple website', gu: 'મંદિરની વેબસાઇટ પર જાઓ', kn: 'ದೇವಾಲಯದ ವೆಬ್‌ಸೈಟ್‌ಗೆ ಭೇಟಿ ನೀಡಿ' })} onPress={() => open(new URL(channel.sourceUrl).origin + '/')} />}
      {linkFailed && (
          <DarshanText accessibilityLiveRegion="polite">
            {pick(lang, {
              hi: "लिंक नहीं खुल सका। फिर प्रयास करें।",
              en: "Could not open the link. Please try again.",
              gu: "લિંક ખૂલી શકી નથી. ફરી પ્રયાસ કરો.",
              kn: "ಲಿಂಕ್ ತೆರೆಯಲಾಗಲಿಲ್ಲ. ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.",
            })}
          </DarshanText>
        )}
        <DarshanAction
          testID="darshan-save"
          disabled={!ready}
          label={
            ids.includes(channel.templeId)
              ? pick(lang, {
                  hi: "पसंदीदा से हटाएँ",
                  en: "Remove favourite",
                  gu: "મનપસંદમાંથી દૂર કરો",
                  kn: "ಮೆಚ್ಚಿನವುಗಳಿಂದ ತೆಗೆಯಿರಿ",
                })
              : pick(lang, {
                  hi: "पसंदीदा मंदिर में जोड़ें",
                  en: "Add to favourite temples",
                  gu: "મનપસંદ મંદિરમાં ઉમેરો",
                  kn: "ಮೆಚ್ಚಿನ ದೇವಾಲಯಗಳಿಗೆ ಸೇರಿಸಿ",
                })
          }
          onPress={() => toggle(channel.templeId)}
        />
        {failed && (
          <DarshanText>
            {pick(lang, {
              hi: "पसंदीदा मंदिर सहेजे या पढ़े नहीं जा सके। मंदिर सूची से फिर प्रयास करें।",
              en: "Could not save or load favourites. Retry from the temple list.",
              gu: "મનપસંદ મંદિરો સાચવી કે વાંચી શકાયા નથી. મંદિર સૂચિમાંથી ફરી પ્રયાસ કરો.",
              kn: "ಮೆಚ್ಚಿನವುಗಳನ್ನು ಉಳಿಸಲು ಅಥವಾ ಓದಲು ಆಗಲಿಲ್ಲ. ದೇವಾಲಯ ಪಟ್ಟಿಯಿಂದ ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.",
            })}
          </DarshanText>
        )}
        <DarshanAction
          testID="darshan-guide"
          label={pick(lang, {
            hi: "मंदिर का परिचय",
            en: "Temple guide",
            gu: "મંદિરનો પરિચય",
            kn: "ದೇವಾಲಯದ ಪರಿಚಯ",
          })}
          onPress={() =>
            navigation.navigate("TheerthDetail", { templeId: temple.id })
          }
        />
        {!!readings.length && (
          <DarshanText accessibilityRole="header">
            {pick(lang, {
              hi: "दर्शन के बाद पाठ",
              en: "Read after Darshan",
              gu: "દર્શન પછી પાઠ",
              kn: "ದರ್ಶನದ ನಂತರ ಪಠಣ",
            })}
          </DarshanText>
        )}
        {readings.map((entry) => (
          <LibraryCard
            key={entry.id}
            entry={entry}
            onPress={() => {
              markSeen(entry.id);
              navigateToEntryStart(navigation, entry);
            }}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
