const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';
let authToken = '';

// Test user credentials (one of our seeded customers)
const testUser = {
  email: 'pooja@example.com',
  password: 'password123'
};

async function testLogin() {
  try {
    console.log('🔐 Testing login...');
    const response = await axios.post(`${BASE_URL}/auth/login`, testUser);
    authToken = response.data.token;
    console.log('✅ Login successful!');
    console.log(`👤 User: ${response.data.user.first_name} ${response.data.user.last_name}`);
    console.log(`🎭 Role: ${response.data.user.role}`);
    return true;
  } catch (error) {
    console.error('❌ Login failed:', error.response?.data?.message || error.message);
    return false;
  }
}

async function testGetAllTickets() {
  try {
    console.log('\n🎫 Testing get all tickets...');
    const response = await axios.get(`${BASE_URL}/tickets`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log(`✅ Found ${response.data.tickets.length} tickets for user`);
    response.data.tickets.forEach((ticket, index) => {
      console.log(`   ${index + 1}. ${ticket.subject} | ${ticket.status} | ${ticket.priority}`);
    });
    return response.data.tickets;
  } catch (error) {
    console.error('❌ Get tickets failed:', error.response?.data?.message || error.message);
    return [];
  }
}

async function testGetTicketStats() {
  try {
    console.log('\n📊 Testing get ticket statistics...');
    const response = await axios.get(`${BASE_URL}/tickets/stats/dashboard`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Statistics retrieved successfully!');
    console.log(`   Total Tickets: ${response.data.totalTickets}`);
    console.log(`   Escalated Tickets: ${response.data.escalatedTickets}`);
    console.log('   Status Counts:', response.data.statusCounts);
    console.log('   Priority Counts:', response.data.priorityCounts);
  } catch (error) {
    console.error('❌ Get stats failed:', error.response?.data?.message || error.message);
  }
}

async function testGetTicketAging() {
  try {
    console.log('\n📈 Testing get ticket aging data...');
    const response = await axios.get(`${BASE_URL}/tickets/stats/aging`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Aging data retrieved successfully!');
    console.log('   Age Ranges:', response.data.ageRanges);
    console.log(`   Detailed Data: ${response.data.detailedData.length} tickets`);
  } catch (error) {
    console.error('❌ Get aging data failed:', error.response?.data?.message || error.message);
  }
}

async function testCreateTicket() {
  try {
    console.log('\n➕ Testing create new ticket...');
    const newTicket = {
      subject: 'Test Ticket from API',
      description: 'This is a test ticket created via API to verify the functionality works correctly.',
      category: 'Testing',
      priority: 'medium',
      type: 'incident',
      severity: 'minor',
      complexity: 'simple'
    };

    const response = await axios.post(`${BASE_URL}/tickets`, newTicket, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Ticket created successfully!');
    console.log(`   ID: ${response.data.ticket._id}`);
    console.log(`   Subject: ${response.data.ticket.subject}`);
    console.log(`   Status: ${response.data.ticket.status}`);
    return response.data.ticket;
  } catch (error) {
    console.error('❌ Create ticket failed:', error.response?.data?.message || error.message);
    return null;
  }
}

async function testEscalateTicket(ticketId) {
  try {
    console.log(`\n🚨 Testing escalate ticket ${ticketId}...`);
    const response = await axios.post(`${BASE_URL}/tickets/${ticketId}/escalate`, {
      escalation_reason: 'Testing escalation functionality via API'
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Ticket escalated successfully!');
    console.log(`   Escalated: ${response.data.ticket.escalated}`);
    console.log(`   Priority: ${response.data.ticket.priority}`);
  } catch (error) {
    console.error('❌ Escalate ticket failed:', error.response?.data?.message || error.message);
  }
}

async function testDeleteTicket(ticketId) {
  try {
    console.log(`\n🗑️ Testing delete ticket ${ticketId}...`);
    const response = await axios.delete(`${BASE_URL}/tickets/${ticketId}`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Ticket deleted successfully!');
  } catch (error) {
    console.error('❌ Delete ticket failed:', error.response?.data?.message || error.message);
  }
}

async function runAllTests() {
  console.log('🧪 STARTING API TESTS');
  console.log('='.repeat(50));

  // Test login
  const loginSuccess = await testLogin();
  if (!loginSuccess) {
    console.log('❌ Cannot proceed without successful login');
    return;
  }

  // Test get all tickets
  const tickets = await testGetAllTickets();

  // Test statistics
  await testGetTicketStats();

  // Test aging data
  await testGetTicketAging();

  // Test create ticket
  const newTicket = await testCreateTicket();

  // If we created a ticket, test escalation and deletion
  if (newTicket) {
    await testEscalateTicket(newTicket._id);
    await testDeleteTicket(newTicket._id);
  }

  console.log('\n🎉 API TESTING COMPLETED!');
  console.log('='.repeat(50));
}

// Run the tests
runAllTests().catch(console.error);
