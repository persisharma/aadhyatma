import React, { useCallback, useEffect, useRef, useState } from 'react';
import ProgressResetDialog from '@/components/ProgressResetDialog';
import { resetChapter, resetSource, restore } from '@/utils/readCoverageStore';
import type { CoverageSnapshot } from '@/data/readCoverage';

/** How long the inline undo stays offered after a reset. */
export const RESET_UNDO_MS = 6000;

export type ResetTarget = {
  sourceId: string;
  /** Omit to reset every subsection of the text. */
  chapter?: number;
  /** Localized name shown in the confirmation (chapter tag + title, or the text name). */
  label: string;
  /** Read marks the reset would clear, for the confirmation copy. */
  readCount: number;
};

/**
 * Confirm-then-undo flow for clearing read marks (design.md §84). The caller
 * renders `dialog` once and shows `undo` (when non-null) inline next to the
 * progress it just cleared — an in-place undo rather than a global toast, so
 * nothing needs mounting at the app root.
 */
export function useProgressReset() {
  const [target, setTarget] = useState<ResetTarget | null>(null);
  const [undoSnapshot, setUndoSnapshot] = useState<CoverageSnapshot | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  const ask = useCallback((next: ResetTarget) => {
    if (next.readCount > 0) setTarget(next);
  }, []);

  const confirm = useCallback(() => {
    if (!target) return;
    const removed = target.chapter == null ? resetSource(target.sourceId) : resetChapter(target.sourceId, target.chapter);
    setTarget(null);
    clearTimeout(timer.current);
    setUndoSnapshot(removed);
    timer.current = setTimeout(() => setUndoSnapshot(null), RESET_UNDO_MS);
  }, [target]);

  const undo = useCallback(() => {
    if (!undoSnapshot) return;
    clearTimeout(timer.current);
    restore(undoSnapshot);
    setUndoSnapshot(null);
  }, [undoSnapshot]);

  const dialog = (
    <ProgressResetDialog
      visible={target != null}
      targetLabel={target?.label ?? ''}
      readCount={target?.readCount ?? 0}
      onConfirm={confirm}
      onCancel={() => setTarget(null)}
    />
  );

  return { ask, dialog, undo: undoSnapshot ? undo : null };
}
