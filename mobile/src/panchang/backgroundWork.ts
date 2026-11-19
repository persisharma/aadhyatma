/** Cooperative CPU work. A Promise alone cannot release the JS thread: solvers
 * must yield between bounded units. All jobs share one small, round-robin budget
 * so simultaneous Home resolvers cannot each spend a full frame independently.
 * A single engine primitive is still synchronous; the budget is checked after it.
 *
 * Two lanes. `background` (the default) is unchanged: 4 ms slices, round-robin.
 * `foreground` is for an answer a person is looking at a spinner for — a screen
 * they opened, not launch-time housekeeping. While any foreground job is queued,
 * each tick runs only foreground work, in a 12 ms slice; background jobs resume
 * when the lane empties. Without it, a screen opened during the launch burst
 * (widget plan, muhurat prewarm, reminder passes) got the same thin share as all
 * of them, and a cold Pitru detail took longer than a person will wait. 12 ms is
 * still inside one frame, so a queued tap still lands between slices.
 */
export type WorkPriority = 'background' | 'foreground';
type Job = { step: () => boolean };
const lanes: Record<WorkPriority, Job[]> = { foreground: [], background: [] };
const SLICE_MS: Record<WorkPriority, number> = { background: 4, foreground: 12 };
let scheduled = false;

function pending(): boolean {
  return lanes.foreground.length > 0 || lanes.background.length > 0;
}

function schedule(): void {
  if (scheduled || !pending()) return;
  scheduled = true;
  setTimeout(() => {
    const lane: WorkPriority = lanes.foreground.length > 0 ? 'foreground' : 'background';
    const jobs = lanes[lane];
    const start = performance.now();
    do {
      const job = jobs.shift()!;
      if (!job.step()) jobs.push(job);
    } while (jobs.length > 0 && performance.now() - start < SLICE_MS[lane]);
    scheduled = false;
    schedule();
  }, 0);
}

/** Always starts on a later turn. Cancellation returns undefined and closes the
 * iterator before further work or publication. Exceptions reject only this job.
 */
export function runInBackground<T>(
  work: Generator<void, T, void>,
  isCancelled: () => boolean = () => false,
  priority: WorkPriority = 'background'
): Promise<T | undefined> {
  return new Promise((resolve, reject) => {
    lanes[priority].push({ step: () => {
      try {
        if (isCancelled()) {
          work.return(undefined as T);
          resolve(undefined);
          return true;
        }
        const result = work.next();
        if (result.done) resolve(result.value);
        return result.done === true;
      } catch (error) {
        reject(error);
        return true;
      }
    } });
    schedule();
  });
}

/** Synchronous callers use exactly the same calculation and matching rules. */
export function runSynchronously<T>(work: Generator<void, T, void>): T {
  let result = work.next();
  while (!result.done) result = work.next();
  return result.value;
}
