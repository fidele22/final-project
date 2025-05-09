const express = require('express');
const jwt = require('jsonwebtoken'); 
const mongoose = require('mongoose');
const JWT_SECRET = 'your_jwt_secret';
const router = express.Router();
const FuelStock = require('../models/fuelStock');
const FuelStockHistory = require('../models/fuelStockHistory');
const FuelRequisition = require('../models/fuelRequisition');



const multer = require('multer');
const path = require('path');
//
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = process.env.UPLOAD_FILE || path.join(__dirname, 'files/');
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

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

router.post('/submit', authMiddleware, upload.single('file'), async (req, res) => {
  try {
    const { 
      requesterName, carPlaque, kilometers, remainingLiters, quantityRequested,RequestedDate,
      quantityReceived, fuelType, reasonOption, hodName, hodSignature 
    } = req.body;

    // Save the path of the uploaded file (HOD signature)
    const file = req.file ? req.file.path : '';

    // Fetch the previous requisition for the same car
    const previousRequisition = await FuelRequisition.findOne({ carPlaque })
      .sort({ createdAt: -1 });

    let average = 0;
    if (previousRequisition) {
      const previousKilometers = previousRequisition.kilometers;
      const previousRemainingLiters = previousRequisition.remainingLiters;
      const previousQuantityReceived = previousRequisition.quantityReceived;

      // Calculate the average fuel consumption
      const fuelUsed = previousRemainingLiters + previousQuantityReceived - remainingLiters;
      average = fuelUsed > 0 ? (kilometers - previousKilometers) / fuelUsed : 0;
    }

    const userId = req.userId; // Extracted from token

    // Create a new FuelRequisition document
    const newRequest = new FuelRequisition({
      userId,
      requesterName,
      carPlaque,
      kilometers,
      remainingLiters,
      quantityRequested,
      quantityReceived,
      RequestedDate,
      fuelType,
      reasonOption,
      hodName,
      hodSignature,
      file,
      average, // Include the calculated average
    });

    await newRequest.save();
    res.status(201).json(newRequest);
  } catch (error) {
    console.error('Error:', error); // Debugging
    res.status(400).json({ error: error.message });
  }
});


// GET route to fetch all fuel requisitions
router.get('/fuelstatus', async (req, res) => {
  try {
    const requisitions = await FuelRequisition.find();
    res.status(200).json(requisitions);
  } catch (error) {
    console.error('Error fetching requisitions:', error);
    res.status(500).json({ message: 'Server error' });
  }
});
// GET route to fetch all fuel requisitions with status 'Pending'
router.get('/pendingfuel', async (req, res) => {
  try {
    const requisitions = await FuelRequisition.find({ status: 'Pending' }); // Filter by status
    res.status(200).json(requisitions);
  } catch (error) {
    console.error('Error fetching requisitions:', error);
    res.status(500).json({ message: 'Server error' });
  }
});
// GET route to fetch all fuel requisitions with status verified'
router.get('/verifiedfuel', async (req, res) => {
  try {
    const requisitions = await FuelRequisition.find({ status: 'Verified' }); // Filter by status
    res.status(200).json(requisitions);
  } catch (error) {
    console.error('Error fetching requisitions:', error);
    res.status(500).json({ message: 'Server error' });
  }
});
// GET route to fetch all approved fuel requisitions 
router.get('/approvedfuel', async (req, res) => {
  try {
    const requisitions = await FuelRequisition.find({ status: 'Approved' }); // Filter by status
    res.status(200).json(requisitions);
  } catch (error) {
    console.error('Error fetching requisitions:', error);
    res.status(500).json({ message: 'Server error' });
  }
});
router.get('/userfuelstatus', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId; // Ensure userId is an ObjectId

    // Query by userId and status
    const pendingFuelRequest = await FuelRequisition.find({ userId: userId });

    if (!pendingFuelRequest || pendingFuelRequest.length === 0) {
      return res.status(404).json({ message: 'No pending fuel requesition found for you.' });
    }
   
    res.json(pendingFuelRequest);
  } catch (error) {
    console.error('Error fetching requests:', error);
    res.status(500).json({ message: error.message });
  }
}); 

// Route to fetch a single fuel requisition by ID
router.get('/:id', async (req, res) => {
  try {
    const requisition = await FuelRequisition.findById(req.params.id);
    if (!requisition) {
      return res.status(404).json({ message: 'Requisition not found' });
    }
    res.status(200).json(requisition);
  } catch (error) {
    console.error('Error fetching requisition:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Route to update and forward on another collection a fuel requisition by ID
router.put('/:id', async (req, res) => {
  try {
    const updatedRequisition = await FuelRequisition.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updatedRequisition) {
      return res.status(404).json({ message: 'Requisition not found' });
    }


    //await updatedRequisition.save();

    res.status(200).json(updatedRequisition);
  } catch (error) {
    console.error('Error updating requisition:', error);
    res.status(500).json({ message: 'Server error' });
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
    const request = await FuelRequisition.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Update the status and other relevant fields
    request.status = 'Verified'; // Set the status to Verified

    if (req.body.clicked !== undefined) {
      request.clicked = req.body.clicked; // Update clicked if provided
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

    res.json(request); // Return the updated request
  } catch (error) {
    console.error('Error verifying request:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /approve/:id
router.put('/approve/:id', async (req, res) => {
  try {
    const requestId = req.params.id;

    // Check if the provided ID is valid
    if (!mongoose.Types.ObjectId.isValid(requestId)) {
      return res.status(400).json({ message: 'Invalid ID' });
    }

    // Find the request by ID
    const request = await FuelRequisition.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Update the status and other relevant fields
    request.status = 'Approved'; // Set the status to Verified

    if (req.body.clicked !== undefined) {
      request.clicked = req.body.clicked; // Update clicked if provided
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

    res.json(request); // Return the updated request
  } catch (error) {
    console.error('Error verifying request:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT reject fuel requisition 
router.put('/reject-request/:id', async (req, res) => {
  try {
    const requestId = req.params.id;

    // Check if the provided ID is valid
    if (!mongoose.Types.ObjectId.isValid(requestId)) {
      return res.status(400).json({ message: 'Invalid ID' });
    }

    // Find the request by ID
    const request = await FuelRequisition.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Update the status and other relevant fields
    request.status = 'Rejected'; // Set the status to Verified

    if (req.body.clicked !== undefined) {
      request.clicked = req.body.clicked; // Update clicked if provided
    }

  
    // Save the updated request
    await request.save();

    res.json(request); // Return the updated request
  } catch (error) {
    console.error('Error verifying request:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


// PUT /receivefuel/:id
router.put('/receivefuel/:id', async (req, res) => {
  try {
    const requestId = req.params.id;

    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(requestId)) {
      return res.status(400).json({ message: 'Invalid ID' });
    }

    // Find the request
    const request = await FuelRequisition.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

      // ❌ Prevent duplicate processing
   if (request.status === 'Received') {
          return res.status(400).json({ message: 'This requisition has already been marked as received.' });
        }
    // Extract quantityReceived from the request itself
    const quantityReceived = request.quantityRequested; // Adjust this if the correct field is different


    // Update the status and other relevant fields
    request.status = 'Received';

    if (req.body.clicked !== undefined) {
      request.clicked = req.body.clicked; // Update clicked if provided
    }

    if (req.body.receivedBy) {
      request.receivedBy = {
        firstName: req.body.receivedBy.firstName,
        lastName: req.body.receivedBy.lastName,
        signature: req.body.receivedBy.signature,
      };
    }

    // Find the fuel stock
    const fuelStock = await FuelStock.findOne({ fuelType: request.fuelType });
    if (!fuelStock) {
      return res.status(404).json({ message: `Fuel stock not found for ${request.fuelType}` });
    }

   // Check stock availability and adjust if needed
   if (fuelStock.quantity < quantityReceived) {
    quantityReceived = 0; // Not enough stock, avoid negative
  }

    // Update stock levels
    fuelStock.quantity -= quantityReceived;
    fuelStock.totalAmount -= quantityReceived * fuelStock.pricePerUnit;
    await fuelStock.save();

    // Log stock update in history
    const fuelStockHistory = new FuelStockHistory({
      itemId: fuelStock._id,
      carplaque: request.carPlaque,
      exit: {
        quantity: quantityReceived,
        pricePerUnit: fuelStock.pricePerUnit,
        totalAmount: quantityReceived * fuelStock.pricePerUnit,
      },
      balance: {
        quantity: fuelStock.quantity,
        pricePerUnit: fuelStock.pricePerUnit,
        totalAmount: fuelStock.totalAmount,
      },
      updatedAt: Date.now(),
    });

    await fuelStockHistory.save();
    await request.save();

    res.json({ message: 'Requisition marked as received successfully', request });
  } catch (error) {
    console.error('Error receiving fuel requisition:', error);
    res.status(500).json({ message: 'Server error' });
  }
});



module.exports = router;
