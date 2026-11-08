import fs from 'node:fs';
import path from 'node:path';
const source = (file: string) => fs.readFileSync(path.resolve(__dirname, '..', file), 'utf8');

test('Pratha hub and reader are mounted lazily on each entry stack, keeping Back local', () => {
  for (const stack of ['Home', 'Panchang']) {
    const text = source(`${stack}StackNavigator.tsx`);
    for (const route of ['Pratha', 'PrathaReader']) {
      expect(text).toContain(`name="${route}"`);
      expect(text).toContain(`lazyScreen('${route}'`);
    }
  }
  expect(source('MoreStackNavigator.tsx')).not.toContain('Pratha');
  expect(source('../screens/HomeScreen.tsx')).not.toContain("navigate('Pratha')");
  expect(source('../screens/MoreScreen.tsx')).not.toContain("navigate('Pratha')");
  expect(source('../screens/SanatanParichayScreen.tsx')).toContain("navigate('Pratha')");
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

test.each([['Home', 'Home'], ['Panchang', 'PanchangHome']])('%s keeps its original initial screen', (stack, root) => {
  const text = source(`${stack}StackNavigator.tsx`);
  expect(text).toContain(`initialRouteName="${root}"`);
  expect(text.match(/initialRouteName=/g)).toHaveLength(1);
  expect(text.match(/<Stack\.Screen name="([^"]+)"/)?.[1]).toBe(root);
});
