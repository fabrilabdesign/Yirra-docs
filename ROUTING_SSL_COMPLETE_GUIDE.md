# Complete Routing & SSL Guide for Bare-Metal K3s

**Last Updated:** 2025-10-08  
**Status:** ✅ PRODUCTION READY - HTTP Origin with Cloudflare SSL

---

## Executive Summary

This bare-metal K3s cluster uses **HTTP-only origin** with **Cloudflare SSL termination**. This architecture is simple, reliable, and scales effortlessly to unlimited services.

**Key Points:**
- ✅ Users ALWAYS get HTTPS (via Cloudflare)
- ✅ No certificate management needed
- ✅ No ACME failures or rate limiting
- ✅ Adding new services takes 5 minutes
- ✅ Works for unlimited subdomains/services

---

## Architecture Overview

### Infrastructure Stack

```
┌─────────────────────────────────────────────────────────┐
│ Internet (User Browser)                                 │
│ https://app.yirrasystems.com                            │
└─────────────────────────────────────────────────────────┘
                         │
                         ↓ HTTPS (TLS 1.3)
┌─────────────────────────────────────────────────────────┐
│ Cloudflare Edge Network                                 │
│ • SSL termination (automatic certs)                     │
│ • CDN caching                                           │
│ • DDoS protection                                       │
│ • DNS: *.yirrasystems.com → 122.199.30.183             │
└─────────────────────────────────────────────────────────┘
                         │
                         ↓ HTTP (port 80)
┌─────────────────────────────────────────────────────────┐
│ Bare-Metal Server (122.199.30.183)                      │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │ K3s Cluster                                        │ │
│  │                                                    │ │
│  │  ┌──────────────────────────────────────────────┐ │ │
│  │  │ kube-system namespace                        │ │ │
│  │  │                                              │ │ │
│  │  │  Traefik Ingress Controller (v3.4.3)        │ │ │
│  │  │  • LoadBalancer: 192.168.3.103:80           │ │ │
│  │  │  • Accepts HTTP traffic from Cloudflare     │ │ │
│  │  │  • Routes via IngressRoute CRDs             │ │ │
│  │  │  • NO SSL/TLS handling                      │ │ │
│  │  └──────────────────────────────────────────────┘ │ │
│  │                      │                             │ │
│  │                      ↓ Network Policy允许的流量      │ │
│  │  ┌──────────────────────────────────────────────┐ │ │
│  │  │ drone-store namespace                        │ │ │
│  │  │                                              │ │ │
│  │  │  ┌─────────────────────────────────────────┐ │ │ │
│  │  │  │ Services (ClusterIP)                    │ │ │ │
│  │  │  │ • frontend:3000      (React app)        │ │ │ │
│  │  │  │ • backend:5000       (Node.js API)      │ │ │ │
│  │  │  │ • docs:4000          (Docusaurus)       │ │ │ │
│  │  │  │ • ai-chat-service:8001 (WebSocket AI)   │ │ │ │
│  │  │  └─────────────────────────────────────────┘ │ │ │
│  │  └──────────────────────────────────────────────┘ │ │
│  └────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### Why HTTP Origin Works

**Question:** "Isn't HTTP insecure?"

**Answer:** In this architecture, HTTP is acceptable because:

1. **User → Cloudflare:** Always HTTPS (TLS 1.3, strong ciphers)
2. **Cloudflare → Server:** HTTP, but:
   - Traffic is on your datacenter network (not public internet)
   - Cloudflare's IP ranges are known and trusted
   - You get DDoS protection and CDN benefits
3. **Inside Cluster:** Pod-to-pod traffic is on private network

**The trade-off:** Cloudflare→Server hop is unencrypted, but you avoid:
- Certificate management complexity
- ACME challenge failures
- Let's Encrypt rate limiting
- Per-service SSL configuration

---

## Routing Configuration

### Active IngressRoutes

**Only these files are applied to the cluster:**

#### 1. Main Site Routing
**File:** `/drone_website_MAX/k8s/ingress/production-consolidated-ingress.yaml`  
**Purpose:** Routes all traffic for main domains

```yaml
apiVersion: traefik.containo.us/v1alpha1
kind: IngressRoute
metadata:
  name: production-consolidated-ingress
  namespace: drone-store
spec:
  entryPoints:
    - web        # Port 80
    - websecure  # Port 443 (Cloudflare terminates SSL before here)
  routes:
    # Priority 30: WebSocket traffic (highest specificity)
    - match: (Host(`yirrasystems.com`) || Host(`www.yirrasystems.com`) || Host(`api.yirrasystems.com`)) && PathPrefix(`/chat/ws/`)
      kind: Rule
      priority: 30
      services:
        - name: ai-chat-service
          port: 8001

    # Priority 20: API traffic
    - match: (Host(`yirrasystems.com`) || Host(`www.yirrasystems.com`) || Host(`api.yirrasystems.com`)) && PathPrefix(`/api/`)
      kind: Rule
      priority: 20
      services:
        - name: backend
          port: 5000

    # Priority 10: Frontend catch-all (lowest priority)
    - match: Host(`yirrasystems.com`) || Host(`www.yirrasystems.com`)
      kind: Rule
      priority: 10
      services:
        - name: frontend
          port: 3000
  # NO TLS SECTION - Cloudflare handles SSL
```

**How priorities work:**
- Higher number = matched first
- WebSocket (30) is checked before API (20) before frontend (10)
- Most specific rules should have highest priority

#### 2. Docs Site Routing
**File:** `/yirra_docs/docs-ingressroute.yaml`  
**Purpose:** Routes docs subdomain

```yaml
apiVersion: traefik.containo.us/v1alpha1
kind: IngressRoute
metadata:
  name: docs-yirrasystems
  namespace: drone-store
spec:
  entryPoints:
    - web
    - websecure
  routes:
    - kind: Rule
      match: Host(`docs.yirrasystems.com`)
      priority: 50
      services:
        - name: docs
          port: 4000
  # NO TLS SECTION - Cloudflare handles SSL
```

### Deprecated Files (DO NOT APPLY)

These files are kept for reference but should NOT be applied:
- `/drone_website_MAX/k8s/ingress/ingress-routes.yaml` (superseded by production-consolidated-ingress)
- `/drone_website_MAX/k8s/websocket-transport.yaml` (contains duplicate IngressRoute)
- Any files with `tls: certResolver: le` sections

---

## Network Policy

**File:** `/drone_website_MAX/netpol-drone-store.yaml`

This policy controls which traffic can reach your pods.

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-traefik-to-drone-store
  namespace: drone-store
spec:
  podSelector: {}  # Applies to all pods in namespace
  policyTypes:
    - Ingress
  ingress:
    # Rule 1: Allow Traefik to reach service ports
    - from:
        - namespaceSelector:
            matchLabels:
              kubernetes.io/metadata.name: kube-system
          podSelector:
            matchLabels:
              app.kubernetes.io/name: traefik
      ports:
        - protocol: TCP
          port: 3000  # frontend
        - protocol: TCP
          port: 4000  # docs
        - protocol: TCP
          port: 5000  # backend
        - protocol: TCP
          port: 8001  # ai-chat-service
    
    # Rule 2: Allow pod-to-pod within namespace
    - from:
        - podSelector: {}
```

**⚠️ CRITICAL:** When adding a new service, you MUST add its port here!

---

## Cloudflare Configuration

### DNS Settings

For each domain/subdomain:

1. **Go to Cloudflare DNS settings**
2. **Add A record:**
   - Type: `A`
   - Name: `@` (for root) or subdomain name
   - Content: `122.199.30.183`
   - Proxy status: **Orange cloud (Proxied)** ← CRITICAL!
   - TTL: Auto

**Example records:**
```
Type  Name   Content            Proxy
A     @      122.199.30.183     Proxied (orange)
A     www    122.199.30.183     Proxied (orange)
A     docs   122.199.30.183     Proxied (orange)
A     app1   122.199.30.183     Proxied (orange)
```

### SSL/TLS Settings

1. **Go to SSL/TLS settings**
2. **Set SSL mode to:** `Flexible`
   - This means: Cloudflare→User is HTTPS, Cloudflare→Origin is HTTP
   - Alternative: `Full` if you want CF→Origin to use HTTPS (but HTTP works fine)

3. **Edge Certificates:** Auto (Cloudflare manages)
4. **Always Use HTTPS:** ✅ Enabled (redirects HTTP→HTTPS for users)

---

## Adding a New Service/App

Follow these steps to add a new web app with automatic HTTPS:

### Step 1: Deploy Your Application

Create deployment and service in `drone-store` namespace:

```yaml
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: myapp
  namespace: drone-store
spec:
  replicas: 2
  selector:
    matchLabels:
      app: myapp
  template:
    metadata:
      labels:
        app: myapp
    spec:
      containers:
      - name: myapp
        image: your-registry/myapp:latest
        ports:
        - containerPort: 8080
---
# service.yaml
apiVersion: v1
kind: Service
metadata:
  name: myapp
  namespace: drone-store
spec:
  selector:
    app: myapp
  ports:
  - port: 8080
    targetPort: 8080
  type: ClusterIP
```

Apply: `k3s kubectl apply -f deployment.yaml`

### Step 2: Create IngressRoute

Create file `myapp-ingressroute.yaml`:

```yaml
apiVersion: traefik.containo.us/v1alpha1
kind: IngressRoute
metadata:
  name: myapp-ingress
  namespace: drone-store
spec:
  entryPoints:
    - web
    - websecure
  routes:
  - kind: Rule
    match: Host(`myapp.yirrasystems.com`)
    priority: 15  # Use any priority that doesn't conflict
    services:
    - name: myapp
      port: 8080
  # NO tls: section - Cloudflare handles SSL!
```

Apply: `k3s kubectl apply -f myapp-ingressroute.yaml`

### Step 3: Update Network Policy

Edit `/drone_website_MAX/netpol-drone-store.yaml` and add your port:

```yaml
ports:
  - protocol: TCP
    port: 3000
  - protocol: TCP
    port: 4000
  - protocol: TCP
    port: 5000
  - protocol: TCP
    port: 8001
  - protocol: TCP
    port: 8080  # ← Add your new port
```

Apply: `k3s kubectl apply -f netpol-drone-store.yaml`

### Step 4: Add DNS in Cloudflare

1. Go to Cloudflare dashboard
2. Add A record:
   - Type: A
   - Name: `myapp`
   - Content: `122.199.30.183`
   - Proxy: **Orange cloud (Proxied)**
3. Save

### Step 5: Wait & Test

1. **DNS propagation:** 1-5 minutes typically
2. **Test:** `curl -I https://myapp.yirrasystems.com`
3. **Expected:** HTTP 200, `server: cloudflare` header

**That's it!** Your app is live with HTTPS.

---

## Traefik Configuration

**File:** `/drone_website_MAX/k8s/traefik-values.yaml`

Used when deploying/updating Traefik via Helm:

```yaml
additionalArguments:
  - "--entrypoints.web.address=:80"
  - "--entrypoints.websecure.address=:443"
  # NO redirect 80→443 - accept HTTP from Cloudflare
  # NO ACME config - Cloudflare handles SSL
  - "--providers.kubernetescrd"
  - "--providers.kubernetesIngress"
  - "--log.level=INFO"

persistence:
  enabled: false  # No certs to store

service:
  type: LoadBalancer
```

**To apply Traefik changes:**
```bash
helm upgrade traefik traefik/traefik \
  --namespace kube-system \
  --values /home/james/yirra_systems_app/drone_website_MAX/k8s/traefik-values.yaml
```

---

## Troubleshooting

### Service not reachable

**Check 1: Pods running?**
```bash
k3s kubectl get pods -n drone-store
```

**Check 2: Service exists?**
```bash
k3s kubectl get svc -n drone-store
```

**Check 3: IngressRoute applied?**
```bash
k3s kubectl get ingressroute -n drone-store
k3s kubectl describe ingressroute YOUR-INGRESS-NAME -n drone-store
```

**Check 4: Network policy allows port?**
```bash
k3s kubectl get networkpolicy -n drone-store -o yaml | grep -A 20 "ports:"
```

**Check 5: Traefik can reach service?**
```bash
k3s kubectl exec -n kube-system deployment/traefik -- \
  wget -qO- http://YOUR-SERVICE.drone-store:PORT/ | head -10
```

### SSL Certificate Error

If users see certificate warnings:

**Check 1: Cloudflare proxy enabled?**
- DNS record must have **orange cloud** (Proxied), not grey
- Grey cloud = DNS only = no SSL from Cloudflare

**Check 2: SSL mode correct?**
- Cloudflare SSL/TLS settings should be "Flexible" or "Full"
- NOT "Off" or "Full (Strict)"

**Check 3: DNS propagated?**
```bash
dig myapp.yirrasystems.com
# Should return Cloudflare IPs (104.x.x.x, 172.x.x.x), not 122.199.30.183
```

### Traefik Logs Show ACME Errors

If you see Let's Encrypt errors in Traefik logs:

**This means:** Old IngressRoutes with `tls: certResolver: le` are still applied

**Fix:**
```bash
# Find IngressRoutes with TLS config
k3s kubectl get ingressroute -n drone-store -o yaml | grep -A 5 "tls:"

# Delete or re-apply without TLS section
k3s kubectl delete ingressroute PROBLEMATIC-INGRESS -n drone-store
k3s kubectl apply -f FIXED-INGRESS.yaml
```

---

## Verification Commands

### Check all IngressRoutes
```bash
k3s kubectl get ingressroute -A
```

### Check specific IngressRoute
```bash
k3s kubectl get ingressroute production-consolidated-ingress -n drone-store -o yaml
```

### Check Traefik status
```bash
k3s kubectl get pods -n kube-system | grep traefik
k3s kubectl logs -n kube-system deployment/traefik --tail=50
```

### Check network policy
```bash
k3s kubectl get networkpolicy -n drone-store -o yaml
```

### Test service directly from Traefik pod
```bash
k3s kubectl exec -n kube-system deployment/traefik -- \
  wget -qO- http://frontend.drone-store:3000/ | head -5
```

### Test external access
```bash
curl -I https://yirrasystems.com
curl -I https://docs.yirrasystems.com
```

Expected headers:
```
HTTP/2 200
server: cloudflare
```

---

## Key Learnings & Best Practices

### ✅ DO

1. **Use IngressRoute CRDs** - Traefik's native format, not standard Ingress
2. **Let Cloudflare handle SSL** - Zero cert management
3. **Use both entryPoints** - `[web, websecure]` for maximum compatibility
4. **Update network policy** - Add every new service port
5. **Use orange cloud** - All DNS records must be proxied through Cloudflare
6. **Test incrementally** - Test low-priority routes before production
7. **Keep backups** - `k3s kubectl get ingressroute -A -o yaml > backup.yaml`

### ❌ DON'T

1. **Don't add `tls:` sections** - Causes ACME failures and rate limiting
2. **Don't use certResolver** - Cloudflare already provides SSL
3. **Don't use grey cloud DNS** - Defeats the purpose, no SSL
4. **Don't forget network policy** - Service will be unreachable
5. **Don't use standard Ingress** - Won't work, use IngressRoute
6. **Don't change Traefik ports** - Keep 80 and 443

---

## Emergency Rollback

If changes break the site:

```bash
# Restore from backup
k3s kubectl apply -f backup-ingressroutes-TIMESTAMP.yaml

# Or quickly remove problematic IngressRoute
k3s kubectl delete ingressroute PROBLEM-INGRESS -n drone-store

# Check Traefik logs
k3s kubectl logs -n kube-system deployment/traefik --tail=100
```

---

## Port Reference

| Service         | Container Port | Service Port | IngressRoute Priority | Purpose              |
|----------------|----------------|--------------|----------------------|----------------------|
| frontend       | 3000           | 3000         | 10                   | React app (Nginx)    |
| backend        | 5000           | 5000         | 20                   | Node.js API          |
| docs           | 4000           | 4000         | 50                   | Docusaurus           |
| ai-chat-service| 8001           | 8001         | 30                   | WebSocket AI service |
| Traefik web    | 80             | 80           | -                    | HTTP entrypoint      |
| Traefik secure | 443            | 443          | -                    | HTTPS entrypoint     |

---

## Summary

**This setup is watertight because:**

1. ✅ **No certificate management** - Cloudflare provides all SSL
2. ✅ **No ACME failures** - Not using Let's Encrypt
3. ✅ **No rate limiting** - Not requesting certs from Let's Encrypt
4. ✅ **Scales infinitely** - Same pattern for every new service
5. ✅ **Clear separation** - Cloudflare handles SSL, Traefik handles routing
6. ✅ **Network security** - Policies control all traffic
7. ✅ **Simple debugging** - Clear logs and testing methods

**To add a new service, you only need:**
1. Deploy (Deployment + Service)
2. IngressRoute (10 lines YAML)
3. Network policy (1 port line)
4. DNS record (1 A record in Cloudflare)
5. Wait 2-5 minutes → Live with HTTPS ✅

---

**Last verified working:** 2025-10-08  
**Architecture version:** HTTP Origin v1.0  
**Traefik version:** v3.4.3

