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

# Convenience for LOCAL runs only: source a gitignored env file if present so a
# token can live on disk without ever touching git. In CI / Claude Code the env
# var is injected directly, so no file is needed. (These paths are gitignored.)
for _envfile in "${SCRIPT_DIR}/.env.local" "${MOBILE_DIR}/.env.local"; do
  if [[ -z "${EXPO_TOKEN:-}" && -f "${_envfile}" ]]; then
    set -a; . "${_envfile}"; set +a
  fi
done

# --- Auth preflight ---------------------------------------------------------
# eas-cli authenticates non-interactively via the EXPO_TOKEN env var. CI, cron,
# and Claude Code sessions have no browser, so `eas login` is not an option —
# a token must be present. Fail fast with actionable guidance if it isn't.
if [[ -z "${EXPO_TOKEN:-}" ]] && ! npx eas-cli whoami >/dev/null 2>&1; then
  cat >&2 <<'EOF'
ERROR: not authenticated with Expo, and EXPO_TOKEN is not set.

To publish OTA updates non-interactively, set an Expo robot access token as an
environment variable named EXPO_TOKEN (never commit it to git):

  1. Create a token: https://expo.dev -> Account settings -> Access tokens
  2. Provide it as EXPO_TOKEN:
     - Claude Code on the web: environment settings -> Environment variables.
     - Local shell: export EXPO_TOKEN=...  (or a gitignored .env.local — see below)

eas-cli picks up EXPO_TOKEN automatically; no `eas login` needed.
EOF
  exit 1
fi

if [[ -z "${MESSAGE}" ]]; then
  MESSAGE="$(git log -1 --pretty=%s 2>/dev/null || echo "OTA update")"
fi

if [[ -n "$(git status --porcelain 2>/dev/null)" ]]; then
  echo "WARN: uncommitted changes; OTA bundle will be tagged dirty."
fi

echo "Channel: ${CHANNEL}"
echo "Message: ${MESSAGE}"

exec npx eas-cli update \
  --channel "${CHANNEL}" \
  --message "${MESSAGE}" \
  --non-interactive
