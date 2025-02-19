
const express = require('express');
const router = express.Router();
//const authMiddleware = require('../middlewares/userAthu')
const User = require('../models/user');
//const middleware= require('../middlewares/userAthu')
const upload = require('../middlewares/upload');
const multer = require('multer');
const path = require('path');
const Role = require('../models/userRoles')

// Configure Multer for file uploads (signatures)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/signatures/');
  },
  filename: function (req, file, cb) {
    cb(null, `${req.user.id}_${Date.now()}${path.extname(file.originalname)}`);
  },
});


// **Update User (Including Role)**
router.put('/:id', upload.single('signature'), async (req, res) => {
  try {
    const { positionName, serviceName, departmentName, firstName, lastName, phone, email, role } = req.body;
    const userId = req.params.id;

    // Construct update data
    let updateData = {
      firstName,
      lastName,
      phone,
      email,
      positionName,
      departmentName,
      serviceName,
    };

    if (role) {
      updateData.role = role; // Include role if provided
    }

    // Add signature file path if uploaded
    if (req.file) {
      updateData.signature = req.file.path;
    }

    // Update user in the database
    const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true }).populate('role');

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Server error' });
  }
});
router.get('/fetchUsers', async (req, res) => {
  try {
    const { includeAdmins } = req.query;

    let query = {};
    
    if (includeAdmins !== 'true') {
      // Fetch the admin role ObjectId
      const adminRole = await Role.findOne({ name: 'ADMIN' });
      
      // If admin role is not found, return an error
      if (!adminRole) {
        return res.status(404).json({ error: 'Admin role not found' });
      }

      // Query to exclude users with the 'admin' role
      query = { role: { $ne: adminRole._id } }; // Exclude users with admin role
    }

    // Fetch users excluding admins (if applicable)
    const users = await User.find(query)
                            .populate('role', 'name') // Populating the role name, assuming 'role' is an ObjectId
                            .exec();

    // Respond with the fetched users
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Server error' });
  }
});


module.exports = router;
