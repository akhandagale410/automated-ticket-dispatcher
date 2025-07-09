const http = require('http');

const postData = JSON.stringify({});

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/auth/setup-agents',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

console.log('🔧 Calling setup-agents endpoint...');

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  console.log(`Headers: ${JSON.stringify(res.headers)}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const response = JSON.parse(data);
      console.log('✅ Response:', JSON.stringify(response, null, 2));
    } catch (e) {
      console.log('Response:', data);
    }
  });
});

req.on('error', (e) => {
  console.error(`❌ Error: ${e.message}`);
  console.log('💡 Make sure the backend server is running on port 3000');
});

req.write(postData);
req.end();
