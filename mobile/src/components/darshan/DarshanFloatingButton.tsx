import React from "react";
import { Pressable, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useAudioPlayerContext } from "@/contexts/AudioPlayerContext";
import { useTheme } from "@/theme/ThemeContext";
import { useGitaLanguage } from "@/data/gita/language";
import { contentByLang, pick } from "@/utils/localize";
import { pillTextStyle } from "@/utils/langType";
import { useFontScale } from "@/contexts/FontScaleContext";
import FeatureIcon from "@/components/FeatureIcon";

/** Keep audio's changing playback state out of Home's expensive render tree.
 * This leaf may update at player cadence; Home never subscribes to that clock.
 * The player itself remains lazy in AudioPlayerProvider. */
export default function DarshanFloatingButton({
  onPress,
}: {
  onPress: () => void;
}) {
  const { currentTrack: darshanAudioTrack } = useAudioPlayerContext();
  const { colors, typography, elevation } = useTheme();
  const { lang } = useGitaLanguage();
  const { factor } = useFontScale();
  return (
    <Pressable
      testID="home-darshan-floating"
      accessibilityRole="button"
      accessibilityLabel={pick(lang, {
        hi: "मंदिर दर्शन खोलें",
        en: "Open temple Darshan",
        gu: "મંદિર દર્શન ખોલો",
        kn: "ದೇವಾಲಯದ ದರ್ಶನ ತೆರೆಯಿರಿ",
        mr: "मंदिर दर्शन उघडा",
        te: "ఆలయ దర్శనం తెరవండి",
      })}
      onPress={onPress}
      style={({ pressed }) => [
        {
          ...elevation.lifted,
          position: "absolute",
          right: 18,
          bottom: darshanAudioTrack ? 100 : 16,
          minHeight: 52,
          maxWidth: "80%",
          borderRadius: 30,
          backgroundColor: colors.darshanTo,
          zIndex: 5,
          opacity: pressed ? 0.75 : 1,
        },
      ]}
    >
      <LinearGradient
        colors={[colors.darshanFrom, colors.darshanTo]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          minHeight: 52,
          borderRadius: 30,
          borderWidth: 1,
          borderColor: colors.darshanBorder,
          paddingLeft: 10,
          paddingRight: 16,
          paddingVertical: 9,
          flexDirection: "row",
          alignItems: "center",
          gap: 7,
        }}
      >
        <FeatureIcon name="theerth" />
        <Text
          style={[
            pillTextStyle(lang, typography.versePill),
            { color: colors.darshanInk, fontSize: 16 * factor, flexShrink: 1 },
          ]}
        >
          {contentByLang(lang, "दर्शन", "Darshan")}
        </Text>
        {/* Decorative gold bead from Option C; never a live-status indicator. */}
        <View
          accessible={false}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          style={{
            width: 5,
            height: 5,
            borderRadius: 3,
            backgroundColor: colors.darshanBead,
          }}
        />
      </LinearGradient>
    </Pressable>
  );
}
