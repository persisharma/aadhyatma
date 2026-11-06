#!/usr/bin/env bash
set -Eeuo pipefail

# This script runs on a macOS CI runner, from mobile/. No publishing or signing
# credentials are used. Simulator compilation is separate from signed-device QA.
OUTPUT="${GITHUB_WORKSPACE:-$(pwd)/..}/native-output"
mkdir -p "$OUTPUT"
# Keep the command failure after xcodebuild in the artifact, not only Actions logs.
exec > >(tee -a "$OUTPUT/native-smoke.log") 2>&1
PHASE=prepare
failure_evidence() {
  local rc=$?
  trap - ERR
  set +e
  printf 'FAIL phase=%s exit=%s line=%s\n' "$PHASE" "$rc" "${BASH_LINENO[0]:-unknown}" > "$OUTPUT/failure.log"
  if [[ -n "${SIMULATOR_UDID:-}" ]]; then
    node scripts/run-native-diagnostic.cjs xcrun simctl spawn "$SIMULATOR_UDID" launchctl list > "$OUTPUT/processes-at-failure.log" 2>&1
    node scripts/run-native-diagnostic.cjs xcrun simctl io "$SIMULATOR_UDID" screenshot "$OUTPUT/failure.png"
    node scripts/run-native-diagnostic.cjs xcrun simctl spawn "$SIMULATOR_UDID" log show --last 5m --style compact --predicate 'process == "Vedansh" OR process == "SpringBoard"' > "$OUTPUT/device-failure.log" 2>&1
  fi
  shopt -s nullglob
  for report in "$HOME"/Library/Logs/DiagnosticReports/Vedansh*.ips; do
    cp "$report" "$OUTPUT/$(basename "$report")"
  done
  exit "$rc"
}
trap failure_evidence ERR
xcrun simctl list devices available --json > "$OUTPUT/simulators.json"
SIMULATOR_UDID=$(node scripts/select-native-ios-device.cjs "$OUTPUT/simulators.json")
if [[ -n "${GITHUB_ENV:-}" ]]; then
  echo "SIMULATOR_UDID=$SIMULATOR_UDID" >> "$GITHUB_ENV"
fi
export SIMULATOR_UDID
echo "Native smoke simulator: $SIMULATOR_UDID"
STATE=$(python3 - "$OUTPUT/simulators.json" "$SIMULATOR_UDID" <<'PY'
import json,sys
print(next(d['state'] for ds in json.load(open(sys.argv[1]))['devices'].values() for d in ds if d['udid']==sys.argv[2]))
PY
)
if [[ "$STATE" != 'Booted' ]]; then xcrun simctl boot "$SIMULATOR_UDID"; fi
xcrun simctl bootstatus "$SIMULATOR_UDID" -b
xcrun simctl status_bar "$SIMULATOR_UDID" override --time '09:41' --batteryState charged --batteryLevel 100

if [[ "${NATIVE_SMOKE_DRIVER_CHECK:-0}" == 1 ]]; then
  PHASE=driver-preflight
  open -a Simulator --args -CurrentDeviceUDID "$SIMULATOR_UDID"
  maestro --device "$SIMULATOR_UDID" test --config .maestro/config.yaml --format junit \
    --output "$OUTPUT/driver.xml" .maestro/brand-driver-check.yaml 2>&1 | tee "$OUTPUT/driver.log"
fi

WORKSPACE=$(python3 - <<'PY'
from pathlib import Path
print(next(Path('ios').glob('*.xcworkspace')))
PY
)
PHASE=native-build
xcodebuild -workspace "$WORKSPACE" -scheme Vedansh -configuration Release \
  -sdk iphonesimulator -destination "id=$SIMULATOR_UDID" \
  -derivedDataPath "$OUTPUT/DerivedData" ARCHS="$(uname -m)" ONLY_ACTIVE_ARCH=YES CODE_SIGNING_ALLOWED=NO \
  build 2>&1 | tee "$OUTPUT/native-build.log"

APP_PATH=$(python3 - "$OUTPUT" <<'PY'
from pathlib import Path
import sys
apps=list((Path(sys.argv[1])/'DerivedData/Build/Products/Release-iphonesimulator').glob('*.app'))
if len(apps)!=1: raise SystemExit(f'Expected one host app, found {len(apps)}')
print(apps[0])
PY
)
test -d "$APP_PATH/PlugIns/VedanshWidgets.appex"
APP_ID=$(node -p 'require("./app.json").expo.ios.bundleIdentifier')
PHASE=install
xcrun simctl install "$SIMULATOR_UDID" "$APP_PATH"
# Retain the successfully built app even when a later UI/deep-link check fails.
ditto -c -k --sequesterRsrc --keepParent "$APP_PATH" "$OUTPUT/Vedansh-simulator.zip"

assert_running() {
  xcrun simctl spawn "$SIMULATOR_UDID" launchctl list | awk -v app="$APP_ID" \
    'index($0,app) && $1 ~ /^[0-9]+$/ {running=1} END {exit !running}'
}
capture() {
  # Bounded settling period; an app that exits immediately must fail this smoke.
  sleep 8
  assert_running
  xcrun simctl io "$SIMULATOR_UDID" screenshot "$OUTPUT/$1.png"
}

PHASE=initial-launch
xcrun simctl launch "$SIMULATOR_UDID" "$APP_ID" | tee "$OUTPUT/launch.log"
capture launch

if [[ "${NATIVE_SMOKE_SCOPE:-widgets}" == host ]]; then
  printf '%s\n' 'PASS: native host + widget extension compiled; host installed, launched and stayed running.' > "$OUTPUT/result.log"
  printf '%s\n' 'Sanatan UI acceptance is executed by its own Maestro journeys; widget-link interaction is outside this setup.' >> "$OUTPUT/result.log"
  exit 0
fi

# The shared native flow handles the OS Open confirmation and asserts actual
# gallery/deep-link destinations, including a cold restart and exact civil date.
PHASE=widget-deep-link-journey
maestro --device "$SIMULATOR_UDID" test --config .maestro/config.yaml --format junit \
  --output "$OUTPUT/widgets.xml" .maestro/home-widgets-smoke.yaml 2>&1 | tee "$OUTPUT/widgets.log"

printf '%s\n' 'PASS: native host + embedded widget extension compiled; widget gallery and warm/cold deep-link destinations passed the shared Maestro flow.' > "$OUTPUT/result.log"
printf '%s\n' 'PENDING: Home Screen widget placement/rendering, four-language/size matrix, signed-device entitlements and visual review.' >> "$OUTPUT/result.log"
