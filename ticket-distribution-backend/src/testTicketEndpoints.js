const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

// Test user credentials
const testUsers = [
  { email: 'customer1@example.com', password: 'password123', role: 'customer' },
  { email: 'customer2@example.com', password: 'password123', role: 'customer' },
  { email: 'agent1@example.com', password: 'password123', role: 'agent' },
  { email: 'admin1@example.com', password: 'password123', role: 'admin' }
];

async function testLogin(user) {
  try {
    console.log(`\n🧪 Testing login for ${user.email} (${user.role})`);
    
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      email: user.email,
      password: user.password
    });
    
    console.log(`  ✅ Login successful`);
    return response.data.token;
  } catch (error) {
    console.log(`  ❌ Login failed: ${error.response?.data?.message || error.message}`);
    return null;
  }
}

async function testTicketsEndpoint(token, userEmail) {
  try {
    console.log(`  🎯 Testing GET /api/tickets for ${userEmail}`);
    
    const response = await axios.get(`${BASE_URL}/tickets`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log(`  ✅ GET /api/tickets successful - Found ${response.data.length} tickets`);
    return true;
  } catch (error) {
    console.log(`  ❌ GET /api/tickets failed: ${error.response?.status} ${error.response?.data?.message || error.message}`);
    return false;
  }
}

async function testStatsEndpoint(token, userEmail) {
  try {
    console.log(`  📊 Testing GET /api/tickets/stats/dashboard for ${userEmail}`);
    
    const response = await axios.get(`${BASE_URL}/tickets/stats/dashboard`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log(`  ✅ GET /api/tickets/stats/dashboard successful`);
    console.log(`    Total tickets: ${response.data.totalTickets}`);
    console.log(`    Open tickets: ${response.data.openTickets}`);
    return true;
  } catch (error) {
    console.log(`  ❌ GET /api/tickets/stats/dashboard failed: ${error.response?.status} ${error.response?.data?.message || error.message}`);
    return false;
  }
}

async function testPublicEndpoints() {
  console.log(`\n🌐 Testing public endpoints (no auth required)`);
  
  try {
    // Test public tickets
    const ticketsResponse = await axios.get(`${BASE_URL}/tickets/public`);
    console.log(`  ✅ GET /api/tickets/public successful - Found ${ticketsResponse.data.length} tickets`);
  } catch (error) {
    console.log(`  ❌ GET /api/tickets/public failed: ${error.response?.status} ${error.message}`);
  }
  
  try {
    // Test public stats
    const statsResponse = await axios.get(`${BASE_URL}/tickets/stats/public`);
    console.log(`  ✅ GET /api/tickets/stats/public successful`);
    console.log(`    Total tickets: ${statsResponse.data.totalTickets}`);
  } catch (error) {
    console.log(`  ❌ GET /api/tickets/stats/public failed: ${error.response?.status} ${error.message}`);
  }
}

async function runTests() {
  console.log('🚀 COMPREHENSIVE ENDPOINT TESTING');
  console.log('==================================');
  
  let totalTests = 0;
  let passedTests = 0;
  
  // Test public endpoints first
  await testPublicEndpoints();
  
  // Test each user
  for (const user of testUsers) {
    const token = await testLogin(user);
    
    if (token) {
      totalTests += 2;
      
      // Test tickets endpoint
      const ticketsResult = await testTicketsEndpoint(token, user.email);
      if (ticketsResult) passedTests++;
      
      // Test stats endpoint  
      const statsResult = await testStatsEndpoint(token, user.email);
      if (statsResult) passedTests++;
    }
  }
  
  console.log(`\n📈 TEST RESULTS:`);
  console.log(`  Total tests: ${totalTests}`);
  console.log(`  Passed: ${passedTests}`);
  console.log(`  Failed: ${totalTests - passedTests}`);
  console.log(`  Success rate: ${totalTests > 0 ? ((passedTests / totalTests) * 100).toFixed(1) : 0}%`);
  
  if (passedTests === totalTests) {
    console.log(`\n🎉 ALL TESTS PASSED! The 404 issue has been resolved.`);
  } else {
    console.log(`\n⚠️  Some tests failed. Check the output above for details.`);
  }
}

runTests().catch(error => {
  console.error('❌ Test execution error:', error.message);
  if (error.code === 'ECONNREFUSED') {
    console.log('\n💡 Make sure the backend server is running on http://localhost:3000');
    console.log('   Run: cd ticket-distribution-backend && npm start');
  }
});
