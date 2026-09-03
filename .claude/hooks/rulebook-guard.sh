#!/usr/bin/env bash
# PreToolUse(Edit|Write|MultiEdit): block the RULEBOOK / CLAUDE.md "Non-negotiables"
# in mobile/src TypeScript edits before they land. Exits 2 (deny) with a reason.
# Scans only the NEW content the edit introduces, not the whole file.
set -uo pipefail

input=$(cat)
file=$(printf '%s' "$input" | jq -r '.tool_input.file_path // empty')

case "$file" in
  */mobile/src/*.ts|*/mobile/src/*.tsx) ;;
  *) exit 0 ;;
esac

# Every piece of new content this edit introduces (Edit / Write / MultiEdit).
new=$(printf '%s' "$input" | jq -r '
  [ .tool_input.new_string?,
    .tool_input.content?,
    (.tool_input.edits[]?.new_string) ]
  | map(select(. != null)) | join("\n")
')
[ -n "$new" ] || exit 0

block() {
  echo "BLOCKED by rulebook-guard (CLAUDE.md non-negotiable): $1" >&2
  echo "File: $file" >&2
  echo "Reshape the data or use a section-specific component instead of casting." >&2
  exit 2
}

# 1. Escape-hatch cast on a verse= prop.
if printf '%s' "$new" | grep -Eq 'verse=.* as (any|unknown as)'; then
  block "'as any' / 'as unknown as' on a verse= prop"
fi
# 2. Escape-hatch cast on route.params access.
if printf '%s' "$new" | grep -Eq '(route\.params.* as (any|unknown as)| as (any|unknown as).*route\.params)'; then
  block "'as any' / 'as unknown as' on route.params"
fi
# 3. @ts-ignore / @ts-expect-error in the same edit as a verse= prop or route.params.
if printf '%s' "$new" | grep -Eq '@ts-(ignore|expect-error)' \
   && printf '%s' "$new" | grep -Eq 'verse=|route\.params'; then
  block "'@ts-ignore' / '@ts-expect-error' near a verse= prop or route.params"
fi
# 4. Math.random() in background-selection code — must be a deterministic hash of verse id.
if printf '%s' "$new" | grep -Eq 'Math\.random'; then
  case "$file" in
    *[Bb]ackground*) block "Math.random() in background selection — use a deterministic hash of the verse id" ;;
  esac
  if printf '%s' "$new" | grep -Eiq 'background|getReaderBackground|getSourceBackground|images\['; then
    block "Math.random() in background/image selection — use a deterministic hash of the verse id"
  fi
fi

exit 0
