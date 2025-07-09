const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

async function createQuickUsers() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect('mongodb://localhost:27017/ticket-distribution', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to MongoDB');

    // Clear existing users
    await User.deleteMany({});
    console.log('Cleared existing users');

    // Create test users
    const users = [
      {
        first_name: 'John',
        last_name: 'Customer',
        email: 'customer@company.com',
        password: await bcrypt.hash('customer123', 10),
        role: 'customer'
      },
      {
        first_name: 'Jane',
        last_name: 'Agent',
        email: 'agent@company.com',
        password: await bcrypt.hash('agent123', 10),
        role: 'agent'
      },
      {
        first_name: 'Admin',
        last_name: 'User',
        email: 'admin@company.com',
        password: await bcrypt.hash('admin123', 10),
        role: 'admin'
      },
      {
        first_name: 'Sarah',
        last_name: 'Customer',
        email: 'customer2@company.com',
        password: await bcrypt.hash('customer123', 10),
        role: 'customer'
      },
      {
        first_name: 'Support',
        last_name: 'Agent',
        email: 'support@company.com',
        password: await bcrypt.hash('agent123', 10),
        role: 'agent'
      }
    ];

    await User.insertMany(users);
    console.log('✅ Created 5 test users:');
    console.log('');
    console.log('📋 CUSTOMER USERS:');
    console.log('   1. customer@company.com / customer123 (John Customer)');
    console.log('   2. customer2@company.com / customer123 (Sarah Customer)');
    console.log('');
    console.log('📋 AGENT USERS:');
    console.log('   1. agent@company.com / agent123 (Jane Agent)');
    console.log('   2. support@company.com / agent123 (Support Agent)');
    console.log('');
    console.log('📋 ADMIN USERS:');
    console.log('   1. admin@company.com / admin123 (Admin User)');

    mongoose.connection.close();
    console.log('✅ Database setup complete!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n🔧 Make sure MongoDB is running:');
    console.log('   Windows: net start MongoDB');
    console.log('   Manual:  mongod --dbpath C:\\data\\db');
  }
}

createQuickUsers();
