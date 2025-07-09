const connectDB = require('./db/connect');
const User = require('./models/User');

async function checkUsers() {
  try {
    await connectDB();
    console.log('Connected to MongoDB...\n');

    const users = await User.find({}).select('-password');
    
    if (users.length === 0) {
      console.log('❌ No users found in database!');
      console.log('You need to run the seed script first:');
      console.log('node src/seedRoleBasedUsers.js');
    } else {
      console.log(`✅ Found ${users.length} users in database:\n`);
      
      users.forEach((user, index) => {
        console.log(`${index + 1}. ${user.first_name} ${user.last_name}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Role: ${user.role}`);
        console.log(`   Created: ${user.created_at}`);
        console.log('');
      });
    }

    process.exit(0);

  } catch (error) {
    console.error('❌ Error checking users:', error);
    process.exit(1);
  }
}

checkUsers();
