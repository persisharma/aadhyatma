import React, { useState } from "react";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { HomeStackParamList } from "@/navigation/types";
import ReaderHeader from "@/components/ReaderHeader";
import LanguageToggle from "@/components/LanguageToggle";
import TextField from "@/components/TextField";
import { useTheme } from "@/theme/ThemeContext";
import { useGitaLanguage } from "@/data/gita/language";
import { contentByLang, pick } from "@/utils/localize";
import { darshanChannels } from "@/data/darshan/channels";
import { baseTemples } from "@/data/theerth/templeRows";
import { useDarshanFavorites } from "@/video/darshanFavorites";
import {
  DarshanAction,
  DarshanCard,
  DarshanText,
  darshanStyles as styles,
} from "@/components/darshan/DarshanUI";
export default function DarshanListScreen({
  navigation,
}: NativeStackScreenProps<HomeStackParamList, "DarshanList">) {
  const { colors } = useTheme();
  const { lang } = useGitaLanguage();
  const [query, setQuery] = useState("");
  const [savedOnly, setSavedOnly] = useState(false);
  const { ids, ready, failed, retry } = useDarshanFavorites();
  const channels = darshanChannels.filter((c) => {
    if (savedOnly && !ids.includes(c.templeId)) return false;
    return baseTemples
      .filter((t) => t.id === c.templeId || c.relatedTempleIds?.includes(t.id))
      .some((temple) =>
        [
          temple.nameHi,
          temple.nameEn,
          temple.cityHi,
          temple.cityEn,
          contentByLang(lang, temple.nameHi, temple.nameEn),
          contentByLang(lang, temple.cityHi, temple.cityEn),
        ]
          .join(" ")
          .toLocaleLowerCase()
          .includes(query.trim().toLocaleLowerCase()),
      );
  });
  return (
    <SafeAreaView
      edges={["top", "left", "right"]}
      style={[styles.root, { backgroundColor: colors.parchment }]}
    >
      <ReaderHeader
        variant="index"
        title={pick(lang, {
          hi: "मंदिर दर्शन",
          en: "Temple Darshan",
          gu: "મંદિર દર્શન",
          kn: "ದೇವಾಲಯ ದರ್ಶನ",
          mr: "मंदिर दर्शन",
          te: "ఆలయ దర్శనం",
        })}
        onBack={() => navigation.goBack()}
      />
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.body}
      >
        <LanguageToggle />
        <DarshanText>
          {pick(lang, {
            hi: "प्रसारण मंदिर द्वारा संचालित हैं। दर्शन की उपलब्धता और समय बदल सकते हैं।",
            en: "Broadcasts are operated by the temples. Availability and timings may change.",
            gu: "પ્રસારણ મંદિરો દ્વારા સંચાલિત છે. ઉપલબ્ધતા અને સમય બદલાઈ શકે છે.",
            kn: "ಪ್ರಸಾರವನ್ನು ದೇವಾಲಯಗಳು ನಿರ್ವಹಿಸುತ್ತವೆ. ಲಭ್ಯತೆ ಮತ್ತು ಸಮಯ ಬದಲಾಗಬಹುದು.",
            mr: "प्रसारण मंदिरांद्वारे चालवले जाते. उपलब्धता आणि वेळ बदलू शकतात.",
            te: "ప్రసారాలను ఆలయాలే నిర్వహిస్తాయి. లభ్యత మరియు సమయాలు మారవచ్చు.",
          })}
        </DarshanText>
        <TextField
          testID="darshan-search"
          value={query}
          onChangeText={setQuery}
          placeholder={pick(lang, {
            hi: "मंदिर या शहर खोजें",
            en: "Search temple or city",
            gu: "મંદિર કે શહેર શોધો",
            kn: "ದೇವಾಲಯ ಅಥವಾ ನಗರ ಹುಡುಕಿ",
            mr: "मंदिर किंवा शहर शोधा",
            te: "ఆలయం లేదా నగరం వెతకండి",
          })}
          accessibilityLabel={pick(lang, {
            hi: "मंदिर खोजें",
            en: "Search temples",
            gu: "મંદિર શોધો",
            kn: "ದೇವಾಲಯ ಹುಡುಕಿ",
            mr: "मंदिर शोधा",
            te: "ఆలయాలు వెతకండి",
          })}
        />
        <DarshanAction
          testID="darshan-filter"
          disabled={!ready}
          label={
            savedOnly
              ? pick(lang, {
                  hi: "सभी मंदिर दिखाएँ",
                  en: "Show all temples",
                  gu: "બધાં મંદિરો બતાવો",
                  kn: "ಎಲ್ಲಾ ದೇವಾಲಯಗಳನ್ನು ತೋರಿಸಿ",
                  mr: "सर्व मंदिरे दाखवा",
                  te: "అన్ని ఆలయాలు చూపండి",
                })
              : pick(lang, {
                  hi: "मेरे पसंदीदा मंदिर",
                  en: "My favourite temples",
                  gu: "મારાં મનપસંદ મંદિરો",
                  kn: "ನನ್ನ ಮೆಚ್ಚಿನ ದೇವಾಲಯಗಳು",
                  mr: "माझी आवडती मंदिरे",
                  te: "నా ఇష్టమైన ఆలయాలు",
                })
          }
          onPress={() => setSavedOnly((v) => !v)}
        />
        {failed && (
          <View>
            <DarshanText>
              {pick(lang, {
                hi: "पसंदीदा मंदिर सहेजे या पढ़े नहीं जा सके।",
                en: "Could not save or load favourites.",
                gu: "મનપસંદ મંદિરો સાચવી કે વાંચી શકાયા નથી.",
                kn: "ಮೆಚ್ಚಿನವುಗಳನ್ನು ಉಳಿಸಲು ಅಥವಾ ಓದಲು ಆಗಲಿಲ್ಲ.",
                mr: "आवडती मंदिरे जतन किंवा लोड करता आली नाहीत.",
                te: "ఇష్టమైనవాటిని సేవ్ లేదా లోడ్ చేయలేకపోయాం.",
              })}
            </DarshanText>
            <DarshanAction
              label={pick(lang, {
                hi: "फिर प्रयास करें",
                en: "Try again",
                gu: "ફરી પ્રયાસ કરો",
                kn: "ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ",
                mr: "पुन्हा प्रयत्न करा",
                te: "మళ్లీ ప్రయత్నించండి",
              })}
              onPress={retry}
            />
          </View>
        )}
        {channels.map((channel) => (
          <DarshanCard
            key={channel.templeId}
            channel={channel}
            onPress={() =>
              navigation.navigate("DarshanPlayer", {
                templeId: channel.templeId,
              })
            }
          />
        ))}
        {!channels.length && (
          <DarshanText testID="darshan-empty">
            {pick(lang, {
              hi: "कोई मंदिर नहीं मिला। खोज बदलें या सभी मंदिर देखें।",
              en: "No temples found. Change the search or show all temples.",
              gu: "કોઈ મંદિર મળ્યું નથી. શોધ બદલો કે બધાં મંદિરો જુઓ.",
              kn: "ದೇವಾಲಯ ಕಂಡುಬಂದಿಲ್ಲ. ಹುಡುಕಾಟ ಬದಲಿಸಿ ಅಥವಾ ಎಲ್ಲವನ್ನೂ ನೋಡಿ.",
              mr: "कोणतेही मंदिर आढळले नाही. शोध बदला किंवा सर्व मंदिरे पाहा.",
              te: "ఆలయాలు ఏవీ కనబడలేదు. శోధన మార్చండి లేదా అన్ని ఆలయాలు చూడండి.",
            })}
          </DarshanText>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
