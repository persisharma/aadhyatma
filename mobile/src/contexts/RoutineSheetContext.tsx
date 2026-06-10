import { createContext, useContext } from 'react';

/**
 * Lightweight context + hook for the app-level "add to routine" sheet. Kept
 * free of heavy imports (no sheet component, no navigation) so presentational
 * consumers like LibraryCard can use `useRoutineSheet()` without dragging the
 * modal — and its transitive deps — into their unit tests. The provider that
 * actually renders the sheet lives in RoutineSheetProvider.tsx.
 */
export type RoutineSheetContextValue = {
  openAddToRoutine: (sourceId: string) => void;
};

export const RoutineSheetContext = createContext<RoutineSheetContextValue>({
  openAddToRoutine: () => {},
});

/**
 * Returns the opener. Falls back to a no-op outside the provider (e.g. in
 * component unit tests) rather than throwing.
 */
export function useRoutineSheet(): RoutineSheetContextValue {
  return useContext(RoutineSheetContext);
}
