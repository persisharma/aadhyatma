#!/usr/bin/env bash
# PostToolUse(Edit|Write|MultiEdit): run the mobile app's tsc --noEmit after any
# edit to its TypeScript sources. tsc is this project's primary quality gate
# (CLAUDE.md). On type errors, exit 2 so the failure is fed back to the model.
# Skips silently when deps aren't installed (nothing to run against).
set -uo pipefail

input=$(cat)
file=$(printf '%s' "$input" | jq -r '.tool_input.file_path // empty')

case "$file" in
  */mobile/src/*.ts|*/mobile/src/*.tsx) ;;
  *) exit 0 ;;
esac

mobile="${file%%/mobile/*}/mobile"
tsc="$mobile/node_modules/.bin/tsc"
[ -x "$tsc" ] || exit 0

if ! out=$("$tsc" --noEmit -p "$mobile/tsconfig.json" 2>&1); then
  echo "tsc --noEmit failed after editing $file:" >&2
  printf '%s\n' "$out" >&2
  exit 2
fi
exit 0
