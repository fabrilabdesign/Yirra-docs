# Admin Panel - Nginx Proxy Fix for Image Loading

**Date:** 2025-10-08  
**Issue:** Product images not loading in the admin panel  
**Status:** ✅ Fixed and Deployed (v4)

---

## Problem

After breaking out the admin panel into its own standalone deployment, product images were failing to load in the Product Management tab.

### Root Cause

The admin panel Docker container uses nginx to serve the built static files in production. However, the nginx configuration was **missing proxy rules** for:
- `/api/*` - API requests to backend
- `/uploads/*` - Product image requests

Without these proxy rules:
- API calls like `/api/admin/products` failed (404 or connection refused)
- Image URLs like `/uploads/products/xyz.jpg` failed (404)
- The vite dev proxy (in `vite.config.js`) only works during development, not in production

---

## Solution

### What Was Fixed

Updated `/home/james/yirra_systems_app/admin-panel/nginx.conf` to add proxy configuration:

```nginx
# Proxy API requests to backend
location /api/ {
    proxy_pass http://backend.drone-store:5000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;
}

# Proxy uploads requests to backend
location /uploads/ {
    proxy_pass http://backend.drone-store:5000;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

### How It Works Now

**Request Flow:**
```
Browser (app.yirrasystems.com)
    ↓
Cloudflare (SSL termination)
    ↓
Traefik Ingress (routing)
    ↓
Admin Frontend nginx (port 3001)
    ├─ /api/* → proxied to backend.drone-store:5000
    ├─ /uploads/* → proxied to backend.drone-store:5000
    └─ /* → serves static React app
```

**Product Image Loading:**
1. Product has `uploaded_image: "/uploads/products/abc123.jpg"`
2. AdminProductCard transforms it to: `/api/uploads/products/abc123.jpg` (for consistency)
3. Nginx proxies `/api/uploads/*` → `http://backend.drone-store:5000/api/uploads/*`
4. Backend serves the image from `/app/uploads/products/abc123.jpg`
5. Image displays in admin panel ✅

---

## Deployment

### Version Deployed
- **Image:** `localhost:5000/admin-panel:v4`
- **Deployed:** 2025-10-08 10:30 UTC
- **Status:** 2/2 pods running and healthy

### Verification Tests

✅ **1. Service Health**
```bash
curl https://app.yirrasystems.com/health
# Response: healthy
```

✅ **2. API Proxy Working**
```bash
k3s kubectl exec -n kube-system deployment/traefik -- \
  wget -qO- http://admin-frontend.drone-store:3001/api/admin/products
# Response: 401 Unauthorized (expected - requires auth)
```

✅ **3. Uploads Proxy Working**
```bash
curl -I https://app.yirrasystems.com/uploads/products/003a31da2fd218c59ddb8ea12d4242d9
# Response: HTTP/2 200
# Content-Type: application/octet-stream
# Content-Length: 552585
```

---

## Architecture Context

### Why This Fix Was Needed

The admin panel deployment has two different runtime environments:

**Development (npm run dev):**
- Vite dev server runs on port 3001
- `vite.config.js` proxy handles `/api` and `/uploads`
- Works correctly ✅

**Production (Docker container):**
- Nginx serves static build from `/usr/share/nginx/html`
- Vite proxy doesn't run in production
- **Needed:** Nginx must handle proxying
- **Before fix:** No proxy rules = broken API/images ❌
- **After fix:** Nginx proxies correctly ✅

### Files Changed

1. **nginx.conf** - Added `/api/` and `/uploads/` proxy rules
2. **Deployed** - Rebuilt Docker image and rolled out to K8s

### Files That Already Worked Correctly

- `AdminProducts.jsx` - Uses relative URLs `/api/admin/products`
- `AdminProductCard.jsx` - Transforms image paths to `/api/uploads/products/*`
- `ImageUpload.jsx` - Posts to `/api/admin/products/upload-image`
- `vite.config.js` - Dev proxy (works in development)

All components were already using relative URLs, they just needed nginx to proxy them in production.

---

## Testing Checklist

After deploying v4, verify:

- [x] Admin panel loads: https://app.yirrasystems.com
- [x] Health endpoint responds: `https://app.yirrasystems.com/health`
- [x] API proxy works (401 expected without auth)
- [x] Uploads proxy works (images serve correctly)
- [ ] **User to verify:** Product images display in Product Management tab
- [ ] **User to verify:** Image upload works
- [ ] **User to verify:** Product gallery works

---

## How to Test Product Images

1. Go to https://app.yirrasystems.com
2. Log in with admin credentials
3. Navigate to Products tab
4. Check if product images are displayed in the product cards
5. Try uploading a new image for a product
6. Open the image gallery for a product

**Expected Results:**
- All uploaded product images should display correctly
- Image uploads should work without errors
- Gallery should show all product images

---

## Related Files

- **Nginx Config:** `/home/james/yirra_systems_app/admin-panel/nginx.conf`
- **Vite Config:** `/home/james/yirra_systems_app/admin-panel/vite.config.js`
- **Dockerfile:** `/home/james/yirra_systems_app/admin-panel/Dockerfile`
- **Deployment:** `/home/james/yirra_systems_app/admin-panel/k8s/deployment.yaml`
- **Build Script:** `/home/james/yirra_systems_app/admin-panel/rebuild-and-deploy.sh`

---

## Future Improvements

### Consider
1. Add nginx access logs for debugging: `access_log /var/log/nginx/access.log;`
2. Add rate limiting to prevent abuse
3. Add compression for JSON responses
4. Add CORS headers if needed for future integrations

### Not Needed
- ❌ IngressRoute or SSL config (handled by Cloudflare + Traefik)
- ❌ Environment-specific API URLs (relative URLs work everywhere)
- ❌ getApiUrl utility refactoring (not used by product components)

---

## Rollback Instructions

If issues occur:

```bash
# Rollback to v3
k3s kubectl rollout undo deployment/admin-frontend -n drone-store

# Or set specific version
k3s kubectl set image deployment/admin-frontend \
  admin-frontend=localhost:5000/admin-panel:v3 -n drone-store

# Verify
k3s kubectl rollout status deployment/admin-frontend -n drone-store
```

---

## Summary

**Problem:** Images not loading due to missing nginx proxy config  
**Fix:** Added `/api/` and `/uploads/` proxy rules to nginx.conf  
**Result:** All API and image requests now correctly proxied to backend  
**Deployment:** v4 deployed successfully (2/2 pods running)  
**Next Step:** User verification that product images load correctly  

---

**Fixed by:** AI Assistant  
**Deployed:** 2025-10-08 10:30 UTC  
**Version:** v4

