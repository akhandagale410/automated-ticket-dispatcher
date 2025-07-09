const mongoose = require('mongoose');
const User = require('./models/User');
const connectDB = require('./db/connect');

async function viewUsers() {
  try {
    // Connect to database
    await connectDB();
    console.log('Connected to MongoDB');

    // Fetch all users
    const users = await User.find({}).select('-password'); // Exclude password field
    
    console.log(`\nFound ${users.length} users in database:\n`);
    console.log('ID\t\t\t\tName\t\t\tEmail\t\t\t\tRole');
    console.log('='.repeat(100));
    
    users.forEach(user => {
      const name = `${user.first_name} ${user.last_name}`.padEnd(20);
      const email = user.email.padEnd(25);
      console.log(`${user._id}\t${name}\t${email}\t${user.role}`);
    });

  } catch (error) {
    console.error('Error fetching users:', error);
  } finally {
    // Close database connection
    mongoose.connection.close();
    console.log('\nDatabase connection closed');
  }
}

// Run the view function
viewUsers();
