const bcrypt = require('bcryptjs');

// Simple script to create agent data without MongoDB connection for now
async function createAgentData() {
  console.log('🔧 Creating agent dummy data...');
  
  const agentUsers = [
    {
      first_name: 'John',
      last_name: 'Agent',
      email: 'agent@company.com',
      password: 'agent123',
      role: 'agent'
    },
    {
      first_name: 'Sarah',
      last_name: 'Support',
      email: 'sarah.support@company.com',
      password: 'agent123',
      role: 'agent'
    },
    {
      first_name: 'Mike',
      last_name: 'Admin',
      email: 'admin@company.com',
      password: 'admin123',
      role: 'admin'
    },
    {
      first_name: 'Lisa',
      last_name: 'Senior',
      email: 'lisa.senior@company.com',
      password: 'agent123',
      role: 'agent'
    }
  ];

  console.log('👥 Agent Users to Create:');
  
  for (const user of agentUsers) {
    const hashedPassword = await bcrypt.hash(user.password, 10);
    console.log(`\n📝 ${user.role.toUpperCase()}: ${user.first_name} ${user.last_name}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Password: ${user.password}`);
    console.log(`   Hashed: ${hashedPassword.substring(0, 20)}...`);
    
    // Agent profile data
    if (user.role === 'agent' || user.role === 'admin') {
      const agentProfile = {
        skills: user.role === 'admin' ? 
          ['general-support', 'technical-support', 'billing', 'escalation'] : 
          ['general-support', 'technical-support'],
        domain_expertise: user.role === 'admin' ? 
          ['technical-support', 'system-administration', 'billing'] : 
          ['technical-support'],
        experience: user.role === 'admin' ? 5 : Math.floor(Math.random() * 3) + 1,
        certifications: user.role === 'admin' ? 
          ['CompTIA A+', 'ITIL Foundation'] : 
          ['Customer Service Excellence'],
        max_tickets: user.role === 'admin' ? 15 : 10,
        workload: 0,
        availability: 'offline'
      };
      
      console.log(`   Skills: ${agentProfile.skills.join(', ')}`);
      console.log(`   Experience: ${agentProfile.experience} years`);
      console.log(`   Max Tickets: ${agentProfile.max_tickets}`);
    }
  }
  
  console.log('\n🔑 Quick Login Reference:');
  agentUsers.forEach(user => {
    console.log(`${user.role.toUpperCase()}: ${user.email} / ${user.password}`);
  });
  
  console.log('\n💡 To use this data:');
  console.log('1. Start MongoDB service');
  console.log('2. Run: node push-agent-data.js');
  console.log('3. Start the backend server: npm start');
  console.log('4. Test login with the credentials above');
}

createAgentData();
