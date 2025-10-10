# New Service Template

This directory contains templates for adding a new web service to the K3s cluster with automatic HTTPS via Cloudflare.

## Quick Start

1. Copy files from this directory
2. Replace `MYAPP` with your app name (lowercase, no spaces)
3. Replace `8080` with your app's port
4. Apply in order: deployment → ingressroute → update network policy → DNS
5. Wait 2-5 minutes for DNS propagation
6. Access at `https://MYAPP.yirrasystems.com`

## Files Included

- `deployment.yaml` - Kubernetes Deployment and Service
- `ingressroute.yaml` - Traefik IngressRoute for routing
- `netpol-update.txt` - Port to add to network policy

## Detailed Instructions

See `/home/james/yirra_systems_app/ROUTING_SSL_COMPLETE_GUIDE.md` section "Adding a New Service/App"

