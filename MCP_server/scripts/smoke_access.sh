#!/usr/bin/env bash
set -euo pipefail

# Usage:
#   CF_ACCESS_ID=... CF_ACCESS_SECRET=... ./smoke_access.sh

HOSTS=(
  pm-mcp.yirrasystems.com
  fs-mcp.yirrasystems.com
  git-mcp.yirrasystems.com
  db-mcp.yirrasystems.com
  fetch-mcp.yirrasystems.com
  stripe-mcp.yirrasystems.com
  n8n-mcp.addiaire.com
  pm-mcpstaging.yirrasystems.com
  fs-mcpstaging.yirrasystems.com
  git-mcpstaging.yirrasystems.com
  db-mcpstaging.yirrasystems.com
  fetch-mcpstaging.yirrasystems.com
  stripe-mcpstaging.yirrasystems.com
  n8n-mcpstaging.addiaire.com
)

require() { [[ -n "${!1:-}" ]] || { echo "Missing env: $1" >&2; exit 1; }; }

require CF_ACCESS_ID
require CF_ACCESS_SECRET

rc=0
for h in "${HOSTS[@]}"; do
  echo "== $h (no headers: expect 403)"
  code=$(curl -s -o /dev/null -w "%{http_code}" "https://$h/healthz" || true)
  if [[ "$code" != "403" && "$code" != "401" ]]; then
    echo "Unexpected code without headers: $code"; rc=1
  fi
  echo "== $h (with Access: expect 200)"
  code=$(curl -s -o /dev/null -w "%{http_code}" "https://$h/healthz" \
    -H "CF-Access-Client-Id: $CF_ACCESS_ID" -H "CF-Access-Client-Secret: $CF_ACCESS_SECRET" || true)
  if [[ "$code" != "200" ]]; then
    echo "Unexpected code with headers: $code"; rc=1
  fi
done

exit $rc

























