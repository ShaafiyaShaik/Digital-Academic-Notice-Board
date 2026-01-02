const Organization = require('../models/Organization');

// Resolves org context from JWT (req.user.orgId) or from x-org-code/query orgCode
module.exports = async function tenantMiddleware(req, res, next) {
  if (req.orgId) return next();

  const orgCode = req.header('x-org-code') || req.query.orgCode;
  if (!orgCode) {
    return res.status(400).json({ message: 'Organization context missing' });
  }

  try {
    const org = await Organization.findOne({ orgCode: orgCode.trim() });
    if (!org) return res.status(404).json({ message: 'Organization not found' });
    req.orgId = org._id;
    next();
  } catch (err) {
    next(err);
  }
};
