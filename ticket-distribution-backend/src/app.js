const express = require('express');
const cors = require('cors');
const connectDB = require('./db/connect');
const { setupDefaultAgents } = require('./setupAgents');

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to database
connectDB();

// Middleware
app.use(cors());
app.use(express.json()); // Use built-in express.json() instead of body-parser

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/tickets', require('./routes/tickets'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Automated Ticket Distribution System running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Start server
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  console.log('🚀 Automated Ticket Distribution System started');

  try {
    console.log('🔧 Setting up default agents...');
    await setupDefaultAgents();
    console.log('✅ Default agents setup completed');

    console.log('\n🔑 Login Credentials:');
    console.log('AGENT: agent@company.com / agent123');
    console.log('AGENT: sarah.support@company.com / agent123');
    console.log('ADMIN: admin@company.com / admin123');
    console.log('\n🌐 Access agent dashboard at: http://localhost:4200/agent-dashboard');
  } catch (error) {
    console.log('⚠️ Agent setup encountered an issue:', error.message);
    console.log('💡 You can manually create agents by calling POST /api/auth/setup-agents');
  }
});

module.exports = app;
