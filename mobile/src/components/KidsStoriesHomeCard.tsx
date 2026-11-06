import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { useGitaLanguage } from '@/data/gita/language';
import { useTheme } from '@/theme/ThemeContext';
import { pick } from '@/utils/localize';
import HomeBannerCard from '@/components/HomeBannerCard';
import { assetBaseUrl, remoteAssetRequest } from '@/data/assetManifest';
import kidsStoryManifest from '@/data/kidsStoryAssetManifest.json';
import { useCachedAsset } from '@/utils/useCachedAsset';

const storyLibraryRequest = remoteAssetRequest(kidsStoryManifest, 'story-library', assetBaseUrl());

type Props = {
  onPress: () => void;
  onPressIn: () => void;
  onPressOut: () => void;
};

/** A deity-neutral picture-book door to the story library. */
export default function KidsStoriesHomeCard({ onPress, onPressIn, onPressOut }: Props) {
  const { colors } = useTheme();
  const { lang } = useGitaLanguage();
  const storyLibraryUri = useCachedAsset(storyLibraryRequest);
  const title = pick(lang, {
    hi: 'बच्चों की चित्र-कथाएँ', en: 'Stories for Kids',
    gu: 'બાળકોની ચિત્રવાર્તાઓ', kn: 'ಮಕ್ಕಳ ಚಿತ್ರಕಥೆಗಳು',
  });
  const action = pick(lang, {
    hi: 'पात्र चुनें', en: 'Choose a deity',
    gu: 'દેવતા પસંદ કરો', kn: 'ದೇವರನ್ನು ಆಯ್ಕೆಮಾಡಿ',
  });
  return (
    <HomeBannerCard
      testID="home-kids-stories-card"
      titleHi="बच्चों की चित्र-कथाएँ"
      titleEn="Stories for Kids"
      localizedTitle={title}
      action={action}
      accessibilityLabel={`${title}. ${action}.`}
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      artwork={storyLibraryUri
        ? <Image source={{ uri: storyLibraryUri }} resizeMode="cover" accessible={false} style={styles.cover} />
        : <View accessible={false} style={[styles.cover, { backgroundColor: colors.parchmentSoft }]} />}
    />
  );
}

const styles = StyleSheet.create({
  cover: { width: 100, height: 100, borderRadius: 12 },
});
