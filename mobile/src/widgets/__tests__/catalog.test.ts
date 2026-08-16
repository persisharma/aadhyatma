import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { WIDGET_CATALOG, widgetCatalogEntry, widgetSizeLabel, type WidgetSize } from '../catalog';

const PLUGIN_ROOT = path.join(__dirname, '..', '..', '..', 'plugins');
const read = (...parts: string[]) => fs.readFileSync(path.join(PLUGIN_ROOT, ...parts), 'utf8');

const IOS_FAMILY_SIZE: Record<string, WidgetSize> = {
  systemSmall: 'small', systemMedium: 'medium', systemLarge: 'large',
  accessoryInline: 'lock', accessoryCircular: 'lock', accessoryRectangular: 'lock',
};

test('every catalog entry offers its recommended size and a unique native kind', () => {
  const kinds = new Set<string>();
  for (const entry of WIDGET_CATALOG) {
    assert.ok(entry.sizes.includes(entry.recommended), `${entry.content} does not offer its recommended size`);
    assert.equal(new Set(entry.sizes).size, entry.sizes.length, `${entry.content} repeats a size`);
    assert.ok(!kinds.has(entry.iosKind), `duplicate iOS kind ${entry.iosKind}`);
    kinds.add(entry.iosKind);
  }
});

// The regression this whole feature exists for: the verse used to be locked to the
// small square (a shloka truncated after four words) and the Panchang to the wide
// rectangle (a one-word tithi in a field of parchment).
test('the verse is offered wide-first and the Panchang small-first', () => {
  const verse = widgetCatalogEntry('verse');
  assert.equal(verse.recommended, 'medium');
  assert.ok(verse.sizes.includes('large'), 'the verse must be placeable at the large size');
  assert.equal(widgetCatalogEntry('panchang').recommended, 'small');
  assert.ok(widgetCatalogEntry('panchang').sizes.includes('medium'), 'the Panchang must still be placeable wide');
});

test('iOS supportedFamilies match the sizes the gallery advertises', () => {
  const swift = read('home-widgets', 'ios', 'VedanshWidgets.swift');
  const blocks = new Map<string, string[]>();
  for (const match of swift.matchAll(/let kind = "(\w+)"[\s\S]*?\.supportedFamilies\(\[([^\]]+)\]\)/g)) {
    blocks.set(match[1], match[2].split(',').map((family) => family.trim().replace(/^\./, '')));
  }
  for (const entry of WIDGET_CATALOG) {
    const families = blocks.get(entry.iosKind);
    assert.ok(families, `${entry.iosKind} is not declared in VedanshWidgets.swift`);
    const sizes = new Set(families.map((family) => {
      const size = IOS_FAMILY_SIZE[family];
      assert.ok(size, `unmapped WidgetKit family ${family}`);
      return size;
    }));
    assert.deepEqual([...sizes].sort(), [...entry.sizes].sort(), `${entry.content} sizes drifted from WidgetKit`);
  }
});

test('every Android provider in the catalog is a real class, a registered receiver, and has its info resource', () => {
  const kotlin = read('home-widgets', 'android', 'VedanshWidgetProvider.kt');
  const plugin = read('withHomeWidgets.js');
  for (const entry of WIDGET_CATALOG) {
    if (!entry.androidProvider) continue;
    assert.match(kotlin, new RegExp(`class ${entry.androidProvider}\\b`), `${entry.androidProvider} has no Kotlin class`);
    const receiver = plugin.match(new RegExp(`className: '${entry.androidProvider}'[^}]*info: '@xml/(\\w+)'`));
    assert.ok(receiver, `${entry.androidProvider} is not registered as a manifest receiver`);
    const info = path.join(PLUGIN_ROOT, 'home-widgets', 'android', 'res', 'xml', `${receiver[1]}.xml`);
    assert.ok(fs.existsSync(info), `${receiver[1]}.xml is missing`);
    const layout = fs.readFileSync(info, 'utf8').match(/initialLayout="@layout\/(\w+)"/);
    assert.ok(layout, `${receiver[1]}.xml declares no initial layout`);
    assert.ok(fs.existsSync(path.join(PLUGIN_ROOT, 'home-widgets', 'android', 'res', 'layout', `${layout[1]}.xml`)), `${layout[1]}.xml is missing`);
  }
});

test('size labels exist in all four reading languages', () => {
  for (const size of new Set(WIDGET_CATALOG.flatMap((entry) => entry.sizes))) {
    for (const lang of ['hi', 'en', 'gu', 'kn'] as const) {
      assert.ok(widgetSizeLabel(size, lang).length > 0, `${size} has no ${lang} label`);
    }
  }
});
