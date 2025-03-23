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

  
module.exports = router;
