const mongoose = require('mongoose');
const Ticket = require('./models/Ticket');
const Customer = require('./models/Customer');
const User = require('./models/User');
const connectDB = require('./db/connect');

// Additional sample tickets data
const additionalTickets = [
  {
    subject: "Server Performance Issues",
    description: "The application server is experiencing slow response times during peak hours. Users are reporting timeouts and connection errors. This is affecting business operations significantly.",
    category: "Infrastructure",
    domain: "Performance",
    product: "Web Application",
    operation_type: "Maintenance",
    priority: "high",
    complexity: "complex",
    severity: "major",
    type: "problem",
    region: "North America",
    country: "USA",
    account: "Enterprise",
    skill_required: ["System Administration", "Performance Tuning"],
    tags: ["server", "performance", "timeout"],
    security_restriction: false,
    status: "assigned"
  },
  {
    subject: "Email Notifications Not Working",
    description: "Customers are not receiving email notifications for order confirmations and updates. The email service appears to be down or misconfigured.",
    category: "Email Service",
    domain: "Communication",
    product: "Notification System",
    operation_type: "Bug Fix",
    priority: "medium",
    complexity: "moderate",
    severity: "major",
    type: "incident",
    region: "Europe",
    country: "UK",
    account: "Standard",
    skill_required: ["Email Configuration", "SMTP"],
    tags: ["email", "notifications", "smtp"],
    security_restriction: false,
    status: "new"
  },
  {
    subject: "Mobile App Crash on iOS",
    description: "The mobile application is crashing consistently on iOS devices when users try to access the profile section. This affects approximately 40% of our mobile user base.",
    category: "Mobile",
    domain: "Application",
    product: "Mobile App",
    operation_type: "Bug Fix",
    priority: "critical",
    complexity: "complex",
    severity: "blocker",
    type: "incident",
    region: "Asia Pacific",
    country: "Australia",
    account: "Premium",
    skill_required: ["iOS Development", "Mobile Testing"],
    tags: ["ios", "crash", "mobile", "profile"],
    security_restriction: false,
    status: "in_progress"
  },
  {
    subject: "Database Backup Failure",
    description: "Automated database backups have been failing for the past 3 days. This is a critical issue as we need reliable backup procedures for data recovery.",
    category: "Database",
    domain: "Data Management",
    product: "Database System",
    operation_type: "Maintenance",
    priority: "critical",
    complexity: "moderate",
    severity: "critical",
    type: "problem",
    region: "North America",
    country: "Canada",
    account: "Enterprise",
    skill_required: ["Database Administration", "Backup Systems"],
    tags: ["database", "backup", "failure", "critical"],
    security_restriction: true,
    status: "new"
  },
  {
    subject: "API Rate Limiting Issues",
    description: "Third-party integrations are hitting API rate limits causing service interruptions. Need to implement better rate limiting strategies and caching mechanisms.",
    category: "API",
    domain: "Integration",
    product: "API Gateway",
    operation_type: "Enhancement",
    priority: "medium",
    complexity: "moderate",
    severity: "minor",
    type: "change",
    region: "Europe",
    country: "Germany",
    account: "Standard",
    skill_required: ["API Development", "Rate Limiting"],
    tags: ["api", "rate-limiting", "integration"],
    security_restriction: false,
    status: "assigned"
  },
  {
    subject: "SSL Certificate Expiration Warning",
    description: "SSL certificates for the main domain will expire in 10 days. Need to renew certificates to avoid service interruption and security warnings.",
    category: "Security",
    domain: "Infrastructure",
    product: "Web Services",
    operation_type: "Maintenance",
    priority: "high",
    complexity: "simple",
    severity: "major",
    type: "change",
    region: "Global",
    country: "Multiple",
    account: "Enterprise",
    skill_required: ["SSL Management", "DevOps"],
    tags: ["ssl", "certificate", "security", "expiration"],
    security_restriction: true,
    status: "new"
  },
  {
    subject: "User Interface Improvement Request",
    description: "Multiple customers have requested improvements to the dashboard user interface. Specifically, they want better navigation, dark mode, and customizable widgets.",
    category: "UI/UX",
    domain: "User Experience",
    product: "Web Dashboard",
    operation_type: "Enhancement",
    priority: "low",
    complexity: "complex",
    severity: "minor",
    type: "request",
    region: "North America",
    country: "USA",
    account: "Standard",
    skill_required: ["Frontend Development", "UI/UX Design"],
    tags: ["ui", "dashboard", "enhancement", "user-experience"],
    security_restriction: false,
    status: "new"
  },
  {
    subject: "Data Export Feature Malfunction",
    description: "The data export feature is generating corrupted CSV files. Users are unable to export their data for external analysis and reporting purposes.",
    category: "Data Export",
    domain: "Reporting",
    product: "Analytics Module",
    operation_type: "Bug Fix",
    priority: "medium",
    complexity: "moderate",
    severity: "major",
    type: "incident",
    region: "Asia Pacific",
    country: "Japan",
    account: "Premium",
    skill_required: ["Data Processing", "File Generation"],
    tags: ["export", "csv", "data", "corruption"],
    security_restriction: false,
    status: "waiting_customer"
  },
  {
    subject: "Security Vulnerability Assessment",
    description: "Quarterly security audit revealed potential vulnerabilities in the authentication system. Need immediate assessment and patching of identified security gaps.",
    category: "Security Audit",
    domain: "Security",
    product: "Authentication System",
    operation_type: "Security Patch",
    priority: "critical",
    complexity: "complex",
    severity: "critical",
    type: "problem",
    region: "Global",
    country: "Multiple",
    account: "Enterprise",
    skill_required: ["Security Analysis", "Penetration Testing"],
    tags: ["security", "vulnerability", "audit", "authentication"],
    security_restriction: true,
    status: "assigned"
  },
  {
    subject: "Load Balancer Configuration Update",
    description: "Current load balancer configuration is not distributing traffic efficiently. Need to optimize settings to handle increased user load during peak business hours.",
    category: "Infrastructure",
    domain: "Network",
    product: "Load Balancer",
    operation_type: "Configuration",
    priority: "medium",
    complexity: "moderate",
    severity: "minor",
    type: "change",
    region: "Europe",
    country: "France",
    account: "Enterprise",
    skill_required: ["Network Administration", "Load Balancing"],
    tags: ["load-balancer", "configuration", "traffic", "optimization"],
    security_restriction: false,
    status: "resolved"
  }
];

async function seedAdditionalTickets() {
  try {
    // Connect to database
    await connectDB();
    console.log('Connected to MongoDB');

    // Get all customers to randomly assign tickets
    const customers = await Customer.find().populate('user');
    
    if (customers.length === 0) {
      console.log('No customers found. Please run seedCustomerData.js first.');
      return;
    }

    console.log(`Found ${customers.length} customers:`);
    customers.forEach(customer => {
      console.log(`- ${customer.user.first_name} ${customer.user.last_name} (${customer.organization})`);
    });

    // Create tickets and randomly assign them to customers
    const ticketsToCreate = [];
    
    for (let i = 0; i < additionalTickets.length; i++) {
      const ticketData = additionalTickets[i];
      const randomCustomer = customers[Math.floor(Math.random() * customers.length)];
      
      // Create different creation dates to simulate realistic aging
      const daysAgo = Math.floor(Math.random() * 30) + 1; // 1-30 days ago
      const createdAt = new Date(Date.now() - (daysAgo * 24 * 60 * 60 * 1000));
      
      const ticket = {
        ...ticketData,
        customer: randomCustomer._id,
        created_at: createdAt,
        updated_at: createdAt,
        history: [{
          status: ticketData.status,
          changedBy: `${randomCustomer.user.first_name} ${randomCustomer.user.last_name}`,
          changedAt: createdAt
        }]
      };

      // Add escalation for some high/critical priority tickets
      if ((ticketData.priority === 'high' || ticketData.priority === 'critical') && Math.random() > 0.5) {
        ticket.escalated = true;
        ticket.escalation_reason = 'High priority issue requiring immediate attention';
        ticket.history.push({
          status: 'escalated',
          changedBy: `${randomCustomer.user.first_name} ${randomCustomer.user.last_name}`,
          changedAt: new Date(createdAt.getTime() + (Math.random() * 5 * 24 * 60 * 60 * 1000)) // Escalated within 5 days
        });
      }

      // Set SLA deadline based on priority
      const slaHours = {
        'critical': 4,
        'high': 24,
        'medium': 72,
        'low': 168
      };
      
      ticket.sla_deadline = new Date(createdAt.getTime() + (slaHours[ticketData.priority] * 60 * 60 * 1000));

      ticketsToCreate.push(ticket);
    }

    // Insert tickets into database
    const insertedTickets = await Ticket.insertMany(ticketsToCreate);
    console.log(`\n✅ Successfully inserted ${insertedTickets.length} additional tickets:`);
    
    // Group tickets by customer for summary
    const ticketsByCustomer = {};
    for (const ticket of insertedTickets) {
      const customer = customers.find(c => c._id.toString() === ticket.customer.toString());
      const customerName = `${customer.user.first_name} ${customer.user.last_name}`;
      
      if (!ticketsByCustomer[customerName]) {
        ticketsByCustomer[customerName] = [];
      }
      ticketsByCustomer[customerName].push(ticket);
    }

    // Display summary
    Object.entries(ticketsByCustomer).forEach(([customerName, tickets]) => {
      console.log(`\n👤 ${customerName}:`);
      tickets.forEach(ticket => {
        const ageInDays = Math.floor((new Date() - ticket.created_at) / (1000 * 60 * 60 * 24));
        console.log(`   🎫 ${ticket.subject} | ${ticket.status} | ${ticket.priority} | ${ageInDays} days old`);
      });
    });

    // Display statistics
    const totalTickets = await Ticket.countDocuments();
    const statusCounts = await Ticket.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    const priorityCounts = await Ticket.aggregate([
      { $group: { _id: '$priority', count: { $sum: 1 } } }
    ]);
    const escalatedCount = await Ticket.countDocuments({ escalated: true });

    console.log('\n📊 UPDATED STATISTICS:');
    console.log('='.repeat(50));
    console.log(`🎫 Total Tickets: ${totalTickets}`);
    console.log(`🚨 Escalated Tickets: ${escalatedCount}`);
    
    console.log('\n📈 Status Distribution:');
    statusCounts.forEach(item => {
      console.log(`   ${item._id}: ${item.count}`);
    });
    
    console.log('\n⚡ Priority Distribution:');
    priorityCounts.forEach(item => {
      console.log(`   ${item._id}: ${item.count}`);
    });

  } catch (error) {
    console.error('Error seeding additional tickets:', error);
  } finally {
    // Close database connection
    mongoose.connection.close();
    console.log('\n✅ Database connection closed');
  }
}

// Run the seed function
seedAdditionalTickets();
