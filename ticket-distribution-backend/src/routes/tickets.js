const express = require('express');
const Ticket = require('../models/Ticket');
const Customer = require('../models/Customer');
const auth = require('../middleware/auth');

const router = express.Router();

// Get ticket statistics for dashboard (MUST be before /:id route)
router.get('/stats/dashboard', auth, async (req, res) => {
  try {
    // Get ticket counts by status (all tickets)
    const statusCounts = await Ticket.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Get ticket counts by priority (all tickets)
    const priorityCounts = await Ticket.aggregate([
      { $group: { _id: '$priority', count: { $sum: 1 } } }
    ]);

    // Get total tickets
    const totalTickets = await Ticket.countDocuments();

    // Get escalated tickets count
    const escalatedTickets = await Ticket.countDocuments({ escalated: true });

    res.json({
      totalTickets,
      escalatedTickets,
      statusCounts: statusCounts.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      priorityCounts: priorityCounts.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {})
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Server error while fetching statistics' });
  }
});

// Get ticket aging data for graph (MUST be before /:id route)
router.get('/stats/aging', auth, async (req, res) => {
  try {
    // Get tickets with their age in days (all tickets)
    const tickets = await Ticket.find({}, 'created_at status priority');
    
    const agingData = tickets.map(ticket => {
      const ageInDays = Math.floor((new Date() - ticket.created_at) / (1000 * 60 * 60 * 24));
      return {
        id: ticket._id,
        age: ageInDays,
        status: ticket.status,
        priority: ticket.priority
      };
    });

    // Group by age ranges
    const ageRanges = {
      '0-1 days': 0,
      '2-7 days': 0,
      '8-30 days': 0,
      '31+ days': 0
    };

    agingData.forEach(ticket => {
      if (ticket.age <= 1) {
        ageRanges['0-1 days']++;
      } else if (ticket.age <= 7) {
        ageRanges['2-7 days']++;
      } else if (ticket.age <= 30) {
        ageRanges['8-30 days']++;
      } else {
        ageRanges['31+ days']++;
      }
    });

    res.json({
      ageRanges,
      detailedData: agingData
    });
  } catch (error) {
    console.error('Get aging data error:', error);
    res.status(500).json({ message: 'Server error while fetching aging data' });
  }
});

// Get all tickets for the authenticated user
router.get('/', auth, async (req, res) => {
  try {
    // Get all tickets for this user (no Customer profile required)
    const tickets = await Ticket.find({})
      .populate('customer', 'organization')
      .populate('assigned_to', 'first_name last_name email')
      .sort({ created_at: -1 });

    res.json({ tickets });
  } catch (error) {
    console.error('Get tickets error:', error);
    res.status(500).json({ message: 'Server error while fetching tickets' });
  }
});

// Get a specific ticket by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate('customer', 'organization')
      .populate('assigned_to', 'first_name last_name email');

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    res.json({ ticket });
  } catch (error) {
    console.error('Get ticket error:', error);
    res.status(500).json({ message: 'Server error while fetching ticket' });
  }
});

// Create a new ticket
router.post('/', auth, async (req, res) => {
  try {
    // Try to find customer profile, but don't require it
    const customer = await Customer.findOne({ user: req.user._id });

    const {
      subject,
      description,
      category,
      domain,
      product,
      operation_type,
      priority,
      complexity,
      severity,
      type,
      region,
      country,
      account,
      skill_required,
      tags,
      security_restriction
    } = req.body;

    // Validate required fields
    if (!subject || !description) {
      return res.status(400).json({ message: 'Subject and description are required' });
    }

    const newTicket = new Ticket({
      subject,
      description,
      category,
      domain,
      product,
      operation_type,
      priority: priority || 'medium',
      complexity: complexity || 'moderate',
      severity: severity || 'minor',
      type: type || 'incident',
      region,
      country,
      account,
      skill_required: skill_required || [],
      tags: tags || [],
      security_restriction: security_restriction || false,
      customer: customer ? customer._id : null, // Optional customer reference
      history: [{
        status: 'new',
        changedBy: `${req.user.first_name} ${req.user.last_name}`,
        changedAt: new Date()
      }]
    });

    await newTicket.save();

    // Populate the response
    const populatedTicket = await Ticket.findById(newTicket._id)
      .populate('customer', 'organization')
      .populate('assigned_to', 'first_name last_name email');

    res.status(201).json({
      message: 'Ticket created successfully',
      ticket: populatedTicket
    });
  } catch (error) {
    console.error('Create ticket error:', error);
    res.status(500).json({ message: 'Server error while creating ticket' });
  }
});

// Update a ticket
router.put('/:id', auth, async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    // Check if ticket can be updated (not closed)
    if (ticket.status === 'closed') {
      return res.status(400).json({ message: 'Cannot update a closed ticket' });
    }

    const {
      subject,
      description,
      category,
      domain,
      product,
      operation_type,
      priority,
      complexity,
      severity,
      type,
      region,
      country,
      account,
      skill_required,
      tags,
      security_restriction
    } = req.body;

    // Store old status for history
    const oldStatus = ticket.status;

    // Update ticket fields
    if (subject) ticket.subject = subject;
    if (description) ticket.description = description;
    if (category) ticket.category = category;
    if (domain) ticket.domain = domain;
    if (product) ticket.product = product;
    if (operation_type) ticket.operation_type = operation_type;
    if (priority) ticket.priority = priority;
    if (complexity) ticket.complexity = complexity;
    if (severity) ticket.severity = severity;
    if (type) ticket.type = type;
    if (region) ticket.region = region;
    if (country) ticket.country = country;
    if (account) ticket.account = account;
    if (skill_required) ticket.skill_required = skill_required;
    if (tags) ticket.tags = tags;
    if (security_restriction !== undefined) ticket.security_restriction = security_restriction;

    ticket.updated_at = new Date();

    // Add to history if status changed
    if (oldStatus !== ticket.status) {
      ticket.history.push({
        status: ticket.status,
        changedBy: `${req.user.first_name} ${req.user.last_name}`,
        changedAt: new Date()
      });
    }

    await ticket.save();

    // Populate the response
    const populatedTicket = await Ticket.findById(ticket._id)
      .populate('customer', 'organization')
      .populate('assigned_to', 'first_name last_name email');

    res.json({
      message: 'Ticket updated successfully',
      ticket: populatedTicket
    });
  } catch (error) {
    console.error('Update ticket error:', error);
    res.status(500).json({ message: 'Server error while updating ticket' });
  }
});

// Delete a ticket
router.delete('/:id', auth, async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    // User can delete any ticket
    await Ticket.findByIdAndDelete(req.params.id);

    res.json({ message: 'Ticket deleted successfully' });
  } catch (error) {
    console.error('Delete ticket error:', error);
    res.status(500).json({ message: 'Server error while deleting ticket' });
  }
});

// Escalate a ticket
router.post('/:id/escalate', auth, async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    // Check if ticket can be escalated
    if (ticket.status === 'closed' || ticket.status === 'resolved') {
      return res.status(400).json({ 
        message: 'Cannot escalate a closed or resolved ticket' 
      });
    }

    if (ticket.escalated) {
      return res.status(400).json({ message: 'Ticket is already escalated' });
    }

    const { escalation_reason } = req.body;

    if (!escalation_reason) {
      return res.status(400).json({ message: 'Escalation reason is required' });
    }

    // Escalate the ticket
    ticket.escalated = true;
    ticket.escalation_reason = escalation_reason;
    ticket.priority = 'high'; // Automatically increase priority
    ticket.updated_at = new Date();

    // Add to history
    ticket.history.push({
      status: 'escalated',
      changedBy: `${req.user.first_name} ${req.user.last_name}`,
      changedAt: new Date()
    });

    await ticket.save();

    // Populate the response
    const populatedTicket = await Ticket.findById(ticket._id)
      .populate('customer', 'organization')
      .populate('assigned_to', 'first_name last_name email');

    res.json({
      message: 'Ticket escalated successfully',
      ticket: populatedTicket
    });
  } catch (error) {
    console.error('Escalate ticket error:', error);
    res.status(500).json({ message: 'Server error while escalating ticket' });
  }
});

// Public routes for testing (no authentication required)

// Get all tickets (public - for testing)
router.get('/public/all', async (req, res) => {
  try {
    const tickets = await Ticket.find({})
      .populate('customer', 'organization')
      .populate('assigned_to')
      .populate({
        path: 'customer',
        populate: {
          path: 'user',
          select: 'first_name last_name email'
        }
      })
      .populate({
        path: 'assigned_to',
        populate: {
          path: 'user',
          select: 'first_name last_name email'
        }
      })
      .sort({ created_at: -1 });

    res.json({ 
      tickets,
      count: tickets.length,
      message: 'All tickets retrieved successfully'
    });
  } catch (error) {
    console.error('Get all tickets error:', error);
    res.status(500).json({ message: 'Server error while fetching tickets', error: error.message });
  }
});

// Get tickets statistics (public - for testing)
router.get('/public/stats', async (req, res) => {
  try {
    const totalTickets = await Ticket.countDocuments();
    
    const statusStats = await Ticket.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    
    const priorityStats = await Ticket.aggregate([
      { $group: { _id: '$priority', count: { $sum: 1 } } }
    ]);
    
    const typeStats = await Ticket.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]);

    res.json({
      total: totalTickets,
      byStatus: statusStats.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      byPriority: priorityStats.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      byType: typeStats.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {})
    });
  } catch (error) {
    console.error('Get ticket stats error:', error);
    res.status(500).json({ message: 'Server error while fetching ticket statistics', error: error.message });
  }
});

// Get ticket by ID (public - for testing)
router.get('/public/:id', async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate('customer', 'organization')
      .populate('assigned_to')
      .populate({
        path: 'customer',
        populate: {
          path: 'user',
          select: 'first_name last_name email'
        }
      })
      .populate({
        path: 'assigned_to',
        populate: {
          path: 'user',
          select: 'first_name last_name email'
        }
      });

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    res.json({ ticket });
  } catch (error) {
    console.error('Get ticket by ID error:', error);
    res.status(500).json({ message: 'Server error while fetching ticket', error: error.message });
  }
});

// Public stats routes (no authentication required)
router.get('/public/stats/dashboard', async (req, res) => {
  try {
    // Get ticket counts by status
    const statusCounts = await Ticket.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Get ticket counts by priority
    const priorityCounts = await Ticket.aggregate([
      { $group: { _id: '$priority', count: { $sum: 1 } } }
    ]);

    // Get total tickets
    const totalTickets = await Ticket.countDocuments();

    // Get escalated tickets count
    const escalatedTickets = await Ticket.countDocuments({ escalated: true });

    res.json({
      totalTickets,
      escalatedTickets,
      statusCounts: statusCounts.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      priorityCounts: priorityCounts.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {})
    });
  } catch (error) {
    console.error('Get public stats error:', error);
    res.status(500).json({ message: 'Server error while fetching statistics', error: error.message });
  }
});

// Public aging data (no authentication required)
router.get('/public/stats/aging', async (req, res) => {
  try {
    // Get tickets with their age in days
    const tickets = await Ticket.find({}, 'created_at status priority');
    
    const agingData = tickets.map(ticket => {
      const ageInDays = Math.floor((new Date() - ticket.created_at) / (1000 * 60 * 60 * 24));
      return {
        id: ticket._id,
        age: ageInDays,
        status: ticket.status,
        priority: ticket.priority
      };
    });

    // Group by age ranges
    const ageRanges = {
      '0-1 days': 0,
      '2-7 days': 0,
      '8-30 days': 0,
      '31+ days': 0
    };

    agingData.forEach(ticket => {
      if (ticket.age <= 1) {
        ageRanges['0-1 days']++;
      } else if (ticket.age <= 7) {
        ageRanges['2-7 days']++;
      } else if (ticket.age <= 30) {
        ageRanges['8-30 days']++;
      } else {
        ageRanges['31+ days']++;
      }
    });

    res.json({
      ageRanges,
      detailedData: agingData
    });
  } catch (error) {
    console.error('Get public aging data error:', error);
    res.status(500).json({ message: 'Server error while fetching aging data', error: error.message });
  }
});

module.exports = router;
