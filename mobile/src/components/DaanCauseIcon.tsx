import React from 'react';
import { Image, type ImageSourcePropType } from 'react-native';
import type { DaanCause } from '@/data/daan';
import { PAINTED_ICON_DECODE } from './paintedIconDecode';

/**
 * Painted Storybook miniatures for the nine दान प्रयोजन (causes), shown on the
 * दान-द्वार cause grid. Bundled transparent artwork — never loaded from the
 * network. One entry per `DaanCause`, so the map is exhaustive by type.
 * Asset set + budget pinned by `storybookAssets.test.ts` (daan-seva block).
 */
export const daanCauseIconSources: Readonly<Record<DaanCause, ImageSourcePropType>> = {
  anna: require('@assets/icons/daan-seva/seva-anna.png'),
  gau: require('@assets/icons/daan-seva/seva-gau.png'),
  bal: require('@assets/icons/daan-seva/seva-bal.png'),
  vriddha: require('@assets/icons/daan-seva/seva-vriddha.png'),
  vidya: require('@assets/icons/daan-seva/seva-vidya.png'),
  arogya: require('@assets/icons/daan-seva/seva-arogya.png'),
  vastra: require('@assets/icons/daan-seva/seva-vastra.png'),
  jeev: require('@assets/icons/daan-seva/seva-jeev.png'),
  aapada: require('@assets/icons/daan-seva/seva-aapada.png'),
};

export default function DaanCauseIcon({ cause, size = 48, testID }: {
  cause: DaanCause;
  size?: number;
  testID?: string;
}) {
  return (
    <Image
      source={daanCauseIconSources[cause]}
      {...PAINTED_ICON_DECODE}
      style={{ width: size, height: size }}
      resizeMode="contain"
      fadeDuration={0}
      accessible={false}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      testID={testID ?? `daan-cause-icon-${cause}`}
    />
  );
}
