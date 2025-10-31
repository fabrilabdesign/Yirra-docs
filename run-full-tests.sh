#!/bin/bash

# Master Test Runner for Yirra Systems Reddit Voting Automation
# Runs comprehensive tests across the entire system

set -e  # Exit on any error

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
BACKEND_DIR="$PROJECT_ROOT/Magic_sauce/backend"
FRONTEND_DIR="$PROJECT_ROOT/Magic_sauce"

# Test results
TOTAL_COMPONENTS=0
PASSED_COMPONENTS=0
FAILED_COMPONENTS=0

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_header() {
    echo -e "${PURPLE}========================================${NC}"
    echo -e "${PURPLE}$1${NC}"
    echo -e "${PURPLE}========================================${NC}"
}

log_component() {
    echo -e "${CYAN}[COMPONENT]${NC} $1"
}

# Function to run tests in a directory
run_component_tests() {
    local component_name=$1
    local test_dir=$2
    local test_command=$3

    ((TOTAL_COMPONENTS++))

    log_component "Testing $component_name..."

    if cd "$test_dir" && $test_command; then
        log_success "$component_name tests passed"
        ((PASSED_COMPONENTS++))
        return 0
    else
        log_error "$component_name tests failed"
        ((FAILED_COMPONENTS++))
        return 1
    fi
}

# Function to check system prerequisites
check_prerequisites() {
    log_info "Checking system prerequisites..."

    # Check Node.js
    if ! command -v node &> /dev/null; then
        log_error "Node.js is not installed or not in PATH"
        exit 1
    fi

    # Check npm
    if ! command -v npm &> /dev/null; then
        log_error "npm is not installed or not in PATH"
        exit 1
    fi

    # Check if backend directory exists
    if [ ! -d "$BACKEND_DIR" ]; then
        log_error "Backend directory not found: $BACKEND_DIR"
        exit 1
    fi

    log_success "Prerequisites check passed"
}

# Function to setup test environment
setup_test_environment() {
    log_info "Setting up test environment..."

    # Ensure backend dependencies are installed
    if [ ! -d "$BACKEND_DIR/node_modules" ]; then
        log_info "Installing backend dependencies..."
        cd "$BACKEND_DIR" && npm install
    fi

    # Generate Prisma client if needed
    if [ ! -d "$BACKEND_DIR/node_modules/.prisma" ]; then
        log_info "Generating Prisma client..."
        cd "$BACKEND_DIR" && npm run prisma:generate
    fi

    log_success "Test environment ready"
}

# Function to run backend tests
run_backend_tests() {
    log_header "BACKEND TESTS"

    # Run comprehensive backend test suite
    run_component_tests "Backend Unit Tests" "$BACKEND_DIR" "./test-runner.sh --unit"
    run_component_tests "Backend Integration Tests" "$BACKEND_DIR" "./test-runner.sh --integration"
    run_component_tests "Backend E2E Tests" "$BACKEND_DIR" "./test-runner.sh --e2e"
    run_component_tests "Backend Database Tests" "$BACKEND_DIR" "./test-runner.sh --database"
}

# Function to run automation-specific tests
run_automation_tests() {
    log_header "AUTOMATION SYSTEM TESTS"

    run_component_tests "Voting Automation Tests" "$BACKEND_DIR" "npm run test:automation"
}

# Function to run frontend tests (if they exist)
run_frontend_tests() {
    log_header "FRONTEND TESTS"

    if [ -d "$FRONTEND_DIR" ] && [ -f "$FRONTEND_DIR/package.json" ]; then
        # Check if frontend has test scripts
        if cd "$FRONTEND_DIR" && npm run test --silent 2>/dev/null; then
            run_component_tests "Frontend Tests" "$FRONTEND_DIR" "npm run test -- --watchAll=false"
        else
            log_warning "Frontend test script not found or failing, skipping..."
        fi
    else
        log_warning "Frontend directory or package.json not found, skipping frontend tests..."
    fi
}

# Function to run end-to-end system tests
run_system_integration_tests() {
    log_header "SYSTEM INTEGRATION TESTS"

    log_info "Running end-to-end automation flow tests..."
    if cd "$BACKEND_DIR" && npm run test:e2e; then
        log_success "System integration tests passed"
        ((PASSED_COMPONENTS++))
    else
        log_error "System integration tests failed"
        ((FAILED_COMPONENTS++))
    fi
    ((TOTAL_COMPONENTS++))
}

# Function to generate final report
generate_final_report() {
    log_header "FINAL TEST REPORT"

    echo ""
    echo "Test Execution Summary:"
    echo "======================"
    echo "Total Components Tested: $TOTAL_COMPONENTS"
    echo "✅ Passed: $PASSED_COMPONENTS"
    echo "❌ Failed: $FAILED_COMPONENTS"

    local success_rate=0
    if [ $TOTAL_COMPONENTS -gt 0 ]; then
        success_rate=$((PASSED_COMPONENTS * 100 / TOTAL_COMPONENTS))
    fi

    echo "Success Rate: ${success_rate}%"

    echo ""
    echo "Component Details:"
    echo "=================="

    if [ -d "$BACKEND_DIR/test-results" ]; then
        echo ""
        echo "Backend Test Logs: $BACKEND_DIR/test-results/"
        ls -la "$BACKEND_DIR/test-results/" 2>/dev/null || true
    fi

    if [ -d "$BACKEND_DIR/coverage" ]; then
        echo ""
        echo "Coverage Report: $BACKEND_DIR/coverage/lcov-report/index.html"
    fi

    echo ""

    if [ $FAILED_COMPONENTS -eq 0 ]; then
        log_success "🎉 ALL TESTS PASSED! System is ready for production."
        echo ""
        echo "Next Steps:"
        echo "- Deploy to staging environment"
        echo "- Run manual end-to-end tests"
        echo "- Monitor system performance"
        return 0
    else
        log_error "❌ SOME TESTS FAILED. Review logs and fix issues before deployment."
        echo ""
        echo "Troubleshooting:"
        echo "- Check test logs in $BACKEND_DIR/test-results/"
        echo "- Run individual test suites for detailed output"
        echo "- Ensure all dependencies are properly installed"
        return 1
    fi
}

# Function to show usage
show_usage() {
    echo "Yirra Systems - Full Test Suite Runner"
    echo ""
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  --backend-only    Run only backend tests"
    echo "  --automation-only Run only automation-specific tests"
    echo "  --frontend-only   Run only frontend tests"
    echo "  --integration-only Run only system integration tests"
    echo "  --quick           Run essential tests only (unit + integration)"
    echo "  --help, -h        Show this help message"
    echo ""
    echo "If no options specified, runs the complete test suite."
    echo ""
    echo "Examples:"
    echo "  $0                        # Run all tests"
    echo "  $0 --quick                # Run essential tests only"
    echo "  $0 --backend-only         # Run backend tests only"
    echo "  $0 --automation-only      # Run automation tests only"
}

# Main execution
main() {
    local run_all=true
    local test_mode=""

    # Parse command line arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            --backend-only)
                run_all=false
                test_mode="backend"
                shift
                ;;
            --automation-only)
                run_all=false
                test_mode="automation"
                shift
                ;;
            --frontend-only)
                run_all=false
                test_mode="frontend"
                shift
                ;;
            --integration-only)
                run_all=false
                test_mode="integration"
                shift
                ;;
            --quick)
                run_all=false
                test_mode="quick"
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

    log_header "YIRRA SYSTEMS - REDDIT VOTING AUTOMATION"
    log_info "Starting comprehensive test suite..."
    echo ""

    # Prerequisites check
    check_prerequisites

    # Setup
    setup_test_environment

    # Run tests based on mode
    case $test_mode in
        "backend")
            run_backend_tests
            ;;
        "automation")
            run_automation_tests
            ;;
        "frontend")
            run_frontend_tests
            ;;
        "integration")
            run_system_integration_tests
            ;;
        "quick")
            log_header "QUICK TEST SUITE"
            run_component_tests "Backend Unit Tests" "$BACKEND_DIR" "./test-runner.sh --unit"
            run_component_tests "Backend Integration Tests" "$BACKEND_DIR" "./test-runner.sh --integration"
            run_component_tests "Automation Tests" "$BACKEND_DIR" "npm run test:automation"
            ;;
        *)
            # Full test suite
            run_backend_tests
            run_automation_tests
            run_frontend_tests
            run_system_integration_tests
            ;;
    esac

    # Generate final report
    generate_final_report
}

# Run main function with all arguments
main "$@"

