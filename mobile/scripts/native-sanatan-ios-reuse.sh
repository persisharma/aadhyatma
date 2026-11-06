#!/usr/bin/env bash
set -Eeuo pipefail
# Reuse the exact app already compiled for a469ea3. No native compilation/release.
SANATAN_REUSE_OUTPUT="$GITHUB_WORKSPACE/native-sanatan-output"
SANATAN_APP_ARCHIVE="$GITHUB_WORKSPACE/native-reuse/native-output/Vedansh-simulator.zip"
mkdir -p "$SANATAN_REUSE_OUTPUT"
printf '%s  %s\n' '3c74f9dd7f1a830ba092ae94b3e82772040d18ef9f22580eadb84b5be56bf419' "$SANATAN_APP_ARCHIVE" | shasum -a 256 -c -
ditto -x -k "$SANATAN_APP_ARCHIVE" "$RUNNER_TEMP/sanatan-app"
SANATAN_APP="$RUNNER_TEMP/sanatan-app/Vedansh.app"
test "$(/usr/libexec/PlistBuddy -c 'Print CFBundleIdentifier' "$SANATAN_APP/Info.plist")" = 'com.prashantsharma.vedansh'
lipo "$SANATAN_APP/Vedansh" -verify_arch "$(uname -m)"
xcodebuild -version > "$SANATAN_REUSE_OUTPUT/toolchain.txt"
cat > "$SANATAN_REUSE_OUTPUT/binary-origin.json" <<'JSON'
{"sourceHead":"a469ea3696f29baf588b3783fee83c9c1e000202","sourceRun":42168692889,"sourceArtifact":13481645746,"appArchiveSha256":"3c74f9dd7f1a830ba092ae94b3e82772040d18ef9f22580eadb84b5be56bf419","productionChanges":false,"note":"First native app built successfully. The unrelated widget-link smoke stopped at the iOS Open confirmation. This run tests Sanatan from Home using the preserved app."}
JSON
xcrun simctl list devices available --json > "$SANATAN_REUSE_OUTPUT/simulators.json"
SIMULATOR_UDID=$(python3 - "$SANATAN_REUSE_OUTPUT/simulators.json" <<'PY'
import json,sys
phones=[d for runtime,devices in json.load(open(sys.argv[1]))['devices'].items()
        if '.iOS-' in runtime for d in devices
        if d.get('isAvailable') and d['name'].startswith('iPhone')]
priority=['iPhone SE (3rd generation)','iPhone 16e','iPhone 17e','iPhone 16','iPhone 17']
phones.sort(key=lambda d:priority.index(d['name']) if d['name'] in priority else len(priority))
if not phones:raise SystemExit('No available iPhone simulator')
print(phones[0]['udid'])
PY
)
export SIMULATOR_UDID
echo "SIMULATOR_UDID=$SIMULATOR_UDID" >> "$GITHUB_ENV"
SIMULATOR_STATE=$(python3 - "$SANATAN_REUSE_OUTPUT/simulators.json" "$SIMULATOR_UDID" <<'PY'
import json,sys
print(next(d['state'] for ds in json.load(open(sys.argv[1]))['devices'].values() for d in ds if d['udid']==sys.argv[2]))
PY
)
if [[ "$SIMULATOR_STATE" != Booted ]]; then xcrun simctl boot "$SIMULATOR_UDID"; fi
xcrun simctl bootstatus "$SIMULATOR_UDID" -b
open -a Simulator --args -CurrentDeviceUDID "$SIMULATOR_UDID"
xcrun simctl status_bar "$SIMULATOR_UDID" override --time '09:41' --batteryState charged --batteryLevel 100
xcrun simctl ui "$SIMULATOR_UDID" appearance light
xcrun simctl install "$SIMULATOR_UDID" "$SANATAN_APP"
# Check XCTest first. The existing infrastructure flow opens only simulator Settings.
mkdir -p e2e-shots
maestro --device "$SIMULATOR_UDID" test --config .maestro/config.yaml --format junit --output "$SANATAN_REUSE_OUTPUT/driver.xml" .maestro/brand-driver-check.yaml 2>&1 | tee "$SANATAN_REUSE_OUTPUT/driver.log"
bash scripts/native-sanatan-matrix.sh ios "$SIMULATOR_UDID"
