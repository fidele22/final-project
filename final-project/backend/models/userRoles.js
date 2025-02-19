const mongoose = require('mongoose');

const RoleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    privileges: {
      type: [String], // Array of privilege strings
      default: [],
    },
    description: {
      type: String,
    },
  },
  { timestamps: true } // Automatically add createdAt and updatedAt
);

module.exports = mongoose.model('Role', RoleSchema);
