// fix-agent-endpoints.js
// This script will test the agent endpoints and log the results

const mongoose = require('mongoose');
const axios = require('axios');
const jwt = require('jsonwebtoken');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/ticket-distribution', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB Connected'))
.catch(err => {
  console.error('MongoDB Connection Error:', err);
  process.exit(1);
});

// Import models
const User = require('./src/models/User');
const Ticket = require('./src/models/Ticket');
const Agent = require('./src/models/Agent');

// Function to generate a JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '1h' });
};

// Main test function
async function testAgentEndpoints() {
  try {
    console.log('🔍 Testing Agent API Endpoints...');
    
    // Find an agent user
    const agentUser = await User.findOne({ role: 'agent' });
    if (!agentUser) {
      console.error('❌ No agent user found in database');
      return;
    }
    console.log(`✅ Found agent user: ${agentUser.email} (${agentUser._id})`);
    
    // Find agent profile
    const agentProfile = await Agent.findOne({ user: agentUser._id });
    if (!agentProfile) {
      console.error('❌ No agent profile found for this user');
      return;
    }
    console.log(`✅ Found agent profile: ${agentProfile._id}`);
    
    // Generate JWT token for API calls
    const token = generateToken(agentUser._id);
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    
    // Test API endpoints
    console.log('\n🧪 Testing API endpoints with token...');
    
    // Test 1: Get my tickets endpoint
    try {
      console.log('\n🔍 Testing GET /api/tickets/agent/my-tickets');
      const myTicketsResponse = await axios.get('http://localhost:3000/api/tickets/agent/my-tickets', { headers });
      console.log(`✅ Response: ${myTicketsResponse.status}`);
      console.log(`✅ Found ${myTicketsResponse.data.tickets.length} tickets assigned to agent`);
      
      if (myTicketsResponse.data.tickets.length > 0) {
        console.log('📋 Sample ticket:', myTicketsResponse.data.tickets[0].subject);
      }
    } catch (error) {
      console.error('❌ Error with /api/tickets/agent/my-tickets endpoint:');
      if (error.response) {
        console.error(`Status: ${error.response.status}`);
        console.error('Data:', error.response.data);
      } else {
        console.error(error.message);
      }
    }
    
    // Test 2: Get unassigned tickets endpoint
    try {
      console.log('\n🔍 Testing GET /api/tickets/agent/unassigned');
      const unassignedResponse = await axios.get('http://localhost:3000/api/tickets/agent/unassigned', { headers });
      console.log(`✅ Response: ${unassignedResponse.status}`);
      console.log(`✅ Found ${unassignedResponse.data.tickets.length} unassigned tickets`);
    } catch (error) {
      console.error('❌ Error with /api/tickets/agent/unassigned endpoint:');
      if (error.response) {
        console.error(`Status: ${error.response.status}`);
        console.error('Data:', error.response.data);
      } else {
        console.error(error.message);
      }
    }
    
    // Test 3: Get all tickets endpoint (for comparison)
    try {
      console.log('\n🔍 Testing GET /api/tickets (regular endpoint)');
      const allTicketsResponse = await axios.get('http://localhost:3000/api/tickets', { headers });
      console.log(`✅ Response: ${allTicketsResponse.status}`);
      console.log(`✅ Found ${allTicketsResponse.data.tickets.length} total tickets`);
    } catch (error) {
      console.error('❌ Error with /api/tickets endpoint:');
      if (error.response) {
        console.error(`Status: ${error.response.status}`);
        console.error('Data:', error.response.data);
      } else {
        console.error(error.message);
      }
    }
    
    console.log('\n✅ API endpoint testing complete!');
    
  } catch (error) {
    console.error('❌ Test script error:', error);
  } finally {
    // Disconnect from MongoDB
    mongoose.disconnect();
    console.log('🔌 MongoDB disconnected');
  }
}

// Run the tests
testAgentEndpoints();
