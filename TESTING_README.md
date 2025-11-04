# Magic Sauce App - Testing Suite

A comprehensive testing suite for the Magic Sauce Reddit Voting Automation System deployed at https://magic-sauce.addiaire.com/

## Overview

This testing suite provides complete coverage for validating the functionality and connectivity of the deployed Magic Sauce application. The suite includes connectivity tests, API functionality validation, load testing, and frontend checks.

## Test Components

### 1. Connectivity Tests (`connectivity-tests.sh`)
- Basic HTTP/HTTPS connectivity
- Health endpoint validation
- CORS support verification
- Error handling (404, 405 responses)
- SSL certificate validation
- DNS resolution

### 2. API Functionality Tests (`api-functionality-tests.js`)
- Health and readiness endpoints
- Authentication status checks
- Rate limiting quota validation
- Users API (CRUD operations)
- Reddit automation endpoints
- Error handling and validation
- Response time performance

### 3. Load & Performance Tests (`artillery-config.yml`)
- Multi-phase load testing (warm-up → normal → heavy → spike → recovery)
- Concurrent user simulation
- API endpoint stress testing
- Response time monitoring
- Error rate tracking
- Custom metrics collection

### 4. Complete Test Runner (`run-all-tests.sh`)
- Orchestrates all test suites
- Comprehensive reporting
- CI/CD integration support
- Configurable test execution

## Quick Start

### Run All Tests
```bash
# Run the complete test suite
./run-all-tests.sh

# Run only connectivity tests (quick)
./run-all-tests.sh --quick

# Test a different environment
./run-all-tests.sh --url https://staging.magic-sauce.com

# Skip load tests for faster execution
./run-all-tests.sh --skip-load
```

### Run Individual Test Suites

#### Connectivity Tests Only
```bash
./connectivity-tests.sh --quick
```

#### API Functionality Tests Only
```bash
node api-functionality-tests.js
```

#### Load Tests Only
```bash
# Install artillery first: npm install -g artillery
artillery run artillery-config.yml
```

## Prerequisites

### Required Tools
- **curl**: HTTP client for connectivity tests
- **jq**: JSON processor for response validation
- **node.js**: Runtime for JavaScript-based tests
- **artillery**: Load testing framework

### Installation
```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install curl jq

# Install Node.js (if not already installed)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Artillery
npm install -g artillery
```

## Test Configuration

### Environment Variables
- `APP_URL`: Target application URL (default: https://magic-sauce.addiaire.com)

### Test Parameters
- **Timeout**: 30 seconds per request
- **Retries**: 3 attempts per test
- **Load Test Duration**: ~8 minutes total
- **Concurrent Users**: Up to 50 during spike testing

## Test Results

### Output Structure
```
test-results-YYYYMMDD-HHMMSS/
├── complete-test.log          # Complete test execution log
├── connectivity.log           # Connectivity test details
├── api.log                    # API functionality test details
├── load-test.log              # Load test results
└── summary.json               # Machine-readable summary
```

### Result Interpretation

#### Success Rates
- **95%+**: Excellent - System fully functional
- **85-94%**: Good - Minor issues, suitable for production
- **70-84%**: Fair - Some issues need attention
- **<70%**: Poor - Critical issues require fixing

#### Common Issues
- **401/403 responses**: Authentication required for protected endpoints
- **400 responses**: Validation errors (expected for some tests)
- **Slow responses**: Performance optimization needed
- **Connection timeouts**: Network or server issues

## API Endpoints Tested

### Health & Status
- `GET /health` - Application health check
- `GET /ready` - Readiness probe
- `GET /test` - Basic functionality test

### Authentication & Monitoring
- `GET /auth/status` - Authentication connection status
- `GET /quota` - Rate limiting quota information

### Users Management
- `GET /users` - List users with optional search/filtering
- `POST /users` - Create new user
- `PATCH /users/:id` - Update user
- `DELETE /users/:id` - Delete user

### Reddit Automation (Protected)
- `POST /ms/v1/action/vote` - Execute voting action
- `POST /ms/v1/automation/start` - Start voting automation
- `POST /ms/v1/automation/stop` - Stop voting automation
- `GET /ms/v1/automation/status/:id` - Check automation status
- `GET /ms/v1/lists/keywords` - Manage keyword lists
- `POST /ms/v1/track/content` - Track content
- `GET /ms/v1/personas` - List automation personas

## Load Testing Scenarios

### Test Phases
1. **Warm-up** (60s): 1 request/second - Ensure system readiness
2. **Normal Load** (180s): 3 requests/second - Typical traffic
3. **Heavy Load** (120s): 10 requests/second - Stress testing
4. **Spike Test** (30s): 50 requests/second - Sudden traffic surge
5. **Recovery** (60s): 2 requests/second - System recovery validation

### Request Distribution
- Health checks: 30% (most frequent)
- Auth status: 15%
- Users operations: 15%
- Reddit automation: 35% (requires auth, may fail)
- Error scenarios: 5%

## CI/CD Integration

### Automated Testing
```yaml
# Example GitHub Actions workflow
name: Test Magic Sauce App
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: |
          sudo apt-get update
          sudo apt-get install -y curl jq
          npm install -g artillery
      - name: Run tests
        run: ./run-all-tests.sh
      - name: Upload results
        uses: actions/upload-artifact@v3
        with:
          name: test-results
          path: test-results-*/
```

### Result Processing
```bash
# Parse test results
jq '.overall.success_rate' test-results-*/summary.json

# Check for failures
jq '.overall.failed' test-results-*/summary.json
```

## Troubleshooting

### Common Issues

#### Tests Failing Due to Network Issues
```bash
# Check network connectivity
curl -I https://magic-sauce.addiaire.com/health

# Test DNS resolution
nslookup magic-sauce.addiaire.com
```

#### Artillery Load Tests Failing
```bash
# Check artillery installation
artillery --version

# Run with verbose output
artillery run artillery-config.yml --verbose
```

#### API Tests Timing Out
```bash
# Check if the application is responding
curl -m 10 https://magic-sauce.addiaire.com/health

# Verify SSL certificate
openssl s_client -connect magic-sauce.addiaire.com:443 -servername magic-sauce.addiaire.com < /dev/null
```

### Debug Mode
```bash
# Run with detailed logging
DEBUG=* ./run-all-tests.sh

# Run individual components with verbose output
./connectivity-tests.sh --url https://magic-sauce.addiaire.com
node api-functionality-tests.js
```

## Performance Benchmarks

### Expected Results
- **Health Check Response**: < 500ms
- **API Endpoints**: < 2s
- **Concurrent Requests**: < 5s average
- **Error Rate**: < 5% during normal load
- **Success Rate**: > 85% overall

### Monitoring Recommendations
- Set up alerts for response times > 5s
- Monitor error rates > 10%
- Track 95th percentile response times
- Monitor SSL certificate expiration

## Contributing

### Adding New Tests
1. Follow existing patterns in test files
2. Add appropriate error handling
3. Update this README with new endpoints/features
4. Test against staging environment first
5. Ensure tests are idempotent

### Test Maintenance
- Regularly update test data and scenarios
- Monitor for false positives/negatives
- Update performance benchmarks as system evolves
- Review and optimize slow tests

---

## Support

For issues with the testing suite:
1. Check the troubleshooting section above
2. Review detailed logs in test results directory
3. Verify application deployment status
4. Check network connectivity and DNS resolution

Test results are saved to timestamped directories for analysis and debugging.
