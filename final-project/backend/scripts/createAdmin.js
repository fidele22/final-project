const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../models/user');
const Position = require('../models/position'); // Import Position model
const Service = require('../models/service');
const Department = require('../models/department');
const Role = require('../models/userRoles');

// // Create a role if not already present
// const createAdminRole = async () => {
//   const existingRole = await Role.findOne({ name: 'admin' });
//   if (!existingRole) {
//     const role = new Role({ name: 'admin' });
//     await role.save();
//     console.log('Admin role created');
//   }
// };

// createAdminRole();

const createAdmin = async () => {
  await mongoose.connect('mongodb://localhost:27017/shyiradb', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  // Create admin role if it doesn't exist
  const existingRole = await Role.findOne({ name: 'admin' });
  if (!existingRole) {
    const role = new Role({ name: 'admin' });
    await role.save();
    console.log('Admin role created');
  }

  // Fetch the ObjectId of the 'admin' role
  const adminRole = await Role.findOne({ name: 'admin' });

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('admin1', salt);

  const admin = new User({
    firstName: 'Admin',
    lastName: 'User',
    phone: '123456789',
    email: 'admin@gmail.com',
    signature: 'AdminSignature',
    password: hashedPassword,
    role: adminRole._id, // Use the ObjectId of the 'admin' role
    positionName: 'adminposition', // Assign positionName from fetched position
    serviceName: 'admin', // Example, replace with actual fetched data
    departmentName: 'admin', // Example, replace with actual fetched data
  });

  try {
    await admin.save();
    console.log('Admin user created successfully');
  } catch (err) {
    console.error('Error creating admin user:', err);
  }

  mongoose.connection.close();
};

createAdmin();
