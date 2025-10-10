# N8N Quick Start Guide

## ✅ Deployment Complete!

N8N is deployed and running on your K3s cluster. You just need to add the DNS record in Cloudflare.

---

## 🚀 Next Steps (5 minutes)

### Step 1: Add Cloudflare DNS Record

1. **Go to:** https://dash.cloudflare.com/
2. **Select domain:** yirrasystems.com
3. **Click:** DNS (left sidebar)
4. **Add record:**
   - Type: `A`
   - Name: `flows`
   - IPv4 address: `122.199.30.183`
   - Proxy status: ☁️ **Proxied (Orange Cloud)** ← Must be enabled!
   - TTL: Auto
5. **Click:** Save

### Step 2: Wait 2-5 Minutes

DNS needs time to propagate through Cloudflare's network.

### Step 3: Access N8N

Open in your browser:
```
https://flows.yirrasystems.com
```

### Step 4: Create Admin Account

First user to register becomes the admin:
- Enter your email
- Choose a strong password
- Complete setup

**Done!** You can now create workflows in N8N.

---

## 📋 Verification Checklist

After adding DNS, verify everything works:

```bash
# 1. Check DNS resolves to Cloudflare
dig flows.yirrasystems.com
# Should show 104.x.x.x or 172.x.x.x (Cloudflare IPs)

# 2. Test HTTPS
curl -I https://flows.yirrasystems.com
# Should return: HTTP/2 200
# Should show: server: cloudflare

# 3. Open in browser
# Visit: https://flows.yirrasystems.com
# Should load N8N without SSL warnings
```

---

## 🔧 Useful Commands

```bash
# Check N8N status
k3s kubectl get pods -n drone-store | grep n8n

# View N8N logs
k3s kubectl logs -n drone-store deployment/n8n -f

# Restart N8N
k3s kubectl rollout restart deployment/n8n -n drone-store

# Check all N8N resources
k3s kubectl get all -n drone-store | grep n8n
```

---

## 📚 Documentation

- **Full README:** `/home/james/yirra_systems_app/n8n/README.md`
- **DNS Setup:** `/home/james/yirra_systems_app/n8n/CLOUDFLARE_DNS_SETUP.md`
- **Status:** `/home/james/yirra_systems_app/n8n/DEPLOYMENT_STATUS.md`
- **N8N Docs:** https://docs.n8n.io/

---

## ⚡ Quick Facts

| Item | Value |
|------|-------|
| **URL** | https://flows.yirrasystems.com |
| **Port** | 5678 |
| **Storage** | 5Gi persistent volume |
| **Database** | SQLite (local) |
| **Namespace** | drone-store |
| **Version** | 1.114.3 |

---

## 🆘 Troubleshooting

**Can't access N8N?**
1. Check DNS: Orange cloud must be enabled in Cloudflare
2. Wait 5-10 minutes for DNS propagation
3. Check pod is running: `k3s kubectl get pods -n drone-store | grep n8n`

**SSL warning?**
1. Verify orange cloud (Proxied) is enabled
2. Check Cloudflare SSL mode is Flexible or Full
3. Wait 10-15 minutes for cert provisioning

---

## 🎯 Current Status

✅ **K3s Deployment** - Complete  
✅ **Network Policy** - Updated  
✅ **Ingress** - Configured  
✅ **N8N Pod** - Running  
⏳ **DNS Record** - **Action Required**  
⏳ **Testing** - Pending DNS

---

**Last Updated:** 2025-10-08  
**Ready to use once DNS is added!**


