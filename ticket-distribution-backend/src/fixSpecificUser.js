const mongoose = require('mongoose');
const User = require('./models/User');
const Customer = require('./models/Customer');

async function connectDB() {
  try {
    await mongoose.connect('mongodb://localhost:27017/ticket-system');
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    process.exit(1);
  }
}

async function fixSpecificUser() {
  try {
    await connectDB();
    
    const targetEmail = 'customer@company.com';
    console.log(`\n🔍 Looking for user: ${targetEmail}`);
    
    // Check if this user exists
    const user = await User.findOne({ email: targetEmail });
    
    if (!user) {
      console.log(`❌ User ${targetEmail} not found in database`);
      console.log('\n📋 Available users:');
      
      const allUsers = await User.find({}, 'email role');
      allUsers.forEach(u => {
        console.log(`  - ${u.email} (${u.role})`);
      });
      
      console.log(`\n🔧 Creating user: ${targetEmail}`);
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('customer123', 10);
      
      const newUser = new User({
        first_name: 'Customer',
        last_name: 'User',
        email: targetEmail,
        password: hashedPassword,
        role: 'customer'
      });
      
      await newUser.save();
      console.log(`✅ User created: ${targetEmail}`);
      
      // Create Customer profile
      const customerProfile = new Customer({
        user: newUser._id,
        customerNumber: `CUST${Date.now()}${Math.random().toString(36).substr(2, 3).toUpperCase()}`,
        company: 'Company Corp',
        department: 'General',
        priority: 'normal',
        contactPreference: 'email'
      });
      
      await customerProfile.save();
      console.log(`✅ Customer profile created for: ${targetEmail}`);
      
    } else {
      console.log(`✅ User found: ${user.email} (${user.role})`);
      
      // Check if Customer profile exists
      const customer = await Customer.findOne({ user: user._id });
      
      if (!customer) {
        console.log(`🔧 Creating missing Customer profile...`);
        const customerProfile = new Customer({
          user: user._id,
          customerNumber: `CUST${Date.now()}${Math.random().toString(36).substr(2, 3).toUpperCase()}`,
          company: 'Company Corp',
          department: 'General',
          priority: 'normal',
          contactPreference: 'email'
        });
        
        await customerProfile.save();
        console.log(`✅ Customer profile created for: ${user.email}`);
      } else {
        console.log(`✅ Customer profile already exists`);
      }
    }
    
    console.log(`\n🎉 User ${targetEmail} is now ready to use /api/tickets`);
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

fixSpecificUser();
