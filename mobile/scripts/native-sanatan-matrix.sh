#!/usr/bin/env bash
set -Eeuo pipefail
# Simulator/emulator acceptance only. Never invokes EAS, signing or publishing.
PLATFORM=${1:?Expected ios or android}
DEVICE=${2:?Expected native device ID}
MATRIX_SCOPE=${SANATAN_MATRIX_SCOPE:-all}
SANATAN_OUTPUT="${GITHUB_WORKSPACE:-$(pwd)/..}/native-sanatan-output"
mkdir -p "$SANATAN_OUTPUT" e2e-shots
SANATAN_PHASE=setup
cleanup() {
  local result=$?
  trap - EXIT
  set +e
  # Preserve the real flow failure before optional OS diagnostics can stall.
  printf '{"platform":"%s","scope":"%s","phase":"%s","exitCode":%s}\n' "$PLATFORM" "$MATRIX_SCOPE" "$SANATAN_PHASE" "$result" > "$SANATAN_OUTPUT/result.json"
  if [[ "$PLATFORM" == ios ]]; then
    node scripts/run-native-diagnostic.cjs xcrun simctl io "$DEVICE" screenshot "$SANATAN_OUTPUT/final.png"
    node scripts/run-native-diagnostic.cjs xcrun simctl ui "$DEVICE" content_size large
    node scripts/run-native-diagnostic.cjs xcrun simctl spawn "$DEVICE" log show --last 3m --style compact --predicate 'process == "Vedansh"' > "$SANATAN_OUTPUT/device.log" 2>&1
  else
    node scripts/run-native-diagnostic.cjs adb -s "$DEVICE" logcat -d > "$SANATAN_OUTPUT/device.log" 2>&1
    node scripts/run-native-diagnostic.cjs adb -s "$DEVICE" exec-out screencap -p > "$SANATAN_OUTPUT/final.png"
    node scripts/run-native-diagnostic.cjs adb -s "$DEVICE" shell settings put system font_scale 1.0
  fi
  cp e2e-shots/sanatan*.png "$SANATAN_OUTPUT/" 2>/dev/null
  if [[ -d "$HOME/.maestro/tests" ]]; then cp -R "$HOME/.maestro/tests" "$SANATAN_OUTPUT/maestro-debug"; fi
  exit "$result"
}
trap cleanup EXIT
case "$PLATFORM" in ios|android) ;; *) echo 'Unsupported platform'; exit 2;; esac
case "$MATRIX_SCOPE" in all|journeys|resume|collections|search|standard|enlarged) ;; *) echo 'Unsupported native matrix scope'; exit 2;; esac
git rev-parse HEAD > "$SANATAN_OUTPUT/tested-head.txt"
maestro --version > "$SANATAN_OUTPUT/maestro-version.txt"
if [[ "$PLATFORM" == ios ]]; then
  xcrun simctl list devices available --json > "$SANATAN_OUTPUT/devices.json"
else
  adb -s "$DEVICE" shell wm size > "$SANATAN_OUTPUT/device-size.txt"
  adb -s "$DEVICE" shell wm density >> "$SANATAN_OUTPUT/device-size.txt"
fi
if [[ "$MATRIX_SCOPE" == all || "$MATRIX_SCOPE" == journeys || "$MATRIX_SCOPE" == resume ]]; then
  SANATAN_PHASE=saved-resume-journey
  node scripts/run-native-diagnostic.cjs --timeout-ms 1200000 maestro --device "$DEVICE" test --config .maestro/config.yaml --format junit --output "$SANATAN_OUTPUT/journey.xml" \
    .maestro/sanatan-parichay-smoke.yaml 2>&1 | tee "$SANATAN_OUTPUT/journey.log"
fi
if [[ "$MATRIX_SCOPE" == all || "$MATRIX_SCOPE" == journeys || "$MATRIX_SCOPE" == collections ]]; then
  SANATAN_PHASE=all-collections
  node scripts/run-native-diagnostic.cjs --timeout-ms 2700000 maestro --device "$DEVICE" test --config .maestro/config.yaml --format junit --output "$SANATAN_OUTPUT/collections.xml" \
    .maestro/sanatan-native-collections.yaml 2>&1 | tee "$SANATAN_OUTPUT/collections.log"
fi
if [[ "$MATRIX_SCOPE" == all || "$MATRIX_SCOPE" == journeys || "$MATRIX_SCOPE" == search ]]; then
  SANATAN_PHASE=regional-search
  node scripts/run-native-diagnostic.cjs --timeout-ms 1500000 maestro --device "$DEVICE" test --config .maestro/config.yaml --format junit --output "$SANATAN_OUTPUT/regional-search.xml" \
    .maestro/sanatan-regional-search.yaml 2>&1 | tee "$SANATAN_OUTPUT/regional-search.log"
  SANATAN_PHASE=swastika-guide
  node scripts/run-native-diagnostic.cjs --timeout-ms 1200000 maestro --device "$DEVICE" test --config .maestro/config.yaml --format junit --output "$SANATAN_OUTPUT/swastika-guide.xml" \
    .maestro/sanatan-swastika-guide.yaml 2>&1 | tee "$SANATAN_OUTPUT/swastika-guide.log"
fi
for text_setting in standard enlarged; do
  if [[ "$MATRIX_SCOPE" != all && "$MATRIX_SCOPE" != "$text_setting" ]]; then continue; fi
  if [[ "$PLATFORM" == ios ]]; then
    if [[ "$text_setting" == enlarged ]]; then xcrun simctl ui "$DEVICE" content_size accessibility-extra-large;
    else xcrun simctl ui "$DEVICE" content_size large; fi
  else
    if [[ "$text_setting" == enlarged ]]; then adb -s "$DEVICE" shell settings put system font_scale 1.5;
    else adb -s "$DEVICE" shell settings put system font_scale 1.0; fi
  fi
  SANATAN_PHASE="matrix-$text_setting"
  # Each matrix has all four reading scripts and both in-app reading presets.
  # _launch clears test app storage at matrix start; persistence is tested above.
  node scripts/run-native-diagnostic.cjs --timeout-ms 2100000 maestro --device "$DEVICE" test --config .maestro/config.yaml --format junit --output "$SANATAN_OUTPUT/$text_setting.xml" \
    -e "CAPTURE_SUFFIX=$PLATFORM-$text_setting" .maestro/sanatan-parichay-language-size.yaml \
    2>&1 | tee "$SANATAN_OUTPUT/$text_setting.log"
  mkdir -p "$SANATAN_OUTPUT/$text_setting"
  node scripts/collect-sanatan-matrix-screenshots.cjs "$HOME/.maestro/tests" "$SANATAN_OUTPUT/$text_setting" "$PLATFORM-$text_setting"
done
SANATAN_PHASE=complete
# Screenshots still require human visual inspection; successful automation is not pixel approval.
