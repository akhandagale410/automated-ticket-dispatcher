const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Customer = require('./models/Customer');
const Agent = require('./models/Agent');
const Ticket = require('./models/Ticket');
const connectDB = require('./db/connect');

async function createSampleTickets() {
  try {
    console.log('🎫 CREATING SAMPLE TICKETS');
    console.log('==========================\n');

    // Connect to database
    await connectDB();

    // Step 1: Create Users (if they don't exist)
    console.log('📋 Step 1: Creating sample users...');
    
    const sampleUsers = [
      {
        first_name: 'John',
        last_name: 'Customer',
        email: 'customer@company.com',
        password: 'customer123',
        role: 'customer'
      },
      {
        first_name: 'Jane',
        last_name: 'Agent',
        email: 'agent@company.com',
        password: 'agent123',
        role: 'agent'
      },
      {
        first_name: 'Support',
        last_name: 'Agent',
        email: 'support@company.com',
        password: 'agent123',
        role: 'agent'
      },
      {
        first_name: 'Test',
        last_name: 'Customer2',
        email: 'customer2@company.com',
        password: 'customer123',
        role: 'customer'
      }
    ];

    const createdUsers = {};
    
    for (const userData of sampleUsers) {
      let user = await User.findOne({ email: userData.email });
      
      if (!user) {
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        user = new User({
          first_name: userData.first_name,
          last_name: userData.last_name,
          email: userData.email,
          password: hashedPassword,
          role: userData.role
        });
        await user.save();
        console.log(`✅ Created user: ${userData.email}`);
      } else {
        console.log(`✅ User exists: ${userData.email}`);
      }
      
      createdUsers[userData.role + '_' + userData.email.split('@')[0]] = user;
    }

    // Step 2: Create Customer profiles
    console.log('\n📋 Step 2: Creating customer profiles...');
    
    const customerUsers = [createdUsers['customer_customer'], createdUsers['customer_customer2']];
    const customers = {};
    
    for (const user of customerUsers) {
      let customer = await Customer.findOne({ user: user._id });
      
      if (!customer) {
        customer = new Customer({
          user: user._id,
          organization: user.email.includes('customer2') ? 'Tech Corp' : 'ABC Company'
        });
        await customer.save();
        console.log(`✅ Created customer profile for: ${user.email}`);
      } else {
        console.log(`✅ Customer profile exists for: ${user.email}`);
      }
      
      customers[user.email] = customer;
    }

    // Step 3: Create Agent profiles
    console.log('\n📋 Step 3: Creating agent profiles...');
    
    const agentUsers = [createdUsers['agent_agent'], createdUsers['agent_support']];
    const agents = {};
    
    for (const user of agentUsers) {
      let agent = await Agent.findOne({ user: user._id });
      
      if (!agent) {
        agent = new Agent({
          user: user._id,
          skills: user.email.includes('support') ? 
            ['customer-service', 'technical-support', 'troubleshooting'] : 
            ['backend-development', 'database', 'system-administration'],
          domain_expertise: user.email.includes('support') ? 
            ['General Support', 'User Issues'] : 
            ['Technical Issues', 'System Problems'],
          experience: user.email.includes('support') ? 2 : 5,
          availability: 'online',
          max_tickets: 10,
          workload: 0
        });
        await agent.save();
        console.log(`✅ Created agent profile for: ${user.email}`);
      } else {
        console.log(`✅ Agent profile exists for: ${user.email}`);
      }
      
      agents[user.email] = agent;
    }

    // Step 4: Create Sample Tickets
    console.log('\n📋 Step 4: Creating sample tickets...');
    
    const sampleTickets = [
      {
        subject: 'Login Issues - Cannot Access Dashboard',
        description: 'I am unable to log into my account. Getting "Invalid credentials" error even with correct password.',
        category: 'Authentication',
        domain: 'User Management',
        product: 'Web Application',
        operation_type: 'Login',
        priority: 'high',
        complexity: 'simple',
        severity: 'major',
        type: 'incident',
        region: 'North America',
        country: 'USA',
        account: 'Premium',
        skill_required: ['authentication', 'user-support'],
        tags: ['login', 'authentication', 'urgent'],
        status: 'new',
        customer: customers['customer@company.com']._id,
        security_restriction: false
      },
      {
        subject: 'Database Connection Timeout',
        description: 'Application is experiencing frequent database timeouts during peak hours. Users cannot save their work.',
        category: 'Technical',
        domain: 'Database',
        product: 'Backend System',
        operation_type: 'Database Query',
        priority: 'critical',
        complexity: 'complex',
        severity: 'critical',
        type: 'incident',
        region: 'North America',
        country: 'USA',
        account: 'Enterprise',
        skill_required: ['database', 'performance-tuning', 'backend'],
        tags: ['database', 'timeout', 'performance', 'critical'],
        status: 'assigned',
        customer: customers['customer@company.com']._id,
        assigned_to: agents['agent@company.com']._id,
        security_restriction: true
      },
      {
        subject: 'Feature Request - Dark Mode',
        description: 'Please add dark mode support to the application. Many users have requested this feature for better viewing experience.',
        category: 'Enhancement',
        domain: 'UI/UX',
        product: 'Web Application',
        operation_type: 'Feature Development',
        priority: 'low',
        complexity: 'moderate',
        severity: 'minor',
        type: 'request',
        region: 'Europe',
        country: 'UK',
        account: 'Standard',
        skill_required: ['frontend', 'css', 'ui-design'],
        tags: ['feature-request', 'ui', 'enhancement'],
        status: 'in_progress',
        customer: customers['customer2@company.com']._id,
        assigned_to: agents['support@company.com']._id,
        security_restriction: false
      },
      {
        subject: 'Email Notifications Not Working',
        description: 'Users are not receiving email notifications for important updates. SMTP configuration might be incorrect.',
        category: 'Technical',
        domain: 'Notifications',
        product: 'Email System',
        operation_type: 'Email Delivery',
        priority: 'medium',
        complexity: 'moderate',
        severity: 'major',
        type: 'problem',
        region: 'Asia',
        country: 'India',
        account: 'Premium',
        skill_required: ['email-systems', 'smtp', 'configuration'],
        tags: ['email', 'notifications', 'smtp'],
        status: 'waiting_customer',
        customer: customers['customer@company.com']._id,
        assigned_to: agents['agent@company.com']._id,
        security_restriction: false
      },
      {
        subject: 'Security Vulnerability - SQL Injection',
        description: 'Potential SQL injection vulnerability found in the search functionality. Immediate attention required.',
        category: 'Security',
        domain: 'Application Security',
        product: 'Web Application',
        operation_type: 'Security Assessment',
        priority: 'critical',
        complexity: 'complex',
        severity: 'blocker',
        type: 'incident',
        region: 'Global',
        country: 'Multiple',
        account: 'Enterprise',
        skill_required: ['security', 'sql', 'penetration-testing'],
        tags: ['security', 'vulnerability', 'sql-injection', 'critical'],
        status: 'resolved',
        customer: customers['customer2@company.com']._id,
        assigned_to: agents['agent@company.com']._id,
        security_restriction: true,
        feedback_rating: 5,
        feedback_date: new Date()
      },
      {
        subject: 'Mobile App Crashes on Startup',
        description: 'Mobile application crashes immediately after launch on Android devices running version 12 and above.',
        category: 'Technical',
        domain: 'Mobile Development',
        product: 'Mobile App',
        operation_type: 'Bug Fix',
        priority: 'high',
        complexity: 'complex',
        severity: 'critical',
        type: 'incident',
        region: 'North America',
        country: 'Canada',
        account: 'Premium',
        skill_required: ['mobile-development', 'android', 'debugging'],
        tags: ['mobile', 'crash', 'android', 'startup'],
        status: 'closed',
        customer: customers['customer@company.com']._id,
        assigned_to: agents['support@company.com']._id,
        security_restriction: false,
        feedback_rating: 4,
        feedback_date: new Date()
      },
      {
        subject: 'Performance Issues During Peak Hours',
        description: 'System becomes very slow during peak business hours (9 AM - 5 PM). Page load times exceed 10 seconds.',
        category: 'Performance',
        domain: 'System Performance',
        product: 'Web Application',
        operation_type: 'Performance Optimization',
        priority: 'high',
        complexity: 'complex',
        severity: 'major',
        type: 'problem',
        region: 'Europe',
        country: 'Germany',
        account: 'Enterprise',
        skill_required: ['performance-tuning', 'load-balancing', 'caching'],
        tags: ['performance', 'slow', 'peak-hours', 'optimization'],
        status: 'new',
        customer: customers['customer2@company.com']._id,
        security_restriction: false
      },
      {
        subject: 'Data Export Feature Not Working',
        description: 'Users cannot export their data to CSV format. Export button shows loading but never completes.',
        category: 'Functional',
        domain: 'Data Management',
        product: 'Web Application',
        operation_type: 'Data Export',
        priority: 'medium',
        complexity: 'moderate',
        severity: 'major',
        type: 'incident',
        region: 'Asia',
        country: 'Japan',
        account: 'Standard',
        skill_required: ['backend', 'file-processing', 'csv'],
        tags: ['export', 'csv', 'data', 'functionality'],
        status: 'assigned',
        customer: customers['customer@company.com']._id,
        assigned_to: agents['support@company.com']._id,
        security_restriction: false
      }
    ];

    const createdTickets = [];
    
    for (const ticketData of sampleTickets) {
      try {
        // Add SLA deadline (3 days from creation for high/critical, 7 days for others)
        const slaHours = ticketData.priority === 'critical' || ticketData.priority === 'high' ? 72 : 168;
        ticketData.sla_deadline = new Date(Date.now() + slaHours * 60 * 60 * 1000);
        
        // Add some history entries
        ticketData.history = [
          {
            status: 'new',
            changedAt: new Date(),
            changedBy: 'System'
          }
        ];
        
        if (ticketData.status !== 'new') {
          ticketData.history.push({
            status: ticketData.status,
            changedAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour later
            changedBy: 'Agent'
          });
        }
        
        // Add internal notes for some tickets
        if (ticketData.status === 'in_progress' || ticketData.status === 'resolved' || ticketData.status === 'closed') {
          ticketData.internal_notes = [
            {
              body: 'Initial investigation completed. Root cause identified.',
              addedBy: 'Agent',
              createdAt: new Date(Date.now() + 30 * 60 * 1000) // 30 minutes later
            }
          ];
        }
        
        const ticket = new Ticket(ticketData);
        await ticket.save();
        createdTickets.push(ticket);
        console.log(`✅ Created ticket: ${ticket.subject}`);
        
      } catch (error) {
        console.log(`❌ Error creating ticket "${ticketData.subject}":`, error.message);
      }
    }

    // Display summary
    console.log('\n🎉 SAMPLE TICKETS CREATED SUCCESSFULLY!');
    console.log('=====================================\n');
    
    console.log(`📊 Summary:`);
    console.log(`   - Users: ${Object.keys(createdUsers).length}`);
    console.log(`   - Customers: ${Object.keys(customers).length}`);
    console.log(`   - Agents: ${Object.keys(agents).length}`);
    console.log(`   - Tickets: ${createdTickets.length}`);
    
    console.log('\n📋 Tickets by Status:');
    const statusCounts = {};
    createdTickets.forEach(ticket => {
      statusCounts[ticket.status] = (statusCounts[ticket.status] || 0) + 1;
    });
    
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`   - ${status}: ${count}`);
    });
    
    console.log('\n📋 Tickets by Priority:');
    const priorityCounts = {};
    createdTickets.forEach(ticket => {
      priorityCounts[ticket.priority] = (priorityCounts[ticket.priority] || 0) + 1;
    });
    
    Object.entries(priorityCounts).forEach(([priority, count]) => {
      console.log(`   - ${priority}: ${count}`);
    });
    
    console.log('\n🎫 Sample Tickets Created:');
    createdTickets.forEach((ticket, index) => {
      console.log(`${index + 1}. ${ticket.subject}`);
      console.log(`   Status: ${ticket.status} | Priority: ${ticket.priority} | Type: ${ticket.type}`);
      console.log(`   Customer: ${ticket.customer} | Assigned: ${ticket.assigned_to || 'Unassigned'}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Error creating sample tickets:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔐 Database connection closed');
  }
}

createSampleTickets();
