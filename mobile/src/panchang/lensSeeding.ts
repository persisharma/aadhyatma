import { useCallback, useEffect, useRef, useState } from 'react';
import { InteractionManager } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { getCityById } from './locations';
import { isObservanceLens, lensForPincodeState, lensForStateCode } from './lenses';
import { isPincodeCityId, lookupPincode } from './pincodes';
import type { ObservanceLens, PanchangLocation } from './types';

export const LENS_SEEN_STORAGE_KEY = '@vedansh:panchang-lens-seen';

type LensSeedMeta = {
  version: 1;
  initialized: boolean;
  autoSeededLens?: ObservanceLens;
  autoSeededCityId?: string;
  addedNoticeDismissed?: boolean;
  offered: ObservanceLens[];
};

export type LensSeedNotice = {
  kind: 'added' | 'offer';
  lens: ObservanceLens;
  cityHi: string;
  cityEn: string;
};

function parseMeta(raw: string | null): LensSeedMeta | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<LensSeedMeta>;
    if (parsed.version !== 1 || typeof parsed.initialized !== 'boolean') return null;
    return {
      version: 1,
      initialized: parsed.initialized,
      autoSeededLens: parsed.autoSeededLens,
      autoSeededCityId: parsed.autoSeededCityId,
      addedNoticeDismissed: parsed.addedNoticeDismissed === true,
      offered: Array.isArray(parsed.offered) ? parsed.offered.filter(isObservanceLens) : [],
    };
  } catch {
    return null;
  }
}

async function writeMeta(meta: LensSeedMeta): Promise<void> {
  await AsyncStorage.setItem(LENS_SEEN_STORAGE_KEY, JSON.stringify(meta));
}

export function suggestedLensForLocation(location: PanchangLocation): ObservanceLens | null {
  if (isPincodeCityId(location.cityId)) {
    const entry = lookupPincode(location.cityId.slice(4));
    return lensForPincodeState(entry?.stateEn);
  }
  return lensForStateCode(getCityById(location.cityId)?.stateCode);
}

/**
 * One-time location suggestion. The first eligible chosen location auto-adds;
 * later locations can only offer an inactive lens and never remove a prior one.
 */
export function useLensSeeding(
  location: PanchangLocation,
  lenses: readonly ObservanceLens[],
  lensesHydrated: boolean,
  setLenses: (values: Iterable<ObservanceLens>) => void
): {
  notice: LensSeedNotice | null;
  dismiss: () => void;
  acceptOffer: () => void;
} {
  const [notice, setNotice] = useState<LensSeedNotice | null>(null);
  const sessionMeta = useRef<LensSeedMeta | null | undefined>(undefined);
  const lensKey = lenses.join(',');

  useEffect(() => {
    if (!lensesHydrated) return undefined;
    let cancelled = false;
    const interaction = InteractionManager.runAfterInteractions(() => {
      void (async () => {
        const suggestion = suggestedLensForLocation(location);
        if (cancelled) return;
        const raw = sessionMeta.current === undefined
          ? await AsyncStorage.getItem(LENS_SEEN_STORAGE_KEY).catch(() => null)
          : null;
        if (cancelled) return;
        let meta = sessionMeta.current === undefined ? parseMeta(raw) : sessionMeta.current;
        sessionMeta.current = meta;

        // A pre-existing manual choice is authoritative and closes the auto-seed
        // window. Jain can therefore never be inferred from a location.
        if (!meta && lenses.length > 0) {
          meta = { version: 1, initialized: true, offered: [] };
          sessionMeta.current = meta;
          void writeMeta(meta).catch(() => undefined);
        }

        if (!meta?.initialized) {
          // The untouched Ujjain fallback (and any state with no calendar) is not
          // a preference signal. Keep waiting for the first eligible choice.
          if (!suggestion || location.source === 'default') return;
          const seeded: LensSeedMeta = {
            version: 1,
            initialized: true,
            autoSeededLens: suggestion,
            autoSeededCityId: location.cityId,
            addedNoticeDismissed: false,
            offered: [],
          };
          sessionMeta.current = seeded;
          setLenses([...lenses, suggestion]);
          setNotice({ kind: 'added', lens: suggestion, cityHi: location.labelHi, cityEn: location.labelEn });
          void writeMeta(seeded).catch(() => undefined);
          return;
        }

        if (
          meta.autoSeededLens
          && !meta.addedNoticeDismissed
          && meta.autoSeededCityId === location.cityId
          && lenses.includes(meta.autoSeededLens)
        ) {
          setNotice({ kind: 'added', lens: meta.autoSeededLens, cityHi: location.labelHi, cityEn: location.labelEn });
          return;
        }

        if (suggestion && !lenses.includes(suggestion) && !meta.offered.includes(suggestion)) {
          const next = { ...meta, offered: [...meta.offered, suggestion] };
          sessionMeta.current = next;
          setNotice({ kind: 'offer', lens: suggestion, cityHi: location.labelHi, cityEn: location.labelEn });
          void writeMeta(next).catch(() => undefined);
          return;
        }
        setNotice(null);
      })();
    });
    return () => {
      cancelled = true;
      interaction.cancel();
    };
  }, [lensKey, lenses, lensesHydrated, location, setLenses]);

  const dismiss = useCallback(() => {
    const dismissed = notice;
    setNotice(null);
    if (dismissed?.kind !== 'added') return;
    const meta = sessionMeta.current;
    if (!meta) return;
    const next = { ...meta, addedNoticeDismissed: true };
    sessionMeta.current = next;
    void writeMeta(next).catch(() => undefined);
  }, [notice]);

  const acceptOffer = useCallback(() => {
    if (notice?.kind !== 'offer') return;
    setLenses([...lenses, notice.lens]);
    setNotice(null);
  }, [lenses, notice, setLenses]);

  return { notice, dismiss, acceptOffer };
}
