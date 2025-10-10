# N8N Workflow Automation Platform

**URL:** https://flows.yirrasystems.com  
**Status:** Deployed to K3s Cluster  
**Namespace:** n8n

---

## ⚠️ CRITICAL: N8N Database Isolation

**IMPORTANT SAFETY INFORMATION:**

- N8N uses its own PostgreSQL database (`n8n-postgres`) in the **`n8n` namespace**
- **NEVER apply N8N manifests to `drone-store` namespace** - that's for the website!
- Website PostgreSQL is in `drone-store` namespace and MUST NOT be touched
- Always verify `namespace: n8n` in manifests before running `kubectl apply`
- **Use kustomize to deploy safely:** `kubectl apply -k /home/james/yirra_systems_app/n8n/k8s/`

**See:** `NAMESPACE_PROTECTION.md` for complete isolation policy

---

## Overview

N8N is a workflow automation platform that allows you to connect various services and automate processes. This deployment includes:

- ✅ **PostgreSQL database** - Production-grade database backend
- ✅ **Persistent data storage** - Workflows and executions safely stored
- ✅ **HTTPS access** - Secure access via Cloudflare SSL
- ✅ **Webhook support** - Full webhook functionality
- ✅ **Auto-cleanup** - Automatic pruning of old executions (7 days)

## Architecture

```
User Browser (HTTPS)
  ↓
Cloudflare Edge (SSL termination)
  ↓ HTTP port 80
Server (122.199.30.183)
  ↓
Traefik Ingress
  ↓
N8N Service (port 5678)
  ↓
N8N Pod (with persistent storage)
```

## Deployment Components

### 1. PostgreSQL Database
- **Files:** `k8s/postgres-*.yaml`
- **Storage:** 10Gi persistent volume
- **Version:** PostgreSQL 16 (Alpine)
- **Purpose:** Store workflows, executions, credentials, and settings

### 2. N8N Data Volume
- **File:** `k8s/pvc.yaml`
- **Size:** 5Gi
- **Purpose:** Store N8N configuration and files

### 3. Deployment
- **File:** `k8s/deployment.yaml`
- **Image:** n8nio/n8n:latest
- **Port:** 5678
- **Resources:** 512Mi memory, 500m CPU

### 4. Service
- **File:** `k8s/service.yaml`
- **Type:** ClusterIP
- **Port:** 5678

### 5. Ingress
- **File:** `k8s/ingress.yaml`
- **Domain:** flows.yirrasystems.com
- **SSL:** Automatic via Cloudflare

## Quick Start

### Deploy N8N

```bash
# Apply all manifests
k3s kubectl apply -f k8s/

# Check deployment status
k3s kubectl get pods -n drone-store | grep n8n
k3s kubectl logs -n drone-store deployment/n8n
```

### Access N8N

1. Open https://flows.yirrasystems.com
2. Create your first admin account (first user becomes admin)
3. Start creating workflows!

## Configuration

### Environment Variables

Current configuration in `k8s/deployment.yaml`:

- `N8N_HOST`: flows.yirrasystems.com
- `N8N_PORT`: 5678
- `N8N_PROTOCOL`: https
- `WEBHOOK_URL`: https://flows.yirrasystems.com/
- `VUE_APP_URL_BASE_API`: https://flows.yirrasystems.com/

### Database Configuration

N8N is configured to use **PostgreSQL** (production-recommended):

**Current setup:**
- ✅ Database Type: PostgreSQL 16
- ✅ Host: postgres.drone-store.svc.cluster.local
- ✅ Port: 5432
- ✅ Database: n8n
- ✅ Storage: 10Gi persistent volume
- ✅ Auto-cleanup: Enabled (7 days retention)

**See:** `/home/james/yirra_systems_app/n8n/POSTGRESQL_SETUP.md` for detailed database documentation.

## Backup and Restore

### Backup Workflows

N8N data is stored in the persistent volume. To backup:

```bash
# Find the PVC
k3s kubectl get pvc -n drone-store | grep n8n

# Find the actual volume path on the host
k3s kubectl get pv

# Backup the data (run as root or with sudo)
sudo tar -czf n8n-backup-$(date +%Y%m%d).tar.gz /var/lib/rancher/k3s/storage/<pv-name>/
```

### Restore from Backup

```bash
# Extract backup to the volume
sudo tar -xzf n8n-backup-YYYYMMDD.tar.gz -C /var/lib/rancher/k3s/storage/<pv-name>/
```

## Troubleshooting

### N8N Pod Not Starting

```bash
# Check pod status
k3s kubectl get pods -n drone-store | grep n8n

# View logs
k3s kubectl logs -n drone-store deployment/n8n

# Check PVC is bound
k3s kubectl get pvc -n drone-store | grep n8n
```

### Cannot Access via HTTPS

```bash
# Verify ingress is created
k3s kubectl get ingress n8n -n drone-store

# Check Cloudflare DNS
dig flows.yirrasystems.com

# Test from inside cluster
k3s kubectl exec -n kube-system deployment/traefik -- \
  wget -qO- http://n8n.drone-store:5678/ | head -10
```

### Webhooks Not Working

Make sure:
1. `WEBHOOK_URL` is set to `https://flows.yirrasystems.com/`
2. Firewall allows incoming connections on port 80
3. Cloudflare proxy is enabled (orange cloud)

## Scaling

N8N can be scaled horizontally:

**Current setup:**
- ✅ PostgreSQL database (supports multiple replicas)
- ⏳ Single replica (sufficient for most workloads)

**To scale to multiple replicas:**
1. Deploy Redis for queue mode
2. Update N8N deployment with queue configuration
3. Scale replicas: `k3s kubectl scale deployment n8n -n drone-store --replicas=3`

Current single-replica setup is suitable for most production workloads.

## Monitoring

### Check N8N Health

```bash
# View logs
k3s kubectl logs -n drone-store deployment/n8n --tail=50 -f

# Check resource usage
k3s kubectl top pod -n drone-store | grep n8n

# Check service endpoints
k3s kubectl get endpoints n8n -n drone-store
```

### Common Log Messages

- `✓ Webhook waiting started` - Webhooks are working
- `✓ Editor is now accessible via` - Web UI is ready
- Database initialization messages on first start

## Security Recommendations

1. **Create admin account immediately** - First user becomes admin
2. **Enable 2FA** - In user settings after login
3. **Use secrets for credentials** - Don't hardcode API keys in workflows
4. **Regular backups** - Backup the persistent volume weekly
5. **Update regularly** - Keep N8N updated for security patches

## Useful Links

- **N8N Documentation:** https://docs.n8n.io/
- **N8N Community:** https://community.n8n.io/
- **Workflow Templates:** https://n8n.io/workflows/

## Support

For issues with:
- **N8N itself:** Check https://docs.n8n.io/
- **Deployment:** Check this README and `/home/james/yirra_systems_app/HOW_TO_ADD_NEW_SERVICES.md`
- **SSL/DNS:** Check `/home/james/yirra_systems_app/plan.md`

---

**Created:** 2025-10-08  
**Last Updated:** 2025-10-08  
**Maintained By:** Yirra Systems


