import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { Text } from 'react-native';

import DayVaasCards from '@/components/DayVaasCards';
import { computePanchangForDate, UJJAIN_GEO } from '@/panchang/engine';
import { FontScaleProvider } from '@/contexts/FontScaleContext';
import { GitaLanguageProvider } from '@/data/gita/language';
import { ThemeProvider } from '@/theme/ThemeContext';

const trees: TestRenderer.ReactTestRenderer[] = [];
afterEach(() => {
  act(() => trees.splice(0).forEach((tree) => tree.unmount()));
});

async function textsFor(date: Date, lang: 'hi' | 'en'): Promise<string[]> {
  const p = computePanchangForDate(date, { location: UJJAIN_GEO });
  let tree!: TestRenderer.ReactTestRenderer;
  await act(async () => {
    tree = TestRenderer.create(
      <FontScaleProvider>
        <ThemeProvider>
          <GitaLanguageProvider initialLang={lang}>
            <DayVaasCards p={p} lang={lang} />
          </GitaLanguageProvider>
        </ThemeProvider>
      </FontScaleProvider>,
    );
  });
  trees.push(tree);
  const flat = (c: unknown): string =>
    Array.isArray(c) ? c.map(flat).join('') : typeof c === 'string' ? c : c && typeof c === 'object' && 'props' in (c as any) ? flat((c as any).props.children) : '';
  return tree.root.findAllByType(Text).map((n) => flat(n.props.children));
}

// Ujjain, Sun 27 Sep 2026: Moon in मीन all day (उत्तर), शूल पश्चिम, अग्नि वास
// पाताल until the प्रतिपदा ends, then पृथ्वी.
test('renders the यात्रा and हवन cards for a real day', async () => {
  const t = await textsFor(new Date(2026, 8, 27), 'hi');
  expect(t).toContain('चन्द्रमा मीन में · उत्तर');
  expect(t).toContain('शूल पश्चिम');
  expect(t).toContain('रविवार — इस दिशा की यात्रा टालें');
  expect(t).toContain('हवन वर्जित');
  expect(t.some((s) => s.startsWith('पाताल · तक '))).toBe(true);
  expect(t).toContain('फिर पृथ्वी — हवन शुभ, शेष दिन');
});

test('names the Moon sign change when it falls within the day (English)', async () => {
  // Ujjain, Mon 28 Sep 2026: the Moon leaves मीन for मेष mid-morning.
  const t = await textsFor(new Date(2026, 8, 28), 'en');
  expect(t).toContain('Moon in Meena · North');
  expect(t.some((s) => /^from .* Mesha · East$/.test(s))).toBe(true);
  expect(t).toContain('Shool · East');
});
