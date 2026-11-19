import React from "react";
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
  type TextProps,
} from "react-native";
import { useTheme } from "@/theme/ThemeContext";
import { useGitaLanguage } from "@/data/gita/language";
import { useFontScale } from "@/contexts/FontScaleContext";
import { cardFontByLang, meaningToken } from "@/utils/langType";
import { contentByLang, pick } from "@/utils/localize";
import { baseTemples } from "@/data/theerth/templeRows";
import { storybookSources } from "@/components/storybookSources";
import AppIcon from "@/components/AppIcon";
import type { DarshanChannel } from "@/data/darshan/channels";

export function DarshanText({ style, ...props }: TextProps) {
  const { colors, typography } = useTheme();
  const { lang } = useGitaLanguage();
  const { factor } = useFontScale();
  return (
    <Text
      {...props}
      style={[
        {
          color: colors.ink,
          fontFamily: meaningToken(lang, typography).fontFamily,
          fontSize: 17 * factor,
          lineHeight: 27 * factor,
        },
        style,
      ]}
    />
  );
}
export function DarshanAction({
  label,
  onPress,
  testID,
  disabled = false,
  primary = false,
}: {
  label: string;
  onPress: () => void;
  testID?: string;
  disabled?: boolean;
  primary?: boolean;
}) {
  const { colors } = useTheme();
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      disabled={disabled}
      accessibilityState={{ disabled }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.action,
        {
          backgroundColor: primary ? colors.saffron : colors.parchmentSoft,
          borderWidth: 1,
          borderColor: colors.divider,
          opacity: disabled ? 0.5 : pressed ? 0.7 : 1,
        },
      ]}
    >
      <DarshanText
        style={{
          color: primary ? colors.onPrimary : colors.saffronDeep,
          textAlign: "center",
        }}
      >
        {label}
      </DarshanText>
    </Pressable>
  );
}
export function DarshanCard({
  channel,
  onPress,
}: {
  channel: DarshanChannel;
  onPress: () => void;
}) {
  const { colors } = useTheme();
  const { lang } = useGitaLanguage();
  const temple = baseTemples.find((t) => t.id === channel.templeId);
  if (!temple) return null;
  const art = channel.relatedTempleIds?.length
    ? storybookSources.theerth
    : temple.deity === "shiva"
      ? storybookSources.shiva
      : temple.deity === "krishna"
        ? storybookSources.krishna
        : temple.deity === "durga"
          ? storybookSources.durga
          : storybookSources.theerth;
  const mode = pick(lang, {
    hi: 'दर्शन देखें', en: 'Watch Darshan', gu: 'દર્શન જુઓ', kn: 'ದರ್ಶನ ವೀಕ್ಷಿಸಿ',
  });
  return (
    <Pressable
      testID={`darshan-temple-${temple.id}`}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.parchmentSoft,
          borderColor: colors.divider,
          opacity: pressed ? 0.7 : 1,
        },
      ]}
    >
      <Image
        source={art}
        resizeMode="contain"
        style={styles.art}
        accessible={false}
      />
      <View style={{ flex: 1, minWidth: 0 }}>
        <DarshanText style={{ fontFamily: cardFontByLang(lang) }}>
          {[
            temple,
            ...baseTemples.filter((t) =>
              channel.relatedTempleIds?.includes(t.id),
            ),
          ]
            .map((t) => contentByLang(lang, t.nameHi, t.nameEn))
            .join(" · ")}
        </DarshanText>
        <DarshanText style={{ color: colors.inkMuted }}>
          {contentByLang(lang, temple.cityHi, temple.cityEn)}
        </DarshanText>
        <DarshanText style={{ color: colors.saffronDeep }}>{mode}</DarshanText>
      </View>
      <AppIcon name="play" size={20} color={colors.saffronDeep} />
    </Pressable>
  );
}
export const darshanStyles = StyleSheet.create({
  root: { flex: 1 },
  body: {
    paddingHorizontal: 22,
    paddingBottom: 40,
    gap: 16,
    width: "100%",
    maxWidth: 680,
    alignSelf: "center",
  },
  panel: { borderWidth: 1, borderRadius: 22, padding: 18, gap: 12 },
});
const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderWidth: 1,
    borderRadius: 22,
  },
  art: { width: 64, height: 74 },
  action: {
    minHeight: 48,
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 12,
    justifyContent: "center",
  },
});
