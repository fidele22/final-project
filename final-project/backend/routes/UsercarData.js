// routes/carRoutes.js
const express = require('express');
const CarData = require('../models/carData');

const Carplaque = require('../models/carPlaque');

const router = express.Router();

// Get all cars
router.get('/', async (req, res) => {
  try {
    const cars = await CarData.find();
    res.json(cars);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// Create a new car entry
router.post('/save-data', async (req, res) => {
  const { registerNumber, kilometersCovered, remainingLiters } = req.body;

  // Get the current month and year
  const currentDate = new Date();
  const month = currentDate.getMonth();
  const year = currentDate.getFullYear();

  try {
    // Check if an entry exists for the same registerNumber in the current month
    const existingEntry = await CarData.findOne({
      registerNumber,
      createdAt: {
        $gte: new Date(year, month, 1),
        $lt: new Date(year, month + 1, 1)
      }
    });

    if (existingEntry) {
      return res.status(400).json({ message: 'Data for this carPlaque has already been submitted in this month. Please wait next month or contact system admin for futher assistance' });
    }

    const car = new CarData({
      registerNumber,
      kilometersCovered,
      remainingLiters
    });

    const newCar = await car.save();
    res.status(201).json(newCar);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});



// Check for missing data in CarData based on Car collection
router.get('/check-reminders', async (req, res) => {
  const currentDate = new Date();
  const month = currentDate.getMonth();
  const year = currentDate.getFullYear();

  try {
    // Fetch all register numbers from the Car collection
    const cars = await Carplaque.find().select('registerNumber -_id');
    const registerNumbers = cars.map(car => car.registerNumber);

    // Fetch all entries in CarData for the current month
    const existingEntries = await CarData.find({
      createdAt: {
        $gte: new Date(year, month, 1),
        $lt: new Date(year, month + 1, 1)
      }
    }).select('registerNumber -_id');

    const existingRegisterNumbers = existingEntries.map(entry => entry.registerNumber);

    // Determine missing register numbers
    const missingEntries = registerNumbers.filter(
      registerNumber => !existingRegisterNumbers.includes(registerNumber)
    );

    res.status(200).json({ missingEntries });
  } catch (error) {
    console.error('Error checking reminders:', error);
    res.status(500).json({ message: 'Error checking reminders', error });
  }
});

// Get latest 6 cars
router.get('/latest', async (req, res) => {
  try {
    const latestCars = await CarData.find().sort({ createdAt: -1 }).limit(6);
    res.json(latestCars);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch latest cars' });
  }
});

// Filter by registerNumber or date
router.get('/filter', async (req, res) => {
  const { registerNumber, month, year } = req.query;

  const query = {};

  if (registerNumber) {
    query.registerNumber = new RegExp(registerNumber, 'i');
  }

  if (month && year) {
    const startDate = new Date(`${year}-${month}-01`);
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1);

    query.createdAt = { $gte: startDate, $lt: endDate };
  }

  try {
    const filteredCars = await CarData.find(query).sort({ createdAt: -1 });
    res.json(filteredCars);
  } catch (err) {
    res.status(500).json({ message: 'Failed to filter cars', error: err });
  }
});

// Update a car
router.put('/update-cardata/:id', async (req, res) => {
  const { registerNumber, kilometersCovered, remainingLiters, createdAt } = req.body;

  const updateDate = new Date(createdAt);
  const month = updateDate.getMonth();
  const year = updateDate.getFullYear();

  try {
    // Check if another record for the same registerNumber exists in that month
    const existingEntry = await CarData.findOne({
      _id: { $ne: req.params.id }, // exclude the one being updated
      registerNumber,
      createdAt: {
        $gte: new Date(year, month, 1),
        $lt: new Date(year, month + 1, 1)
      }
    });

    if (existingEntry) {
      return res.status(400).json({
        message: 'A record for this car in the selected month already exists. Only one entry per car per month is allowed.'
      });
    }

    // Proceed to update
    const updatedCar = await CarData.findByIdAndUpdate(
      req.params.id,
      {
        registerNumber,
        kilometersCovered,
        remainingLiters,
        createdAt: updateDate
      },
      { new: true }
    );

    res.json(updatedCar);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update car data', error: err });
  }
});


module.exports = router;