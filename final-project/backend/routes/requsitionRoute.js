const express = require('express');
const multer = require('multer');
const mongoose = require('mongoose');
const path = require('path');

const jwt = require('jsonwebtoken'); 
const JWT_SECRET = 'your_jwt_secret';// Ensure this is included
const UserRequest = require('../models/UserRequest');
const StockItem = require('../models/stockItems');
const StockData = require('../models/stockData');
const StockHistory = require('../models/stockHistory');

const router = express.Router();

// Set up multer for file uploads if needed
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

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

router.post('/submit', authMiddleware, async (req, res) => {
  try {
    const { department,service, hodName, hodSignature, items, date } = req.body;

    if (!items) {
      return res.status(400).json({ error: 'Items field is missing.' });
    }

    let parsedItems;
    try {
      parsedItems = JSON.parse(items);
    } catch (error) {
      return res.status(400).json({ error: 'Invalid items JSON format.' });
    }

    const userId = req.userId; // Extracted from token

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required.' });
    }

    const validItems = [];
    for (const item of parsedItems) {
      if (!item.itemId) {
        return res.status(400).json({ error: 'Item ID is required for each item.' });
      }

      const validItem = await StockItem.findById(item.itemId);
      if (!validItem) {
        return res.status(400).json({ error: 'Invalid Item ID.' });
      }

      validItems.push({
        
        itemId: item.itemId,
        itemName: validItem.name,
        quantityRequested: item.quantityRequested,
        price: item.price,
        totalAmount: item.totalAmount
      });
    }

    const newRequest = new UserRequest({
      userId: userId,
      department,
      service,
      hodName,
      hodSignature,
      items: validItems,
      date,
    });

    await newRequest.save();
    res.status(201).json({ message: 'Requisition created successfully!' });

  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});



// user fetch its requisition according to its ID
router.get('/sent', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId; // Ensure userId is an ObjectId

    // Query by userId and status
    const userRequests = await UserRequest.find({ userId: userId });

    if (!userRequests || userRequests.length === 0) {
      return res.status(404).json({ message: 'No Pending requests found for this user.' });
    }
   
    res.json(userRequests);
  } catch (error) {
    console.error('Error fetching requests:', error);
    res.status(500).json({ message: error.message });
  }
});

// Route to fetch all user's requests

router.get('/', async (req, res) => {
  try {
    const requests = await UserRequest.find();
    res.json(requests);
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ message: 'Server Error' });
  }
});
// Route to fetch all pending user requests
router.get('/pending-requisition', async (req, res) => {
  try {
    const requests = await UserRequest.find({ status: 'Pending' });
    res.json(requests);
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Route to fetch all verified user requests
router.get('/verified-requisition', async (req, res) => {
  try {
    const requests = await UserRequest.find({ status: 'Verified' });
    res.json(requests);
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ message: 'Server Error' });
  }
});

router.get('/approved-requisition', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId; // Ensure userId is an ObjectId

    // Query by userId and status "Approved"
    const userRequests = await UserRequest.find({ userId: userId, status: 'Approved' });

    if (!userRequests || userRequests.length === 0) {
      return res.status(404).json({ message: 'No approved requests found for this user.' });
    }

    res.json(userRequests);
  } catch (error) {
    console.error('Error fetching approved requests:', error);
    res.status(500).json({ message: error.message });
  }
});

// Route to get the count of user requests
router.get('/count', async (req, res) => {
  try {
    const requestCount = await UserRequest.countDocuments();
    res.json({ count: requestCount });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ message: 'Server Error' });
  }
});


// route to fetch a single user request by ID
router.get('/:id', async (req, res) => {
  try {
    const requestId = req.params.id;
    const request = await UserRequest.findById(requestId); // Assuming Mongoose model
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }
    res.json(request);
  } catch (error) {
    console.error('Error fetching request:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const updateData = { ...req.body };
    
    // Ensure clicked field is updated
    if (req.body.clicked !== undefined) {
      updateData.clicked = req.body.clicked;
    }

    const updatedRequest = await UserRequest.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!updatedRequest) {
      return res.status(404).json({ message: 'Request not found' });
    }
    
    res.json(updatedRequest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /verified/:id
router.put('/verified/:id', async (req, res) => {
  try {
    const requestId = req.params.id;

    // Check if the provided ID is valid
    if (!mongoose.Types.ObjectId.isValid(requestId)) {
      return res.status(400).json({ message: 'Invalid ID' });
    }

    // Find the request by ID
    const request = await UserRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Update the status and other relevant fields
    request.status = 'Verified';

    if (req.body.clicked !== undefined) {
      request.clicked = req.body.clicked;
    }

    if (req.body.verifiedBy) {
      request.verifiedBy = {
        firstName: req.body.verifiedBy.firstName,
        lastName: req.body.verifiedBy.lastName,
        signature: req.body.verifiedBy.signature,
      };
    }

    // Save the updated request
    await request.save();

    res.json(request);
  } catch (error) {
    console.error('Error verifying request:', error);
    res.status(500).json({ message: 'Server error' });
  }
})

// PUT /Approved/:id
router.put('/approve/:id', async (req, res) => {
  try {
    const requestId = req.params.id;

    // Check if the provided ID is valid
    if (!mongoose.Types.ObjectId.isValid(requestId)) {
      return res.status(400).json({ message: 'Invalid ID' });
    }

    // Find the request by ID
    const request = await UserRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Update the status and other relevant fields
    request.status = 'Approved';

    if (req.body.clicked !== undefined) {
      request.clicked = req.body.clicked;
    }

    if (req.body.approvedBy) {
      request.approvedBy = {
        firstName: req.body.approvedBy.firstName,
        lastName: req.body.approvedBy.lastName,
        signature: req.body.approvedBy.signature,
      };
    }

    // Save the updated request
    await request.save();

    res.json(request);
  } catch (error) {
    console.error('Error verifying request:', error);
    res.status(500).json({ message: 'Server error' });
  }
})


// PUT /receive/:id
router.put('/receive/:id', async (req, res) => {
  try {
    const requestId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(requestId)) {
      return res.status(400).json({ message: 'Invalid ID' });
    }

    const request = await UserRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    request.status = 'Received';

    if (req.body.clicked !== undefined) {
      request.clicked = req.body.clicked;
    }

    if (req.body.receivedBy) {
      request.receivedBy = {
        firstName: req.body.receivedBy.firstName,
        lastName: req.body.receivedBy.lastName,
        signature: req.body.receivedBy.signature,
      };
    }

  // Iterate through all items in the request and update stock
for (const item of request.items) {
  const stockData = await StockData.findOne({ itemId: item.itemId });

  if (stockData) {
    stockData.entry.quantity = 0;
    stockData.entry.totalAmount = 0;

    stockData.exit.quantity = item.quantityReceived;
    stockData.exit.pricePerUnit = stockData.balance.pricePerUnit;
    stockData.exit.totalAmount = stockData.exit.quantity * stockData.exit.pricePerUnit;

    stockData.balance.quantity -= item.quantityReceived;
    stockData.balance.totalAmount = stockData.balance.quantity * stockData.balance.pricePerUnit;

    await stockData.save();

    // Declare and use stockItem correctly
    const stockItem = await StockItem.findById(stockData.itemId);
    if (stockItem) {
      stockItem.quantity = stockData.balance.quantity;
      stockItem.pricePerUnit = stockData.balance.pricePerUnit;
      stockItem.totalAmount = stockData.balance.totalAmount;
      await stockItem.save();
    }

    const stockHistory = new StockHistory({
      itemId: stockData.itemId,
      entry: stockData.entry,
      exit: stockData.exit,
      balance: stockData.balance,
      updatedAt: Date.now()
    });
    await stockHistory.save();
  } else {
    console.error(`Stock data not found for item ID: ${item.itemId}`);
  }
}

    await request.save();
    res.json(request);
  } catch (error) {
    console.error('Error updating stock data:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;



// fetching item name
router.get('/api/getData', async (req, res) => {
  try {
    const data = await stockItem.find({});
    res.status(200).send(data);
  } catch (error) {
    console.error(error);  // Log the error
    res.status(500).send({ success: false, error: error.message });
  }
});




module.exports = router;
