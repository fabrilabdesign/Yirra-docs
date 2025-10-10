# Cloudflare SSL Setup for docs.yirrasystems.com

## Current Status

✅ **Documentation site is LIVE** at `https://docs.yirrasystems.com`

⚠️ **SSL Certificate**: Currently showing "ERR_CERT_AUTHORITY_INVALID"

## Why This Happens

Your main site (`yirrasystems.com`) uses **Cloudflare** for SSL termination (you can see `server: cloudflare` in the response headers). This means:

1. Cloudflare provides the SSL certificate
2. Traffic hits Cloudflare first
3. Cloudflare proxies to your K8s cluster

## Solution: Configure Cloudflare for docs Subdomain

### Step 1: Verify DNS Record in Cloudflare

Log into your Cloudflare dashboard and check:

1. DNS record for `docs.yirrasystems.com` exists
2. Points to your server IP: `122.199.30.183`
3. **Proxy status** is **ORANGE CLOUD** (Proxied) - NOT grey cloud

If grey cloud (DNS only), click to enable proxy. This enables Cloudflare's SSL.

### Step 2: SSL/TLS Mode

In Cloudflare dashboard:

1. Go to **SSL/TLS** section
2. Set mode to **Full** or **Full (Strict)**
   - **Full**: Cloudflare uses SSL to origin, accepts self-signed
   - **Full (Strict)**: Requires valid cert on origin (use Full for now)

### Step 3: Wait for Propagation

After enabling orange cloud proxy:
- **DNS propagation**: 5-15 minutes typically
- **SSL activation**: Almost instant once DNS resolves through Cloudflare

### Step 4: Test

```bash
curl -I https://docs.yirrasystems.com
```

You should see:
- `HTTP/2 200`
- `server: cloudflare`
- No certificate errors

## Current Kubernetes Configuration

The docs site is configured to work with Cloudflare SSL:

- **Ingress**: No TLS termination at K8s level
- **Service**: HTTP only on port 4000
- **Pod**: Nginx serving HTTP
- **Cloudflare**: Handles HTTPS → HTTP proxy

## Alternative: Let's Encrypt at K8s Level

If you prefer K8s-level certificates instead of Cloudflare:

1. Set Cloudflare DNS to **grey cloud** (DNS only)
2. Point directly to your server
3. Re-enable cert-manager annotations in `k8s-ingress.yaml`
4. Wait for ACME HTTP-01 challenge (can take 5-10 min)

## Verification Checklist

Once Cloudflare is configured:

- [ ] DNS resolves to Cloudflare IPs (not direct to 122.199.30.183)
- [ ] Orange cloud enabled in Cloudflare DNS
- [ ] SSL mode set to Full in Cloudflare
- [ ] `https://docs.yirrasystems.com` loads without certificate warnings
- [ ] Server header shows "cloudflare"

## Site is Working Now

**Important**: The site is fully functional right now. The certificate warning is only because:
- DNS may still be propagating
- Cloudflare proxy may not be enabled yet

The actual documentation content is live and accessible (with browser warning to proceed).

---

**Next Steps:**
1. Enable Cloudflare proxy (orange cloud) for docs.yirrasystems.com DNS record
2. Wait 5-10 minutes for propagation
3. Refresh browser - SSL warning should be gone

The site will be fully secure once Cloudflare proxy is active! 🔒


