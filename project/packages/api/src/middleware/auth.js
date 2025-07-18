const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = user;
    req.customerId = user.customerId;
    req.role = user.role;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid token' });
  }
};

const requireAdmin = (req, res, next) => {
  if (req.role !== 'Admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

const requireTenant = (tenantId) => {
  return (req, res, next) => {
    if (req.customerId !== tenantId) {
      return res.status(403).json({ error: 'Access denied for this tenant' });
    }
    next();
  };
};

module.exports = {
  authenticateToken,
  requireAdmin,
  requireTenant
};