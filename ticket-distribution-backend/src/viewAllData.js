const mongoose = require('mongoose');
const User = require('./models/User');
const Customer = require('./models/Customer');
const Ticket = require('./models/Ticket');
const connectDB = require('./db/connect');

async function viewAllData() {
  try {
    // Connect to database
    await connectDB();
    console.log('Connected to MongoDB');

    // Fetch all users
    const users = await User.find({}).select('-password');
    console.log(`\n👥 USERS (${users.length}):`);
    console.log('='.repeat(80));
    users.forEach(user => {
      console.log(`📧 ${user.email.padEnd(25)} | ${(user.first_name + ' ' + user.last_name).padEnd(20)} | Role: ${user.role}`);
    });

    // Fetch all customers with user details
    const customers = await Customer.find({}).populate('user', '-password');
    console.log(`\n🏢 CUSTOMERS (${customers.length}):`);
    console.log('='.repeat(80));
    customers.forEach(customer => {
      const user = customer.user;
      console.log(`🏢 ${customer.organization.padEnd(30)} | ${user.first_name} ${user.last_name} (${user.email})`);
    });

    // Fetch all tickets with customer and user details
    const tickets = await Ticket.find({}).populate({
      path: 'customer',
      populate: {
        path: 'user',
        select: '-password'
      }
    });
    
    console.log(`\n🎫 TICKETS (${tickets.length}):`);
    console.log('='.repeat(120));
    tickets.forEach(ticket => {
      const customer = ticket.customer;
      const user = customer.user;
      console.log(`🎫 ${ticket.subject.padEnd(40)} | ${ticket.status.padEnd(12)} | ${ticket.priority.padEnd(8)} | ${user.first_name} ${user.last_name}`);
      console.log(`   📝 ${ticket.description.substring(0, 80)}...`);
      console.log(`   🏷️  Category: ${ticket.category} | Domain: ${ticket.domain} | Type: ${ticket.type}`);
      console.log('   ' + '-'.repeat(100));
    });

    // Statistics
    const stats = {
      totalUsers: users.length,
      adminUsers: users.filter(u => u.role === 'admin').length,
      agentUsers: users.filter(u => u.role === 'agent').length,
      customerUsers: users.filter(u => u.role === 'customer').length,
      totalCustomers: customers.length,
      totalTickets: tickets.length,
      openTickets: tickets.filter(t => ['new', 'assigned', 'in_progress'].includes(t.status)).length,
      resolvedTickets: tickets.filter(t => t.status === 'resolved').length,
      criticalTickets: tickets.filter(t => t.priority === 'critical').length,
      highPriorityTickets: tickets.filter(t => t.priority === 'high').length
    };

    console.log(`\n📊 STATISTICS:`);
    console.log('='.repeat(50));
    console.log(`👥 Total Users: ${stats.totalUsers}`);
    console.log(`   - Admins: ${stats.adminUsers}`);
    console.log(`   - Agents: ${stats.agentUsers}`);
    console.log(`   - Customers: ${stats.customerUsers}`);
    console.log(`🏢 Customer Organizations: ${stats.totalCustomers}`);
    console.log(`🎫 Total Tickets: ${stats.totalTickets}`);
    console.log(`   - Open/Active: ${stats.openTickets}`);
    console.log(`   - Resolved: ${stats.resolvedTickets}`);
    console.log(`   - Critical Priority: ${stats.criticalTickets}`);
    console.log(`   - High Priority: ${stats.highPriorityTickets}`);

  } catch (error) {
    console.error('Error fetching data:', error);
  } finally {
    // Close database connection
    mongoose.connection.close();
    console.log('\nDatabase connection closed');
  }
}

// Run the view function
viewAllData();
