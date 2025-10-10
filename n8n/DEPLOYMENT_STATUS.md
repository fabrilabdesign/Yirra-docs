# N8N Deployment Status

**Date:** 2025-10-08  
**Status:** ✅ DEPLOYED & READY

---

## Deployment Summary

N8N workflow automation platform has been successfully deployed to your K3s cluster.

### What's Deployed:

✅ **Persistent Storage** - 5Gi volume for workflows and data  
✅ **N8N Deployment** - Running on port 5678  
✅ **ClusterIP Service** - Internal service endpoint  
✅ **Kubernetes Ingress** - Routing configured for flows.yirrasystems.com  
✅ **Network Policy** - Port 5678 allowed from Traefik  
✅ **Proxy Configuration** - Trust proxy headers enabled

### Configuration:

- **URL:** https://flows.yirrasystems.com
- **Namespace:** drone-store
- **Image:** n8nio/n8n:latest
- **Port:** 5678
- **Storage:** 5Gi persistent volume
- **Database:** SQLite (stored in persistent volume)
- **Timezone:** Australia/Sydney

---

## Next Steps

### 1. Add Cloudflare DNS Record

N8N is deployed and ready, but you need to add the DNS record in Cloudflare:

📄 **See:** `/home/james/yirra_systems_app/n8n/CLOUDFLARE_DNS_SETUP.md`

**Quick steps:**
1. Log into Cloudflare dashboard
2. Add A record: `flows` → `122.199.30.183` (orange cloud enabled)
3. Wait 2-5 minutes
4. Visit https://flows.yirrasystems.com

### 2. Create Admin Account

When you first visit N8N:
- You'll see "Set up owner account" page
- Create your admin credentials
- First user becomes the admin/owner

---

## Verification Commands

### Check Deployment Status

```bash
# Check pod is running
k3s kubectl get pods -n drone-store | grep n8n

# Check logs
k3s kubectl logs -n drone-store deployment/n8n --tail=50

# Check service
k3s kubectl get svc n8n -n drone-store

# Check ingress
k3s kubectl get ingress n8n -n drone-store
```

### Test Internal Access

```bash
# Test from Traefik (within cluster)
k3s kubectl exec -n kube-system deployment/traefik -- \
  wget -qO- http://n8n.drone-store:5678/ | head -20
```

### Test External Access (after DNS setup)

```bash
# Wait 2-5 minutes after adding DNS, then:

# Check DNS
dig flows.yirrasystems.com

# Test HTTPS
curl -I https://flows.yirrasystems.com

# Should return: HTTP/2 200, server: cloudflare
```

---

## Current Status

| Component | Status | Details |
|-----------|--------|---------|
| Pod | ✅ Running | n8n-7cb4776bf6-jbg8g |
| Service | ✅ Ready | ClusterIP 10.43.128.19:5678 |
| Ingress | ✅ Configured | flows.yirrasystems.com → Traefik |
| Network Policy | ✅ Updated | Port 5678 allowed |
| PVC | ✅ Bound | 5Gi storage |
| DNS | ⏳ Pending | **Action required: Add in Cloudflare** |

---

## Files Created

```
/home/james/yirra_systems_app/n8n/
├── README.md                      # Full documentation
├── CLOUDFLARE_DNS_SETUP.md       # DNS setup instructions
├── DEPLOYMENT_STATUS.md          # This file
└── k8s/
    ├── pvc.yaml                  # Persistent storage
    ├── deployment.yaml           # N8N deployment
    ├── service.yaml              # ClusterIP service
    └── ingress.yaml              # Traefik ingress
```

---

## Useful Commands

### View Logs (Live)
```bash
k3s kubectl logs -n drone-store deployment/n8n -f
```

### Restart N8N
```bash
k3s kubectl rollout restart deployment/n8n -n drone-store
```

### Check Resource Usage
```bash
k3s kubectl top pod -n drone-store | grep n8n
```

### Scale Replicas (if needed)
```bash
# Note: Requires PostgreSQL instead of SQLite for multi-replica
k3s kubectl scale deployment n8n -n drone-store --replicas=2
```

### Access N8N Shell (for debugging)
```bash
k3s kubectl exec -it -n drone-store deployment/n8n -- /bin/sh
```

---

## Architecture

```
Internet (HTTPS)
  ↓
Cloudflare Edge
  ├─ SSL Termination
  ├─ CDN Caching
  └─ DDoS Protection
  ↓ HTTP port 80
Server (122.199.30.183)
  ↓
Traefik Ingress Controller
  ├─ Host-based Routing
  └─ Network Policy Check
  ↓ Port 5678
N8N Service (ClusterIP)
  ↓
N8N Pod
  ├─ N8N Application
  └─ SQLite Database
  ↓
Persistent Volume (5Gi)
  └─ /home/node/.n8n/
      ├─ Workflows
      ├─ Credentials
      └─ Settings
```

---

## Support & Documentation

- **N8N Docs:** https://docs.n8n.io/
- **Full README:** `/home/james/yirra_systems_app/n8n/README.md`
- **DNS Setup:** `/home/james/yirra_systems_app/n8n/CLOUDFLARE_DNS_SETUP.md`
- **Add Services Guide:** `/home/james/yirra_systems_app/HOW_TO_ADD_NEW_SERVICES.md`
- **Routing Guide:** `/home/james/yirra_systems_app/plan.md`

---

**Deployed by:** Yirra Systems  
**Deployment Date:** 2025-10-08  
**N8N Version:** 1.114.3


