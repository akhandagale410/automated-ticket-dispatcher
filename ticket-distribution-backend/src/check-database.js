const mongoose = require('mongoose');
const User = require('./models/User');
const Customer = require('./models/Customer');
const Agent = require('./models/Agent');

async function checkDatabase() {
  try {
    await mongoose.connect('mongodb://localhost:27017/ticket_system', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Check collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('\n📋 Available collections:');
    collections.forEach(col => console.log(`  - ${col.name}`));

    // Check users
    console.log('\n👥 All users in database:');
    const users = await User.find({});
    console.log(`Found ${users.length} users:`);
    
    for (const user of users) {
      console.log(`\n📧 ${user.email}`);
      console.log(`   Name: ${user.first_name} ${user.last_name}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   ID: ${user._id}`);
      
      // Check if profiles exist
      if (user.role === 'customer') {
        const customer = await Customer.findOne({ user: user._id });
        console.log(`   Customer Profile: ${customer ? '✅ EXISTS' : '❌ MISSING'}`);
        if (customer) {
          console.log(`     Organization: ${customer.organization}`);
        }
      } else if (user.role === 'agent' || user.role === 'admin') {
        const agent = await Agent.findOne({ user: user._id });
        console.log(`   Agent Profile: ${agent ? '✅ EXISTS' : '❌ MISSING'}`);
        if (agent) {
          console.log(`     Skills: ${agent.skills}`);
          console.log(`     Availability: ${agent.availability}`);
        }
      }
    }

    // Specifically check for agent@company.com
    console.log('\n🔍 Checking agent@company.com specifically:');
    const agentUser = await User.findOne({ email: 'agent@company.com' });
    if (agentUser) {
      console.log('✅ Agent user exists');
      console.log('User data:', JSON.stringify(agentUser.toObject(), null, 2));
      
      const agentProfile = await Agent.findOne({ user: agentUser._id });
      if (agentProfile) {
        console.log('✅ Agent profile exists');
        console.log('Profile data:', JSON.stringify(agentProfile.toObject(), null, 2));
      } else {
        console.log('❌ Agent profile missing');
      }
    } else {
      console.log('❌ Agent user does not exist');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.disconnect();
  }
}

checkDatabase();
