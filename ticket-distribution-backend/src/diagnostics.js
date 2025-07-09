const express = require('express');
const cors = require('cors');
const connectDB = require('./db/connect');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

async function runDiagnostics() {
  console.log('🔍 Running comprehensive diagnostics...\n');

  // 1. Test Express Server
  console.log('1️⃣ Testing Express Server...');
  const app = express();
  app.use(cors());
  app.use(express.json());

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  const server = app.listen(3001, () => {
    console.log('✅ Express server working on port 3001');
  });

  // 2. Test MongoDB Connection
  console.log('\n2️⃣ Testing MongoDB Connection...');
  try {
    await connectDB();
    console.log('✅ MongoDB connection successful');

    // 3. Check if users exist
    console.log('\n3️⃣ Checking database users...');
    const userCount = await User.countDocuments();
    console.log(`Found ${userCount} users in database`);

    if (userCount === 0) {
      console.log('\n4️⃣ Creating test user...');
      const testUser = new User({
        first_name: 'Test',
        last_name: 'Customer',
        email: 'customer@company.com',
        password: await bcrypt.hash('customer123', 10),
        role: 'customer'
      });
      await testUser.save();
      console.log('✅ Test user created');
    }

    // 4. Test login functionality
    console.log('\n5️⃣ Testing login functionality...');
    const user = await User.findOne({ email: 'customer@company.com' });
    if (user) {
      console.log('✅ User found in database');
      const isPasswordValid = await bcrypt.compare('customer123', user.password);
      console.log('✅ Password validation:', isPasswordValid ? 'PASS' : 'FAIL');
    }

    // 5. Create proper server with auth route
    console.log('\n6️⃣ Starting server with auth routes on port 3000...');
    
    server.close(); // Close test server
    
    const mainApp = express();
    mainApp.use(cors());
    mainApp.use(express.json());
    
    mainApp.post('/api/auth/login', async (req, res) => {
      try {
        console.log('🔐 Login request received:', req.body);
        const { email, password } = req.body;
        
        if (!email || !password) {
          return res.status(400).json({ message: 'Email and password required' });
        }
        
        const user = await User.findOne({ email });
        if (!user) {
          return res.status(400).json({ message: 'User not found' });
        }
        
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
          return res.status(400).json({ message: 'Invalid password' });
        }
        
        res.json({
          message: 'Login successful',
          user: {
            id: user._id,
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            role: user.role
          },
          token: 'test-token-123'
        });
      } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error' });
      }
    });
    
    mainApp.get('/api/health', (req, res) => {
      res.json({ status: 'ok', message: 'Server running with diagnostics' });
    });
    
    mainApp.listen(3000, () => {
      console.log('✅ Main server running on port 3000');
      console.log('\n🎯 Test the login now:');
      console.log('URL: POST http://localhost:3000/api/auth/login');
      console.log('Body: { "email": "customer@company.com", "password": "customer123" }');
      console.log('\nOr visit: http://localhost:3000/api/health');
    });

  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    console.log('\n🔧 MongoDB troubleshooting:');
    console.log('1. Make sure MongoDB is installed and running');
    console.log('2. Try: mongod --dbpath C:\\data\\db');
    console.log('3. Or start MongoDB service in Windows');
    process.exit(1);
  }
}

runDiagnostics();
