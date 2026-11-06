const { spawnSync } = require('node:child_process');

/** Optional cleanup must never hide the flow result behind a stuck simulator command. */
function runNativeDiagnostic(command, args, timeout = 20_000) {
  const result = spawnSync(command, args, { stdio: 'inherit', timeout, killSignal: 'SIGKILL' });
  if (result.error?.code === 'ETIMEDOUT') {
    console.error(`Native diagnostic timed out after ${timeout}ms: ${command}`);
    return 124;
  }
  if (result.error) throw result.error;
  return result.status ?? 1;
}
module.exports = { runNativeDiagnostic };
if (require.main === module) {
  process.exitCode = runNativeDiagnostic(process.argv[2], process.argv.slice(3));
}
