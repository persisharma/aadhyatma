import React from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { HomeStackParamList } from "@/navigation/types";
import { useTheme } from "@/theme/ThemeContext";
import { useGitaLanguage } from "@/data/gita/language";
import { pick } from "@/utils/localize";
import { darshanChannels } from "@/data/darshan/channels";
import { useDarshanFavorites } from "@/video/darshanFavorites";
import {
  DarshanAction,
  DarshanCard,
  DarshanText,
} from "@/components/darshan/DarshanUI";
import { useFontScale } from "@/contexts/FontScaleContext";
import AppIcon from "@/components/AppIcon";
export default function DarshanQuickScreen({
  navigation,
}: NativeStackScreenProps<HomeStackParamList, "DarshanQuick">) {
  const { colors } = useTheme();
  const { factor } = useFontScale();
  const { lang } = useGitaLanguage();
  const insets = useSafeAreaInsets();
  const { ids } = useDarshanFavorites();
  const channels = [
    ...darshanChannels.filter((c) => ids.includes(c.templeId)),
    ...darshanChannels.filter((c) => !ids.includes(c.templeId)),
  ].slice(0, 2);
  const close = pick(lang, {
    hi: "बंद करें",
    en: "Close",
    gu: "બંધ કરો",
    kn: "ಮುಚ್ಚಿ",
    mr: "बंद करा",
    te: "మూసివేయండి",
  });
  return (
    <View style={[styles.root, { backgroundColor: colors.modalBackdrop }]}>
      <Pressable
        style={StyleSheet.absoluteFill}
        onPress={() => navigation.goBack()}
        accessibilityRole="button"
        accessibilityLabel={close}
      />
      <View
        accessibilityViewIsModal
        style={[
          styles.sheet,
          {
            backgroundColor: colors.parchment,
            paddingBottom: Math.max(16, insets.bottom),
          },
        ]}
      >
        <View style={[styles.handle, { backgroundColor: colors.divider }]} />
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.heading}>
            <DarshanText
              accessibilityRole="header"
              style={{
                fontSize: 24 * factor,
                lineHeight: 36 * factor,
                flex: 1,
              }}
            >
              {pick(lang, {
                hi: "मंदिर दर्शन",
                en: "Temple Darshan",
                gu: "મંદિર દર્શન",
                kn: "ದೇವಾಲಯ ದರ್ಶನ",
                mr: "मंदिर दर्शन",
                te: "ఆలయ దర్శనం",
              })}
            </DarshanText>
            <Pressable
              testID="darshan-close"
              onPress={() => navigation.goBack()}
              accessibilityRole="button"
              accessibilityLabel={close}
              style={styles.close}
            >
              <AppIcon name="close" size={20} color={colors.ink} />
            </Pressable>
          </View>
          <DarshanText>
            {pick(lang, {
              hi: "कुछ पल प्रभु के साथ। मंदिर के आधिकारिक प्रसारण से जुड़ें।",
              en: "A moment with the divine. Join an official temple broadcast.",
              gu: "પ્રભુ સાથે થોડી ક્ષણો. મંદિરના અધિકૃત પ્રસારણ સાથે જોડાઓ.",
              kn: "ಭಗವಂತನೊಂದಿಗೆ ಕೆಲವು ಕ್ಷಣಗಳು. ದೇವಾಲಯದ ಅಧಿಕೃತ ಪ್ರಸಾರಕ್ಕೆ ಸೇರಿ.",
              mr: "प्रभूसोबत काही क्षण. मंदिराच्या अधिकृत प्रसारणात सामील व्हा.",
              te: "భగవంతునితో కొన్ని క్షణాలు. ఆలయ అధికారిక ప్రసారంలో చేరండి.",
            })}
          </DarshanText>
          {channels.map((channel) => (
            <DarshanCard
              key={channel.templeId}
              channel={channel}
              onPress={() =>
                navigation.replace("DarshanPlayer", {
                  templeId: channel.templeId,
                })
              }
            />
          ))}
          <DarshanAction
            primary
            testID="darshan-view-all"
            label={pick(lang, {
              hi: "सभी मंदिर देखें",
              en: "View all temples",
              gu: "બધાં મંદિરો જુઓ",
              kn: "ಎಲ್ಲಾ ದೇವಾಲಯಗಳನ್ನು ನೋಡಿ",
              mr: "सर्व मंदिरे पाहा",
              te: "అన్ని ఆలయాలు చూడండి",
            })}
            onPress={() => navigation.replace("DarshanList")}
          />
        </ScrollView>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: "flex-end" },
  sheet: {
    maxHeight: "85%",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  handle: {
    width: 42,
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
    marginVertical: 12,
  },
  content: {
    paddingHorizontal: 22,
    paddingBottom: 14,
    gap: 16,
    maxWidth: 680,
    width: "100%",
    alignSelf: "center",
  },
  heading: { flexDirection: "row", alignItems: "center", gap: 8 },
  close: {
    minWidth: 48,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
  },
});
