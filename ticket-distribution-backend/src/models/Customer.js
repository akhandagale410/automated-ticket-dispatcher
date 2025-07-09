const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  organization: String,
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Customer', customerSchema);
