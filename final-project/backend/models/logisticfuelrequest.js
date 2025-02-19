const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  desitination: { type: String, required: true },
  quantityRequested: { type: Number, required: true },
  pricePerUnit: { type: Number, required: true },
  totalPrice: { type: Number, required: true }
});

const logisticFuelSchema = new mongoose.Schema({
  supplierName: { type: String, required: true },
  items: [itemSchema], // Array of items
  date: { type: Date, required: true },
  hodName: { type: String, required: true },
  hodSignature: { type: String },

   // New fields for user verification with default values

   verifiedBy: {

    firstName: { type: String, default: '' }, 
    lastName: { type: String, default: '' },  
    signature: { type: String, default: '' }   

  },


  // New fields for approval with default values

  approvedBy: {

    firstName: { type: String, default: '' }, 
    lastName: { type: String, default: '' },  
    signature: { type: String, default: '' }   

  },


  // New fields for receiving with default values

  receivedBy: {

    firstName: { type: String, default: '' }, 
    lastName: { type: String, default: '' },  
    signature: { type: String, default: '' }   

  },
  // New status field
  status: { type: String, required: true, default: 'Pending' }, // Default status can be 'pending'

  createdAt: {
    type: Date,
 default: Date.now
  },
});

module.exports = mongoose.model('LogisticFuelRequest', logisticFuelSchema);