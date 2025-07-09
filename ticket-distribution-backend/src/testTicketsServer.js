const express = require('express');
const cors = require('cors');
const connectDB = require('./db/connect');

const app = express();
const PORT = 3000;

// Connect to database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Auth routes
app.use('/api/auth', require('./routes/auth'));

// Tickets routes
app.use('/api/tickets', require('./routes/tickets'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    message: 'Automated Ticket Distribution System running',
    timestamp: new Date().toISOString(),
    endpoints: [
      'GET /api/health',
      'POST /api/auth/login',
      'POST /api/auth/register',
      'GET /api/tickets/public/all',
      'GET /api/tickets/public/stats',
      'GET /api/tickets/public/:id',
      'GET /api/tickets (requires auth)',
      'POST /api/tickets (requires auth)'
    ]
  });
});

// Test endpoint to check if routes are loaded
app.get('/api/test/routes', (req, res) => {
  res.json({
    message: 'Routes test endpoint',
    availableRoutes: {
      auth: [
        'POST /api/auth/login',
        'POST /api/auth/register',
        'GET /api/auth/profile'
      ],
      tickets: [
        'GET /api/tickets/public/all - Get all tickets (no auth)',
        'GET /api/tickets/public/stats - Get ticket statistics (no auth)',
        'GET /api/tickets/public/:id - Get ticket by ID (no auth)',
        'GET /api/tickets - Get user tickets (requires auth)',
        'POST /api/tickets - Create ticket (requires auth)'
      ]
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: err.message,
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl,
    method: req.method,
    message: 'The requested route does not exist',
    availableEndpoints: [
      'GET /api/health',
      'GET /api/test/routes',
      'POST /api/auth/login',
      'GET /api/tickets/public/all',
      'GET /api/tickets/public/stats'
    ]
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log('📋 Available endpoints:');
  console.log('   - GET /api/health');
  console.log('   - GET /api/test/routes');
  console.log('   - POST /api/auth/login');
  console.log('   - GET /api/tickets/public/all');
  console.log('   - GET /api/tickets/public/stats');
  console.log('   - GET /api/tickets/public/:id');
  console.log('\n🔧 To test tickets endpoint:');
  console.log('   http://localhost:3000/api/tickets/public/all');
});

module.exports = app;
