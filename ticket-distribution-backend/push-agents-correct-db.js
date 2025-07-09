const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('./src/db/connect');
const User = require('./src/models/User');
const Agent = require('./src/models/Agent');
const Customer = require('./src/models/Customer');

async function checkAndPushAgentData() {
  try {
    console.log('🚀 Starting Agent Data Push Script');
    console.log('📋 Using database: ticket-distribution');
    
    // Use the same connection logic as the main app
    await connectDB();
    
    console.log('\n📊 Checking current database state...');
    
    // Check existing users
    const allUsers = await User.find({});
    console.log(`\n👥 Found ${allUsers.length} users in database:`);
    
    if (allUsers.length > 0) {
      allUsers.forEach(user => {
        console.log(`  - ${user.email} (${user.role}) - ${user.first_name} ${user.last_name}`);
      });
    } else {
      console.log('  No users found in database');
    }
    
    // Check existing agent profiles
    const existingAgents = await Agent.find({}).populate('user', 'email first_name last_name role');
    console.log(`\n🕵️ Found ${existingAgents.length} agent profiles:`);
    
    if (existingAgents.length > 0) {
      existingAgents.forEach(agent => {
        if (agent.user) {
          console.log(`  - ${agent.user.email} (${agent.user.role}) - Skills: ${agent.skills.join(', ')}`);
        }
      });
    } else {
      console.log('  No agent profiles found');
    }
    
    // Check existing customer profiles
    const existingCustomers = await Customer.find({}).populate('user', 'email first_name last_name role');
    console.log(`\n👤 Found ${existingCustomers.length} customer profiles:`);
    
    if (existingCustomers.length > 0) {
      existingCustomers.forEach(customer => {
        if (customer.user) {
          console.log(`  - ${customer.user.email} (${customer.user.role})`);
        }
      });
    } else {
      console.log('  No customer profiles found');
    }

    // Define agent data to create
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
      },
      {
        first_name: 'Lisa',
        last_name: 'Senior',
        email: 'lisa.senior@company.com',
        password: 'agent123',
        role: 'agent',
        skills: ['technical-support', 'escalation'],
        experience: 3
      }
    ];

    console.log('\n🔧 Creating/Updating agents...');

    for (const agentData of agentsToCreate) {
      console.log(`\n👤 Processing: ${agentData.email}`);
      
      // Check if user exists
      let user = await User.findOne({ email: agentData.email });
      
      if (!user) {
        console.log(`  📝 Creating user: ${agentData.email}`);
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
        
        // Update role if needed
        if (user.role !== agentData.role) {
          user.role = agentData.role;
          await user.save();
          console.log(`  🔄 Updated role to: ${agentData.role}`);
        }
      }

      // Create or update agent profile
      if (agentData.role === 'agent' || agentData.role === 'admin') {
        let agentProfile = await Agent.findOne({ user: user._id });
        
        if (!agentProfile) {
          console.log(`  🔧 Creating agent profile...`);
          
          agentProfile = new Agent({
            user: user._id,
            skills: agentData.skills,
            domain_expertise: ['technical-support'],
            experience: agentData.experience,
            certifications: agentData.role === 'admin' ? ['ITIL Foundation', 'CompTIA A+'] : [],
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
          if (JSON.stringify(agentProfile.skills) !== JSON.stringify(agentData.skills)) {
            agentProfile.skills = agentData.skills;
            await agentProfile.save();
            console.log(`  🔄 Updated skills: ${agentData.skills.join(', ')}`);
          }
        }
      }
    }

    // Final report
    console.log('\n📊 Final Database State:');
    const finalUsers = await User.find({});
    const finalAgents = await Agent.find({}).populate('user', 'email first_name last_name role');
    const finalCustomers = await Customer.find({}).populate('user', 'email first_name last_name role');
    
    console.log(`\n📈 Summary:`);
    console.log(`  Total users: ${finalUsers.length}`);
    console.log(`  Agent profiles: ${finalAgents.length}`);
    console.log(`  Customer profiles: ${finalCustomers.length}`);
    
    console.log('\n👥 All Users:');
    finalUsers.forEach(user => {
      console.log(`  - ${user.email} (${user.role}) - ${user.first_name} ${user.last_name}`);
    });
    
    console.log('\n🕵️ Agent Profiles:');
    finalAgents.forEach(agent => {
      if (agent.user) {
        console.log(`  - ${agent.user.email} - Skills: ${agent.skills.join(', ')} - Exp: ${agent.experience}y`);
      }
    });

    console.log('\n🔑 Login Credentials for Testing:');
    agentsToCreate.forEach(agent => {
      console.log(`  ${agent.role.toUpperCase().padEnd(5)}: ${agent.email.padEnd(30)} / ${agent.password}`);
    });

    console.log('\n💡 Next Steps:');
    console.log('1. Start backend server: npm start');
    console.log('2. Test agent login with credentials above');
    console.log('3. Access agent dashboard at /agent-dashboard');

    await mongoose.disconnect();
    console.log('\n✅ Script completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('Stack:', error.stack);
    
    if (error.name === 'MongoServerSelectionError') {
      console.log('\n💡 MongoDB Connection Tips:');
      console.log('- Make sure MongoDB is running: net start MongoDB');
      console.log('- Check if MongoDB is listening on port 27017');
      console.log('- Verify database name: ticket-distribution');
    }
    
    await mongoose.disconnect().catch(() => {});
    process.exit(1);
  }
}

// Run the script
console.log('🎯 Agent Data Push Script');
console.log('Database: mongodb://localhost:27017/ticket-distribution');
console.log('=====================================');

checkAndPushAgentData();
