const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const User = require('../models/user'); // Adjust the path as necessary
const router = express.Router();
const multer = require('multer');
const authenticate = require('../middlewares/userAthu');
const authenticateToken = require('../middlewares/protectRouter')
const sendEmail = require('../2FA/sendmailcode'); 

const JWT_SECRET = 'your_jwt_secret';

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'profile-pics/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage });



router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }).populate('role');
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    if (!user.role) {
      return res.status(400).json({ message: 'User  role not assigned. Contact admin.' });
    }
 // If 2FA is enabled, generate and send code
    if (user.twoFAEnabled) {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      user.twoFACode = code;
      user.twoFACodeExpires = new Date(Date.now() + 10 * 60 * 1000); // valid for 10 mins
      await user.save();

      await sendEmail(
        user.email,
        'Your 2FA Code',
        `Dear ${user.firstName?.toUpperCase() || 'User'},\n\nUse this code to confirm your account (${code}).\n\nCheers,\nKigali diesel service Team`
      );

      return res.status(200).json({ 
        message: '2FA code sent to email', 
        requires2FA: true,
        email: user.email,
        userId: user._id  // optionally return this to reference in next step
      });
    }

    // If 2FA is NOT enabled → proceed with login
    const payload = {
      id: user.role._id,
      name: user.role.name
    };

    // Include privileges in the response
    const token = jwt.sign({ userId: user._id, role: user.role.name }, JWT_SECRET, { expiresIn: '8h' });
    res.json({ token, role: user.role.name, privileges: user.role.privileges }); // Include privileges
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});


//reseting password

// Nodemailer setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'fidelehirwa23@gmail.com',
    pass: 'bmxasvhzizzctrpi ', 
  },
});

async function sendResetPasswordEmail(email, resetLink) {
  const mailOptions = {
    from: `"Logistic MIS" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Password Reset',
    text: `You requested a password reset. Please use the following link to reset your password: ${resetLink}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Password reset email sent to:', email);
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

// Forgot password route
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).send('User with this email does not exist.');
    }

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '8h' });
    const resetLink = `http://localhost:3000/reset-password/${token}`;

    await sendResetPasswordEmail(user.email, resetLink);

    res.send('Password reset link has been sent to your email.');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error in sending reset password link.');
  }
});

router.post('/reset-password/:token', async (req, res) => {
  const { password } = req.body;
  const { token } = req.params;

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(400).send('Invalid or expired token.');
    }

    user.password = await bcrypt.hash(password, 10);
    await user.save();

    res.send('Password has been reset successfully.');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error resetting password.');
  }
});



router.post('/upload-profile-picture', authenticate, upload.single('profilePic'), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

  const imageUrl = `/profile-pics/${req.file.filename}`;

  try {
    const userId = req.userId;

    await User.findByIdAndUpdate(userId, { profilePic: imageUrl }); // ✅ correct field
    res.json({ imageUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update profile picture' });
  }
});


router.delete('/delete-profile-picture', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.userId); // ✅ use what is actually available


    if (user.profilePic && user.profilePic.startsWith('/profile-pics/')) {
      // Absolute path to the file
      const filePath = path.join(__dirname, '..', user.profilePic);

      try {
        await fsPromises.unlink(filePath); // Delete the file
        console.log(`Deleted profile picture: ${filePath}`);
      } catch (err) {
        console.warn(`File not found or already deleted: ${filePath}`, err.message);
      }
    }

    // Clear user's profilePic path in DB
    user.profilePic = '';
    await user.save();

    res.json({ message: 'Profile picture removed successfully' });
  } catch (err) {
    console.error('Error deleting profile picture:', err);
    res.status(500).json({ message: 'Failed to delete profile picture' });
  }
});

module.exports = router;
