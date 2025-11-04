#!/bin/bash

# Magic Sauce App - Connectivity and Functionality Tests
# Tests the deployed application at https://magic-sauce.addiaire.com/

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
APP_URL="https://magic-sauce.addiaire.com"
TEST_RESULTS_DIR="/home/james/yirra_systems_app/connectivity-test-results"
TIMEOUT=30
RETRIES=3

# Test counters
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Create test results directory
mkdir -p "$TEST_RESULTS_DIR"

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1" | tee -a "$TEST_RESULTS_DIR/test.log"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" | tee -a "$TEST_RESULTS_DIR/test.log"
    ((PASSED_TESTS++))
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$TEST_RESULTS_DIR/test.log"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$TEST_RESULTS_DIR/test.log"
    ((FAILED_TESTS++))
}

log_header() {
    echo -e "${PURPLE}========================================${NC}" | tee -a "$TEST_RESULTS_DIR/test.log"
    echo -e "${PURPLE}$1${NC}" | tee -a "$TEST_RESULTS_DIR/test.log"
    echo -e "${PURPLE}========================================${NC}" | tee -a "$TEST_RESULTS_DIR/test.log"
}

# Function to make HTTP requests with retry logic
make_request() {
    local method=$1
    local url=$2
    local expected_status=${3:-200}
    local test_name=$4
    local headers=${5:-""}

    ((TOTAL_TESTS++))

    log_info "Testing $test_name..."

    local attempt=1
    local response
    local status_code

    while [ $attempt -le $RETRIES ]; do
        log_info "  Attempt $attempt/$RETRIES"

        if [ "$method" = "GET" ]; then
            status_code=$(curl -s -o /dev/null -w "%{http_code}" --max-time $TIMEOUT $headers "$url" 2>/dev/null)
            response=$(curl -s --max-time $TIMEOUT $headers "$url" 2>/dev/null)
        elif [ "$method" = "POST" ]; then
            status_code=$(curl -s -o /dev/null -w "%{http_code}" --max-time $TIMEOUT -X POST $headers "$url" 2>/dev/null)
            response=$(curl -s --max-time $TIMEOUT -X POST $headers "$url" 2>/dev/null)
        elif [ "$method" = "OPTIONS" ]; then
            status_code=$(curl -s -o /dev/null -w "%{http_code}" --max-time $TIMEOUT -X OPTIONS $headers "$url" 2>/dev/null)
            response=$(curl -s --max-time $TIMEOUT -X OPTIONS $headers "$url" 2>/dev/null)
        fi

        if [ "$status_code" = "$expected_status" ]; then
            log_success "$test_name passed (Status: $status_code)"
            echo "$response" > "$TEST_RESULTS_DIR/${test_name// /_}.response"
            return 0
        else
            log_warning "  Attempt $attempt failed (Expected: $expected_status, Got: $status_code)"
            if [ $attempt -eq $RETRIES ]; then
                log_error "$test_name failed after $RETRIES attempts"
                echo "$response" > "$TEST_RESULTS_DIR/${test_name// /_}.error"
                return 1
            fi
        fi

        ((attempt++))
        sleep 2
    done
}

# Function to validate JSON response
validate_json_response() {
    local test_name=$1
    local response_file=$2
    local expected_fields=$3

    if [ ! -f "$response_file" ]; then
        log_error "$test_name JSON validation failed - no response file"
        return 1
    fi

    local response_body=$(cat "$response_file" | sed 's/HTTPSTATUS.*//')

    # Check if it's valid JSON
    if ! echo "$response_body" | jq . >/dev/null 2>&1; then
        log_error "$test_name JSON validation failed - invalid JSON"
        return 1
    fi

    # Check for expected fields
    for field in $expected_fields; do
        if ! echo "$response_body" | jq -e ".$field" >/dev/null 2>&1; then
            log_error "$test_name JSON validation failed - missing field: $field"
            return 1
        fi
    done

    log_success "$test_name JSON validation passed"
    return 0
}

# Basic Connectivity Tests
test_basic_connectivity() {
    log_header "BASIC CONNECTIVITY TESTS"

    # Test basic HTTP connectivity
    make_request "GET" "$APP_URL" 200 "Basic HTTP connectivity"

    # Test HTTPS redirect (if applicable)
    # make_request "GET" "http://magic-sauce.addiaire.com" 301 "HTTP to HTTPS redirect"
}

# Health Endpoint Tests
test_health_endpoints() {
    log_header "HEALTH ENDPOINT TESTS"

    # Test /health endpoint
    if make_request "GET" "$APP_URL/health" 200 "Health check endpoint"; then
        validate_json_response "Health check" "$TEST_RESULTS_DIR/Health_check_endpoint.response" "ok timestamp"
    fi

    # Test /ready endpoint
    if make_request "GET" "$APP_URL/ready" 200 "Readiness check endpoint"; then
        validate_json_response "Readiness check" "$TEST_RESULTS_DIR/Readiness_check_endpoint.response" "ok services timestamp"
    fi

    # Test /test endpoint
    make_request "GET" "$APP_URL/test" 200 "Test endpoint"
}

# Authentication and Status Tests
test_auth_status() {
    log_header "AUTHENTICATION & STATUS TESTS"

    # Test auth status endpoint
    if make_request "GET" "$APP_URL/auth/status" 200 "Authentication status"; then
        validate_json_response "Auth status" "$TEST_RESULTS_DIR/Authentication_status.response" "connected"
    fi

    # Test quota endpoint
    if make_request "GET" "$APP_URL/quota" 200 "Rate limit quota check"; then
        validate_json_response "Quota check" "$TEST_RESULTS_DIR/Rate_limit_quota_check.response" "remaining"
    fi
}

# Users API Tests
test_users_api() {
    log_header "USERS API TESTS"

    # Test GET users (should return array)
    if make_request "GET" "$APP_URL/users" 200 "Get users list"; then
        local response_file="$TEST_RESULTS_DIR/Get_users_list.response"
        local response_body=$(cat "$response_file" | sed 's/HTTPSTATUS.*//')
        if echo "$response_body" | jq -e '.[]' >/dev/null 2>&1; then
            log_success "Get users list returned valid array"
        else
            log_error "Get users list did not return array"
        fi
    fi

    # Test POST user creation (will likely fail without auth, but tests endpoint existence)
    make_request "POST" "$APP_URL/users" 400 "Create user validation"

    # Test invalid user ID
    make_request "GET" "$APP_URL/users/invalid-id" 404 "Get invalid user"
}

# CORS Tests
test_cors() {
    log_header "CORS TESTS"

    # Test OPTIONS request for CORS preflight
    make_request "OPTIONS" "$APP_URL/users" 204 "CORS preflight check" "-H 'Origin: https://example.com' -H 'Access-Control-Request-Method: GET'"

    # Test CORS headers on actual request
    make_request "GET" "$APP_URL/health" 200 "CORS headers check" "-H 'Origin: https://example.com'"
}

# Reddit Automation API Tests
test_reddit_automation_api() {
    log_header "REDDIT AUTOMATION API TESTS"

    # Test voting endpoints (will likely require auth)
    make_request "POST" "$APP_URL/ms/v1/action/vote" 401 "Vote action endpoint"

    # Test automation endpoints
    make_request "POST" "$APP_URL/ms/v1/automation/start" 401 "Start automation endpoint"
    make_request "POST" "$APP_URL/ms/v1/automation/stop" 401 "Stop automation endpoint"
    make_request "GET" "$APP_URL/ms/v1/automation/status/test123" 401 "Automation status endpoint"

    # Test keywords management
    make_request "GET" "$APP_URL/ms/v1/lists/keywords?action=list" 200 "Keywords list endpoint"
    make_request "POST" "$APP_URL/ms/v1/lists/keywords" 401 "Add keyword endpoint"

    # Test content tracking
    make_request "POST" "$APP_URL/ms/v1/track/content" 400 "Content tracking endpoint"

    # Test personas endpoint
    make_request "GET" "$APP_URL/ms/v1/personas" 401 "Personas list endpoint"

    # Test moderation endpoint
    make_request "GET" "$APP_URL/ms/v1/moderation/queue" 401 "Moderation queue endpoint"
}

# Frontend Tests
test_frontend() {
    log_header "FRONTEND TESTS"

    # Test main app page loads
    if make_request "GET" "$APP_URL/" 200 "Main app page"; then
        local response_file="$TEST_RESULTS_DIR/Main_app_page.response"
        local content_type=$(grep -i "content-type" "$response_file" | head -1 || echo "")
        if echo "$content_type" | grep -i "text/html" >/dev/null; then
            log_success "Main app page returns HTML content"
        else
            log_warning "Main app page may not be returning HTML content"
        fi
    fi

    # Test static assets (if any are accessible)
    make_request "GET" "$APP_URL/favicon.ico" 200 "Favicon loading"
    make_request "GET" "$APP_URL/manifest.json" 200 "Web app manifest"
}

# Error Handling Tests
test_error_handling() {
    log_header "ERROR HANDLING TESTS"

    # Test 404 for non-existent endpoints
    make_request "GET" "$APP_URL/nonexistent-endpoint" 404 "404 error handling"

    # Test invalid methods
    make_request "PUT" "$APP_URL/health" 405 "405 method not allowed"

    # Test malformed requests
    make_request "POST" "$APP_URL/users" 400 "Malformed POST request" "-H 'Content-Type: application/json' -d 'invalid json'"
}

# Performance Tests
test_performance() {
    log_header "PERFORMANCE TESTS"

    log_info "Testing response times..."

    # Test response time for health endpoint
    local start_time=$(date +%s%3N)
    make_request "GET" "$APP_URL/health" 200 "Health endpoint performance"
    local end_time=$(date +%s%3N)
    local response_time=$((end_time - start_time))

    if [ $response_time -lt 1000 ]; then
        log_success "Health endpoint responded in ${response_time}ms (acceptable)"
    elif [ $response_time -lt 3000 ]; then
        log_warning "Health endpoint responded in ${response_time}ms (slow)"
    else
        log_error "Health endpoint responded in ${response_time}ms (too slow)"
    fi
}

# Security Tests
test_security() {
    log_header "SECURITY TESTS"

    # Test for security headers
    if make_request "GET" "$APP_URL/health" 200 "Security headers check"; then
        local response_file="$TEST_RESULTS_DIR/Security_headers_check.response"

        # Check for important security headers
        local security_headers=("x-frame-options" "x-content-type-options" "referrer-policy")

        for header in "${security_headers[@]}"; do
            if grep -i "$header" "$response_file" >/dev/null 2>&1; then
                log_success "Security header present: $header"
            else
                log_warning "Security header missing: $header"
            fi
        done
    fi
}

# Function to generate test report
generate_report() {
    log_header "FINAL TEST REPORT"

    echo "" | tee -a "$TEST_RESULTS_DIR/test.log"
    echo "Connectivity and Functionality Test Results:" | tee -a "$TEST_RESULTS_DIR/test.log"
    echo "==========================================" | tee -a "$TEST_RESULTS_DIR/test.log"
    echo "Total Tests Run: $TOTAL_TESTS" | tee -a "$TEST_RESULTS_DIR/test.log"
    echo "✅ Passed: $PASSED_TESTS" | tee -a "$TEST_RESULTS_DIR/test.log"
    echo "❌ Failed: $FAILED_TESTS" | tee -a "$TEST_RESULTS_DIR/test.log"

    if [ $TOTAL_TESTS -gt 0 ]; then
        local success_rate=$((PASSED_TESTS * 100 / TOTAL_TESTS))
        echo "Success Rate: ${success_rate}%" | tee -a "$TEST_RESULTS_DIR/test.log"

        if [ $success_rate -ge 90 ]; then
            log_success "🎉 EXCELLENT: App connectivity and functionality is working well!"
        elif [ $success_rate -ge 75 ]; then
            log_warning "⚠️  GOOD: App is mostly functional but has some issues"
        else
            log_error "❌ POOR: App has significant connectivity or functionality issues"
        fi
    fi

    echo "" | tee -a "$TEST_RESULTS_DIR/test.log"
    echo "Test Results Location: $TEST_RESULTS_DIR" | tee -a "$TEST_RESULTS_DIR/test.log"
    echo "Detailed Log: $TEST_RESULTS_DIR/test.log" | tee -a "$TEST_RESULTS_DIR/test.log"

    # Create summary file
    cat > "$TEST_RESULTS_DIR/summary.json" << EOF
{
  "timestamp": "$(date -Iseconds)",
  "app_url": "$APP_URL",
  "total_tests": $TOTAL_TESTS,
  "passed_tests": $PASSED_TESTS,
  "failed_tests": $FAILED_TESTS,
  "success_rate": $((TOTAL_TESTS > 0 ? PASSED_TESTS * 100 / TOTAL_TESTS : 0))
}
EOF

    log_info "Summary saved to: $TEST_RESULTS_DIR/summary.json"
}

# Function to show usage
show_usage() {
    echo "Magic Sauce App - Connectivity and Functionality Tests"
    echo ""
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  --url URL           Test a different URL (default: $APP_URL)"
    echo "  --timeout SEC       Request timeout in seconds (default: $TIMEOUT)"
    echo "  --retries NUM       Number of retries per test (default: $RETRIES)"
    echo "  --quick             Run only essential connectivity tests"
    echo "  --performance-only  Run only performance tests"
    echo "  --security-only     Run only security tests"
    echo "  --help, -h          Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0                            # Run all tests"
    echo "  $0 --quick                    # Run essential tests only"
    echo "  $0 --url https://staging.example.com  # Test different environment"
    echo ""
    echo "Results are saved to: $TEST_RESULTS_DIR"
}

# Main execution
main() {
    local test_mode="full"

    # Parse command line arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            --url)
                APP_URL="$2"
                shift 2
                ;;
            --timeout)
                TIMEOUT="$2"
                shift 2
                ;;
            --retries)
                RETRIES="$2"
                shift 2
                ;;
            --quick)
                test_mode="quick"
                shift
                ;;
            --performance-only)
                test_mode="performance"
                shift
                ;;
            --security-only)
                test_mode="security"
                shift
                ;;
            --help|-h)
                show_usage
                exit 0
                ;;
            *)
                log_error "Unknown option: $1"
                show_usage
                exit 1
                ;;
        esac
    done

    log_header "MAGIC SAUCE APP - CONNECTIVITY & FUNCTIONALITY TESTS"
    log_info "Target URL: $APP_URL"
    log_info "Test Results Directory: $TEST_RESULTS_DIR"
    echo ""

    # Check if curl is available
    if ! command -v curl &> /dev/null; then
        log_error "curl is not installed or not in PATH"
        exit 1
    fi

    # Check if jq is available for JSON validation
    if ! command -v jq &> /dev/null; then
        log_error "jq is not installed or not in PATH (required for JSON validation)"
        exit 1
    fi

    # Run tests based on mode
    case $test_mode in
        "quick")
            log_info "Running quick connectivity tests..."
            test_basic_connectivity
            test_health_endpoints
            test_auth_status
            ;;
        "performance")
            test_performance
            ;;
        "security")
            test_security
            ;;
        *)
            # Full test suite
            test_basic_connectivity
            test_health_endpoints
            test_auth_status
            test_users_api
            test_cors
            test_reddit_automation_api
            test_frontend
            test_error_handling
            test_performance
            test_security
            ;;
    esac

    # Generate final report
    generate_report
}

# Run main function with all arguments
main "$@"
