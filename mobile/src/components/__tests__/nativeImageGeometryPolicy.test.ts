import fs from 'node:fs';
import path from 'node:path';

const { unsafeNativeImageFrames } = require('../../../scripts/native-image-geometry.cjs') as {
  unsafeNativeImageFrames: (source: string, filename?: string) => { filename: string; line: number; reason: string }[];
};
const imports = "import { Image, StyleSheet, View } from 'react-native';\n";
test('rejects intrinsic-height hazards, including conditional and StyleSheet styles', () => {
  for (const source of [
    "<Image style={{width:'100%', aspectRatio:1.5}} />",
    "const s=StyleSheet.create({art:{width:'100%',aspectRatio:1.5}}); const C=()=> <Image style={s.art} />",
    "<Image style={small ? {width:81,height:54} : {width:'100%',aspectRatio:1.5}} />",
    "<Image style={StyleSheet.absoluteFill} />",
  ]) expect(unsafeNativeImageFrames(imports + source)).toHaveLength(1);
});
test('accepts View-owned frames with both image dimensions constrained', () => {
  expect(unsafeNativeImageFrames(imports + "<View style={{width:'100%',aspectRatio:1.5}}><Image style={{...StyleSheet.absoluteFillObject,width:'100%',height:'100%'}} /></View>")).toEqual([]);
  expect(unsafeNativeImageFrames(imports + '<Image style={{width:81,height:54}} />')).toEqual([]);
});
test('production components and screens do not reintroduce unsafe native Image geometry', () => {
  const root = path.resolve(__dirname, '../..');
  const walk = (directory: string): string[] => fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    if (entry.name === '__tests__') return [];
    const file = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(file) : file.endsWith('.tsx') ? [file] : [];
  });
  const files = [...walk(path.join(root, 'components')), ...walk(path.join(root, 'screens'))];
  const issues = files.flatMap(file => unsafeNativeImageFrames(fs.readFileSync(file, 'utf8'), path.relative(root, file)));
  expect(issues).toEqual([]);
});
