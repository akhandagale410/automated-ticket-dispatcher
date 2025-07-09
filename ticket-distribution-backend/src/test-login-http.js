const axios = require('axios');

async function testAgentLogin() {
  try {
    console.log('🧪 Testing agent login via HTTP...');
    
    const loginData = {
      email: 'agent@company.com',
      password: 'agent123'
    };

    console.log('📡 Sending login request...');
    console.log('URL: http://localhost:3000/api/auth/login');
    console.log('Data:', loginData);

    const response = await axios.post('http://localhost:3000/api/auth/login', loginData);
    
    console.log('✅ Login successful!');
    console.log('Response:', response.data);
    
  } catch (error) {
    console.error('❌ Login failed:');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Data:', error.response.data);
    } else {
      console.log('Error:', error.message);
    }
  }
}

// Test after a short delay to ensure server is running
setTimeout(testAgentLogin, 2000);
