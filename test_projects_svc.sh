#!/usr/bin/env bash
set -euo pipefail
k3s kubectl run tmp-curl --image=busybox:1.36 --restart=Never -- sh -c "sleep 3600" >/dev/null 2>&1 || true
k3s kubectl wait --for=condition=Ready pod/tmp-curl --timeout=90s
k3s kubectl exec tmp-curl -- wget -S -O - --header="Authorization: Bearer test" http://projects-svc.drone-store.svc.cluster.local:8080/api/admin/projects/tasks 2>&1 | sed -n "1,80p"
k3s kubectl delete pod tmp-curl --force --grace-period=0 >/dev/null 2>&1 || true
