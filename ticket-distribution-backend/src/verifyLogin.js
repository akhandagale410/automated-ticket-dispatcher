const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const axios = require('axios');
const express = require('express');

// Import models and routes
const User = require('./models/User');
const connectDB = require('./db/connect');

async function verifyLoginSystem() {
  console.log('🔍 COMPREHENSIVE LOGIN VERIFICATION SYSTEM');
  console.log('==========================================\n');

  // Step 1: Test MongoDB Connection
  console.log('📋 STEP 1: Testing MongoDB Connection...');
  try {
    await connectDB();
    console.log('✅ MongoDB connection successful');
    
    // List all users
    const users = await User.find({}).select('-password');
    console.log(`✅ Found ${users.length} users in database`);
    
    if (users.length === 0) {
      console.log('⚠️  No users found - creating test users...');
      await createTestUsers();
    } else {
      console.log('📋 Existing users:');
      users.forEach(user => {
        console.log(`   - ${user.email} (${user.role})`);
      });
    }
  } catch (error) {
    console.log('❌ MongoDB connection failed:', error.message);
    console.log('🔧 Solution: Start MongoDB service');
    return false;
  }

  // Step 2: Start Test Server
  console.log('\n📋 STEP 2: Starting Test Server...');
  const serverStarted = await startTestServer();
  if (!serverStarted) {
    console.log('❌ Could not start server');
    return false;
  }

  // Step 3: Test Login Endpoint
  console.log('\n📋 STEP 3: Testing Login Endpoint...');
  await testLoginEndpoint();

  console.log('\n✅ VERIFICATION COMPLETE');
  process.exit(0);
}

async function createTestUsers() {
  try {
    const testUsers = [
      {
        first_name: 'Test',
        last_name: 'Customer',
        email: 'customer@company.com',
        password: await bcrypt.hash('customer123', 10),
        role: 'customer'
      },
      {
        first_name: 'Support',
        last_name: 'Agent',
        email: 'agent@company.com',
        password: await bcrypt.hash('agent123', 10),
        role: 'agent'
      },
      {
        first_name: 'System',
        last_name: 'Admin',
        email: 'admin@company.com',
        password: await bcrypt.hash('admin123', 10),
        role: 'admin'
      }
    ];

    await User.deleteMany({});
    await User.insertMany(testUsers);
    
    console.log('✅ Created test users:');
    testUsers.forEach(user => {
      console.log(`   - ${user.email} / ${user.email.includes('customer') ? 'customer123' : user.email.includes('agent') ? 'agent123' : 'admin123'} (${user.role})`);
    });
  } catch (error) {
    console.log('❌ Error creating test users:', error.message);
  }
}

async function startTestServer() {
  try {
    const app = express();
    
    // Middleware
    app.use(express.json());
    app.use(require('cors')());

    // Import and use auth routes
    app.use('/api/auth', require('./routes/auth'));

    // Health check
    app.get('/api/health', (req, res) => {
      res.json({ status: 'ok', message: 'Server running' });
    });

    const server = app.listen(3000, () => {
      console.log('✅ Test server started on port 3000');
    });

    // Wait a moment for server to fully start
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return true;
  } catch (error) {
    console.log('❌ Error starting server:', error.message);
    return false;
  }
}

async function testLoginEndpoint() {
  const testCases = [
    {
      name: 'Customer Login',
      email: 'customer@company.com',
      password: 'customer123',
      expectedRole: 'customer'
    },
    {
      name: 'Agent Login',
      email: 'agent@company.com',
      password: 'agent123',
      expectedRole: 'agent'
    },
    {
      name: 'Admin Login',
      email: 'admin@company.com',
      password: 'admin123',
      expectedRole: 'admin'
    },
    {
      name: 'Invalid Email',
      email: 'nonexistent@company.com',
      password: 'test123',
      expectedError: true
    },
    {
      name: 'Invalid Password',
      email: 'customer@company.com',
      password: 'wrongpassword',
      expectedError: true
    },
    {
      name: 'Missing Email',
      password: 'customer123',
      expectedError: true
    },
    {
      name: 'Missing Password',
      email: 'customer@company.com',
      expectedError: true
    }
  ];

  for (const testCase of testCases) {
    console.log(`\n🧪 Testing: ${testCase.name}`);
    
    try {
      const requestData = {};
      if (testCase.email) requestData.email = testCase.email;
      if (testCase.password) requestData.password = testCase.password;

      const response = await axios.post('http://localhost:3000/api/auth/login', requestData, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 5000
      });

      if (testCase.expectedError) {
        console.log('❌ Expected error but got success');
      } else {
        console.log('✅ Login successful');
        console.log(`   User: ${response.data.user.first_name} ${response.data.user.last_name}`);
        console.log(`   Role: ${response.data.user.role}`);
        console.log(`   Token: ${response.data.token.substring(0, 20)}...`);
        
        if (response.data.user.role === testCase.expectedRole) {
          console.log('✅ Role matches expected');
        } else {
          console.log('❌ Role mismatch');
        }
      }
    } catch (error) {
      if (testCase.expectedError) {
        console.log('✅ Expected error occurred');
        console.log(`   Status: ${error.response?.status}`);
        console.log(`   Message: ${error.response?.data?.message}`);
      } else {
        console.log('❌ Unexpected error');
        console.log(`   Status: ${error.response?.status || 'No response'}`);
        console.log(`   Message: ${error.response?.data?.message || error.message}`);
        
        if (error.code === 'ECONNREFUSED') {
          console.log('🔧 Server is not running - start with: node src/app.js');
        }
      }
    }
  }
}

// Run verification
verifyLoginSystem().catch(error => {
  console.error('❌ Verification failed:', error);
  process.exit(1);
});
