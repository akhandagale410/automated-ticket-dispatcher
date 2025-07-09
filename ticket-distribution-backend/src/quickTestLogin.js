const axios = require('axios');

async function quickTestLogin() {
  console.log('🧪 QUICK LOGIN TEST');
  console.log('==================\n');

  const baseURL = 'http://localhost:3000';
  const testCredentials = {
    email: 'customer@company.com',
    password: 'customer123'
  };

  try {
    // Test 1: Health check
    console.log('📋 Step 1: Testing server health...');
    const healthResponse = await axios.get(`${baseURL}/api/health`);
    console.log('✅ Server is running:', healthResponse.data);

    // Test 2: List users
    console.log('\n📋 Step 2: Checking available users...');
    const usersResponse = await axios.get(`${baseURL}/api/users`);
    console.log(`✅ Found ${usersResponse.data.users.length} users:`);
    usersResponse.data.users.forEach(user => {
      console.log(`   - ${user.first_name} ${user.last_name} (${user.email}) - ${user.role}`);
    });

    // Test 3: Login
    console.log('\n📋 Step 3: Testing login...');
    console.log('Credentials:', testCredentials);
    
    const loginResponse = await axios.post(`${baseURL}/api/auth/login`, testCredentials);
    console.log('✅ LOGIN SUCCESSFUL!');
    console.log('Response:', JSON.stringify(loginResponse.data, null, 2));

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n🔧 Server is not running. Start it with:');
      console.log('node src/quickTestServer.js');
    }
  }
}

quickTestLogin();
