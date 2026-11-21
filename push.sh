#!/usr/bin/env bash
# Usage:
#   ./push.sh                        publish to production, auto-message from last commit
#   ./push.sh "your message"         publish to production with message
#   CHANNEL=preview ./push.sh "msg"  override channel
#   PLATFORM=ios ./push.sh "msg"     publish only iOS (android/all also supported)

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MOBILE_DIR="${SCRIPT_DIR}/mobile"

if [[ ! -d "${MOBILE_DIR}" ]]; then
  echo "ERROR: mobile/ not found at ${MOBILE_DIR}" >&2
  exit 1
fi

CHANNEL="${CHANNEL:-production}"
PLATFORM="${PLATFORM-all}"
MESSAGE="${1:-}"

case "${PLATFORM}" in
  ios|android|all) ;;
  *) echo "ERROR: PLATFORM must be ios, android, or all." >&2; exit 1 ;;
esac

cd "${MOBILE_DIR}"

if [[ -z "${MESSAGE}" ]]; then
  MESSAGE="$(git log -1 --pretty=%s 2>/dev/null || echo "OTA update")"
fi

if [[ -n "$(git status --porcelain 2>/dev/null)" ]]; then
  echo "WARN: uncommitted changes; OTA bundle will be tagged dirty."
fi

# eas.json build-profile `env` is not applied to `eas update`; without this the
# OTA manifest carries metaTrackingEnabled=false and older binaries (1.5.0/72)
# never show the ATT prompt. Mirror the flag of the profile on this channel.
if [[ -z "${META_TRACKING_ENABLED:-}" ]]; then
  META_TRACKING_ENABLED="$(CHANNEL="${CHANNEL}" node -p "Object.values(require('./eas.json').build).find((p) => p.channel === process.env.CHANNEL)?.env?.META_TRACKING_ENABLED ?? ''")"
fi
export META_TRACKING_ENABLED

# The device-registration key is an EXPO_PUBLIC_ value: Expo inlines it into the
# bundle from the environment or mobile/.env* at export time, and eas.json `env`
# is not applied to `eas update`. Published without it, an OTA bundle silently
# falls back to capture-only registration (no push token, no heartbeat auth).
# Presence only — the value is never read or printed. Warns; does not stop.
DEVICE_KEY_NAME="EXPO_PUBLIC_DEVICE_REGISTRATION_API_KEY"
if [[ -n "${!DEVICE_KEY_NAME:-}" ]] || grep -qs "^${DEVICE_KEY_NAME}=." .env .env.local .env.production .env.production.local; then
  DEVICE_KEY_STATE="set"
else
  DEVICE_KEY_STATE="NOT SET"
  echo "WARN: ${DEVICE_KEY_NAME} is not set in the environment or mobile/.env*; this OTA will register devices in capture-only mode." >&2
fi

echo "Channel: ${CHANNEL}"
echo "Platform: ${PLATFORM}"
echo "Device registration key: ${DEVICE_KEY_STATE}"
echo "Meta tracking: ${META_TRACKING_ENABLED:-unset (disabled)}"
echo "Message: ${MESSAGE}"
# How the Valmiki corpus travels follows the runtime being published to
# (mobile/corpusDelivery.js): a store build that predates the bundled part files
# keeps the corpus in the JS bundle, so this OTA asks nothing of it that it lacks.
# Assigned first so a failure here (a mistyped VALMIKI_CORPUS_DELIVERY) stops the publish.
CORPUS_DELIVERY="$(node -p "require('./corpusDelivery').describeValmikiCorpusDelivery(require('./app.json').expo.version)")"
echo "Valmiki corpus: ${CORPUS_DELIVERY}"

exec npx eas-cli update \
  --channel "${CHANNEL}" \
  --platform "${PLATFORM}" \
  --message "${MESSAGE}" \
  --non-interactive

