const express = require('express');
const router = express.Router();
const ReportSignature = require('../models/reportSignatures');

// Create a new report signature document
router.post('/sign', async (req, res) => {
  const { preparedBy } = req.body;

  try {
    const newReportSignature = new ReportSignature({ preparedBy });
    await newReportSignature.save();
    res.status(201).json({ message: 'Report signature saved successfully', report: newReportSignature });
  } catch (error) {
    console.error('Error saving report signature:', error);
    res.status(500).json({ message: 'Error saving report signature', error });
  }
});

// Fetch report signatures based on year and month
router.get('/getSignature/:year/:month', async (req, res) => {
  const { year, month } = req.params;
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 1);
  
  try {
    const signatures = await ReportSignature.find({
      createdAt: { $gte: startDate, $lt: endDate }
    });
    res.status(200).json(signatures);
  } catch (error) {
    console.error('Error fetching report signatures:', error);
    res.status(500).json({ message: 'Error fetching report signatures', error });
  }
});

// ✅ Corrected: Check if report is verified
router.get('/check-report-verified/:year/:month', async (req, res) => {
  const { year, month } = req.params;
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 1);

  try {
    const report = await ReportSignature.findOne({
      createdAt: { $gte: startDate, $lt: endDate },
      "verifiedBy.firstName": { $exists: true, $ne: "" }, 
      "verifiedBy.lastName": { $exists: true, $ne: "" }, 
      "verifiedBy.signature": { $exists: true, $ne: "" }
    });

    res.status(200).json({ exists: !!report });
  } catch (error) {
    console.error('Error fetching report signatures:', error);
    res.status(500).json({ message: 'Error fetching report signatures', error });
  }
});

// ✅ Corrected: Check if report is verified
router.get('/check-report-approved/:year/:month', async (req, res) => {
  const { year, month } = req.params;
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 1);

  try {
    const report = await ReportSignature.findOne({
      createdAt: { $gte: startDate, $lt: endDate },
      "approvedBy.firstName": { $exists: true, $ne: "" }, 
      "approvedBy.lastName": { $exists: true, $ne: "" }, 
      "approvedBy.signature": { $exists: true, $ne: "" }
    });

    res.status(200).json({ exists: !!report });
  } catch (error) {
    console.error('Error fetching report signatures:', error);
    res.status(500).json({ message: 'Error fetching report signatures', error });
  }
});


// ✅ Corrected: Verify and update report
router.post('/verify-report', async (req, res) => {
  const { year, month, verifiedBy } = req.body;
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 1);

  try {
    const updatedReport = await ReportSignature.findOneAndUpdate(
      {
        createdAt: { $gte: startDate, $lt: endDate }
      },
      { $set: { verifiedBy } },
      { new: true }
    );

    if (!updatedReport) {
      return res.status(404).json({ message: 'No report found for the given month and year.' });
    }

    res.status(200).json({ message: 'Report updated successfully', updatedReport });
  } catch (error) {
    console.error('Error updating report:', error);
    res.status(500).json({ message: 'Error updating report', error });
  }
});
// ✅ Corrected: approved and update report
router.post('/approve-report', async (req, res) => {
  const { year, month, approvedBy } = req.body;
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 1);

  try {
    const updatedReport = await ReportSignature.findOneAndUpdate(
      {
        createdAt: { $gte: startDate, $lt: endDate }
      },
      { $set: { approvedBy } },
      { new: true }
    );

    if (!updatedReport) {
      return res.status(404).json({ message: 'No report found for the given month and year.' });
    }

    res.status(200).json({ message: 'Report updated successfully', updatedReport });
  } catch (error) {
    console.error('Error updating report:', error);
    res.status(500).json({ message: 'Error updating report', error });
  }
});
// ✅ Corrected: Display report signatures
router.get('/displaySignature/:year/:month', async (req, res) => {
  const { year, month } = req.params;
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 1);
  
  try {
    const signatures = await ReportSignature.find({
      createdAt: { $gte: startDate, $lt: endDate }
    });

    res.status(200).json(signatures);
  } catch (error) {
    console.error('Error fetching report signatures:', error);
    res.status(500).json({ message: 'Error fetching report signatures', error });
  }
});

module.exports = router;
