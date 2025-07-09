const mongoose = require('mongoose');
const User = require('./models/User');
const Customer = require('./models/Customer');
const Agent = require('./models/Agent');

async function connectDB() {
  try {
    await mongoose.connect('mongodb://localhost:27017/ticket-system');
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    process.exit(1);
  }
}

async function createMissingProfiles() {
  try {
    await connectDB();
    
    console.log('\n🔧 CREATING MISSING PROFILES FOR EXISTING USERS\n');
    
    // Get all users
    const allUsers = await User.find();
    console.log(`Found ${allUsers.length} total users`);
    
    let customersCreated = 0;
    let agentsCreated = 0;
    
    for (const user of allUsers) {
      console.log(`\nProcessing user: ${user.email} (${user.role})`);
      
      if (user.role === 'customer') {
        // Check if Customer profile exists
        const existingCustomer = await Customer.findOne({ user: user._id });
        
        if (!existingCustomer) {
          console.log(`  🔧 Creating Customer profile...`);
          const customerProfile = new Customer({
            user: user._id,
            customerNumber: `CUST${Date.now()}${Math.random().toString(36).substr(2, 3).toUpperCase()}`,
            company: 'Default Company',
            department: 'General',
            priority: 'normal',
            contactPreference: 'email'
          });
          await customerProfile.save();
          customersCreated++;
          console.log(`  ✅ Customer profile created`);
        } else {
          console.log(`  ✓ Customer profile already exists`);
        }
      } else if (user.role === 'agent' || user.role === 'admin') {
        // Check if Agent profile exists
        const existingAgent = await Agent.findOne({ user: user._id });
        
        if (!existingAgent) {
          console.log(`  🔧 Creating Agent profile...`);
          const agentProfile = new Agent({
            user: user._id,
            employeeId: `EMP${Date.now()}${Math.random().toString(36).substr(2, 3).toUpperCase()}`,
            department: 'Support',
            skills: ['general-support'],
            availability: 'available',
            maxConcurrentTickets: 10
          });
          await agentProfile.save();
          agentsCreated++;
          console.log(`  ✅ Agent profile created`);
        } else {
          console.log(`  ✓ Agent profile already exists`);
        }
      }
    }
    
    console.log(`\n📊 SUMMARY:`);
    console.log(`  Customer profiles created: ${customersCreated}`);
    console.log(`  Agent profiles created: ${agentsCreated}`);
    
    // Verify by counting profiles
    const totalCustomers = await Customer.countDocuments();
    const totalAgents = await Agent.countDocuments();
    const customerUsers = await User.countDocuments({ role: 'customer' });
    const agentUsers = await User.countDocuments({ $or: [{ role: 'agent' }, { role: 'admin' }] });
    
    console.log(`\n✅ VERIFICATION:`);
    console.log(`  Customer users: ${customerUsers}, Customer profiles: ${totalCustomers}`);
    console.log(`  Agent/Admin users: ${agentUsers}, Agent profiles: ${totalAgents}`);
    
    if (customerUsers === totalCustomers && agentUsers === totalAgents) {
      console.log(`\n🎉 All profiles are now complete!`);
    } else {
      console.log(`\n⚠️  Profile mismatch detected - manual investigation needed`);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

createMissingProfiles();
