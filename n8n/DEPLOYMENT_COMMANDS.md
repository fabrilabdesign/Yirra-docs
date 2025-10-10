# N8N Safe Deployment Commands

**Purpose:** This document provides safe, tested commands for deploying and managing N8N resources.

**CRITICAL:** All N8N resources MUST be deployed to the `n8n` namespace ONLY.

---

## Safe Deployment Methods

### Method 1: Kustomize (RECOMMENDED)

Kustomize automatically enforces the correct namespace:

```bash
# Deploy all N8N resources
kubectl apply -k /home/james/yirra_systems_app/n8n/k8s/

# Preview what will be applied
kubectl kustomize /home/james/yirra_systems_app/n8n/k8s/

# Delete all N8N resources
kubectl delete -k /home/james/yirra_systems_app/n8n/k8s/
```

**Why this is safest:**
- Kustomization file enforces `namespace: n8n`
- Impossible to accidentally deploy to wrong namespace
- Adds tracking labels and annotations
- One command deploys everything

### Method 2: Explicit Namespace Flag

If not using kustomize, ALWAYS specify the namespace:

```bash
# Deploy all N8N resources with explicit namespace
kubectl apply -f /home/james/yirra_systems_app/n8n/k8s/ -n n8n

# Deploy single file
kubectl apply -f /home/james/yirra_systems_app/n8n/k8s/deployment.yaml -n n8n
```

**Important:**
- The `-n n8n` flag is REQUIRED
- Without it, resources might deploy to default or current namespace
- Always double-check the namespace flag

---

## ❌ DANGEROUS Commands (NEVER USE)

```bash
# NO namespace flag - unpredictable behavior!
kubectl apply -f /home/james/yirra_systems_app/n8n/k8s/

# Wrong namespace - would conflict with website!
kubectl apply -f /home/james/yirra_systems_app/n8n/k8s/ -n drone-store

# Current context might be wrong namespace
kubectl apply -f /home/james/yirra_systems_app/n8n/k8s/
```

---

## Verification Commands

### Before Deployment

Check what namespace resources will be deployed to:

```bash
# Check namespace in all manifests
grep -r "namespace:" /home/james/yirra_systems_app/n8n/k8s/*.yaml

# Should all show "namespace: n8n"
```

Preview with kustomize:

```bash
# See exactly what will be created
kubectl kustomize /home/james/yirra_systems_app/n8n/k8s/ | less
```

### After Deployment

Verify resources are in correct namespace:

```bash
# List all N8N resources
kubectl get all -n n8n

# Check deployments
kubectl get deployment -n n8n

# Check services
kubectl get svc -n n8n

# Check PVCs
kubectl get pvc -n n8n

# Check ingress
kubectl get ingress -n n8n
```

### Check N8N Status

```bash
# Check all pods are running
kubectl get pods -n n8n

# View N8N logs
kubectl logs -n n8n deployment/n8n --tail=50

# View N8N postgres logs
kubectl logs -n n8n deployment/n8n-postgres --tail=50

# Check N8N service
kubectl describe svc n8n -n n8n

# Check database connection
kubectl exec -n n8n deployment/n8n-postgres -- \
  psql -U n8n_user -d n8n -c "SELECT version()"
```

---

## Common Operations

### Update N8N Configuration

```bash
# Edit deployment
kubectl edit deployment n8n -n n8n

# Or apply updated manifest
kubectl apply -f /home/james/yirra_systems_app/n8n/k8s/deployment.yaml -n n8n

# Restart N8N
kubectl rollout restart deployment/n8n -n n8n

# Check rollout status
kubectl rollout status deployment/n8n -n n8n
```

### Scale N8N

```bash
# Scale to 2 replicas (requires external PostgreSQL - already configured!)
kubectl scale deployment n8n -n n8n --replicas=2

# Scale back to 1
kubectl scale deployment n8n -n n8n --replicas=1
```

### Database Operations

```bash
# Connect to N8N postgres
kubectl exec -it -n n8n deployment/n8n-postgres -- \
  psql -U n8n_user -d n8n

# Backup N8N database
kubectl exec -n n8n deployment/n8n-postgres -- \
  pg_dump -U n8n_user n8n | gzip > n8n-backup-$(date +%Y%m%d).sql.gz

# Restore N8N database
gunzip -c n8n-backup-YYYYMMDD.sql.gz | \
  kubectl exec -i -n n8n deployment/n8n-postgres -- \
  psql -U n8n_user -d n8n

# Check database size
kubectl exec -n n8n deployment/n8n-postgres -- \
  psql -U n8n_user -d n8n -c "SELECT pg_size_pretty(pg_database_size('n8n'))"
```

### Troubleshooting

```bash
# Check all resources
kubectl get all -n n8n

# Describe pod for issues
kubectl describe pod -n n8n -l app=n8n

# Check events
kubectl get events -n n8n --sort-by='.lastTimestamp'

# Check network policy
kubectl get networkpolicy -n n8n

# Test internal connectivity
kubectl exec -n n8n deployment/n8n -- \
  nc -zv n8n-postgres 5432

# Check ingress
kubectl describe ingress n8n -n n8n
```

### Cleanup/Removal

```bash
# Delete all N8N resources (using kustomize)
kubectl delete -k /home/james/yirra_systems_app/n8n/k8s/

# Or delete individually
kubectl delete deployment n8n n8n-postgres -n n8n
kubectl delete svc n8n n8n-postgres -n n8n
kubectl delete ingress n8n -n n8n
kubectl delete pvc n8n-data postgres-data -n n8n
kubectl delete secret n8n-postgres-secret -n n8n
kubectl delete networkpolicy allow-traefik-to-n8n -n n8n

# Delete entire namespace (CAUTION: deletes all data!)
kubectl delete namespace n8n
```

---

## Resource Access

### Access N8N UI

After DNS is configured:

```bash
# Via browser
https://flows.yirrasystems.com

# Check ingress status
kubectl get ingress n8n -n n8n

# Test from outside cluster
curl -I https://flows.yirrasystems.com
```

### Port Forward (for testing)

```bash
# Forward N8N to localhost
kubectl port-forward -n n8n deployment/n8n 5678:5678

# Access at http://localhost:5678

# Forward postgres to localhost
kubectl port-forward -n n8n deployment/n8n-postgres 5432:5432

# Connect with: psql -h localhost -U n8n_user -d n8n
```

---

## Deployment Checklist

Before deploying N8N changes:

- [ ] Verified manifests have `namespace: n8n`
- [ ] Reviewed changes with `kubectl kustomize` or `diff`
- [ ] Website database in `drone-store` namespace is running
- [ ] Using kustomize OR explicit `-n n8n` flag
- [ ] Tested in staging/local environment (if applicable)

After deployment:

- [ ] All pods are Running: `kubectl get pods -n n8n`
- [ ] Services are available: `kubectl get svc -n n8n`
- [ ] N8N is accessible via ingress
- [ ] Database connection working
- [ ] No errors in logs

---

## Quick Reference

```bash
# Status check
kubectl get pods,svc,pvc -n n8n

# Logs
kubectl logs -n n8n deployment/n8n -f

# Apply changes (safe)
kubectl apply -k /home/james/yirra_systems_app/n8n/k8s/

# Restart
kubectl rollout restart deployment/n8n -n n8n
```

---

**See Also:**
- `NAMESPACE_PROTECTION.md` - Isolation policy and safety rules
- `README.md` - General N8N documentation
- `POSTGRESQL_SETUP.md` - Database configuration

**Last Updated:** 2025-10-08

