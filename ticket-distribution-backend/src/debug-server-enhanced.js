const express = require('express');
const cors = require('cors');
const connectDB = require('./db/connect');

const app = express();

// Connect to database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Enhanced error handling for auth routes
app.use('/api/auth', (req, res, next) => {
  console.log(`\n🔍 AUTH REQUEST: ${req.method} ${req.path}`);
  console.log('Body:', req.body);
  next();
});

// Auth routes with detailed error logging
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

// Enhanced error handling middleware
app.use((err, req, res, next) => {
  console.error('\n❌ UNHANDLED ERROR:');
  console.error('Stack:', err.stack);
  console.error('Message:', err.message);
  console.error('Request path:', req.path);
  console.error('Request body:', req.body);
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: err.message,
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🌐 DEBUG SERVER running on port ${PORT}`);
  console.log(`📍 Auth endpoint: http://localhost:${PORT}/api/auth/login`);
  console.log('🔍 Enhanced logging enabled for debugging agent login issue');
});

// Test agent login after server starts
setTimeout(async () => {
  console.log('\n🧪 Running agent login debug test...');
  try {
    const mongoose = require('mongoose');
    const User = require('./models/User');
    
    const agentUser = await User.findOne({ email: 'agent@company.com' });
    console.log('Agent user in database:', agentUser ? '✅ Found' : '❌ Not found');
    if (agentUser) {
      console.log('Agent user details:', {
        id: agentUser._id,
        email: agentUser.email,
        role: agentUser.role
      });
    }
  } catch (error) {
    console.error('❌ Debug test failed:', error);
  }
}, 3000);
