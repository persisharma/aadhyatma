import React, { useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { View } from 'react-native';
import { GitaLanguageProvider } from '../../src/data/gita/language';
import { FontScaleProvider, useFontScale } from '../../src/contexts/FontScaleContext';
import { ThemeProvider } from '../../src/theme/ThemeContext';
import { KundaliExplorer } from '../../src/components/KundaliLearning';
import { syntheticLearningChart } from '../../src/panchang/__tests__/fixtures/learningChart';

const params = new URLSearchParams(location.search);
const lang = (params.get('lang') || 'hi');
const mode = params.get('view') === 'grahas' ? 'grahas' : 'chart';
const chart = syntheticLearningChart(true);

function Preview() {
  const { scale, setScale, isLoading } = useFontScale();
  const size = params.get('size') === 'L' ? 'L' : 'M';
  useEffect(() => { if (!isLoading) setScale(size); }, [isLoading, size, setScale]);
  useEffect(() => { document.documentElement.dataset.ready = !isLoading && scale === size ? 'true' : 'false'; }, [isLoading, scale, size]);
  return <View style={{ padding: 24 }}><KundaliExplorer chart={chart} mode={mode} onReference={() => {}} /></View>;
}

createRoot(document.getElementById('root')).render(<GitaLanguageProvider initialLang={lang}><FontScaleProvider><ThemeProvider><Preview /></ThemeProvider></FontScaleProvider></GitaLanguageProvider>);
