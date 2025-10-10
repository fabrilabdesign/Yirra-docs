# New Service Deployment Checklist

Use this checklist when deploying a new service to ensure nothing is missed.

## Pre-Deployment

- [ ] Choose service name (lowercase, no spaces): `________________`
- [ ] Determine container port: `________________`
- [ ] Choose subdomain: `________________.yirrasystems.com`
- [ ] Docker image ready and pushed to registry: `________________`

## Step 1: Deploy Application

- [ ] Copy `deployment.yaml` from template
- [ ] Replace `MYAPP` with your service name
- [ ] Replace `8080` with your container port
- [ ] Update image name and tag
- [ ] Adjust resources (CPU, memory) if needed
- [ ] Update health check paths if needed
- [ ] Apply: `k3s kubectl apply -f deployment.yaml`
- [ ] Verify pods running: `k3s kubectl get pods -n drone-store | grep MYAPP`
- [ ] Check pod logs: `k3s kubectl logs -n drone-store deployment/MYAPP`

## Step 2: Create IngressRoute

- [ ] Copy `ingressroute.yaml` from template
- [ ] Replace `MYAPP` with your service name
- [ ] Replace `8080` with your service port
- [ ] Update subdomain name
- [ ] Choose appropriate priority (avoid conflicts)
- [ ] **Verify NO tls: section exists** ← CRITICAL!
- [ ] Apply: `k3s kubectl apply -f ingressroute.yaml`
- [ ] Verify created: `k3s kubectl get ingressroute MYAPP-ingress -n drone-store`

## Step 3: Update Network Policy

- [ ] Edit `/home/james/yirra_systems_app/drone_website_MAX/netpol-drone-store.yaml`
- [ ] Add your port to the ports list under Traefik ingress rule
- [ ] Apply: `k3s kubectl apply -f netpol-drone-store.yaml`
- [ ] Verify: `k3s kubectl get networkpolicy -n drone-store -o yaml | grep "port:"`

## Step 4: Configure DNS in Cloudflare

- [ ] Log into Cloudflare dashboard
- [ ] Go to DNS settings for yirrasystems.com
- [ ] Add A record:
  - Type: `A`
  - Name: `________________` (your subdomain)
  - Content: `122.199.30.183`
  - Proxy status: **Orange cloud (Proxied)** ← MUST BE ORANGE!
  - TTL: Auto
- [ ] Save record

## Step 5: Verify Cloudflare SSL Settings

- [ ] Go to SSL/TLS → Overview
- [ ] Verify mode is set to: `Flexible` or `Full` (NOT Off or Full Strict)
- [ ] Go to SSL/TLS → Edge Certificates
- [ ] Verify "Always Use HTTPS" is enabled

## Step 6: Test & Verify

Wait 2-5 minutes for DNS propagation, then:

- [ ] Test DNS resolution: `dig MYAPP.yirrasystems.com`
  - Should return Cloudflare IPs (104.x.x.x or 172.x.x.x), not 122.199.30.183
- [ ] Test HTTP: `curl -I http://MYAPP.yirrasystems.com`
  - Should return 301/302 redirect to HTTPS
- [ ] Test HTTPS: `curl -I https://MYAPP.yirrasystems.com`
  - Should return 200 OK
  - Should have `server: cloudflare` header
- [ ] Test in browser: Open `https://MYAPP.yirrasystems.com`
  - Should show no certificate warnings
  - Should load your app
- [ ] Check Traefik logs for errors:
  ```bash
  k3s kubectl logs -n kube-system deployment/traefik --tail=50 | grep -i error
  ```

## Troubleshooting

### If service doesn't load:

**Check pods:**
```bash
k3s kubectl get pods -n drone-store | grep MYAPP
k3s kubectl logs -n drone-store deployment/MYAPP --tail=50
```

**Check service:**
```bash
k3s kubectl get svc MYAPP -n drone-store
k3s kubectl describe svc MYAPP -n drone-store
```

**Check IngressRoute:**
```bash
k3s kubectl describe ingressroute MYAPP-ingress -n drone-store
```

**Test from Traefik pod:**
```bash
k3s kubectl exec -n kube-system deployment/traefik -- \
  wget -qO- http://MYAPP.drone-store:8080/ | head -10
```

### If certificate warning:

- [ ] Verify DNS record has orange cloud (Proxied) enabled
- [ ] Wait longer for DNS propagation (can take up to 15 minutes)
- [ ] Verify Cloudflare SSL mode is Flexible or Full

### If "no route to host":

- [ ] Verify network policy includes your port
- [ ] Verify IngressRoute was applied successfully
- [ ] Check Traefik can reach service (test from Traefik pod)

## Post-Deployment

- [ ] Document the new service in your inventory
- [ ] Add monitoring/alerting if needed
- [ ] Update any internal documentation
- [ ] Notify team that service is live

## Rollback (if needed)

If something goes wrong:

```bash
# Delete IngressRoute
k3s kubectl delete ingressroute MYAPP-ingress -n drone-store

# Delete deployment and service
k3s kubectl delete -f deployment.yaml

# Remove port from network policy (edit and reapply)

# Remove DNS record from Cloudflare
```

---

**Total time:** ~5-10 minutes (plus 2-5 minutes DNS propagation)

