const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Customer = require('../models/Customer');
const Agent = require('../models/Agent');
const { setupDefaultAgents } = require('../setupAgents');

const router = express.Router();

// Register route
router.post('/register', async (req, res) => {
  try {
    const { first_name, last_name, email, password, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new user
    const newUser = new User({
      first_name,
      last_name,
      email,
      password: hashedPassword,
      role: role || 'customer'
    });

    await newUser.save();

    // Create corresponding profile based on role
    if (role === 'customer') {
      const customerProfile = new Customer({
        user: newUser._id,
        organization: 'Default Company'
      });
      await customerProfile.save();
      console.log(`✅ Customer profile created for user: ${newUser.email}`);
    } else if (role === 'agent' || role === 'admin') {
      const agentProfile = new Agent({
        user: newUser._id,
        skills: ['general-support'],
        domain_expertise: ['technical-support'],
        experience: 1,
        certifications: [],
        max_tickets: 10,
        workload: 0,
        availability: 'offline'
      });
      await agentProfile.save();
      console.log(`✅ Agent profile created for user: ${newUser.email}`);
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: newUser._id, email: newUser.email, role: newUser.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: newUser._id,
        first_name: newUser.first_name,
        last_name: newUser.last_name,
        email: newUser.email,
        role: newUser.role
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// Login route
router.post('/login', async (req, res) => {
  try {
    console.log('🔍 Login attempt received');
    console.log('Request body:', req.body);
    
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      console.log('❌ Missing email or password');
      return res.status(400).json({ message: 'Email and password are required' });
    }

    console.log(`🔍 Looking for user with email: ${email}`);

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      console.log('❌ User not found');
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    console.log(`✅ User found: ${user.first_name} ${user.last_name} (${user.role})`);

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      console.log('❌ Invalid password');
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    console.log('✅ Password valid, generating token');

    // Ensure Customer/Agent profile exists for the user
    if (user.role === 'customer') {
      const existingCustomer = await Customer.findOne({ user: user._id });
      if (!existingCustomer) {
        console.log('🔧 Creating missing Customer profile...');
        const customerProfile = new Customer({
          user: user._id,
          organization: 'Default Company'
        });
        await customerProfile.save();
        console.log(`✅ Customer profile created for user: ${user.email}`);
      }
    } else if (user.role === 'agent' || user.role === 'admin') {
      const existingAgent = await Agent.findOne({ user: user._id });
      if (!existingAgent) {
        console.log('🔧 Creating missing Agent profile...');
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
        await agentProfile.save();
        console.log(`✅ Agent profile created for user: ${user.email}`);
      }
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    console.log('✅ Login successful for:', user.email);

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
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Get user profile route (protected)
router.get('/profile', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(401).json({ message: 'Invalid token' });
  }
});

// Setup route to create default agents (for development/testing)
router.post('/setup-agents', async (req, res) => {
  try {
    console.log('🔧 Setting up default agents...');
    await setupDefaultAgents();
    
    // Return list of created agents
    const agents = await User.find({ role: { $in: ['agent', 'admin'] } }).select('-password');
    
    res.json({
      message: 'Default agents setup completed',
      agents: agents.map(agent => ({
        email: agent.email,
        name: `${agent.first_name} ${agent.last_name}`,
        role: agent.role
      })),
      credentials: [
        { email: 'agent@company.com', password: 'agent123', role: 'agent' },
        { email: 'sarah.support@company.com', password: 'agent123', role: 'agent' },
        { email: 'admin@company.com', password: 'admin123', role: 'admin' }
      ]
    });
  } catch (error) {
    console.error('Setup agents error:', error);
    res.status(500).json({ message: 'Error setting up agents', error: error.message });
  }
});

module.exports = router;
