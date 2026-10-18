import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { getComicBook } from '@/data/comicBooks';
let mockLarge = false;
jest.mock('react-native', () => ({ Text: 'Text', View: 'View' }));
jest.mock('react-native-svg', () => ({ __esModule: true, default: 'Svg', Path: 'Path' }));
jest.mock('@/components/ComicArt', () => ({ __esModule: true, default: 'ComicArt', comicArtGeometry: (p: any,w: number) => ({height:w*p.dimensions.height*p.frame.height/(p.dimensions.width*p.frame.width)}) }));
jest.mock('@/theme/ThemeContext', () => ({ useTheme: () => ({colors:{},typography:require('@/theme/fontScale').scaleTypography(require('@/theme/typography').typography,mockLarge?1.15:1)}) }));
const Panel = require('../ComicPanel').default;
const panels = getComicBook('balakanda-v1')!.episodes.flatMap(e => e.panels);
afterEach(() => { mockLarge=false; });
test.each(['hi','en','gu','kn'] as const)('all %s panels preserve full narration, context and artwork at both sizes', language => {
 for(const large of [false,true]) {mockLarge=large;
  for(const panel of panels) {
   let tree!:TestRenderer.ReactTestRenderer;
   act(()=>{tree=TestRenderer.create(<Panel panel={panel} language={language}/>);});
   const narration=tree.root.findAllByProps({testID:'comic-narration'});
   expect(narration).toHaveLength(panel[language].narration?1:0);
   if(narration[0]) {expect(narration[0].props.children).toBe(panel[language].narration);expect(narration[0].props.numberOfLines).toBeUndefined();}
   expect(tree.root.findAllByProps({testID:'comic-context'})).toHaveLength(panel[language].note?1:0);
   expect(tree.root.findByType('ComicArt' as any).props.panel.frame).toEqual(panel.frame);
   act(()=>tree.unmount());
  }
 }
});
test('long narrow dialogue expands above complete art with its tail still reaching the speaker',()=>{
 const panel=panels.find(p=>p.zone[1]<.7 && p.hi.dialogue)!;
 let tree!:TestRenderer.ReactTestRenderer;
 act(()=>{tree=TestRenderer.create(<Panel panel={panel} language="hi"/>);});
 act(()=>tree.root.findByProps({testID:`comic-panel-${panel.id}`}).props.onLayout({nativeEvent:{layout:{width:304}}}));
 const hidden=tree.root.findAllByType('View' as any).find(v=>v.props.accessibilityElementsHidden)!;
 act(()=>hidden.props.onLayout({nativeEvent:{layout:{height:350}}}));
 act(()=>tree.root.findByProps({testID:'comic-speech'}).props.onLayout({nativeEvent:{layout:{height:120}}}));
 const speech=tree.root.findByProps({testID:'comic-speech'});
 expect(speech.props.style.width).toBe(270);
 expect(speech.props.style.top).toBeGreaterThanOrEqual(0);
 expect(tree.root.findByProps({testID:'comic-scene'}).props.style.minHeight).toBeGreaterThan(120);
 expect(tree.root.findByProps({testID:'comic-balloon-outline'}).props.d).not.toMatch(/NaN|Infinity/);
 act(()=>tree.unmount());
});
