#!/bin/bash

# External Connectivity Test Script for Gaudie Email System
# Run this from OUTSIDE your home network (phone data, different WiFi, etc.)

DOMAIN="gaudy.com.au"
SERVER_IP="122.199.30.183"

echo "🔍 Gaudie Email System - External Connectivity Test"
echo "=================================================="
echo "Domain: $DOMAIN"
echo "Server IP: $SERVER_IP"
echo "Test from: OUTSIDE your home network"
echo ""

test_port() {
    local port=$1
    local service=$2
    local expected=$3

    echo -n "Testing $service (port $port)... "
    local result
    result=$(timeout 5 bash -c "printf '$expected' | nc mail.$DOMAIN $port 2>/dev/null" 2>/dev/null)

    if [[ -n "$result" ]]; then
        echo "✅ SUCCESS"
        echo "    Response: $(echo "$result" | head -1)"
    else
        echo "❌ FAILED - No response"
    fi
    echo ""
}

echo "📧 SMTP Tests:"
test_port 25 "SMTP" "EHLO test.com\r\nQUIT\r\n"
test_port 587 "SMTP Submission" "EHLO test.com\r\nQUIT\r\n"
test_port 465 "SMTPS" "EHLO test.com\r\nQUIT\r\n"

echo "📬 IMAP Tests:"
test_port 143 "IMAP" "a001 LOGIN test test\r\n"

echo "🌐 Basic Connectivity:"
echo -n "Testing ping to mail.$DOMAIN... "
if ping -c 2 mail.$DOMAIN >/dev/null 2>&1; then
    echo "✅ SUCCESS"
else
    echo "❌ FAILED"
fi

echo ""
echo "📋 Expected Results:"
echo "• All SMTP ports should respond with: 220 mail.gaudy.com.au ESMTP Postfix"
echo "• IMAP should respond with: * OK Dovecot ready."
echo "• Ping should work"
echo ""
echo "🔧 If tests fail:"
echo "1. Double-check UDM Pro port forwarding rules"
echo "2. Verify firewall rules allow the traffic"
echo "3. Test from a completely different network (not VPN)"
echo "4. Check UDM logs for blocked connections"
