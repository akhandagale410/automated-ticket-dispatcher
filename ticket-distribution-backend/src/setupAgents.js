const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Agent = require('./models/Agent');

async function setupDefaultAgents() {
  const agents = [
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
    }
  ];

  for (const agentData of agents) {
    try {
      // Check if user exists
      let user = await User.findOne({ email: agentData.email });
      
      if (!user) {
        const hashedPassword = await bcrypt.hash(agentData.password, 10);
        user = new User({
          first_name: agentData.first_name,
          last_name: agentData.last_name,
          email: agentData.email,
          password: hashedPassword,
          role: agentData.role
        });
        await user.save();
        console.log(`✅ Created user: ${agentData.email}`);
      }

      // Create agent profile if it doesn't exist
      let agentProfile = await Agent.findOne({ user: user._id });
      if (!agentProfile) {
        agentProfile = new Agent({
          user: user._id,
          skills: ['general-support', 'technical-support'],
          domain_expertise: ['technical-support'],
          experience: agentData.role === 'admin' ? 5 : 2,
          certifications: [],
          max_tickets: agentData.role === 'admin' ? 15 : 10,
          workload: 0,
          availability: 'offline'
        });
        await agentProfile.save();
        console.log(`✅ Created agent profile for: ${agentData.email}`);
      }
    } catch (error) {
      console.error(`❌ Error creating agent ${agentData.email}:`, error.message);
    }
  }
}

module.exports = { setupDefaultAgents };
