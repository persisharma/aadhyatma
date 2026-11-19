import { widgetPayloadKey } from '../widgetPayloadKey';
import type { WidgetPayloadState } from '@/widgets/contract';

const ready = (marker: string) =>
  ({ kind: 'ready', payload: { marker } }) as unknown as WidgetPayloadState;

test('two separately decoded but identical payloads share a key (PERF-04)', () => {
  expect(widgetPayloadKey(ready('a'))).toBe(widgetPayloadKey(ready('a')));
});

test('a changed payload, or a different state kind, changes the key', () => {
  expect(widgetPayloadKey(ready('a'))).not.toBe(widgetPayloadKey(ready('b')));
  expect(widgetPayloadKey({ kind: 'missing' })).not.toBe(widgetPayloadKey({ kind: 'corrupt' }));
  expect(widgetPayloadKey({ kind: 'missing' })).not.toBe(widgetPayloadKey(ready('a')));
});
