const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Simple console logging
function log(message) {
  console.log(message);
}

async function createAgents() {
  log('🔧 Agent Data Creation Script Starting...');
  
  try {
    // Try to connect to MongoDB
    log('🔍 Connecting to MongoDB...');
    await mongoose.connect('mongodb://localhost:27017/ticket-distribution', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000 // 5 second timeout
    });
    log('✅ Connected to MongoDB');

    // Import models after connection
    const User = require('./src/models/User');
    const Agent = require('./src/models/Agent');

    // Check current state
    const userCount = await User.countDocuments();
    const agentCount = await Agent.countDocuments();
    log(`📊 Current state: ${userCount} users, ${agentCount} agent profiles`);

    // Agent data to create
    const agentsToCreate = [
      {
        first_name: 'John',
        last_name: 'Agent',
        email: 'agent@company.com',
        password: 'agent123',
        role: 'agent',
        skills: ['general-support', 'technical-support'],
        experience: 2
      },
      {
        first_name: 'Sarah',
        last_name: 'Support',
        email: 'sarah.support@company.com',
        password: 'agent123',
        role: 'agent',
        skills: ['general-support', 'billing'],
        experience: 1
      },
      {
        first_name: 'Mike',
        last_name: 'Admin',
        email: 'admin@company.com',
        password: 'admin123',
        role: 'admin',
        skills: ['general-support', 'technical-support', 'billing', 'escalation'],
        experience: 5
      }
    ];

    log('🔧 Creating agents...');
    
    for (const agentData of agentsToCreate) {
      log(`\n👤 Processing: ${agentData.email}`);
      
      // Check if user exists
      let user = await User.findOne({ email: agentData.email });
      
      if (!user) {
        // Create user
        const hashedPassword = await bcrypt.hash(agentData.password, 10);
        user = new User({
          first_name: agentData.first_name,
          last_name: agentData.last_name,
          email: agentData.email,
          password: hashedPassword,
          role: agentData.role
        });
        await user.save();
        log(`✅ User created: ${agentData.email}`);
      } else {
        log(`ℹ️ User exists: ${agentData.email}`);
      }

      // Check if agent profile exists
      let agentProfile = await Agent.findOne({ user: user._id });
      
      if (!agentProfile) {
        // Create agent profile
        agentProfile = new Agent({
          user: user._id,
          skills: agentData.skills,
          domain_expertise: ['technical-support'],
          experience: agentData.experience,
          certifications: [],
          max_tickets: agentData.role === 'admin' ? 15 : 10,
          workload: 0,
          availability: 'offline'
        });
        await agentProfile.save();
        log(`✅ Agent profile created for: ${agentData.email}`);
      } else {
        log(`ℹ️ Agent profile exists for: ${agentData.email}`);
      }
    }

    // Final report
    const finalUserCount = await User.countDocuments();
    const finalAgentCount = await Agent.countDocuments();
    log(`\n📊 Final state: ${finalUserCount} users, ${finalAgentCount} agent profiles`);

    log('\n🔑 Login Credentials:');
    agentsToCreate.forEach(agent => {
      log(`${agent.role.toUpperCase()}: ${agent.email} / ${agent.password}`);
    });

    await mongoose.disconnect();
    log('\n✅ Script completed successfully!');
    
  } catch (error) {
    log(`❌ Error: ${error.message}`);
    
    if (error.name === 'MongoServerSelectionError') {
      log('💡 MongoDB is not running. Please start MongoDB first:');
      log('   - Run: net start MongoDB');
      log('   - Or start mongod manually');
    }
    
    await mongoose.disconnect().catch(() => {});
    process.exit(1);
  }
}

// Run the script
createAgents();
