const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Simple test route
app.get('/api/health', (req, res) => {
  console.log('Health check requested');
  res.status(200).json({ 
    status: 'ok', 
    message: 'Test server running',
    timestamp: new Date().toISOString()
  });
});

// Test auth route
app.post('/api/auth/login', (req, res) => {
  console.log('Login request received:', req.body);
  res.status(400).json({ 
    message: 'Database not connected - this is a test response',
    receivedData: req.body
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`);
  console.log('Available endpoints:');
  console.log('  GET  http://localhost:3000/api/health');
  console.log('  POST http://localhost:3000/api/auth/login');
});

module.exports = app;
