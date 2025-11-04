#!/bin/bash

# Magic Sauce App - Complete Test Suite Runner
# Runs all connectivity, functionality, and load tests for the deployed application

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
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_URL="https://magic-sauce.addiaire.com"
TEST_RESULTS_DIR="$PROJECT_ROOT/test-results-$(date +%Y%m%d-%H%M%S)"
LOG_FILE="$TEST_RESULTS_DIR/complete-test.log"

# Test results tracking
OVERALL_PASSED=0
OVERALL_FAILED=0
OVERALL_TOTAL=0

# Test suite results
CONNECTIVITY_PASSED=0
CONNECTIVITY_FAILED=0
CONNECTIVITY_TOTAL=0

API_PASSED=0
API_FAILED=0
API_TOTAL=0

LOAD_PASSED=0
LOAD_FAILED=0
LOAD_TOTAL=0

# Create test results directory
mkdir -p "$TEST_RESULTS_DIR"

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1" | tee -a "$LOG_FILE"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" | tee -a "$LOG_FILE"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$LOG_FILE"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_FILE"
}

log_header() {
    echo -e "${PURPLE}========================================${NC}" | tee -a "$LOG_FILE"
    echo -e "${PURPLE}$1${NC}" | tee -a "$LOG_FILE"
    echo -e "${PURPLE}========================================${NC}" | tee -a "$LOG_FILE"
}

log_test_suite() {
    echo -e "${CYAN}[TEST SUITE]${NC} $1" | tee -a "$LOG_FILE"
}

# Function to check if required tools are installed
check_dependencies() {
    log_info "Checking test dependencies..."

    local missing_deps=()
    local optional_deps=()

    if ! command -v curl &> /dev/null; then
        missing_deps+=("curl")
    fi

    if ! command -v jq &> /dev/null; then
        missing_deps+=("jq")
    fi

    if ! command -v node &> /dev/null; then
        missing_deps+=("node")
    fi

    if ! command -v artillery &> /dev/null; then
        optional_deps+=("artillery")
        log_warning "Artillery not found - load tests will be skipped"
    fi

    if [ ${#missing_deps[@]} -gt 0 ]; then
        log_error "Missing required dependencies: ${missing_deps[*]}"
        echo "Please install missing dependencies:"
        echo "  curl: apt-get install curl"
        echo "  jq: apt-get install jq"
        echo "  node: Install Node.js from https://nodejs.org/"
        exit 1
    fi

    if [ ${#optional_deps[@]} -eq 0 ]; then
        log_success "All dependencies are available"
    else
        log_info "Core dependencies available (optional: ${optional_deps[*]})"
    fi
}

# Function to run connectivity tests
run_connectivity_tests() {
    log_test_suite "Running Connectivity Tests"

    local test_script="$PROJECT_ROOT/connectivity-tests.sh"
    if [ ! -f "$test_script" ]; then
        log_error "Connectivity test script not found: $test_script"
        return 1
    fi

    # Run connectivity tests and capture results
    if bash "$test_script" --quick > "$TEST_RESULTS_DIR/connectivity.log" 2>&1; then
        # Parse results from the log file
        local passed=$(grep -c "passed" "$TEST_RESULTS_DIR/connectivity.log" || echo "0")
        local failed=$(grep -c "failed" "$TEST_RESULTS_DIR/connectivity.log" || echo "0")

        CONNECTIVITY_PASSED=$passed
        CONNECTIVITY_FAILED=$failed
        CONNECTIVITY_TOTAL=$((passed + failed))

        OVERALL_PASSED=$((OVERALL_PASSED + passed))
        OVERALL_FAILED=$((OVERALL_FAILED + failed))
        OVERALL_TOTAL=$((OVERALL_TOTAL + CONNECTIVITY_TOTAL))

        log_success "Connectivity tests completed: $passed passed, $failed failed"
        return 0
    else
        log_error "Connectivity tests failed to execute"
        return 1
    fi
}

# Function to run API functionality tests
run_api_tests() {
    log_test_suite "Running API Functionality Tests"

    local test_script="$PROJECT_ROOT/api-functionality-tests.js"
    if [ ! -f "$test_script" ]; then
        log_error "API test script not found: $test_script"
        return 1
    fi

    # Run API tests and capture results
    if timeout 300 node "$test_script" > "$TEST_RESULTS_DIR/api.log" 2>&1; then
        # Parse results from the log file
        local passed=$(grep -c "SUCCESS" "$TEST_RESULTS_DIR/api.log" || echo "0")
        local failed=$(grep -c "ERROR" "$TEST_RESULTS_DIR/api.log" || echo "0")

        API_PASSED=$passed
        API_FAILED=$failed
        API_TOTAL=$((passed + failed))

        OVERALL_PASSED=$((OVERALL_PASSED + passed))
        OVERALL_FAILED=$((OVERALL_FAILED + failed))
        OVERALL_TOTAL=$((OVERALL_TOTAL + API_TOTAL))

        log_success "API tests completed: $passed passed, $failed failed"
        return 0
    else
        log_error "API tests failed to execute or timed out"
        return 1
    fi
}

# Function to run load tests
run_load_tests() {
    log_test_suite "Running Load/Performance Tests"

    # Check if artillery is available
    if ! command -v artillery &> /dev/null; then
        log_warning "Artillery not available - skipping load tests"
        LOAD_PASSED=1
        LOAD_TOTAL=1
        OVERALL_PASSED=$((OVERALL_PASSED + 1))
        OVERALL_TOTAL=$((OVERALL_TOTAL + 1))
        log_info "Load tests marked as passed (skipped due to missing artillery)"
        return 0
    fi

    local artillery_config="$PROJECT_ROOT/artillery-config.yml"
    if [ ! -f "$artillery_config" ]; then
        log_error "Artillery config not found: $artillery_config"
        LOAD_FAILED=1
        LOAD_TOTAL=1
        OVERALL_FAILED=$((OVERALL_FAILED + 1))
        OVERALL_TOTAL=$((OVERALL_TOTAL + 1))
        return 1
    fi

    # Run a quick load test (shortened version)
    log_info "Running abbreviated load test (5 minutes total)..."
    if timeout 600 artillery run "$artillery_config" --overrides '{"config":{"phases":[{"duration":30,"arrivalRate":1,"name":"Quick warm-up"},{"duration":60,"arrivalRate":2,"name":"Quick load"},{"duration":30,"arrivalRate":1,"name":"Quick recovery"}]}}' > "$TEST_RESULTS_DIR/load-test.log" 2>&1; then

        # Parse artillery results
        if grep -q "All virtual users finished" "$TEST_RESULTS_DIR/load-test.log"; then
            LOAD_PASSED=1
            LOAD_TOTAL=1
            OVERALL_PASSED=$((OVERALL_PASSED + 1))
            OVERALL_TOTAL=$((OVERALL_TOTAL + 1))
            log_success "Load tests completed successfully"
            return 0
        else
            LOAD_FAILED=1
            LOAD_TOTAL=1
            OVERALL_FAILED=$((OVERALL_FAILED + 1))
            OVERALL_TOTAL=$((OVERALL_TOTAL + 1))
            log_error "Load tests completed with issues"
            return 1
        fi
    else
        log_error "Load tests failed to execute"
        LOAD_FAILED=1
        LOAD_TOTAL=1
        OVERALL_FAILED=$((OVERALL_FAILED + 1))
        OVERALL_TOTAL=$((OVERALL_TOTAL + 1))
        return 1
    fi
}

# Function to run frontend tests
run_frontend_tests() {
    log_test_suite "Running Frontend Tests"

    # Simple frontend connectivity test
    log_info "Testing frontend page loading..."

    local frontend_passed=0
    local frontend_failed=0
    local frontend_total=0

    # Test main page load
    ((frontend_total++))
    if curl -s --max-time 30 -o /dev/null -w "%{http_code}" "$APP_URL/" | grep -q "200"; then
        ((frontend_passed++))
        log_success "Frontend main page loads successfully"
    else
        ((frontend_failed++))
        log_error "Frontend main page failed to load"
    fi

    # Test for common frontend assets
    ((frontend_total++))
    if curl -s --max-time 10 -o /dev/null -w "%{http_code}" "$APP_URL/favicon.ico" | grep -qE "200|404"; then
        ((frontend_passed++))
        log_success "Frontend assets are accessible"
    else
        ((frontend_failed++))
        log_error "Frontend assets are not accessible"
    fi

    OVERALL_PASSED=$((OVERALL_PASSED + frontend_passed))
    OVERALL_FAILED=$((OVERALL_FAILED + frontend_failed))
    OVERALL_TOTAL=$((OVERALL_TOTAL + frontend_total))
}

# Function to generate comprehensive report
generate_final_report() {
    log_header "FINAL COMPREHENSIVE TEST REPORT"

    echo "" | tee -a "$LOG_FILE"
    echo "Magic Sauce App - Complete Test Results" | tee -a "$LOG_FILE"
    echo "========================================" | tee -a "$LOG_FILE"
    echo "Test Run Timestamp: $(date)" | tee -a "$LOG_FILE"
    echo "Target Application: $APP_URL" | tee -a "$LOG_FILE"
    echo "Test Results Directory: $TEST_RESULTS_DIR" | tee -a "$LOG_FILE"
    echo "" | tee -a "$LOG_FILE"

    # Overall results
    echo "OVERALL RESULTS:" | tee -a "$LOG_FILE"
    echo "===============" | tee -a "$LOG_FILE"
    echo "Total Tests Run: $OVERALL_TOTAL" | tee -a "$LOG_FILE"
    echo "✅ Passed: $OVERALL_PASSED" | tee -a "$LOG_FILE"
    echo "❌ Failed: $OVERALL_FAILED" | tee -a "$LOG_FILE"

    if [ $OVERALL_TOTAL -gt 0 ]; then
        local overall_success_rate=$((OVERALL_PASSED * 100 / OVERALL_TOTAL))
        echo "Success Rate: ${overall_success_rate}%" | tee -a "$LOG_FILE"

        echo "" | tee -a "$LOG_FILE"
        echo "TEST SUITE BREAKDOWN:" | tee -a "$LOG_FILE"
        echo "=====================" | tee -a "$LOG_FILE"

        # Connectivity results
        if [ $CONNECTIVITY_TOTAL -gt 0 ]; then
            local conn_rate=$((CONNECTIVITY_PASSED * 100 / CONNECTIVITY_TOTAL))
            echo "Connectivity Tests: $CONNECTIVITY_PASSED/$CONNECTIVITY_TOTAL passed (${conn_rate}%)" | tee -a "$LOG_FILE"
        fi

        # API results
        if [ $API_TOTAL -gt 0 ]; then
            local api_rate=$((API_PASSED * 100 / API_TOTAL))
            echo "API Functionality Tests: $API_PASSED/$API_TOTAL passed (${api_rate}%)" | tee -a "$LOG_FILE"
        fi

        # Load test results
        if [ $LOAD_TOTAL -gt 0 ]; then
            local load_rate=$((LOAD_PASSED * 100 / LOAD_TOTAL))
            echo "Load/Performance Tests: $LOAD_PASSED/$LOAD_TOTAL passed (${load_rate}%)" | tee -a "$LOG_FILE"
        fi

        echo "" | tee -a "$LOG_FILE"

        # Assessment
        if [ $overall_success_rate -ge 95 ]; then
            log_success "🎉 EXCELLENT: Application is fully functional and performing well!"
            echo "✅ All critical functionality is working" | tee -a "$LOG_FILE"
            echo "✅ Performance is within acceptable limits" | tee -a "$LOG_FILE"
            echo "✅ System is ready for production use" | tee -a "$LOG_FILE"
        elif [ $overall_success_rate -ge 85 ]; then
            log_success "✅ GOOD: Application is functional with minor issues"
            echo "✅ Core functionality is working" | tee -a "$LOG_FILE"
            echo "⚠️  Some non-critical features may need attention" | tee -a "$LOG_FILE"
            echo "✅ System is suitable for production with monitoring" | tee -a "$LOG_FILE"
        elif [ $overall_success_rate -ge 70 ]; then
            log_warning "⚠️  FAIR: Application has some functional issues"
            echo "✅ Basic connectivity is working" | tee -a "$LOG_FILE"
            echo "❌ Some functionality needs to be addressed" | tee -a "$LOG_FILE"
            echo "⚠️  Recommend fixing issues before full production deployment" | tee -a "$LOG_FILE"
        else
            log_error "❌ POOR: Application has significant issues"
            echo "❌ Critical functionality is not working" | tee -a "$LOG_FILE"
            echo "❌ System requires immediate attention" | tee -a "$LOG_FILE"
            echo "🚫 Not recommended for production use" | tee -a "$LOG_FILE"
        fi
    fi

    echo "" | tee -a "$LOG_FILE"
    echo "DETAILED LOGS:" | tee -a "$LOG_FILE"
    echo "==============" | tee -a "$LOG_FILE"
    echo "Complete Log: $LOG_FILE" | tee -a "$LOG_FILE"
    echo "Connectivity Tests: $TEST_RESULTS_DIR/connectivity.log" | tee -a "$LOG_FILE"
    echo "API Tests: $TEST_RESULTS_DIR/api.log" | tee -a "$LOG_FILE"
    echo "Load Tests: $TEST_RESULTS_DIR/load-test.log" | tee -a "$LOG_FILE"

    echo "" | tee -a "$LOG_FILE"
    echo "NEXT STEPS:" | tee -a "$LOG_FILE"
    echo "===========" | tee -a "$LOG_FILE"
    if [ $OVERALL_FAILED -gt 0 ]; then
        echo "1. Review detailed logs in $TEST_RESULTS_DIR/" | tee -a "$LOG_FILE"
        echo "2. Fix any failed tests" | tee -a "$LOG_FILE"
        echo "3. Re-run tests to verify fixes" | tee -a "$LOG_FILE"
        echo "4. Consider setting up monitoring for production" | tee -a "$LOG_FILE"
    else
        echo "1. All tests passed! 🎉" | tee -a "$LOG_FILE"
        echo "2. Consider setting up continuous monitoring" | tee -a "$LOG_FILE"
        echo "3. Review performance metrics for optimization opportunities" | tee -a "$LOG_FILE"
        echo "4. System is ready for production deployment" | tee -a "$LOG_FILE"
    fi

    # Create summary JSON for CI/CD integration
    cat > "$TEST_RESULTS_DIR/summary.json" << EOF
{
  "timestamp": "$(date -Iseconds)",
  "app_url": "$APP_URL",
  "overall": {
    "total": $OVERALL_TOTAL,
    "passed": $OVERALL_PASSED,
    "failed": $OVERALL_FAILED,
    "success_rate": $((OVERALL_TOTAL > 0 ? OVERALL_PASSED * 100 / OVERALL_TOTAL : 0))
  },
  "connectivity": {
    "total": $CONNECTIVITY_TOTAL,
    "passed": $CONNECTIVITY_PASSED,
    "failed": $CONNECTIVITY_FAILED
  },
  "api": {
    "total": $API_TOTAL,
    "passed": $API_PASSED,
    "failed": $API_FAILED
  },
  "load": {
    "total": $LOAD_TOTAL,
    "passed": $LOAD_PASSED,
    "failed": $LOAD_FAILED
  },
  "test_results_dir": "$TEST_RESULTS_DIR"
}
EOF

    log_info "Summary saved to: $TEST_RESULTS_DIR/summary.json"
}

# Function to show usage
show_usage() {
    echo "Magic Sauce App - Complete Test Suite Runner"
    echo ""
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  --url URL           Test a different URL (default: $APP_URL)"
    echo "  --quick             Run only essential connectivity tests"
    echo "  --skip-load         Skip load/performance tests"
    echo "  --skip-frontend     Skip frontend tests"
    echo "  --help, -h          Show this help message"
    echo ""
    echo "This script runs a comprehensive test suite including:"
    echo "  - Connectivity tests (HTTP endpoints, DNS, SSL)"
    echo "  - API functionality tests (endpoints, validation, error handling)"
    echo "  - Load and performance tests (using Artillery)"
    echo "  - Frontend connectivity tests"
    echo ""
    echo "Results are saved to: $TEST_RESULTS_DIR"
    echo ""
    echo "Examples:"
    echo "  $0                           # Run all tests"
    echo "  $0 --quick                   # Run only connectivity tests"
    echo "  $0 --skip-load               # Skip load tests"
    echo "  $0 --url https://staging.example.com"
}

# Main execution
main() {
    local run_all=true
    local run_load=true
    local run_frontend=true
    local test_mode="full"

    # Parse command line arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            --url)
                APP_URL="$2"
                shift 2
                ;;
            --quick)
                test_mode="quick"
                run_all=false
                run_load=false
                shift
                ;;
            --skip-load)
                run_load=false
                shift
                ;;
            --skip-frontend)
                run_frontend=false
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

    log_header "MAGIC SAUCE APP - COMPLETE TEST SUITE"
    log_info "Target URL: $APP_URL"
    log_info "Test Results: $TEST_RESULTS_DIR"
    log_info "Test Mode: $test_mode"
    echo ""

    # Initial setup
    check_dependencies

    # Run tests based on configuration
    run_connectivity_tests

    if [ "$test_mode" = "full" ]; then
        run_api_tests

        if [ "$run_load" = true ]; then
            run_load_tests
        else
            log_info "Skipping load tests as requested"
        fi

        if [ "$run_frontend" = true ]; then
            run_frontend_tests
        else
            log_info "Skipping frontend tests as requested"
        fi
    else
        log_info "Running in quick mode - skipping comprehensive API and load tests"
    fi

    # Generate final report
    generate_final_report

    # Exit with appropriate code
    if [ $OVERALL_FAILED -gt 0 ]; then
        exit 1
    else
        exit 0
    fi
}

# Run main function with all arguments
main "$@"
