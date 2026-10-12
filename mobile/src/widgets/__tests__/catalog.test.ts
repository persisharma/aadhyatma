import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  WIDGET_BACKGROUND_DIMENSIONS,
  WIDGET_CATALOG,
  WIDGET_TEXT_TOKENS,
  widgetBackgroundPlates,
  widgetCatalogEntry,
  widgetSizeLabel,
  type WidgetSize,
} from '../catalog';

const PLUGIN_ROOT = path.join(__dirname, '..', '..', '..', 'plugins');
const read = (...parts: string[]) => fs.readFileSync(path.join(PLUGIN_ROOT, ...parts), 'utf8');
const PLATE_DIR = path.join(__dirname, '..', '..', '..', 'assets', 'widget-backgrounds');

/** Width × height from a baseline/progressive JPEG's SOF segment. */
function jpegSize(file: string): [number, number] {
  const bytes = fs.readFileSync(file);
  assert.ok(bytes[0] === 0xff && bytes[1] === 0xd8, `${path.basename(file)} is not a JPEG`);
  let offset = 2;
  while (offset < bytes.length) {
    const marker = bytes[offset + 1];
    const length = bytes.readUInt16BE(offset + 2);
    if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) {
      return [bytes.readUInt16BE(offset + 7), bytes.readUInt16BE(offset + 5)];
    }
    offset += 2 + length;
  }
  throw new Error(`${path.basename(file)} has no SOF segment`);
}

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

// "Every kind renders every size it advertises" is the rule above; this is the
// half of it that a family list cannot express. The wide verse cell drew the
// planner's small-cell excerpt, so a two-line shloka past the 88-character cap
// was ellipsized on a card that had a third empty line for it. Only the small
// (iOS) / narrow (Android) cell may read `excerpt`.
test('only the small verse cell reads the excerpt — wider cells read the full lines', () => {
  const swift = read('home-widgets', 'ios', 'VedanshWidgets.swift');
  const verseView = swift.slice(swift.indexOf('MARK: - आज का श्लोक'), swift.indexOf('MARK: - आज का पंचांग'));
  assert.match(verseView, /family == \.systemSmall\s*\{\s*Text\(v\.excerpt/, 'iOS must gate v.excerpt behind systemSmall');
  assert.equal(verseView.match(/v\.excerpt/g)?.length, 1, 'iOS reads the excerpt in exactly one branch');
  assert.match(verseView, /Text\(flowedVerse\(v\.lines\.value\(lang\)\)\)/, 'the wide iOS cell must flow the full lines');

  const kotlin = read('home-widgets', 'android', 'VedanshWidgetProvider.kt');
  const renderVerse = kotlin.slice(kotlin.indexOf('private fun renderVerse'), kotlin.indexOf('/** Each surface owns'));
  assert.match(renderVerse, /narrow -> vd\.getJSONObject\("excerpt"\)/, 'Android must gate the excerpt behind the narrow cell');
  assert.equal(renderVerse.match(/"excerpt"/g)?.length, 1, 'Android reads the excerpt in exactly one branch');
  assert.match(renderVerse, /padas\.joinToString\(" · "\)/, 'the wide Android cell must flow the full lines');

  // A cell that trims the verse has to say so rather than clip a wrapped line.
  assert.match(read('home-widgets', 'android', 'res', 'layout', 'vedansh_widget_verse.xml'), /android:id="@\+id\/widget_title"[^>]*android:ellipsize="end"/);
});

test('size labels exist in all four reading languages', () => {
  for (const size of new Set(WIDGET_CATALOG.flatMap((entry) => entry.sizes))) {
    for (const lang of ['hi', 'en', 'gu', 'kn'] as const) {
      assert.ok(widgetSizeLabel(size, lang).length > 0, `${size} has no ${lang} label`);
    }
  }
});

/**
 * Every family branch a widget advertises must carry its own `.widgetURL`.
 *
 * An accessory (Lock Screen) widget with no URL is INERT: iOS does nothing at
 * all when it is tapped — no launch, no error, forever. The Panchang widget
 * advertised `lock` and its `.accessoryInline` branch rendered a bare `Text`
 * while the `.widgetURL` sat on the else-branch's VStack, so the placed Lock
 * Screen widget simply swallowed every tap (Sept 2026). A missing modifier in
 * one SwiftUI branch is invisible in review, hence this test.
 */
test('every iOS family branch attaches its own widget URL', () => {
  const swift = read('home-widgets', 'ios', 'VedanshWidgets.swift');

  /** The balanced-brace body of the branch opened at `from`. */
  const branchBody = (from: number) => {
    const open = swift.indexOf('{', from);
    let depth = 0;
    for (let i = open; i < swift.length; i += 1) {
      if (swift[i] === '{') depth += 1;
      else if (swift[i] === '}') {
        depth -= 1;
        if (depth === 0) return swift.slice(open, i + 1);
      }
    }
    throw new Error('unbalanced braces in VedanshWidgets.swift');
  };

  const accessoryBranches = [...swift.matchAll(/family == \.(accessory\w+)/g)];
  // The catalog advertises `lock` for two kinds, so both accessory branches
  // must exist and both must be tappable.
  assert.ok(accessoryBranches.length >= 2, 'expected an accessory branch per lock-screen kind');
  for (const match of accessoryBranches) {
    assert.match(
      branchBody(match.index!),
      /\.widgetURL\(/,
      `the ${match[1]} branch renders no widgetURL, so tapping that Lock Screen widget does nothing`
    );
  }

  // The recovery card is reachable from every surface and every size; it is the
  // only way back into the app when a payload is stale, so it must be tappable.
  assert.match(branchBody(swift.indexOf('private func recovery')), /\.widgetURL\(/);
});

/**
 * The background plates (design.md §59) are optional on both platforms, so nothing
 * at runtime would notice a plate that silently stopped shipping — it would just
 * render the plain parchment. These pin the art to the catalog instead.
 */
test('every offered non-Lock-Screen size has a plate at its exact pixel budget, and no strays', () => {
  const plates = widgetBackgroundPlates();
  assert.equal(plates.length, 8, 'verse ×3 + panchang ×3 + japam ×2');
  for (const { name, size } of plates) {
    const file = path.join(PLATE_DIR, `${name}.jpg`);
    assert.ok(fs.existsSync(file), `${name}.jpg is missing — run scripts/build-widget-backgrounds.mts`);
    assert.deepEqual(jpegSize(file), [...WIDGET_BACKGROUND_DIMENSIONS[size]], `${name}.jpg is not the ${size} plate size`);
  }
  const expected = new Set(plates.map((plate) => `${plate.name}.jpg`));
  for (const file of fs.readdirSync(PLATE_DIR).filter((f) => f.endsWith('.jpg'))) {
    assert.ok(expected.has(file), `${file} is not a catalog plate`);
  }
  const index = fs.readFileSync(path.join(PLATE_DIR, 'index.ts'), 'utf8');
  for (const { name } of plates) assert.match(index, new RegExp(`${name}: require\\('\\./${name}\\.jpg'\\)`), `gallery index lacks ${name}`);
});

// WidgetKit drops the entire render when an image exceeds the cell's pixel area,
// so the Swift guard must refuse anything bigger than the plates actually are.
test('iOS loads each plate by name and refuses one over the family pixel budget', () => {
  const swift = read('home-widgets', 'ios', 'VedanshWidgets.swift');
  const families = { small: 'systemSmall', medium: 'systemMedium', large: 'systemLarge' } as const;
  for (const [size, family] of Object.entries(families)) {
    const [w, h] = WIDGET_BACKGROUND_DIMENSIONS[size as keyof typeof families];
    assert.match(swift, new RegExp(`case \\.${family}: return ${w} \\* ${h}`), `${family} budget drifted from the ${size} plate`);
    assert.match(swift, new RegExp(`case \\.${family}: return "${size}"`), `${family} does not map to the ${size} plate`);
  }
  assert.match(swift, /forResource: "vedansh_widget_bg_\\\(surface\.rawValue\)_\\\(size\)", withExtension: "jpg"/);
  assert.match(swift, /cg\.width \* cg\.height <= budget/);
  // Recovery cards and tinted/vibrant rendering keep the plain parchment.
  assert.match(swift, /guard renderingMode == \.fullColor, case \.ready\(let payload\) = entry\.state, hasContent\(payload\)/);
  assert.match(swift, /\.vedanshWidgetBackground\(art\)/);
  assert.match(read('withHomeWidgetsIos.js'), /'assets', 'widget-backgrounds'/);
});

test('Android shows each provider\'s plates only through the guarded art step', () => {
  const kotlin = read('home-widgets', 'android', 'VedanshWidgetProvider.kt');
  for (const { content, name } of widgetBackgroundPlates()) {
    if (!widgetCatalogEntry(content).androidProvider) continue;
    assert.match(kotlin, new RegExp(`R\\.drawable\\.${name}\\b`), `Android never draws ${name}`);
  }
  for (const layout of ['vedansh_widget_verse.xml', 'vedansh_widget_panchang.xml']) {
    const xml = read('home-widgets', 'android', 'res', 'layout', layout);
    assert.match(xml, /android:id="@\+id\/widget_art"[^>]*android:visibility="gone"/, `${layout} must default the art to GONE`);
    assert.match(xml, /android:id="@\+id\/widget_root"[^>]*android:clipToOutline="true"/, `${layout} must clip the art to the card`);
  }
  const recovery = kotlin.slice(kotlin.indexOf('private fun recovery'), kotlin.indexOf('private fun boundaryIntent'));
  assert.match(recovery, /setViewVisibility\(__APP_PACKAGE__\.R\.id\.widget_art, View\.GONE\)/, 'recovery must hide a previous render\'s art');
  assert.match(kotlin, /Build\.VERSION\.SDK_INT < Build\.VERSION_CODES\.S\) return/);
  assert.match(read('withHomeWidgets.js'), /'assets', 'widget-backgrounds'[\s\S]*drawable-nodpi/);
});

// The plates are toned exactly as dark as WIDGET_TEXT_TOKENS allow at 4.5:1, so a
// native surface still drawing the app's lighter inkMuted/saffronDeep/gold would sit
// below the gate on the darkest linework. Every surface must draw the table's values.
test('both native widgets draw the widget text tokens the plates were toned for', () => {
  const swift = read('home-widgets', 'ios', 'VedanshWidgets.swift');
  for (const [name, hex] of Object.entries(WIDGET_TEXT_TOKENS)) {
    const [r, g, b] = [1, 3, 5].map((i) => (parseInt(hex.slice(i, i + 2), 16) / 255).toFixed(3));
    assert.match(swift, new RegExp(`static let ${name} = Color\\(red: ${r}, green: ${g}, blue: ${b}\\)`), `WidgetTheme.${name} is not ${hex}`);
  }
  const allowed = new Set(Object.values(WIDGET_TEXT_TOKENS).map((hex) => hex.toUpperCase()));
  for (const layout of ['vedansh_widget_verse.xml', 'vedansh_widget_panchang.xml']) {
    const xml = read('home-widgets', 'android', 'res', 'layout', layout);
    for (const [, hex] of xml.matchAll(/android:textColor="(#[0-9A-Fa-f]{6})"/g)) {
      assert.ok(allowed.has(hex.toUpperCase()), `${layout} draws ${hex}, which is not a widget text token`);
    }
  }
});
