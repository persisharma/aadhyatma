// Reuse the existing review reader; the native JSON and Metro map remain canonical.
import { readFileSync, writeFileSync } from 'node:fs';

const root = new URL('../../', import.meta.url);
const template = readFileSync(new URL('docs/kids-stories-prototype.html', root), 'utf8');
const component = readFileSync(new URL('mobile/src/components/KidsStoryArt.tsx', root), 'utf8');
const assets = new Map([...component.matchAll(/(\w+): require\('(.+?)'\)/g)].map(match => [match[1], match[2]]));
for (const id of ['putana', 'kaliya-nag', 'ganesha-birth', 'hanuman-sun']) {
  const story = JSON.parse(readFileSync(new URL(`mobile/src/data/kidsStories/${id}.json`, root), 'utf8'));
  const artwork = Object.fromEntries([story.coverArt, ...story.pages.map(page => page.art)].map(key => {
    const path = assets.get(key);
    if (!path) throw new Error(`Missing native artwork: ${key}`);
    return [key, `assets/kids-stories/${path.split('/').at(-1)}`];
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
