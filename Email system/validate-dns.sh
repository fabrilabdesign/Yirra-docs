#!/bin/bash

# DNS Validation Script for Gaudie Email System
# Usage: ./validate-dns.sh gaudy.com.au

DOMAIN=${1:-gaudy.com.au}
MAIL_HOST="mail.${DOMAIN}"

echo "🔍 DNS Validation for ${DOMAIN}"
echo "========================================"
echo

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

check_record() {
    local type=$1
    local name=$2
    local expected=$3
    local description=$4

    echo -n "Checking ${description} (${type} ${name})... "

    local result
    result=$(dig +short ${type} ${name} 2>/dev/null)

    if [[ -z "$result" ]]; then
        echo -e "${RED}❌ MISSING${NC}"
        return 1
    elif [[ "$expected" == "EXISTS" ]]; then
        echo -e "${GREEN}✅ FOUND${NC}"
        echo "    ${result}"
        return 0
    elif [[ "$result" == *"$expected"* ]]; then
        echo -e "${GREEN}✅ OK${NC}"
        echo "    ${result}"
        return 0
    else
        echo -e "${YELLOW}⚠️  MISMATCH${NC}"
        echo "    Expected: ${expected}"
        echo "    Found: ${result}"
        return 1
    fi
}

echo "📧 MX Records:"
check_record MX "${DOMAIN}" "mail.${DOMAIN}" "MX Record"

echo
echo "🌐 A Records:"
check_record A "${MAIL_HOST}" "EXISTS" "Mail A Record"

echo
echo "🛡️ SPF Records:"
check_record TXT "${DOMAIN}" "v=spf1" "SPF Record"

echo
echo "🔐 DKIM Records:"
check_record TXT "s1._domainkey.${DOMAIN}" "v=DKIM1" "DKIM Record"

echo
echo "📊 DMARC Records:"
check_record TXT "_dmarc.${DOMAIN}" "v=DMARC1" "DMARC Record"

echo
echo "🔒 MTA-STS Records:"
check_record TXT "_mta-sts.${DOMAIN}" "v=STSv1" "MTA-STS Record"

echo
echo "📋 TLS-RPT Records:"
check_record TXT "_smtp._tls.${DOMAIN}" "v=TLSRPTv1" "TLS-RPT Record"

echo
echo "🔄 PTR Records (Reverse DNS):"
echo -n "Checking PTR record for mail server IP... "

# Try to get the IP and check PTR
MAIL_IP=$(dig +short A ${MAIL_HOST} 2>/dev/null | head -1)
if [[ -n "$MAIL_IP" ]]; then
    PTR_RESULT=$(dig +short -x ${MAIL_IP} 2>/dev/null)
    if [[ "$PTR_RESULT" == *"${MAIL_HOST}"* ]]; then
        echo -e "${GREEN}✅ OK${NC}"
        echo "    ${MAIL_IP} → ${PTR_RESULT}"
    else
        echo -e "${RED}❌ MISMATCH${NC}"
        echo "    IP: ${MAIL_IP}"
        echo "    PTR: ${PTR_RESULT:-Not found}"
        echo "    Expected: ${MAIL_HOST}"
    fi
else
    echo -e "${RED}❌ CANNOT CHECK${NC} (no A record found)"
fi

echo
echo "========================================"
echo "💡 Next Steps:"
echo "• Use online tools: MX Toolbox, Mail-Tester.com"
echo "• Send test emails to verify delivery"
echo "• Monitor DMARC reports for any issues"
echo "• Allow 24-48 hours for DNS propagation"
echo
echo "🔗 Useful Links:"
echo "• MX Toolbox: https://mxtoolbox.com/SuperTool.aspx"
echo "• Mail Tester: https://www.mail-tester.com/"
echo "• DMARC Analyzer: https://www.dmarcanalyzer.com/"
