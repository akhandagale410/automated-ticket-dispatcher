const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// User schema
const UserSchema = new mongoose.Schema({
  first_name: String,
  last_name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, enum: ['customer', 'agent', 'admin'] },
  created_at: { type: Date, default: Date.now }
});

const User = mongoose.model('User', UserSchema);

// Sample users data
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

// Connect to MongoDB and create users
async function connectAndCreateUsers() {
  try {
    await mongoose.connect('mongodb://localhost:27017/ticket-distribution');
    console.log('✅ MongoDB connected');
    
    console.log('🚀 Creating sample users...\n');
    
    for (const userData of sampleUsers) {
      try {
        const existingUser = await User.findOne({ email: userData.email });
        
        if (!existingUser) {
          const hashedPassword = await bcrypt.hash(userData.password, 10);
          
          const newUser = new User({
            first_name: userData.first_name,
            last_name: userData.last_name,
            email: userData.email,
            password: hashedPassword,
            role: userData.role
          });
          
          await newUser.save();
          console.log(`✅ Created: ${userData.email} (${userData.role})`);
        } else {
          console.log(`⚠️  Exists: ${userData.email} (${userData.role})`);
        }
      } catch (error) {
        console.log(`❌ Error with ${userData.email}:`, error.message);
      }
    }
    
    // Show all users
    const allUsers = await User.find({}).select('-password');
    console.log(`\n📋 Total users in database: ${allUsers.length}\n`);
    
    allUsers.forEach((user, index) => {
      let password = user.email.includes('customer') ? 'customer123' : 
                     user.email.includes('agent') || user.email.includes('support') ? 'agent123' : 
                     user.email.includes('admin') ? 'admin123' : 'password123';
      
      console.log(`${index + 1}. ${user.role.toUpperCase()}: ${user.first_name} ${user.last_name}`);
      console.log(`   📧 Email: ${user.email}`);
      console.log(`   🔐 Password: ${password}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Database error:', error.message);
  }
}

// Routes
app.get('/api/create-users', async (req, res) => {
  try {
    await connectAndCreateUsers();
    res.json({ message: 'Sample users created successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error creating users', error: error.message });
  }
});

app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json({ users, count: users.length });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users' });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server running' });
});

// Start server
app.listen(PORT, async () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log('📋 Available endpoints:');
  console.log('   - GET /api/health');
  console.log('   - GET /api/create-users');
  console.log('   - GET /api/users');
  
  // Auto-create users on startup
  await connectAndCreateUsers();
});

module.exports = app;
