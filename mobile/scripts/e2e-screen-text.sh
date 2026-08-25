#!/usr/bin/env bash
# Dump the current simulator/emulator screen as compact text — one line per
# element that carries an accessibility label, visible text, or testID.
#
# Purpose: lets an agent (or a human on a slow link) answer "what is on
# screen right now?" from the same accessibility tree Maestro asserts
# against, WITHOUT reading a screenshot. A full-res screenshot costs
# ~1,100–1,600 LLM tokens per read; this output is typically ~100–300.
#
# Usage:
#   ./scripts/e2e-screen-text.sh                # default connected device
#   ./scripts/e2e-screen-text.sh <UDID>         # explicit simulator UDID
#   ./scripts/e2e-screen-text.sh <UDID> | grep -i "hanuman"
#
# Output columns: [bounds] #testID label-or-text
# Note: RN merges child text into an `accessible` parent, so a card shows as
# ONE comma-joined line — the same string Maestro regex-matches (see
# .maestro/README.md "Element selection rules").
set -euo pipefail

DEVICE_ARG=()
[ $# -ge 1 ] && DEVICE_ARG=(--device "$1")

maestro "${DEVICE_ARG[@]}" hierarchy 2>/dev/null \
  | sed -n '/^{/,$p' \
  | jq -r '
    def nodes: ., (.children[]? | nodes);
    [ nodes | .attributes
      | { label: (.accessibilityText // ""),
          text:  (.text // ""),
          id:    (."resource-id" // ""),
          b:     (.bounds // "") }
      | select(.label != "" or .text != "" or .id != "") ]
    | .[]
    | .b + " " + (if .id != "" then "#" + .id + " " else "" end)
        + (if .label != "" then .label else .text end)' \
  | awk '!seen[$0]++'
