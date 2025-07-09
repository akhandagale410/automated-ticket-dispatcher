const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const Customer = require('./models/Customer');
const Agent = require('./models/Agent');

const app = express();
app.use(cors());
app.use(express.json());

// Enhanced logging middleware
app.use((req, res, next) => {
  console.log(`\n📝 ${new Date().toISOString()} - ${req.method} ${req.path}`);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('📦 Request body:', req.body);
  }
  next();
});

// Connect to MongoDB with detailed logging
async function connectDB() {
  try {
    console.log('🔍 Attempting to connect to MongoDB...');
    await mongoose.connect('mongodb://localhost:27017/ticket_system', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ MongoDB connected successfully');
    console.log('Database:', mongoose.connection.name);
    console.log('Host:', mongoose.connection.host);
    console.log('Port:', mongoose.connection.port);
  } catch (err) {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  }
}

// Enhanced login route with detailed logging
app.post('/api/auth/login', async (req, res) => {
  try {
    console.log('\n🔍 === LOGIN ATTEMPT START ===');
    console.log('Request headers:', req.headers);
    console.log('Request body:', req.body);
    
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      console.log('❌ Missing email or password');
      return res.status(400).json({ message: 'Email and password are required' });
    }

    console.log(`🔍 Step 1: Looking for user with email: ${email}`);

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      console.log('❌ Step 1: User not found');
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    console.log(`✅ Step 1: User found`);
    console.log(`   - Name: ${user.first_name} ${user.last_name}`);
    console.log(`   - Role: ${user.role}`);
    console.log(`   - ID: ${user._id}`);

    console.log(`🔍 Step 2: Checking password`);
    
    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      console.log('❌ Step 2: Invalid password');
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    console.log('✅ Step 2: Password valid');

    console.log(`🔍 Step 3: Checking/creating profile for role: ${user.role}`);

    // Ensure Customer/Agent profile exists for the user
    if (user.role === 'customer') {
      console.log('🔍 Step 3a: Checking Customer profile...');
      const existingCustomer = await Customer.findOne({ user: user._id });
      if (!existingCustomer) {
        console.log('🔧 Step 3a: Creating missing Customer profile...');
        const customerProfile = new Customer({
          user: user._id,
          organization: 'Default Company'
        });
        await customerProfile.save();
        console.log(`✅ Step 3a: Customer profile created`);
      } else {
        console.log(`✅ Step 3a: Customer profile exists`);
      }
    } else if (user.role === 'agent' || user.role === 'admin') {
      console.log('🔍 Step 3b: Checking Agent profile...');
      const existingAgent = await Agent.findOne({ user: user._id });
      if (!existingAgent) {
        console.log('🔧 Step 3b: Creating missing Agent profile...');
        
        // Check Agent model schema
        console.log('🔍 Agent model schema paths:');
        const agentSchema = Agent.schema;
        Object.keys(agentSchema.paths).forEach(path => {
          console.log(`   - ${path}: ${agentSchema.paths[path].instance || 'Mixed'}`);
        });
        
        const agentProfile = new Agent({
          user: user._id,
          skills: ['general-support'],
          domain_expertise: ['technical-support'],
          experience: 1,
          certifications: [],
          max_tickets: 10,
          workload: 0,
          availability: 'offline'
        });
        
        console.log('🔍 Agent profile data to save:', JSON.stringify(agentProfile.toObject(), null, 2));
        
        await agentProfile.save();
        console.log(`✅ Step 3b: Agent profile created`);
      } else {
        console.log(`✅ Step 3b: Agent profile exists`);
      }
    }

    console.log(`🔍 Step 4: Generating JWT token`);

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    console.log('✅ Step 4: Token generated successfully');

    const response = {
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        role: user.role
      }
    };

    console.log('✅ === LOGIN SUCCESSFUL ===');
    console.log('Response:', JSON.stringify(response, null, 2));

    res.json(response);
  } catch (error) {
    console.error('❌ === LOGIN ERROR ===');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    if (error.name === 'ValidationError') {
      console.error('Validation errors:');
      Object.keys(error.errors).forEach(key => {
        console.error(`  - ${key}: ${error.errors[key].message}`);
      });
    }
    
    res.status(500).json({ 
      message: 'Server error during login',
      error: error.message,
      details: error.name
    });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
const PORT = 3000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`\n🌐 Debug server running on port ${PORT}`);
    console.log(`📍 Login endpoint: http://localhost:${PORT}/api/auth/login`);
    console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
    console.log('\n🧪 Ready for testing!');
  });
});
