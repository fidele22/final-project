const express = require('express');
const router = express.Router();
const ReportSignature = require('../models/reportSignatures');

// Create a new report signature document
router.post('/sign', async (req, res) => {
  const { preparedBy } = req.body;

  try {
    const newReportSignature = new ReportSignature({
      preparedBy
    });

    await newReportSignature.save();
    res.status(201).json({ message: 'Report signature saved successfully', report: newReportSignature });
  } catch (error) {
    console.error('Error saving report signature:', error);
    res.status(500).json({ message: 'Error saving report signature', error });
  }
});

module.exports = router;
