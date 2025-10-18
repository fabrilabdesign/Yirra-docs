#!/usr/bin/env bash
set -euo pipefail

# Optional Cloudflare Access headers
HDRS=()
if [[ -n "${CF_ACCESS_CLIENT_ID:-}" && -n "${CF_ACCESS_CLIENT_SECRET:-}" ]]; then
  HDRS+=("-H" "CF-Access-Client-Id: ${CF_ACCESS_CLIENT_ID}" "-H" "CF-Access-Client-Secret: ${CF_ACCESS_CLIENT_SECRET}")
fi

hosts_prod=(
  "pm-mcp.yirrasystems.com"
  "fs-mcp.yirrasystems.com"
  "git-mcp.yirrasystems.com"
  "db-mcp.yirrasystems.com"
  "fetch-mcp.yirrasystems.com"
  "stripe-mcp.yirrasystems.com"
  "n8n-mcp.addiaire.com"
)

hosts_staging=(
  "pm-mcpstaging.yirrasystems.com"
  "fs-mcpstaging.yirrasystems.com"
  "git-mcpstaging.yirrasystems.com"
  "db-mcpstaging.yirrasystems.com"
  "fetch-mcpstaging.yirrasystems.com"
  "stripe-mcpstaging.yirrasystems.com"
  "n8n-mcpstaging.addiaire.com"
)

fail=0
echo "== PROD /healthz =="
for h in "${hosts_prod[@]}"; do
  echo "-- $h"
  if ! curl -fsS "https://$h/healthz" "${HDRS[@]}" > /dev/null; then
    echo "FAIL: $h" >&2
    fail=1
  fi
done

echo "== STAGING /healthz =="
for h in "${hosts_staging[@]}"; do
  echo "-- $h"
  if ! curl -fsS "https://$h/healthz" "${HDRS[@]}" > /dev/null; then
    echo "FAIL: $h" >&2
    fail=1
  fi
done

exit $fail

