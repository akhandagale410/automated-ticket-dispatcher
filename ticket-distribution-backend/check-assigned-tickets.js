const mongoose = require('mongoose');
const connectDB = require('./src/db/connect');
const User = require('./src/models/User');
const Ticket = require('./src/models/Ticket');

async function checkAssignedTickets() {
  try {
    console.log('🔍 Checking tickets assigned to agent@company.com');
    console.log('Database: ticket-distribution');
    
    // Connect to database
    await connectDB();
    
    // Find the agent user
    const agentUser = await User.findOne({ email: 'agent@company.com' });
    
    if (!agentUser) {
      console.log('❌ Agent user not found');
      process.exit(1);
    }
    
    console.log(`✅ Found agent: ${agentUser.first_name} ${agentUser.last_name}`);
    
    // Find tickets assigned to this agent
    const assignedTickets = await Ticket.find({ assigned_to: agentUser._id })
      .populate('customer', 'organization')
      .sort({ created_at: -1 });
    
    console.log(`\n📊 Found ${assignedTickets.length} tickets assigned to agent@company.com:`);
    
    if (assignedTickets.length === 0) {
      console.log('❌ No tickets assigned to agent. Run the assignment script first.');
    } else {
      assignedTickets.forEach((ticket, index) => {
        console.log(`\n${index + 1}. ${ticket.subject}`);
        console.log(`   Status: ${ticket.status}`);
        console.log(`   Priority: ${ticket.priority}`);
        console.log(`   Type: ${ticket.type}`);
        console.log(`   Customer: ${ticket.customer?.organization || 'Unknown'}`);
        console.log(`   Created: ${ticket.created_at?.toLocaleDateString()}`);
      });
    }
    
    // Also check total tickets in database
    const totalTickets = await Ticket.countDocuments();
    console.log(`\n📋 Total tickets in database: ${totalTickets}`);
    
    await mongoose.disconnect();
    console.log('\n✅ Check completed');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    await mongoose.disconnect().catch(() => {});
    process.exit(1);
  }
}

checkAssignedTickets();
