const express = require('express');
const mongoose = require('mongoose');
const { isValidObjectId } = mongoose;
const router = express.Router();
const StockData = require('../models/stockData');
const StockItem =require('../models/stockItems')
const StockHistory = require('../models/stockHistory');
const ApprovedRequest = require('../models/approvedRequest');

// POST request to add a new stock item
router.post('/add', async (req, res) => {
  const { name, quantity, pricePerUnit } = req.body;
  let totalAmount = quantity * pricePerUnit;

  try {
    const newItem = new StockItem({
      name,
      quantity,
      pricePerUnit,
      totalAmount,
    });

    await newItem.save();

    // Create corresponding stock data for the new item
    const stockData = new StockData({
      itemId: newItem._id,
      entry: {
        quantity: newItem.quantity,
        pricePerUnit: newItem.pricePerUnit,
        totalAmount: newItem.totalAmount
      },
      exit: {
        quantity: 0,
        pricePerUnit: 0,
        totalAmount: 0
      },
      balance: {
        quantity: newItem.quantity,
        pricePerUnit: newItem.pricePerUnit,
        totalAmount: newItem.totalAmount
      }
    });

    await stockData.save(); // Save the stock data

    // Create corresponding initial stock history for the new item
    const stockHistory = new StockHistory({
      itemId: newItem._id,
      entry: {
        quantity: newItem.quantity,
        pricePerUnit: newItem.pricePerUnit,
        totalAmount: newItem.totalAmount
      },
      exit: {
        quantity: 0,
        pricePerUnit: 0,
        totalAmount: 0
      },
      balance: {
        quantity: newItem.quantity,
        pricePerUnit: newItem.pricePerUnit,
        totalAmount: newItem.totalAmount
      }
    });

    await stockHistory.save(); // Save the stock history

    res.status(200).send({ success: true });
  } catch (error) {
    console.error(error); // Log the error
    res.status(500).send({ success: false, error: error.message });
  }
});

// Route to update an existing item

router.put('/update/:id', async (req, res) => {
  const { id } = req.params; // Get the item ID from the URL
  const { name, quantity, pricePerUnit } = req.body; // Get the updated data from the request body
  let totalAmount = quantity * pricePerUnit; // Calculate the new total amount

  try {
    const updatedItem = await StockItem.findByIdAndUpdate(
      id,
      { name, quantity, pricePerUnit, totalAmount },
      { new: true } // Return the updated document
    );

    if (!updatedItem) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Create a new StockHistory record
    const stockHistory = new StockHistory({
      itemId: updatedItem._id,
      entry: {
        quantity: updatedItem.quantity,
        totalAmount: updatedItem.totalAmount,
        pricePerUnit: updatedItem.pricePerUnit
      },
      exit: {
        quantity: 0,
        totalAmount: 0,
        pricePerUnit: updatedItem.pricePerUnit // Ensure pricePerUnit is the same
      },
      balance: {
        quantity: updatedItem.quantity,
        totalAmount: updatedItem.totalAmount,
        pricePerUnit: updatedItem.pricePerUnit // Ensure pricePerUnit is the same
      },
      updatedAt: Date.now()
    });

    await stockHistory.save(); // Save the stock history record

    res.status(200).json(updatedItem); // Respond with the updated item
  } catch (error) {
    console.error('Error updating item:', error);
    res.status(500).json({ message: 'Error updating item' });
  }
});

// DELETE /api/stocks/:id - Delete stock item and related stock data and stock histories
router.delete('/:id', async (req, res) => {
  try {
    const stock = await StockItem.findOneAndDelete({ _id: req.params.id });
    if (!stock) {
      return res.status(404).json({ message: 'Stock item not found' });
    }
    res.json({ message: 'Stock item and related data deleted successfully' });
  } catch (error) {
    console.error('Error deleting stock item:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


//// GET request to fetch all stock items
router.get('/', async (req, res) => {
  try {
    const items = await StockItem.find();
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Fetch all stock entries with item names
router.get('/', async (req, res) => {
try {
const stocks = await StockData.find().populate('itemId', 'name');
res.json(stocks);
} catch (error) {
res.status(500).json({ message: 'Error fetching stocks', error });
}
});


// Update stock entry
router.put('/:id', async (req, res) => {
const { id } = req.params;
const { entry, exit } = req.body;

try {
const stock = await StockData.findById(id);
if (!stock) {
return res.status(404).send('Stock entry not found');
}

// Update the stock entry and balance
     if (entry) {

     stock.entry = {
     quantity: entry.quantity || O,
     pricePerUnit: entry.pricePerUnit || stock.entry.pricePerUnit,
     totalAmount: entry.quantity * (entry.pricePerUnit || stock.entry.pricePerUnit)
     };
     //make exit quantity and amount equal to zero while enrty updated
     stock.exit.quantity = 0;
     stock.exit.totalAmount = 0;

     stock.balance.quantity +=  stock.entry.quantity;
     stock.balance.totalAmount += stock.entry.totalAmount;
     stock.balance.pricePerUnit = stock.entry.pricePerUnit; // Update price per unit based on the last entry
     }
  

await stock.save();
   // Update the corresponding StockItems
   const stockItem = await StockItem.findById(stock.itemId); // Assuming `itemId` is used to reference `StockItem`
   if (stockItem) {
     stockItem.quantity = stock.balance.quantity;
     stockItem.pricePerUnit = stock.balance.pricePerUnit;
     stockItem.totalAmount = stock.balance.totalAmount;
     await stockItem.save();
   }
// Log the update to the StockHistory collection
const stockHistory = new StockHistory({
itemId: stock.itemId,
entry: stock.entry,
exit: stock.exit,
balance: stock.balance,
updatedAt: Date.now() // Set the updated date
});
await stockHistory.save();

res.json(stock);
} catch (error) {
res.status(500).send('Error updating stock: ' + error.message);
}
});

// Fetch stock entries for an item
router.get('/:itemId', async (req, res) => {
const { itemId } = req.params;

// Check if itemId is a valid ObjectId
if (!isValidObjectId(itemId)) {
  return res.status(400).send('Invalid itemId');
  }
  
  console.log(`Fetching stock entries for itemId: ${itemId}`); // Log itemId
  
  try {
  const stockEntries = await StockData.find({ itemId }).populate('itemId');
  console.log(`Stock entries found: ${stockEntries.length}`); // Log number of stock entries found
  res.status(200).json(stockEntries);
  } 
  
  catch (error) {
  console.error('Error fetching stock entries:', error);
  res.status(400).json({ message: 'Error fetching stock entries', error });
}
});



// Fetch stock history for an item with date range
router.get('/history/:itemId', async (req, res) => {
const { itemId } = req.params;
const { startDate, endDate } = req.query;

try {
const query = { itemId };

if (startDate && endDate) {
query.updatedAt = {
$gte: new Date(startDate),
$lte: new Date(endDate)
};
}

const stockHistory = await StockHistory.find(query).populate('itemId');
res.status(200).json(stockHistory);
} catch (error) {
res.status(400).json({ message: 'Error fetching stock history', error });
}
});

// Example backend endpoint
router.get('/history/latestBefore/:itemId/:date', async (req, res) => {
  const { itemId, date } = req.params;
  try {
    const latestStock = await StockHistory.findOne({
      itemId,
      updatedAt: { $lt: new Date(date) }
    })
    .sort({ updatedAt: -1 })
    .populate('itemId', 'name');

    res.json(latestStock);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching latest stock before date', error });
  }
});


// Fetch stock history for a specific month, stock report
router.get('/history/:year/:month', async (req, res) => {
  const { year, month } = req.params;
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 1);
  
    try {
    const stockHistory = await StockHistory.find({
    updatedAt: {
    $gte: startDate,
    $lt: endDate
    }
  }).populate('itemId', 'name');
  res.json(stockHistory);
  } catch (error) {
  res.status(500).json({ message: 'Error fetching stock history', error });
  }
  });

  
  //updating itecm records this is admin right
  
router.put('/history/update/:entryId', async (req, res) => {
  const { entryId } = req.params;
  const updatedData = req.body;

  try {
    const targetEntry = await StockHistory.findById(entryId);
    if (!targetEntry) return res.status(404).json({ message: 'Entry not found' });

    const consistentPricePerUnit = Number(updatedData.entry?.pricePerUnit) || targetEntry.entry.pricePerUnit;

    // Update the selected (target) entry with the new price
    targetEntry.entry.quantity = updatedData.entry.quantity;
    targetEntry.entry.pricePerUnit = consistentPricePerUnit;
    targetEntry.entry.totalAmount = targetEntry.entry.quantity * consistentPricePerUnit;

    targetEntry.exit.quantity = updatedData.exit.quantity;
    targetEntry.exit.pricePerUnit = consistentPricePerUnit;
    targetEntry.exit.totalAmount = targetEntry.exit.quantity * consistentPricePerUnit;

    await targetEntry.save();

    // Fetch all entries of the item sorted by creation or update time
    const allEntries = await StockHistory.find({ itemId: targetEntry.itemId }).sort({ updatedAt: 1 });

    let balance = { quantity: 0, totalAmount: 0 };

    for (let i = 0; i < allEntries.length; i++) {
      const current = allEntries[i];

      // Use consistentPricePerUnit only for the edited entry and those after it
      const useNewPrice = current._id.equals(targetEntry._id) || allEntries[i].updatedAt > targetEntry.updatedAt;
      const pricePerUnitToUse = useNewPrice ? consistentPricePerUnit : current.entry.pricePerUnit;

      if (useNewPrice) {
        current.entry.pricePerUnit = pricePerUnitToUse;
        current.entry.totalAmount = current.entry.quantity * pricePerUnitToUse;

        current.exit.pricePerUnit = pricePerUnitToUse;
        current.exit.totalAmount = current.exit.quantity * pricePerUnitToUse;
      }

      if (i === 0) {
        balance.quantity = current.entry.quantity - current.exit.quantity;
        balance.totalAmount = current.entry.totalAmount - current.exit.totalAmount;
      } else {
        const prev = allEntries[i - 1];
        balance.quantity = prev.balance.quantity + current.entry.quantity - current.exit.quantity;
        balance.totalAmount = prev.balance.totalAmount + current.entry.totalAmount - current.exit.totalAmount;
      }

      current.balance.quantity = balance.quantity;
      current.balance.totalAmount = balance.totalAmount;
      current.balance.pricePerUnit = current.entry.pricePerUnit;

      await current.save();
    }
    // Get the latest stock history for this item (most recent update)
       const latestHistory = await StockHistory.findOne({ itemId: targetEntry.itemId })
         .sort({ updatedAt: -1 }); // Or use { _id: -1 } as a fallback
       
       if (latestHistory && latestHistory.balance) {
         await StockItem.findByIdAndUpdate(targetEntry.itemId, {
           quantity: latestHistory.balance.quantity,
           pricePerUnit: latestHistory.balance.pricePerUnit,
           totalAmount: latestHistory.balance.totalAmount
         });
       }
       

    const updatedHistory = await StockHistory.find({ itemId: targetEntry.itemId }).sort({ updatedAt: 1 });
    res.status(200).json({ message: 'Updated successfully from this point onward', updatedHistory });

  } catch (err) {
    res.status(500).json({ message: 'Error updating entry', error: err });
  }
});




  // Fetch all stock items
router.get('/allItems', async (req, res) => {
  try {
    const allItems = await Stock.find(); // Assuming Stock is your model for items
    res.status(200).json(allItems);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching all items', error });
  }
});

module.exports = router;

