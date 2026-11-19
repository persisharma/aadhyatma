import React from "react";
import TestRenderer, { act } from "react-test-renderer";
import { StyleSheet, Text } from "react-native";
import { ThemeProvider } from "@/theme/ThemeContext";
import { GitaLanguageProvider } from "@/data/gita/language";
import DarshanFloatingButton from "../darshan/DarshanFloatingButton";
import FeatureIcon from "../FeatureIcon";
let mockHasTrack = false;
let mockFontFactor = 1;
jest.mock("@/contexts/FontScaleContext", () => ({
  useFontScale: () => ({ factor: mockFontFactor }),
}));
jest.mock("@/contexts/AudioPlayerContext", () => ({
  useAudioPlayerContext: () => ({
    currentTrack: mockHasTrack ? { id: "recorded-bhajan" } : null,
  }),
}));
it.each([false, true])(
  "clears the audio mini-player and opens Darshan with a 52pt target (audio=%s)",
  async (hasTrack) => {
    mockHasTrack = hasTrack;
    mockFontFactor = 1;
    const open = jest.fn();
    let tree!: TestRenderer.ReactTestRenderer;
    await act(async () => {
      tree = TestRenderer.create(
        <ThemeProvider>
          <GitaLanguageProvider initialLang="hi">
            <DarshanFloatingButton onPress={open} />
          </GitaLanguageProvider>
        </ThemeProvider>,
      );
    });
    const button = tree.root.findAll(
      (n) =>
        n.props.testID === "home-darshan-floating" &&
        typeof n.props.onPress === "function",
    )[0];
    const style = StyleSheet.flatten(button.props.style({ pressed: false }));
    expect(style).toMatchObject({
      minHeight: 52,
      bottom: hasTrack ? 100 : 16,
      right: 18,
    });
    expect(button.props.accessibilityRole).toBe("button");
    expect(tree.root.findByType(FeatureIcon).props.name).toBe("theerth");
    act(() => button.props.onPress());
    expect(open).toHaveBeenCalledTimes(1);
    act(() => tree.unmount());
  },
);

it.each([
  ["hi", "मंदिर दर्शन खोलें"],
  ["en", "Open temple Darshan"],
  ["gu", "મંદિર દર્શન ખોલો"],
  ["kn", "ದೇವಾಲಯದ ದರ್ಶನ ತೆರೆಯಿರಿ"],
] as const)("announces one %s action and lets its label grow at both reading sizes", async (lang, label) => {
  for (const factor of [1, 1.15]) {
    mockFontFactor = factor;
    let tree!: TestRenderer.ReactTestRenderer;
    await act(async () => {
      tree = TestRenderer.create(
        <ThemeProvider>
          <GitaLanguageProvider initialLang={lang}>
            <DarshanFloatingButton onPress={jest.fn()} />
          </GitaLanguageProvider>
        </ThemeProvider>,
      );
    });
    const button = tree.root.findAll((n) => n.props.testID === "home-darshan-floating" && typeof n.props.onPress === "function")[0];
    expect(button.props.accessibilityLabel).toBe(label);
    const text = tree.root.findByType(Text);
    expect(StyleSheet.flatten(text.props.style).fontSize).toBe(16 * factor);
    expect(text.props.numberOfLines).toBeUndefined();
    expect(text.props.allowFontScaling).not.toBe(false);
    act(() => tree.unmount());
  }
});
