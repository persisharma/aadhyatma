#!/usr/bin/env bash
# Cached visual-regression check for the Maestro e2e suite — zero LLM tokens
# on unchanged screens.
#
# Flows write checkpoints via `takeScreenshot: e2e-shots/<name>` (relative to
# mobile/, where maestro runs). This script normalizes each capture to a fixed
# point-resolution and pixel-diffs it against the cached golden in
# .maestro/goldens/. Verdicts are TEXT:
#
#   SEEDED <name>              first run — normalized capture became the golden
#   PASS   <name> 0.012%       matches the golden (diff ≤ threshold)
#   FAIL   <name> 3.410% bbox=… → inspect e2e-shots/<name>.diff.png
#
# Only a FAIL warrants reading an image — and then the *.diff.png (changed
# pixels in red on the faded capture), not the raw screenshots.
#
# Usage (from mobile/):  ./scripts/e2e-visual-check.sh [captures-dir]
#   env: E2E_VISUAL_THRESH  FAIL above this diff %          (default 0.10)
#        E2E_DIFF_TOL       per-channel tolerance, 0-255    (default 10)
#        E2E_DIFF_MASK_TOP  top fraction ignored (status bar clock, default 0.05)
#
# To intentionally accept a UI change: delete .maestro/goldens/<name>.png and
# re-run (reseed), then commit the new golden.
set -euo pipefail

cd "$(dirname "$0")/.."   # mobile/
SHOTS_DIR="${1:-e2e-shots}"
GOLDENS_DIR=".maestro/goldens"
THRESH="${E2E_VISUAL_THRESH:-0.10}"
NORM_W=440 NORM_H=956     # iPhone-class point resolution; goldens are stored normalized

mkdir -p "$GOLDENS_DIR" "$SHOTS_DIR"

shopt -s nullglob
captures=("$SHOTS_DIR"/*.png)
# run artifacts we generate ourselves are not checkpoints
captures=($(printf '%s\n' "${captures[@]:-}" | grep -v '\.diff\.png$' || true))
if [ ${#captures[@]} -eq 0 ]; then
  echo "no captures in $SHOTS_DIR — run a flow with takeScreenshot steps first" >&2
  exit 1
fi

fail=0
for cap in "${captures[@]}"; do
  name="$(basename "$cap" .png)"
  golden="$GOLDENS_DIR/$name.png"
  norm="$(mktemp -t "e2e-norm-$name").png"
  sips -z "$NORM_H" "$NORM_W" "$cap" --out "$norm" >/dev/null

  if [ ! -f "$golden" ]; then
    cp "$norm" "$golden"
    echo "SEEDED $name"
  else
    out="$(node scripts/e2e-visual-diff.mjs "$golden" "$norm" "$SHOTS_DIR/$name.diff.png")" || {
      echo "ERROR  $name (diff exited $?)"; fail=1; rm -f "$norm"; continue; }
    pct="${out%% *}"; bbox="${out#* }"
    if [ "$(echo "$pct > $THRESH" | bc -l)" = "1" ]; then
      echo "FAIL   $name ${pct}% bbox=${bbox} → inspect $SHOTS_DIR/$name.diff.png"
      fail=1
    else
      echo "PASS   $name ${pct}%"
    fi
  fi
  rm -f "$norm"
done
exit $fail
