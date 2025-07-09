const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

// Test the specific user credentials
const testUser = {
  email: 'customer@company.com',
  password: 'customer123'
};

async function testWithoutProfiles() {
  console.log('🚀 TESTING WITHOUT CUSTOMER PROFILE REQUIREMENTS');
  console.log('================================================');
  console.log(`User: ${testUser.email}`);
  console.log('');

  try {
    // Step 1: Test login
    console.log('🔐 Step 1: Testing login...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: testUser.email,
      password: testUser.password
    });
    
    console.log('✅ Login successful!');
    const token = loginResponse.data.token;
    console.log('');

    // Step 2: Test GET /api/tickets (should work without Customer profile)
    console.log('🎯 Step 2: Testing GET /api/tickets...');
    const ticketsResponse = await axios.get(`${BASE_URL}/tickets`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ GET /api/tickets successful!');
    console.log(`Found ${ticketsResponse.data.tickets.length} tickets`);
    console.log('');

    // Step 3: Test GET /api/tickets/stats/dashboard (should work without Customer profile)
    console.log('📊 Step 3: Testing GET /api/tickets/stats/dashboard...');
    const statsResponse = await axios.get(`${BASE_URL}/tickets/stats/dashboard`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ GET /api/tickets/stats/dashboard successful!');
    console.log(`Total tickets: ${statsResponse.data.totalTickets}`);
    console.log(`Escalated tickets: ${statsResponse.data.escalatedTickets}`);
    console.log('');

    // Step 4: Test POST /api/tickets (creating a ticket without Customer profile)
    console.log('📝 Step 4: Testing ticket creation...');
    const newTicketResponse = await axios.post(`${BASE_URL}/tickets`, {
      subject: 'Test Ticket Without Profile',
      description: 'This ticket was created without a Customer profile requirement',
      priority: 'medium',
      category: 'technical',
      type: 'incident'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Ticket creation successful!');
    console.log(`Created ticket ID: ${newTicketResponse.data.ticket._id}`);
    console.log('');

    console.log('🎉 ALL TESTS PASSED!');
    console.log('Customer profile requirements have been completely removed.');
    console.log('Any authenticated user can now access all ticket endpoints.');

  } catch (error) {
    console.error('❌ Error occurred:');
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error(`Message: ${error.response.data.message || error.response.data}`);
      
      if (error.response.status === 400 && error.response.data.message === 'Invalid email or password') {
        console.log('\n💡 User not found. You may need to create this user first.');
        console.log('Run: node src/fixSpecificUser.js');
      }
    } else if (error.code === 'ECONNREFUSED') {
      console.error('❌ Connection refused - Backend server is not running');
      console.log('\n💡 Start the backend server with: npm start');
    } else {
      console.error('❌ Unexpected error:', error.message);
    }
  }
}

testWithoutProfiles();
