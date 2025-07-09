const express = require('express');
const cors = require('cors');
const connectDB = require('./db/connect');

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to database
connectDB();

// Middleware
app.use(cors());
app.use(express.json()); // Use built-in express.json() instead of body-parser

// Auth routes
app.use('/api/auth', require('./routes/auth'));

// Routes
app.use('/api/tickets', require('./routes/tickets'));
// app.use('/api/agents', agentRouter);

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
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;