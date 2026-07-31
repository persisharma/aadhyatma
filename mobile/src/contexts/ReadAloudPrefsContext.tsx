import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  DEFAULT_READ_ALOUD_PREFS,
  clampRate,
  type ReadAloudPrefs,
  type SpeechTarget,
} from '@/readAloud/prefs';

/**
 * Persisted read-aloud preferences (voice, speed, what to read).
 *
 * Split from `ReadAloudContext` on purpose: the controller re-renders on every
 * utterance boundary, and the settings row/sheet must not re-render with it.
 */
const STORAGE_KEY = '@vedansh/read-aloud';

type ReadAloudPrefsContextValue = {
  prefs: ReadAloudPrefs;
  /** False once the persisted prefs have been read from storage. */
  isLoading: boolean;
  setRate: (rate: number) => void;
  setVoice: (target: SpeechTarget, identifier: string | undefined) => void;
  setReadMeaning: (value: boolean) => void;
  setReadCommentary: (value: boolean) => void;
};

const ReadAloudPrefsContext = createContext<ReadAloudPrefsContextValue>({
  prefs: DEFAULT_READ_ALOUD_PREFS,
  isLoading: true,
  setRate: () => {},
  setVoice: () => {},
  setReadMeaning: () => {},
  setReadCommentary: () => {},
});

/**
 * Validates field by field rather than trusting the parsed JSON — a partial or
 * hand-edited value must degrade to defaults, not poison the speak path with a
 * NaN rate or a non-string voice identifier.
 */
export function parseReadAloudPrefs(raw: string | null): ReadAloudPrefs {
  if (!raw) return DEFAULT_READ_ALOUD_PREFS;

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return DEFAULT_READ_ALOUD_PREFS;
  }
  if (typeof parsed !== 'object' || parsed === null) return DEFAULT_READ_ALOUD_PREFS;

  const src = parsed as Record<string, unknown>;
  const next: ReadAloudPrefs = { ...DEFAULT_READ_ALOUD_PREFS, voiceByTarget: {} };

  if (typeof src.rate === 'number') next.rate = clampRate(src.rate);
  if (typeof src.readMeaning === 'boolean') next.readMeaning = src.readMeaning;
  if (typeof src.readCommentary === 'boolean') next.readCommentary = src.readCommentary;

  const voices = src.voiceByTarget;
  if (typeof voices === 'object' && voices !== null) {
    const v = voices as Record<string, unknown>;
    for (const target of ['hi', 'en'] as const) {
      if (typeof v[target] === 'string' && (v[target] as string).length > 0) {
        next.voiceByTarget[target] = v[target] as string;
      }
    }
  }

  return next;
}

export function ReadAloudPrefsProvider({ children }: { children: React.ReactNode }) {
  const [prefs, setPrefs] = useState<ReadAloudPrefs>(DEFAULT_READ_ALOUD_PREFS);
  const [isLoading, setIsLoading] = useState(true);

  // Mirror so two writes in the same tick compose instead of clobbering each other
  // (the bug NotificationPreferencesContext documents at its own persistPrefs).
  const prefsRef = useRef(prefs);

  useEffect(() => {
    let cancelled = false;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (cancelled) return;
        const hydrated = parseReadAloudPrefs(raw);
        prefsRef.current = hydrated;
        setPrefs(hydrated);
      })
      .catch(() => {
        /* storage unavailable — keep defaults */
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const persist = useCallback((update: (current: ReadAloudPrefs) => ReadAloudPrefs) => {
    const next = update(prefsRef.current);
    prefsRef.current = next;
    setPrefs(next);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {
      /* best-effort persistence */
    });
  }, []);

  const setRate = useCallback(
    (rate: number) => persist((p) => ({ ...p, rate: clampRate(rate) })),
    [persist]
  );

  const setVoice = useCallback(
    (target: SpeechTarget, identifier: string | undefined) =>
      persist((p) => {
        const voiceByTarget = { ...p.voiceByTarget };
        // `undefined` means "automatic" — drop the key rather than storing a hole.
        if (identifier) voiceByTarget[target] = identifier;
        else delete voiceByTarget[target];
        return { ...p, voiceByTarget };
      }),
    [persist]
  );

  const setReadMeaning = useCallback(
    (value: boolean) => persist((p) => ({ ...p, readMeaning: value })),
    [persist]
  );

  const setReadCommentary = useCallback(
    (value: boolean) => persist((p) => ({ ...p, readCommentary: value })),
    [persist]
  );

  const value = useMemo<ReadAloudPrefsContextValue>(
    () => ({ prefs, isLoading, setRate, setVoice, setReadMeaning, setReadCommentary }),
    [prefs, isLoading, setRate, setVoice, setReadMeaning, setReadCommentary]
  );

  return <ReadAloudPrefsContext.Provider value={value}>{children}</ReadAloudPrefsContext.Provider>;
}

export function useReadAloudPrefs(): ReadAloudPrefsContextValue {
  return useContext(ReadAloudPrefsContext);
}

export { STORAGE_KEY as READ_ALOUD_STORAGE_KEY };
