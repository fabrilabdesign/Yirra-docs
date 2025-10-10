# Cloudflare DNS Setup for N8N

## Add DNS Record in Cloudflare

Follow these steps to make N8N accessible at https://flows.yirrasystems.com:

### Steps:

1. **Log into Cloudflare Dashboard**
   - Go to https://dash.cloudflare.com/
   - Select your `yirrasystems.com` domain

2. **Navigate to DNS Settings**
   - Click on "DNS" in the left sidebar

3. **Add A Record**
   Click "Add record" and configure:
   
   - **Type:** A
   - **Name:** `flows`
   - **IPv4 address:** `122.199.30.183`
   - **Proxy status:** ☁️ **Proxied (Orange Cloud)** ← CRITICAL!
   - **TTL:** Auto

4. **Save**
   - Click "Save" to create the record

### Verification

After adding the DNS record, wait 2-5 minutes for DNS propagation, then run:

```bash
# Check DNS resolution
dig flows.yirrasystems.com

# Should return Cloudflare IPs (104.x.x.x or 172.x.x.x)
# NOT your direct IP (122.199.30.183)
```

### Test Access

```bash
# Test HTTPS (should work)
curl -I https://flows.yirrasystems.com

# Should return:
# HTTP/2 200
# server: cloudflare
```

Open in browser:
- https://flows.yirrasystems.com
- Should load N8N login/setup page with no SSL warnings

### First Time Setup

When you first visit https://flows.yirrasystems.com:

1. You'll see the "Set up owner account" page
2. Create your admin account:
   - **Email:** Your email
   - **First Name:** Your name
   - **Last Name:** Your last name
   - **Password:** Choose a strong password
3. Click "Next"
4. You're now logged in as the admin!

**Important:** The first user to register becomes the owner/admin of the N8N instance.

### SSL/TLS Settings in Cloudflare

Verify these settings are correct:

1. **Go to SSL/TLS tab** in Cloudflare
2. **SSL/TLS encryption mode:** Should be **Flexible** or **Full**
3. **Always Use HTTPS:** ✅ Enabled
4. **Automatic HTTPS Rewrites:** ✅ Enabled

### Troubleshooting

**Problem: DNS doesn't resolve**
- Check the orange cloud is enabled (Proxied)
- Wait 5-10 minutes for propagation
- Clear your DNS cache: `sudo systemd-resolve --flush-caches`

**Problem: SSL certificate warning**
- Verify orange cloud (Proxied) is enabled
- Check SSL mode is Flexible or Full
- Wait 10-15 minutes for Cloudflare to provision cert

**Problem: 404 Not Found**
- Check N8N pod is running: `k3s kubectl get pods -n drone-store | grep n8n`
- Check ingress: `k3s kubectl get ingress n8n -n drone-store`
- Check Traefik can reach N8N: See main README.md

---

## Summary Checklist

- [ ] Logged into Cloudflare dashboard
- [ ] Added A record: flows → 122.199.30.183
- [ ] Orange cloud (Proxied) enabled
- [ ] Waited 2-5 minutes
- [ ] Tested: `dig flows.yirrasystems.com` shows Cloudflare IPs
- [ ] Tested: `curl -I https://flows.yirrasystems.com` returns 200
- [ ] Opened in browser: https://flows.yirrasystems.com
- [ ] Created admin account

**Time to complete:** ~5 minutes + DNS wait time

---

**Created:** 2025-10-08


