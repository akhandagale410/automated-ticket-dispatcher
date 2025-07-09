// Test script to verify the agent routes are correctly defined
const express = require('express');
const request = require('supertest');
const mongoose = require('mongoose');

// Create a minimal Express app for testing
const app = express();
app.use(express.json());

// Mock the auth middleware for testing
app.use((req, res, next) => {
  req.user = {
    _id: 'mock-user-id',
    role: 'agent'
  };
  next();
});

// Import and use the tickets router
const ticketsRouter = require('./src/routes/tickets');
app.use('/api/tickets', ticketsRouter);

// Test the agent routes
async function testAgentRoutes() {
  try {
    console.log('Testing /api/tickets/agent/my-tickets route...');
    const myTicketsResponse = await request(app).get('/api/tickets/agent/my-tickets');
    console.log('Status code:', myTicketsResponse.status);
    console.log('Response body:', myTicketsResponse.body);

    console.log('\nTesting /api/tickets/agent/unassigned route...');
    const unassignedResponse = await request(app).get('/api/tickets/agent/unassigned');
    console.log('Status code:', unassignedResponse.status);
    console.log('Response body:', unassignedResponse.body);
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run the tests
console.log('Starting route tests...');
testAgentRoutes()
  .then(() => console.log('Tests completed'))
  .catch((err) => console.error('Test error:', err));
