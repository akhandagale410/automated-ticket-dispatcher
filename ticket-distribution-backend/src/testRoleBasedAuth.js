const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

async function testRoleBasedLogin() {
  try {
    console.log('🧪 Testing Role-Based Authentication...\n');

    // Test data for different roles
    const testUsers = [
      {
        email: 'admin@company.com',
        password: 'admin123',
        expectedRole: 'admin',
        expectedDashboard: '/admin-dashboard'
      },
      {
        email: 'agent@company.com',
        password: 'agent123',
        expectedRole: 'agent',
        expectedDashboard: '/agent-dashboard'
      },
      {
        email: 'customer@company.com',
        password: 'customer123',
        expectedRole: 'customer',
        expectedDashboard: '/dashboard'
      }
    ];

    for (const testUser of testUsers) {
      try {
        console.log(`🔐 Testing ${testUser.expectedRole.toUpperCase()} login...`);
        console.log(`Email: ${testUser.email}`);
        
        const response = await axios.post(`${BASE_URL}/auth/login`, {
          email: testUser.email,
          password: testUser.password
        });

        if (response.data.user && response.data.user.role === testUser.expectedRole) {
          console.log(`✅ ${testUser.expectedRole.toUpperCase()} login successful!`);
          console.log(`   - User: ${response.data.user.first_name} ${response.data.user.last_name}`);
          console.log(`   - Role: ${response.data.user.role}`);
          console.log(`   - Expected Dashboard: ${testUser.expectedDashboard}`);
          console.log(`   - Token: ${response.data.token.substring(0, 20)}...`);
        } else {
          console.log(`❌ Role mismatch for ${testUser.email}`);
        }
      } catch (error) {
        console.log(`❌ Login failed for ${testUser.email}:`, error.response?.data?.message || error.message);
      }
      
      console.log(''); // Empty line for spacing
    }

    console.log('='.repeat(50));
    console.log('🎯 ROLE-BASED DASHBOARD ROUTING:');
    console.log('');
    console.log('ADMIN Dashboard:    http://localhost:4200/admin-dashboard');
    console.log('AGENT Dashboard:    http://localhost:4200/agent-dashboard');
    console.log('CUSTOMER Dashboard: http://localhost:4200/dashboard');
    console.log('');
    console.log('Login with the credentials above to test each dashboard!');

  } catch (error) {
    console.error('❌ Error during role-based testing:', error.message);
  }
}

// Run the test
testRoleBasedLogin();
