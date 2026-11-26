// One anonymous event ID per fact. There is no shared installation ID on the wire.
export type Action =
  | 'kundali_generated'
  | 'panchang_today_viewed'
  | 'gita_read'
  | 'other_read'
  | 'bead_counted'
  | 'bookmark_saved'
  | 'share_handoff'
  | 'routine_completed';
type Fact = 'first_open' | 'first_action' | 'day7_return';
export interface CohortEvent {
  id: string;
  cohort: string;
  version: string;
  build: string;
  fact: Fact;
  action: Action | null;
  firstSession: boolean;
}
interface State {
  cohort: string;
  version: string;
  build: string;
  firstSessionKey: string;
  action: Action | null;
  inFirstSession: boolean;
  returned: boolean;
  pending: CohortEvent[];
}
export interface RetentionIO {
  read(): Promise<string | null>;
  write(value: string): Promise<void>;
  send(event: CohortEvent): Promise<boolean>;
  uuid(): string;
  now(): number;
}
const DAY = 86_400_000;
const indiaDay = (time: number) => new Date(time + 330 * 60_000).toISOString().slice(0, 10);
const age = (time: number, cohort: string) => (Date.parse(indiaDay(time)) - Date.parse(cohort)) / DAY;

export function createCohort(io: RetentionIO) {
  let state: State | null = null;
  let loaded = false;
  let sending: Promise<void> | undefined;
  let writes = Promise.resolve();
  const serialize = (fn: () => Promise<void>) => {
    writes = writes.then(fn).catch(() => {
      /* Measurement never blocks the app. */
    });
    return writes;
  };
  async function save(next: State) {
    await io.write(JSON.stringify(next));
    state = next;
  }
  function append(s: State, fact: Fact, action: Action | null, firstSession: boolean) {
    const event = {
      id: io.uuid(),
      cohort: s.cohort,
      version: s.version,
      build: s.build,
      fact,
      action,
      firstSession,
    };
    return save({ ...s, pending: [...s.pending, event] });
  }
  // HTTP never holds the storage queue. Only acknowledge the exact persisted event.
  function flush(): Promise<void> {
    sending ??= deliver().finally(() => {
      sending = undefined;
    });
    return sending;
  }
  async function deliver() {
    try {
      await writes;
      while (state?.pending.length) {
        const event = state.pending[0];
        if (age(io.now(), event.cohort) <= 45 && !(await io.send(event))) break;
        let acknowledged = false;
        await serialize(async () => {
          if (state) await save({ ...state, pending: state.pending.filter((e) => e.id !== event.id) });
          acknowledged = true;
        });
        if (!acknowledged) break;
      }
    } catch {
      /* Retry on the next foreground, or on a scheduled flush. */
    }
  }
  async function foreground(
    fresh: boolean,
    version: string,
    build: string,
    session: string,
    time: number,
  ) {
    await serialize(async () => {
      if (!loaded) {
        const raw = await io.read();
        state = raw ? (JSON.parse(raw) as State) : null;
        loaded = true;
      }
      if (!state && fresh) {
        await append(
          {
            cohort: indiaDay(time),
            version,
            build,
            firstSessionKey: session,
            action: null,
            inFirstSession: false,
            returned: false,
            pending: [],
          },
          'first_open',
          null,
          false,
        );
      } else if (state && !state.returned && age(time, state.cohort) === 7) {
        await append({ ...state, returned: true }, 'day7_return', state.action, state.inFirstSession);
      }
    });
    void flush();
  }
  async function complete(action: Action, session: string, time: number) {
    let settled = false;
    await serialize(async () => {
      if (!loaded) return;
      if (!state || state.action || age(time, state.cohort) < 0 || age(time, state.cohort) >= 7) {
        settled = true;
        return;
      }
      const firstSession = session === state.firstSessionKey;
      await append(
        { ...state, action, inFirstSession: firstSession },
        'first_action',
        action,
        firstSession,
      );
      settled = true;
    });
    void flush();
    return settled;
  }
  return { foreground, complete, flush };
}
