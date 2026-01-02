const jwt = require("jsonwebtoken");

// Verifies JWT, attaches decoded user and orgId, optionally checks role
const authMiddleware = (roles) => (req, res, next) => {
  const tokenHeader = req.header("Authorization");
  const token = tokenHeader?.replace("Bearer ", "") || tokenHeader;
  if (!token) return res.status(401).json({ message: "Access denied. No token provided." });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    req.orgId = decoded.orgId;

    if (roles && !roles.includes(decoded.role)) {
      return res.status(403).json({ message: "Access denied. Insufficient permissions." });
    }
    next();
  } catch (ex) {
    res.status(400).json({ message: "Invalid token." });
  }
};

module.exports = authMiddleware;
