const jwt = require('jsonwebtoken');
const User = require('../models/user');  // Assuming you have a User model

const authenticateToken = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1];  // Extract token from the Authorization header

  if (!token) {
    return res.status(403).json({ message: 'Access denied, token missing' });
  }

  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    // Retrieve the user data based on the decoded userId
    try {
      const user = await User.findById(decoded.userId).populate('role');
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      req.user = user;  // Attach the user to the request object
      next();  // Proceed to the next middleware/route handler
    } catch (error) {
      return res.status(500).json({ message: 'Error fetching user data' });
    }
  });
};

module.exports = authenticateToken;
