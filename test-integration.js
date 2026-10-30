// End-to-End Integration Verification Script
const assert = require('assert');

const BASE_URL = 'http://localhost:5000/api';

async function runE2ETests() {
  console.log('🚀 Running Full E2E Frontend-Backend Integration Test Suite...\n');
  let passed = 0;

  async function testStep(name, fn) {
    try {
      await fn();
      console.log(`  ✅ PASS: ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ❌ FAIL: ${name}`);
      console.error(`     Error: ${err.message}`);
      process.exitCode = 1;
    }
  }

  let donorToken, ngoToken, adminToken;
  let createdListingId;
  let createdRequestId;
  let generatedOtp;
  let newNgoUserId;

  const testEmailDonor = `hotel_${Date.now()}@test.com`;
  const testEmailNgo = `charity_${Date.now()}@test.com`;

  // 1. Health check
  await testStep('1. Backend /api/health endpoint responds', async () => {
    const res = await fetch(`${BASE_URL}/health`);
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.status, 'online');
  });

  // 2. Register new Donor
  await testStep('2. Donor registration creates user in DB and returns JWT', async () => {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Chef Vikas Khanna',
        organizationName: 'Emerald Banquet Hall',
        email: testEmailDonor,
        password: 'password123',
        role: 'donor',
        phone: '+91 9988776655',
        city: 'Bangalore',
        street: '100 Feet Road, Indiranagar',
      }),
    });
    const data = await res.json();
    assert.strictEqual(res.status, 201);
    assert.strictEqual(data.success, true);
    assert(data.token, 'Token returned');
    assert.strictEqual(data.user.role, 'donor');
    donorToken = data.token;
  });

  // 3. Register new NGO
  await testStep('3. NGO registration creates user in DB and returns JWT', async () => {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Arjun Das',
        organizationName: 'Care & Nourish Foundation',
        email: testEmailNgo,
        password: 'password123',
        role: 'ngo',
        phone: '+91 9911223344',
        city: 'Bangalore',
        street: 'Koramangala 5th Block',
      }),
    });
    const data = await res.json();
    assert.strictEqual(res.status, 201);
    assert.strictEqual(data.success, true);
    assert(data.token, 'Token returned');
    assert.strictEqual(data.user.role, 'ngo');
    ngoToken = data.token;
    newNgoUserId = data.user._id;
  });

  // 4. Test Invalid Login rejection
  await testStep('4. Login with invalid password fails with 401', async () => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmailDonor,
        password: 'wrong_password',
      }),
    });
    const data = await res.json();
    assert.strictEqual(res.status, 401);
    assert.strictEqual(data.success, false);
  });

  // 5. Donor creates food listing
  await testStep('5. Donor creates a new food listing via POST /api/listings', async () => {
    const expiry = new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString();
    const res = await fetch(`${BASE_URL}/listings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${donorToken}`,
      },
      body: JSON.stringify({
        title: 'Fresh Biryani & Gulab Jamun (Post-Wedding Banquet Surplus)',
        foodType: 'Cooked Meals',
        dietaryType: 'Veg',
        quantityValue: 75,
        quantityUnit: 'servings',
        bestBefore: expiry,
        pickupCity: 'Bangalore',
        pickupPhone: '+91 9988776655',
        specialNotes: 'Freshly prepared. Packed in thermal containers.',
      }),
    });
    const data = await res.json();
    assert.strictEqual(res.status, 201);
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.listing.status, 'available');
    createdListingId = data.listing._id;
  });

  // 6. NGO browses food feed and sees newly created listing
  await testStep('6. Public / NGO listings feed displays newly created listing', async () => {
    const res = await fetch(`${BASE_URL}/listings`);
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert(data.listings.some((l) => l._id === createdListingId));
  });

  // 7. NGO claims the food
  await testStep('7. NGO submits claim request via POST /api/requests', async () => {
    const res = await fetch(`${BASE_URL}/requests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ngoToken}`,
      },
      body: JSON.stringify({
        listingId: createdListingId,
        pickupEta: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
        notes: 'Arriving with temperature controlled van.',
      }),
    });
    const data = await res.json();
    assert.strictEqual(res.status, 201);
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.request.status, 'pending');
    createdRequestId = data.request._id;
  });

  // 8. Prevent duplicate claims by the same NGO
  await testStep('8. Backend rejects duplicate active claim for same listing', async () => {
    const res = await fetch(`${BASE_URL}/requests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ngoToken}`,
      },
      body: JSON.stringify({
        listingId: createdListingId,
        pickupEta: new Date().toISOString(),
      }),
    });
    const data = await res.json();
    assert.strictEqual(res.status, 400);
    assert.strictEqual(data.success, false);
  });

  // 9. Donor views incoming requests
  await testStep('9. Donor views incoming claims via GET /api/requests/donor', async () => {
    const res = await fetch(`${BASE_URL}/requests/donor`, {
      headers: { Authorization: `Bearer ${donorToken}` },
    });
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert(data.requests.some((r) => r._id === createdRequestId));
  });

  // 10. Donor accepts request -> Generates 4-digit OTP
  await testStep('10. Donor accepts request, listing becomes reserved, 4-digit OTP issued', async () => {
    const res = await fetch(`${BASE_URL}/requests/${createdRequestId}/accept`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${donorToken}` },
    });
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.request.status, 'accepted');
    assert(data.request.pickupOtp, 'pickupOtp should be present');
    assert(/^\d{4}$/.test(data.request.pickupOtp), 'OTP must be 4 digits');
    generatedOtp = data.request.pickupOtp;
  });

  // 11. NGO views OTP in their dashboard
  await testStep('11. NGO dashboard fetches requests and reveals the 4-digit pickup code', async () => {
    const res = await fetch(`${BASE_URL}/requests/ngo`, {
      headers: { Authorization: `Bearer ${ngoToken}` },
    });
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    const target = data.requests.find((r) => r._id === createdRequestId);
    assert.strictEqual(target.pickupOtp, generatedOtp);
  });

  // 12. Invalid OTP rejection
  await testStep('12. Handover with incorrect OTP fails with 400', async () => {
    const res = await fetch(`${BASE_URL}/requests/${createdRequestId}/verify-pickup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${donorToken}`,
      },
      body: JSON.stringify({ otp: '0000' }),
    });
    const data = await res.json();
    assert.strictEqual(res.status, 400);
    assert.strictEqual(data.success, false);
  });

  // 13. Correct OTP Handover verification
  await testStep('13. Correct OTP verification transitions donation & listing to completed', async () => {
    const res = await fetch(`${BASE_URL}/requests/${createdRequestId}/verify-pickup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${donorToken}`,
      },
      body: JSON.stringify({ otp: generatedOtp }),
    });
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.request.status, 'completed');

    // Verify listing is now completed
    const listingRes = await fetch(`${BASE_URL}/listings/${createdListingId}`);
    const listingData = await listingRes.json();
    assert.strictEqual(listingData.listing.status, 'completed');
  });

  // 14. Admin Login & Metrics verification
  await testStep('14. Admin authentication and platform metrics computation', async () => {
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@foodshare.org',
        password: 'adminpassword123',
      }),
    });
    const loginData = await loginRes.json();
    assert.strictEqual(loginRes.status, 200);
    adminToken = loginData.token;

    const metricsRes = await fetch(`${BASE_URL}/admin/metrics`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const metricsData = await metricsRes.json();
    assert.strictEqual(metricsRes.status, 200);
    assert(metricsData.stats.totalServingsSaved >= 75, 'Servings incremented');
  });

  // 15. Admin User Verification Toggle
  await testStep('15. Admin toggles NGO verification status via PATCH /api/admin/verify-user/:id', async () => {
    const res = await fetch(`${BASE_URL}/admin/verify-user/${newNgoUserId}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.user.isVerified, true);
  });

  // 16. Security & RBAC: Non-admin accessing admin route is forbidden
  await testStep('16. Non-admin accessing admin endpoint is forbidden (403)', async () => {
    const res = await fetch(`${BASE_URL}/admin/metrics`, {
      headers: { Authorization: `Bearer ${donorToken}` },
    });
    assert.strictEqual(res.status, 403);
  });

  console.log(`\n🎉 E2E Verification Complete: ${passed} out of 16 tests passed successfully!\n`);
}

runE2ETests();
