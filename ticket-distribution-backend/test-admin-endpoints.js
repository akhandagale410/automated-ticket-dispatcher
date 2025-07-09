// test-admin-endpoints.js
// This script tests the admin endpoints for the ticket system

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
async function testAdminEndpoints() {
  try {
    console.log('🔍 Testing Admin API Endpoints...');
    
    // Find an admin user
    const adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      console.error('❌ No admin user found in database');
      return;
    }
    console.log(`✅ Found admin user: ${adminUser.email} (${adminUser._id})`);
    
    // Generate JWT token for API calls
    const token = generateToken(adminUser._id);
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    
    // Test API endpoints
    console.log('\n🧪 Testing Admin API endpoints with token...');
    
    // Test 1: Get all tickets with filters
    try {
      console.log('\n🔍 Testing GET /api/tickets/admin/tickets');
      const ticketsResponse = await axios.get('http://localhost:3000/api/tickets/admin/tickets', { 
        headers,
        params: {
          status: 'new',
          priority: 'high'
        }
      });
      console.log(`✅ Response: ${ticketsResponse.status}`);
      console.log(`✅ Found ${ticketsResponse.data.tickets.length} tickets matching filters`);
    } catch (error) {
      console.error('❌ Error with /api/tickets/admin/tickets endpoint:');
      if (error.response) {
        console.error(`Status: ${error.response.status}`);
        console.error('Data:', error.response.data);
      } else {
        console.error(error.message);
      }
    }
    
    // Test 2: Get agent workload
    try {
      console.log('\n🔍 Testing GET /api/tickets/admin/agents-workload');
      const workloadResponse = await axios.get('http://localhost:3000/api/tickets/admin/agents-workload', { headers });
      console.log(`✅ Response: ${workloadResponse.status}`);
      console.log(`✅ Found ${workloadResponse.data.agents.length} agents with workload info`);
      
      if (workloadResponse.data.agents.length > 0) {
        // Store first agent for later tests
        const firstAgent = workloadResponse.data.agents[0];
        console.log(`📋 Sample agent: ${firstAgent.name} (${firstAgent.id})`);
        console.log(`   Active tickets: ${firstAgent.activeTickets}, Capacity: ${firstAgent.capacity}`);
        
        // Get a ticket for assignment test
        const tickets = await Ticket.find({ 
          $or: [
            { assigned_to: null },
            { assigned_to: { $exists: false } }
          ]
        }).limit(1);
        
        if (tickets.length > 0) {
          const ticketToAssign = tickets[0];
          
          // Test 3: Assign ticket to agent
          try {
            console.log(`\n🔍 Testing POST /api/tickets/admin/assign/${ticketToAssign._id}/${firstAgent.id}`);
            const assignResponse = await axios.post(
              `http://localhost:3000/api/tickets/admin/assign/${ticketToAssign._id}/${firstAgent.id}`,
              { overrideCapacity: true },
              { headers }
            );
            console.log(`✅ Response: ${assignResponse.status}`);
            console.log(`✅ ${assignResponse.data.message}`);
          } catch (error) {
            console.error('❌ Error with ticket assignment endpoint:');
            if (error.response) {
              console.error(`Status: ${error.response.status}`);
              console.error('Data:', error.response.data);
            } else {
              console.error(error.message);
            }
          }
          
          // Test 4: Update a ticket
          try {
            console.log(`\n🔍 Testing PUT /api/tickets/admin/ticket/${ticketToAssign._id}`);
            const updateResponse = await axios.put(
              `http://localhost:3000/api/tickets/admin/ticket/${ticketToAssign._id}`,
              {
                status: 'in_progress',
                priority: 'high',
                additionalNote: 'Updated by admin test script'
              },
              { headers }
            );
            console.log(`✅ Response: ${updateResponse.status}`);
            console.log(`✅ ${updateResponse.data.message}`);
            console.log('📋 Changes applied:', updateResponse.data.changesApplied);
          } catch (error) {
            console.error('❌ Error with ticket update endpoint:');
            if (error.response) {
              console.error(`Status: ${error.response.status}`);
              console.error('Data:', error.response.data);
            } else {
              console.error(error.message);
            }
          }
          
          // Test 5: Bulk update tickets
          try {
            console.log(`\n🔍 Testing POST /api/tickets/admin/bulk-update`);
            const bulkUpdateResponse = await axios.post(
              'http://localhost:3000/api/tickets/admin/bulk-update',
              {
                ticketIds: [ticketToAssign._id],
                status: 'resolved',
                notes: 'Bulk update from test script'
              },
              { headers }
            );
            console.log(`✅ Response: ${bulkUpdateResponse.status}`);
            console.log(`✅ ${bulkUpdateResponse.data.message}`);
          } catch (error) {
            console.error('❌ Error with bulk update endpoint:');
            if (error.response) {
              console.error(`Status: ${error.response.status}`);
              console.error('Data:', error.response.data);
            } else {
              console.error(error.message);
            }
          }
        } else {
          console.log('⚠️ No unassigned tickets found for testing assignment');
        }
      }
    } catch (error) {
      console.error('❌ Error with agent workload endpoint:');
      if (error.response) {
        console.error(`Status: ${error.response.status}`);
        console.error('Data:', error.response.data);
      } else {
        console.error(error.message);
      }
    }
    
    console.log('\n✅ Admin API endpoint testing complete!');
    
  } catch (error) {
    console.error('❌ Test script error:', error);
  } finally {
    // Disconnect from MongoDB
    mongoose.disconnect();
    console.log('🔌 MongoDB disconnected');
  }
}

// Run the tests
testAdminEndpoints();
