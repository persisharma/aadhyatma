import type { WidgetPayloadState } from '@/widgets/contract';

/**
 * A comparable identity for a decoded widget payload. The gallery polls native
 * storage every few seconds and every read decodes to a NEW object, so comparing
 * references would re-render each time even when nothing changed.
 */
export function widgetPayloadKey(state: WidgetPayloadState): string {
  return state.kind === 'ready' ? `ready:${JSON.stringify(state.payload)}` : state.kind;
}
