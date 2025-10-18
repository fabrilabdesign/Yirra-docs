#!/usr/bin/env bash
set -euo pipefail

REG=${REGISTRY:-ttl.sh}
TTL_TAG=${TTL_TAG:-1h}

build_push() {
  local name=$1; shift
  local dir=$1; shift
  local tag=${REG}/${name}-$(date +%s).${TTL_TAG}
  echo "== Building ${name} -> ${tag} =="
  docker build -t ${tag} ${dir}
  docker push ${tag}
  echo ${tag}
}

PM=$(build_push pm-mcp ./pm)
FS=$(build_push fs-mcp ./fs)
FETCH=$(build_push fetch-mcp ./fetch)
N8N=$(build_push n8n-mcp ./n8n)

cat <<EOF
IMAGES_BUILT:
PM=${PM}
FS=${FS}
FETCH=${FETCH}
N8N=${N8N}
EOF



















