const mongoose = require('mongoose');

const agentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  skills: [String],
  domain_expertise: [String],
  experience: { type: Number, default: 0 },
  certifications: [String],
  max_tickets: { type: Number, default: 5 },
  workload: { type: Number, default: 0 },
  availability: { type: String, enum: ['online', 'offline', 'busy'], default: 'offline' },
  total_tickets_resolved: { type: Number, default: 0 },
  avg_resolution_time: { type: Number, default: 0 },
  avg_customer_rating: { type: Number, default: 0 },
  created_at: { type: Date, default: Date.now }
});

module.exports