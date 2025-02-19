// routes/department.js
const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
const FuelStock = require('../models/fuelStock'); 
const FuelStockHistory = require('../models/fuelStockHistory'); 
const LogisticFuelRequest = require('../models/logisticfuelrequest'); 

// fuel logistic requisition 

router.post('/fuel-order', async (req, res) => {
  try {
    const {
      supplierName,
      items,  // Now handling items
      date,
      hodName,
      hodSignature
    } = req.body;

    items.forEach(item => {
      item.totalPrice = item.quantityRequested * item.pricePerUnit;
    });
    
    const newRequisition = new LogisticFuelRequest({
      supplierName,
      items,  // Store items here
      date,
      hodName,
      hodSignature
    });

    console.log(req.body); // Logs incoming request data
    
    // Save to the database
    const savedRequisition = await newRequisition.save();

    res.status(201).json(savedRequisition);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error: Could not create requisition' });
  }
});


// Route to fetch all logistic requests
router.get('/', async (req, res) => {
    try {
      const fuellogisticrequests = await LogisticFuelRequest.find();
      res.json(fuellogisticrequests);
    } catch (err) {
      console.error('Error:', err);
      res.status(500).json({ message: 'Server Error' });
    }
  });
// Route to fetch verified fuel orders
router.get('/pending-fuel-order', async (req, res) => {
  try {
    const verifiedRequests = await LogisticFuelRequest.find({ status: 'Pending' });
    res.json(verifiedRequests);
  } catch (error) {
    console.error('Error fetching verified requests:', error);
    res.status(500).json({ message: 'Server error' });
  }
});
  
// Route to fetch verified fuel orders
router.get('/verified-fuel-order', async (req, res) => {
  try {
    const verifiedRequests = await LogisticFuelRequest.find({ status: 'Verified' });
    res.json(verifiedRequests);
  } catch (error) {
    console.error('Error fetching verified requests:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Route to fetch verified fuel orders
router.get('/approved-fuel-order', async (req, res) => {
  try {
    const verifiedRequests = await LogisticFuelRequest.find({ status: 'Approved' });
    res.json(verifiedRequests);
  } catch (error) {
    console.error('Error fetching verified requests:', error);
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
    
      const updatedRequest = await fuelOrder.findByIdAndUpdate(req.params.id, updateData, { new: true });
      if (!updatedRequest) {
        return res.status(404).json({ message: 'Request not found' });
      }
  
      
      res.json(updatedRequest);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
// Route to verify a request and update the existing document

router.post('/verified/:id', async (req, res) => {

  try {
    const requestId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(requestId)) {
      return res.status(400).json({ message: 'Invalid ID' });

    }
    const request = await LogisticFuelRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });

    }


    // Update the request with verified information

    request.verifiedBy = {

      firstName: req.body.verifiedBy.firstName,
      lastName: req.body.verifiedBy.lastName,
      signature: req.body.verifiedBy.signature,

    };

    request.status = 'Verified';

    // Save the updated request

    await request.save();


    res.json(request);
  } catch (error) {
    console.error('Error verifying request:', error);
    res.status(500).json({ message: 'Server error' });

  }

});


// Route to approve a verified request
router.post('/approve-fuel-order/:id', async (req, res) => {
  try {
    const requestId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(requestId)) {
      return res.status(400).json({ message: 'Invalid ID' });
    }

    const request = await LogisticFuelRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Update the request with approved information
    request.approvedBy = {
      firstName: req.body.approvedBy.firstName,
      lastName: req.body.approvedBy.lastName,
      signature: req.body.approvedBy.signature,
    };
    request.status = 'Approved'; // Change status to approved

    // Save the updated request
    await request.save();

    res.json(request);
  } catch (error) {
    console.error('Error approving request:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/recieved-fuel/:id', async (req, res) => {

  try {

    const requestId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(requestId)) {
      return res.status(400).json({ message: 'Invalid ID' });

    }


    const request = await LogisticFuelRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });

    }


    // Update the receivedBy and status

    request.receivedBy = {

      firstName: req.body.receivedBy.firstName,
      lastName: req.body.receivedBy.lastName,
      signature: req.body.receivedBy.signature,

    };

    request.status = 'Received'; // Change status to received


    // Update the fuel stock and log history

    for (const item of request.items) {
      const fuelStock = await FuelStock.findOne({ fuelType: item.desitination }); 
      if (fuelStock) {

        // Update the stock quantity

        const previousQuantity = fuelStock.quantity; 
        fuelStock.quantity += item.quantityRequested; 
        fuelStock.totalAmount += item.totalPrice; 

        await fuelStock.save(); // Save the updated stock


        // Log the stock update in FuelStockHistory

        const fuelStockHistory = new FuelStockHistory({

          itemId: fuelStock._id,
          carplaque: item.desitination, // Assuming 'destination' is linked to carPlaque
          entry: {

            quantity: item.quantityRequested,
            pricePerUnit: fuelStock.pricePerUnit,
            totalAmount: item.totalPrice,

          },

          balance: {

            quantity: fuelStock.quantity,
            pricePerUnit: fuelStock.pricePerUnit,
            totalAmount: fuelStock.totalAmount,

          },

          updatedAt: Date.now(),

        });
        // Save history record
        await fuelStockHistory.save();

      }

    }


    // Save the updated request

    await request.save();


    res.json(request);
  } catch (error) {
    console.error('Error approving request:', error);
    res.status(500).json({ message: 'Server error' });

  }

});

// Route to handle rejection of a logistic fuel request
// Route to mark  a fuel order as recieve
router.post('/rejectFuelOrder/:id', async (req, res) => {
  try {
    const requestId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(requestId)) {
      return res.status(400).json({ message: 'Invalid ID' });
    }

    const request = await LogisticFuelRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }
  
    request.status = 'Rejected'; // Change status to approved

    // Save the updated request
    await request.save();

    res.json(request);
  } catch (error) {
    console.error('Error approving request:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


 module.exports = router;