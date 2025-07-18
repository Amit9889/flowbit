const express = require('express');
const Ticket = require('../models/Ticket');

const router = express.Router();

// Webhook endpoint for n8n callbacks
router.post('/ticket-done', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (token !== process.env.WEBHOOK_SECRET) {
      return res.status(401).json({ error: 'Invalid webhook secret' });
    }

    const { ticketId, status = 'in-progress' } = req.body;
    
    const ticket = await Ticket.findByIdAndUpdate(
      ticketId,
      { status, workflowId: req.body.workflowId },
      { new: true }
    ).populate('createdBy', 'name email');

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    console.log(`Ticket ${ticketId} status updated to ${status} via webhook`);
    
    // In a real app, you'd emit this to WebSocket subscribers
    // or use server-sent events to push to the UI
    
    res.json({ success: true, ticket });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;