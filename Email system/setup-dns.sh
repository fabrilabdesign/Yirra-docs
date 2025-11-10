#!/bin/bash

# DNS Setup Script for Gaudie Email System
# Automatically configures all DNS records for gaudy.com.au

set -e

# Configuration
DOMAIN="gaudy.com.au"
ZONE_ID="aaa2beb6770437ac578363a443b38aa1"  # From Cloudflare API
API_TOKEN="t3IbWmHNoQ8HYUZcZeohIw7uQ35Qh-y9V0z0i3e6"
PUBLIC_IP="122.199.30.183"
DKIM_KEY="MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAsFAB5AYGE3Ab54IY0qRktrQQ3O/AV10373HsCg8rDcYkWaLQ57LTJ7e/2buSxPdpEeHGg1fgjqC4NX9XI91TYirfOWJaBqxNyNjdlVUQgxc1L86YNhxNdrXNJbrDETZ0afkQXS9Io+mKAwOp2d27b3ftcm98j1TutR3bKmm/YaXg3UcS00Dzy1iz7ZeuQZ585nX3556vcyk4Ml4ZEBVZ7L4BR1smFjzFbHe/pWIm7xy+c05o381W7INa98sbrYUdqoVswf3vuVFCG/RiFoIU/sIySbou26mE5jlWYstP7FD7+qa588H0YFKER4wPLd1mMndXXAdNJrULw2OUR0zmlwIDAQAB"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}✅${NC} $1"
}

error() {
    echo -e "${RED}❌${NC} $1"
}

warning() {
    echo -e "${YELLOW}⚠️${NC}  $1"
}

# Function to create DNS record
create_dns_record() {
    local type=$1
    local name=$2
    local content=$3
    local priority=${4:-""}
    local description=$5

    log "Creating $description ($type $name)"

    local data
    if [[ "$type" == "MX" ]]; then
        data="{\"type\":\"$type\",\"name\":\"$name\",\"content\":\"$content\",\"priority\":$priority,\"ttl\":300}"
    else
        data="{\"type\":\"$type\",\"name\":\"$name\",\"content\":\"$content\",\"ttl\":300}"
    fi

    local response
    response=$(curl -s -X POST "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records" \
        -H "Authorization: Bearer $API_TOKEN" \
        -H "Content-Type: application/json" \
        -d "$data")

    if echo "$response" | grep -q '"success":true'; then
        success "$description created successfully"
    else
        error "Failed to create $description"
        echo "Response: $response"
        return 1
    fi
}

# Function to check if record exists and handle appropriately
check_existing_record() {
    local type=$1
    local name=$2
    local expected_content=$3
    local expected_priority=${4:-""}
    local description=$5

    log "Checking for existing $description..."

    local response
    if [[ "$name" == "@" ]]; then
        response=$(curl -s "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records?type=$type&name=$DOMAIN" \
            -H "Authorization: Bearer $API_TOKEN")
    else
        response=$(curl -s "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records?type=$type&name=$name.$DOMAIN" \
            -H "Authorization: Bearer $API_TOKEN")
    fi

    local existing_content
    local existing_priority
    existing_content=$(echo "$response" | grep -o '"content":"[^"]*"' | head -1 | cut -d'"' -f4)
    existing_priority=$(echo "$response" | grep -o '"priority":[0-9]*' | head -1 | cut -d':' -f2)

    if [[ -n "$existing_content" ]]; then
        # Check if content matches expected
        if [[ "$type" == "MX" ]]; then
            if [[ "$existing_content" == "$expected_content" && "$existing_priority" == "$expected_priority" ]]; then
                success "$description already exists with correct values - skipping"
                return 1  # Skip creation
            fi
        else
            if [[ "$existing_content" == "$expected_content" ]]; then
                success "$description already exists with correct values - skipping"
                return 1  # Skip creation
            fi
        fi
        warning "Existing $description found with different values, updating..."
        return 0  # Continue to update
    else
        log "No existing $description found"
        return 0  # Continue to create
    fi
}

# Main setup function
main() {
    echo "🚀 Setting up DNS records for $DOMAIN Email System"
    echo "=================================================="
    echo

    log "Domain: $DOMAIN"
    log "Zone ID: $ZONE_ID"
    log "Public IP: $PUBLIC_IP"
    echo

    # 1. MX Record
    if check_existing_record "MX" "@" "mail.$DOMAIN" "10" "MX record"; then
        create_dns_record "MX" "@" "mail.$DOMAIN" "10" "MX record"
    fi

    # 2. A Record for mail subdomain
    if check_existing_record "A" "mail" "$PUBLIC_IP" "" "A record"; then
        create_dns_record "A" "mail" "$PUBLIC_IP" "" "A record for mail server"
    fi

    # 3. SPF Record
    if check_existing_record "TXT" "@" "v=spf1 mx a:mail.$DOMAIN -all" "" "SPF record"; then
        create_dns_record "TXT" "@" "v=spf1 mx a:mail.$DOMAIN -all" "" "SPF record"
    fi

    # 4. DKIM Record
    if check_existing_record "TXT" "s1._domainkey" "v=DKIM1; k=rsa; p=$DKIM_KEY" "" "DKIM record"; then
        create_dns_record "TXT" "s1._domainkey" "v=DKIM1; k=rsa; p=$DKIM_KEY" "" "DKIM record"
    fi

    # 5. DMARC Record
    if check_existing_record "TXT" "_dmarc" "v=DMARC1; p=none; rua=mailto:postmaster@$DOMAIN; ruf=mailto:postmaster@$DOMAIN; fo=1" "" "DMARC record"; then
        create_dns_record "TXT" "_dmarc" "v=DMARC1; p=none; rua=mailto:postmaster@$DOMAIN; ruf=mailto:postmaster@$DOMAIN; fo=1" "" "DMARC record"
    fi

    # 6. MTA-STS Record
    if check_existing_record "TXT" "_mta-sts" "v=STSv1; id=2024110801;" "" "MTA-STS record"; then
        create_dns_record "TXT" "_mta-sts" "v=STSv1; id=2024110801;" "" "MTA-STS record"
    fi

    # 7. TLS-RPT Record
    if check_existing_record "TXT" "_smtp._tls" "v=TLSRPTv1; rua=mailto:postmaster@$DOMAIN" "" "TLS-RPT record"; then
        create_dns_record "TXT" "_smtp._tls" "v=TLSRPTv1; rua=mailto:postmaster@$DOMAIN" "" "TLS-RPT record"
    fi

    echo
    echo "=================================================="
    success "DNS setup completed!"
    echo
    warning "⚠️  IMPORTANT: DNS propagation may take 24-48 hours"
    echo
    log "Next steps:"
    echo "1. Wait for DNS propagation (check with ./validate-dns.sh $DOMAIN)"
    echo "2. Set up PTR record at your hosting provider: $PUBLIC_IP → mail.$DOMAIN"
    echo "3. Deploy email system: ./deploy-email-system.sh"
    echo "4. Create secrets and test functionality"
    echo
    log "DNS Records Summary:"
    echo "• MX: @ → mail.$DOMAIN (priority 10)"
    echo "• A: mail → $PUBLIC_IP"
    echo "• SPF: @ TXT \"v=spf1 mx a:mail.$DOMAIN -all\""
    echo "• DKIM: s1._domainkey TXT (2048-bit RSA key)"
    echo "• DMARC: _dmarc TXT (monitoring mode)"
    echo "• MTA-STS: _mta-sts TXT (TLS enforcement)"
    echo "• TLS-RPT: _smtp._tls TXT (delivery reports)"
}

# Run main function
main "$@"
