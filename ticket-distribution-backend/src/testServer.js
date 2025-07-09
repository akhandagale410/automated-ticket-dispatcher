const axios = require('axios');

async function testServer() {
  try {
    console.log('🔍 Testing server health...');
    
    const response = await axios.get('http://localhost:3000/api/health', {
      timeout: 5000
    });
    
    console.log('✅ Server is running!');
    console.log('Status:', response.status);
    console.log('Response:', response.data);
    
    // Now test auth endpoint structure
    console.log('\n🔍 Testing auth endpoint...');
    
    try {
      await axios.post('http://localhost:3000/api/auth/login', {
        email: 'test@test.com',
        password: 'test'
      });
    } catch (authError) {
      console.log('Auth endpoint response status:', authError.response?.status);
      console.log('Auth endpoint error:', authError.response?.data);
      
      if (authError.response?.status === 400) {
        console.log('\n📋 This is expected - endpoint is working but user doesn\'t exist');
      }
    }
    
  } catch (error) {
    console.error('❌ Server connection failed:', error.message);
    console.log('\n🔧 Make sure the server is running:');
    console.log('npm start');
  }
}

testServer();
