import React, { useCallback, useMemo, useState } from 'react';
import AddToRoutineSheet from '@/components/AddToRoutineSheet';
import { RoutineSheetContext, type RoutineSheetContextValue } from './RoutineSheetContext';

/**
 * Mounts the single app-level "add to routine" sheet and exposes
 * `openAddToRoutine(sourceId)` via RoutineSheetContext. Place under
 * RoutineProvider so the sheet can read/write routines.
 */
export function RoutineSheetProvider({ children }: { children: React.ReactNode }) {
  const [target, setTarget] = useState<{ sourceId: string; chapter?: number } | null>(null);
  const openAddToRoutine = useCallback(
    (sourceId: string, chapter?: number) => setTarget({ sourceId, chapter }),
    []
  );
  const value = useMemo<RoutineSheetContextValue>(() => ({ openAddToRoutine }), [openAddToRoutine]);

  return (
    <RoutineSheetContext.Provider value={value}>
      {children}
      <AddToRoutineSheet
        sourceId={target?.sourceId ?? null}
        initialChapter={target?.chapter}
        onClose={() => setTarget(null)}
      />
    </RoutineSheetContext.Provider>
  );
}
