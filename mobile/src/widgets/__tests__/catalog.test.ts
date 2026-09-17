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
