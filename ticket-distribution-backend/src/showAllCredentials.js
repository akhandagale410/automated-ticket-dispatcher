const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const connectDB = require('./db/connect');

async function createAllUsersAndShowCredentials() {
  try {
    console.log('🔍 USER MANAGEMENT & CREDENTIALS');
    console.log('=================================\n');

    // Connect to database
    await connectDB();
    
    // Define all test users
    const testUsers = [
      {
        first_name: 'John',
        last_name: 'Customer',
        email: 'customer@company.com',
        password: 'customer123',
        role: 'customer'
      },
      {
        first_name: 'Jane',
        last_name: 'Agent',
        email: 'agent@company.com',
        password: 'agent123',
        role: 'agent'
      },
      {
        first_name: 'Admin',
        last_name: 'User',
        email: 'admin@company.com',
        password: 'admin123',
        role: 'admin'
      },
      {
        first_name: 'Test',
        last_name: 'Customer2',
        email: 'customer2@company.com',
        password: 'customer123',
        role: 'customer'
      },
      {
        first_name: 'Support',
        last_name: 'Agent',
        email: 'support@company.com',
        password: 'agent123',
        role: 'agent'
      }
    ];

    console.log('📋 Creating/Checking Users...\n');
    
    const createdUsers = [];
    
    for (const userData of testUsers) {
      try {
        // Check if user already exists
        const existingUser = await User.findOne({ email: userData.email });
        
        if (existingUser) {
          console.log(`✅ User exists: ${userData.email}`);
          createdUsers.push({
            ...userData,
            exists: true
          });
        } else {
          // Hash password
          const hashedPassword = await bcrypt.hash(userData.password, 10);
          
          // Create new user
          const newUser = new User({
            first_name: userData.first_name,
            last_name: userData.last_name,
            email: userData.email,
            password: hashedPassword,
            role: userData.role
          });
          
          await newUser.save();
          console.log(`✅ User created: ${userData.email}`);
          createdUsers.push({
            ...userData,
            exists: false
          });
        }
      } catch (error) {
        console.log(`❌ Error with user ${userData.email}:`, error.message);
      }
    }
    
    // Show all login credentials
    console.log('\n🔑 ALL LOGIN CREDENTIALS');
    console.log('========================\n');
    
    createdUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.role.toUpperCase()} USER:`);
      console.log(`   👤 Name: ${user.first_name} ${user.last_name}`);
      console.log(`   📧 Email: ${user.email}`);
      console.log(`   🔐 Password: ${user.password}`);
      console.log(`   🎭 Role: ${user.role}`);
      console.log(`   📊 Status: ${user.exists ? 'Already existed' : 'Newly created'}`);
      console.log('');
    });
    
    // Show quick test commands
    console.log('🧪 QUICK TEST COMMANDS:');
    console.log('======================\n');
    
    createdUsers.forEach((user, index) => {
      console.log(`${index + 1}. Test ${user.role} login:`);
      console.log(`curl -X POST http://localhost:3000/api/auth/login \\`);
      console.log(`  -H "Content-Type: application/json" \\`);
      console.log(`  -d '{"email":"${user.email}","password":"${user.password}"}'`);
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔐 Database connection closed');
  }
}

createAllUsersAndShowCredentials();
