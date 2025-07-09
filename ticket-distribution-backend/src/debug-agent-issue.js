const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Agent = require('./models/Agent');
const Customer = require('./models/Customer');

async function debugAgentLogin() {
  try {
    await mongoose.connect('mongodb://localhost:27017/ticket_system', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB: ticket_system');

    // Check what users exist
    console.log('\n📋 Checking all users in database:');
    const allUsers = await User.find({});
    console.log(`Found ${allUsers.length} users:`);
    allUsers.forEach(user => {
      console.log(`  - ${user.email} (${user.role})`);
    });

    // Test customer login process
    console.log('\n🧪 Testing customer login process:');
    const customerUser = await User.findOne({ email: 'customer@company.com' });
    if (customerUser) {
      console.log('✅ Customer user found');
      const customerProfile = await Customer.findOne({ user: customerUser._id });
      console.log(`Customer profile: ${customerProfile ? '✅ exists' : '❌ missing'}`);
      if (customerProfile) {
        console.log('Customer profile data:', customerProfile);
      }
    } else {
      console.log('❌ Customer user not found');
    }

    // Test agent login process
    console.log('\n🧪 Testing agent login process:');
    const agentUser = await User.findOne({ email: 'agent@company.com' });
    if (agentUser) {
      console.log('✅ Agent user found');
      console.log('Agent user data:', {
        id: agentUser._id,
        email: agentUser.email,
        role: agentUser.role,
        first_name: agentUser.first_name,
        last_name: agentUser.last_name
      });

      // Check password
      const isPasswordValid = await bcrypt.compare('agent123', agentUser.password);
      console.log(`Password valid: ${isPasswordValid ? '✅' : '❌'}`);

      // Check agent profile
      const agentProfile = await Agent.findOne({ user: agentUser._id });
      console.log(`Agent profile: ${agentProfile ? '✅ exists' : '❌ missing'}`);
      
      if (agentProfile) {
        console.log('Agent profile data:', agentProfile);
      } else {
        console.log('\n🔧 Creating Agent profile...');
        try {
          // Check Agent model schema
          console.log('Agent model schema:', Object.keys(Agent.schema.paths));
          
          const newAgentProfile = new Agent({
            user: agentUser._id,
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
          console.log('New agent profile:', newAgentProfile);
        } catch (error) {
          console.error('❌ Error creating agent profile:', error);
          console.error('Error details:', error.message);
        }
      }
    } else {
      console.log('❌ Agent user not found');
    }

    // Test the full login simulation
    console.log('\n🎭 Simulating full agent login:');
    try {
      const email = 'agent@company.com';
      const password = 'agent123';
      
      const user = await User.findOne({ email });
      if (!user) {
        throw new Error('User not found');
      }
      
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new Error('Invalid password');
      }
      
      // Check/create agent profile
      let agentProfile = await Agent.findOne({ user: user._id });
      if (!agentProfile) {
        agentProfile = new Agent({
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
      }
      
      console.log('🎉 Agent login simulation successful!');
      
    } catch (error) {
      console.error('❌ Agent login simulation failed:', error);
    }

  } catch (error) {
    console.error('❌ Debug script failed:', error);
  } finally {
    mongoose.disconnect();
  }
}

debugAgentLogin();
