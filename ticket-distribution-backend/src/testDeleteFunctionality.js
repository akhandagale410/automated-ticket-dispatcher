const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';
let authToken = '';

// Test user credentials
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
    return true;
  } catch (error) {
    console.error('❌ Login failed:', error.response?.data?.message || error.message);
    return false;
  }
}

async function testDeleteTicketWithDifferentStatuses() {
  try {
    console.log('\n🧪 Testing delete functionality for different ticket statuses...');
    
    // Get existing tickets to find one with a resolved or in_progress status
    const response = await axios.get(`${BASE_URL}/tickets`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    const tickets = response.data.tickets;
    console.log(`Found ${tickets.length} tickets for testing:`);
    
    for (const ticket of tickets) {
      console.log(`   - ${ticket.subject} | Status: ${ticket.status} | ID: ${ticket._id.substring(0, 8)}`);
    }
    
    // Find a ticket with resolved or in_progress status to test deletion
    const testTicket = tickets.find(t => ['resolved', 'in_progress', 'assigned'].includes(t.status));
    
    if (testTicket) {
      console.log(`\n🗑️ Testing delete on ${testTicket.status} ticket: ${testTicket.subject}`);
      
      const deleteResponse = await axios.delete(`${BASE_URL}/tickets/${testTicket._id}`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      
      console.log('✅ Delete successful for', testTicket.status, 'ticket!');
      console.log('   Message:', deleteResponse.data.message);
      
      // Verify the ticket is actually deleted
      try {
        await axios.get(`${BASE_URL}/tickets/${testTicket._id}`, {
          headers: { Authorization: `Bearer ${authToken}` }
        });
        console.log('❌ Ticket still exists after deletion');
      } catch (error) {
        if (error.response?.status === 404) {
          console.log('✅ Ticket successfully removed from database');
        } else {
          console.log('❓ Unexpected error checking ticket existence:', error.response?.data?.message);
        }
      }
    } else {
      console.log('ℹ️ No tickets with resolved/in_progress/assigned status found for testing');
      
      // Create a new ticket and try to delete it
      console.log('\n➕ Creating a new ticket for deletion test...');
      const newTicket = {
        subject: 'Test Ticket for Deletion',
        description: 'This ticket will be created and then deleted to test the functionality.',
        priority: 'medium',
        type: 'incident'
      };
      
      const createResponse = await axios.post(`${BASE_URL}/tickets`, newTicket, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      
      const createdTicket = createResponse.data.ticket;
      console.log(`✅ Created ticket: ${createdTicket.subject} | Status: ${createdTicket.status}`);
      
      // Now delete it
      console.log(`🗑️ Deleting the newly created ticket...`);
      const deleteResponse = await axios.delete(`${BASE_URL}/tickets/${createdTicket._id}`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      
      console.log('✅ Delete successful!');
      console.log('   Message:', deleteResponse.data.message);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data?.message || error.message);
  }
}

async function runDeleteTests() {
  console.log('🧪 TESTING DELETE FUNCTIONALITY FOR ALL TICKET STATUSES');
  console.log('='.repeat(60));

  const loginSuccess = await testLogin();
  if (!loginSuccess) {
    console.log('❌ Cannot proceed without successful login');
    return;
  }

  await testDeleteTicketWithDifferentStatuses();

  console.log('\n🎉 DELETE TESTING COMPLETED!');
  console.log('='.repeat(60));
}

// Run the tests
runDeleteTests().catch(console.error);
