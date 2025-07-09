const mongoose = require('mongoose');
const User = require('./models/User');
const connectDB = require('./db/connect');

async function listAllUsers() {
  try {
    console.log('🔍 LISTING ALL USERS IN DATABASE');
    console.log('=================================\n');

    // Connect to database
    await connectDB();
    
    // Get all users
    const users = await User.find({}).select('-password');
    
    if (users.length === 0) {
      console.log('❌ No users found in database');
      console.log('\n🔧 Create users by running:');
      console.log('node src/createQuickUsers.js');
    } else {
      console.log(`✅ Found ${users.length} users:\n`);
      
      users.forEach((user, index) => {
        console.log(`${index + 1}. ${user.first_name} ${user.last_name}`);
        console.log(`   📧 Email: ${user.email}`);
        console.log(`   👤 Role: ${user.role}`);
        console.log(`   📅 Created: ${user.created_at}`);
        console.log('');
      });
      
      console.log('🔑 LOGIN CREDENTIALS (based on default passwords):');
      console.log('================================================\n');
      
      users.forEach((user, index) => {
        let defaultPassword = 'password123'; // Default fallback
        
        // Determine likely password based on role and email
        if (user.email.includes('customer')) {
          defaultPassword = 'customer123';
        } else if (user.email.includes('agent')) {
          defaultPassword = 'agent123';
        } else if (user.email.includes('admin')) {
          defaultPassword = 'admin123';
        } else if (user.role === 'customer') {
          defaultPassword = 'customer123';
        } else if (user.role === 'agent') {
          defaultPassword = 'agent123';
        } else if (user.role === 'admin') {
          defaultPassword = 'admin123';
        }
        
        console.log(`${index + 1}. ${user.role.toUpperCase()} USER:`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Password: ${defaultPassword}`);
        console.log(`   Role: ${user.role}`);
        console.log('');
      });
    }
    
  } catch (error) {
    console.error('❌ Error listing users:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔐 Database connection closed');
  }
}

listAllUsers();
