const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const User = require('./models/User');
const Agent = require('./models/Agent');

async function testAgentLogin() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/ticket_system', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    const email = 'agent@company.com';
    const password = 'agent123';

    console.log(`🔍 Looking for user: ${email}`);
    
    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      console.log('❌ User not found');
      return;
    }

    console.log(`✅ User found: ${user.first_name} ${user.last_name} (${user.role})`);

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      console.log('❌ Invalid password');
      return;
    }

    console.log('✅ Password valid');

    // Check agent profile
    const agentProfile = await Agent.findOne({ user: user._id });
    if (!agentProfile) {
      console.log('🔧 Creating missing Agent profile...');
      const newAgentProfile = new Agent({
        user: user._id,
        skills: ['general-support'],
        domain_expertise: ['technical-support'],
        experience: 1,
        certifications: [],
        max_tickets: 10,
        workload: 0,
        availability: 'offline'
      });
      await newAgentProfile.save();
      console.log('✅ Agent profile created successfully');
    } else {
      console.log('✅ Agent profile exists:', agentProfile);
    }

    console.log('🎉 Agent login test successful!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    mongoose.disconnect();
  }
}

testAgentLogin();
