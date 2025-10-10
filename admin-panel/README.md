# Yirra Systems Admin Panel

**Standalone admin application for managing Yirra Systems operations.**

🌐 **Live URL:** https://app.yirrasystems.com

---

## Overview

This is a completely independent React application separate from the main customer-facing website. It contains all administrative tools for managing products, orders, inventory, customers, engineering, and more.

### Architecture

- **Framework:** React 18 + Vite
- **Routing:** React Router v6
- **Authentication:** Clerk
- **Styling:** Tailwind CSS
- **Deployment:** Kubernetes (K3s) in `drone-store` namespace
- **Domain:** app.yirrasystems.com (via Cloudflare SSL)

---

## Project Structure

```
admin-panel/
├── src/
│   ├── components/          # All admin UI components
│   │   ├── admin/          # Auth components (AdminGate)
│   │   ├── Admin*.jsx      # Admin feature modules
│   │   └── ...             # Supporting components
│   ├── pages/              # Page-level components
│   ├── context/            # React contexts (Cart, Auth, etc.)
│   ├── hooks/              # Custom React hooks
│   ├── utils/              # Helper functions
│   ├── App.jsx             # Main app with routing
│   ├── main.jsx            # Entry point
│   └── index.css           # Global styles
├── k8s/
│   └── deployment.yaml     # Kubernetes deployment config
├── public/                 # Static assets
├── Dockerfile              # Multi-stage Docker build
├── nginx.conf              # Nginx configuration
├── vite.config.js          # Vite build configuration
├── tailwind.config.js      # Tailwind CSS config
└── package.json            # Dependencies
```

---

## Available Routes

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | AdminGate | Login/authentication gate |
| `/dashboard` | AdminDashboard / AdminMobileDashboard | Main dashboard (responsive) |
| `/overview` | AdminOverview | System overview |
| `/products` | AdminProducts | Product management |
| `/orders` | AdminOrders | Order management |
| `/inventory` | AdminInventory | Inventory tracking |
| `/customers` | AdminCustomers | Customer management |
| `/engineering` | AdminEngineering | Engineering tools |
| `/bom` | AdminBOM | Bill of Materials |
| `/shipping` | AdminShipping | Shipping management |
| `/returns` | AdminReturns | Returns processing |
| `/reports` | AdminReports | Analytics & reports |
| `/marketing` | AdminMarketing | Marketing tools |
| `/newsletter` | AdminNewsletter | Newsletter management |
| `/blog` | AdminBlog | Blog management |
| `/chat` | AdminChat | Admin chat interface |
| `/settings` | AdminSettings | System settings |
| `/users` | AdminUserManagement | User management |
| `/stl-files` | AdminSTLFiles | 3D file management |
| `/fulfillment` | AdminOrderFulfillment | Order fulfillment |
| `/projects` | AdminProjectManagementPage | Project management |
| `/analytics` | EnhancedAnalyticsDashboard | Advanced analytics |

---

## Development

### Prerequisites

- Node.js 18+
- npm or yarn

### Setup

```bash
# Clone or navigate to project
cd /home/james/yirra_systems_app/admin-panel

# Install dependencies
npm install

# Set environment variables
export VITE_CLERK_PUBLISHABLE_KEY="your_clerk_key_here"

# Start development server
npm run dev
```

The dev server will start at http://localhost:3001

### Environment Variables

- `VITE_CLERK_PUBLISHABLE_KEY` - Clerk authentication public key
- `VITE_API_URL` - Backend API URL (defaults to http://backend.drone-store:5000)
- `VITE_CHAT_URL` - Chat service URL (defaults to ws://ai-chat-service.drone-store:8001)

---

## Building

### Local Build

```bash
npm run build
```

Output will be in `dist/` directory.

### Docker Build

```bash
# Build image
docker build -t localhost:5000/admin-panel:v1 .

# Push to registry
docker push localhost:5000/admin-panel:v1
```

---

## Deployment

### Kubernetes Deployment

```bash
# Apply deployment
k3s kubectl apply -f k8s/deployment.yaml

# Check rollout status
k3s kubectl rollout status deployment/admin-frontend -n drone-store

# View pods
k3s kubectl get pods -n drone-store | grep admin-frontend

# View logs
k3s kubectl logs -n drone-store deployment/admin-frontend --tail=50
```

### Deployment Configuration

- **Namespace:** `drone-store`
- **Service Name:** `admin-frontend` (ClusterIP)
- **Port:** 3001
- **Replicas:** 2
- **Resources:**
  - Requests: 200m CPU, 256Mi memory
  - Limits: 500m CPU, 512Mi memory
- **Health Checks:** `/health` endpoint

### Ingress

The ingress is already configured at `/home/james/yirra_systems_app/drone_website_MAX/k8s/ingress/working-ingress.yaml`:

```yaml
- host: app.yirrasystems.com
  http:
    paths:
    - path: /chat/ws
      backend:
        service:
          name: ai-chat-service
          port: 8001
    - path: /api
      backend:
        service:
          name: backend
          port: 5000
    - path: /
      backend:
        service:
          name: admin-frontend
          port: 3001
```

### Network Policy

Port 3001 is already allowed in the network policy at:
`/home/james/yirra_systems_app/drone_website_MAX/netpol-drone-store.yaml`

---

## Updating the Admin Panel

### Quick Update Process

**Option 1: Use the helper script (Recommended)**
```bash
cd /home/james/yirra_systems_app/admin-panel
./rebuild-and-deploy.sh
```

**Option 2: Manual process**
1. **Make code changes**
2. **Build new image:**
   ```bash
   cd /home/james/yirra_systems_app/admin-panel
   CLERK_KEY='pk_live_Y2xlcmsueWlycmFzeXN0ZW1zLmNvbSQ'
   docker build --build-arg VITE_CLERK_PUBLISHABLE_KEY="${CLERK_KEY}" \
     -t localhost:5000/admin-panel:vNEW .
   docker push localhost:5000/admin-panel:vNEW
   ```
3. **Update deployment:**
   ```bash
   k3s kubectl set image deployment/admin-frontend \
     admin-frontend=localhost:5000/admin-panel:vNEW \
     -n drone-store
   ```
4. **Verify rollout:**
   ```bash
   k3s kubectl rollout status deployment/admin-frontend -n drone-store
   ```

**Important:** The Clerk publishable key must be provided at **build time** as a build argument because Vite bundles it into the JavaScript during the build process.

### Rollback

If something goes wrong:

```bash
k3s kubectl rollout undo deployment/admin-frontend -n drone-store
```

---

## Verification

### Internal Tests

```bash
# Test from Traefik pod
k3s kubectl exec -n kube-system deployment/traefik -- \
  wget -qO- http://admin-frontend.drone-store:3001/health

# Check service
k3s kubectl get svc admin-frontend -n drone-store
```

### External Tests

```bash
# Check HTTPS access
curl -I https://app.yirrasystems.com

# Should return:
# HTTP/2 200
# server: cloudflare
```

---

## Architecture Details

### Traffic Flow

```
User Browser (HTTPS)
  ↓
Cloudflare Edge (SSL termination)
  ↓ HTTP on port 80
Server 122.199.30.183
  ↓
Traefik (LoadBalancer: 192.168.3.103)
  ↓ Port 80
Traefik Pod (kube-system)
  ↓ Standard Kubernetes Ingress routing
Admin Frontend Pods (drone-store)
  ↓ Port 3001
Nginx serving React SPA
```

### Backend Communication

The admin panel communicates with:
- **Backend API:** `backend.drone-store:5000` (via `/api` proxy)
- **AI Chat Service:** `ai-chat-service.drone-store:8001` (via `/chat/ws` proxy)

API calls are proxied through the ingress, so from the browser's perspective:
- `https://app.yirrasystems.com/api/*` → Backend
- `wss://app.yirrasystems.com/chat/ws` → AI Chat Service

---

## Security

### Authentication

All routes except `/` (login) are protected by Clerk authentication via the `ProtectedRoute` wrapper.

### Secrets

The Clerk publishable key is stored in Kubernetes secrets:
```bash
k3s kubectl get secret clerk-secrets -n drone-store
```

### Network

- Admin panel only accessible via Cloudflare proxy
- Internal communication uses ClusterIP services
- Network policy restricts traffic to Traefik ingress

---

## Troubleshooting

### Pod Not Starting

```bash
# Check pod status
k3s kubectl get pods -n drone-store | grep admin

# View pod events
k3s kubectl describe pod <pod-name> -n drone-store

# Check logs
k3s kubectl logs <pod-name> -n drone-store
```

### 502 Bad Gateway

1. Check pods are running: `k3s kubectl get pods -n drone-store`
2. Check service endpoints: `k3s kubectl get endpoints admin-frontend -n drone-store`
3. Test internal connectivity from Traefik pod

### Build Failures

1. Clear node_modules: `rm -rf node_modules && npm install`
2. Check for missing dependencies in package.json
3. Verify all import paths are correct

### Can't Access Externally

1. Verify DNS points to 122.199.30.183 with Cloudflare proxy enabled (orange cloud)
2. Check ingress: `k3s kubectl get ingress yirrasystems-main -n drone-store`
3. Wait 2-5 minutes for DNS propagation

---

## Maintenance

### Adding New Routes

1. Create the component in `src/components/` or `src/pages/`
2. Add route to `src/App.jsx` inside the `<Routes>` component
3. Wrap with `<ProtectedRoute>` for auth
4. Rebuild and deploy

### Updating Dependencies

```bash
# Check for updates
npm outdated

# Update packages
npm update

# Update specific package
npm install package-name@latest
```

### Monitoring

```bash
# Watch pod status
watch -n 2 'k3s kubectl get pods -n drone-store | grep admin'

# Stream logs
k3s kubectl logs -f deployment/admin-frontend -n drone-store

# Check resource usage
k3s kubectl top pods -n drone-store | grep admin
```

---

## Related Documentation

- **Main Plan:** `/home/james/yirra_systems_app/plan.md`
- **Complete Routing Guide:** `/home/james/yirra_systems_app/ROUTING_SSL_COMPLETE_GUIDE.md`
- **Adding Services Guide:** `/home/james/yirra_systems_app/HOW_TO_ADD_NEW_SERVICES.md`

---

## Success Metrics ✅

- Admin panel accessible at https://app.yirrasystems.com
- SSL certificate via Cloudflare (no warnings)
- Server header shows "cloudflare"
- All admin routes working
- Authentication via Clerk functional
- Zero downtime deployment
- Clean separation from customer frontend

---

**Last Updated:** 2025-10-08  
**Status:** ✅ Production Ready  
**Version:** v1

