#!/usr/bin/env bash
set -Eeuo pipefail

# Unsigned Release simulator only: no signing credentials or store submission.
BRAND_OUTPUT="${GITHUB_WORKSPACE:-$(pwd)/..}/native-brand-output"
BRAND_DERIVED="${RUNNER_TEMP:-/tmp}/vedansh-brand-derived"
mkdir -p "$BRAND_OUTPUT"
RECORD_PID=''
cleanup() {
  local result=$?
  trap - EXIT
  set +e
  if [[ -n "$RECORD_PID" ]]; then
    kill -INT "$RECORD_PID"
    wait "$RECORD_PID"
  fi
  if [[ $result -ne 0 && -n "${SIMULATOR_UDID:-}" ]]; then
    xcrun simctl io "$SIMULATOR_UDID" screenshot "$BRAND_OUTPUT/failure.png"
    xcrun simctl spawn "$SIMULATOR_UDID" log show --last 5m --style compact \
      --predicate 'process == "Vedansh" OR process == "SpringBoard"' > "$BRAND_OUTPUT/device-failure.log" 2>&1
  fi
  if [[ -d "$HOME/.maestro/tests" ]]; then cp -R "$HOME/.maestro/tests" "$BRAND_OUTPUT/maestro-debug"; fi
  exit "$result"
}
trap cleanup EXIT

git rev-parse HEAD > "$BRAND_OUTPUT/tested-head.txt"
xcodebuild -version > "$BRAND_OUTPUT/toolchain.txt"
maestro --version >> "$BRAND_OUTPUT/toolchain.txt"
xcrun simctl list devices available --json > "$BRAND_OUTPUT/simulators.json"
SIMULATOR_UDID=$(python3 - "$BRAND_OUTPUT/simulators.json" <<'PY'
import json,sys
phones=[d for runtime,devices in json.load(open(sys.argv[1]))['devices'].items()
        if '.iOS-' in runtime for d in devices
        if d.get('isAvailable') and d['name'].startswith('iPhone')]
if not phones: raise SystemExit('No available iPhone simulator')
priority=['iPhone SE (3rd generation)','iPhone 16e','iPhone 17e','iPhone 16','iPhone 17']
phones.sort(key=lambda d:priority.index(d['name']) if d['name'] in priority else len(priority))
print(phones[0]['udid'])
PY
)
export SIMULATOR_UDID
echo "SIMULATOR_UDID=$SIMULATOR_UDID" >> "$GITHUB_ENV"
SIMULATOR_STATE=$(python3 - "$BRAND_OUTPUT/simulators.json" "$SIMULATOR_UDID" <<'PY'
import json,sys
print(next(d['state'] for ds in json.load(open(sys.argv[1]))['devices'].values() for d in ds if d['udid']==sys.argv[2]))
PY
)
if [[ "$SIMULATOR_STATE" != 'Booted' ]]; then xcrun simctl boot "$SIMULATOR_UDID"; fi
xcrun simctl bootstatus "$SIMULATOR_UDID" -b
xcrun simctl ui "$SIMULATOR_UDID" appearance light
xcrun simctl status_bar "$SIMULATOR_UDID" override --time '09:41' --batteryState charged --batteryLevel 100
BRAND_WORKSPACE=$(python3 - <<'PY'
from pathlib import Path
print(next(Path('ios').glob('*.xcworkspace')))
PY
)
xcodebuild -workspace "$BRAND_WORKSPACE" -scheme Vedansh -configuration Release \
  -sdk iphonesimulator -destination "id=$SIMULATOR_UDID" \
  -derivedDataPath "$BRAND_DERIVED" CODE_SIGNING_ALLOWED=NO build \
  2>&1 | tee "$BRAND_OUTPUT/native-build.log"
BRAND_APP=$(python3 - "$BRAND_DERIVED" <<'PY'
from pathlib import Path
import sys
apps=list((Path(sys.argv[1])/'Build/Products/Release-iphonesimulator').glob('*.app'))
if len(apps)!=1: raise SystemExit(f'Expected one host app, found {len(apps)}')
print(apps[0])
PY
)
xcrun simctl install "$SIMULATOR_UDID" "$BRAND_APP"
mkdir -p e2e-shots
# Complete consent/setup once, then record the actual cold/warm lifecycle flow.
maestro --device "$SIMULATOR_UDID" test --format junit --output "$BRAND_OUTPUT/setup.xml" \
  .maestro/_launch.yaml 2>&1 | tee "$BRAND_OUTPUT/setup.log"
xcrun simctl io "$SIMULATOR_UDID" recordVideo --codec=h264 "$BRAND_OUTPUT/lifecycle.mp4" \
  > "$BRAND_OUTPUT/recording.log" 2>&1 &
RECORD_PID=$!
sleep 1
maestro --device "$SIMULATOR_UDID" test --format junit --output "$BRAND_OUTPUT/lifecycle.xml" \
  .maestro/brand-lifecycle.yaml 2>&1 | tee "$BRAND_OUTPUT/lifecycle.log"
printf '%s\n' 'PASS: unsigned native Release build, install, cold reveal, three warm returns without reveal, and second killed-process reveal.' > "$BRAND_OUTPUT/result.txt"
printf '%s\n' 'PENDING: physical-device, Android, targeted notification/widget and four-language/size visual checks.' >> "$BRAND_OUTPUT/result.txt"
