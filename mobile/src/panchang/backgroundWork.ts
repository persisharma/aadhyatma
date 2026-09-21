/** Cooperative CPU work. A Promise alone cannot release the JS thread: solvers
 * must yield between bounded units. All jobs share one small, round-robin budget
 * so simultaneous Home resolvers cannot each spend a full frame independently.
 * A single engine primitive is still synchronous; the budget is checked after it.
 */
type Job = { step: () => boolean };
const jobs: Job[] = [];
const SLICE_MS = 4;
let scheduled = false;

function schedule(): void {
  if (scheduled || jobs.length === 0) return;
  scheduled = true;
  setTimeout(() => {
    const start = performance.now();
    do {
      const job = jobs.shift()!;
      if (!job.step()) jobs.push(job);
    } while (jobs.length > 0 && performance.now() - start < SLICE_MS);
    scheduled = false;
    schedule();
  }, 0);
}

/** Always starts on a later turn. Cancellation returns undefined and closes the
 * iterator before further work or publication. Exceptions reject only this job.
 */
export function runInBackground<T>(
  work: Generator<void, T, void>,
  isCancelled: () => boolean = () => false
): Promise<T | undefined> {
  return new Promise((resolve, reject) => {
    jobs.push({ step: () => {
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
