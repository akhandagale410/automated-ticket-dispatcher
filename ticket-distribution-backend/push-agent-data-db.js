const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

async function pushAgentData() {
  try {
    console.log('🔍 Connecting to MongoDB...');
    await mongoose.connect('mongodb://localhost:27017/ticket_system');
    console.log('✅ Connected to MongoDB');

    // Import models
    const User = require('./src/models/User');
    const Agent = require('./src/models/Agent');
    const Customer = require('./src/models/Customer');

    // Check current user table
    console.log('\n📋 Checking current user table...');
    const existingUsers = await User.find({});
    console.log(`Found ${existingUsers.length} existing users:`);
    
    existingUsers.forEach(user => {
      console.log(`  - ${user.email} (${user.role}) - ${user.first_name} ${user.last_name}`);
    });

    // Check existing agent profiles
    console.log('\n🕵️ Checking existing agent profiles...');
    const existingAgents = await Agent.find({}).populate('user', 'email first_name last_name role');
    console.log(`Found ${existingAgents.length} existing agent profiles:`);
    
    existingAgents.forEach(agent => {
      if (agent.user) {
        console.log(`  - ${agent.user.email} (${agent.user.role})`);
      }
    });

    // Agent data to create
    const agentsToCreate = [
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

    console.log('\n🔧 Creating/updating agent data...');
    
    for (const agentData of agentsToCreate) {
      console.log(`\n👤 Processing: ${agentData.email}`);
      
      // Check if user exists
      let user = await User.findOne({ email: agentData.email });
      
      if (!user) {
        // Create new user
        console.log(`  Creating new user...`);
        const hashedPassword = await bcrypt.hash(agentData.password, 10);
        
        user = new User({
          first_name: agentData.first_name,
          last_name: agentData.last_name,
          email: agentData.email,
          password: hashedPassword,
          role: agentData.role
        });
        
        await user.save();
        console.log(`  ✅ User created: ${agentData.email}`);
      } else {
        console.log(`  ℹ️ User already exists: ${agentData.email}`);
        
        // Update role if different
        if (user.role !== agentData.role) {
          user.role = agentData.role;
          await user.save();
          console.log(`  ✅ Updated role to: ${agentData.role}`);
        }
      }

      // Create/update agent profile
      if (agentData.role === 'agent' || agentData.role === 'admin') {
        let agentProfile = await Agent.findOne({ user: user._id });
        
        if (!agentProfile) {
          console.log(`  Creating agent profile...`);
          
          agentProfile = new Agent({
            user: user._id,
            skills: agentData.role === 'admin' ? 
              ['general-support', 'technical-support', 'billing', 'escalation'] : 
              ['general-support', 'technical-support'],
            domain_expertise: agentData.role === 'admin' ? 
              ['technical-support', 'system-administration', 'billing'] : 
              ['technical-support'],
            experience: agentData.role === 'admin' ? 5 : Math.floor(Math.random() * 3) + 1,
            certifications: agentData.role === 'admin' ? 
              ['CompTIA A+', 'ITIL Foundation'] : 
              ['Customer Service Excellence'],
            max_tickets: agentData.role === 'admin' ? 15 : 10,
            workload: 0,
            availability: 'offline',
            total_tickets_resolved: Math.floor(Math.random() * 50),
            avg_resolution_time: Math.floor(Math.random() * 120) + 30,
            avg_customer_rating: (Math.random() * 2 + 3).toFixed(1)
          });
          
          await agentProfile.save();
          console.log(`  ✅ Agent profile created`);
        } else {
          console.log(`  ℹ️ Agent profile already exists`);
          
          // Update skills if needed
          const expectedSkills = agentData.role === 'admin' ? 
            ['general-support', 'technical-support', 'billing', 'escalation'] : 
            ['general-support', 'technical-support'];
          
          if (JSON.stringify(agentProfile.skills.sort()) !== JSON.stringify(expectedSkills.sort())) {
            agentProfile.skills = expectedSkills;
            await agentProfile.save();
            console.log(`  ✅ Updated agent skills`);
          }
        }
      }
    }

    // Final status check
    console.log('\n📊 Final Status Report:');
    const finalUsers = await User.find({});
    const finalAgents = await Agent.find({}).populate('user', 'email first_name last_name role');
    const finalCustomers = await Customer.find({}).populate('user', 'email first_name last_name role');
    
    console.log(`\nTotal users: ${finalUsers.length}`);
    console.log(`Agent profiles: ${finalAgents.length}`);
    console.log(`Customer profiles: ${finalCustomers.length}`);
    
    console.log('\n👥 All users by role:');
    const usersByRole = {};
    finalUsers.forEach(user => {
      if (!usersByRole[user.role]) usersByRole[user.role] = [];
      usersByRole[user.role].push(user);
    });
    
    Object.keys(usersByRole).forEach(role => {
      console.log(`\n${role.toUpperCase()}S (${usersByRole[role].length}):`);
      usersByRole[role].forEach(user => {
        console.log(`  - ${user.email} (${user.first_name} ${user.last_name})`);
      });
    });

    console.log('\n🔑 Agent Login Credentials:');
    agentsToCreate.forEach(agent => {
      console.log(`${agent.role.toUpperCase()}: ${agent.email} / ${agent.password}`);
    });

    console.log('\n✅ Agent data push completed successfully!');
    await mongoose.disconnect();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

// Run the script
pushAgentData();
