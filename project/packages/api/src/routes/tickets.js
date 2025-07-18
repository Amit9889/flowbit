const express = require('express');
const Joi = require('joi');
const axios = require('axios');
const Ticket = require('../models/Ticket');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

const ticketSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().required(),
  priority: Joi.string().valid('low', 'medium', 'high', 'urgent').default('medium')
});

// Get all tickets for the current tenant
router.get('/', authenticateToken, async (req, res) => {
  try {
    const tickets = await Ticket.find({ customerId: req.customerId })
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });

    res.json(tickets);
  } catch (error) {
    console.error('Get tickets error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create a new ticket
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { error } = ticketSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const ticket = new Ticket({
      ...req.body,
      customerId: req.customerId,
      createdBy: req.user._id
    });

    await ticket.save();
    await ticket.populate('createdBy', 'name email');

    // Trigger n8n workflow
    try {
      await axios.post('http://n8n:5678/webhook/ticket-created', {
        ticketId: ticket._id,
        customerId: req.customerId,
        title: ticket.title,
        priority: ticket.priority
      }, {
        headers: {
          'Authorization': `Bearer ${process.env.WEBHOOK_SECRET}`
        }
      });
    } catch (workflowError) {
      console.error('n8n workflow trigger error:', workflowError.message);
      // Don't fail the ticket creation if workflow fails
    }

    res.status(201).json(ticket);
  } catch (error) {
    console.error('Create ticket error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get a specific ticket
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const ticket = await Ticket.findOne({ 
      _id: req.params.id, 
      customerId: req.customerId 
    })
    .populate('createdBy', 'name email')
    .populate('assignedTo', 'name email');

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    res.json(ticket);
  } catch (error) {
    console.error('Get ticket error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update ticket status (Admin only)
router.patch('/:id/status', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['open', 'in-progress', 'resolved', 'closed'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const ticket = await Ticket.findOneAndUpdate(
      { _id: req.params.id, customerId: req.customerId },
      { status },
      { new: true }
    ).populate('createdBy', 'name email');

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    res.json(ticket);
  } catch (error) {
    console.error('Update ticket error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;