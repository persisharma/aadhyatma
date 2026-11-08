import React from 'react';
import { useGitaLanguage } from '@/data/gita/language';
import { contentByLang } from '@/utils/localize';
import HomeBannerCard from '@/components/HomeBannerCard';
import FramedPainting from '@/components/FramedPainting';

/** A single lazy Home door; the full learning registry stays outside launch evaluation. */
export default function SanatanHomeCard(props: { onPress: () => void; onPressIn: () => void; onPressOut: () => void }) {
  const { lang } = useGitaLanguage();
  const title = contentByLang(lang, 'सनातन परिचय', 'Sanatan Parichay');
  const subtitle = contentByLang(lang, 'कभी सोचा है? चित्रों से जानें परम्पराओं का अर्थ।', 'Ever wondered? Discover the meaning behind traditions.');
  const action = contentByLang(lang, 'कभी सोचा है? जानें', 'Explore traditions');
  return <HomeBannerCard {...props} testID="home-sanatan-card" titleHi="सनातन परिचय" titleEn="Sanatan Parichay"
    action={action} accessibilityLabel={`${title}. ${subtitle}`}
    artwork={<FramedPainting source={require('@assets/sanatan-parichay/basics.webp')} testID="sanatan-home-artwork" />} />;
}
