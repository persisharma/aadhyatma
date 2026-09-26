// Two independent 32-bit rolling checks plus length. Only an E2E oracle; not a
// security hash. The host parity suite separately compares every field exactly.
export function fingerprint(value) {
  const text = JSON.stringify(value);
  let a = 2166136261, b = 5381;
  for (let i = 0; i < text.length; i++) {
    a = Math.imul(a ^ text.charCodeAt(i), 16777619);
    b = Math.imul(b, 33) ^ text.charCodeAt(i);
  }
  return `${text.length}:${a >>> 0}:${b >>> 0}`;
}
