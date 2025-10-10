# Yirra Systems Documentation Site

A Docusaurus-based documentation site for Yirra Systems, featuring Clerk authentication and styled to match the main brand.

## 🎨 Features

- **Brand-Matched Theme**: Custom CSS matching Yirra's cyan color scheme (`#00f2fe`, `#06b6d4`)
- **Glassmorphism Effects**: Modern UI with backdrop blur matching the main site
- **Clerk Authentication**: Integrated SSO with the main Yirra Systems website
- **Responsive Design**: Mobile-first approach with Inter and Space Grotesk fonts
- **TypeScript Support**: Fully typed components for better development experience
- **Kubernetes Ready**: Complete deployment manifests for K8s integration

## 🚀 Quick Start

### Local Development

```bash
# Install dependencies
npm install

# Start development server
npm start
```

The site will open at `http://localhost:3000`

### Build for Production

```bash
# Build static site
npm run build

# Serve built site locally
npm run serve
```

## 📦 Deployment

### Quick Deploy to Kubernetes

Use the automated deployment script:

```bash
./quick-docs.sh
```

This script will:
1. Build the Docusaurus site
2. Create a Docker image with the Clerk key
3. Push to the local registry
4. Deploy/update the Kubernetes deployment
5. Wait for rollout completion

### Manual Deployment

```bash
# Build Docker image
docker build -t localhost:5000/yirra-docs:latest .

# Push to registry
docker push localhost:5000/yirra-docs:latest

# Apply Kubernetes manifests
kubectl apply -f k8s-deployment.yaml
kubectl apply -f k8s-ingress.yaml
```

## 🔧 Configuration

### Environment Variables

- `CLERK_PUBLISHABLE_KEY`: Clerk authentication key (injected from K8s secret)

### Kubernetes Resources

- **Deployment**: `docs` in `drone-store` namespace
- **Service**: ClusterIP on port 4000
- **Ingress**: Routes `/docs` path to the docs service
- **Resources**: 
  - Requests: 100m CPU, 128Mi memory
  - Limits: 200m CPU, 256Mi memory

### Port Configuration

- **Container Port**: 4000 (different from frontend's 3000)
- **Service Port**: 4000
- **Ingress Path**: `/docs`

## 📝 Content Structure

```
docs/
├── intro.md              # Getting started
└── category/
    ├── build-guides/     # Build and assembly guides
    └── api/              # API documentation

blog/
└── (changelog entries)   # Version updates and release notes

src/
├── components/           # Custom React components
├── css/                  # Custom styling
└── theme/                # Swizzled Docusaurus components
```

## 🎯 Adding Documentation

### Create a New Doc Page

1. Create a Markdown file in `docs/` directory:

```markdown
---
sidebar_position: 1
---

# My New Doc

Content here...
```

2. The page will automatically appear in the sidebar

### Edit Sidebar Structure

Modify `sidebars.ts` to customize navigation:

```typescript
const sidebars = {
  tutorialSidebar: [
    'intro',
    {
      type: 'category',
      label: 'Guides',
      items: ['guide1', 'guide2'],
    },
  ],
};
```

## 🔐 Authentication

The site uses Clerk for authentication, sharing user sessions with the main Yirra Systems site:

- **Sign In Button**: Visible to unauthenticated users
- **User Button**: Shows user avatar and account options when signed in
- **Protected Content**: Can wrap pages with `<SignedIn>` component

Example protected page:

```tsx
import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react';

<SignedOut>
  <RedirectToSignIn />
</SignedOut>
<SignedIn>
  <YourProtectedContent />
</SignedIn>
```

## 🛠️ Customization

### Theme Colors

Edit `src/css/custom.css` to modify colors:

```css
:root {
  --ifm-color-primary: #06b6d4;  /* Yirra cyan */
  --yirra-cyan: #00f2fe;          /* Signature cyan */
}
```

### Site Configuration

Edit `docusaurus.config.ts` to change:
- Site title and tagline
- URL and base path
- Navbar items
- Footer links

## 📊 Monitoring

### Health Checks

The deployment includes health checks:

- **Liveness Probe**: `GET /healthz` on port 4000
- **Readiness Probe**: `GET /healthz` on port 4000

### View Logs

```bash
# View docs pod logs
kubectl logs -n drone-store -l app=docs

# Follow logs in real-time
kubectl logs -n drone-store -l app=docs -f
```

### Check Status

```bash
# Check deployment status
kubectl get deployment docs -n drone-store

# Check pod status
kubectl get pods -n drone-store -l app=docs

# Check service
kubectl get svc docs -n drone-store
```

## 🔗 Integration with Main Site

The docs site is integrated into the main Yirra Systems infrastructure:

- **Domain**: `yirrasystems.com/docs`
- **Namespace**: `drone-store` (shared with main site)
- **Registry**: `localhost:5000` (local K8s registry)
- **Ingress**: Nginx Ingress Controller
- **SSL**: Shared TLS certificate with main site

## 📚 Resources

- [Docusaurus Documentation](https://docusaurus.io/)
- [Clerk React Documentation](https://clerk.com/docs/quickstarts/react)
- [Main Site Repository](../drone_website_MAX/)

## 🤝 Contributing

1. Make changes to docs or styling
2. Test locally with `npm start`
3. Deploy using `./quick-docs.sh`
4. Verify at `https://yirrasystems.com/docs`

---

**Built with ❤️ for Yirra Systems**
