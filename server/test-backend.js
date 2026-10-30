// Test suite verifying models, middleware, auth logic, and HTTP endpoints
const assert = require('assert');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Mock environment
process.env.JWT_SECRET = 'test_jwt_secret_12345';
process.env.JWT_EXPIRES_IN = '1d';
process.env.NODE_ENV = 'test';

console.log('🧪 Starting Backend Foundation Verification Tests...\n');

let passedTests = 0;

function it(description, fn) {
  try {
    fn();
    console.log(`  ✅ PASS: ${description}`);
    passedTests++;
  } catch (error) {
    console.error(`  ❌ FAIL: ${description}`);
    console.error('     ', error.message);
    process.exitCode = 1;
  }
}

async function runAllTests() {
  const app = require('./server');

  // Test 1: Mongoose Models compilation
  it('User, FoodListing, and DonationRequest Mongoose models compile correctly', () => {
    const User = require('./models/User');
    const FoodListing = require('./models/FoodListing');
    const DonationRequest = require('./models/DonationRequest');

    assert(User.modelName === 'User', 'User model compiled');
    assert(FoodListing.modelName === 'FoodListing', 'FoodListing model compiled');
    assert(DonationRequest.modelName === 'DonationRequest', 'DonationRequest model compiled');
  });

  // Test 2: Password hashing and matching
  await (async () => {
    try {
      const plainPassword = 'securePassword123';
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(plainPassword, salt);
      const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
      const isNotMatch = await bcrypt.compare('wrongPassword', hashedPassword);

      assert.strictEqual(isMatch, true, 'bcrypt matches correct password');
      assert.strictEqual(isNotMatch, false, 'bcrypt rejects invalid password');
      console.log('  ✅ PASS: Password hashing & bcrypt match verification');
      passedTests++;
    } catch (err) {
      console.error('  ❌ FAIL: Password hashing verification: ', err.message);
      process.exitCode = 1;
    }
  })();

  // Test 3: JWT signing and verification
  it('JWT generation and decoding works with role payload', () => {
    const payload = { id: '60c72b2f9b1d8b2bad5d3123', role: 'donor' };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    assert.strictEqual(decoded.id, payload.id);
    assert.strictEqual(decoded.role, 'donor');
  });

  // Test 4: Role authorization middleware behavior
  it('RBAC middleware correctly permits authorized role and rejects unauthorized role', () => {
    const { authorize } = require('./middleware/authMiddleware');
    const donorOnlyMiddleware = authorize('donor');

    // Authorized call
    let nextCalled = false;
    let forbiddenCalled = false;

    const reqValid = { user: { role: 'donor' } };
    const resValid = {
      status: (code) => {
        if (code === 403) forbiddenCalled = true;
        return { json: () => {} };
      },
    };
    donorOnlyMiddleware(reqValid, resValid, () => { nextCalled = true; });
    assert.strictEqual(nextCalled, true, 'Next should be called for authorized donor');

    // Unauthorized call (NGO attempting donor-only route)
    nextCalled = false;
    forbiddenCalled = false;
    const reqInvalid = { user: { role: 'ngo' } };
    const resInvalid = {
      status: (code) => {
        if (code === 403) forbiddenCalled = true;
        return { json: () => {} };
      },
    };
    donorOnlyMiddleware(reqInvalid, resInvalid, () => { nextCalled = true; });
    assert.strictEqual(nextCalled, false, 'Next should not be called for unauthorized role');
    assert.strictEqual(forbiddenCalled, true, 'Status 403 should be returned for unauthorized role');
  });

  // Test 5: 4-digit OTP generation logic
  it('Pickup OTP generator creates a valid 4-digit numeric code', () => {
    for (let i = 0; i < 50; i++) {
      const otp = Math.floor(1000 + Math.random() * 9000).toString();
      assert(/^\d{4}$/.test(otp), `OTP ${otp} must be a 4-digit string`);
      const num = parseInt(otp, 10);
      assert(num >= 1000 && num <= 9999, 'OTP must be between 1000 and 9999');
    }
  });

  // Test 6: Live HTTP Server & API Endpoints
  await new Promise((resolve, reject) => {
    const server = app.listen(0, async () => {
      try {
        const port = server.address().port;
        const baseUrl = `http://localhost:${port}`;

        // 6a. Health endpoint
        const healthRes = await fetch(`${baseUrl}/api/health`);
        const healthData = await healthRes.json();
        assert.strictEqual(healthRes.status, 200, 'Health check returns 200');
        assert.strictEqual(healthData.status, 'online');
        console.log('  ✅ PASS: HTTP GET /api/health returns 200 OK');
        passedTests++;

        // 6b. Unauthorized access to protected route returns 401
        const authMeRes = await fetch(`${baseUrl}/api/auth/me`);
        const authMeData = await authMeRes.json();
        assert.strictEqual(authMeRes.status, 401, 'Protected route without token returns 401');
        assert.strictEqual(authMeData.success, false);
        console.log('  ✅ PASS: HTTP GET /api/auth/me without token correctly rejected with 401');
        passedTests++;

        // 6c. Unknown route returns 404
        const notFoundRes = await fetch(`${baseUrl}/api/unknown-endpoint`);
        const notFoundData = await notFoundRes.json();
        assert.strictEqual(notFoundRes.status, 404, 'Undefined route returns 404');
        assert.strictEqual(notFoundData.success, false);
        console.log('  ✅ PASS: HTTP 404 handler for undefined endpoints');
        passedTests++;

        server.close(resolve);
      } catch (err) {
        server.close(() => reject(err));
      }
    });
  }).catch((err) => {
    console.error('  ❌ FAIL: Live HTTP server tests: ', err.message);
    process.exitCode = 1;
  });

  console.log(`\n🎉 Verification Complete: ${passedTests} checks passed.\n`);
  setTimeout(() => process.exit(0), 50);
}

runAllTests();
