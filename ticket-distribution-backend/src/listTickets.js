const mongoose = require('mongoose');
const Ticket = require('./models/Ticket');
const User = require('./models/User');
const Customer = require('./models/Customer');
const Agent = require('./models/Agent');
const connectDB = require('./db/connect');

async function listAllTickets() {
  try {
    console.log('🎫 LISTING ALL TICKETS IN DATABASE');
    console.log('==================================\n');

    // Connect to database
    await connectDB();
    
    // Get all tickets with populated references
    const tickets = await Ticket.find({})
      .populate('customer', 'organization user')
      .populate('assigned_to', 'user skills')
      .populate({
        path: 'customer',
        populate: {
          path: 'user',
          select: 'first_name last_name email'
        }
      })
      .populate({
        path: 'assigned_to',
        populate: {
          path: 'user',
          select: 'first_name last_name email'
        }
      })
      .sort({ created_at: -1 });
    
    if (tickets.length === 0) {
      console.log('❌ No tickets found in database');
      console.log('\n🔧 Create sample tickets by running:');
      console.log('node src/createSampleTickets.js');
    } else {
      console.log(`✅ Found ${tickets.length} tickets:\n`);
      
      tickets.forEach((ticket, index) => {
        console.log(`${index + 1}. ${ticket.subject}`);
        console.log(`   🆔 ID: ${ticket._id}`);
        console.log(`   📊 Status: ${ticket.status} | Priority: ${ticket.priority} | Type: ${ticket.type}`);
        console.log(`   👤 Customer: ${ticket.customer?.user?.first_name} ${ticket.customer?.user?.last_name} (${ticket.customer?.user?.email})`);
        console.log(`   🏢 Organization: ${ticket.customer?.organization || 'N/A'}`);
        console.log(`   👨‍💼 Assigned Agent: ${ticket.assigned_to ? 
          `${ticket.assigned_to.user?.first_name} ${ticket.assigned_to.user?.last_name} (${ticket.assigned_to.user?.email})` : 
          'Unassigned'}`);
        console.log(`   📅 Created: ${ticket.created_at}`);
        console.log(`   🏷️  Tags: ${ticket.tags?.join(', ') || 'None'}`);
        console.log(`   ⚠️  Severity: ${ticket.severity} | Complexity: ${ticket.complexity}`);
        console.log(`   🌍 Region: ${ticket.region || 'N/A'} | Country: ${ticket.country || 'N/A'}`);
        console.log(`   🔒 Security Restricted: ${ticket.security_restriction ? 'Yes' : 'No'}`);
        if (ticket.feedback_rating) {
          console.log(`   ⭐ Rating: ${ticket.feedback_rating}/5`);
        }
        console.log('   📝 Description:', ticket.description.substring(0, 100) + '...');
        console.log('');
      });
      
      // Statistics
      console.log('📊 TICKET STATISTICS');
      console.log('====================\n');
      
      const stats = {
        byStatus: {},
        byPriority: {},
        byType: {},
        bySeverity: {},
        byComplexity: {}
      };
      
      tickets.forEach(ticket => {
        stats.byStatus[ticket.status] = (stats.byStatus[ticket.status] || 0) + 1;
        stats.byPriority[ticket.priority] = (stats.byPriority[ticket.priority] || 0) + 1;
        stats.byType[ticket.type] = (stats.byType[ticket.type] || 0) + 1;
        stats.bySeverity[ticket.severity] = (stats.bySeverity[ticket.severity] || 0) + 1;
        stats.byComplexity[ticket.complexity] = (stats.byComplexity[ticket.complexity] || 0) + 1;
      });
      
      console.log('📋 By Status:');
      Object.entries(stats.byStatus).forEach(([status, count]) => {
        console.log(`   - ${status}: ${count}`);
      });
      
      console.log('\n📋 By Priority:');
      Object.entries(stats.byPriority).forEach(([priority, count]) => {
        console.log(`   - ${priority}: ${count}`);
      });
      
      console.log('\n📋 By Type:');
      Object.entries(stats.byType).forEach(([type, count]) => {
        console.log(`   - ${type}: ${count}`);
      });
      
      console.log('\n📋 By Severity:');
      Object.entries(stats.bySeverity).forEach(([severity, count]) => {
        console.log(`   - ${severity}: ${count}`);
      });
      
      console.log('\n📋 By Complexity:');
      Object.entries(stats.byComplexity).forEach(([complexity, count]) => {
        console.log(`   - ${complexity}: ${count}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error listing tickets:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔐 Database connection closed');
  }
}

listAllTickets();
