#!/usr/bin/env bash
set -euo pipefail

# Usage:
#   cp .env.mcp-secrets.example .env.mcp-secrets
#   # edit .env.mcp-secrets with real values/paths
#   ./create-secrets.sh [prod|staging|both]

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
ENV_FILE="$ROOT_DIR/.env.mcp-secrets"

if [[ -f "$ENV_FILE" ]]; then
  # shellcheck disable=SC1090
  source "$ENV_FILE"
else
  echo "Missing $ENV_FILE. Create it from .env.mcp-secrets.example" >&2
  exit 1
fi

TARGET="${1:-both}"

create_ns_if_missing() {
  local ns=$1
  if ! kubectl get ns "$ns" >/dev/null 2>&1; then
    kubectl create ns "$ns"
  fi
}

require_var() {
  local name=$1
  if [[ -z "${!name:-}" ]]; then
    echo "Required env var $name is not set" >&2
    exit 1
  fi
}

create_prod() {
  local ns=tools
  create_ns_if_missing "$ns"

  require_var PM_API_TOKEN
  kubectl -n "$ns" create secret generic pm-mcp-secrets \
    --from-literal=PM_API_TOKEN="$PM_API_TOKEN" \
    --dry-run=client -o yaml | kubectl apply -f -

  require_var GIT_SSH_KEY_FILE
  require_var GIT_KNOWN_HOSTS
  kubectl -n "$ns" create secret generic git-mcp-secrets \
    --from-file=GIT_SSH_KEY="$GIT_SSH_KEY_FILE" \
    --from-literal=GIT_KNOWN_HOSTS="$GIT_KNOWN_HOSTS" \
    --dry-run=client -o yaml | kubectl apply -f -

  require_var DATABASE_URL
  kubectl -n "$ns" create secret generic db-mcp-secrets \
    --from-literal=DATABASE_URL="$DATABASE_URL" \
    --dry-run=client -o yaml | kubectl apply -f -

  require_var STRIPE_API_KEY_LIVE
  kubectl -n "$ns" create secret generic stripe-mcp-secrets \
    --from-literal=STRIPE_API_KEY="$STRIPE_API_KEY_LIVE" \
    --dry-run=client -o yaml | kubectl apply -f -

  require_var N8N_API_KEY
  kubectl -n "$ns" create secret generic n8n-mcp-secrets \
    --from-literal=N8N_API_KEY="$N8N_API_KEY" \
    --dry-run=client -o yaml | kubectl apply -f -
}

create_staging() {
  local ns=tools-staging
  create_ns_if_missing "$ns"

  require_var PM_API_TOKEN_STAGING
  kubectl -n "$ns" create secret generic pm-mcp-secrets \
    --from-literal=PM_API_TOKEN="$PM_API_TOKEN_STAGING" \
    --dry-run=client -o yaml | kubectl apply -f -

  require_var GIT_SSH_KEY_FILE_STAGING
  require_var GIT_KNOWN_HOSTS_STAGING
  kubectl -n "$ns" create secret generic git-mcp-secrets \
    --from-file=GIT_SSH_KEY="$GIT_SSH_KEY_FILE_STAGING" \
    --from-literal=GIT_KNOWN_HOSTS="$GIT_KNOWN_HOSTS_STAGING" \
    --dry-run=client -o yaml | kubectl apply -f -

  require_var DATABASE_URL_STAGING
  kubectl -n "$ns" create secret generic db-mcp-secrets \
    --from-literal=DATABASE_URL="$DATABASE_URL_STAGING" \
    --dry-run=client -o yaml | kubectl apply -f -

  require_var STRIPE_API_KEY_TEST
  kubectl -n "$ns" create secret generic stripe-mcp-secrets \
    --from-literal=STRIPE_API_KEY="$STRIPE_API_KEY_TEST" \
    --dry-run=client -o yaml | kubectl apply -f -

  require_var N8N_API_KEY_STAGING
  kubectl -n "$ns" create secret generic n8n-mcp-secrets \
    --from-literal=N8N_API_KEY="$N8N_API_KEY_STAGING" \
    --dry-run=client -o yaml | kubectl apply -f -
}

case "$TARGET" in
  prod) create_prod ;;
  staging) create_staging ;;
  both) create_prod; create_staging ;;
  *) echo "Usage: $0 [prod|staging|both]" >&2; exit 1 ;;
esac

echo "Secrets applied for: $TARGET"


























