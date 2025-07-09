const express = require('express');
const mongoose = require('mongoose');
const Ticket = require('../models/Ticket');
const Customer = require('../models/Customer');
const Agent = require('../models/Agent');
const auth = require('../middleware/auth');

const router = express.Router();

// ***************************************************************
// IMPORTANT: Route order matters in Express. More specific routes
// should be placed before general routes to prevent shadowing.
// ***************************************************************

// ============== AGENT SPECIFIC ROUTES (MUST COME FIRST) ==============

// Get unassigned tickets for agents to pick up
router.get('/agent/unassigned', auth, async (req, res) => {
  try {
    // Only agents and admins can view unassigned tickets
    if (req.user.role !== 'agent' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Only agents can view unassigned tickets.' });
    }

    console.log('Fetching unassigned tickets');
    
    // Get tickets that are not assigned to anyone or have status 'new'
    const tickets = await Ticket.find({ 
      $or: [
        { assigned_to: null },
        { assigned_to: { $exists: false } },
        { status: 'new' }
      ]
    })
      .populate('customer', 'organization')
      .sort({ created_at: -1 });

    console.log(`Found ${tickets.length} unassigned tickets`);
    
    res.json({ tickets });
  } catch (error) {
    console.error('Get unassigned tickets error:', error);
    res.status(500).json({ message: 'Server error while fetching unassigned tickets' });
  }
});

// Get tickets assigned to the current agent
router.get('/agent/my-tickets', auth, async (req, res) => {
  try {
    // Only agents can access this endpoint
    if (req.user.role !== 'agent' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Only agents can view their tickets.' });
    }

    console.log('Looking for agent profile for user:', req.user._id);
    
    // First find the agent profile
    const agentProfile = await Agent.findOne({ user: req.user._id });
    
    if (!agentProfile) {
      console.log('Agent profile not found for user:', req.user._id);
      return res.status(404).json({ message: 'Agent profile not found' });
    }
    
    console.log('Found agent profile:', agentProfile._id);
    
    // Get all tickets assigned to the current agent
    const tickets = await Ticket.find({ assigned_to: agentProfile._id })
      .populate('customer', 'organization')
      .populate('assigned_to', 'first_name last_name email')
      .sort({ created_at: -1 });

    console.log(`Found ${tickets.length} tickets assigned to agent`);
    
    res.json({ tickets });
  } catch (error) {
    console.error('Get agent tickets error:', error);
    res.status(500).json({ message: 'Server error while fetching agent tickets' });
  }
});

// ============== ADMIN SPECIFIC ROUTES ==============

// Get all tickets with advanced filtering for admin
router.get('/admin/tickets', auth, async (req, res) => {
  try {
    // Only admins can access this endpoint
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Only admins can view all tickets with advanced filtering.' });
    }

    console.log('Admin accessing all tickets with filters');
    
    // Extract filter parameters from query
    const { status, priority, assignedTo, escalated, fromDate, toDate, search } = req.query;
    
    // Build filter object
    const filter = {};
    
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (assignedTo === 'unassigned') {
      filter.$or = [
        { assigned_to: null },
        { assigned_to: { $exists: false } }
      ];
    } else if (assignedTo) {
      filter.assigned_to = assignedTo;
    }
    if (escalated) filter.escalated = escalated === 'true';
    
    // Date range filter
    if (fromDate || toDate) {
      filter.created_at = {};
      if (fromDate) filter.created_at.$gte = new Date(fromDate);
      if (toDate) filter.created_at.$lte = new Date(toDate);
    }
    
    // Text search
    if (search) {
      filter.$or = [
        { subject: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    console.log('Admin ticket filter:', filter);
    
    // Get filtered tickets
    const tickets = await Ticket.find(filter)
      .populate('customer', 'organization')
      .populate({
        path: 'assigned_to',
        populate: {
          path: 'user',
          select: 'first_name last_name email'
        }
      })
      .sort({ created_at: -1 });

    console.log(`Found ${tickets.length} tickets matching admin filters`);
    
    res.json({ tickets });
  } catch (error) {
    console.error('Admin get tickets error:', error);
    res.status(500).json({ message: 'Server error while fetching tickets for admin' });
  }
});

// Manually assign ticket to specific agent (admin only)
router.post('/admin/assign/:ticketId/:agentId', auth, async (req, res) => {
  try {
    // Only admins can access this endpoint
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Only admins can manually assign tickets.' });
    }

    const { ticketId, agentId } = req.params;
    const { overrideCapacity } = req.body;
    
    // Find the ticket
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }
    
    // Find the agent
    const agent = await Agent.findById(agentId);
    if (!agent) {
      return res.status(404).json({ message: 'Agent not found' });
    }
    
    // Check agent capacity
    if (!overrideCapacity) {
      const assignedTicketCount = await Ticket.countDocuments({ 
        assigned_to: agentId,
        status: { $nin: ['closed', 'resolved'] } 
      });
      
      if (agent.max_tickets && assignedTicketCount >= agent.max_tickets) {
        return res.status(400).json({ 
          message: `Agent has reached maximum ticket capacity (${agent.max_tickets})`,
          currentLoad: assignedTicketCount,
          canOverride: true
        });
      }
    }
    
    // Update ticket assignment
    ticket.assigned_to = agentId;
    ticket.status = 'assigned';
    ticket.updated_at = new Date();
    
    // Add to history
    ticket.history.push({
      status: 'assigned',
      changedBy: `${req.user.first_name} ${req.user.last_name} (Admin)`,
      changedAt: new Date(),
      notes: 'Manually assigned by admin'
    });
    
    await ticket.save();
    
    // Get agent user details
    const agentUser = await mongoose.model('User').findById(agent.user, 'first_name last_name email');
    
    // Populate the response
    const populatedTicket = await Ticket.findById(ticket._id)
      .populate('customer', 'organization')
      .populate({
        path: 'assigned_to',
        populate: {
          path: 'user',
          select: 'first_name last_name email'
        }
      });

    res.json({
      message: `Ticket successfully assigned to ${agentUser.first_name} ${agentUser.last_name}`,
      ticket: populatedTicket,
      agent: {
        id: agent._id,
        name: `${agentUser.first_name} ${agentUser.last_name}`,
        email: agentUser.email
      }
    });
  } catch (error) {
    console.error('Admin assign ticket error:', error);
    res.status(500).json({ message: 'Server error while assigning ticket' });
  }
});

// Advanced ticket update with admin privileges
router.put('/admin/ticket/:id', auth, async (req, res) => {
  try {
    // Only admins can access this endpoint
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Only admins can perform advanced updates.' });
    }

    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    const {
      subject,
      description,
      status,
      priority,
      complexity,
      severity,
      type,
      escalated,
      escalation_reason,
      category,
      domain,
      product,
      operation_type,
      region,
      country,
      account,
      skill_required,
      tags,
      security_restriction,
      additionalNote
    } = req.body;

    // Store old values for history
    const oldStatus = ticket.status;
    const oldPriority = ticket.priority;
    const oldEscalated = ticket.escalated;

    // Admin can update any field, including normally restricted ones
    if (subject !== undefined) ticket.subject = subject;
    if (description !== undefined) ticket.description = description;
    if (status !== undefined) ticket.status = status;
    if (priority !== undefined) ticket.priority = priority;
    if (complexity !== undefined) ticket.complexity = complexity;
    if (severity !== undefined) ticket.severity = severity;
    if (type !== undefined) ticket.type = type;
    if (escalated !== undefined) ticket.escalated = escalated;
    if (escalation_reason !== undefined) ticket.escalation_reason = escalation_reason;
    if (category !== undefined) ticket.category = category;
    if (domain !== undefined) ticket.domain = domain;
    if (product !== undefined) ticket.product = product;
    if (operation_type !== undefined) ticket.operation_type = operation_type;
    if (region !== undefined) ticket.region = region;
    if (country !== undefined) ticket.country = country;
    if (account !== undefined) ticket.account = account;
    if (skill_required !== undefined) ticket.skill_required = skill_required;
    if (tags !== undefined) ticket.tags = tags;
    if (security_restriction !== undefined) ticket.security_restriction = security_restriction;

    ticket.updated_at = new Date();

    // Build history notes about major changes
    const historyNotes = [];
    if (oldStatus !== ticket.status) historyNotes.push(`Status changed from ${oldStatus} to ${ticket.status}`);
    if (oldPriority !== ticket.priority) historyNotes.push(`Priority changed from ${oldPriority} to ${ticket.priority}`);
    if (oldEscalated !== ticket.escalated) historyNotes.push(`Escalation ${ticket.escalated ? 'enabled' : 'disabled'}`);
    
    // Add admin note to history if provided
    if (additionalNote || historyNotes.length > 0) {
      ticket.history.push({
        status: ticket.status,
        changedBy: `${req.user.first_name} ${req.user.last_name} (Admin)`,
        changedAt: new Date(),
        notes: [
          ...historyNotes,
          additionalNote ? `Admin note: ${additionalNote}` : ''
        ].filter(Boolean).join('. ')
      });
    }

    // Add internal note if provided
    if (additionalNote) {
      ticket.internal_notes.push({
        body: additionalNote,
        addedBy: `${req.user.first_name} ${req.user.last_name} (Admin)`,
        createdAt: new Date()
      });
    }

    await ticket.save();

    // Populate the response
    const populatedTicket = await Ticket.findById(ticket._id)
      .populate('customer', 'organization')
      .populate({
        path: 'assigned_to',
        populate: {
          path: 'user',
          select: 'first_name last_name email'
        }
      });

    res.json({
      message: 'Ticket updated successfully by admin',
      ticket: populatedTicket,
      changesApplied: historyNotes.length > 0 ? historyNotes : ['No major changes']
    });
  } catch (error) {
    console.error('Admin update ticket error:', error);
    res.status(500).json({ message: 'Server error while updating ticket' });
  }
});

// Get agents with their current ticket load (for admin assignment)
router.get('/admin/agents-workload', auth, async (req, res) => {
  try {
    // Only admins can access this endpoint
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Only admins can view agent workload.' });
    }
    
    // Get all agents
    const agents = await Agent.find()
      .populate('user', 'first_name last_name email role');
      
    // Get active ticket counts for each agent
    const agentsWithWorkload = await Promise.all(agents.map(async (agent) => {
      const activeTicketCount = await Ticket.countDocuments({
        assigned_to: agent._id,
        status: { $nin: ['closed', 'resolved'] }
      });
      
      const totalTicketCount = await Ticket.countDocuments({
        assigned_to: agent._id
      });
      
      return {
        id: agent._id,
        name: `${agent.user.first_name} ${agent.user.last_name}`,
        email: agent.user.email,
        skills: agent.skills || [],
        domains: agent.domain_expertise || [],
        experience: agent.experience || 0,
        capacity: agent.max_tickets || 10,
        activeTickets: activeTicketCount,
        totalTickets: totalTicketCount,
        availableCapacity: (agent.max_tickets || 10) - activeTicketCount
      };
    }));
    
    // Sort agents by available capacity (descending)
    agentsWithWorkload.sort((a, b) => b.availableCapacity - a.availableCapacity);
    
    res.json({ agents: agentsWithWorkload });
  } catch (error) {
    console.error('Get agent workload error:', error);
    res.status(500).json({ message: 'Server error while fetching agent workload' });
  }
});

// Bulk update tickets (admin only)
router.post('/admin/bulk-update', auth, async (req, res) => {
  try {
    // Only admins can access this endpoint
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Only admins can perform bulk updates.' });
    }

    const { ticketIds, status, priority, notes } = req.body;
    
    if (!ticketIds || !Array.isArray(ticketIds) || ticketIds.length === 0) {
      return res.status(400).json({ message: 'No ticket IDs provided for bulk update' });
    }
    
    if (!status && !priority) {
      return res.status(400).json({ message: 'No update parameters provided (status or priority required)' });
    }
    
    console.log(`Admin bulk updating ${ticketIds.length} tickets`);
    
    // Update each ticket
    const updatePromises = ticketIds.map(async (ticketId) => {
      try {
        const ticket = await Ticket.findById(ticketId);
        if (!ticket) {
          return { id: ticketId, success: false, message: 'Ticket not found' };
        }
        
        // Store old values
        const oldStatus = ticket.status;
        const oldPriority = ticket.priority;
        
        // Apply updates
        let updated = false;
        if (status && ticket.status !== status) {
          ticket.status = status;
          updated = true;
        }
        
        if (priority && ticket.priority !== priority) {
          ticket.priority = priority;
          updated = true;
        }
        
        if (updated) {
          ticket.updated_at = new Date();
          
          // Add to history
          ticket.history.push({
            status: ticket.status,
            changedBy: `${req.user.first_name} ${req.user.last_name} (Admin)`,
            changedAt: new Date(),
            notes: notes || 'Bulk update by admin'
          });
          
          await ticket.save();
          return { 
            id: ticketId, 
            success: true,
            changes: {
              status: status && oldStatus !== status ? { from: oldStatus, to: status } : null,
              priority: priority && oldPriority !== priority ? { from: oldPriority, to: priority } : null
            }
          };
        }
        
        return { id: ticketId, success: true, message: 'No changes needed' };
      } catch (error) {
        console.error(`Error updating ticket ${ticketId}:`, error);
        return { id: ticketId, success: false, message: error.message };
      }
    });
    
    const results = await Promise.all(updatePromises);
    
    // Count successful and failed updates
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    
    res.json({
      message: `Bulk update completed: ${successful} tickets updated, ${failed} failed`,
      results
    });
  } catch (error) {
    console.error('Admin bulk update error:', error);
    res.status(500).json({ message: 'Server error while performing bulk update' });
  }
});

// ============== DASHBOARD STATISTICS ROUTES ==============

// Get ticket statistics for dashboard
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

// Get ticket aging data for graph
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

// Create a new ticket with ML/NLP auto-assignment via Python
const { spawn } = require('child_process');

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

    // Fetch all agents from MongoDB
    const agents = await Agent.find().populate('user', 'first_name last_name email');

    // Prepare agent data for Python
    const agentData = await Promise.all(agents.map(async (agent) => {
      const activeTickets = await Ticket.countDocuments({
        assigned_to: agent._id,
        status: { $nin: ['closed', 'resolved'] }
      });
      return {
        id: agent._id.toString(),
        skills: agent.skills || [],
        experience: agent.experience || 0,
        max_tickets: agent.max_tickets || 10,
        active_tickets: activeTickets,
        first_name: agent.user.first_name,
        last_name: agent.user.last_name,
        email: agent.user.email
      };
    }));

    // Prepare ticket data for Python
    const ticketData = {
      subject,
      description,
      skill_required: skill_required || [],
      priority: priority || 'medium',
      complexity: complexity || 'moderate',
      severity: severity || 'minor',
      type: type || 'incident',
      tags: tags || []
    };

    // Call the Python script for ML/NLP assignment
    const py = spawn(
  'C:/hackton/automated-ticket-dispatcher/.venv/Scripts/python.exe',
  [require('path').join(__dirname, '../auto_assign.py')]
);
    let result = '';
    let errorResult = '';

    py.stdin.write(JSON.stringify({ agents: agentData, ticket: ticketData }));
    py.stdin.end();

    py.stdout.on('data', (data) => {
      result += data.toString();
    });
    py.stderr.on('data', (data) => {
      errorResult += data.toString();
    });

    py.on('close', async (code) => {
      if (code !== 0 || errorResult) {
        console.error('Python ML assignment error:', errorResult);
        // Fallback: create ticket without assignment
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
          customer: customer ? customer._id : null,
          history: [{
            status: 'new',
            changedBy: `${req.user.first_name} ${req.user.last_name}`,
            changedAt: new Date(),
            notes: 'Auto-assignment failed, created without agent.'
          }]
        });
        await newTicket.save();
        const populatedTicket = await Ticket.findById(newTicket._id)
          .populate('customer', 'organization')
          .populate('assigned_to', 'first_name last_name email');
        return res.status(201).json({
          message: 'Ticket created (auto-assignment failed)',
          ticket: populatedTicket
        });
      }

      let bestAgentId = null;
      try {
        const pyResult = JSON.parse(result);
        bestAgentId = pyResult.best_agent_id;
      } catch (e) {
        console.error('Error parsing Python result:', e, result);
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
        customer: customer ? customer._id : null,
        assigned_to: bestAgentId || null,
        history: [{
          status: bestAgentId ? 'assigned' : 'new',
          changedBy: `${req.user.first_name} ${req.user.last_name}`,
          changedAt: new Date(),
          notes: bestAgentId ? `Auto-assigned to agent ${bestAgentId}` : 'No suitable agent found for auto-assignment.'
        }]
      });
      await newTicket.save();
      const populatedTicket = await Ticket.findById(newTicket._id)
        .populate('customer', 'organization')
        .populate('assigned_to', 'first_name last_name email');
      res.status(201).json({
        message: bestAgentId
          ? 'Ticket created and auto-assigned to agent.'
          : 'Ticket created (no suitable agent found for auto-assignment)',
        ticket: populatedTicket
      });
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

// Assign ticket to an agent
router.post('/:id/assign', auth, async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    const { agentId } = req.body;
    
    // If no agentId provided, assign to current user (if they are an agent)
    const assigneeId = agentId || req.user._id;

    // Validate that the assignee is an agent or admin
    if (!agentId && req.user.role !== 'agent' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only agents and admins can assign tickets to themselves' });
    }

    ticket.assigned_to = assigneeId;
    ticket.status = 'assigned';
    ticket.updated_at = new Date();

    // Add to history
    ticket.history.push({
      status: 'assigned',
      changedBy: `${req.user.first_name} ${req.user.last_name}`,
      changedAt: new Date()
    });

    await ticket.save();

    // Populate the response
    const populatedTicket = await Ticket.findById(ticket._id)
      .populate('customer', 'organization')
      .populate('assigned_to', 'first_name last_name email');

    res.json({
      message: 'Ticket assigned successfully',
      ticket: populatedTicket
    });
  } catch (error) {
    console.error('Assign ticket error:', error);
    res.status(500).json({ message: 'Server error while assigning ticket' });
  }
});

// Add comment to a ticket
router.post('/:id/comment', auth, async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    const { comment } = req.body;
    if (!comment || !comment.trim()) {
      return res.status(400).json({ message: 'Comment is required' });
    }

    // Add comment to internal notes
    ticket.internal_notes.push({
      body: comment.trim(),
      addedBy: `${req.user.first_name} ${req.user.last_name} (${req.user.role})`,
      createdAt: new Date()
    });

    ticket.updated_at = new Date();
    await ticket.save();

    // Populate the response
    const populatedTicket = await Ticket.findById(ticket._id)
      .populate('customer', 'organization')
      .populate('assigned_to', 'first_name last_name email');

    res.json({
      message: 'Comment added successfully',
      ticket: populatedTicket
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ message: 'Server error while adding comment' });
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

// ============== ADMIN SPECIFIC ROUTES ==============

// Get all tickets with advanced filtering for admin
router.get('/admin/tickets', auth, async (req, res) => {
  try {
    // Only admins can access this endpoint
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Only admins can view all tickets with advanced filtering.' });
    }

    console.log('Admin accessing all tickets with filters');
    
    // Extract filter parameters from query
    const { status, priority, assignedTo, escalated, fromDate, toDate, search } = req.query;
    
    // Build filter object
    const filter = {};
    
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (assignedTo === 'unassigned') {
      filter.$or = [
        { assigned_to: null },
        { assigned_to: { $exists: false } }
      ];
    } else if (assignedTo) {
      filter.assigned_to = assignedTo;
    }
    if (escalated) filter.escalated = escalated === 'true';
    
    // Date range filter
    if (fromDate || toDate) {
      filter.created_at = {};
      if (fromDate) filter.created_at.$gte = new Date(fromDate);
      if (toDate) filter.created_at.$lte = new Date(toDate);
    }
    
    // Text search
    if (search) {
      filter.$or = [
        { subject: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    console.log('Admin ticket filter:', filter);
    
    // Get filtered tickets
    const tickets = await Ticket.find(filter)
      .populate('customer', 'organization')
      .populate({
        path: 'assigned_to',
        populate: {
          path: 'user',
          select: 'first_name last_name email'
        }
      })
      .sort({ created_at: -1 });

    console.log(`Found ${tickets.length} tickets matching admin filters`);
    
    res.json({ tickets });
  } catch (error) {
    console.error('Admin get tickets error:', error);
    res.status(500).json({ message: 'Server error while fetching tickets for admin' });
  }
});

// Manually assign ticket to specific agent (admin only)
router.post('/admin/assign/:ticketId/:agentId', auth, async (req, res) => {
  try {
    // Only admins can access this endpoint
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Only admins can manually assign tickets.' });
    }

    const { ticketId, agentId } = req.params;
    const { overrideCapacity } = req.body;
    
    // Find the ticket
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }
    
    // Find the agent
    const agent = await Agent.findById(agentId);
    if (!agent) {
      return res.status(404).json({ message: 'Agent not found' });
    }
    
    // Check agent capacity
    if (!overrideCapacity) {
      const assignedTicketCount = await Ticket.countDocuments({ 
        assigned_to: agentId,
        status: { $nin: ['closed', 'resolved'] } 
      });
      
      if (agent.max_tickets && assignedTicketCount >= agent.max_tickets) {
        return res.status(400).json({ 
          message: `Agent has reached maximum ticket capacity (${agent.max_tickets})`,
          currentLoad: assignedTicketCount,
          canOverride: true
        });
      }
    }
    
    // Update ticket assignment
    ticket.assigned_to = agentId;
    ticket.status = 'assigned';
    ticket.updated_at = new Date();
    
    // Add to history
    ticket.history.push({
      status: 'assigned',
      changedBy: `${req.user.first_name} ${req.user.last_name} (Admin)`,
      changedAt: new Date(),
      notes: 'Manually assigned by admin'
    });
    
    await ticket.save();
    
    // Get agent user details
    const agentUser = await mongoose.model('User').findById(agent.user, 'first_name last_name email');
    
    // Populate the response
    const populatedTicket = await Ticket.findById(ticket._id)
      .populate('customer', 'organization')
      .populate({
        path: 'assigned_to',
        populate: {
          path: 'user',
          select: 'first_name last_name email'
        }
      });

    res.json({
      message: `Ticket successfully assigned to ${agentUser.first_name} ${agentUser.last_name}`,
      ticket: populatedTicket,
      agent: {
        id: agent._id,
        name: `${agentUser.first_name} ${agentUser.last_name}`,
        email: agentUser.email
      }
    });
  } catch (error) {
    console.error('Admin assign ticket error:', error);
    res.status(500).json({ message: 'Server error while assigning ticket' });
  }
});

// Advanced ticket update with admin privileges
router.put('/admin/ticket/:id', auth, async (req, res) => {
  try {
    // Only admins can access this endpoint
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Only admins can perform advanced updates.' });
    }

    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    const {
      subject,
      description,
      status,
      priority,
      complexity,
      severity,
      type,
      escalated,
      escalation_reason,
      category,
      domain,
      product,
      operation_type,
      region,
      country,
      account,
      skill_required,
      tags,
      security_restriction,
      additionalNote
    } = req.body;

    // Store old values for history
    const oldStatus = ticket.status;
    const oldPriority = ticket.priority;
    const oldEscalated = ticket.escalated;

    // Admin can update any field, including normally restricted ones
    if (subject !== undefined) ticket.subject = subject;
    if (description !== undefined) ticket.description = description;
    if (status !== undefined) ticket.status = status;
    if (priority !== undefined) ticket.priority = priority;
    if (complexity !== undefined) ticket.complexity = complexity;
    if (severity !== undefined) ticket.severity = severity;
    if (type !== undefined) ticket.type = type;
    if (escalated !== undefined) ticket.escalated = escalated;
    if (escalation_reason !== undefined) ticket.escalation_reason = escalation_reason;
    if (category !== undefined) ticket.category = category;
    if (domain !== undefined) ticket.domain = domain;
    if (product !== undefined) ticket.product = product;
    if (operation_type !== undefined) ticket.operation_type = operation_type;
    if (region !== undefined) ticket.region = region;
    if (country !== undefined) ticket.country = country;
    if (account !== undefined) ticket.account = account;
    if (skill_required !== undefined) ticket.skill_required = skill_required;
    if (tags !== undefined) ticket.tags = tags;
    if (security_restriction !== undefined) ticket.security_restriction = security_restriction;

    ticket.updated_at = new Date();

    // Build history notes about major changes
    const historyNotes = [];
    if (oldStatus !== ticket.status) historyNotes.push(`Status changed from ${oldStatus} to ${ticket.status}`);
    if (oldPriority !== ticket.priority) historyNotes.push(`Priority changed from ${oldPriority} to ${ticket.priority}`);
    if (oldEscalated !== ticket.escalated) historyNotes.push(`Escalation ${ticket.escalated ? 'enabled' : 'disabled'}`);
    
    // Add admin note to history if provided
    if (additionalNote || historyNotes.length > 0) {
      ticket.history.push({
        status: ticket.status,
        changedBy: `${req.user.first_name} ${req.user.last_name} (Admin)`,
        changedAt: new Date(),
        notes: [
          ...historyNotes,
          additionalNote ? `Admin note: ${additionalNote}` : ''
        ].filter(Boolean).join('. ')
      });
    }

    // Add internal note if provided
    if (additionalNote) {
      ticket.internal_notes.push({
        body: additionalNote,
        addedBy: `${req.user.first_name} ${req.user.last_name} (Admin)`,
        createdAt: new Date()
      });
    }

    await ticket.save();

    // Populate the response
    const populatedTicket = await Ticket.findById(ticket._id)
      .populate('customer', 'organization')
      .populate({
        path: 'assigned_to',
        populate: {
          path: 'user',
          select: 'first_name last_name email'
        }
      });

    res.json({
      message: 'Ticket updated successfully by admin',
      ticket: populatedTicket,
      changesApplied: historyNotes.length > 0 ? historyNotes : ['No major changes']
    });
  } catch (error) {
    console.error('Admin update ticket error:', error);
    res.status(500).json({ message: 'Server error while updating ticket' });
  }
});

// Get agents with their current ticket load (for admin assignment)
router.get('/admin/agents-workload', auth, async (req, res) => {
  try {
    // Only admins can access this endpoint
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Only admins can view agent workload.' });
    }
    
    // Get all agents
    const agents = await Agent.find()
      .populate('user', 'first_name last_name email role');
      
    // Get active ticket counts for each agent
    const agentsWithWorkload = await Promise.all(agents.map(async (agent) => {
      const activeTicketCount = await Ticket.countDocuments({
        assigned_to: agent._id,
        status: { $nin: ['closed', 'resolved'] }
      });
      
      const totalTicketCount = await Ticket.countDocuments({
        assigned_to: agent._id
      });
      
      return {
        id: agent._id,
        name: `${agent.user.first_name} ${agent.user.last_name}`,
        email: agent.user.email,
        skills: agent.skills || [],
        domains: agent.domain_expertise || [],
        experience: agent.experience || 0,
        capacity: agent.max_tickets || 10,
        activeTickets: activeTicketCount,
        totalTickets: totalTicketCount,
        availableCapacity: (agent.max_tickets || 10) - activeTicketCount
      };
    }));
    
    // Sort agents by available capacity (descending)
    agentsWithWorkload.sort((a, b) => b.availableCapacity - a.availableCapacity);
    
    res.json({ agents: agentsWithWorkload });
  } catch (error) {
    console.error('Get agent workload error:', error);
    res.status(500).json({ message: 'Server error while fetching agent workload' });
  }
});

// Bulk update tickets (admin only)
router.post('/admin/bulk-update', auth, async (req, res) => {
  try {
    // Only admins can access this endpoint
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Only admins can perform bulk updates.' });
    }

    const { ticketIds, status, priority, notes } = req.body;
    
    if (!ticketIds || !Array.isArray(ticketIds) || ticketIds.length === 0) {
      return res.status(400).json({ message: 'No ticket IDs provided for bulk update' });
    }
    
    if (!status && !priority) {
      return res.status(400).json({ message: 'No update parameters provided (status or priority required)' });
    }
    
    console.log(`Admin bulk updating ${ticketIds.length} tickets`);
    
    // Update each ticket
    const updatePromises = ticketIds.map(async (ticketId) => {
      try {
        const ticket = await Ticket.findById(ticketId);
        if (!ticket) {
          return { id: ticketId, success: false, message: 'Ticket not found' };
        }
        
        // Store old values
        const oldStatus = ticket.status;
        const oldPriority = ticket.priority;
        
        // Apply updates
        let updated = false;
        if (status && ticket.status !== status) {
          ticket.status = status;
          updated = true;
        }
        
        if (priority && ticket.priority !== priority) {
          ticket.priority = priority;
          updated = true;
        }
        
        if (updated) {
          ticket.updated_at = new Date();
          
          // Add to history
          ticket.history.push({
            status: ticket.status,
            changedBy: `${req.user.first_name} ${req.user.last_name} (Admin)`,
            changedAt: new Date(),
            notes: notes || 'Bulk update by admin'
          });
          
          await ticket.save();
          return { 
            id: ticketId, 
            success: true,
            changes: {
              status: status && oldStatus !== status ? { from: oldStatus, to: status } : null,
              priority: priority && oldPriority !== priority ? { from: oldPriority, to: priority } : null
            }
          };
        }
        
        return { id: ticketId, success: true, message: 'No changes needed' };
      } catch (error) {
        console.error(`Error updating ticket ${ticketId}:`, error);
        return { id: ticketId, success: false, message: error.message };
      }
    });
    
    const results = await Promise.all(updatePromises);
    
    // Count successful and failed updates
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    
    res.json({
      message: `Bulk update completed: ${successful} tickets updated, ${failed} failed`,
      results
    });
  } catch (error) {
    console.error('Admin bulk update error:', error);
    res.status(500).json({ message: 'Server error while performing bulk update' });
  }
});

// ============== DASHBOARD STATISTICS ROUTES ==============

// Get ticket statistics for dashboard
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

// Get ticket aging data for graph
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

// Assign ticket to an agent
router.post('/:id/assign', auth, async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    const { agentId } = req.body;
    
    // If no agentId provided, assign to current user (if they are an agent)
    const assigneeId = agentId || req.user._id;

    // Validate that the assignee is an agent or admin
    if (!agentId && req.user.role !== 'agent' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only agents and admins can assign tickets to themselves' });
    }

    ticket.assigned_to = assigneeId;
    ticket.status = 'assigned';
    ticket.updated_at = new Date();

    // Add to history
    ticket.history.push({
      status: 'assigned',
      changedBy: `${req.user.first_name} ${req.user.last_name}`,
      changedAt: new Date()
    });

    await ticket.save();

    // Populate the response
    const populatedTicket = await Ticket.findById(ticket._id)
      .populate('customer', 'organization')
      .populate('assigned_to', 'first_name last_name email');

    res.json({
      message: 'Ticket assigned successfully',
      ticket: populatedTicket
    });
  } catch (error) {
    console.error('Assign ticket error:', error);
    res.status(500).json({ message: 'Server error while assigning ticket' });
  }
});

// Add comment to a ticket
router.post('/:id/comment', auth, async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    const { comment } = req.body;
    if (!comment || !comment.trim()) {
      return res.status(400).json({ message: 'Comment is required' });
    }

    // Add comment to internal notes
    ticket.internal_notes.push({
      body: comment.trim(),
      addedBy: `${req.user.first_name} ${req.user.last_name} (${req.user.role})`,
      createdAt: new Date()
    });

    ticket.updated_at = new Date();
    await ticket.save();

    // Populate the response
    const populatedTicket = await Ticket.findById(ticket._id)
      .populate('customer', 'organization')
      .populate('assigned_to', 'first_name last_name email');

    res.json({
      message: 'Comment added successfully',
      ticket: populatedTicket
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ message: 'Server error while adding comment' });
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

// ============== ADMIN SPECIFIC ROUTES ==============

// Get all tickets with advanced filtering for admin
router.get('/admin/tickets', auth, async (req, res) => {
  try {
    // Only admins can access this endpoint
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Only admins can view all tickets with advanced filtering.' });
    }

    console.log('Admin accessing all tickets with filters');
    
    // Extract filter parameters from query
    const { status, priority, assignedTo, escalated, fromDate, toDate, search } = req.query;
    
    // Build filter object
    const filter = {};
    
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (assignedTo === 'unassigned') {
      filter.$or = [
        { assigned_to: null },
        { assigned_to: { $exists: false } }
      ];
    } else if (assignedTo) {
      filter.assigned_to = assignedTo;
    }
    if (escalated) filter.escalated = escalated === 'true';
    
    // Date range filter
    if (fromDate || toDate) {
      filter.created_at = {};
      if (fromDate) filter.created_at.$gte = new Date(fromDate);
      if (toDate) filter.created_at.$lte = new Date(toDate);
    }
    
    // Text search
    if (search) {
      filter.$or = [
        { subject: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    console.log('Admin ticket filter:', filter);
    
    // Get filtered tickets
    const tickets = await Ticket.find(filter)
      .populate('customer', 'organization')
      .populate({
        path: 'assigned_to',
        populate: {
          path: 'user',
          select: 'first_name last_name email'
        }
      })
      .sort({ created_at: -1 });

    console.log(`Found ${tickets.length} tickets matching admin filters`);
    
    res.json({ tickets });
  } catch (error) {
    console.error('Admin get tickets error:', error);
    res.status(500).json({ message: 'Server error while fetching tickets for admin' });
  }
});

// Manually assign ticket to specific agent (admin only)
router.post('/admin/assign/:ticketId/:agentId', auth, async (req, res) => {
  try {
    // Only admins can access this endpoint
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Only admins can manually assign tickets.' });
    }

    const { ticketId, agentId } = req.params;
    const { overrideCapacity } = req.body;
    
    // Find the ticket
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }
    
    // Find the agent
    const agent = await Agent.findById(agentId);
    if (!agent) {
      return res.status(404).json({ message: 'Agent not found' });
    }
    
    // Check agent capacity
    if (!overrideCapacity) {
      const assignedTicketCount = await Ticket.countDocuments({ 
        assigned_to: agentId,
        status: { $nin: ['closed', 'resolved'] } 
      });
      
      if (agent.max_tickets && assignedTicketCount >= agent.max_tickets) {
        return res.status(400).json({ 
          message: `Agent has reached maximum ticket capacity (${agent.max_tickets})`,
          currentLoad: assignedTicketCount,
          canOverride: true
        });
      }
    }
    
    // Update ticket assignment
    ticket.assigned_to = agentId;
    ticket.status = 'assigned';
    ticket.updated_at = new Date();
    
    // Add to history
    ticket.history.push({
      status: 'assigned',
      changedBy: `${req.user.first_name} ${req.user.last_name} (Admin)`,
      changedAt: new Date(),
      notes: 'Manually assigned by admin'
    });
    
    await ticket.save();
    
    // Get agent user details
    const agentUser = await mongoose.model('User').findById(agent.user, 'first_name last_name email');
    
    // Populate the response
    const populatedTicket = await Ticket.findById(ticket._id)
      .populate('customer', 'organization')
      .populate({
        path: 'assigned_to',
        populate: {
          path: 'user',
          select: 'first_name last_name email'
        }
      });

    res.json({
      message: `Ticket successfully assigned to ${agentUser.first_name} ${agentUser.last_name}`,
      ticket: populatedTicket,
      agent: {
        id: agent._id,
        name: `${agentUser.first_name} ${agentUser.last_name}`,
        email: agentUser.email
      }
    });
  } catch (error) {
    console.error('Admin assign ticket error:', error);
    res.status(500).json({ message: 'Server error while assigning ticket' });
  }
});

// Advanced ticket update with admin privileges
router.put('/admin/ticket/:id', auth, async (req, res) => {
  try {
    // Only admins can access this endpoint
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Only admins can perform advanced updates.' });
    }

    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    const {
      subject,
      description,
      status,
      priority,
      complexity,
      severity,
      type,
      escalated,
      escalation_reason,
      category,
      domain,
      product,
      operation_type,
      region,
      country,
      account,
      skill_required,
      tags,
      security_restriction,
      additionalNote
    } = req.body;

    // Store old values for history
    const oldStatus = ticket.status;
    const oldPriority = ticket.priority;
    const oldEscalated = ticket.escalated;

    // Admin can update any field, including normally restricted ones
    if (subject !== undefined) ticket.subject = subject;
    if (description !== undefined) ticket.description = description;
    if (status !== undefined) ticket.status = status;
    if (priority !== undefined) ticket.priority = priority;
    if (complexity !== undefined) ticket.complexity = complexity;
    if (severity !== undefined) ticket.severity = severity;
    if (type !== undefined) ticket.type = type;
    if (escalated !== undefined) ticket.escalated = escalated;
    if (escalation_reason !== undefined) ticket.escalation_reason = escalation_reason;
    if (category !== undefined) ticket.category = category;
    if (domain !== undefined) ticket.domain = domain;
    if (product !== undefined) ticket.product = product;
    if (operation_type !== undefined) ticket.operation_type = operation_type;
    if (region !== undefined) ticket.region = region;
    if (country !== undefined) ticket.country = country;
    if (account !== undefined) ticket.account = account;
    if (skill_required !== undefined) ticket.skill_required = skill_required;
    if (tags !== undefined) ticket.tags = tags;
    if (security_restriction !== undefined) ticket.security_restriction = security_restriction;

    ticket.updated_at = new Date();

    // Build history notes about major changes
    const historyNotes = [];
    if (oldStatus !== ticket.status) historyNotes.push(`Status changed from ${oldStatus} to ${ticket.status}`);
    if (oldPriority !== ticket.priority) historyNotes.push(`Priority changed from ${oldPriority} to ${ticket.priority}`);
    if (oldEscalated !== ticket.escalated) historyNotes.push(`Escalation ${ticket.escalated ? 'enabled' : 'disabled'}`);
    
    // Add admin note to history if provided
    if (additionalNote || historyNotes.length > 0) {
      ticket.history.push({
        status: ticket.status,
        changedBy: `${req.user.first_name} ${req.user.last_name} (Admin)`,
        changedAt: new Date(),
        notes: [
          ...historyNotes,
          additionalNote ? `Admin note: ${additionalNote}` : ''
        ].filter(Boolean).join('. ')
      });
    }

    // Add internal note if provided
    if (additionalNote) {
      ticket.internal_notes.push({
        body: additionalNote,
        addedBy: `${req.user.first_name} ${req.user.last_name} (Admin)`,
        createdAt: new Date()
      });
    }

    await ticket.save();

    // Populate the response
    const populatedTicket = await Ticket.findById(ticket._id)
      .populate('customer', 'organization')
      .populate({
        path: 'assigned_to',
        populate: {
          path: 'user',
          select: 'first_name last_name email'
        }
      });

    res.json({
      message: 'Ticket updated successfully by admin',
      ticket: populatedTicket,
      changesApplied: historyNotes.length > 0 ? historyNotes : ['No major changes']
    });
  } catch (error) {
    console.error('Admin update ticket error:', error);
    res.status(500).json({ message: 'Server error while updating ticket' });
  }
});

// Get agents with their current ticket load (for admin assignment)
router.get('/admin/agents-workload', auth, async (req, res) => {
  try {
    // Only admins can access this endpoint
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Only admins can view agent workload.' });
    }
    
    // Get all agents
    const agents = await Agent.find()
      .populate('user', 'first_name last_name email role');
      
    // Get active ticket counts for each agent
    const agentsWithWorkload = await Promise.all(agents.map(async (agent) => {
      const activeTicketCount = await Ticket.countDocuments({
        assigned_to: agent._id,
        status: { $nin: ['closed', 'resolved'] }
      });
      
      const totalTicketCount = await Ticket.countDocuments({
        assigned_to: agent._id
      });
      
      return {
        id: agent._id,
        name: `${agent.user.first_name} ${agent.user.last_name}`,
        email: agent.user.email,
        skills: agent.skills || [],
        domains: agent.domain_expertise || [],
        experience: agent.experience || 0,
        capacity: agent.max_tickets || 10,
        activeTickets: activeTicketCount,
        totalTickets: totalTicketCount,
        availableCapacity: (agent.max_tickets || 10) - activeTicketCount
      };
    }));
    
    // Sort agents by available capacity (descending)
    agentsWithWorkload.sort((a, b) => b.availableCapacity - a.availableCapacity);
    
    res.json({ agents: agentsWithWorkload });
  } catch (error) {
    console.error('Get agent workload error:', error);
    res.status(500).json({ message: 'Server error while fetching agent workload' });
  }
});

// Bulk update tickets (admin only)
router.post('/admin/bulk-update', auth, async (req, res) => {
  try {
    // Only admins can access this endpoint
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Only admins can perform bulk updates.' });
    }

    const { ticketIds, status, priority, notes } = req.body;
    
    if (!ticketIds || !Array.isArray(ticketIds) || ticketIds.length === 0) {
      return res.status(400).json({ message: 'No ticket IDs provided for bulk update' });
    }
    
    if (!status && !priority) {
      return res.status(400).json({ message: 'No update parameters provided (status or priority required)' });
    }
    
    console.log(`Admin bulk updating ${ticketIds.length} tickets`);
    
    // Update each ticket
    const updatePromises = ticketIds.map(async (ticketId) => {
      try {
        const ticket = await Ticket.findById(ticketId);
        if (!ticket) {
          return { id: ticketId, success: false, message: 'Ticket not found' };
        }
        
        // Store old values
        const oldStatus = ticket.status;
        const oldPriority = ticket.priority;
        
        // Apply updates
        let updated = false;
        if (status && ticket.status !== status) {
          ticket.status = status;
          updated = true;
        }
        
        if (priority && ticket.priority !== priority) {
          ticket.priority = priority;
          updated = true;
        }
        
        if (updated) {
          ticket.updated_at = new Date();
          
          // Add to history
          ticket.history.push({
            status: ticket.status,
            changedBy: `${req.user.first_name} ${req.user.last_name} (Admin)`,
            changedAt: new Date(),
            notes: notes || 'Bulk update by admin'
          });
          
          await ticket.save();
          return { 
            id: ticketId, 
            success: true,
            changes: {
              status: status && oldStatus !== status ? { from: oldStatus, to: status } : null,
              priority: priority && oldPriority !== priority ? { from: oldPriority, to: priority } : null
            }
          };
        }
        
        return { id: ticketId, success: true, message: 'No changes needed' };
      } catch (error) {
        console.error(`Error updating ticket ${ticketId}:`, error);
        return { id: ticketId, success: false, message: error.message };
      }
    });
    
    const results = await Promise.all(updatePromises);
    
    // Count successful and failed updates
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    
    res.json({
      message: `Bulk update completed: ${successful} tickets updated, ${failed} failed`,
      results
    });
  } catch (error) {
    console.error('Admin bulk update error:', error);
    res.status(500).json({ message: 'Server error while performing bulk update' });
  }
});

// ============== DASHBOARD STATISTICS ROUTES ==============

// Get ticket statistics for dashboard
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

// Get ticket aging data for graph
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

// Assign ticket to an agent
router.post('/:id/assign', auth, async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    const { agentId } = req.body;
    
    // If no agentId provided, assign to current user (if they are an agent)
    const assigneeId = agentId || req.user._id;

    // Validate that the assignee is an agent or admin
    if (!agentId && req.user.role !== 'agent' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only agents and admins can assign tickets to themselves' });
    }

    ticket.assigned_to = assigneeId;
    ticket.status = 'assigned';
    ticket.updated_at = new Date();

    // Add to history
    ticket.history.push({
      status: 'assigned',
      changedBy: `${req.user.first_name} ${req.user.last_name}`,
      changedAt: new Date()
    });

    await ticket.save();

    // Populate the response
    const populatedTicket = await Ticket.findById(ticket._id)
      .populate('customer', 'organization')
      .populate('assigned_to', 'first_name last_name email');

    res.json({
      message: 'Ticket assigned successfully',
      ticket: populatedTicket
    });
  } catch (error) {
    console.error('Assign ticket error:', error);
    res.status(500).json({ message: 'Server error while assigning ticket' });
  }
});

// Add comment to a ticket
router.post('/:id/comment', auth, async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    const { comment } = req.body;
    if (!comment || !comment.trim()) {
      return res.status(400).json({ message: 'Comment is required' });
    }

    // Add comment to internal notes
    ticket.internal_notes.push({
      body: comment.trim(),
      addedBy: `${req.user.first_name} ${req.user.last_name} (${req.user.role})`,
      createdAt: new Date()
    });

    ticket.updated_at = new Date();
    await ticket.save();

    // Populate the response
    const populatedTicket = await Ticket.findById(ticket._id)
      .populate('customer', 'organization')
      .populate('assigned_to', 'first_name last_name email');

    res.json({
      message: 'Comment added successfully',
      ticket: populatedTicket
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ message: 'Server error while adding comment' });
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