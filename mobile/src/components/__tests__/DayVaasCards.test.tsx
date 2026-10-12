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

// Ujjain, Sun 27 Sep 2026: Sun in कन्या, Moon in मीन all day (चन्द्र वास उत्तर),
// दिशा शूल पश्चिम (रविवार), अग्नि वास पाताल until प्रतिपदा ends, then पृथ्वी.
test('renders the four vaas cards for a real day', async () => {
  const t = await textsFor(new Date(2026, 8, 27), 'hi');
  // सूर्य — label + value only (the duplicate "सूर्य राशि" caption is dropped).
  expect(t).toContain('सूर्य');
  expect(t).toContain('कन्या');
  expect(t).not.toContain('सूर्य राशि');
  // चन्द्रमा — rashi · चन्द्र वास direction, with the favourable travel directions.
  expect(t).toContain('मीन · उत्तर');
  expect(t).toContain('चन्द्र वास');
  expect(t).toContain('उत्तर, पश्चिम शुभ');
  // दिशा शूल
  expect(t).toContain('पश्चिम');
  expect(t).toContain('रविवार — इस दिशा की');
  expect(t).toContain('यात्रा टालें');
  // अग्नि वास — पाताल bars havan, and names when it changes + what follows.
  expect(t).toContain('पाताल');
  expect(t.some((s) => s.startsWith('तक ') && s.includes('फिर पृथ्वी'))).toBe(true);
  expect(t).toContain('हवन वर्जित');
});

test('reads the sunrise rashi and omits the avoid-havan chip when havan is favoured (English)', async () => {
  // Ujjain, Mon 28 Sep 2026: Sun in Kanya; Moon in Meena at sunrise (North);
  // दिशा शूल East (Monday); अग्नि वास Prithvi (havan favoured) → no chip.
  const t = await textsFor(new Date(2026, 8, 28), 'en');
  expect(t).toContain('Kanya');
  expect(t).not.toContain('Sun sign');
  expect(t).toContain('Meena · North');
  expect(t).toContain('Chandra vaas');
  expect(t).toContain('North, West favoured');
  expect(t).toContain('East');
  expect(t).toContain('avoid travel');
  expect(t).toContain('Prithvi');
  // Havan is favoured at sunrise, so the avoid-havan chip must be absent.
  expect(t).not.toContain('avoid havan');
});
