# How to Add New Services to the K3s Cluster

**Last Updated:** 2025-10-08  
**Status:** Verified Working Process

---

## Quick Reference - 5 Step Process

For adding any new web service with automatic HTTPS:

1. **Deploy the app** (Deployment + Service)
2. **Create Ingress** (standard Kubernetes Ingress, NOT IngressRoute)
3. **Update network policy** (add the port)
4. **Add DNS in Cloudflare** (A record with orange cloud)
5. **Test** (wait 2-5 minutes for DNS)

**Total time:** ~5-10 minutes per service

---

## Detailed Step-by-Step Guide

### Prerequisites

- Your app is containerized and pushed to the registry
- You know what port your app listens on
- You've chosen a subdomain (e.g., `myapp.yirrasystems.com`)

### Step 1: Create Deployment and Service

Create a file `myapp-deployment.yaml`:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: myapp
  namespace: drone-store
  labels:
    app: myapp
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
        image: localhost:5000/myapp:latest  # Your image
        ports:
        - containerPort: 8080  # Your app's port
        env:
        - name: NODE_ENV
          value: "production"
        resources:
          requests:
            memory: "256Mi"
            cpu: "200m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health  # Adjust for your app
            port: 8080
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 8080
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: myapp
  namespace: drone-store
  labels:
    app: myapp
spec:
  type: ClusterIP
  selector:
    app: myapp
  ports:
  - name: http
    port: 8080  # Must match containerPort
    targetPort: 8080
    protocol: TCP
```

**Apply it:**
```bash
k3s kubectl apply -f myapp-deployment.yaml
```

**Verify:**
```bash
k3s kubectl get pods -n drone-store | grep myapp
k3s kubectl logs -n drone-store deployment/myapp
```

### Step 2: Create Ingress (CRITICAL - Use Standard Ingress)

**⚠️ IMPORTANT:** Use standard Kubernetes Ingress, **NOT** Traefik IngressRoute CRDs!

Create `myapp-ingress.yaml`:

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: myapp
  namespace: drone-store
spec:
  ingressClassName: traefik
  rules:
  - host: myapp.yirrasystems.com  # Your subdomain
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: myapp
            port:
              number: 8080  # Must match Service port
```

**Key points:**
- ✅ Use `apiVersion: networking.k8s.io/v1` (standard Ingress)
- ✅ Set `ingressClassName: traefik`
- ❌ **DO NOT** use `apiVersion: traefik.containo.us/v1alpha1` (IngressRoute)
- ❌ **DO NOT** add any `tls:` section (Cloudflare handles SSL)

**Apply it:**
```bash
k3s kubectl apply -f myapp-ingress.yaml
```

**Verify:**
```bash
k3s kubectl get ingress -n drone-store
k3s kubectl describe ingress myapp -n drone-store
```

### Step 3: Update Network Policy

Edit `/home/james/yirra_systems_app/drone_website_MAX/netpol-drone-store.yaml`:

Add your port to the list:

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-traefik-to-drone-store
  namespace: drone-store
spec:
  podSelector: {}
  policyTypes:
  - Ingress
  ingress:
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
    - protocol: TCP
      port: 8080  # ← ADD YOUR NEW PORT HERE
  - from:
    - podSelector: {}
```

**Apply it:**
```bash
k3s kubectl apply -f /home/james/yirra_systems_app/drone_website_MAX/netpol-drone-store.yaml
```

**Verify:**
```bash
k3s kubectl get networkpolicy -n drone-store -o yaml | grep "port:"
```

### Step 4: Add DNS in Cloudflare

1. **Log into Cloudflare dashboard**
2. **Go to DNS settings** for `yirrasystems.com`
3. **Add A record:**
   - **Type:** A
   - **Name:** `myapp` (just the subdomain)
   - **Content:** `122.199.30.183` (your server IP)
   - **Proxy status:** ☁️ **Proxied (Orange Cloud)** ← CRITICAL!
   - **TTL:** Auto
4. **Click Save**

**Verify:**
```bash
# Wait 2-5 minutes, then check:
dig myapp.yirrasystems.com

# Should return Cloudflare IPs (104.x.x.x or 172.x.x.x)
# NOT your direct IP (122.199.30.183)
```

### Step 5: Verify Cloudflare SSL Settings

1. **Go to SSL/TLS tab** in Cloudflare
2. **Verify SSL mode:** Should be **Flexible** or **Full**
3. **Verify "Always Use HTTPS":** Should be ✅ Enabled

### Step 6: Test Your Service

**Wait 2-5 minutes for DNS propagation**, then:

```bash
# Test HTTP (should redirect to HTTPS)
curl -I http://myapp.yirrasystems.com

# Test HTTPS (should work)
curl -I https://myapp.yirrasystems.com

# Should see:
# HTTP/2 200
# server: cloudflare
```

**Test in browser:**
- Open `https://myapp.yirrasystems.com`
- Should load with no SSL warnings
- Should show your app

---

## Adding Multiple Path Routes

If you need multiple paths for one domain:

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: myapp-multi
  namespace: drone-store
spec:
  ingressClassName: traefik
  rules:
  - host: myapp.yirrasystems.com
    http:
      paths:
      - path: /api
        pathType: Prefix
        backend:
          service:
            name: myapp-backend
            port:
              number: 5000
      - path: /
        pathType: Prefix
        backend:
          service:
            name: myapp-frontend
            port:
              number: 3000
```

**Path matching:**
- More specific paths are matched first
- `/api` is matched before `/`
- Use `pathType: Prefix` for prefix matching
- Use `pathType: Exact` for exact matches only

---

## Adding WebSocket Support

For WebSocket connections, just use a standard Ingress - Traefik handles it automatically:

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: myapp-ws
  namespace: drone-store
spec:
  ingressClassName: traefik
  rules:
  - host: myapp.yirrasystems.com
    http:
      paths:
      - path: /ws
        pathType: Prefix
        backend:
          service:
            name: myapp-websocket
            port:
              number: 8080
```

No special annotations needed - works out of the box!

---

## Troubleshooting

### Service Not Accessible

**Check 1: Is the pod running?**
```bash
k3s kubectl get pods -n drone-store | grep myapp
k3s kubectl logs -n drone-store deployment/myapp --tail=50
```

**Check 2: Does the service exist?**
```bash
k3s kubectl get svc myapp -n drone-store
k3s kubectl describe svc myapp -n drone-store
```

**Check 3: Is the Ingress applied?**
```bash
k3s kubectl get ingress myapp -n drone-store
k3s kubectl describe ingress myapp -n drone-store
```

**Check 4: Is the port in network policy?**
```bash
k3s kubectl get networkpolicy -n drone-store -o yaml | grep "port: 8080"
```

**Check 5: Can Traefik reach the service?**
```bash
k3s kubectl exec -n kube-system deployment/traefik -- \
  wget -qO- http://myapp.drone-store:8080/ | head -10
```

### SSL Certificate Warnings

**Problem:** Browser shows certificate warning

**Causes:**
1. **DNS not proxied through Cloudflare**
   - Check: Cloud icon must be **orange** in Cloudflare DNS
   - Fix: Click the cloud icon to enable proxy

2. **DNS not propagated yet**
   - Wait 5-15 minutes
   - Check: `dig myapp.yirrasystems.com` should show Cloudflare IPs

3. **Cloudflare SSL mode wrong**
   - Check: SSL/TLS settings in Cloudflare
   - Fix: Set to "Flexible" or "Full"

### 404 Not Found

**Problem:** Traefik returns 404

**Causes:**
1. **Wrong host in Ingress**
   - Check: Host matches your DNS record exactly

2. **Service name mismatch**
   - Check: Service name in Ingress matches actual Service

3. **Port mismatch**
   - Check: Port in Ingress matches Service port

4. **Network policy blocking**
   - Check: Port is in network policy list

### Traefik Not Picking Up Ingress

**Check Traefik logs:**
```bash
k3s kubectl logs -n kube-system deployment/traefik --tail=100
```

**Look for errors about:**
- Certificate resolvers (ignore these - we don't use them)
- Service not found
- Namespace issues

**Force Traefik to reload:**
```bash
k3s kubectl rollout restart deployment/traefik -n kube-system
sleep 10
```

---

## Common Mistakes to Avoid

### ❌ DON'T: Use IngressRoute CRDs

```yaml
# ❌ WRONG - Don't use this!
apiVersion: traefik.containo.us/v1alpha1
kind: IngressRoute
```

**Why:** IngressRoutes fail due to persistent ACME cache issues in your setup.

### ❌ DON'T: Add TLS Configuration

```yaml
# ❌ WRONG - Don't add this!
spec:
  tls:
    secretName: some-cert
    certResolver: le
```

**Why:** Causes ACME failures and Let's Encrypt rate limiting. Cloudflare handles SSL.

### ❌ DON'T: Use Grey Cloud in Cloudflare

**Wrong:** DNS only (grey cloud) ☁️  
**Right:** Proxied (orange cloud) ☁️

**Why:** Grey cloud = no SSL from Cloudflare = certificate warnings.

### ❌ DON'T: Forget Network Policy

Every new service port MUST be added to the network policy or Traefik can't reach it.

---

## Complete Example: Adding a New Python API

Let's add a FastAPI service at `api2.yirrasystems.com`:

**1. Deployment:**
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: python-api
  namespace: drone-store
spec:
  replicas: 2
  selector:
    matchLabels:
      app: python-api
  template:
    metadata:
      labels:
        app: python-api
    spec:
      containers:
      - name: python-api
        image: localhost:5000/python-api:latest
        ports:
        - containerPort: 8000
        resources:
          requests:
            memory: "256Mi"
            cpu: "200m"
          limits:
            memory: "512Mi"
            cpu: "500m"
---
apiVersion: v1
kind: Service
metadata:
  name: python-api
  namespace: drone-store
spec:
  type: ClusterIP
  selector:
    app: python-api
  ports:
  - port: 8000
    targetPort: 8000
```

**2. Ingress:**
```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: python-api
  namespace: drone-store
spec:
  ingressClassName: traefik
  rules:
  - host: api2.yirrasystems.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: python-api
            port:
              number: 8000
```

**3. Commands:**
```bash
# Apply
k3s kubectl apply -f python-api.yaml

# Update network policy (add port 8000)
vim /home/james/yirra_systems_app/drone_website_MAX/netpol-drone-store.yaml
k3s kubectl apply -f /home/james/yirra_systems_app/drone_website_MAX/netpol-drone-store.yaml

# Add DNS in Cloudflare dashboard:
# A record: api2 → 122.199.30.183 (orange cloud)

# Wait 2-5 minutes, then test
curl -I https://api2.yirrasystems.com
```

**Done!** Your API is live with HTTPS.

---

## Reference: Current Services

| Service | Port | Domain | Purpose |
|---------|------|--------|---------|
| frontend | 3000 | yirrasystems.com | Main React app |
| backend | 5000 | yirrasystems.com/api | Node.js API |
| docs | 4000 | docs.yirrasystems.com | Docusaurus |
| ai-chat-service | 8001 | */chat/ws | WebSocket AI |

**Active routing file:** `/home/james/yirra_systems_app/drone_website_MAX/k8s/ingress/working-ingress.yaml`

---

## Summary Checklist

When adding a new service, verify:

- [ ] Deployment created and pods running
- [ ] Service created (ClusterIP)
- [ ] **Standard Ingress created** (NOT IngressRoute)
- [ ] **No TLS section** in Ingress
- [ ] Port added to network policy
- [ ] DNS A record created in Cloudflare
- [ ] **Orange cloud (Proxied)** enabled in DNS
- [ ] Cloudflare SSL mode = Flexible or Full
- [ ] Waited 2-5 minutes for DNS propagation
- [ ] Tested: `curl -I https://yourapp.yirrasystems.com`
- [ ] Returns HTTP/2 200 with `server: cloudflare`

**Time to complete:** 5-10 minutes per service

---

**Last verified:** 2025-10-08  
**Method:** Standard Kubernetes Ingress (networking.k8s.io/v1)  
**SSL:** Cloudflare automatic (no cert management)

