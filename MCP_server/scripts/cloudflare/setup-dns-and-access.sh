#!/usr/bin/env bash
set -euo pipefail

# Automates:
#  - CNAME DNS records to Tunnel FQDN (orange cloud ON)
#  - Access Applications and a Service Token policy per hostname
#
# Prereqs: CF_API_TOKEN with Zones + Access write perms.
# Env: source ../cloudflare.env (see cloudflare.env.example)

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"
ENV_FILE="$SCRIPT_DIR/../cloudflare.env"

if [[ -f "$ENV_FILE" ]]; then
  # shellcheck disable=SC1090
  source "$ENV_FILE"
else
  echo "Missing $ENV_FILE. Create it from cloudflare.env.example" >&2
  exit 1
fi

require() { [[ -n "${!1:-}" ]] || { echo "Missing env: $1" >&2; exit 1; }; }
require CF_API_TOKEN
require CF_ACCOUNT_ID
require CF_ZONE_ID_YIRRA
require CF_ZONE_ID_ADDIAIRE
require TUNNEL_FQDN

CF_API="https://api.cloudflare.com/client/v4"
auth() { echo -H "Authorization: Bearer $CF_API_TOKEN" -H "Content-Type: application/json"; }

create_or_update_cname() {
  local zone_id=$1 name=$2 target=$3
  local get="$(curl -fsS $(auth) "$CF_API/zones/$zone_id/dns_records?type=CNAME&name=$name")"
  local count="$(jq -r '.result | length' <<<"$get")"
  if [[ "$count" -gt 0 ]]; then
    local id="$(jq -r '.result[0].id' <<<"$get")"
    curl -fsS -X PUT $(auth) "$CF_API/zones/$zone_id/dns_records/$id" \
      --data "{\"type\":\"CNAME\",\"name\":\"$name\",\"content\":\"$target\",\"proxied\":true}" >/dev/null
    echo "Updated CNAME $name → $target"
  else
    curl -fsS -X POST $(auth) "$CF_API/zones/$zone_id/dns_records" \
      --data "{\"type\":\"CNAME\",\"name\":\"$name\",\"content\":\"$target\",\"proxied\":true}" >/dev/null
    echo "Created CNAME $name → $target"
  fi
}

create_service_token_once() {
  # Creates one token if not exists; outputs JSON with id/secret
  local label=$1
  local existing="$(curl -fsS $(auth) "$CF_API/accounts/$CF_ACCOUNT_ID/access/service_tokens")"
  local found_id="$(jq -r --arg l "$label" '.result[] | select(.name==$l) | .id' <<<"$existing" | head -n1)"
  if [[ -n "$found_id" && "$found_id" != "null" ]]; then
    echo "$existing" | jq -r --arg l "$label" '.result[] | select(.name==$l) | {id:.client_id,secret:"REDACTED"}'
    return 0
  fi
  local created="$(curl -fsS -X POST $(auth) "$CF_API/accounts/$CF_ACCOUNT_ID/access/service_tokens" \
    --data "{\"name\":\"$label\"}")"
  jq -r '.result | {id:.client_id,secret:.client_secret}' <<<"$created"
}

create_access_app_with_token_policy() {
  local zone=$1 host=$2 token_client_id=$3
  local app_body="{\"name\":\"$host\",\"domain\":\"https://$host\",\"type\":\"self_hosted\"}"
  local app_res="$(curl -fsS -X POST $(auth) "$CF_API/accounts/$CF_ACCOUNT_ID/access/apps" --data "$app_body")"
  local app_id="$(jq -r '.result.id' <<<"$app_res")"
  # Policy to allow the service token
  local policy_body='{
    "name":"service-token",
    "precedence":1,
    "decision":"allow",
    "include":[{"service_token": {"id": "'"$token_client_id"'"}}]
  }'
  curl -fsS -X POST $(auth) "$CF_API/accounts/$CF_ACCOUNT_ID/access/apps/$app_id/policies" \
    --data "$policy_body" >/dev/null
  echo "$app_id"
}

# Hosts
PROD_HOSTS=(
  pm-mcp.yirrasystems.com
  fs-mcp.yirrasystems.com
  git-mcp.yirrasystems.com
  db-mcp.yirrasystems.com
  fetch-mcp.yirrasystems.com
  stripe-mcp.yirrasystems.com
)
STAGING_HOSTS=(
  pm-mcpstaging.yirrasystems.com
  fs-mcpstaging.yirrasystems.com
  git-mcpstaging.yirrasystems.com
  db-mcpstaging.yirrasystems.com
  fetch-mcpstaging.yirrasystems.com
  stripe-mcpstaging.yirrasystems.com
)
ADDIAIRE_HOSTS=(
  n8n-mcp.addiaire.com
  n8n-mcpstaging.addiaire.com
)

echo "== DNS CNAMEs"
for h in "${PROD_HOSTS[@]}" "${STAGING_HOSTS[@]}"; do
  create_or_update_cname "$CF_ZONE_ID_YIRRA" "$h" "$TUNNEL_FQDN"
done
for h in "${ADDIAIRE_HOSTS[@]}"; do
  create_or_update_cname "$CF_ZONE_ID_ADDIAIRE" "$h" "$TUNNEL_FQDN"
done

echo "== Access Service Token"
TOKEN_JSON="$(create_service_token_once "mcp-headless")"
TOKEN_ID="$(jq -r '.id' <<<"$TOKEN_JSON")"
TOKEN_SECRET="$(jq -r '.secret' <<<"$TOKEN_JSON")"

echo "== Access Apps + token policy"
OUTPUT="{}"
for h in "${PROD_HOSTS[@]}" "${STAGING_HOSTS[@]}" "${ADDIAIRE_HOSTS[@]}"; do
  APP_ID="$(create_access_app_with_token_policy "$CF_ZONE_ID_YIRRA" "$h" "$TOKEN_ID")"
  OUTPUT="$(jq -nc --arg host "$h" --arg app "$APP_ID" --arg token "$TOKEN_ID" --arg secret "$TOKEN_SECRET" '$ARGS.named' | jq -s 'from_entries + input' <<<"$OUTPUT")"
done

out_file="$SCRIPT_DIR/access_tokens.json"
jq -n --arg id "$TOKEN_ID" --arg secret "$TOKEN_SECRET" --argjson apps "$OUTPUT" '{service_token:{id:$id,secret:$secret}, apps:$apps}' > "$out_file"
echo "Wrote $out_file (secret may be REDACTED if token pre-existed)"

























