const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const connectDB = require('./db/connect');

// Sample users data
const sampleUsers = [
  {
    first_name: 'Bhavanjay',
    last_name: 'Sharma',
    email: 'bhavanjay@example.com',
    password: 'password123',
    role: 'admin'
  },
  {
    first_name: 'Ashwini',
    last_name: 'Patel',
    email: 'ashwini@example.com',
    password: 'password123',
    role: 'agent'
  },
  {
    first_name: 'Datta',
    last_name: 'Kumar',
    email: 'datta@example.com',
    password: 'password123',
    role: 'agent'
  },
  {
    first_name: 'Pooja',
    last_name: 'Singh',
    email: 'pooja@example.com',
    password: 'password123',
    role: 'customer'
  },
  {
    first_name: 'Dipti',
    last_name: 'Joshi',
    email: 'dipti@example.com',
    password: 'password123',
    role: 'customer'
  },
  {
    first_name: 'Amar',
    last_name: 'Gupta',
    email: 'amar@example.com',
    password: 'password123',
    role: 'agent'
  },
  {
    first_name: 'Anuj',
    last_name: 'Verma',
    email: 'anuj@example.com',
    password: 'password123',
    role: 'customer'
  }
];

async function seedUsers() {
  try {
    // Connect to database
    await connectDB();
    console.log('Connected to MongoDB');

    // Clear existing users (optional - remove this if you want to keep existing data)
    await User.deleteMany({});
    console.log('Cleared existing users');

    // Hash passwords and create users
    const users = [];
    for (const userData of sampleUsers) {
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(userData.password, saltRounds);
      
      users.push({
        ...userData,
        password: hashedPassword
      });
    }

    // Insert users into database
    const insertedUsers = await User.insertMany(users);
    console.log(`Successfully inserted ${insertedUsers.length} users:`);
    
    insertedUsers.forEach(user => {
      console.log(`- ${user.first_name} ${user.last_name} (${user.email}) - Role: ${user.role}`);
    });

  } catch (error) {
    console.error('Error seeding users:', error);
  } finally {
    // Close database connection
    mongoose.connection.close();
    console.log('\nDatabase connection closed');
  }
}

// Run the seed function
seedUsers();
