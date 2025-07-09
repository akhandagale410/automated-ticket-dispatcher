const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const connectDB = require('./db/connect');

async function pushSampleUsers() {
  try {
    console.log('🚀 PUSHING SAMPLE USERS TO DATABASE');
    console.log('===================================\n');

    // Connect to database
    await connectDB();
    
    // Define sample users
    const sampleUsers = [
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
        first_name: 'Sarah',
        last_name: 'Customer',
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

    console.log('📋 Processing sample users...\n');
    
    let createdCount = 0;
    let existingCount = 0;
    
    for (const userData of sampleUsers) {
      try {
        // Check if user already exists
        const existingUser = await User.findOne({ email: userData.email });
        
        if (existingUser) {
          console.log(`⚠️  User already exists: ${userData.email} (${userData.role})`);
          existingCount++;
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
          console.log(`✅ Created user: ${userData.email} (${userData.role})`);
          createdCount++;
        }
      } catch (error) {
        console.log(`❌ Error creating user ${userData.email}:`, error.message);
      }
    }
    
    console.log(`\n📊 SUMMARY:`);
    console.log(`   ✅ Created: ${createdCount} users`);
    console.log(`   ⚠️  Already existed: ${existingCount} users`);
    console.log(`   📝 Total processed: ${sampleUsers.length} users`);
    
    // Verify all users in database
    console.log('\n🔍 VERIFYING ALL USERS IN DATABASE:');
    console.log('===================================\n');
    
    const allUsers = await User.find({}).select('-password').sort({ role: 1, email: 1 });
    
    if (allUsers.length === 0) {
      console.log('❌ No users found in database');
    } else {
      console.log(`✅ Total users in database: ${allUsers.length}\n`);
      
      allUsers.forEach((user, index) => {
        console.log(`${index + 1}. ${user.first_name} ${user.last_name}`);
        console.log(`   📧 Email: ${user.email}`);
        console.log(`   👤 Role: ${user.role}`);
        console.log(`   📅 Created: ${user.created_at.toLocaleDateString()}`);
        console.log('');
      });
    }
    
    // Show login credentials
    console.log('🔑 LOGIN CREDENTIALS FOR ALL USERS:');
    console.log('===================================\n');
    
    const credentialsByRole = {
      customer: [],
      agent: [],
      admin: []
    };
    
    allUsers.forEach(user => {
      let password = 'password123'; // default
      
      if (user.email.includes('customer') || user.role === 'customer') {
        password = 'customer123';
      } else if (user.email.includes('agent') || user.email.includes('support') || user.role === 'agent') {
        password = 'agent123';
      } else if (user.email.includes('admin') || user.role === 'admin') {
        password = 'admin123';
      }
      
      credentialsByRole[user.role].push({
        name: `${user.first_name} ${user.last_name}`,
        email: user.email,
        password: password,
        role: user.role
      });
    });
    
    // Display by role
    Object.keys(credentialsByRole).forEach(role => {
      if (credentialsByRole[role].length > 0) {
        console.log(`📋 ${role.toUpperCase()} USERS:`);
        credentialsByRole[role].forEach((user, index) => {
          console.log(`   ${index + 1}. ${user.name}`);
          console.log(`      📧 Email: ${user.email}`);
          console.log(`      🔐 Password: ${user.password}`);
          console.log(`      🎭 Role: ${user.role}`);
          console.log('');
        });
      }
    });
    
    console.log('🎉 Sample users successfully pushed to database!');
    
  } catch (error) {
    console.error('❌ Error pushing sample users:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔐 Database connection closed');
  }
}

// Run the function
pushSampleUsers();
