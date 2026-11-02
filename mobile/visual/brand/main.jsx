import React, { useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { Pressable, View } from 'react-native';
import { GitaLanguageProvider } from '../../src/data/gita/language';
import { FontScaleProvider, useFontScale } from '../../src/contexts/FontScaleContext';
import { ThemeProvider } from '../../src/theme/ThemeContext';
import HomeWordmark from '../../src/components/HomeWordmark';
import AppIcon from '../../src/components/AppIcon';
const params = new URLSearchParams(location.search);
function Header() {
  const { scale, setScale, isLoading } = useFontScale();
  const size = params.get('size') === 'L' ? 'L' : 'M';
  useEffect(() => { if (!isLoading) setScale(size); }, [isLoading, setScale, size]);
  useEffect(() => { document.documentElement.dataset.ready = !isLoading && scale === size ? 'true' : 'false'; }, [isLoading, scale, size]);
  return <View style={{ paddingHorizontal: 16, paddingTop: 20 }}><View testID="header-fixture" style={{ alignItems: 'center' }}>
    <HomeWordmark compact={window.innerWidth - 32 < 350} />
    <Pressable testID="settings-fixture" style={{ position: 'absolute', top: 0, right: 0, width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}><AppIcon name="settings" size={24} color="#6F3F1D" /></Pressable>
  </View></View>;
}
createRoot(document.getElementById('root')).render(<GitaLanguageProvider initialLang={params.get('lang') || 'hi'}><FontScaleProvider><ThemeProvider><Header /></ThemeProvider></FontScaleProvider></GitaLanguageProvider>);
