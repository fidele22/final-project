const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Car = require('../models/carPlaque');
const FuelRequisitionReceived = require('../models/fuelRequisition');
const FuelStock = require('../models/fuelStock');
const FuelStockHistory =require ('../models/fuelStockHistory');

const CarData =require('../models/carData');

// Create a new fuel stock entry
router.post('/add-fuel', async (req, res) => {
    try {
      const { fuelType, quantity, pricePerUnit } = req.body;
      const totalAmount = quantity * pricePerUnit;
  
      const fuelStock = new FuelStock({
        fuelType,
        quantity,
        pricePerUnit,
        totalAmount,
      });
  
      await fuelStock.save();
      res.status(201).json(fuelStock);
    } catch (error) {
      res.status(500).json({ error: 'Error creating fuel stock entry' });
    }
  });
  
  // Read all fuel stock entries
  router.get('/', async (req, res) => {
    try {
      const fuelStocks = await FuelStock.find();
      res.status(200).json(fuelStocks);
    } catch (error) {
      res.status(500).json({ error: 'Error fetching fuel stock entries' });
    }
  });
  
  // Update a fuel stock entry
  router.put('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { fuelType, quantity, pricePerUnit } = req.body;
      const totalAmount = quantity * pricePerUnit;
  
      const updatedFuelStock = await FuelStock.findByIdAndUpdate(
        id,
        { fuelType, quantity, pricePerUnit, totalAmount },
        { new: true }
      );
  
      res.status(200).json(updatedFuelStock);
    } catch (error) {
      res.status(500).json({ error: 'Error updating fuel stock entry' });
    }
  });
  
  // Delete a fuel stock entry
  router.delete('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      await FuelStock.findByIdAndDelete(id);
      res.status(200).json({ message: 'Fuel stock entry deleted' });
    } catch (error) {
      res.status(500).json({ error: 'Error deleting fuel stock entry' });
    }
  });
router.get('/fuel-history', async (req, res) => {
  try {
    const { page = 1, limit = 10, startDate, endDate, fetchAll } = req.query;

    const query = {};

    // Filter by start and end date (requestedDate)
    if (startDate && endDate) {
      query.updatedAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const sortOrder = { updatedAt: 1 };

    if (fetchAll === 'true') {
      // return all records with filters if any
      const history = await FuelStockHistory.find(query).sort(sortOrder);
      return res.json({ history });
    }

    const total = await FuelStockHistory.countDocuments(query);

    const history = await FuelStockHistory.find(query)
      .sort(sortOrder)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    return res.json({ history, total });

  } catch (err) {
    console.error('Error fetching fuel history:', err);
    res.status(500).json({ error: 'Failed to fetch fuel history' });
  }
});

router.put('/updated-fuel-history/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { entry, exit } = req.body;

    // Find current record
    const currentRecord = await FuelStockHistory.findById(id);
    if (!currentRecord) return res.status(404).json({ error: 'Record not found' });

    // Update entry and exit fields if provided
    if (entry) {
      currentRecord.entry.quantity = entry.quantity ?? currentRecord.entry.quantity;
      currentRecord.entry.pricePerUnit = entry.pricePerUnit ?? currentRecord.entry.pricePerUnit;

      // Recalculate entry.totalAmount
      const entryQty = Number(currentRecord.entry.quantity) || 0;
      const entryPrice = Number(currentRecord.entry.pricePerUnit) || 0;
      currentRecord.entry.totalAmount = entryQty * entryPrice;
    }
    if (exit) {
      currentRecord.exit.quantity = exit.quantity ?? currentRecord.exit.quantity;
      currentRecord.exit.pricePerUnit = exit.pricePerUnit ?? currentRecord.exit.pricePerUnit;

      // Recalculate exit.totalAmount
      const exitQty = Number(currentRecord.exit.quantity) || 0;
      const exitPrice = Number(currentRecord.exit.pricePerUnit) || 0;
      currentRecord.exit.totalAmount = exitQty * exitPrice;
    }

    // Find previous record for balance reference
    const previousRecord = await FuelStockHistory.findOne({
      updatedAt: { $lt: currentRecord.updatedAt }
    }).sort({ updatedAt: -1 });

    let previousBalance = previousRecord
      ? previousRecord.balance
      : { quantity: 0, pricePerUnit: 0, totalAmount: 0 };

    // Recalculate balance quantity
    const newQuantity = previousBalance.quantity +
      (currentRecord.entry.quantity || 0) -
      (currentRecord.exit.quantity || 0);

    // Use entry pricePerUnit if available; else fallback to previous balance pricePerUnit
    const pricePerUnit = currentRecord.entry.pricePerUnit || previousBalance.pricePerUnit;
    const totalAmount = newQuantity * pricePerUnit;

    currentRecord.balance = {
      quantity: newQuantity,
      pricePerUnit,
      totalAmount
    };

    await currentRecord.save();

    // Recalculate all future records
    let nextBalance = { ...currentRecord.balance };

    const futureRecords = await FuelStockHistory.find({
      updatedAt: { $gt: currentRecord.updatedAt },
    }).sort({ updatedAt: 1 });

    for (let record of futureRecords) {
      // Recalculate entry totalAmount for each future record if needed
      record.entry.totalAmount = (Number(record.entry.quantity) || 0) * (Number(record.entry.pricePerUnit) || 0);
      // Recalculate exit totalAmount for each future record if needed
      record.exit.totalAmount = (Number(record.exit.quantity) || 0) * (Number(record.exit.pricePerUnit) || 0);

      // Recalculate balance for future records
      const quantity = nextBalance.quantity +
        (record.entry.quantity || 0) -
        (record.exit.quantity || 0);

      const price = record.entry.pricePerUnit || nextBalance.pricePerUnit;
      const total = quantity * price;

      record.balance = {
        quantity,
        pricePerUnit: price,
        totalAmount: total
      };

      nextBalance = { ...record.balance };
      await record.save();
    }

// Sync main fuel stock with latest balance
const latestRecord = await FuelStockHistory.findOne().sort({ updatedAt: -1 });

if (latestRecord) {
  const updatedStock = await FuelStock.findOneAndUpdate(
    { fuelType: "Fuel" }, // strictly match existing record
    {
      quantity: latestRecord.balance.quantity,
      pricePerUnit: latestRecord.balance.pricePerUnit,
      totalAmount: latestRecord.balance.totalAmount,
      date: new Date(),
    },
    { new: true } // return updated doc
  );

  if (!updatedStock) {
    console.log("FuelStock record not found for fuelType 'Fuel'");
  }
}


    res.json({ message: 'Fuel record and balances updated' });
  } catch (err) {
    console.error('Error updating fuel history:', err);
    res.status(500).json({ error: 'Failed to update fuel history' });
  }
});



// Route to fetch stock report based on carPlaque and date range
router.get('/stock-report', async (req, res) => {
  const { carPlaque, startDate, endDate } = req.query;

  try {
    // Find the car based on carPlaque
    const car = await Car.findOne({ registerNumber: carPlaque });

    if (!car) {
      return res.status(404).json({ message: 'Car not found' });
    }

    // Find all fuel requisitions for the carPlaque within the date range
    const requisitions = await FuelRequisitionReceived.find({
      carPlaque: carPlaque,
      createdAt: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    });

    // Calculate total fuel consumed
    const totalFuelConsumed = requisitions.reduce((total, req) => total + req.quantityReceived, 0);
    const totalAverageCovered = requisitions.reduce((total, req) => total + req.average, 0);
    // Prepare report data
    const reportData = requisitions.map((req, index) => ({
      index: index + 1,
      registerNumber: car.registerNumber,
      modeOfVehicle: car.modeOfVehicle,
      dateOfReception: car.dateOfReception,
      destination: req.destination,
      litreConsumed: req.quantityReceived,
      averageCovered: req.average,
    }));

    return res.json({
      carInfo: {
        registerNumber: car.registerNumber,
        modeOfVehicle: car.modeOfVehicle,
        dateOfReception: car.dateOfReception
      },
      totalFuelConsumed,
      totalAverageCovered,
      reportData
    });
  } catch (error) {
    console.error('Error fetching stock report:', error);
    res.status(500).json({ message: 'Error fetching stock report' });
  }
});


// Endpoint to get car plaques and their data based on month and year
router.get('/fuelFull-Report', async (req, res) => {
  const { month, year } = req.query;

  // Determine start and end dates based on month and year
  let start, end;
  if (month && year) {
      start = new Date(year, month - 1, 1); // First day of the month
      end = new Date(year, month, 0, 23, 59, 59, 999); // Last day of the month
  } else {
      return res.status(400).json({ message: 'Month and year must be provided.' });
  }

  try {
    const fuelReportRequisitions = await FuelRequisitionReceived.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(start),
            $lte: new Date(end),
          },
        },
      },
      {
        $group: {
          _id: "$carPlaque",
          totalQuantity: { $sum: "$quantityReceived" },
          totalAverageSum: { $sum: { $toDouble: "$average" } },
          requisitions: { $push: "$$ROOT" }
        }
      },
      {
        $lookup: {
          from: "cars", // name of the car collection
          localField: "_id", // the register number from requisition
          foreignField: "registerNumber", // the matching field in cars
          as: "carInfo"
        },
      },
      {
        $unwind: "$carInfo"
      },
      {
        $lookup: {
          from: "cardatas", // Lookup from the CarData collection
          localField: "_id",
          foreignField: "registerNumber",
          as: "carDataInfo"
        }
      },
      {
        $unwind: {
          path: "$carDataInfo",
          preserveNullAndEmptyArrays: true // This allows for cases where there may not be car data
        }
      },
      {
        $project: {
          _id: 0,
          registerNumber: "$_id",
          modeOfVehicle: "$carInfo.modeOfVehicle",
          dateOfReception: "$carInfo.dateOfReception",
          depart: "$carInfo.depart",
          destination: "$carInfo.destination",
          totalFuelConsumed: "$totalQuantity",
         // distanceCovered: "$totalAverageSum",
          kilometersCovered: "$carDataInfo.kilometersCovered", // Current month's kilometers covered
          remainingLiters: "$carDataInfo.remainingLiters",
          mileageAtEnd: "$carDataInfo.kilometersCovered", // Mileage at end of the current month
        }
      }
    ]);
    
      // Fetch previous month's mileage at end from CarData
      const previousMonth = month === 1 ? 12 : month - 1; // Decrement month or wrap to December
      const previousYear = month === 1 ? year - 1 : year; // Decrement year if January

      // Fetch previous month's data to get mileage at end
      const previousMonthStart = new Date(previousYear, previousMonth - 1, 1);
      const previousMonthEnd = new Date(previousYear, previousMonth, 0, 23, 59, 59, 999);

      const previousMonthKilometers = await FuelRequisitionReceived.aggregate([
          {
              $match: {
                 
          status: 'Received',
          RequestedDate:{ $gte: previousMonthStart, $lte: previousMonthEnd }
              }
          },
          {
              $group: {
                  _id: "$carPlaque",
                  kilometersCovered: { $last: "$kilometersCovered" } // Assuming this field exists in your documents
              }
            }
          ]);

      // Map previous month's mileage at end
      const previousMileageMap = previousMonthKilometers.reduce((acc, data) => {
          acc[data._id] = data.kilometersCovered;
          return acc;
      }, {});

      // Assign mileage at beginning for the current month
      fuelReportRequisitions.forEach(data => {
          data.mileageAtBeginning = previousMileageMap[data.registerNumber] || 0; // Use previous month's end mileage or 0
          data.mileageAtEnd = data.kilometersCovered; // Current month's mileage at end
          data.distanceCovered = data.mileageAtEnd - data.mileageAtBeginning;
          // Calculate fuel consumed by subtracting remainingLiters
          data.fuelConsumed = data.totalFuelConsumed - data.remainingLiters;
      });

      // Assign mileage at beginning for the next month based on current month's mileage at end
      fuelReportRequisitions.forEach(data => {
          data.mileageAtBeginningNextMonth = data.mileageAtEnd; // For next month, assign current month's end mileage
      });

      res.json({ carPlaqueData: fuelReportRequisitions });
  } catch (error) {
      console.error('Error fetching car plaques:', error);
      res.status(500).json({ message: 'Internal server error' });
  }
});



router.get('/generate-repo', async (req, res) => {
  try {
    let { startDate, endDate, month, year } = req.query;

    let start, end;

    if (startDate && endDate) {
      start = new Date(startDate);
      end = new Date(endDate);
      end.setUTCHours(23, 59, 59, 999);
    } else if (month !== undefined && year) {
      start = new Date(year, month, 1);
      end = new Date(year, parseInt(month) + 1, 0);
      end.setUTCHours(23, 59, 59, 999);
    } else {
      return res.status(400).json({ error: 'Provide either date range or month and year.' });
    }

    // Get fuel requisitions in the given month
    const fuelEntries = await FuelRequisitionReceived.aggregate([
      {
        $match: {
          status: 'Received',
          createdAt: { $gte: start, $lte: end },

        },
      },
      {
        $lookup: {
          from: 'cars',
          localField: 'carPlaque',
          foreignField: 'registerNumber',
          as: 'carInfo',
        },
      },
      { $unwind: { path: '$carInfo', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'fuelstocks',
          localField: 'fuelType',
          foreignField: 'fuelType',
          as: 'fuelStock',
        },
      },
      { $unwind: { path: '$fuelStock', preserveNullAndEmptyArrays: true } },
      {
        $addFields: {
          pricePerLiter: '$fuelStock.pricePerUnit',
          totalCostConsumedFRW: {
            $multiply: ['$quantityReceived', '$fuelStock.pricePerUnit'],
          },
        },
      },
      {
        $sort: { createdAt: 1 },
      },
    ]);

    // Get mileage per car for the month
    const carPlaques = [...new Set(fuelEntries.map(f => f.carPlaque))];

    const mileageMap = {};

    await Promise.all(
      carPlaques.map(async (plaque) => {
        const startMileage = await CarData.findOne({
          registerNumber: plaque,
          createdAt: { $lt: start },
        }).sort({ createdAt: -1 }).lean();

        const endMileage = await CarData.findOne({
          registerNumber: plaque,
          createdAt: { $gte: start, $lte: end },
        }).sort({ createdAt: -1 }).lean();

        mileageMap[plaque] = {
          mileageAtBeginning: startMileage?.kilometersCovered || 0,
          mileageAtEnd: endMileage?.kilometersCovered || (startMileage?.kilometersCovered || 0),
        };
      })
    );

    // Add mileage info and compute distance covered per row
    const detailedReport = fuelEntries.map(entry => {
      const mileageInfo = mileageMap[entry.carPlaque] || { mileageAtBeginning: 0, mileageAtEnd: 0 };
      return {
        requestedDate: entry.createdAt,
        carPlaque: entry.carPlaque,
        modeOfVehicle: entry.carInfo?.modeOfVehicle || 'N/A',
        dateOfReception: entry.carInfo?.dateOfReception || 'N/A',
        department: entry.carInfo?.depart || 'N/A',
        mileageAtBeginning: mileageInfo.mileageAtBeginning,
        mileageAtEnd: mileageInfo.mileageAtEnd,
        distanceCovered: mileageInfo.mileageAtEnd - mileageInfo.mileageAtBeginning,
        litersConsumed: entry.quantityReceived,
        pricePerLiter: entry.pricePerLiter || 0,
        totalCost: entry.totalCostConsumedFRW || 0,
      };
    });

    res.status(200).json(detailedReport);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});


 module.exports = router;