const mongoose = require('mongoose');

async function checkUsersAndSetupAgents() {
  try {
    console.log('🔍 Connecting to MongoDB to check user table...');
    await mongoose.connect('mongodb://localhost:27017/ticket_system');
    console.log('✅ Connected to MongoDB');

    // Import models
    const User = require('./src/models/User');
    const Agent = require('./src/models/Agent');
    const Customer = require('./src/models/Customer');

    // Check current database state
    console.log('\n📋 Current Database State:');
    const users = await User.find({});
    const agents = await Agent.find({}).populate('user', 'email role');
    const customers = await Customer.find({}).populate('user', 'email role');

    console.log(`\nUsers: ${users.length}`);
    console.log(`Agent profiles: ${agents.length}`);
    console.log(`Customer profiles: ${customers.length}`);

    console.log('\n👥 Existing users:');
    users.forEach(user => {
      console.log(`  - ${user.email} (${user.role}) - ${user.first_name} ${user.last_name}`);
    });

    console.log('\n🕵️ Existing agent profiles:');
    agents.forEach(agent => {
      if (agent.user) {
        console.log(`  - ${agent.user.email} (${agent.user.role})`);
      }
    });

    // Now call the setupDefaultAgents function
    console.log('\n🔧 Setting up default agents...');
    const { setupDefaultAgents } = require('./src/setupAgents');
    await setupDefaultAgents();

    // Check final state
    console.log('\n📊 Final Database State:');
    const finalUsers = await User.find({});
    const finalAgents = await Agent.find({}).populate('user', 'email role');

    console.log(`\nFinal users: ${finalUsers.length}`);
    console.log(`Final agent profiles: ${finalAgents.length}`);

    console.log('\n👥 All users after setup:');
    finalUsers.forEach(user => {
      console.log(`  - ${user.email} (${user.role}) - ${user.first_name} ${user.last_name}`);
    });

    console.log('\n🔑 Agent Login Credentials:');
    console.log('AGENT: agent@company.com / agent123');
    console.log('AGENT: sarah.support@company.com / agent123');
    console.log('ADMIN: admin@company.com / admin123');

    await mongoose.disconnect();
    console.log('\n✅ Setup completed successfully!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    await mongoose.disconnect();
    process.exit(1);
  }
}

checkUsersAndSetupAgents();
