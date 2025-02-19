const express = require('express');
const multer = require('multer');
const mongoose = require('mongoose');
const router = express.Router();
const upload = multer({ dest: 'uploads/' });
const Item = require('../models/stockItems');
const LogisticItemRequest = require('../models/requestOfLogistic');
const StockData = require('../models/stockData'); // Adjust the path to your StockData model
const StockItem = require('../models/stockItems'); // Adjust the path to your StockItems model
const StockHistory = require('../models/stockHistory');


// fetching item name
router.get('/api/getData', async (req, res) => {
  try {
    const data = await Item.find({});
    res.status(200).send(data);
  } catch (error) {
    console.error(error);  // Log the error
    res.status(500).send({ success: false, error: error.message });
  }
});

// Apply the multer middleware to handle form data
router.post('/submit', upload.none(), async (req, res) => {
  try {
    console.log('Request Body:', req.body); // Log the request body

    const { supplierName,logisticName,  logisticSignature,items, date } = req.body;

    // Ensure items is defined and a valid JSON string
    if (!items) {
      throw new Error('Items field is missing.');
    }

    // Validate items
    const parsedItems = JSON.parse(items); // Assuming items is a JSON string

    console.log('Parsed Items:', parsedItems); // Log parsed items

    const validItems = await Promise.all(parsedItems.map(async item => {
      if (!item.itemId) {
        throw new Error('Item ID is required for each item.');
      }

      // Ensure itemId is valid
      const validItem = await Item.findById(item.itemId);
      if (!validItem) {
        throw new Error('Invalid Item ID.');
      }

      return {
        itemId: item.itemId,
        itemName: item.itemName,
        quantityRequested: item.quantityRequested,
        price: item.price,
        totalAmount: item.totalAmount
      };
    }));

    // Create userRequest
    const newRequest = new LogisticItemRequest({
      supplierName,
      items: validItems,
      date,
      logisticName,
      logisticSignature,
    });

    await newRequest.save();
    res.status(201).json({ message: 'Requisition created successfully!' });

  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
});

// Route to fetch all logistic requests
router.get('/', async (req, res) => {
  try {
    const logisticrequests = await LogisticItemRequest.find();
    res.json(logisticrequests);
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ message: 'Server Error' });
  }
});

//fetching all pending item logistic request
router.get('/pending-item-order', async (req, res) => {
  try {
    const pendingRequests = await LogisticItemRequest.find({ status: 'Pending' });
    res.json(pendingRequests);
  } catch (error) {
    console.error('Error fetching verified requests:', error);
    res.status(500).json({ message: 'Server error' });
  }
});
//fetching all pending item logistic request
router.get('/verified-item-order', async (req, res) => {
  try {
    const pendingRequests = await LogisticItemRequest.find({ status: 'Verified' });
    res.json(pendingRequests);
  } catch (error) {
    console.error('Error fetching verified requests:', error);
    res.status(500).json({ message: 'Server error' });
  }
});
  

//fetching all approved item logistic request
router.get('/approved-item-order', async (req, res) => {
  try {
    const pendingRequests = await LogisticItemRequest.find({ status: 'Approved' });
    res.json(pendingRequests);
  } catch (error) {
    console.error('Error fetching verified requests:', error);
    res.status(500).json({ message: 'Server error' });
  }
});
  

router.post('/verifiedItemOrder/:id', async (req, res) => {

  try {
    const requestId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(requestId)) {
      return res.status(400).json({ message: 'Invalid ID' });

    }
    const request = await LogisticItemRequest.findById(requestId);
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

router.post('/approvedItemOrder/:id', async (req, res) => {

  try {
    const requestId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(requestId)) {
      return res.status(400).json({ message: 'Invalid ID' });

    }
    const request = await LogisticItemRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });

    }


    // Update the request with verified information

    request.approvedBy = {

      firstName: req.body.approvedBy.firstName,
      lastName: req.body.approvedBy.lastName,
      signature: req.body.approvedBy.signature,

    };

    request.status = 'Approved';

    // Save the updated request

    await request.save();


    res.json(request);
  } catch (error) {
    console.error('Error verifying request:', error);
    res.status(500).json({ message: 'Server error' });

  }

});
router.post('/receivedItemOrder/:id', async (req, res) => {

  try {

    const requestId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(requestId)) {

      return res.status(400).json({ message: 'Invalid ID' });

    }


    const request = await LogisticItemRequest.findById(requestId);

    if (!request) {

      return res.status(404).json({ message: 'Request not found' });

    }


    // Update the request with verified information

    request.receivedBy = {

      firstName: req.body.receivedBy.firstName,

      lastName: req.body.receivedBy.lastName,

      signature: req.body.receivedBy.signature,

    };

    request.status = 'Received';


    // Update stock data based on received items

    for (const item of request.items) {

      const stockData = await StockData.findOne({ itemId: item.itemId });


      if (stockData) {

        // Calculate the total amount for the incoming entry

        const incomingTotalAmount = item.quantityRequested * item.price;


        // Update entry quantity and total amount

        stockData.entry.quantity = item.quantityRequested;

        stockData.entry.pricePerUnit = item.price;

        stockData.entry.totalAmount = incomingTotalAmount;


        // Update balance quantity and total amount

        stockData.balance.quantity += item.quantityRequested;

        stockData.balance.pricePerUnit = stockData.entry.pricePerUnit;


        // Increment the balance total amount by adding the incoming total amount

        stockData.balance.totalAmount += incomingTotalAmount;


        // Save the updated stock data

        await stockData.save();


        // Update the corresponding StockItems

        const stockItem = await StockItem.findById(stockData.itemId);

        if (stockItem) {

          stockItem.quantity = stockData.balance.quantity;

          stockItem.pricePerUnit = stockData.balance.pricePerUnit;

          stockItem.totalAmount = stockData.balance.totalAmount;

          await stockItem.save();

        }


        // Log the update to the StockHistory collection

        const stockHistory = new StockHistory({

          itemId: stockData.itemId,

          entry: stockData.entry,

          exit: stockData.exit,

          balance: stockData.balance,

          updatedAt: Date.now(), // Set the updated date

        });

        await stockHistory.save();

      } else {

        console.error(`Stock data not found for item ID: ${item.itemId}`);

      }

    }


    // Save the updated request

    await request.save();


    res.json(request);

  } catch (error) {

    console.error('Error verifying request:', error);

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

    const updatedRequest = await LogisticRequest.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!updatedRequest) {
      return res.status(404).json({ message: 'Request not found' });
    }

    
    res.json(updatedRequest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.put('/update-verified/:id', async (req, res) => {
  try {
    const updateData = { ...req.body };
    
    // Ensure clicked field is updated
    if (req.body.clicked !== undefined) {
      updateData.clicked = req.body.clicked;
    }

    const updatedRequest = await VerifiedLogisticRequest.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!updatedRequest) {
      return res.status(404).json({ message: 'Request not found' });
    }

    
    res.json(updatedRequest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


router.post('/repair', async (req, res) => {
  try {
    const {
      department,
      items,  // Now handling items
      date,
      hodName,
      hodSignature
    } = req.body;

    items.forEach(item => {
      item.totalPrice = item.quantityRequested * item.pricePerUnit;
    });
    
    const newRequisition = new RepairRequisition({
      department,
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


module.exports = router;



