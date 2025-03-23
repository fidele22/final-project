const express = require('express');
const multer = require('multer');
const mongoose = require('mongoose');
const path = require('path');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken'); 
const JWT_SECRET = 'your_jwt_secret';// Ensure this is included
const UserRequest = require('../models/UserRequest');
const StockItem = require('../models/stockItems');
const StockData = require('../models/stockData');
const StockHistory = require('../models/stockHistory');
const User = require('../models/user');
const Department = require("../models/department"); // Adjust the path if needed

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


// Email transporter configuration
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false, // Use `true` for 465, `false` for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
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
// Route to get the count of user requests by status
router.get('/count', async (req, res) => {
  try {
    const counts = {
      pending: await UserRequest.countDocuments({ status: 'Pending' }),
      verified: await UserRequest.countDocuments({ status: 'Verified' }),
      approved: await UserRequest.countDocuments({ status: 'Approved' }),
      rejected: await UserRequest.countDocuments({ status: 'Rejected' }),
      received: await UserRequest.countDocuments({ status: 'Received' }),
    };
    res.json(counts);
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ message: 'Server Error' });
  }
});
router.get('/user-count',authMiddleware, async (req, res) => {
  const userId = req.userId;  // Assuming you have middleware that sets req.user based on the token

  try {
    const counts = {
      pending: await UserRequest.countDocuments({ userId: userId, status: 'Pending' }),
      verified: await UserRequest.countDocuments({ userId: userId, status: 'Verified' }),
      approved: await UserRequest.countDocuments({ userId: userId, status: 'Approved' }),
      rejected: await UserRequest.countDocuments({ userId: userId, status: 'Rejected' }),
      received: await UserRequest.countDocuments({ userId: userId, status: 'Received' }),
    };
    res.json(counts);
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ message: 'Server Error' });
  }
});
// Route to get monthly requisition counts by department and status
router.get('/monthly-count/:month/:year', async (req, res) => {
  const { month, year } = req.params;

  try {
    const results = await UserRequest.aggregate([
      {
        $match: {
          $expr: {
            $and: [
              { $eq: [{ $month: "$createdAt" }, parseInt(month)] },
              { $eq: [{ $year: "$createdAt" }, parseInt(year)] }
            ]
          }
        }
      },
      {
        $group: {
          _id: { department: "$department", status: "$status" },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: "$_id.department",
          statuses: {
            $push: {
              status: "$_id.status",
              count: "$count"
            }
          }
        }
      },
      {
        $project: {
          _id: 0,
          department: "$_id",
          statuses: 1
        }
      }
    ]);

    // Transform the data to fit the frontend chart format
    const formattedResults = results.map(dept => {
      let formattedDept = { department: dept.department };
      dept.statuses.forEach(statusObj => {
        formattedDept[statusObj.status] = statusObj.count;
      });
      return formattedDept;
    });

    res.json(formattedResults);
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

// router to verify user requisition
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

    // Fetch the user who created the request to get their email
    const user = await User.findById(request.userId);
    if (!user || !user.email) {
      return res.status(404).json({ message: 'User not found or no email available' });
    }
// Generate item list from the array
const itemDetails = request.items.map(item => `
  <li><strong>${item.itemName}</strong> - Quantity: ${item.quantityReceived}</li>
`).join('');

// Format the requisition date
const formattedDate = new Date(request.date).toLocaleDateString('en-GB'); // Format: DD/MM/YYYY

// Email content
const mailOptions = {
  from: process.env.EMAIL_USER,
  to: user.email,
  subject: 'Requisition Verified',
  html: `
    <h3>Hello  ${user.lastName},</h3>
    <p>This is an automatic notification confirming that Your requisition request done on :<strong> ${formattedDate}</strong> has been <strong>verified</strong>.</p>
    <p><b>Status:</b> ${request.status}</p>
    <p><b>Requisition Date:</b> ${formattedDate}</p>
    <p><b>Requested Items:</b></p>
    <ul>${itemDetails}</ul>
    <p><b>Verified by:</b> ${request.verifiedBy.firstName} ${request.verifiedBy.lastName}</p>
    <p>Thank you for using our system!</p>
  `
};

    // Send the email
    await transporter.sendMail(mailOptions);

    // Send only ONE response
    res.json({ message: 'Request verified and email notification sent!', request });

  } catch (error) {
    console.error('Error verifying request:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


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

    // Fetch the user who created the request to get their email
    const user = await User.findById(request.userId);
    if (!user || !user.email) {
      return res.status(404).json({ message: 'User not found or no email available' });
    }
// Generate item list from the array
const itemDetails = request.items.map(item => `
  <li><strong>${item.itemName}</strong> - Quantity: ${item.quantityReceived}</li>
`).join('');

// Format the requisition date
const formattedDate = new Date(request.date).toLocaleDateString('en-GB'); // Format: DD/MM/YYYY

// Email content
const mailOptions = {
  from: process.env.EMAIL_USER,
  to: user.email,
  subject: 'Requisition Approved',
  html: `
    <h3>Hello  ${user.lastName},</h3>
    <p>This is an automatic notification confirming that Your requisition request done on :<strong> ${formattedDate}</strong> has been <strong>Approved</strong>.</p>
    <p><b>Status:</b> ${request.status}</p>
    <p><b>Requisition Date:</b> ${formattedDate}</p>
    <p><b>Requested Items:</b></p>
    <ul>${itemDetails}</ul>
    <p><b>Approved by:</b> ${request.approvedBy.firstName} ${request.approvedBy.lastName}</p>
    <p>Thank you for using our system!</p>
  `
};

    // Send the email
    await transporter.sendMail(mailOptions);

    // Send only ONE response
    res.json({ message: 'Request approved and email notification sent!', request });

  } catch (error) {
    console.error('Error verifying request:', error);
    res.status(500).json({ message: 'Server error' });
  }
})
router.put('/reject-request/:id', async (req, res) => {
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
    request.status = 'Rejected';

    if (req.body.clicked !== undefined) {
      request.clicked = req.body.clicked;
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

router.get("/department-status/:departmentId/:month/:year", async (req, res) => {
  const { departmentId, month, year } = req.params;

  try {
    const department = await Department.findById(departmentId);
    if (!department) {
      return res.status(404).json({ message: "Department not found" });
    }

    const departmentName = department.name; // Get the department name

    // Create date range for the specified month and year
    const startDate = new Date(year, month - 1, 1); // Start of the month
    const endDate = new Date(year, month, 1); // Start of the next month

    const results = await UserRequest.aggregate([
      {
        $match: {
          department: departmentName,
          createdAt: { $gte: startDate, $lt: endDate },
        },
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          status: "$_id",
          count: 1,
        },
      },
    ]);

    // Ensure all statuses are present
    const statuses = ["Pending", "Verified", "Approved", "Received", "Rejected"];
    const statusCounts = statuses.map((status) => {
      const found = results.find((result) => result.status === status);
      return { status, count: found ? found.count : 0 };
    });

    res.json(statusCounts);
  } catch (err) {
    console.error("Error fetching department status:", err);
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;
