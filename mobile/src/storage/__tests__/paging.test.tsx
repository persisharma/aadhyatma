import React from 'react';
import TestRenderer, {act} from 'react-test-renderer';
const mockRange = jest.fn();
const mockVerse = jest.fn();
jest.mock('../content.native', () => ({readVerseRange:(...args:unknown[]) => mockRange(...args),readVerse:(...args:unknown[]) => mockVerse(...args)}));
import {usePagedVerses} from '../usePagedVerses.native';
let state:ReturnType<typeof usePagedVerses<{id:string}>>;
function Reader({position=0,doc='test'}:{position?:number;doc?:string}) { state=usePagedVerses(doc,10000,position);return null; }
const rows=(start:number,count:number) => Array.from({length:count},(_,i) => ({id:String(start+i)}));
beforeEach(() => {jest.clearAllMocks();mockRange.mockImplementation(async (_key,start,count) => rows(start,count));});
test('a large chapter loads only its nearby window and releases the old verses after a jump',async () => {
  let tree:TestRenderer.ReactTestRenderer;
  await act(async () => {tree=TestRenderer.create(<Reader />);});
  expect(mockRange).toHaveBeenLastCalledWith('test',0,72);
  expect(state.verses.filter((v) => !('__type' in v))).toHaveLength(72);
  await act(async () => {tree.update(<Reader position={9999}/>);});
  expect(mockRange).toHaveBeenLastCalledWith('test',9960,40);
  expect(state.verses[0]).toHaveProperty('__type','loading');
  expect(state.getVerse(9999)).toEqual({id:'9999'});
  await act(async () => {tree.unmount();});
});
test('late results for the previous chapter cannot replace the new chapter',async () => {
  let resolveOld!:(value:{id:string}[]) => void;
  mockRange.mockImplementationOnce(() => new Promise((resolve) => {resolveOld=resolve;}));
  let tree:TestRenderer.ReactTestRenderer;
  await act(async () => {tree=TestRenderer.create(<Reader doc="old"/>);});
  await act(async () => {tree.update(<Reader doc="new"/>);});
  await act(async () => {resolveOld([{id:'stale'}]);});
  expect(state.verses[0]).toEqual({id:'0'});
  await act(async () => {tree.unmount();});
});
test('failed pages expose retry, and speech can request a single uncached row',async () => {
  mockRange.mockRejectedValueOnce(new Error('read failed'));
  let tree:TestRenderer.ReactTestRenderer;
  await act(async () => {tree=TestRenderer.create(<Reader/>);});
  expect(state.error).toBe(true);
  await act(async () => {state.retry();});
  expect(state.error).toBe(false);
  mockVerse.mockReturnValue({id:'5000'});
  expect(state.getVerse(5000)).toEqual({id:'5000'});
  expect(mockVerse).toHaveBeenCalledWith('test',5000);
  await act(async () => {tree.unmount();});
});
