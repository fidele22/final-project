const express = require('express');
const bcrypt = require('bcrypt');
const multer = require('multer');
const router = express.Router();
const path = require('path');
const jwt = require('jsonwebtoken');
const JWT_SECRET = 'your_jwt_secret';
const User = require('../models/user');
const Role = require('../models/userRoles');
// Ensure you have a secret key

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = process.env.UPLOAD_PATH || path.join(__dirname, 'uploads/');
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// Your route that handles the file upload



const registerUser = async (req, res) => {
  try {
    console.log('Request body:', req.body); // Debugging output

    const { positionName, serviceName, departmentName, firstName, lastName, phone, email, password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
      return res.status(400).json({ msg: 'Passwords do not match' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10); // Hash the password with bcrypt

    // Save the path of the uploaded signature, adjust as per your schema
    const signature = req.file ? req.file.path : '';

    // Find the 'HOD' role in the Role model
    const role = await Role.findOne({ name: 'HOD' });

    if (!role) {
      return res.status(400).json({ msg: 'Role not found' });
    }

    const newUser = new User({
      firstName,
      lastName,
      positionName,
      serviceName,
      departmentName,
      phone,
      email,
      role: role._id, // Store the ObjectId of the 'HOD' role
      signature,
      password: hashedPassword
    });

    await newUser.save();

    res.status(201).json({ msg: 'User registered successfully', newUser });

  } catch (err) {
    console.error('Error registering user:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};


const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password); // Compare hashed passwords
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Generate JWT token upon successful login
    const token = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, { expiresIn: '8h' });
    res.json({ token, role: user.role });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Middleware to authenticate user
const authenticate = async (req, res, next) => {7
  const token = req.headers['authorization'];
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const decoded = jwt.verify(token.split(' ')[1], JWT_SECRET);
    req.user = await User.findById(decoded.userId);
    next();
  } catch (err) {
    res.status(401).json({ message: 'Unauthorized' });
  }
};
// Route to get the signature image
router.get('/', authenticate, async (req, res) => {
  try {
    const user = req.user;
    if (!user.signature) {
      return res.status(404).json({ message: 'Signature not found' });
    }
    res.sendFile(path.resolve(user.signature)); // Ensure correct path resolution
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;



const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    // Delete user
    await User.findByIdAndDelete(userId);

    res.status(200).json({ message: 'User and associated data deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
};

module.exports = {upload,registerUser,loginUser, deleteUser,authenticate};
