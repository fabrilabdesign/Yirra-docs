# Automated Uptime Kuma Setup

Uptime Kuma is deployed and running. To automatically configure all 8 monitors, follow these steps:

## Step 1: Complete DNS Setup

Add DNS record in Cloudflare (if not done):
- Type: **A**
- Name: **kuma**
- Content: **122.199.30.183**
- Proxy: **☁️ Proxied (Orange Cloud)**

Wait 2-5 minutes for DNS propagation.

## Step 2: Create Admin Account

Visit **https://kuma.yirrasystems.com** and create your admin account through the web UI.

Choose a strong username and password. Remember these credentials!

## Step 3: Run Automated Setup

After creating your admin account, run the automated setup:

```bash
# Create secret with your credentials
kubectl create secret generic kuma-credentials -n monitoring \
  --from-literal=username=admin \
  --from-literal=password='YOUR_PASSWORD_HERE'

# Run the setup job
kubectl apply -f /home/james/yirra_systems_app/monitoring/setup-job.yaml

# Wait for completion (should take ~10-15 seconds)
kubectl wait --for=condition=complete --timeout=60s job/uptime-kuma-setup -n monitoring

# View the results
kubectl logs -n monitoring job/uptime-kuma-setup
```

## What Gets Created Automatically

The setup job will create **8 monitors**:

### External Services (HTTPS)
1. 🌐 Main Site - `https://yirrasystems.com`
2. 🔌 Backend API - `https://yirrasystems.com/api/health`
3. 👨‍💼 Admin Panel - `https://app.yirrasystems.com`
4. 📚 Documentation - `https://docs.yirrasystems.com`
5. ⚙️ N8N Workflows - `https://flows.yirrasystems.com`
6. 📦 Docker Registry - `http://registry.drone-store.svc.cluster.local:5000/v2/`

### Internal Services (TCP Port)
7. 🗄️ PostgreSQL - `postgres.drone-store.svc.cluster.local:5432`
8. ⚡ Redis - `redis.drone-store.svc.cluster.local:6379`

All monitors check every 60 seconds with 3 retries.

## Cleanup

After successful setup, you can delete the job:

```bash
kubectl delete job uptime-kuma-setup -n monitoring
```

The secret with credentials will remain for future use.

## Re-running Setup

To re-run the setup (e.g., to add new monitors):

```bash
# Delete the old job
kubectl delete job uptime-kuma-setup -n monitoring

# Re-apply to create a new job
kubectl apply -f /home/james/yirra_systems_app/monitoring/setup-job.yaml
```

The script is smart enough to skip monitors that already exist.

## Manual Setup (Alternative)

If you prefer manual setup, run:

```bash
/home/james/yirra_systems_app/monitoring/show-monitors.sh
```

This will show you all the monitor configurations to add manually through the web UI.

---

**Note:** The setup job requires the `kuma-credentials` secret. If you delete this secret, the job will fail but provide instructions for manual setup.



