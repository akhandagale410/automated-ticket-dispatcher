const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

console.log('🚀 Starting server...');

// Test MongoDB connection
mongoose.connect('mongodb://localhost:27017/ticket_system', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('✅ Connected to MongoDB');
}).catch(err => {
  console.error('❌ MongoDB connection error:', err);
});

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🌐 Server running on port ${PORT}`);
  console.log(`📍 Auth endpoint: http://localhost:${PORT}/api/auth/login`);
});

// Test the agent login
setTimeout(async () => {
  try {
    console.log('\n🧪 Testing agent login...');
    const User = require('./models/User');
    const Agent = require('./models/Agent');
    
    // Check if agent user exists
    const agentUser = await User.findOne({ email: 'agent@company.com' });
    console.log('Agent user exists:', !!agentUser);
    
    if (agentUser) {
      const agentProfile = await Agent.findOne({ user: agentUser._id });
      console.log('Agent profile exists:', !!agentProfile);
      console.log('Agent profile:', agentProfile);
    }
  } catch (error) {
    console.error('❌ Test error:', error);
  }
}, 2000);
