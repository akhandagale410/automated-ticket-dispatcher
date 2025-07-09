const bcrypt = require('bcryptjs');
const User = require('./models/User');
const connectDB = require('./db/connect');

async function seedRoleBasedUsers() {
  try {
    // Connect to database
    await connectDB();
    console.log('Connected to MongoDB...');

    // Clear existing users first
    await User.deleteMany({});
    console.log('Cleared existing users...');

    const saltRounds = 10;

    // Create test users with different roles
    const testUsers = [
      // Admin users
      {
        first_name: 'Admin',
        last_name: 'User',
        email: 'admin@company.com',
        password: await bcrypt.hash('admin123', saltRounds),
        role: 'admin'
      },
      {
        first_name: 'System',
        last_name: 'Administrator',
        email: 'sysadmin@company.com',
        password: await bcrypt.hash('admin123', saltRounds),
        role: 'admin'
      },

      // Agent users
      {
        first_name: 'Support',
        last_name: 'Agent',
        email: 'agent@company.com',
        password: await bcrypt.hash('agent123', saltRounds),
        role: 'agent'
      },
      {
        first_name: 'Technical',
        last_name: 'Specialist',
        email: 'techagent@company.com',
        password: await bcrypt.hash('agent123', saltRounds),
        role: 'agent'
      },
      {
        first_name: 'Customer',
        last_name: 'Service',
        email: 'csagent@company.com',
        password: await bcrypt.hash('agent123', saltRounds),
        role: 'agent'
      },

      // Customer users
      {
        first_name: 'John',
        last_name: 'Doe',
        email: 'customer@company.com',
        password: await bcrypt.hash('customer123', saltRounds),
        role: 'customer'
      },
      {
        first_name: 'Jane',
        last_name: 'Smith',
        email: 'jane.smith@company.com',
        password: await bcrypt.hash('customer123', saltRounds),
        role: 'customer'
      },
      {
        first_name: 'Bob',
        last_name: 'Johnson',
        email: 'bob.johnson@company.com',
        password: await bcrypt.hash('customer123', saltRounds),
        role: 'customer'
      },
      {
        first_name: 'Alice',
        last_name: 'Williams',
        email: 'alice.williams@company.com',
        password: await bcrypt.hash('customer123', saltRounds),
        role: 'customer'
      },
      {
        first_name: 'Charlie',
        last_name: 'Brown',
        email: 'charlie.brown@company.com',
        password: await bcrypt.hash('customer123', saltRounds),
        role: 'customer'
      }
    ];

    // Insert users
    const createdUsers = await User.insertMany(testUsers);
    console.log(`Created ${createdUsers.length} users with different roles:`);
    
    // Display created users grouped by role
    const usersByRole = createdUsers.reduce((acc, user) => {
      if (!acc[user.role]) acc[user.role] = [];
      acc[user.role].push(user);
      return acc;
    }, {});

    Object.keys(usersByRole).forEach(role => {
      console.log(`\n${role.toUpperCase()} USERS:`);
      usersByRole[role].forEach(user => {
        console.log(`  - ${user.first_name} ${user.last_name} (${user.email})`);
      });
    });

    console.log('\n=== LOGIN CREDENTIALS ===');
    console.log('\nADMIN LOGIN:');
    console.log('Email: admin@company.com');
    console.log('Password: admin123');
    
    console.log('\nAGENT LOGIN:');
    console.log('Email: agent@company.com');
    console.log('Password: agent123');
    
    console.log('\nCUSTOMER LOGIN:');
    console.log('Email: customer@company.com');
    console.log('Password: customer123');

    console.log('\n✅ Role-based users seeded successfully!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error seeding role-based users:', error);
    process.exit(1);
  }
}

// Run the seeding function
seedRoleBasedUsers();
