// middleware/authMiddleware.js
const jwt = require("jsonwebtoken");

module.exports = {
  verifyToken: (req, res, next) => {
    const authHeader = req.headers["authorization"];

    if (!authHeader) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1]; // "Bearer TOKEN"

    if (!token) {
      return res.status(401).json({ message: "Invalid token format" });
    }

    try {
      const verified = jwt.verify(token, process.env.JWT_SECRET);
      req.user = verified; // <-- Now we know user.id, user.email, user.role
      next();
    } catch (err) {
      console.error("Token error:", err.message);
      return res.status(403).json({ message: "Invalid or expired token" });
    }
  }
};
