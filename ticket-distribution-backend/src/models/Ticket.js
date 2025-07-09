const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  subject: { type: String, required: true },
  description: { type: String, required: true },

  category: String,
  domain: String,
  product: String,
  operation_type: String,

  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  complexity: {
    type: String,
    enum: ['simple', 'moderate', 'complex'],
    default: 'moderate'
  },
  severity: {
    type: String,
    enum: ['minor', 'major', 'critical', 'blocker'],
    default: 'minor'
  },
  type: {
    type: String,
    enum: ['incident', 'request', 'problem', 'change'],
    default: 'incident'
  },

  region: String,
  country: String,
  account: String,
  skill_required: [String],
  tags: [String],
  security_restriction: { type: Boolean, default: false },

  status: {
    type: String,
    enum: ['new', 'assigned', 'in_progress', 'waiting_customer', 'resolved', 'closed'],
    default: 'new'
  },

  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  assigned_to: { type: mongoose.Schema.Types.ObjectId, ref: 'Agent' },

  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  sla_deadline: Date,

  escalated: { type: Boolean, default: false },
  escalation_reason: String,

  feedback_rating: { type: Number, min: 1, max: 5 },
  internal_notes: [
    {
      body: String,
      addedBy: String,
      createdAt: { type: Date, default: Date.now }
    }
  ],
  feedback_date: Date,
  attachments: [String],
  history: [
    {
      status: String,
      changedAt: { type: Date, default: Date.now },
      changedBy: String
    }
  ]
});

module.exports = mongoose.model('Ticket', ticketSchema);
