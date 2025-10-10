# Uptime Kuma Monitoring Setup

**URL:** https://kuma.yirrasystems.com  
**Status:** Deployed and Running  
**Namespace:** monitoring

## 🚀 Automated Quick Start

### Step 1: Add DNS Record in Cloudflare

- Type: **A**
- Name: **kuma**
- Content: **122.199.30.183**
- Proxy: ☁️ **Proxied (Orange Cloud)**

Wait 2-5 minutes for DNS propagation.

### Step 2: Create Admin Account

Visit **https://kuma.yirrasystems.com** and create your admin account through the web UI.

### Step 3: Run Automated Setup

After creating your admin account, automatically configure all monitors:

```bash
# Create secret with your credentials (replace YOUR_PASSWORD)
kubectl create secret generic kuma-credentials -n monitoring \
  --from-literal=username=admin \
  --from-literal=password='YOUR_PASSWORD'

# Run the automated setup job
kubectl apply -f /home/james/yirra_systems_app/monitoring/setup-job.yaml

# Wait for completion (~15 seconds)
kubectl wait --for=condition=complete --timeout=60s job/uptime-kuma-setup -n monitoring

# View results
kubectl logs -n monitoring job/uptime-kuma-setup
```

**Done!** All 8 monitors are now configured. Visit https://kuma.yirrasystems.com to view your dashboard.

---

## 📋 Manual Setup (Alternative)

---

## Monitors to Add

Copy-paste these into Uptime Kuma:

### External Services (HTTP/HTTPS)

| Name | Type | URL | Interval |
|------|------|-----|----------|
| 🌐 Main Site | HTTP(s) | `https://yirrasystems.com` | 60s |
| 🔌 Backend API | HTTP(s) | `https://yirrasystems.com/api/health` | 60s |
| 👨‍💼 Admin Panel | HTTP(s) | `https://app.yirrasystems.com` | 60s |
| 📚 Documentation | HTTP(s) | `https://docs.yirrasystems.com` | 60s |
| ⚙️ N8N Workflows | HTTP(s) | `https://flows.yirrasystems.com` | 60s |
| 📦 Docker Registry | HTTP(s) | `http://registry.drone-store.svc.cluster.local:5000/v2/` | 60s |

### Internal Services (TCP Port)

| Name | Type | Hostname | Port | Interval |
|------|------|----------|------|----------|
| 🗄️ PostgreSQL | TCP Port | `postgres.drone-store.svc.cluster.local` | 5432 | 60s |
| ⚡ Redis | TCP Port | `redis.drone-store.svc.cluster.local` | 6379 | 60s |

**Settings for all monitors:**
- Max Retries: 3
- Retry Interval: 60 seconds
- Timeout: 48 seconds

---

## Management Commands

### Check Status
```bash
k3s kubectl get all -n monitoring
k3s kubectl logs -n monitoring uptime-kuma-0 --tail=50
```

### Access Logs
```bash
k3s kubectl logs -n monitoring uptime-kuma-0 -f
```

### Restart Uptime Kuma
```bash
k3s kubectl rollout restart statefulset/uptime-kuma -n monitoring
```

### View Monitor Config
```bash
k3s kubectl get configmap uptime-kuma-monitors -n monitoring -o yaml
```

### Backup Data
```bash
# The data is stored in PVC: data-uptime-kuma-0
k3s kubectl exec -n monitoring uptime-kuma-0 -- tar czf - /app/data > uptime-kuma-backup-$(date +%Y%m%d).tar.gz
```

### Restore Data
```bash
cat uptime-kuma-backup-YYYYMMDD.tar.gz | k3s kubectl exec -i -n monitoring uptime-kuma-0 -- tar xzf - -C /
k3s kubectl rollout restart statefulset/uptime-kuma -n monitoring
```

---

## Architecture

```
User Browser (HTTPS)
  ↓
Cloudflare (SSL termination)
  ↓
Traefik Ingress (HTTP on port 80)
  ↓
uptime-kuma-service:3001
  ↓
uptime-kuma-0 (StatefulSet)
  └── PVC: data-uptime-kuma-0 (1Gi)
```

**Network Policy:** Allows Traefik from kube-system namespace to reach port 3001

---

## Files

- `uptime-kuma.yaml` - Main deployment (Namespace, StatefulSet, Service, Ingress)
- `netpol-monitoring.yaml` - Network policy
- `monitor-config.yaml` - ConfigMap with monitor definitions
- `setup-script.sh` - Helper script for reference
- `README.md` - This file

---

## Troubleshooting

### Can't access kuma.yirrasystems.com

**Check DNS:**
```bash
dig kuma.yirrasystems.com
# Should return Cloudflare IPs (not 122.199.30.183 directly)
```

**Check pod:**
```bash
k3s kubectl get pods -n monitoring
k3s kubectl logs -n monitoring uptime-kuma-0
```

**Check ingress:**
```bash
k3s kubectl describe ingress uptime-kuma-ingress -n monitoring
```

**Test from Traefik:**
```bash
k3s kubectl exec -n kube-system deployment/traefik -- wget -qO- http://uptime-kuma-service.monitoring:3001/ | head -5
```

### Monitors not reaching internal services

Make sure DNS resolution works inside the pod:
```bash
k3s kubectl exec -n monitoring uptime-kuma-0 -- nslookup postgres.drone-store.svc.cluster.local
```

### Reset admin password

Delete the data and restart (⚠️ loses all monitors):
```bash
k3s kubectl delete pvc data-uptime-kuma-0 -n monitoring
k3s kubectl delete pod uptime-kuma-0 -n monitoring
```

---

## Next Steps

1. **Set up notifications** in Uptime Kuma (Settings → Notifications)
2. **Create a status page** to share with stakeholders
3. **Configure maintenance windows** for planned downtime
4. **Set up webhooks** to integrate with incident management tools

---

**Deployment Date:** October 10, 2025  
**Version:** louislam/uptime-kuma:1.23.13

