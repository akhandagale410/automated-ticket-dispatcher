const mongoose = require('mongoose');
const User = require('./models/User');
const Customer = require('./models/Customer');
const Agent = require('./models/Agent');

async function fixUserProfiles() {
  try {
    await mongoose.connect('mongodb://localhost:27017/ticket_system', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Get all users
    const users = await User.find({});
    console.log(`📊 Found ${users.length} users`);

    for (const user of users) {
      console.log(`\n🔍 Processing user: ${user.email} (${user.role})`);

      if (user.role === 'customer') {
        const existingCustomer = await Customer.findOne({ user: user._id });
        if (!existingCustomer) {
          console.log('🔧 Creating Customer profile...');
          const customerProfile = new Customer({
            user: user._id,
            organization: 'Default Company'
          });
          await customerProfile.save();
          console.log('✅ Customer profile created');
        } else {
          console.log('✅ Customer profile exists');
        }
      } else if (user.role === 'agent' || user.role === 'admin') {
        const existingAgent = await Agent.findOne({ user: user._id });
        if (!existingAgent) {
          console.log('🔧 Creating Agent profile...');
          const agentProfile = new Agent({
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
          console.log('✅ Agent profile created');
        } else {
          console.log('✅ Agent profile exists');
        }
      }
    }

    console.log('\n🎉 All user profiles have been fixed!');
    
  } catch (error) {
    console.error('❌ Error fixing user profiles:', error);
  } finally {
    mongoose.disconnect();
  }
}

fixUserProfiles();
