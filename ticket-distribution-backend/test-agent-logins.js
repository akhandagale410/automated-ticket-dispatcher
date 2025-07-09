const http = require('http');

function testLogin(email, password) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({ email, password });

    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    console.log(`🔍 Testing login for: ${email}`);

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          if (res.statusCode === 200) {
            console.log(`✅ Login successful for ${email}`);
            console.log(`   Role: ${response.user.role}`);
            console.log(`   Token: ${response.token.substring(0, 20)}...`);
            resolve(response);
          } else {
            console.log(`❌ Login failed for ${email}: ${response.message}`);
            reject(new Error(response.message));
          }
        } catch (e) {
          console.log(`❌ Invalid response for ${email}:`, data);
          reject(new Error('Invalid response'));
        }
      });
    });

    req.on('error', (e) => {
      console.error(`❌ Network error for ${email}: ${e.message}`);
      reject(e);
    });

    req.write(postData);
    req.end();
  });
}

async function testAllAgents() {
  console.log('🧪 Testing Agent Login...');
  console.log('💡 Make sure the backend server is running and agents are created');
  console.log('');

  const testCases = [
    { email: 'agent@company.com', password: 'agent123' },
    { email: 'sarah.support@company.com', password: 'agent123' },
    { email: 'admin@company.com', password: 'admin123' }
  ];

  for (const testCase of testCases) {
    try {
      await testLogin(testCase.email, testCase.password);
    } catch (error) {
      // Error already logged in testLogin
    }
    console.log(''); // Empty line between tests
  }

  console.log('🏁 Test completed');
}

testAllAgents();
