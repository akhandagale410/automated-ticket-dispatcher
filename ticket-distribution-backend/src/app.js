const express = require('express');
const bodyParser = require('body-parser');
// const ticketRouter = require('./routes/ticket');
// const agentRouter = require('./routes/agent');
const connectDB = require('./db/connect');

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to database
connectDB();

// Middleware
app.use(bodyParser.json());

// Routes
// app.use('/api/tickets', ticketRouter);
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