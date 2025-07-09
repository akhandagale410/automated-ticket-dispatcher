const express = require('express');
const Agent = require('../models/Agent');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Get agent details by agent ID (populates user info)
router.get('/:id', auth, async (req, res) => {
  try {
    const agent = await Agent.findById(req.params.id).populate('user', 'first_name last_name email');
    if (!agent) {
      return res.status(404).json({ message: 'Agent not found' });
    }
    // Flatten user info into agent object for frontend convenience
    const user = agent.user || {};
    res.json({
      _id: agent._id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      skills: agent.skills,
      domain_expertise: agent.domain_expertise,
      experience: agent.experience,
      certifications: agent.certifications,
      max_tickets: agent.max_tickets,
      workload: agent.workload,
      availability: agent.availability,
      total_tickets_resolved: agent.total_tickets_resolved,
      avg_resolution_time: agent.avg_resolution_time,
      avg_customer_rating: agent.avg_customer_rating
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error while fetching agent details' });
  }
});

module.exports = router;
