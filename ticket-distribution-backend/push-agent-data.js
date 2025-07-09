const mongoose = require('mongoose');
const User = require('./src/models/User');
const Agent = require('./src/models/Agent');
const bcrypt = require('bcryptjs');

async function pushAgentData() {
  try {
    console.log('🔍 Connecting to MongoDB...');
    await mongoose.connect('mongodb://localhost:27017/ticket-distribution');
    console.log('✅ Connected to MongoDB');

    // Check existing users
    console.log('\n📋 Checking existing users...');
    const users = await User.find({});
    console.log(`Found ${users.length} users in database:`);
    
    users.forEach(user => {
      console.log(`  - ${user.email} (${user.role}) - ${user.first_name} ${user.last_name}`);
    });

    // Check existing agents
    console.log('\n🕵️ Checking existing agent profiles...');
    const agents = await Agent.find({}).populate('user', 'email first_name last_name role');
    console.log(`Found ${agents.length} agent profiles:`);
    
    agents.forEach(agent => {
      if (agent.user) {
        console.log(`  - ${agent.user.email} (${agent.user.role})`);
      }
    });

    // Create dummy agent users if they don't exist
    const agentUsers = [
      {
        first_name: 'John',
        last_name: 'Agent',
        email: 'agent@company.com',
        password: 'agent123',
        role: 'agent'
      },
      {
        first_name: 'Sarah',
        last_name: 'Support',
        email: 'sarah.support@company.com',
        password: 'agent123',
        role: 'agent'
      },
      {
        first_name: 'Mike',
        last_name: 'Admin',
        email: 'admin@company.com',
        password: 'admin123',
        role: 'admin'
      },
      {
        first_name: 'Lisa',
        last_name: 'Senior',
        email: 'lisa.senior@company.com',
        password: 'agent123',
        role: 'agent'
      }
    ];

    console.log('\n🔧 Creating/Updating agent users...');
    
    for (const userData of agentUsers) {
      // Check if user already exists
      let user = await User.findOne({ email: userData.email });
      
      if (!user) {
        console.log(`Creating user: ${userData.email}`);
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        
        user = new User({
          first_name: userData.first_name,
          last_name: userData.last_name,
          email: userData.email,
          password: hashedPassword,
          role: userData.role
        });
        
        await user.save();
        console.log(`✅ User created: ${userData.email}`);
      } else {
        console.log(`User already exists: ${userData.email}`);
        
        // Update role if needed
        if (user.role !== userData.role) {
          user.role = userData.role;
          await user.save();
          console.log(`✅ Updated role for: ${userData.email} to ${userData.role}`);
        }
      }

      // Create or update agent profile for agents and admins
      if (userData.role === 'agent' || userData.role === 'admin') {
        let agentProfile = await Agent.findOne({ user: user._id });
        
        if (!agentProfile) {
          console.log(`Creating agent profile for: ${userData.email}`);
          
          agentProfile = new Agent({
            user: user._id,
            skills: userData.role === 'admin' ? 
              ['general-support', 'technical-support', 'billing', 'escalation'] : 
              ['general-support', 'technical-support'],
            domain_expertise: userData.role === 'admin' ? 
              ['technical-support', 'system-administration', 'billing'] : 
              ['technical-support'],
            experience: userData.role === 'admin' ? 5 : Math.floor(Math.random() * 3) + 1,
            certifications: userData.role === 'admin' ? 
              ['CompTIA A+', 'ITIL Foundation'] : 
              ['Customer Service Excellence'],
            max_tickets: userData.role === 'admin' ? 15 : 10,
            workload: 0,
            availability: 'offline',
            total_tickets_resolved: Math.floor(Math.random() * 50),
            avg_resolution_time: Math.floor(Math.random() * 120) + 30, // 30-150 minutes
            avg_customer_rating: (Math.random() * 2 + 3).toFixed(1) // 3.0-5.0 rating
          });
          
          await agentProfile.save();
          console.log(`✅ Agent profile created for: ${userData.email}`);
        } else {
          console.log(`Agent profile already exists for: ${userData.email}`);
        }
      }
    }

    // Display final status
    console.log('\n📊 Final Status:');
    const finalUsers = await User.find({});
    const finalAgents = await Agent.find({}).populate('user', 'email first_name last_name role');
    
    console.log(`Total users: ${finalUsers.length}`);
    console.log(`Total agent profiles: ${finalAgents.length}`);
    
    console.log('\n👥 All users:');
    finalUsers.forEach(user => {
      console.log(`  - ${user.email} (${user.role}) - ${user.first_name} ${user.last_name}`);
    });
    
    console.log('\n🕵️ All agent profiles:');
    finalAgents.forEach(agent => {
      if (agent.user) {
        console.log(`  - ${agent.user.email} - Skills: ${agent.skills.join(', ')} - Experience: ${agent.experience} years`);
      }
    });

    console.log('\n🔑 Login Credentials:');
    agentUsers.forEach(user => {
      console.log(`  ${user.role.toUpperCase()}: ${user.email} / ${user.password}`);
    });

    mongoose.disconnect();
    console.log('\n✅ Process completed successfully!');
    
  } catch (error) {
    console.error('❌ Error:', error);
    mongoose.disconnect();
  }
}

pushAgentData();
