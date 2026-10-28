import fs from 'node:fs';
import path from 'node:path';
const source = (file: string) => fs.readFileSync(path.resolve(__dirname, '..', file), 'utf8');

test('Pratha hub and reader are mounted lazily on each entry stack, keeping Back local', () => {
  for (const stack of ['Home', 'More', 'Panchang']) {
    const text = source(`${stack}StackNavigator.tsx`);
    for (const route of ['Pratha', 'PrathaReader']) {
      expect(text).toContain(`name="${route}"`);
      expect(text).toContain(`lazyScreen('${route}'`);
    }
  }
});

test('contextual reader door sits between the story and observance instructions', () => {
  const text = source('../screens/ObservanceDetailScreen.tsx');
  const start = text.indexOf('{/* Story / Katha */}');
  const card = text.indexOf('<PrathaObservanceCard');
  const end = text.indexOf('{/* "How to observe"');
  expect(start).toBeLessThan(card);
  expect(card).toBeLessThan(end);
  expect(text).toContain("navigation.navigate('PrathaReader', { prathaId })");
});
