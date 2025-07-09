const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Simple User schema
const UserSchema = new mongoose.Schema({
  first_name: String,
  last_name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, enum: ['customer', 'agent', 'admin'] },
  created_at: { type: Date, default: Date.now }
});

const User = mongoose.model('User', UserSchema);

// Connect to MongoDB
async function connectDB() {
  try {
    await mongoose.connect('mongodb://localhost:27017/ticket-distribution');
    console.log('✅ MongoDB connected');
    
    // Create test user if not exists
    await createTestUser();
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    console.log('🔧 Make sure MongoDB is running');
    process.exit(1);
  }
}

// Create test user function
async function createTestUser() {
  try {
    const existingUser = await User.findOne({ email: 'customer@company.com' });
    if (!existingUser) {
      const hashedPassword = await bcrypt.hash('customer123', 10);
      
      const testUser = new User({
        first_name: 'Test',
        last_name: 'Customer',
        email: 'customer@company.com',
        password: hashedPassword,
        role: 'customer'
      });

      await testUser.save();
      console.log('✅ Test user created: customer@company.com / customer123');
    } else {
      console.log('✅ Test user already exists: customer@company.com / customer123');
    }
  } catch (error) {
    console.error('❌ Error creating test user:', error);
  }
}

// Login route
app.post('/api/auth/login', async (req, res) => {
  try {
    console.log('🔍 Login attempt:', req.body);
    
    const { email, password } = req.body;

    if (!email || !password) {
      console.log('❌ Missing credentials');
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      console.log('❌ User not found:', email);
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      console.log('❌ Invalid password for:', email);
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      'your-secret-key',
      { expiresIn: '24h' }
    );

    console.log('✅ Login successful for:', email);
    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// List all users route
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json({ users });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Start server
async function startServer() {
  await connectDB();
  
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log('📋 Available endpoints:');
    console.log('   - GET /api/health');
    console.log('   - POST /api/auth/login');
    console.log('   - GET /api/users');
    console.log('\n🧪 Test login with:');
    console.log('   Email: customer@company.com');
    console.log('   Password: customer123');
  });
}

startServer();
