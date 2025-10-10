<!-- UPDATED 2025-10-08 - VERIFIED WORKING SOLUTION -->
# Routing and SSL Architecture - FINAL WORKING SOLUTION

## ✅ Solution Implemented and Verified

**Status:** Both sites working with SSL via Cloudflare

### What We Learned

**CRITICAL DISCOVERY:**
- ❌ **Traefik IngressRoute CRDs DO NOT WORK** in this setup due to persistent ACME cache
- ✅ **Standard Kubernetes Ingress resources WORK PERFECTLY**

## The Working Architecture

### Traffic Flow

```
User Browser (HTTPS - Cloudflare cert)
  ↓
Cloudflare Edge (SSL termination, CDN, DDoS)
  ↓ HTTP on port 80
Server 122.199.30.183
  ↓
Traefik Service (LoadBalancer: 192.168.3.103)
  ↓ Port 80 (HTTP)
Traefik Pod (kube-system)
  ↓ Standard Kubernetes Ingress routing
Application Pods (drone-store)
 - frontend:3000 (React/Nginx)
 - backend:5000 (Node.js API)
 - docs:4000 (Docusaurus)
 - ai-chat-service:8001 (WebSocket AI)
```

### Active Configuration

**File:** `/home/james/yirra_systems_app/drone_website_MAX/k8s/ingress/working-ingress.yaml`

**Type:** Standard Kubernetes Ingress (networking.k8s.io/v1)

**Routing:**
- `yirrasystems.com` → frontend:3000, backend:5000, ai-chat:8001
- `www.yirrasystems.com` → same as above
- `docs.yirrasystems.com` → docs:4000

**SSL:** Cloudflare handles automatically (no configuration needed in cluster)

## How to Add New Services

### 5-Step Process (5-10 minutes per service)

1. **Deploy app** (Deployment + Service)
2. **Create standard Ingress** (networking.k8s.io/v1 with ingressClassName: traefik)
3. **Update network policy** (add port to /drone_website_MAX/netpol-drone-store.yaml)
4. **Add DNS in Cloudflare** (A record → 122.199.30.183, orange cloud enabled)
5. **Test** (wait 2-5 minutes for DNS)

**Complete guide:** `/home/james/yirra_systems_app/HOW_TO_ADD_NEW_SERVICES.md`

### Example: New Service Ingress

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: myapp
  namespace: drone-store
spec:
  ingressClassName: traefik
  rules:
  - host: myapp.yirrasystems.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: myapp
            port:
              number: 8080
```

**Key rules:**
- ✅ Use `apiVersion: networking.k8s.io/v1` (standard Ingress)
- ✅ Set `ingressClassName: traefik`
- ❌ **NEVER** use `apiVersion: traefik.containo.us/v1alpha1` (IngressRoute)
- ❌ **NEVER** add `tls:` sections (Cloudflare handles SSL)

## Why IngressRoutes Failed

### Root Causes

1. **Persistent ACME cache** - Traefik stored old Let's Encrypt cert attempts in persistent volume
2. **Impossible ACME configuration** - Cloudflare proxy blocks ACME HTTP-01 challenges
3. **Conflicting TLS configs** - Multiple IngressRoutes with certResolver references
4. **Cached routing state** - Old routing rules persisted across restarts

### Solution

- Deleted Traefik persistent volume
- Updated Traefik via Helm with persistence disabled
- Switched to standard Kubernetes Ingress resources
- No TLS configuration anywhere (Cloudflare handles it)

## Current Network Policy

**File:** `/home/james/yirra_systems_app/drone_website_MAX/netpol-drone-store.yaml`

**Required ports:**
- 3000 (frontend)
- 4000 (docs)
- 5000 (backend)
- 8001 (ai-chat-service)

**When adding new service:** Add its port to this list!

## Cloudflare Configuration

### DNS Settings

For each domain/subdomain:
- **Type:** A
- **Name:** subdomain or @ for root
- **Content:** 122.199.30.183
- **Proxy:** ☁️ **Orange Cloud (Proxied)** ← CRITICAL!
- **TTL:** Auto

### SSL/TLS Settings

- **SSL mode:** Flexible or Full (NOT Full Strict)
- **Always Use HTTPS:** ✅ Enabled
- **Edge Certificates:** Auto

## Verification Commands

**Check routing:**
```bash
k3s kubectl get ingress -n drone-store
k3s kubectl describe ingress yirrasystems-main -n drone-store
```

**Test externally:**
```bash
curl -I https://yirrasystems.com
curl -I https://docs.yirrasystems.com
# Should return: HTTP/2 200, server: cloudflare
```

**Check Traefik:**
```bash
k3s kubectl get pods -n kube-system | grep traefik
k3s kubectl logs -n kube-system deployment/traefik --tail=50
```

**Test from cluster:**
```bash
k3s kubectl exec -n kube-system deployment/traefik -- \
  wget -qO- http://frontend.drone-store:3000/ | head -5
```

## Troubleshooting

### Service Not Accessible

1. Check pods: `k3s kubectl get pods -n drone-store`
2. Check service: `k3s kubectl get svc -n drone-store`
3. Check ingress: `k3s kubectl get ingress -n drone-store`
4. Check network policy has the port
5. Test from Traefik pod

### SSL Certificate Warning

1. Verify DNS has orange cloud (Proxied) enabled
2. Wait 5-15 minutes for DNS propagation
3. Check Cloudflare SSL mode is Flexible or Full
4. Verify DNS resolves to Cloudflare IPs, not direct IP

### 404 Not Found

1. Check host in Ingress matches DNS exactly
2. Check service name in Ingress matches actual service
3. Check port numbers match
4. Check network policy allows the port

## Key Learnings

1. ✅ **Use standard Kubernetes Ingress** (networking.k8s.io/v1)
2. ❌ **Don't use Traefik IngressRoute CRDs** (they fail in this setup)
3. ❌ **Never add TLS sections** (Cloudflare handles SSL)
4. ✅ **Always enable Cloudflare orange cloud** (Proxied)
5. ✅ **Always add ports to network policy**
6. ✅ **Disable Traefik persistence** (prevents cache issues)

## Documentation

- **Complete guide:** `/home/james/yirra_systems_app/ROUTING_SSL_COMPLETE_GUIDE.md`
- **Adding services:** `/home/james/yirra_systems_app/HOW_TO_ADD_NEW_SERVICES.md`
- **Fix summary:** `/home/james/yirra_systems_app/ROUTING_FIX_COMPLETE.md`
- **This file:** `/home/james/yirra_systems_app/plan.md`

## Files Modified

- `/drone_website_MAX/k8s/ingress/working-ingress.yaml` - Active routing (standard Ingress)
- `/drone_website_MAX/netpol-drone-store.yaml` - Network policy with all ports
- `/drone_website_MAX/k8s/traefik-values.yaml` - Persistence disabled

## Success Metrics

- ✅ yirrasystems.com accessible with HTTPS
- ✅ docs.yirrasystems.com accessible with HTTPS
- ✅ app.yirrasystems.com (admin panel) accessible with HTTPS
- ✅ All show "server: cloudflare" header
- ✅ No certificate warnings
- ✅ No ACME errors in Traefik logs
- ✅ Can add new services in 5-10 minutes

---

**Last verified:** 2025-10-08  
**Architecture:** HTTP Origin + Cloudflare SSL (Flexible)  
**Routing:** Standard Kubernetes Ingress resources  
**Status:** ✅ PRODUCTION READY

