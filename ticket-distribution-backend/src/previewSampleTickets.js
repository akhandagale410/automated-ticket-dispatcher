// Quick test to demonstrate sample ticket structure
console.log('🎫 SAMPLE TICKETS PREVIEW');
console.log('========================\n');

const sampleTicketsPreview = [
  {
    id: 1,
    subject: 'Login Issues - Cannot Access Dashboard',
    status: 'new',
    priority: 'high',
    type: 'incident',
    customer: 'customer@company.com (ABC Company)',
    assigned_agent: 'Unassigned',
    tags: ['login', 'authentication', 'urgent']
  },
  {
    id: 2,
    subject: 'Database Connection Timeout',
    status: 'assigned',
    priority: 'critical',
    type: 'incident',
    customer: 'customer@company.com (ABC Company)',
    assigned_agent: 'agent@company.com',
    tags: ['database', 'timeout', 'performance', 'critical']
  },
  {
    id: 3,
    subject: 'Feature Request - Dark Mode',
    status: 'in_progress',
    priority: 'low',
    type: 'request',
    customer: 'customer2@company.com (Tech Corp)',
    assigned_agent: 'support@company.com',
    tags: ['feature-request', 'ui', 'enhancement']
  },
  {
    id: 4,
    subject: 'Email Notifications Not Working',
    status: 'waiting_customer',
    priority: 'medium',
    type: 'problem',
    customer: 'customer@company.com (ABC Company)',
    assigned_agent: 'agent@company.com',
    tags: ['email', 'notifications', 'smtp']
  },
  {
    id: 5,
    subject: 'Security Vulnerability - SQL Injection',
    status: 'resolved',
    priority: 'critical',
    type: 'incident',
    customer: 'customer2@company.com (Tech Corp)',
    assigned_agent: 'agent@company.com',
    tags: ['security', 'vulnerability', 'sql-injection', 'critical'],
    rating: '5/5'
  },
  {
    id: 6,
    subject: 'Mobile App Crashes on Startup',
    status: 'closed',
    priority: 'high',
    type: 'incident',
    customer: 'customer@company.com (ABC Company)',
    assigned_agent: 'support@company.com',
    tags: ['mobile', 'crash', 'android', 'startup'],
    rating: '4/5'
  },
  {
    id: 7,
    subject: 'Performance Issues During Peak Hours',
    status: 'new',
    priority: 'high',
    type: 'problem',
    customer: 'customer2@company.com (Tech Corp)',
    assigned_agent: 'Unassigned',
    tags: ['performance', 'slow', 'peak-hours', 'optimization']
  },
  {
    id: 8,
    subject: 'Data Export Feature Not Working',
    status: 'assigned',
    priority: 'medium',
    type: 'incident',
    customer: 'customer@company.com (ABC Company)',
    assigned_agent: 'support@company.com',
    tags: ['export', 'csv', 'data', 'functionality']
  }
];

console.log('📋 Sample Tickets to be Created:\n');

sampleTicketsPreview.forEach((ticket, index) => {
  console.log(`${index + 1}. ${ticket.subject}`);
  console.log(`   📊 Status: ${ticket.status} | Priority: ${ticket.priority} | Type: ${ticket.type}`);
  console.log(`   👤 Customer: ${ticket.customer}`);
  console.log(`   👨‍💼 Agent: ${ticket.assigned_agent}`);
  console.log(`   🏷️  Tags: ${ticket.tags.join(', ')}`);
  if (ticket.rating) {
    console.log(`   ⭐ Rating: ${ticket.rating}`);
  }
  console.log('');
});

// Statistics
const stats = {
  total: sampleTicketsPreview.length,
  byStatus: {},
  byPriority: {},
  byType: {}
};

sampleTicketsPreview.forEach(ticket => {
  stats.byStatus[ticket.status] = (stats.byStatus[ticket.status] || 0) + 1;
  stats.byPriority[ticket.priority] = (stats.byPriority[ticket.priority] || 0) + 1;
  stats.byType[ticket.type] = (stats.byType[ticket.type] || 0) + 1;
});

console.log('📊 STATISTICS:');
console.log(`Total Tickets: ${stats.total}\n`);

console.log('By Status:');
Object.entries(stats.byStatus).forEach(([status, count]) => {
  console.log(`   - ${status}: ${count}`);
});

console.log('\nBy Priority:');
Object.entries(stats.byPriority).forEach(([priority, count]) => {
  console.log(`   - ${priority}: ${count}`);
});

console.log('\nBy Type:');
Object.entries(stats.byType).forEach(([type, count]) => {
  console.log(`   - ${type}: ${count}`);
});

console.log('\n🚀 TO CREATE THESE TICKETS IN DATABASE:');
console.log('1. Ensure MongoDB is running');
console.log('2. Run: node src/createSampleTickets.js');
console.log('3. View results: node src/listTickets.js');

console.log('\n🔑 LOGIN CREDENTIALS:');
console.log('Customer: customer@company.com / customer123');
console.log('Agent: agent@company.com / agent123');
console.log('Support: support@company.com / agent123');
console.log('Admin: admin@company.com / admin123');
