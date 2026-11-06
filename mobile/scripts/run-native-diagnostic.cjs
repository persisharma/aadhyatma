const { spawnSync } = require('node:child_process');

/** Bound native commands while preserving their real success/failure result. */
function runNativeDiagnostic(command, args, timeout = 20_000) {
  const result = spawnSync(command, args, { stdio: 'inherit', timeout, killSignal: 'SIGKILL' });
  if (result.error?.code === 'ETIMEDOUT') {
    console.error(`Native command timed out after ${timeout}ms: ${command}`);
    return 124;
  }
  if (result.error) throw result.error;
  return result.status ?? 1;
}
module.exports = { runNativeDiagnostic };
if (require.main === module) {
  let args = process.argv.slice(2);
  let timeout = 20_000;
  if (args[0] === '--timeout-ms') {
    timeout = Number(args[1]);
    args = args.slice(2);
  }
  if (!Number.isSafeInteger(timeout) || timeout <= 0 || !args[0]) {
    console.error('Usage: run-native-diagnostic.cjs [--timeout-ms positive-integer] command [args...]');
    process.exitCode = 2;
  } else {
    process.exitCode = runNativeDiagnostic(args[0], args.slice(1), timeout);
  }
}
