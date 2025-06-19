
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/userAthu')
const User = require('../models/user');
const JWT_SECRET = 'your_jwt_secret';


//const middleware= require('../middlewares/userAthu')
const upload = require('../middlewares/upload');
const multer = require('multer');
const path = require('path');

const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const Role = require('../models/userRoles');
const sendEmail = require('../2FA/sendmailcode'); 



// Configure Multer for file uploads (signatures)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/signatures/');
  },
  filename: function (req, file, cb) {
    cb(null, `${req.user.id}_${Date.now()}${path.extname(file.originalname)}`);
  },
});



// === VERIFY 2FA ROUTE ===
router.post('/verify-2fa', async (req, res) => {
  const { email, code } = req.body;

  try {
    const user = await User.findOne({ email }).populate('role');

    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    // Debug logs (optional)
    // console.log("Code from user:", code);
    // console.log("Stored code:", user.twoFACode);
    // console.log("Expires at:", user.twoFACodeExpires, "Now:", new Date());

    if (
      String(user.twoFACode) !== String(code) ||
      user.twoFACodeExpires < Date.now()
    ) {
      return res.status(400).json({ message: 'Invalid or expired code' });
    }

    // Clear 2FA fields
    user.twoFACode = undefined;
    user.twoFACodeExpires = undefined;
    await user.save();

    // Generate and return JWT token
    const token = jwt.sign({ userId: user._id, role: user.role.name }, JWT_SECRET, { expiresIn: '8h' });

    res.json({
      token,
      role: user.role.name,
      privileges: user.role.privileges
    });
  } catch (error) {
    console.error('2FA verification error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/authentication/toggle-2fa
router.put('/enable-disable-2fa', authMiddleware, async (req, res) => {
  const user = await User.findById(req.userId);
  if (!user) return res.status(404).json({ message: 'User not found' });

  user.twoFAEnabled = !user.twoFAEnabled;
  await user.save();

  res.json({ message: `2FA ${user.twoFAEnabled ? 'enabled' : 'disabled'}`, twoFAEnabled: user.twoFAEnabled });
});

//router to fetch user profile data
// Get User Profile
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password'); // Exclude password
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
      // console.log("Sending user profile:", user); // Check this logs `profilePic`
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update User Profile
router.put('/update', authMiddleware, async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.userId,
      { $set: req.body }, // Update with new data
      { new: true, runValidators: true }
    ).select('-password'); // Exclude password

    res.json({ message: 'Profile updated successfully', user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: 'Error updating profile' });
  }
});


router.put('/change-password', authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.userId);
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


// POST /forgot-password
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const token = crypto.randomBytes(32).toString('hex');
    user.resetToken = token;
    user.resetTokenExpiry = Date.now() + 3600000; // 1 hour
    await user.save();

    // Send email (use Nodemailer or your preferred service)
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${token}`;
    const mailOptions = {
      from: `"KDS support team" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Password Reset Link',
      html: `<p>You requested a password reset. Click <a href="${resetUrl}">here</a> to reset your password.</p>`
    };

    await transporter.sendMail(mailOptions);

    res.json({ message: 'Reset password link sent to your email, check your email inbox' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});


router.post('/reset-password/:token', async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() }
    });

    if (!user) return res.status(400).json({ message: 'Invalid or expired token' });

    // Hash the password before saving
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(password, 12);
    user.password = hashedPassword;
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    res.json({ message: 'Password reset successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error resetting password' });
  }
});



module.exports = router;