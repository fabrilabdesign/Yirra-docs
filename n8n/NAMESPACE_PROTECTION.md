# N8N Namespace Isolation & Protection Policy

**Date:** 2025-10-08  
**Status:** CRITICAL - MUST FOLLOW

---

## ⚠️ CRITICAL RULE: Namespace Separation

**N8N resources MUST ONLY exist in the `n8n` namespace.**

**Website resources MUST ONLY exist in the `drone-store` namespace.**

**NEVER mix these namespaces!**

---

## Namespace Assignment

### `drone-store` Namespace (Website Infrastructure)

This namespace contains all website-related resources:

- **postgres** deployment (PostgreSQL 15)
- **postgres-pvc** (20Gi - contains production website data)
- **postgres-secret** (credentials: postgres/postgrespass/drone_store)
- **backend** deployment (Node.js API)
- **frontend** deployment (React app)
- **redis** deployment (cache)
- All other website services

**NEVER apply N8N manifests to this namespace!**

### `n8n` Namespace (N8N Workflow Automation)

This namespace contains all N8N-related resources:

- **n8n-postgres** deployment (PostgreSQL 16) ← Note the prefix!
- **postgres-data** PVC (10Gi - N8N workflows/executions)
- **n8n-postgres-secret** (credentials: n8n_user/n8n)
- **n8n** deployment (N8N application)
- **n8n** service
- **n8n** ingress
- **allow-traefik-to-n8n** network policy

**NEVER apply website manifests to this namespace!**

---

## Resource Naming Strategy

To prevent accidental conflicts, N8N database resources use prefixed names:

| Resource Type | Website (drone-store) | N8N (n8n) |
|--------------|----------------------|-----------|
| Deployment | `postgres` | `n8n-postgres` ← Prefixed! |
| Service | `postgres` | `n8n-postgres` ← Prefixed! |
| PVC | `postgres-pvc` | `postgres-data` |
| Secret | `postgres-secret` | `n8n-postgres-secret` |

**Why prefixes matter:**
Even if you accidentally apply an N8N manifest to the wrong namespace, the prefixed name (`n8n-postgres`) won't conflict with the website's `postgres` deployment.

---

## Safety Checklist

Before running `kubectl apply`, ALWAYS verify:

- [ ] Check the `namespace:` field in the manifest
- [ ] Confirm you're in the correct directory
- [ ] Use `-n namespace` flag explicitly
- [ ] Or use `kubectl apply -k` with kustomization (safest)
- [ ] Double-check the deployment name (n8n-postgres vs postgres)

---

## Safe Deployment Commands

### For N8N Resources

```bash
# RECOMMENDED: Use kustomization (enforces namespace)
kubectl apply -k /home/james/yirra_systems_app/n8n/k8s/

# OR: Explicit namespace flag
kubectl apply -f /home/james/yirra_systems_app/n8n/k8s/ -n n8n

# VERIFY namespace before applying
grep -r "namespace:" /home/james/yirra_systems_app/n8n/k8s/*.yaml
```

### For Website Resources

```bash
# Explicit namespace flag
kubectl apply -f /home/james/yirra_systems_app/drone_website_MAX/k8s/manifests/ -n drone-store
```

---

## ❌ DANGEROUS Commands (NEVER USE)

```bash
# NO namespace flag - could apply to wrong namespace!
kubectl apply -f /home/james/yirra_systems_app/n8n/k8s/

# Applying website manifests to n8n namespace
kubectl apply -f /home/james/yirra_systems_app/drone_website_MAX/k8s/manifests/ -n n8n

# Applying n8n manifests to drone-store namespace
kubectl apply -f /home/james/yirra_systems_app/n8n/k8s/ -n drone-store
```

---

## What Happened (Incident Log)

**Date:** 2025-10-08

**Incident:** N8N postgres deployment was accidentally applied to `drone-store` namespace, overwriting the website's postgres deployment.

**Impact:** Website went down temporarily. Backend pods failed to connect to database.

**Root Cause:** 
1. N8N manifests had `namespace: drone-store` instead of `namespace: n8n`
2. Postgres deployment name conflicted (`postgres` in both)
3. Applied without checking namespace

**Resolution:**
1. Restored website postgres from original manifest
2. Moved N8N to separate `n8n` namespace
3. Renamed N8N postgres to `n8n-postgres` (prefix added)
4. Created this protection policy
5. Added kustomization to enforce namespace

**Lessons Learned:**
- Always use separate namespaces for different applications
- Use prefixed names to prevent conflicts
- Always verify namespace before applying
- Use kustomization to enforce namespace
- Document isolation policies

---

## Verification Commands

### Check Website Database (drone-store)

```bash
# Check postgres is running
kubectl get pods -n drone-store -l app=postgres

# Verify it's using correct PVC
kubectl describe deployment postgres -n drone-store | grep -A5 "Volumes:"

# Check database connection
kubectl exec -n drone-store deployment/postgres -- \
  psql -U postgres -d drone_store -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public'"
```

### Check N8N Database (n8n)

```bash
# Check n8n-postgres is running
kubectl get pods -n n8n -l app=n8n-postgres

# Verify it's using correct PVC
kubectl describe deployment n8n-postgres -n n8n | grep -A5 "Volumes:"

# Check database connection
kubectl exec -n n8n deployment/n8n-postgres -- \
  psql -U n8n_user -d n8n -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public'"
```

---

## Emergency Recovery

If you accidentally apply to the wrong namespace again:

1. **DON'T PANIC** - The PVCs (data) are separate and safe
2. Immediately reapply the correct manifest:
   ```bash
   kubectl apply -f /home/james/yirra_systems_app/drone_website_MAX/k8s/manifests/postgres.yaml
   ```
3. Check pods are recovering:
   ```bash
   kubectl get pods -n drone-store
   ```
4. Verify database is accessible
5. Clean up incorrect resources from wrong namespace

---

## Summary

✅ **Website:** `drone-store` namespace, `postgres` deployment  
✅ **N8N:** `n8n` namespace, `n8n-postgres` deployment  
✅ **Complete isolation:** Different namespaces + different names  
✅ **Safety enforced:** Kustomization + documentation  

**Remember:** When in doubt, check the namespace twice!

---

**Last Updated:** 2025-10-08  
**Review Required:** After any N8N or website database changes

