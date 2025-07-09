const mongoose = require('mongoose');
const axios = require('axios');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/ticket-distribution', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Import models
const User = require('./src/models/User');
const Ticket = require('./src/models/Ticket');
const Agent = require('./src/models/Agent');
const Customer = require('./src/models/Customer');

// Function to generate a JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '1h' });
};

async function testAgentEndpoints() {
  try {
    console.log('🔍 Testing Agent Endpoints...');
    
    // 1. Find the agent user
    const agentUser = await User.findOne({ email: 'agent@company.com' });
    if (!agentUser) {
      console.log('❌ Agent user not found!');
      return;
    }
    console.log('✅ Agent user found:', agentUser.email, 'ID:', agentUser._id);
    
    // 2. Check agent profile
    let agentProfile = await Agent.findOne({ user: agentUser._id });
    if (!agentProfile) {
      console.log('⚠️ Agent profile not found! Creating one...');
      agentProfile = new Agent({
        user: agentUser._id,
        skills: ['troubleshooting', 'technical support'],
        domain_expertise: ['software', 'hardware'],
        experience: 3,
        max_tickets: 10
      });
      await agentProfile.save();
      console.log('✅ Created agent profile with ID:', agentProfile._id);
    } else {
      console.log('✅ Agent profile found with ID:', agentProfile._id);
    }
    
    // 3. Check existing tickets
    const allTickets = await Ticket.find({});
    console.log(`📊 Total tickets in database: ${allTickets.length}`);
    
    // 4. Check tickets assigned to this agent
    const assignedTickets = await Ticket.find({ assigned_to: agentProfile._id });
    console.log(`📋 Tickets assigned to agent: ${assignedTickets.length}`);
    
    if (assignedTickets.length === 0) {
      console.log('🔧 Assigning some tickets to the agent...');
      
      // Get unassigned tickets
      const unassignedTickets = await Ticket.find({ 
        $or: [
          { assigned_to: null },
          { assigned_to: { $exists: false } }
        ]
      }).limit(3);
      
      if (unassignedTickets.length > 0) {
        // Assign first 3 tickets to the agent
        for (const ticket of unassignedTickets) {
          ticket.assigned_to = agentProfile._id; // Use agentProfile._id instead of user ID
          ticket.status = 'assigned';
          await ticket.save();
          console.log(`✅ Assigned ticket ${ticket._id} to agent profile ${agentProfile._id}`);
        }
      } else {
        // Create test tickets if none exist
        console.log('ℹ️ No unassigned tickets found, creating sample tickets...');
        
        // Find a customer to associate with tickets
        let customer = await Customer.findOne();
        
        if (!customer) {
          // If no customer exists, find a user with role customer
          const customerUser = await User.findOne({ role: 'customer' });
          
          if (customerUser) {
            // Create a customer profile
            customer = new Customer({
              user: customerUser._id,
              organization: 'Test Company',
              account_type: 'standard'
            });
            await customer.save();
            console.log('✅ Created test customer profile');
          } else {
            // Create a test customer user and profile
            const newCustomerUser = new User({
              first_name: 'Test',
              last_name: 'Customer',
              email: 'test.customer@example.com',
              password: '$2a$10$3QeI1aqBhab.FaJ1Ye6cF.dyS4T9qyVoiUCFmY2auXIgUBnF0O7Ma', // test123
              role: 'customer'
            });
            await newCustomerUser.save();
            
            customer = new Customer({
              user: newCustomerUser._id,
              organization: 'Test Company',
              account_type: 'standard'
            });
            await customer.save();
            console.log('✅ Created test customer and profile');
          }
        }
        
        // Create sample tickets
        for (let i = 0; i < 3; i++) {
          const newTicket = new Ticket({
            subject: `Test Ticket ${i+1}`,
            description: `This is a test ticket ${i+1} for the agent.`,
            priority: ['low', 'medium', 'high'][i % 3],
            status: 'new',
            customer: customer ? customer._id : null,
            created_at: new Date()
          });
          await newTicket.save();
          
          // Assign to agent
          newTicket.assigned_to = agentProfile._id;
          newTicket.status = 'assigned';
          await newTicket.save();
          console.log(`✅ Created and assigned test ticket ${newTicket._id}`);
        }
      }
    }
    
    // 5. Now test API endpoints
    console.log('\n🧪 TESTING API ENDPOINTS');
    
    // Generate JWT token for authenticated requests
    const token = generateToken(agentUser._id);
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    
    console.log('🔑 Generated JWT token for API calls');
    
    // Test all available endpoints
    try {
      console.log('\n🔍 Testing /api/tickets/agent/my-tickets endpoint');
      const myTicketsResponse = await axios.get('http://localhost:3000/api/tickets/agent/my-tickets', { headers });
      console.log('✅ Response status:', myTicketsResponse.status);
      console.log(`✅ Found ${myTicketsResponse.data.tickets.length} tickets assigned to agent`);
    } catch (error) {
      console.error('❌ Error with /api/tickets/agent/my-tickets:');
      console.error('Status:', error.response ? error.response.status : 'No response');
      console.error('Message:', error.response ? error.response.data : error.message);
    }
    
    try {
      console.log('\n🔍 Testing /api/tickets/agent/unassigned endpoint');
      const unassignedResponse = await axios.get('http://localhost:3000/api/tickets/agent/unassigned', { headers });
      console.log('✅ Response status:', unassignedResponse.status);
      console.log(`✅ Found ${unassignedResponse.data.tickets.length} unassigned tickets`);
    } catch (error) {
      console.error('❌ Error with /api/tickets/agent/unassigned:');
      console.error('Status:', error.response ? error.response.status : 'No response');
      console.error('Message:', error.response ? error.response.data : error.message);
    }
    
    // Try regular tickets endpoint for comparison
    try {
      console.log('\n🔍 Testing /api/tickets endpoint (regular endpoint)');
      const allTicketsResponse = await axios.get('http://localhost:3000/api/tickets', { headers });
      console.log('✅ Response status:', allTicketsResponse.status);
      console.log(`✅ Found ${allTicketsResponse.data.tickets.length} total tickets`);
    } catch (error) {
      console.error('❌ Error with /api/tickets:');
      console.error('Status:', error.response ? error.response.status : 'No response');
      console.error('Message:', error.response ? error.response.data : error.message);
    }
    
    console.log('\n✅ Endpoint testing complete!');
    
  } catch (error) {
    console.error('❌ Script error:', error);
  } finally {
    // Disconnect from MongoDB
    mongoose.disconnect();
    console.log('🔌 MongoDB disconnected');
  }
}

// Run the test function
testAgentEndpoints();
            await newCustomerUser.save();
            
            customer = new Customer({
              user: newCustomerUser._id,
              organization: 'Test Company',
              account_type: 'standard'
            });
            await customer.save();
            console.log('✅ Created test customer user and profile');
          }
        }
        
        // Create 3 test tickets
        for (let i = 1; i <= 3; i++) {
          const newTicket = new Ticket({
            subject: `Test Ticket ${i}`,
            description: `This is a test ticket ${i} for agent dashboard testing`,
            priority: ['low', 'medium', 'high'][i-1],
            status: 'new',
            customer: customer._id,
            created_at: new Date()
          });
          await newTicket.save();
          
          // Assign to agent
          newTicket.assigned_to = agentProfile._id;
          newTicket.status = 'assigned';
          await newTicket.save();
          
          console.log(`✅ Created and assigned test ticket ${i} to agent`);
        }
      }
    }
    
    // 5. Check final assigned tickets count
    const finalAssignedTickets = await Ticket.find({ assigned_to: agentProfile._id })
      .populate('customer', 'organization')
      .populate('assigned_to');
    
    console.log(`\n📋 Final tickets assigned to agent profile ${agentProfile._id}: ${finalAssignedTickets.length}`);
    finalAssignedTickets.forEach(ticket => {
      console.log(`  - ${ticket._id}: ${ticket.subject} (${ticket.status})`);
    });
    
    // 6. Check unassigned tickets
    const unassigned = await Ticket.find({ 
      $or: [
        { assigned_to: null },
        { assigned_to: { $exists: false } }
      ]
    });
    console.log(`\n📋 Unassigned tickets: ${unassigned.length}`);
    
    console.log('\n✅ Agent endpoint test setup completed!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

testAndSetupAgent();

testAndSetupAgent();
