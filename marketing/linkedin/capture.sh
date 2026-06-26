#!/bin/bash
# Capture marketing screenshots for the LinkedIn reels on the booted iOS simulator.
#
#   ./capture.sh            # both flows (vrat + routine)
#   ./capture.sh vrat       # vrat only
#   ./capture.sh routine    # routine only
#
# Self-contained + portable: paths derive from this script's location. Starts Metro in
# production mode (--no-dev, so no LogBox dev-warning overlay appears in screenshots) if it
# isn't already running, loads the app into Expo Go, then runs the Maestro capture flow(s).
#
# Prereqs: booted iOS sim with Expo Go installed; `maestro` + `node` on PATH (or set MAESTRO_BIN).
set -uo pipefail
KIT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$KIT_DIR/../.." && pwd)"
MOBILE_DIR="$REPO_ROOT/mobile"
CONFIG="$MOBILE_DIR/.maestro/config.yaml"
MAESTRO="${MAESTRO_BIN:-maestro}"
METRO_LOG="$KIT_DIR/.metro.log"
MODE="${1:-all}"

cd "$KIT_DIR"                          # flows use takeScreenshot paths relative to cwd
mkdir -p shots/vrat shots/routine

echo "=== marketing status bar (9:41, full battery) ==="
xcrun simctl status_bar booted override --time "9:41" --batteryState charged --batteryLevel 100 \
  --dataNetwork wifi --wifiMode active --wifiBars 3 --cellularMode active --cellularBars 4 2>/dev/null \
  && echo "set" || echo "(skipped)"

echo "=== ensure production Metro is running on :8081 ==="
if ! curl -s -m 3 http://localhost:8081/status 2>/dev/null | grep -q "packager-status:running"; then
  echo "starting Metro (--no-dev --minify)…"
  ( cd "$MOBILE_DIR" && npx expo start --no-dev --minify --host localhost >"$METRO_LOG" 2>&1 & )
fi
for i in $(seq 1 45); do
  curl -s -m 3 http://localhost:8081/status 2>/dev/null | grep -q "packager-status:running" && { echo "metro up"; break; }
  sleep 2
done

echo "=== load Vedansh into Expo Go + wait for bundle ==="
xcrun simctl terminate booted host.exp.Exponent 2>/dev/null
xcrun simctl openurl booted "exp://127.0.0.1:8081"
for i in $(seq 1 70); do grep -q "Bundled" "$METRO_LOG" 2>/dev/null && { echo "bundle built"; break; }; sleep 3; done
sleep 8
xcrun simctl terminate booted host.exp.Exponent 2>/dev/null
sleep 2

run_flow() {
  echo "=== capture: $1 ==="
  "$MAESTRO" test --config "$CONFIG" "$KIT_DIR/flows/$1"; echo "exit=$?"
  xcrun simctl terminate booted host.exp.Exponent 2>/dev/null; sleep 3
}
[ "$MODE" = "all" ] || [ "$MODE" = "vrat" ]    && run_flow flow-vrat.yaml
[ "$MODE" = "all" ] || [ "$MODE" = "routine" ] && run_flow flow-routine.yaml

xcrun simctl status_bar booted clear 2>/dev/null
echo "=== done — screenshots in $KIT_DIR/shots/ ==="
echo "next: node make-reel.js vrat && node make-reel.js routine"
