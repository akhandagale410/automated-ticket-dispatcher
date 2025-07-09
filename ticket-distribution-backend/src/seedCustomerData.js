const mongoose = require('mongoose');
const User = require('./models/User');
const Customer = require('./models/Customer');
const Ticket = require('./models/Ticket');
const connectDB = require('./db/connect');

// Sample customer organization data
const customerOrganizations = [
  { email: 'pooja@example.com', organization: 'Tech Solutions Pvt Ltd' },
  { email: 'dipti@example.com', organization: 'Digital Marketing Agency' },
  { email: 'anuj@example.com', organization: 'E-commerce Solutions' }
];

// Sample tickets data
const sampleTickets = [
  {
    subject: 'Login Issue - Cannot Access Dashboard',
    description: 'Customer unable to login to the system. Getting authentication error.',
    priority: 'high',
    status: 'new',
    category: 'Authentication',
    domain: 'Security',
    product: 'Web Portal',
    operation_type: 'Login',
    complexity: 'simple',
    severity: 'major',
    type: 'incident',
    region: 'Asia',
    country: 'India',
    skill_required: ['Authentication', 'Web Development'],
    tags: ['login', 'authentication', 'dashboard'],
    customerEmail: 'pooja@example.com'
  },
  {
    subject: 'Payment Gateway Not Working',
    description: 'Payment processing failed multiple times. Need urgent resolution.',
    priority: 'critical',
    status: 'assigned',
    category: 'Payment',
    domain: 'Finance',
    product: 'Payment System',
    operation_type: 'Transaction',
    complexity: 'complex',
    severity: 'critical',
    type: 'incident',
    region: 'Asia',
    country: 'India',
    skill_required: ['Payment Gateway', 'Financial Systems'],
    tags: ['payment', 'gateway', 'transaction', 'urgent'],
    customerEmail: 'dipti@example.com'
  },
  {
    subject: 'Feature Request - Export Functionality',
    description: 'Request to add export to Excel functionality in reports section.',
    priority: 'low',
    status: 'new',
    category: 'Feature',
    domain: 'Reporting',
    product: 'Analytics Dashboard',
    operation_type: 'Export',
    complexity: 'moderate',
    severity: 'minor',
    type: 'request',
    region: 'Asia',
    country: 'India',
    skill_required: ['Frontend Development', 'Reporting'],
    tags: ['feature', 'export', 'excel', 'reports'],
    customerEmail: 'anuj@example.com'
  },
  {
    subject: 'Data Synchronization Issue',
    description: 'Data not syncing properly between mobile app and web platform.',
    priority: 'medium',
    status: 'in_progress',
    category: 'Synchronization',
    domain: 'Data Management',
    product: 'Mobile App',
    operation_type: 'Sync',
    complexity: 'complex',
    severity: 'major',
    type: 'problem',
    region: 'Asia',
    country: 'India',
    skill_required: ['Mobile Development', 'API Integration'],
    tags: ['sync', 'mobile', 'data', 'integration'],
    customerEmail: 'pooja@example.com'
  },
  {
    subject: 'Account Access Recovery',
    description: 'Customer locked out of account and needs assistance with password reset.',
    priority: 'medium',
    status: 'resolved',
    category: 'Account Management',
    domain: 'Security',
    product: 'User Management',
    operation_type: 'Password Reset',
    complexity: 'simple',
    severity: 'minor',
    type: 'request',
    region: 'Asia',
    country: 'India',
    skill_required: ['Account Management', 'Security'],
    tags: ['account', 'password', 'reset', 'recovery'],
    customerEmail: 'dipti@example.com'
  }
];

async function seedCustomerData() {
  try {
    // Connect to database
    await connectDB();
    console.log('Connected to MongoDB');

    // Clear existing customer and ticket data (optional)
    await Customer.deleteMany({});
    await Ticket.deleteMany({});
    console.log('Cleared existing customer and ticket data');

    // Get customer users from the User collection
    const customerUsers = await User.find({ role: 'customer' });
    console.log(`Found ${customerUsers.length} customer users`);

    if (customerUsers.length === 0) {
      console.log('No customer users found. Please run seedUsers.js first.');
      return;
    }

    // Create Customer records
    const customers = [];
    for (const user of customerUsers) {
      const orgData = customerOrganizations.find(org => org.email === user.email);
      customers.push({
        user: user._id,
        organization: orgData ? orgData.organization : `${user.first_name}'s Company`
      });
    }

    const insertedCustomers = await Customer.insertMany(customers);
    console.log(`Successfully inserted ${insertedCustomers.length} customers:`);
    
    for (const customer of insertedCustomers) {
      const user = await User.findById(customer.user);
      console.log(`- ${user.first_name} ${user.last_name} (${user.email}) - ${customer.organization}`);
    }

    // Create Tickets
    const tickets = [];
    for (const ticketData of sampleTickets) {
      // Find the user by email
      const user = await User.findOne({ email: ticketData.customerEmail });
      if (user) {
        // Find the corresponding customer
        const customer = await Customer.findOne({ user: user._id });
        if (customer) {
          const { customerEmail, ...ticketFields } = ticketData;
          tickets.push({
            ...ticketFields,
            customer: customer._id,
            sla_deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // 3 days from now
          });
        }
      }
    }

    const insertedTickets = await Ticket.insertMany(tickets);
    console.log(`\nSuccessfully inserted ${insertedTickets.length} tickets:`);
    
    for (const ticket of insertedTickets) {
      const customer = await Customer.findById(ticket.customer).populate('user');
      console.log(`- ${ticket.subject} - Status: ${ticket.status} - Priority: ${ticket.priority} - Customer: ${customer.user.email}`);
    }

    console.log('\n📊 Summary:');
    console.log(`✅ Customers: ${insertedCustomers.length}`);
    console.log(`🎫 Tickets: ${insertedTickets.length}`);
    console.log(`👥 Customer Users: ${customerUsers.length}`);

  } catch (error) {
    console.error('Error seeding customer data:', error);
  } finally {
    // Close database connection
    mongoose.connection.close();
    console.log('\nDatabase connection closed');
  }
}

// Run the seed function
seedCustomerData();
