const mongoose = require('mongoose');
const User = require('./models/User');
const Customer = require('./models/Customer');

async function connectDB() {
  try {
    await mongoose.connect('mongodb://localhost:27017/ticket-system');
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection failed:', error);
    process.exit(1);
  }
}

async function fixCustomerProfiles() {
  try {
    await connectDB();
    
    console.log('\n=== CHECKING CUSTOMER PROFILES ===\n');
    
    // Find all users with customer role
    const customerUsers = await User.find({ role: 'customer' });
    console.log(`Found ${customerUsers.length} users with customer role:`);
    
    for (const user of customerUsers) {
      console.log(`\nUser: ${user.username} (${user.email}) - ID: ${user._id}`);
      
      // Check if Customer profile exists
      const existingCustomer = await Customer.findOne({ user: user._id });
      
      if (existingCustomer) {
        console.log(`  ✓ Customer profile exists - ID: ${existingCustomer._id}`);
      } else {
        console.log(`  ✗ Customer profile missing - Creating new one...`);
        
        // Create new Customer profile
        const newCustomer = new Customer({
          user: user._id,
          customerNumber: `CUST${Date.now()}${Math.random().toString(36).substr(2, 3).toUpperCase()}`,
          company: 'Default Company',
          department: 'General',
          priority: 'normal',
          contactPreference: 'email'
        });
        
        await newCustomer.save();
        console.log(`  ✓ Customer profile created - ID: ${newCustomer._id}`);
      }
    }
    
    console.log('\n=== VERIFICATION ===\n');
    
    // Verify all customer users now have profiles
    const allCustomers = await Customer.find().populate('user');
    console.log(`Total Customer profiles: ${allCustomers.length}`);
    
    for (const customer of allCustomers) {
      console.log(`Customer: ${customer.customerNumber} - User: ${customer.user.username} (${customer.user.email})`);
    }
    
    console.log('\n=== TESTING SAMPLE USER ===\n');
    
    // Test with a specific user (customer1)
    const testUser = await User.findOne({ username: 'customer1' });
    if (testUser) {
      console.log(`Test user found: ${testUser.username} (${testUser.email})`);
      const testCustomer = await Customer.findOne({ user: testUser._id });
      if (testCustomer) {
        console.log(`✓ Customer profile exists for ${testUser.username}`);
        console.log(`  Customer Number: ${testCustomer.customerNumber}`);
        console.log(`  Company: ${testCustomer.company}`);
      } else {
        console.log(`✗ No Customer profile found for ${testUser.username}`);
      }
    } else {
      console.log('Test user customer1 not found');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

fixCustomerProfiles();
