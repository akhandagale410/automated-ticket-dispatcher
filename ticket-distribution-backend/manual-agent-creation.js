// Manual Agent Data for MongoDB Insertion
// Run this in MongoDB Compass or mongo shell

// First, use the correct database
use('ticket-distribution');

// Agent users to create
const agentUsers = [
  {
    first_name: 'John',
    last_name: 'Agent',
    email: 'agent@company.com',
    // Password hash for 'agent123'
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    role: 'agent',
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    first_name: 'Sarah',
    last_name: 'Support',
    email: 'sarah.support@company.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    role: 'agent',
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    first_name: 'Mike',
    last_name: 'Admin',
    email: 'admin@company.com',
    // Password hash for 'admin123'
    password: '$2a$10$VQRoQ5EHt7W8hDtpzGI0ZukM7SsBhL4XcP3h7ZjVNqXz8Z9QjOQ5K',
    role: 'admin',
    created_at: new Date(),
    updated_at: new Date()
  }
];

console.log('🔧 Creating agent users...');

// Insert users
for (const user of agentUsers) {
  try {
    const existingUser = db.users.findOne({ email: user.email });
    if (!existingUser) {
      const result = db.users.insertOne(user);
      console.log(`✅ Created user: ${user.email} - ID: ${result.insertedId}`);
      
      // Create agent profile
      const agentProfile = {
        user: result.insertedId,
        skills: user.role === 'admin' ? 
          ['general-support', 'technical-support', 'billing', 'escalation'] : 
          ['general-support', 'technical-support'],
        domain_expertise: ['technical-support'],
        experience: user.role === 'admin' ? 5 : Math.floor(Math.random() * 3) + 1,
        certifications: [],
        max_tickets: user.role === 'admin' ? 15 : 10,
        workload: 0,
        availability: 'offline',
        total_tickets_resolved: 0,
        avg_resolution_time: 0,
        avg_customer_rating: 0,
        created_at: new Date()
      };
      
      const agentResult = db.agents.insertOne(agentProfile);
      console.log(`✅ Created agent profile for: ${user.email} - ID: ${agentResult.insertedId}`);
    } else {
      console.log(`ℹ️ User already exists: ${user.email}`);
    }
  } catch (error) {
    console.log(`❌ Error creating ${user.email}:`, error.message);
  }
}

console.log('\n📊 Final check - Users:');
db.users.find({}).forEach(user => {
  console.log(`- ${user.email} (${user.role}) - ${user.first_name} ${user.last_name}`);
});

console.log('\n🕵️ Final check - Agents:');
db.agents.find({}).forEach(agent => {
  const user = db.users.findOne({ _id: agent.user });
  if (user) {
    console.log(`- ${user.email} - Skills: ${agent.skills.join(', ')}`);
  }
});

console.log('\n🔑 Login Credentials:');
console.log('AGENT: agent@company.com / agent123');
console.log('AGENT: sarah.support@company.com / agent123');
console.log('ADMIN: admin@company.com / admin123');
