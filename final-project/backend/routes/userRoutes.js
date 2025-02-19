const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken'); // Add this line to import jsonwebtoken
const jwtSecret = 'your_jwt_secret_key';
const { upload, registerUser, loginUser, deleteUser, authenticate, updateProfile } = require('../controllers/userController');
const User = require('../models/user'); // Make sure to import your User model
const Role = require('../models/userRoles');

router.post('/register', upload.single('signature'), registerUser);
router.post('/login', loginUser);
router.delete('/:id', deleteUser);



const getUsersByRoleName = async (roleName, res) => {
  try {
    // Find the role by its name
    const role = await Role.findOne({ name: roleName });
    if (!role) {
      return res.status(404).json({ message: `Role ${roleName} not found` });
    }

    // Find users with the matching role ID
    const users = await User.find({ role: role._id }).select('firstName lastName signature');
    res.json(users);
  } catch (error) {
    console.error(`Error fetching users with role ${roleName}:`, error);
    res.status(500).json({ message: `Error fetching users with role ${roleName}`, error: error.message });
  }
};

// Get users with role 'LOGISTIC'
router.get('/logistic-users', (req, res) => {
  getUsersByRoleName('LOGISTIC', res);
});

// Get users with role 'DAF'
router.get('/daf-users', (req, res) => {
  getUsersByRoleName('DAF', res);
});

// Get users with role 'DG'
router.get('/dg-users', (req, res) => {
  getUsersByRoleName('DG', res);
});
  

module.exports = router;
