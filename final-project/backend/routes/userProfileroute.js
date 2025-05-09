
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/userAthu')
const User = require('../models/user');

//const middleware= require('../middlewares/userAthu')
const upload = require('../middlewares/upload');
const multer = require('multer');
const path = require('path');

// Configure Multer for file uploads (signatures)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/signatures/');
  },
  filename: function (req, file, cb) {
    cb(null, `${req.user.id}_${Date.now()}${path.extname(file.originalname)}`);
  },
});



router.get('/profile', authMiddleware, async (req, res) => {

  try {

    const user = await User.findById(req.userId);

    if (!user) return res.status(404).send('User  not found');

    res.json(user);

  } catch (err) {

    res.status(500).send(err.message);

  }

});
router.put('/update-profile', authMiddleware, async (req, res) => {

  try {

    const user = await User.findByIdAndUpdate(req.userId, req.body, { new: true });

    if (!user) return res.status(404).send('User  not found');

    res.json(user);

  } catch (err) {

    res.status(500).send(err.message);

  }

});


router.put('/change-password', authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;