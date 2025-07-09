const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const connectDB = require('./db/connect');

async function testLoginLogic() {
  console.log('🔍 Testing Login Logic...\n');

  try {
    // Connect to database
    console.log('📋 Connecting to MongoDB...');
    await connectDB();
    
    // Check if users exist
    const users = await User.find({}).select('-password');
    console.log(`✅ Found ${users.length} users in database:`);
    
    if (users.length === 0) {
      console.log('⚠️  No users found. Creating test user...');
      
      // Hash password
      const hashedPassword = await bcrypt.hash('customer123', 10);
      
      // Create test user
      const testUser = new User({
        first_name: 'Test',
        last_name: 'Customer',
        email: 'customer@company.com',
        password: hashedPassword,
        role: 'customer'
      });
      
      await testUser.save();
      console.log('✅ Test user created');
    } else {
      users.forEach(user => {
        console.log(`   - ${user.first_name} ${user.last_name} (${user.email}) - Role: ${user.role}`);
      });
    }
    
    // Test password validation
    console.log('\n📋 Testing password validation...');
    const testUser = await User.findOne({ email: 'customer@company.com' });
    
    if (testUser) {
      const isPasswordValid = await bcrypt.compare('customer123', testUser.password);
      console.log(`✅ Password validation for customer@company.com: ${isPasswordValid ? 'VALID' : 'INVALID'}`);
      
      if (!isPasswordValid) {
        console.log('❌ Password comparison failed - password may not be hashed correctly');
      }
    } else {
      console.log('❌ Test user not found');
    }
    
    console.log('\n🎉 Login logic test completed');
    
  } catch (error) {
    console.error('❌ Error during login logic test:', error);
  } finally {
    // Close database connection
    await mongoose.disconnect();
    console.log('🔐 Database connection closed');
  }
}

testLoginLogic();
