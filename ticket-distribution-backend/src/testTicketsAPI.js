const axios = require('axios');

async function testTicketsEndpoint() {
  console.log('🧪 TESTING TICKETS ENDPOINT');
  console.log('===========================\n');

  const baseURL = 'http://localhost:3000';

  try {
    // Test 1: Health check
    console.log('📋 Step 1: Testing server health...');
    try {
      const healthResponse = await axios.get(`${baseURL}/api/health`);
      console.log('✅ Server is running');
      console.log('Available endpoints:', healthResponse.data.endpoints);
    } catch (error) {
      console.log('❌ Server not running. Start it with: node src/testTicketsServer.js');
      return;
    }

    // Test 2: Test routes endpoint
    console.log('\n📋 Step 2: Testing routes endpoint...');
    try {
      const routesResponse = await axios.get(`${baseURL}/api/test/routes`);
      console.log('✅ Routes endpoint working');
      console.log('Ticket routes:', routesResponse.data.availableRoutes.tickets);
    } catch (error) {
      console.log('❌ Routes endpoint failed:', error.response?.data?.message || error.message);
    }

    // Test 3: Test public tickets endpoint
    console.log('\n📋 Step 3: Testing public tickets endpoint...');
    try {
      const ticketsResponse = await axios.get(`${baseURL}/api/tickets/public/all`);
      console.log('✅ Tickets endpoint working!');
      console.log(`Found ${ticketsResponse.data.count} tickets`);
      
      if (ticketsResponse.data.tickets.length > 0) {
        console.log('\n📋 Sample tickets:');
        ticketsResponse.data.tickets.slice(0, 3).forEach((ticket, index) => {
          console.log(`${index + 1}. ${ticket.subject}`);
          console.log(`   Status: ${ticket.status} | Priority: ${ticket.priority}`);
          console.log(`   Customer: ${ticket.customer?.user?.email || 'Unknown'}`);
          console.log('');
        });
      } else {
        console.log('⚠️  No tickets found. Create some with: node src/createSampleTickets.js');
      }
    } catch (error) {
      console.log('❌ Tickets endpoint failed:', error.response?.data?.message || error.message);
      console.log('Error details:', error.response?.data);
    }

    // Test 4: Test ticket statistics
    console.log('\n📋 Step 4: Testing ticket statistics...');
    try {
      const statsResponse = await axios.get(`${baseURL}/api/tickets/public/stats`);
      console.log('✅ Ticket statistics working!');
      console.log('Statistics:', JSON.stringify(statsResponse.data, null, 2));
    } catch (error) {
      console.log('❌ Statistics endpoint failed:', error.response?.data?.message || error.message);
    }

    // Test 5: Test protected endpoint (should fail without auth)
    console.log('\n📋 Step 5: Testing protected endpoint (should require auth)...');
    try {
      await axios.get(`${baseURL}/api/tickets`);
      console.log('⚠️  Protected endpoint accessible without auth (unexpected)');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Protected endpoint correctly requires authentication');
      } else {
        console.log('❌ Unexpected error:', error.response?.data?.message || error.message);
      }
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }

  console.log('\n🎉 Tickets endpoint test completed!');
  console.log('\n💡 To access tickets:');
  console.log('   - Public (no auth): http://localhost:3000/api/tickets/public/all');
  console.log('   - Protected (requires auth): http://localhost:3000/api/tickets');
  console.log('\n💡 To create sample tickets:');
  console.log('   node src/createSampleTickets.js');
}

testTicketsEndpoint();
