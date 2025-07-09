const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

// Test the specific user credentials you mentioned
const testUser = {
  email: 'customer@company.com',
  password: 'customer123'
};

async function testSpecificUser() {
  console.log('🚀 TESTING SPECIFIC USER CREDENTIALS');
  console.log('====================================');
  console.log(`User: ${testUser.email}`);
  console.log(`Password: ${testUser.password}`);
  console.log('');

  try {
    // Step 1: Test login
    console.log('🔐 Step 1: Testing login...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: testUser.email,
      password: testUser.password
    });
    
    console.log('✅ Login successful!');
    console.log(`User: ${loginResponse.data.user.first_name} ${loginResponse.data.user.last_name}`);
    console.log(`Role: ${loginResponse.data.user.role}`);
    
    const token = loginResponse.data.token;
    console.log('');

    // Step 2: Test GET /api/tickets
    console.log('🎯 Step 2: Testing GET /api/tickets...');
    const ticketsResponse = await axios.get(`${BASE_URL}/tickets`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ GET /api/tickets successful!');
    console.log(`Found ${ticketsResponse.data.tickets.length} tickets`);
    console.log('');

    // Step 3: Test GET /api/tickets/stats/dashboard
    console.log('📊 Step 3: Testing GET /api/tickets/stats/dashboard...');
    const statsResponse = await axios.get(`${BASE_URL}/tickets/stats/dashboard`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ GET /api/tickets/stats/dashboard successful!');
    console.log(`Total tickets: ${statsResponse.data.totalTickets}`);
    console.log(`Escalated tickets: ${statsResponse.data.escalatedTickets}`);
    console.log('Status counts:', statsResponse.data.statusCounts);
    console.log('Priority counts:', statsResponse.data.priorityCounts);
    console.log('');

    // Step 4: Test creating a ticket
    console.log('📝 Step 4: Testing ticket creation...');
    const newTicketResponse = await axios.post(`${BASE_URL}/tickets`, {
      subject: 'Test Ticket',
      description: 'This is a test ticket created via API',
      priority: 'medium',
      category: 'technical',
      type: 'incident'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Ticket creation successful!');
    console.log(`Created ticket ID: ${newTicketResponse.data.ticket._id}`);
    console.log(`Subject: ${newTicketResponse.data.ticket.subject}`);
    console.log('');

    console.log('🎉 ALL TESTS PASSED!');
    console.log('The 404 issue has been completely resolved.');
    console.log('Your user can now successfully access all ticket endpoints.');

  } catch (error) {
    console.error('❌ Error occurred:');
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error(`Message: ${error.response.data.message || error.response.data}`);
      
      if (error.response.status === 400 && error.response.data.message === 'Invalid email or password') {
        console.log('\n💡 User not found. Running user creation script...');
        
        // If user doesn't exist, we'll need to create them
        const mongoose = require('mongoose');
        const User = require('./models/User');
        const Customer = require('./models/Customer');
        const bcrypt = require('bcryptjs');
        
        try {
          await mongoose.connect('mongodb://localhost:27017/ticket-system');
          
          const hashedPassword = await bcrypt.hash(testUser.password, 10);
          const newUser = new User({
            first_name: 'Customer',
            last_name: 'User',
            email: testUser.email,
            password: hashedPassword,
            role: 'customer'
          });
          
          await newUser.save();
          
          const customerProfile = new Customer({
            user: newUser._id,
            customerNumber: `CUST${Date.now()}${Math.random().toString(36).substr(2, 3).toUpperCase()}`,
            company: 'Company Corp',
            department: 'General',
            priority: 'normal',
            contactPreference: 'email'
          });
          
          await customerProfile.save();
          
          console.log(`✅ User created: ${testUser.email}`);
          console.log('✅ Customer profile created');
          console.log('\n🔄 Please run this test script again to verify the fix.');
          
          await mongoose.disconnect();
          
        } catch (dbError) {
          console.error('❌ Database error:', dbError.message);
        }
      }
    } else if (error.code === 'ECONNREFUSED') {
      console.error('❌ Connection refused - Backend server is not running');
      console.log('\n💡 Start the backend server with: npm start');
    } else {
      console.error('❌ Unexpected error:', error.message);
    }
  }
}

testSpecificUser();
