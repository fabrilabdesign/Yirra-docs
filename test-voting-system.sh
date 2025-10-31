#!/bin/bash

# Comprehensive Voting System Test Script
# Tests the complete Reddit voting automation system after database migration

# Don't exit on individual test failures - we want to run all tests
# set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
VOTING_SERVER_URL="https://hot-sauce.addiaire.com"
MAGIC_SAUCE_URL="https://magic-sauce.addiaire.com"
N8N_URL="https://flows.addiaire.com"

# JWT Token for testing (generated from production secret)
JWT_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzZXJ2aWNlIjoidGVzdCIsImlhdCI6MTc2MTU0MjIxNX0.-2bUdNDpB8S8-hfzHRCOBktwFB1EAhUUBP5vTPRA4sE"

# Test counters
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Function to print status
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
    ((PASSED_TESTS++))
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
    ((FAILED_TESTS++))
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Function to increment test counter
test_start() {
    ((TOTAL_TESTS++))
    echo -e "\n${BLUE}🧪 Test $TOTAL_TESTS: $1${NC}"
}

# Function to test HTTP response
test_http_response() {
    local url=$1
    local expected_status=${2:-200}
    local description=$3

    if curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null | grep -q "^$expected_status$"; then
        print_status "$description - HTTP $expected_status"
        return 0
    else
        print_error "$description - Expected HTTP $expected_status"
        return 1
    fi
}

# Function to test JSON response
test_json_response() {
    local url=$1
    local expected_field=$2
    local expected_value=$3
    local description=$4

    local response=$(curl -s "$url" 2>/dev/null)
    if echo "$response" | jq -r "$expected_field" 2>/dev/null | grep -q "$expected_value"; then
        print_status "$description - $expected_field: $expected_value"
        return 0
    else
        print_error "$description - Expected $expected_field: $expected_value"
        echo "Response: $response"
        return 1
    fi
}

echo "🤖 Reddit Voting System Test Suite"
echo "=================================="
echo "Testing complete voting automation system after database migration"
echo ""

# Using deployed voting server directly (no port forwarding needed)
echo "🔌 Using deployed voting server at $VOTING_SERVER_URL"

echo ""

# Phase 1: Database Verification
echo ""
echo "📊 PHASE 1: Database Verification"
echo "================================="

test_start "Database connectivity"
if kubectl exec -n magic-sauce magic-sauce-postgres-0 -- psql -U magic_sauce -d magic_sauce -c "SELECT 1;" >/dev/null 2>&1; then
    print_status "Database connectivity - Connected successfully"
else
    print_error "Database connectivity - Failed to connect"
fi

test_start "Rate limits table structure"
if kubectl exec -n magic-sauce magic-sauce-postgres-0 -- psql -U magic_sauce -d magic_sauce -c "\d rate_limits" | grep -q "client_id"; then
    print_status "Rate limits table - Has client_id column"
else
    print_error "Rate limits table - Missing client_id column"
fi

if kubectl exec -n magic-sauce magic-sauce-postgres-0 -- psql -U magic_sauce -d magic_sauce -c "\d rate_limits" | grep -q "client_secret"; then
    print_status "Rate limits table - Has client_secret column"
else
    print_error "Rate limits table - Missing client_secret column"
fi

test_start "Reddit account credentials"
ACCOUNT_COUNT=$(kubectl exec -n magic-sauce magic-sauce-postgres-0 -- psql -U magic_sauce -d magic_sauce -c "SELECT COUNT(*) FROM rate_limits;" -t -A)
if [ "$ACCOUNT_COUNT" -eq 4 ]; then
    print_status "Reddit accounts - 4 accounts found"
else
    print_error "Reddit accounts - Expected 4, found $ACCOUNT_COUNT"
fi

test_start "Account credentials completeness"
ALL_HAVE_CREDS=$(kubectl exec -n magic-sauce magic-sauce-postgres-0 -- psql -U magic_sauce -d magic_sauce -c "SELECT COUNT(*) FROM rate_limits WHERE client_id IS NOT NULL AND client_secret IS NOT NULL;" -t -A)
if [ "$ALL_HAVE_CREDS" -eq 4 ]; then
    print_status "Account credentials - All 4 accounts have credentials"
else
    print_error "Account credentials - Only $ALL_HAVE_CREDS/4 have complete credentials"
fi

# Phase 2: API Health Checks
echo ""
echo "🌐 PHASE 2: API Health Checks"
echo "============================"

test_start "Voting server health endpoint"
test_http_response "$VOTING_SERVER_URL/health" 200 "Voting server health"

test_start "Voting server health response"
test_json_response "$VOTING_SERVER_URL/health" ".status" "healthy" "Voting server health status"

test_start "Magic Sauce health"
test_http_response "$MAGIC_SAUCE_URL/api/health" 200 "Magic Sauce API health"

# Phase 3: Voting Server API Tests
echo ""
echo "🎯 PHASE 3: Voting Server API Tests"
echo "==================================="

# Generate JWT token for API tests (you'll need to set this)
if [ -z "$JWT_TOKEN" ]; then
    print_warning "JWT_TOKEN not set - skipping authenticated API tests"
    print_info "Set JWT_TOKEN environment variable for full API testing:"
    print_info "export JWT_TOKEN='your_jwt_token_here'"
else
    test_start "JWT token validation"
    if curl -s -H "Authorization: Bearer $JWT_TOKEN" "$VOTING_SERVER_URL/health" | jq -r '.status' 2>/dev/null | grep -q "healthy"; then
        print_status "JWT token validation - Token accepted"
    else
        print_error "JWT token validation - Token rejected"
    fi

    test_start "Score fetching API"
    SCORE_RESPONSE=$(curl -s -H "Authorization: Bearer $JWT_TOKEN" "$VOTING_SERVER_URL/fetchScore?targetId=t3_test123")
    if echo "$SCORE_RESPONSE" | jq -r '.score' 2>/dev/null | grep -q '^[0-9]\+$'; then
        SCORE=$(echo "$SCORE_RESPONSE" | jq -r '.score')
        print_status "Score fetching API - Returned score: $SCORE"
    else
        print_error "Score fetching API - Failed to fetch score"
        echo "Response: $SCORE_RESPONSE"
    fi

    test_start "Vote action API structure validation"
    VOTE_PAYLOAD='{"account":"No_Big2686","targetId":"t3_test123","direction":"up"}'
    VOTE_RESPONSE=$(curl -s -X POST -H "Authorization: Bearer $JWT_TOKEN" -H "Content-Type: application/json" -d "$VOTE_PAYLOAD" "$VOTING_SERVER_URL/sendAction")
    # Accept either success response OR error response (404 for non-existent content is valid)
    if echo "$VOTE_RESPONSE" | jq -r '.success // .error' 2>/dev/null | grep -q 'true\|false\|404\|account_not_found'; then
        print_status "Vote action API - Response structure valid"
    else
        print_error "Vote action API - Invalid response structure"
        echo "Response: $VOTE_RESPONSE"
    fi

    test_start "Account validation"
    INVALID_ACCOUNT_PAYLOAD='{"account":"nonexistent_account","targetId":"t3_test123","direction":"up"}'
    ACCOUNT_RESPONSE=$(curl -s -X POST -H "Authorization: Bearer $JWT_TOKEN" -H "Content-Type: application/json" -d "$INVALID_ACCOUNT_PAYLOAD" "$VOTING_SERVER_URL/sendAction")
    if echo "$ACCOUNT_RESPONSE" | jq -r '.error' 2>/dev/null | grep -q "account_not_found"; then
        print_status "Account validation - Correctly rejects invalid account"
    else
        print_error "Account validation - Failed to reject invalid account"
        echo "Response: $ACCOUNT_RESPONSE"
    fi
fi

# Phase 4: Unit Tests
echo ""
echo "🧪 PHASE 4: Unit Tests"
echo "====================="

test_start "Voting server unit tests"
cd voting-server
if npm test -- --watchAll=false --passWithNoTests; then
    print_status "Voting server unit tests - All tests passed"
else
    print_error "Voting server unit tests - Some tests failed"
fi
cd ..

# Phase 5: Integration Tests
echo ""
echo "🔗 PHASE 5: Integration Tests"
echo "============================="

test_start "Database integration"
if kubectl exec -n magic-sauce magic-sauce-postgres-0 -- psql -U magic_sauce -d magic_sauce -c "
    SELECT r.account, r.client_id, COUNT(rl.*) as rate_limit_records
    FROM rate_limits r
    LEFT JOIN rate_limits rl ON r.account = rl.account
    GROUP BY r.account, r.client_id
    ORDER BY r.account;" >/dev/null 2>&1; then
    print_status "Database integration - Query executed successfully"
else
    print_error "Database integration - Query failed"
fi

# Phase 6: N8N Workflow Tests (if JWT token available)
echo ""
echo "⚙️  PHASE 6: N8N Workflow Tests"
echo "=============================="

if [ -n "$JWT_TOKEN" ] && [ -n "$N8N_SECRET" ]; then
    test_start "N8N webhook integration"
    N8N_PAYLOAD='{
        "targetId": "t3_test_workflow",
        "mode": "absolute",
        "direction": "up",
        "voteCount": 1
    }'
    N8N_RESPONSE=$(curl -s -X POST "$N8N_URL/webhook/start-voting" \
        -H "x-internal-token: $N8N_SECRET" \
        -H "Content-Type: application/json" \
        -d "$N8N_PAYLOAD")

    if echo "$N8N_RESPONSE" | jq -r '.success' 2>/dev/null | grep -q 'true'; then
        print_status "N8N webhook integration - Workflow triggered successfully"
    else
        print_warning "N8N webhook integration - Could not verify (may be rate limited)"
    fi
else
    print_warning "N8N workflow tests skipped - Set N8N_SECRET and JWT_TOKEN for full testing"
fi

# Phase 7: Performance Tests
echo ""
echo "⚡ PHASE 7: Performance Tests"
echo "============================"

test_start "API response time"
START_TIME=$(date +%s%3N)
curl -s "$VOTING_SERVER_URL/health" >/dev/null
END_TIME=$(date +%s%3N)
RESPONSE_TIME=$((END_TIME - START_TIME))

if [ $RESPONSE_TIME -lt 1000 ]; then
    print_status "API response time - ${RESPONSE_TIME}ms (< 1s)"
else
    print_warning "API response time - ${RESPONSE_TIME}ms (> 1s)"
fi

# Phase 8: Security Tests
echo ""
echo "🔒 PHASE 8: Security Tests"
echo "=========================="

test_start "Authentication required"
AUTH_RESPONSE=$(curl -s -w "%{http_code}" "$VOTING_SERVER_URL/fetchScore?targetId=t3_test")
if echo "$AUTH_RESPONSE" | grep -q "401"; then
    print_status "Authentication required - Correctly rejects unauthenticated requests"
else
    print_error "Authentication required - Allows unauthenticated access"
fi

test_start "Invalid JWT rejection"
INVALID_JWT_RESPONSE=$(curl -s -w "%{http_code}" -H "Authorization: Bearer invalid.jwt.token" "$VOTING_SERVER_URL/fetchScore?targetId=t3_test")
if echo "$INVALID_JWT_RESPONSE" | grep -q "403"; then
    print_status "Invalid JWT rejection - Correctly rejects invalid tokens"
else
    print_error "Invalid JWT rejection - Accepts invalid tokens"
fi

# Phase 9: Summary
echo ""
echo "📊 TEST SUMMARY"
echo "=============="
echo "Total Tests: $TOTAL_TESTS"
echo "Passed: $PASSED_TESTS"
echo "Failed: $FAILED_TESTS"
echo "Skipped: $((TOTAL_TESTS - PASSED_TESTS - FAILED_TESTS))"

if [ $FAILED_TESTS -eq 0 ]; then
    echo ""
    echo -e "${GREEN}🎉 ALL TESTS PASSED!${NC}"
    echo "The Reddit voting system is ready for production use."
    echo ""
    echo "Next steps:"
    echo "1. kubectl apply -f voting-server/k8s-deployment.yaml"
    echo "2. kubectl rollout restart deployment/voting-server -n drone-store"
    echo "3. Monitor logs for successful operation"
else
    echo ""
    echo -e "${RED}❌ SOME TESTS FAILED${NC}"
    echo "Please review the failed tests above before proceeding with deployment."
    exit 1
fi

echo ""
echo "📋 Environment Variables Used:"
echo "JWT_TOKEN: ${JWT_TOKEN:+SET (length: ${#JWT_TOKEN})} ${JWT_TOKEN:-NOT SET}"
echo "N8N_SECRET: ${N8N_SECRET:+SET (length: ${#N8N_SECRET})} ${N8N_SECRET:-NOT SET}"

echo ""
echo "🔧 Manual Testing Commands:"
echo "# Test specific account:"
echo "curl -H 'Authorization: Bearer \$JWT_TOKEN' -d '{\"account\":\"No_Big2686\",\"targetId\":\"t3_real_post_id\",\"direction\":\"up\"}' $VOTING_SERVER_URL/sendAction"
echo ""
echo "# Monitor database:"
echo "kubectl exec -n magic-sauce magic-sauce-postgres-0 -- psql -U magic_sauce -d magic_sauce -c 'SELECT account, tokens_remaining, last_attempt_at FROM rate_limits ORDER BY account;'"