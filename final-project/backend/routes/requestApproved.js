const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const jwt = require('jsonwebtoken'); 
const JWT_SECRET = 'your_jwt_secret';

const authMiddleware = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1]; // Extract token from Bearer scheme

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    req.userId = decoded.userId;
    req.userRole = decoded.role; // Optional: store role if needed
    next();
  });
};

  router.get('/rejected-request',authMiddleware, async (req, res) => {
    try {
      const userId = req.userId; 
      const rejectedRequests = await RejectedRequest.find({ userId: userId });
  
      if (rejectedRequests.length === 0) {
        return res.status(404).json({ message: 'No rejected requests found for this user' });
      }
  
      res.json(rejectedRequests);
    } catch (error) {
      console.error('Error fetching received requests by userId:', error);
      res.status(500).json({ message: 'Error fetching received requests', error });
    }
  });
     // Get all received requests for a specific user
     router.get('/recieved',authMiddleware, async (req, res) => {
      try {
        const userId = req.userId; 
        const receivedRequests = await RecievedRequest.find({ userId: userId });
    
        if (receivedRequests.length === 0) {
          return res.status(404).json({ message: 'No Recieved item requesition found on you' });
        }
    
        res.json(receivedRequests);
      } catch (error) {
        console.error('Error fetching received requests by userId:', error);
        res.status(500).json({ message: 'Error fetching received requests', error });
      }
    });
  router.get('/rejected/:id', async (req, res) => {
    try {
      const requestId = req.params.id;
      const request = await RejectedRequest.findById(requestId); // Assuming Mongoose model
      if (!request) {
        return res.status(404).json({ message: 'Request not found' });
      }
      res.json(request);
    } catch (error) {
      console.error('Error fetching request:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  module.exports = router;