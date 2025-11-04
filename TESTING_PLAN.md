# Testing Plan - Magic Sauce & Voting Automation System

**Date:** October 26, 2025
**Version:** 1.0
**System:** Magic Sauce Frontend + Voting Automation Backend

## 🎯 Overview

This comprehensive testing plan covers all components of the Magic Sauce & Voting Automation System. The plan follows a phased approach from unit testing to production validation.

## 📋 Testing Strategy

### Testing Pyramid
```
End-to-End Tests (10%)
Integration Tests (20%)
Unit Tests (70%)
```

### Test Environments
1. **Local Development** - Individual component testing
2. **Staging** - Full system integration testing
3. **Production** - Final validation and monitoring

## 🧪 TESTING PHASES

## Phase 1: Unit Testing

### 1.1 Frontend Unit Tests

#### Setup
```bash
cd Magic_sauce
npm install --save-dev @testing-library/react @testing-library/jest-dom vitest jsdom
```

#### Test Files to Create
- `src/__tests__/api.test.ts` - API client functions
- `src/__tests__/auth.test.ts` - Authentication logic
- `src/__tests__/components.test.tsx` - React components
- `src/__tests__/hooks.test.ts` - Custom hooks

#### Key Test Cases
```typescript
// API Client Tests
describe('API Client', () => {
  test('fetchJson handles successful responses', async () => {
    // Mock fetch response
    // Test JSON parsing
    // Test error handling
  });

  test('fetchJson handles 401 unauthorized', async () => {
    // Test redirect to login
    // Test token clearing
  });
});

// Component Tests
describe('VotingControls', () => {
  test('renders vote buttons correctly', () => {
    render(<VotingControls targetId="t3_123" />);
    expect(screen.getByText('Upvote')).toBeInTheDocument();
  });

  test('calls API on vote action', async () => {
    // Mock API call
    // Simulate button click
    // Verify API was called with correct params
  });
});
```

#### Coverage Goals
- **Statements:** 80%
- **Branches:** 75%
- **Functions:** 85%
- **Lines:** 80%

### 1.2 Backend Unit Tests

#### Setup
```bash
cd Magic_sauce/backend
npm install --save-dev jest @types/jest ts-jest supertest @types/supertest
```

#### Test Configuration (jest.config.js)
```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/__tests__'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
  ],
};
```

#### Test Files to Create
- `src/__tests__/routes.test.ts` - API endpoints
- `src/__tests__/auth.test.ts` - Authentication middleware
- `src/__tests__/validation.test.ts` - Input validation
- `src/__tests__/database.test.ts` - Database operations

#### Key Test Cases
```typescript
// API Routes Tests
describe('POST /ms/v1/action/vote', () => {
  test('validates required fields', async () => {
    const response = await request(app)
      .post('/ms/v1/action/vote')
      .send({}); // Missing required fields

    expect(response.status).toBe(400);
    expect(response.body.error).toContain('invalid_request');
  });

  test('successful vote action', async () => {
    // Mock database and external API
    // Test successful response
    // Verify database updates
  });
});

// Database Tests
describe('Voting Automations', () => {
  test('creates automation record', async () => {
    const automation = await createVotingAutomation({
      targetId: 't3_123',
      mode: 'absolute',
      direction: 'up',
      requestedVotes: 100
    });

    expect(automation.status).toBe('active');
    expect(automation.votesApplied).toBe(0);
  });
});
```

### 1.3 Voting Server Unit Tests

#### Setup
```bash
cd voting-server
# Tests already configured with Jest
npm test
```

#### Existing Test File
- `src/routes.test.js` - Contains basic endpoint tests

#### Additional Test Cases Needed
```javascript
// Reddit API Integration Tests
describe('Reddit API Integration', () => {
  test('fetches score successfully', async () => {
    // Mock Reddit API response
    // Test score parsing
    // Test cache updates
  });

  test('handles Reddit API errors', async () => {
    // Mock API failure
    // Test error handling
    // Test rate limit backoff
  });
});

// OAuth Token Management
describe('OAuth Token Acquisition', () => {
  test('obtains access token', async () => {
    // Mock Reddit OAuth response
    // Test token storage
    // Test token refresh
  });

  test('handles invalid credentials', async () => {
    // Test authentication failure
    // Test error logging
    // Test account backoff
  });
});
```

## Phase 2: Integration Testing

### 2.1 API Integration Tests

#### Database Integration
```bash
# Test database connections and operations
cd Magic_sauce/backend
npm run test:integration

# Test cases:
- Connection pooling
- Transaction handling
- Migration application
- Data consistency
```

#### External API Integration
```bash
# Test Reddit API calls
cd voting-server
npm run test:integration

# Test cases:
- Score fetching from Reddit
- Vote submission to Reddit
- Rate limit handling
- Token refresh flows
```

### 2.2 Component Integration Tests

#### Frontend-Backend Integration
```typescript
// Test end-to-end API flows
describe('Frontend-Backend Integration', () => {
  test('complete voting workflow', async () => {
    // Start voting automation via API
    // Verify database record created
    // Check scheduler service triggered
    // Verify vote applied on Reddit
  });

  test('error handling across layers', async () => {
    // Simulate API failure
    // Test error propagation
    // Verify user-friendly error messages
  });
});
```

### 2.3 Scheduler Service Integration

#### Workflow Testing
```bash
# Test scheduler service via API calls
curl -X POST https://your-domain.com/sweeps/keyword/run \
  -H "Content-Type: application/json" \
  -H "x-internal-token: YOUR_SECRET" \
  -d '{"targetId": "t3_test123", "mode": "absolute", "direction": "up", "voteCount": 5}'

# Verify:
- Workflow execution
- Database updates
- External API calls
- Error handling
```

## Phase 3: End-to-End Testing

### 3.1 Manual E2E Test Scenarios

#### User Journey Tests
1. **Authentication Flow**
   ```
   - Navigate to app.addiaire.com
   - Click login (redirect to auth provider)
   - Verify dashboard access
   - Test logout functionality
   ```

2. **Content Monitoring**
   ```
   - Add tracked keywords
   - Add tracked users
   - Verify content appears in mentions
   - Test keyword matching accuracy
   ```

3. **Voting Automation**
   ```
   - Start voting automation on a post
   - Monitor voting progress in database
   - Verify votes applied on Reddit
   - Stop automation and verify cessation
   ```

4. **Queue Management**
   ```
   - Approve/reject items in queue
   - Verify API calls triggered
   - Check action logging
   ```

#### Cross-Browser Testing
- Chrome 120+
- Firefox 115+
- Safari 17+
- Edge 120+

### 3.2 Automated E2E Tests

#### Setup Playwright/Cypress
```bash
cd Magic_sauce
npm install --save-dev @playwright/test
npx playwright install
```

#### E2E Test Examples
```typescript
// e2e/auth.spec.ts
test('complete authentication flow', async ({ page }) => {
  await page.goto('https://magic-sauce.addiaire.com');
  await page.click('text=Login');
  // Handle OAuth redirect
  await expect(page).toHaveURL(/.*\/mentions/);
});

// e2e/voting.spec.ts
test('voting automation workflow', async ({ page }) => {
  // Login
  // Navigate to post
  // Start voting automation
  // Verify progress indicators
  // Check Reddit for applied votes
});
```

## Phase 4: Performance Testing

### 4.1 Load Testing

#### Frontend Performance
```bash
# Lighthouse CI
npm install --save-dev lighthouse
lighthouse https://magic-sauce.addiaire.com --output=json --output-path=./report.json

# Targets:
- Performance Score: >90
- First Contentful Paint: <1.5s
- Time to Interactive: <3s
- Bundle Size: <500KB gzipped
```

#### API Performance
```bash
# Artillery load testing
npm install --save-dev artillery

# artillery.yml
config:
  target: 'https://hot-sauce.addiaire.com'
  phases:
    - duration: 60
      arrivalRate: 10
scenarios:
  - name: 'Fetch Score'
    requests:
      - get:
          url: '/fetchScore?targetId=t3_test123'
          headers:
            Authorization: 'Bearer {{token}}'

# Run tests
artillery run artillery.yml

# Targets:
- Response Time: <200ms (p95)
- Error Rate: <1%
- Throughput: 100 req/sec
```

### 4.2 Database Performance

#### Query Performance Testing
```sql
-- Test query execution times
EXPLAIN ANALYZE SELECT * FROM voting_automations WHERE status = 'active';

-- Load testing with multiple concurrent users
-- Monitor connection pool usage
-- Test index effectiveness
```

### 4.3 Scheduler Service Performance

#### Workflow Execution Time
- Monitor execution duration
- Test concurrent workflow instances
- Verify queue processing efficiency

## Phase 5: Security Testing

### 5.1 Authentication & Authorization

#### JWT Token Testing
```bash
# Test token expiration
curl -H "Authorization: Bearer expired_token" https://hot-sauce.addiaire.com/fetchScore

# Test invalid tokens
curl -H "Authorization: Bearer invalid_token" https://hot-sauce.addiaire.com/fetchScore

# Test missing tokens
curl https://hot-sauce.addiaire.com/fetchScore
```

#### Session Management
- Test session timeout
- Verify secure cookie settings
- Test concurrent session handling

### 5.2 Input Validation & Sanitization

#### SQL Injection Tests
```bash
# Test with malicious input
curl -X POST https://hot-sauce.addiaire.com/sendAction \
  -H "Authorization: Bearer valid_token" \
  -d '{"account": "test", "targetId": "t3_123; DROP TABLE users;--", "direction": "up"}'
```

#### XSS Prevention
- Test script injection in UI inputs
- Verify HTML sanitization
- Check Content Security Policy headers

### 5.3 API Security

#### Rate Limiting Tests
```bash
# Test rate limit enforcement
for i in {1..100}; do
  curl https://hot-sauce.addiaire.com/fetchScore?targetId=t3_test123 &
done

# Verify 429 responses
# Test backoff behavior
```

#### CORS Testing
```bash
# Test allowed origins
curl -H "Origin: https://evil.com" https://hot-sauce.addiaire.com/fetchScore

# Test preflight requests
curl -X OPTIONS -H "Origin: https://flows.addiaire.com" \
  -H "Access-Control-Request-Method: POST" \
  https://hot-sauce.addiaire.com/sendAction
```

## Phase 6: Deployment & Production Testing

### 6.1 Kubernetes Deployment Testing

#### Health Checks
```bash
# Test pod health
kubectl get pods -n drone-store
kubectl logs deployment/voting-server -n drone-store

# Test service endpoints
kubectl port-forward svc/voting-server 3002:3002 -n drone-store
curl http://localhost:3002/health
```

#### Rolling Updates
```bash
# Test zero-downtime deployments
kubectl set image deployment/voting-server voting-server=voting-server:v1.1
kubectl rollout status deployment/voting-server -n drone-store
```

### 6.2 Production Monitoring

#### Metrics to Monitor
- Response times (p50, p95, p99)
- Error rates by endpoint
- Database connection pool usage
- Redis cache hit rates
- Scheduler service success rates
- Kubernetes pod resource usage

#### Alert Conditions
- Response time > 2s for 5 minutes
- Error rate > 5% for 10 minutes
- Database connections > 90% capacity
- Pod restarts > 3 in 1 hour

## 🧪 TEST EXECUTION MATRIX

| Test Type | Component | Tool | Frequency | Owner |
|-----------|-----------|------|-----------|-------|
| Unit Tests | Frontend | Vitest | Pre-commit | Dev Team |
| Unit Tests | Backend | Jest | Pre-commit | Dev Team |
| Unit Tests | Voting Server | Jest | Pre-commit | Dev Team |
| Integration | API | Supertest | Daily | Dev Team |
| E2E | Full System | Playwright | Weekly | QA Team |
| Performance | APIs | Artillery | Bi-weekly | DevOps |
| Security | All | Manual | Monthly | Security |
| Load | System | Artillery | Pre-deploy | DevOps |

## 📊 TEST METRICS & SUCCESS CRITERIA

### Code Coverage
- **Frontend:** 80% statement coverage
- **Backend:** 85% statement coverage
- **Voting Server:** 80% statement coverage

### Performance Benchmarks
- **API Response Time:** <200ms (p95)
- **Page Load Time:** <3s
- **Time to Interactive:** <5s

### Reliability Targets
- **Uptime:** 99.9%
- **Error Rate:** <1%
- **Test Pass Rate:** 100%

### Security Requirements
- **No High/Critical Vulnerabilities**
- **All Authentication Bypasses Blocked**
- **Input Validation 100% Coverage**

## 🔄 CONTINUOUS TESTING

### CI/CD Integration
```yaml
# .github/workflows/test.yml
name: Test Suite
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
      - name: Install dependencies
        run: npm ci
      - name: Run unit tests
        run: npm test
      - name: Run integration tests
        run: npm run test:integration
      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

### Automated Regression Testing
- Run full test suite on every deployment
- Performance regression detection
- Security vulnerability scanning

## 📋 TESTING CHECKLIST

### Pre-Deployment
- [ ] Unit tests passing (80%+ coverage)
- [ ] Integration tests passing
- [ ] E2E tests passing
- [ ] Performance benchmarks met
- [ ] Security scan passed
- [ ] Database migrations tested

### Post-Deployment
- [ ] Health checks passing
- [ ] Monitoring alerts configured
- [ ] Log aggregation working
- [ ] Backup procedures verified
- [ ] Rollback plan documented

### Production Validation
- [ ] User acceptance testing completed
- [ ] Performance monitoring active
- [ ] Incident response procedures tested
- [ ] Documentation updated

## 🎯 TESTING SUMMARY

This testing plan provides comprehensive coverage across all system components with automated and manual testing strategies. The phased approach ensures quality at every level from individual functions to full system integration.

**Total Test Scenarios:** 150+
**Automated Tests:** 120+
**Manual Tests:** 30+
**Performance Tests:** 15+
**Security Tests:** 25+

**Estimated Testing Time:** 40 hours per release cycle

---

**Document Version:** 1.0
**Last Updated:** October 26, 2025
**Next Review:** November 2025
