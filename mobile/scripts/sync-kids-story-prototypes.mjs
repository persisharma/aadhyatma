// Reuse the existing review reader; the native JSON and Metro map remain canonical.
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';

const root = new URL('../../', import.meta.url);
const frames = JSON.parse(readFileSync(new URL('mobile/src/components/kidsStoryArtFrames.json', root), 'utf8'));
const template = readFileSync(new URL('docs/kids-stories-prototype.html', root), 'utf8').replace(/const frames = (\{.*?\});/, () => `const frames = ${JSON.stringify(frames)};`);
writeFileSync(new URL('docs/kids-stories-prototype.html', root), template);
const component = readFileSync(new URL('mobile/src/components/KidsStoryArt.tsx', root), 'utf8');
const assets = new Map([...component.matchAll(/(\w+): '([a-z]{2}-\d+)'/g)].map(match => [match[1], match[2]]));
const ids = readdirSync(new URL('mobile/src/data/kidsStories/', root))
  .filter(name => name.endsWith('.json') && name !== 'krishna-janma.json')
  .map(name => name.slice(0, -5));
for (const id of ids) {
  const story = JSON.parse(readFileSync(new URL(`mobile/src/data/kidsStories/${id}.json`, root), 'utf8'));
  const artwork = Object.fromEntries([story.coverArt, ...story.pages.map(page => page.art)].map(key => {
    const path = assets.get(key);
    if (!path) throw new Error(`Missing native artwork: ${key}`);
    return [key, `assets/kids-stories/${path}.webp`];
  }));
  const html = template
    .replace(/const story = (\{.*?\});/, () => `const story = ${JSON.stringify(story)};`)
    .replace(/const artwork = (\{.*?\});/, () => `const artwork = ${JSON.stringify(artwork)};`)
    .replace("source:'भागवत'", "source:'स्रोत'")
    .replace("source:'Bhagavata'", "source:'Source'")
    .replace("source:'ભાગવત'", "source:'સ્રોત'")
    .replace("source:'ಭಾಗವತ'", "source:'ಮೂಲ'");
  writeFileSync(new URL(`docs/kids-stories-${id}-prototype.html`, root), html);
}

// Keep the flow preview sourced from the same catalog and nine-form links.
const index = readFileSync(new URL('mobile/src/data/kidsStories/index.ts', root), 'utf8');
const parseLiteral = literal => JSON.parse(literal.replace(/([A-Za-z]\w*)\s*:/g, '"$1":').replace(/'/g, '"'));
const deityBlock = index.match(/storyDeities: readonly StoryDeity\[\] = \[([\s\S]*?)\n\];/)[1];
const deities = [...deityBlock.matchAll(/\{ id: '[^']+'.*?name: \{[^}]+\} \}/g)].map(match => parseLiteral(match[0]));
const formBlock = index.match(/navadurgaReadings: readonly NavadurgaReading\[\] = \[([\s\S]*?)\n\];/)[1];
const forms = [...formBlock.matchAll(/\{ id: '[^']+'.*?storyId: '[^']+' \}/g)].map(match => parseLiteral(match[0]));
const catalog = ['krishna-janma', ...ids].map(id => {
  const story = JSON.parse(readFileSync(new URL(`mobile/src/data/kidsStories/${id}.json`, root), 'utf8'));
  const stem = assets.get(story.coverArt);
  if (!stem) throw new Error(`Missing cover artwork: ${story.coverArt}`);
  return { id, deityId: story.deityId, title: story.title, description: story.description, kind: story.kind ?? 'story', pages: story.pages.length, ageMin: story.ageMin,
    frame: frames[story.coverArt]?.retainedHeight ?? 1,
    cover: `assets/${id === 'krishna-janma' ? 'krishna-janma' : 'kids-stories'}/${stem}.webp`,
    href: id === 'krishna-janma' ? 'kids-stories-prototype.html' : `kids-stories-${id}-prototype.html` };
});
const catalogUrl = new URL('docs/kids-stories-catalog-prototype.html', root);
let catalogHtml = readFileSync(catalogUrl, 'utf8');
for (const [name, value] of Object.entries({ deities, forms, catalog })) {
  catalogHtml = catalogHtml.replace(new RegExp(`const ${name} = (\\[.*?\\]);`), () => `const ${name} = ${JSON.stringify(value)};`);
}
writeFileSync(catalogUrl, catalogHtml);
