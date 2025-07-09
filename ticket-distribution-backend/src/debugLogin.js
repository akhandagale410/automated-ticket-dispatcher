const axios = require('axios');

async function testLogin() {
  try {
    console.log('🧪 Testing login endpoint...\n');

    // Test data
    const testCredentials = {
      email: 'customer@company.com',
      password: 'customer123'
    };

    console.log('Sending request to: http://localhost:3000/api/auth/login');
    console.log('Request body:', JSON.stringify(testCredentials, null, 2));
    console.log('---');

    const response = await axios.post('http://localhost:3000/api/auth/login', testCredentials, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Login successful!');
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(response.data, null, 2));

  } catch (error) {
    console.log('❌ Login failed!');
    console.log('Error status:', error.response?.status);
    console.log('Error message:', error.response?.data?.message || error.message);
    console.log('Full error response:', JSON.stringify(error.response?.data, null, 2));
  }
}

testLogin();
