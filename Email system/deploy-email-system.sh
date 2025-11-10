#!/bin/bash

# Email System Deployment Script for gaudy.com.au
# This script deploys the complete email system to Kubernetes

set -e

DOMAIN="gaudy.com.au"
NAMESPACE="email-system"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
K8S_DIR="$SCRIPT_DIR/k8s"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" >&2
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."

    # Check if kubectl is available
    if ! command -v kubectl &> /dev/null; then
        error "kubectl not found. Please install kubectl."
        exit 1
    fi

    # Check if namespace exists
    if ! kubectl get namespace "$NAMESPACE" &> /dev/null; then
        log "Creating namespace $NAMESPACE..."
        kubectl create namespace "$NAMESPACE"
    fi

    # Check if k8s directory exists
    if [ ! -d "$K8S_DIR" ]; then
        error "K8s directory not found: $K8S_DIR"
        exit 1
    fi

    success "Prerequisites check passed"
}

# Deploy PVC first
deploy_pvc() {
    log "Deploying PersistentVolumeClaim..."
    kubectl apply -f "$K8S_DIR/pvc.yaml"
    success "PVC deployed"
}

# Deploy configurations
deploy_configs() {
    log "Deploying configuration maps..."

    kubectl apply -f "$K8S_DIR/postfix-config.yaml"
    kubectl apply -f "$K8S_DIR/postfix-maps.yaml"
    kubectl apply -f "$K8S_DIR/dovecot-config.yaml"

    success "Configuration maps deployed"
}

# Deploy services
deploy_services() {
    log "Deploying email services..."

    # Deploy Rspamd
    kubectl apply -f "$K8S_DIR/rspamd-config.yaml"

    # Deploy ClamAV
    kubectl apply -f "$K8S_DIR/clamav-config.yaml"

    # Deploy MTA-STS
    kubectl apply -f "$K8S_DIR/mta-sts-site.yaml"

    # Deploy monitoring
    kubectl apply -f "$K8S_DIR/monitoring.yaml"

    success "Services deployed"
}

# Deploy main mail server
deploy_mailserver() {
    log "Deploying main mail server (Postfix + Dovecot)..."

    # Wait for PVC to be bound
    log "Waiting for PVC to be bound..."
    kubectl wait --for=condition=bound pvc/vmail-pvc -n "$NAMESPACE" --timeout=300s

    # Deploy the main daemonset
    kubectl apply -f "$K8S_DIR/postfix-dovecot-daemonset.yaml"

    success "Mail server deployed"
}

# Deploy backups
deploy_backups() {
    log "Deploying backup system..."
    kubectl apply -f "$K8S_DIR/backup-cronjob.yaml"
    success "Backup system deployed"
}

# Wait for deployments to be ready
wait_for_deployments() {
    log "Waiting for deployments to be ready..."

    # Wait for daemonset
    kubectl rollout status daemonset/mailedge -n "$NAMESPACE" --timeout=300s

    # Wait for deployments
    kubectl rollout status deployment/rspamd -n "$NAMESPACE" --timeout=300s
    kubectl rollout status deployment/clamav -n "$NAMESPACE" --timeout=300s
    kubectl rollout status deployment/mta-sts -n "$NAMESPACE" --timeout=300s

    success "All deployments are ready"
}

# Create secrets (placeholder - needs manual configuration)
create_secrets_placeholder() {
    warning "⚠️  IMPORTANT: You need to create the following secrets manually:"
    echo ""
    echo "1. TLS Certificate Secret:"
    echo "   kubectl create secret tls mail-tls -n $NAMESPACE --cert=tls.crt --key=tls.key"
    echo ""
    echo "2. DH Parameters Secret:"
    echo "   kubectl create secret generic tls-dhparams -n $NAMESPACE --from-file=dhparams.pem"
    echo ""
    echo "3. Dovecot Auth Secret:"
    echo "   kubectl create secret generic dovecot-auth -n $NAMESPACE --from-file=users.passwd"
    echo ""
    echo "4. DKIM Key Secret:"
    echo "   kubectl create secret generic rspamd-dkim -n $NAMESPACE --from-file=s1.key"
    echo ""
}

# Main deployment function
main() {
    echo "🚀 Email System Deployment for $DOMAIN"
    echo "========================================"
    echo ""

    check_prerequisites
    deploy_pvc
    deploy_configs
    deploy_services
    deploy_mailserver
    deploy_backups
    wait_for_deployments

    echo ""
    echo "========================================"
    success "Email system deployment completed!"
    echo ""
    create_secrets_placeholder

    echo ""
    log "Next steps:"
    echo "1. Create the required secrets (see above)"
    echo "2. Set up DNS records (see DNS_Configuration_Guide.md)"
    echo "3. Generate DKIM keys and add to DNS"
    echo "4. Test email functionality"
    echo "5. Run validation: ./validate-dns.sh $DOMAIN"
}

# Run main function
main "$@"
