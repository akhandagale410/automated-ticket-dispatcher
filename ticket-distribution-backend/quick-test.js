const mongoose = require('mongoose');

async function quickTest() {
  try {
    console.log('🔍 Quick test starting...');
    console.log('Attempting to connect to MongoDB...');
    
    await mongoose.connect('mongodb://localhost:27017/ticket-distribution');
    console.log('✅ Connected to MongoDB');
    
    // Import models
    const User = require('./src/models/User');
    const Agent = require('./src/models/Agent');
    const Customer = require('./src/models/Customer');
    
    // Count documents
    const userCount = await User.countDocuments();
    const agentCount = await Agent.countDocuments();
    const customerCount = await Customer.countDocuments();
    
    console.log(`📊 Database stats:`);
    console.log(`  Users: ${userCount}`);
    console.log(`  Agents: ${agentCount}`);
    console.log(`  Customers: ${customerCount}`);
    
    // List some users
    const users = await User.find({}).limit(5);
    console.log('\n👥 Sample users:');
    users.forEach(user => {
      console.log(`  - ${user.email} (${user.role})`);
    });
    
    // Check for specific agent
    const agent = await User.findOne({ email: 'agent@company.com' });
    if (agent) {
      console.log(`\n🕵️ Agent found: ${agent.first_name} ${agent.last_name}`);
      const agentProfile = await Agent.findOne({ user: agent._id });
      console.log(`Agent profile exists: ${!!agentProfile}`);
    } else {
      console.log('\n❌ No agent@company.com found');
    }
    
    mongoose.disconnect();
    console.log('✅ Test completed');
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  }
}

quickTest();
