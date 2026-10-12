#!/usr/bin/env bash
# Usage:
#   ./push.sh                        publish to production, auto-message from last commit
#   ./push.sh "your message"         publish to production with message
#   CHANNEL=preview ./push.sh "msg"  override channel

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MOBILE_DIR="${SCRIPT_DIR}/mobile"

if [[ ! -d "${MOBILE_DIR}" ]]; then
  echo "ERROR: mobile/ not found at ${MOBILE_DIR}" >&2
  exit 1
fi

CHANNEL="${CHANNEL:-production}"
MESSAGE="${1:-}"

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

echo "Channel: ${CHANNEL}"
echo "Meta tracking: ${META_TRACKING_ENABLED:-unset (disabled)}"
echo "Message: ${MESSAGE}"

exec npx eas-cli update \
  --channel "${CHANNEL}" \
  --message "${MESSAGE}" \
  --non-interactive
