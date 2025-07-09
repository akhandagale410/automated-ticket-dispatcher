const axios = require('axios');

async function testAllTicketEndpoints() {
  console.log('🧪 COMPREHENSIVE TICKETS ENDPOINT TEST');
  console.log('======================================\n');

  const baseURL = 'http://localhost:3000';

  try {
    // Test 1: Server health check
    console.log('📋 Step 1: Testing server health...');
    try {
      const healthResponse = await axios.get(`${baseURL}/api/health`);
      console.log('✅ Server is running');
      console.log('Available endpoints:', healthResponse.data.endpoints?.slice(0, 5) || 'Listed in response');
    } catch (error) {
      console.log('❌ Server not running. Start it with: node src/app.js or node src/testTicketsServer.js');
      return;
    }

    // Test 2: Public tickets endpoints (no auth required)
    console.log('\n📋 Step 2: Testing public tickets endpoints...');
    
    const publicEndpoints = [
      '/api/tickets/public/all',
      '/api/tickets/public/stats',
      '/api/tickets/public/stats/dashboard',
      '/api/tickets/public/stats/aging'
    ];

    for (const endpoint of publicEndpoints) {
      try {
        const response = await axios.get(`${baseURL}${endpoint}`);
        console.log(`✅ ${endpoint} - Status: ${response.status}`);
        
        if (endpoint.includes('/all')) {
          console.log(`   Found ${response.data.count || 0} tickets`);
        } else if (endpoint.includes('/stats')) {
          console.log(`   Stats data keys: ${Object.keys(response.data).join(', ')}`);
        }
      } catch (error) {
        console.log(`❌ ${endpoint} - Error: ${error.response?.status} ${error.response?.data?.message || error.message}`);
      }
    }

    // Test 3: Protected endpoints (should require auth)
    console.log('\n📋 Step 3: Testing protected endpoints (should require auth)...');
    
    const protectedEndpoints = [
      '/api/tickets',
      '/api/tickets/stats/dashboard',
      '/api/tickets/stats/aging'
    ];

    for (const endpoint of protectedEndpoints) {
      try {
        await axios.get(`${baseURL}${endpoint}`);
        console.log(`⚠️  ${endpoint} - Unexpectedly accessible without auth`);
      } catch (error) {
        if (error.response?.status === 401) {
          console.log(`✅ ${endpoint} - Correctly requires authentication`);
        } else {
          console.log(`❌ ${endpoint} - Unexpected error: ${error.response?.status} ${error.response?.data?.message || error.message}`);
        }
      }
    }

    // Test 4: Login and test authenticated endpoints
    console.log('\n📋 Step 4: Testing authenticated endpoints...');
    
    try {
      // Login to get token
      const loginResponse = await axios.post(`${baseURL}/api/auth/login`, {
        email: 'customer@company.com',
        password: 'customer123'
      });
      
      const token = loginResponse.data.token;
      console.log('✅ Login successful, testing authenticated endpoints...');
      
      // Test authenticated endpoints
      const authHeaders = { Authorization: `Bearer ${token}` };
      
      for (const endpoint of protectedEndpoints) {
        try {
          const response = await axios.get(`${baseURL}${endpoint}`, { headers: authHeaders });
          console.log(`✅ ${endpoint} (authenticated) - Status: ${response.status}`);
          
          if (endpoint === '/api/tickets') {
            console.log(`   User tickets: ${response.data.tickets?.length || 0}`);
          } else if (endpoint.includes('stats')) {
            console.log(`   Stats keys: ${Object.keys(response.data).join(', ')}`);
          }
        } catch (error) {
          console.log(`❌ ${endpoint} (authenticated) - Error: ${error.response?.status} ${error.response?.data?.message || error.message}`);
        }
      }
      
    } catch (error) {
      console.log('❌ Login failed - cannot test authenticated endpoints');
      console.log('   Error:', error.response?.data?.message || error.message);
      console.log('   Make sure users exist: node src/createQuickUsers.js');
    }

    // Test 5: Create a test ticket (if authenticated)
    console.log('\n📋 Step 5: Testing ticket creation...');
    try {
      const loginResponse = await axios.post(`${baseURL}/api/auth/login`, {
        email: 'customer@company.com',
        password: 'customer123'
      });
      
      const token = loginResponse.data.token;
      const authHeaders = { Authorization: `Bearer ${token}` };
      
      const newTicket = {
        subject: 'Test Ticket from API',
        description: 'This is a test ticket created via API endpoint testing',
        priority: 'medium',
        type: 'incident',
        tags: ['test', 'api']
      };
      
      const createResponse = await axios.post(`${baseURL}/api/tickets`, newTicket, { headers: authHeaders });
      console.log('✅ Ticket creation successful');
      console.log(`   Created ticket: ${createResponse.data.ticket.subject}`);
      console.log(`   Ticket ID: ${createResponse.data.ticket._id}`);
      
    } catch (error) {
      console.log('❌ Ticket creation failed');
      console.log('   Error:', error.response?.data?.message || error.message);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }

  console.log('\n🎉 Comprehensive test completed!');
  console.log('\n💡 SUMMARY:');
  console.log('✅ Working endpoints to test in browser:');
  console.log('   - http://localhost:3000/api/health');
  console.log('   - http://localhost:3000/api/tickets/public/all');
  console.log('   - http://localhost:3000/api/tickets/public/stats');
  console.log('   - http://localhost:3000/api/tickets/public/stats/dashboard');
  console.log('   - http://localhost:3000/api/tickets/public/stats/aging');
  console.log('\n🔐 Protected endpoints (require login):');
  console.log('   - http://localhost:3000/api/tickets');
  console.log('   - http://localhost:3000/api/tickets/stats/dashboard');
  console.log('   - http://localhost:3000/api/tickets/stats/aging');
}

testAllTicketEndpoints();
