#!/usr/bin/env node

/**
 * Magic Sauce API Functionality Tests
 * Comprehensive testing of API endpoints for the Reddit Voting Automation System
 */

const https = require('https');
const http = require('http');

const APP_URL = 'https://magic-sauce.addiaire.com';
const TEST_TIMEOUT = 30000; // 30 seconds
const MAX_RETRIES = 3;

// Test results
let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

// Colors for console output
const colors = {
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    purple: '\x1b[35m',
    cyan: '\x1b[36m',
    reset: '\x1b[0m'
};

function log(color, level, message) {
    console.log(`${color}[${level}]${colors.reset} ${message}`);
}

function logInfo(message) {
    log(colors.blue, 'INFO', message);
}

function logSuccess(message) {
    log(colors.green, 'SUCCESS', message);
    passedTests++;
}

function logWarning(message) {
    log(colors.yellow, 'WARNING', message);
}

function logError(message) {
    log(colors.red, 'ERROR', message);
    failedTests++;
}

function logHeader(message) {
    console.log(`${colors.purple}========================================${colors.reset}`);
    console.log(`${colors.purple}${message}${colors.reset}`);
    console.log(`${colors.purple}========================================${colors.reset}`);
}

/**
 * Make HTTP request with promise
 */
function makeRequest(options) {
    return new Promise((resolve, reject) => {
        const protocol = options.url.startsWith('https:') ? https : http;
        const url = new URL(options.url);

        const requestOptions = {
            hostname: url.hostname,
            port: url.port,
            path: url.pathname + url.search,
            method: options.method || 'GET',
            headers: {
                'User-Agent': 'Magic-Sauce-API-Tests/1.0',
                ...options.headers
            },
            timeout: TEST_TIMEOUT
        };

        const req = protocol.request(requestOptions, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                resolve({
                    statusCode: res.statusCode,
                    headers: res.headers,
                    data: data,
                    url: options.url
                });
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        req.on('timeout', () => {
            req.destroy();
            reject(new Error('Request timeout'));
        });

        if (options.body) {
            req.write(JSON.stringify(options.body));
        }

        req.end();
    });
}

/**
 * Test with retry logic
 */
async function testWithRetry(testName, testFunction, maxRetries = MAX_RETRIES) {
    totalTests++;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            logInfo(`${testName} (attempt ${attempt}/${maxRetries})`);
            const result = await testFunction();
            logSuccess(`${testName} - ${result}`);
            return true;
        } catch (error) {
            logWarning(`${testName} failed (attempt ${attempt}/${maxRetries}): ${error.message}`);

            if (attempt === maxRetries) {
                logError(`${testName} failed after ${maxRetries} attempts`);
                return false;
            }

            // Wait before retry
            await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
    }
}

/**
 * Validate JSON response
 */
function validateJsonResponse(data, requiredFields = []) {
    try {
        const json = JSON.parse(data);

        for (const field of requiredFields) {
            if (!(field in json)) {
                throw new Error(`Missing required field: ${field}`);
            }
        }

        return { valid: true, data: json };
    } catch (error) {
        throw new Error(`Invalid JSON response: ${error.message}`);
    }
}

/**
 * Core API Tests
 */
async function testHealthEndpoints() {
    logHeader('HEALTH ENDPOINTS TESTS');

    // Test /health endpoint
    await testWithRetry('Health Check (/health)', async () => {
        const response = await makeRequest({ url: `${APP_URL}/health` });

        if (response.statusCode !== 200) {
            throw new Error(`Expected 200, got ${response.statusCode}`);
        }

        const { data: json } = validateJsonResponse(response.data, ['ok', 'timestamp']);

        if (!json.ok) {
            throw new Error('Health check returned ok: false');
        }

        return `Health check passed - timestamp: ${json.timestamp}`;
    });

    // Test /ready endpoint
    await testWithRetry('Readiness Check (/ready)', async () => {
        const response = await makeRequest({ url: `${APP_URL}/ready` });

        if (response.statusCode !== 200) {
            throw new Error(`Expected 200, got ${response.statusCode}`);
        }

        const { data: json } = validateJsonResponse(response.data, ['ok', 'services', 'timestamp']);

        return `Readiness check passed - services: ${Object.keys(json.services).join(', ')}`;
    });

    // Test /test endpoint
    await testWithRetry('Test Endpoint (/test)', async () => {
        const response = await makeRequest({ url: `${APP_URL}/test` });

        if (response.statusCode !== 200) {
            throw new Error(`Expected 200, got ${response.statusCode}`);
        }

        const { data: json } = validateJsonResponse(response.data, ['message', 'timestamp']);

        return `Test endpoint responded: ${json.message}`;
    });
}

async function testAuthAndStatusEndpoints() {
    logHeader('AUTHENTICATION & STATUS ENDPOINTS');

    // Test /auth/status endpoint
    await testWithRetry('Auth Status (/auth/status)', async () => {
        const response = await makeRequest({ url: `${APP_URL}/auth/status` });

        if (response.statusCode !== 200) {
            throw new Error(`Expected 200, got ${response.statusCode}`);
        }

        const { data: json } = validateJsonResponse(response.data, ['connected']);

        const status = json.connected ? 'connected' : 'disconnected';
        return `Auth status: ${status}`;
    });

    // Test /quota endpoint
    await testWithRetry('Rate Limit Quota (/quota)', async () => {
        const response = await makeRequest({ url: `${APP_URL}/quota` });

        if (response.statusCode !== 200) {
            throw new Error(`Expected 200, got ${response.statusCode}`);
        }

        const { data: json } = validateJsonResponse(response.data, ['remaining']);

        return `Quota remaining: ${json.remaining}`;
    });
}

async function testUsersAPI() {
    logHeader('USERS API TESTS');

    // Test GET /users
    await testWithRetry('Get Users List (/users)', async () => {
        const response = await makeRequest({ url: `${APP_URL}/users` });

        if (response.statusCode !== 200) {
            throw new Error(`Expected 200, got ${response.statusCode}`);
        }

        const { data: json } = validateJsonResponse(response.data);

        if (!Array.isArray(json)) {
            throw new Error('Response should be an array');
        }

        return `Retrieved ${json.length} users`;
    });

    // Test GET /users with search
    await testWithRetry('Search Users (/users?search=test)', async () => {
        const response = await makeRequest({
            url: `${APP_URL}/users?search=test`
        });

        if (response.statusCode !== 200) {
            throw new Error(`Expected 200, got ${response.statusCode}`);
        }

        const { data: json } = validateJsonResponse(response.data);

        if (!Array.isArray(json)) {
            throw new Error('Response should be an array');
        }

        return `Search returned ${json.length} users`;
    });

    // Test POST /users validation
    await testWithRetry('Create User Validation (/users)', async () => {
        const response = await makeRequest({
            url: `${APP_URL}/users`,
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: {} // Empty body should trigger validation error
        });

        if (response.statusCode !== 400) {
            throw new Error(`Expected 400 for validation error, got ${response.statusCode}`);
        }

        return 'User creation validation working correctly';
    });

    // Test POST /users with valid data
    await testWithRetry('Create User (/users)', async () => {
        const testUser = {
            username: `testuser_${Date.now()}`,
            tags: ['test'],
            notes: 'Created by API test'
        };

        const response = await makeRequest({
            url: `${APP_URL}/users`,
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: testUser
        });

        if (response.statusCode !== 200 && response.statusCode !== 201) {
            throw new Error(`Expected 200/201, got ${response.statusCode}`);
        }

        const { data: json } = validateJsonResponse(response.data, ['id', 'username']);

        return `Created user: ${json.username} (ID: ${json.id})`;
    });
}

async function testCORSSupport() {
    logHeader('CORS SUPPORT TESTS');

    // Test OPTIONS preflight request
    await testWithRetry('CORS Preflight (OPTIONS /users)', async () => {
        const response = await makeRequest({
            url: `${APP_URL}/users`,
            method: 'OPTIONS',
            headers: {
                'Origin': 'https://example.com',
                'Access-Control-Request-Method': 'GET'
            }
        });

        if (response.statusCode !== 204) {
            throw new Error(`Expected 204 for OPTIONS, got ${response.statusCode}`);
        }

        return 'CORS preflight request handled correctly';
    });

    // Test CORS headers on actual request
    await testWithRetry('CORS Headers (GET /health)', async () => {
        const response = await makeRequest({
            url: `${APP_URL}/health`,
            headers: { 'Origin': 'https://example.com' }
        });

        const corsHeaders = [
            'access-control-allow-origin',
            'access-control-allow-credentials',
            'access-control-allow-methods'
        ];

        for (const header of corsHeaders) {
            if (!response.headers[header]) {
                throw new Error(`Missing CORS header: ${header}`);
            }
        }

        return 'CORS headers present on response';
    });
}

async function testRedditAutomationAPI() {
    logHeader('REDDIT AUTOMATION API TESTS');

    // Test voting action endpoint (should require auth)
    await testWithRetry('Vote Action (/ms/v1/action/vote)', async () => {
        const votePayload = {
            targetId: 't3_test123',
            targetType: 'post',
            direction: 'up',
            voteMode: 'absolute',
            voteCount: 1
        };

        const response = await makeRequest({
            url: `${APP_URL}/ms/v1/action/vote`,
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: votePayload
        });

        // Should return 401 (unauthorized) or 400 (validation)
        if (response.statusCode !== 401 && response.statusCode !== 400) {
            throw new Error(`Expected 401 or 400, got ${response.statusCode}`);
        }

        return 'Vote action endpoint responding correctly';
    });

    // Test automation start endpoint
    await testWithRetry('Start Automation (/ms/v1/automation/start)', async () => {
        const automationPayload = {
            targetId: 't3_test123',
            targetType: 'post',
            mode: 'absolute',
            voteCount: 3
        };

        const response = await makeRequest({
            url: `${APP_URL}/ms/v1/automation/start`,
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: automationPayload
        });

        if (response.statusCode !== 401 && response.statusCode !== 400) {
            throw new Error(`Expected 401 or 400, got ${response.statusCode}`);
        }

        return 'Automation start endpoint responding correctly';
    });

    // Test automation status endpoint
    await testWithRetry('Automation Status (/ms/v1/automation/status/:id)', async () => {
        const response = await makeRequest({
            url: `${APP_URL}/ms/v1/automation/status/t3_test123`
        });

        if (response.statusCode !== 401 && response.statusCode !== 200) {
            throw new Error(`Expected 401 or 200, got ${response.statusCode}`);
        }

        return 'Automation status endpoint responding correctly';
    });

    // Test keywords list endpoint
    await testWithRetry('Keywords List (/ms/v1/lists/keywords)', async () => {
        const response = await makeRequest({
            url: `${APP_URL}/ms/v1/lists/keywords?action=list`
        });

        if (response.statusCode !== 200 && response.statusCode !== 401) {
            throw new Error(`Expected 200 or 401, got ${response.statusCode}`);
        }

        if (response.statusCode === 200) {
            const { data: json } = validateJsonResponse(response.data);
            if (!Array.isArray(json)) {
                throw new Error('Keywords response should be an array');
            }
            return `Retrieved ${json.length} keywords`;
        }

        return 'Keywords endpoint responding correctly';
    });

    // Test content tracking endpoint
    await testWithRetry('Content Tracking (/ms/v1/track/content)', async () => {
        const trackPayload = {
            fullname: 't3_test123',
            type: 'post',
            username: 'testuser',
            subreddit: 'testsub',
            title: 'Test Post',
            score: 10
        };

        const response = await makeRequest({
            url: `${APP_URL}/ms/v1/track/content`,
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: trackPayload
        });

        if (response.statusCode !== 200 && response.statusCode !== 401 && response.statusCode !== 400) {
            throw new Error(`Expected 200, 401, or 400, got ${response.statusCode}`);
        }

        return 'Content tracking endpoint responding correctly';
    });
}

async function testErrorHandling() {
    logHeader('ERROR HANDLING TESTS');

    // Test 404 for non-existent endpoint
    await testWithRetry('404 Error Handling', async () => {
        const response = await makeRequest({
            url: `${APP_URL}/nonexistent-endpoint-12345`
        });

        if (response.statusCode !== 404) {
            throw new Error(`Expected 404, got ${response.statusCode}`);
        }

        return '404 error handling working correctly';
    });

    // Test invalid HTTP method
    await testWithRetry('405 Method Not Allowed', async () => {
        const response = await makeRequest({
            url: `${APP_URL}/health`,
            method: 'PATCH'
        });

        if (response.statusCode !== 405 && response.statusCode !== 404) {
            throw new Error(`Expected 405 or 404, got ${response.statusCode}`);
        }

        return 'Method not allowed handling working correctly';
    });

    // Test malformed JSON
    await testWithRetry('Malformed JSON Handling', async () => {
        const response = await makeRequest({
            url: `${APP_URL}/users`,
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: '{invalid json'
        });

        if (response.statusCode !== 400 && response.statusCode !== 422) {
            throw new Error(`Expected 400 or 422, got ${response.statusCode}`);
        }

        return 'Malformed JSON handling working correctly';
    });
}

async function testPerformance() {
    logHeader('PERFORMANCE TESTS');

    // Test response time for health endpoint
    await testWithRetry('Health Endpoint Performance', async () => {
        const startTime = Date.now();

        const response = await makeRequest({ url: `${APP_URL}/health` });

        const endTime = Date.now();
        const responseTime = endTime - startTime;

        if (response.statusCode !== 200) {
            throw new Error(`Expected 200, got ${response.statusCode}`);
        }

        if (responseTime > 5000) {
            throw new Error(`Response too slow: ${responseTime}ms`);
        }

        return `Health endpoint responded in ${responseTime}ms`;
    });

    // Test concurrent requests
    await testWithRetry('Concurrent Requests', async () => {
        const promises = [];
        const numRequests = 5;

        for (let i = 0; i < numRequests; i++) {
            promises.push(makeRequest({ url: `${APP_URL}/health` }));
        }

        const startTime = Date.now();
        const responses = await Promise.all(promises);
        const endTime = Date.now();

        const avgResponseTime = (endTime - startTime) / numRequests;

        for (const response of responses) {
            if (response.statusCode !== 200) {
                throw new Error(`Request failed with status ${response.statusCode}`);
            }
        }

        return `Average response time for ${numRequests} concurrent requests: ${avgResponseTime.toFixed(2)}ms`;
    });
}

async function generateReport() {
    logHeader('FINAL TEST REPORT');

    console.log('');
    console.log('API Functionality Test Results:');
    console.log('===============================');
    console.log(`Total Tests Run: ${totalTests}`);
    console.log(`✅ Passed: ${passedTests}`);
    console.log(`❌ Failed: ${failedTests}`);

    const successRate = totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0;
    console.log(`Success Rate: ${successRate}%`);

    console.log('');
    if (successRate >= 90) {
        log(colors.green, 'SUCCESS', '🎉 EXCELLENT: API functionality is working very well!');
    } else if (successRate >= 75) {
        log(colors.yellow, 'WARNING', '⚠️  GOOD: API is mostly functional but has some issues');
    } else {
        log(colors.red, 'ERROR', '❌ POOR: API has significant functionality issues');
    }

    console.log('');
    console.log('Recommendations:');
    if (failedTests > 0) {
        console.log('- Review failed tests and fix underlying issues');
        console.log('- Check server logs for error details');
        console.log('- Verify authentication and authorization setup');
    } else {
        console.log('- All API endpoints are responding correctly');
        console.log('- Consider adding integration tests with authentication');
        console.log('- Monitor performance metrics in production');
    }
}

// Main execution
async function main() {
    const args = process.argv.slice(2);

    logHeader('MAGIC SAUCE API FUNCTIONALITY TESTS');
    logInfo(`Target URL: ${APP_URL}`);
    console.log('');

    try {
        // Run all test suites
        await testHealthEndpoints();
        await testAuthAndStatusEndpoints();
        await testUsersAPI();
        await testCORSSupport();
        await testRedditAutomationAPI();
        await testErrorHandling();
        await testPerformance();

        await generateReport();

    } catch (error) {
        logError(`Test suite failed: ${error.message}`);
        process.exit(1);
    }
}

// Handle command line arguments
if (require.main === module) {
    if (process.argv.includes('--help') || process.argv.includes('-h')) {
        console.log('Magic Sauce API Functionality Tests');
        console.log('');
        console.log('Usage: node api-functionality-tests.js [OPTIONS]');
        console.log('');
        console.log('Options:');
        console.log('  --url URL       Test a different URL (default: https://magic-sauce.addiaire.com)');
        console.log('  --timeout MS    Request timeout in milliseconds (default: 30000)');
        console.log('  --help, -h      Show this help message');
        console.log('');
        console.log('Examples:');
        console.log('  node api-functionality-tests.js');
        console.log('  node api-functionality-tests.js --url https://staging.example.com');
        process.exit(0);
    }

    // Check for custom URL
    const urlIndex = process.argv.indexOf('--url');
    if (urlIndex !== -1 && process.argv[urlIndex + 1]) {
        global.APP_URL = process.argv[urlIndex + 1];
    }

    main();
}

module.exports = {
    makeRequest,
    testWithRetry,
    validateJsonResponse
};
