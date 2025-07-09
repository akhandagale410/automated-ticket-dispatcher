const mongoose = require('mongoose');
const connectDB = require('./src/db/connect');
const User = require('./src/models/User');
const Agent = require('./src/models/Agent');
const Ticket = require('./src/models/Ticket');
const Customer = require('./src/models/Customer');

async function assignTicketsToAgent() {
  try {
    console.log('🎯 Assigning tickets to agent@company.com');
    console.log('📋 Using database: ticket-distribution');
    
    // Connect to database
    await connectDB();
    
    // Find the agent user
    console.log('\n🔍 Looking for agent@company.com...');
    const agentUser = await User.findOne({ email: 'agent@company.com' });
    
    if (!agentUser) {
      console.log('❌ Agent user not found. Please create the agent first.');
      process.exit(1);
    }
    
    console.log(`✅ Found agent: ${agentUser.first_name} ${agentUser.last_name} (${agentUser.role})`);
    
    // Find the agent profile
    const agentProfile = await Agent.findOne({ user: agentUser._id });
    if (!agentProfile) {
      console.log('❌ Agent profile not found. Creating one...');
      const newAgentProfile = new Agent({
        user: agentUser._id,
        skills: ['general-support', 'technical-support'],
        domain_expertise: ['technical-support'],
        experience: 2,
        certifications: [],
        max_tickets: 10,
        workload: 0,
        availability: 'offline'
      });
      await newAgentProfile.save();
      console.log('✅ Agent profile created');
    }
    
    // Check existing tickets
    console.log('\n📊 Checking existing tickets...');
    const allTickets = await Ticket.find({});
    console.log(`Found ${allTickets.length} total tickets in database`);
    
    const assignedTickets = await Ticket.find({ assigned_to: agentUser._id });
    console.log(`Agent already has ${assignedTickets.length} assigned tickets`);
    
    // If there are no tickets, create some sample tickets
    if (allTickets.length === 0) {
      console.log('\n🔧 No tickets found. Creating sample tickets...');
      
      // Create a sample customer first
      let customer = await Customer.findOne({});
      if (!customer) {
        // Create a dummy customer
        const customerUser = await User.findOne({ role: 'customer' });
        if (customerUser) {
          customer = new Customer({
            user: customerUser._id,
            organization: 'Sample Company'
          });
        } else {
          // Create a dummy customer user
          const dummyCustomerUser = new User({
            first_name: 'John',
            last_name: 'Customer',
            email: 'customer@company.com',
            password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password123
            role: 'customer'
          });
          await dummyCustomerUser.save();
          
          customer = new Customer({
            user: dummyCustomerUser._id,
            organization: 'Sample Company'
          });
        }
        await customer.save();
        console.log('✅ Sample customer created');
      }
      
      // Create sample tickets
      const sampleTickets = [
        {
          subject: 'Login Issue - Unable to access system',
          description: 'User cannot log into the application. Getting authentication error.',
          category: 'technical',
          priority: 'high',
          type: 'incident',
          severity: 'major',
          complexity: 'moderate',
          status: 'new',
          customer: customer._id
        },
        {
          subject: 'Password Reset Request',
          description: 'User needs password reset for their account.',
          category: 'account',
          priority: 'medium',
          type: 'request',
          severity: 'minor',
          complexity: 'simple',
          status: 'new',
          customer: customer._id
        },
        {
          subject: 'Application Performance Issue',
          description: 'Application is running slowly, users experiencing delays.',
          category: 'performance',
          priority: 'high',
          type: 'incident',
          severity: 'major',
          complexity: 'complex',
          status: 'new',
          customer: customer._id
        },
        {
          subject: 'Feature Request - Export Functionality',
          description: 'Request to add CSV export feature to reports.',
          category: 'enhancement',
          priority: 'low',
          type: 'request',
          severity: 'minor',
          complexity: 'moderate',
          status: 'new',
          customer: customer._id
        },
        {
          subject: 'Database Connection Error',
          description: 'System showing database connection timeouts intermittently.',
          category: 'technical',
          priority: 'critical',
          type: 'incident',
          severity: 'critical',
          complexity: 'complex',
          status: 'new',
          customer: customer._id
        },
        {
          subject: 'User Permission Issue',
          description: 'User cannot access certain modules despite having proper role.',
          category: 'access',
          priority: 'medium',
          type: 'incident',
          severity: 'major',
          complexity: 'moderate',
          status: 'new',
          customer: customer._id
        }
      ];
      
      console.log('📝 Creating sample tickets...');
      for (const ticketData of sampleTickets) {
        const ticket = new Ticket(ticketData);
        await ticket.save();
        console.log(`✅ Created ticket: ${ticketData.subject}`);
      }
      
      // Refresh tickets list
      const newTickets = await Ticket.find({});
      console.log(`✅ Created ${newTickets.length} sample tickets`);
    }
    
    // Get unassigned tickets to assign to the agent
    console.log('\n🎯 Assigning tickets to agent...');
    const unassignedTickets = await Ticket.find({ 
      $or: [
        { assigned_to: null },
        { assigned_to: { $exists: false } }
      ]
    }).limit(4); // Assign up to 4 tickets
    
    console.log(`Found ${unassignedTickets.length} unassigned tickets`);
    
    let assignedCount = 0;
    for (const ticket of unassignedTickets) {
      ticket.assigned_to = agentUser._id;
      ticket.status = 'assigned';
      ticket.updated_at = new Date();
      
      // Add to history
      if (!ticket.history) {
        ticket.history = [];
      }
      ticket.history.push({
        status: 'assigned',
        changedBy: 'System Auto-Assignment',
        changedAt: new Date()
      });
      
      await ticket.save();
      console.log(`✅ Assigned ticket: ${ticket.subject}`);
      assignedCount++;
    }
    
    // Final report
    console.log('\n📊 Assignment Summary:');
    console.log(`✅ Assigned ${assignedCount} tickets to agent@company.com`);
    
    const finalAssignedTickets = await Ticket.find({ assigned_to: agentUser._id })
      .populate('customer', 'organization');
    
    console.log(`\n🎫 Agent's Tickets (${finalAssignedTickets.length} total):`);
    finalAssignedTickets.forEach((ticket, index) => {
      console.log(`${index + 1}. ${ticket.subject}`);
      console.log(`   Status: ${ticket.status} | Priority: ${ticket.priority} | Type: ${ticket.type}`);
      console.log(`   Customer: ${ticket.customer?.organization || 'Unknown'}`);
      console.log('');
    });
    
    // Update agent workload
    if (agentProfile) {
      agentProfile.workload = finalAssignedTickets.length;
      await agentProfile.save();
      console.log(`✅ Updated agent workload: ${finalAssignedTickets.length} tickets`);
    }
    
    console.log('\n🎉 Ticket assignment completed!');
    console.log('💡 You can now test the agent dashboard with assigned tickets');
    console.log('🔑 Login as: agent@company.com / agent123');
    
    await mongoose.disconnect();
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('Stack:', error.stack);
    await mongoose.disconnect().catch(() => {});
    process.exit(1);
  }
}

// Run the script
console.log('🎯 Ticket Assignment Script');
console.log('Database: mongodb://localhost:27017/ticket-distribution');
console.log('Target Agent: agent@company.com');
console.log('=====================================');

assignTicketsToAgent();
