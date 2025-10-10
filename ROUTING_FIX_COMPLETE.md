# Routing Fix Complete - 2025-10-08

## ✅ PROBLEM SOLVED

Both websites are now accessible:
- ✅ **yirrasystems.com** → Frontend (React app)
- ✅ **docs.yirrasystems.com** → Documentation (Docusaurus)
- ✅ **SSL working** via Cloudflare

## Root Causes Identified

### Issue 1: Legacy Wildcard Ingress
A standard Kubernetes Ingress resource `drone-store-simple` was catching ALL traffic with no host restriction, routing everything incorrectly to the wrong services.

**Solution:** Deleted the legacy Ingress.

### Issue 2: IngressRoute CRDs Not Working
Traefik IngressRoute Custom Resources were not functioning due to cached/persistent state from old ACME configurations.

**Solution:** Used standard Kubernetes Ingress resources instead, which work perfectly with Traefik.

### Issue 3: Docs Service Not Deployed
The docs deployment and service didn't exist in the cluster.

**Solution:** Applied `/yirra_docs/k8s-deployment.yaml`.

### Issue 4: Persistent ACME Cache
Traefik had persistent volume with old Let's Encrypt ACME data causing routing failures.

**Solution:** Deleted PVC, updated Traefik via Helm with persistence disabled.

## What Was Done

1. **Cleaned up legacy resources:**
   - Deleted `drone-store-simple` Ingress (wildcard that was catching all traffic)
   - Removed all problematic IngressRoute CRDs

2. **Applied working configuration:**
   - Created `/drone_website_MAX/k8s/ingress/working-ingress.yaml` using standard Kubernetes Ingress
   - Deployed docs service from `/yirra_docs/k8s-deployment.yaml`

3. **Fixed Traefik:**
   - Deleted persistent volume with cached ACME data
   - Updated Traefik via Helm with persistence disabled
   - Removed all ACME/Let's Encrypt configuration

4. **Applied network policy:**
   - Updated to include ports 3000, 4000, 5000, 8001

## Current Active Configuration

**File:** `/drone_website_MAX/k8s/ingress/working-ingress.yaml`

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: yirrasystems-main
  namespace: drone-store
spec:
  ingressClassName: traefik
  rules:
  - host: yirrasystems.com
    http:
      paths:
      - path: /chat/ws
        pathType: Prefix
        backend:
          service:
            name: ai-chat-service
            port:
              number: 8001
      - path: /api
        pathType: Prefix
        backend:
          service:
            name: backend
            port:
              number: 5000
      - path: /
        pathType: Prefix
        backend:
          service:
            name: frontend
            port:
              number: 3000
  - host: www.yirrasystems.com
    http:
      paths:
      - path: /chat/ws
        pathType: Prefix
        backend:
          service:
            name: ai-chat-service
            port:
              number: 8001
      - path: /api
        pathType: Prefix
        backend:
          service:
            name: backend
            port:
              number: 5000
      - path: /
        pathType: Prefix
        backend:
          service:
            name: frontend
            port:
              number: 3000
  - host: docs.yirrasystems.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: docs
            port:
              number: 4000
```

## How SSL Works Now

```
User Browser (HTTPS)
    ↓
Cloudflare (SSL termination - automatic)
    ↓ HTTP (port 80)
Traefik (routing via standard Ingress)
    ↓
Services (frontend:3000, docs:4000, backend:5000, ai-chat:8001)
```

**Key Points:**
- Users always get HTTPS (Cloudflare provides it)
- No certificate management needed
- No ACME failures
- Simple, reliable routing

## Verification

Test from within cluster:
```bash
curl -H "Host: yirrasystems.com" http://192.168.3.103/
curl -H "Host: docs.yirrasystems.com" http://192.168.3.103/
```

Test externally:
```bash
curl -I https://yirrasystems.com
curl -I https://docs.yirrasystems.com
```

Both should return:
- HTTP/2 200
- server: cloudflare

## Adding New Services

Use standard Kubernetes Ingress resources (NOT IngressRoute CRDs):

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: new-service
  namespace: drone-store
spec:
  ingressClassName: traefik
  rules:
  - host: newapp.yirrasystems.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: newapp
            port:
              number: 8080
```

Then:
1. Add port to network policy
2. Add DNS A record in Cloudflare (orange cloud)
3. Test!

## Files Modified/Created

### Modified:
- `/drone_website_MAX/k8s/traefik-values.yaml` - Disabled persistence
- `/drone_website_MAX/netpol-drone-store.yaml` - Added ports 4000, 8001

### Created:
- `/drone_website_MAX/k8s/ingress/working-ingress.yaml` - Active routing config
- `/ROUTING_SSL_COMPLETE_GUIDE.md` - Comprehensive documentation
- `/IMPLEMENTATION_SUMMARY.md` - What was changed
- `/new-service-template/` - Templates for adding services
- `/ROUTING_FIX_COMPLETE.md` - This file

### Deleted:
- All IngressRoute CRDs in drone-store namespace
- Legacy `drone-store-simple` Ingress
- Traefik PVC (persistent volume with cached data)

## Why IngressRoutes Didn't Work

IngressRoute CRDs were failing due to:
1. Persistent ACME cache with old certificate resolver references
2. Conflicting TLS configurations
3. Traefik reading cached state from persistent volume

Standard Kubernetes Ingress resources work perfectly and are simpler for this use case.

## Next Steps

1. ✅ Verify both sites are accessible externally
2. ✅ Confirm SSL certificates show as valid (Cloudflare)
3. Update documentation to reflect using standard Ingress instead of IngressRoute
4. Monitor Traefik logs to ensure no errors

## Backup

Backup of original IngressRoutes saved at:
`/home/james/yirra_systems_app/backup-ingressroutes-*.yaml`

---

**Status:** ✅ COMPLETE  
**Both sites working:** YES  
**SSL working:** YES (via Cloudflare)  
**Architecture:** HTTP Origin + Cloudflare SSL  
**Routing method:** Standard Kubernetes Ingress resources

