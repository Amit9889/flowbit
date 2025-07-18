const express = require('express');
const fs = require('fs');
const path = require('path');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get screens for the current tenant
router.get('/screens', authenticateToken, async (req, res) => {
  try {
    const registryPath = path.join(__dirname, '../../../registry.json');
    const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
    
    const tenantScreens = registry.tenants[req.customerId];
    
    if (!tenantScreens) {
      return res.json({ screens: [] });
    }

    res.json({ screens: tenantScreens.screens });
  } catch (error) {
    console.error('Get screens error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;