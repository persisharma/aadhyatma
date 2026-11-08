import fs from 'node:fs';
import path from 'node:path';

const { inspectPublicSource, publicModules } = require('../../../../scripts/content-source-ui-policy.cjs');

test.each([
  '<Text>Sources & context</Text>',
  '<Text>{source.edition}</Text>',
  '<Text>{story.sourceNote}</Text>',
  '<Text>{sanatanSources[id].title}</Text>',
  "L('स्रोत-सत्यापित (PRD-23)', 'Source-verified (PRD-23)')",
  '<Text>{temple.sources.map(s => s.label).join(", ")}</Text>',
  "import SourceCredits from '@/components/sanatan/SourceCredits';",
])('rejects the known research leakage pattern: %s', code => {
  expect(inspectPublicSource(code).length).toBeGreaterThan(0);
});

test('allows canonical identity, author credit, actual reader links and factual context', () => {
  expect(inspectPublicSource(`<Text>गीता 4.7 · कबीर</Text>;
    <Text>Children’s retelling</Text>;
    <Pressable onPress={() => navigation.navigate('GitaReader', {chapter: 4})} />;
    <Image source={painting} />;`)).toEqual([]);
});

test('all public screen, component, Ask intent and share modules keep research metadata internal', () => {
  const root = path.resolve(__dirname, '../../../..');
  const files: string[] = publicModules(root);
  expect(files.length).toBeGreaterThan(200);
  const findings = files.flatMap(file => inspectPublicSource(fs.readFileSync(file, 'utf8'), path.relative(root, file)));
  expect(findings).toEqual([]);
});
