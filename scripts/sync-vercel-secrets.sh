#!/usr/bin/env bash
# Push server-only secrets from .env.local to Vercel (run once after `vercel login`).
# Public Supabase vars are in .env.production and deploy automatically.
set -euo pipefail

cd "$(dirname "$0")/.."

if ! command -v vercel >/dev/null; then
  echo "Install the Vercel CLI: npm i -g vercel"
  exit 1
fi

if [[ ! -f .env.local ]]; then
  echo "Missing .env.local"
  exit 1
fi

# shellcheck disable=SC1091
source .env.local

add_env() {
  local name="$1"
  local value="$2"
  if [[ -z "${value}" ]]; then
    echo "Skip $name (empty)"
    return
  fi
  printf '%s' "$value" | vercel env add "$name" production --force -y
  printf '%s' "$value" | vercel env add "$name" preview --force -y
  printf '%s' "$value" | vercel env add "$name" development --force -y
  echo "Set $name"
}

add_env SUPABASE_SERVICE_ROLE_KEY "${SUPABASE_SERVICE_ROLE_KEY:-}"
add_env OPENAI_API_KEY "${OPENAI_API_KEY:-}"
add_env OPENAI_MODEL "${OPENAI_MODEL:-}"
add_env GOOGLE_GMAIL_CLIENT_ID "${GOOGLE_GMAIL_CLIENT_ID:-}"
add_env GOOGLE_GMAIL_CLIENT_SECRET "${GOOGLE_GMAIL_CLIENT_SECRET:-}"
add_env GMAIL_OAUTH_STATE_SECRET "${GMAIL_OAUTH_STATE_SECRET:-}"

echo "Done. Redeploy on Vercel if the site was already live."
