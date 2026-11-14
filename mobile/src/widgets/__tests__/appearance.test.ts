import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { decodeWidgetPayload, type WidgetPayloadV1 } from '../contract';
import { appearanceForDay, widgetAppearance, WIDGET_APPEARANCE_TOKENS } from '../appearance';
import { WIDGET_HERITAGE_SUBJECTS, widgetVerseSubject, widgetHeritageName } from '../heritage';
import { WIDGET_BACKGROUND_DIMENSIONS } from '../catalog';

const root = path.join(__dirname, '../../..');
const payload = (): WidgetPayloadV1 => JSON.parse(fs.readFileSync(path.join(root, 'src/widgets/fixtures/widget-payload-v1.json'), 'utf8'));
const instant = (time: string) => new Date(`2099-01-01T${time}:00.000Z`);

test('both widgets follow city sunrise inclusive / sunset exclusive, not device darkness', () => {
  const p = payload();
  for (const [time, expected] of [['00:42','night'], ['00:43','day'], ['06:00','day'], ['12:29','day'], ['12:30','night'], ['18:29','night']] as const) {
    assert.equal(widgetAppearance(p, instant(time)), expected, time);
  }
  p.verses.timeZone = 'America/Los_Angeles';
  assert.equal(widgetAppearance(p, instant('00:42')), 'night');
  assert.equal(widgetAppearance(p, instant('12:30')), 'night');
});

test('legacy or absent solar data stays Heritage without guessing a sunrise', () => {
  const p = payload(); const day = p.panchang.days[0];
  delete day.sunriseAt; delete day.sunsetAt;
  assert.equal(decodeWidgetPayload(p, instant('06:00').getTime()).kind, 'ready');
  assert.equal(widgetAppearance(p, instant('18:00')), 'day');
  assert.equal(appearanceForDay(undefined, instant('06:00').getTime()), 'day');
  assert.equal(widgetAppearance(p, new Date('2099-01-02T18:00:00Z')), 'day');
});

test('corrupt, one-sided, reversed or wrong-date solar windows fail closed', () => {
  for (const mutate of [
    (d: any) => { delete d.sunsetAt; },
    (d: any) => { d.sunriseAt = null; },
    (d: any) => { d.sunsetAt = '12:30'; },
    (d: any) => { d.sunsetAt = d.sunriseAt; },
    (d: any) => { d.sunsetAt = '2098-12-31T12:30:00.000Z'; },
    (d: any) => { d.sunriseAt = '2099-01-02T00:43:00.000Z'; },
  ]) {
    const p = payload(); mutate(p.panchang.days[0]);
    assert.equal(decodeWidgetPayload(p, instant('06:00').getTime()).kind, 'corrupt');
  }
});

test('solar selection is consistent for all four reading languages', () => {
  for (const locale of ['hi','en','gu','kn'] as const) {
    const p = payload(); p.locale = locale;
    assert.equal(widgetAppearance(p, instant('00:42')), 'night');
    assert.equal(widgetAppearance(p, instant('00:43')), 'day');
  }
});

test('source artwork matches the named deity and unknown/general prayers stay neutral', () => {
  assert.equal(widgetVerseSubject('vishnu-sahasranama'), 'vishnu');
  assert.equal(widgetVerseSubject('bhagavad-gita'), 'krishna');
  assert.equal(widgetVerseSubject('hanuman-chalisa'), 'hanuman');
  assert.equal(widgetVerseSubject('gau-seva'), 'prayer');
  assert.equal(widgetVerseSubject('unknown-future-source'), 'prayer');
  assert.equal(widgetHeritageName('../../bad', 'medium', 'night'), 'vedansh_widget_bg_heritage_prayer_medium_night');
});

test('art keys are additive, safe resource basenames, and fully validated', () => {
  const p = payload(); p.verses.days[0].artKey = 'vishnu';
  assert.equal(decodeWidgetPayload(p, instant('06:00').getTime()).kind, 'ready');
  p.verses.days[0].artKey = '../wrong';
  assert.equal(decodeWidgetPayload(p, instant('06:00').getTime()).kind, 'corrupt');
});

test('both palettes keep every text token at AA on the actual text surface', () => {
  const lum = (hex: string) => {
    const rgb = [1,3,5].map(i => parseInt(hex.slice(i,i+2),16)/255).map(c => c <= .04045 ? c/12.92 : ((c+.055)/1.055)**2.4);
    return rgb[0]*.2126 + rgb[1]*.7152 + rgb[2]*.0722;
  };
  for (const palette of Object.values(WIDGET_APPEARANCE_TOKENS)) for (const token of ['ink','inkMuted','accent','gold'] as const) {
    const a=lum(palette.background), b=lum(palette[token]);
    assert.ok((Math.max(a,b)+.05)/(Math.min(a,b)+.05) >= 4.5, `${palette.background} ${token}`);
  }
});

test('every subject/size/appearance ships a hashed, budgeted native and gallery plate', () => {
  const dir=path.join(root,'assets/widget-backgrounds');
  const manifest=JSON.parse(fs.readFileSync(path.join(dir,'heritage-manifest.json'),'utf8'));
  const index=fs.readFileSync(path.join(dir,'heritage.ts'),'utf8');
  assert.equal(Object.keys(manifest.assets).length, WIDGET_HERITAGE_SUBJECTS.length*3*2);
  for (const subject of WIDGET_HERITAGE_SUBJECTS) for (const size of ['small','medium','large'] as const) for (const appearance of ['day','night'] as const) {
    const name=widgetHeritageName(subject,size,appearance); const item=manifest.assets[name];
    const bytes=fs.readFileSync(path.join(dir,`${name}.jpg`));
    assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),item.sha256,name);
    assert.deepEqual([item.width,item.height],[...WIDGET_BACKGROUND_DIMENSIONS[size]]);
    assert.equal(item.bytes,bytes.length);
    assert.ok(index.includes(`${name}: require('./${name}.jpg')`));
  }
  for (const item of Object.values(manifest.sources) as {file:string;sha256:string}[]) {
    assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(root,item.file))).digest('hex'),item.sha256);
  }
});

test('native transitions cover solar instants for both kinds and retain tithi/midnight updates', () => {
  const swift=fs.readFileSync(path.join(root,'plugins/home-widgets/ios/VedanshWidgets.swift'),'utf8');
  const kotlin=fs.readFileSync(path.join(root,'plugins/home-widgets/android/VedanshWidgetProvider.kt'),'utf8');
  assert.match(swift,/for raw in \[day.sunriseAt, day.sunsetAt\]/);
  assert.match(swift,/widgetIsNight\(payload, at: entry.date\)/);
  assert.match(swift,/for segment in day.tithiSegments/);
  assert.match(kotlin,/minOf\(WidgetPayloadContract.nextBoundaryMs\([\s\S]*WidgetPayloadContract.nextSolarBoundaryMs\(root, nowMs\)/);
  const keep=fs.readFileSync(path.join(root,'plugins/home-widgets/android/res/raw/vedansh_widget_keep.xml'),'utf8');
  assert.ok(keep.includes('@drawable/vedansh_widget_bg_heritage_*'));
});

// The Heritage/Midnight composition on iOS has an eyebrow capsule beside the ॐ
// mark, a gold rule above the verse source, and a divided sunrise row on the small
// Panchang. Android shipped only the palette and plates, so the same widget read as
// a different, older design (Nov 2026). Pin the Android half of that composition and
// the reset paths a reapplied RemoteViews needs, or a recovery card keeps a capsule.
test('Android widgets carry the iOS Heritage/Midnight composition, not just its palette', () => {
  const android = (file: string) => fs.readFileSync(path.join(root, 'plugins/home-widgets/android', file), 'utf8');
  const kotlin = android('VedanshWidgetProvider.kt');
  const verse = android('res/layout/vedansh_widget_verse.xml');
  const panchang = android('res/layout/vedansh_widget_panchang.xml');

  // Layout: capsule + header mark + rule on the verse, a rule on the Panchang.
  // RemoteViews cannot inflate a bare <View>, so the rule must be an ImageView.
  assert.match(verse, /android:id="@\+id\/widget_kicker"[^>]*android:background="@drawable\/vedansh_widget_pill"/);
  assert.match(verse, /android:id="@\+id\/widget_brand_header"/);
  for (const xml of [verse, panchang]) {
    assert.match(xml, /<ImageView android:id="@\+id\/widget_rule"[^>]*android:layout_height="1dp"/);
    assert.doesNotMatch(xml, /<View\b/, 'RemoteViews rejects a plain View');
  }
  assert.match(android('res/drawable/vedansh_widget_pill.xml'), /#1A6B2E05/);
  assert.match(android('res/drawable/vedansh_widget_pill_night.xml'), /#1AEBC784/);

  // Appearance: the capsule follows day/night and is cleared (0) when not wanted.
  assert.match(kotlin, /"setBackgroundResource",\s*if \(!pill\) 0 else if \(night\) __APP_PACKAGE__\.R\.drawable\.vedansh_widget_pill_night else __APP_PACKAGE__\.R\.drawable\.vedansh_widget_pill\)/);
  assert.match(kotlin, /val pill = surface == Surface\.VERSE && width >= 180/);
  assert.match(kotlin, /setInt\(__APP_PACKAGE__\.R\.id\.widget_rule, "setBackgroundColor"/);

  // Recovery resets everything a richer render may have left behind.
  const recovery = kotlin.slice(kotlin.indexOf('private fun recovery'), kotlin.indexOf('private fun boundaryIntent'));
  assert.match(recovery, /setViewVisibility\(__APP_PACKAGE__\.R\.id\.widget_rule, View\.GONE\)/);
  assert.match(recovery, /setViewVisibility\(__APP_PACKAGE__\.R\.id\.widget_brand_header, View\.GONE\)/);
  assert.match(recovery, /applyAppearance\(views, surface, false\)/, 'recovery must clear the capsule');

  // Small verse: no capsule/rule, footer mark; wide/large: header mark and rule.
  const renderVerse = kotlin.slice(kotlin.indexOf('private fun renderVerse'), kotlin.indexOf('/** Each surface owns'));
  assert.match(renderVerse, /widget_brand_header, if \(narrow\) View\.GONE else View\.VISIBLE/);
  assert.match(renderVerse, /widget_rule, if \(narrow\) View\.GONE else View\.VISIBLE/);

  // Panchang: divided sunrise on small, a row per window on large.
  const renderPanchang = kotlin.slice(kotlin.indexOf('private fun renderPanchang'), kotlin.indexOf('private fun renderVerse'));
  assert.match(renderPanchang, /widget_rule, if \(compact\) View\.VISIBLE else View\.GONE/);
  assert.match(renderPanchang, /tall -> listOfNotNull\(sunrise, rahuKaal, abhijit\)\.joinToString\("\\n"\)/);
});
